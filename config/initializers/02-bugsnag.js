"use strict";

var logs = require('logs');

module.exports = function (maroon) {
    var app = maroon.app;
    if (app.enabled('bugsnagKey')) {
        logs.get('[BUGSNAG]').info('enabling bugsnag');
        var bugsnag = require("bugsnag");
        bugsnag.register(app.get('bugsnagKey'));
    }
};
