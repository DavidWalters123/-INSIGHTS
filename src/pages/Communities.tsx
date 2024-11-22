import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { Users, Search, SlidersHorizontal, TrendingUp, Award, Loader } from 'lucide-react';
import type { Community } from '../types';
import CommunityCard from '../components/CommunityCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { motion, AnimatePresence } from 'framer-motion';

interface CommunityFilters {
  search: string;
  category?: string;
  sortBy: 'popular' | 'newest' | 'active';
}

export default function Communities() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CommunityFilters>({
    search: '',
    sortBy: 'popular'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCommunities();
  }, []);

  async function loadCommunities() {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'communities'),
        orderBy('created_at', 'desc')
      );

      const snapshot = await getDocs(q);
      const communitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Community[];

      setCommunities(communitiesData);
    } catch (error) {
      handleFirestoreError(error, 'Failed to load communities');
    } finally {
      setLoading(false);
    }
  }

  const filteredCommunities = communities.filter(community => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      if (!community.name.toLowerCase().includes(searchTerm) &&
          !community.description.toLowerCase().includes(searchTerm)) {
        return false;
      }
    }

    if (filters.category && community.category !== filters.category) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return b.created_at.seconds - a.created_at.seconds;
      case 'active':
        return (b.metrics?.engagement_rate || 0) - (a.metrics?.engagement_rate || 0);
      default: // popular
        return (b.metrics?.total_members || 0) - (a.metrics?.total_members || 0);
    }
  });

  const categories = Array.from(new Set(communities.map(c => c.category).filter(Boolean)));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold text-white">Communities</h1>
          <p className="text-gray-400 mt-2">Join communities to learn and grow together</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            to="/communities/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
          >
            <Users className="h-4 w-4 mr-1" />
            Create Community
          </Link>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search communities..."
              className="w-full pl-10 pr-4 py-2 bg-surface border border-surface-light rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-lg border transition-all duration-200 ${
              showFilters 
                ? 'border-primary text-primary'
                : 'border-surface-light text-gray-400 hover:text-white hover:border-gray-600'
            }`}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>

          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as CommunityFilters['sortBy'] })}
            className="px-3 py-2 bg-surface border border-surface-light rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="active">Most Active</option>
          </select>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-surface border border-surface-light rounded-lg overflow-hidden"
            >
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters({ ...filters, category: undefined })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    !filters.category
                      ? 'bg-primary text-white'
                      : 'bg-surface-light text-gray-400 hover:text-white'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilters({ ...filters, category })}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      filters.category === category
                        ? 'bg-primary text-white'
                        : 'bg-surface-light text-gray-400 hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-surface border border-surface-light rounded-lg p-4 hover:border-primary/50 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Communities</p>
              <p className="text-2xl font-bold text-white">{communities.length}</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="bg-surface border border-surface-light rounded-lg p-4 hover:border-primary/50 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Most Active</p>
              <p className="text-2xl font-bold text-white">
                {communities[0]?.name || 'N/A'}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-surface border border-surface-light rounded-lg p-4 hover:border-primary/50 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Top Category</p>
              <p className="text-2xl font-bold text-white">
                {categories[0] || 'N/A'}
              </p>
            </div>
            <Award className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </motion.div>

      {/* Communities Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <LoadingSkeleton count={6} type="card" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCommunities.map((community, index) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CommunityCard community={community} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && filteredCommunities.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No communities found matching your criteria</p>
          <Link
            to="/communities/new"
            className="inline-block mt-4 text-primary hover:text-primary/90 transition-colors"
          >
            Create your first community
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}