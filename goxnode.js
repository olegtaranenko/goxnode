var express = require('express');
var debug = require('debug')('server');
var path = require("path");
var http = require('http');
var app = express();
var pub_dir = path.join(__dirname, 'public'),
  less_dir = path.join(pub_dir, 'less'),
  css_dir = pub_dir;

var sqlite3 = require('sqlite3').verbose();
//var goxdb = require('./goxdb');


// web server
var server = http.createServer(app);
var fs = require('fs');

//setup my own implementation of the logger instead of used in socket.io
var mylogger = require('./lib/mylogger'),
  Log = new mylogger();

// create connection via socket.io layer
var io = require('socket.io').listen(server, {
  logger: new mylogger,
  'Log level': 3
});


var clientJson = __dirname + '/client.json',
  client = require(clientJson),
  localPort = client.node.port,
  localServer = client.node.server,
  url = localServer + ":" + localPort,
  apiKey = client.security.apiKey,
  secret = client.security.secret;

client.url = url;

var lastPrivateChannel = {
  started: null, // date
  updated: null, // date
  guid: null,
  subscribed: false
};


// library from mtgox-socket-client
var mtgox = require('./lib/mtgox');
var clientMtgox = mtgox.connect({
  lastPrivateChannel: lastPrivateChannel,
  apiKey: apiKey,
  secret: secret
});


clientMtgox.on('connect', function() {
  Log.info('Connected to MtGox via socket.io!');

  // this point to the mtgox lib
  this.unsubscribe('dbf1dee9-4f2e-4a08-8cb7-748919a71b21');   // trade
//  this.subscribe('d5f06780-30a8-4a48-a2f8-7ed181b4a13f'); // ticker
  this.unsubscribe('24e67e0d-1cad-4cc0-9e7a-f8523ef460fe');   // depth

  lastPrivateChannel.subscribed = false;

  subscribePrivateChannel(lastPrivateChannel);


// load configuration for the web server instance
// i.e. current user, default currency etc
/*
  var dataJsonName = __dirname + '/api/v0/depth/fulldepth.json';
  try {
    var fullDepth = JSON.parse(fs.readFileSync(dataJsonName));
    Log.info('Full Depth is loaded');
  } catch(ex) {
    Log.error('Error by parsing Depth: ', ex);
  }
*/

});

var lastTicker = {
  buy: 0,
  sell: 0
};

// Subscription to ticker channel
clientMtgox.on('ticker', function(data) {
  // avoid repeat of the same data
  var ticker = data.ticker;
  if (isChangedFuzzy()) {
    io.sockets.emit('ticker', lastTicker);
  }

  function isChangedFuzzy() {
    var ret = false;
    ['buy', 'sell'].forEach(function(term) {
      var lastValue = lastTicker[term],
        value = ticker[term].value;

      ret = lastValue != value;
//      if (Math.round(Math.abs(lastValue - value) * 100) / 100 > 0.01) {
//        ret = true;
//      }
      lastTicker[term] = value;
    }, this);
    return ret;
  }
});


// All changes with User's order book
clientMtgox.on('user_order', function(data) {
  // avoid repeat of the same data
  var user_order = data.user_order,
    status = user_order.status,
    oid = user_order.oid,
    channel = data.channel;

  if (status == null) {
    io.sockets.emit('order_cancel', oid);
  } else {
    io.sockets.emit('user_order', user_order);
  }
});

// All changes with User's Wallet
clientMtgox.on('wallet', function(data) {
  // avoid repeat of the same data
  var wallet = data.wallet;

  io.sockets.emit('wallet', wallet);
});


clientMtgox.on('user_bidder', function(data) {
  io.sockets.emit('user_bidder', data);
});


// on-fly preprocessor for less/css bowels
var lessMiddleware = require('less-middleware');

// run node web-server
server.listen(localPort);
Log.info('server started at port', localPort );

// configure express
app.configure(function() {
  app.use(lessMiddleware({
    src: less_dir,
    dest: css_dir,
    prefix: 'css',
    compress: false,
    debug: false
  }));

  app.get('/js/settings.js', function(req, res) {
    delete client.security;

    res.send('define([], function() { return ' + JSON.stringify(client) + '})');
  });

  app.use(express.static(pub_dir));
});


//io.set('Log level', 4);
//io.set('heartbeat interval', 120);
//io.set('heartbeat timeout', 240);
//io.set('close timeout', 240);



