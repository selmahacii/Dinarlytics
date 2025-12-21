import React, { useState } from 'react';
import {
  UserGroupIcon,
  PlusIcon,
  ShieldCheckIcon,
  KeyIcon,
  PencilIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const UtilisateursAcces: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState('tous');

  const utilisateurs = [
    {
      id: 1,
      nom: 'Ahmed Benali',
      email: 'ahmed.benali@dinarlytic.dz',
      telephone: '+213 555 123 456',
      role: 'Administrateur',
      entreprise: 'Dinarlytic SARL',
      statut: 'actif',
      derniereConnexion: '2025-04-09 14:23',
      droits: ['Tout', 'Gestion', 'Validation', 'Export'],
      avatar: 'AB'
    },
    {
      id: 2,
      nom: 'Fatima Khelil',
      email: 'fatima.khelil@dinarlytic.dz',
      telephone: '+213 555 234 567',
      role: 'Comptable',
      entreprise: 'Dinarlytic SARL',
      statut: 'actif',
      derniereConnexion: '2025-04-09 11:45',
      droits: ['Écritures', 'Consultation', 'Export'],
      avatar: 'FK'
    },
    {
      id: 3,
      nom: 'Omar Cherif',
      email: 'omar.cherif@dinarlytic.dz',
      telephone: '+213 555 345 678',
      role: 'Gestionnaire',
      entreprise: 'Dinarlytic Services SPA',
      statut: 'actif',
      derniereConnexion: '2025-04-08 16:30',
      droits: ['Consultation', 'Saisie'],
      avatar: 'OC'
    },
    {
      id: 4,
      nom: 'Samira Medjdoub',
      email: 'samira.m@dinarlytic.dz',
      telephone: '+213 555 456 789',
      role: 'Auditeur',
      entreprise: 'Groupe Dinarlytic',
      statut: 'actif',
      derniereConnexion: '2025-04-09 09:15',
      droits: ['Consultation', 'Export', 'Analyse'],
      avatar: 'SM'
    },
    {
      id: 5,
      nom: 'Karim Mansouri',
      email: 'karim.mansouri@dinarlytic.dz',
      telephone: '+213 555 567 890',
      role: 'Commercial',
      entreprise: 'Dinarlytic Trading EURL',
      statut: 'inactif',
      derniereConnexion: '2025-03-15 10:20',
      droits: ['Factures', 'Clients'],
      avatar: 'KM'
    }
  ];

  const roles = [
    { id: 'tous', nom: 'Tous les rôles', count: utilisateurs.length, color: 'slate' },
    { id: 'Administrateur', nom: 'Administrateurs', count: 1, color: 'red' },
    { id: 'Comptable', nom: 'Comptables', count: 1, color: 'emerald' },
    { id: 'Gestionnaire', nom: 'Gestionnaires', count: 1, color: 'cyan' },
    { id: 'Auditeur', nom: 'Auditeurs', count: 1, color: 'amber' },
    { id: 'Commercial', nom: 'Commerciaux', count: 1, color: 'slate' }
  ];

  const filteredUsers = selectedRole === 'tous' 
    ? utilisateurs 
    : utilisateurs.filter(u => u.role === selectedRole);

  const getRoleColor = (role: string) => {
    const colors: any = {
      'Administrateur': 'bg-red-100 text-red-700 border-red-300',
      'Comptable': 'bg-emerald-100 text-emerald-700 border-emerald-300',
      'Gestionnaire': 'bg-cyan-100 text-cyan-700 border-cyan-300',
      'Auditeur': 'bg-amber-100 text-amber-700 border-amber-300',
      'Commercial': 'bg-slate-100 text-slate-700 border-slate-300'
    };
    return colors[role] || 'bg-slate-100 text-slate-700 border-slate-300';
  };

  const getAvatarColor = (role: string) => {
    const colors: any = {
      'Administrateur': 'bg-red-500',
      'Comptable': 'bg-emerald-500',
      'Gestionnaire': 'bg-cyan-500',
      'Auditeur': 'bg-amber-500',
      'Commercial': 'bg-slate-500'
    };
    return colors[role] || 'bg-slate-500';
  };

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-100 rounded-lg">
              <UserGroupIcon className="h-8 w-8 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Utilisateurs & Accès</h1>
              <p className="text-slate-600">Gestion des utilisateurs et permissions</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
            <PlusIcon className="h-5 w-5 inline mr-2" />
            Nouvel Utilisateur
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Utilisateurs</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{utilisateurs.length}</p>
              <p className="text-xs text-slate-500 mt-1">Comptes créés</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Actifs</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {utilisateurs.filter(u => u.statut === 'actif').length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Utilisateurs actifs</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Rôles Définis</p>
              <p className="text-2xl font-bold text-cyan-600 mt-1">{roles.length - 1}</p>
              <p className="text-xs text-slate-500 mt-1">Niveaux d'accès</p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-lg">
              <ShieldCheckIcon className="h-6 w-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Connexions Aujourd'hui</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">4</p>
              <p className="text-xs text-slate-500 mt-1">Utilisateurs connectés</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <KeyIcon className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres par rôle */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                selectedRole === role.id
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {role.nom} ({role.count})
            </button>
          ))}
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Liste des Utilisateurs</h3>
        </div>
        <div className="divide-y divide-slate-200">
          {filteredUsers.map((user) => (
            <div key={user.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${getAvatarColor(user.role)} rounded-full flex items-center justify-center text-white font-bold`}>
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-base font-bold text-slate-900">{user.nom}</h4>
                      <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-lg border ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                      {user.statut === 'actif' ? (
                        <span className="inline-flex px-2 py-1 text-xs font-bold rounded bg-emerald-100 text-emerald-700">
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-bold rounded bg-slate-100 text-slate-700">
                          Inactif
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div className="flex items-center text-slate-600">
                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-slate-600">
                        <PhoneIcon className="h-4 w-4 mr-2" />
                        {user.telephone}
                      </div>
                      <div className="flex items-center text-slate-600">
                        <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                        {user.entreprise}
                      </div>
                      <div className="flex items-center text-slate-500 text-xs">
                        Dernière connexion: {user.derniereConnexion}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {user.droits.map((droit, i) => (
                        <span key={i} className="inline-flex px-2 py-1 text-xs font-medium rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          {droit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button type="button" aria-label="Gérer les permissions" className="p-2 bg-cyan-100 text-cyan-600 rounded-lg hover:bg-cyan-200 transition-colors">
                    <ShieldCheckIcon className="h-5 w-5" />
                  </button>
                  <button type="button" aria-label="Modifier l'utilisateur" className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button type="button" aria-label={user.statut === 'actif' ? 'Désactiver l\'utilisateur' : 'Activer l\'utilisateur'} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                    {user.statut === 'actif' ? (
                      <LockClosedIcon className="h-5 w-5" />
                    ) : (
                      <LockOpenIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Matrice des permissions */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Matrice des Permissions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Module</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">Admin</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">Comptable</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">Gestionnaire</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">Auditeur</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">Commercial</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {[
                { module: 'Journaux & Écritures', admin: true, comptable: true, gestionnaire: false, auditeur: true, commercial: false },
                { module: 'États & Rapports', admin: true, comptable: true, gestionnaire: true, auditeur: true, commercial: false },
                { module: 'Factures Clients', admin: true, comptable: true, gestionnaire: true, auditeur: true, commercial: true },
                { module: 'Consolidation', admin: true, comptable: true, gestionnaire: false, auditeur: true, commercial: false },
                { module: 'Gestion Utilisateurs', admin: true, comptable: false, gestionnaire: false, auditeur: false, commercial: false },
                { module: 'Fiscalité', admin: true, comptable: true, gestionnaire: false, auditeur: true, commercial: false }
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{row.module}</td>
                  <td className="px-6 py-4 text-center">
                    {row.admin ? (
                      <CheckCircleIcon className="h-5 w-5 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {row.comptable ? (
                      <CheckCircleIcon className="h-5 w-5 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {row.gestionnaire ? (
                      <CheckCircleIcon className="h-5 w-5 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {row.auditeur ? (
                      <CheckCircleIcon className="h-5 w-5 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {row.commercial ? (
                      <CheckCircleIcon className="h-5 w-5 text-emerald-600 mx-auto" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-slate-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="flex items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors shadow-sm">
          <PlusIcon className="h-5 w-5 text-emerald-600 mr-2" />
          <span className="text-sm font-semibold text-slate-700">Créer un Rôle</span>
        </button>
        <button className="flex items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors shadow-sm">
          <ShieldCheckIcon className="h-5 w-5 text-cyan-600 mr-2" />
          <span className="text-sm font-semibold text-slate-700">Gérer les Permissions</span>
        </button>
        <button className="flex items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors shadow-sm">
          <KeyIcon className="h-5 w-5 text-amber-600 mr-2" />
          <span className="text-sm font-semibold text-slate-700">Audit des Connexions</span>
        </button>
      </div>
    </div>
  );
};

export default UtilisateursAcces;


