import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import type { Course as CourseType, Discussion, CourseProgress } from '../types';
import CourseHeader from '../components/CourseHeader';
import CourseProgress from '../components/CourseProgress';
import LessonContent from '../components/LessonContent';
import CourseDiscussions from '../components/CourseDiscussions';
import CourseAnalytics from '../components/CourseAnalytics';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function Course() {
  const { communityId, courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseType | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (courseId && auth.currentUser) {
      loadCourseData();
    }
  }, [courseId, auth.currentUser]);

  async function loadCourseData() {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);

      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      if (!courseDoc.exists()) {
        throw new Error('Course not found');
      }

      const courseData = {
        id: courseDoc.id,
        ...courseDoc.data()
      } as CourseType;

      setCourse(courseData);

      // Set initial lesson if none selected
      if (!currentLessonId && courseData.modules?.[0]?.lessons?.[0]) {
        setCurrentLessonId(courseData.modules[0].lessons[0].id);
      }

      // Load discussions
      const discussionsQuery = query(
        collection(db, 'discussions'),
        where('course_id', '==', courseId),
        orderBy('created_at', 'desc')
      );

      const discussionsSnapshot = await getDocs(discussionsQuery);
      const discussionsData = discussionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Discussion[];

      setDiscussions(discussionsData);

      // Check admin status
      const isCreator = courseData.created_by === auth.currentUser?.uid;
      setIsAdmin(isCreator);

      // Load progress if not admin
      if (!isCreator && auth.currentUser) {
        const progressDoc = await getDoc(doc(db, 'course_progress', `${courseId}_${auth.currentUser?.uid}`));
        if (progressDoc.exists()) {
          setProgress(progressDoc.data() as CourseProgress);
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
      setError(error instanceof Error ? error : new Error('Failed to load course'));
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  }

  // Get current lesson with null check
  const currentLesson = course?.modules
    ?.flatMap(m => m.lessons)
    .find(l => l.id === currentLessonId);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <LoadingSkeleton type="banner" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <LoadingSkeleton type="card" count={2} />
          </div>
          <div>
            <LoadingSkeleton type="card" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !course) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[400px]"
      >
        <p className="text-red-500 mb-4">{error?.message || 'Course not found'}</p>
        <button
          onClick={() => loadCourseData()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <CourseHeader 
          course={course} 
          isAdmin={isAdmin}
          onBannerChange={async (url) => {
            try {
              await updateDoc(doc(db, 'courses', courseId), {
                banner_url: url,
                thumbnail_url: url,
                updated_at: serverTimestamp()
              });
              setCourse(prev => prev ? { ...prev, banner_url: url, thumbnail_url: url } : null);
              toast.success('Course banner updated');
            } catch (error) {
              console.error('Error updating banner:', error);
              toast.error('Failed to update banner');
            }
          }}
        />
      </motion.div>

      {isAdmin && course.analytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CourseAnalytics analytics={course.analytics} />
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-8"
        >
          <AnimatePresence mode="wait">
            {currentLesson && (
              <motion.div
                key={currentLesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <LessonContent
                  lesson={currentLesson}
                  isAdmin={isAdmin}
                  onQuizComplete={async (attempt) => {
                    if (!auth.currentUser) return;
                    
                    try {
                      // Update course progress
                      const progressRef = doc(db, 'course_progress', `${courseId}_${auth.currentUser.uid}`);
                      const progressDoc = await getDoc(progressRef);

                      if (progressDoc.exists()) {
                        const currentProgress = progressDoc.data() as CourseProgress;
                        if (!currentProgress.completed_lessons.includes(attempt.quiz_id)) {
                          currentProgress.completed_lessons.push(attempt.quiz_id);
                          await updateDoc(progressRef, currentProgress);
                          setProgress(currentProgress);
                        }
                      }

                      toast.success('Quiz completed successfully!');
                    } catch (error) {
                      console.error('Error saving quiz progress:', error);
                      toast.error('Failed to save quiz progress');
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CourseDiscussions
              discussions={discussions}
              onCreateDiscussion={async (title, content) => {
                if (!auth.currentUser) return;

                try {
                  const discussionRef = await addDoc(collection(db, 'discussions'), {
                    title,
                    content,
                    course_id: courseId,
                    user_id: auth.currentUser.uid,
                    created_at: serverTimestamp(),
                    user: {
                      id: auth.currentUser.uid,
                      email: auth.currentUser.email,
                      full_name: auth.currentUser.displayName || 'Anonymous'
                    }
                  });

                  toast.success('Discussion created successfully');
                  loadCourseData();
                  return discussionRef;
                } catch (error) {
                  console.error('Error creating discussion:', error);
                  toast.error('Failed to create discussion');
                  throw error;
                }
              }}
            />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <CourseProgress
            course={course}
            progress={progress}
            onLessonSelect={setCurrentLessonId}
            currentLessonId={currentLessonId}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}