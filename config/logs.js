"use strict";

module.exports = function (compound) {
    var app = compound.app;

    compound.on('after configure', function () {
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

        compound.emit('logs ready');
    });

};