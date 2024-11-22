import { useState } from 'react';
import { uploadImage } from '../services/imageService';
import { toast } from 'react-hot-toast';

interface UploadOptions {
  folder?: string;
  maxSizeInMB?: number;
  quality?: number;
}

export function useImageUpload() {
  const [progress, setProgress] = useState(0);

  const uploadWithProgress = async (file: File, options: UploadOptions = {}) => {
    try {
      setProgress(0);
      const url = await uploadImage(file, options);
      setProgress(100);
      return url;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
      setProgress(0);
      throw error;
    }
  };

  return {
    uploadWithProgress,
    progress
  };
}