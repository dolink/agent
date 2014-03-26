"use strict";

var log = require('logs').get('handlers');
var utils = r('>/lib/utils');

module.exports = function (app) {

    this.commands = function (cmd) {
        var data = utils.toJSON(cmd);

        for (var d = 0, ds = data.DEVICE; d < ds.length; d++) {

            var guid = ds[d].GUID,
                device;

            ds[d].G = ds[d].G.toString();

            log.debug('Received actuation for device %s : %s', guid, ds[d].DA);

            app.emit('device::command', ds[d]);
        }
    };

    this.config = function (req) {
        if (typeof req == 'string') {
            try {
                req = JSON.parse(req);
            } catch(e) {
                log.error('Failed to parse config request', req);
                // TODO: SEND ERROR RESPONSE!!!
                return;
            }
        }

        // XXX: I've never seen more than one. Can it even happen?
        // XXX: Not handling synchronous requests... but im not sure that's possible with mqtt anyway?
        app.emit('config::request', req.id, req.CONFIG, req.sync);
    };
};