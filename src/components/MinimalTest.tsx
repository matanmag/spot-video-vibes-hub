
import React from 'react';

const MinimalTest = () => {
  console.log('🧪 MinimalTest component rendering');
  
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
      fontSize: '24px',
      fontWeight: 'bold',
      zIndex: 9999
    }}>
      🧪 MINIMAL TEST COMPONENT IS WORKING
    </div>
  );
};

export default MinimalTest;
