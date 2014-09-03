"use strict";

module.exports = function () {
    var log4js = require('log4js');
    log4js.setGlobalLogLevel(this.get('logLevel') || 'info');
};