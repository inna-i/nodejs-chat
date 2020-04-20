const express = require("express");
const topic = "test"; // kafka chat topik
const defaultPort = 8080;
const path = require("path");
const fs = require("fs");

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

const map = new Map();

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

/** Chat Websocket logic is here */
const chat = io.of("/api/chat").on("connection", (socket) => {
  const nick = randomLogin();
  map.set(socket.id, nick);
  socket.emit("message", { msg: "Your name is #" + nick });

  socket.on("message", (msg) => {
    console.log("message: " + msg);
    chat.emit("message", { msg, user: map.get(socket.id) });
  });

  socket.on("disconnect", () => {
    map.delete(socket.id);
    console.log("Client disconnected");
  });
});

app.get("*", function (req, res) {
  const fileDirectory = path.resolve(__dirname, ".", "public/");

  res.sendFile("index.html", { root: fileDirectory });
});

/* Kafka configuration, ignore for now */
if (process.env.kafkaEnabled) {
  const kafka = require("kafka-node"),
    Producer = kafka.Producer,
    ConsumerGroup = kafka.ConsumerGroup,
    client = new kafka.KafkaClient({ kafkaHost: "my-kafka:9092" }),
    producer = new Producer(client, {
      // Configuration for when to consider a message as acknowledged, default 1
      requireAcks: 1,
      // The amount of time in milliseconds to wait for all acks before considered, default 100ms
      ackTimeoutMs: 100,
      // Partitioner type (default = 0, random = 1, cyclic = 2, keyed = 3, custom = 4), default 0
      partitionerType: 2,
    });

  const options = {
    kafkaHost: "my-kafka:9092", // connect directly to kafka broker (instantiates a KafkaClient)
    batch: undefined, // put client batch settings if you need them
    ssl: true, // optional (defaults to false) or tls options hash
    groupId: "ExampleTestGroup",
    sessionTimeout: 15000,
    // An array of partition assignment protocols ordered by preference.
    // 'roundrobin' or 'range' string for built ins (see below to pass in custom assignment protocol)
    protocol: ["roundrobin"],
    encoding: "utf8", // default is utf8, use 'buffer' for binary data

    // Offsets to use for new groups other options could be 'earliest' or 'none' (none will emit an error if no offsets were saved)
    // equivalent to Java client's auto.offset.reset
    fromOffset: "latest", // default
    commitOffsetsOnFirstJoin: true, // on the very first time this consumer group subscribes to a topic, record the offset returned in fromOffset (latest/earliest)
    // how to recover from OutOfRangeOffset error (where save offset is past server retention) accepts same value as fromOffset
    outOfRangeOffset: "earliest", // default
    // Callback to allow consumers with autoCommit false a chance to commit before a rebalance finishes
    // isAlreadyMember will be false on the first connection, and true on rebalances triggered after that
    onRebalance: (isAlreadyMember, callback) => {
      callback();
    }, // or null
  };

  const consumerGroup = new ConsumerGroup(options, topic);

  producer.on("ready", function () {
    const payloads = [{ topic, messages: ["test"] }];
    console.log("PRODUCER READY");
    producer.send(payloads, function (err, data) {
      console.log("Messages sent", payloads);
    });
  });

  producer.on("error", function (err) {
    console.log("Producer error", err);
  });

  consumerGroup.on("message", function (message) {
    console.log("-> new kafka message", message);
  });
}

/* Run the application */
server.listen(port, () => console.log("Chat server started...", { port, v }));
