import React from 'react';
import { Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip } from './Tooltip';

interface CreditBalanceProps {
  balance: number;
  lifetimeCredits: number;
}

export default function CreditBalance({ balance, lifetimeCredits }: CreditBalanceProps) {
  return (
    <motion.div 
      className="flex items-center space-x-2"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Tooltip
        content={
          <div className="text-center">
            <div className="font-medium">Lifetime Credits: {lifetimeCredits}</div>
            <div className="text-sm text-gray-400">Available: {balance}</div>
          </div>
        }
      >
        <div className="flex items-center px-3 py-1.5 bg-surface-light rounded-full cursor-pointer hover:bg-surface transition-colors">
          <Coins className="h-4 w-4 text-yellow-500 mr-2" />
          <span className="font-medium text-white">{balance}</span>
        </div>
      </Tooltip>
    </motion.div>
  );
}