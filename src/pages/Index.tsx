
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };

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
