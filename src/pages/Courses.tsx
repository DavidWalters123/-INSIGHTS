import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, BookOpen } from 'lucide-react';
import { useCourses } from '../lib/hooks/useCourses';
import { useProducts } from '../lib/hooks/useProducts';
import { auth } from '../lib/firebase';
import CompactCourseCard from '../components/CompactCourseCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { motion, AnimatePresence } from 'framer-motion';

export default function Courses() {
  const { courses, isLoading: coursesLoading } = useCourses();
  const { products, isLoading: productsLoading } = useProducts(auth.currentUser?.uid);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'course' | 'coaching'>('all');

  // Combine and filter both courses and products
  const allItems = [...(courses || []), ...(products || [])].filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filter === 'all' || item.type === filter;
    
    return matchesSearch && matchesFilter;
  });

  const isLoading = coursesLoading || productsLoading;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold text-white">Courses</h1>
          <p className="text-gray-400 mt-2">Browse and manage your learning content</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex space-x-4"
        >
          <Link
            to="/products/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Product
          </Link>
          <Link
            to="/communities/new/courses/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Course
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2 bg-surface border border-surface-light rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'course' | 'coaching')}
            className="appearance-none pl-10 pr-8 py-2 bg-surface border border-surface-light rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
          >
            <option value="all">All Types</option>
            <option value="course">Courses</option>
            <option value="coaching">Coaching</option>
          </select>
          <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <LoadingSkeleton count={5} type="list" />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {allItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CompactCourseCard course={item} />
              </motion.div>
            ))}
            {allItems.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No courses found matching your criteria</p>
                <Link
                  to="/communities/new/courses/new"
                  className="inline-block mt-4 text-primary hover:text-primary/90 transition-colors"
                >
                  Create your first course
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}