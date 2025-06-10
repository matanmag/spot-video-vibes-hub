
import { useState, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSpotName, setSelectedSpotName] = useState<string>('');
  const { user } = useAuth();

  // Load selected spot name if there's a selectedSpotId
  useEffect(() => {
    const loadSelectedSpot = async () => {
      if (selectedSpotId) {
        try {
          const { data: spot } = await supabase
            .from('spots')
            .select('name')
            .eq('id', selectedSpotId)
            .maybeSingle();
          
          if (spot) {
            setSelectedSpotName(spot.name);
          }
        } catch (error) {
          console.error('Error loading selected spot:', error);
        }
      } else {
        setSelectedSpotName('');
      }
    };

    loadSelectedSpot();
  }, [selectedSpotId]);

  // Search for spots when query changes
  useEffect(() => {
    const searchSpots = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('search_spots', {
          q: searchQuery.trim()
        });

        if (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } else {
          setSearchResults(data || []);
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchSpots, 300); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleLocationSelect = async (spot: Spot | null) => {
    if (spot) {
      setSelectedSpotName(spot.name);
      onLocationSelect(spot.id, spot.name);

      // Update user's location preference if logged in
      if (user) {
        try {
          await supabase
            .from('profiles')
            .update({ last_spot_id: spot.id })
            .eq('id', user.id);
        } catch (error) {
          console.error('Error updating location preference:', error);
        }
      }
    } else {
      setSelectedSpotName('');
      onLocationSelect(null);
    }
    
    setOpen(false);
    setSearchQuery('');
  };

  const clearSelection = () => {
    handleLocationSelect(null);
  };

  return (
    <div className={`relative ${className}`}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
          >
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">
                {selectedSpotName || "All Locations"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {selectedSpotName && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-destructive/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelection();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 bg-background/95 backdrop-blur-sm border-border/50">
          <Command>
            <CommandInput
              placeholder={placeholder}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? "Searching..." : "No locations found."}
              </CommandEmpty>
              
              <CommandGroup>
                <CommandItem
                  onSelect={() => handleLocationSelect(null)}
                  className="cursor-pointer"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  All Locations
                </CommandItem>
                
                {searchResults.map((spot) => (
                  <CommandItem
                    key={spot.id}
                    onSelect={() => handleLocationSelect(spot)}
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
      </Popover>
    </div>
  );
};

export default LocationSearch;
