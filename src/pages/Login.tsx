
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  console.log('🔑 Login component STARTING render');
  console.log('🔑 Login component file loaded successfully');
  
  try {
    console.log('🔑 Login component entering try block');
    
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    console.log('🔑 Login useState hooks initialized');
    
    const { signInWithEmail, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    
    console.log('🔑 Login hooks initialized successfully');
    console.log('🔑 Login state:', { 
      user: user?.email || 'No user', 
      authLoading,
      hasUser: !!user,
      email,
      loading,
      message: message.substring(0, 50)
    });

    // Redirect if already logged in
    useEffect(() => {
      console.log('🔑 Login useEffect running - redirect check');
      if (user && !authLoading) {
        console.log('🔑 User is already logged in, redirecting to home');
        navigate('/home');
      }
    }, [user, authLoading, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      console.log('🔑 Form submitted with email:', email);
      setLoading(true);
      setMessage('');

      try {
        const { error } = await signInWithEmail(email);
        
        if (error) {
          console.error('🔑 Sign in error:', error);
          setMessage(`Error: ${error.message}`);
        } else {
          console.log('🔑 Sign in successful');
          setMessage('Check your email! We sent you a magic link to sign in.');
          setEmail('');
        }
      } catch (error: any) {
        console.error('🔑 Unexpected error:', error);
        setMessage('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    // Show loading while checking auth state
    if (authLoading) {
      console.log('🔑 Showing auth loading state');
      return (
        <div style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: 'yellow',
          color: 'black',
          fontSize: '20px',
          zIndex: 9999
        }}>
          <div>🔄 Loading authentication...</div>
        </div>
      );
    }

    // Don't render login form if user is already authenticated
    if (user) {
      console.log('🔑 User authenticated, not rendering login form');
      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'green',
          color: 'white',
          fontSize: '20px',
          zIndex: 9999
        }}>
          🔑 User is authenticated, redirecting...
        </div>
      );
    }

    console.log('🔑 About to render login form');
    
    const loginForm = (
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        backgroundColor: '#f5f5f5',
        padding: '20px',
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px',
          border: '2px solid #007bff'
        }}>
          <h1 style={{ 
            textAlign: 'center', 
            marginBottom: '30px',
            color: '#333'
          }}>
            🔑 Welcome Back
          </h1>
          
          <p style={{ 
            textAlign: 'center', 
            marginBottom: '30px',
            color: '#666'
          }}>
            Sign in to upload and share your videos
          </p>

          <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="email" style={{ 
                display: 'block', 
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  console.log('🔑 Email input changed:', e.target.value);
                  setEmail(e.target.value);
                }}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading || !email.trim()}
              onClick={() => console.log('🔑 Submit button clicked')}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading || !email.trim() ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                cursor: loading || !email.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? "Sending Magic Link..." : "Send Magic Link"}
            </button>
          </form>

          {message && (
            <div style={{
              padding: '10px',
              backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e8',
              color: message.includes('Error') ? '#c62828' : '#2e7d32',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {message}
            </div>
          )}

          <div style={{ 
            textAlign: 'center', 
            fontSize: '14px',
            color: '#666',
            marginTop: '20px'
          }}>
            <p>We'll send you a secure link to sign in instantly.</p>
            <p style={{ marginTop: '8px' }}>No password required!</p>
          </div>
          
          <div style={{
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#e8f4f8',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#333'
          }}>
            🔍 Debug: Component rendered successfully at {new Date().toISOString()}
          </div>
        </div>
      </div>
    );
    
    console.log('🔑 Login form JSX created, returning');
    return loginForm;
    
  } catch (error: any) {
    console.error('🔑 CRITICAL ERROR in Login component:', error);
    console.error('🔑 Error stack:', error?.stack);
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'red',
        color: 'white',
        fontSize: '18px',
        zIndex: 9999,
        flexDirection: 'column'
      }}>
        <h1>🔑 CRITICAL LOGIN ERROR</h1>
        <p>Error: {error?.message || 'Unknown error'}</p>
        <pre style={{ fontSize: '12px', marginTop: '10px', maxWidth: '80%', overflow: 'auto' }}>
          {error?.stack}
        </pre>
      </div>
    );
  }
};

export default Login;
