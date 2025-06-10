
export interface Spot {
  id: string;
  name: string;
  country: string | null;
  lat: number;
  lon: number;
}

export interface LocationSearchProps {
  selectedSpotId?: string | null;
  onLocationSelect: (spotId: string | null, spotName?: string) => void;
  placeholder?: string;
  className?: string;
}
