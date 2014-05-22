"use strict";

var log = require('logs').get('client');
var request = require('request');

var mqtt = require('mqtt');
var mqttrouter = require('mqtt-router');

var CloudHandlers = require('./cloud-handlers');
var utils = require('./utils');

var when = require('when');

module.exports = Client;

function Client(app, creds) {
    if (!(this instanceof Client)) {
        return new Client(app);
    }
    this.app = app;
    this.creds = creds;
    this.handlers = new CloudHandlers(app);

    this.sendBuffer = [];

    this.connected = false;
    this.reconnectCount = 0;

    this.setup();
}

Client.prototype.setup = function () {
    this.app.on('config::reply', this.sendConfig.bind(this));
};

Client.prototype.connect = function () {
    var self = this;
    var creds = this.creds;

    var saveToken = when.lift(creds.saveToken.bind(creds));

    // This function requests activation with the REST in a loop, with a 1 second back off if
    // a network/system error occurs to avoid draining resources when offline.
    function activationRetry(err) {
        if (err) log.error('Failed activation', err);

        // not a http error so back off
        function checkError() {
            if (err && !err.message.match(/response code/)) {
                return when().delay(1000); // chill for a second
            }
        }

        // when the activation process completes we need to restart
        function quit() {
            log.info('Exiting now.');
            process.nextTick(process.exit);
        }

        when()
            .then(checkError)
            .then(self.activate.bind(self))
            .then(saveToken)
            .then(quit)
            .catch(activationRetry);
    }

    var cloud = this.app.get('cloud');

    if (creds.token) {
        log.info("Token found. Connecting...");

        var mqttOpts = {
            username: creds.token,
            keepalive: 30,
            qos: 1,
            clientId: creds.serial,
            retain: true,
            reconnectPeriod: 5000
        };

        if (cloud.secure) {
            this.mqttclient = mqtt.createSecureClient(cloud.port, cloud.host, mqttOpts);
        } else {
            this.mqttclient = mqtt.createClient(cloud.port, cloud.host, mqttOpts);
        }


        this.mqttclient.on('close', this.down.bind(this));
        this.mqttclient.on('connect', this.up.bind(this));
        this.mqttclient.on('error', this.error.bind(this));

        // enable the subscription router
        this.router = mqttrouter.wrap(this.mqttclient);

        this.initialize();
    } else {
        this.app.emit('client::activation', true);
        log.info("Attempting to activate...");

        activationRetry();
    }
};


Client.prototype.activate = function () {
    var self = this;
    var creds = this.creds;

    log.info('Attempting activation for serial', creds.serial);

    var d = when.defer();
    var api = this.app.get('api');
    var url = (api.secure ? 'https://' : 'http://') + api.host + ':' + api.port;
    url += '/rest/v0/block/' + self.creds.serial + '/activate';

    request.get(url, function getToken(error, response, body) {
        if (error) {
            d.reject(error);
        } else {
            if (response.statusCode == 200) {
                if (body) {
                    var data;
                    try {
                        data = JSON.parse(body);
                    } catch(e) {
                        return d.reject(new Error('Failed parsing credentials from cloud : ' + body));
                    }

                    log.info('Updating credentials in client.');
                    creds.token = data.token;

                    d.resolve(data);

                } else {
                    d.reject(new Error('Timed out waiting for activation'));
                }
            } else {
                d.reject(new Error('Unable to activate response code = ' + response.statusCode));
            }
        }
    });

    return d.promise;
};

Client.prototype.initialize = function () {
    var self = this;

    function flushBuffer() {

        if (!self.sendBuffer) {
            self.sendBuffer = [];
            return;
        }
        if (self.sendBuffer.length > 0) {
            log.info("Sending buffered commands...");

            var topic = utils.topic('cloud', self.creds.serial, 'data');
            console.log('sendData', 'flushBuffer', 'mqtt', topic);

            self.sendMessage(topic, {
                'DEVICE': self.sendBuffer
            });

            self.sendBuffer = [ ];
        }
        else {
            log.debug("No buffered commands to send");
        }
    }

    function initSession() {
        flushBuffer();
    }

    self.app.on('client::preup', initSession);
};

