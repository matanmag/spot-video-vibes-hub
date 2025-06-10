
import { MapPin } from 'lucide-react';
import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Spot } from './types';

interface LocationSearchResultsProps {
  loading: boolean;
  searchResults: Spot[];
  onLocationSelect: (spot: Spot | null) => void;
}

export const LocationSearchResults = ({
  loading,
  searchResults,
  onLocationSelect
}: LocationSearchResultsProps) => {
  return (
    <>
      <CommandEmpty>
        {loading ? "Searching..." : "No locations found."}
      </CommandEmpty>
      
      <CommandGroup>
        <CommandItem
          onSelect={() => onLocationSelect(null)}
          className="cursor-pointer"
        >
          <MapPin className="mr-2 h-4 w-4" />
          All Locations
        </CommandItem>
        
        {searchResults.map((spot) => (
          <CommandItem
            key={spot.id}
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
    </>
  );
};
