import React, { useState } from 'react';
import { Users, MessageSquare, Video } from 'lucide-react';
import { useCollaboration } from '../hooks/useCollaboration';
import CollaborativeEditor from './CollaborativeEditor';
import LiveChat from './LiveChat';
import InteractiveWhiteboard from './InteractiveWhiteboard';

interface StudyGroupProps {
  groupId: string;
  name: string;
}

export default function StudyGroup({ groupId, name }: StudyGroupProps) {
  const [activeTab, setActiveTab] = useState<'notes' | 'chat' | 'whiteboard'>('notes');
  const { activeUsers } = useCollaboration(groupId);

  return (
    <div className="bg-surface border border-surface-light rounded-lg">
      <div className="p-4 border-b border-surface-light">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">{name}</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">
              {activeUsers.length} online
            </span>
            <div className="flex -space-x-2">
              {activeUsers.map((user) => (
                <div
                  key={user.id}
                  className="h-8 w-8 rounded-full border-2 border-surface flex items-center justify-center"
                  style={{ backgroundColor: user.color }}
                  title={user.name}
                >
                  {user.name[0]}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-4 mt-4">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center px-3 py-2 rounded-md ${
              activeTab === 'notes'
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4 mr-2" />
            Collaborative Notes
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center px-3 py-2 rounded-md ${
              activeTab === 'chat'
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Live Chat
          </button>
          <button
            onClick={() => setActiveTab('whiteboard')}
            className={`flex items-center px-3 py-2 rounded-md ${
              activeTab === 'whiteboard'
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Video className="h-4 w-4 mr-2" />
            Whiteboard
          </button>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'notes' && (
          <CollaborativeEditor
            roomId={`${groupId}-notes`}
            placeholder="Start taking notes together..."
          />
        )}
        {activeTab === 'chat' && (
          <LiveChat roomId={`${groupId}-chat`} />
        )}
        {activeTab === 'whiteboard' && (
          <InteractiveWhiteboard roomId={`${groupId}-whiteboard`} />
        )}
      </div>
    </div>
  );
}