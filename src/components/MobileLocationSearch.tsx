
import { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Navigation } from 'lucide-react';
import { useLocationSearch } from '@/hooks/useLocationSearch';
import MobileLocationOverlay from './MobileLocationOverlay';

interface MobileLocationSearchProps {
  selectedSpotId: string | null;
  onLocationSelect: (spotId: string | null, spotName?: string) => void;
  isLoading?: boolean;
}

const MobileLocationSearch = ({ 
  selectedSpotId, 
  onLocationSelect,
  isLoading 
}: MobileLocationSearchProps) => {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    searchQuery,
    searchResults,
    loading,
    selectedSpotName,
    setSearchQuery,
    handleLocationSelect,
    clearSelection
  } = useLocationSearch(selectedSpotId);

  const handleFocus = () => {
    setIsOverlayOpen(true);
  };

  const handleClear = () => {
    setSearchValue('');
    setSearchQuery('');
    clearSelection(onLocationSelect);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleLocationSelectWrapper = (spot: any) => {
    handleLocationSelect(spot, onLocationSelect);
    setIsOverlayOpen(false);
    setSearchValue(spot?.name || '');
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleUseCurrentLocation = () => {
    // For now, just close the overlay - could implement geolocation later
    setIsOverlayOpen(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  // Update search value when selected spot changes
  useEffect(() => {
    if (selectedSpotName) {
      setSearchValue(selectedSpotName);
    } else {
      setSearchValue('');
    }
  }, [selectedSpotName]);

  // Update search query when user types
  useEffect(() => {
    setSearchQuery(searchValue);
  }, [searchValue, setSearchQuery]);

  return (
    <>
      <div className="w-full bg-background/95 backdrop-blur-md border-b border-border/20 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            
            <input
              ref={inputRef}
              type="text"
              placeholder="Search city or place"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={handleFocus}
              className="w-full h-12 pl-12 pr-12 rounded-full bg-muted/50 border border-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 relative z-10"
            />
            
            {(searchValue || selectedSpotName) && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 z-20 p-1 rounded-full hover:bg-muted transition-colors duration-200"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            
            {isLoading && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2 z-20">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileLocationOverlay
        isOpen={isOverlayOpen}
        onClose={() => setIsOverlayOpen(false)}
        searchQuery={searchQuery}
        searchResults={searchResults}
        loading={loading}
        onLocationSelect={handleLocationSelectWrapper}
        onUseCurrentLocation={handleUseCurrentLocation}
      />
    </>
  );
};

export default MobileLocationSearch;
