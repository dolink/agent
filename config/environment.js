"use strict";

var util = require('util');

module.exports = function (maroon) {
    var app = maroon.app;

    // for ninja drivers
    app.opts = app.settings;

    app.configure('all', function () {
        maroon.loadConfigs(__dirname);
    });

    maroon.on('after configure', function () {
        configureLog(app);
        logSettings(app);
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
        var appender = log4js.appenders.file(path);
        log4js.addAppender(appender);
    }
}

function logSettings(app) {
    var log = require('logs').get('settings');
    log.debug(
        'Settings\n==================== SETTINGS BEGIN ====================\n%s\n==================== SETTINGS END ====================',
        util.inspect(app.settings)
    )
}