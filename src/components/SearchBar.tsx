
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

// This component is now simplified and only handles video search
// Location search is handled by MobileLocationSearch component
const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-50">
      {/* Video Search */}
      <div className="relative max-w-md mx-auto bg-gradient-to-br from-black/70 via-black/40 to-transparent rounded-xl p-4 shadow-lg">
        <Search className="absolute left-7 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search videos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          className="pl-10 bg-transparent text-white placeholder:text-white/70 border-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
        />
      </div>
    </div>
  );
};

export default SearchBar;
