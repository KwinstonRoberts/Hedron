import React from 'react';
import Message from './Message.jsx';

let MessageList = (props) =>

    <main className = "messages" >
    <Message messages = {props.messages}/>
    <div id='messagesEnd'></div>
    </main>

MessageList.propTypes = {
    messages: React.PropTypes.array,
    color: React.PropTypes.string,
    notification: React.PropTypes.string
};
export default MessageList;
