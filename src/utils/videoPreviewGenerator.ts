
export const generateVideoPreview = async (file: File): Promise<{ previewBlob: Blob; thumbnailBlob: Blob }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.onloadedmetadata = () => {
      // Set canvas dimensions for 720p
      const aspectRatio = video.videoWidth / video.videoHeight;
      canvas.height = 720;
      canvas.width = Math.round(720 * aspectRatio);

      // Generate thumbnail at 1 second
      video.currentTime = 1;
    };

    video.onseeked = () => {
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Draw frame for thumbnail
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((thumbnailBlob) => {
        if (!thumbnailBlob) {
          reject(new Error('Could not generate thumbnail'));
          return;
        }

        // For now, we'll use the original file as preview since FFmpeg.wasm would add significant complexity
        // In a production environment, you'd want to use FFmpeg.wasm or server-side processing
        resolve({
          previewBlob: file, // Using original file for now
          thumbnailBlob
        });
      }, 'image/jpeg', 0.8);
    };

    video.onerror = () => reject(new Error('Could not load video'));
    video.src = URL.createObjectURL(file);
  });
};
