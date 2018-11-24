import React from 'react';
import {List} from 'native-base';
//import {    TouchableOpacity  } from 'react-native'
import DialogueMiniature from './DialogueMiniature.js'
import dialogues from '../fakedata/active_dialogues.js'
import users from '../fakedata/users.js'
import messages from '../fakedata/messages.js'

export default class DialogueList extends React.Component {

	constructor(props) {
        super(props);
        this.state = { };
    }

    foo = () => {
        console.log(1)
    }

    render() {
       return (
           
        <List>
            {dialogues.map((dialogue, num) => 
            <DialogueMiniature 
                            id = {num}
                            avatar={{uri: ''}} 
                            name={users[dialogue.user_id]["username"]} 
                            message={messages[dialogue.message_id].text} 
                            time={messages[dialogue.message_id].time}
                            chooseDialogue={this.props.chooseDialogue}/>
            )}
        </List>
       );
    }
  }