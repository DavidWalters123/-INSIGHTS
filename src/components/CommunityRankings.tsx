import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Star, ArrowUp, ArrowDown } from 'lucide-react';
import { NumericFormat } from 'react-number-format';
import type { Community } from '../types';

interface CommunityRankingsProps {
  communities: Community[];
  sortBy: 'revenue' | 'students' | 'rating';
}

export default function CommunityRankings({ communities, sortBy }: CommunityRankingsProps) {
  const getSortedCommunities = () => {
    return [...communities].sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return (b.metrics?.monthly_revenue || 0) - (a.metrics?.monthly_revenue || 0);
        case 'students':
          return (b.metrics?.total_students || 0) - (a.metrics?.total_students || 0);
        case 'rating':
          return (b.metrics?.avg_course_rating || 0) - (a.metrics?.avg_course_rating || 0);
        default:
          return 0;
      }
    });
  };

  const getChangeIndicator = (change: number) => {
    if (change > 0) {
      return <ArrowUp className="h-4 w-4 text-green-500" />;
    }
    if (change < 0) {
      return <ArrowDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-400 border-b border-surface-light">
            <th className="pb-4 pl-4">#</th>
            <th className="pb-4">Community</th>
            <th className="pb-4">Monthly Revenue</th>
            <th className="pb-4">Students</th>
            <th className="pb-4">Rating</th>
            <th className="pb-4">Growth</th>
            <th className="pb-4">Engagement</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-light">
          {getSortedCommunities().map((community, index) => (
            <motion.tr
              key={community.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-surface-light"
            >
              <td className="py-4 pl-4 text-gray-400">{index + 1}</td>
              <td className="py-4">
                <Link
                  to={`/communities/${community.id}`}
                  className="flex items-center space-x-3"
                >
                  {community.banner_url ? (
                    <img
                      src={community.banner_url}
                      alt={community.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-medium">{community.name}</h3>
                    <p className="text-sm text-gray-400">{community.category}</p>
                  </div>
                </Link>
              </td>
              <td className="py-4">
                <NumericFormat
                  value={community.metrics?.monthly_revenue || 0}
                  displayType="text"
                  thousandSeparator={true}
                  prefix="$"
                  className="text-white font-medium"
                />
              </td>
              <td className="py-4">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-white">
                    {community.metrics?.total_students?.toLocaleString() || 0}
                  </span>
                </div>
              </td>
              <td className="py-4">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-white">
                    {community.metrics?.avg_course_rating?.toFixed(1) || '0.0'}
                  </span>
                </div>
              </td>
              <td className="py-4">
                <div className="flex items-center space-x-1">
                  {getChangeIndicator(community.metrics?.growth_rate || 0)}
                  <span className="text-white">
                    {Math.abs(community.metrics?.growth_rate || 0)}%
                  </span>
                </div>
              </td>
              <td className="py-4">
                <div className="w-full bg-surface rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2"
                    style={{
                      width: `${community.metrics?.engagement_rate || 0}%`
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