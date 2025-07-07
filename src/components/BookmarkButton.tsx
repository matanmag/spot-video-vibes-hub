import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookmarkButtonProps {
  video: {
    id: string;
  };
}

export const BookmarkButton = ({ video }: BookmarkButtonProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="glass-button text-white h-12 w-12 rounded-full p-0"
      onClick={handleBookmark}
    >
      <Bookmark className={`h-6 w-6 ${isBookmarked ? 'fill-white' : ''}`} />
    </Button>
  );
};