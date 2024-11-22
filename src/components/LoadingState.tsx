import React from 'react';
import { Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSkeleton from './LoadingSkeleton';

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton';
  count?: number;
  skeletonType?: 'card' | 'list' | 'text';
  text?: string;
}

export default function LoadingState({ 
  type = 'spinner', 
  count = 1,
  skeletonType = 'card',
  text = 'Loading...'
}: LoadingStateProps) {
  if (type === 'skeleton') {
    return <LoadingSkeleton count={count} type={skeletonType} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[400px]"
    >
      <Loader className="h-8 w-8 text-primary animate-spin mb-4" />
      <p className="text-gray-400">{text}</p>
    </motion.div>
  );
}