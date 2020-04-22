import React,  { useState, useEffect } from 'react';
import socketIOClient from "socket.io-client";


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
		<div style={{ display: "flex", color: "#ece7dc" }}>
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

export default Ping;
  