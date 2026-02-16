import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FilterCondition, FilterField, reportFilterFields, getOperatorsForFieldType, operatorLabels } from '@/types/filters';

interface FilterConditionEditorProps {
  condition: FilterCondition;
  onUpdate: (updates: Partial<FilterCondition>) => void;
  onRemove: () => void;
}

const FilterConditionEditor: React.FC<FilterConditionEditorProps> = ({
  condition,
  onUpdate,
  onRemove
}) => {
  const [field, setField] = useState<FilterField | null>(null);
  const [operators, setOperators] = useState<string[]>([]);

  // Trouver le champ correspondant
  useEffect(() => {
    const foundField = reportFilterFields.find(f => f.id === condition.field);
    setField(foundField || null);
    
    if (foundField) {
      const availableOperators = getOperatorsForFieldType(foundField.type);
      setOperators(availableOperators);
      
      // Si l'opérateur actuel n'est pas valide pour ce champ, le changer
      if (!availableOperators.includes(condition.operator)) {
        onUpdate({ operator: availableOperators[0] });
      }
    }
  }, [condition.field, condition.operator, onUpdate]);

  // Rendu du champ de valeur selon le type
  const renderValueField = () => {
    if (!field) return null;

    switch (field.type) {
      case 'text':
      case 'autocomplete':
        return (
          <input
            type="text"
            value={condition.value || ''}
            onChange={(e) => onUpdate({ value: e.target.value })}
            placeholder={field.placeholder || 'Saisir une valeur...'}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={condition.value || ''}
            onChange={(e) => onUpdate({ value: e.target.value ? Number(e.target.value) : '' })}
            placeholder="Saisir un nombre..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={condition.value || ''}
            onChange={(e) => onUpdate({ value: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
        );

      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={condition.value || ''}
            onChange={(e) => onUpdate({ value: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
        );

      case 'select':
        return (
          <select
            value={condition.value || ''}
            onChange={(e) => onUpdate({ value: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">Sélectionner...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.icon && `${option.icon} `}{option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(condition.value) && condition.value.includes(option.value)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(condition.value) ? condition.value : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    onUpdate({ value: newValues });
                  }}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {option.icon && `${option.icon} `}{option.label}
                </span>
              </label>
            ))}
          </div>
        );

      case 'boolean':
        return (
          <select
            value={condition.value || ''}
            onChange={(e) => onUpdate({ value: e.target.value === 'true' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">Sélectionner...</option>
            <option value="true">Oui</option>
            <option value="false">Non</option>
          </select>
        );

      case 'range':
        if (condition.operator === 'between') {
          return (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={Array.isArray(condition.value) ? condition.value[0] || '' : ''}
                onChange={(e) => {
                  const currentValues = Array.isArray(condition.value) ? condition.value : ['', ''];
                  currentValues[0] = e.target.value;
                  onUpdate({ value: currentValues });
                }}
                placeholder="Min"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
              <span className="text-gray-500 dark:text-gray-400">et</span>
              <input
                type="number"
                value={Array.isArray(condition.value) ? condition.value[1] || '' : ''}
                onChange={(e) => {
                  const currentValues = Array.isArray(condition.value) ? condition.value : ['', ''];
                  currentValues[1] = e.target.value;
                  onUpdate({ value: currentValues });
                }}
                placeholder="Max"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          );
        }
        return (
          <input
            type="number"
            value={condition.value || ''}
            onChange={(e) => onUpdate({ value: e.target.value ? Number(e.target.value) : '' })}
            placeholder="Saisir une valeur..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
        );

      default:
        return (
          <input
            type="text"
            value={condition.value || ''}
            onChange={(e) => onUpdate({ value: e.target.value })}
            placeholder="Saisir une valeur..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
        );
    }
  };

  if (!field) return null;

  return (
    <div className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
      {/* Champ */}
      <div className="w-48">
        <select
          value={condition.field}
          onChange={(e) => onUpdate({ field: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
        >
          {reportFilterFields.map((f) => (
            <option key={f.id} value={f.id}>
              {f.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Opérateur */}
      <div className="w-40">
        <select
          value={condition.operator}
          onChange={(e) => onUpdate({ operator: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
        >
          {operators.map((op) => (
            <option key={op} value={op}>
              {operatorLabels[op as keyof typeof operatorLabels]}
            </option>
          ))}
        </select>
      </div>

      {/* Valeur */}
      <div className="flex-1">
        {renderValueField()}
      </div>

      {/* Bouton supprimer */}
      <button
        onClick={onRemove}
        className="p-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default FilterConditionEditor;


