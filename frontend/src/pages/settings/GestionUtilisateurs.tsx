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
import { PermissionManager, USER_ROLES, AVAILABLE_PERMISSIONS, UserPermission } from '@shared/utils/PermissionManager';
import { COMPANY_TYPES, ACCESS_LEVELS } from '@/types/CompanyTypes';
import { logAction, getLogsForUser, clearLogsForUser, ActivityLogEntry } from '@shared/utils/ActivityLog';
import Modal from '@shared/components/UI/Modal';
import Card from '@shared/components/UI/Card';
import { useApp } from '@core/context/AppContext';
import { usePermission } from '@shared/hooks/usePermission';
import { AdaptiveContentDisplay, AdaptiveContentGenerator } from '@shared/utils/AdaptiveContent';
import { useTranslation } from '@shared/hooks/useTranslation';

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
  const { t } = useTranslation();

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
      {/* En-tête Minimaliste */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-100 rounded-xl">
              <UserGroupIcon className="h-7 w-7 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t('users_mgmt.title')}</h1>
              <p className="text-slate-500 text-sm mt-0.5">{t('users_mgmt.subtitle')}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setIsRoleConfigOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center text-sm font-medium"
            >
              <ShieldCheckIcon className="h-5 w-5 mr-2 text-slate-400" />
              {t('users_mgmt.roles_config')}
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex-1 sm:flex-none bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors flex items-center justify-center text-sm font-medium shadow-sm"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              {t('users_mgmt.new_user')}
            </button>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-slate-600 text-sm leading-relaxed max-w-3xl">
            {t('users_mgmt.description')}
          </p>
        </div>
      </div>

      {/* Contenu Minimaliste */}


      {/* Statistiques */}
      {/* Statistiques Minimalistes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('users_mgmt.stats.total'), value: stats.total, icon: UserGroupIcon, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: t('users_mgmt.stats.active'), value: stats.actifs, icon: CheckCircleIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: t('users_mgmt.stats.inactive'), value: stats.inactifs, icon: XCircleIcon, color: 'text-slate-400', bg: 'bg-slate-50' },
          { label: t('users_mgmt.stats.suspended'), value: stats.suspendus, icon: ExclamationTriangleIcon, color: 'text-rose-600', bg: 'bg-rose-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres et recherche */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t('users_mgmt.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm"
              />
          </div>

            <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm"
            aria-label="Filtrer par rôle"
            >
              <option value="all">{t('users_mgmt.filter_role')}</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.nom}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm"
            aria-label="Filtrer par statut"
          >
            <option value="all">{t('users_mgmt.filter_status')}</option>
            <option value="actif">{t('users_mgmt.status.active')}</option>
            <option value="inactif">{t('users_mgmt.status.inactive')}</option>
            <option value="suspendu">{t('users_mgmt.status.suspended')}</option>
            </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterRole('all');
              setFilterStatus('all');
            }}
            className="px-4 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center text-sm font-medium"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            {t('users_mgmt.reset')}
          </button>
        </div>
      </Card>

      {/* Liste des utilisateurs */}
      <Card className="p-6">
        <div className="overflow-x-auto no-scrollbar">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  {t('users_mgmt.table.user')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  {t('users_mgmt.table.role')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  {t('users_mgmt.table.company')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  {t('users_mgmt.table.status')}
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  {t('users_mgmt.table.last_login')}
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                  {t('users_mgmt.table.actions')}
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
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                          <UserIcon className="h-5 w-5 text-slate-500" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-semibold text-slate-900">
                            {user.prenom} {user.nom}
                          </div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${roleInfo.couleur}`}>
                        {roleInfo.nom}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900">{user.entreprise}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{user.companyType} · {user.accessLevel}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${getStatusColor(user.statut)}`}>
                        {user.statut === 'actif' ? t('users_mgmt.status.active') : user.statut === 'suspendu' ? t('users_mgmt.status.suspended') : t('users_mgmt.status.inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {user.derniereConnexion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openLogs(user)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Journal d'activité"
                        >
                          <ClockIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Modifier"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id)}
                          className={`p-1.5 rounded-md transition-colors ${user.statut === 'actif' ? 'text-amber-400 hover:text-amber-600 hover:bg-amber-50' : 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                          title={user.statut === 'actif' ? 'Désactiver' : 'Activer'}
                        >
                          {user.statut === 'actif' ? <XCircleIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Supprimer"
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
        title={t('users_mgmt.modal_create.title')}
        size="lg"
      >
        <div className="space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <p className="text-sm text-slate-500 font-medium">{t('users_mgmt.modal_create.description')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                {t('users_mgmt.modal_create.fields.nom')} <span className="text-rose-500">*</span>
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
                    ? 'border-rose-300 bg-rose-50 focus:border-rose-500' 
                    : 'border-slate-200 bg-white focus:border-slate-900'
                } focus:outline-none`}
                placeholder="Nom"
              />
              {errors.nom && <p className="text-rose-600 text-[10px] font-bold mt-1 uppercase">{errors.nom}</p>}
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
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{t('users_mgmt.modal_create.permissions_title')}</h4>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Basées sur le rôle</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map(cat => (
                <div key={cat} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-50 pb-2">{categoryLabels[cat] || cat}</div>
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

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setErrors({});
              }}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors font-semibold text-sm"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleCreateUser}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center font-semibold text-sm shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                  {t('users_mgmt.modal_create.submitting')}
                </>
              ) : (
                <>
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  {t('users_mgmt.modal_create.submit')}
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
        title={t('users_mgmt.modal_roles.title')}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{t('users_mgmt.modal_roles.role_name')}</label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:border-slate-900 outline-none"
                placeholder="Ex: Expert-comptable"
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
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
                    >
                      {isCategoryFullySelected(cat) ? t('users_mgmt.modal_roles.uncheck_all') : t('users_mgmt.modal_roles.check_all')}
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
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-semibold"
            >
              {t('common.cancel')}
            </button>
            <div className="flex items-center space-x-3">
              <select
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value ? Number(e.target.value) : '')}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-900"
              >
                <option value="">{t('users_mgmt.modal_roles.assign_to')}</option>
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
                className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-semibold shadow-sm"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal Édition utilisateur */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('users_mgmt.modal_edit.title')}
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{t('users_mgmt.modal_create.fields.nom')}</label>
                <input
                  type="text"
                  value={selectedUser.nom}
                  onChange={(e) => setSelectedUser({ ...selectedUser, nom: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:border-slate-900 outline-none"
                  placeholder="Nom"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{t('users_mgmt.modal_create.fields.prenom')}</label>
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{t('users_mgmt.modal_create.fields.company')}</label>
                <select
                  value={selectedUser.entreprise}
                  onChange={(e) => {
                    const comp = ENTREPRISES.find(c => c.name === e.target.value) || ENTREPRISES[0];
                    const role = selectedUser.role;
                    const permissions = PermissionManager.getUserPermissions(role, comp.companyType, comp.accessLevel);
                    setSelectedUser({ ...selectedUser, entreprise: comp.name, companyType: comp.companyType, accessLevel: comp.accessLevel, permissions });
                  }}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:border-slate-900 outline-none"
                >
                  {ENTREPRISES.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{t('users_mgmt.modal_create.fields.role')}</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => {
                    const role = e.target.value;
                    const permissions = PermissionManager.getUserPermissions(role, selectedUser.companyType, selectedUser.accessLevel);
                    setSelectedUser({ ...selectedUser, role, permissions });
                  }}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:border-slate-900 outline-none"
                >
                  {getAvailableRolesFor(selectedUser.companyType, selectedUser.accessLevel).map(r => (
                    <option key={r.id} value={r.id}>{r.nom}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{t('users_mgmt.modal_create.fields.company_type')}</label>
                <select
                  value={selectedUser.companyType}
                  onChange={(e) => {
                    const companyType = e.target.value;
                    const permissions = PermissionManager.getUserPermissions(selectedUser.role, companyType, selectedUser.accessLevel);
                    setSelectedUser({ ...selectedUser, companyType, permissions });
                  }}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:border-slate-900 outline-none"
                >
                  {COMPANY_TYPES.map(ct => (
                    <option key={ct.id} value={ct.id}>{ct.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{t('users_mgmt.modal_create.fields.access_level')}</label>
                <select
                  value={selectedUser.accessLevel}
                  onChange={(e) => {
                    const accessLevel = e.target.value;
                    const permissions = PermissionManager.getUserPermissions(selectedUser.role, selectedUser.companyType, accessLevel);
                    setSelectedUser({ ...selectedUser, accessLevel, permissions });
                  }}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm focus:border-slate-900 outline-none"
                >
                  {ACCESS_LEVELS.map(al => (
                    <option key={al.id} value={al.id}>{al.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-tight">{t('users_mgmt.modal_create.permissions_title')}</h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actuellement {selectedUser.permissions.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(cat => (
                  <div key={cat} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-50 pb-2">{categoryLabels[cat] || cat}</div>
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
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-semibold">{t('common.cancel')}</button>
              <button
                onClick={() => {
                  if (!selectedUser) return;
                  setUsers(prev => prev.map(u => (u.id === selectedUser.id ? selectedUser : u)));
                  logAction({ userId: selectedUser.id, action: 'update', actor: 'admin', details: `Mise à jour du profil (${selectedUser.role})` });
                  setIsEditModalOpen(false);
                }}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-semibold shadow-sm"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Détails utilisateur */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={t('users_mgmt.modal_view.title')}
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 pb-6 border-b border-slate-100">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                <UserIcon className="h-8 w-8 text-slate-500" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedUser.prenom} {selectedUser.nom}
                </h3>
                <p className="text-slate-500">{selectedUser.email}</p>
                <span className={`mt-2 inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${getStatusColor(selectedUser.statut)}`}>
                  {selectedUser.statut === 'actif' ? t('users_mgmt.status.active') : selectedUser.statut === 'suspendu' ? t('users_mgmt.status.suspended') : t('users_mgmt.status.inactive')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('users_mgmt.modal_create.fields.telephone')}</label>
                  <p className="text-sm text-slate-900 font-semibold">{selectedUser.telephone}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('users_mgmt.modal_create.fields.role')}</label>
                  <p className="text-sm text-slate-900 font-semibold">{getRoleInfo(selectedUser.role).nom}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('users_mgmt.modal_create.fields.company')}</label>
                  <p className="text-sm text-slate-900 font-semibold">{selectedUser.entreprise} — {selectedUser.companyType.toUpperCase()} / {selectedUser.accessLevel}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date de création</label>
                  <p className="text-sm text-slate-900 font-semibold">{selectedUser.dateCreation}</p>
            </div>
            <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('users_mgmt.table.last_login')}</label>
                  <p className="text-sm text-slate-900 font-semibold">{selectedUser.derniereConnexion}</p>
            </div>
            <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('users_mgmt.modal_create.permissions_title')}</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedUser.permissions.map(permission => (
                      <span key={permission} className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-tight rounded-md border border-slate-200">
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
        title={t('users_mgmt.modal_logs.title')}
        size="lg"
      >
        <div className="space-y-4">
          {selectedUser && (
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="font-bold text-slate-900">{selectedUser.prenom} {selectedUser.nom}</div>
                <div className="text-xs text-slate-500 font-medium">{selectedUser.email}</div>
              </div>
              <button
                onClick={() => {
                  if (!selectedUser) return;
                  clearLogsForUser(selectedUser.id);
                  setLogs([]);
                }}
                className="px-3 py-1.5 text-xs bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors font-bold uppercase tracking-wider"
              >
                {t('users_mgmt.modal_logs.clear')}
              </button>
            </div>
          )}
          <div className="bg-slate-50 rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {logs.length === 0 ? (
              <div className="p-8 text-center">
                <ClockIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">{t('users_mgmt.modal_logs.empty')}</p>
              </div>
            ) : (
              logs.map(l => (
                <div key={l.id} className="p-4 flex items-start justify-between bg-white hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="text-sm">
                      <span className="font-bold text-slate-900 uppercase tracking-tight text-[10px] bg-slate-100 px-1.5 py-0.5 rounded mr-2">{l.action}</span>
                      <span className="text-slate-700 font-medium">{l.details || ''}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">{new Date(l.timestamp).toLocaleString()}</div>
                  </div>
                  {l.actor && <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">by {l.actor}</div>}
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
        title={t('users_mgmt.modal_delete.title')}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            {t('users_mgmt.modal_delete.confirm_text')} <strong>{selectedUser?.prenom} {selectedUser?.nom}</strong> ?
          </p>
          <p className="text-sm text-rose-600 font-medium">
            {t('users_mgmt.modal_delete.warning_text')}
          </p>
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-semibold"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={confirmDeleteUser}
              className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-semibold shadow-sm"
            >
              {t('common.delete')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GestionUtilisateurs;



