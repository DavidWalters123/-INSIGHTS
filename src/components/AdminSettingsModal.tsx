import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import type { Community } from '../types';

interface AdminSettingsModalProps {
  community: Community;
  onClose: () => void;
  onUpdate: (updates: Partial<Community>) => void;
}

export default function AdminSettingsModal({ community, onClose, onUpdate }: AdminSettingsModalProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: community.name,
    description: community.description,
    banner_url: community.banner_url || ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const updates = {
        name: formData.name,
        description: formData.description,
        banner_url: formData.banner_url || null
      };

      await updateDoc(doc(db, 'communities', community.id), updates);
      toast.success('Community settings updated');
      onUpdate(updates);
    } catch (error) {
      console.error('Error updating community:', error);
      toast.error('Failed to update community settings');
    }
  }

  async function handleDelete() {
    if (!community.id) return;

    try {
      setDeleting(true);

      // Delete all related data
      const collections = ['posts', 'comments', 'courses', 'community_members', 'announcements', 'events'];
      
      for (const collectionName of collections) {
        const q = query(
          collection(db, collectionName),
          where('community_id', '==', community.id)
        );
        
        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }

      // Finally delete the community
      await deleteDoc(doc(db, 'communities', community.id));
      
      toast.success('Community deleted successfully');
      navigate('/communities');
    } catch (error) {
      console.error('Error deleting community:', error);
      toast.error('Failed to delete community');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface border border-surface-light rounded-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Community Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Community Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="mt-1 block w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">
              Banner Image URL (optional)
            </label>
            <input
              type="url"
              value={formData.banner_url}
              onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
              className="mt-1 block w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="https://example.com/banner.jpg"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500/10"
            >
              Delete Community
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Save Changes
            </button>
          </div>
        </form>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface border border-surface-light rounded-lg p-6 max-w-md w-full mx-4">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Delete Community?</h3>
                <p className="text-gray-400 mb-6">
                  This action cannot be undone. All community data, including posts, courses, and member data will be permanently deleted.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2 border border-surface-light text-white rounded-md hover:bg-surface-light"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}