import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  ShieldCheckIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { usePermission } from '@shared/hooks/usePermission';
import { ProtectedRoute } from '@shared/components/ProtectedRoute';
import { PermissionManager, USER_ROLES, AVAILABLE_PERMISSIONS } from '@shared/utils/PermissionManager';
import apiClient from '@/services/apiClient';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  permissions: string[];
}

interface UserFormData {
  id?: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  role_name: string;
  permissions: string[];
  is_active: boolean;
}

export const AdminRoleManagement: React.FC = () => {
  const { user } = usePermission();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    role_name: 'utilisateur',
    permissions: [],
    is_active: true
  });
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users/');
      setUsers(response.data as User[]);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async () => {
    if (!formData.username || !formData.email || !formData.role_name || (!editingUser && !formData.password)) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      if (editingUser) {
        const { password, ...updateData } = formData;
        await apiClient.put(`/users/${editingUser.id}`, updateData);
      } else {
        await apiClient.post('/users/', formData);
      }
      loadUsers();
      setShowUserForm(false);
      setEditingUser(null);
      resetForm();
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la sauvegarde');
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      role_name: 'utilisateur',
      permissions: [],
      is_active: true
    });
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await apiClient.put(`/users/${userId}`, { is_active: false });
      loadUsers();
      setShowDeleteConfirm(null);
    } catch (err) {
      setError('Erreur lors de la désactivation');
    }
  };

  const handleEditUser = (u: User) => {
    setEditingUser(u);
    setFormData({
      username: u.username,
      email: u.email,
      first_name: u.first_name,
      last_name: u.last_name,
      role_name: u.role,
      permissions: u.permissions || [],
      is_active: u.is_active
    });
    setShowUserForm(true);
  };

  const togglePermission = (permId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <ProtectedRoute requiredPermission="manage_users">
      <div className="min-h-screen bg-slate-50 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center">
            <ShieldCheckIcon className="h-10 w-10 mr-3 text-blue-600" />
            SuperAdmin : Gestion des Utilisateurs
          </h1>
          <button
            onClick={() => { resetForm(); setShowUserForm(true); }}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all font-bold"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Créer Nouvel Utilisateur</span>
          </button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center"><ExclamationTriangleIcon className="h-5 w-5 mr-2" />{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Liste Principale */}
          <div className={`${showUserForm ? 'lg:col-span-7' : 'lg:col-span-12'} transition-all`}>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 bg-slate-50 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Membres de l'organisation</h2>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">{users.length} Utilisateurs</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {users.map(u => (
                  <div key={u.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${u.is_active ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        {u.first_name[0]}{u.last_name[0]}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{u.first_name} {u.last_name}</h3>
                        <p className="text-sm text-slate-500">{u.email}</p>
                        <div className="mt-1 flex gap-2">
                          <span className="text-[10px] uppercase font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded tracking-tighter">{u.role}</span>
                          {u.permissions?.length > 0 && <span className="text-[10px] uppercase font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded tracking-tighter">+{u.permissions.length} perms détaillées</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditUser(u)} className="p-2 bg-white border border-slate-200 rounded-lg text-blue-600 hover:shadow-md"><PencilIcon className="h-4 w-4" /></button>
                      <button onClick={() => setShowDeleteConfirm(u.id)} className="p-2 bg-white border border-slate-200 rounded-lg text-red-600 hover:shadow-md"><TrashIcon className="h-4 w-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formulaire & Permissions Picker */}
          {showUserForm && (
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-xl border border-blue-100 flex flex-col h-full overflow-hidden">
                <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
                  <h2 className="font-bold text-lg">{editingUser ? 'Modifier Profil' : 'Nouveau Membre'}</h2>
                  <button onClick={() => setShowUserForm(false)} className="hover:bg-blue-700 p-1 rounded-lg"><XMarkIcon className="h-6 w-6" /></button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Informations Générales</p>
                    <div className="grid grid-cols-2 gap-4">
                      <input placeholder="Username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                      <input placeholder="Email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                      <input placeholder="Prénom" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                      <input placeholder="Nom" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    {!editingUser && <input type="password" placeholder="Mot de passe sécurisé" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />}

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Rôle Principal</label>
                      <select value={formData.role_name} onChange={e => setFormData({ ...formData, role_name: e.target.value })} className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-blue-500 appearance-none font-bold text-blue-600">
                        <option value="admin">Administrateur (Tout accès)</option>
                        <option value="manager">Manager (Opérationnel)</option>
                        <option value="comptable">Comptable (Finance)</option>
                        <option value="utilisateur">Employé (Standard)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-t pt-6">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Droits d'accès détaillés</p>
                      <span className="text-[10px] bg-slate-100 px-2 py-1 rounded-full">{formData.permissions.length} sélectionnées</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {AVAILABLE_PERMISSIONS.slice(0, 15).map(p => (
                        <label key={p.id} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${formData.permissions.includes(p.id) ? 'bg-blue-50 border-blue-300' : 'bg-slate-50 border-transparent hover:border-slate-300'}`}>
                          <input type="checkbox" checked={formData.permissions.includes(p.id)} onChange={() => togglePermission(p.id)} className="h-4 w-4 text-blue-600 rounded mr-3" />
                          <div>
                            <p className="text-sm font-bold text-slate-800">{p.name}</p>
                            <p className="text-[10px] text-slate-500 leading-tight">{p.description}</p>
                          </div>
                        </label>
                      ))}
                      <p className="text-center text-[10px] text-slate-400 italic">... et 30+ autres permissions disponibles</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t flex gap-4">
                  <button onClick={handleSaveUser} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">Enregistrer les Droits</button>
                  <button onClick={() => setShowUserForm(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100">Ignorer</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center space-y-6">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto"><TrashIcon className="h-8 w-8" /></div>
              <div>
                <h3 className="text-2xl font-black text-slate-900">Désactiver l'accès ?</h3>
                <p className="text-slate-500 text-sm mt-2">L'utilisateur ne pourra plus se connecter au système Dinarlytic.</p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => handleDeleteUser(showDeleteConfirm)} className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all">Confirmer</button>
                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200">Annuler</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default AdminRoleManagement;


