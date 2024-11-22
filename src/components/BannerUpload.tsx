import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image, Upload, Loader, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useImageUpload } from '../lib/hooks/useImageUpload';
import { toast } from 'react-hot-toast';

interface BannerUploadProps {
  currentBannerUrl?: string;
  onBannerChange: (url: string) => void;
  className?: string;
  height?: string;
  showUrlInput?: boolean;
}

export default function BannerUpload({ 
  currentBannerUrl, 
  onBannerChange,
  className = '',
  height = 'h-48',
  showUrlInput = true
}: BannerUploadProps) {
  const { uploadWithProgress, progress } = useImageUpload();
  const [showUrlForm, setShowUrlForm] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const uploading = progress > 0 && progress < 100;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const url = await uploadWithProgress(file, {
        folder: 'banners',
        maxSizeInMB: 5
      });
      onBannerChange(url);
      toast.success('Banner updated successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload banner');
    }
  }, [onBannerChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput) return;

    try {
      new URL(urlInput);
      onBannerChange(urlInput);
      setUrlInput('');
      setShowUrlForm(false);
      toast.success('Banner URL updated successfully');
    } catch {
      toast.error('Please enter a valid URL');
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        {...getRootProps()} 
        className={`relative cursor-pointer group ${height}`}
      >
        <input {...getInputProps()} />
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: currentBannerUrl ? `url(${currentBannerUrl})` : undefined,
            backgroundColor: !currentBannerUrl ? '#1A1B23' : undefined
          }}
        >
          {/* Gradient overlay - always present */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Upload overlay - only on hover or during upload */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: uploading || isDragActive ? 1 : 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity"
          >
            <div className="text-center text-white">
              {uploading ? (
                <>
                  <Loader className="h-8 w-8 animate-spin mx-auto mb-2" />
                  <p>Uploading... {progress}%</p>
                </>
              ) : (
                <>
                  {isDragActive ? (
                    <>
                      <Upload className="h-8 w-8 mx-auto mb-2" />
                      <p>Drop image here</p>
                    </>
                  ) : (
                    <>
                      <Image className="h-8 w-8 mx-auto mb-2" />
                      <p>Click or drag to change banner</p>
                      {showUrlInput && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowUrlForm(true);
                          }}
                          className="mt-2 px-3 py-1 bg-primary/90 rounded-full text-sm hover:bg-primary transition-colors"
                        >
                          <Link className="h-4 w-4 inline-block mr-1" />
                          Use Image URL
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showUrlForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-4 left-4 right-4 bg-surface border border-surface-light rounded-lg p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleUrlSubmit} className="flex space-x-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter image URL..."
                className="flex-1 px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Set URL
              </button>
              <button
                type="button"
                onClick={() => setShowUrlForm(false)}
                className="px-4 py-2 border border-surface-light text-white rounded-md hover:bg-surface-light"
              >
                Cancel
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}