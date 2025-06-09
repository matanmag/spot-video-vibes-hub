
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileVideo } from 'lucide-react';
import { ACCEPTED_MIME_TYPES } from '@/constants/videoFormats';

interface FileDropzoneProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const FileDropzone = ({ onFileChange, disabled }: FileDropzoneProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="video-file">Video File</Label>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="video-file"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FileVideo className="w-8 h-8 mb-2 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              Supported formats: MP4, MOV, AVI, WebM, OGG (up to 200MB)
            </p>
          </div>
          <Input
            id="video-file"
            type="file"
            accept={ACCEPTED_MIME_TYPES.join(',')}
            onChange={onFileChange}
            className="hidden"
            disabled={disabled}
          />
        </label>
      </div>
    </div>
  );
};
