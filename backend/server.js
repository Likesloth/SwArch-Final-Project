const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/counterdb';
mongoose
    .connect(mongoURI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB', err));

// Define Counter Schema and Model
const counterSchema = new mongoose.Schema({
    value: { type: Number, required: true },
});

const Counter = mongoose.model('Counter', counterSchema);

// Initialize Counter if Not Exists
Counter.findOne().then((counter) => {
    if (!counter) {
        const newCounter = new Counter({ value: 0 });
        newCounter.save();
    }
});

// Default Route
app.get('/', (req, res) => {
    res.send('Welcome to the Backend Server');
});

// Routes
app.get('/api/counter', async (req, res) => {
    const counter = await Counter.findOne();
    res.send({ counter: counter.value });
});

app.post('/api/counter', async (req, res) => {
    const { increment } = req.body;
    const counter = await Counter.findOne();
    counter.value = increment;
    await counter.save();
    res.send({ counter: counter.value });
});

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
