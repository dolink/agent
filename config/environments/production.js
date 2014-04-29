"use strict";

var path = require('path');

module.exports = function (maroon) {
    var app = maroon.app;

    app.setAll({
        "versionsFile": '/etc/opt/ollo/versions.json',
        "serialFile": '/etc/opt/ollo/serial.json',
        "tokenFile": '/etc/opt/ollo/token.json',
        "api": {
            host: 'api.ollo.io',
            port: 443,
            secure: true
        },
        "cloud": {
            host: 'cloud.ollo.io',
            port: 443,
            secure: true
        },
        "stream": {
            host: 'stream.ollo.io',
            port: 443,
            secure: true
        }
    });

    // config for log
    app.set('logLevel', 'info');
    app.set('logFile', '/var/log/ollo.log');

};