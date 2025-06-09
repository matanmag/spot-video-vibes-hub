
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Welcome Home!</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              {user?.email}
            </span>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-6 bg-card rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Upload</h2>
            <p className="text-muted-foreground mb-4">
              Upload and manage your files
            </p>
            <Button onClick={() => navigate('/upload')}>
              Go to Upload
            </Button>
          </div>

          <div className="p-6 bg-card rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Profile</h2>
            <p className="text-muted-foreground mb-4">
              View and edit your profile
            </p>
            <Button onClick={() => navigate('/profile')}>
              Go to Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
