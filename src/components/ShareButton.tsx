import { Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareButtonProps {
  video: {
    id: string;
  };
}

export const ShareButton = ({ video }: ShareButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="glass-button text-white h-12 w-12 rounded-full p-0"
    >
      <Share className="h-6 w-6" />
    </Button>
  );
};