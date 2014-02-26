"use strict";

var log = require('logs').get('drivers');
var needs = require('needs');
var path = require('path');
var domain = require('domain');
var utils = r('>/lib/utils');

var Mconf = require('./mconf');

module.exports = function (app) {
    var mconf = Mconf();

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
            var klass = require(info.file);
            if (!klass) {
                var err = new Error('Invalid module (%s)', info.name);
                log.error(err);
                return;
            }
            var opts = mconf.load(info.name);

            driver = createDriver(info, klass, opts);
            //todo: bind driver
            results[info.name] = driver;
        });

    }

    function createDriver(info, klass, opts) {
        var driver = {};
        driver.driverName = info.name;
        driver.file = info.file;

        var version = utils.moduleVersion(path.dirname(info.file), info.name);
        if (!(version instanceof Error)) {
            driverVersion(driver)(version);
        }
        driver.instance = new klass(opts, app.context, driverVersion(driver));

        return driver;
    }

    function driverVersion(driver) {
        return function (version) {
            driver.version = version;
            app.emit('driver::version', driver.driverName, version, driver);
        }
    }

};
