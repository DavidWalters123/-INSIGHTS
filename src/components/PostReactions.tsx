import React, { useState, useEffect } from 'react';
import { ThumbsUp, Bookmark, PartyPopper } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { auth, db, handleFirestoreError } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';
import type { PostReaction } from '../types';
import { createReactionNotification } from '../lib/notifications';

interface PostReactionsProps {
  postId: string;
  reactionCounts?: {
    like?: number;
    bookmark?: number;
    celebrate?: number;
  };
}

export default function PostReactions({ postId, reactionCounts = {} }: PostReactionsProps) {
  const [userReactions, setUserReactions] = useState<Record<string, string>>({});
  const [counts, setCounts] = useState(reactionCounts);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (auth.currentUser) {
      // Subscribe to user's reactions
      const q = query(
        collection(db, 'post_reactions'),
        where('post_id', '==', postId),
        where('user_id', '==', auth.currentUser.uid)
      );

      unsubscribe = onSnapshot(q, {
        next: (snapshot) => {
          const reactions: Record<string, string> = {};
          snapshot.forEach((doc) => {
            const reaction = doc.data() as PostReaction;
            reactions[reaction.type] = doc.id;
          });
          setUserReactions(reactions);
        },
        error: (error) => {
          console.error('Error loading reactions:', error);
          handleFirestoreError(error);
        }
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [postId]);

  async function toggleReaction(type: 'like' | 'bookmark' | 'celebrate') {
    if (!auth.currentUser || loading) {
      toast.error('You must be logged in to react to posts');
      return;
    }

    try {
      setLoading(true);

      if (userReactions[type]) {
        // Remove reaction
        await deleteDoc(doc(db, 'post_reactions', userReactions[type]));
        const newReactions = { ...userReactions };
        delete newReactions[type];
        setUserReactions(newReactions);
        setCounts({
          ...counts,
          [type]: Math.max(0, (counts[type] || 0) - 1)
        });
      } else {
        // Add reaction
        const reactionData = {
          post_id: postId,
          user_id: auth.currentUser.uid,
          type,
          created_at: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'post_reactions'), reactionData);
        setUserReactions({
          ...userReactions,
          [type]: docRef.id
        });
        setCounts({
          ...counts,
          [type]: (counts[type] || 0) + 1
        });

        // Create notification
        await createReactionNotification(postId, type, auth.currentUser.displayName || 'Someone');
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      handleFirestoreError(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => toggleReaction('like')}
        disabled={loading}
        className={clsx(
          'inline-flex items-center space-x-1 text-sm transition-colors',
          userReactions.like ? 'text-primary' : 'text-gray-400 hover:text-primary'
        )}
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{counts.like || 0}</span>
      </button>

      <button
        onClick={() => toggleReaction('bookmark')}
        disabled={loading}
        className={clsx(
          'inline-flex items-center space-x-1 text-sm transition-colors',
          userReactions.bookmark ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
        )}
      >
        <Bookmark className="h-4 w-4" />
        <span>{counts.bookmark || 0}</span>
      </button>

      <button
        onClick={() => toggleReaction('celebrate')}
        disabled={loading}
        className={clsx(
          'inline-flex items-center space-x-1 text-sm transition-colors',
          userReactions.celebrate ? 'text-green-500' : 'text-gray-400 hover:text-green-500'
        )}
      >
        <PartyPopper className="h-4 w-4" />
        <span>{counts.celebrate || 0}</span>
      </button>
    </div>
  );
}