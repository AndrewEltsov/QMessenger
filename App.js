import React from 'react';
import {Container, Content} from 'native-base';
import {Platform, StatusBar, StyleSheet, Text, View} from 'react-native';
import AppFooter from './components/AppFooter.js';
import Input from './components/Input.js';
import MessengerHeader from './components/MessengerHeader.js';
import Dialogue from './components/Dialogue.js';
import DialogueList from './components/DialogueList.js';


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
                        dialogue: null,
                        user_id: 1,
                        friendsName: null
        }
    }

    async componentWillMount() {
        await Expo.Font.loadAsync({
          Roboto: require("native-base/Fonts/Roboto.ttf"),
          Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
          Ionicons: require("@expo/vector-icons/fonts/Ionicons.ttf"),
        });
        this.setState({ loading: false });
    }

    chooseDialogue = (id, name) => {
        this.setState({dialogue: id, friendsName: name});
    }

    backPressed = () => {
        this.setState({dialogue: null, friendsName: null});
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
            <MessengerHeader style={styles.header} isDialogueOpened = {this.state.dialogue == null ? false : true} HeaderName={this.state.dialogue == null ? "QMessenger"  : this.state.friendsName} backFunction={this.backPressed}/>
            <Content>
                    {this.state.dialogue == null ?  
                        <DialogueList chooseDialogue={this.chooseDialogue}/>
                    :
                        <Dialogue id = {this.state.dialogue} user_id={this.state.user_id}/>
                    }
           </Content>
           {this.state.dialogue == null ? null : <Input dialogue_id={this.state.dialogue} foo={this.chooseDialogue}/>}
       </Container>
       );
    }
  }