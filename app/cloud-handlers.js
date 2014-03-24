"use strict";

var log = require('logs').get('handlers');
var utils = r('>/lib/utils');

module.exports = function (app, client) {

    var handlers = {};

    handlers.commands = function (cmd) {
        var data = utils.toJSON(cmd);

        for (var d = 0, ds = data.DEVICE; d < ds.length; d++) {

            var guid = ds[d].GUID,
                device;

            ds[d].G = ds[d].G.toString();

            if ((device = app.devices[guid]) && typeof device.write == "function") {
                try {
                    app.devices[guid].write(ds[d].DA);
                    return true;
                }
                catch (e) {
                    log.error("error actuating: %s (%s)", guid, err.message);
                }
            }
            else {
                // most likely an arduino device (or a bad module)
                log.debug("actuating %s (%s)", guid, ds[d].DA);
                this.context.emit('device::command', ds[d]);
            }
        }
        return false;
    };

    return handlers;
};