import React from 'react';
import { ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';

export default class UserMiniature extends React.Component {

	constructor(props) {
        super(props);
        this.state = { };
    }
    	
    render() {
       return (
            <ListItem avatar onPress={() => {this.props.chooseUser(this.props.id)}}>
                <Left>
                    <Thumbnail source={this.props.avatar} />
                </Left>
                <Body>
                    <Text>{this.props.name}</Text>
                    <Text note>Registration Date: {this.props.date}</Text>
                </Body>
            </ListItem>
       );
    }
  }