"use strict";

var log = require('logs').get('versioning');
var path = require('path');
var fs = require('fs');
var util = require('util');
var semver = require('semver');
var mkdirp = require('mkdirp');

module.exports = exports = Versioning;

function isType(obj, types) {
    if (!Array.isArray(types)) types = [types];
    return types.indexOf(typeof obj) > 0;
}

function isArduinoBoardVersion(version) {
    return typeof version === 'string' && version.split(',').length  == 3;
}

function Versioning(app) {
    if (!(this instanceof Versioning)) {
        return new Versioning(app);
    }
    this.app = app;
}

Versioning.prototype.init = function () {
    this.version = {
        drivers: {},
        client: process.env['CLIENT_NAME'] || 'ollo-app',
        id: this.app.cred.serial
    };
};

Versioning.prototype.clearDriversVersion = function () {
    this.version.drivers = {};
};

Versioning.prototype.setDriverVersion = function (name, version) {
    if (!name) return false;

    if (semver.valid(version) || isArduinoBoardVersion(version)) {
        this.version.drivers[name] = version;
        log.debug("reporting %s (%s)", version, name);
        return true;
    }
    log.error(" %s did not report a valid version.", name);
    return false;
};

//Versioning.prototype.loadDriverVersion = function (Driver) {
//    var self = this;
//    var name = Driver.__name || undefined;
//    self.version.drivers[name] = null;
//    if (!name) return;
//
//    if (!isType(Driver, ['object', 'function'])) {
//        log.error("invalid driver provided: %s", name);
//        return;
//    }
//
//    if (Driver.length < 3) {
//        log.debug("checking package.json (%s)", name);
//        this.moduleVersion(Driver.__dir, name, function (err, version) {
//            if (err) return log.error(err);
//            self.setDriverVersion(name, version);
//        });
//        return;
//    }
//    if (Driver.length == 3) {
//        log.debug("using version callback (%s)", name);
//        return function (version) {
//            self.setDriverVersion(name, version);
//        }
//    }
//    log.error("unexpected arity, expecting fewer than 3 (%s)", name);
//};

Versioning.prototype.loadModuleVersion = function (name, module) {
    var self = this;
    this.moduleVersion(module, name, function (err, version) {
        if (err) return log.error(err);
        self.version[name] = version;
        log.debug("reporting %s (%s)", version, name);
    });
};

Versioning.prototype.loadFileVersion = function (name, file) {
    var self = this;
    this.fileVersion(file, name, function (err, version) {
        if (err) return log.error(err);
        self.version[name] = version;
        log.debug("reporting %s (%s)", version, name);
    });
};

Versioning.prototype.saveVersions = function () {
    log.debug("saving versionsFile...");
    var file = this.app.get('versionsFile');
    var dir = path.dirname(file);
    try {
        mkdirp(dir);
        fs.writeFileSync(file, JSON.stringify(this.version, null, "\t"));
    }
    catch (e) {
        if (e.code == "EACCES") {
            log.error("Filesystem permissions error (%s)", file);
        } else {
            log.error("Cannot create serialFile (%s): %s", file, e);
        }
        return process.exit(1);
    }
};

Versioning.prototype.moduleVersion = function (module, name, cb) {
    if (typeof name === 'function') {
        cb = name;
        name = module;
    }
    cb = cb || function(){};
    var pf = path.join(module, 'package.json');
    if (!fs.existsSync(pf)) {
        return cb(util.format("Error reading %s package.json", name));
    }
    var pkg;
    try {
        pkg = require(pf);
    } catch (e) {
        return cb(util.format("Error parsing %s package.json", name));
    }
    if (!pkg.version) {
        return cb(util.format("%s has no version", name));
    }

    return cb(null, pkg.version);
};

Versioning.prototype.fileVersion = function (file, name, cb) {
    if (typeof name === 'function') {
        cb = name;
        name = module;
    }
    cb = cb || function(){};
    if (!fs.existsSync(file)) {
        return cb(util.format("Error reading (%s) version file", name));
    }
    var content = fs.readFileSync(file);
    return cb(null, content.toString().replace(/\n/g, ''));
};
