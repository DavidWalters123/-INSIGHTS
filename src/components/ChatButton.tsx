import React, { useState } from 'react';
import { MessageSquare, Users } from 'lucide-react';
import ChatWindow from './ChatWindow';

interface ChatButtonProps {
  roomId: string;
  roomType: 'course' | 'community';
  roomName: string;
}

export default function ChatButton({ roomId, roomType, roomName }: ChatButtonProps) {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <div className="mt-8 border-t border-surface-light pt-6">
        <button
          onClick={() => setShowChat(!showChat)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
            showChat 
              ? 'bg-primary text-white'
              : 'bg-surface-light hover:bg-surface-light/80 text-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-5 w-5" />
            <span className="font-medium">Community Chat</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-6 w-6 rounded-full bg-surface-dark border-2 border-surface-light flex items-center justify-center"
                >
                  <Users className="h-3 w-3" />
                </div>
              ))}
            </div>
            <span className="text-sm opacity-75">12 online</span>
          </div>
        </button>
      </div>

      {showChat && (
        <ChatWindow
          roomId={roomId}
          roomType={roomType}
          roomName={roomName}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}