import React, { useState, useEffect } from 'react';
import {
  PaintBrushIcon,
  PhotoIcon,
  SwatchIcon,
  EyeIcon,
  DocumentTextIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CogIcon,
  SparklesIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import GlassmorphismCard from '../Effects/GlassmorphismCard';
import Modal from '../UI/Modal';

interface BrandTheme {
  id: string;
  name: string;
  type: 'light' | 'dark' | 'auto';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  typography: {
    fontFamily: string;
    fontSize: 'small' | 'medium' | 'large';
    fontWeight: 'light' | 'normal' | 'bold';
  };
  spacing: 'compact' | 'normal' | 'spacious';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  shadows: 'none' | 'subtle' | 'medium' | 'strong';
  logo?: string;
  favicon?: string;
  customCSS?: string;
  isDefault: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AdvancedThemingProps {
  isVisible?: boolean;
  showGlassmorphism?: boolean;
}

const AdvancedTheming: React.FC<AdvancedThemingProps> = ({ 
  isVisible = true, 
  showGlassmorphism = true 
}) => {
  const [themes, setThemes] = useState<BrandTheme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<BrandTheme | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout' | 'branding' | 'advanced'>('colors');
  const [autoTheme, setAutoTheme] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Thèmes de démonstration
  const demoThemes: BrandTheme[] = [
    {
      id: '1',
      name: 'Corporate Bleu',
      type: 'light',
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#f59e0b',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        textSecondary: '#64748b'
      },
      typography: {
        fontFamily: 'Inter',
        fontSize: 'medium',
        fontWeight: 'normal'
      },
      spacing: 'normal',
      borderRadius: 'medium',
      shadows: 'medium',
      isDefault: true,
      isPublic: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Dark Professional',
      type: 'dark',
      colors: {
        primary: '#3b82f6',
        secondary: '#94a3b8',
        accent: '#fbbf24',
        background: '#0f172a',
        surface: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#94a3b8'
      },
      typography: {
        fontFamily: 'Roboto',
        fontSize: 'medium',
        fontWeight: 'normal'
      },
      spacing: 'normal',
      borderRadius: 'small',
      shadows: 'strong',
      isDefault: false,
      isPublic: true,
      createdAt: '2024-01-05',
      updatedAt: '2024-01-12'
    },
    {
      id: '3',
      name: 'Minimaliste',
      type: 'light',
      colors: {
        primary: '#059669',
        secondary: '#6b7280',
        accent: '#dc2626',
        background: '#ffffff',
        surface: '#ffffff',
        text: '#111827',
        textSecondary: '#6b7280'
      },
      typography: {
        fontFamily: 'Helvetica',
        fontSize: 'small',
        fontWeight: 'light'
      },
      spacing: 'spacious',
      borderRadius: 'none',
      shadows: 'none',
      isDefault: false,
      isPublic: false,
      createdAt: '2024-01-10',
      updatedAt: '2024-01-14'
    },
    {
      id: '4',
      name: 'Vibrant',
      type: 'light',
      colors: {
        primary: '#7c3aed',
        secondary: '#ec4899',
        accent: '#10b981',
        background: '#fefce8',
        surface: '#ffffff',
        text: '#1f2937',
        textSecondary: '#6b7280'
      },
      typography: {
        fontFamily: 'Poppins',
        fontSize: 'large',
        fontWeight: 'bold'
      },
      spacing: 'compact',
      borderRadius: 'large',
      shadows: 'subtle',
      isDefault: false,
      isPublic: true,
      createdAt: '2024-01-08',
      updatedAt: '2024-01-13'
    }
  ];

  useEffect(() => {
    setThemes(demoThemes);
    setSelectedTheme(demoThemes[0]);
  }, []);

  // Mise à jour de l'heure pour le mode auto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getAutoTheme = () => {
    const hour = currentTime.getHours();
    return hour >= 6 && hour < 18 ? 'light' : 'dark';
  };

  const currentThemeType = autoTheme ? getAutoTheme() : selectedTheme?.type || 'light';

  const applyTheme = (theme: BrandTheme) => {
    setSelectedTheme(theme);
    // Ici vous appliqueriez le thème à l'application
    console.log('Thème appliqué:', theme);
  };

  const createNewTheme = () => {
    const newTheme: BrandTheme = {
      id: `theme-${Date.now()}`,
      name: 'Nouveau Thème',
      type: 'light',
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#f59e0b',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1e293b',
        textSecondary: '#64748b'
      },
      typography: {
        fontFamily: 'Inter',
        fontSize: 'medium',
        fontWeight: 'normal'
      },
      spacing: 'normal',
      borderRadius: 'medium',
      shadows: 'medium',
      isDefault: false,
      isPublic: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setThemes(prev => [...prev, newTheme]);
    setSelectedTheme(newTheme);
    setIsModalOpen(true);
  };

  const deleteTheme = (themeId: string) => {
    if (themes.find(t => t.id === themeId)?.isDefault) return;
    setThemes(prev => prev.filter(t => t.id !== themeId));
    if (selectedTheme?.id === themeId) {
      setSelectedTheme(themes.find(t => t.id !== themeId) || themes[0]);
    }
  };

  const duplicateTheme = (theme: BrandTheme) => {
    const duplicatedTheme: BrandTheme = {
      ...theme,
      id: `theme-${Date.now()}`,
      name: `${theme.name} (Copie)`,
      isDefault: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setThemes(prev => [...prev, duplicatedTheme]);
  };

  const exportTheme = (theme: BrandTheme) => {
    const themeData = JSON.stringify(theme, null, 2);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const themeData = JSON.parse(e.target?.result as string);
          const importedTheme: BrandTheme = {
            ...themeData,
            id: `theme-${Date.now()}`,
            isDefault: false,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
          };
          setThemes(prev => [...prev, importedTheme]);
        } catch (error) {
          console.error('Erreur lors de l\'import du thème:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <PaintBrushIcon className="h-6 w-6 text-pink-600" />
            <span>🎨 Thèmes et Branding Avancé</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Personnalisation complète des couleurs, logos et templates avec branding entreprise
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="flex items-center space-x-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={autoTheme}
                onChange={(e) => setAutoTheme(e.target.checked)}
                className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Mode Auto</span>
            </label>
            {autoTheme && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {currentThemeType === 'light' ? '☀️ Jour' : '🌙 Nuit'}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <EyeIcon className="h-5 w-5" />
            <span>Aperçu</span>
          </button>
          <button
            onClick={createNewTheme}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nouveau Thème</span>
          </button>
        </div>
      </div>

      {/* Informations sur le thème actuel */}
      {selectedTheme && (
        <div className={showGlassmorphism ? '' : ''}>
          {showGlassmorphism ? (
            <GlassmorphismCard intensity="medium" className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Thème Actuel: {selectedTheme.name}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedTheme.type === 'light' ? '☀️ Clair' : 
                         selectedTheme.type === 'dark' ? '🌙 Sombre' : '🔄 Auto'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Police:</span>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedTheme.typography.fontFamily}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Espacement:</span>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedTheme.spacing === 'compact' ? 'Compact' :
                         selectedTheme.spacing === 'normal' ? 'Normal' : 'Spacieux'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Bordures:</span>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedTheme.borderRadius === 'none' ? 'Aucune' :
                         selectedTheme.borderRadius === 'small' ? 'Petites' :
                         selectedTheme.borderRadius === 'medium' ? 'Moyennes' : 'Grandes'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => duplicateTheme(selectedTheme)}
                    className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 text-sm"
                  >
                    <ShareIcon className="h-4 w-4 inline mr-1" />
                    Dupliquer
                  </button>
                  <button
                    onClick={() => exportTheme(selectedTheme)}
                    className="px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 text-sm"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 inline mr-1" />
                    Exporter
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 text-sm"
                  >
                    <PencilIcon className="h-4 w-4 inline mr-1" />
                    Modifier
                  </button>
                </div>
              </div>
            </GlassmorphismCard>
          ) : (
            <Card className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Thème Actuel: {selectedTheme.name}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedTheme.type === 'light' ? '☀️ Clair' : 
                         selectedTheme.type === 'dark' ? '🌙 Sombre' : '🔄 Auto'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Police:</span>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedTheme.typography.fontFamily}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Espacement:</span>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedTheme.spacing === 'compact' ? 'Compact' :
                         selectedTheme.spacing === 'normal' ? 'Normal' : 'Spacieux'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Bordures:</span>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedTheme.borderRadius === 'none' ? 'Aucune' :
                         selectedTheme.borderRadius === 'small' ? 'Petites' :
                         selectedTheme.borderRadius === 'medium' ? 'Moyennes' : 'Grandes'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => duplicateTheme(selectedTheme)}
                    className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 text-sm"
                  >
                    <ShareIcon className="h-4 w-4 inline mr-1" />
                    Dupliquer
                  </button>
                  <button
                    onClick={() => exportTheme(selectedTheme)}
                    className="px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 text-sm"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 inline mr-1" />
                    Exporter
                  </button>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 text-sm"
                  >
                    <PencilIcon className="h-4 w-4 inline mr-1" />
                    Modifier
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Palette de couleurs du thème actuel */}
      {selectedTheme && (
        <div className={showGlassmorphism ? '' : ''}>
          {showGlassmorphism ? (
            <GlassmorphismCard intensity="medium" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                <SwatchIcon className="h-5 w-5 text-pink-600" />
                <span>🎨 Palette de Couleurs</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(selectedTheme.colors).map(([key, color]) => (
                  <div key={key} className="text-center">
                    <div
                      className="w-full h-16 rounded-lg mb-2 border border-gray-200 dark:border-gray-700"
                      style={{ backgroundColor: color }}
                    ></div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                      {color}
                    </div>
                  </div>
                ))}
              </div>
            </GlassmorphismCard>
          ) : (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                <SwatchIcon className="h-5 w-5 text-pink-600" />
                <span>🎨 Palette de Couleurs</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(selectedTheme.colors).map(([key, color]) => (
                  <div key={key} className="text-center">
                    <div
                      className="w-full h-16 rounded-lg mb-2 border border-gray-200 dark:border-gray-700"
                      style={{ backgroundColor: color }}
                    ></div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                      {color}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Liste des thèmes disponibles */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            📚 Bibliothèque de Thèmes ({themes.length})
          </h3>
          <div className="flex space-x-2">
            <label className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 cursor-pointer text-sm">
              <ArrowUpTrayIcon className="h-4 w-4 inline mr-1" />
              Importer
              <input
                type="file"
                accept=".json"
                onChange={importTheme}
                className="hidden"
              />
            </label>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((theme) => (
            showGlassmorphism ? (
              <div
                key={theme.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedTheme?.id === theme.id ? 'ring-2 ring-pink-500 ring-opacity-50' : ''
                }`}
                onClick={() => applyTheme(theme)}
              >
                <GlassmorphismCard 
                  intensity="medium" 
                  className="p-4"
                >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                      {theme.name}
                      {theme.isDefault && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          Défaut
                        </span>
                      )}
                      {theme.isPublic && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Public
                        </span>
                      )}
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {theme.type === 'light' ? '☀️ Clair' : 
                       theme.type === 'dark' ? '🌙 Sombre' : '🔄 Auto'}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {selectedTheme?.id === theme.id && (
                      <CheckIcon className="h-5 w-5 text-pink-500" />
                    )}
                    {!theme.isDefault && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTheme(theme.id);
                        }}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Aperçu des couleurs */}
                <div className="flex space-x-1 mb-3">
                  <div
                    className="w-6 h-6 rounded border border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: theme.colors.primary }}
                  ></div>
                  <div
                    className="w-6 h-6 rounded border border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: theme.colors.secondary }}
                  ></div>
                  <div
                    className="w-6 h-6 rounded border border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: theme.colors.accent }}
                  ></div>
                  <div
                    className="w-6 h-6 rounded border border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: theme.colors.background }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Police: {theme.typography.fontFamily} • 
                  Espacement: {theme.spacing} • 
                  Bordures: {theme.borderRadius}
                </div>
                </GlassmorphismCard>
              </div>
            ) : (
              <div
                key={theme.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedTheme?.id === theme.id ? 'ring-2 ring-pink-500 ring-opacity-50' : ''
                }`}
                onClick={() => applyTheme(theme)}
              >
                <Card 
                  className="p-4"
                >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                      {theme.name}
                      {theme.isDefault && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          Défaut
                        </span>
                      )}
                      {theme.isPublic && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Public
                        </span>
                      )}
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {theme.type === 'light' ? '☀️ Clair' : 
                       theme.type === 'dark' ? '🌙 Sombre' : '🔄 Auto'}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {selectedTheme?.id === theme.id && (
                      <CheckIcon className="h-5 w-5 text-pink-500" />
                    )}
                    {!theme.isDefault && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTheme(theme.id);
                        }}
                        className="p-1 text-red-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Aperçu des couleurs */}
                <div className="flex space-x-1 mb-3">
                  <div
                    className="w-6 h-6 rounded border border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: theme.colors.primary }}
                  ></div>
                  <div
                    className="w-6 h-6 rounded border border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: theme.colors.secondary }}
                  ></div>
                  <div
                    className="w-6 h-6 rounded border border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: theme.colors.accent }}
                  ></div>
                  <div
                    className="w-6 h-6 rounded border border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: theme.colors.background }}
                  ></div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Police: {theme.typography.fontFamily} • 
                  Espacement: {theme.spacing} • 
                  Bordures: {theme.borderRadius}
                </div>
                </Card>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Modal d'édition de thème */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Éditeur de Thème"
        size="xl"
      >
        <div className="space-y-6">
          {/* Navigation par onglets */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'colors', label: 'Couleurs', icon: SwatchIcon },
                { id: 'typography', label: 'Typographie', icon: DocumentTextIcon },
                { id: 'layout', label: 'Mise en Page', icon: CogIcon },
                { id: 'branding', label: 'Branding', icon: PhotoIcon },
                { id: 'advanced', label: 'Avancé', icon: SparklesIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'colors' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Palette de Couleurs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTheme && Object.entries(selectedTheme.colors).map(([key, color]) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="color"
                        value={color}
                        className="w-12 h-10 rounded border border-gray-300"
                      />
                      <input
                        type="text"
                        value={color}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'typography' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Typographie</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Police</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                    <option>Inter</option>
                    <option>Roboto</option>
                    <option>Helvetica</option>
                    <option>Poppins</option>
                    <option>Arial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Taille</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                    <option value="small">Petite</option>
                    <option value="medium">Moyenne</option>
                    <option value="large">Grande</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Poids</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                    <option value="light">Léger</option>
                    <option value="normal">Normal</option>
                    <option value="bold">Gras</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mise en Page</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Espacement</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                    <option value="compact">Compact</option>
                    <option value="normal">Normal</option>
                    <option value="spacious">Spacieux</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bordures</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                    <option value="none">Aucune</option>
                    <option value="small">Petites</option>
                    <option value="medium">Moyennes</option>
                    <option value="large">Grandes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ombres</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                    <option value="none">Aucune</option>
                    <option value="subtle">Subtiles</option>
                    <option value="medium">Moyennes</option>
                    <option value="strong">Fortes</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'branding' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Branding</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo</label>
                  <div className="flex space-x-4">
                    <div className="w-24 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <PhotoIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">
                      Choisir un fichier
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Favicon</label>
                  <div className="flex space-x-4">
                    <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                      <PhotoIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">
                      Choisir un fichier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">CSS Personnalisé</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code CSS</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 font-mono text-sm"
                  rows={8}
                  placeholder="/* Votre CSS personnalisé ici */"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
              Sauvegarder
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal d'aperçu */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Aperçu du Thème"
        size="xl"
      >
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Aperçu: {selectedTheme?.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Voici un aperçu de votre thème appliqué
            </p>
          </div>
          
          {/* Aperçu des composants */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="text-lg font-semibold mb-2">Exemple de Carte</h4>
              <div className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
                <h5 className="font-medium mb-2">Titre de la carte</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ceci est un exemple de contenu dans votre thème.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Bouton Principal
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg">
                Bouton Secondaire
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdvancedTheming;
