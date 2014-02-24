"use strict";

var log = require('logs').get('mods');
var needs = require('needs');
var path = require('path');
var domain = require('domain');
var utils = r('>/lib/utils');

var Mconf = require('./mconf');

module.exports = exports = Drivers;

function Drivers(app) {
    if (!(this instanceof Drivers)) {
        return new Drivers(app);
    }
    this.app = app;
    this.mconf = Mconf();
    this.items = null;
}

Drivers.prototype.loadDrivers = function (dir) {
    this.items = needs(dir, {
        module: true,
        filter: utils.bind(this.loadDriver, this)
    });
};

Drivers.prototype.loadDriver = function (info) {
    var self = this;
    var driver;
    var d = domain.create();
    d.on('error', function (err) {
        log.error('(%s) had the following error: \n\n%s\n', info.name, err.stack);
    });
    return d.run(function () {
        var klass = require(info.file);
        if (!klass) {
            var err = new Error('Invalid module (%s)', info.name);
            log.error(err);
            return false;
        }
        var opts = self.mconf.load(info.name);
        var version = utils.moduleVersion(path.dirname(info.file), info.name);
        version = version instanceof Error ? null : version;
        driver = self.constructDriver(info, klass, opts, version);
        //todo: bind driver
    });
    return driver;
};

Drivers.prototype.constructDriver = function (info, klass, opts, version) {
    var driver = {};
    driver.driverName = info.name;
    driver.instance = new klass(opts, this.app.context, makeVersionCallback(driver));
    driver.file = info.file;
    driver.version = version;
    return driver;
};

function makeVersionCallback(driver) {
    return function (version) {
        driver.version = version;
    }
}
