import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import RichTextEditor from './RichTextEditor';

interface CreatePostFormProps {
  communityId: string;
  onPostCreated: () => void;
}

export default function CreatePostForm({ communityId, onPostCreated }: CreatePostFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!auth.currentUser) {
      toast.error('You must be logged in to create a post');
      return;
    }

    try {
      setSubmitting(true);

      // Get the latest user data from Firestore
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const userData = userDocSnap.data();

      if (!userData) {
        throw new Error('User data not found');
      }

      const user = {
        id: auth.currentUser.uid,
        email: auth.currentUser.email,
        full_name: userData.full_name,
        username: userData.username,
        avatar_url: auth.currentUser.photoURL
      };

      await addDoc(collection(db, 'posts'), {
        title,
        content,
        community_id: communityId,
        user_id: auth.currentUser.uid,
        user,
        created_at: serverTimestamp(),
        reaction_counts: {
          like: 0,
          bookmark: 0,
          celebrate: 0
        }
      });

      toast.success('Post created successfully');
      setTitle('');
      setContent('');
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-surface border border-surface-light rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Create a Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
          required
        />
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="What's on your mind?"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !title.trim() || !content.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? (
              'Posting...'
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                Post
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}