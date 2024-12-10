import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import HistoryPage from './HistoryPage';
import io from 'socket.io-client';

function App() {
    const [counter, setCounter] = useState(0);

    // Use REACT_APP_SOCKET_URL from the .env file
    const socket = io(process.env.REACT_APP_SOCKET_URL); 

    useEffect(() => {
        // Fetch the current counter value from the backend using REACT_APP_BASE_URL
        fetch(`${process.env.REACT_APP_BASE_URL}/counter`)
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
        });

        // Clean up the socket connection on component unmount
        return () => {
            socket.disconnect();
        };
    }, [socket]);

    // Function to handle increment (increase) logic
    const increaseCounter = () => {
        fetch(`${process.env.REACT_APP_BASE_URL}/counter`, {
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
        fetch(`${process.env.REACT_APP_BASE_URL}/counter/decrease`, {
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
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={
                        <div style={{ textAlign: 'center', marginTop: '50px' }}>
                            <h1>Counter: {counter}</h1>
                            <button
                                onClick={increaseCounter}
                                style={{ padding: '10px 20px', fontSize: '18px', marginRight: '10px' }}
                            >
                                Increase
                            </button>
                            <button
                                onClick={decreaseCounter}
                                style={{ padding: '10px 20px', fontSize: '18px' }}
                            >
                                Decrease
                            </button>
                            <div style={{ marginTop: '20px' }}>
                                <Link to="/history">Go To History Page</Link>
                            </div>
                        </div>
                    }
                />
                <Route path="/history" element={<HistoryPage />} />
            </Routes>
        </Router>
    );
}

export default App;
