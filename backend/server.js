const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const pluginClient = require('./pluginClient');
const amqp = require('amqplib');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Counter schema and model
const counterSchema = new mongoose.Schema({ value: Number });
const Counter = mongoose.model('Counter', counterSchema);

// ** Define the History schema and model **
const historySchema = new mongoose.Schema({
  action: String,
  value: Number,
  timestamp: Date,
});
const History = mongoose.model('History', historySchema);

// Initialize counter value if not exists
Counter.findOne().then((counter) => {
  if (!counter) {
    new Counter({ value: 0 }).save();
  }
});

// RabbitMQ Setup
let channel;

async function connectRabbitMQ() {
  const RETRY_INTERVAL = 5000; // Retry every 5 seconds
  const MAX_RETRIES = 10;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const connection = await amqp.connect(process.env.RABBITMQ_URL);
      channel = await connection.createChannel();

      // Declare the `clicker-events` exchange in fanout mode
      await channel.assertExchange(process.env.BROKER_EXCHANGE_NAME, 'fanout', { durable: true });
      console.log(`Exchange "${process.env.BROKER_EXCHANGE_NAME}" declared`);

      return;
    } catch (err) {
      retries++;
      console.error(`RabbitMQ connection failed. Retry ${retries}/${MAX_RETRIES}...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
    }
  }

  console.error('Failed to connect to RabbitMQ after maximum retries');
  process.exit(1); // Exit process if connection fails
}

// Route to get history
app.get('/api/history', async (req, res) => {
  try {
    const history = await History.find().sort({ timestamp: -1 }); // Sort by most recent first
    res.json(history);
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).send('Internal Server Error');
  }
});

// RabbitMQ connection
connectRabbitMQ();

function publishEvent(action, value) {
  const event = { action, value, timestamp: new Date() };
  if (channel) {
    channel.publish(process.env.BROKER_EXCHANGE_NAME, '', Buffer.from(JSON.stringify(event)));
    console.log(`Published event to RabbitMQ: ${JSON.stringify(event)}`);
  }
}

// Routes

// GET route for counter
app.get('/api/counter', async (req, res) => {
  try {
    const counter = await Counter.findOne();
    res.json({ counter: counter.value });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// POST route to update counter
app.post('/api/counter', async (req, res) => {
  const { increment } = req.body;

  try {
    const counter = await Counter.findOne();
    if (!counter) return res.status(404).send('Counter not found');

    pluginClient.manipulateCounter({ currentValue: counter.value }, async (err, response) => {
      if (err) {
        console.error('Error processing gRPC request:', err);
        return res.status(500).send('Internal Server Error');
      }

      counter.value = response.newValue;
      await counter.save();

      publishEvent('increase', counter.value);

      res.json({ counter: counter.value });
    });
  } catch (err) {
    console.error('Error updating counter:', err);
    res.status(500).send('Internal Server Error');
  }
});

// POST route for decreasing the counter
app.post('/api/counter/decrease', async (req, res) => {
  try {
    const counter = await Counter.findOne();
    if (!counter) return res.status(404).send('Counter not found');

    counter.value -= 1;
    await counter.save();

    publishEvent('decrease', counter.value);

    res.json({ counter: counter.value });
  } catch (err) {
    console.error('Error updating counter:', err);
    res.status(500).send('Internal Server Error');
  }
});

// New route for `/api/` to respond with a simple message
app.get('/api/', (req, res) => {
  res.send('API is working');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
