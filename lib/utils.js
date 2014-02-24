"use strict";

var fs = require('fs');
var path = require('path');
var util = require('util');
var __slice = Array.prototype.slice;

exports.bind = function bind(fn, context) {
    var curriedArgs = __slice.call(arguments, 2);
    if (curriedArgs.length) {
        return function () {
            var allArgs = curriedArgs.slice(0);
            for (var i = 0, n = arguments.length; i < n; ++i) {
                allArgs.push(arguments[i]);
            }
            fn.apply(context, allArgs);
        };
    } else {
        return function () {
            return fn.apply(context, arguments);
        };
    }
}

exports.moduleVersion = function (module, name) {
    var pf = path.join(module, 'package.json');
    if (!fs.existsSync(pf)) {
        return new Error(util.format("Error reading %s package.json", name));
    }
    var pkg;
    try {
        pkg = require(pf);
    } catch (e) {
        return new Error(util.format("Error parsing %s package.json", name));
    }
    if (!pkg.version) {
        return new Error(util.format("%s has no version", name));
    }

    return pkg.version;
};

exports.fileVersion = function (file, name, cb) {
    if (typeof name === 'function') {
        cb = name;
        name = module;
    }
    cb = cb || function(){};
    if (!fs.existsSync(file)) {
        return cb(util.format("Error reading (%s) version file", name));
    }
    var content = fs.readFileSync(file);
    return cb(null, content.toString().replace(/\n/g, ''));
};
