"use strict";

var logs = require('logs');
var util = require('util');

module.exports = function (maroon) {
    var app = maroon.app;
    if (app.enabled('memwatch')) {
        var debugLog = logs.get('[Debug Monitoring]');
        debugLog.info('enabling memwatch');
        var memwatch = require('memwatch');

        memwatch.on('leak', function (info) {
            debugLog.warn('Memory Leak', info);
        });

        var nurse = require('nurse');
        var printStats = function () {
            debugLog.debug('Stats', util.inspect(nurse(), {colors: true}));
        };

        setInterval(printStats, 120000);
        printStats();
    }
};