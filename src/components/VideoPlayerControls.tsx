
import { Settings, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NetworkQuality } from '@/hooks/useNetworkQuality';

interface Video {
  id: string;
  title: string;
  video_url: string;
  optimized_720p_url?: string;
  optimized_480p_url?: string;
  optimized_1080p_url?: string;
  thumbnail_url?: string;
}

interface VideoPlayerControlsProps {
  video: Video;
  showControls: boolean;
  isBuffering: boolean;
  currentQuality: string;
  networkQuality: NetworkQuality;
  optimalQuality: string;
  onQualityChange: (quality: string) => void;
  getVideoUrl: (quality: string) => string;
}

const VideoPlayerControls = ({
  video,
  showControls,
  isBuffering,
  currentQuality,
  networkQuality,
  optimalQuality,
  onQualityChange,
  getVideoUrl
}: VideoPlayerControlsProps) => {
  const availableQualities = ['auto', '480p', '720p', '1080p'].filter(quality => {
    if (quality === 'auto') return true;
    return getVideoUrl(quality) !== video.video_url || quality === 'original';
  });

  const getNetworkIcon = () => {
    switch (networkQuality) {
      case 'slow':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Wifi className="h-4 w-4 text-yellow-500" />;
      case 'fast':
        return <Wifi className="h-4 w-4 text-green-500" />;
    }
  };

  if (!showControls && !isBuffering) {
    return null;
  }

  return (
    <div className="absolute top-4 right-4 flex items-center gap-2">
      {getNetworkIcon()}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="bg-black/50 text-white hover:bg-black/70"
          >
            <Settings className="h-4 w-4" />
            <span className="ml-1 text-xs">
              {currentQuality === 'auto' ? `Auto (${optimalQuality})` : currentQuality}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {availableQualities.map((quality) => (
            <DropdownMenuItem
              key={quality}
              onClick={() => onQualityChange(quality)}
              className={currentQuality === quality ? 'bg-accent' : ''}
            >
              {quality === 'auto' ? `Auto (${optimalQuality})` : quality}
              {quality === 'auto' && (
                <span className="ml-2 text-xs text-muted-foreground">
                  Network: {networkQuality}
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default VideoPlayerControls;
