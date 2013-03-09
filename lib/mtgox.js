var util = require('util');
var https = require('https');
var request = require('request');
var qs = require('querystring');
var _ = require('underscore');
var debug = require('debug')('mtgox');
var crypto = require('crypto');
var fs = require('fs');
var events = require('events');
var io = require('socket.io-client');
var Nonce = require('nonce')();

var MTGOX_SOCKET_URL = 'https://socketio.mtgox.com/mtgox';
var MTGOX_HTTPS_URL = 'https://mtgox.com/api';
var MTGOX_CHANNELS = [];
var CURRENCY = 'USD';
var configFilename = 'mtgoxconfig.json';

try {
  var config = JSON.parse(fs.readFileSync(__dirname + '/' + configFilename));
  if (Array.isArray(config.channels)) {
    MTGOX_CHANNELS = config.channels;
  }
  var currency = config ? config.currency : false;
  if (currency) {
    CURRENCY = currency;
    if (currency != 'USD') {
      MTGOX_SOCKET_URL += '?Currency=' + currency;
    }
  }
}
catch(ex) {
  util.debug(util.inspect(ex));
  util.debug('Failed to parse %1. No channels available.', configFilename);
}

var mylogger = require('./mylogger'),
  Log = new mylogger();


var getChannel = function(key, currency) {
  currency = currency || CURRENCY;

  return MTGOX_CHANNELS.filter(function(channel) {
    var channelCurrency = channel.currency || CURRENCY;
    return ((channel.key == key || channel.private == key) && channelCurrency == currency);
  })[0];
};


var MtGoxClient = function(options) {
  events.EventEmitter.call(this);
  var self = this;
  var apiKey = options.apiKey.split('-').join(''),
    apiKeyBuf = new Buffer(apiKey, 'hex'),
    secret = options.secret;

  Log.debug('secret = ', secret);

  Log.info('try to connect to ', MTGOX_SOCKET_URL);
  var socket = io.connect(MTGOX_SOCKET_URL);


  socket.on('result', function(data) {
    // Emit raw data
    Log.debug('result', data);
  });


  socket.on('message', function(data) {
    // Emit raw data
    self.emit('data', data);

    if (data.op == 'subscribe') {
      self.emit('subscribe', data);
    } else

    if (data.op == 'unsubscribe') {
      self.emit('unsubscribe', data);
    } else

    if (data.op == 'private') {
      if (data.trade) {
//        Log.debug('private', data.trade);
      }

      self.emit(data.private, data);
    } else {
//      Log.debug('other message', data);
      self.emit('message', data);
    }
    Log.debug('message', data);
  });

  socket.on('error', function(error) {
    util.debug(error);
    self.emit('error', new Error(error));
  });

  socket.on('connect', function() {
    self.emit('connect');
  });

  socket.on('disconnect', function() {
    self.emit('disconnect');
  });

  self.subscribe = function(channel) {
    var message = {
      "op": "subscribe",
      "channel": channel
    };
    socket.send(JSON.stringify(message));
  };

  self.unsubscribe = function(channel) {
    var message = {
      "op": "unsubscribe",
      "channel": channel
    };
    socket.send(JSON.stringify(message));
  };

  /**
   * Query via socket.io (not works?)
   *
   * @param path
   * @param payload
   * @param cb
   */
  self.queryApi = function(path, payload, cb) {

    if (arguments.length === 2) {
      cb = payload;
      payload = {};
    }
    payload = payload || {};

    var nonce = String(Nonce());
    var md5 = crypto.createHash('md5');
    md5.update(nonce);
    var requestId = md5.digest('hex');

    Log.debug('requestId = ', requestId);
    var query = {
        "id":requestId,
        "call":path,
        "nonce":nonce
      },
      queryBuf = new Buffer(JSON.stringify(query));

    Log.debug('query = ', query);
    Log.debug('queryBuf = ', queryBuf);

    var secretBuf = new Buffer(secret, 'base64');
    var hmac = crypto.createHmac('sha512', secretBuf);

    hmac.update(queryBuf);
    var digest = new Buffer(hmac.digest('base64'));
    debug('digest = ',digest);

    var uncoded = Buffer.concat([apiKeyBuf, digest, queryBuf]);

    Log.debug('uncoded', uncoded);

    var coded = uncoded.toString('base64');

    var command = {
      op: 'call',
      id: requestId,
      call: coded,
      context: 'mtgox.com'
    };
    Log.debug(command);

    socket.send(JSON.stringify(command));
  };

  /**
   * Query via https
   *
   *
   * @param path
   * @param payload
   * @param cb
   */
  self.queryHttps = function(path, payload, cb) {
    var port = 443;
    if (arguments.length === 2) {
      cb = payload;
      payload = {};
    }

    payload.nonce = Nonce();
    Log.debug(payload);

    var post = qs.stringify(payload);

    var hmac = crypto.createHmac('sha512', new Buffer(secret, 'base64'));
    hmac.update(post);
    var restSign = hmac.digest('base64');
//    Log.debug('restSign => ', restSign);
    var r = {
      url: MTGOX_HTTPS_URL + '/' + path,
      json: true,
      method: 'POST',
      body: post,
      headers: {
        'Rest-Key': options.apiKey,
        'Rest-Sign': restSign,
        'User-Agent': 'Mozilla/4.0 (compatible; MtGox node.js client)',
        'Content-type': 'application/x-www-form-urlencoded'
      }
    };

    Log.debug(r);
    Log.debug('about to execute AJAX to ', r.url, ', params ->', payload);
    request(r, function(err, res, body) {
      Log.debug('body => ', body);
      if (err) {
        return cb(err);
      }
      if (!body) {
        return cb(new Error('failed to parse body'));
      }
      if (body.error) {
        return cb(new Error(body.error));
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return cb(new Error('status code ' + res.statusCode));
      }

      return cb(null, body['return']);
    });
  };


  self.close = function(timeout) {
  };

  // Allow access to underlying socket
  self.socket = socket;
};

util.inherits(MtGoxClient, events.EventEmitter);

exports.MtGoxClient = MtGoxClient;
exports.CHANNELS = MTGOX_CHANNELS;
exports.URL = MTGOX_SOCKET_URL;
exports.getChannel = getChannel;

exports.connect = function(options) {
  return new MtGoxClient(options);
};
