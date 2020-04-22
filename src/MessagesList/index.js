import React from 'react';
import styled from 'styled-components';

const Welcome = styled.h3`
	position: relative;
	font-size: 15px;
`;

const ChatMessagesList = styled.ul`
	flex: 1;
	margin: 0;
    padding: 20px;
	overflow-y: scroll;
	list-style-type: none;	
`;

const ChatMessage = styled.li`
    margin-bottom: 5px;
`;

const Message = styled.div`
	position: relative;
    margin: 10px 25px;
    padding: 10px 20px;
    width: calc(100% - 60px);
    border-radius: 4px;
    color: #afeaa1;
    background: ${props => props.currentUser ? '#3c4556': '#2f313d'};
`;

const Time = styled.span`
	margin-right: 10px;
	font-weight: 600;
    font-size: 12px;
    color: #dcd1c4;
`;

const Name = styled.span`
	display: inline-block;
	position: relative;
	font-weight: 600;
    font-style: italic;
    font-size: 12px;
	color: ${props => props.isOnline ? '#f4f2e7' : 'grey'};

	&::after {
		content: '';
		position: absolute;
		top: 2px;
		right: -14px;
		width: 10px;
		height: 10px;
		border-radius: 10px;
		background: ${props => props.isOnline ? '#6fb472' : 'grey'};
	}
`;


function MessagesList(props) {
	return (		
		<ChatMessagesList ref={props.el}>
		{ props.messages.map((m, i) => {
			if (!m.user) {
				return (<Welcome> {m.msg}</Welcome>)
			}
			const isOnline = props.activeUsers.includes(m.user);
			return (
				<ChatMessage key={i}> 
					<Time>{m.time}</Time>
					<Name isOnline={isOnline}>{m.user}</Name> 
					<Message currentUser={props.userId === m.user}>{m.msg}</Message>
				</ChatMessage>
			)
		})}			
		</ChatMessagesList>
	)
}

export default MessagesList;