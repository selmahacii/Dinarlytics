import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, themes, defaultTheme } from '@/types/themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
  availableThemes: Theme[];
  customTheme: Theme | null;
  setCustomTheme: (theme: Theme | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);
  const [customTheme, setCustomTheme] = useState<Theme | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Charger le thème sauvegardé au démarrage
  useEffect(() => {
    const savedThemeId = localStorage.getItem('selectedTheme');
    const savedCustomTheme = localStorage.getItem('customTheme');

    if (savedCustomTheme) {
      try {
        const parsedCustomTheme = JSON.parse(savedCustomTheme);
        setCustomTheme(parsedCustomTheme);
        setCurrentTheme(parsedCustomTheme);
      } catch (error) {
        console.error('Erreur lors du chargement du thème personnalisé:', error);
      }
    } else if (savedThemeId) {
      const theme = themes.find(t => t.id === savedThemeId);
      if (theme) {
        setCurrentTheme(theme);
      }
    }

    // Détecter les préférences système pour le mode sombre
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    // Écouter les changements de préférences système
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
      if (currentTheme.mode === 'auto') {
        applyTheme(currentTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [currentTheme.mode]);

  // Appliquer le thème au DOM
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme, isDarkMode]);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    const colors = theme.couleurs;

    // Appliquer les couleurs CSS personnalisées
    Object.entries(colors).forEach(([key, value]) => {
      const cssVar = `--theme-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });

    // Appliquer les classes Tailwind pour le mode sombre
    if (theme.mode === 'dark' || (theme.mode === 'auto' && isDarkMode)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Sauvegarder le thème
    localStorage.setItem('selectedTheme', theme.id);
    if (customTheme && theme.id === customTheme.id) {
      localStorage.setItem('customTheme', JSON.stringify(theme));
    }
  };

  const setTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      setCustomTheme(null);
    }
  };

  const toggleDarkMode = () => {
    const newTheme = isDarkMode
      ? themes.find(t => t.mode === 'light') || themes[0]
      : themes.find(t => t.mode === 'dark') || themes[1];

    if (newTheme) {
      setCurrentTheme(newTheme);
    }
  };

  const availableThemes = customTheme ? [...themes, customTheme] : themes;

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      setTheme,
      toggleDarkMode,
      isDarkMode,
      availableThemes,
      customTheme,
      setCustomTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme doit être utilisé dans un ThemeProvider');
  }
  return context;
};
