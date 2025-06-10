
interface VideoLoadingStatesProps {
  isReady: boolean;
  hasError: boolean;
  thumbnailUrl?: string;
}

export const VideoLoadingStates = ({ isReady, hasError, thumbnailUrl }: VideoLoadingStatesProps) => {
  // Show thumbnail placeholder until video is ready
  if ((!isReady || hasError) && thumbnailUrl) {
    return (
      <div className="absolute inset-0">
        <img
          src={thumbnailUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover blur-lg scale-110"
        />
      </div>
    );
  }

  return null;
};
