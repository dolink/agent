"use strict";

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
                type: 'MODULE_ANNOUNCEMENT', module: this.name, data: data
            }]
        };

        var self = this;
        process.nextTick(function () {
            self.log.debug('Sending announcement');
            app.emit('config::reply', null, [announcement]);
        });
    };

    handlers.register = function (device) {
        this.log.debug('Device registered. {G:%s, V:%s, D:%s, name:%s}', device.G, device.V, device.D, device.name);
        app.emit('device::register', device, this.name);
    };
//
//    handlers.config = function (params) {
//        params = params || {};
//        if (params.type == 'PLUGIN') {
//            client.sendConfig(params);
//        } else if (params.type == 'MODULE') {
//            client.sendConfig({type: 'MODULE', module: this.name, data: params});
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
        mconf.save(this.name, conf || this.opts ? this.opts : { } );
    };

    handlers.ack = function (data) {
        this.log.info("ack: (%s)", this.name);
        if (!data) return;

        app.emit('device::data', data);
    };

//    handlers.data = function (data) {
//        client.sendData(data);
//    };

    return handlers;
};

