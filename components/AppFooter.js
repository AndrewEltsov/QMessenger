import React from 'react';
import {Footer, FooterTab, Button, Text} from 'native-base';
import Input from './InputField.js'

export default class AppFooter extends React.Component {

	constructor(props) {
        super(props);
        this.state = { FirstButton: true,
			SecondButton: false};
	}
	
	componentDidMount() {
		if (this.props.view == "dialogues") {
			this.setState({
				FirstButton: true,
				SecondButton: false
			});	
		} else {
			this.setState({
				FirstButton: false,
				SecondButton: true
			});
		}
	}

	SetFBActive = () => {
			this.setState({
			FirstButton: true,
			SecondButton: false
		});
		this.props.chooseView("dialogues")
	}

	SetSBActive= () =>  {
		this.setState({
			FirstButton: false,
			SecondButton: true
		});
		this.props.chooseView("users");
	}

    render() {
       return (
		<Footer >
			<FooterTab >
				<Button	active = {this.state.FirstButton} onPress = {this.state.SecondButton ? this.SetFBActive : () => {}}>
					<Text>Dialogues</Text>
				</Button>
				<Button active = {this.state.SecondButton} onPress = {this.state.FirstButton ? this.SetSBActive : () => {}}> 
					<Text>Users</Text>
				</Button>
			</FooterTab>
		</Footer>
       );
    }
}