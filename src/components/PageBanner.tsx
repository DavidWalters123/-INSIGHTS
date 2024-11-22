import React from 'react';
import { motion } from 'framer-motion';
import BannerUpload from './BannerUpload';

interface PageBannerProps {
  imageUrl?: string;
  title: string;
  description?: string;
  isEditable?: boolean;
  onBannerChange?: (url: string) => void;
  height?: string;
  children?: React.ReactNode;
}

export default function PageBanner({
  imageUrl,
  title,
  description,
  isEditable,
  onBannerChange,
  height = 'h-64',
  children
}: PageBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-surface-light rounded-lg overflow-hidden"
    >
      <div className="relative">
        {isEditable && onBannerChange ? (
          <BannerUpload
            currentBannerUrl={imageUrl}
            onBannerChange={onBannerChange}
            height={height}
          />
        ) : (
          <div 
            className={`${height} bg-cover bg-center relative`}
            style={{ 
              backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
              backgroundColor: !imageUrl ? '#1A1B23' : undefined
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent" />
          </div>
        )}
      </div>

      <div className="relative px-6 py-5">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            {description && (
              <p className="mt-2 text-gray-300">{description}</p>
            )}
          </div>
          {children}
        </div>
      </div>
    </motion.div>
  );
}