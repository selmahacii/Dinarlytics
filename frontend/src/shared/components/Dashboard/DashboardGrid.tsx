import React, { useState, useCallback, useMemo } from 'react';
import {
  PlusIcon,
  Cog6ToothIcon,
  ArrowsPointingOutIcon,
  Squares2X2Icon,
  ViewColumnsIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { WidgetGridProps, DashboardWidget, WidgetSize, WidgetType } from '../../types/widgets';
import KPIWidget from './KPIWidget';
import ChartWidget from './ChartWidget';
import AIInsightWidget from './AIInsightWidget';
import AlertWidget from './AlertWidget';

const DashboardGrid: React.FC<WidgetGridProps> = ({
  widgets,
  onWidgetUpdate,
  onWidgetRemove,
  onLayoutChange,
  editable = true,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<{ row: number; col: number } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showHidden, setShowHidden] = useState(false);

  // Filtrer les widgets visibles
  const visibleWidgets = useMemo(() => {
    return widgets.filter(widget => showHidden || widget.visible);
  }, [widgets, showHidden]);

  // Trier les widgets par ordre et position
  const sortedWidgets = useMemo(() => {
    return [...visibleWidgets].sort((a, b) => {
      if (a.position.row !== b.position.row) {
        return a.position.row - b.position.row;
      }
      return a.position.col - b.position.col;
    });
  }, [visibleWidgets]);

  // Rendu du widget selon son type
  const renderWidget = useCallback((widget: DashboardWidget) => {
    const commonProps = {
      id: widget.id,
      title: widget.title,
      size: widget.size,
      position: widget.position,
      config: widget.config,
      data: widget.data,
      onUpdate: onWidgetUpdate,
      onRemove: onWidgetRemove,
      className: isEditing ? 'ring-2 ring-blue-300 ring-opacity-50' : ''
    };

    switch (widget.type) {
      case 'kpi':
        return <KPIWidget {...commonProps} data={widget.data} />;
      case 'chart':
        return <ChartWidget {...commonProps} data={widget.data} />;
      case 'ai-insight':
        return <AIInsightWidget {...commonProps} data={widget.data} />;
      case 'alert':
        return <AlertWidget {...commonProps} data={widget.data} />;
      default:
        return (
          <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">
              Widget type "{widget.type}" non supporté
            </p>
          </div>
        );
    }
  }, [onWidgetUpdate, onWidgetRemove, isEditing]);

  // Gestion du drag & drop
  const handleDragStart = useCallback((e: React.DragEvent, widgetId: string) => {
    if (!editable || !isEditing) return;
    setDraggedWidget(widgetId);
    e.dataTransfer.effectAllowed = 'move';
  }, [editable, isEditing]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetRow: number, targetCol: number) => {
    e.preventDefault();
    
    if (!draggedWidget) return;

    const updatedWidgets = widgets.map(widget => {
      if (widget.id === draggedWidget) {
        return {
          ...widget,
          position: { row: targetRow, col: targetCol }
        };
      }
      return widget;
    });

    onLayoutChange({
      id: 'current',
      name: 'Layout Actuel',
      widgets: updatedWidgets,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    setDraggedWidget(null);
    setHoveredPosition(null);
  }, [draggedWidget, widgets, onLayoutChange]);

  // Gestion de l'export
  const handleExport = useCallback(() => {
    const exportData = {
      layout: {
        widgets: widgets.map(w => ({
          id: w.id,
          title: w.title,
          type: w.type,
          size: w.size,
          position: w.position,
          config: w.config
        }))
      },
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-layout-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [widgets]);

  // Gestion du refresh global
  const handleRefreshAll = useCallback(() => {
    widgets.forEach(widget => {
      onWidgetUpdate({
        ...widget,
        data: { ...widget.data, refreshed: new Date().toISOString() }
      });
    });
  }, [widgets, onWidgetUpdate]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Barre d'outils */}
      {editable && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isEditing 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4 inline mr-2" />
                  {isEditing ? 'Terminer' : 'Éditer'}
                </button>
                
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                  title={`Basculer en vue ${viewMode === 'grid' ? 'liste' : 'grille'}`}
                >
                  {viewMode === 'grid' ? (
                    <ViewColumnsIcon className="h-5 w-5" />
                  ) : (
                    <Squares2X2Icon className="h-5 w-5" />
                  )}
                </button>
                
                <button
                  onClick={() => setShowHidden(!showHidden)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                  title={showHidden ? 'Masquer les widgets cachés' : 'Afficher les widgets cachés'}
                >
                  {showHidden ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {isEditing && (
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Glissez-déposez pour réorganiser les widgets
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefreshAll}
                className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                title="Actualiser tous les widgets"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleExport}
                className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                title="Exporter la configuration"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
              </button>
              
              <button
                className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                title="Configuration avancée"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grille des widgets */}
      <div 
        className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}
        onDragOver={handleDragOver}
      >
        {sortedWidgets.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <Squares2X2Icon className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Aucun widget visible
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {showHidden 
                ? 'Aucun widget n\'est configuré pour ce tableau de bord.' 
                : 'Tous les widgets sont masqués. Activez l\'affichage des widgets cachés pour les voir.'}
            </p>
            {editable && (
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <PlusIcon className="h-4 w-4 inline mr-2" />
                Ajouter un widget
              </button>
            )}
          </div>
        ) : (
          sortedWidgets.map((widget) => (
            <div
              key={widget.id}
              draggable={isEditing}
              onDragStart={(e) => handleDragStart(e, widget.id)}
              onDrop={(e) => handleDrop(e, widget.position.row, widget.position.col)}
              className={`transition-all duration-200 ${
                isEditing ? 'cursor-move' : ''
              } ${
                draggedWidget === widget.id ? 'opacity-50' : ''
              }`}
            >
              {renderWidget(widget)}
            </div>
          ))
        )}
      </div>

      {/* Indicateur de position pour le drag & drop */}
      {isEditing && hoveredPosition && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute bg-blue-500 bg-opacity-20 border-2 border-blue-500 rounded-lg animate-pulse" 
               style={{
                 left: `${hoveredPosition.col * 25}%`,
                 top: `${hoveredPosition.row * 200}px`,
                 width: '25%',
                 height: '200px'
               }}
          />
        </div>
      )}
    </div>
  );
};

export default DashboardGrid;

