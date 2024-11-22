import React from 'react';
import { Link } from 'react-router-dom';
import { User as UserIcon, BookOpen, Users, Star } from 'lucide-react';
import type { User } from '../types';

interface CreatorCardProps {
  creator: User;
}

export default function CreatorCard({ creator }: CreatorCardProps) {
  return (
    <Link
      to={`/creators/${creator.id}`}
      className="block bg-surface border border-surface-light rounded-lg p-6 hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center space-x-4">
        {creator.avatar_url ? (
          <img
            src={creator.avatar_url}
            alt={creator.full_name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="h-6 w-6 text-primary" />
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold text-white">
            {creator.full_name}
          </h3>
          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              {creator.metrics?.total_courses || 0} courses
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {creator.metrics?.total_students?.toLocaleString() || 0} students
            </div>
            {creator.metrics?.avg_course_rating && (
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 text-yellow-500" />
                {creator.metrics.avg_course_rating.toFixed(1)}
              </div>
            )}
          </div>
        </div>
      </div>
      {creator.bio && (
        <p className="mt-4 text-gray-400 line-clamp-2">{creator.bio}</p>
      )}
    </Link>
  );
}