import React, { useState, useCallback } from 'react';
import {
  FunnelIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  BookmarkIcon,
  EyeIcon,
  CogIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { FilterGroup, FilterCondition, FilterField, SavedView, reportFilterFields, defaultSavedViews, getOperatorsForFieldType, operatorLabels } from '@/types/filters';
import FilterConditionEditor from './FilterConditionEditor';
import SavedViewsManager from './SavedViewsManager';

interface AdvancedFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterGroup[]) => void;
  onSaveView: (view: Omit<SavedView, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void;
  currentFilters: FilterGroup[];
  savedViews: SavedView[];
  onLoadView: (view: SavedView) => void;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  onSaveView,
  currentFilters,
  savedViews,
  onLoadView
}) => {
  const [filters, setFilters] = useState<FilterGroup[]>(currentFilters);
  const [activeTab, setActiveTab] = useState<'filters' | 'views'>('filters');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Ajouter un nouveau groupe de filtres
  const addFilterGroup = useCallback(() => {
    const newGroup: FilterGroup = {
      id: `group-${Date.now()}`,
      conditions: [],
      operator: 'AND'
    };
    setFilters(prev => [...prev, newGroup]);
    setExpandedGroups(prev => new Set([...prev, newGroup.id]));
  }, []);

  // Supprimer un groupe de filtres
  const removeFilterGroup = useCallback((groupId: string) => {
    setFilters(prev => prev.filter(group => group.id !== groupId));
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      newSet.delete(groupId);
      return newSet;
    });
  }, []);

  // Ajouter une condition à un groupe
  const addCondition = useCallback((groupId: string) => {
    const newCondition: FilterCondition = {
      id: `condition-${Date.now()}`,
      field: reportFilterFields[0].id,
      operator: 'equals',
      value: ''
    };
    
    setFilters(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, conditions: [...group.conditions, newCondition] }
        : group
    ));
  }, []);

  // Supprimer une condition
  const removeCondition = useCallback((groupId: string, conditionId: string) => {
    setFilters(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, conditions: group.conditions.filter(c => c.id !== conditionId) }
        : group
    ));
  }, []);

  // Mettre à jour une condition
  const updateCondition = useCallback((groupId: string, conditionId: string, updates: Partial<FilterCondition>) => {
    setFilters(prev => prev.map(group => 
      group.id === groupId 
        ? { 
            ...group, 
            conditions: group.conditions.map(c => 
              c.id === conditionId ? { ...c, ...updates } : c
            )
          }
        : group
    ));
  }, []);

  // Basculer l'opérateur du groupe
  const toggleGroupOperator = useCallback((groupId: string) => {
    setFilters(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, operator: group.operator === 'AND' ? 'OR' : 'AND' }
        : group
    ));
  }, []);

  // Basculer l'expansion d'un groupe
  const toggleGroupExpansion = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  }, []);

  // Appliquer les filtres
  const handleApplyFilters = useCallback(() => {
    onApplyFilters(filters);
    onClose();
  }, [filters, onApplyFilters, onClose]);

  // Réinitialiser les filtres
  const handleResetFilters = useCallback(() => {
    setFilters([]);
  }, []);

  // Sauvegarder la vue actuelle
  const handleSaveView = useCallback((viewData: Omit<SavedView, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
    onSaveView(viewData);
  }, [onSaveView]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FunnelIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Filtres Avancés
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation par onglets */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('filters')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'filters'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <FunnelIcon className="h-4 w-4 inline mr-2" />
              Filtres
            </button>
            <button
              onClick={() => setActiveTab('views')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'views'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <BookmarkIcon className="h-4 w-4 inline mr-2" />
              Vues Sauvegardées
            </button>
          </nav>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'filters' && (
            <div className="space-y-6">
              {/* Actions rapides */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={addFilterGroup}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Nouveau Groupe</span>
                  </button>
                  
                  {filters.length > 0 && (
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {filters.length} groupe{filters.length > 1 ? 's' : ''} de filtres
                </div>
              </div>

              {/* Groupes de filtres */}
              {filters.length === 0 ? (
                <div className="text-center py-12">
                  <FunnelIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Aucun filtre appliqué
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Créez des groupes de filtres pour affiner vos résultats
                  </p>
                  <button
                    onClick={addFilterGroup}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Créer le premier groupe
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filters.map((group, groupIndex) => (
                    <div key={group.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                      {/* En-tête du groupe */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleGroupExpansion(group.id)}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            {expandedGroups.has(group.id) ? (
                              <ChevronUpIcon className="h-4 w-4" />
                            ) : (
                              <ChevronDownIcon className="h-4 w-4" />
                            )}
                          </button>
                          
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            Groupe {groupIndex + 1}
                          </span>
                          
                          <button
                            onClick={() => toggleGroupOperator(group.id)}
                            className={`px-2 py-1 text-xs rounded ${
                              group.operator === 'AND'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}
                          >
                            {group.operator}
                          </button>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {group.conditions.length} condition{group.conditions.length > 1 ? 's' : ''}
                          </span>
                          <button
                            onClick={() => removeFilterGroup(group.id)}
                            className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Conditions du groupe */}
                      {expandedGroups.has(group.id) && (
                        <div className="p-4 space-y-3">
                          {group.conditions.map((condition, conditionIndex) => (
                            <div key={condition.id} className="flex items-center space-x-3">
                              {conditionIndex > 0 && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                  {group.operator}
                                </div>
                              )}
                              
                              <div className="flex-1">
                                <FilterConditionEditor
                                  condition={condition}
                                  onUpdate={(updates) => updateCondition(group.id, condition.id, updates)}
                                  onRemove={() => removeCondition(group.id, condition.id)}
                                />
                              </div>
                            </div>
                          ))}
                          
                          <button
                            onClick={() => addCondition(group.id)}
                            className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <PlusIcon className="h-4 w-4 inline mr-2" />
                            Ajouter une condition
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'views' && (
            <SavedViewsManager
              savedViews={savedViews}
              onLoadView={onLoadView}
              onSaveView={handleSaveView}
              currentFilters={filters}
            />
          )}
        </div>

        {/* Pied de page */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filters.length > 0 ? `${filters.reduce((acc, group) => acc + group.conditions.length, 0)} condition${filters.reduce((acc, group) => acc + group.conditions.length, 0) > 1 ? 's' : ''} appliquée${filters.reduce((acc, group) => acc + group.conditions.length, 0) > 1 ? 's' : ''}` : 'Aucun filtre'}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500"
            >
              Annuler
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Appliquer les filtres
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;


