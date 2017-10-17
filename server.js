var path = require('path');
var express = require('express');
var app = express();
var PORT = process.env.PORT || 8080;
var knex = require('knex')({
  client: 'pg',
  version: '7.2',
  connection: {
    host : '127.0.0.1',
    user : 'development',
    password : 'development',
    database : 'vagrant'
  }
});
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var uuid = require('uuid/v1');
var serialize = require('serialize-javascript');
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

let clients = 0;

let messageObj = knex.select().from('messages')

io.usersOnline = function(client){
  client.broadcast.emit({
      type: 'usersOnline',
      online: clients
    });
}

io.on('connection', function(client) {

  //when user connects
  console.log('client connected!');
  clients++;
  client.emit('online',{
      type: 'usersOnline',
      online: clients
    });
  client.broadcast.emit('online',{
      type: 'usersOnline',
      online: clients
    });

  client.emit('broad',messageObj)
  client.broadcast.emit('broad',messageObj);

  //when someone writes a message
  client.on('message',(data) => {

  //when user rolls dice
    if(/^::roll/.test(data.content)){
       var number = parseInt(data.content.replace('::roll','').replace(/[\D]/,'')) || 20;
       pg('messages').insert({body: '<div class="dice">' +
       data.username + ' has rolled ' + (Math.floor(Math.random() * number)+1) + ' out of ' + number + '</div>'})
       client.emit('roll',messageObj);
       client.broadcast.emit('roll',messageObj);
    }else if(/((http){1}[s]?(:\/\/){1}[a-z0-9\/.-]+(.jpg|.jpeg|.png|.gif))/gi.test(data.content)){
        pg('messages').insert({
          id: uuid(),
          username: data.username,
          content: '<img src="' + data.content + '"/>',
          color: data.color
        });
        client.emit('broad',messageObj);
        client.broadcast.emit('broad',messageObj);
    }else{
        pg('messages').insert({
          id: uuid(),
          username: data.username,
          content:data.content.replace(/<[a-z]*>/gi,''),
          color: data.color
        });
        client.emit('broad',messageObj);
        client.broadcast.emit('broad',messageObj);
      }
  });

  //when a user is changed
  client.on('notification',(data) => {
       pg('messages').insert({
          content: '<i>' + data.username + ' has changed their name to ' + data.name + '</i>',
        });
       client.broadcast.emit('notification',messageObj)
       client.emit('notification',messageObj)
      });

    //when user leaves
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
