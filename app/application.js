"use strict";

var log = require('logs').get('app');
var util = require('util');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;

module.exports = exports = App;

function App(root, context) {
    this.root = root;
    this.context = context;

    this.initialized = false;

    this.loadDrivers = require('./drivers')(this);
    this.cred = require('./credentials')(this);
    this.vers = require('./versioning')(this);
}

util.inherits(App, EventEmitter);

App.prototype.init = function () {
    if (this.initialized) return;
    log.info('Initializing');

    var self = this;
    self.cred.init();
    self.vers.init();

    self.loadVersions();
    self.loadDrivers();

    // wait for version callback
    setTimeout(function () {
        self.saveVersions();
        self.initialized = true;
        self.emit('initialized');
    }, 1000);

};

App.prototype.waitFor = function (state, fn) {
    if (!fn) return;
    if (this[state]) {
        fn();
    } else {
        this.once(state, fn);
    }
};

App.prototype.loadVersions = function () {
    var self = this;

    this.vers.loadModuleVersion('app', this.root);
    this.vers.loadFileVersion('system', '/opt/tools/sys_version');
    this.vers.loadFileVersion('tools', '/opt/tools/version');

    this.on('driver::version', function (name, version) {
        self.vers.setDriverVersion(name, version);
    });
};

App.prototype.saveVersions = function () {
    this.vers.saveVersions();
};

App.prototype.start = function (cb) {
    this.waitFor('initialized', cb);
};