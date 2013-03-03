var util = require('util');
var fs = require('fs');
var events = require('events');
var io = require('socket.io-client');

var MTGOX_SOCKET_URL = 'https://socketio.mtgox.com/mtgox';
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


var MtGoxClient = function() {
  events.EventEmitter.call(this);
  var self = this;
  Log.info('try to connect to ', MTGOX_SOCKET_URL);
  var socket = io.connect(MTGOX_SOCKET_URL);

  socket.on('message', function(data) {
    // Emit raw data
    self.emit('data', data);

      if (data.op == 'subscribe') {
        Log.debug('subscribe', data);
        self.emit('subscribe', data);
      } else

      if (data.op == 'unsubscribe') {
        Log.debug('unsubscribe', data);
        self.emit('unsubscribe', data);
      } else

      if (data.op == 'private') {
        if (data.trade) {
//          Log.debug('private', data.trade);
        }

        self.emit(data.private, data);
      } else {
        Log.debug('other message', data);
        self.emit('message', data);
      }
  });

  socket.on('error', function(error) {
    util.debug(error);
    self.emit('error', error);
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

exports.connect = function() {
  return new MtGoxClient();
};
