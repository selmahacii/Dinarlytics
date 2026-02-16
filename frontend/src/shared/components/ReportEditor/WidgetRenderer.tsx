import React from 'react';
import { WidgetElement } from '@/types/reportEditor';
import {
  ChartBarIcon,
  TableCellsIcon,
  DocumentTextIcon,
  HashtagIcon
} from '@heroicons/react/24/outline';

interface WidgetRendererProps {
  element: WidgetElement;
  isPreviewMode: boolean;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ element, isPreviewMode }) => {
  const renderContent = () => {
    switch (element.type) {
      case 'graphique':
        return <GraphWidget element={element} isPreviewMode={isPreviewMode} />;
      case 'kpi':
        return <KPIWidget element={element} isPreviewMode={isPreviewMode} />;
      case 'tableau':
        return <TableWidget element={element} isPreviewMode={isPreviewMode} />;
      case 'texte':
        return <TextWidget element={element} isPreviewMode={isPreviewMode} />;
      default:
        return <div className="w-full h-full flex items-center justify-center text-gray-400">
          <span>Type non supporté</span>
        </div>;
    }
  };

  return (
    <div className="w-full h-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      {renderContent()}
    </div>
  );
};

// Composant pour les graphiques
const GraphWidget: React.FC<{ element: WidgetElement; isPreviewMode: boolean }> = ({ element, isPreviewMode }) => {
  const { config } = element;
  
  return (
    <div className="w-full h-full p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {config.titre || 'Graphique'}
        </h3>
        <ChartBarIcon className="h-4 w-4 text-gray-400" />
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-1">
            {config.typeGraphique === 'line' && '📈'}
            {config.typeGraphique === 'bar' && '📊'}
            {config.typeGraphique === 'pie' && '🥧'}
            {config.typeGraphique === 'doughnut' && '🍩'}
            {config.typeGraphique === 'area' && '📊'}
          </div>
          <div className="text-xs text-gray-500 capitalize">
            {config.typeGraphique || 'line'}
          </div>
          {config.donnees && (
            <div className="text-xs text-gray-400 mt-1">
              {config.donnees.length} points
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant pour les KPIs
const KPIWidget: React.FC<{ element: WidgetElement; isPreviewMode: boolean }> = ({ element, isPreviewMode }) => {
  const { config } = element;
  
  const getEvolutionColor = (evolution?: string) => {
    if (!evolution) return 'text-gray-500';
    if (evolution.startsWith('+')) return 'text-green-600';
    if (evolution.startsWith('-')) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className="w-full h-full p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {config.titre || 'KPI'}
        </h3>
        <HashtagIcon className="h-4 w-4 text-gray-400" />
      </div>
      
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 mb-1">
            {config.valeur || '0'} {config.unite && <span className="text-sm text-gray-500">{config.unite}</span>}
          </div>
          {config.evolution && (
            <div className={`text-xs ${getEvolutionColor(config.evolution)}`}>
              {config.evolution}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant pour les tableaux
const TableWidget: React.FC<{ element: WidgetElement; isPreviewMode: boolean }> = ({ element, isPreviewMode }) => {
  const { config } = element;
  
  return (
    <div className="w-full h-full p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {config.titre || 'Tableau'}
        </h3>
        <TableCellsIcon className="h-4 w-4 text-gray-400" />
      </div>
      
      <div className="flex-1 overflow-hidden">
        {config.colonnes && config.lignes ? (
          <div className="text-xs">
            <div className="grid grid-cols-3 gap-1 mb-1 font-medium text-gray-700">
              {config.colonnes.map((col, index) => (
                <div key={index} className="truncate">{col}</div>
              ))}
            </div>
            {config.lignes.slice(0, 3).map((ligne, index) => (
              <div key={index} className="grid grid-cols-3 gap-1 text-gray-600">
                {ligne.map((cell, cellIndex) => (
                  <div key={cellIndex} className="truncate">{cell}</div>
                ))}
              </div>
            ))}
            {config.lignes.length > 3 && (
              <div className="text-gray-400 text-center mt-1">
                +{config.lignes.length - 3} autres...
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-xs">Aucune donnée</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant pour le texte
const TextWidget: React.FC<{ element: WidgetElement; isPreviewMode: boolean }> = ({ element, isPreviewMode }) => {
  const { config } = element;
  
  const getAlignmentClass = (alignement?: string) => {
    switch (alignement) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  return (
    <div className="w-full h-full p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {config.titre || 'Texte'}
        </h3>
        <DocumentTextIcon className="h-4 w-4 text-gray-400" />
      </div>
      
      <div className={`flex-1 ${getAlignmentClass(config.alignement)}`}>
        <div className="text-xs text-gray-700 leading-relaxed">
          {config.contenu || 'Saisissez votre texte...'}
        </div>
      </div>
    </div>
  );
};

export default WidgetRenderer;


