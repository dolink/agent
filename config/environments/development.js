"use strict";

var path = require('path');

module.exports = function (maroon) {
    var app = maroon.app;
    maroon.configure('development', function () {
        app.set('versions file', path.join(app.root, '.opts/versions-development.json'));
        app.set('serial file', path.join(app.root, '.opts/serial-development.json'));
        app.set('token file', path.join(app.root, '.opts/token-development.json'));
    });

};