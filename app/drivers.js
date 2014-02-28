"use strict";

var log = require('logs').get('drivers');
var needs = require('needs');
var path = require('path');
var domain = require('domain');
var _ = require('lodash');
var exo = require('exo');

var utils = r('>/lib/utils');
var taskit = r('>/lib/taskit');

module.exports = function (app) {
    var mconf = require('./mconf')();
    var handlers = require('./handlers')(app);

    return function (dir) {
        dir = dir || path.join(app.root, 'drivers');
        app.drivers = needs(dir, {
            module: true,
            filter: loadDriver
        });
        log.debug('loaded drivers: %s', Object.keys(app.drivers));
    };


    function loadDriver(results, info) {
        var driver;
        var d = domain.create();
        d.on('error', function (err) {
            log.error('(%s) had the following error: \n\n%s\n', info.name, err.stack);
        });
        return d.run(function () {
            var cls = require(info.file);
            if (!cls) {
                var err = new Error('Invalid module (%s)', info.name);
                log.error(err);
                return;
            }
            var opts = mconf.load(info.name);
            driver = createDriver(info, cls, opts);
            bindDriver(driver);
            results[info.name] = driver;
        });

    }

    function createDriver(info, cls, opts) {
        var driver;
        var Driver = constructDriverClass(info.name, info.file, cls);

        if (Driver.length < 3) {
            driver = new Driver(opts, app.context);
            var version = utils.moduleVersion(path.dirname(info.file), info.name);
            (!(version instanceof Error)) && setDriverVersion(driver, version);
        } else {
            driver = new Driver(opts, app.context, function (version) {
                process.nextTick(function () {
                    setDriverVersion(driver, version);
                });
            });
        }
        return driver;
    }

    function constructDriverClass(driverName, file, cls) {
        if (typeof file === 'function') {
            cls = file;
            file = null;
        }

        var Driver = exo.extend(cls, {
            driverName: driverName || 'Driver',
            file: file
        });

        // handler queue for running in creation
        var enqueue = taskit.queue();
        _.forEach(handlers, function (handler, name) {
            if (name != 'error') {
                Driver.prototype[name] = function () {
                    var self = this;
                    var args = Array.prototype.slice.call(arguments);
                    enqueue(function () {
                        handler.apply(self, args);
                    });
                };
            }
        });

        return Driver;
    }

    function setDriverVersion(driver, version) {
        driver.version = version;
        app.emit('driver::version', driver.driverName, version, driver);
    }

    function bindDriver(driver) {
        _.forEach(handlers, function (handler, name) {
            if (name != 'error') {
                driver[name] = handler;
            }
            if (typeof driver.on === 'function') {
                driver.on(name, utils.bind(handler, driver));
            }
        });
    }

};
