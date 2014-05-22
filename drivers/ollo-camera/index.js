"use strict";

var
    fs = require('fs')
    , util = require('util')
    , stream = require('stream')
    , path = require('path')
    , http = require('http')
    , https = require('https')
    , request = require('request')
    , streamifier = require('streamifier')
    , gm = require('gm')
    , moment = require('moment')
    ;

module.exports = Cam;

function Cam(opts, app) {

    var mod = this;
    stream.call(this);

    this.writable = true;
    this.readable = true;
    this.configurable = true;

    this.V = 0;
    this.G = "0";
    this.D = 220;

    this.app = app;
    this.opts = opts || { };
    this.interval = undefined; // setInterval ref
    this.present = false;

    var dirSnapshot = '/dev/shm/camera/';
    if (!fs.existsSync(dirSnapshot)) {
        dirSnapshot = path.join(app.root, 'camera');
        if (!fs.existsSync(dirSnapshot)) {
            throw new Error('No camera directory found!');
        }
    }
    this.dirSnapshot = dirSnapshot;

    app.on('client::up', function () {

        fs.watch(dirSnapshot, function (event, filename) {

            if (!(filename) || filename.substr(0, 5) !== 'snapshot.jpg') {
                return;
            }
            fs.lstat(path.resolve(dirSnapshot, filename), function (err, stats) {

                if (err) {

                    if (err.code == "ENOENT") {

                        mod.log.info("Camera unplugged");
                        mod.unplug();
                        return;
                    }

                    mod.log.error("%s", err);
                }

                if (!mod.present) {

                    mod.log.info("Camera plugged in");
                    init();
                }
            });
        });

        fs.lstat(path.join(dirSnapshot, 'snapshot.jpg'), function (err, stats) {

            if (err) {
                mod.log.info("No camera detected");
                return;
            }

            mod.log.info("Found camera");
            mod.emit('register', mod);
            mod.plugin();

        });
    });


    function init() {

        mod.log.info("Camera detected");

        mod.emit('register', mod);
        mod.plugin();
    }
}

util.inherits(Cam, stream);

Cam.prototype.write = function write(data) {
    var log = this.log;
    log.debug("Attempting snapshot...");

    var snapshotFile = path.join(this.dirSnapshot, 'snapshot.jpg'),
        opts = this.app.opts.stream,
        protocol = opts.port === 443 ? 'https' : 'http',
        options = {
            url: util.format('%s://%s:%d/rest/v0/camera/%s/snapshot', protocol, opts.host, opts.port, this.guid),
            headers: {
                'X-Ollo-Token': this.app.token
            }
        };

    var timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    fs.readFile(snapshotFile, function (err, data) {
        gm(data)
            .font('ArialBold')
            .fontSize(18)
            .fill("#fff")
            .gravity('SouthEast')
            .drawText(10, 10,timestamp)
            .stream('jpg')
            .pipe(request.post(options, function callback(err, httpResponse, body) {
                if (err) {
                    return log.error('Upload failed:', err);
                }
                if (body == 'Unauthorized') {
                    return log.error('Upload failed:', body);
                }
                log.debug('Snapshot upload successful [%s]', timestamp);
            }));
    });

};

Cam.prototype.heartbeat = function heartbeat(bool) {

    clearInterval(this.interval);

    if (!!bool) {

        var
            mod = this
            , ival = this.opts.interval || 10000
            ;
        this.log.debug(
            "Setting data interval to %s"
            , Math.round(ival / 1000)
        );

        this.emit('data', '1');
        this.interval = setInterval(function () {

            mod.emit('data', '1');

        }, ival);
        return;
    }
    this.log.debug("Clearing data interval");
};

Cam.prototype.unplug = function unplug() {

    this.present = false;
    this.heartbeat(false);
    this.emit('config', {

        G: this.G, V: this.V, D: this.D, type: 'UNPLUG'
    });
};

Cam.prototype.plugin = function plugin() {

    this.present = true;
    this.heartbeat(true);
    this.emit('data', '1');
    this.emit('config', {

        G: this.G, V: this.V, D: this.D, type: 'PLUGIN'
    });
};

Cam.prototype.config = function config(opts) {

    // we can do something with config opts here

    this.save(opts);
};

