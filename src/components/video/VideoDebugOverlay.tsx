
interface VideoDebugOverlayProps {
  debugInfo: string;
  isReady: boolean;
  hasError: boolean;
  isInView: boolean;
  hasSource: boolean;
  isPlaying: boolean;
  isMobile: boolean;
  hasUserInteracted: boolean;
  loadAttempts: number;
}

export const VideoDebugOverlay = ({
  debugInfo,
  isReady,
  hasError,
  isInView,
  hasSource,
  isPlaying,
  isMobile,
  hasUserInteracted,
  loadAttempts
}: VideoDebugOverlayProps) => {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="absolute top-2 left-2 bg-black/80 text-white text-xs p-2 rounded max-w-xs z-20">
      <div>Status: {debugInfo}</div>
      <div>Ready: {isReady ? 'Yes' : 'No'}</div>
      <div>Error: {hasError ? 'Yes' : 'No'}</div>
      <div>In View: {isInView ? 'Yes' : 'No'}</div>
      <div>Has Source: {hasSource ? 'Yes' : 'No'}</div>
      <div>Playing: {isPlaying ? 'Yes' : 'No'}</div>
      <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
      <div>User Interaction: {hasUserInteracted ? 'Yes' : 'No'}</div>
      <div>Load Attempts: {loadAttements}</div>
    </div>
  );
};
