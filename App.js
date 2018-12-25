import React from 'react';
import config from './config/index.js';
import {Container, Content} from 'native-base';
import Expo from 'expo';
import {Platform, AsyncStorage, StyleSheet, Text, View} from 'react-native';
import AppFooter from './components/AppFooter.js';
import MessengerHeader from './components/MessengerHeader.js';
import Dialogue from './components/Dialogue.js';
import DialogueList from './components/DialogueList.js';
import UserList from './components/UserList.js';
import Login from './components/Login.js';
import UserInfo from './components/UserInfo.js';

const styles = StyleSheet.create({
	container: {
        padding: 20,
    },
    statusbar: {
        height: 24,
        backgroundColor: "#512DA8"
    },
    header: {
        backgroundColor: "#512DA8"
    },
    footer: {
        backgroundColor: "#512DA8"
    }
});

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { loading: true , 
                        message_id: null,
                        user_id: "",
                        token: "",
                        friendsName: null,
                        user_info_id: null,
                        serverUrl: "",
                        view: "dialogues"}
    }


    async componentWillMount() {
        console.disableYellowBox = true;
        await Expo.Font.loadAsync({
            Roboto: require("native-base/Fonts/Roboto.ttf"),
            Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
            Ionicons: require("@expo/vector-icons/fonts/Ionicons.ttf")
        });
        this.setState({ loading: false });
    }

    async componentDidMount() {
        await this.retrieveToken();
        await this.getSession();
    }


    chooseDialogue = (id, name) => {
        this.setState({message_id: id, friendsName: name, user_info_id: null, view: "dialogues"});
    }

    chooseUser= (id) => {
        this.setState({user_info_id: id, message_id: null})
    }

    backPressed = () => {
        this.setState({message_id: null, 
                    friendsName: null,
                    user_info_id: null});
    }

    chooseView = (id) => {
        this.setState({view: id})
    }

    menuPressed = () => {
        user_id = this.state.user_id;
        console.log(this.state);
        this.setState({message_id: null, 
            friendsName: null,
            user_info_id: user_id,
            view:  "users"});
        console.log(this.state);
    }

    setToken = async (token, id, url) => {
        this.setState({
            token: token,
            user_id: id,
            serverUrl: url 
        });
        await this.storeToken();
    }

    storeToken = async () => {
        try {
          await AsyncStorage.setItem('token', this.state.token);
        } catch (error) {
            console.log(error)
        }
    }

    retrieveToken = async () => {
        try {
            const value = await AsyncStorage.getItem('token');
            if (value !== null) {
                this.setState({token: value})
                console.log(value);
            }
            } catch (error) {
                console.log(error)
            }
    }

    removeToken = async () => {
        try {
            await AsyncStorage.removeItem('token');
        } catch (error) {
            console.log(error)
        }
    }

    removeUser = () => {
        this.setState({
            user_id: "",
            user_info_id: null,
            token: "",
            view: "dialogues"})
    }

    getSession = async () => {
        if (this.state.token != "") {
            await fetch(config.server.uri+'/getSession', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: this.state.token
                }),
            }).then(response => response.json()).
                then(data => { 
                    this.setState({user_id: data.user_id})
                }).catch(error => {
                    console.log(error);
                    this.setState({token: ""})
                    this.removeToken();
                }); 
        }   
    }

    render() {
        if (this.state.loading) {
            return <Expo.AppLoading />;
        }
       return (
        <Container>
            { Platform.OS === 'android' && Platform.Version >= 20 ?
                <View
                    style={styles.statusbar}
                />
            : null }
            <MessengerHeader style={styles.header} isDialogueOpened = {this.state.message_id == null && this.state.user_info_id == null  ? false : true} HeaderName={this.state.message_id == null ? "QMessenger"  : this.state.friendsName} backFunction={this.backPressed} menuFunction={this.menuPressed}/>
            <Content>
                {this.state.token == "" || this.state.user_id == "" ? <Login setToken={this.setToken}/> : (
                    this.state.view == "dialogues" ? (
                        this.state.message_id == null ?  
                            <DialogueList chooseDialogue={this.chooseDialogue} url={this.state.serverUrl} user_id = {this.state.user_id}/>
                        :
                            <Dialogue user_id = {this.state.user_id} url={this.state.serverUrl} message_id={this.state.message_id} chooseDialogue={this.chooseDialogue}/>) 
                    : (
                        this.state.user_info_id == null ?  
                            <UserList chooseUser={this.chooseUser} url={this.state.serverUrl} user_id={this.state.user_id}/>
                        :
                            <UserInfo user_id={this.state.user_id} url={this.state.serverUrl} user_info_id={this.state.user_info_id} chooseDialogue={this.chooseDialogue} token={this.state.token} removeToken={() => {
                                                                                                                                                                            this.removeToken();
                                                                                                                                                                            this.removeUser();
                                                                                                                                                                        }} />
                            
                        ))
                }
           </Content>
           {this.state.user_info_id == null && this.state.message_id == null && this.state.token != "" && this.state.user_id != "" ? 
                 <AppFooter chooseView={this.chooseView} view={this.state.view}/> : null
            }
          
       </Container>
       );
    }
  }