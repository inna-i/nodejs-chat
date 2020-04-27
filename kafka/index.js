const EventEmitter = require("events");
const { Producer, ConsumerGroup, KafkaClient } = require("kafka-node");
const KafkaAdapter = require("./KafkaSocketAdapter");
const topic = "test"; // kafka chat topic

const kafkaHost = "my-kafka.kafka.svc.cluster.local:9092";

function setupProducerAndConsumer(emitter) {
  const client = new KafkaClient({ kafkaHost }),
    producer = new Producer(client, {
      // Configuration for when to consider a message as acknowledged, default 1
      requireAcks: 1,
      // The amount of time in milliseconds to wait for all acks before considered, default 100ms
      ackTimeoutMs: 100,
      // Partitioner type (default = 0, random = 1, cyclic = 2, keyed = 3, custom = 4), default 0
      partitionerType: 2,
    });

  const consumerGroup = new ConsumerGroup(
    {
      kafkaHost, // connect directly to kafka broker (instantiates a KafkaClient)
      groupId: process.env.HOSTNAME || "ExampleTestGroup",
      sessionTimeout: 15000,
      // An array of partition assignment protocols ordered by preference.
      // 'roundrobin' or 'range' string for built ins (see below to pass in custom assignment protocol)
      protocol: ["roundrobin"],
    },
    topic
  );

  producer.on("ready", function () {
    console.log("PRODUCER READY");
    emitter.on("kafka", (values) => {
      producer.send(
        [
          {
            topic,
            messages: [JSON.stringify(values)],
          },
        ],
        () => {}
      );
    });
  });

  producer.on("error", function (err) {
    console.log("Producer error", err);
  });

  consumerGroup.on("message", function (message) {
    emitter.emit("kafkaIncome", message);
  });
}

function enableKafka(io) {
  console.log("Enabling kafka...");
  const emitter = new EventEmitter();
  setupProducerAndConsumer(emitter);
  io.adapter((nsp) => new KafkaAdapter(nsp, { emitter }));
}

module.exports = enableKafka;
