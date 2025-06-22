
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { deleteAllVideosNow } from '@/services/videoDeletionService';
import { useToast } from '@/hooks/use-toast';

const DeleteVideos = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const { toast } = useToast();

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    
    try {
      const result = await deleteAllVideosNow();
      
      if (result.success) {
        toast({
          title: "SUCCESS",
          description: result.message,
        });
        setIsDeleted(true);
      } else {
        toast({
          title: "ERROR",
          description: result.error,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "ERROR",
        description: "Failed to delete videos",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isDeleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-600 mb-4">DONE!</h1>
          <p className="text-xl">All videos have been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Delete All Videos</h1>
        <p className="text-xl mb-8">This will delete ALL videos to reduce egress usage.</p>
        
        <Button
          onClick={handleDeleteAll}
          disabled={isDeleting}
          variant="destructive"
          size="lg"
          className="px-12 py-4 text-xl"
        >
          {isDeleting ? 'DELETING...' : 'DELETE ALL VIDEOS NOW'}
        </Button>
      </div>
    </div>
  );
};

export default DeleteVideos;
