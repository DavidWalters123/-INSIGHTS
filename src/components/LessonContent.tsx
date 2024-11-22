import React from 'react';
import VideoLesson from './VideoLesson';
import QuizLesson from './QuizLesson';
import ResourceList from './ResourceList';
import ResourceUploader from './ResourceUploader';
import type { Lesson, QuizAttempt } from '../types';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'react-hot-toast';

interface LessonContentProps {
  lesson: Lesson;
  isAdmin?: boolean;
  onQuizComplete?: (attempt: QuizAttempt) => void;
}

export default function LessonContent({ lesson, isAdmin, onQuizComplete }: LessonContentProps) {
  const handleAddResource = async (resourceData: any) => {
    try {
      await addDoc(collection(db, 'resources'), {
        ...resourceData,
        created_at: serverTimestamp()
      });
      toast.success('Resource added successfully');
    } catch (error) {
      console.error('Error adding resource:', error);
      toast.error('Failed to add resource');
    }
  };

  return (
    <div className="space-y-8">
      {lesson.type === 'video' && lesson.video_url && (
        <VideoLesson videoUrl={lesson.video_url} title={lesson.title} />
      )}

      {lesson.type === 'quiz' ? (
        <QuizLesson
          quiz={lesson.quiz!}
          onComplete={onQuizComplete!}
        />
      ) : (
        <div 
          className="prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />
      )}

      <div className="mt-8">
        <h3 className="text-lg font-medium text-white mb-4">Resources</h3>
        <ResourceList resources={lesson.resources || []} />
        {isAdmin && (
          <div className="mt-4">
            <ResourceUploader
              lessonId={lesson.id}
              onResourceAdd={handleAddResource}
            />
          </div>
        )}
      </div>
    </div>
  );
}