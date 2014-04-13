"use strict";

var path = require('path');

module.exports = function (maroon) {
    var app = maroon.app;

    app.setAll({
        "debug": true,
        "versions file": path.join(maroon.root, '.opts/versions-development.json'),
        "serial file": path.join(maroon.root, '.opts/serial-development.json'),
        "token file": path.join(maroon.root, '.opts/token-development.json'),
        "api": {
            host: 'ollo.io',
            port: 443,
            secure: false
        },
        "cloud": {
            host: 'cloud.ollo.io',
            port: 443,
            secure: false
        },
        "stream": {
            host: 'stream.ollo.io',
            port: 443,
            secure: false
        }
    });

    // config for log
    app.set('log level', 'debug');
    app.set('log file', path.join(maroon.root, 'client.log'));

};