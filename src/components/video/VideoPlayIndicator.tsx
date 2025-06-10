
interface VideoPlayIndicatorProps {
  isMobile: boolean;
  isPlaying: boolean;
  isInView: boolean;
  isReady: boolean;
  hasError: boolean;
}

export const VideoPlayIndicator = ({
  isMobile,
  isPlaying,
  isInView,
  isReady,
  hasError
}: VideoPlayIndicatorProps) => {
  // Only show for desktop when not playing but ready
  if (isMobile || isPlaying || !isInView || !isReady || hasError) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
        <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
      </div>
    </div>
  );
};
