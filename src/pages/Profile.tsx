
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useVideoDeletion } from '@/hooks/useVideoDeletion';
import VideoCleanupButton from '@/components/VideoCleanupButton';
import { Database, HardDrive, Eye, Calendar } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { refreshStats, stats } = useVideoDeletion();
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoadingStats(true);
      await refreshStats();
      setIsLoadingStats(false);
    };
    
    loadStats();
  }, [refreshStats]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-20 max-w-2xl">
      <div className="space-y-6">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{user?.email}</p>
            </div>
            
            <Separator />
            
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              className="w-full"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Storage Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Storage Management
            </CardTitle>
            <CardDescription>
              Manage your video storage to reduce bandwidth usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingStats ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Loading storage statistics...</p>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Database className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">{stats.total_videos}</p>
                  <p className="text-xs text-muted-foreground">Total Videos</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <HardDrive className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">{stats.estimated_total_size_gb}GB</p>
                  <p className="text-xs text-muted-foreground">Storage Used</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Eye className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">{stats.low_view_videos}</p>
                  <p className="text-xs text-muted-foreground">Low Views (&lt;5)</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <p className="text-2xl font-bold">{stats.old_videos}</p>
                  <p className="text-xs text-muted-foreground">Old (&gt;30 days)</p>
                </div>
              </div>
            ) : null}
            
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Automatically delete videos that consume the most storage space to reduce egress costs.
                Priority is given to videos with multiple files, low views, and older content.
              </p>
              
              <VideoCleanupButton 
                count={4}
                className="w-full"
              />
              
              <Button
                onClick={refreshStats}
                variant="outline"
                className="w-full"
                disabled={isLoadingStats}
              >
                Refresh Statistics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
