"use strict";

var logs = require('logs');
var fs = require('fs');
var path = require('path');
var existsSync = fs.existsSync || path.existsSync;
var nconf = require('nconf');
var mkdirp = require('mkdirp');

module.exports = exports = function (options) {
    return new Config(options);
};

function Config(options) {
    if (typeof options === 'string') {
        options = {root: options};
    }
    options = options || {};
    this.root = options.root || path.join(process.cwd(), '.data');
    this.file = options.file || 'config.json';

    this.log = logs.get('mconf');
}

Config.prototype.load = function (name) {
    var file = path.join(this.root, name, this.file);
    if (!existsSync(file)) {
        return null;
    }
    var conf = new nconf.File({ file: file });
    return conf.loadSync();
};

Config.prototype.save = function (name, data) {
    var log = this.log;
    var filepath = path.join(this.root, name, this.file);
    data = data || {};

    log.debug('saving config for %s to %s', name, filepath);

    mkdirp(path.dirname(filepath), function (err) {
        if (err) {
            log.error("save: directory error: %s (%s)", err, path.dirname(filepath));
            return;
        }
        var file = new nconf.File({ file:  filepath});
        file.store = data || {};
        file.save(done);
    });

    function done(err) {
        if (err) {
            return log.error("save: write failure (%s)", name);
        }
        return log.debug("save: great success! (%s)", name);
    }

};