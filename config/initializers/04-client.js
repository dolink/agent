"use strict";

var Credentials = require('../../lib/credentials');
var Client = require('../../lib/client');

module.exports = function () {
    var app = this;

    var creds = new Credentials(app);

    // private for following process
    app._client = new Client(app, creds);

    // for some drivers (e.g. ipcam)
    app.__defineGetter__('id', function() {
        return creds.serial;
    });

    app.__defineGetter__('serial', function() {
        return creds.serial;
    });

    app.__defineGetter__('token', function(){
        return creds.token;
    });

    app.getGuid = function (device) {
        return [ creds.serial, device.G, device.V, device.D ].join('_');
    };
};