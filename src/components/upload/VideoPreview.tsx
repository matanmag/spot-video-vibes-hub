
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface VideoPreviewProps {
  file: File;
  previewUrl: string;
  onRemove: () => void;
}

export const VideoPreview = ({ file, previewUrl, onRemove }: VideoPreviewProps) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-[#283339] rounded-xl border border-[#3b4b54]">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-white">{file.name}</p>
            <p className="text-sm text-[#9cafba]">
              Size: {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRemove}
            className="text-[#9cafba] hover:text-white hover:bg-[#3b4b54]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden bg-black">
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
