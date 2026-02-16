import React, { useState } from 'react';
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  PaintBrushIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@core/context/ThemeContext';
import { Theme } from '@/types/themes';
import Modal from '../UI/Modal';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ isOpen, onClose }) => {
  const { currentTheme, setTheme, availableThemes, customTheme, setCustomTheme } = useTheme();
  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [customThemeData, setCustomThemeData] = useState<Partial<Theme>>({
    nom: 'Thème Personnalisé',
    description: 'Thème créé par l\'utilisateur',
    icone: '🎨',
    couleur: 'purple',
    mode: 'light',
    couleurs: {
      primary: '#8b5cf6',
      secondary: '#64748b',
      accent: '#a855f7',
      background: '#ffffff',
      surface: '#f8fafc',
      surfaceVariant: '#f1f5f9',
      textPrimary: '#0f172a',
      textSecondary: '#64748b',
      textDisabled: '#94a3b8',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      border: '#e2e8f0',
      borderVariant: '#cbd5e1',
      hover: '#f1f5f9',
      active: '#e2e8f0',
      focus: '#3b82f6'
    }
  });

  const handleThemeSelect = (theme: Theme) => {
    setTheme(theme.id);
  };

  const handleCustomThemeSave = () => {
    const newCustomTheme: Theme = {
      id: 'custom-theme',
      nom: customThemeData.nom || 'Thème Personnalisé',
      description: customThemeData.description || 'Thème créé par l\'utilisateur',
      icone: customThemeData.icone || '🎨',
      couleur: customThemeData.couleur || 'purple',
      mode: customThemeData.mode || 'light',
      couleurs: customThemeData.couleurs || themes[0].couleurs
    };
    
    setCustomTheme(newCustomTheme);
    setCurrentTheme(newCustomTheme);
    setShowCustomEditor(false);
  };

  const handleCustomThemeDelete = () => {
    setCustomTheme(null);
    setTheme('light-default');
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'light': return <SunIcon className="h-4 w-4" />;
      case 'dark': return <MoonIcon className="h-4 w-4" />;
      case 'auto': return <ComputerDesktopIcon className="h-4 w-4" />;
      default: return <SunIcon className="h-4 w-4" />;
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      gray: 'bg-gray-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sélectionner un Thème" size="lg">
      <div className="space-y-6">
        {/* Thèmes prédéfinis */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thèmes Prédéfinis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableThemes.filter(theme => theme.id !== 'custom-theme').map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  currentTheme.id === theme.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{theme.icone}</div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {theme.nom}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {theme.description}
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      {getModeIcon(theme.mode)}
                      <div className={`w-3 h-3 rounded-full ${getColorClasses(theme.couleur)}`}></div>
                    </div>
                  </div>
                  {currentTheme.id === theme.id && (
                    <CheckIcon className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Thème personnalisé */}
        {customTheme && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Thème Personnalisé</h3>
              <button
                onClick={handleCustomThemeDelete}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{customTheme.icone}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {customTheme.nom}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {customTheme.description}
                  </div>
                </div>
                {currentTheme.id === customTheme.id && (
                  <CheckIcon className="h-5 w-5 text-blue-500" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bouton pour créer un thème personnalisé */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowCustomEditor(true)}
            className="w-full p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500 transition-colors flex items-center justify-center space-x-2"
          >
            <PaintBrushIcon className="h-5 w-5 text-purple-500" />
            <span className="text-purple-600 dark:text-purple-400 font-medium">
              Créer un Thème Personnalisé
            </span>
          </button>
        </div>

        {/* Éditeur de thème personnalisé */}
        {showCustomEditor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Créer un Thème Personnalisé
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nom du thème
                  </label>
                  <input
                    type="text"
                    value={customThemeData.nom || ''}
                    onChange={(e) => setCustomThemeData({ ...customThemeData, nom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={customThemeData.description || ''}
                    onChange={(e) => setCustomThemeData({ ...customThemeData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mode
                  </label>
                  <select
                    value={customThemeData.mode || 'light'}
                    onChange={(e) => setCustomThemeData({ ...customThemeData, mode: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                    <option value="auto">Automatique</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Couleur principale
                  </label>
                  <input
                    type="color"
                    value={customThemeData.couleurs?.primary || '#8b5cf6'}
                    onChange={(e) => setCustomThemeData({
                      ...customThemeData,
                      couleurs: { ...customThemeData.couleurs!, primary: e.target.value }
                    })}
                    className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCustomEditor(false)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCustomThemeSave}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ThemeSelector;



