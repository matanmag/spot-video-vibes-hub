
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
import { validateVideoFile, generateTitleFromFilename } from '@/utils/videoValidation';

export const VideoUploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
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

    console.log('Starting video upload process');
    const result = await uploadVideo(file, title.trim(), description.trim());
    
    if (result) {
      // Reset form
      resetForm();
      
      // Navigate to home page
      navigate('/home');
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle('');
    setDescription('');
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
        <FileDropzone onFileChange={handleFileChange} disabled={uploading} />

        {file && previewUrl && (
          <VideoPreview 
            file={file}
            previewUrl={previewUrl}
            onRemove={resetForm}
          />
        )}

        <VideoDetailsForm
          title={title}
          description={description}
          onTitleChange={setTitle}
          onDescriptionChange={setDescription}
          disabled={uploading}
        />

        {uploading && <UploadProgress progress={progress} />}

        <Button 
          onClick={handleUpload} 
          disabled={!file || !title.trim() || uploading}
          className="w-full"
          size="lg"
        >
          {uploading ? "Uploading..." : "Upload Video"}
        </Button>
      </CardContent>
    </Card>
  );
};
