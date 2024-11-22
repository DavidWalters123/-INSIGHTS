import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { ACHIEVEMENT_THRESHOLDS } from '../lib/rewards';

interface AchievementProgressProps {
  category: keyof typeof ACHIEVEMENT_THRESHOLDS;
  currentCount: number;
  unlockedLevel: number;
}

export default function AchievementProgress({ 
  category, 
  currentCount, 
  unlockedLevel 
}: AchievementProgressProps) {
  const thresholds = ACHIEVEMENT_THRESHOLDS[category];
  const nextThreshold = thresholds[unlockedLevel] || thresholds[thresholds.length - 1];
  const progress = Math.min((currentCount / nextThreshold) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span className="text-white font-medium">
            {category.split('_').map(word => 
              word.charAt(0) + word.slice(1).toLowerCase()
            ).join(' ')}
          </span>
        </div>
        <span className="text-sm text-gray-400">
          Level {unlockedLevel} / {thresholds.length}
        </span>
      </div>

      <div className="relative h-2 bg-surface rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-gray-400">{currentCount}</span>
        <span className="text-gray-400">{nextThreshold}</span>
      </div>
    </div>
  );
}