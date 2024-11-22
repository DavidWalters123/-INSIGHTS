import { useState, useEffect } from 'react';
import { CollaborationService } from '../services/collaboration';

export function useCollaboration(roomId: string, initialData?: any) {
  const [collaboration, setCollaboration] = useState<CollaborationService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);

  useEffect(() => {
    const collab = new CollaborationService({
      roomId,
      initialData,
      onSync: () => setIsConnected(true),
      onUpdate: () => {
        // Handle updates if needed
      },
    });

    setCollaboration(collab);

    // Set up awareness handling
    const awareness = collab.getAwareness();
    const updateActiveUsers = () => {
      const states = Array.from(awareness.getStates().values());
      setActiveUsers(states.map((state: any) => state.user));
    };

    awareness.on('change', updateActiveUsers);
    updateActiveUsers();

    return () => {
      awareness.off('change', updateActiveUsers);
      collab.destroy();
    };
  }, [roomId]);

  const getData = (key: string) => {
    return collaboration?.getData(key);
  };

  const setData = (key: string, value: any) => {
    collaboration?.setData(key, value);
  };

  return {
    isConnected,
    activeUsers,
    getData,
    setData,
  };
}