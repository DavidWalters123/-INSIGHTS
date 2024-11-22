import React from 'react';
import { User as UserIcon, Crown, Shield, UserX } from 'lucide-react';
import { format } from 'date-fns';
import type { User, CommunityMember } from '../types';

interface MemberListProps {
  members: (CommunityMember & { user: User })[];
  isAdmin: boolean;
  onRemoveMember?: (memberId: string) => void;
  onUpdateRole?: (memberId: string, newRole: 'admin' | 'member') => void;
}

export default function MemberList({ members = [], isAdmin, onRemoveMember, onUpdateRole }: MemberListProps) {
  return (
    <div className="bg-surface border border-surface-light rounded-lg">
      <div className="px-4 py-3 border-b border-surface-light">
        <h2 className="text-lg font-semibold text-white">Members ({members?.length || 0})</h2>
      </div>
      <div className="divide-y divide-surface-light">
        {members && members.length > 0 ? (
          members.map((member) => {
            const joinedAt = member.joined_at?.toDate?.() || new Date();
            const user = member.user || {
              id: member.user_id,
              email: '',
              full_name: 'Anonymous',
              created_at: new Date()
            };
            
            return (
              <div key={member.id} className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">
                        {user.full_name}
                      </span>
                      {member.role === 'admin' && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-400">
                      Joined {format(joinedAt, 'PP')}
                    </p>
                  </div>
                </div>
                {isAdmin && member.role !== 'admin' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onUpdateRole?.(member.id, 'admin')}
                      className="p-1 text-gray-400 hover:text-yellow-500"
                      title="Make Admin"
                    >
                      <Shield className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onRemoveMember?.(member.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Remove Member"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-gray-400">
            No members yet
          </div>
        )}
      </div>
    </div>
  );
}