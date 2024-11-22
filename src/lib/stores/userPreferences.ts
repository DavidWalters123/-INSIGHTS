import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  courseLanguage: string;
  timezone: string;
  contentDifficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface PreferencesState {
  preferences: UserPreferences;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
}

const defaultPreferences: UserPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  courseLanguage: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  contentDifficulty: 'intermediate',
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      updatePreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),
    }),
    {
      name: 'user-preferences',
    }
  )
);