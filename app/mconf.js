"use strict";
var log = require('logs').get('Mconf');
var nconf = require('nconf');
var path = require('path');
var mkdirp = require('mkdirp');

module.exports = exports = Mconf;

function Mconf(options) {
    if (!(this instanceof Mconf)) {
        return new Mconf(options);
    }

    if (typeof options === 'string') {
        options = {root: options};
    }
    options = options || {};
    this.root = options.root || path.join(process.cwd(), '.data');
    this.file = options.file || 'config.json';
}

Mconf.prototype.load = function (name) {
    var file = new nconf.File({ file: path.join(this.root, name, this.file) });
    return file.loadSync();
};

Mconf.prototype.save = function (name, data) {
    var filepath = path.join(this.root, name, this.file);
    data = data || {};

    log.debug('save: writing config (%s)', filepath);

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