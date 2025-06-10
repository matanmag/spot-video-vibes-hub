
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App = () => {
  console.log('🚀 App component rendering - Step 1: Basic Router');
  
  return (
    <BrowserRouter>
      <div style={{ padding: '20px', fontSize: '24px', color: 'green' }}>
        <Routes>
          <Route path="/" element={<div>✅ Router works! Basic routing is functional.</div>} />
          <Route path="*" element={<div>❓ Unknown route</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
