import React from 'react';
import { Link } from 'react-router-dom';
import { Users, TrendingUp, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Community } from '../types';

interface CommunityCardProps {
  community: Community;
}

export default function CommunityCard({ community }: CommunityCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={`/communities/${community.id}`}
        className="block h-full bg-surface border border-surface-light rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-200"
      >
        <div className="relative h-48">
          {community.banner_url ? (
            <motion.img
              src={community.banner_url}
              alt={community.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
          ) : (
            <div className="w-full h-full gradient-banner flex items-center justify-center">
              <motion.div
                whileHover={{ rotate: 15 }}
                transition={{ duration: 0.2 }}
              >
                <Users className="h-12 w-12 text-white/50" />
              </motion.div>
            </div>
          )}
          {community.category && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-primary/90 text-white text-sm font-medium rounded-full">
              {community.category}
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-xl font-semibold text-white mb-2">
            {community.name}
          </h3>
          <p className="text-gray-400 line-clamp-2 mb-4">
            {community.description}
          </p>

          <div className="grid grid-cols-3 gap-4">
            <motion.div 
              className="bg-surface-light rounded-lg p-3 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <Users className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-sm text-gray-400">Members</p>
              <p className="text-lg font-semibold text-white">
                {community.metrics?.total_members?.toLocaleString() || 0}
              </p>
            </motion.div>

            <motion.div 
              className="bg-surface-light rounded-lg p-3 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <TrendingUp className="h-5 w-5 text-green-500 mx-auto mb-1" />
              <p className="text-sm text-gray-400">Growth</p>
              <p className="text-lg font-semibold text-white">
                {community.metrics?.growth_rate || 0}%
              </p>
            </motion.div>

            <motion.div 
              className="bg-surface-light rounded-lg p-3 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <Star className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
              <p className="text-sm text-gray-400">Rating</p>
              <p className="text-lg font-semibold text-white">
                {community.metrics?.avg_course_rating?.toFixed(1) || '0.0'}
              </p>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}