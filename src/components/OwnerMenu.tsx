import { MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OwnerMenuProps {
  videoId: string;
}

export const OwnerMenu = ({ videoId }: OwnerMenuProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteVideoMutation = useMutation({
    mutationFn: async (videoId: string) => {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Video deleted",
        description: "Your video has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete video",
        variant: "destructive",
      });
    },
  });

  const handleDeleteVideo = () => {
    deleteVideoMutation.mutate(videoId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="glass-button text-white h-12 w-12 rounded-full p-0"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={handleDeleteVideo}
          className="text-red-600 focus:text-red-600"
          disabled={deleteVideoMutation.isPending}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete video
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};