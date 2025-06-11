
import { Skeleton } from '@/components/ui/skeleton';

const VideoSkeleton = () => {
  return (
    <div className="snap-item h-screen w-full relative bg-background">
      {/* Video area skeleton */}
      <div className="absolute inset-0">
        <Skeleton className="w-full h-full rounded-none" />
      </div>
      
      {/* Bottom overlay with video info skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
        <div className="space-y-3">
          {/* Title skeleton */}
          <Skeleton className="h-6 w-3/4 bg-white/20" />
          
          {/* Location skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full bg-white/20" />
            <Skeleton className="h-4 w-1/2 bg-white/20" />
          </div>
          
          {/* User info skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-white/20" />
            <Skeleton className="h-4 w-1/3 bg-white/20" />
          </div>
        </div>
      </div>
      
      {/* Side actions skeleton */}
      <div className="absolute right-4 bottom-20 space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <Skeleton className="h-12 w-12 rounded-full bg-white/20" />
            <Skeleton className="h-3 w-6 bg-white/20" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoSkeleton;
