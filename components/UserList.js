import React from 'react';
import {List, Spinner} from 'native-base';
import UserMiniature from './UserMiniature.js'
import config from '../config/index.js';

export default class UserList extends React.Component {

	constructor(props) {
        super(props);
        this.state = {             
            users: [],
            loading: true
        };
    }

    async componentDidMount() {
        await this.getAllUsers();
        this.setState({loading: false})
    }

    getAllUsers = async () => {
        await fetch(this.props.url+'/loadUsers', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }).then(response => response.json()).
            then(data =>  {
                this.setState({users: data})
            });
    }

    render() {
        if (this.state.loading) {
            return <Spinner />;
        }
       return (           
        <List>
            {this.state.users.map((user) => 
            <UserMiniature 
                id = {user.id}
                avatar={{uri: this.props.url + "/" + user.avatar}}
                user_id = {this.props.user_id}
                name = {user.first_name + " " +  user.second_name}
                date = {user.date}
                chooseUser={this.props.chooseUser}/>)
            }
        </List>
       );
    }
  }