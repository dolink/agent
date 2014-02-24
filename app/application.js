"use strict";

var log = require('logs').get('app');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Drivers = require('./drivers');
var Credentials = require('./credentials');
var Versioning = require('./versioning');

module.exports = exports = App;

function App(root, context) {
    this.root = root;
    this.context = context;

    this.initialized = false;

    this.drivers = Drivers(this);
    this.cred = Credentials(this);
    this.vers = Versioning(this);
}

util.inherits(App, EventEmitter);

App.prototype.init = function () {
    if (this.initialized) return;
    log.info('Initializing');

    var self = this;
    self.cred.init();
    self.vers.init();

    self.loadVersions();

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
    this.vers.loadModuleVersion('app', this.root);
    this.vers.loadFileVersion('system', '/opt/tools/sys_version');
    this.vers.loadFileVersion('tools', '/opt/tools/version');
};

App.prototype.saveVersions = function () {
    this.vers.saveVersions();
};

App.prototype.start = function (cb) {
    this.waitFor('initialized', cb);
};