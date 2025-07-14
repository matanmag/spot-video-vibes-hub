import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadIcon } from 'lucide-react';
import { FileDropzone } from './FileDropzone';
import { VideoPreview } from './VideoPreview';
import { VideoDetailsForm } from './VideoDetailsForm';
import { EncoderLoadingSpinner } from './EncoderLoadingSpinner';
import { LocationSection } from './LocationSection';
import { UploadSection } from './UploadSection';
import { useUploadForm } from '@/hooks/useUploadForm';

export const VideoUploadForm = () => {
  const {
    file,
    title,
    description,
    selectedSpotId,
    previewUrl,
    isEncoderLoading,
    uploading,
    progress,
    handleFileChange,
    handleUpload,
    resetForm,
    setTitle,
    setDescription,
    setSelectedSpotId,
  } = useUploadForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadIcon className="h-5 w-5" />
          Video Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <FileDropzone onFileChange={handleFileChange} disabled={uploading || isEncoderLoading} />

        {file && previewUrl && (
          <VideoPreview 
            file={file}
            previewUrl={previewUrl}
            onRemove={resetForm}
          />
        )}

        {isEncoderLoading && <EncoderLoadingSpinner />}

        <VideoDetailsForm
          title={title}
          description={description}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          disabled={uploading || isEncoderLoading}
        />

        <LocationSection
          selectedSpotId={selectedSpotId}
          onLocationSelect={setSelectedSpotId}
          disabled={uploading || isEncoderLoading}
        />

        <UploadSection
          onUpload={handleUpload}
          uploading={uploading}
          progress={progress}
          isEncoderLoading={isEncoderLoading}
          hasFile={!!file}
          hasTitle={!!title.trim()}
        />
      </CardContent>
    </Card>
  );
};