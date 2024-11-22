import React from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { Trophy, Award, Star, Medal } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'award' | 'star' | 'medal';
  progress: number;
  total: number;
  completed: boolean;
  unlockedAt?: Date;
}

interface AchievementSystemProps {
  achievements: Achievement[];
  onAchievementClick: (achievement: Achievement) => void;
}

export default function AchievementSystem({ 
  achievements, 
  onAchievementClick 
}: AchievementSystemProps) {
  const getIcon = (type: Achievement['icon']) => {
    switch (type) {
      case 'trophy':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'award':
        return <Award className="h-6 w-6 text-blue-500" />;
      case 'star':
        return <Star className="h-6 w-6 text-purple-500" />;
      case 'medal':
        return <Medal className="h-6 w-6 text-green-500" />;
    }
  };

  const recentlyUnlocked = achievements.find(
    a => a.completed && a.unlockedAt && 
    new Date().getTime() - new Date(a.unlockedAt).getTime() < 5000
  );

  return (
    <div className="space-y-6">
      {recentlyUnlocked && <Confetti numberOfPieces={200} recycle={false} />}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Achievements</h2>
        <div className="text-gray-400">
          {achievements.filter(a => a.completed).length} / {achievements.length} Unlocked
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement, index) => (
          <motion.button
            key={achievement.id}
            onClick={() => onAchievementClick(achievement)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`w-full text-left p-4 rounded-lg border ${
              achievement.completed
                ? 'bg-surface border-primary/50'
                : 'bg-surface-light border-surface-light'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-lg ${
                achievement.completed ? 'bg-primary/10' : 'bg-surface'
              }`}>
                {getIcon(achievement.icon)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">
                  {achievement.title}
                </h3>
                <p className="text-sm text-gray-400 mb-2">
                  {achievement.description}
                </p>
                <div className="w-full bg-surface rounded-full h-2">
                  <motion.div
                    className="bg-primary rounded-full h-2"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(achievement.progress / achievement.total) * 100}%` 
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {achievement.progress} / {achievement.total}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}