import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/lib/supabase';
import type { SurfSpot } from '@/types/surf-spot';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
            const { data, error } = await supabase
                .from('surf_spots')
                .select('*')
                .order('name');

            if (error) throw error;
            setSpots(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading surf spots...</div>;
    if (error) return <div>Error: {error}</div>;

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
                                position={[spot.latitude, spot.longitude]}
                                icon={icon}
                            >
                                <Popup>
                                    <div>
                                        <h3 className="font-bold">{spot.name}</h3>
                                        <p>{spot.location}, {spot.country}</p>
                                        <Badge variant="secondary" className="mt-1">
                                            {spot.difficulty_level}
                                        </Badge>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                {/* List View */}
                <div className="space-y-4">
                    {spots.map((spot) => (
                        <Card key={spot.id}>
                            <CardHeader>
                                <CardTitle>{spot.name}</CardTitle>
                                <CardDescription>
                                    {spot.location}, {spot.country}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <Badge variant="secondary">
                                            {spot.difficulty_level}
                                        </Badge>
                                        {spot.wave_type && (
                                            <Badge variant="outline">
                                                {spot.wave_type}
                                            </Badge>
                                        )}
                                    </div>
                                    {spot.description && (
                                        <p className="text-sm text-gray-600">
                                            {spot.description}
                                        </p>
                                    )}
                                    {spot.best_season && (
                                        <p className="text-sm text-gray-600">
                                            Best season: {spot.best_season}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
} 