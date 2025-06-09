
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { useSpots } from '@/hooks/useSpots';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
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
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#1b2327] rounded-xl border border-[#283339] overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Upload className="h-6 w-6 text-white" />
            <h3 className="text-white text-xl font-bold">Share Your Surf Session</h3>
          </div>

          <div className="space-y-6">
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
              className="w-full bg-white text-[#111618] hover:bg-gray-200 font-bold py-3 rounded-xl text-base"
              size="lg"
            >
              {uploading ? "Uploading..." : "Share Video"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
