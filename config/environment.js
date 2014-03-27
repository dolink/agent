var path = require('path');

module.exports = function (maroon) {
    var root = maroon.root;

    // for ninja drivers
    maroon.app.opts = maroon.settings;

    maroon.configure('all', function () {
        maroon.loadConfigs(__dirname);
    });

};