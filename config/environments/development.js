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
            host: '127.0.0.1',
            port: 3000,
            secure: false
        },
        "cloud": {
            host: '127.0.0.1',
            port: 3001,
            secure: false
        },
        "stream": {
            host: '127.0.0.1',
            port: 3002,
            secure: false
        }
    });

    // config for log
    app.set('logLevel', 'debug');
    app.set('logFile', path.join(maroon.root, 'client.log'));

};