var express = require('express');
var path = require("path");
var http = require('http');
var app = express();
var pub_dir = path.join(__dirname, 'public'),
  less_dir = path.join(pub_dir, 'less'),
  css_dir = pub_dir;

// web server
var server = http.createServer(app);

// library from mtgox-socket-client
var mtgox = require('./lib/mtgox');
var client = null; // connect later after loading depth from clarkmoody
//var client = mtgox.connect();

// load clarkmoody data local;
var util = require('util');
var fs = require('fs');


// load configuration for the web server instance
// i.e. current user, default currency etc
/*
var dataJsonName = __dirname + '/api/v0/depth/USD.json';
try {
  var config = JSON.parse(fs.readFile(dataJsonName, function() {

  }));
}
catch(ex) {
  util.debug(util.inspect(ex));
  util.debug('Failed to parse %1. No channels available.', dataJsonName);
}

*/


try {
  var config = JSON.parse(fs.readFileSync(__dirname + '/config.json'));
}
catch(ex) {
  util.debug(util.inspect(ex));
  util.debug('Failed to parse config.json. No channels available.');
}

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

  app.use(express.static(pub_dir));
});


//setup my own implementation of the logger instead of used in socket.io
var mylogger = require('./lib/mylogger');

// create websocket server
var io = require('socket.io').listen(server, {
  logger: new mylogger,
  'log level': 3
});


//io.set('log level', 4);
//io.set('heartbeat interval', 120);
//io.set('heartbeat timeout', 240);
//io.set('close timeout', 240);


// execute 'autoexec.bat' for connected browser
io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
