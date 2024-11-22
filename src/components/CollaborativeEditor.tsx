import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import { useCollaboration } from '../hooks/useCollaboration';
import { auth } from '../lib/firebase';
import { Loader } from 'lucide-react';

interface CollaborativeEditorProps {
  roomId: string;
  initialContent?: string;
  onChange?: (content: string) => void;
}

export default function CollaborativeEditor({
  roomId,
  initialContent,
  onChange
}: CollaborativeEditorProps) {
  const { isConnected, activeUsers } = useCollaboration(roomId, {
    content: initialContent
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: initialContent,
      }),
      CollaborationCursor.configure({
        provider: collaboration?.provider,
        user: {
          name: auth.currentUser?.displayName || 'Anonymous',
          color: '#ff0000',
        },
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-48 bg-surface-light rounded-lg">
        <Loader className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-400">
          {activeUsers.length} active user{activeUsers.length !== 1 ? 's' : ''}
        </span>
        <div className="flex -space-x-2">
          {activeUsers.map((user) => (
            <div
              key={user.id}
              className="h-6 w-6 rounded-full border-2 border-surface flex items-center justify-center"
              style={{ backgroundColor: user.color }}
              title={user.name}
            >
              {user.name[0]}
            </div>
          ))}
        </div>
      </div>

      <div className="prose prose-invert max-w-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}