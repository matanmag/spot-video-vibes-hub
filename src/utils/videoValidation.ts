
import { ACCEPTED_MIME_TYPES, SUPPORTED_VIDEO_FORMATS, MAX_FILE_SIZE } from '@/constants/videoFormats';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateVideoFile = (file: File): ValidationResult => {
  // Validate file type
  const isValidType = ACCEPTED_MIME_TYPES.includes(file.type) || 
    SUPPORTED_VIDEO_FORMATS.some(format => file.name.toLowerCase().endsWith(format));
  
  if (!isValidType) {
    return {
      isValid: false,
      error: `Please select a video file. Supported formats: ${SUPPORTED_VIDEO_FORMATS.join(', ')}`
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: "Please select a video file smaller than 200MB."
    };
  }

  return { isValid: true };
};

export const generateTitleFromFilename = (filename: string): string => {
  return filename.split('.')[0].replace(/[_-]/g, ' ');
};
