
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
    <div className="space-y-3">
      <Label htmlFor="video-file" className="text-white font-medium">
        Video File
      </Label>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="video-file"
          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#3b4b54] rounded-xl cursor-pointer hover:border-[#9cafba] transition-colors bg-[#283339]"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FileVideo className="w-12 h-12 mb-4 text-[#9cafba]" />
            <p className="mb-2 text-white font-medium">
              <span className="font-bold">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-[#9cafba]">
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
