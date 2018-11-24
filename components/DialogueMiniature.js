import React from 'react';
import { ListItem, Left, Body, Right, Thumbnail, Text } from 'native-base';

export default class DialogueMiniature extends React.Component {

	constructor(props) {
        super(props);
        this.state = { };
	}
	
    render() {
       return (
            <ListItem avatar onPressOut={() => {this.props.chooseDialogue(this.props.id, this.props.name)}}>
                <Left>
                    <Thumbnail source={this.props.avatar} />
                </Left>
                <Body>
                    <Text>{this.props.name}</Text>
                    <Text note>{this.props.message}</Text>
                </Body>
                <Right>
                    <Text note>{this.props.time}</Text>
                </Right>
            </ListItem>
       );
    }
  }