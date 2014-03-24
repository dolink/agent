"use strict";

var log = require('logs').get('client');
var request = require('request');

var mqtt = require('mqtt');
var mqttrouter = require('mqtt-router');

var utils = require('../lib/utils');

module.exports = Client;

function Client(app) {
    if (!(this instanceof Client)) {
        return new Client(app);
    }
    this.app = app;
    this.context = app.context;
    this.handlers = require('./cloud-handlers')(app, this);

    this.sendBuffer = [];
}

Client.prototype.connect = function () {
    var self = this;
    var cred = this.app.cred;
    if (cred.token) {
        log.info("Attempting to connect...");
        var mqttOpts = {username: cred.token, keepalive: 30, qos: 1, clientId: cred.serial, retain: true};

        var cloud = this.app.get('cloud');
        if (cloud.secure) {
            this.mqttclient = mqtt.createSecureClient(cloud.port, cloud.host, mqttOpts);
        } else {
            this.mqttclient = mqtt.createClient(cloud.port, cloud.host, mqttOpts);
        }

        this.mqttclient.on('close', this.down.bind(this));
        this.mqttclient.on('connect', this.up.bind(this));
        this.mqttclient.on('error', function (err) {
            log.error(err.message);
        });

        this.initialize();
    } else {
        this.app.emit('client::activation', true);
        log.info("Attempting to activate...");

        this.activate(function activate(err, res) {
            if (err) {
                log.error("Failed activation", err);
                process.nextTick(process.exit);
                return;
            }
//            self.mqttId = res.mqttId;
            cred.token = res.token;
            cred.saveToken(function () {
                log.info("Exiting now.");
                process.nextTick(process.exit);
            });
        })
    }

    // enable the subscription router
    this.router = mqttrouter.wrap(this.mqttclient);
};


Client.prototype.activate = function (cb) {
    var cred = this.app.cred;
    log.info('Attempting activation for serial', cred.serial);
    var api = this.app.get('api');
    var url = (api.secure ? 'https://' : 'http://') + api.host + ':' + api.port;

    request.get(url + '/rest/v0/block/' + cred.serial + '/activate', function getToken(error, response, body) {
        if (error) return cb(error);

        if (response.statusCode == 200) {
            if (body) {
                return cb(null, JSON.parse(body));
            } else {
                return cb(new Error('Timed out waiting for activation'));
            }
        } else {
            return cb(new Error('Unable to activate response code = ' + response.statusCode));
        }
    })

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

            var topic = ['$cloud', self.serial, 'data'].join('/');
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

    self.context.on('client::preup', initSession);
};

Client.prototype.up = function () {
    log.debug('connected');
    try {
        this.context.emit('client::preup');
        this.context.emit('client::up');
    } catch (err) {
        log.error('An unknown module had the following error:\n\n%s\n', err.stack);
    }

    log.info("Client connected to the Ollo Platform");

    // if we have credentials
    if (this.app.cred.token) {

        // clear out the existing handlers
        this.router.reset();

        // subscribe to all the cloud topics
        this.subscribe();
    }
};

Client.prototype.down = function () {
    log.debug('down');
};

Client.prototype.subscribe = function () {
    var self = this;
    var serial = this.app.cred.serial;

    this.router.subscribe('$block/' + serial + '/revoke', function revokeCredentials() {
        log.info('MQTT Invalid token; exiting in 3 seconds...');
        self.context.emit('client::invalidToken', true);
        setTimeout(function invalidTokenExit() {
            log.info("Exiting now.");
            process.exit(1);
        }, 3000);
    });

    this.router.subscribe('$block/' + serial + '/commands', {qos: 1}, function execute(topic, cmd) {
        log.info('MQTT execute', JSON.parse(cmd));
        self.handlers.commands(cmd);
    });

    this.router.subscribe('$block/' + serial + '/update', {qos: 1}, function update(topic, cmd) {
        log.info('MQTT update', JSON.parse(cmd));
        // TODO update
    });

    this.router.subscribe('$block/' + serial + '/config', {qos: 1}, function config(topic, cmd) {
        log.info('MQTT config', cmd);
        // TODO config
//        self.moduleHandlers.config.call(self, JSON.parse(cmd));
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

    data.TIMESTAMP = (new Date().getTime());
    var msg = { 'DEVICE': [ data ] };

    if (this.mqttclient) {

        var nodeId = this.app.cred.serial;
        var deviceId = [data.G, data.V, data.D].join('_');
        var topic = utils.topic('$cloud', nodeId, 'devices', deviceId, 'data');

        log.debug('sendData', 'mqtt', topic);
        this.sendMessage(topic, msg);
    }

    this.bufferData(msg);
};

Client.prototype.sendConfig = function sendConfig(data) {

    if (!data) return;

    data.TIMESTAMP = (new Date().getTime());
    if (this.mqttclient) {

        var nodeId = this.app.cred.serial;
        var deviceId = [data.G, data.V, data.D].join('_');
        var topic = ['$cloud', nodeId, 'devices', deviceId, 'config'].join('/');
        log.debug('sendConfig', 'mqtt', topic);

        this.sendMessage(topic, data);
    }
};

Client.prototype.sendHeartbeat = function sendHeartbeat(data) {

    if (!data) return;

    data.TIMESTAMP = (new Date().getTime());
    var msg = { 'DEVICE': [ data ] };

    if (this.mqttclient) {

        var nodeId = this.app.cred.serial;
        var deviceId = [data.G, data.V, data.D].join('_');
        var topic = utils.topic('cloud', nodeId, 'devices', deviceId, 'heartbeat');
        log.debug('sendHeartbeat', 'mqtt', topic);

        this.sendMessage(topic, msg);
    }
};

Client.prototype.bufferData = function bufferData(msg) {

    this.sendBuffer.push(msg);

    if (this.sendBuffer.length > 9) {
        this.sendBuffer.shift();
    }
};
