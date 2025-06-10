
import { useState, useRef } from 'react';

export const useVideoPlayerState = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(false);

  return {
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
  };
};
