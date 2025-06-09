
import { Button } from '@/components/ui/button';

interface VideoPreviewProps {
  file: File;
  previewUrl: string;
  onRemove: () => void;
}

export const VideoPreview = ({ file, previewUrl, onRemove }: VideoPreviewProps) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              Size: {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onRemove}>
            Remove
          </Button>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden bg-black">
        <video
          src={previewUrl}
          controls
          className="w-full max-h-64 object-contain"
          preload="metadata"
        />
      </div>
    </div>
  );
};
