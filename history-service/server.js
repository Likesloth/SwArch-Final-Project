const express = require('express');
const amqp = require('amqplib');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // Import cors

// Express app
const app = express(); // Initialize app here
const PORT = 3001;

// Middleware
app.use(cors()); // Move this here, after initializing `app`
app.use(express.json());

// RabbitMQ configuration
const RABBITMQ_URL = 'amqp://admin:1234@rabbitmq:5672'; // Replace with actual RabbitMQ URL if needed
const BROKER_EXCHANGE_NAME = 'clicker-events'; // Name of the exchange
const QUEUE_NAME = 'history-service'; // Explicit queue name

// MongoDB connection
mongoose
  .connect('mongodb://mongo:27017/historydb', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Define a schema for the history collection
const historySchema = new mongoose.Schema({
  action: String,
  value: Number,
  timestamp: Date,
});

// Create the History model
const History = mongoose.model('History', historySchema);

// HTTP Server & Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// API endpoint to fetch history records
app.get('/api/history', async (req, res) => {
  try {
    const historyRecords = await History.find().sort({ timestamp: -1 }); // Sort by most recent
    res.json(historyRecords);
  } catch (err) {
    console.error('Failed to fetch history records:', err);
    res.status(500).json({ error: 'Failed to fetch history records' });
  }
});

// Connect to RabbitMQ
async function connectRabbitMQ() {
  const RETRY_INTERVAL = 5000; // 5 seconds
  const MAX_RETRIES = 10;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      // Connect to RabbitMQ
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();

      // Declare exchange and queue
      await channel.assertExchange(BROKER_EXCHANGE_NAME, 'fanout', { durable: true });
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      await channel.bindQueue(QUEUE_NAME, BROKER_EXCHANGE_NAME, ''); //clicker-events

      console.log(`Queue "${QUEUE_NAME}" is bound to exchange "${BROKER_EXCHANGE_NAME}"`);

      // Consume messages from the queue
      channel.consume(
        QUEUE_NAME, //history-service
        async (msg) => {
          if (msg) {
            const event = JSON.parse(msg.content.toString());
            console.log('Received event:', event);

            // Save the event to MongoDB
            try {
              const history = new History(event);
              await history.save();
              console.log('Event saved to database:', event);

              // Broadcast event to WebSocket clients
              io.emit('new-event', event);
              console.log('Broadcasting new event to WebSocket clients:', event);
            } catch (dbError) {
              console.error('Failed to save event to database:', dbError);
            }
          }
        },
        { noAck: true }
      );

      console.log('Waiting for messages...');
      return; // Exit the retry loop on successful connection
    } catch (error) {
      retries++;
      console.error(
        `RabbitMQ connection failed. Retry ${retries}/${MAX_RETRIES} in ${RETRY_INTERVAL / 1000} seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL)); // Wait before retrying
    }
  }

  console.error('Failed to connect to RabbitMQ after maximum retries. Exiting...');
  process.exit(1); // Exit process on failure
}

// Start RabbitMQ connection
connectRabbitMQ();

// Start the server
server.listen(PORT, () => {
  console.log(`History service running on http://localhost:${PORT}`);
});
