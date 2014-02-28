"use strict";

var log = require('logs').get('client');

module.exports = Client;

function Client(app) {
    if (!(this instanceof Client)) {
        return new Client(app);
    }
    this.app = app;
}

Client.prototype.connect = function () {
    log.debug('connecting ...');
};