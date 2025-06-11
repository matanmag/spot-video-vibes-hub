
interface VideoErrorStateProps {
  hasError: boolean;
  isMobile: boolean;
  debugInfo: string;
  onRetry: () => void;
}

export const VideoErrorState = ({ hasError, debugInfo, onRetry }: VideoErrorStateProps) => {
  if (!hasError) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
      <div className="text-white text-center">
        <p className="text-lg mb-2">Video unavailable</p>
        <p className="text-sm opacity-75 mb-4">
          Unable to load video content
        </p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-white/20 rounded text-sm hover:bg-white/30 transition-colors"
        >
          Retry
        </button>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-xs mt-2 opacity-60">{debugInfo}</p>
        )}
      </div>
    </div>
  );
};
