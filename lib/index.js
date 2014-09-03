"use strict";

var logs = require('logs');
var domain = require('domain');
var mixin = require('utils-merge');
var AsyncEventEmitter = require('async-cancelable-events');

var proto = require('./application');

exports = module.exports = createApplication;

function createApplication() {
    var app = {};

    mixin(app, proto);
    mixin(app, AsyncEventEmitter.prototype);
    AsyncEventEmitter.call(app);

    var d = domain.create();
    d.on('error', handleError);
    d.add(app);

    app.init();
    return app;
}

function handleError(err) {
    err.message = err.message || 'Unknown error';
    logs.get('agent').error(err);
}