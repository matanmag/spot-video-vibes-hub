
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      toast({
        title: "Upload successful!",
        description: `${file.name} has been uploaded.`,
      });
      setFile(null);
      setUploading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Upload Files</h1>
          
          <div className="bg-card p-6 rounded-lg shadow">
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  className="mt-2"
                />
              </div>

              {file && (
                <div className="p-4 bg-muted rounded">
                  <p className="text-sm">
                    <strong>Selected:</strong> {file.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Size: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              <Button 
                onClick={handleUpload} 
                disabled={!file || uploading}
                className="w-full"
              >
                {uploading ? "Uploading..." : "Upload File"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
