import { TrendingUp } from 'lucide-react';

const Trending = () => {
  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="h-8 w-8 text-turquoise" />
            <h1 className="text-3xl font-bold">Trending</h1>
          </div>
          
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              Trending videos coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trending;