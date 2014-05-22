"use strict";

module.exports = function (maroon) {
    var app = maroon.app;

    maroon.on('after configure', function () {
        require('lodash').merge(app.settings, maroon.argv || require('optimist').argv);
    });
};