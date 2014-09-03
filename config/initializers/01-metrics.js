"use strict";

var logs = require('logs');
var Metrics = require('../../lib/metrics');

module.exports = function () {
    var app = this;
    var metrics = new Metrics(app);
    metrics.schedule();
};