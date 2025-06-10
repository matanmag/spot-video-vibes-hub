
import {
  Command,
  CommandInput,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { LocationSearchProps } from './types';
import { useLocationSearch } from './useLocationSearch';
import { LocationSearchTrigger } from './LocationSearchTrigger';
import { LocationSearchResults } from './LocationSearchResults';

const LocationSearch = ({ 
  selectedSpotId, 
  onLocationSelect, 
  placeholder = "Search locations...",
  className = ""
}: LocationSearchProps) => {
  const {
    open,
    setOpen,
    searchQuery,
    setSearchQuery,
    searchResults,
    loading,
    selectedSpotName,
    handleLocationSelect,
    clearSelection
  } = useLocationSearch(selectedSpotId);

  return (
    <div className={`relative ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <LocationSearchTrigger
            selectedSpotName={selectedSpotName}
            open={open}
            onClearSelection={() => clearSelection(onLocationSelect)}
          />
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 bg-background/95 backdrop-blur-sm border-border/50">
          <Command>
            <CommandInput
              placeholder={placeholder}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <LocationSearchResults
                loading={loading}
                searchResults={searchResults}
                onLocationSelect={(spot) => handleLocationSelect(spot, onLocationSelect)}
              />
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default LocationSearch;
