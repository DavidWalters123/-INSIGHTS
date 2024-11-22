import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../lib/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-lg transition-colors ${
          theme === 'light'
            ? 'bg-primary text-white'
            : 'text-gray-400 hover:text-white'
        }`}
        title="Light Mode"
      >
        <Sun className="h-5 w-5" />
      </button>

      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-lg transition-colors ${
          theme === 'dark'
            ? 'bg-primary text-white'
            : 'text-gray-400 hover:text-white'
        }`}
        title="Dark Mode"
      >
        <Moon className="h-5 w-5" />
      </button>

      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-lg transition-colors ${
          theme === 'system'
            ? 'bg-primary text-white'
            : 'text-gray-400 hover:text-white'
        }`}
        title="System Theme"
      >
        <Monitor className="h-5 w-5" />
      </button>
    </div>
  );
}