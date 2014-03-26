"use strict";

var log = require('logs').get('app');
var domain = require('domain');

var App = require('./application');


/**
 * Expose `createApplication()`.
 */

exports = module.exports = createApplication;

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
