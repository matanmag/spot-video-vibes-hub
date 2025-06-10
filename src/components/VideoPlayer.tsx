
import { useNetworkQuality } from '@/hooks/useNetworkQuality';
import { useVideoPlayerState } from '@/hooks/useVideoPlayerState';
import { useVideoPlayerEffects } from '@/hooks/useVideoPlayerEffects';
import VideoPlayerControls from '@/components/VideoPlayerControls';
import VideoPlayerOverlays from '@/components/VideoPlayerOverlays';

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
  const {
    videoRef,
    isPlaying,
    setIsPlaying,
    isInView,
    setIsInView,
    currentQuality,
    setCurrentQuality,
    isBuffering,
    setIsBuffering,
    showControls,
    setShowControls
  } = useVideoPlayerState();

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

  useVideoPlayerEffects({
    video,
    containerRef,
    videoRef,
    currentVideoUrl,
    setIsInView,
    setIsPlaying
  });

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

      <VideoPlayerOverlays
        isBuffering={isBuffering}
        isPlaying={isPlaying}
        isInView={isInView}
      />

      <VideoPlayerControls
        video={video}
        showControls={showControls}
        isBuffering={isBuffering}
        currentQuality={currentQuality}
        networkQuality={networkQuality}
        optimalQuality={optimalQuality}
        onQualityChange={handleQualityChange}
        getVideoUrl={getVideoUrl}
      />
    </>
  );
};

export default VideoPlayer;
