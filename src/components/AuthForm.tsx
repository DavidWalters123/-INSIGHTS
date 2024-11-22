import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function AuthForm() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: ''
  });

  const validateUsername = async (username: string) => {
    if (!username) return false;
    if (username.length < 3) return false;
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) return false;

    // Check if username is already taken
    const q = query(collection(db, 'users'), where('username', '==', username));
    const snapshot = await getDocs(q);
    return snapshot.empty;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        toast.success('Signed in successfully');
      } else {
        // Validate username first
        const isValidUsername = await validateUsername(formData.username);
        if (!isValidUsername) {
          toast.error('Username is invalid or already taken');
          setLoading(false);
          return;
        }

        // Create the user account
        const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Update the user's display name FIRST
        await updateProfile(user, {
          displayName: formData.fullName
        });

        // Reload the user to ensure the display name is available immediately
        await user.reload();

        // Create a user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: formData.email,
          full_name: formData.fullName,
          username: formData.username.toLowerCase(),
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
          metrics: {
            total_students: 0,
            total_revenue: 0,
            avg_course_rating: 0,
            total_courses: 0,
            completion_rate: 0,
            engagement_score: 0
          }
        });

        toast.success('Account created successfully');
      }
      navigate('/');
    } catch (error: any) {
      console.error('Auth error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-surface p-8 rounded-lg border border-surface-light">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Welcome to LearnHub
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {isLogin ? 'Sign in to continue' : 'Create a new account'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required={!isLogin}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="appearance-none relative block w-full px-3 py-2 border border-surface-light placeholder-gray-500 text-white rounded-md bg-surface-light focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required={!isLogin}
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                      className="appearance-none relative block w-full px-3 py-2 border border-surface-light placeholder-gray-500 text-white rounded-md bg-surface-light focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                      placeholder="Choose a username"
                      pattern="[a-zA-Z0-9_-]+"
                      title="Only letters, numbers, underscores, and hyphens are allowed"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-400 text-sm">@{formData.username}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-400">
                    This will be your profile URL: domain.com/{formData.username || 'username'}
                  </p>
                </div>
              </>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="appearance-none relative block w-full px-3 py-2 border border-surface-light placeholder-gray-500 text-white rounded-md bg-surface-light focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="appearance-none relative block w-full px-3 py-2 border border-surface-light placeholder-gray-500 text-white rounded-md bg-surface-light focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Sign up')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:text-primary/90"
            >
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}