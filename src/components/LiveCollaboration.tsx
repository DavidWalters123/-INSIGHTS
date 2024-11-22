import React from 'react';
import { Users } from 'lucide-react';
import { useCollaboration } from '../hooks/useCollaboration';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveCollaborationProps {
  roomId: string;
}

export default function LiveCollaboration({ roomId }: LiveCollaborationProps) {
  const { activeUsers } = useCollaboration(roomId);

  return (
    <div className="fixed bottom-4 right-4">
      <div className="bg-surface border border-surface-light rounded-lg p-4 shadow-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-white font-medium">
            {activeUsers.length} Online
          </span>
        </div>

        <AnimatePresence>
          <div className="space-y-2">
            {activeUsers.map((user) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center space-x-2"
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: user.color }}
                />
                <span className="text-sm text-gray-300">{user.name}</span>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  );
}