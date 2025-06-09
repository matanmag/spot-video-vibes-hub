
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileVideo } from 'lucide-react';
import { ACCEPTED_MIME_TYPES, MAX_FILE_SIZE } from '@/constants/videoFormats';

interface FileDropzoneProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const FileDropzone = ({ onFileChange, disabled }: FileDropzoneProps) => {
  const maxSizeMB = Math.round(MAX_FILE_SIZE / 1024 / 1024);

  return (
    <div className="space-y-2">
      <Label htmlFor="video-file">Video File</Label>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="video-file"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-colors ${
            disabled 
              ? 'border-muted-foreground/10 cursor-not-allowed' 
              : 'border-muted-foreground/25 cursor-pointer hover:border-muted-foreground/50'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FileVideo className={`w-8 h-8 mb-2 ${disabled ? 'text-muted-foreground/50' : 'text-muted-foreground'}`} />
            <p className={`mb-2 text-sm ${disabled ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className={`text-xs ${disabled ? 'text-muted-foreground/50' : 'text-muted-foreground'}`}>
              Supported formats: MP4, MOV, AVI, WebM, OGG (up to {maxSizeMB}MB)
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
