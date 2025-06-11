
import VideoSkeleton from './VideoSkeleton';

interface VideoSkeletonListProps {
  count?: number;
}

const VideoSkeletonList = ({ count = 3 }: VideoSkeletonListProps) => {
  return (
    <div className="snap-container scrollbar-hide">
      {[...Array(count)].map((_, index) => (
        <VideoSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );
};

export default VideoSkeletonList;
