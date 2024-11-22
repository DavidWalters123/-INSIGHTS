import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, TrendingUp, Users, Star } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import type { Community, User } from '../types';
import CommunityRankings from '../components/CommunityRankings';
import CreatorRankings from '../components/CreatorRankings';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function Home() {
  const [activeTab, setActiveTab] = useState('creators');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [creators, setCreators] = useState<User[]>([]);
  const [sortBy, setSortBy] = useState<'revenue' | 'students' | 'rating'>('revenue');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadCommunities() {
    const q = query(
      collection(db, 'communities'),
      orderBy('created_at', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      metrics: {
        monthly_revenue: Math.floor(Math.random() * 100000),
        total_revenue: Math.floor(Math.random() * 1000000),
        active_users: Math.floor(Math.random() * 1000),
        engagement_rate: Math.floor(Math.random() * 100),
        course_completion_rate: Math.floor(Math.random() * 100),
        avg_course_rating: Number((Math.random() * 2 + 3).toFixed(1)),
        student_satisfaction: Math.floor(Math.random() * 100),
        total_courses: Math.floor(Math.random() * 50),
        total_students: Math.floor(Math.random() * 10000),
        growth_rate: Math.floor(Math.random() * 200 - 100),
        updated_at: new Date()
      }
    })) as Community[];
  }

  async function loadCreators() {
    const q = query(
      collection(db, 'users'),
      orderBy('created_at', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      metrics: {
        total_students: Math.floor(Math.random() * 5000),
        total_revenue: Math.floor(Math.random() * 500000),
        avg_course_rating: Number((Math.random() * 2 + 3).toFixed(1)),
        total_courses: Math.floor(Math.random() * 20),
        completion_rate: Math.floor(Math.random() * 100),
        engagement_score: Math.floor(Math.random() * 100),
        active_students: Math.floor(Math.random() * 1000),
        monthly_revenue: Math.floor(Math.random() * 50000),
        updated_at: new Date()
      }
    })) as User[];
  }

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const [communitiesData, creatorsData] = await Promise.all([
        loadCommunities(),
        loadCreators()
      ]);
      
      setCommunities(communitiesData);
      setCreators(creatorsData);
    } catch (error) {
      console.error('Error loading rankings:', error);
      setError(error as Error);
      handleFirestoreError(error, 'Failed to load rankings');
    } finally {
      setLoading(false);
    }
  }

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
          <h1 className="text-3xl font-bold text-white">Rankings</h1>
          <p className="text-gray-400 mt-2">
            Top performing creators and communities based on revenue and engagement
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            to="/communities/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Community
          </Link>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="border-b border-surface-light">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('creators')}
            className={`pb-4 relative ${
              activeTab === 'creators'
                ? 'text-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Creators
            {activeTab === 'creators' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('communities')}
            className={`pb-4 relative ${
              activeTab === 'communities'
                ? 'text-primary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Communities
            {activeTab === 'communities' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Rankings */}
      <div className="bg-surface border border-surface-light rounded-lg p-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingSkeleton type="list" count={5} />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12"
            >
              <p className="text-red-400 mb-4">{error.message}</p>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                Try Again
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {activeTab === 'creators' ? (
                <CreatorRankings creators={creators} />
              ) : (
                <CommunityRankings 
                  communities={communities} 
                  sortBy={sortBy}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface border border-surface-light rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Total Revenue</h3>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-white mt-2">
            ${communities.reduce((sum, c) => sum + (c.metrics?.monthly_revenue || 0), 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-400 mt-1">Across all communities</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface border border-surface-light rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Active Students</h3>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-white mt-2">
            {communities.reduce((sum, c) => sum + (c.metrics?.active_users || 0), 0).toLocaleString()}
          </p>
          <p className="text-sm text-gray-400 mt-1">Learning this month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-surface border border-surface-light rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Course Completion</h3>
            <Star className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-white mt-2">
            {Math.round(communities.reduce((sum, c) => sum + (c.metrics?.course_completion_rate || 0), 0) / Math.max(communities.length, 1))}%
          </p>
          <p className="text-sm text-gray-400 mt-1">Average completion rate</p>
        </motion.div>
      </div>
    </motion.div>
  );
}