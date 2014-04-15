"use strict";

global.r = require('r').r;

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production'
}

var argv = require('optimist').usage(
    [
        'This process requires certain parameters to run.',
        'Please see usage information below.',
        '',
        'Example: $0 --devicePath /dev/tty.usb*B'
    ].join('\n')
).argv;

/**
 * App module exports method returning new instance of App.
 *
 * @param {String|?} root
 * @returns {Object} app
 */
var initialize = module.exports = function initialize(root) {
    root = root || __dirname;
    require('maroon').create({}, {root: root, forward: true, argv: argv});
};

if (!module.parent) {
    initialize();
}