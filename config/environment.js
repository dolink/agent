"use strict";

module.exports = function (yetta) {
    var app = this;

    // for ninja drivers
    app.opts = app.settings;

    yetta.loadConfigs(__dirname);

};
