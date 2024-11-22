import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import type { Comment } from '../types';
import { Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Comment from './Comment';

interface CommentListProps {
  postId: string;
  onCommentUpdated: () => void;
}

export default function CommentList({ postId, onCommentUpdated }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!postId) {
      setError(new Error('Post ID is required'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Create the query with proper field validation
    const q = query(
      collection(db, 'comments'),
      where('post_id', '==', postId),
      orderBy('created_at', 'desc')
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const commentsData = snapshot.docs.map(doc => {
            const data = doc.data();
            // Validate and transform timestamp
            const created_at = data.created_at instanceof Timestamp 
              ? data.created_at.toDate() 
              : new Date();

            return {
              id: doc.id,
              content: data.content || '',
              post_id: data.post_id,
              user_id: data.user_id,
              user: data.user || null,
              created_at,
              updated_at: data.updated_at instanceof Timestamp 
                ? data.updated_at.toDate() 
                : null
            } as Comment;
          });
          
          setComments(commentsData);
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error('Error processing comments:', err);
          setError(new Error('Failed to process comments data'));
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error loading comments:', err);
        setError(err as Error);
        setLoading(false);
        handleFirestoreError(err, 'Failed to load comments');
      }
    );

    // Cleanup subscription
    return () => unsubscribe();
  }, [postId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 py-4">
        Failed to load comments. 
        <button
          onClick={() => setLoading(true)} // This will trigger the useEffect again
          className="ml-2 text-primary hover:text-primary/90"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Comment comment={comment} onCommentUpdated={onCommentUpdated} />
          </motion.div>
        ))}
      </AnimatePresence>

      {comments.length === 0 && (
        <div className="text-center text-gray-400 py-4">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
}