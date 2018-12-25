import React, { Component } from 'react';
import { Header, Left, Body, Right, Button, Icon, Title } from 'native-base';

export default class MessengerHeader extends Component {
  render() {
    return (
        <Header style={{
            backgroundColor: "#512DA8"
        }}>   
          <Left>
          {this.props.isDialogueOpened ? 
            <Button transparent onPress={this.props.backFunction}>
              <Icon name='arrow-back' />
            </Button> : null}
          </Left>
          <Body>
            <Title>{this.props.HeaderName}</Title>
          </Body>
          <Right>
            <Button transparent onPress={this.props.menuFunction}>
              <Icon name='menu' />
            </Button>
          </Right>
        </Header>
    );
  }
}