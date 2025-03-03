const WebSocket = require("ws");
const { Kafka } = require("kafkajs");

const kafka = new Kafka({ clientId: "stock-app", brokers: ["localhost:9092"] });
const consumer = kafka.consumer({ groupId: "stock-group" });

const wss = new WebSocket.Server({ port: 8082, host: '0.0.0.0' });

async function run() {
  await consumer.connect();
  await consumer.subscribe({ topic: "financial_forecast", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const stockData = JSON.parse(message.value.toString());
      console.log("Broadcasting:", stockData);

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(stockData));
        }
      });
    },
  });
}

run().catch(console.error);
