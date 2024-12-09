import React, { useState, useEffect } from 'react';

function App() {
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        // Fetch the current counter value from the backend
        fetch(`${process.env.REACT_APP_BASE_URL}/api/counter`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => setCounter(data.counter))
            .catch((error) => console.error('Error fetching counter:', error));
    }, []);

    // Function to handle increment (increase) logic
    const increaseCounter = () => {
        fetch(`${process.env.REACT_APP_BASE_URL}/api/counter`, {
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
        fetch(`${process.env.REACT_APP_BASE_URL}/api/counter/decrease`, {
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
        </div>
    );
}

export default App;
