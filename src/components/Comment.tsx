import React, { useState } from 'react';
import { format } from 'date-fns';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import type { Comment as CommentType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface CommentProps {
  comment: CommentType;
  onCommentUpdated: () => void;
}

export default function Comment({ comment, onCommentUpdated }: CommentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAuthor = auth.currentUser?.uid === comment.user_id;
  const createdAt = comment.created_at?.toDate?.() || new Date();

  const handleEdit = async () => {
    if (!auth.currentUser || !editedContent.trim()) return;
    
    try {
      setIsSubmitting(true);
      await updateDoc(doc(db, 'comments', comment.id), {
        content: editedContent.trim(),
        updated_at: serverTimestamp()
      });

      toast.success('Comment updated');
      setIsEditing(false);
      onCommentUpdated();
    } catch (error) {
      handleFirestoreError(error, 'Failed to update comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!auth.currentUser || !window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      setIsSubmitting(true);
      await deleteDoc(doc(db, 'comments', comment.id));
      toast.success('Comment deleted');
      onCommentUpdated();
    } catch (error) {
      handleFirestoreError(error, 'Failed to delete comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface-light rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          {comment.user?.avatar_url ? (
            <img
              src={comment.user.avatar_url}
              alt={comment.user.full_name}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium">
                {comment.user?.full_name?.[0] || '?'}
              </span>
            </div>
          )}
          <div>
            <span className="font-medium text-white">
              {comment.user?.full_name || comment.user?.username || 'Anonymous'}
            </span>
            <span className="text-sm text-gray-400 ml-2">
              {format(createdAt, 'PP')}
            </span>
          </div>
        </div>

        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-surface transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-1 w-32 bg-surface border border-surface-light rounded-lg shadow-lg overflow-hidden z-10"
                >
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setIsEditing(true);
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-surface-light"
                    disabled={isSubmitting}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDelete();
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-surface-light"
                    disabled={isSubmitting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="mt-4 space-y-4">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
            rows={3}
            disabled={isSubmitting}
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleEdit}
              disabled={isSubmitting || !editedContent.trim()}
              className="px-3 py-1.5 text-sm bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-gray-300">{comment.content}</p>
      )}
    </div>
  );
}