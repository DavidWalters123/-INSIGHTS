import React, { useState } from 'react';
import { BarChart } from 'lucide-react';
import CreatorAnalytics from '../components/CreatorAnalytics';
import { useAnalytics } from '../lib/hooks/useAnalytics';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const { data, isLoading, error } = useAnalytics(timeRange);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-surface-light rounded w-1/4"></div>
        <div className="grid grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-surface-light rounded-lg"></div>
          ))}
        </div>
        <div className="h-96 bg-surface-light rounded-lg"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load analytics data</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <BarChart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
      </div>

      <CreatorAnalytics
        data={data}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />
    </div>
  );
}