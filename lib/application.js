"use strict";

var logs = require('logs');

/**
 * Application prototype.
 */

var app = exports = module.exports = {};

app.init = function () {
    this.logs = logs;
    this.log = logs.get('agent:app');
    this.settings = {};
    this.defaultConfiguration();
};

/**
 * Initialize configurable configuration.
 *
 * @api private
 */

app.defaultConfiguration = function () {
    // default settings
    this.set('env', process.env['NODE_ENV'] || 'development');
};

app.get = function (setting) {
    return this.settings[setting];
};

/**
 * Assign `setting` to `val`, or return `setting`'s value.
 *
 *    app.set('foo', 'bar');
 *    app.get('foo');
 *    // => "bar"
 *
 * Mounted servers inherit their parent server's settings.
 *
 * @param {String} setting
 * @param {*|?} val
 * @return {Application|*} for chaining
 * @api public
 */

app.set = function (setting, val) {
    if (1 == arguments.length) {
        return this.get(setting);
    } else {
        this.settings[setting] = val;
        return this;
    }
};

/**
 * Assign `settings` key-value to current settings.
 *
 * @param settings
 */
app.setAll = function (settings) {
    for(var key in settings) {
        this.set(key, settings[key]);
    }
};

/**
 * Check if `setting` is enabled (truthy).
 *
 *    app.enabled('foo')
 *    // => false
 *
 *    app.enable('foo')
 *    app.enabled('foo')
 *    // => true
 *
 * @param {String} setting
 * @return {Boolean}
 * @api public
 */

app.enabled = function (setting) {
    return !!this.set(setting);
};

/**
 * Check if `setting` is disabled.
 *
 *    app.disabled('foo')
 *    // => true
 *
 *    app.enable('foo')
 *    app.disabled('foo')
 *    // => false
 *
 * @param {String} setting
 * @return {Boolean}
 * @api public
 */

app.disabled = function (setting) {
    return !this.set(setting);
};

/**
 * Enable `setting`.
 *
 * @param {String} setting
 * @return {Application} for chaining
 * @api public
 */

app.enable = function (setting) {
    return this.set(setting, true);
};

/**
 * Disable `setting`.
 *
 * @param {String} setting
 * @return {Application} for chaining
 * @api public
 */

app.disable = function (setting) {
    return this.set(setting, false);
};

/**
 * Configure callback for zero or more envs,
 * when no `env` is specified that callback will
 * be invoked for all environments. Any combination
 * can be used multiple times, in any order desired.
 *
 * Examples:
 *
 *    app.configure(function(){
     *      // executed for all envs
     *    });
 *
 *    app.configure('stage', function(){
     *      // executed staging env
     *    });
 *
 *    app.configure('stage', 'production', function(){
     *      // executed for stage and production
     *    });
 *
 * Note:
 *
 *  These callbacks are invoked immediately, and
 *  are effectively sugar for the following:
 *
 *     var env = process.env.NODE_ENV || 'development';
 *
 *      switch (env) {
     *        case 'development':
     *          ...
     *          break;
     *        case 'stage':
     *          ...
     *          break;
     *        case 'production':
     *          ...
     *          break;
     *      }
 *
 * @param {String} env
 * @param {Function} fn
 * @return {Application|*} for chaining
 * @api public
 */

app.configure = function (env, fn) {
    var envs = 'all'
        , args = [].slice.call(arguments);
    fn = args.pop();
    if (args.length) envs = args;
    if ('all' == envs || ~envs.indexOf(this.settings.env)) fn.call(this);
    return this;
};

