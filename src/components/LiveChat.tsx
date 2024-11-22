import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useCollaboration } from '../hooks/useCollaboration';
import { auth } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: number;
}

export default function LiveChat({ roomId }: { roomId: string }) {
  const [message, setMessage] = useState('');
  const { getData, setData, activeUsers } = useCollaboration(roomId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const storedMessages = getData('messages') || [];
    setMessages(storedMessages);
  }, [getData]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !auth.currentUser) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message.trim(),
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'Anonymous',
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, newMessage];
    setData('messages', updatedMessages);
    setMessages(updatedMessages);
    setMessage('');
  };

  return (
    <div className="h-[600px] flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${
                msg.userId === auth.currentUser?.uid ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.userId === auth.currentUser?.uid
                    ? 'bg-primary text-white'
                    : 'bg-surface-light text-white'
                }`}
              >
                <p className="text-sm opacity-75 mb-1">{msg.userName}</p>
                <p>{msg.text}</p>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-surface-light">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            disabled={!message.trim()}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}