
import { useEffect, useRef, useState } from 'react';
import { useVideoViews } from '@/hooks/useVideoViews';
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { Settings, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Video {
  id: string;
  title: string;
  video_url: string;
  optimized_720p_url?: string;
  optimized_480p_url?: string;
  optimized_1080p_url?: string;
  thumbnail_url?: string;
}

interface VideoPlayerProps {
  video: Video;
  containerRef: React.RefObject<HTMLDivElement>;
}

const VideoPlayer = ({ video, containerRef }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(false);
  
  const { trackView } = useVideoViews(video.id);
  const { networkQuality, optimalQuality } = useNetworkQuality();

  // Get video URL based on quality selection
  const getVideoUrl = (quality: string) => {
    if (quality === 'auto') {
      quality = optimalQuality;
    }

    switch (quality) {
      case '480p':
        return video.optimized_480p_url || video.video_url;
      case '720p':
        return video.optimized_720p_url || video.video_url;
      case '1080p':
        return video.optimized_1080p_url || video.video_url;
      default:
        return video.video_url;
    }
  };

  const currentVideoUrl = getVideoUrl(currentQuality);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsInView(entry.isIntersecting);
        
        if (videoRef.current) {
          if (entry.isIntersecting) {
            trackView();
            
            videoRef.current.play().then(() => {
              setIsPlaying(true);
            }).catch((error) => {
              console.error('Error playing video:', error);
            });
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [containerRef, trackView]);

  // Update video source when quality changes
  useEffect(() => {
    if (videoRef.current && currentVideoUrl) {
      const currentTime = videoRef.current.currentTime;
      const wasPlaying = !videoRef.current.paused;
      
      videoRef.current.src = currentVideoUrl;
      videoRef.current.currentTime = currentTime;
      
      if (wasPlaying) {
        videoRef.current.play();
      }
    }
  }, [currentVideoUrl]);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleQualityChange = (quality: string) => {
    setCurrentQuality(quality);
  };

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

  return (
    <>
      <video
        ref={videoRef}
        src={currentVideoUrl}
        className="h-full w-full object-cover cursor-pointer"
        muted
        loop
        playsInline
        poster={video.thumbnail_url}
        onClick={handleVideoClick}
        onLoadStart={() => {
          console.log(`Loading video: ${video.title} (${currentQuality})`);
          setIsBuffering(true);
        }}
        onCanPlay={() => {
          console.log(`Video ready: ${video.title} (${currentQuality})`);
          setIsBuffering(false);
        }}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onError={(e) => console.error(`Video error for ${video.title}:`, e)}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      />

      {/* Buffering indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Play/Pause indicator */}
      {!isPlaying && isInView && !isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
          </div>
        </div>
      )}

      {/* Quality controls */}
      {(showControls || isBuffering) && (
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
                  onClick={() => handleQualityChange(quality)}
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
      )}
    </>
  );
};

export default VideoPlayer;
