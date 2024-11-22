import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BookOpen, Plus, GripVertical, X, Save, Video, Type } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import RichTextEditor from '../components/RichTextEditor';
import BannerUpload from '../components/BannerUpload';
import type { CourseModule, Lesson } from '../types';

export default function NewCourse() {
  const navigate = useNavigate();
  const { communityId } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [saving, setSaving] = useState(false);

  const addModule = () => {
    setModules([
      ...modules,
      {
        id: `temp-${Date.now()}`,
        title: '',
        course_id: '',
        order: modules.length,
        lessons: []
      }
    ]);
  };

  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const updateModule = (index: number, updates: Partial<CourseModule>) => {
    setModules(
      modules.map((module, i) =>
        i === index ? { ...module, ...updates } : module
      )
    );
  };

  const addLesson = (moduleIndex: number, type: 'text' | 'video' = 'text') => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons = [
      ...updatedModules[moduleIndex].lessons,
      {
        id: `temp-${Date.now()}`,
        title: '',
        content: '',
        module_id: '',
        type,
        video_url: '',
        order: updatedModules[moduleIndex].lessons.length
      }
    ];
    setModules(updatedModules);
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons = updatedModules[moduleIndex].lessons.filter(
      (_, i) => i !== lessonIndex
    );
    setModules(updatedModules);
  };

  const updateLesson = (
    moduleIndex: number,
    lessonIndex: number,
    updates: Partial<Lesson>
  ) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons = updatedModules[moduleIndex].lessons.map(
      (lesson, i) => (i === lessonIndex ? { ...lesson, ...updates } : lesson)
    );
    setModules(updatedModules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !communityId || saving) return;

    try {
      setSaving(true);
      const courseData = {
        title,
        description,
        banner_url: bannerUrl,
        thumbnail_url: bannerUrl, // Use the same image for both
        community_id: communityId,
        created_by: auth.currentUser.uid,
        created_at: serverTimestamp(),
        modules: modules.map((module) => ({
          ...module,
          lessons: module.lessons
        })),
        published: false,
        metrics: {
          total_students: 0,
          total_revenue: 0,
          avg_course_rating: 0,
          total_courses: 0,
          completion_rate: 0,
          engagement_score: 0
        }
      };

      const courseRef = await addDoc(collection(db, 'courses'), courseData);
      toast.success('Course created successfully');
      navigate(`/communities/${communityId}/courses/${courseRef.id}`);
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-surface-light rounded-lg"
      >
        <div className="h-48">
          <BannerUpload
            currentBannerUrl={bannerUrl}
            onBannerChange={setBannerUrl}
          />
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-white">Create New Course</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <label className="block text-sm font-medium text-gray-300">
                Course Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary transition-all duration-200"
                required
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label className="block text-sm font-medium text-gray-300">
                Description
              </label>
              <RichTextEditor
                content={description}
                onChange={setDescription}
                placeholder="Describe your course..."
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white">Course Modules</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={addModule}
                  className="inline-flex items-center px-3 py-1.5 border border-primary text-sm font-medium rounded-md text-primary hover:bg-primary/10 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Module
                </motion.button>
              </div>

              <AnimatePresence mode="popLayout">
                {modules.map((module, moduleIndex) => (
                  <motion.div
                    key={module.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-surface-light rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-start space-x-3">
                      <GripVertical className="h-5 w-5 text-gray-500 mt-2 cursor-move" />
                      <div className="flex-1">
                        <input
                          type="text"
                          value={module.title}
                          onChange={(e) =>
                            updateModule(moduleIndex, { title: e.target.value })
                          }
                          placeholder="Module Title"
                          className="block w-full px-3 py-2 bg-surface border border-surface rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary transition-all duration-200"
                          required
                        />
                        <AnimatePresence mode="popLayout">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <motion.div
                              key={lesson.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex items-start space-x-3 mt-4 pl-6"
                            >
                              <GripVertical className="h-5 w-5 text-gray-500 mt-2 cursor-move" />
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={lesson.title}
                                  onChange={(e) =>
                                    updateLesson(moduleIndex, lessonIndex, {
                                      title: e.target.value
                                    })
                                  }
                                  placeholder="Lesson Title"
                                  className="block w-full px-3 py-2 bg-surface border border-surface rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary transition-all duration-200"
                                  required
                                />
                                {lesson.type === 'video' ? (
                                  <div className="mt-2">
                                    <input
                                      type="url"
                                      value={lesson.video_url || ''}
                                      onChange={(e) =>
                                        updateLesson(moduleIndex, lessonIndex, {
                                          video_url: e.target.value
                                        })
                                      }
                                      placeholder="YouTube Video URL"
                                      className="block w-full px-3 py-2 bg-surface border border-surface rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary transition-all duration-200"
                                      required
                                    />
                                  </div>
                                ) : (
                                  <div className="mt-2">
                                    <RichTextEditor
                                      content={lesson.content}
                                      onChange={(content) =>
                                        updateLesson(moduleIndex, lessonIndex, {
                                          content
                                        })
                                      }
                                      placeholder="Lesson content..."
                                    />
                                  </div>
                                )}
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={() => removeLesson(moduleIndex, lessonIndex)}
                                className="text-gray-400 hover:text-red-400 transition-colors"
                              >
                                <X className="h-5 w-5" />
                              </motion.button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        <div className="mt-3 flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => addLesson(moduleIndex, 'text')}
                            className="inline-flex items-center px-3 py-1.5 border border-surface text-sm font-medium rounded-md text-gray-300 hover:text-white hover:bg-surface transition-all duration-200"
                          >
                            <Type className="h-4 w-4 mr-1" />
                            Add Text Lesson
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => addLesson(moduleIndex, 'video')}
                            className="inline-flex items-center px-3 py-1.5 border border-surface text-sm font-medium rounded-md text-gray-300 hover:text-white hover:bg-surface transition-all duration-200"
                          >
                            <Video className="h-4 w-4 mr-1" />
                            Add Video Lesson
                          </motion.button>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => removeModule(moduleIndex)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-end space-x-4"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 border border-surface-light text-white rounded-md hover:bg-surface-light transition-all duration-200"
                disabled={saving}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-all duration-200 disabled:opacity-50"
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Creating...' : 'Create Course'}
              </motion.button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}