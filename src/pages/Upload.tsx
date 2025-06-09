
import { Settings } from 'lucide-react';
import { VideoUploadForm } from '@/components/upload/VideoUploadForm';
import { AuthenticationGuard } from '@/components/upload/AuthenticationGuard';

const Upload = () => {
  return (
    <AuthenticationGuard>
      <div 
        className="relative flex min-h-screen flex-col bg-[#111618] font-jakarta"
      >
        {/* Header */}
        <div className="flex items-center bg-[#111618] p-4 pb-2 justify-between">
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12">
            Upload Video
          </h2>
          <div className="flex w-12 items-center justify-end">
            <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 bg-transparent text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0">
              <Settings className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Upload Form */}
        <div className="flex-1 p-4">
          <VideoUploadForm />
        </div>
      </div>
    </AuthenticationGuard>
  );
};

export default Upload;
