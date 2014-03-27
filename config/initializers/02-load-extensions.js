"use strict";

var log = require('logs').get('init:extensions');
var path = require('path');
var needs = require('needs');
var _ = require('lodash');

module.exports = function (maroon) {
    log.debug('loading app extensions');
    var exts = needs(path.join(maroon.root, 'lib', 'extensions'));
    _.forEach(exts, function (ext, name) {
        if (typeof ext === 'function') {
            log.debug('loading app extension (%s)', name);
            ext(maroon.app);
        } else {
            log.warn('%s should export function(maroon) but given %s', name, typeof ext);
        }
    });
};
