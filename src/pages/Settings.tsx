import React from 'react';
import { Settings as SettingsIcon, Bell, Globe, BookOpen, Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../lib/stores/themeStore';
import { usePreferencesStore } from '../lib/stores/userPreferences';
import { toast } from 'react-hot-toast';

export default function Settings() {
  const { theme, setTheme } = useThemeStore();
  const { preferences, updatePreferences } = usePreferencesStore();

  const handleThemeChange = (newTheme: 'dark' | 'light' | 'system') => {
    setTheme(newTheme);
    toast.success('Theme updated successfully');
  };

  const handlePreferenceChange = (key: keyof typeof preferences, value: any) => {
    updatePreferences({ [key]: value });
    toast.success('Preferences updated successfully');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center space-x-3">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-white">Settings</h1>
      </div>

      <div className="bg-surface border border-surface-light rounded-lg p-6 space-y-8">
        {/* Theme Settings */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Theme</h2>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => handleThemeChange('light')}
              className={`flex items-center justify-center p-4 rounded-lg border ${
                theme === 'light'
                  ? 'border-primary bg-primary/10'
                  : 'border-surface-light hover:border-primary/50'
              }`}
            >
              <Sun className="h-6 w-6 text-yellow-500 mr-2" />
              <span className="text-white">Light</span>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`flex items-center justify-center p-4 rounded-lg border ${
                theme === 'dark'
                  ? 'border-primary bg-primary/10'
                  : 'border-surface-light hover:border-primary/50'
              }`}
            >
              <Moon className="h-6 w-6 text-blue-500 mr-2" />
              <span className="text-white">Dark</span>
            </button>
            <button
              onClick={() => handleThemeChange('system')}
              className={`flex items-center justify-center p-4 rounded-lg border ${
                theme === 'system'
                  ? 'border-primary bg-primary/10'
                  : 'border-surface-light hover:border-primary/50'
              }`}
            >
              <Monitor className="h-6 w-6 text-green-500 mr-2" />
              <span className="text-white">System</span>
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <span className="text-white">Email Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={(e) =>
                    handlePreferenceChange('emailNotifications', e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-primary" />
                <span className="text-white">Push Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.pushNotifications}
                  onChange={(e) =>
                    handlePreferenceChange('pushNotifications', e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Learning Preferences */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Learning Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Course Language
              </label>
              <select
                value={preferences.courseLanguage}
                onChange={(e) => handlePreferenceChange('courseLanguage', e.target.value)}
                className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content Difficulty
              </label>
              <select
                value={preferences.contentDifficulty}
                onChange={(e) =>
                  handlePreferenceChange(
                    'contentDifficulty',
                    e.target.value as 'beginner' | 'intermediate' | 'advanced'
                  )
                }
                className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Timezone
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-md text-white focus:outline-none focus:ring-primary focus:border-primary"
              >
                {Intl.supportedValuesOf('timeZone').map((timezone) => (
                  <option key={timezone} value={timezone}>
                    {timezone}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}