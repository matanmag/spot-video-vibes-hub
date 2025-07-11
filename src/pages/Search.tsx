
import { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchResults from '@/components/SearchResults';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  // Update search query when URL params change
  useEffect(() => {
    const queryFromUrl = searchParams.get('q') || '';
    setSearchQuery(queryFromUrl);
  }, [searchParams]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/search');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  const currentQuery = searchParams.get('q') || '';

  return (
    <div className="min-h-screen bg-black pb-16">
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-border/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <SearchIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-white">Search</h1>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search videos, users, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 bg-black/60 backdrop-blur-sm border-none text-white placeholder:text-white/70 shadow-lg focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-140px)]">
        <SearchResults query={currentQuery} />
      </div>
    </div>
  );
};

export default Search;
