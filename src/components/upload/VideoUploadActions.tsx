
import { Button } from '@/components/ui/button';
import { UploadProgress } from './UploadProgress';

interface VideoUploadActionsProps {
  file: File | null;
  title: string;
  uploading: boolean;
  isEncoderLoading: boolean;
  progress: {
    overall: number;
    compression?: number;
    stage: 'compression' | 'upload' | 'complete';
  };
  onUpload: () => void;
}

export const VideoUploadActions = ({
  file,
  title,
  uploading,
  isEncoderLoading,
  progress,
  onUpload
}: VideoUploadActionsProps) => {
  return (
    <div className="space-y-4">
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>
              {progress.stage === 'compression' ? 'Compressing...' : 'Uploading...'}
            </span>
            <span>{Math.round(progress.overall)}%</span>
          </div>
          <UploadProgress progress={progress.overall} />
          {progress.compression && progress.stage === 'compression' && (
            <div className="text-xs text-muted-foreground">
              Compression: {Math.round(progress.compression)}%
            </div>
          )}
        </div>
      )}

      <Button 
        onClick={onUpload} 
        disabled={!file || !title.trim() || uploading || isEncoderLoading}
        className="w-full"
        size="lg"
      >
        {uploading ? (
          progress.stage === 'compression' ? 'Compressing...' : 'Uploading...'
        ) : isEncoderLoading ? 'Preparing...' : 'Upload Video'}
      </Button>
    </div>
  );
};
