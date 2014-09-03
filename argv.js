"use strict";

var _ = require('lodash');

var argv = require('yargs')
    .usage('Usage: $0 --devicePath /dev/tty.usb*')
    .argv;

module.exports = function () {
    _.merge(this.settings, argv);
};