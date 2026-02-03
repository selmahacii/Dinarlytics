import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  UserIcon,
  CogIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  SparklesIcon,
  BellIcon,
  ClockIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  AdjustmentsHorizontalIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  ListBulletIcon,
  HeartIcon,
  StarIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import GlassmorphismCard from '../Effects/GlassmorphismCard';

interface Widget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'alert' | 'text';
  title: string;
  content: any;
  size: 'small' | 'medium' | 'large' | 'xlarge';
  position: { x: number; y: number };
  isVisible: boolean;
  isPinned: boolean;
  isMinimized: boolean;
  priority: 'low' | 'medium' | 'high';
  lastUpdated: string;
  relevance: number; // Score de pertinence basé sur l'usage
}

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  preferences: {
    layout: 'grid' | 'list' | 'compact';
    theme: 'light' | 'dark' | 'auto';
    focusMode: boolean;
    notifications: boolean;
  };
}

interface AdaptiveDashboardProps {
  isVisible?: boolean;
  showGlassmorphism?: boolean;
}

const AdaptiveDashboard: React.FC<AdaptiveDashboardProps> = ({ 
  isVisible = true, 
  showGlassmorphism = true 
}) => {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [layout, setLayout] = useState<'grid' | 'list' | 'compact'>('grid');
  const [focusMode, setFocusMode] = useState(false);
  const [autoArrange, setAutoArrange] = useState(true);
  const [showHidden, setShowHidden] = useState(false);
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);

  // Rôles utilisateur de démonstration
  const userRoles: UserRole[] = [
    {
      id: 'admin',
      name: 'Administrateur',
      permissions: ['all'],
      preferences: {
        layout: 'grid',
        theme: 'auto',
        focusMode: false,
        notifications: true
      }
    },
    {
      id: 'manager',
      name: 'Manager',
      permissions: ['view', 'export', 'share'],
      preferences: {
        layout: 'grid',
        theme: 'light',
        focusMode: true,
        notifications: true
      }
    },
    {
      id: 'analyst',
      name: 'Analyste',
      permissions: ['view', 'edit', 'create'],
      preferences: {
        layout: 'list',
        theme: 'dark',
        focusMode: false,
        notifications: false
      }
    },
    {
      id: 'viewer',
      name: 'Consultant',
      permissions: ['view'],
      preferences: {
        layout: 'compact',
        theme: 'light',
        focusMode: true,
        notifications: false
      }
    }
  ];

  // Widgets de démonstration
  const demoWidgets: Widget[] = [
    {
      id: '1',
      type: 'kpi',
      title: 'Chiffre d\'Affaires',
      content: { value: '2,450,000 DZD', change: '+12.5%', trend: 'up' },
      size: 'medium',
      position: { x: 0, y: 0 },
      isVisible: true,
      isPinned: true,
      isMinimized: false,
      priority: 'high',
      lastUpdated: '2024-01-15 14:30',
      relevance: 95
    },
    {
      id: '2',
      type: 'kpi',
      title: 'Clients Actifs',
      content: { value: '1,247', change: '+8.3%', trend: 'up' },
      size: 'small',
      position: { x: 2, y: 0 },
      isVisible: true,
      isPinned: false,
      isMinimized: false,
      priority: 'high',
      lastUpdated: '2024-01-15 14:25',
      relevance: 88
    },
    {
      id: '3',
      type: 'chart',
      title: 'Évolution des Ventes',
      content: { type: 'line', data: [120, 135, 142, 158, 165, 172, 189] },
      size: 'large',
      position: { x: 0, y: 1 },
      isVisible: true,
      isPinned: false,
      isMinimized: false,
      priority: 'medium',
      lastUpdated: '2024-01-15 14:20',
      relevance: 82
    },
    {
      id: '4',
      type: 'table',
      title: 'Top 10 Clients',
      content: { 
        columns: ['Client', 'CA', 'Évolution'],
        rows: [
          ['Client A', '245,000 DZD', '+15.2%'],
          ['Client B', '198,000 DZD', '+8.7%'],
          ['Client C', '156,000 DZD', '+12.1%']
        ]
      },
      size: 'medium',
      position: { x: 3, y: 1 },
      isVisible: true,
      isPinned: false,
      isMinimized: false,
      priority: 'medium',
      lastUpdated: '2024-01-15 14:15',
      relevance: 75
    },
    {
      id: '5',
      type: 'alert',
      title: 'Alertes Critiques',
      content: { 
        alerts: [
          { type: 'warning', message: 'Seuil de stock atteint', time: '14:30' },
          { type: 'info', message: 'Nouveau client ajouté', time: '14:25' }
        ]
      },
      size: 'small',
      position: { x: 1, y: 0 },
      isVisible: true,
      isPinned: true,
      isMinimized: false,
      priority: 'high',
      lastUpdated: '2024-01-15 14:30',
      relevance: 90
    },
    {
      id: '6',
      type: 'kpi',
      title: 'Marge Brute',
      content: { value: '35.2%', change: '+2.1%', trend: 'up' },
      size: 'small',
      position: { x: 3, y: 0 },
      isVisible: false,
      isPinned: false,
      isMinimized: false,
      priority: 'low',
      lastUpdated: '2024-01-15 14:10',
      relevance: 45
    }
  ];

  useEffect(() => {
    setCurrentRole(userRoles[0]); // Admin par défaut
    setWidgets(demoWidgets);
  }, []);

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'small': return 'col-span-1 row-span-1';
      case 'medium': return 'col-span-2 row-span-1';
      case 'large': return 'col-span-3 row-span-2';
      case 'xlarge': return 'col-span-4 row-span-2';
      default: return 'col-span-1 row-span-1';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 80) return 'text-green-600 bg-green-100';
    if (relevance >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, isVisible: !widget.isVisible }
        : widget
    ));
  };

  const toggleWidgetPin = (widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, isPinned: !widget.isPinned }
        : widget
    ));
  };

  const toggleWidgetMinimize = (widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, isMinimized: !widget.isMinimized }
        : widget
    ));
  };

  const handleRoleChange = (roleId: string) => {
    const role = userRoles.find(r => r.id === roleId);
    if (role) {
      setCurrentRole(role);
      setLayout(role.preferences.layout);
      setFocusMode(role.preferences.focusMode);
      
      // Adapter les widgets selon le rôle
      setWidgets(prev => prev.map(widget => ({
        ...widget,
        isVisible: role.permissions.includes('all') || 
                  (role.permissions.includes('view') && widget.priority !== 'low') ||
                  widget.isPinned
      })));
    }
  };

  const handleAutoArrange = () => {
    if (autoArrange) {
      // Réorganiser automatiquement les widgets par pertinence
      const sortedWidgets = [...widgets].sort((a, b) => b.relevance - a.relevance);
      const arrangedWidgets = sortedWidgets.map((widget, index) => ({
        ...widget,
        position: { x: index % 4, y: Math.floor(index / 4) }
      }));
      setWidgets(arrangedWidgets);
    }
  };

  const visibleWidgets = widgets.filter(widget => 
    showHidden ? true : widget.isVisible
  );

  const pinnedWidgets = widgets.filter(widget => widget.isPinned);
  const regularWidgets = widgets.filter(widget => !widget.isPinned && widget.isVisible);

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles adaptatifs */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <AdjustmentsHorizontalIcon className="h-6 w-6 text-indigo-600" />
            <span>🎯 Tableaux de Bord Adaptatifs</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Interface qui s'adapte selon le rôle utilisateur avec widgets intelligents
          </p>
        </div>
        <div className="flex space-x-3">
          <select
            value={currentRole?.id || 'admin'}
            onChange={(e) => handleRoleChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            {userRoles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          
          <div className="flex space-x-1">
            <button
              onClick={() => setLayout('grid')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                layout === 'grid' 
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              <Squares2X2Icon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setLayout('list')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                layout === 'list' 
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              <ListBulletIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setLayout('compact')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                layout === 'compact' 
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              <ViewColumnsIcon className="h-4 w-4" />
            </button>
          </div>
          
          <button
            onClick={() => setFocusMode(!focusMode)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              focusMode 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            {focusMode ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            Focus
          </button>
          
          <button
            onClick={() => setAutoArrange(!autoArrange)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              autoArrange 
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            <SparklesIcon className="h-4 w-4" />
            Auto
          </button>
        </div>
      </div>

      {/* Informations sur le rôle actuel */}
      <div className={showGlassmorphism ? '' : ''}>
        {showGlassmorphism ? (
          <GlassmorphismCard intensity="medium" className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5 text-indigo-600" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Rôle: {currentRole?.name}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Permissions: {currentRole?.permissions.join(', ')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Layout: {layout}
                </div>
                {focusMode && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    🎯 Mode Focus
                  </span>
                )}
                {autoArrange && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    ✨ Auto-arrange
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{visibleWidgets.length} widgets visibles</span>
                <span>•</span>
                <span>{pinnedWidgets.length} épinglés</span>
              </div>
            </div>
          </GlassmorphismCard>
        ) : (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-5 w-5 text-indigo-600" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Rôle: {currentRole?.name}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Permissions: {currentRole?.permissions.join(', ')}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Layout: {layout}
                </div>
                {focusMode && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    🎯 Mode Focus
                  </span>
                )}
                {autoArrange && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                    ✨ Auto-arrange
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <span>{visibleWidgets.length} widgets visibles</span>
                <span>•</span>
                <span>{pinnedWidgets.length} épinglés</span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Widgets épinglés */}
      {pinnedWidgets.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <StarIcon className="h-5 w-5 text-yellow-500" />
            <span>📌 Widgets Épinglés</span>
          </h3>
          <div className={`grid gap-4 ${
            layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
            layout === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'
          }`}>
            {pinnedWidgets.map((widget) => (
              showGlassmorphism ? (
                <GlassmorphismCard 
                  key={widget.id} 
                  intensity="medium" 
                  className={`p-4 border-l-4 ${getPriorityColor(widget.priority)} ${
                    focusMode ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                        {widget.title}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRelevanceColor(widget.relevance)}`}>
                          {widget.relevance}%
                        </span>
                      </h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Mis à jour: {widget.lastUpdated}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => toggleWidgetMinimize(widget.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {widget.isMinimized ? <ArrowsPointingOutIcon className="h-4 w-4" /> : <ArrowsPointingInIcon className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => toggleWidgetPin(widget.id)}
                        className="p-1 text-yellow-400 hover:text-yellow-600"
                      >
                        <StarIcon className="h-4 w-4 fill-current" />
                      </button>
                    </div>
                  </div>
                  
                  {!widget.isMinimized && (
                    <div className="space-y-2">
                      {widget.type === 'kpi' && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {widget.content.value}
                          </div>
                          <div className={`text-sm ${
                            widget.content.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {widget.content.change}
                          </div>
                        </div>
                      )}
                      
                      {widget.type === 'alert' && (
                        <div className="space-y-1">
                          {widget.content.alerts.map((alert: any, index: number) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <BellIcon className="h-4 w-4 text-orange-500" />
                              <span className="text-gray-700 dark:text-gray-300">{alert.message}</span>
                              <span className="text-gray-500 text-xs">{alert.time}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </GlassmorphismCard>
              ) : (
                <Card 
                  key={widget.id} 
                  className={`p-4 border-l-4 ${getPriorityColor(widget.priority)} ${
                    focusMode ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                        {widget.title}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRelevanceColor(widget.relevance)}`}>
                          {widget.relevance}%
                        </span>
                      </h4>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Mis à jour: {widget.lastUpdated}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => toggleWidgetMinimize(widget.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {widget.isMinimized ? <ArrowsPointingOutIcon className="h-4 w-4" /> : <ArrowsPointingInIcon className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => toggleWidgetPin(widget.id)}
                        className="p-1 text-yellow-400 hover:text-yellow-600"
                      >
                        <StarIcon className="h-4 w-4 fill-current" />
                      </button>
                    </div>
                  </div>
                  
                  {!widget.isMinimized && (
                    <div className="space-y-2">
                      {widget.type === 'kpi' && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {widget.content.value}
                          </div>
                          <div className={`text-sm ${
                            widget.content.trend === 'up' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {widget.content.change}
                          </div>
                        </div>
                      )}
                      
                      {widget.type === 'alert' && (
                        <div className="space-y-1">
                          {widget.content.alerts.map((alert: any, index: number) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <BellIcon className="h-4 w-4 text-orange-500" />
                              <span className="text-gray-700 dark:text-gray-300">{alert.message}</span>
                              <span className="text-gray-500 text-xs">{alert.time}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              )
            ))}
          </div>
        </div>
      )}

      {/* Widgets réguliers */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <ChartBarIcon className="h-5 w-5 text-blue-500" />
            <span> Widgets Intelligents</span>
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowHidden(!showHidden)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                showHidden 
                  ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' 
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              }`}
            >
              {showHidden ? 'Masquer' : 'Afficher'} cachés
            </button>
            <button
              onClick={handleAutoArrange}
              className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium hover:bg-purple-200 transition-colors"
            >
              <SparklesIcon className="h-3 w-3 inline mr-1" />
              Réorganiser
            </button>
          </div>
        </div>
        
        <div className={`grid gap-4 ${
          layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' :
          layout === 'list' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'
        }`}>
          {regularWidgets.map((widget) => (
            showGlassmorphism ? (
              <GlassmorphismCard 
                key={widget.id} 
                intensity="medium" 
                className={`p-4 border-l-4 ${getPriorityColor(widget.priority)} ${
                  focusMode ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                      {widget.title}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRelevanceColor(widget.relevance)}`}>
                        {widget.relevance}%
                      </span>
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Mis à jour: {widget.lastUpdated}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => toggleWidgetVisibility(widget.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      {widget.isVisible ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => toggleWidgetMinimize(widget.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      {widget.isMinimized ? <ArrowsPointingOutIcon className="h-4 w-4" /> : <ArrowsPointingInIcon className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => toggleWidgetPin(widget.id)}
                      className="p-1 text-gray-400 hover:text-yellow-600"
                    >
                      <StarIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {!widget.isMinimized && (
                  <div className="space-y-2">
                    {widget.type === 'kpi' && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {widget.content.value}
                        </div>
                        <div className={`text-sm ${
                          widget.content.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {widget.content.change}
                        </div>
                      </div>
                    )}
                    
                    {widget.type === 'chart' && (
                      <div className="h-32 bg-gray-50 dark:bg-gray-800 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Graphique: {widget.content.type}</span>
                      </div>
                    )}
                    
                    {widget.type === 'table' && (
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Colonnes: {widget.content.columns.join(', ')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {widget.content.rows.length} lignes
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </GlassmorphismCard>
            ) : (
              <Card 
                key={widget.id} 
                className={`p-4 border-l-4 ${getPriorityColor(widget.priority)} ${
                  focusMode ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                      {widget.title}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRelevanceColor(widget.relevance)}`}>
                        {widget.relevance}%
                      </span>
                    </h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Mis à jour: {widget.lastUpdated}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => toggleWidgetVisibility(widget.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      {widget.isVisible ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => toggleWidgetMinimize(widget.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      {widget.isMinimized ? <ArrowsPointingOutIcon className="h-4 w-4" /> : <ArrowsPointingInIcon className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => toggleWidgetPin(widget.id)}
                      className="p-1 text-gray-400 hover:text-yellow-600"
                    >
                      <StarIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {!widget.isMinimized && (
                  <div className="space-y-2">
                    {widget.type === 'kpi' && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {widget.content.value}
                        </div>
                        <div className={`text-sm ${
                          widget.content.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {widget.content.change}
                        </div>
                      </div>
                    )}
                    
                    {widget.type === 'chart' && (
                      <div className="h-32 bg-gray-50 dark:bg-gray-800 rounded flex items-center justify-center">
                        <span className="text-gray-500 text-sm">Graphique: {widget.content.type}</span>
                      </div>
                    )}
                    
                    {widget.type === 'table' && (
                      <div className="space-y-1">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Colonnes: {widget.content.columns.join(', ')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {widget.content.rows.length} lignes
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdaptiveDashboard;
