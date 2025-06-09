
import { Progress } from '@/components/ui/progress';

interface UploadProgressProps {
  progress: number;
}

export const UploadProgress = ({ progress }: UploadProgressProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-white font-medium">Uploading...</span>
        <span className="text-[#9cafba]">{progress}%</span>
      </div>
      <Progress 
        value={progress} 
        className="w-full h-2 bg-[#283339]" 
      />
    </div>
  );
};
