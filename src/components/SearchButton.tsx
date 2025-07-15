import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileLocationSearch from './MobileLocationSearch';

const SearchButton = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchClick = () => {
    setIsSearchOpen(true);
  };

  const handleLocationSelect = (spotId: string | null, spotName?: string) => {
    if (spotId) {
      navigate(`/search?spot=${spotId}`);
    } else {
      navigate('/search');
    }
    setIsSearchOpen(false);
  };

  return (
    <>
      <button
        onClick={handleSearchClick}
        className="p-2 rounded-full transition-colors text-white/60 hover:text-white"
      >
        <TrendingUp className="w-7 h-7" />
      </button>

      {isSearchOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)} />
          <div className="relative">
            <MobileLocationSearch
              selectedSpotId={null}
              onLocationSelect={handleLocationSelect}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default SearchButton; 