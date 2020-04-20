/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var express = __webpack_require__(1);

var topic = "test"; // kafka chat topik

var defaultPort = 8080;

var path = __webpack_require__(2);

var fs = __webpack_require__(3);

function getPort() {
  return process.argv.filter(function (a) {
    return a.startsWith("port");
  }).map(function (val) {
    return Number(val.split(/[ =]+/g)[1] || defaultPort);
  }).pop() || defaultPort;
}

var port = getPort(); // should be possible to overide the port via console arg

var v = 10; // indicating app version from kubernetes logs

var app = express();

var server = __webpack_require__(4).Server(app);

var io = __webpack_require__(5)(server);

app.use(express["static"]("build/public"));
app.get("/api", function (req, res) {
  return res.json(process.env);
}); // test rest api

/* this is for testing connection, will be removed later */

io.of("/api/ping").on("connection", function (socket) {
  // ping
  var i = 0;

  var _int = setInterval(function () {
    socket.emit("message", {
      id: i + "bacon"
    });
    i++;
  }, 1000);

  socket.on("disconnect", function () {
    clearInterval(_int);
    console.log("Client disconnected");
  });
});
var map = new Map();

function random(limit) {
  return Math.floor(Math.random() * limit);
}

function randomLogin() {
  var one = ['Funny', 'Stinky', 'Happy', 'Weird', 'Successful', 'Giant', 'Lucky'];
  var two = ['Cow', 'Bacon', 'Parrot', 'Hamster', 'Arnold', 'Cat', 'Hacker'];
  return one[random(one.length - 1)] + two[random(two.length - 1)] + random(100);
}
/** Chat Websocket logic is here */


var chat = io.of("/api/chat").on("connection", function (socket) {
  var nick = randomLogin();
  map.set(socket.id, nick);
  socket.emit('message', {
    msg: 'Your name is #' + nick
  });
  socket.on("message", function (msg) {
    console.log("message: " + msg);
    chat.emit("message", {
      msg: msg,
      user: map.get(socket.id)
    });
  });
  socket.on("disconnect", function () {
    map["delete"](socket.id);
    console.log("Client disconnected");
  });
});
app.get('*', function (req, res) {
  var fileDirectory = path.resolve(__dirname, '.', 'public/');
  res.sendFile('index.html', {
    root: fileDirectory
  });
});
/* Kafka configuration, ignore for now */

if (process.env.kafkaEnabled) {
  var kafka = __webpack_require__(6),
      Producer = kafka.Producer,
      ConsumerGroup = kafka.ConsumerGroup,
      client = new kafka.KafkaClient({
    kafkaHost: "my-kafka:9092"
  }),
      producer = new Producer(client, {
    // Configuration for when to consider a message as acknowledged, default 1
    requireAcks: 1,
    // The amount of time in milliseconds to wait for all acks before considered, default 100ms
    ackTimeoutMs: 100,
    // Partitioner type (default = 0, random = 1, cyclic = 2, keyed = 3, custom = 4), default 0
    partitionerType: 2
  });

  var options = {
    kafkaHost: "my-kafka:9092",
    // connect directly to kafka broker (instantiates a KafkaClient)
    batch: undefined,
    // put client batch settings if you need them
    ssl: true,
    // optional (defaults to false) or tls options hash
    groupId: "ExampleTestGroup",
    sessionTimeout: 15000,
    // An array of partition assignment protocols ordered by preference.
    // 'roundrobin' or 'range' string for built ins (see below to pass in custom assignment protocol)
    protocol: ["roundrobin"],
    encoding: "utf8",
    // default is utf8, use 'buffer' for binary data
    // Offsets to use for new groups other options could be 'earliest' or 'none' (none will emit an error if no offsets were saved)
    // equivalent to Java client's auto.offset.reset
    fromOffset: "latest",
    // default
    commitOffsetsOnFirstJoin: true,
    // on the very first time this consumer group subscribes to a topic, record the offset returned in fromOffset (latest/earliest)
    // how to recover from OutOfRangeOffset error (where save offset is past server retention) accepts same value as fromOffset
    outOfRangeOffset: "earliest",
    // default
    // Callback to allow consumers with autoCommit false a chance to commit before a rebalance finishes
    // isAlreadyMember will be false on the first connection, and true on rebalances triggered after that
    onRebalance: function onRebalance(isAlreadyMember, callback) {
      callback();
    } // or null

  };
  var consumerGroup = new ConsumerGroup(options, topic);
  producer.on("ready", function () {
    var payloads = [{
      topic: topic,
      messages: ["test"]
    }];
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


server.listen(port, function () {
  return console.log("Chat server started...", {
    port: port,
    v: v
  });
});
console.log({
  __filename: __filename,
  __dirname: __dirname
});
fs.readdir(__dirname, function (err, files) {
  files.forEach(function (file) {
    console.log(file);
  });
});

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = require("fs");

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = require("http");

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = require("socket.io");

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = require("kafka-node");

/***/ })
/******/ ]);