import React, { Component } from 'react';
import { Container, Header, Content, Item, Input, Button, Text, FooterTab, Footer, Form} from 'native-base';
import {Keyboard, View, Dimensions, StyleSheet, Alert} from 'react-native';

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        bottom:0
      },
      bottom: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: 36
    }
});

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = { login: '',
                        password: '',
                        confirmPasword: '',
                        url: '',
                        registration: false};
    }

    login = async () => {
         fetch(this.state.url+'/signin', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                login: this.state.login,
                password: this.state.password,
            }),
        }).then(response => response.json())
        .then( (data) =>  {
                this.props.setToken(data.token, data.user_id, this.state.url)
            }).catch(error => {
            Alert.alert("Login error",
                "Error",
                [{text: "Ok", style: "cancel"}],
                {cancelable: false});
                this.setState({
                    login: "",
                    password: ""
                })
            this.username._root.clear();
            this.password._root.clear();
            this.confirm._root.clear();         
        });  
    }

    register = async () => {
        fetch(this.state.url+'/register', {
           method: 'POST',
           headers: {
               Accept: 'application/json',
               'Content-Type': 'application/json',
           },
           body: JSON.stringify({
               login: this.state.login,
               password: this.state.password
           }),
       }).then(response => response.json())
       .then( (data) =>  {
           if (data.error) {
            Alert.alert("Registration error",
                data.error,
               [{text: "Ok", style: "cancel"}],
               {cancelable: false});
            this.setState({
                login: "",
                password: "",
                confirmPasword: ""
            });
           } else {
            Alert.alert("Congratulations",
                data.message,
                [{text: "Ok", style: "cancel"}],
                {cancelable: false});
            this.setState({
                login: "",
                password: "",
                confirmPasword: "",
                registration: false
            });
           }
            
            this.username._root.clear();
           this.password._root.clear();
           this.confirm._root.clear();
        });        
   }

  render() {
    return (
        <Content>
            <Form>
                <Item>
                    <Input placeholder="Username" 
                            onChangeText={(text) => this.setState({login: text})}
                            ref={(ref) => { this.username = ref }}/>
                </Item>
                {this.state.registration ?
                    <View>
                        <Item >
                            <Input placeholder="Password" 
                                    onChangeText={(text) => this.setState({password: text})}
                                    secureTextEntry={true}
                                    ref={(ref) => { this.password = ref }}/>
                        </Item>
                        <Item last>
                            <Input placeholder="Confirm password" 
                                    onChangeText={(text) => this.setState({confirmPasword: text})}
                                    secureTextEntry={true}
                                    ref={(ref) => { this.confirm = ref }}/>
                        </Item>
                    </View>
                :   
                    <View>
                        <Item>
                            <Input placeholder="Password" 
                                    onChangeText={(text) => this.setState({password: text})}
                                    secureTextEntry={true}
                                    ref={(ref) => { this.password = ref }}/>
                        </Item>
                        <Item>
                            <Input placeholder="Server URL" 
                                    onChangeText={(text) => this.setState({url: text})}
                                    ref={(ref) => { this.url = ref }}/>
                        </Item>
                    </View>}
            </Form>
            <View style={styles.bottom}>
                {this.state.registration ? 
                    <Button block onPress={this.register}
                            disabled={this.state.password != this.state.confirmPasword || this.state.login == "" || this.state.password == "" || this.state.confirmPasword == ""}>
                        <Text>Register</Text>
                    </Button>    
                :
                    <Button block onPress={this.login}
                            disabled={this.state.login == "" || this.state.password == ""}>
                        <Text>Login</Text>
                    </Button>
                }
                
                {this.state.registration ?
                    <Text 
                        style={{textDecorationLine: 'underline', color: 'blue', marginLeft: "auto",  marginRight: "auto", marginTop: 20}}
                        onPress={() => {this.setState({registration: false})}}>
                        Go to login page
                    </Text>
                    :
                    <Text 
                        style={{textDecorationLine: 'underline', color: 'blue', marginLeft: "auto",  marginRight: "auto", marginTop: 20}}
                        onPress={() => {this.setState({registration: true})}}>
                        Go to registration
                    </Text>
                                }
                
            </View>
            
        </Content>
    );
  }
}