import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

function HistoryPage() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        // Fetch initial history data from the backend
        fetch(`${process.env.REACT_APP_SOCKET_URL}/api/history`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                setHistory(data); // Set the initial history data from the backend
            })
            .catch((error) => console.error('Error fetching history:', error));

        // Connect to WebSocket for real-time updates
        const socket = io(process.env.REACT_APP_SOCKET_URL);

        socket.on('connect', () => {
            console.log('Connected to Socket.IO server');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from Socket.IO server');
        });

        // Listen for new events and update the history state
        socket.on('new-event', (newEvent) => {
            console.log('New event received:', newEvent);

            setHistory((prevHistory) => [newEvent, ...prevHistory]); // Add the new event to the top of the history
        });

        // Clean up the WebSocket connection when the component is unmounted
        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>History</h1>
            <div
                style={{
                    margin: '0 auto',
                    width: '80%',
                    maxHeight: '400px', // Set a fixed height for the scrollable container
                    overflowY: 'auto', // Enable vertical scrolling
                    border: '1px solid #ddd', // Optional: border for better visibility
                }}
            >
                <table
                    style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        textAlign: 'left',
                    }}
                >
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Date/Time</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Event Type</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Current Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((event, index) => (
                            <tr key={index}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    {new Date(event.timestamp).toLocaleString()}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{event.action}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{event.value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default HistoryPage;
