import React, { useState } from 'react';
import {
  BookmarkIcon,
  PlusIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
  ShareIcon,
  StarIcon,
  TagIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { SavedView, FilterGroup, defaultSavedViews } from '../../types/filters';
import Modal from '../UI/Modal';

interface SavedViewsManagerProps {
  savedViews: SavedView[];
  onLoadView: (view: SavedView) => void;
  onSaveView: (view: Omit<SavedView, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void;
  currentFilters: FilterGroup[];
}

const SavedViewsManager: React.FC<SavedViewsManagerProps> = ({
  savedViews,
  onLoadView,
  onSaveView,
  currentFilters
}) => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [editingView, setEditingView] = useState<SavedView | null>(null);
  const [newViewData, setNewViewData] = useState({
    nom: '',
    description: '',
    icone: '📋',
    couleur: 'blue',
    isPublic: false,
    tags: [] as string[]
  });

  const handleSaveView = () => {
    const viewData = {
      ...newViewData,
      filters: currentFilters,
      sortBy: 'derniereModification',
      sortOrder: 'desc' as const,
      createdBy: 'current-user',
      isDefault: false
    };
    
    onSaveView(viewData);
    setIsSaveModalOpen(false);
    setNewViewData({
      nom: '',
      description: '',
      icone: '📋',
      couleur: 'blue',
      isPublic: false,
      tags: []
    });
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      gray: 'bg-gray-500',
      indigo: 'bg-indigo-500'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Vues Sauvegardées ({savedViews.length})
        </h3>
        <button
          onClick={() => setIsSaveModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Sauvegarder la vue actuelle</span>
        </button>
      </div>

      {/* Liste des vues */}
      {savedViews.length === 0 ? (
        <div className="text-center py-12">
          <BookmarkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Aucune vue sauvegardée
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Créez des vues personnalisées pour accéder rapidement à vos filtres préférés
          </p>
          <button
            onClick={() => setIsSaveModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Créer la première vue
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedViews.map((view) => (
            <div
              key={view.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* En-tête de la vue */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getColorClasses(view.couleur)}`}></div>
                  <span className="text-2xl">{view.icone}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {view.isDefault && (
                    <StarIcon className="h-4 w-4 text-yellow-500" title="Vue par défaut" />
                  )}
                  {view.isPublic && (
                    <ShareIcon className="h-4 w-4 text-blue-500" title="Vue publique" />
                  )}
                </div>
              </div>

              {/* Nom et description */}
              <div className="mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {view.nom}
                </h4>
                {view.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {view.description}
                  </p>
                )}
              </div>

              {/* Statistiques */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  <span>{view.usageCount} utilisation{view.usageCount > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>Modifié le {formatDate(view.updatedAt)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <UserIcon className="h-4 w-4 mr-2" />
                  <span>par {view.createdBy}</span>
                </div>
              </div>

              {/* Tags */}
              {view.tags && view.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {view.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => onLoadView(view)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-1"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>Charger</span>
                </button>
                <button
                  onClick={() => {
                    setEditingView(view);
                    setNewViewData({
                      nom: view.nom,
                      description: view.description || '',
                      icone: view.icone,
                      couleur: view.couleur,
                      isPublic: view.isPublic || false,
                      tags: view.tags || []
                    });
                    setIsSaveModalOpen(true);
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                {!view.isDefault && (
                  <button
                    onClick={() => {
                      // Ici vous pourriez ajouter la logique de suppression
                      console.log('Supprimer la vue:', view.id);
                    }}
                    className="px-3 py-2 border border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 text-sm rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de sauvegarde */}
      <Modal
        isOpen={isSaveModalOpen}
        onClose={() => {
          setIsSaveModalOpen(false);
          setEditingView(null);
        }}
        title={editingView ? "Modifier la vue" : "Sauvegarder une nouvelle vue"}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom de la vue
            </label>
            <input
              type="text"
              value={newViewData.nom}
              onChange={(e) => setNewViewData({ ...newViewData, nom: e.target.value })}
              placeholder="Ex: Mes rapports favoris"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={newViewData.description}
              onChange={(e) => setNewViewData({ ...newViewData, description: e.target.value })}
              placeholder="Description optionnelle..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Icône
              </label>
              <select
                value={newViewData.icone}
                onChange={(e) => setNewViewData({ ...newViewData, icone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="📋">📋 Liste</option>
                <option value="✅">✅ Actifs</option>
                <option value="🔥">🔥 Populaires</option>
                <option value="🕒">🕒 Récents</option>
                <option value="🤖">🤖 IA</option>
                <option value="⭐">⭐ Favoris</option>
                <option value="📊">📊 Analytics</option>
                <option value="💰">💰 Financier</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Couleur
              </label>
              <select
                value={newViewData.couleur}
                onChange={(e) => setNewViewData({ ...newViewData, couleur: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="blue">Bleu</option>
                <option value="green">Vert</option>
                <option value="purple">Violet</option>
                <option value="orange">Orange</option>
                <option value="red">Rouge</option>
                <option value="yellow">Jaune</option>
                <option value="gray">Gris</option>
                <option value="indigo">Indigo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newViewData.isPublic}
                onChange={(e) => setNewViewData({ ...newViewData, isPublic: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Rendre cette vue publique (visible par tous les utilisateurs)
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setIsSaveModalOpen(false);
                setEditingView(null);
              }}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveView}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingView ? 'Modifier' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SavedViewsManager;
