import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, auth } from '../lib/firebase';
import type { User, Course, Community } from '../types';
import { 
  User as UserIcon, 
  Award, 
  BookOpen, 
  AlertTriangle, 
  Store, 
  UserPlus, 
  Edit2, 
  Save, 
  X,
  Globe,
  Twitter,
  Linkedin,
  Github,
  Users
} from 'lucide-react';
import CourseCard from '../components/CourseCard';
import CompactCourseCard from '../components/CompactCourseCard';
import CommunityCard from '../components/CommunityCard';
import ActivityBoard from '../components/ActivityBoard';
import InviteDialog from '../components/InviteDialog';
import LoadingSkeleton from '../components/LoadingSkeleton';
import BannerUpload from '../components/BannerUpload';
import AvatarUpload from '../components/AvatarUpload';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function CreatorProfile() {
  const { id } = useParams<{ id: string }>();
  const [creator, setCreator] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    website: '',
    social_links: {
      twitter: '',
      linkedin: '',
      github: ''
    }
  });

  const isOwnProfile = auth.currentUser?.uid === id;

  useEffect(() => {
    if (id) {
      loadCreatorData();
    }
  }, [id]);

  async function loadCreatorData() {
    try {
      setLoading(true);
      setError(null);
      
      // Load creator profile
      const creatorDoc = await getDoc(doc(db, 'users', id!));
      if (!creatorDoc.exists()) {
        throw new Error('Creator not found');
      }

      const creatorData = { 
        id: creatorDoc.id, 
        ...creatorDoc.data() 
      } as User;
      
      setCreator(creatorData);
      setFormData({
        full_name: creatorData.full_name,
        bio: creatorData.bio || '',
        website: creatorData.website || '',
        social_links: creatorData.social_links || {}
      });

      // Load creator's courses and communities
      await Promise.all([
        loadCourses(creatorData.id),
        loadCommunities(creatorData.id)
      ]);
    } catch (error) {
      console.error('Error loading creator data:', error);
      setError(error as Error);
      handleFirestoreError(error, 'Failed to load creator profile');
    } finally {
      setLoading(false);
    }
  }

  async function loadCourses(userId: string) {
    try {
      const q = query(
        collection(db, 'courses'),
        where('created_by', '==', userId),
        orderBy('created_at', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const coursesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      
      setCourses(coursesData);
    } catch (error) {
      handleFirestoreError(error, 'Failed to load courses');
    }
  }

  async function loadCommunities(userId: string) {
    try {
      const q = query(
        collection(db, 'communities'),
        where('created_by', '==', userId),
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
    }
  }

  async function handleProfileUpdate() {
    if (!auth.currentUser || !creator) return;

    try {
      await updateDoc(doc(db, 'users', creator.id), {
        ...formData,
        updated_at: serverTimestamp()
      });

      setCreator(prev => prev ? { ...prev, ...formData } : null);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      handleFirestoreError(error, 'Failed to update profile');
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <LoadingSkeleton type="banner" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingSkeleton type="card" count={3} />
        </div>
      </motion.div>
    );
  }

  if (error || !creator) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[400px]"
      >
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-gray-400 mb-4">{error?.message || 'Creator not found'}</p>
        <Link
          to="/"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Return Home
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-surface-light rounded-lg overflow-hidden"
      >
        <div className="relative">
          <BannerUpload
            currentBannerUrl={creator.banner_url}
            onBannerChange={async (url) => {
              if (!auth.currentUser) return;
              try {
                await updateDoc(doc(db, 'users', creator.id), {
                  banner_url: url,
                  updated_at: serverTimestamp()
                });
                setCreator(prev => prev ? { ...prev, banner_url: url } : null);
                toast.success('Banner updated');
              } catch (error) {
                handleFirestoreError(error, 'Failed to update banner');
              }
            }}
            height="h-64"
          />
          
          <div className="absolute -bottom-16 left-6">
            <AvatarUpload
              currentAvatarUrl={creator.avatar_url}
              onAvatarChange={async (url) => {
                if (!auth.currentUser) return;
                try {
                  await updateDoc(doc(db, 'users', creator.id), {
                    avatar_url: url,
                    updated_at: serverTimestamp()
                  });
                  setCreator(prev => prev ? { ...prev, avatar_url: url } : null);
                  toast.success('Profile photo updated');
                } catch (error) {
                  handleFirestoreError(error, 'Failed to update profile photo');
                }
              }}
              size="lg"
            />
          </div>
        </div>
        
        <div className="px-6 pt-20 pb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Full Name"
                  />
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Bio"
                    rows={3}
                  />
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="flex-1 px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Website URL"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Twitter className="h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        value={formData.social_links.twitter}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, twitter: e.target.value }
                        })}
                        className="flex-1 px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Twitter URL"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Linkedin className="h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        value={formData.social_links.linkedin}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, linkedin: e.target.value }
                        })}
                        className="flex-1 px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="LinkedIn URL"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Github className="h-5 w-5 text-gray-400" />
                      <input
                        type="url"
                        value={formData.social_links.github}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, github: e.target.value }
                        })}
                        className="flex-1 px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="GitHub URL"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-sm text-gray-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleProfileUpdate}
                      className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-white">
                    {creator.full_name}
                  </h1>
                  {creator.bio && (
                    <p className="mt-2 text-gray-300">{creator.bio}</p>
                  )}
                  <div className="mt-4 flex items-center space-x-4">
                    {creator.website && (
                      <a
                        href={creator.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white"
                      >
                        <Globe className="h-5 w-5" />
                      </a>
                    )}
                    {creator.social_links?.twitter && (
                      <a
                        href={creator.social_links.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {creator.social_links?.linkedin && (
                      <a
                        href={creator.social_links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {creator.social_links?.github && (
                      <a
                        href={creator.social_links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={() => setShowInviteDialog(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-all duration-200"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Collaborator
                  </button>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-surface-light text-sm font-medium rounded-md text-white hover:bg-surface-light transition-all duration-200"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                  )}
                </>
              ) : (
                <Link
                  to={`/creators/${creator.id}/storefront`}
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-all duration-200"
                >
                  <Store className="h-4 w-4 mr-2" />
                  View Storefront
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-surface-light rounded-lg p-4"
            >
              <p className="text-sm text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-white">
                {creator.metrics?.total_students?.toLocaleString() || 0}
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-surface-light rounded-lg p-4"
            >
              <p className="text-sm text-gray-400">Courses</p>
              <p className="text-2xl font-bold text-white">
                {creator.metrics?.total_courses || 0}
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-surface-light rounded-lg p-4"
            >
              <p className="text-sm text-gray-400">Communities</p>
              <p className="text-2xl font-bold text-white">
                {communities.length}
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-surface-light rounded-lg p-4"
            >
              <p className="text-sm text-gray-400">Average Rating</p>
              <p className="text-2xl font-bold text-white">
                {creator.metrics?.avg_course_rating?.toFixed(1) || '0.0'}
              </p>
            </motion.div>
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
        <ActivityBoard userId={id!} />
      </motion.div>

      {/* Communities */}
      {communities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-white">Communities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community, index) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <CommunityCard community={community} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Courses */}
      {courses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-white">Courses</h2>
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
        </motion.div>
      )}

      {showInviteDialog && (
        <InviteDialog
          type="creator"
          targetId={id!}
          onClose={() => setShowInviteDialog(false)}
        />
      )}
    </motion.div>
  );
}