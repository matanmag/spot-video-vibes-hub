// This component is no longer needed with native autoplay
// Keeping file for compatibility but returning null

interface VideoPlayIndicatorProps {
  isMobile: boolean;
  isPlaying: boolean;
  isInView: boolean;
  isReady: boolean;
  hasError: boolean;
}

export const VideoPlayIndicator = ({}: VideoPlayIndicatorProps) => {
  // Native autoplay eliminates the need for play indicators
  return null;
};
