const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:1234@rabbitmq:5672';
const BROKER_EXCHANGE_NAME = process.env.BROKER_EXCHANGE_NAME || 'clicker-events';
const QUEUE_NAME = 'history-service'; // Explicit queue name

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    // Declare the exchange
    await channel.assertExchange(BROKER_EXCHANGE_NAME, 'fanout', { durable: true });

    // Declare the queue with an explicit name
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Bind the queue to the exchange
    await channel.bindQueue(QUEUE_NAME, BROKER_EXCHANGE_NAME, '');

    console.log(`Queue "${QUEUE_NAME}" is bound to exchange "${BROKER_EXCHANGE_NAME}"`);

    // Consume messages from the queue
    channel.consume(QUEUE_NAME, (msg) => {
      if (msg) {
        const event = JSON.parse(msg.content.toString());
        console.log('Received event:', event);

        // Save the event to the database or process it further here
        // Example: saveToDatabase(event);
      }
    }, { noAck: true });

    console.log('Waiting for messages...');
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
  }
}

// Connect to RabbitMQ
connectRabbitMQ();
