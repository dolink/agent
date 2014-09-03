"use strict";

var util = require('util');
var fs = require('fs');
var logs = require('logs');

module.exports = function () {

    var log = logs.get('CONFIGURATION');

    var app = this;
    var opts = app.settings;

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