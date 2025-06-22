import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import SearchResults from '@/components/SearchResults';
import MobileLocationSearch from '@/components/MobileLocationSearch';

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const currentQuery = searchParams.get('q') || '';

  const handleLocationSelect = (spotId: string | null, spotName?: string) => {
    if (spotId) {
      navigate(`/search?spot=${spotId}`);
    } else {
      navigate('/search');
    }
    setIsSearchOpen(false);
  };

  return (
    <div className="min-h-screen bg-black pb-16">
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-border/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <SearchIcon className="h-6 w-6 text-primary" />
            </button>
            <h1 className="text-xl font-bold text-white">Search</h1>
          </div>
        </div>
      </div>

      <div className="h-[calc(100vh-140px)]">
        <SearchResults query={currentQuery} />
      </div>

      {isSearchOpen && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)} />
          <div className="relative h-full">
            <MobileLocationSearch
              selectedSpotId={null}
              onLocationSelect={handleLocationSelect}
              isLoading={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
