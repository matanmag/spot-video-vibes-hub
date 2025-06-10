
import { useEffect, useRef, useState, useCallback } from 'react';
import { useVideoViews } from '@/hooks/useVideoViews';

interface Video {
  id: string;
  title: string;
  video_url: string;
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
  const { trackView } = useVideoViews(video.id);

  const handlePlayVideo = useCallback(async () => {
    if (videoRef.current) {
      try {
        await videoRef.current.play();
        setIsPlaying(true);
        trackView();
      } catch (error) {
        console.error('Error playing video:', error);
      }
    }
  }, [trackView]);

  const handlePauseVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.8;
        
        setIsInView(isVisible);
        
        if (isVisible) {
          handlePlayVideo();
        } else {
          handlePauseVideo();
        }
      },
      {
        threshold: [0, 0.5, 0.8, 1.0],
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [containerRef, handlePlayVideo, handlePauseVideo]);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        handlePauseVideo();
      } else {
        handlePlayVideo();
      }
    }
  };

  return (
    <>
      {/* Video Element */}
      <video
        ref={videoRef}
        src={video.video_url}
        className="h-full w-full object-cover cursor-pointer"
        muted
        loop
        playsInline
        poster={video.thumbnail_url}
        onClick={handleVideoClick}
        onLoadStart={() => console.log(`Loading video: ${video.title}`)}
        onCanPlay={() => console.log(`Video ready: ${video.title}`)}
        onError={(e) => console.error(`Video error for ${video.title}:`, e)}
      />

      {/* Play/Pause indicator */}
      {!isPlaying && isInView && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoPlayer;
