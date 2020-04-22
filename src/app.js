import React from "react";

import { Switch, Route } from "react-router";
import { createGlobalStyle } from "styled-components";

import Chat from './Chat';
import Ping from './Ping';


const GlobalStyle = createGlobalStyle`
	body {
		margin: 0;
		padding: 0;
		background: #252831;
		color: #fbfbef;
	}  
	ul::-webkit-scrollbar {
			width: 1em;
	}
	
	ul::-webkit-scrollbar-track {
			-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);
	}
	
	ul::-webkit-scrollbar-thumb {
		background-color: #3c4556;
		outline: 1px solid slategrey;
	}
`;

const App = () => [
	<GlobalStyle key="global-style" />,
	<Switch key="router">
		<Route exact path="/" render={(props) => <Ping />} />
		<Route path="/chat" render={(props) => <Chat />} />
	</Switch>,
];

export default App;
