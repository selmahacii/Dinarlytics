import React, { useState, useMemo } from 'react';
import { 
  BuildingOfficeIcon, 
  UsersIcon, 
  ShieldCheckIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { COMPANY_TYPES, ACCESS_LEVELS, COMPANY_SIZES, AVAILABLE_MODULES } from "@/types/CompanyTypes";
import Modal from '@shared/components/UI/Modal';
import Card from '@shared/components/UI/Card';
import CompanyWizard from '@shared/components/CompanyWizard';
import apiClient from '@/services/apiClient';
import { useEffect } from 'react';

interface Company {
  id: number;
  backendId: string;
  name: string;
  type: string;
  size: string;
  accessLevel: string;
  users: number;
  maxUsers: number;
  status: 'active' | 'suspended' | 'trial';
  createdAt: string;
  lastActivity: string;
  revenue: number;
  employees: number;
}

const GestionAcces: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const mapBackendCompany = (c: any, index: number): Company => ({
    id: index + 1,
    backendId: c.id,
    name: c.name || 'Société',
    type: 'sarl',
    size: 'small',
    accessLevel: 'small',
    users: 1,
    maxUsers: 5,
    status: c.is_active ? 'active' : 'suspended',
    createdAt: '',
    lastActivity: '',
    revenue: 0,
    employees: 0
  });

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<any[]>('/auth/companies');
        setCompanies((response.data || []).map(mapBackendCompany));
      } catch (err) {
        console.error("Failed to load access company list", err);
      } finally {
        setLoading(false);
      }
    };
    loadCompanyData();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSize, setFilterSize] = useState('all');
  const [filterAccess, setFilterAccess] = useState('all');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Filtrage des entreprises
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || company.type === filterType;
      const matchesSize = filterSize === 'all' || company.size === filterSize;
      const matchesAccess = filterAccess === 'all' || company.accessLevel === filterAccess;
      
      return matchesSearch && matchesType && matchesSize && matchesAccess;
    });
  }, [companies, searchTerm, filterType, filterSize, filterAccess]);

  // Statistiques
  const stats = useMemo(() => {
    const total = companies.length;
    const active = companies.filter(c => c.status === 'active').length;
    const trial = companies.filter(c => c.status === 'trial').length;
    const suspended = companies.filter(c => c.status === 'suspended').length;
    
    const totalRevenue = companies.reduce((sum, c) => sum + c.revenue, 0);
    const totalUsers = companies.reduce((sum, c) => sum + c.users, 0);
    
    return { total, active, trial, suspended, totalRevenue, totalUsers };
  }, [companies]);

  const getTypeInfo = (typeId: string) => {
    return COMPANY_TYPES.find(t => t.id === typeId) || COMPANY_TYPES[0];
  };

  const getSizeInfo = (sizeId: string) => {
    return COMPANY_SIZES.find(s => s.id === sizeId) || COMPANY_SIZES[0];
  };

  const getAccessInfo = (accessId: string) => {
    return ACCESS_LEVELS.find(a => a.id === accessId) || ACCESS_LEVELS[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircleIcon;
      case 'trial': return ClockIcon;
      case 'suspended': return XCircleIcon;
      default: return ExclamationTriangleIcon;
    }
  };

  const handleWizardComplete = async (config: any) => {
    try {
      const response = await apiClient.post('/auth/companies', {
        name: config.companyInfo.name
      });
      const newCompany: Company = {
        ...mapBackendCompany(response.data, companies.length),
        type: config.type,
        size: config.size,
        accessLevel: config.access,
        maxUsers: getAccessInfo(config.access).maxUsers,
        revenue: config.companyInfo.revenue || 0,
        employees: config.companyInfo.employees || 1
      };
      setCompanies([newCompany, ...companies]);
    } catch (err) {
      console.error('Failed to create company', err);
    }
  };

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsDetailModalOpen(true);
  };

  const handleSuspendCompany = async (company: Company) => {
    if (!confirm(`Suspendre l'accès de "${company.name}" ?`)) return;
    try {
      await apiClient.put(`/auth/companies/${company.backendId}`, { is_active: false });
      setCompanies(companies.map(c => c.id === company.id ? { ...c, status: 'suspended' as const } : c));
    } catch (err) {
      console.error('Failed to suspend company', err);
    }
  };

  const getUsagePercentage = (users: number, maxUsers: number) => {
    return Math.round((users / maxUsers) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Accès</h1>
          <p className="text-gray-600 mt-2">Gérez les accès différenciés selon le type et la taille d'entreprise</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
          <button
            onClick={() => setIsWizardOpen(true)}
            className="flex-1 sm:flex-none bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouvelle Entreprise
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Entreprises</p>
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
              <p className="text-sm font-medium text-gray-600">Actives</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <ClockIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Essai</p>
              <p className="text-2xl font-bold text-gray-900">{stats.trial}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-red-100">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Suspendues</p>
              <p className="text-2xl font-bold text-gray-900">{stats.suspended}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">CA Total</p>
              <p className="text-2xl font-bold text-gray-900">{(stats.totalRevenue / 1000000).toFixed(1)}M DA</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtres */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les types</option>
            {COMPANY_TYPES.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>

          <select
            value={filterSize}
            onChange={(e) => setFilterSize(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Toutes les tailles</option>
            {COMPANY_SIZES.map(size => (
              <option key={size.id} value={size.id}>{size.name}</option>
            ))}
          </select>

          <select
            value={filterAccess}
            onChange={(e) => setFilterAccess(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les accès</option>
            {ACCESS_LEVELS.map(access => (
              <option key={access.id} value={access.id}>{access.name}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setFilterSize('all');
              setFilterAccess('all');
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Réinitialiser
          </button>
        </div>
      </Card>

      {/* Liste des entreprises */}
      <Card className="p-6">
        <div className="overflow-x-auto no-scrollbar">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Entreprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Type & Taille
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Accès
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Utilisateurs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.map((company) => {
                const typeInfo = getTypeInfo(company.type);
                const sizeInfo = getSizeInfo(company.size);
                const accessInfo = getAccessInfo(company.accessLevel);
                const StatusIcon = getStatusIcon(company.status);
                const usagePercentage = getUsagePercentage(company.users, company.maxUsers);
                
                return (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{company.name}</div>
                          <div className="text-sm text-gray-500">
                            CA: {(company.revenue / 1000000).toFixed(1)}M DA
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{typeInfo.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{typeInfo.name}</div>
                          <div className="text-sm text-gray-500">{sizeInfo.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{accessInfo.name}</div>
                        <div className="text-sm text-gray-500">
                          {accessInfo.price.toLocaleString()} {accessInfo.currency}/mois
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {company.users} / {company.maxUsers}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`bg-blue-600 h-2 rounded-full`}
                            style={{ width: `${usagePercentage}%` }}
                          ></div>
                        </div>
                        <div className={`text-xs mt-1 ${getUsageColor(usagePercentage)}`}>
                          {usagePercentage}% utilisé
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(company.status)}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {company.status === 'active' ? 'Actif' :
                         company.status === 'trial' ? 'Essai' : 'Suspendu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewCompany(company)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {company.status !== 'suspended' && (
                          <button
                            onClick={() => handleSuspendCompany(company)}
                            className="text-red-600 hover:text-red-900"
                            title="Suspendre l'accès"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Détails entreprise */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Détails de l'Entreprise"
        size="lg"
      >
        {selectedCompany && (
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedCompany.name}</h3>
                <p className="text-gray-600">
                  {getTypeInfo(selectedCompany.type).fullName}
                </p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedCompany.status)}`}>
                  {selectedCompany.status === 'active' ? 'Actif' :
                   selectedCompany.status === 'trial' ? 'Essai' : 'Suspendu'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Type d'entreprise</label>
                  <p className="text-sm text-gray-900 flex items-center">
                    <span className="text-2xl mr-2">{getTypeInfo(selectedCompany.type).icon}</span>
                    {getTypeInfo(selectedCompany.type).name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Taille</label>
                  <p className="text-sm text-gray-900">{getSizeInfo(selectedCompany.size).name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Niveau d'accès</label>
                  <p className="text-sm text-gray-900">{getAccessInfo(selectedCompany.accessLevel).name}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Utilisateurs</label>
                  <p className="text-sm text-gray-900">
                    {selectedCompany.users} / {selectedCompany.maxUsers} utilisateurs
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Chiffre d'affaires</label>
                  <p className="text-sm text-gray-900">
                    {(selectedCompany.revenue / 1000000).toFixed(1)}M DA
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Employés</label>
                  <p className="text-sm text-gray-900">{selectedCompany.employees}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Modules inclus</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {getTypeInfo(selectedCompany.type).requiredModules.map((moduleId, index) => {
                  const module = AVAILABLE_MODULES[moduleId as keyof typeof AVAILABLE_MODULES];
                  return (
                    <div key={index} className="flex items-center text-sm">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                      {module?.name}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Assistant de configuration */}
      <CompanyWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onComplete={handleWizardComplete}
      />
    </div>
  );
};

export default GestionAcces;




