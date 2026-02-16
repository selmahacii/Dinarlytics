import React from 'react';
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@core/context/ThemeContext';

interface ThemeToggleProps {
  showThemeSelector?: boolean;
  onThemeSelectorClick?: () => void;
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  showThemeSelector = false, 
  onThemeSelectorClick,
  className = ''
}) => {
  const { currentTheme, toggleDarkMode, isDarkMode } = useTheme();

  const getIcon = () => {
    if (currentTheme.mode === 'auto') {
      return <ComputerDesktopIcon className="h-5 w-5" />;
    }
    return isDarkMode ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />;
  };

  const getTooltip = () => {
    if (currentTheme.mode === 'auto') {
      return 'Mode automatique (suit les préférences système)';
    }
    return isDarkMode ? 'Passer en mode clair' : 'Passer en mode sombre';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Bouton de basculement rapide */}
      <button
        onClick={toggleDarkMode}
        className={`p-2 rounded-lg transition-all duration-200 ${
          isDarkMode 
            ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        title={getTooltip()}
      >
        {getIcon()}
      </button>

      {/* Bouton pour ouvrir le sélecteur de thèmes */}
      {showThemeSelector && onThemeSelectorClick && (
        <button
          onClick={onThemeSelectorClick}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isDarkMode 
              ? 'bg-gray-700 text-purple-400 hover:bg-gray-600' 
              : 'bg-gray-100 text-purple-600 hover:bg-gray-200'
          }`}
          title="Sélectionner un thème"
        >
          <PaintBrushIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default ThemeToggle;

