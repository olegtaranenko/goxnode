var express = require('express');
var path = require("path");
var http = require('http');
var app = express();
var pub_dir = path.join(__dirname, 'public');
var server = http.createServer(app);
var mtgox = require('./libs/mtgox');
var client = null; // connect later after loading depth from clarkmoody
//var client = mtgox.connect();

// load clarkmoody data local;
var util = require('util');
var fs = require('fs');
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



server.listen(8000);

app.configure(function() {
  app.use('/api/v0', function() {
    debugger;
  });
  app.use(express.static(pub_dir));
});

var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});