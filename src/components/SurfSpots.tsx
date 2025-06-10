
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { SurfSpot } from '@/types/surf-spot';

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
    iconUrl: "/marker-icon.png",
    iconRetinaUrl: "/marker-icon-2x.png",
    shadowUrl: "/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export function SurfSpots() {
    const [spots, setSpots] = useState<SurfSpot[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSurfSpots();
    }, []);

    const fetchSurfSpots = async () => {
        try {
            console.log('Fetching surf spots...');
            const { data, error } = await supabase
                .from('spots')
                .select('*')
                .order('name');

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
            
            console.log('Fetched spots:', data);
            setSpots(data || []);
        } catch (err) {
            console.error('Error fetching spots:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center p-8">Loading surf spots...</div>;
    if (error) return <div className="flex items-center justify-center p-8 text-destructive">Error: {error}</div>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Surf Spots Around the World</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Map View */}
                <div className="h-[600px] rounded-lg overflow-hidden border">
                    <MapContainer
                        center={[0, 0]}
                        zoom={2}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {spots.map((spot) => (
                            <Marker
                                key={spot.id}
                                position={[Number(spot.latitude), Number(spot.longitude)]}
                                icon={icon}
                            >
                                <Popup>
                                    <div>
                                        <h3 className="font-bold">{spot.name}</h3>
                                        <p>{spot.country || 'Unknown location'}</p>
                                        {spot.description && (
                                            <p className="text-sm mt-1">{spot.description}</p>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                {/* List View */}
                <div className="space-y-4">
                    {spots.length === 0 ? (
                        <Card>
                            <CardContent className="flex items-center justify-center p-8">
                                <p className="text-muted-foreground">No surf spots found. Add some spots to see them here!</p>
                            </CardContent>
                        </Card>
                    ) : (
                        spots.map((spot) => (
                            <Card key={spot.id}>
                                <CardHeader>
                                    <CardTitle>{spot.name}</CardTitle>
                                    <CardDescription>
                                        {spot.country || 'Unknown location'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {spot.description && (
                                            <p className="text-sm text-muted-foreground">
                                                {spot.description}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Coordinates: {Number(spot.latitude).toFixed(4)}, {Number(spot.longitude).toFixed(4)}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