// additional configuration after connecting via socket.io channel
// may send sensitive data, such credentials, etc.
io.sockets.on('connection', function (socket) {
//  var clients = io.sockets.clients();
//  Log.debug('All clients => ', clients);
  if (!socket.customData) {
    socket.customData = {};
  } else {
    Log.debug('socket.customData => ', socket.customData);
  }

  socket.on('cancelOrder', function(oid) {
    Log.debug('cancelOrder', oid);
    clientMtgox.queryHttps({
      command: 'cancel',
      payload: {
        oid: oid
      },
      cb: function (err) {
        if (err) {
          Log.error('Error by call to "cancel", error => ', err, oid);
          return;
        }
        Log.info('Order deleted ', oid);
      }
    })
  });



  socket.on('massOrderCancel', function(orderIdArray) {
    Log.info('massOrderCancel', orderIdArray);
    cancelOrder(orderIdArray);

    function cancelOrder() {
      if (orderIdArray.length > 0) {
        var oid = orderIdArray.splice(0, 1);
        clientMtgox.queryHttps({
          command: 'cancel',
          payload: {
            oid: oid
          },
          cb: function (err) {
            if (err) {
              Log.error('Error in Mass Cancel, error => ', err, oid);
            }
            Log.info('Order deleted ', oid);
            cancelOrder();
          }
        })
      }
    }
  });


  socket.on('createBidder', function(params){
    params.ticker = lastTicker;
    Log.debug('createBidder function ->', params);
    clientMtgox.startBidding(params, function() {
      Log.debug('createBidder function ->', arguments)
    });
  });

  socket.on('stopBidder', function(params){
    Log.debug('stopBidder function ->', params);
    clientMtgox.stopBidding(params);
  });

  socket.on('holdBidder', function(params){
    Log.debug('holdBidder function ->', params);
    clientMtgox.holdBidding(params);
  });


  socket.on('createOrder', function(params) {
    Log.debug('createOrder, old oid ->', params.oid);
    var oldOid = params.oid,
      phantom = params.phantom,
      command = 'cancel';

    delete params.phantom;
    if (!phantom) {
      clientMtgox.queryHttps({
        command: command,
        payload: {
          oid: oldOid
        },
        cb: function (err) {
          if (err) {
            Log.error('Error by call to "cancel", error => ', err);
            return;
          }
          add();
        }
      })
    } else {
      add();
    }

    function add() {
      delete params.oid;
      clientMtgox.queryHttps({
        command: 'add',
        payload: params,
        cb: function (err, oid) {
          if (err) {
            Log.error('Error by call to "add", error => ', err);
            return;
          }
          var orderConfig = {
            oid: oid,
            oldOid: oldOid,
            status: 'preliminary'
          };
          Log.debug('Order added, ', oid);
          socket.emit('user_order', orderConfig);
        }
      })
    }
  });
  executeClosure(socket, [putBidders, retrievePrivateInfo, retrieveOpenOrders, setLastTicker], this, {});
});


////////////////// Closure functions //////////////////////

function subscribePrivateChannel(last) {
  var subscribed = last.subscribed;

  if (!subscribed) {
    var args = arguments;
    var command = 'idkey';
    clientMtgox.queryHttps({
      command: command,
      cb: function (err, result) {
        if (err) {
          Log.error('Error by call to "', command, '", error => ', err);
          return;
        }
        Log.info('Got new idKey => ', result);
        clientMtgox.subscribePrivate(result);
      }
    });
  }
}


function executeClosure(socket, funcs, scope, options) {
  if (funcs instanceof Array && funcs.length) {
    var cb = funcs.splice(0, 1)[0];
    cb.apply(scope||this, arguments);
  }
}

function putBidders(socket, cb, scope, options) {
  var bidders = clientMtgox.getBidders();
  socket.emit('bidders', bidders);
  executeClosure.apply(scope|| this, arguments);
}

function retrievePrivateInfo(socket, cb, scope, options) {
  var args = arguments;
  var command = 'info';
  clientMtgox.queryHttps({
    command: command,
    cb: function (err, result) {
      if (err) {
        Log.error('Error by call to "', command, '", error => ', err);
        return;
      }

      socket.emit('privateinfo', result);
      executeClosure.apply(scope|| this, args);
    }
  });
}


function retrieveOpenOrders(socket, cb, scope, options) {
  var args = arguments;
  var command = 'orders';
  clientMtgox.queryHttps({
    command: command,
      cb: function (err, orders) {
        if (err) {
          Log.error('Error by call to "', command, '", error => ', err);
          return;
        }
        socket.emit('ordersinfo', orders);
        executeClosure.apply(scope || this, args);
      }
    });
}


function retrieveLastTicker(socket, cb, scope, options) {
  var args = arguments;
  var command = 'ticker';
  clientMtgox.queryHttps({
    command: command,
    cb: function (err, ticker) {
      if (err) {
        Log.error('Error by call to "', command, '", error => ', err);
        return;
      }
      lastTicker = {
        buy: 0,
        sell: 0
      };
//    Log.info('Open Orders  => ', orders, '\n', JSON.stringify(orders));
      socket.emit('ticker', ticker);
      executeClosure.apply(scope || this, args);
    }
  });
}

function setLastTicker(socket, cb, scope, options) {
  var args = arguments;

  socket.emit('ticker', lastTicker);
  executeClosure.apply(scope || this, args);
}
