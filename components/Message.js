import React from 'react';
import {ListItem, Card, CardItem, Body, Text, Right, Badge} from 'native-base';


export default class Message extends React.Component {

	constructor(props) {
        super(props);
        this.state = {};
    }

   

    render() {
       const badge = this.props.author_id == this.props.user_id ? 
       <Badge success  style={{marginLeft: 'auto'}}>
            <Text>{this.props.message}</Text>
        </Badge> :
        <Badge info style={{marginLeft: '0%'}}>
            <Text>{this.props.message}</Text>
        </Badge>
       return (
           <ListItem>
                {badge}
           </ListItem>
       );
    }
  }