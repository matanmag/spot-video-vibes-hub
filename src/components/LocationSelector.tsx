
import { useState, useEffect } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSpots } from '@/hooks/useSpots';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LocationSelectorProps {
  selectedSpotId?: string;
  onLocationChange: (spotId: string | null) => void;
}

const LocationSelector = ({ selectedSpotId, onLocationChange }: LocationSelectorProps) => {
  const { spots, loading } = useSpots();
  const { user } = useAuth();
  const [selectedSpot, setSelectedSpot] = useState<any>(null);

  useEffect(() => {
    if (selectedSpotId && spots.length > 0) {
      const spot = spots.find(s => s.id === selectedSpotId);
      setSelectedSpot(spot);
    }
  }, [selectedSpotId, spots]);

  const handleLocationSelect = async (spotId: string | null) => {
    setSelectedSpot(spotId ? spots.find(s => s.id === spotId) : null);
    onLocationChange(spotId);

    // Update user's last location preference if logged in
    if (user && spotId) {
      try {
        await supabase
          .from('profiles')
          .update({ last_spot_id: spotId })
          .eq('id', user.id);
      } catch (error) {
        // Error updating user location preference - non-critical
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-white/60">
        <MapPin className="h-4 w-4" />
        <span className="text-sm">Loading locations...</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 text-white hover:text-white/80 hover:bg-white/10 px-3 py-2">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">
            {selectedSpot ? selectedSpot.name : 'All Locations'}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 bg-black/90 border-border/50">
        <DropdownMenuItem
          onClick={() => handleLocationSelect(null)}
          className="text-white hover:bg-white/10 cursor-pointer"
        >
          <MapPin className="h-4 w-4 mr-2" />
          All Locations
        </DropdownMenuItem>
        {spots.map((spot) => (
          <DropdownMenuItem
            key={spot.id}
            onClick={() => handleLocationSelect(spot.id)}
            className="text-white hover:bg-white/10 cursor-pointer"
          >
            <MapPin className="h-4 w-4 mr-2" />
            {spot.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LocationSelector;
