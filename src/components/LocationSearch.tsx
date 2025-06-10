
import { Popover } from '@/components/ui/popover';
import { useLocationSearch } from '@/hooks/useLocationSearch';
import LocationSearchTrigger from '@/components/LocationSearchTrigger';
import LocationSearchDropdown from '@/components/LocationSearchDropdown';

interface Spot {
  id: string;
  name: string;
  country: string | null;
  lat: number;
  lon: number;
}

interface LocationSearchProps {
  selectedSpotId?: string | null;
  onLocationSelect: (spotId: string | null, spotName?: string) => void;
  placeholder?: string;
  className?: string;
}

const LocationSearch = ({ 
  selectedSpotId, 
  onLocationSelect, 
  placeholder = "Search locations...",
  className = ""
}: LocationSearchProps) => {
  const {
    open,
    searchQuery,
    searchResults,
    loading,
    selectedSpotName,
    setSearchQuery,
    handleLocationSelect,
    clearSelection,
    handleOpenChange
  } = useLocationSearch(selectedSpotId);

  const onLocationSelectWrapper = (spot: Spot | null) => {
    handleLocationSelect(spot, onLocationSelect);
  };

  const onClearSelection = () => {
    clearSelection(onLocationSelect);
  };

  return (
    <div className={`relative ${className}`}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <LocationSearchTrigger 
          selectedSpotName={selectedSpotName}
          onClear={onClearSelection}
        />
        <LocationSearchDropdown
          searchQuery={searchQuery}
          searchResults={searchResults}
          loading={loading}
          selectedSpotId={selectedSpotId}
          placeholder={placeholder}
          onSearchChange={setSearchQuery}
          onLocationSelect={onLocationSelectWrapper}
        />
      </Popover>
    </div>
  );
};

export default LocationSearch;
