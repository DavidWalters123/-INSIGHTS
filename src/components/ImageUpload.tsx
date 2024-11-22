import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Camera, Loader, Image as ImageIcon } from 'lucide-react';
import { useImageUpload } from '../lib/services/imageService';
import { toast } from 'react-hot-toast';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (url: string) => void;
  folder?: string;
  maxSizeInMB?: number;
  className?: string;
  aspectRatio?: number;
  showPreview?: boolean;
  previewHeight?: string;
}

export default function ImageUpload({
  currentImageUrl,
  onImageChange,
  folder = 'images',
  maxSizeInMB = 5,
  className = '',
  aspectRatio,
  showPreview = true,
  previewHeight = 'h-48'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { uploadWithProgress } = useImageUpload();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadWithProgress(file, { folder, maxSizeInMB });
      onImageChange(url);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }, [folder, maxSizeInMB, onImageChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    disabled: uploading,
    maxSize: maxSizeInMB * 1024 * 1024
  });

  const containerStyle = aspectRatio 
    ? { paddingBottom: `${(1 / aspectRatio) * 100}%` }
    : undefined;

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        className={`relative cursor-pointer transition-all duration-200 ${
          isDragActive ? 'ring-2 ring-primary' : ''
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="group relative w-full">
          <div 
            className={`relative w-full overflow-hidden bg-surface-light ${
              aspectRatio ? 'relative' : previewHeight
            }`}
            style={containerStyle}
          >
            {currentImageUrl ? (
              <>
                <img
                  src={currentImageUrl}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-center text-white">
                    <Camera className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Change image</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center group-hover:bg-surface transition-colors">
                <div className="text-center">
                  <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2 group-hover:text-primary transition-colors" />
                  <p className="text-sm text-gray-400 group-hover:text-white transition-colors">
                    {isDragActive ? 'Drop image here' : 'Click or drag to upload'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Max size: {maxSizeInMB}MB
                  </p>
                </div>
              </div>
            )}
            
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center">
                  <Loader className="h-8 w-8 text-white animate-spin mx-auto mb-2" />
                  <p className="text-sm text-white">Uploading...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}