"use strict";

var logs = require('logs');
var log = logs.get('drivers');
var needs = require('needs');
var path = require('path');
var domain = require('domain');
var _ = require('lodash');
var exo = require('exo');

var utils = r('>/lib/utils');
var taskit = r('>/lib/taskit');

var Mconf = require('./mconf');

module.exports = function (app, dir) {
    var mconf = new Mconf();
    var handlers = require('./driver-handlers')(app, mconf);

    return function loadDrivers(dir) {
        dir = dir || path.join(app.root, 'drivers');
        var drivers = needs(dir, {
            module: true,
            filter: loadDriver
        });
        log.info('Loaded drivers: %s', Object.keys(drivers));
        return drivers;
    }

    function loadDriver(results, info) {
        var driver;
        var d = domain.create();
        d.on('error', function (err) {
            log.error('(%s) had the following error: \n\n%s\n', info.name, err.stack);
        });
        return d.run(function () {
            log.info('Loading driver (%s) from path (%s)', info.name, info.file);
            var cls = require(info.file);
            if (!cls) {
                var err = new Error('Invalid module (%s)', info.name);
                log.error(err);
                return;
            }
            var config = mconf.load(info.name);
            if (!config) {
                var pkg = loadPackageInfo(path.dirname(info.file));
                config = (pkg && pkg.config) || {};
//                mconf.save(info.name, config);
            }
            driver = createDriver(info, cls, config);
            bindDriver(driver);
            results[info.name] = driver;
        });
    }

    function createDriver(info, cls, opts) {
        var driver;
        var Driver = constructDriverClass(info.name, info.file, cls);

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

    function constructDriverClass(name, file, cls) {
        if (typeof file === 'function') {
            cls = file;
            file = null;
        }

        var Driver = exo.extend(cls, {
            name: name || 'Driver',
            file: file
        });

        // handler queue for running in creation
        var enqueue = taskit.queue();
        _.forEach(handlers, function (handler, name) {
            Driver.prototype[name] = function () {
                var self = this;
                var args = Array.prototype.slice.call(arguments);
                enqueue(function () {
                    handler.apply(self, args);
                });
            }
        });

        return Driver;
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
    } catch(e) {
        log.warn('Failed to load %s from path (%s)', '"package.json"', module);
        return null;
    }
}
