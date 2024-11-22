import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  MessageSquare, 
  ThumbsUp, 
  BookOpen,
  Users,
  Calendar,
  FileText,
  Award
} from 'lucide-react';
import { REWARD_CREDITS } from '../lib/rewards';

interface RewardTransaction {
  type: keyof typeof REWARD_CREDITS;
  credits: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface RewardHistoryProps {
  transactions: RewardTransaction[];
}

export default function RewardHistory({ transactions }: RewardHistoryProps) {
  const getIcon = (type: keyof typeof REWARD_CREDITS) => {
    switch (type) {
      case 'CREATE_POST':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'RECEIVE_LIKE':
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'COMMENT':
      case 'RECEIVE_COMMENT':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case 'COURSE_COMPLETION':
      case 'COURSE_ENROLLMENT':
        return <BookOpen className="h-4 w-4 text-yellow-500" />;
      case 'DAILY_LOGIN':
        return <Calendar className="h-4 w-4 text-primary" />;
      case 'ACHIEVEMENT_UNLOCK':
        return <Trophy className="h-4 w-4 text-orange-500" />;
      case 'COMMUNITY_CREATION':
        return <Users className="h-4 w-4 text-pink-500" />;
      default:
        return <Award className="h-4 w-4 text-gray-400" />;
    }
  };

  const getDescription = (transaction: RewardTransaction) => {
    switch (transaction.type) {
      case 'ACHIEVEMENT_UNLOCK':
        return `Achievement Unlocked: ${transaction.metadata?.category} Level ${transaction.metadata?.level}`;
      case 'COURSE_COMPLETION':
        return `Completed course: ${transaction.metadata?.courseTitle}`;
      case 'STREAK_BONUS':
        return `${transaction.metadata?.days} Day Streak Bonus!`;
      default:
        return transaction.type.split('_').map(word => 
          word.charAt(0) + word.slice(1).toLowerCase()
        ).join(' ');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Recent Rewards</h2>
      
      <div className="space-y-2">
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.timestamp.getTime()}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-surface border border-surface-light rounded-lg"
          >
            <div className="flex items-center space-x-3">
              {getIcon(transaction.type)}
              <div>
                <p className="text-white">{getDescription(transaction)}</p>
                <p className="text-sm text-gray-400">
                  {format(transaction.timestamp, 'PPp')}
                </p>
              </div>
            </div>
            <div className="flex items-center text-yellow-500 font-medium">
              +{transaction.credits}
            </div>
          </motion.div>
        ))}

        {transactions.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Trophy className="h-8 w-8 mx-auto mb-2" />
            <p>No rewards yet</p>
          </div>
        )}
      </div>
    </div>
  );
}