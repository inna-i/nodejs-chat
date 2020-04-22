const express = require("express");
const defaultPort = 8080;
const path = require("path");

function getPort() {
	return (
		process.argv
			.filter((a) => a.startsWith("port"))
			.map((val) => Number(val.split(/[ =]+/g)[1] || defaultPort))
			.pop() || defaultPort
	);
}

const port = getPort(); // should be possible to overide the port via console arg
const v = 10; // indicating app version from kubernetes logs

const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

app.use(express.static("build/public"));

app.get("/api", (req, res) => res.json(process.env)); // test rest api

/* this is for testing connection, will be removed later */
io.of("/api/ping").on("connection", (socket) => {
	// ping
	let i = 0;
	let int = setInterval(() => {
		socket.emit("message", {
			id: i + "bacon",
		});
		i++;
	}, 1000);
	socket.on("disconnect", () => {
		clearInterval(int);
		console.log("Client disconnected");
	});
});


function random(limit) {
	return Math.floor(Math.random() * limit);
}

function randomLogin() {
	const one = [
		"Funny",
		"Stinky",
		"Happy",
		"Weird",
		"Successful",
		"Giant",
		"Lucky",
		"Extreme",
		"Pretty"
	];
	const two = ["Cow", "Bacon", "Parrot", "Hamster", "Arnold", "Cat", "Hacker", "Petty", "Eminem"];
	return (
		one[random(one.length - 1)] + two[random(two.length - 1)] + random(100)
	);
}
const map = new Map();

/** Chat Websocket logic is here */
const chat = io.of("/api/chat").on("connection", (socket) => {
	const nick = randomLogin();
	map.set(socket.id, nick);

	socket.emit("message", { msg: "Welcome #" + nick, currUserId: nick });
	socket.broadcast.emit('message', { msg: nick + ' connected chat'});
	
	chat.emit("activeUsers", Array.from(map.values()));

	socket.on("message", (msg) => {
		console.log("message: " + msg);
		chat.emit("message", { msg, user: map.get(socket.id) });
	});

	socket.on("disconnect", () => {
		map.delete(socket.id);
		chat.emit("activeUsers", Array.from(map.values()));
		socket.broadcast.emit('message', { msg: '~ ' + nick + ' disconnected'});
		console.log("Client disconnected");
	});
});

app.get("*", function (req, res) {
	const fileDirectory = path.resolve(__dirname, ".", "public/");

	res.sendFile("index.html", { root: fileDirectory });
});


/* Run the application */
server.listen(port, () => console.log("Chat server started...", { port, v }));
