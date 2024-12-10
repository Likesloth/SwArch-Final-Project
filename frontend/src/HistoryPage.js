import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

function HistoryPage() {
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const socket = io('http://localhost:3001'); // Connect to history-service

        socket.on('connect', () => {
            console.log('Connected to Socket.IO server');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from Socket.IO server');
        });

        // Fetch initial history data
        fetch('http://localhost:3001/api/history')
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => setHistory(data))
            .catch((error) => console.error('Error fetching history:', error));

        // Listen for new events and update history state
        socket.on('new-event', (newEvent) => {
            console.log('New event received:', newEvent);

            // Add new event at the top of the list
            setHistory((prevHistory) => {
                const updatedHistory = [newEvent, ...prevHistory];
                return updatedHistory;
            });
        });

        // Clean up socket connection on unmount
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
