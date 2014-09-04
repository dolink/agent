"use strict";

module.exports = function (yetta) {
    var app = this;

    // for ninja drivers
    app.opts = app.settings;

    app.setAll(require('./options')[app.env]);

};
