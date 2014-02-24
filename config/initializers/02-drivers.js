"use strict";

var log = require('logs').get('init:drivers');
var needs = require('needs');
var path = require('path');
var async = require('async');

module.exports = function (maroon) {
    log.debug('initializing drivers');

    var app = maroon.app;
    app.drivers.loadDrivers(path.join(app.root, 'drivers'));


};
