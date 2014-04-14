"use strict";

var path = require('path');

module.exports = function (maroon) {
    var app = maroon.app;

    app.setAll({
        "versions file": path.join(maroon.root, '/etc/opt/ollo/versions.json'),
        "serial file": path.join(maroon.root, '/etc/opt/ollo/serial.json'),
        "token file": path.join(maroon.root, '/etc/opt/ollo/token.json'),
        "api": {
            host: 'ollo.io',
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
    app.set('log level', 'info');
    app.set('log file', '/var/log/ollo.log');

};