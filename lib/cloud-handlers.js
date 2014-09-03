"use strict";

var log = require('logs').get('handlers');
var utils = require('./utils');

module.exports = function (app) {

    this.commands = function (cmd) {
        var data = utils.toJSON(cmd), ds;
        ds = data.DEVICE || data;
        if (!Array.isArray(ds)) ds = [ds];

        for (var i = 0; i < ds.length; i++) {
            var guid = ds[i].GUID,
                device;

            ds[i].G = ds[i].G.toString();

            log.debug('Received actuation for device %s : %s', guid, ds[i].DA);

            app.emit('device::command', ds[i]);
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