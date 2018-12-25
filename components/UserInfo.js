import React from 'react';
import {View, Keyboard, Alert} from 'react-native';
import {Thumbnail, Text, Button, Item, Input, Form} from 'native-base';
import Expo from 'expo';


export default class UserInfo extends React.Component {

	constructor(props) {
        super(props);
        this.state = { 
            name: "",
            avatar: "",
            view: "menu",
            file: null,
            keyboard: false,
            cur_pas: "",
            new_pas1: "",
            new_pas2: "",
            first_name: "",
            last_name: ""
        };
    }

    componentWillMount () {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    }

    async componentDidMount() {
        await this.getUser(this.props.user_info_id);
    }

    componentWillUnmount () {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
      }
    
      _keyboardDidShow =  () => {
         this.setState({
             keyboard: true
         })
      }
    
      _keyboardDidHide =  () => {
        this.setState({
            keyboard: false
        })
      }

    getUser = async (id) => {
        await fetch(this.props.url+'/getUser', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: id
            }),
        }).then(response => response.json()).
            then(data => {
                this.setState({name: data.first_name + " " + data.second_name,
                                avatar: this.props.url + "/" + data.avatar})
            });
    }

    chooseFile = async () => {
        await Expo.DocumentPicker.getDocumentAsync({type: "image/*", 
                    copyToCacheDirectory: false}).
                then(data => {
                    this.setState({file: {
                        uri: data.uri,
                        name: data.name,
                        type: "image/*"
                    }})
                });

        var body = new FormData()
        body.append('file', this.state.file)
        body.append('id', this.props.user_id)
        await fetch(this.props.url+'/sendImage', {
            method: 'POST',
            body
        })
    }

    beginDialogue =  () => {
        var body = new FormData();
        body.append('user_id', this.props.user_id);
        body.append('friend_id', this.props.user_info_id);
         fetch(this.props.url+'/beginDialogue', {
            method: 'POST',
            body
        }).then(data => data.json()).
        then(data => {
            this.props.chooseDialogue(data.message_id, this.state.name)
        }).catch(err => console.log(err));
    }

    logout = () => {
         fetch(this.props.url+'/logout', {
            method: 'POST',
            body: JSON.stringify({
                'user_id': this.props.user_id,
                'token': this.props.token
            })
        }).then(() => {
            this.props.removeToken()
        }).catch(err => console.log(err));
    }

    changePassword = () => {
        fetch(this.props.url+'/changePassword', {
            method: 'POST',
            body: JSON.stringify({
                'user_id': this.props.user_id,
                'password': this.state.cur_pas,
                'new_password': this.state.new_pas1
            })
        }).then((data) => {
            Alert.alert("Congratulations",
            data.status,
            [{text: "Ok", style: "cancel"}],
               {cancelable: false})
        }).catch((err) => {
            Alert.alert("Warning",
            err.message,
            [{text: "Ok", style: "cancel"}],
               {cancelable: false})
        });
    }

    changeName = () => {
        var body = new FormData();
        body.append('user_id', this.props.user_id);
        body.append('first_name', this.state.first_name);
        body.append('last_name', this.state.last_name);
        fetch(this.props.url+'/changeName', {
            method: 'POST',
            body
        }).then(() => {
            this.setState({name: this.state.first_name + ' ' + this.state.last_name})
        })
    }

    render() {
       return (
           <View>
                {this.state.keyboard ?
                    null
                :
                    <View>
                        <Thumbnail style={{marginLeft: "auto",  marginRight: "auto", marginTop: 50, width: 100, height: 100}} source={{uri: this.state.avatar}} />
                        <Text style={{marginLeft: "auto",  marginRight: "auto", marginTop: 20}}> Name: {this.state.name} </Text>
                    </View>
                }
                {this.props.user_id == this.props.user_info_id ?
                    this.state.view == "menu" ?
                        <View>
                            <Button style={{marginLeft: "auto",  marginRight: "auto", marginTop: 20}} onPress={() => {this.setState({view: "name"})}}>
                            <Text>Change name</Text>
                            </Button>
                            <Button style={{marginLeft: "auto",  marginRight: "auto", marginTop: 20}} 
                                    onPress={this.chooseFile}>
                                        <Text>Change or add avatar</Text>
                            </Button>
                            <Button style={{marginLeft: "auto",  marginRight: "auto", marginTop: 20}} onPress={() => {this.setState({view: "password"})}}>
                                        <Text>Change password</Text>
                            </Button>
                            <Button style={{marginLeft: "auto",  marginRight: "auto", marginTop: 20}} onPress={this.logout}>
                                        <Text>Logout</Text>
                            </Button>
                        </View>
                    :
                        this.state.view == "password" ?
                            <View >
                                <Form>
                                    <Item>
                                        <Input  style={{marginLeft: "auto",  marginRight: "auto", marginTop: 20}}
                                                placeholder="Enter current password" 
                                                secureTextEntry={true}
                                                onChangeText={(text) => {this.setState({cur_pas: text})}}
                                                />
                                    </Item>
                                    <Item >
                                        <Input style={{marginLeft: "auto",  marginRight: "auto", marginTop: 20}}
                                                placeholder="Enter new password" 
                                                onChangeText={(text) => {this.setState({new_pas1: text})}}
                                                secureTextEntry={true}/>
                                    </Item>
                                    <Item last>
                                        <Input  style={{marginLeft: "auto",  marginRight: "auto", marginTop: 20}}
                                                placeholder="Confirm new password" 
                                                onChangeText={(text) => {this.setState({new_pas2: text})}}
                                                secureTextEntry={true}/>
                                    </Item>
                                </Form>
                                <Button block onPress={this.changePassword} 
                                                style={{marginLeft: "auto",  marginRight: "auto", marginTop: 20}}
                                                disabled={this.state.new_pas1!=this.state.new_pas2 || this.state.new_pas1 == "" || this.state.new_pas2 == "" || this.state.cur_pas == ""}>
                                    <Text>Change password</Text>
                                </Button>
                            </View>
                        :
                            this.state.view == "name" ?
                                <View>
                                    <Item >
                                        <Input style={{marginLeft: "auto",  marginRight: "auto", marginTop: 20}}
                                                placeholder="Enter new first name" 
                                                onChangeText={(text) => {this.setState({first_name: text})}}
                                                />
                                    </Item>
                                    <Item last>
                                        <Input  style={{marginLeft: "auto",  marginRight: "auto", marginTop: 20}}
                                                placeholder="Enteer new last name" 
                                                onChangeText={(text) => {this.setState({last_name: text})}}
                                                />
                                    </Item>
                                    <Button block onPress={this.changeName} 
                                                style={{marginLeft: "auto",  marginRight: "auto", marginTop: 20}}
                                                disabled={this.state.first_name == "" || this.state.last_name == ""}>
                                        <Text>Change name</Text>
                                    </Button>
                                </View>
                            :
                                null
                :
                    <Button style={{marginLeft: "auto",  marginRight: "auto", marginTop: 20}}
                            onPress={this.beginDialogue}>
                         <Text>Begin to chat</Text>
                    </Button>
                }
                
            </View>            
       );
    }
  }