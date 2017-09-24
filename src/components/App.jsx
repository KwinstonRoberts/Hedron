import React, { Component } from 'react';
import ChatBar from './ChatBar.jsx';
import MessageList from './MessageList.jsx';
import io from 'socket.io-client';

const socket = io();


class App extends Component {
  constructor(props) {
    super(props);
    const hexGen = function(){
      const hexVals = ['1','2','3','4','5','6','7','8','9','a','b','c','d','e','f']
      const newHex = ['#']
      for(var x=1; x<=6; x++){
        newHex.push(hexVals[Math.floor(Math.random()*15)].toString())
      }
      return newHex.join('');
    }
    this.state = {
      currentUser: {
        name: 'Bob',
        color:hexGen()
      },
      online: 0,
      messages: [], // messages coming from the server will be stored here as they arrive
      notification: ''
    };
  }
    
  componentDidMount() {
    // Create the WebSockets server
   
    socket.on('connect',function(){
        socket.emit('join', 'hello world from the client!');
    });
    socket.on('broad', function(event) {
    console.log(event)
      var data = event
      if(data.type==='incomingMessage'){
        this.setState({
          messages: data.messages
        });
      }else if(data.type==='incomingNotification'){
        this.setState({
          notification: data.content
        });
      }else if(data.type==='usersOnline'){
        this.setState({
          online: data.online,
        });
      }
    }.bind(this))
  }
  addMessage(content) {
    var username = this.state.currentUser.name;
    socket.emit('message', {
      type: 'message',
      username:username,
      content:content,
      color: this.state.currentUser.color
    });
  }
  changeUser(content) {
    this.setState({
      currentUser: {
        name: content.newUser,
        color:this.state.currentUser.color
      }
    });
      socket.emit('notification', {
        content: content.oldUser + ' has changed their name to ' + content.newUser
      });
  }
  render() {
    return (
      <div>
        <nav className="navbar">
          <a href="/" className="navbar-brand">Hedron</a>
          <p className='pull-right'>{this.state.online} user(s) online</p>
        </nav>
        <MessageList messages={this.state.messages} notification={this.state.notification}/>
        <ChatBar currentUser={this.state.currentUser.name} addMessage={this.addMessage.bind(this)} changeUser={this.changeUser.bind(this)} />
      </div>
      );
   }
}
App.propTypes = {
  currentUser: React.PropTypes.string,
  messages: React.PropTypes.array,
  addMessage: React.PropTypes.func,
  changeUser: React.PropTypes.func,
  color:React.PropTypes.string
};

export default App;