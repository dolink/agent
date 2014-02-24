var path = require('path');

module.exports = function (maroon) {
    var root = maroon.root;

    maroon.configure('all', function () {
        maroon.loadConfigs(__dirname);
    });

};