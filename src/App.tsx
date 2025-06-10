
import React from 'react';

// Temporary simplified App for debugging white screen issue
const App = () => {
  console.log('App component is rendering');
  
  try {
    return (
      <div style={{ padding: '20px', fontSize: '24px', color: 'green' }}>
        <h1>🟢 App is working! Basic rendering confirmed.</h1>
        <p>Timestamp: {new Date().toISOString()}</p>
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
          Hello World - React is functioning correctly
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in App component render:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>❌ App component error</h1>
        <pre>{error instanceof Error ? error.message : 'Unknown error'}</pre>
      </div>
    );
  }
};

export default App;
