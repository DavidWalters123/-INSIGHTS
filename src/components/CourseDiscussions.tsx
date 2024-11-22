import React, { useState } from 'react';
import { MessageSquare, Pin } from 'lucide-react';
import { format } from 'date-fns';
import type { Discussion } from '../types';
import RichTextEditor from './RichTextEditor';

interface CourseDiscussionsProps {
  discussions: Discussion[];
  onCreateDiscussion: (title: string, content: string) => Promise<void>;
}

export default function CourseDiscussions({ discussions = [], onCreateDiscussion }: CourseDiscussionsProps) {
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onCreateDiscussion(title, content);
      setTitle('');
      setContent('');
      setShowNewDiscussion(false);
    } catch (error) {
      console.error('Error creating discussion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Discussions</h2>
        <button
          onClick={() => setShowNewDiscussion(!showNewDiscussion)}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
        >
          New Discussion
        </button>
      </div>

      {showNewDiscussion && (
        <form onSubmit={handleSubmit} className="bg-surface border border-surface-light rounded-lg p-4 space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Discussion title"
            className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
            required
          />
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="What would you like to discuss?"
          />
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowNewDiscussion(false)}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Post Discussion'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {discussions.map((discussion) => (
          <div
            key={discussion.id}
            className="bg-surface border border-surface-light rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {discussion.pinned && (
                    <Pin className="h-4 w-4 text-primary" />
                  )}
                  <h3 className="text-lg font-medium text-white">
                    {discussion.title}
                  </h3>
                </div>
                <div className="mt-2 text-gray-300 line-clamp-2">
                  {discussion.content}
                </div>
                <div className="mt-4 flex items-center text-sm text-gray-400">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {discussion.reply_count || 0} replies
                  <span className="mx-2">•</span>
                  {discussion.created_at?.toDate?.() 
                    ? format(discussion.created_at.toDate(), 'PP')
                    : 'Recently'
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
        {discussions.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No discussions yet. Start a new discussion!
          </div>
        )}
      </div>
    </div>
  );
}