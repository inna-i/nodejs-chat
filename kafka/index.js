const topic = "test"; // kafka chat topik

function kafka() {
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
}

module.exports = kafka;
