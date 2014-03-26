"use strict";

var log = require('logs').get('handlers');
var path = require('path');
var fs = require('fs');

module.exports = function (app, mconf) {
    var handlers = {};

    //
    // `this` is Driver
    //

    handlers.announcement = function (data) {
        var announcement = {
            CONFIG: [{
                type: 'MODULE_ANNOUNCEMENT', module: this.driverName, data: data
            }]
        };

        process.nextTick(function () {
            log.debug('Sending announcement');
            app.emit('config::reply', null, [announcement]);
        });
    };
//
//    handlers.config = function (params) {
//        params = params || {};
//        if (params.type == 'PLUGIN') {
//            client.sendConfig(params);
//        } else if (params.type == 'MODULE') {
//            client.sendConfig({type: 'MODULE', module: this.driverName, data: params});
//        }
//
//    };
//
//    handlers.error = function (err, device) {
//        log.error("device: %s", err);
//        if (device.unregister) {
//            process.nextTick(device.unregister);
//        }
//        app.emit("device::down", device);
//    };

    handlers.save = function (conf) {
        mconf.save(this.driverName, { config: conf });
    };

//    handlers.ack = function (data) {
//        log.info("ack: (%s)", this.driverName);
//        if (!data) return;
//
//        client.sendData(data);
//    };

//    handlers.data = function (data) {
//        client.sendData(data);
//    };

    return handlers;
};

