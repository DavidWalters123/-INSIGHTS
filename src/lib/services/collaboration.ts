import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import { auth } from '../firebase';

interface CollaborationOptions {
  roomId: string;
  initialData?: any;
  onSync?: () => void;
  onUpdate?: (update: any) => void;
}

export class CollaborationService {
  private doc: Y.Doc;
  private provider: WebrtcProvider;
  private persistence: IndexeddbPersistence;
  private awareness: any;

  constructor({ roomId, initialData, onSync, onUpdate }: CollaborationOptions) {
    this.doc = new Y.Doc();
    
    // Set up WebRTC provider for real-time sync
    this.provider = new WebrtcProvider(`insights-${roomId}`, this.doc, {
      signaling: ['wss://signaling.stackblitz.com'],
      password: null,
      awareness: {
        user: {
          id: auth.currentUser?.uid,
          name: auth.currentUser?.displayName,
          color: this.getRandomColor(),
        },
      },
    });

    // Set up IndexedDB persistence
    this.persistence = new IndexeddbPersistence(`insights-${roomId}`, this.doc);
    
    this.awareness = this.provider.awareness;

    // Initialize data if provided
    if (initialData) {
      const yMap = this.doc.getMap('data');
      Object.entries(initialData).forEach(([key, value]) => {
        yMap.set(key, value);
      });
    }

    // Set up event handlers
    this.persistence.on('synced', () => {
      onSync?.();
    });

    this.doc.on('update', (update: any) => {
      onUpdate?.(update);
    });
  }

  private getRandomColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  public getData(key: string): any {
    const yMap = this.doc.getMap('data');
    return yMap.get(key);
  }

  public setData(key: string, value: any): void {
    const yMap = this.doc.getMap('data');
    yMap.set(key, value);
  }

  public getAwareness(): any {
    return this.awareness;
  }

  public destroy(): void {
    this.provider.destroy();
    this.persistence.destroy();
    this.doc.destroy();
  }
}