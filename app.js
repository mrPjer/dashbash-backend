var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');
var game = require('./game');

app.listen(3000);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

var connectedUsers = [];
var connections = 0;


io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
  socket.on('connected', function (data) {
    connections++;
    console.log(connections);
  });
  socket.on('disconnect', function () {
    connections--;
    console.log(connections);
  });
});





