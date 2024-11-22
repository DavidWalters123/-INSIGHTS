import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import BannerUpload from '../components/BannerUpload';

export default function NewCommunity() {
  const navigate = useNavigate();
  const [bannerUrl, setBannerUrl] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!auth.currentUser) {
      toast.error('You must be logged in to create a community');
      return;
    }

    try {
      // First create the community
      const communityRef = await addDoc(collection(db, 'communities'), {
        name: formData.name,
        description: formData.description,
        banner_url: bannerUrl,
        created_by: auth.currentUser.uid,
        created_at: serverTimestamp()
      });

      // Then add the creator as an admin member
      await addDoc(collection(db, 'community_members'), {
        community_id: communityRef.id,
        user_id: auth.currentUser.uid,
        role: 'admin',
        joined_at: serverTimestamp()
      });

      toast.success('Community created successfully');
      navigate(`/communities/${communityRef.id}`);
    } catch (error) {
      toast.error('Failed to create community');
      console.error('Error creating community:', error);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface border border-surface-light rounded-lg">
        <div className="h-48">
          <BannerUpload
            currentBannerUrl={bannerUrl}
            onBannerChange={setBannerUrl}
          />
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-white">
              Create a New Community
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-300"
              >
                Community Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-300"
              >
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="mt-1 block w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Create Community
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}