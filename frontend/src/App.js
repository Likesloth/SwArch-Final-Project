import React, { useState, useEffect } from 'react';

function App() {
    const [counter, setCounter] = useState(0);

    useEffect(() => {
        // Fetch the initial counter value from the backend
        fetch(process.env.REACT_APP_BASE_URL + '/api/counter')
            .then((response) => response.json())
            .then((data) => setCounter(data.counter));
    }, []);

    const incrementCounter = () => {
        // Increment counter on the backend
        fetch(process.env.REACT_APP_BASE_URL + '/api/counter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ increment: counter + 1 }),
        })
            .then((response) => response.json())
            .then((data) => setCounter(data.counter));
    };

    const decrementCounter = () => {
        // Decrement counter on the backend
        fetch(process.env.REACT_APP_BASE_URL + '/api/counter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ increment: counter - 1 }),
        })
            .then((response) => response.json())
            .then((data) => setCounter(data.counter));
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Counter: {counter}</h1>
            <button
                onClick={incrementCounter}
                style={{
                    padding: '10px 20px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    marginRight: '10px',
                }}
            >
                Increase
            </button>
            <button
                onClick={decrementCounter}
                style={{
                    padding: '10px 20px',
                    fontSize: '18px',
                    cursor: 'pointer',
                }}
            >
                Decrease
            </button>
        </div>
    );
}

export default App;
