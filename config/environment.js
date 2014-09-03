"use strict";

module.exports = function () {
    var app = this;

    // for ninja drivers
    app.opts = app.settings;

    loadConfigs(app, __dirname);

};


var fs = require('fs');
var path = require('path');
// TODO move it away ?
function loadConfigs(app, dir) {
    fs.readdirSync(dir).forEach(function(file) {
        if (file[0] === '.' || file.match(/^(Roco|environment|routes|autoload)\.(js|coffee|json|yml|yaml)$/)) {
            return;
        }
        var filename = path.join(dir, file);
        var basename = path.basename(filename, path.extname(filename));
        var stats = fs.statSync(filename);
        if (stats.isFile()) {
            var conf = require(filename);
            if ('function' === typeof conf) {
                conf = conf.call(app);
            }
            var opts = conf && conf[app.env];
            if (!!opts) app.set(basename, opts);
        }
    });
}