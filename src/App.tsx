import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import AuthForm from './components/AuthForm';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Communities from './pages/Communities';
import Community from './pages/Community';
import NewCommunity from './pages/NewCommunity';
import NewCourse from './pages/NewCourse';
import Course from './pages/Course';
import Courses from './pages/Courses';
import CreatorProfile from './pages/CreatorProfile';
import CreatorStorefront from './pages/CreatorStorefront';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import InvitePage from './pages/InvitePage';
import PublicProfile from './pages/PublicProfile';

interface PrivateRouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(!!user);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

// Scroll restoration component
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1A1B23',
              color: '#fff',
              border: '1px solid #2D2E3A'
            }
          }} 
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<AuthForm />} />
          <Route path="/invite/:code" element={<InvitePage />} />
          <Route path="/:username" element={<PublicProfile />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="communities" element={<Communities />} />
            <Route path="communities/new" element={<NewCommunity />} />
            <Route path="communities/:id" element={<Community />} />
            <Route path="communities/:communityId/courses/new" element={<NewCourse />} />
            <Route path="communities/:communityId/courses/:courseId" element={<Course />} />
            <Route path="courses" element={<Courses />} />
            <Route path="profile" element={<Profile />} />
            <Route path="creators/:id" element={<CreatorProfile />} />
            <Route path="creators/:id/storefront" element={<CreatorStorefront />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetail />} />
            <Route path="settings" element={<Settings />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}