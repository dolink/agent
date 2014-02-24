"use strict";

var EventEmitter = require('events').EventEmitter;
var log = require('logs').get('App');
var domain = require('domain');
var App = require('./application');

/**
 * Expose `createApplication()`.
 */

exports = module.exports = createApplication;

function createApplication(root) {
    var d = domain.create();
    d.on('error', handleError);

    var context = new EventEmitter();
    context.on('error', handleError);
    d.add(context);

    var app = new App(root, context);
    d.add(app);

    return app;
}

function handleError(err) {
    err.message = err.message || 'Unknown error';
    log.error(err);
}
