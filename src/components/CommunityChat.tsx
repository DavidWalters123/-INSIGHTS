import React, { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp, 
  onSnapshot,
  doc,
  getDoc,
  limit
} from 'firebase/firestore';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import type { ChatMessage } from '../types';

interface CommunityChatProps {
  communityId: string;
  onClose: () => void;
}

export default function CommunityChat({ communityId, onClose }: CommunityChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'chat_messages'),
      where('community_id', '==', communityId),
      orderBy('created_at', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, {
      next: (snapshot) => {
        const newMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChatMessage[];
        setMessages(newMessages);
        scrollToBottom();
      },
      error: (err) => {
        console.error('Chat subscription error:', err);
        setError(err as Error);
        handleFirestoreError(err, 'Failed to load chat messages');
      }
    });

    return () => unsubscribe();
  }, [communityId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newMessage.trim() || sending) return;

    try {
      setSending(true);

      // Get the latest user data
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userDoc.data();

      if (!userData) {
        throw new Error('User data not found');
      }

      await addDoc(collection(db, 'chat_messages'), {
        content: newMessage.trim(),
        sender_id: auth.currentUser.uid,
        sender_name: userData.full_name || userData.username || 'Anonymous',
        community_id: communityId,
        created_at: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      handleFirestoreError(error, 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-20 right-4 w-96 bg-surface border border-surface-light rounded-lg shadow-xl flex flex-col"
    >
      <div className="p-4 border-b border-surface-light flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Community Chat</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
        {error ? (
          <div className="text-center text-red-400 py-4">
            Failed to load messages. Please try again.
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === auth.currentUser?.uid ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender_id === auth.currentUser?.uid
                    ? 'bg-primary text-white'
                    : 'bg-surface-light text-white'
                }`}
              >
                {message.sender_id !== auth.currentUser?.uid && (
                  <p className="text-xs text-gray-400 mb-1">{message.sender_name}</p>
                )}
                <p>{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.created_at?.toDate?.()
                    ? format(message.created_at.toDate(), 'p')
                    : 'Just now'}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-4">
            No messages yet. Start the conversation!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-surface-light">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}