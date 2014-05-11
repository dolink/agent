"use strict";

var logs = require('logs');
var Metrics = require('../../lib/metrics');

module.exports = function (maroon) {
    var app = maroon.app;
    var metrics = new Metrics(app);
    metrics.schedule();
};