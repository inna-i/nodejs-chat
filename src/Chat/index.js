import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import socketIOClient from "socket.io-client";

import MessagesList from '../MessagesList';

const H1 = styled.h1`
	position: relative;
	text-align: center;
	letter-spacing: 10px;
`;

const ChatContainer = styled.div`
	color: #fbfbef;
	font-family: 'Consolas', monospace;  
  	display:flex;
  	flex-direction: column;
  	height: 100vh;
`;

const Form = styled.form`
	position: relative;
	margin: 20px 30px;

	&::before {
		content: "~msg$:";
		position: absolute;
		left: 14px;
		top: 11px;
		color: #dcd1c4;
		font-size: 16px;
	}
	
	&::after {
		content: "↵";
		position: absolute;
		right: 20px;
		top: 0px;
		color: #dcd1c4;
		font-size: 30px;
	}
`;

const Input = styled.input`
	outline: none;
    border: none;
    background-color: #3c4556;
    border-radius: 5px;
    color: #ece7dc;
    width: 100%;
    height: 40px;
    text-indent: 82px;
    display: block;
    font-size: 16px;
	font-family: 'Consolas', monospace;
	flex: 1;
`;

const Chat = () => {
	const [messages, setMessages] = useState([]);
	const [value, setValue] = useState("");
	const [io, setIo] = useState(null);
  
	useEffect(() => {
	  const chat = socketIOClient("/api/chat");
  
	  setIo(chat);
  
	  chat.on("connect", () => {
		console.log("connected");
	  });
  
	  chat.on("message", (m) => {
		setMessages((d) => d.concat(m));
	  });
  
	  return () => chat.disconnect();
	}, []);

	
	return (
	  <ChatContainer>
		<H1>NWSD</H1>
		<MessagesList messages={messages} />
		<Form
			onSubmit={e => {
				e.preventDefault();
				io.emit("message", value);
				setValue("");
			}}
		>
			<Input
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="Enter your message"
			/>		 
		</Form>
	  </ChatContainer>
	);
  };

  export default Chat;
  