
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  console.log('🏠 Index page rendering');
  
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  console.log('🏠 Index page state:', { 
    hasUser: !!user, 
    userEmail: user?.email || 'No user', 
    loading 
  });

  const handleGetStarted = () => {
    console.log('🏠 Get Started clicked');
    if (user) {
      console.log('🏠 User authenticated, navigating to home');
      navigate('/home');
    } else {
      console.log('🏠 No user, navigating to login');
      navigate('/login');
    }
  };

  if (loading) {
    console.log('🏠 Index page showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  console.log('🏠 Index page rendering main content');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your App</h1>
        <p className="text-xl text-muted-foreground mb-8">
          {user ? `Welcome back, ${user.email}!` : "Start building your amazing project here!"}
        </p>
        <Button onClick={handleGetStarted} size="lg">
          {user ? "Go to Home" : "Get Started"}
        </Button>
      </div>
    </div>
  );
};

export default Index;
