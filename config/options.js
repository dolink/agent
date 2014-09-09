"use strict";

var path = require('path');

module.exports = {
    "development": {
        "logLevel": "debug",
        "debug": true,
        "versionsFile": path.join(__dirname, '..', '.opts/versions-development.conf'),
        "serialFile": path.join(__dirname, '..', '.opts/serial-development.conf'),
        "tokenFile": path.join(__dirname, '..', '.opts/token-development.conf'),
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
        "client": process.env.OLLO_AGENT_NAME
//      "bugsnagKey": process.env.BUGSNAG_KEY
    },

    "ty": {
        "logLevel": "debug",
        "debug": true,
        "devicePath": "usb|ttyAMA*|ttyO1",
        "versionsFile": path.join(__dirname, '..', '.opts/versions-development.conf'),
        "serialFile": path.join(__dirname, '..', '.opts/serial-development.conf'),
        "tokenFile": path.join(__dirname, '..', '.opts/token-development.conf'),
        "api": {
            host: 'ty.local',
            port: 3000,
            secure: false
        },
        "cloud": {
            host: 'ty.local',
            port: 3001,
            secure: false
        },
        "stream": {
            host: 'ty.local',
            port: 3002,
            secure: false
        },
        "client": process.env.OLLO_AGENT_NAME
    },
    "hacking": {
        "logLevel": "debug",
        "debug": true,
        "devicePath": "usb|ttyAMA*|ttyO1",
        "versionsFile": path.join(__dirname, '..', '.opts/versions-hacking.conf'),
        "serialFile": path.join(__dirname, '..', '.opts/serial-hacking.conf'),
        "tokenFile": path.join(__dirname, '..', '.opts/token-hacking.conf'),
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
            port: 8443,
            secure: true
        },
        "client": process.env.OLLO_AGENT_NAME,
        "bugsnagKey": process.env.BUGSNAG_KEY
    },
    "production": {
        "versionsFile": '/etc/opt/ollo/versions.conf',
        "serialFile": '/etc/opt/ollo/serial.conf',
        "tokenFile": '/etc/opt/ollo/token.conf',
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
            port: 8443,
            secure: true
        },
        "client": process.env.OLLO_AGENT_NAME,
        "bugsnagKey": process.env.BUGSNAG_KEY
    }
};
