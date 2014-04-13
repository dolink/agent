"use strict";

global.r = require('r').r;

/**
 * App module exports method returning new instance of App.
 *
 * @param {String|?} root
 * @returns {Object} app
 */
var initialize = module.exports = function initialize(root) {
    root = root || __dirname;
    require('maroon').create({}, {root: root, forward: true});
};

if (!module.parent) {
    initialize();
}