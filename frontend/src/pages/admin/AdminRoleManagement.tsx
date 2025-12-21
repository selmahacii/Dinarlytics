import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  ShieldCheckIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { usePermission } from '../../hooks/usePermission';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { PermissionManager, USER_ROLES, AVAILABLE_PERMISSIONS } from '../../utils/PermissionManager';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  company_id: string;
  created_at: string;
  status: 'active' | 'inactive';
}

interface UserFormData {
  id?: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

/**
 * Page d'administration pour gérer les rôles, utilisateurs et permissions
 */
export const AdminRoleManagement: React.FC = () => {
  const { user } = usePermission();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'utilisateur',
    status: 'active'
  });
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Charger les utilisateurs
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // TODO: Récupérer depuis l'API
      setUsers([
        {
          id: '1',
          name: 'Jean Dupont',
          email: 'jean@example.com',
          role: 'comptable',
          company_id: '1',
          created_at: '2024-01-15',
          status: 'active'
        },
        {
          id: '2',
          name: 'Marie Martin',
          email: 'marie@example.com',
          role: 'admin',
          company_id: '1',
          created_at: '2024-01-10',
          status: 'active'
        },
        {
          id: '3',
          name: 'Pierre Bernard',
          email: 'pierre@example.com',
          role: 'vendeur',
          company_id: '1',
          created_at: '2024-02-01',
          status: 'active'
        }
      ]);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email || !formData.role) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      if (editingUser) {
        // Mise à jour
        setUsers(users.map(u =>
          u.id === editingUser.id
            ? { ...u, ...formData }
            : u
        ));
      } else {
        // Création
        const newUser: User = {
          id: Date.now().toString(),
          ...formData,
          company_id: (user as any)?.company_id || '1',
          created_at: new Date().toISOString().split('T')[0]
        };
        setUsers([...users, newUser]);
      }

      setShowUserForm(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'utilisateur', status: 'active' });
      setError(null);
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      setUsers(users.filter(u => u.id !== userId));
      setShowDeleteConfirm(null);
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setShowUserForm(true);
  };

  const handleCancelForm = () => {
    setShowUserForm(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', role: 'utilisateur', status: 'active' });
  };

  const getRoleInfo = (roleId: string) => {
    return PermissionManager.getRoleInfo(roleId);
  };

  const getRolePermissions = (roleId: string) => {
    const role = USER_ROLES.find(r => r.id === roleId);
    return role?.permissions || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-slate-50 p-6 space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center">
              <ShieldCheckIcon className="h-10 w-10 mr-3 text-blue-600" />
              Gestion des Rôles et Droits
            </h1>
            <p className="text-slate-600 mt-2">
              Gérez les utilisateurs, rôles et permissions de votre système
            </p>
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              setFormData({ name: '', email: '', role: 'utilisateur', status: 'active' });
              setShowUserForm(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nouvel Utilisateur</span>
          </button>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Section Utilisateurs */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                <UserGroupIcon className="h-6 w-6 mr-2 text-blue-600" />
                Utilisateurs
              </h2>

              {/* Formulaire d'ajout/édition */}
              {showUserForm && (
                <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
                  <h3 className="font-semibold text-slate-900">
                    {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un nouvel utilisateur'}
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nom"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      title="Sélectionner un rôle"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {USER_ROLES.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name} - {role.description}
                        </option>
                      ))}
                    </select>
                    <select
                      title="Sélectionner le statut"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Actif</option>
                      <option value="inactive">Inactif</option>
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveUser}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <CheckIcon className="h-4 w-4" />
                      <span>Enregistrer</span>
                    </button>
                    <button
                      onClick={handleCancelForm}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                      <span>Annuler</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Liste des utilisateurs */}
              <div className="space-y-2">
                {users.length === 0 ? (
                  <p className="text-slate-500 py-8 text-center">Aucun utilisateur</p>
                ) : (
                  users.map(u => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{u.name}</p>
                        <p className="text-sm text-slate-500">{u.email}</p>
                        <div className="mt-1 flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            u.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {u.status === 'active' ? 'Actif' : 'Inactif'}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                            {getRoleInfo(u.role)?.name || u.role}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditUser(u)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Éditer"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(u.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Section Rôles et Permissions */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Rôles Disponibles</h2>
              <div className="space-y-2">
                {USER_ROLES.map(role => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedRole === role.id
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-slate-50 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <p className="font-semibold text-slate-900">{role.name}</p>
                    <p className="text-xs text-slate-600">{role.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Détails du rôle sélectionné */}
            {selectedRole && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-3">
                  Permissions du rôle
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {getRolePermissions(selectedRole).map(permissionId => {
                    const permission = AVAILABLE_PERMISSIONS.find(p => p.id === permissionId);
                    return permission ? (
                      <div
                        key={permissionId}
                        className="p-2 bg-slate-50 rounded border border-slate-200 text-xs"
                      >
                        <p className="font-semibold text-slate-900">{permission.name}</p>
                        <p className="text-slate-600">{permission.description}</p>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de confirmation de suppression */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-auto space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Confirmer la suppression</h3>
              <p className="text-slate-600">
                Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default AdminRoleManagement;
