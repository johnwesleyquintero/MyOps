
import { useEffect } from 'react';

export const useTheme = (theme: 'LIGHT' | 'DARK') => {
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'DARK') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);
};
