'use strict';

var logs = require('logs');
var os = require('os');
var Hoek = require('hoek');

function Metrics(app, opts) {
    this.opts = opts || {statsInterval: 30000};
    this.app = app;
    this.log = logs.get('metrics');
}

/**
 * Schedule the metrics logging task.
 */
Metrics.prototype.schedule = function () {
    if (this.__handler) return;

    var log = this.log;
    this.__handler = setInterval(function () {
        var memory = process.memoryUsage();
        if (log.isTraceEnabled()) {
            log.trace('sample#node.rss=' + memory.rss, 'sample#node.heapTotal=' + memory.heapTotal, 'sample#node.heapUsed=' + memory.heapUsed);
        }
        var load = os.loadavg();
        if (log.isTraceEnabled()) {
            log.trace('sample#os.load1=' + load[0], 'sample#os.load5=' + load[1], 'sample#os.load15=' + load[2]);
        }
        var bench = new Hoek.Bench();
        setImmediate(function () {
            if (log.isTraceEnabled()) {
                log.trace('sample#node.threadDelay=' + bench.elapsed());
            }
        });
    }, this.opts.statsInterval);
};

Metrics.prototype.unschedule = function () {
    if (this.__handler) {
        clearInterval(this.__handler);
        this.__handler = undefined;
    }
};

module.exports = Metrics;