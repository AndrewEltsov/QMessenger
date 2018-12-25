import React from 'react';
import {ListItem, Card, CardItem, Body, Text, Right, Badge} from 'native-base';
import { StyleSheet,
    View,
    Dimensions,
    ScrollView, Keyboard} from 'react-native';

export default class Message extends React.Component {

	constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
       const badge = this.props.author_id == this.props.user_id ? 
        <View style={{marginLeft: 'auto'}}>
            <Text style={{textAlign: 'right'}}>You:</Text>
            <Text style={{textAlign: 'right'}}>{this.props.message}</Text>
        </View>
            :
        <View style={{marginLeft: '0%'}}>
            <Text style={{textAlign: 'left'}}>{this.props.message}</Text>
        </View>
       return (
           <ListItem>
                {badge}
           </ListItem>
       );
    }
  }