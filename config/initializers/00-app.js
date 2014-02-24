var log = require('logs').get('init:app');

module.exports = function (maroon) {
    log.debug('initializing app');
    maroon.app.init();
};