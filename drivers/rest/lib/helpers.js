var request = require('request');

exports.fetchDeviceData = function (ninja, guid, cb) {

  var proto = (ninja.opts.api.secure) ? 'https://' : 'http://';
  var uri = proto + ninja.opts.api.host + ':' + ninja.opts.api.port + '/rest/v0/device/' + guid;
  var opts = {
    url: uri,
    headers: {
      'X-Ollo-Token': ninja.token
    },
    method: 'GET',
    json: true
  };

  request(opts, function (err, res, body) {
    if (body && body.result === 1) {
      cb(null, body.data)
    } else {
      cb(body && body.error || "REST: Unknown Error")
    }
  });
};

exports.allowCORS = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', req.header('Origin') || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Accept, Content-Type, Authorization, Content-Length, X-Requested-With, X-Ninja-Token, X-Ollo-Token');

  // intercept OPTIONS method
  if ('OPTIONS' === req.method) {
    res.send(200);
  } else {
    next();
  }
};