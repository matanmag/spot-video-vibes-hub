import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommentButtonProps {
  video: {
    id: string;
  };
}

export const CommentButton = ({ video }: CommentButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="glass-button text-white h-12 w-12 rounded-full p-0 flex-col"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="text-xs mt-1">0</span>
    </Button>
  );
};