
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SafeTestWrapper } from './components/SafeTestWrapper';
import { AuthProvider } from './hooks/useAuth';
import Index from './pages/Index';
import Login from './pages/Login';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Profile from './pages/Profile';

const DebugLocation = () => {
  const location = useLocation();
  console.log('🔍 Current location:', {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash
  });
  console.log('🔍 Exact pathname for matching:', `"${location.pathname}"`);
  console.log('🔍 Pathname length:', location.pathname.length);
  return null;
};

const App = () => {
  console.log('🚀 App component rendering - Step 3: Adding all main routes with SafeTestWrapper');
  
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
            <Route 
              path="/home" 
              element={
                <SafeTestWrapper componentName="Home">
                  <Home />
                </SafeTestWrapper>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <SafeTestWrapper componentName="Upload">
                  <Upload />
                </SafeTestWrapper>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <SafeTestWrapper componentName="Profile">
                  <Profile />
                </SafeTestWrapper>
              } 
            />
            <Route 
              path="*" 
              element={
                <div>
                  <div>❓ Unknown route</div>
                  <div>Current pathname: "{window.location.pathname}"</div>
                  <div>Pathname length: {window.location.pathname.length}</div>
                  <div>Available routes: ["/", "/login", "/home", "/upload", "/profile"]</div>
                </div>
              } 
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
