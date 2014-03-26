"use strict";

global.r = require('r').r;

var logs = require('logs');
logs.use('log4js', {
    level: 'debug'
});
var log = require('logs').get('ollo');

/**
 * App module exports method returning new instance of App.
 *
 * @param {String|?} root
 * @returns {Object} app
 */
var getAppInstance = module.exports = function getAppInstance(root) {
    root = root || __dirname;
    var app = require('./app')(root);
    require('maroon').create(app, {root: root, forward: true});
    return app;
};

if (!module.parent) {
    getAppInstance();
//    app.start(function () {
//        log.info('Client started within %s environment', app.get('env'));
//    });
}