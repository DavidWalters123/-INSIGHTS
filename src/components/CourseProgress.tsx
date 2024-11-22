import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import type { Course, CourseProgress } from '../types';

interface CourseProgressProps {
  course: Course;
  progress?: CourseProgress;
}

export default function CourseProgress({ course, progress }: CourseProgressProps) {
  const totalLessons = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0
  );
  
  const completedLessons = progress?.completed_lessons?.length || 0;
  const progressPercentage = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;

  return (
    <div className="bg-surface-light rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-medium">Course Progress</h3>
        <span className="text-primary font-medium">{progressPercentage}%</span>
      </div>
      
      <div className="w-full bg-surface rounded-full h-2 mb-4">
        <div
          className="bg-primary rounded-full h-2 transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="text-sm text-gray-400">
        {completedLessons} of {totalLessons} lessons completed
      </div>

      <div className="mt-4 space-y-2">
        {course.modules.map((module) => (
          <div key={module.id}>
            <h4 className="text-white font-medium mb-2">{module.title}</h4>
            <div className="space-y-1 pl-4">
              {module.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="flex items-center text-sm"
                >
                  {progress?.completed_lessons?.includes(lesson.id) ? (
                    <CheckCircle className="h-4 w-4 text-primary mr-2" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-500 mr-2" />
                  )}
                  <span className={progress?.completed_lessons?.includes(lesson.id) 
                    ? 'text-white' 
                    : 'text-gray-400'
                  }>
                    {lesson.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}