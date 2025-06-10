
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';

interface CompressionSettingsProps {
  enableCompression: boolean;
  onCompressionChange: (enabled: boolean) => void;
  disabled?: boolean;
}

export const CompressionSettings = ({
  enableCompression,
  onCompressionChange,
  disabled
}: CompressionSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Info className="h-4 w-4" />
          Video Optimization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="compression-toggle" className="text-sm font-medium">
              Enable Video Compression
            </Label>
            <p className="text-xs text-muted-foreground">
              Generate optimized versions for better streaming
            </p>
          </div>
          <Switch
            id="compression-toggle"
            checked={enableCompression}
            onCheckedChange={onCompressionChange}
            disabled={disabled}
          />
        </div>

        {enableCompression && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              The following quality versions will be generated:
            </p>
            <div className="flex gap-2">
              <Badge variant="secondary">480p</Badge>
              <Badge variant="secondary">720p</Badge>
              <Badge variant="secondary">1080p</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              ⚠️ Compression may take several minutes depending on video length
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
