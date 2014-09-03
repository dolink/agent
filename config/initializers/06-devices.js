"use strict";

var DeviceManager = require('../../lib/device-manager');

module.exports = function () {
    DeviceManager(this, this._client);
};