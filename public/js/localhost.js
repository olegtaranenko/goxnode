/**
 * The file is a part of project Successful Search (successful-search.com)
 * (c) 2013 Oleg Taranenko all rights reserved
 * mailto:olegtaranenko@gmail.com
 *
 * Created at: 02.03.13 18:37
 */

define(['socket.io', 'config'],
  function(io, config) {
  var socket = io.connect($.Goxnode().socketio.config.node.url);



  function onConnect() {
    console.log('onConnect() ', arguments);
  }

  function onDisconnect() {
    console.log('onDisconnect() ', arguments);
  }

  function onError() {
    console.log('onError() ', arguments);
  }

  function onMessage() {

    console.log('onMessage() ', arguments);
  }

  function onConfig() {
    console.log('onConfig() ', arguments);
  }

  socket.on('connect',    onConnect);
  socket.on('disconnect', onDisconnect);
  socket.on('error',      onError);
  socket.on('message',    onMessage);
  socket.on('config',     onConfig);

  return socket;
});
