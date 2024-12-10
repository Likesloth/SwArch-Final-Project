import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HistoryPage from './HistoryPage';
import io from 'socket.io-client';

function App() {
    const [counter, setCounter] = useState(0);

    // Manually specify the socket URL
    const socket = io('http://localhost:3001'); // Replace with the actual history-service URL

    useEffect(() => {
        // Fetch the current counter value from the backend
        fetch('http://localhost:9000/api/counter') // Replace with your API backend URL
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => setCounter(data.counter))
            .catch((error) => console.error('Error fetching counter:', error));

        // Listen for real-time events from the socket
        socket.on('new-event', (event) => {
            console.log('New event received:', event);
            // Optionally handle updates based on real-time events
        });

        // Clean up the socket connection on component unmount
        return () => {
            socket.disconnect();
        };
    }, [socket]);

    // Function to handle increment (increase) logic
    const increaseCounter = () => {
        fetch('http://localhost:9000/api/counter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ increment: counter + 1 }), // Increment counter by 1
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => setCounter(data.counter)) // Update state with the new counter value
            .catch((error) => console.error('Error increasing counter:', error));
    };

    const decreaseCounter = () => {
        fetch('http://localhost:9000/api/counter/decrease', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => setCounter(data.counter)) // Update the counter state
            .catch((error) => console.error('Error decreasing counter:', error));
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Counter: {counter}</h1>
            <button onClick={increaseCounter} style={{ padding: '10px 20px', fontSize: '18px', marginRight: '10px' }}>
                Increase
            </button>
            <button onClick={decreaseCounter} style={{ padding: '10px 20px', fontSize: '18px' }}>
                Decrease
            </button>
            <Router>
                <nav>
                    <div><Link to="/">Home</Link></div>
                    <div><Link to="/history">Go To History Page</Link></div>
                </nav>
                <Routes>
                    <Route path="/"/>
                    <Route path="/history" element={<HistoryPage />} />
                </Routes>
            </Router>
        </div>
    );
}

export default App;
