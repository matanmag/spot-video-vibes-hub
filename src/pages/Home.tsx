
import HomeHeader from '@/components/HomeHeader';
import VideoFeed from '@/components/VideoFeed';
import EmptyState from '@/components/EmptyState';
import { useHomeLogic } from '@/hooks/useHomeLogic';

const Home = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedSpotId,
    updateLocationPreference,
    optimalQuality,
    allVideos,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    locationLoading,
    handleSearchKeyPress,
    handleCurrentVideoIndexChange
  } = useHomeLogic();

  if (isLoading || locationLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-white text-lg">Loading videos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-red-500 text-lg">Error loading videos</div>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden bg-black pb-16">
      <HomeHeader
        selectedSpotId={selectedSpotId}
        onLocationSelect={updateLocationPreference}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearchKeyPress={handleSearchKeyPress}
        optimalQuality={optimalQuality}
      />

      {allVideos.length === 0 ? (
        <EmptyState selectedSpotId={selectedSpotId} />
      ) : (
        <VideoFeed
          videos={allVideos}
          onCurrentVideoIndexChange={handleCurrentVideoIndexChange}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onFetchNextPage={fetchNextPage}
        />
      )}
    </div>
  );
};

export default Home;
