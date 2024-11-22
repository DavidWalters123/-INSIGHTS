import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { User as UserIcon, Mail, Phone, MapPin, Plus, Users, Edit2 } from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import BannerUpload from '../components/BannerUpload';
import AvatarUpload from '../components/AvatarUpload';
import ActivityBoard from '../components/ActivityBoard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import CourseCard from '../components/CourseCard';
import type { User, Community, Course } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    banner_url: '',
    social_links: {}
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthChecked(true);
      if (!user) {
        navigate('/login');
      } else {
        loadProfile(user.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  async function loadProfile(userId: string) {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        // Create default profile
        const userData = {
          id: userId,
          email: auth.currentUser?.email,
          full_name: auth.currentUser?.displayName || 'Anonymous User',
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          bio: '',
          phone: '',
          location: '',
          website: '',
          banner_url: '',
          social_links: {},
          metrics: {
            total_students: 0,
            total_revenue: 0,
            avg_course_rating: 0,
            total_courses: 0,
            completion_rate: 0,
            engagement_score: 0
          }
        };
        
        await setDoc(docRef, userData);
        setProfile(userData as User);
        setFormData({
          full_name: userData.full_name,
          bio: userData.bio || '',
          email: userData.email || '',
          phone: userData.phone || '',
          location: userData.location || '',
          website: userData.website || '',
          banner_url: userData.banner_url || '',
          social_links: userData.social_links || {}
        });
      } else {
        const userData = { id: docSnap.id, ...docSnap.data() } as User;
        setProfile(userData);
        setFormData({
          full_name: userData.full_name,
          bio: userData.bio || '',
          email: userData.email || '',
          phone: userData.phone || '',
          location: userData.location || '',
          website: userData.website || '',
          banner_url: userData.banner_url || '',
          social_links: userData.social_links || {}
        });
      }

      // Load communities and courses
      await Promise.all([
        loadCommunities(userId),
        loadCourses(userId)
      ]);
    } catch (error) {
      console.error('Error loading profile:', error);
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
      toast.error('Failed to load communities');
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
      toast.error('Failed to load courses');
    }
  }

  async function handleAvatarChange(url: string) {
    if (!auth.currentUser) return;

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        avatar_url: url,
        updated_at: serverTimestamp()
      });

      setProfile(prev => prev ? { ...prev, avatar_url: url } : null);
      toast.success('Profile photo updated');
    } catch (error) {
      console.error('Error updating profile photo:', error);
      toast.error('Failed to update profile photo');
    }
  }

  async function handleBannerChange(url: string) {
    if (!auth.currentUser) return;

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        banner_url: url,
        updated_at: serverTimestamp()
      });

      setProfile(prev => prev ? { ...prev, banner_url: url } : null);
      setFormData(prev => ({ ...prev, banner_url: url }));
      toast.success('Banner updated');
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error('Failed to update banner');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!auth.currentUser || saving) return;

    setSaving(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        ...formData,
        updated_at: serverTimestamp()
      });

      toast.success('Profile updated successfully');
      setIsEditing(false);
      loadProfile(auth.currentUser.uid);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  if (!authChecked || loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <LoadingSkeleton type="banner" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton count={3} type="card" />
        </div>
      </motion.div>
    );
  }

  if (!profile) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center justify-center min-h-[400px]"
      >
        <p className="text-gray-400">Profile not found</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-surface-light rounded-lg overflow-hidden"
      >
        <div className="relative">
          <BannerUpload
            currentBannerUrl={profile.banner_url}
            onBannerChange={handleBannerChange}
            height="h-64"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/25 to-transparent" />
        </div>
        
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
            <div className="-mt-20 mb-6 md:mb-0 relative z-10">
              <AvatarUpload
                currentAvatarUrl={profile.avatar_url}
                onAvatarChange={handleAvatarChange}
                size="lg"
              />
            </div>
            
            <div className="flex-1 relative z-0">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.form
                    key="edit-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    onSubmit={handleSubmit}
                    className="space-y-6 bg-surface-light rounded-lg p-6 mt-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-300">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 bg-surface border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={4}
                        className="mt-1 block w-full px-3 py-2 bg-surface border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 bg-surface border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 bg-surface border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300">
                        Website
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 bg-surface border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary transition-all duration-200"
                      />
                    </div>

                    <div className="flex justify-end space-x-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-surface-light text-white rounded-md hover:bg-surface-light transition-all duration-200"
                        disabled={saving}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-all duration-200 disabled:opacity-50"
                        disabled={saving}
                      >
                        {saving ? 'Saving...' : 'Save Changes'}
                      </motion.button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="profile-info"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pt-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-3xl font-bold text-white">
                          {profile.full_name}
                        </h1>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center text-gray-400">
                            <Mail className="h-4 w-4 mr-2" />
                            {profile.email}
                          </div>
                          {profile.phone && (
                            <div className="flex items-center text-gray-400">
                              <Phone className="h-4 w-4 mr-2" />
                              {profile.phone}
                            </div>
                          )}
                          {profile.location && (
                            <div className="flex items-center text-gray-400">
                              <MapPin className="h-4 w-4 mr-2" />
                              {profile.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-4 py-2 border border-surface-light rounded-md text-white hover:bg-surface-light transition-all duration-200"
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </motion.button>
                    </div>
                    {profile.bio && (
                      <p className="mt-6 text-gray-300">{profile.bio}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Activity Board */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-surface border border-surface-light rounded-lg p-6"
      >
        <ActivityBoard userId={profile.id} />
      </motion.div>

      {/* Communities Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-surface border border-surface-light rounded-lg p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">My Communities</h2>
          <Link
            to="/communities/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Community
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {communities.length > 0 ? (
            <div className="space-y-4">
              {communities.map((community, index) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-surface-light rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <Link 
                        to={`/communities/${community.id}`}
                        className="text-white font-medium hover:text-primary transition-colors"
                      >
                        {community.name}
                      </Link>
                      <p className="text-sm text-gray-400">{community.description}</p>
                    </div>
                  </div>
                  <Link
                    to={`/communities/${community.id}`}
                    className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
                  >
                    View Community
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 text-gray-400"
            >
              <Users className="h-8 w-8 mx-auto mb-2" />
              <p>No communities created yet</p>
              <Link
                to="/communities/new"
                className="inline-block mt-2 text-primary hover:text-primary/90 transition-colors"
              >
                Create your first community
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Courses Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-surface border border-surface-light rounded-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">My Courses</h2>
          <Link
            to="/communities/new/courses/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-1" />
            Create Course
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CourseCard course={course} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 text-gray-400"
            >
              <BookOpen className="h-8 w-8 mx-auto mb-2" />
              <p>No courses created yet</p>
              <Link
                to="/communities/new/courses/new"
                className="inline-block mt-2 text-primary hover:text-primary/90 transition-colors"
              >
                Create your first course
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}