const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const pluginClient = require('./pluginClient');

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

// Initialize counter value if not exists
Counter.findOne().then((counter) => {
  if (!counter) {
    new Counter({ value: 0 }).save();
  }
});

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
// POST endpoint to update the counter
app.post('/api/counter', async (req, res) => {
  const { increment } = req.body;

  try {
    // Retrieve the current counter value from the database
    const counter = await Counter.findOne();
    if (!counter) {
      return res.status(404).send('Counter not found');
    }

    // Call the gRPC service to manipulate the counter
    pluginClient.manipulateCounter({ currentValue: counter.value }, async (err, response) => {
      if (err) {
        console.error('Error processing gRPC request:', err);
        return res.status(500).send('Internal Server Error');
      }

      // Update the counter in the database with the new value
      counter.value = response.newValue;
      await counter.save();

      res.json({ counter: counter.value });
    });
  } catch (err) {
    console.error('Error processing increase request:', err);
    res.status(500).send('Internal Server Error');
  }
});


// New route for decreasing the counter (direct database operation)
app.post('/api/counter/decrease', async (req, res) => {
  try {
    // Find the counter document
    const counter = await Counter.findOne();
    if (!counter) {
      return res.status(404).send('Counter not found');
    }

    // Decrease the counter value by 1
    counter.value -= 1;
    await counter.save();

    res.json({ counter: counter.value });
  } catch (err) {
    console.error('Error processing decrease request:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
