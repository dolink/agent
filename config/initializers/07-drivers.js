"use strict";

var DriverLoader = require('../../lib/driver-loader');
var DriverConfig = require('../../lib/driver-config');

module.exports = function () {
    var app = this;
    var drivers = DriverLoader.load(app);
    DriverConfig(app, drivers);
};