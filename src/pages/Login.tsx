
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  console.log('🔑 Login component rendering');
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { signInWithEmail, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  console.log('🔑 Login state:', { 
    user: user?.email || 'No user', 
    authLoading,
    hasUser: !!user 
  });

  // Redirect if already logged in
  useEffect(() => {
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
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div>Loading authentication...</div>
      </div>
    );
  }

  // Don't render login form if user is already authenticated
  if (user) {
    console.log('🔑 User authenticated, not rendering login form');
    return null;
  }

  console.log('🔑 Rendering login form');
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          color: '#333'
        }}>
          Welcome Back
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
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !email.trim()}
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
      </div>
    </div>
  );
};

export default Login;
