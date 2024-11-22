import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { Home, LogOut, User, BookOpen, Users, Settings } from 'lucide-react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import NotificationBell from './NotificationBell';
import LanguageSelector from './LanguageSelector';
import { useClickOutside } from '../hooks/useClickOutside';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setShowDropdown(false));

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success('Signed out successfully');
    navigate('/login');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 navbar-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center px-2 text-white">
                <span className="text-xl font-bold">$INSIGHTS</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    location.pathname === '/'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </Link>
                <Link
                  to="/communities"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    location.pathname === '/communities'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Users className="h-4 w-4 mr-1" />
                  Communities
                </Link>
                <Link
                  to="/courses"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    location.pathname === '/courses'
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="h-4 w-4 mr-1" />
                  Courses
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <NotificationBell />
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  onKeyDown={handleKeyDown}
                  className="flex items-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface rounded-full"
                  aria-expanded={showDropdown}
                  aria-haspopup="true"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                    {auth.currentUser?.photoURL ? (
                      <img
                        src={auth.currentUser.photoURL}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </button>

                {showDropdown && (
                  <div 
                    className="absolute right-0 mt-2 w-48 bg-surface border border-surface-light rounded-lg shadow-lg py-1 z-50"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu"
                  >
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-surface-light focus:bg-surface-light focus:outline-none"
                      onClick={() => setShowDropdown(false)}
                      role="menuitem"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-surface-light focus:bg-surface-light focus:outline-none"
                      onClick={() => setShowDropdown(false)}
                      role="menuitem"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                    <div className="border-t border-surface-light my-1"></div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleSignOut();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-surface-light focus:bg-surface-light focus:outline-none"
                      role="menuitem"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-16">
        <Outlet />
      </main>
    </div>
  );
}