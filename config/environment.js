"use strict";

module.exports = function (maroon) {
    var app = maroon.app;

    // for ninja drivers
    app.opts = app.settings;

    app.configure('all', function () {
        maroon.loadConfigs(__dirname);
    });

    maroon.on('after configure', function () {
        configureLog(maroon.app);
    });

};

function configureLog(app) {
    var log4js = require('log4js');
    log4js.configure({
        appenders: [
            { type: 'console' }
        ],
        replaceConsole: true
    });

    log4js.setGlobalLogLevel(app.get('logLevel') || 'info');

    if (app.enabled('logFile')) addFileAppender(app.get('logFile'));

    require('logs').use('log4js', { factory: log4js });

    function addFileAppender(path) {
        if (!log4js.appenders.file) {
            log4js.loadAppender('file');
        }
        log4js.addAppender(log4js.appenders.file(path));
    }
}