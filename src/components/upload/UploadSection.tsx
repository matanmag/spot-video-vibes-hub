
import { Button } from '@/components/ui/button';
import { UploadProgress } from './UploadProgress';

interface UploadSectionProps {
  onUpload: () => void;
  uploading: boolean;
  progress: number;
  isEncoderLoading: boolean;
  hasFile: boolean;
  hasTitle: boolean;
}

export const UploadSection = ({
  onUpload,
  uploading,
  progress,
  isEncoderLoading,
  hasFile,
  hasTitle
}: UploadSectionProps) => {
  return (
    <>
      {uploading && <UploadProgress progress={progress} />}

      <Button 
        onClick={onUpload} 
        disabled={!hasFile || !hasTitle || uploading || isEncoderLoading}
        className="w-full"
        size="lg"
      >
        {uploading ? "Uploading..." : isEncoderLoading ? "Preparing..." : "Upload Video"}
      </Button>
    </>
  );
};
