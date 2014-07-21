"use strict";

exports.init = function (compound) {
    var app = compound.app;

    var log4js = require('log4js');
    log4js.configure({
        appenders: [
            { type: 'console' }
        ],
        replaceConsole: true
    });

    log4js.setGlobalLogLevel(app.get('loglevel') || 'info');

//    if (app.enabled('logFile')) addFileAppender(app.get('logFile'));

    require('logs').use('log4js', { factory: log4js });

//    function addFileAppender(path) {
//        if (!log4js.appenders.file) {
//            log4js.loadAppender('file');
//        }
//        log4js.addAppender(log4js.appenders.file(path));
//    }

    compound.emit('logs ready');

};