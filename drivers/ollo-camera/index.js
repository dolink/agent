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
    , Periodical = require('periodical')
    ;

module.exports = Cam;

function Cam(opts, app) {

    var self = this;
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

    var previewPath = '/dev/shm/camera/';
    if (!fs.existsSync(previewPath)) {
        previewPath = path.join(app.root, 'camera');
        if (!fs.existsSync(previewPath)) {
            throw new Error('No camera directory found!');
        }
    }
    this.previewFile = path.join(previewPath, 'snapshot.jpg');

    app.on('client::up', function () {

        fs.watch(previewPath, function (event, filename) {

            if (!(filename) || filename.substr(0, 5) !== 'snapshot.jpg') {
                return;
            }
            fs.lstat(path.resolve(previewPath, filename), function (err, stats) {

                if (err) {

                    if (err.code == "ENOENT") {

                        self.log.info("Camera unplugged");
                        self.unplug();
                        return;
                    }

                    self.log.error("%s", err);
                }

                if (!self.present) {

                    self.log.info("Camera plugged in");
                    init();
                }
            });
        });

        fs.lstat(self.previewFile, function (err, stats) {

            if (err) {
                self.log.info("No camera detected");
                return;
            }

            self.log.info("Found camera");
            self.emit('register', self);
            self.plugin();

        });
    });


    function init() {

        self.log.info("Camera detected");

        self.emit('register', self);
        self.plugin();
    }
}

util.inherits(Cam, stream);

Cam.prototype.write = function write(data) {
    var self = this;
    var log = this.log;
    log.debug("Attempting snapshot...");

    this.stop();

    var previewFile = this.previewFile;
    var opts = this.app.opts;
    var protocol = opts.stream.port === 443 ? 'https' : 'http';
    var postOptions = {
        url: util.format('%s://%s:%d/rest/v0/camera/%s/snapshot', protocol, opts.stream.host, opts.stream.port, this.guid),
        headers: {
            'Content-Type': 'multipart/x-mixed-replace; boundary=myboundary',
            'Cache-Control': 'no-cache',
            'Connection': 'close',
            'Pragma': 'no-cache',
            'X-Ollo-Token': this.app.token
        }
    };

    if (this.periodical) {
        this.periodical.stop();
    }

    var periodical = this.periodical = new Periodical({
        freq: 0.1,
        handler: function (stream) {
            fs.readFile(previewFile, function (err, data) {
                stream.push("--myboundary\r\n");
                stream.push("Content-Type: image/jpeg\r\n");
                stream.push("Content-Length: " + data.length + "\r\n");
                stream.push("\r\n");
                stream.push(data, 'binary');
                stream.push("\r\n");
            });
        }
    });

    var post = request.post(postOptions, function callback(err, httpResponse, body) {
        if (err) {
            return log.error('Upload failed:', err);
        }
        if (body == 'Unauthorized') {
            return log.error('Upload failed:', body);
        }
        log.debug('Upload End!');
    });

    periodical.pipe(post);

//    var timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
//    fs.readFile(this.previewFile, function (err, data) {
//        var post = request.post(options, function callback(err, httpResponse, body) {
//            if (err) {
//                return log.error('Upload failed:', err);
//            }
//            if (body == 'Unauthorized') {
//                return log.error('Upload failed:', body);
//            }
//            log.debug('Snapshot upload successful [%s]', timestamp);
//        });
//
//        streamifier.createReadStream(data).pipe(post);
////        gm(data)
////            .font('ArialBold')
////            .fontSize(18)
////            .fill("#fff")
////            .gravity('SouthEast')
////            .drawText(10, 10,timestamp)
////            .stream('jpg')
////            .pipe(post);
//    });

};

Cam.prototype.stop = function stop() {
    if (this.intervalid) {
        clearInterval(this.intervalid);
        this.intervalid = null;
    }
};

Cam.prototype.heartbeat = function heartbeat(bool) {

    clearInterval(this.interval);

    if (!!bool) {

        var
            self = this
            , ival = this.opts.interval || 10000
            ;
        this.log.debug(
            "Setting data interval to %s"
            , Math.round(ival / 1000)
        );

        this.emit('data', '1');
        this.interval = setInterval(function () {

            self.emit('data', '1');

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

