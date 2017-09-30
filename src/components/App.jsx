import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import ChatBar from './ChatBar.jsx';
import MessageList from './MessageList.jsx';
import io from 'socket.io-client';

const socket = io();

var webrtc = new SimpleWebRTC({
  debug:true,
  media: {video:false,audio:true},
  autoRequestMedia: true,
  adjustPeerVolume:true,
  localvideo:{autoplay:true},
  detectSpeakingEvents:true
});

class App extends Component {
    constructor(props) {
        super(props);
        const hexGen = function () {
            const hexVals = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e']
            const newHex = ['#']
            for (var x = 1; x <= 6; x++) {
                newHex.push(hexVals[Math.floor(Math.random() * 14)].toString())
            }
            return newHex.join('');
        }
        this.state = {
            currentUser: {
                name: 'Bob',
                color: hexGen()
            },
            online: 0,
            messages: [], // messages coming from the server will be stored here as they arrive
        };
    }
    componentDidMount() {
        // Create the WebSockets server
        socket.on('connect', function () {
            socket.emit('join', 'hello world from the client!');
             var element = document.getElementById("messagesEnd");
            element.scrollIntoView({ behavior: "smooth" });
        }.bind(this));
        socket.on('broad', function (event) {
            this.setState({
                messages: event.messages
            });
            var element = document.getElementById("messagesEnd");

            element.scrollIntoView({ behavior: "smooth" });
            
        }.bind(this));
        socket.on('notification', function (event) {
            this.setState({
                messages: event.messages    
            });
            var element = document.getElementById("messagesEnd");
            element.scrollIntoView({ behavior: "smooth" });
        }.bind(this));
        socket.on('online', function (event) {
            this.setState({
                online: event.online
            });
          
                                                                                     
            webrtc.on('connectionReady',function(){
                webrtc.joinRoom('dnd_room');
            });
        }.bind(this));
         socket.on('roll', function (event) {
            this.setState({
                messages: event.messages
            });
            var element = document.getElementById("messagesEnd");
            element.scrollIntoView({ behavior: "smooth" });
        }.bind(this));                
    }
    addMessage(content) {
        var username = this.state.currentUser.name;
        socket.emit('message', {
            type: 'message',
            username: username,
            content: content,
            color: this.state.currentUser.color
        });
    }
    changeUser(content) {
         socket.emit('notification', {
            username: this.state.currentUser.name,
            name: content.newUser,
        });
          this.setState({
            currentUser: {
                name: content.newUser,
                color: this.state.currentUser.color
            }     
         });
    }
    render() {
        return ( <div>
            <nav className = "navbar" >
                <a href = "/" className = "navbar-brand" > Hedron </a> 
                <p className = 'pull-right'> {this.state.online} user(s) online </p> 
            </nav>
            <MessageList messages = {this.state.messages}/> 
            <ChatBar currentUser = {this.state.currentUser.name} addMessage = {this.addMessage.bind(this)}
            changeUser = {this.changeUser.bind(this)}/> 
            </div>
        );
    }
}
App.propTypes = {
    currentUser: React.PropTypes.string,
    messages: React.PropTypes.array,
    addMessage: React.PropTypes.func,
    changeUser: React.PropTypes.func,
    color: React.PropTypes.string
};

export default App;
