import React from 'react';
import { List} from 'native-base';
import {View} from 'react-native';

import Message from './Message.js'
import Input from './Input.js'
import dialogues from '../fakedata/active_dialogues.js'
import users from '../fakedata/users.js'
import messages from '../fakedata/messages.js'

export default class Dialogue extends React.Component {

	constructor(props) {
        super(props);
        this.state = { };
    }

    render() {
        let messagesToRender = [];
        let message_id = dialogues[this.props.id].message_id;
        
        do {
            messagesToRender.unshift(messages[message_id]);
            /* console.log(message_id);
            if (messages[message_id].author_id == this.props.user_id) {
                messagesToRender.push(<Message message={messages[message_id].text} success={true} info={false} location='auto'/>)
            }
            else {
                messagesToRender.push(<Message message={messages[message_id].text} success={false} info={true} location='0%'/>)
            } */
            message_id = messages[message_id].next;
          } while (message_id != 0);
          console.log(messagesToRender);
       return (
            <List>
                {messagesToRender.map((message) => 
                <Message message={message.text} user_id={this.props.user_id} author_id={message.author_id}/> 
                )}
            </List>
            
       );
    }
  }