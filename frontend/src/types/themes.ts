// Types pour le système de thèmes

export interface Theme {
  id: string;
  nom: string;
  description: string;
  icone: string;
  couleur: string;
  mode: 'light' | 'dark' | 'auto';
  couleurs: ThemeColors;
}

export interface ThemeColors {
  // Couleurs principales
  primary: string;
  secondary: string;
  accent: string;
  
  // Couleurs de fond
  background: string;
  surface: string;
  surfaceVariant: string;
  
  // Couleurs de texte
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  
  // Couleurs d'état
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Couleurs de bordure
  border: string;
  borderVariant: string;
  
  // Couleurs d'interaction
  hover: string;
  active: string;
  focus: string;
}

// Thèmes prédéfinis
export const themes: Theme[] = [
  {
    id: 'slate-professional',
    nom: '🎨 Slate Professionnel',
    description: 'Palette moderne et élégante pour applications d\'entreprise',
    icone: '💼',
    couleur: 'slate',
    mode: 'light',
    couleurs: {
      primary: '#0f172a',      // Slate 900 - Couleur principale élégante
      secondary: '#334155',    // Slate 700 - Couleur secondaire
      accent: '#10b981',       // Emerald 500 - Accent moderne et premium
      background: '#ffffff',   // Blanc pur
      surface: '#f8fafc',      // Slate 50 - Surface douce
      surfaceVariant: '#f1f5f9', // Slate 100 - Variante de surface
      textPrimary: '#0f172a',  // Slate 900 - Texte principal
      textSecondary: '#475569', // Slate 600 - Texte secondaire
      textDisabled: '#94a3b8', // Slate 400 - Texte désactivé
      success: '#10b981',      // Emerald 500 - Succès
      warning: '#f59e0b',      // Amber 500 - Avertissement
      error: '#ef4444',        // Red 500 - Erreur
      info: '#3b82f6',         // Blue 500 - Information
      border: '#e2e8f0',       // Slate 200 - Bordure principale
      borderVariant: '#cbd5e1', // Slate 300 - Variante de bordure
      hover: '#f1f5f9',        // Slate 100 - Survol
      active: '#e2e8f0',       // Slate 200 - Actif
      focus: '#10b981'         // Emerald 500 - Focus
    }
  },
  {
    id: 'slate-professional-dark',
    nom: '🌙 Slate Professionnel Sombre',
    description: 'Version sombre élégante de la palette professionnelle',
    icone: '🌃',
    couleur: 'slate',
    mode: 'dark',
    couleurs: {
      primary: '#10b981',      // Emerald 500 - Primaire lumineux
      secondary: '#64748b',    // Slate 500 - Secondaire
      accent: '#34d399',       // Emerald 400 - Accent
      background: '#020617',   // Slate 950 - Fond très sombre
      surface: '#0f172a',      // Slate 900 - Surface
      surfaceVariant: '#1e293b', // Slate 800 - Variante de surface
      textPrimary: '#f8fafc',  // Slate 50 - Texte principal
      textSecondary: '#cbd5e1', // Slate 300 - Texte secondaire
      textDisabled: '#64748b', // Slate 500 - Texte désactivé
      success: '#10b981',      // Emerald 500 - Succès
      warning: '#f59e0b',      // Amber 500 - Avertissement
      error: '#ef4444',        // Red 500 - Erreur
      info: '#3b82f6',         // Blue 500 - Information
      border: '#1e293b',       // Slate 800 - Bordure
      borderVariant: '#334155', // Slate 700 - Variante de bordure
      hover: '#1e293b',        // Slate 800 - Survol
      active: '#334155',       // Slate 700 - Actif
      focus: '#10b981'         // Emerald 500 - Focus
    }
  },
  {
    id: 'light-default',
    nom: 'Clair Standard',
    description: 'Thème clair standard',
    icone: '☀️',
    couleur: 'blue',
    mode: 'light',
    couleurs: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#8b5cf6',
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
  },
  {
    id: 'dark-default',
    nom: 'Sombre Par Défaut',
    description: 'Thème sombre standard',
    icone: '🌙',
    couleur: 'purple',
    mode: 'dark',
    couleurs: {
      primary: '#3b82f6',
      secondary: '#64748b',
      accent: '#8b5cf6',
      background: '#0f172a',
      surface: '#1e293b',
      surfaceVariant: '#334155',
      textPrimary: '#f8fafc',
      textSecondary: '#cbd5e1',
      textDisabled: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      border: '#334155',
      borderVariant: '#475569',
      hover: '#334155',
      active: '#475569',
      focus: '#3b82f6'
    }
  },
  {
    id: 'dark-blue',
    nom: 'Sombre Bleu',
    description: 'Thème sombre avec accents bleus',
    icone: '🌊',
    couleur: 'blue',
    mode: 'dark',
    couleurs: {
      primary: '#0ea5e9',
      secondary: '#64748b',
      accent: '#06b6d4',
      background: '#0c1220',
      surface: '#1a2332',
      surfaceVariant: '#2a3441',
      textPrimary: '#f0f9ff',
      textSecondary: '#bae6fd',
      textDisabled: '#7dd3fc',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#0ea5e9',
      border: '#2a3441',
      borderVariant: '#3a4451',
      hover: '#2a3441',
      active: '#3a4451',
      focus: '#0ea5e9'
    }
  },
  {
    id: 'dark-green',
    nom: 'Sombre Vert',
    description: 'Thème sombre avec accents verts',
    icone: '🌿',
    couleur: 'green',
    mode: 'dark',
    couleurs: {
      primary: '#10b981',
      secondary: '#64748b',
      accent: '#059669',
      background: '#0c1a0f',
      surface: '#1a2e1f',
      surfaceVariant: '#2a3f2f',
      textPrimary: '#f0fdf4',
      textSecondary: '#bbf7d0',
      textDisabled: '#86efac',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#10b981',
      border: '#2a3f2f',
      borderVariant: '#3a4f3f',
      hover: '#2a3f2f',
      active: '#3a4f3f',
      focus: '#10b981'
    }
  },
  {
    id: 'dark-purple',
    nom: 'Sombre Violet',
    description: 'Thème sombre avec accents violets',
    icone: '💜',
    couleur: 'purple',
    mode: 'dark',
    couleurs: {
      primary: '#8b5cf6',
      secondary: '#64748b',
      accent: '#a855f7',
      background: '#1a0b2e',
      surface: '#2d1b4e',
      surfaceVariant: '#3d2b5e',
      textPrimary: '#faf5ff',
      textSecondary: '#e9d5ff',
      textDisabled: '#c4b5fd',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#8b5cf6',
      border: '#3d2b5e',
      borderVariant: '#4d3b6e',
      hover: '#3d2b5e',
      active: '#4d3b6e',
      focus: '#8b5cf6'
    }
  },
  {
    id: 'light-blue',
    nom: 'Clair Bleu',
    description: 'Thème clair avec accents bleus',
    icone: '💙',
    couleur: 'blue',
    mode: 'light',
    couleurs: {
      primary: '#0ea5e9',
      secondary: '#64748b',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f0f9ff',
      surfaceVariant: '#e0f2fe',
      textPrimary: '#0c4a6e',
      textSecondary: '#0369a1',
      textDisabled: '#7dd3fc',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#0ea5e9',
      border: '#e0f2fe',
      borderVariant: '#bae6fd',
      hover: '#e0f2fe',
      active: '#bae6fd',
      focus: '#0ea5e9'
    }
  },
  {
    id: 'light-green',
    nom: 'Clair Vert',
    description: 'Thème clair avec accents verts',
    icone: '💚',
    couleur: 'green',
    mode: 'light',
    couleurs: {
      primary: '#10b981',
      secondary: '#64748b',
      accent: '#059669',
      background: '#ffffff',
      surface: '#f0fdf4',
      surfaceVariant: '#dcfce7',
      textPrimary: '#14532d',
      textSecondary: '#166534',
      textDisabled: '#86efac',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#10b981',
      border: '#dcfce7',
      borderVariant: '#bbf7d0',
      hover: '#dcfce7',
      active: '#bbf7d0',
      focus: '#10b981'
    }
  },
  {
    id: 'auto',
    nom: 'Automatique',
    description: 'Suit les préférences système',
    icone: '🔄',
    couleur: 'gray',
    mode: 'auto',
    couleurs: {
      primary: '#2563eb',
      secondary: '#64748b',
      accent: '#8b5cf6',
      background: 'var(--theme-bg)',
      surface: 'var(--theme-surface)',
      surfaceVariant: 'var(--theme-surface-variant)',
      textPrimary: 'var(--theme-text-primary)',
      textSecondary: 'var(--theme-text-secondary)',
      textDisabled: 'var(--theme-text-disabled)',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
      border: 'var(--theme-border)',
      borderVariant: 'var(--theme-border-variant)',
      hover: 'var(--theme-hover)',
      active: 'var(--theme-active)',
      focus: '#3b82f6'
    }
  }
];

// Thème par défaut
export const defaultTheme = themes[0];
