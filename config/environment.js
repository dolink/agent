"use strict";

module.exports = function (maroon) {
    var app = maroon.app;

    // for ninja drivers
    app.opts = maroon.settings;

    app.configure('all', function () {
        maroon.loadConfigs(__dirname);
    });

    maroon.on('after configure', function () {
        configureLog(maroon);
    });

};

function configureLog(maroon) {
    var log4js = require('log4js');
    log4js.configure({
        appenders: [
            { type: 'console' }
        ],
        replaceConsole: true
    });

    log4js.setGlobalLogLevel(maroon.get('log level') || 'info');

    if (maroon.enabled('log file')) addFileAppender(maroon.get('log file'));

    require('logs').use('log4js', { factory: log4js });

    function addFileAppender(path) {
        if (!log4js.appenders.file) {
            log4js.loadAppender('file');
        }
        log4js.addAppender(log4js.appenders.file(path));
    }
}