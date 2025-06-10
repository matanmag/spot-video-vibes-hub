
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

// Step-by-step restoration component for debugging
const DebugApp = () => {
  const [step, setStep] = useState(0);
  
  console.log('DebugApp rendering, step:', step);

  const steps = [
    'Basic React',
    'Add Providers',
    'Add Router', 
    'Add Auth',
    'Add Routes',
    'Full App'
  ];

  try {
    return (
      <div style={{ padding: '20px' }}>
        <h1>🔧 Debug Mode - Step {step}: {steps[step]}</h1>
        
        <div style={{ margin: '20px 0' }}>
          {steps.map((stepName, index) => (
            <Button 
              key={index}
              onClick={() => setStep(index)}
              variant={step === index ? "default" : "outline"}
              style={{ margin: '5px' }}
            >
              {index}: {stepName}
            </Button>
          ))}
        </div>

        <div style={{ padding: '20px', border: '1px solid #ccc', minHeight: '200px' }}>
          {step === 0 && <BasicTest />}
          {step === 1 && <ProvidersTest />}
          {step === 2 && <RouterTest />}
          {step === 3 && <AuthTest />}
          {step === 4 && <RoutesTest />}
          {step === 5 && <FullAppTest />}
        </div>
      </div>
    );
  } catch (error) {
    console.error('DebugApp error:', error);
    return (
      <div style={{ color: 'red', padding: '20px' }}>
        Error in DebugApp: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }
};

const BasicTest = () => {
  console.log('BasicTest rendering');
  return <div>✅ Basic React rendering works</div>;
};

const ProvidersTest = () => {
  console.log('ProvidersTest rendering');
  try {
    const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');
    const { TooltipProvider } = require('@/components/ui/tooltip');
    
    const queryClient = new QueryClient();
    
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div>✅ Providers (QueryClient, Tooltip) work</div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error('ProvidersTest error:', error);
    return <div style={{ color: 'red' }}>❌ Providers failed: {error instanceof Error ? error.message : 'Unknown'}</div>;
  }
};

const RouterTest = () => {
  console.log('RouterTest rendering');
  try {
    const { BrowserRouter } = require('react-router-dom');
    
    return (
      <BrowserRouter>
        <div>✅ React Router works</div>
      </BrowserRouter>
    );
  } catch (error) {
    console.error('RouterTest error:', error);
    return <div style={{ color: 'red' }}>❌ Router failed: {error instanceof Error ? error.message : 'Unknown'}</div>;
  }
};

const AuthTest = () => {
  console.log('AuthTest rendering');
  try {
    const { AuthProvider } = require('@/hooks/useAuth');
    
    return (
      <AuthProvider>
        <div>✅ Auth Provider works</div>
      </AuthProvider>
    );
  } catch (error) {
    console.error('AuthTest error:', error);
    return <div style={{ color: 'red' }}>❌ Auth failed: {error instanceof Error ? error.message : 'Unknown'}</div>;
  }
};

const RoutesTest = () => {
  console.log('RoutesTest rendering');
  try {
    const { BrowserRouter, Routes, Route } = require('react-router-dom');
    const Index = require('../pages/Index').default;
    
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
      </BrowserRouter>
    );
  } catch (error) {
    console.error('RoutesTest error:', error);
    return <div style={{ color: 'red' }}>❌ Routes failed: {error instanceof Error ? error.message : 'Unknown'}</div>;
  }
};

const FullAppTest = () => {
  console.log('FullAppTest rendering - attempting full app');
  try {
    // This will try to render the full original app
    return <div>🚀 Ready to restore full app</div>;
  } catch (error) {
    console.error('FullAppTest error:', error);
    return <div style={{ color: 'red' }}>❌ Full app failed: {error instanceof Error ? error.message : 'Unknown'}</div>;
  }
};

export default DebugApp;
