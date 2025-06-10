import { MapPin } from 'lucide-react';
import { SurfSpots } from '@/components/SurfSpots';

const Map = () => {
  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <MapPin className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Surf Spots Map</h1>
        </div>
        
        <SurfSpots />
      </div>
    </div>
  );
};

export default Map;
