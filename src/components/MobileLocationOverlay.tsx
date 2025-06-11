
import { useEffect } from 'react';
import { MapPin, Navigation, TrendingUp } from 'lucide-react';

interface Spot {
  id: string;
  name: string;
  country: string | null;
  lat: number;
  lon: number;
}

interface MobileLocationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  searchResults: Spot[];
  loading: boolean;
  onLocationSelect: (spot: Spot | null) => void;
  onUseCurrentLocation: () => void;
}

const MobileLocationOverlay = ({
  isOpen,
  onClose,
  searchQuery,
  searchResults,
  loading,
  onLocationSelect,
  onUseCurrentLocation
}: MobileLocationOverlayProps) => {
  // Close overlay when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const popularLocations = [
    { id: 'popular-1', name: 'Pipeline', country: 'Hawaii, USA' },
    { id: 'popular-2', name: 'Mavericks', country: 'California, USA' },
    { id: 'popular-3', name: 'Nazaré', country: 'Portugal' },
    { id: 'popular-4', name: 'Teahupo\'o', country: 'Tahiti' },
  ];

  return (
    <>
      {/* Background overlay - positioned to start below the search bar */}
      <div 
        className="fixed inset-x-0 top-[76px] bottom-0 z-30 bg-background/95 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Content - positioned below the search bar */}
      <div className="fixed inset-x-0 top-[76px] bottom-0 z-40 overflow-y-auto">
        <div className="p-4 space-y-6">
          
          {/* Use Current Location */}
          <div>
            <button
              onClick={onUseCurrentLocation}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors duration-200 group"
            >
              <div className="p-2 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors duration-200">
                <Navigation className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium text-foreground">Use current location</div>
                <div className="text-sm text-muted-foreground">Find surf spots near you</div>
              </div>
            </button>
          </div>

          {/* Search Results */}
          {searchQuery.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Search Results
              </h3>
              
              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                      <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1">
                  {searchResults.map((spot) => (
                    <button
                      key={spot.id}
                      onClick={() => onLocationSelect(spot)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200 text-left"
                    >
                      <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">{spot.name}</div>
                        {spot.country && (
                          <div className="text-sm text-muted-foreground truncate">{spot.country}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No locations found</p>
                  <p className="text-sm">Try a different search term</p>
                </div>
              )}
            </div>
          )}

          {/* Popular Locations */}
          {searchQuery.length === 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Popular Locations
              </h3>
              
              <div className="space-y-1">
                {popularLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => onLocationSelect({ 
                      id: location.id, 
                      name: location.name, 
                      country: location.country,
                      lat: 0,
                      lon: 0 
                    })}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200 text-left"
                  >
                    <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{location.name}</div>
                      <div className="text-sm text-muted-foreground truncate">{location.country}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All Locations Option */}
          {searchQuery.length === 0 && (
            <div>
              <button
                onClick={() => onLocationSelect(null)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200 text-left"
              >
                <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-foreground">All Locations</div>
                  <div className="text-sm text-muted-foreground">Browse videos from everywhere</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileLocationOverlay;
