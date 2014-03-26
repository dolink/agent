var log = require('logs').get('init:app');

module.exports = function (maroon) {

    maroon.on('ready', function () {
        log.debug('initializing app');
        maroon.app.init();
    });

};