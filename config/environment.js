"use strict";

module.exports = function (maroon) {
    var app = maroon.app;

    // for ninja drivers
    app.opts = maroon.settings;

    maroon.configure('all', function () {
        maroon.loadConfigs(__dirname);
    });

};