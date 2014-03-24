"use strict";

var log = require('logs').get('handlers');
var path = require('path');
var fs = require('fs');

module.exports = function (app) {
    var handlers = {};

    var client = app.client;
    var mconf = require('./mconf')();

    //
    // `this` is Driver
    //

    handlers.announcement = function (data) {
        var self = this;
        var announcementRequest = {
            CONFIG: [{
                type: 'MODULE_ANNOUNCEMENT', module: this.driverName, data: data
            }]
        };

        process.nextTick(function () {
            client.sendConfig(announcementRequest);
            log.debug("requestAnnouncement: sending request (%s)", self.driverName);
        });
    };


    handlers.register = function (device) {
        var self = this;
        if (!this.widgets) {
            var pf = path.join(path.dirname(this.file), 'package.json');
            var pkg;
            if (fs.existsSync(pf)) {
                try {
                    pkg = require(pf);
                } catch (e) {
                }
            }
            var widgets = pkg && pkg.widgets;
            this.widgets = Array.isArray(widgets) ? widgets : [];
        }

        device.guid = app.getGuid(device);

        if (app.devices.hasOwnProperty(device.guid)) {
            log.info('Duplicate device handler ignored (%s)', device.guid);
            return;
        }

        device.module = this.driverName || undefined;
        device.on('data', dataHandler(device));
        device.on('heartbeat', heartbeatHandler(device));
        device.on('error', function (err) { self.error(err, device); });

        log.info("Registering device %s", device.guid);
        app.devices[device.guid] = device;
        app.context.emit("device::up", device.guid, device);

        // Emit a heartbeat for this device
        log.debug("heartbeatHandler: (%s)", this.driverName);
        heartbeatHandler(device)({
            driver: self.driverName,
            widgets: widgets
        });
    };

    handlers.config = function (params) {
        params = params || {};
        if (params.type == 'PLUGIN') {
            client.sendConfig(params);
        } else if (params.type == 'MODULE') {
            client.sendConfig({type: 'MODULE', module: this.driverName, data: params});
        }

    };

    handlers.error = function (err, device) {
        log.error("device: %s", err);
        if (device.unregister) {
            process.nextTick(device.unregister);
        }
        app.emit("device::down", device);
    };

    handlers.save = function (conf) {
        mconf.save(this.driverName, { config: conf });
    };

    handlers.ack = function (data) {
        log.info("ack: (%s)", this.driverName);
        if (!data) return;

        client.sendData(data);
    };

    handlers.data = function (data) {
        client.sendData(data);
    };

    return handlers;


    function dataHandler(device) {
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
    }

    function heartbeatHandler(device) {
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
    }

};

