
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Upload, User, Video } from 'lucide-react';

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
          <div className="flex items-center gap-3">
            <Video className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Video Platform</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              {user?.email}
            </span>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-card rounded-lg shadow border">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Upload Videos</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Upload and share your videos with automatic thumbnail generation
            </p>
            <Button onClick={() => navigate('/upload')} className="w-full">
              Upload New Video
            </Button>
          </div>

          <div className="p-6 bg-card rounded-lg shadow border">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Profile</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              View and edit your profile settings
            </p>
            <Button onClick={() => navigate('/profile')} variant="outline" className="w-full">
              Go to Profile
            </Button>
          </div>

          <div className="p-6 bg-card rounded-lg shadow border">
            <div className="flex items-center gap-3 mb-4">
              <Video className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">My Videos</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              View and manage your uploaded videos
            </p>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
