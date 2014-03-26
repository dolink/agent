"use strict";

var log = require('logs').get('app');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var utils = r('>/lib/utils');

module.exports = exports = App;

function App(root) {
    this.root = root;

    this.devices = [];

    this.initialized = false;

    this.creds = require('./credentials')(this);
    this.vers = require('./versioning')(this);
    this.client = require('./client')(this, this.creds);

    this.loadDrivers = require('./drivers')(this);
}

util.inherits(App, EventEmitter);

App.prototype.init = function () {
    if (this.initialized) return;
    log.info('Initializing');

    var app = this;

    app.creds.init();
    app.vers.init();

    app.loadVersions();

    app.loadDrivers();

    // wait for version callback
    setTimeout(function () {
        app.saveVersions();
        app.initialized = true;
        app.emit('initialized');
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
    var app = this;

    this.vers.loadModuleVersion('app', this.root);
    this.vers.loadFileVersion('system', '/opt/tools/sys_version');
    this.vers.loadFileVersion('tools', '/opt/tools/version');

    this.on('driver::version', function (name, version) {
        app.vers.setDriverVersion(name, version);
    });
};

App.prototype.saveVersions = function () {
    this.vers.saveVersions();
};

App.prototype.start = function (cb) {
    var self = this;
    this.waitFor('initialized', function () {
        self.client.connect();
        cb();
    });
};

App.prototype.getGuid = function getGuid(device) {
    return [ this.cred.serial, device.G, device.V, device.D ].join('_');
};