import React, { useState } from 'react';
import { Clock, BarChart, Tag, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Course } from '../types';
import BannerUpload from './BannerUpload';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'react-hot-toast';

interface CourseHeaderProps {
  course: Course;
  isAdmin?: boolean;
  onBannerChange?: (url: string) => void;
}

export default function CourseHeader({ course, isAdmin, onBannerChange }: CourseHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleBannerChange = async (url: string) => {
    if (!course.id || saving) return;

    try {
      setSaving(true);
      await updateDoc(doc(db, 'courses', course.id), {
        banner_url: url,
        thumbnail_url: url, // Always sync banner and thumbnail
        updated_at: serverTimestamp()
      });

      // Call the parent's onBannerChange if provided
      onBannerChange?.(url);
      toast.success('Course banner updated');
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error('Failed to update banner');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-surface-light rounded-lg overflow-hidden"
    >
      <div className="relative">
        {isAdmin ? (
          <BannerUpload
            currentBannerUrl={course.banner_url}
            onBannerChange={handleBannerChange}
            height="h-64"
          />
        ) : (
          <div 
            className="h-64 bg-cover bg-center relative"
            style={{ 
              backgroundImage: course.banner_url ? `url(${course.banner_url})` : undefined,
              backgroundColor: !course.banner_url ? '#1A1B23' : undefined
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent" />
          </div>
        )}

        {isAdmin && !isEditing && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white hover:bg-black/75 transition-colors"
          >
            <Edit2 className="h-5 w-5" />
          </motion.button>
        )}
      </div>

      <div className="relative p-6">
        <h1 className="text-3xl font-bold text-white">{course.title}</h1>
        
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-400">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {course.duration || 0} mins
          </div>
          <div className="flex items-center">
            <BarChart className="h-4 w-4 mr-1" />
            {course.level || 'All Levels'}
          </div>
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-1" />
            {course.category || 'Uncategorized'}
          </div>
        </div>

        {course.tags && course.tags.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div 
          className="mt-6 text-gray-300 prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: course.description }}
        />
      </div>
    </motion.div>
  );
}