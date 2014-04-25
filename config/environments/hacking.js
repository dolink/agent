"use strict";

var path = require('path');

module.exports = function (maroon) {
    var app = maroon.app;

    app.setAll({
        "debug": true,
        "versionsFile": path.join(maroon.root, '.opts/versions-hacking.json'),
        "serialFile": path.join(maroon.root, '.opts/serial-hacking.json'),
        "tokenFile": path.join(maroon.root, '.opts/token-hacking.json'),
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
    app.set('logLevel', 'debug');
    app.set('logFile', path.join(maroon.root, 'client.log'));

};