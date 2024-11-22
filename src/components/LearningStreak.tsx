import React from 'react';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLearningStore } from '../lib/stores/learningStore';
import Confetti from 'react-confetti';

export default function LearningStreak() {
  const { streakDays } = useLearningStore();
  const showConfetti = streakDays > 0 && streakDays % 7 === 0;

  return (
    <div className="relative">
      {showConfetti && <Confetti numberOfPieces={100} recycle={false} />}
      
      <motion.div
        className="bg-surface border border-surface-light rounded-lg p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <Flame className="h-6 w-6 text-orange-500" />
          <h3 className="text-lg font-medium text-white">Learning Streak</h3>
        </div>

        <div className="text-center">
          <motion.div
            className="text-5xl font-bold text-white mb-2"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5 }}
          >
            {streakDays}
          </motion.div>
          <p className="text-gray-400">
            {streakDays === 1 ? 'day' : 'days'} in a row
          </p>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full ${
                i < streakDays % 7 ? 'bg-orange-500' : 'bg-surface-light'
              }`}
            />
          ))}
        </div>

        {streakDays >= 7 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              {Math.floor(streakDays / 7)} week{streakDays >= 14 ? 's' : ''} completed!
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}