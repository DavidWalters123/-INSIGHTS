import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LearningState {
  currentCourse: string | null;
  progress: Record<string, number>;
  streakDays: number;
  lastStudyDate: string | null;
  studyGoals: {
    dailyMinutes: number;
    weeklyLessons: number;
  };
  setCurrentCourse: (courseId: string | null) => void;
  updateProgress: (courseId: string, progress: number) => void;
  updateStreak: () => void;
  setStudyGoals: (goals: { dailyMinutes: number; weeklyLessons: number }) => void;
}

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      currentCourse: null,
      progress: {},
      streakDays: 0,
      lastStudyDate: null,
      studyGoals: {
        dailyMinutes: 30,
        weeklyLessons: 5,
      },
      setCurrentCourse: (courseId) => set({ currentCourse: courseId }),
      updateProgress: (courseId, progress) =>
        set((state) => ({
          progress: { ...state.progress, [courseId]: progress },
        })),
      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const lastDate = get().lastStudyDate;
        
        if (lastDate === today) return;

        const isConsecutiveDay = lastDate === 
          new Date(Date.now() - 86400000).toISOString().split('T')[0];

        set((state) => ({
          streakDays: isConsecutiveDay ? state.streakDays + 1 : 1,
          lastStudyDate: today,
        }));
      },
      setStudyGoals: (goals) => set({ studyGoals: goals }),
    }),
    {
      name: 'learning-store',
    }
  )
);