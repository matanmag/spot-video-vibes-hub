
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileVideoControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  showControls: boolean;
  onPlayPause: () => void;
  onToggleMute: () => void;
  onInteraction: () => void;
}

export const MobileVideoControls = ({
  isPlaying,
  isMuted,
  showControls,
  onPlayPause,
  onToggleMute,
  onInteraction
}: MobileVideoControlsProps) => {
  if (!showControls) return null;

  return (
    <div 
      className="absolute inset-0 bg-black/30 flex items-center justify-center z-10"
      onClick={onInteraction}
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="w-16 h-16 bg-black/50 text-white hover:bg-black/70"
          onClick={(e) => {
            e.stopPropagation();
            onPlayPause();
          }}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="w-12 h-12 bg-black/50 text-white hover:bg-black/70"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
        >
          {isMuted ? (
            <VolumeX className="w-6 h-6" />
          ) : (
            <Volume2 className="w-6 h-6" />
          )}
        </Button>
      </div>
    </div>
  );
};
