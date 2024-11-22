import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { auth } from '../lib/firebase';
import { Megaphone, Plus, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RichTextEditor from './RichTextEditor';

interface CommunityAnnouncementsProps {
  communityId: string;
  isAdmin: boolean;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: any;
  created_by: string;
  community_id: string;
}

export default function CommunityAnnouncements({ communityId, isAdmin }: CommunityAnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    loadAnnouncements();
  }, [communityId]);

  async function loadAnnouncements() {
    try {
      const q = query(
        collection(db, 'announcements'),
        where('community_id', '==', communityId),
        orderBy('created_at', 'desc')
      );

      const snapshot = await getDocs(q).catch(error => {
        handleFirestoreError(error, 'Failed to load announcements');
        return null;
      });

      if (!snapshot) {
        setAnnouncements([]);
        return;
      }

      const announcementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Announcement[];

      setAnnouncements(announcementsData);
    } catch (error) {
      handleFirestoreError(error, 'Failed to load announcements');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      await addDoc(collection(db, 'announcements'), {
        ...formData,
        community_id: communityId,
        created_by: auth.currentUser.uid,
        created_at: serverTimestamp()
      });

      toast.success('Announcement posted successfully');
      setFormData({ title: '', content: '' });
      setShowForm(false);
      loadAnnouncements();
    } catch (error) {
      handleFirestoreError(error, 'Failed to post announcement');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Announcements</h2>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Announcement
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface border border-surface-light rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Content
            </label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Write your announcement..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
            >
              Post Announcement
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="bg-surface border border-surface-light rounded-lg p-6"
          >
            <div className="flex items-start space-x-3">
              <Megaphone className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-white">
                  {announcement.title}
                </h3>
                <div 
                  className="mt-2 prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: announcement.content }}
                />
                <p className="mt-4 text-sm text-gray-400">
                  Posted {announcement.created_at?.toDate?.().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <Megaphone className="h-8 w-8 mx-auto mb-2" />
            <p>No announcements yet</p>
          </div>
        )}
      </div>
    </div>
  );
}