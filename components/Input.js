import React, { Component } from 'react';
import { Container, Header, Content, Item, Input, Button, Text } from 'native-base';
import {Platform, View} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';


import dialogues from '../fakedata/active_dialogues.js'
import users from '../fakedata/users.js'
import messages from '../fakedata/messages.js'

export default class RoundedTextboxExample extends Component {
    constructor(props) {
        super(props);
        this.state = { text: ''};
    }

    sendMessage = () => {
        var id = Math.random()*32000;
        messages[id]={
            author_id: 1,
            time: "11:00",
            text: this.state.text,
            next: dialogues[this.props.dialogue_id].message_id
        }
        dialogues[this.props.dialogue_id].message_id=id;
        this.props.foo(this.props.dialogue_id);
        this.setState({text: ''});
    }

  render() {
    return (
        <KeyboardAwareScrollView
        enableOnAndroid
        keyboardOpeningTime={0}
        extraHeight={0}
        extraScrollHeight={0}
        viewIsInsideTabBar={false}
      >
        <View style={{ flexDirection:'row' }}>
          <Item rounded  style={{width: 300}} >
            <Input placeholder='Enter your message' onChangeText={(text) => this.setState({text})}/>
          </Item>
          <Button rounded onPressOut={this.sendMessage}>
            <Text>OK</Text>
          </Button>
          </View>
        </KeyboardAwareScrollView>

    );
  }
}