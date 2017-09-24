var path = require('path');
var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080;
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var uuid = require('uuid/v1');
// using webpack-dev-server and middleware in development environment
if (process.env.NODE_ENV !== 'production') {
  var webpackDevMiddleware = require('webpack-dev-middleware');
  var webpackHotMiddleware = require('webpack-hot-middleware');
  var webpack = require('webpack');
  var config = require('./webpack.config');
  var compiler = webpack(config);

  app.use(webpackDevMiddleware(compiler, { noInfo: true, publicPath: config.output.publicPath }));
  app.use(webpackHotMiddleware(compiler));
}

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/dist/index.html')
});


const messages = [];
let clients = 0;

const messageObj = {
  type: 'incomingMessage',
  messages: messages
}



io.usersOnline = function(client){
  client.broadcast.emit({
      type: 'usersOnline',
      online: clients
    });
}


io.on('connection', function(client) {
    
      
  console.log('client connected!');
  client.emit(JSON.stringify(messageObj));
  clients++;
  client.emit('broad',{
      type: 'usersOnline',
      online: clients
    });
  client.broadcast.emit('broad',{
      type: 'usersOnline',
      online: clients
    });
    client.emit('broad',messageObj)
  client.broadcast.emit('broad',messageObj);
  client.on('message',(data) => {
        messages.push({
          id: uuid(),
          username: data.username,
          content: data.content,
          color: data.color
        });
        client.emit('broad',messageObj);
        client.broadcast.emit('broad',messageObj);
  });
  client.on('notification',(data) => {
        client.broadcast.emit('broad',{
          type:'incomingNotification',
          content: data.content
        });
       client.emit('broad',{
         type:'incomingNotification',
          content: data.content
       });
      });
     client.on('disconnect', function() {
      console.log('Got disconnect!');

      clients--;
       client.broadcast.emit('broad',{
       type: 'usersOnline',
       online: clients
    });
   });
  });


server.listen(PORT, function(error) {
  if (error) {
    console.error(error);
  } else {
    console.info('==> Listening on port %s. Visit http://localhost:%s/ in your browser.', PORT, PORT);
  }
});





