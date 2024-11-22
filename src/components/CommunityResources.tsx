import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { auth } from '../lib/firebase';
import { FileText, Link as LinkIcon, Plus, Loader, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CommunityResourcesProps {
  communityId: string;
  isAdmin: boolean;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'link' | 'file' | 'document';
  created_at: any;
  created_by: string;
  community_id: string;
}

export default function CommunityResources({ communityId, isAdmin }: CommunityResourcesProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    type: 'link'
  });

  useEffect(() => {
    loadResources();
  }, [communityId]);

  async function loadResources() {
    try {
      const q = query(
        collection(db, 'resources'),
        where('community_id', '==', communityId),
        orderBy('created_at', 'desc')
      );

      const snapshot = await getDocs(q).catch(error => {
        handleFirestoreError(error, 'Failed to load resources');
        return null;
      });

      if (!snapshot) {
        setResources([]);
        return;
      }

      const resourcesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Resource[];

      setResources(resourcesData);
    } catch (error) {
      handleFirestoreError(error, 'Failed to load resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.currentUser) return;

    try {
      await addDoc(collection(db, 'resources'), {
        ...formData,
        community_id: communityId,
        created_by: auth.currentUser.uid,
        created_at: serverTimestamp()
      });

      toast.success('Resource added successfully');
      setFormData({
        title: '',
        description: '',
        url: '',
        type: 'link'
      });
      setShowForm(false);
      loadResources();
    } catch (error) {
      handleFirestoreError(error, 'Failed to add resource');
    }
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'link':
        return <LinkIcon className="h-5 w-5 text-green-500" />;
      default:
        return <Download className="h-5 w-5 text-primary" />;
    }
  };

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
        <h2 className="text-xl font-semibold text-white">Resources</h2>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Resource
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
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Resource['type'] })}
              className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="link">External Link</option>
              <option value="document">Document</option>
              <option value="file">File</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
              required
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
              Add Resource
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {resources.map((resource) => (
          <a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-surface border border-surface-light rounded-lg p-6 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start space-x-3">
              {getResourceIcon(resource.type)}
              <div>
                <h3 className="text-lg font-medium text-white">
                  {resource.title}
                </h3>
                <p className="mt-2 text-gray-300">{resource.description}</p>
                <p className="mt-4 text-sm text-gray-400">
                  Added {resource.created_at?.toDate?.().toLocaleDateString()}
                </p>
              </div>
            </div>
          </a>
        ))}

        {resources.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <FileText className="h-8 w-8 mx-auto mb-2" />
            <p>No resources available</p>
          </div>
        )}
      </div>
    </div>
  );
}