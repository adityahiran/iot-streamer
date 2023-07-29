require('dotenv').config();

const axios = require('axios');
const protobuf = require('protobufjs');
const { Kafka } = require('kafkajs');

const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler');
const scheduler = new ToadScheduler();

const kafka = new Kafka({
  clientId: 'iot-streamer',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

module.exports = async function poll(feedUsername, feedPassword) {
  const task = new Task('Poll for vehicle position', async () => {
    protobuf.load('./models/gtfs-realtime.proto', async function (err, root) {
      const FeedMessage = root.lookupType('transit_realtime.FeedMessage');

      const url = process.env.FEED_URL;
      const response = await axios(url, { responseType: 'arraybuffer' });
      const message = FeedMessage.decode(Buffer.from(response.data, 'binary'));
      const obj = FeedMessage.toObject(message);

      await producer.connect();

      obj['entity'].forEach(async (vehicleData) => {
        const message = {};
        message['vehicleId'] = vehicleData['vehicle']['vehicle']['id'];
        message['vehicleLabel'] = vehicleData['vehicle']['vehicle']['label'];
        message['latitude'] = vehicleData['vehicle']['position']['latitude'];
        message['longitude'] = vehicleData['vehicle']['position']['longitude'];
        message['timestamp'] = vehicleData['vehicle']['timestamp']['low'];
        message['tripId'] = vehicleData['vehicle']['trip']
          ? vehicleData['vehicle']['trip']['tripId']
          : 0;
        message['tripRouteId'] = vehicleData['vehicle']['trip']
          ? vehicleData['vehicle']['trip']['routeId']
          : 0;
        message['stopId'] = vehicleData['vehicle']['stopId'];
        message['currentStatus'] = vehicleData['vehicle']['currentStatus'];
        if (message['currentStatus'] === 0)
          message['currentStatusDescription'] = 'INCOMING_AT';
        else if (message['currentStatus'] === 1)
          message['currentStatusDescription'] = 'STOPPED_AT';
        else if (message['currentStatus'] === 2)
          message['currentStatusDescription'] = 'IN_TRANSIT_TO';
        await producer.send({
          topic: process.env.TOPIC,
          messages: [
            { key: message['vehicleId'], value: JSON.stringify(message) }
          ]
        });
      });
    });
  });
  const job = new SimpleIntervalJob(
    { seconds: process.env.FEED_REFRESH_INTERVAL },
    task
  );
  scheduler.addSimpleIntervalJob(job);
};
