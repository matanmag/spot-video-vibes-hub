import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LikeButtonProps {
  video: {
    id: string;
  };
}

export const LikeButton = ({ video }: LikeButtonProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="glass-button text-white h-12 w-12 rounded-full p-0 flex-col"
      onClick={handleLike}
    >
      <Heart className={`h-6 w-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
      <span className="text-xs mt-1">{likesCount}</span>
    </Button>
  );
};