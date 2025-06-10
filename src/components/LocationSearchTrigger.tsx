
import { Search, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PopoverTrigger } from '@/components/ui/popover';

interface LocationSearchTriggerProps {
  selectedSpotName: string;
  onClear: () => void;
}

const LocationSearchTrigger = ({ selectedSpotName, onClear }: LocationSearchTriggerProps) => {
  return (
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        className="w-full justify-between bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background/90"
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="truncate">
            {selectedSpotName || "Search surf spots..."}
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
                onClear();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
      </Button>
    </PopoverTrigger>
  );
};

export default LocationSearchTrigger;
