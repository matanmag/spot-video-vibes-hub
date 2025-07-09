import { useState } from 'react';
import { TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useTrendingVideos } from '@/hooks/useTrendingVideos';

const Trending = () => {
  const [daysBack, setDaysBack] = useState(7);
  const { videos, isLoading, error, refetch } = useTrendingVideos(daysBack);

  const handleRefresh = () => {
    refetch();
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-turquoise" />
              <h1 className="text-3xl font-bold">Trending</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Time Period Filter */}
              <div className="flex gap-1">
                {[1, 7, 30].map((days) => (
                  <Button
                    key={days}
                    variant={daysBack === days ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDaysBack(days)}
                  >
                    {days === 1 ? 'Today' : `${days}d`}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <Card className="border-destructive/50 bg-destructive/10 mb-6">
              <CardContent className="flex items-center gap-2 p-4">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm font-medium">Failed to load trending videos</p>
                  <p className="text-xs text-muted-foreground">
                    {error.message || 'Please try again later'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="ml-auto"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="flex gap-4 p-4">
                    <Skeleton className="w-24 h-16 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Videos List */}
          {!isLoading && !error && (
            <>
              {videos.length === 0 ? (
                <div className="text-center py-16">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">No trending videos</h3>
                  <p className="text-muted-foreground">
                    {daysBack === 1 
                      ? "No videos are trending today. Check back later!" 
                      : `No videos are trending in the last ${daysBack} days.`
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {videos.map((video, index) => (
                    <Card key={video.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="flex gap-4 p-4">
                        {/* Rank */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-turquoise to-blue-600 text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        
                        {/* Thumbnail */}
                        <div className="relative w-24 h-16 bg-muted rounded overflow-hidden">
                          {video.thumbnail_url ? (
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                              No thumbnail
                            </div>
                          )}
                        </div>

                        {/* Video Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold line-clamp-2 mb-1">
                            {video.title}
                          </h3>
                          
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span>@{video.user_email?.split('@')[0] || 'user'}</span>
                            {video.spot_name && (
                              <>
                                <span>•</span>
                                <span>📍 {video.spot_name}</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="text-xs">
                              {formatViews(video.views)} views
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              ❤️ {video.likes_count}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(video.created_at)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trending;