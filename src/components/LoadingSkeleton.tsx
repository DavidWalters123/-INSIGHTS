import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'card' | 'list' | 'text' | 'banner';
  className?: string;
}

export default function LoadingSkeleton({ count = 1, type = 'card', className = '' }: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  const renderSkeleton = (index: number) => {
    switch (type) {
      case 'banner':
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-surface border border-surface-light rounded-lg overflow-hidden ${className}`}
          >
            <div className="h-64 bg-surface-light animate-pulse" />
            <div className="p-6 space-y-4">
              <div className="h-8 bg-surface-light rounded w-1/3 animate-pulse" />
              <div className="h-4 bg-surface-light rounded w-2/3 animate-pulse" />
              <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-surface-light rounded animate-pulse" />
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'card':
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-surface border border-surface-light rounded-lg overflow-hidden ${className}`}
          >
            <div className="h-48 bg-surface-light animate-pulse" />
            <div className="p-6 space-y-4">
              <div className="flex space-x-2">
                <div className="h-6 w-20 bg-surface-light rounded-full animate-pulse" />
                <div className="h-6 w-24 bg-surface-light rounded-full animate-pulse" />
              </div>
              <div className="h-8 bg-surface-light rounded animate-pulse" />
              <div className="h-4 bg-surface-light rounded w-3/4 animate-pulse" />
              <div className="grid grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-surface-light rounded animate-pulse" />
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'list':
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-surface border border-surface-light rounded-lg p-4 ${className}`}
          >
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 rounded-full bg-surface-light animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-surface-light rounded w-1/4 animate-pulse" />
                <div className="h-3 bg-surface-light rounded w-3/4 animate-pulse" />
              </div>
              <div className="h-8 w-24 bg-surface-light rounded animate-pulse" />
            </div>
          </motion.div>
        );

      case 'text':
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`space-y-2 ${className}`}
          >
            <div className="h-4 bg-surface-light rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-surface-light rounded w-1/2 animate-pulse" />
            <div className="h-4 bg-surface-light rounded w-5/6 animate-pulse" />
          </motion.div>
        );
    }
  };

  return <>{items.map(renderSkeleton)}</>;
}