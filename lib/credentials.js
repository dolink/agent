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
    var serial = this.load('serial');
    if (!serial.length) {
        throw new Error('Serial file is empty:', this.app.get('serialFile'));
    }
    return this.serial = serial;
};

Credentials.prototype.saveSerial = function () {
    this.save('serial', this.serial);
};

Credentials.prototype.loadToken = function () {
    return this.token = this.load('token');
};

Credentials.prototype.saveToken = function (creds) {
    this.save('token', creds.token);
};

Credentials.prototype.load = function (cred) {
    var contents = '';
    var file = this.app.get(cred + 'File');
    if (!file) {
        log.error('Unable to load %s from file (no path specified)', cred);
        return false;
    }
    try {
        if (existsSync(file)) {
            contents = fs.readFileSync(file, 'utf8');
        }
    }
    catch (e) {
        log.error('Unable to load %s from file (%s)', cred, e);
        return false;
    }
    log.info('Successfully loaded %s from file', cred);
    return contents.replace(/\n/g, '');
};

Credentials.prototype.save = function (cred, value) {
    var file = this.app.get(cred + 'File');
    if (!file) {
        log.error('Unable to save %s to file (no path specified)', cred);
        cb || cb(new Error('Unable to save ' + cred + ' file.'));
        return false;
    }

    log.debug('Attempting to save %s to file...', cred);

//    fs.writeFile(file, value, function(err) {
//        if (err) {
//            log.error('Unable to save %s file (%s)', cred, err);
//            cb || cb(err);
//            return;
//        }
//        log.info('Successfully saved %s to file', cred);
//        cb || cb();
//    });

    try {
        fs.writeFileSync(file, value);
    } catch (err) {
        log.error('Unable to save %s file (%s)', cred, err);
        return;
    }

    log.info('Successfully saved %s to file', cred);

};



