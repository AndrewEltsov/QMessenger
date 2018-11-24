import React from 'react';
import {Footer, FooterTab, Button, Text} from 'native-base';
import Input from './Input.js'


/* const AppFooter = () => (
	<Footer>
		<FooterTab>
			<Button	active = {this.state.FirstButton}>
				<Text>Статьи</Text>
			</Button>
			<Button active = {this.state.SecondButton} onPress = {this.ChangeButton}> 
				<Text>Подкасты</Text>
			</Button>
		</FooterTab>
	</Footer>
);
export default AppFooter; */

export default class AppFooter extends React.Component {

	constructor(props) {
        super(props);
        this.state = { FirstButton: true,
			SecondButton: false};
	}
	
	SetFBActive = () => {
			this.setState({
				FirstButton: true,
	   			SecondButton: false
			})
			console.log(this.state);
	}

	SetSBActive= () =>  {
		console.log(1);
			this.setState({
				FirstButton: false,
	   			SecondButton: true
			})
			console.log(3);
	}

    render() {
       return (
		<Footer >
			{/* <FooterTab >
				<Button	active = {this.state.FirstButton} onPress = {this.state.SecondButton ? this.SetFBActive : () => {}}>
					<Text>Статьи</Text>
				</Button>
				<Button active = {this.state.SecondButton} onPress = {this.state.FirstButton ? this.SetSBActive : () => {}}> 
					<Text>Подкасты</Text>
				</Button>
			</FooterTab> */}
			<Input/>
		</Footer>
       );
    }
}