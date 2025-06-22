
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { useVideoDeletion } from '@/hooks/useVideoDeletion';

interface VideoCleanupButtonProps {
  count?: number;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const VideoCleanupButton = ({ 
  count = 4, 
  variant = 'destructive',
  size = 'default',
  className 
}: VideoCleanupButtonProps) => {
  const { executeCleanup, isDeleting } = useVideoDeletion();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    executeCleanup(count);
    setShowConfirm(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="flex gap-2">
        <Button
          onClick={handleClick}
          disabled={isDeleting}
          variant="destructive"
          size={size}
          className={className}
        >
          {isDeleting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4 mr-2" />
              Confirm Delete {count}
            </>
          )}
        </Button>
        <Button
          onClick={handleCancel}
          disabled={isDeleting}
          variant="outline"
          size={size}
        >
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isDeleting}
      variant={variant}
      size={size}
      className={className}
    >
      {isDeleting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Deleting...
        </>
      ) : (
        <>
          <Trash2 className="h-4 w-4 mr-2" />
          Clean {count} Videos
        </>
      )}
    </Button>
  );
};

export default VideoCleanupButton;
