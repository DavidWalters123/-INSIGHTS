import React from 'react';
import { Trophy, XCircle } from 'lucide-react';
import type { QuizAttempt } from '../types';

interface QuizProgressProps {
  attempts: QuizAttempt[];
  passingScore: number;
}

export default function QuizProgress({ attempts, passingScore }: QuizProgressProps) {
  const bestAttempt = attempts.reduce((best, current) => 
    current.score > (best?.score || 0) ? current : best
  , attempts[0]);

  const latestAttempt = attempts[attempts.length - 1];

  return (
    <div className="bg-surface-light rounded-lg p-4">
      <h3 className="text-white font-medium mb-4">Quiz Progress</h3>
      
      {attempts.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface p-3 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Best Score</div>
              <div className="text-2xl font-bold text-primary">
                {bestAttempt.score}%
              </div>
            </div>
            <div className="bg-surface p-3 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Latest Score</div>
              <div className="text-2xl font-bold text-white">
                {latestAttempt.score}%
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="text-gray-400">
              {attempts.length} attempt{attempts.length !== 1 ? 's' : ''}
            </div>
            {bestAttempt.score >= passingScore ? (
              <div className="flex items-center text-green-500">
                <Trophy className="h-4 w-4 mr-1" />
                Passed
              </div>
            ) : (
              <div className="flex items-center text-red-500">
                <XCircle className="h-4 w-4 mr-1" />
                Not Passed
              </div>
            )}
          </div>

          <div className="space-y-2">
            {attempts.map((attempt, index) => {
              const date = attempt.completed_at?.toDate?.() || new Date();
              return (
                <div
                  key={attempt.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="text-gray-400">
                    Attempt {attempts.length - index}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={attempt.score >= passingScore ? 'text-green-500' : 'text-red-500'}>
                      {attempt.score}%
                    </div>
                    <div className="text-gray-500">
                      {date.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 py-4">
          No attempts yet
        </div>
      )}
    </div>
  );
}