import React, { useState, useEffect } from 'react';
import { Timer, Pause, Play, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useLearningStore } from '../lib/stores/learningStore';

export default function StudyTimer() {
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const { updateStreak } = useLearningStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime((time) => time - 1);
      }, 1000);
    } else if (time === 0) {
      if (!isBreak) {
        toast.success('Study session completed! Take a break.');
        updateStreak();
        setIsBreak(true);
        setTime(5 * 60); // 5 minute break
      } else {
        toast.success('Break finished! Ready for another session?');
        setIsBreak(false);
        setTime(25 * 60);
      }
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, time, isBreak]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(25 * 60);
    setIsBreak(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((isBreak ? 5 * 60 : 25 * 60) - time) / (isBreak ? 5 * 60 : 25 * 60) * 100;

  return (
    <div className="bg-surface border border-surface-light rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Timer className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium text-white">
            {isBreak ? 'Break Time' : 'Study Timer'}
          </h3>
        </div>
        <button
          onClick={resetTimer}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="relative">
        <motion.div
          className="w-full h-2 bg-surface-light rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-4xl font-bold text-white mb-4">
          {formatTime(time)}
        </p>
        <button
          onClick={toggleTimer}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          {isActive ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              {time === (isBreak ? 5 * 60 : 25 * 60) ? 'Start' : 'Resume'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}