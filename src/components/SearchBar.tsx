
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import LocationSearch from '@/components/LocationSearch';

interface SearchBarProps {
  selectedSpotId: string | null;
  onLocationSelect: (spotId: string | null) => void;
}

const SearchBar = ({ selectedSpotId, onLocationSelect }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-50">
      <div className="flex flex-col gap-4">
        {/* Location Search */}
        <div className="flex justify-start">
          <LocationSearch
            selectedSpotId={selectedSpotId}
            onLocationSelect={onLocationSelect}
            placeholder="Search surf spots..."
            className="w-full max-w-xs"
          />
        </div>
        
        {/* Video Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="pl-10 bg-background/80 backdrop-blur-sm border-border/50"
          />
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
