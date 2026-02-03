import React from 'react';
import {
  FunnelIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { FilterGroup, FilterCondition, reportFilterFields, operatorLabels } from '../../types/filters';

interface ActiveFiltersProps {
  filters: FilterGroup[];
  onRemoveFilter: (groupId: string, conditionId?: string) => void;
  onClearAll: () => void;
  onOpenAdvancedFilters: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filters,
  onRemoveFilter,
  onClearAll,
  onOpenAdvancedFilters
}) => {
  const getFieldLabel = (fieldId: string) => {
    const field = reportFilterFields.find(f => f.id === fieldId);
    return field?.nom || fieldId;
  };

  const getValueLabel = (condition: FilterCondition) => {
    const field = reportFilterFields.find(f => f.id === condition.field);
    
    if (!field) return String(condition.value);

    switch (field.type) {
      case 'select':
        const option = field.options?.find(opt => opt.value === condition.value);
        return option ? `${option.icon || ''} ${option.label}` : String(condition.value);
      
      case 'multiselect':
        if (Array.isArray(condition.value)) {
          return condition.value.map(val => {
            const option = field.options?.find(opt => opt.value === val);
            return option ? `${option.icon || ''} ${option.label}` : val;
          }).join(', ');
        }
        return String(condition.value);
      
      case 'boolean':
        return condition.value ? 'Oui' : 'Non';
      
      case 'date':
      case 'datetime':
        if (condition.value) {
          return new Date(condition.value).toLocaleDateString('fr-FR');
        }
        return String(condition.value);
      
      default:
        return String(condition.value);
    }
  };

  const getOperatorLabel = (operator: string) => {
    return operatorLabels[operator as keyof typeof operatorLabels] || operator;
  };

  if (filters.length === 0) {
    return (
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">Aucun filtre appliqué</span>
        </div>
        <button
          onClick={onOpenAdvancedFilters}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4" />
          <span>Filtres avancés</span>
        </button>
      </div>
    );
  }

  const totalConditions = filters.reduce((acc, group) => acc + group.conditions.length, 0);

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FunnelIcon className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-gray-900 dark:text-gray-100">
            Filtres actifs ({totalConditions} condition{totalConditions > 1 ? 's' : ''})
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenAdvancedFilters}
            className="px-3 py-2 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center space-x-2"
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            <span>Modifier</span>
          </button>
          <button
            onClick={onClearAll}
            className="px-3 py-2 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            Tout effacer
          </button>
        </div>
      </div>

      {/* Groupes de filtres */}
      <div className="space-y-3">
        {filters.map((group, groupIndex) => (
          <div key={group.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            {/* En-tête du groupe */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Groupe {groupIndex + 1}
                </span>
                <span className={`px-2 py-1 text-xs rounded ${
                  group.operator === 'AND'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                }`}>
                  {group.operator}
                </span>
              </div>
              <button
                onClick={() => onRemoveFilter(group.id)}
                className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Conditions du groupe */}
            <div className="space-y-2">
              {group.conditions.map((condition, conditionIndex) => (
                <div key={condition.id} className="flex items-center space-x-3">
                  {conditionIndex > 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {group.operator}
                    </div>
                  )}
                  
                  <div className="flex-1 flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {getFieldLabel(condition.field)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {getOperatorLabel(condition.operator)}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {getValueLabel(condition)}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => onRemoveFilter(group.id, condition.id)}
                    className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveFilters;
