import React from 'react';
import { Image } from 'lucide-react';

interface ThumbnailUploadProps {
  currentThumbnailUrl?: string;
}

export default function ThumbnailUpload({ currentThumbnailUrl }: ThumbnailUploadProps) {
  return (
    <div className="w-full h-48 bg-surface-light flex items-center justify-center">
      {currentThumbnailUrl ? (
        <img
          src={currentThumbnailUrl}
          alt="Thumbnail"
          className="w-full h-full object-cover"
        />
      ) : (
        <Image className="h-12 w-12 text-gray-400" />
      )}
    </div>
  );
}