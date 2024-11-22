import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, getDoc, updateDoc, serverTimestamp, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, auth } from '../lib/firebase';
import type { Community as CommunityType, Post, CommunityMember, Course, User } from '../types';
import PostCard from '../components/PostCard';
import CreatePostForm from '../components/CreatePostForm';
import MemberList from '../components/MemberList';
import CourseList from '../components/CourseList';
import AdminSettingsModal from '../components/AdminSettingsModal';
import CommunityEvents from '../components/CommunityEvents';
import CommunityAnnouncements from '../components/CommunityAnnouncements';
import CommunityResources from '../components/CommunityResources';
import CommunityActivityBoard from '../components/CommunityActivityBoard';
import CommunityChat from '../components/CommunityChat';
import InviteDialog from '../components/InviteDialog';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { Settings, Loader, Plus, UserPlus, MessageSquare, UserMinus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Community() {
  const { id } = useParams();
  const [community, setCommunity] = useState<CommunityType | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [members, setMembers] = useState<(CommunityMember & { user: User })[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [membershipId, setMembershipId] = useState<string | null>(null);

  useEffect(() => {
    if (id && auth.currentUser) {
      loadCommunityData();
    }
  }, [id, auth.currentUser]);

  async function loadCommunity() {
    if (!id) return null;
    const docRef = doc(db, 'communities', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Community not found');
    }

    return { id: docSnap.id, ...docSnap.data() } as CommunityType;
  }

  async function loadPosts() {
    if (!id) return [];
    const q = query(
      collection(db, 'posts'),
      where('community_id', '==', id),
      orderBy('created_at', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
    });

    return unsubscribe;
  }

  async function loadMembers() {
    if (!id) return [];
    const membersQuery = query(
      collection(db, 'community_members'),
      where('community_id', '==', id),
      orderBy('joined_at', 'desc')
    );
    
    const memberSnapshot = await getDocs(membersQuery);
    
    const membersData = await Promise.all(
      memberSnapshot.docs.map(async (memberDoc) => {
        const memberData = {
          id: memberDoc.id,
          ...memberDoc.data()
        } as CommunityMember;

        const userDoc = await getDoc(doc(db, 'users', memberData.user_id));
        let userData: User;

        if (userDoc.exists()) {
          userData = {
            id: userDoc.id,
            ...userDoc.data()
          } as User;
        } else {
          userData = {
            id: memberData.user_id,
            email: '',
            full_name: 'Anonymous User',
            created_at: new Date()
          };
        }

        return {
          ...memberData,
          user: userData
        };
      })
    );

    return membersData;
  }

  async function loadCourses() {
    if (!id) return [];
    const q = query(
      collection(db, 'courses'),
      where('community_id', '==', id),
      orderBy('created_at', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Course[];
  }

  async function loadCommunityData() {
    try {
      setLoading(true);
      setError(null);

      const [communityData, membersData, coursesData] = await Promise.all([
        loadCommunity(),
        loadMembers(),
        loadCourses()
      ]);

      setCommunity(communityData);
      setMembers(membersData);
      setCourses(coursesData);

      // Check membership status
      if (auth.currentUser) {
        const membership = membersData.find(
          member => member.user_id === auth.currentUser?.uid
        );
        
        if (membership) {
          setIsMember(true);
          setIsAdmin(membership.role === 'admin');
          setMembershipId(membership.id);
        } else {
          setIsMember(false);
          setIsAdmin(false);
          setMembershipId(null);
        }
      }

      // Set up real-time posts listener
      const unsubscribe = await loadPosts();
      return () => unsubscribe();

    } catch (error) {
      console.error('Error loading community data:', error);
      setError(error instanceof Error ? error : new Error('Failed to load community'));
      toast.error('Failed to load community data');
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinCommunity() {
    if (!auth.currentUser || !id) return;

    try {
      const memberRef = await addDoc(collection(db, 'community_members'), {
        community_id: id,
        user_id: auth.currentUser.uid,
        role: 'member',
        joined_at: serverTimestamp()
      });

      setIsMember(true);
      setMembershipId(memberRef.id);
      toast.success('Successfully joined community');
      loadCommunityData();
    } catch (error) {
      console.error('Error joining community:', error);
      toast.error('Failed to join community');
    }
  }

  async function handleLeaveCommunity() {
    if (!auth.currentUser || !membershipId || isAdmin) return;

    if (!window.confirm('Are you sure you want to leave this community?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'community_members', membershipId));
      setIsMember(false);
      setMembershipId(null);
      toast.success('Successfully left community');
      loadCommunityData();
    } catch (error) {
      console.error('Error leaving community:', error);
      toast.error('Failed to leave community');
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <LoadingSkeleton type="banner" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <LoadingSkeleton type="card" count={3} />
          </div>
          <div>
            <LoadingSkeleton type="card" count={2} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[400px]"
      >
        <p className="text-red-500 mb-4">{error?.message || 'Community not found'}</p>
        <button
          onClick={() => loadCommunityData()}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
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
        className="bg-surface border border-surface-light rounded-lg"
      >
        <div 
          className="h-48 rounded-t-lg bg-cover bg-center"
          style={{ 
            backgroundImage: community.banner_url ? `url(${community.banner_url})` : 'none',
            backgroundColor: !community.banner_url ? '#1A1B23' : undefined
          }}
        />
        <div className="px-6 py-5">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white">{community.name}</h1>
              <p className="mt-2 text-gray-300">{community.description}</p>
              
              {!isMember && auth.currentUser && (
                <button
                  onClick={handleJoinCommunity}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-all duration-200"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Join Community
                </button>
              )}
            </div>
            <div className="flex space-x-4">
              {isAdmin && (
                <>
                  <button
                    onClick={() => setShowInviteDialog(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-all duration-200"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Invite
                  </button>
                  <Link
                    to={`/communities/${id}/courses/new`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-all duration-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Course
                  </Link>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                </>
              )}
              {isMember && !isAdmin && (
                <button
                  onClick={handleLeaveCommunity}
                  className="inline-flex items-center px-4 py-2 border border-red-500 text-red-500 text-sm font-medium rounded-md hover:bg-red-500/10 transition-all duration-200"
                >
                  <UserMinus className="h-4 w-4 mr-1" />
                  Leave Community
                </button>
              )}
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
        <CommunityActivityBoard communityId={id} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {isMember && <CreatePostForm communityId={id} onPostCreated={() => {}} />}
          <AnimatePresence mode="wait">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
            {posts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 text-gray-400"
              >
                No posts yet. Be the first to post!
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <CourseList
            courses={courses}
            communityId={id}
            isAdmin={isAdmin}
            onCourseCreated={loadCourses}
          />
          <MemberList
            members={members}
            isAdmin={isAdmin}
            onRemoveMember={loadCommunityData}
            onUpdateRole={loadCommunityData}
          />
          <CommunityEvents communityId={id} isAdmin={isAdmin} />
          <CommunityAnnouncements communityId={id} isAdmin={isAdmin} />
          <CommunityResources communityId={id} isAdmin={isAdmin} />
        </motion.div>
      </div>

      {showSettings && (
        <AdminSettingsModal
          community={community}
          onClose={() => setShowSettings(false)}
          onUpdate={(updates) => {
            setCommunity({ ...community, ...updates });
            setShowSettings(false);
          }}
        />
      )}

      {showInviteDialog && (
        <InviteDialog
          type="community"
          targetId={id}
          onClose={() => setShowInviteDialog(false)}
        />
      )}

      <div className="fixed bottom-4 right-4 space-y-4">
        {isMember && (
          <button
            onClick={() => setShowChat(!showChat)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-all duration-200"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Community Chat</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {showChat && (
          <CommunityChat
            communityId={id}
            onClose={() => setShowChat(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}