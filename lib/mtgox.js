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
var Bidder = require('./bidder');


var MTGOX_SOCKET_URL = 'https://socketio.mtgox.com/mtgox';
var MTGOX_HTTPS_URL = 'https://data.mtgox.com/api';
var MTGOX_CHANNELS = [];
var CURRENCY = 'USD';

try {
  var configFilename = 'mtgoxconfig.json',
    config = require(__dirname + '/' + configFilename);

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

  var lastPrivateChannel = options.lastPrivateChannel;
  var lastTicker = {buy: 0, sell: 0};
  events.EventEmitter.call(this);

  var self = this;
  var apiKey = options.apiKey,
    apiKeyHex = apiKey.split('-').join(''),
    apiKeyBuf = new Buffer(apiKeyHex, 'hex'),
    secret = options.secret;

  Log.info('try to connect to ', MTGOX_SOCKET_URL);
  var socket = io.connect(MTGOX_SOCKET_URL);


  socket.on('result', function(data) {
    // Emit raw data
    Log.debug('result', data);
  });


  function checkForPrivateChannel(data) {
    var checkChannel = data.channel;

    if (lastPrivateChannel.waiting) {
      lastPrivateChannel.waiting = false;
      lastPrivateChannel.subscribed = true;
      lastPrivateChannel.guid = checkChannel;
    }
  }

  socket.on('message', function(data) {

    // Emit raw data
//    self.emit('data', data);

    if (data.op == 'subscribe') {
      Log.info('subscribe', data);
      checkForPrivateChannel(data);
      self.emit('subscribe', data);
    } else if (data.op == 'unsubscribe') {
      Log.debug('unsubscribe', data);
      self.emit('unsubscribe', data);
    } else if (data.op == 'private') {

      var dataPrivate = data.private;
      if (dataPrivate == 'ticker') {
        var ticker = data.ticker;

        lastTicker = {
          buy: ticker.buy.value_int,
          sell: ticker.sell.value_int
        };

        processBidders(ticker);
      }
      if (dataPrivate != 'ticker' && dataPrivate != 'user_order' && dataPrivate != 'wallet') {
        Log.debug('private', data);
      }

      var bidder = relatedToBidder(data);
      if (!bidder) {
        self.emit(dataPrivate, data);
      } else {
        var picked = _.pick(bidder, 'bidderId', 'oid', 'price_int', 'op', 'amount_int');

        self.emit('user_bidder', _.extend({}, picked));
      }
    } else {
      Log.debug('other message', data);
      self.emit('message', data);
    }


    function relatedToBidder(data) {
      var channel = data.channel,
        privateData = data.private,
        isUserOrder = privateData == 'user_order',
        user_order = (isUserOrder && data.user_order) ? data.user_order : false,
        oid = user_order ? user_order.oid : null,
        related = false;

      if (user_order) {
        _.each(autoBidders, function(bidder) {
          var orderId = bidder.getCurrentOid(),
            bidderId = bidder.getBidderId();

          if (oid == orderId || bidderId == oid) {
            var status = user_order.status,
              cancellingOid = bidder.cancellingOid;

            bidder.op = 'mute';
            if (status == 'open' ) {
              var amount = user_order.effective_amount,
                amount_int = amount.value_int;

              bidder.op = 'update';
              bidder.amount_int = amount_int;
            } else if (status === undefined && orderId == oid && cancellingOid === undefined) {
              bidder.inactive(true);
              bidder.op = 'executed';
            }

            related = bidder;
          }
        })
      }
      return related;
    }

    function processBidders(buy, sell) {
      var len = autoBidders.length,
        toRemove = [];

      if (len) {
        if (buy && buy.buy) {
          // ticker
          sell = buy.sell;
          buy = buy.buy;
        }

        for (var index = 0; index < len; index++) {
          var bidder = autoBidders[index],
            inactive = bidder.inactive();

          if (!inactive) {
            bidder.process(buy, sell);
          } else {
            toRemove.push(bidder);
          }
        }

        for (var i = 0; i < toRemove.length ; i++) {
          bidder = toRemove[i];
          bidder.cleanup();
          var rmIndex = autoBidders.indexOf(bidder);
          autoBidders.splice(rmIndex, 1);
        }
      }
    }
  });

  socket.on('error', function(error) {
    util.debug(error);
    Log.error(error);
//    self.emit('error', new Error(error));
  });

  socket.on('connect', function() {
    self.emit('connect');
  });

  socket.on('disconnect', function() {
    self.emit('disconnect');
  });

  self.subscribe = function(channel, op) {
    op = op || 'subscribe';
    var message = {
      "op": op,
      "channel": channel
    };
    socket.send(JSON.stringify(message));
  };

  self.subscribePrivate = function(idKey) {
    var message = {
      "op": "mtgox.subscribe",
      "key": idKey
    };
    lastPrivateChannel.started = new Date();
    lastPrivateChannel.waiting = true;
    socket.send(JSON.stringify(message));
  };

  self.unsubscribe = function(channel, op) {
    op = op || 'unsubscribe';
    var message = {
      "op": op,
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

//    Log.debug('requestId = ', requestId);
    var query = {
        "id":requestId,
        "call":path,
        "nonce":nonce
      },
      queryBuf = new Buffer(JSON.stringify(query));

//    Log.debug('query = ', query);
//    Log.debug('queryBuf = ', queryBuf);

    var secretBuf = new Buffer(secret, 'base64');
    var hmac = crypto.createHmac('sha512', secretBuf);

    hmac.update(queryBuf);
    var digest = new Buffer(hmac.digest('base64'));
//    debug('digest = ',digest);

    var uncoded = Buffer.concat([apiKeyBuf, digest, queryBuf]);

//    Log.debug('uncoded', uncoded);

    var coded = uncoded.toString('base64');

    var command = {
      op: 'call',
      id: requestId,
      call: coded,
      context: 'mtgox.com'
    };
//    Log.debug(command);

    socket.send(JSON.stringify(command));
  };


  /**
   * get open orders list
   */
  self.openOrders = function() {
      var path = '1/generic/private/orders';
      this.queryHttps(path, function(err, result) {
        if (err) {
          Log.error('Error by call to ', path, 'error => ', err);
          return;
        }
        Log.debug('Call ', path, 'result => ', result, '============>\n',
          JSON.stringify(result));

      });
  };



  /**
   * Query via https
   *
   *
   * @param options
   */
  self.queryHttps = function(options) {

    const MTGOX_API_VERSION = '1',
      port = 443;

    var payload = options.payload || {},
      cb = options.cb || function(){},
      version = options.version || MTGOX_API_VERSION,
      command = options.command,
      path;

//    Log.debug('queryHttps() options ->', options);
    if (command) {
      path = getCommandPath(command, version);
    } else {
      path = options.path;
    }

    if (!path) {
      const err = 'wrong Https call, path is undefined';
      Log.error (err);
      throw new Error(err);
    }

    payload.nonce = Nonce();
    var post = qs.stringify(payload);

    var hmac = crypto.createHmac('sha512', new Buffer(secret, 'base64'));
    hmac.update(post);
    var restSign = hmac.digest('base64');

//    Log.debug('restSign => ', restSign, 'apiKey => ', apiKey);
    var url = MTGOX_HTTPS_URL + '/' + version+ '/' + path;
    if (version == '2') {
      url += '\0';
    }
    var r = {
      url: url,
      json: true,
      method: 'POST',
      body: post,
      headers: {
        'Rest-Key': apiKey,
        'Rest-Sign': restSign,
        'User-Agent': 'Mozilla/4.0 (compatible; MtGox node.js client)',
        'Content-type': 'application/x-www-form-urlencoded'
      }
    };

    Log.debug('about to execute AJAX to', r.url);

    request(r, function(err, res, body) {
//      Log.debug('body => ', body);
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

      var ret;
      if (MTGOX_API_VERSION == '1') {
        ret = body.return;
      } else if (MTGOX_API_VERSION == '2') {
        ret = body.data;
      }
      return cb(null, ret);
    });


    function getCommandPath(command, version) {
      const commands = {
        '1': {
          "ticker": 'BTCUSD/ticker',
          "info": 'generic/private/info',
          "orders": 'generic/private/orders',
          "idkey": 'generic/private/idkey',
          "cancel": 'BTCUSD/private/order/cancel',
          "add": 'BTCUSD/private/order/add'
        },
        '2': {
          "ticker": 'BTCUSD/money/ticker',
          "privateInfo": 'money/info',
          "ordersPath": 'money/orders',
          "idkey": 'money/idkey',
          "cancel": 'BTCUSD/money/order/cancel',
          "add": 'BTCUSD/money/order/add'
        }
      };

      var ret = commands[version][command];
      if (ret) {
        return ret;
      }
      Log.error('check code, wrong command/version', command, version);
      return null;
    }
  };



  /************************************************************************************
   *                                AUTO BIDDERS PART                                 *
   ************************************************************************************/
  var autoBidders = [];

  function findBidder(id) {
    for (var i = 0; i < autoBidders.length; i++) {
      var bidder = autoBidders[i];
      if (bidder.bidderId == id) {
        return bidder;
      }
    }
    return null;
  }

  self.startBidding = function(options) {
    var bidder = new Bidder(self, options),
      ticker = options.ticker,
      // TODO multicurrency
      buy = ticker.buy * 1E5,
      sell = ticker.sell * 1E5;

    bidder.process(buy, sell);

    autoBidders.push(bidder);
  };

  self.holdBidding = function(options) {
    var bidderId = options.bidderId,
      hold = options.hold;

    var bidder = findBidder(bidderId);
    if (bidder) {
      bidder.hold(hold);
      if (hold) {
        Log.debug('in holdBidding() LastTicker = ', lastTicker);
        bidder.process(lastTicker);
      }
    }
  };
  self.stopBidding = function(options) {
    var bidderId = options.bidderId,
      orderId = options.orderId;

    var bidder = findBidder(bidderId);
    var data = {
      user_order: {
        oid: bidderId
      }
    };

    if (bidder) {
      var bidderIndex = autoBidders.indexOf(bidder);

      bidder.stop(function() {
        self.emit('user_order', data);
      });
    } else if (orderId) {
      self.queryHttps({
        command: 'cancel',
        payload: {
          oid: orderId
        },
        cb: function(err) {
          if (err) {
            Log.error('Error by call to "cancel", error => ', err);
            return;
          }
          self.emit('user_order', data);
        }
      })
    }
  };

  self.getBidders = function() {
    return autoBidders;
  };

  /**********************************************************/




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

