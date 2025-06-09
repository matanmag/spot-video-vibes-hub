
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { useSpots } from '@/hooks/useSpots';
import { useNavigate } from 'react-router-dom';
import { Video, Upload as UploadIcon, FileVideo } from 'lucide-react';

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { uploadVideo, uploading, progress } = useVideoUpload();
  const { createDefaultSpot } = useSpots();
  const navigate = useNavigate();

  // Supported video formats
  const supportedFormats = ['.mp4', '.mov', '.quicktime', '.avi', '.webm', '.ogg'];
  const acceptedMimeTypes = [
    'video/mp4',
    'video/quicktime',
    'video/avi',
    'video/mov',
    'video/webm',
    'video/ogg'
  ];

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
      // Validate file type
      const isValidType = acceptedMimeTypes.includes(selectedFile.type) || 
        supportedFormats.some(format => selectedFile.name.toLowerCase().endsWith(format));
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `Please select a video file. Supported formats: ${supportedFormats.join(', ')}`,
          variant: "destructive",
        });
        return;
      }

      // Validate file size (200MB limit)
      const maxSize = 200 * 1024 * 1024; // 200MB
      if (selectedFile.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please select a video file smaller than 200MB.",
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
        const filename = selectedFile.name.split('.')[0];
        setTitle(filename.replace(/[_-]/g, ' '));
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
      setFile(null);
      setTitle('');
      setDescription('');
      setPreviewUrl(null);
      
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Please log in to upload videos.
            </p>
            <Button onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Video className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Upload Video</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadIcon className="h-5 w-5" />
                Video Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="space-y-2">
                <Label htmlFor="video-file">Video File</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="video-file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileVideo className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supported formats: MP4, MOV, AVI, WebM, OGG (up to 200MB)
                      </p>
                    </div>
                    <Input
                      id="video-file"
                      type="file"
                      accept={acceptedMimeTypes.join(',')}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* File Preview */}
              {file && (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={resetForm}>
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* Video Preview */}
                  {previewUrl && (
                    <div className="rounded-lg overflow-hidden bg-black">
                      <video
                        src={previewUrl}
                        controls
                        className="w-full max-h-64 object-contain"
                        preload="metadata"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Video Details */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter video title"
                    disabled={uploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter video description (optional)"
                    rows={3}
                    disabled={uploading}
                  />
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              {/* Upload Button */}
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
        </div>
      </div>
    </div>
  );
};

export default Upload;
