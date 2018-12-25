import React, { Component } from 'react';
import { Container, Header, Content, Item, Input, Button, Text, FooterTab, Footer, Form} from 'native-base';
import {Keyboard, View, Dimensions, StyleSheet} from 'react-native';

var { width } = Dimensions.get('screen');
 
const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center'
    },
    text_field: {
        width: width*0.85, //set this one
    },
    submit_button: {
        width: width*0.15
    }
  });

export default class InputField extends Component {
    constructor(props) {
        super(props);
        this.state = { text: ''};
    }

    sendMessage =  () => {
        fetch(this.props.url+'/sendMessage', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                author_id: this.props.user_id,
                message_body: this.state.text,
                parent_message_id: this.props.message_id
            }),
        }).then(response => response.json()).
        then( (data) =>  {
                this.input._root.clear();
                this.props.update(data);
                this.setState({text: ''});
            }).catch(error => console.log(error)); 
    }

  render() {
    return (
       
            <View style={styles.container}>
                <View style={styles.text_field}>
                <Item rounded >
                    <Input placeholder='Enter your message' ref={(ref) => { this.input = ref }} onChangeText={(text) => this.setState({text: text})}/>
                </Item>
                </View>
                <View style={styles.submit_button}>
                <Button rounded onPress={this.sendMessage} disabled={this.state.text == ""}>
                    <Text>OK</Text>
                </Button>
                </View>
            </View>
    );
  }
}