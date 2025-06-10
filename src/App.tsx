
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SafeTestWrapper } from './components/SafeTestWrapper';
import { AuthProvider } from './hooks/useAuth';
import Index from './pages/Index';

const App = () => {
  console.log('🚀 App component rendering - Step 2: Adding Index page with AuthProvider');
  
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ padding: '20px' }}>
          <Routes>
            <Route 
              path="/" 
              element={
                <SafeTestWrapper componentName="Index">
                  <Index />
                </SafeTestWrapper>
              } 
            />
            <Route path="*" element={<div>❓ Unknown route</div>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
