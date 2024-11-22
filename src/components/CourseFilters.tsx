import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { CourseFilters as FilterTypes } from '../types';

interface CourseFiltersProps {
  filters: FilterTypes;
  onFilterChange: (filters: FilterTypes) => void;
}

const CATEGORIES = ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'AI/ML'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const DURATIONS = [
  { value: 'short', label: '< 2 hours' },
  { value: 'medium', label: '2-5 hours' },
  { value: 'long', label: '> 5 hours' }
];

export default function CourseFilters({ filters, onFilterChange }: CourseFiltersProps) {
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const handleChange = (key: keyof FilterTypes, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      category: undefined,
      level: undefined,
      duration: undefined,
      priceRange: undefined,
      sortBy: 'popular'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2 bg-surface border border-surface-light rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`p-2 rounded-lg border ${
            showAdvanced 
              ? 'border-primary text-primary' 
              : 'border-surface-light text-gray-400 hover:text-white hover:border-gray-600'
          }`}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>

        <select
          value={filters.sortBy}
          onChange={(e) => handleChange('sortBy', e.target.value)}
          className="px-3 py-2 bg-surface border border-surface-light rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-primary"
        >
          <option value="popular">Most Popular</option>
          <option value="newest">Newest</option>
          <option value="rating">Highest Rated</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
        </select>
      </div>

      {showAdvanced && (
        <div className="p-4 bg-surface border border-surface-light rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-white">Advanced Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleChange('category', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-surface border border-surface-light rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Level</label>
              <select
                value={filters.level || ''}
                onChange={(e) => handleChange('level', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-surface border border-surface-light rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">All Levels</option>
                {LEVELS.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Duration</label>
              <select
                value={filters.duration || ''}
                onChange={(e) => handleChange('duration', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-surface border border-surface-light rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Any Duration</option>
                {DURATIONS.map((duration) => (
                  <option key={duration.value} value={duration.value}>
                    {duration.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Price Range</label>
              <select
                value={filters.priceRange || ''}
                onChange={(e) => handleChange('priceRange', e.target.value || undefined)}
                className="w-full px-3 py-2 bg-surface border border-surface-light rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="">Any Price</option>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
                <option value="under50">Under $50</option>
                <option value="under100">Under $100</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}