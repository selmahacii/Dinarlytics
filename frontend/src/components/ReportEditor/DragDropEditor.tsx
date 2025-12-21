import React, { useState, useCallback } from 'react';
import {
  PlusIcon,
  TrashIcon,
  CogIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { WidgetElement, WidgetConfig, PaletteElement, paletteElements } from '../../types/reportEditor';
import WidgetRenderer from './WidgetRenderer';
import Palette from './Palette';
import GridCanvas from './GridCanvas';

interface DragDropEditorProps {
  onSave: (elements: WidgetElement[]) => void;
  onCancel: () => void;
  initialElements?: WidgetElement[];
  title?: string;
}

const DragDropEditor: React.FC<DragDropEditorProps> = ({
  onSave,
  onCancel,
  initialElements = [],
  title = "Nouveau Rapport"
}) => {
  const [elements, setElements] = useState<WidgetElement[]>(initialElements);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [gridSize, setGridSize] = useState({ columns: 12, rows: 8 });

  // Ajouter un nouvel élément
  const addElement = useCallback((paletteElement: PaletteElement) => {
    const newElement: WidgetElement = {
      id: `element-${Date.now()}`,
      type: paletteElement.type,
      nom: paletteElement.nom,
      position: { x: 0, y: 0, w: 3, h: 2 },
      config: getDefaultConfig(paletteElement.type)
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
  }, []);

  // Supprimer un élément
  const removeElement = useCallback((elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
  }, [selectedElement]);

  // Mettre à jour la position d'un élément
  const updateElementPosition = useCallback((elementId: string, position: { x: number; y: number; w: number; h: number }) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, position } : el
    ));
  }, []);

  // Mettre à jour la configuration d'un élément
  const updateElementConfig = useCallback((elementId: string, config: Partial<WidgetConfig>) => {
    setElements(prev => prev.map(el => 
      el.id === elementId ? { ...el, config: { ...el.config, ...config } } : el
    ));
  }, []);

  // Dupliquer un élément
  const duplicateElement = useCallback((elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      const newElement: WidgetElement = {
        ...element,
        id: `element-${Date.now()}`,
        position: {
          ...element.position,
          x: element.position.x + 1,
          y: element.position.y + 1
        }
      };
      setElements(prev => [...prev, newElement]);
    }
  }, [elements]);

  // Configuration par défaut selon le type
  const getDefaultConfig = (type: WidgetElement['type']): WidgetConfig => {
    switch (type) {
      case 'graphique':
        return {
          titre: 'Nouveau Graphique',
          typeGraphique: 'line',
          donnees: [10, 20, 30, 40, 50]
        };
      case 'kpi':
        return {
          titre: 'Nouveau KPI',
          valeur: '0',
          unite: '',
          evolution: '+0%',
          couleurEvolution: 'gray'
        };
      case 'tableau':
        return {
          titre: 'Nouveau Tableau',
          colonnes: ['Colonne 1', 'Colonne 2'],
          lignes: [['Donnée 1', 'Donnée 2']]
        };
      case 'texte':
        return {
          titre: 'Nouveau Texte',
          contenu: 'Saisissez votre texte ici...',
          alignement: 'left'
        };
      default:
        return {};
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Palette d'éléments */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Éléments</h2>
          <p className="text-sm text-gray-600">Glissez-déposez pour créer</p>
        </div>
        
        <Palette 
          elements={paletteElements}
          onElementSelect={addElement}
        />
        
        <div className="p-4 border-t border-gray-200 mt-auto">
          <div className="space-y-2">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`w-full px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                isPreviewMode 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <EyeIcon className="h-4 w-4" />
              <span>{isPreviewMode ? 'Mode Édition' : 'Aperçu'}</span>
            </button>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSave(elements)}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-1"
              >
                <DocumentDuplicateIcon className="h-4 w-4" />
                <span>Sauver</span>
              </button>
              <button
                onClick={onCancel}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-1"
              >
                <span>Annuler</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Zone de travail principale */}
      <div className="flex-1 flex flex-col">
        {/* Barre d'outils */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Grille:</span>
                <select
                  value={`${gridSize.columns}x${gridSize.rows}`}
                  onChange={(e) => {
                    const [cols, rows] = e.target.value.split('x').map(Number);
                    setGridSize({ columns: cols, rows: rows });
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="12x8">12x8</option>
                  <option value="16x10">16x10</option>
                  <option value="20x12">20x12</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {elements.length} élément{elements.length > 1 ? 's' : ''}
              </span>
              {selectedElement && (
                <button
                  onClick={() => removeElement(selectedElement)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Supprimer l'élément sélectionné"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Canvas de la grille */}
        <div className="flex-1 overflow-auto p-6">
          <GridCanvas
            elements={elements}
            selectedElement={selectedElement}
            onElementSelect={setSelectedElement}
            onElementMove={updateElementPosition}
            onElementResize={updateElementPosition}
            gridSize={gridSize}
            isPreviewMode={isPreviewMode}
          />
        </div>
      </div>

      {/* Panneau de propriétés */}
      {selectedElement && !isPreviewMode && (
        <div className="w-80 bg-white border-l border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Propriétés</h3>
            <p className="text-sm text-gray-600">
              {elements.find(el => el.id === selectedElement)?.nom}
            </p>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Configuration spécifique selon le type d'élément */}
            {elements.find(el => el.id === selectedElement)?.type === 'kpi' && (
              <KPIConfigPanel
                element={elements.find(el => el.id === selectedElement)!}
                onConfigChange={(config) => updateElementConfig(selectedElement, config)}
              />
            )}
            
            {elements.find(el => el.id === selectedElement)?.type === 'graphique' && (
              <GraphConfigPanel
                element={elements.find(el => el.id === selectedElement)!}
                onConfigChange={(config) => updateElementConfig(selectedElement, config)}
              />
            )}
            
            {elements.find(el => el.id === selectedElement)?.type === 'texte' && (
              <TextConfigPanel
                element={elements.find(el => el.id === selectedElement)!}
                onConfigChange={(config) => updateElementConfig(selectedElement, config)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Composants de configuration spécifiques
const KPIConfigPanel: React.FC<{
  element: WidgetElement;
  onConfigChange: (config: Partial<WidgetConfig>) => void;
}> = ({ element, onConfigChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
        <input
          type="text"
          value={element.config.titre || ''}
          onChange={(e) => onConfigChange({ titre: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Valeur</label>
        <input
          type="text"
          value={element.config.valeur || ''}
          onChange={(e) => onConfigChange({ valeur: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Unité</label>
        <input
          type="text"
          value={element.config.unite || ''}
          onChange={(e) => onConfigChange({ unite: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Évolution</label>
        <input
          type="text"
          value={element.config.evolution || ''}
          onChange={(e) => onConfigChange({ evolution: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

const GraphConfigPanel: React.FC<{
  element: WidgetElement;
  onConfigChange: (config: Partial<WidgetConfig>) => void;
}> = ({ element, onConfigChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
        <input
          type="text"
          value={element.config.titre || ''}
          onChange={(e) => onConfigChange({ titre: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type de Graphique</label>
        <select
          value={element.config.typeGraphique || 'line'}
          onChange={(e) => onConfigChange({ typeGraphique: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="line">Linéaire</option>
          <option value="bar">Barres</option>
          <option value="pie">Circulaire</option>
          <option value="doughnut">Donut</option>
          <option value="area">Aire</option>
        </select>
      </div>
    </div>
  );
};

const TextConfigPanel: React.FC<{
  element: WidgetElement;
  onConfigChange: (config: Partial<WidgetConfig>) => void;
}> = ({ element, onConfigChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
        <input
          type="text"
          value={element.config.titre || ''}
          onChange={(e) => onConfigChange({ titre: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
        <textarea
          value={element.config.contenu || ''}
          onChange={(e) => onConfigChange({ contenu: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Alignement</label>
        <select
          value={element.config.alignement || 'left'}
          onChange={(e) => onConfigChange({ alignement: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="left">Gauche</option>
          <option value="center">Centre</option>
          <option value="right">Droite</option>
        </select>
      </div>
    </div>
  );
};

export default DragDropEditor;
