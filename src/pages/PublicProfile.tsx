import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User as UserIcon, Users, BookOpen, Star } from 'lucide-react';
import type { User, Community, Course } from '../types';
import CourseCard from '../components/CourseCard';
import { toast } from 'react-hot-toast';

export default function PublicProfile() {
  const { username } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      loadUserData();
    }
  }, [username]);

  async function loadUserData() {
    try {
      setLoading(true);
      setError(null);

      // Find user by username
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setError('User not found');
        setLoading(false);
        return;
      }

      const userData = {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      } as User;
      
      setUser(userData);

      // Load user's communities and courses
      await Promise.all([
        loadCommunities(userData.id),
        loadCourses(userData.id)
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load profile');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  async function loadCommunities(userId: string) {
    try {
      const q = query(
        collection(db, 'communities'),
        where('created_by', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const communitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Community[];
      
      setCommunities(communitiesData);
    } catch (error) {
      console.error('Error loading communities:', error);
    }
  }

  async function loadCourses(userId: string) {
    try {
      const q = query(
        collection(db, 'courses'),
        where('created_by', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      const coursesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      
      setCourses(coursesData);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{error}</h1>
          <p className="text-gray-400">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-surface border border-surface-light rounded-lg overflow-hidden">
          <div className="h-48 gradient-banner" />
          <div className="px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
              <div className="-mt-20 mb-6 md:mb-0">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="h-32 w-32 rounded-full border-4 border-surface bg-surface object-cover"
                  />
                ) : (
                  <div className="h-32 w-32 rounded-full border-4 border-surface bg-surface flex items-center justify-center">
                    <UserIcon className="h-12 w-12 text-primary" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white">
                  {user.full_name}
                </h1>
                {user.bio && (
                  <p className="mt-2 text-gray-300">{user.bio}</p>
                )}

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-surface-light rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Communities</p>
                        <p className="text-2xl font-bold text-white">
                          {communities.length}
                        </p>
                      </div>
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  </div>

                  <div className="bg-surface-light rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Courses</p>
                        <p className="text-2xl font-bold text-white">
                          {courses.length}
                        </p>
                      </div>
                      <BookOpen className="h-6 w-6 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-surface-light rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Rating</p>
                        <p className="text-2xl font-bold text-white">
                          {user.metrics?.avg_course_rating?.toFixed(1) || '0.0'}
                        </p>
                      </div>
                      <Star className="h-6 w-6 text-yellow-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {courses.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}