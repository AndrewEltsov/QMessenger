import React from 'react';
import {List, Spinner, Text} from 'native-base';
import DialogueMiniature from './DialogueMiniature.js'
import config from '../config/index.js';

export default class DialogueList extends React.Component {

	constructor(props) {
        super(props);
        this.state = {             
            dialogues: [],
            loading: true
        };
    }

    async componentDidMount() {
        await this.getAllDialogues(this.props.user_id);
        this.setState({ loading: false });
    }

    getAllDialogues = async (id) => {
        await fetch(this.props.url+'/loadDialogues', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: id
            }),
        }).then(response => response.json()).
            then(data =>  {
                if (data.error) {
                    console.log(data.error)
                } else {
                    this.setState({dialogues: data})
                }
            });
    }

    render() {
        if (this.state.loading) {
            return <Spinner />;
        }
       return (           
        <List>
            {this.state.dialogues.length != 0 ? this.state.dialogues.map((dialogue) => 
            <DialogueMiniature 
                //id = {num}
                url={this.props.url}
                author_id={dialogue.author_id} 
                message_id={dialogue.message_id} 
                chooseDialogue={this.props.chooseDialogue}/>)
            :
                <Text style={{textAlign: "center", marginTop: 20}}>No dialogues yet.</Text>
            }
        </List>
       );
    }
  }