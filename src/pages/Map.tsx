
import { MapPin } from 'lucide-react';

const Map = () => {
  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <MapPin className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Map</h1>
        </div>
        
        <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Map functionality coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
