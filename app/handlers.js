"use strict";

var log = require('logs').get('handlers');

module.exports = function (app) {
    var handlers = {};

    // `this` is Driver

    handlers.announcement = function (data) {
        log.debug('announcement: %s (%s)', data, this.driverName);
    };


    handlers.register = function (device) {

    };

    handlers.config = function (params) {

    };

    handlers.error = function (err) {

    };

    handlers.save = function (conf) {

    };

    handlers.ack = function (data) {

    };

    handlers.data = function (data) {

    };

    return handlers;
};

