import { io } from 'socket.io-client';
import { auth } from './firebase';

const SOCKET_URL = 'https://your-socket-server.com'; // Replace with your Socket.IO server URL

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: (cb) => {
    const token = auth.currentUser?.getIdToken();
    cb({ token });
  }
});

export function initializeSocket() {
  if (auth.currentUser) {
    socket.connect();
    
    socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }
}

export function disconnectSocket() {
  socket.disconnect();
}