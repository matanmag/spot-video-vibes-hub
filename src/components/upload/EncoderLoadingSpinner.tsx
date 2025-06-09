
import { Loader2 } from 'lucide-react';

export const EncoderLoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">Preparing encoder…</span>
    </div>
  );
};
