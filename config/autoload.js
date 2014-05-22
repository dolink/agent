"use strict";

module.exports = function (maroon) {
    var defaultModules = [
        '../exts/logs',
        '../exts/app'
    ], developmentModules = [];

    if ('development' === maroon.env()) {
        developmentModules = [
        ]
    }

    if (typeof window === 'undefined') {
        return defaultModules.concat(developmentModules).map(require);
    } else {
        return [];
    }
};

