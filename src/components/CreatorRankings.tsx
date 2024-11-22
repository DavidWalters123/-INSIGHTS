import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User as UserIcon, BookOpen, DollarSign, Users, Star } from 'lucide-react';
import { NumericFormat } from 'react-number-format';
import type { User } from '../types';

interface CreatorRankingsProps {
  creators: User[];
}

export default function CreatorRankings({ creators }: CreatorRankingsProps) {
  const sortedCreators = [...creators].sort(
    (a, b) => (b.metrics?.total_revenue || 0) - (a.metrics?.total_revenue || 0)
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-400 border-b border-surface-light">
            <th className="pb-4 pl-4">#</th>
            <th className="pb-4">Creator</th>
            <th className="pb-4">Total Revenue</th>
            <th className="pb-4">Students</th>
            <th className="pb-4">Courses</th>
            <th className="pb-4">Rating</th>
            <th className="pb-4">Engagement</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-light">
          {sortedCreators.map((creator, index) => (
            <motion.tr
              key={creator.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-surface-light"
            >
              <td className="py-4 pl-4 text-gray-400">{index + 1}</td>
              <td className="py-4">
                <Link
                  to={`/creators/${creator.id}`}
                  className="flex items-center space-x-3"
                >
                  {creator.avatar_url ? (
                    <img
                      src={creator.avatar_url}
                      alt={creator.full_name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-medium">{creator.full_name}</h3>
                    <p className="text-sm text-gray-400">
                      {creator.metrics?.total_courses || 0} courses
                    </p>
                  </div>
                </Link>
              </td>
              <td className="py-4">
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <NumericFormat
                    value={creator.metrics?.total_revenue || 0}
                    displayType="text"
                    thousandSeparator={true}
                    className="text-white"
                  />
                </div>
              </td>
              <td className="py-4">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-white">
                    {creator.metrics?.total_students?.toLocaleString() || 0}
                  </span>
                </div>
              </td>
              <td className="py-4">
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span className="text-white">
                    {creator.metrics?.total_courses || 0}
                  </span>
                </div>
              </td>
              <td className="py-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-white">
                    {(creator.metrics?.avg_course_rating || 0).toFixed(1)}
                  </span>
                </div>
              </td>
              <td className="py-4">
                <div className="w-full bg-surface rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2"
                    style={{
                      width: `${creator.metrics?.engagement_score || 0}%`
                    }}
                  />
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}