
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import LocationSearch from '@/components/LocationSearch';

interface HomeHeaderProps {
  selectedSpotId: string | null;
  onLocationSelect: (spotId: string | null, spotName?: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearchKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  optimalQuality: string;
}

const HomeHeader = ({
  selectedSpotId,
  onLocationSelect,
  searchQuery,
  onSearchQueryChange,
  onSearchKeyPress,
  optimalQuality
}: HomeHeaderProps) => {
  return (
    <div className="absolute top-4 left-4 right-4 z-50">
      <div className="flex items-center justify-between mb-4">
        <LocationSearch
          selectedSpotId={selectedSpotId}
          onLocationSelect={onLocationSelect}
          placeholder="Search surf spots..."
          className="flex-1 max-w-xs"
        />
        
        {/* Network quality indicator */}
        <div className="text-xs text-white/60 bg-black/50 px-2 py-1 rounded">
          {optimalQuality}
        </div>
      </div>
      
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyPress={onSearchKeyPress}
          className="pl-10 bg-background/80 backdrop-blur-sm border-border/50"
        />
      </div>
    </div>
  );
};

export default HomeHeader;
