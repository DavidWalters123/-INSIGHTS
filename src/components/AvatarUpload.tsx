import React from 'react';
import { User } from 'lucide-react';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarChange: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function AvatarUpload({ 
  currentAvatarUrl, 
  size = 'md'
}: AvatarUploadProps) {
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-40 h-40'
  };

  return (
    <div className="relative">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-surface-light border-4 border-surface flex items-center justify-center`}>
        {currentAvatarUrl ? (
          <img
            src={currentAvatarUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="h-1/3 w-1/3 text-gray-400" />
        )}
      </div>
    </div>
  );
}