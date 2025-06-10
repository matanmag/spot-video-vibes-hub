
import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SearchBarProps {
  autoFocus?: boolean;
}

interface Spot {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
}

const SearchBar = ({ autoFocus = false }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [spots, setSpots] = useState<Spot[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Close dropdown on Esc or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const searchSpots = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSpots([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_spots', {
        q: searchQuery.trim()
      });

      if (error) {
        console.error('Error searching spots:', error);
        setSpots([]);
      } else {
        setSpots(data || []);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error('Error searching spots:', error);
      setSpots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout for 300ms
    debounceTimeout.current = setTimeout(() => {
      searchSpots(value);
    }, 300);
  };

  const handleSpotClick = async (spot: Spot) => {
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
    
    setShowDropdown(false);
    setQuery('');
    navigate('/home');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !showDropdown) {
      if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const handleAddNewSpot = async () => {
    if (!query.trim() || !user) return;

    try {
      const { data: newSpot, error } = await supabase
        .from('spots')
        .insert({
          name: query.trim(),
          latitude: 0, // Default coordinates
          longitude: 0,
          country: 'Unknown'
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding new spot:', error);
        return;
      }

      // Set as user's preferred location
      await supabase
        .from('profiles')
        .update({ last_spot_id: newSpot.id })
        .eq('id', user.id);

      setShowDropdown(false);
      setQuery('');
      navigate('/home');
    } catch (error) {
      console.error('Error adding new spot:', error);
    }
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search surf spots..."
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => query.trim() && setShowDropdown(true)}
          className="w-full pl-10 pr-10 py-3 bg-[#283339] text-white placeholder-white/60 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4 animate-spin" />
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#283339] border border-white/20 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <ul className="py-2">
            {spots.length > 0 ? (
              spots.map((spot) => (
                <li key={spot.id}>
                  <button
                    onClick={() => handleSpotClick(spot)}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3"
                  >
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{spot.name}</div>
                      {spot.country && (
                        <div className="text-white/60 text-sm truncate">{spot.country}</div>
                      )}
                    </div>
                  </button>
                </li>
              ))
            ) : query.trim() ? (
              <li>
                <button
                  onClick={handleAddNewSpot}
                  className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3"
                >
                  <Plus className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-white font-medium">No spots found</div>
                    <div className="text-white/60 text-sm">Add "{query}" as a new spot</div>
                  </div>
                </button>
              </li>
            ) : null}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
