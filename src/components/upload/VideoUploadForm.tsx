
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { useSpots } from '@/hooks/useSpots';
import { useNavigate } from 'react-router-dom';
import { UploadIcon } from 'lucide-react';
import { FileDropzone } from './FileDropzone';
import { VideoPreview } from './VideoPreview';
import { VideoDetailsForm } from './VideoDetailsForm';
import { UploadProgress } from './UploadProgress';
import { EncoderLoadingSpinner } from './EncoderLoadingSpinner';
import { validateVideoFile, generateTitleFromFilename } from '@/utils/videoValidation';
import { MAX_FILE_SIZE } from '@/constants/videoFormats';
import LocationSearch from '@/components/LocationSearch';

export const VideoUploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEncoderLoading, setIsEncoderLoading] = useState(false);
  const [enableCompression, setEnableCompression] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadVideo, uploading, progress } = useVideoUpload();
  const { createDefaultSpot } = useSpots();
  const navigate = useNavigate();

  // Ensure default spot exists when component mounts
  useEffect(() => {
    const initializeDefaultSpot = async () => {
      if (user) {
        console.log('Creating default spot for uploads');
        await createDefaultSpot();
      }
    };
    initializeDefaultSpot();
  }, [user, createDefaultSpot]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file size first
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `Please select a video file smaller than ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB.`,
          variant: "destructive",
        });
        return;
      }

      const validation = validateVideoFile(selectedFile);
      
      if (!validation.isValid) {
        toast({
          title: "Invalid file",
          description: validation.error,
          variant: "destructive",
        });
        return;
      }

      setFile(selectedFile);
      
      // Create preview URL
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);

      // Set default title from filename
      if (!title) {
        setTitle(generateTitleFromFilename(selectedFile.name));
      }

      // Start encoder initialization
      initializeEncoder();
    }
  };

  const initializeEncoder = async () => {
    setIsEncoderLoading(true);
    try {
      // Simulate FFmpeg.wasm initialization
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('FFmpeg encoder ready');
    } catch (error) {
      console.error('Failed to initialize encoder:', error);
      toast({
        title: "Encoder initialization failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEncoderLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload videos.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a video file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your video.",
        variant: "destructive",
      });
      return;
    }

    if (isEncoderLoading) {
      toast({
        title: "Encoder still loading",
        description: "Please wait for the encoder to finish preparing.",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting video upload process with compression:', enableCompression);
    const result = await uploadVideo(
      file, 
      title.trim(), 
      description.trim(), 
      selectedSpotId || undefined,
      enableCompression
    );
    
    if (result) {
      resetForm();
      navigate('/home');
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
    setSelectedSpotId(null);
    setIsEncoderLoading(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

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

        <div className="space-y-2">
          <label className="text-sm font-medium">Location</label>
          <LocationSearch
            selectedSpotId={selectedSpotId}
            onLocationSelect={setSelectedSpotId}
            placeholder="Search for surf spots..."
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Select a location for your video (optional)
          </p>
        </div>

        <CompressionSettings
          enableCompression={enableCompression}
          onCompressionChange={setEnableCompression}
          disabled={uploading || isEncoderLoading}
        />

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
          onClick={handleUpload} 
          disabled={!file || !title.trim() || uploading || isEncoderLoading}
          className="w-full"
          size="lg"
        >
          {uploading ? (
            progress.stage === 'compression' ? 'Compressing...' : 'Uploading...'
          ) : isEncoderLoading ? 'Preparing...' : 'Upload Video'}
        </Button>
      </CardContent>
    </Card>
  );
};
