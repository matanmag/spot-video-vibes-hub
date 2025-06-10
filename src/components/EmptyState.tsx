
interface EmptyStateProps {
  selectedSpotId: string | null;
}

const EmptyState = ({ selectedSpotId }: EmptyStateProps) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center text-white/60">
        <p className="text-lg mb-2">No videos found</p>
        {selectedSpotId ? (
          <p className="text-sm">Try selecting a different location or browse all locations</p>
        ) : (
          <p className="text-sm">Be the first to upload a video!</p>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
