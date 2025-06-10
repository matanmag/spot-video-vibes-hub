
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

export interface CompressionQuality {
  name: string;
  width: number;
  height: number;
  bitrate: string;
  suffix: string;
}

export const COMPRESSION_QUALITIES: CompressionQuality[] = [
  {
    name: '480p',
    width: 854,
    height: 480,
    bitrate: '1000k',
    suffix: '_480p'
  },
  {
    name: '720p',
    width: 1280,
    height: 720,
    bitrate: '2500k',
    suffix: '_720p'
  },
  {
    name: '1080p',
    width: 1920,
    height: 1080,
    bitrate: '5000k',
    suffix: '_1080p'
  }
];

export class VideoCompressionService {
  private ffmpeg: FFmpeg | null = null;
  private isLoaded = false;

  async initialize() {
    if (this.isLoaded) return;

    this.ffmpeg = new FFmpeg();
    await this.ffmpeg.load();
    this.isLoaded = true;
    console.log('FFmpeg loaded successfully');
  }

  async compressVideo(
    file: File,
    quality: CompressionQuality,
    onProgress?: (progress: number) => void
  ): Promise<File> {
    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    const inputName = 'input.mp4';
    const outputName = `output${quality.suffix}.mp4`;

    // Write input file
    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    // Set up progress tracking
    if (onProgress) {
      this.ffmpeg.on('progress', ({ progress }) => {
        onProgress(progress * 100);
      });
    }

    // Compress video
    await this.ffmpeg.exec([
      '-i', inputName,
      '-vf', `scale=${quality.width}:${quality.height}`,
      '-c:v', 'libx264',
      '-b:v', quality.bitrate,
      '-c:a', 'aac',
      '-b:a', '128k',
      '-preset', 'fast',
      '-movflags', '+faststart',
      outputName
    ]);

    // Read compressed file
    const data = await this.ffmpeg.readFile(outputName);
    const compressedFile = new File([data], `${file.name.replace(/\.[^/.]+$/, '')}${quality.suffix}.mp4`, {
      type: 'video/mp4'
    });

    // Cleanup
    await this.ffmpeg.deleteFile(inputName);
    await this.ffmpeg.deleteFile(outputName);

    return compressedFile;
  }

  async generateThumbnail(file: File): Promise<File> {
    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    const inputName = 'input.mp4';
    const outputName = 'thumbnail.webp';

    await this.ffmpeg.writeFile(inputName, await fetchFile(file));

    // Generate thumbnail at 2 second mark
    await this.ffmpeg.exec([
      '-i', inputName,
      '-ss', '00:00:02.000',
      '-vframes', '1',
      '-f', 'webp',
      '-q:v', '80',
      '-vf', 'scale=320:240',
      outputName
    ]);

    const data = await this.ffmpeg.readFile(outputName);
    const thumbnailFile = new File([data], `${file.name.replace(/\.[^/.]+$/, '')}_thumb.webp`, {
      type: 'image/webp'
    });

    await this.ffmpeg.deleteFile(inputName);
    await this.ffmpeg.deleteFile(outputName);

    return thumbnailFile;
  }

  async getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        resolve(video.duration);
        URL.revokeObjectURL(video.src);
      };
      video.src = URL.createObjectURL(file);
    });
  }
}

export const videoCompressionService = new VideoCompressionService();
