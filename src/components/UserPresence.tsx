import React from 'react';
import { format } from 'date-fns';

interface UserPresenceProps {
  userId: string;
  presenceData: {
    last_seen: any;
    status: 'online' | 'away' | 'offline';
  };
}

export default function UserPresence({ userId, presenceData }: UserPresenceProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className={`h-2 w-2 rounded-full ${getStatusColor(presenceData.status)} mr-2`} />
        <span className="text-sm text-white">User {userId.slice(0, 6)}</span>
      </div>
      <span className="text-xs text-gray-400">
        {presenceData.last_seen?.toDate?.() 
          ? format(presenceData.last_seen.toDate(), 'p')
          : 'Recently'
        }
      </span>
    </div>
  );
}