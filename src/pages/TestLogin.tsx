
import React, { useState, useEffect } from 'react';

const TestLogin = () => {
  console.log('🔬 TestLogin component starting render');
  
  const [renderStep, setRenderStep] = useState(0);
  
  useEffect(() => {
    console.log('🔬 TestLogin useEffect running');
    setRenderStep(1);
  }, []);
  
  console.log('🔬 TestLogin rendering with step:', renderStep);
  
  try {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'blue',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        zIndex: 9999,
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>🔬 TEST LOGIN PAGE</h1>
        <p>Render step: {renderStep}</p>
        <p>Time: {new Date().toISOString()}</p>
        <button 
          onClick={() => {
            console.log('🔬 Test button clicked');
            alert('Test button works!');
          }}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: 'white',
            color: 'blue',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Test Button
        </button>
      </div>
    );
  } catch (error) {
    console.error('🔬 TestLogin render error:', error);
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'red',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        zIndex: 9999
      }}>
        🔬 TEST LOGIN ERROR: {error?.toString()}
      </div>
    );
  }
};

export default TestLogin;
