"use strict";

var log = require('logs').get('credentials');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var mkdirp = require('mkdirp');
var existsSync = fs.existsSync || path.existsSync;
var util = require('util');

module.exports = exports = Credentials;

function Credentials(app) {
    if (!(this instanceof Credentials)) {
        return new Credentials(app);
    }
    this.app = app;
    this.serial = null;
    this.token = null;

    this.init();
}

Credentials.prototype.init = function () {
    var serialFile = this.app.get('serialFile');

    // if the serial does not exist
    if (!existsSync(serialFile)) {

        // If the serialFile does not exist, create one
        var generatedSerial = crypto.randomBytes(8).toString('hex').toUpperCase();
        var dirName = path.dirname(serialFile);

        try {
            mkdirp.sync(dirName);
            fs.writeFileSync(serialFile, generatedSerial);
        } catch (e) {
            if (e.code == "EACCES") {
                log.error("Filesystem permissions error (%s)", serialFile);
            } else {
                log.error("Cannot create serialFile (%s): %s", serialFile, e);
            }
            process.exit(1);
        }
    }

    this.loadToken();
    this.loadSerial();

    log.info("This Ollo's Serial: %s", this.serial);
};

Credentials.prototype.loadSerial = function () {
    var self = this;
    this.load('serial', function (err, serial) {
        if (err) return log.error(err);
        return self.serial = serial;
    });
};

Credentials.prototype.saveSerial = function () {
    this.save('serial', this.serial, function (err) {
        if (err) log.error(err);
    });
};

Credentials.prototype.loadToken = function () {
    var self = this;
    this.load('token', function (err, token) {
        if (err) return log.error(err);
        self.token = token;
    });
};

Credentials.prototype.saveToken = function (creds, callback) {
//    if (typeof credsOrToken === 'function') {
//        callback = credsOrToken;
//        credsOrToken = null;
//    }
//    if (!credsOrToken) {
//        credsOrToken = this.token;
//    }
//    var token = credsOrToken.token ? credsOrToken.token : credsOrToken;
    this.save('token', creds.token, function (err) {
        if (err) log.error(err);
        callback && callback(err);
    });
};

Credentials.prototype.load = function (cred, cb) {
    var contents = '';
    var file = this.app.get(cred + ' file');
    if (!file) {
        return cb(util.format('Unable to load %s from file (no path specified)', cred));
    }
    try {
        if (existsSync(file)) {
            contents = fs.readFileSync(file, 'utf8');
        }
    }
    catch (e) {
        return cb(util.format('Unable to load %s from file (%s)', cred, e));
    }
    log.info('Successfully loaded %s from file', cred);
    cb(null, contents.replace(/\n/g, ''));
};

Credentials.prototype.save = function (cred, value, cb) {
    var file = this.app.get(cred + ' file');
    if (!file) {
        return cb(util.format('Unable to save %s to file (no path specified)', cred));
    }

    log.debug('Attempting to save %s to file...', cred);

    try {
        fs.writeFileSync(file, value);
    }
    catch (e) {
        cb(util.format('Unable to save %s file (%s)', cred, e));
        return false;
    }
    log.info('Successfully saved %s to file', cred);
    return cb();
};



