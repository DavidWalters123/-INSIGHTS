import React, { useState } from 'react';
import { Target, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLearningStore } from '../lib/stores/learningStore';

export default function StudyGoals() {
  const { studyGoals, setStudyGoals } = useLearningStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tempGoals, setTempGoals] = useState(studyGoals);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudyGoals(tempGoals);
    setIsEditing(false);
  };

  return (
    <div className="bg-surface border border-surface-light rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium text-white">Study Goals</h3>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <Edit2 className="h-4 w-4" />
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Daily Study Time (minutes)
            </label>
            <input
              type="number"
              value={tempGoals.dailyMinutes}
              onChange={(e) => setTempGoals({ ...tempGoals, dailyMinutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Weekly Lessons
            </label>
            <input
              type="number"
              value={tempGoals.weeklyLessons}
              onChange={(e) => setTempGoals({ ...tempGoals, weeklyLessons: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
              min="1"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
            >
              Save Goals
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface-light rounded-lg p-4"
          >
            <p className="text-sm text-gray-400">Daily Study Time</p>
            <p className="text-2xl font-bold text-white">
              {studyGoals.dailyMinutes} minutes
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-light rounded-lg p-4"
          >
            <p className="text-sm text-gray-400">Weekly Lessons</p>
            <p className="text-2xl font-bold text-white">
              {studyGoals.weeklyLessons} lessons
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}