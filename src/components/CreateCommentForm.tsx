import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface CreateCommentFormProps {
  postId: string;
  onCommentCreated: () => void;
}

export default function CreateCommentForm({ postId, onCommentCreated }: CreateCommentFormProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!auth.currentUser) {
      toast.error('You must be logged in to comment');
      return;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) return;

    try {
      setSubmitting(true);

      // Get the latest user data
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userDoc.data();

      if (!userData) {
        throw new Error('User data not found');
      }

      await addDoc(collection(db, 'comments'), {
        content: trimmedContent,
        post_id: postId,
        user_id: auth.currentUser.uid,
        user: {
          id: auth.currentUser.uid,
          email: auth.currentUser.email,
          full_name: userData.full_name,
          username: userData.username,
          avatar_url: userData.avatar_url
        },
        created_at: serverTimestamp()
      });

      setContent('');
      onCommentCreated();
      toast.success('Comment added successfully');
    } catch (error) {
      handleFirestoreError(error, 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
    >
      <textarea
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
        rows={2}
        disabled={submitting}
        required
      />
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={submitting || !content.trim()}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 disabled:opacity-50"
      >
        {submitting ? (
          'Posting...'
        ) : (
          <>
            <Send className="h-4 w-4 mr-1" />
            Comment
          </>
        )}
      </motion.button>
    </motion.form>
  );
}