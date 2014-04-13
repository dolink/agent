"use strict";

var _ = require('lodash');

exports.init = function (maroon) {
    var root = maroon.root;

    var app = require('../lib/app').createApplication(root);
    maroon.app = _.assign(app, maroon.app);

    maroon.on('ready', function () {
        maroon.app.init();
    });

};