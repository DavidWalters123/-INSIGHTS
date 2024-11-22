import React, { useState } from 'react';
import { Paperclip, Link as LinkIcon, Plus } from 'lucide-react';
import type { Resource } from '../types';

interface ResourceUploaderProps {
  lessonId: string;
  onResourceAdd: (resource: Partial<Resource>) => Promise<void>;
}

export default function ResourceUploader({ lessonId, onResourceAdd }: ResourceUploaderProps) {
  const [showForm, setShowForm] = useState(false);
  const [resourceData, setResourceData] = useState({
    title: '',
    type: 'link',
    url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onResourceAdd({
        ...resourceData,
        lesson_id: lessonId
      });
      
      setResourceData({
        title: '',
        type: 'link',
        url: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error('Error adding resource:', error);
    }
  };

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Resource Type
            </label>
            <select
              value={resourceData.type}
              onChange={(e) => setResourceData({ ...resourceData, type: e.target.value as Resource['type'] })}
              className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
            >
              <option value="link">External Link</option>
              <option value="pdf">PDF Document</option>
              <option value="file">Other File</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={resourceData.title}
              onChange={(e) => setResourceData({ ...resourceData, title: e.target.value })}
              className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              URL
            </label>
            <input
              type="url"
              value={resourceData.url}
              onChange={(e) => setResourceData({ ...resourceData, url: e.target.value })}
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
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
            >
              <Paperclip className="h-4 w-4 mr-2" />
              Add Resource
            </button>
          </div>
        </form>
      )}
    </div>
  );
}