import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);

  if (paths.length === 0) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-2 text-sm text-gray-400 mb-6"
    >
      <Link 
        to="/"
        className="hover:text-white transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>

      {paths.map((path, index) => {
        const to = `/${paths.slice(0, index + 1).join('/')}`;
        const isLast = index === paths.length - 1;

        return (
          <React.Fragment key={path}>
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="text-white font-medium">
                {path.charAt(0).toUpperCase() + path.slice(1)}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-white transition-colors"
              >
                {path.charAt(0).toUpperCase() + path.slice(1)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </motion.nav>
  );
}