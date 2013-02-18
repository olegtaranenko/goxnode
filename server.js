var express = require('express');
var path = require("path");
var http = require('http');
var app = express();
var pub_dir = path.join(__dirname, 'client');
var server = http.createServer(app);

server.listen(8000);

app.configure(function() {
	app.use(express.static(pub_dir));
});

var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
	socket.emit('news', { hello: 'world' });
	socket.on('my other event', function (data) {
		console.log(data);
	});
});