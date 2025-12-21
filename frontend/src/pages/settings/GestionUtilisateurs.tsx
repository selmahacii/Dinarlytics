import React, { useState, useMemo, useEffect } from 'react';
import { 
  UserPlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  ShieldCheckIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ArrowPathIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  KeyIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { PermissionManager, USER_ROLES, AVAILABLE_PERMISSIONS, UserPermission } from '../../utils/PermissionManager';
import { COMPANY_TYPES, ACCESS_LEVELS } from '../../types/CompanyTypes';
import { logAction, getLogsForUser, clearLogsForUser, ActivityLogEntry } from '../../utils/ActivityLog';
import Modal from '../../components/UI/Modal';
import Card from '../../components/UI/Card';
import { useApp } from '../../context/AppContext';
import { usePermission } from '../../hooks/usePermission';
import { AdaptiveContentDisplay, AdaptiveContentGenerator } from '../../utils/AdaptiveContent';

interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  statut: 'actif' | 'inactif' | 'suspendu';
  dateCreation: string;
  derniereConnexion: string;
  permissions: string[];
  entreprise: string;
  companyType: string;
  accessLevel: string;
  avatar?: string;
}

interface Role {
  id: string;
  nom: string;
  description: string;
  permissions: string[];
  couleur: string;
}

const ENTREPRISES = [
  { name: 'Dinarlytic SARL', companyType: 'sarl', accessLevel: 'professional' },
  { name: 'El Amel EURL', companyType: 'eurl', accessLevel: 'starter' },
  { name: 'Nord Holding SPA', companyType: 'spa', accessLevel: 'enterprise' }
];

const STORAGE_KEY_USERS = 'admin_users_v1';

