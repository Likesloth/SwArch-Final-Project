const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// MongoDB schema and model (re-use the schema)
const historySchema = new mongoose.Schema({
  action: String,
  value: Number,
  timestamp: Date,
});
const History = mongoose.model('History', historySchema);

// Initialize Express.js
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Endpoint: Get all history records
app.get('/api/history', async (req, res) => {
  try {
    const historyRecords = await History.find().sort({ timestamp: -1 }); // Sort by most recent
    res.json(historyRecords);
  } catch (err) {
    console.error('Failed to fetch history records:', err);
    res.status(500).json({ error: 'Failed to fetch history records' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`History Service running on http://localhost:${PORT}`);
});


