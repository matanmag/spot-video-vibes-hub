
import { Video } from 'lucide-react';
import { VideoUploadForm } from '@/components/upload/VideoUploadForm';
import { AuthenticationGuard } from '@/components/upload/AuthenticationGuard';

const Upload = () => {
  return (
    <AuthenticationGuard>
      <div className="min-h-screen bg-background pb-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Video className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Upload Video</h1>
            </div>
            
            <VideoUploadForm />
          </div>
        </div>
      </div>
    </AuthenticationGuard>
  );
};

export default Upload;
