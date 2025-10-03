const express = require('express');
const app = express();

const { createServer } = require('node:http');
const { Server } = require('socket.io');

const server = createServer(app);
const io = new Server(server);

process.on('SIGINT', function() { process.exit(); });

app.use(express.static(__dirname + "/static"));

server.listen(3000);

var connectedUsers = [];
var connections = 0;


// io.on('connection', function (socket) {
//   socket.emit('news', { hello: 'world' });
//   socket.on('my other event', function (data) {
//     console.log(data);
//   });
//   socket.on('connected', function (data) {
//     connections++;
//     console.log(connections);
//   });
//   socket.on('disconnect', function () {
//     connections--;
//     console.log(connections);
//   });
// });

var game = require('./game')(io);
