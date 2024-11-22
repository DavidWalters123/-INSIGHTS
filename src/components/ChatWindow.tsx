import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader } from 'lucide-react';
import { doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import type { ChatMessage, ChatRoom } from '../types';
import { sendMessage, subscribeToChat, initializeChatRoom } from '../lib/chat';
import UserPresence from './UserPresence';

interface ChatWindowProps {
  roomId: string;
  roomType: 'course' | 'community';
  roomName: string;
  onClose: () => void;
}

export default function ChatWindow({ roomId, roomType, roomName, onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unsubscribeMessages: (() => void) | null = null;
    let unsubscribeRoom: (() => void) | null = null;
    let mounted = true;

    const setupChat = async () => {
      if (!auth.currentUser) {
        setError(new Error('You must be logged in to use chat'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Initialize chat room
        await initializeChatRoom(roomId, roomType, roomName);

        // Subscribe to messages
        unsubscribeMessages = subscribeToChat(roomId, (newMessages) => {
          if (mounted) {
            setMessages(newMessages);
            setLoading(false);
          }
        });

        // Subscribe to room data
        const roomRef = doc(db, 'chat_rooms', roomId);
        unsubscribeRoom = onSnapshot(roomRef, {
          next: (snapshot) => {
            if (mounted && snapshot.exists()) {
              setRoom(snapshot.data() as ChatRoom);
            }
          },
          error: (error) => {
            console.error('Room subscription error:', error);
            if (mounted) {
              setError(new Error('Failed to connect to chat room'));
              setLoading(false);
            }
          }
        });

        // Update user presence
        await updateDoc(roomRef, {
          [`active_participants.${auth.currentUser.uid}`]: {
            last_seen: serverTimestamp(),
            status: 'online'
          }
        });
      } catch (error) {
        console.error('Error setting up chat:', error);
        if (mounted) {
          setError(error instanceof Error ? error : new Error('Failed to initialize chat'));
          setLoading(false);
        }
      }
    };

    setupChat();

    return () => {
      mounted = false;
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeRoom) unsubscribeRoom();

      // Update status to offline
      if (auth.currentUser && roomId) {
        const roomRef = doc(db, 'chat_rooms', roomId);
        updateDoc(roomRef, {
          [`active_participants.${auth.currentUser.uid}.status`]: 'offline',
          [`active_participants.${auth.currentUser.uid}.last_seen`]: serverTimestamp()
        }).catch(console.error);
      }
    };
  }, [roomId, roomType, roomName]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newMessage.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(
        roomId,
        newMessage.trim(),
        auth.currentUser.uid,
        auth.currentUser.displayName || 'Anonymous'
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed bottom-20 right-4 w-96 bg-surface border border-surface-light rounded-lg shadow-xl p-8">
        <div className="flex flex-col items-center justify-center">
          <Loader className="h-8 w-8 text-primary animate-spin mb-4" />
          <p className="text-gray-400">Connecting to chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-20 right-4 w-96 bg-surface border border-surface-light rounded-lg shadow-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-medium">Chat Error</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-red-400 mb-4">{error.message}</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-4 w-96 h-[600px] bg-surface border border-surface-light rounded-lg shadow-xl flex flex-col">
      <div className="p-4 border-b border-surface-light flex justify-between items-center">
        <div>
          <h3 className="text-white font-medium">{roomName}</h3>
          {room && (
            <p className="text-sm text-gray-400">
              {Object.keys(room.active_participants || {}).length} active
            </p>
          )}
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
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
                  ? new Date(message.created_at.toDate()).toLocaleTimeString()
                  : 'Just now'}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-surface-light">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {sending ? (
              <Loader className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}