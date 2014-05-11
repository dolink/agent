"use strict";

var path = require('path');

module.exports = function (maroon) {
    var app = maroon.app;

    app.setAll({
        "debug": true,
        "versionsFile": path.join(maroon.root, '.opts/versions-development.conf'),
        "serialFile": path.join(maroon.root, '.opts/serial-development.conf'),
        "tokenFile": path.join(maroon.root, '.opts/token-development.conf'),
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
        },
        "client": process.env.OLLO_AGENT_NAME,
        "bugsnagKey": process.env.BUGSNAG_KEY
    });

    // config for log
    app.set('logLevel', 'debug');
    app.set('logFile', path.join(maroon.root, 'client.log'));

};