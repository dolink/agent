"use strict";

var log = require('logs').get('app');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var domain = require('domain');
var merge = require('utils-merge');

var proto = require('./configurable');
var Credentials = require('./credentials');
var Client = require('./client');
var DeviceManager = require('./device-manager');
var Drivers = require('./drivers');


function App(root) {
    if (!(this instanceof App)) {
        return new App(root);
    }

    this.root = root;

    // for ninja driver
    this.log = log;
}

util.inherits(App, EventEmitter);
merge(App.prototype, proto);

App.prototype.init = function () {
    if (this.__initialized) return;
    this.__initialized = true;

    var app = this;
    // 1. Setup client
    var creds = new Credentials(app);
    app.emit('credentials', creds, app);

    var client = new Client(app, creds);
    app.emit('client', client, app);

    app.__defineGetter__('token', function(){
        return creds.token;
    });

    // 2. Fire up devices
    var dm = new DeviceManager(app, client);
    app.emit('dm', dm, app);

    // 3. Load drivers
    var drivers = Drivers(app)();
    app.emit('drivers', drivers, app);

    app.getGuid = function (device) {
        return [ creds.serial, device.G, device.V, device.D ].join('_');
    };

    client.connect();

    app.emit('ready', app);

};

exports.createApplication = createApplication;

function createApplication(root) {
    log.debug('create application');

    var d = domain.create();
    d.on('error', handleError);

    var app = new App(root);
    d.add(app);

    return app;
}

function handleError(err) {
    err.message = err.message || 'Unknown error';
    log.error(err);
}

exports.App = App;


