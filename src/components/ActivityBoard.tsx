import React, { useState, useEffect } from 'react';
import { format, subYears, eachDayOfInterval, isSameDay } from 'date-fns';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';
import { Activity, AlertTriangle, Users, MessageSquare, BookOpen } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityBoardProps {
  userId: string;
}

interface ActivityData {
  date: Date;
  count: number;
  type: 'post' | 'comment' | 'contribution';
  details?: {
    posts?: number;
    comments?: number;
    likes?: number;
  };
}

export default function ActivityBoard({ userId }: ActivityBoardProps) {
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalComments: 0,
    totalEnrollments: 0,
    activeDays: 0
  });

  useEffect(() => {
    if (userId) {
      loadActivityData();
    }
  }, [userId]);

  async function loadActivityData() {
    try {
      setLoading(true);
      setError(null);
      const endDate = new Date();
      const startDate = subYears(endDate, 1);

      const [commentsSnapshot, enrollmentsSnapshot] = await Promise.all([
        getDocs(query(
          collection(db, 'comments'),
          where('user_id', '==', userId),
          where('created_at', '>=', startDate),
          orderBy('created_at', 'asc')
        )),
        getDocs(query(
          collection(db, 'enrollments'),
          where('user_id', '==', userId),
          where('created_at', '>=', startDate),
          orderBy('created_at', 'asc')
        ))
      ]);

      const activities: ActivityData[] = [];
      let totalComments = 0;
      let totalEnrollments = 0;

      commentsSnapshot.docs.forEach(doc => {
        const date = doc.data().created_at?.toDate();
        if (!date) return;

        const existingActivity = activities.find(a => isSameDay(a.date, date));
        if (existingActivity) {
          existingActivity.count++;
          existingActivity.details = {
            ...existingActivity.details,
            comments: (existingActivity.details?.comments || 0) + 1
          };
        } else {
          activities.push({
            date,
            count: 1,
            type: 'comment',
            details: { comments: 1 }
          });
        }
        totalComments++;
      });

      enrollmentsSnapshot.docs.forEach(doc => {
        const date = doc.data().created_at?.toDate();
        if (!date) return;

        const existingActivity = activities.find(a => isSameDay(a.date, date));
        if (existingActivity) {
          existingActivity.count++;
          existingActivity.details = {
            ...existingActivity.details,
            enrollments: (existingActivity.details?.enrollments || 0) + 1
          };
        } else {
          activities.push({
            date,
            count: 1,
            type: 'contribution',
            details: { enrollments: 1 }
          });
        }
        totalEnrollments++;
      });

      setStats({
        totalComments,
        totalEnrollments,
        activeDays: activities.length
      });
      setActivityData(activities.sort((a, b) => a.date.getTime() - b.date.getTime()));
    } catch (error) {
      console.error('Error loading activity data:', error);
      setError('Failed to load activity data');
      handleFirestoreError(error);
    } finally {
      setLoading(false);
    }
  }

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-surface-light/70 hover:bg-surface-light/80';
    if (count <= 3) return 'bg-primary/25 hover:bg-primary/35';
    if (count <= 6) return 'bg-primary/50 hover:bg-primary/60';
    if (count <= 9) return 'bg-primary/75 hover:bg-primary/85';
    return 'bg-primary hover:bg-primary/90';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Activity className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => loadActivityData()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Activity Board</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-light rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Comments</p>
              <p className="text-2xl font-bold text-white">{stats.totalComments}</p>
            </div>
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div className="bg-surface-light rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Enrollments</p>
              <p className="text-2xl font-bold text-white">{stats.totalEnrollments}</p>
            </div>
            <BookOpen className="h-6 w-6 text-green-500" />
          </div>
        </div>

        <div className="bg-surface-light rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Active Days</p>
              <p className="text-2xl font-bold text-white">{stats.activeDays}</p>
            </div>
            <Users className="h-6 w-6 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="activity-grid-container">
        <div className="activity-grid">
          {eachDayOfInterval({
            start: subYears(new Date(), 1),
            end: new Date()
          }).map(day => {
            const activity = activityData.find(a => isSameDay(a.date, day));
            const count = activity?.count || 0;

            return (
              <Tooltip
                key={day.toISOString()}
                content={
                  <div className="text-white">
                    <div>{format(day, 'MMM d, yyyy')}</div>
                    <div>{count} {count === 1 ? 'activity' : 'activities'}</div>
                    {activity?.details && (
                      <div className="text-sm text-gray-400">
                        {activity.details.comments && (
                          <div>Comments: {activity.details.comments}</div>
                        )}
                        {activity.details.enrollments && (
                          <div>Enrollments: {activity.details.enrollments}</div>
                        )}
                      </div>
                    )}
                  </div>
                }
                offset={{ x: 0, y: -4 }}
              >
                <div
                  className={`w-3 h-3 rounded-sm ${getIntensityClass(count)} transition-colors duration-200`}
                />
              </Tooltip>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2 text-sm">
        <span className="text-gray-400">Less</span>
        <div className="flex space-x-1">
          <div className="w-3 h-3 rounded-sm bg-surface-light/70" />
          <div className="w-3 h-3 rounded-sm bg-primary/25" />
          <div className="w-3 h-3 rounded-sm bg-primary/50" />
          <div className="w-3 h-3 rounded-sm bg-primary/75" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
        </div>
        <span className="text-gray-400">More</span>
      </div>
    </div>
  );
}