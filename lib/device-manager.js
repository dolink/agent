"use strict";

var logs = require('logs');
var log = logs.get('device');

module.exports = DeviceManager;

function DeviceManager(app, client) {
    if (!(this instanceof DeviceManager)) {
        return new DeviceManager(app, client);
    }

    this.app = app;
    this.client = client;

    var devices = app.devices = {};

    app.on('device::register', function onDeviceRegister(device, driver) {
        device.guid = app.getGuid(device);
        device.log = logs.get('device:' + (device.name ? device.name : device.guid));

        if (devices.hasOwnProperty(device.guid)) {
            log.info('Duplicate device handler ignored (%s)', device.guid);
            return;
        }

        device.driver = driver;

        device.on('data', client.dataHandler(device));
        device.on('heartbeat', client.heartbeatHandler(device));
        device.on('error', function onDeviceError(e) {
            log.error('Device error', device.guid, e);
        });

        devices[device.guid] = device;
        app.emit('device::up', device.guid, device);
        device.emit('heartbeat');
    });

    app.on('device::command', function onDeviceCommand(command) {
        var device = devices[command.GUID];

        if (device) {
            if (typeof command.DA == 'string' && command.DA[0].match(/$[{[]/)) {
                try {
                    // Just do our best. :/
                    command.DA = JSON.parse(command.DA);
                } catch(e) {}
            }

            device.log.debug('Actuation >', command.DA);
            device.write(command.DA);
        }
    });

    app.on('device::data', function onDeviceData(data) {
        client.sendData(data);
    });

}

