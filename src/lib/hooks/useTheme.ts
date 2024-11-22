import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'dark';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    function applyTheme() {
      const effectiveTheme = 
        theme === 'system' 
          ? (mediaQuery.matches ? 'dark' : 'light')
          : theme;
      
      document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
      localStorage.setItem('theme', theme);
    }

    applyTheme();

    const handler = () => applyTheme();
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  return { theme, setTheme };
}