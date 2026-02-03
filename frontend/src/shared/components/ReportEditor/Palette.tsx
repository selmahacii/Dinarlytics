import React from 'react';
import { PaletteElement } from '../../types/reportEditor';

interface PaletteProps {
  elements: PaletteElement[];
  onElementSelect: (element: PaletteElement) => void;
}

const Palette: React.FC<PaletteProps> = ({ elements, onElementSelect }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {/* Graphiques */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            📊 Graphiques
          </h3>
          <div className="space-y-2">
            {elements.filter(el => el.type === 'graphique').map((element) => (
              <PaletteItem
                key={element.id}
                element={element}
                onClick={() => onElementSelect(element)}
              />
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            📋 Indicateurs
          </h3>
          <div className="space-y-2">
            {elements.filter(el => el.type === 'kpi').map((element) => (
              <PaletteItem
                key={element.id}
                element={element}
                onClick={() => onElementSelect(element)}
              />
            ))}
          </div>
        </div>

        {/* Tableaux */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            📋 Tableaux
          </h3>
          <div className="space-y-2">
            {elements.filter(el => el.type === 'tableau').map((element) => (
              <PaletteItem
                key={element.id}
                element={element}
                onClick={() => onElementSelect(element)}
              />
            ))}
          </div>
        </div>

        {/* Texte */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            📝 Texte
          </h3>
          <div className="space-y-2">
            {elements.filter(el => el.type === 'texte').map((element) => (
              <PaletteItem
                key={element.id}
                element={element}
                onClick={() => onElementSelect(element)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface PaletteItemProps {
  element: PaletteElement;
  onClick: () => void;
}

const PaletteItem: React.FC<PaletteItemProps> = ({ element, onClick }) => {
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      green: 'bg-green-50 border-green-200 hover:bg-green-100',
      purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      gray: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
      indigo: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
      slate: 'bg-slate-50 border-slate-200 hover:bg-slate-100'
    };
    return colorMap[color] || 'bg-gray-50 border-gray-200 hover:bg-gray-100';
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-3 rounded-lg border-2 border-dashed transition-all duration-200 ${getColorClasses(element.couleur)} group`}
    >
      <div className="flex items-center space-x-3">
        <div className="text-2xl">{element.icone}</div>
        <div className="text-left flex-1">
          <div className="font-medium text-gray-900 group-hover:text-gray-700">
            {element.nom}
          </div>
          <div className="text-xs text-gray-600 group-hover:text-gray-500">
            {element.description}
          </div>
        </div>
      </div>
    </button>
  );
};

export default Palette;
