
export interface SurfSpot {
  id: string;
  name: string;
  location: string;
  country: string;
  latitude: number;
  longitude: number;
  description?: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  best_season?: string;
  wave_type?: string;
  created_at: string;
  updated_at: string;
}
