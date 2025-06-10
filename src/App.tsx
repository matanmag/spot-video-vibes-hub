
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SafeTestWrapper } from './components/SafeTestWrapper';
import { AuthProvider } from './hooks/useAuth';
import Index from './pages/Index';
import Login from './pages/Login';

const DebugLocation = () => {
  const location = useLocation();
  console.log('🔍 Current location:', {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash
  });
  return null;
};

const App = () => {
  console.log('🚀 App component rendering - Step 2: Adding Index page with AuthProvider and Login route');
  
  return (
    <AuthProvider>
      <BrowserRouter>
        <DebugLocation />
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
            <Route 
              path="/login" 
              element={
                <SafeTestWrapper componentName="Login">
                  <Login />
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
