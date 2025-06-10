
import { FileDropzone } from './FileDropzone';
import { VideoPreview } from './VideoPreview';
import { VideoDetailsForm } from './VideoDetailsForm';
import { EncoderLoadingSpinner } from './EncoderLoadingSpinner';
import { CompressionSettings } from './CompressionSettings';
import LocationSearch from '@/components/LocationSearch';

interface VideoUploadContentProps {
  file: File | null;
  previewUrl: string | null;
  title: string;
  description: string;
  selectedSpotId: string | null;
  isEncoderLoading: boolean;
  enableCompression: boolean;
  uploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onLocationSelect: (spotId: string | null) => void;
  onCompressionChange: (enabled: boolean) => void;
  onRemoveFile: () => void;
}

export const VideoUploadContent = ({
  file,
  previewUrl,
  title,
  description,
  selectedSpotId,
  isEncoderLoading,
  enableCompression,
  uploading,
  onFileChange,
  onTitleChange,
  onDescriptionChange,
  onLocationSelect,
  onCompressionChange,
  onRemoveFile
}: VideoUploadContentProps) => {
  const isDisabled = uploading || isEncoderLoading;

  return (
    <div className="space-y-6">
      <FileDropzone onFileChange={onFileChange} disabled={isDisabled} />

      {file && previewUrl && (
        <VideoPreview 
          file={file}
          previewUrl={previewUrl}
          onRemove={onRemoveFile}
        />
      )}

      {isEncoderLoading && <EncoderLoadingSpinner />}

      <VideoDetailsForm
        title={title}
        description={description}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        disabled={isDisabled}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Location</label>
        <LocationSearch
          selectedSpotId={selectedSpotId}
          onLocationSelect={onLocationSelect}
          placeholder="Search for surf spots..."
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          Select a location for your video (optional)
        </p>
      </div>

      <CompressionSettings
        enableCompression={enableCompression}
        onCompressionChange={onCompressionChange}
        disabled={isDisabled}
      />
    </div>
  );
};
