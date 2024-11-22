import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hover = true, onClick }: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.02 } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`bg-surface border border-surface-light rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-200 ${className}`}
    >
      {children}
    </motion.div>
  );
}