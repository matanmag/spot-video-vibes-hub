
import LocationSearch from '@/components/LocationSearch';

interface LocationSectionProps {
  selectedSpotId: string | null;
  onLocationSelect: (spotId: string | null) => void;
  disabled?: boolean;
}

export const LocationSection = ({ 
  selectedSpotId, 
  onLocationSelect, 
  disabled 
}: LocationSectionProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Location</label>
      <LocationSearch
        selectedSpotId={selectedSpotId}
        onLocationSelect={onLocationSelect}
        placeholder="Search for surf spots..."
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">
        Select a location for your video (optional)
      </p>
    </div>
  );
};
