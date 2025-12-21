import React, { useState, useCallback } from 'react';
import {
  EllipsisVerticalIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  EyeSlashIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { BaseWidgetProps } from '../../types/widgets';
import Card from '../UI/Card';

const BaseWidget: React.FC<BaseWidgetProps> = ({
  id,
  title,
  size,
  config,
  children,
  onUpdate,
  onRemove,
  className = ''
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (!config.refreshInterval) return;
    
    setIsRefreshing(true);
    try {
      // Simuler un refresh des données
      await new Promise(resolve => setTimeout(resolve, 1000));
      onUpdate?.(id, { refreshed: new Date().toISOString() });
    } finally {
      setIsRefreshing(false);
    }
  }, [id, config.refreshInterval, onUpdate]);

  const handleExport = useCallback(() => {
    // Logique d'export spécifique au widget
    console.log(`Exporting widget ${id}`);
  }, [id]);

  const handleRemove = useCallback(() => {
    onRemove?.(id);
  }, [id, onRemove]);

  const getSizeClasses = () => {
    const sizeMap = {
      small: 'col-span-1 row-span-1',
      medium: 'col-span-2 row-span-1',
      large: 'col-span-2 row-span-2',
      xlarge: 'col-span-4 row-span-2'
    };
    return sizeMap[size] || sizeMap.medium;
  };

  const getWidgetHeight = () => {
    const heightMap = {
      small: 'h-32',
      medium: 'h-40',
      large: 'h-64',
      xlarge: 'h-80'
    };
    return heightMap[size] || heightMap.medium;
  };

  return (
    <Card 
      className={`${getSizeClasses()} ${getWidgetHeight()} relative group transition-all duration-300 hover:shadow-lg ${className}`}
    >
      {/* Header du widget */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
            {title}
          </h3>
          {config.refreshInterval && (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Auto-refresh activé" />
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Bouton de refresh */}
          {config.refreshInterval && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
              title="Actualiser"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Bouton d'export */}
          {config.exportable && (
            <button
              onClick={handleExport}
              className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
              title="Exporter"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
            </button>
          )}

          {/* Menu d'options */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
              title="Options"
            >
              <EllipsisVerticalIcon className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50 min-w-48">
                {config.collapsible && (
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                  >
                    {isCollapsed ? (
                      <EyeIcon className="h-4 w-4" />
                    ) : (
                      <EyeSlashIcon className="h-4 w-4" />
                    )}
                    <span>{isCollapsed ? 'Afficher' : 'Masquer'}</span>
                  </button>
                )}
                
                {config.customizable && (
                  <button
                    onClick={() => {/* Ouvrir modal de configuration */}}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                  >
                    <Cog6ToothIcon className="h-4 w-4" />
                    <span>Configurer</span>
                  </button>
                )}

                <button
                  onClick={handleExport}
                  disabled={!config.exportable}
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  <span>Exporter</span>
                </button>

                <div className="border-t border-slate-200 dark:border-slate-700 my-1" />

                <button
                  onClick={handleRemove}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span>Supprimer</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu du widget */}
      <div className={`flex-1 overflow-hidden ${isCollapsed ? 'hidden' : ''}`}>
        {children}
      </div>

      {/* Overlay de chargement */}
      {isRefreshing && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-10">
          <div className="flex items-center space-x-2">
            <ArrowPathIcon className="h-5 w-5 animate-spin text-slate-600 dark:text-slate-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Actualisation...</span>
          </div>
        </div>
      )}

      {/* Indicateur de redimensionnement (si activé) */}
      {config.resizable && (
        <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowsPointingOutIcon className="h-3 w-3 text-slate-400" />
        </div>
      )}
    </Card>
  );
};

export default BaseWidget;