const GestionUtilisateurs: React.FC = () => {
  const { user } = useApp();
  const { has } = usePermission();

  // Contexte pour le contenu adaptatif
  const contentContext = {
    user,
    segment: user?.segment || 'micro',
    companyType: user?.companyType || 'eurl',
    role: user?.role || 'utilisateur',
    hasPermission: has
  };

  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      nom: 'Benali',
      prenom: 'Ahmed',
      email: 'ahmed.benali@dinarlytic.dz',
      telephone: '+213 21 123 456',
      role: 'admin',
      statut: 'actif',
      dateCreation: '2024-01-15',
      derniereConnexion: '2024-09-22',
      permissions: PermissionManager.getUserPermissions('admin', 'sarl', 'professional'),
      entreprise: 'Dinarlytic SARL',
      companyType: 'sarl',
      accessLevel: 'professional'
    },
    {
      id: 2,
      nom: 'Kadri',
      prenom: 'Fatima',
      email: 'fatima.kadri@dinarlytic.dz',
      telephone: '+213 21 234 567',
      role: 'comptable',
      statut: 'actif',
      dateCreation: '2024-02-10',
      derniereConnexion: '2024-09-21',
      permissions: PermissionManager.getUserPermissions('comptable', 'sarl', 'professional'),
      entreprise: 'Dinarlytic SARL',
      companyType: 'sarl',
      accessLevel: 'professional'
    },
    {
      id: 3,
      nom: 'Mansouri',
      prenom: 'Omar',
      email: 'omar.mansouri@dinarlytic.dz',
      telephone: '+213 21 345 678',
      role: 'utilisateur',
      statut: 'inactif',
      dateCreation: '2024-03-05',
      derniereConnexion: '2024-09-15',
      permissions: PermissionManager.getUserPermissions('utilisateur', 'sarl', 'professional'),
      entreprise: 'Dinarlytic SARL',
      companyType: 'sarl',
      accessLevel: 'professional'
    },
    {
      id: 4,
      nom: 'Boumediene',
      prenom: 'Aicha',
      email: 'aicha.boumediene@dinarlytic.dz',
      telephone: '+213 21 456 789',
      role: 'manager',
      statut: 'actif',
      dateCreation: '2024-04-12',
      derniereConnexion: '2024-09-22',
      permissions: PermissionManager.getUserPermissions('manager', 'sarl', 'professional'),
      entreprise: 'Dinarlytic SARL',
      companyType: 'sarl',
      accessLevel: 'professional'
    },
    {
      id: 5,
      nom: 'Taleb',
      prenom: 'Karim',
      email: 'karim.taleb@dinarlytic.dz',
      telephone: '+213 21 567 890',
      role: 'auditeur',
      statut: 'suspendu',
      dateCreation: '2024-05-20',
      derniereConnexion: '2024-09-10',
      permissions: PermissionManager.getUserPermissions('auditeur', 'sarl', 'professional'),
      entreprise: 'Dinarlytic SARL',
      companyType: 'sarl',
      accessLevel: 'professional'
    }
  ]);

  const [roles] = useState<Role[]>([
    {
      id: 'admin',
      nom: 'Administrateur',
      description: 'Accès complet au système',
      permissions: ['read', 'write', 'delete', 'admin', 'audit'],
      couleur: 'bg-red-100 text-red-800'
    },
    {
      id: 'manager',
      nom: 'Manager',
      description: 'Gestion des équipes et validation',
      permissions: ['read', 'write', 'approve'],
      couleur: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'comptable',
      nom: 'Comptable',
      description: 'Gestion comptable et financière',
      permissions: ['read', 'write'],
      couleur: 'bg-green-100 text-green-800'
    },
    {
      id: 'auditeur',
      nom: 'Auditeur',
      description: 'Audit et contrôle',
      permissions: ['read', 'audit'],
      couleur: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'utilisateur',
      nom: 'Utilisateur',
      description: 'Accès de base en lecture',
      permissions: ['read'],
      couleur: 'bg-gray-100 text-gray-800'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRoleConfigOpen, setIsRoleConfigOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const [newUser, setNewUser] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    role: 'utilisateur',
    entreprise: ENTREPRISES[0].name,
    companyType: ENTREPRISES[0].companyType,
    accessLevel: ENTREPRISES[0].accessLevel,
    permissions: PermissionManager.getUserPermissions('utilisateur', ENTREPRISES[0].companyType, ENTREPRISES[0].accessLevel)
  });

  // Rôles personnalisés (persistés)
  type CustomRole = { id: string; nom: string; description?: string; permissions: string[]; couleur?: string };
  const STORAGE_KEY_CUSTOM_ROLES = 'custom_roles_v1';
  const [customRoles, setCustomRoles] = useState<CustomRole[]>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_CUSTOM_ROLES);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_CUSTOM_ROLES, JSON.stringify(customRoles));
    } catch { /* ignore */ }
  }, [customRoles]);

  // Injecter les rôles personnalisés dans la liste affichée
  useEffect(() => {
    if (customRoles.length) {
      const extras: Role[] = customRoles.map(cr => ({ id: cr.id, nom: cr.nom, description: cr.description || 'Rôle personnalisé', permissions: cr.permissions, couleur: cr.couleur || 'bg-amber-100 text-amber-800' }));
      // Fusion simple: ajouter uniquement ceux qui n'existent pas déjà
      extras.forEach(er => {
        if (!roles.find(r => r.id === er.id)) {
          (roles as Role[]).push(er);
        }
      });
    }
  }, [customRoles]);

  // Etat du formulaire de configuration de rôle
  const [roleName, setRoleName] = useState('');
  const [rolePerms, setRolePerms] = useState<string[]>([]);
  const [assignUserId, setAssignUserId] = useState<number | ''>('');
  const toggleRolePerm = (permId: string) => {
    setRolePerms(prev => prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]);
  };

  // Groupes de permissions par catégorie (clients, achats, facturation, etc.)
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, UserPermission[]> = {};
    AVAILABLE_PERMISSIONS.forEach(p => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    // Optionnel: tri alphabétique par catégorie et par nom
    Object.keys(groups).forEach(cat => {
      groups[cat] = groups[cat].slice().sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    });
    return groups;
  }, []);

  const categoryLabels: Record<string, string> = {
    clients: 'Gestion clients',
    achats: 'Gestion fournisseurs',
    facturation: 'Facturation',
    rapports: 'Rapports & Export',
    administration: 'Administration',
    comptabilite: 'Comptabilité',
    stocks: 'Stocks',
    paie: 'Paie',
    audit: 'Audit'
  };

  const isCategoryFullySelected = (cat: string) => {
    const list = groupedPermissions[cat] || [];
    if (!list.length) return false;
    return list.every(p => rolePerms.includes(p.id));
  };

  const toggleCategory = (cat: string) => {
    const list = groupedPermissions[cat] || [];
    const allIds = list.map(p => p.id);
    const allSelected = allIds.every(id => rolePerms.includes(id));
    if (allSelected) {
      setRolePerms(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setRolePerms(prev => Array.from(new Set([...prev, ...allIds])));
    }
  };

  // Charger/Sauvegarder les utilisateurs
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_USERS);
      if (raw) {
        const parsed = JSON.parse(raw) as User[];
        if (Array.isArray(parsed) && parsed.length) setUsers(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    } catch {
      // ignore
    }
  }, [users]);

  // Filtrage des utilisateurs
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.statut === filterStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  // Statistiques
  const stats = useMemo(() => {
    const total = users.length;
    const actifs = users.filter(u => u.statut === 'actif').length;
    const inactifs = users.filter(u => u.statut === 'inactif').length;
    const suspendus = users.filter(u => u.statut === 'suspendu').length;
    
    return { total, actifs, inactifs, suspendus };
  }, [users]);

  const handleCreateUser = async () => {
    setIsSubmitting(true);
    setErrors({});

    // Validation
    const newErrors: {[key: string]: string} = {};
    if (!newUser.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!newUser.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!newUser.email.trim()) newErrors.email = 'L\'email est requis';
    if (!newUser.telephone.trim()) newErrors.telephone = 'Le téléphone est requis';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Simulation de création
    setTimeout(() => {
      const computedPerms = PermissionManager.getUserPermissions(
        newUser.role,
        newUser.companyType,
        newUser.accessLevel
      );
      const user: User = {
        id: Date.now(),
        nom: newUser.nom,
        prenom: newUser.prenom,
        email: newUser.email,
        telephone: newUser.telephone,
        role: newUser.role,
        statut: 'actif',
        dateCreation: new Date().toISOString().split('T')[0],
        derniereConnexion: 'Jamais',
        permissions: newUser.permissions && newUser.permissions.length ? newUser.permissions : computedPerms,
        entreprise: newUser.entreprise,
        companyType: newUser.companyType,
        accessLevel: newUser.accessLevel
      };

      setUsers([user, ...users]);
      logAction({ userId: user.id, action: 'create', actor: 'admin', details: `Création de ${user.prenom} ${user.nom} (${user.role})` });
      setIsCreateModalOpen(false);
      setNewUser({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        role: 'utilisateur',
        entreprise: ENTREPRISES[0].name,
        companyType: ENTREPRISES[0].companyType,
        accessLevel: ENTREPRISES[0].accessLevel,
        permissions: PermissionManager.getUserPermissions('utilisateur', ENTREPRISES[0].companyType, ENTREPRISES[0].accessLevel)
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter(u => u.id !== selectedUser.id));
      logAction({ userId: selectedUser.id, action: 'delete', actor: 'admin', details: `Suppression de ${selectedUser.prenom} ${selectedUser.nom}` });
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  const toggleUserStatus = (userId: number) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        const newStatus: User['statut'] = user.statut === 'actif' ? 'inactif' : 'actif';
        const updated = { ...user, statut: newStatus };
        logAction({ userId, action: 'status-change', actor: 'admin', details: `Statut: ${user.statut} -> ${newStatus}` });
        return updated;
      }
      return user;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'inactif': return 'bg-gray-100 text-gray-800';
      case 'suspendu': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'actif': return CheckCircleIcon;
      case 'inactif': return XCircleIcon;
      case 'suspendu': return ExclamationTriangleIcon;
      default: return XCircleIcon;
    }
  };

  const getRoleInfo = (roleId: string) => {
    return roles.find(role => role.id === roleId) || roles[0];
  };

  // Aide: rôles disponibles selon type d'entreprise et niveau d'accès
  const getAvailableRolesFor = (companyType: string, accessLevel: string) => {
    const allowed = PermissionManager.getAvailableRoles(companyType, accessLevel);
    // map to local roles for display color; fallback if not found
    return allowed.map(r => ({ id: r.id, nom: r.name }));
  };

  const categories = Array.from(new Set(AVAILABLE_PERMISSIONS.map(p => p.category)));

  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);

  const openLogs = (user: User) => {
    setSelectedUser(user);
    setLogs(getLogsForUser(user.id));
    setIsLogsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec contenu adaptatif */}
      {(() => {
        const pageContent = AdaptiveContentGenerator.generatePageContent('gestion-utilisateurs', contentContext);
        return (
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white rounded-lg shadow-2xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <UserGroupIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{pageContent.title}</h1>
                  <p className="text-slate-200 text-sm mt-1">{pageContent.subtitle}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setIsRoleConfigOpen(true)}
                  className="px-4 py-2 border border-white/30 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center"
                >
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  Configuration des Rôles
                </button>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
                >
                  <UserPlusIcon className="h-5 w-5 mr-2" />
                  Nouvel Utilisateur
                </button>
              </div>
            </div>
            {/* Description adaptative */}
            <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
              <p className="text-slate-100 text-sm">{pageContent.description}</p>
            </div>
          </div>
        );
      })()}

      {/* Contenu adaptatif - Conseils et Insights */}
      <AdaptiveContentDisplay 
        pageId="gestion-utilisateurs" 
        context={contentContext}
        showTips={true}
        showInsights={true}
      />

      {/* En-tête original (caché maintenant) */}
      <div className="hidden flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 mt-2">Gérez les utilisateurs, rôles et permissions du système</p>
        </div>
        <div className="flex space-x-2">
          {/* Boutons déplacés dans l'en-tête adaptatif */}
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.actifs}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-gray-100">
              <XCircleIcon className="h-6 w-6 text-gray-600" />
                </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Inactifs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactifs}</p>
                </div>
              </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Suspendus</p>
              <p className="text-2xl font-bold text-gray-900">{stats.suspendus}</p>
            </div>
              </div>
            </Card>
      </div>

      {/* Filtres et recherche */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
          </div>

            <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Filtrer par rôle"
            >
              <option value="all">Tous les rôles</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.nom}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="suspendu">Suspendu</option>
            </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterRole('all');
              setFilterStatus('all');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Réinitialiser
          </button>
        </div>
      </Card>

      {/* Liste des utilisateurs */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const StatusIcon = getStatusIcon(user.statut);
                const roleInfo = getRoleInfo(user.role);
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.prenom} {user.nom}
                  </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleInfo.couleur}`}>
                        {roleInfo.nom}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex flex-col">
                        <span className="font-medium">{user.entreprise}</span>
                        <span className="text-xs text-gray-500">{user.companyType.toUpperCase()} · {user.accessLevel}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.statut)}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {user.statut.charAt(0).toUpperCase() + user.statut.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.derniereConnexion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir les détails"
                          aria-label="Voir les détails de l'utilisateur"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openLogs(user)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Journal d'activité"
                          aria-label="Voir le journal d'activité"
                        >
                          <ClockIcon className="h-4 w-4" />
                        </button>
                  <button
                    onClick={() => handleEditUser(user)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Modifier l'utilisateur"
                          aria-label="Modifier l'utilisateur"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={user.statut === 'actif' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                          title={user.statut === 'actif' ? 'Désactiver' : 'Activer'}
                          aria-label={user.statut === 'actif' ? 'Désactiver l’utilisateur' : 'Activer l’utilisateur'}
                        >
                          {user.statut === 'actif' ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                  </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer l'utilisateur"
                          aria-label="Supprimer l'utilisateur"
                        >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Création d'utilisateur */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setErrors({});
        }}
        title="Nouvel Utilisateur"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Créer un Utilisateur</h3>
            <p className="text-sm text-blue-700">Ajoutez un nouvel utilisateur au système</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newUser.nom}
                onChange={(e) => {
                  setNewUser({...newUser, nom: e.target.value});
                  if (errors.nom) setErrors({...errors, nom: ''});
                }}
                className={`w-full border rounded-lg px-4 py-3 text-sm transition-colors ${
                  errors.nom 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                } focus:outline-none`}
                placeholder="Nom de famille"
              />
              {errors.nom && <p className="text-red-600 text-xs font-medium mt-1">{errors.nom}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Prénom <span className="text-red-500">*</span>
              </label>
            <input
              type="text"
                value={newUser.prenom}
                onChange={(e) => {
                  setNewUser({...newUser, prenom: e.target.value});
                  if (errors.prenom) setErrors({...errors, prenom: ''});
                }}
                className={`w-full border rounded-lg px-4 py-3 text-sm transition-colors ${
                  errors.prenom 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                } focus:outline-none`}
                placeholder="Prénom"
              />
              {errors.prenom && <p className="text-red-600 text-xs font-medium mt-1">{errors.prenom}</p>}
          </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Email <span className="text-red-500">*</span>
              </label>
            <input
              type="email"
                value={newUser.email}
                onChange={(e) => {
                  setNewUser({...newUser, email: e.target.value});
                  if (errors.email) setErrors({...errors, email: ''});
                }}
                className={`w-full border rounded-lg px-4 py-3 text-sm transition-colors ${
                  errors.email 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                } focus:outline-none`}
                placeholder="email@exemple.dz"
              />
              {errors.email && <p className="text-red-600 text-xs font-medium mt-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={newUser.telephone}
                onChange={(e) => {
                  setNewUser({...newUser, telephone: e.target.value});
                  if (errors.telephone) setErrors({...errors, telephone: ''});
                }}
                className={`w-full border rounded-lg px-4 py-3 text-sm transition-colors ${
                  errors.telephone 
                    ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                    : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                } focus:outline-none`}
                placeholder="+213 21 123 456"
              />
              {errors.telephone && <p className="text-red-600 text-xs font-medium mt-1">{errors.telephone}</p>}
          </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Rôle</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser(prev => ({...prev, role: e.target.value, permissions: PermissionManager.getUserPermissions(e.target.value, prev.companyType, prev.accessLevel)}))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                aria-label="Rôle de l'utilisateur"
              >
                {getAvailableRolesFor(newUser.companyType, newUser.accessLevel).map(role => (
                  <option key={role.id} value={role.id}>{role.nom}</option>
                ))}
            </select>
              <p className="text-xs text-gray-500">Rôle et permissions de l'utilisateur</p>
          </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Entreprise</label>
              <select
                value={newUser.entreprise}
                onChange={(e) => {
                  const selected = ENTREPRISES.find(c => c.name === e.target.value) || ENTREPRISES[0];
                  const companyType = selected.companyType;
                  const accessLevel = selected.accessLevel;
                  const role = newUser.role;
                  const perms = PermissionManager.getUserPermissions(role, companyType, accessLevel);
                  setNewUser({
                    ...newUser,
                    entreprise: selected.name,
                    companyType,
                    accessLevel,
                    permissions: perms
                  });
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                aria-label="Entreprise d'affectation"
              >
                {ENTREPRISES.map(c => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500">Entreprise d'affectation</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Type d'entreprise</label>
              <select
                value={newUser.companyType}
                onChange={(e) => {
                  const companyType = e.target.value;
                  const perms = PermissionManager.getUserPermissions(newUser.role, companyType, newUser.accessLevel);
                  setNewUser({...newUser, companyType, permissions: perms});
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                aria-label="Type d'entreprise"
              >
                {COMPANY_TYPES.map(ct => (
                  <option key={ct.id} value={ct.id}>{ct.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500">Affecte les permissions disponibles</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Niveau d'accès</label>
              <select
                value={newUser.accessLevel}
                onChange={(e) => {
                  const accessLevel = e.target.value;
                  const perms = PermissionManager.getUserPermissions(newUser.role, newUser.companyType, accessLevel);
                  setNewUser({...newUser, accessLevel, permissions: perms});
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                aria-label="Niveau d'accès"
              >
                {ACCESS_LEVELS.map(al => (
                  <option key={al.id} value={al.id}>{al.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500">Starter / Professional / Enterprise</p>
            </div>
          </div>

          {/* Permissions granulaires */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900">Permissions</h4>
              <span className="text-xs text-gray-500">Basées sur le rôle, modifiables</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map(cat => (
                <div key={cat} className="border rounded-md p-3">
                  <div className="text-xs font-semibold text-gray-700 uppercase mb-2">{cat}</div>
                  <div className="space-y-2">
                    {AVAILABLE_PERMISSIONS.filter(p => p.category === cat && p.requiredFor.includes(newUser.companyType)).map(p => {
                      const checked = newUser.permissions.includes(p.id);
                      return (
                        <label key={p.id} className="flex items-start space-x-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? Array.from(new Set([...newUser.permissions, p.id]))
                                : newUser.permissions.filter(id => id !== p.id);
                              setNewUser({...newUser, permissions: updated});
                            }}
                            className="mt-1"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{p.name}</div>
                            <div className="text-xs text-gray-500">{p.description}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setErrors({});
              }}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateUser}
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center font-medium text-sm shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                  Création en cours...
                </>
              ) : (
                <>
                  <UserPlusIcon className="h-4 w-4 mr-2" />
              Créer l'Utilisateur
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Configuration des Rôles */}
      <Modal
        isOpen={isRoleConfigOpen}
        onClose={() => { setIsRoleConfigOpen(false); setRoleName(''); setRolePerms([]); setAssignUserId(''); }}
        title="Configuration des Rôles"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Nom du rôle</label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 text-sm"
                placeholder="Ex: Expert-comptable"
                aria-label="Nom du rôle"
              />
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold text-gray-900 mb-2">Permissions (regroupées)</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(groupedPermissions).map(cat => (
                <div key={cat} className="border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-gray-700 uppercase">
                      {categoryLabels[cat] || cat}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      aria-label={`Basculer ${categoryLabels[cat] || cat}`}
                    >
                      {isCategoryFullySelected(cat) ? 'Tout décocher' : 'Tout cocher'}
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {groupedPermissions[cat].map(p => (
                      <label key={p.id} className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          checked={rolePerms.includes(p.id)}
                          onChange={() => toggleRolePerm(p.id)}
                          className="mt-1 accent-blue-600"
                          aria-label={p.name}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{p.name}</div>
                          <div className="text-xs text-gray-500">{p.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <button
              onClick={() => { setIsRoleConfigOpen(false); setRoleName(''); setRolePerms([]); setAssignUserId(''); }}
              className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Annuler
            </button>
            <div className="flex items-center space-x-3">
              <select
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value ? Number(e.target.value) : '')}
                className="px-3 py-2 border rounded-md text-sm"
                aria-label="Assigner à un utilisateur"
              >
                <option value="">Assigner à un utilisateur…</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.prenom} {u.nom} — {u.email}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (!roleName.trim()) return;
                  const id = roleName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
                  const newRole: CustomRole = { id, nom: roleName.trim(), permissions: rolePerms, description: 'Rôle personnalisé', couleur: 'bg-amber-100 text-amber-800' };
                  setCustomRoles(prev => {
                    const exists = prev.some(r => r.id === id);
                    return exists ? prev.map(r => (r.id === id ? newRole : r)) : [newRole, ...prev];
                  });
                  // Ajout à la liste d'affichage des rôles
                  if (!roles.find(r => r.id === id)) {
                    (roles as Role[]).push({ id, nom: newRole.nom, description: newRole.description || '', permissions: newRole.permissions, couleur: newRole.couleur || 'bg-amber-100 text-amber-800' });
                  }

                  // Assigner au user sélectionné
                  if (assignUserId) {
                    setUsers(prev => prev.map(u => {
                      if (u.id === assignUserId) {
                        return { ...u, role: id, permissions: rolePerms.length ? rolePerms : u.permissions };
                      }
                      return u;
                    }));
                    logAction({ userId: assignUserId as number, action: 'permission-change', actor: 'admin', details: `Assignation du rôle ${roleName.trim()}` });
                  }

                  // Reset et fermer
                  setRoleName(''); setRolePerms([]); setAssignUserId(''); setIsRoleConfigOpen(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Édition utilisateur */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier l'Utilisateur"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Nom</label>
                <input
                  type="text"
                  value={selectedUser.nom}
                  onChange={(e) => setSelectedUser({ ...selectedUser, nom: e.target.value })}
                  className="w-full border rounded-lg px-4 py-3 text-sm"
                  placeholder="Nom de famille"
                  aria-label="Nom"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Prénom</label>
                <input
                  type="text"
                  value={selectedUser.prenom}
                  onChange={(e) => setSelectedUser({ ...selectedUser, prenom: e.target.value })}
                  className="w-full border rounded-lg px-4 py-3 text-sm"
                  placeholder="Prénom"
                  aria-label="Prénom"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  className="w-full border rounded-lg px-4 py-3 text-sm"
                  placeholder="email@exemple.dz"
                  aria-label="Email"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Téléphone</label>
                <input
                  type="tel"
                  value={selectedUser.telephone}
                  onChange={(e) => setSelectedUser({ ...selectedUser, telephone: e.target.value })}
                  className="w-full border rounded-lg px-4 py-3 text-sm"
                  placeholder="+213 21 123 456"
                  aria-label="Téléphone"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Entreprise</label>
                <select
                  value={selectedUser.entreprise}
                  onChange={(e) => {
                    const comp = ENTREPRISES.find(c => c.name === e.target.value) || ENTREPRISES[0];
                    const role = selectedUser.role;
                    const permissions = PermissionManager.getUserPermissions(role, comp.companyType, comp.accessLevel);
                    setSelectedUser({ ...selectedUser, entreprise: comp.name, companyType: comp.companyType, accessLevel: comp.accessLevel, permissions });
                  }}
                  className="w-full border rounded-lg px-4 py-3 text-sm"
                  aria-label="Entreprise d'affectation"
                >
                  {ENTREPRISES.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Rôle</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => {
                    const role = e.target.value;
                    const permissions = PermissionManager.getUserPermissions(role, selectedUser.companyType, selectedUser.accessLevel);
                    setSelectedUser({ ...selectedUser, role, permissions });
                  }}
                  className="w-full border rounded-lg px-4 py-3 text-sm"
                  aria-label="Rôle de l'utilisateur"
                >
                  {getAvailableRolesFor(selectedUser.companyType, selectedUser.accessLevel).map(r => (
                    <option key={r.id} value={r.id}>{r.nom}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Type d'entreprise</label>
                <select
                  value={selectedUser.companyType}
                  onChange={(e) => {
                    const companyType = e.target.value;
                    const permissions = PermissionManager.getUserPermissions(selectedUser.role, companyType, selectedUser.accessLevel);
                    setSelectedUser({ ...selectedUser, companyType, permissions });
                  }}
                  className="w-full border rounded-lg px-4 py-3 text-sm"
                  aria-label="Type d'entreprise"
                >
                  {COMPANY_TYPES.map(ct => (
                    <option key={ct.id} value={ct.id}>{ct.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Niveau d'accès</label>
                <select
                  value={selectedUser.accessLevel}
                  onChange={(e) => {
                    const accessLevel = e.target.value;
                    const permissions = PermissionManager.getUserPermissions(selectedUser.role, selectedUser.companyType, accessLevel);
                    setSelectedUser({ ...selectedUser, accessLevel, permissions });
                  }}
                  className="w-full border rounded-lg px-4 py-3 text-sm"
                  aria-label="Niveau d'accès"
                >
                  {ACCESS_LEVELS.map(al => (
                    <option key={al.id} value={al.id}>{al.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Permissions</h4>
                <span className="text-xs text-gray-500">Actuellement {selectedUser.permissions.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(cat => (
                  <div key={cat} className="border rounded-md p-3">
                    <div className="text-xs font-semibold text-gray-700 uppercase mb-2">{cat}</div>
                    <div className="space-y-2">
                      {AVAILABLE_PERMISSIONS.filter(p => p.category === cat && p.requiredFor.includes(selectedUser.companyType)).map(p => {
                        const checked = selectedUser.permissions.includes(p.id);
                        return (
                          <label key={p.id} className="flex items-start space-x-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? Array.from(new Set([...selectedUser.permissions, p.id]))
                                  : selectedUser.permissions.filter(id => id !== p.id);
                                setSelectedUser({ ...selectedUser, permissions: updated });
                              }}
                              className="mt-1"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{p.name}</div>
                              <div className="text-xs text-gray-500">{p.description}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-gray-100 rounded-md">Annuler</button>
              <button
                onClick={() => {
                  if (!selectedUser) return;
                  setUsers(prev => prev.map(u => (u.id === selectedUser.id ? selectedUser : u)));
                  logAction({ userId: selectedUser.id, action: 'update', actor: 'admin', details: `Mise à jour du profil (${selectedUser.role})` });
                  setIsEditModalOpen(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Détails utilisateur */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Détails de l'Utilisateur"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedUser.prenom} {selectedUser.nom}
                </h3>
                <p className="text-gray-600">{selectedUser.email}</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.statut)}`}>
                  {selectedUser.statut.charAt(0).toUpperCase() + selectedUser.statut.slice(1)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Téléphone</label>
                  <p className="text-sm text-gray-900">{selectedUser.telephone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Rôle</label>
                  <p className="text-sm text-gray-900">{getRoleInfo(selectedUser.role).nom}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Entreprise</label>
                  <p className="text-sm text-gray-900">{selectedUser.entreprise} — {selectedUser.companyType.toUpperCase()} / {selectedUser.accessLevel}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Date de création</label>
                  <p className="text-sm text-gray-900">{selectedUser.dateCreation}</p>
            </div>
            <div>
                  <label className="text-sm font-medium text-gray-500">Dernière connexion</label>
                  <p className="text-sm text-gray-900">{selectedUser.derniereConnexion}</p>
            </div>
            <div>
                  <label className="text-sm font-medium text-gray-500">Permissions</label>
                  <div className="flex flex-wrap gap-1">
                    {selectedUser.permissions.map(permission => (
                      <span key={permission} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
            </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Journal d'activité */}
      <Modal
        isOpen={isLogsModalOpen}
        onClose={() => setIsLogsModalOpen(false)}
        title="Journal d'activité"
        size="lg"
      >
        <div className="space-y-4">
          {selectedUser && (
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{selectedUser.prenom} {selectedUser.nom}</div>
                <div className="text-xs text-gray-500">{selectedUser.email}</div>
              </div>
              <button
                onClick={() => {
                  if (!selectedUser) return;
                  clearLogsForUser(selectedUser.id);
                  setLogs([]);
                }}
                className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Vider le journal
              </button>
            </div>
          )}
          <div className="border rounded-md divide-y">
            {logs.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">Aucun évènement pour l'instant.</div>
            ) : (
              logs.map(l => (
                <div key={l.id} className="p-3 flex items-start justify-between">
                  <div>
                    <div className="text-sm"><span className="font-medium">{l.action}</span> — {l.details || ''}</div>
                    <div className="text-xs text-gray-500">{new Date(l.timestamp).toLocaleString()}</div>
                  </div>
                  {l.actor && <div className="text-xs text-gray-500">par {l.actor}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Modal Confirmation suppression */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmer la suppression"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUser?.prenom} {selectedUser?.nom}</strong> ?
          </p>
          <p className="text-sm text-red-600">
            Cette action est irréversible et supprimera définitivement l'utilisateur du système.
          </p>
          <div className="flex justify-end space-x-4 pt-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={confirmDeleteUser}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GestionUtilisateurs;