
import { UploadIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVideoUploadState } from '@/hooks/useVideoUploadState';
import { VideoUploadContent } from './VideoUploadContent';
import { VideoUploadActions } from './VideoUploadActions';

export const VideoUploadForm = () => {
  const {
    file,
    title,
    description,
    selectedSpotId,
    previewUrl,
    isEncoderLoading,
    enableCompression,
    uploading,
    progress,
    setTitle,
    setDescription,
    setSelectedSpotId,
    setEnableCompression,
    handleFileChange,
    handleUpload,
    resetForm
  } = useVideoUploadState();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UploadIcon className="h-5 w-5" />
          Video Upload
        </CardTitle>
      </CardHeader>
      <CardContent>
        <VideoUploadContent
          file={file}
          previewUrl={previewUrl}
          title={title}
          description={description}
          selectedSpotId={selectedSpotId}
          isEncoderLoading={isEncoderLoading}
          enableCompression={enableCompression}
          uploading={uploading}
          onFileChange={handleFileChange}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          onLocationSelect={setSelectedSpotId}
          onCompressionChange={setEnableCompression}
          onRemoveFile={resetForm}
        />

        <VideoUploadActions
          file={file}
          title={title}
          uploading={uploading}
          isEncoderLoading={isEncoderLoading}
          progress={progress}
          onUpload={handleUpload}
        />
      </CardContent>
    </Card>
  );
};
