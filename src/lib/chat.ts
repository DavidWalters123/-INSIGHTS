import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  addDoc, 
  serverTimestamp, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit,
  runTransaction,
  enableIndexedDbPersistence,
  DocumentReference
} from 'firebase/firestore';
import { db } from './firebase';
import type { ChatMessage, ChatRoom } from '../types';
import { toast } from 'react-hot-toast';

export async function initializeChatRoom(roomId: string, type: 'course' | 'community', name: string) {
  if (!roomId || !type || !name) {
    throw new Error('Invalid chat room parameters');
  }

  try {
    const roomRef = doc(db, 'chat_rooms', roomId);
    const roomDoc = await getDoc(roomRef);

    if (!roomDoc.exists()) {
      await setDoc(roomRef, {
        type,
        name,
        participant_count: 0,
        active_participants: {},
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });

      // Create initial message to prevent empty room errors
      await addDoc(collection(db, 'chat_messages'), {
        room_id: roomId,
        content: 'Welcome to the chat room!',
        sender_id: 'system',
        sender_name: 'System',
        created_at: serverTimestamp(),
        read_by: ['system'],
        type: 'text'
      });
    }

    return roomDoc;
  } catch (error: any) {
    console.error('Error initializing chat room:', error);
    handleChatError(error);
    throw error;
  }
}

export function subscribeToChat(roomId: string, callback: (messages: ChatMessage[]) => void) {
  if (!roomId) {
    callback([]);
    return () => {};
  }

  try {
    // First verify the room exists
    const roomRef = doc(db, 'chat_rooms', roomId);
    
    return onSnapshot(
      roomRef,
      {
        next: async (roomSnapshot) => {
          if (!roomSnapshot.exists()) {
            // If room doesn't exist, try to create it
            try {
              await initializeChatRoom(roomId, 'community', 'Chat Room');
            } catch (error) {
              console.error('Error creating chat room:', error);
              callback([]);
              return;
            }
          }

          // Now subscribe to messages
          const messagesQuery = query(
            collection(db, 'chat_messages'),
            where('room_id', '==', roomId),
            orderBy('created_at', 'asc'),
            limit(100)
          );

          return onSnapshot(
            messagesQuery,
            {
              next: (snapshot) => {
                const messages = snapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
                })) as ChatMessage[];
                callback(messages);
              },
              error: (error) => {
                console.error('Chat messages subscription error:', error);
                handleChatError(error);
                callback([]);
              }
            }
          );
        },
        error: (error) => {
          console.error('Chat room subscription error:', error);
          handleChatError(error);
          callback([]);
        }
      }
    );
  } catch (error) {
    console.error('Error setting up chat subscription:', error);
    handleChatError(error);
    callback([]);
    return () => {};
  }
}

export async function sendMessage(roomId: string, content: string, userId: string, userName: string) {
  if (!roomId || !content || !userId) {
    throw new Error('Missing required message parameters');
  }

  try {
    // Verify room exists first
    const roomRef = doc(db, 'chat_rooms', roomId);
    const roomDoc = await getDoc(roomRef);

    if (!roomDoc.exists()) {
      await initializeChatRoom(roomId, 'community', 'Chat Room');
    }

    const messageRef = collection(db, 'chat_messages');
    const messageData = {
      room_id: roomId,
      content: content.trim(),
      sender_id: userId,
      sender_name: userName || 'Anonymous',
      created_at: serverTimestamp(),
      read_by: [userId],
      type: 'text'
    };

    const docRef = await addDoc(messageRef, messageData);

    // Update room's last message
    await runTransaction(db, async (transaction) => {
      const roomDoc = await transaction.get(roomRef);
      if (!roomDoc.exists()) {
        throw new Error('Chat room not found');
      }

      transaction.update(roomRef, {
        last_message: { ...messageData, id: docRef.id },
        updated_at: serverTimestamp(),
        [`active_participants.${userId}`]: {
          last_seen: serverTimestamp(),
          status: 'online'
        }
      });
    });
  } catch (error) {
    console.error('Error sending message:', error);
    handleChatError(error);
    throw error;
  }
}

function handleChatError(error: any) {
  if (error.code === 'failed-precondition') {
    toast.error('Please refresh and try again');
  } else if (error.code === 'permission-denied') {
    toast.error('You do not have permission to access this chat');
  } else if (error.code === 'not-found') {
    toast.error('Chat room not found');
  } else {
    toast.error('An error occurred. Please try again.');
  }
}