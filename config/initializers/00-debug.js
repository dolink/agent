"use strict";

var logs = require('logs');
var path = require('path');
var util = require('util');

module.exports = function (maroon) {
    var app = maroon.app;
    if (app.enabled('debug')) {
        var memwatch = require('memwatch');
        var debugLog = logs.get('[Debug Monitoring]');

        memwatch.on('leak', function(info) {
            debugLog.warn('Memory Leak', info);
        });

        var nurse = require('nurse');
        var printStats = function() {
            debugLog.debug(
                'Stats\n==================== STATS BEGIN ====================\n%s\n==================== STATS END ====================',
                util.inspect(nurse(), {colors:true})
            );
        };

        setInterval(printStats, 120000);
        printStats();
    }
};