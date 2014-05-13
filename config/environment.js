"use strict";

module.exports = function (maroon) {
    var app = maroon.app;

    // for ninja drivers
    app.opts = app.settings;

    app.configure('all', function () {
        maroon.loadConfigs(__dirname);
    });

};