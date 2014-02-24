"use strict";

module.exports = exports = Waits;

function Waits(cb) {
    this.count = 0;
    this.callback(cb);
}

Waits.prototype.callback = function (cb) {
    this.cb = cb;
};

Waits.prototype.wait = function(fn, scope) {
    var self = this;
    this.count += 1;
    return function() {
        if (fn) {
            fn.apply(scope, arguments);
        }
        if (--self.count === 0 && self.cb) {
            self.cb();
            self.cb = null;
        }
    }
};