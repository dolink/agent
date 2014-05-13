"use strict";

var util = require('util');
var fs = require('fs');

module.exports = function (maroon) {

    var log = require('logs').get('CONFIGURATION');

    var opts = maroon.app.settings;

    log.info(
        'Environment\n==================== ENVIRONMENT BEGIN ====================\n%s\n==================== ENVIRONMENT END ====================',
        process.env.NODE_ENV
    );
    log.debug(
        'Configuration\n==================== CONFIGURATION BEGIN ====================\n%s\n==================== CONFIGURATION END ====================',
        util.inspect(opts, { colors: true })
    );

    fs.writeFile('config-snapshot.json', JSON.stringify(opts), function(err) {
        if (err) {
            log.debug('Failed to write configuration snapshot');
        }
    });

};