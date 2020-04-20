import React, { useState, useEffect } from "react";

import { Switch, Route } from "react-router";

import styled, { createGlobalStyle } from "styled-components";

import socketIOClient from "socket.io-client";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
  }
`;

const Ping = () => {
  const [response, setResponse] = useState([]);
  const [meta, setMeta] = useState({});

  useEffect(() => {
    const ping = socketIOClient("/api/ping");
    fetch("/api")
      .then((resp) => resp.json())
      .then((resp) => setMeta(resp))
      .catch((e) => alert("fail"));

    ping.on("connect", () => {
      console.log("connected");
    });

    ping.on("message", (m) => {
      setResponse((d) => d.concat(m));
    });

    return () => ping.disconnect();
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <div>
        <h1>Messages: {response.length}</h1>
        {response.slice(-10).map((v, ind) => (
          <div key={ind + v}>{JSON.stringify(v)}</div>
        ))}
      </div>
      <div style={{ color: "grey", maxWidth: 500 }}>
        {Object.keys(meta).map((key) => (
          <div>
            {key}: {meta[key]}
          </div>
        ))}
      </div>
    </div>
  );
};


const ChatContainer = styled.div`
  font-size: 14px;
  background-color: antiquewhite;
  display:flex;
  flex-direction: column;
  height: 100vh;
`;

const ChatMessagesList = styled.div`
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
      <ChatMessagesList>
        {messages.map((m) => (
          <div> {m.user && <span>{m.user} : </span>}  {m.msg}</div>
        ))}
      </ChatMessagesList>
      <div>
        <input value={value} onChange={(e) => setValue(e.target.value)}></input>
        <button
          onClick={() => {
            io.emit("message", value);
            setValue("");
          }}
        >
          Send
        </button>
      </div>
    </ChatContainer>
  );
};

const App = () => [
  <GlobalStyle key="global-style" />,
  <Switch key="router">
    <Route exact path="/" render={(props) => <Ping />} />
    <Route path="/chat" render={(props) => <Chat />} />
  </Switch>,
];

export default App;
