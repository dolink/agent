"use strict";

var logs = require('logs');
var log = logs.get('drivers');
var needs = require('needs');
var path = require('path');
var domain = require('domain');
var _ = require('lodash');

var utils = require('./utils');
var taskit = require('./taskit');
var mconf = require('./mconf');

require('colors');

exports = module.exports = DriverLoader;

exports.DriverLoader = DriverLoader;

exports.load = function (app, dir) {
    return DriverLoader(app)(dir);
};

function DriverLoader(app) {
    var configurator = mconf(path.join(app.root, '.data'));
    var handlers = require('./driver-handlers')(app, configurator);

    return function loadDrivers(dir) {
        dir = dir || path.join(app.root, 'drivers');
        var drivers = needs(dir, {
            module: true,
            filter: loadDriver
        });
        log.info('Loaded drivers: %s', Object.keys(drivers));
        return drivers;
    };

    function loadDriver(results, info) {
        try {
            return doLoadDriver(results, info);
        } catch (e) {
            log.warn('Failed to load driver:', info.name, 'Error:', e);
        }

    }

    function doLoadDriver(results, info) {
        var driver;
        log.info('Loading driver (%s) from path (%s)', info.name, info.file);
        var cls = require(info.file);
        if (!cls) {
            log.warn('Failed to load', 'package.json'.yellow, 'from path', info.file.yellow);
            return;
        }
        var opts = configurator.load(info.name);
        if (!opts) {
            var pkg = loadPackageInfo(path.dirname(info.file));
            opts = (pkg && pkg.config) || {};
        }
        driver = createDriver(cls, opts, info);
        bindDriver(driver);
        results[info.name] = driver;
    }

    function createDriver(cls, opts, info) {
        var driver;
        var Driver = buildDriverClass(cls, info.name, info.file);

        // for ninja driver
        var _log = app.log;
        app.log = logs.get(info.name);

        if (Driver.length < 3) {
            driver = new Driver(opts, app);
            var version = utils.moduleVersion(path.dirname(info.file), info.name);
            (!(version instanceof Error)) && setDriverVersion(driver, version);
        } else {
            driver = new Driver(opts, app, function (version) {
                process.nextTick(function () {
                    setDriverVersion(driver, version);
                });
            });
        }

        // for ninja driver
        driver.log = app.log;
        app.log = _log;

        return driver;
    }

    function buildDriverClass(cls, name, file) {
        if (typeof file === 'function') {
            cls = file;
            file = null;
        }

        _.assign(cls.prototype, {
            name: name || 'Driver',
            file: file
        });

        // handler queue for running in creation
        var enqueue = taskit.queue();
        _.forEach(handlers, function (handler, name) {
            cls.prototype[name] = function () {
                var self = this;
                var args = Array.prototype.slice.call(arguments);
                enqueue(function () {
                    handler.apply(self, args);
                });
            }
        });

        return cls;
    }

    function setDriverVersion(driver, version) {
        driver.version = version;
        app.emit('driver::version', driver.name, version, driver);
    }

    function bindDriver(driver) {
        _.forEach(handlers, function (handler, name) {
            driver[name] = handler;
            if (typeof driver.on === 'function') {
                driver.on(name, utils.bind(handler, driver));
            }
        });
    }

};

function loadPackageInfo(module) {
    try {
        return require(path.join(module, 'package.json'));
    } catch (e) {
        log.warn('Failed to load %s from path (%s)', '"package.json"', module);
        return null;
    }
}
