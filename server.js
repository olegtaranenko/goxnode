var express = require('express');
var debug = require('debug')('server');
var path = require("path");
var http = require('http');
var app = express();
var pub_dir = path.join(__dirname, 'public'),
  less_dir = path.join(pub_dir, 'less'),
  css_dir = pub_dir;

// web server
var server = http.createServer(app);
var fs = require('fs');

//setup my own implementation of the logger instead of used in socket.io
var mylogger = require('./lib/mylogger'),
  Log = new mylogger();

var configFile = __dirname + '/config.json',
  config = require(configFile),
  apiKey = config.security.apiKey,
  secret = config.security.secret;

// library from mtgox-socket-client
var mtgox = require('./lib/mtgox');
var clientMtgox = mtgox.connect({
  apiKey: apiKey,
  secret: secret
});

var privateInfo = '1/generic/private/info';
clientMtgox.queryHttps(privateInfo, function(err, result) {
  if (err) {
    Log.error('Error by call to ', privateInfo, 'error => ', err);
    return;
  }
  Log.debug('Call ', privateInfo, 'result => ', JSON.stringify(result));
});



clientMtgox.on('connect', function() {
  Log.info('Connected to MtGox via socket.io!');

  this.unsubscribe('dbf1dee9-4f2e-4a08-8cb7-748919a71b21');
  this.unsubscribe('d5f06780-30a8-4a48-a2f8-7ed181b4a13f');
  this.unsubscribe('24e67e0d-1cad-4cc0-9e7a-f8523ef460fe');

  var idKey // = 'WF4/5QWMQSiNQWW/s5aGHwAAAABRPNyD2yAdDjGh8/dSUabAZ1GKQCcgRbzWqNGTsSmxukGwwFo';
  this.subscribePrivateChannel(idKey);

//  this.queryApi('private/info');

// load configuration for the web server instance
// i.e. current user, default currency etc
  var dataJsonName = __dirname + '/api/v0/depth/fulldepth.json';
  try {
    var fullDepth = JSON.parse(fs.readFileSync(dataJsonName));
    Log.info('Full Depth is loaded');
  } catch(ex) {
    Log.error('Error by parsing Depth: ', ex);
  }

});


// on-fly preprocessor for less/css bowels
var lessMiddleware = require('less-middleware');

// run node web-server
server.listen(8000);
debug('server started at port', server.port );

// configure express
app.configure(function() {
  app.use(lessMiddleware({
    src: less_dir,
    dest: css_dir,
    prefix: 'css',
    compress: false,
    debug: false
  }));

  app.use('/client.json', function(req, res) {
    fs.readFile('./client.json', function(err, data) {
      if (!err) {
        res.write(data);
        res.end();
      }
    });
  });
  app.use(express.static(pub_dir));
});


// create connection via socket.io layer
var io = require('socket.io').listen(server, {
  logger: new mylogger,
  'Log level': 3
});


//io.set('Log level', 4);
//io.set('heartbeat interval', 120);
//io.set('heartbeat timeout', 240);
//io.set('close timeout', 240);


// additional configuration after connecting via socket.io channel
// may send sensitive data, such credentials, etc.
io.sockets.on('connection', function (socket) {
  socket.emit('config', {
    config: config
  });
});
