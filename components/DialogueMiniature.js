import React from 'react';
import { ListItem, Left, Body, Right, Thumbnail, Text , Spinner} from 'native-base';

export default class DialogueMiniature extends React.Component {

	constructor(props) {
        super(props);
        this.state = {  name: '',
                        message: '',
                        time: '',
                        avatar: '' ,
                        loading: true};
    }

    async componentWillMount() {
        await this.formName(this.props.author_id);
        await this.getMessageBody(this.props.message_id);
        await this.getMessageTime(this.props.message_id);
    }

    componentDidMount() {
        this.setState({loading: false})
    }
    
    formName = async (id) => {
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
    
    getMessageBody = async(id) => {
        await fetch(this.props.url+'/getMessage', {
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
                this.setState({message: data.message_body})
            });
    }
    
    getMessageTime = async (id) => {
        await fetch(this.props.url+'/getMessage', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message_id: id
            }),
        }).then(response => response.json()).
            then(data => {
                this.setState({time: data.date.slice(11, 16)})
            });
    }
	
    render() {
        if (this.state.loading == true) {
            return <Spinner />
        }
       return (
            <ListItem avatar onPress={() => {this.props.chooseDialogue(this.props.message_id, this.state.name)}}>
                <Left>
                    <Thumbnail source={{uri: this.state.avatar}} />
                </Left>
                <Body>
                    <Text>{this.state.name}</Text>
                    <Text note>{this.state.message}</Text>
                </Body>
                <Right>
                    <Text note>{this.state.time}</Text>
                </Right>
            </ListItem>
       );
    }
  }