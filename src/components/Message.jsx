import React, {
    Component
} from 'react';

class Message extends Component {
    constructor(props) {
        super(props);
    }
    render() {

        var messages = this.props.messages;
        var messageList = messages.map((message, i) => {
            const fontCol = {
                color: this.props.messages[i].color
            };
            return <div className = "message" key = {i} >
                <span key = {i} style = {fontCol} className = "message-username" > 
                   { message.username}
                </span> 
                <span className = "message-content" > 
                   < div dangerouslySetInnerHTML = {
                    {__html: message.content.replace(/((http){1}[s]?(:\/\/){1}[a-z0-9\/.-]+(.jpg|.jpeg|.png|.gif))/gi, '<br><img width=\'60%\' src="$1"/>')}}/></span>
            </div>
        });
        return <div > {
            messageList
        } < /div>
    }
}
Message.propTypes = {
    messages: React.PropTypes.array,
    username: React.PropTypes.string,
    content: React.PropTypes.string,
    color: React.PropTypes.string
};
export default Message;
