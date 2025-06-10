
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  console.log('🔒 ProtectedRoute component rendering');
  
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  console.log('🔒 ProtectedRoute state:', { 
    user: user?.email || 'No user', 
    loading,
    hasUser: !!user 
  });

  useEffect(() => {
    if (!loading && !user) {
      console.log('🔒 User not authenticated, redirecting to login');
      navigate('/login');
    } else if (!loading && user) {
      console.log('🔒 User authenticated:', user.email);
    }
  }, [user, loading, navigate]);

  if (loading) {
    console.log('🔒 ProtectedRoute: Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Checking authentication...</div>
      </div>
    );
  }

  if (!user) {
    console.log('🔒 ProtectedRoute: No user, showing redirect message');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Redirecting to login...</div>
      </div>
    );
  }

  console.log('🔒 ProtectedRoute: Rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
