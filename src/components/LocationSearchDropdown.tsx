
import { MapPin } from 'lucide-react';
import { PopoverContent } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

interface Spot {
  id: string;
  name: string;
  country: string | null;
  lat: number;
  lon: number;
}

interface LocationSearchDropdownProps {
  searchQuery: string;
  searchResults: Spot[];
  loading: boolean;
  selectedSpotId?: string | null;
  placeholder: string;
  onSearchChange: (value: string) => void;
  onLocationSelect: (spot: Spot | null) => void;
}

const LocationSearchDropdown = ({
  searchQuery,
  searchResults,
  loading,
  selectedSpotId,
  placeholder,
  onSearchChange,
  onLocationSelect
}: LocationSearchDropdownProps) => {
  return (
    <PopoverContent className="w-80 p-0 bg-background/95 backdrop-blur-sm border-border/50" align="start">
      <Command shouldFilter={false}>
        <CommandInput
          placeholder={placeholder}
          value={searchQuery}
          onValueChange={(value) => {
            console.log('Search input changed:', value);
            onSearchChange(value);
          }}
          className="h-9"
        />
        <CommandList>
          <CommandEmpty>
            {loading ? "Searching..." : searchQuery.length > 0 ? "No locations found." : "Start typing to search..."}
          </CommandEmpty>
          
          <CommandGroup>
            {!selectedSpotId && (
              <CommandItem
                onSelect={() => onLocationSelect(null)}
                className="cursor-pointer"
              >
                <MapPin className="mr-2 h-4 w-4" />
                All Locations
              </CommandItem>
            )}
            
            {searchResults.map((spot) => (
              <CommandItem
                key={spot.id}
                value={spot.name}
                onSelect={() => onLocationSelect(spot)}
                className="cursor-pointer"
              >
                <MapPin className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{spot.name}</span>
                  {spot.country && (
                    <span className="text-xs text-muted-foreground">
                      {spot.country}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  );
};

export default LocationSearchDropdown;