Client.prototype.up = function () {
    this.connected = true;
    this.reconnectCount++;
    try {
        this.app.emit('client::preup');
        this.app.emit('client::up');
    } catch (err) {
        log.error('One of the drivers had the following error:\n\n%s\n', err.stack);
    }

    var c = this.app.get('cloud');

    log.info('Client connected to %s:%s', c.host, c.port);
    log.info('sample#mqtt.connect_count=' + this.reconnectCount + ' sample.node_uptime=' + process.uptime());

    // if we have credentials
    if (this.creds.token) {

        // clear out the existing handlers
        this.router.reset();

        // subscribe to all the cloud topics
        this.subscribe();
    }
};

Client.prototype.down = function () {
    this.connected = false;
    this.app.emit('client::down', true);
    log.warn('Client disconnected');
};

Client.prototype.subscribe = function () {
    var self = this;
    var serial = this.creds.serial;

    this.router.subscribe(utils.topic('node', serial, 'revoke'), function revokeCredentials() {
        log.info('MQTT Invalid token; exiting in 3 seconds...');
        self.app.emit('client::invalidToken', true);
        setTimeout(function invalidTokenExit() {
            log.info("Exiting now.");
            process.exit(1);
        }, 3000);
    });

    this.router.subscribe(utils.topic('node', serial, 'commands'), {qos: 2}, function execute(topic, cmd) {
        log.info('MQTT execute', cmd);
        self.handlers.commands(cmd);
    });

    this.router.subscribe(utils.topic('node', serial, 'update'), {qos: 2}, function update(topic, cmd) {
        log.info('MQTT update', cmd);
        // TODO update
    });

    this.router.subscribe(utils.topic('node', serial, 'config'), {qos: 2}, function config(topic, cmd) {
        log.info('MQTT config', cmd);
        self.handlers.config(cmd);
    });

    // TODO install and update handlers
};

Client.prototype.sendMessage = function sendMessage(topic, message) {
    // add the token to the message as this is currently the only way to identify a unique instance of a
    // block
    message._token = this.token;

    this.mqttclient.publish(topic, JSON.stringify(message));
};


Client.prototype.sendData = function sendData(data) {

    if (!data) return;

    if (this.connected && this.mqttclient) {
        data.TIMESTAMP = (new Date().getTime());
        var msg = { 'DEVICE': [ data ] };

        var nodeId = this.creds.serial;
        var deviceId = [data.G, data.V, data.D].join('_');
        var topic = utils.topic('cloud', nodeId, 'devices', deviceId, 'data');

        log.debug('Send data [%s]', topic);
        this.sendMessage(topic, msg);
    } else {
        this.bufferData(msg);
    }
};

Client.prototype.sendConfig = function sendConfig(id, responses) {

    if (this.connected && this.mqttclient) {
        var msg = { CONFIG: responses };
        if (id) msg.id = id;
        var topic = utils.topic('cloud', this.creds.serial, 'config');

        log.debug('Sending config reply %s for request %s to topic', msg, id, topic);
        this.sendMessage(topic, msg);
    }
};

Client.prototype.sendHeartbeat = function sendHeartbeat(data) {

    if (!data) return;

    if (this.connected && this.mqttclient) {
        data.TIMESTAMP = (new Date().getTime());
        var msg = { 'DEVICE': [ data ] };

        var nodeId = this.creds.serial;
        var deviceId = [data.G, data.V, data.D].join('_');
        var topic = utils.topic('cloud', nodeId, 'devices', deviceId, 'heartbeat');
        log.debug('Send heartbeat [%s]', topic);

        this.sendMessage(topic, msg);
    }
};

Client.prototype.bufferData = function bufferData(msg) {

    this.sendBuffer.push(msg);

    if (this.sendBuffer.length > 9) {
        this.sendBuffer.shift();
    }
};

Client.prototype.dataHandler = function dataHandler(device) {
    var client = this;
    return function (data) {
        try {
            client.sendData({
                G: device.G.toString(), V: device.V, D: device.D, DA: data
            });
        } catch (e) {
            log.debug("Error sending data (%s)", self.getGuid(device));
            log.error(e);
        }
    }
};

Client.prototype.heartbeatHandler = function heartbeatHandler(device) {
    var client = this;
    return function (hb) {
        try {
            var heartbeat = hb || {};
            heartbeat.G = device.G.toString();
            heartbeat.V = device.V;
            heartbeat.D = device.D;

            if (typeof device.name === 'string') {
                heartbeat.name = device.name;
            }

            client.sendHeartbeat(heartbeat);
        } catch (e) {
            log.debug("Error sending heartbeat (%s)", app.getGuid(device));
            log.error(e);
        }
    }
};

Client.prototype.error = function error(err) {
    log.error('MQTT Connection Error:', err);
};
