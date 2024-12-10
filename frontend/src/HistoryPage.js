import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function HistoryPage() {
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch history from the backend (history-service API)
        fetch('http://localhost:3001/api/history') // Replace with the correct API endpoint
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => setHistory(data))
            .catch((error) => console.error('Error fetching history:', error));
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>History</h1>
            <table
                style={{
                    margin: '0 auto',
                    borderCollapse: 'collapse',
                    width: '80%',
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
            <button
                onClick={() => navigate('/')}
                style={{
                    marginTop: '20px',
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                }}
            >
                Back to Counter
            </button>
        </div>
    );
}

export default HistoryPage;
