import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import type { Post, Comment, User } from '../types';
import CommentList from './CommentList';
import CreateCommentForm from './CreateCommentForm';
import PostReactions from './PostReactions';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Handle Firestore timestamp
  const createdAt = post.created_at?.toDate?.() || new Date();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (showComments && post.id) {
      const q = query(
        collection(db, 'comments'),
        where('post_id', '==', post.id),
        orderBy('created_at', 'desc')
      );

      unsubscribe = onSnapshot(
        q,
        {
          next: async (snapshot) => {
            try {
              const commentsData = await Promise.all(
                snapshot.docs.map(async (doc) => {
                  const data = doc.data();
                  return {
                    id: doc.id,
                    content: data.content,
                    post_id: data.post_id,
                    user_id: data.user_id,
                    user: data.user,
                    created_at: data.created_at?.toDate() || new Date(),
                    updated_at: data.updated_at?.toDate() || null
                  } as Comment;
                })
              );
              
              setComments(commentsData);
              setCommentCount(snapshot.size);
              setLoading(false);
            } catch (error) {
              console.error('Error processing comments:', error);
              handleFirestoreError(error);
            }
          },
          error: (error) => {
            console.error('Comments subscription error:', error);
            handleFirestoreError(error);
          }
        }
      );
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [showComments, post.id]);

  return (
    <div className="bg-surface border border-surface-light rounded-lg p-6">
      <div className="flex items-start space-x-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">
            {post.title}
          </h3>
          <p className="text-sm text-gray-400">
            Posted by {post.user?.full_name || 'Anonymous'} • {format(createdAt, 'PP')}
          </p>
          <div 
            className="mt-2 text-gray-300 prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <PostReactions postId={post.id} reactionCounts={post.reaction_counts} />
        <button
          onClick={() => setShowComments(!showComments)}
          className="inline-flex items-center space-x-1 text-gray-400 hover:text-primary transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          <span>{commentCount} Comments</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-6 space-y-6">
          <CreateCommentForm postId={post.id} onCommentCreated={() => {}} />
          <CommentList comments={comments} onCommentUpdated={() => {}} />
        </div>
      )}
    </div>
  );
}