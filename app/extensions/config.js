"use strict";

var log = require('logs').get('config:request');
var _ = require('lodash');
var async = require('async');

module.exports = function (app) {

    app.on('drivers', handleConfigRequest);

    function handleConfigRequest(drivers) {
        app.on('config::request', function(id, requests, sync) {
            log.debug('Module config request received', id, requests);

            var queue = [];
            function enqueue(name, driver, request) {
                queue.push(function(done) {
                    driver.config(request.data, function(err, response) {
                        // XXX: The old client didn't handle errors either?? What do we do?
                        if (err) return done(null);

                        done(null, {
                            type: 'MODULE',
                            module: name,
                            data: response
                        });
                    });
                });
            }

            // INCOMING : {"CONFIG":[{"type":"MODULE"}],"id":"3f20405a99e0","sync":false,"TIMESTAMP":1395198395258}
            requests.forEach(function(request) {
                log.debug('Handling config request');
                if (request.module) {
                    // For a specific driver
                    log.trace(' It\'s for a specific driver (%s)', request.module);
                    enqueue(request.module, drivers[request.module], request);
                } else {
                    // For all drivers
                    log.trace(' It\'s for all drivers.');
                    _.forEach(drivers, function (driver, name) {
                        if (driver.config && typeof driver.config == 'function') {
                            log.trace('Sending to', name);
                            enqueue(name, driver, request);
                        }
                    });
                }
            });

            //
            async.parallel(queue, function(err, replies) {
                log.trace('Got replies', JSON.stringify(replies), 'err', err);
                app.emit('config::reply', id, replies, sync);
            });
        });
    }
};