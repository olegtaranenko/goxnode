var express = require('express');
//var crypto = require('crypto');
var path = require("path");
"request": "2.11.4",
var http = require('http');
var app = express();
var pub_dir = path.join(__dirname, 'public'),
  less_dir = path.join(pub_dir, 'less'),
  css_dir = pub_dir;

// web server
var server = http.createServer(app);

var util = require('util');
var fs = require('fs');
//setup my own implementation of the logger instead of used in socket.io
var mylogger = require('./lib/mylogger'),
  Log = new mylogger();


try {
  var configFile = __dirname + '/config.json';
  var configText = fs.readFileSync(configFile).toString();
  var config = JSON.parse(configText);
  var apiKey = config.security.apiKey;
  var secret = config.security.secret;
}
catch(ex) {
  util.debug(util.inspect(ex));
  util.debug('Failed to parse config.json. No channels available.');
}



// library from mtgox-socket-client
var mtgox = require('./lib/mtgox');
var clientMtgox = mtgox.connect({
  apiKey: apiKey,
  secret: secret
});


clientMtgox.on('connect', function() {
  Log.info('Connected to MtGox!');

  this.unsubscribe('dbf1dee9-4f2e-4a08-8cb7-748919a71b21');
  this.unsubscribe('d5f06780-30a8-4a48-a2f8-7ed181b4a13f');
  this.unsubscribe('24e67e0d-1cad-4cc0-9e7a-f8523ef460fe');
  this.phpCall();
//  this.queryApi('private\/info');

// load configuration for the web server instance
// i.e. current user, default currency etc
  var dataJsonName = __dirname + '/api/v0/depth/fulldepth.json';
  try {
    var fullDepth = JSON.parse(fs.readFileSync(dataJsonName));

    Log.info('Full Depth is loaded');
  }
  catch(ex) {
    Log.error(util.inspect(ex));
  }

});




// on-fly preprocessor for less/css bowels
var lessMiddleware = require('less-middleware');

// run node web-server
server.listen(8000);


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
