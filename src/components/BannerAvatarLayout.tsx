import React from 'react';
import { motion } from 'framer-motion';
import BannerUpload from './BannerUpload';
import AvatarUpload from './AvatarUpload';

interface BannerAvatarLayoutProps {
  bannerUrl?: string;
  avatarUrl?: string;
  onBannerChange?: (url: string) => void;
  onAvatarChange?: (url: string) => void;
  isEditable?: boolean;
  children: React.ReactNode;
}

export default function BannerAvatarLayout({
  bannerUrl,
  avatarUrl,
  onBannerChange,
  onAvatarChange,
  isEditable = false,
  children
}: BannerAvatarLayoutProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-surface-light rounded-lg overflow-hidden"
    >
      <div className="relative">
        {isEditable && onBannerChange ? (
          <BannerUpload
            currentBannerUrl={bannerUrl}
            onBannerChange={onBannerChange}
            height="h-64"
          />
        ) : (
          <div 
            className="h-64 bg-cover bg-center"
            style={{ 
              backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
              backgroundColor: !bannerUrl ? '#1A1B23' : undefined
            }}
          />
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Avatar */}
        <div className="absolute -bottom-16 left-6">
          {isEditable && onAvatarChange ? (
            <AvatarUpload
              currentAvatarUrl={avatarUrl}
              onAvatarChange={onAvatarChange}
              size="lg"
            />
          ) : (
            <div className="h-32 w-32 rounded-full border-4 border-surface bg-surface overflow-hidden">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-12 w-12 text-primary" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content area with proper spacing for avatar */}
      <div className="px-6 pt-20 pb-6">
        {children}
      </div>
    </motion.div>
  );
}