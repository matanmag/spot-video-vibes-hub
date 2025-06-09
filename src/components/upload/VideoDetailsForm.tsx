
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface VideoDetailsFormProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  disabled?: boolean;
}

export const VideoDetailsForm = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  disabled
}: VideoDetailsFormProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-white font-medium">
          Title *
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter video title"
          disabled={disabled}
          className="bg-[#283339] border-[#3b4b54] text-white placeholder:text-[#9cafba] focus:border-white rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-white font-medium">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Tell us about your surf session..."
          rows={3}
          disabled={disabled}
          className="bg-[#283339] border-[#3b4b54] text-white placeholder:text-[#9cafba] focus:border-white rounded-xl resize-none"
        />
      </div>
    </div>
  );
};
