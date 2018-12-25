import React from 'react';
import { List} from 'native-base';
import { StyleSheet,
    View,
    Dimensions,
    ScrollView, Keyboard} from 'react-native';

import Message from './Message.js'
import InputField from './InputField.js'

var { height } = Dimensions.get('window');
 
const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column'
    }
  });

export default class Dialogue extends React.Component {

	constructor(props) {
        super(props);
        this.state = { 
            messages: [],
            dialogue_height: 0.75,
            input_height: 0.1,
            message_id: ""
        };
    }

     async componentWillMount () {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
        await this.getAllMessages(this.props.message_id);
    }

     async componentDidMount() { 
        this.scrollToEnd(); 
        check = setInterval(this.checkMessages, 300);
    }

    componentDidUpdate() {
        this.scrollToEnd();
    }

      componentWillUnmount () {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
        clearInterval(check)
      }
    
      _keyboardDidShow =  () => {
         this.setState({
             dialogue_height: 0.3,
             input_height: 0.1
         })
      }
    
      _keyboardDidHide =  () => {
        this.setState({
            dialogue_height: 0.75,
            input_height: 0.1
        })
      }

    getAllMessages = async (id) => {
        await fetch(this.props.url+'/loadMessages', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message_id: id
            }),
        }).then(response => response.json()).
            then(data =>  {
                if (data == null) {
                    this.setState({ message_id: this.props.message_id})
                } else {
                    this.setState({messages: data,
                        message_id: data[data.length-1].id})
                }
                
                
            });
    }

    checkMessages = async () => {
        console.log("message_id: "+this.state.message_id);
        await fetch(this.props.url+'/checkNew', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message_id: this.state.message_id
            }),
        }).then(response => response.json()).
            then(data =>  {
                if (data.message == "Error") {
                } else {
                    this.update(data)
                }
            });
        //
    }

    update = (message) => {
        console.log("update")
        var temp = this.state.messages;
        temp.push(message);
        this.setState({messages: temp,
                        message_id: message.id}); 
    }

    scrollToEnd =  () => {
        this.listView.scrollToEnd({animated: false})   
    }

    render() {
       return (
           <View style={styles.container}>
                <View style={{
                        height: height*this.state.dialogue_height, //set this one
                        backgroundColor: '#b4eceb'
                    }} >
                    <ScrollView ref={listView => { this.listView = listView; }} onContentSizeChange={this.scrollToEnd}>
                    {this.state.messages.map((message) => 
                        <Message message={message.message_body} user_id={this.props.user_id} author_id={message.author_id} /> 
                    )}
                    </ScrollView>
                </View>
                <View style={{
                         height: height*this.state.input_height
                    }}>   
                    <InputField url={this.props.url} foo={this.props.chooseDialogue} update={this.update} message_id={this.state.message_id} user_id = {this.props.user_id}/>
                </View>
            </View>            
       );
    }
  }