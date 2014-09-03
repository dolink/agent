"use strict";

process.chdir(__dirname); // avoid relative hacks

require('logs').use('log4js');

var yetta = require('yetta');
var agent = require('./lib');

var createApp = module.exports = function createApp(params) {
    params = params || {};
    // specify current dir as default root of server
    params.root = params.root || __dirname;
    var app = yetta(agent(), params);
    app.phase(yetta.configure());
    app.phase(yetta.initializers());
    return app;
};

if (!module.parent || module.parent.isApplicationLoader) {
    var app = createApp();
    app.boot(function (err) {
        if (err) throw err;
    });
}