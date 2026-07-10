import React, { useState, useEffect } from 'react';
import { useTranslation } from '@shared/hooks/useTranslation';
import { 
  BuildingOfficeIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon, 
  ArrowPathIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ChartBarIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ClockIcon,
  SparklesIcon,
  KeyIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import { useApp } from '@core/context/AppContext';
import apiClient from '@/services/apiClient';

const GestionEntreprise: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency, currentDevise, setCurrentDevise, planComptable, setPlanComptable } = useApp();
  const [entreprises, setEntreprises] = useState<any[]>([]);
  const [selectedEntreprise, setSelectedEntreprise] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('list');
  const [selectedPermission, setSelectedPermission] = useState<any>(null);

  // États pour la création/édition d'entreprise
  const [newEntreprise, setNewEntreprise] = useState({
    nom: '',
    raisonSociale: '',
    siret: '',
    tvaNumber: '',
    adresse: '',
    ville: '',
    codePostal: '',
    pays: 'Algérie',
    telephone: '',
    email: '',
    siteWeb: '',
    devise: 'DZD',
    planComptable: 'algerien',
    logo: '',
    description: ''
  });

  // États pour la validation
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [devises, setDevises] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mapCompanyFromBackend = (c: any) => ({
    id: c.id,
    nom: c.name || '',
    raisonSociale: c.name || '',
    siret: c.registration_number || '',
    tvaNumber: c.tax_number || '',
    adresse: c.address || '',
    ville: '',
    codePostal: '',
    pays: c.country || 'Algérie',
    telephone: c.phone || '',
    email: c.email || '',
    siteWeb: c.website || '',
    devise: c.currency_code || 'DZD',
    planComptable: 'algerien',
    logo: '',
    description: '',
    isActive: c.is_active ?? true,
    parentCompanyId: c.parent_company_id || null,
    utilisateurs: 0,
    derniereActivite: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    const loadEntreprises = async () => {
      try {
        const response = await apiClient.get<any[]>('/auth/companies');
        setEntreprises((response.data || []).map(mapCompanyFromBackend));
      } catch (err) {
        console.error("Failed to load companies", err);
      }
    };
    loadEntreprises();
  }, []);

  const filteredEntreprises = entreprises.filter(entreprise =>
    entreprise.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entreprise.ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entreprise.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction de validation
  const validateEntreprise = () => {
    const newErrors: any = {};
    
    if (!newEntreprise.nom.trim()) {
      newErrors.nom = 'Le nom de l\'entreprise est requis';
    }
    
    if (!newEntreprise.raisonSociale.trim()) {
      newErrors.raisonSociale = 'La raison sociale est requise';
    }
    
    if (!newEntreprise.siret.trim()) {
      newErrors.siret = 'Le numéro SIRET est requis';
    } else if (!/^\d{14}$/.test(newEntreprise.siret.replace(/\s/g, ''))) {
      newErrors.siret = 'Le SIRET doit contenir 14 chiffres';
    }
    
    if (!newEntreprise.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEntreprise.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    if (!newEntreprise.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    }
    
    if (!newEntreprise.adresse.trim()) {
      newErrors.adresse = 'L\'adresse est requise';
    }
    
    if (!newEntreprise.ville.trim()) {
      newErrors.ville = 'La ville est requise';
    }
    
    if (!newEntreprise.codePostal.trim()) {
      newErrors.codePostal = 'Le code postal est requis';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateEntreprise = async () => {
    if (!validateEntreprise()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/auth/companies', {
        name: newEntreprise.nom,
        registration_number: newEntreprise.siret,
        tax_number: newEntreprise.tvaNumber,
        address: newEntreprise.adresse,
        phone: newEntreprise.telephone,
        email: newEntreprise.email,
        website: newEntreprise.siteWeb,
        currency_code: newEntreprise.devise,
        country: newEntreprise.pays
      });
      setEntreprises([mapCompanyFromBackend(response.data), ...entreprises]);
      setNewEntreprise({
        nom: '', raisonSociale: '', siret: '', tvaNumber: '', adresse: '', ville: '',
        codePostal: '', pays: 'Algérie', telephone: '', email: '', siteWeb: '',
        devise: 'DZD', planComptable: 'algerien', logo: '', description: ''
      });
      setErrors({});
      setIsCreateModalOpen(false);
    } catch (err: any) {
      setErrors({ submit: err?.response?.data?.detail || 'Erreur lors de la création' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditEntreprise = (entreprise: any) => {
    setSelectedEntreprise(entreprise);
    setNewEntreprise(entreprise);
    setIsEditModalOpen(true);
  };

  const handleUpdateEntreprise = async () => {
    if (!selectedEntreprise) return;
    try {
      const response = await apiClient.put(`/auth/companies/${selectedEntreprise.id}`, {
        name: newEntreprise.nom,
        registration_number: newEntreprise.siret,
        tax_number: newEntreprise.tvaNumber,
        address: newEntreprise.adresse,
        phone: newEntreprise.telephone,
        email: newEntreprise.email,
        website: newEntreprise.siteWeb,
        currency_code: newEntreprise.devise,
        country: newEntreprise.pays
      });
      const updated = mapCompanyFromBackend(response.data);
      setEntreprises(entreprises.map(e => e.id === selectedEntreprise.id ? updated : e));
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to update company', err);
    }
  };

  const handleSwitchEntreprise = (entreprise: any) => {
    setSelectedEntreprise(entreprise);
    setCurrentDevise(entreprise.devise);
    setPlanComptable(entreprise.planComptable);
    setIsSwitchModalOpen(false);
    alert(`Basculement vers ${entreprise.nom} - Devise: ${entreprise.devise} - Plan: ${entreprise.planComptable}`);
  };

  const handleToggleActive = async (entreprise: any) => {
    try {
      const response = await apiClient.put(`/auth/companies/${entreprise.id}`, { is_active: !entreprise.isActive });
      const updated = mapCompanyFromBackend(response.data);
      setEntreprises(entreprises.map(e => e.id === entreprise.id ? updated : e));
    } catch (err) {
      console.error('Failed to toggle company status', err);
    }
  };

  const handleUpdateCurrency = (code: string, taux: number) => {
    setDevises(devises.map(d => 
      d.code === code ? { ...d, taux } : d
    ));
  };

  const handleConfigurePermission = (permission: any) => {
    setSelectedPermission(permission);
    setIsPermissionModalOpen(true);
  };

  const handleTogglePermissionForEntreprise = (entrepriseId: number, permissionId: string) => {
    setEntreprises(entreprises.map(e => {
      if (e.id === entrepriseId) {
        const hasPermission = e.permissions.includes(permissionId);
        return {
          ...e,
          permissions: hasPermission 
            ? e.permissions.filter((p: string) => p !== permissionId)
            : [...e.permissions, permissionId]
        };
      }
      return e;
    }));
  };

  const getDeviseSymbol = (code: string) => {
    const devise = devises.find(d => d.code === code);
    return devise ? devise.symbole : code;
  };

  const getPlanComptableName = (plan: string) => {
    switch (plan) {
      case 'algerien': return 'PCA 2010 (Algérien)';
      case 'ifrs': return 'IFRS/GAAP';
      default: return plan;
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700' 
      : 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700';
  };

  const getDeviseColor = (code: string) => {
    switch (code) {
      case 'DZD': return 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600';
      case 'EUR': return 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700';
      case 'USD': return 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700';
      case 'MAD': return 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700';
      default: return 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">{t('settings.multi_company.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">{t('settings.multi_company.subtitle')}</p>
        </div>
        <div className="text-left sm:text-right bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">
            {currentTime.toLocaleTimeString('fr-FR')}
          </div>
          <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tight">
            {t('settings.multi_company.active_company', { name: entreprises.find(e => e.devise === currentDevise)?.nom || t('settings.multi_company.none') })}
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600">
          <div className="flex items-center">
            <div className="p-3 bg-slate-600 dark:bg-slate-700 rounded-lg">
              <BuildingOfficeIcon className="h-7 w-7 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('settings.multi_company.stats.total')}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{entreprises.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-700">
          <div className="flex items-center">
            <div className="p-3 bg-emerald-600 dark:bg-emerald-700 rounded-lg">
              <CheckCircleIcon className="h-7 w-7 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{t('settings.multi_company.stats.active')}</p>
              <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {entreprises.filter(e => e.isActive).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center">
            <div className="p-3 bg-blue-600 dark:bg-blue-700 rounded-lg">
              <UserGroupIcon className="h-7 w-7 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">{t('settings.multi_company.stats.users')}</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {entreprises.reduce((sum, e) => sum + e.utilisateurs, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700">
          <div className="flex items-center">
            <div className="p-3 bg-amber-600 dark:bg-amber-700 rounded-lg">
              <CurrencyDollarIcon className="h-7 w-7 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300">{t('settings.multi_company.stats.currencies')}</p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{devises.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Onglets */}
      <div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto no-scrollbar">
        <nav className="-mb-px flex space-x-8 min-w-max">
          {[
            { id: 'list', name: t('settings.multi_company.tabs.list'), icon: BuildingOfficeIcon },
            { id: 'currencies', name: t('settings.multi_company.tabs.currencies'), icon: CurrencyDollarIcon },
            { id: 'permissions', name: t('settings.multi_company.tabs.permissions'), icon: ShieldCheckIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-slate-700 dark:border-slate-400 text-slate-900 dark:text-slate-100'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'list' && (
        <>
          {/* Filtres et contrôles */}
          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder={t('settings.multi_company.actions.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 w-64 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
                />
              </div>
              
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white rounded-lg transition-all shadow-sm font-medium"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                {t('settings.multi_company.actions.new')}
              </button>

              <button
                onClick={() => setIsSwitchModalOpen(true)}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg transition-all shadow-sm font-medium"
              >
                <ArrowRightIcon className="h-5 w-5 mr-2" />
                {t('settings.multi_company.actions.switch')}
              </button>
            </div>
          </Card>

          {/* Liste des entreprises */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEntreprises.map((entreprise) => (
              <Card key={entreprise.id} className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      <BuildingOfficeIcon className="h-7 w-7 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{entreprise.nom}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{entreprise.ville}, {entreprise.pays}</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(entreprise.isActive)}`}>
                      {entreprise.isActive ? t('settings.multi_company.card.status.active') : t('settings.multi_company.card.status.inactive')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDeviseColor(entreprise.devise)}`}>
                      {entreprise.devise}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{t('settings.multi_company.card.details.siret')}</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{entreprise.siret}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{t('settings.multi_company.card.details.plan')}</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{getPlanComptableName(entreprise.planComptable)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{t('settings.multi_company.card.details.users')}</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{entreprise.utilisateurs}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400">{t('settings.multi_company.card.details.last_activity')}</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{entreprise.derniereActivite}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditEntreprise(entreprise)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-lg transition-all shadow-sm font-medium"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    {t('common.edit')}
                  </button>
                  
                  <button
                    onClick={() => handleSwitchEntreprise(entreprise)}
                    className="px-3 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                  >
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleToggleActive(entreprise)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      entreprise.isActive 
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50' 
                        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                    }`}
                  >
                    {entreprise.isActive ? (
                      <XMarkIcon className="h-4 w-4" />
                    ) : (
                      <CheckCircleIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {activeTab === 'currencies' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Gestion des Devises</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Configurez les taux de change pour chaque devise</p>
              </div>
              <div className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium">
                {devises.length} devises
              </div>
            </div>
            <div className="space-y-4">
              {devises.map((devise) => (
                <div key={devise.code} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-2xl hover:shadow-md transition-all gap-4">
                  <div className="flex items-center space-x-4">
                    <div className={`px-4 py-2 rounded-lg text-sm font-black ${getDeviseColor(devise.code)}`}>
                      {devise.code}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{devise.nom}</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Symbole: <span className="text-slate-900 dark:text-white">{devise.symbole}</span></p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="text-left sm:text-right bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-600 min-w-[140px]">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Taux de change</p>
                      <p className="font-black text-slate-900 dark:text-white font-mono text-sm">1 DZD = {devise.taux} {devise.code}</p>
                    </div>
                    <button
                      onClick={() => {
                        const nouveauTaux = prompt(`Nouveau taux pour ${devise.code}:`, devise.taux.toString());
                        if (nouveauTaux && !isNaN(parseFloat(nouveauTaux))) {
                          handleUpdateCurrency(devise.code, parseFloat(nouveauTaux));
                        }
                      }}
                      className="px-4 py-3 bg-slate-900 text-white rounded-xl transition-all shadow-lg font-black text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span>Modifier</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Gestion des Permissions</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Gérez les permissions par entreprise</p>
              </div>
              <div className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium">
                {permissions.length} modules
              </div>
            </div>
            <div className="space-y-4">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-2xl hover:shadow-md transition-all gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-slate-900 dark:bg-slate-800 rounded-xl shadow-lg">
                      <ShieldCheckIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">{permission.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{permission.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="text-left sm:text-right bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Entreprises</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">
                        {entreprises.filter(e => e.permissions.includes(permission.id)).length}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleConfigurePermission(permission)}
                      className="px-4 py-3 bg-slate-900 text-white rounded-xl transition-all shadow-lg font-black text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2"
                    >
                      <CogIcon className="h-4 w-4" />
                      <span>Configurer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Modal Création d'entreprise */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setErrors({});
        }}
        title={t('settings.company_form.title_new')}
        size="xl"
      >
        <div className="space-y-6">
          {/* Informations générales */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{t('settings.company_form.info_general')}</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">{t('settings.company_form.info_general_desc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t('settings.company_form.labels.name')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newEntreprise.nom}
                  onChange={(e) => {
                    setNewEntreprise({...newEntreprise, nom: e.target.value});
                    if (errors.nom) setErrors({...errors, nom: ''});
                  }}
                  className={`w-full border rounded-lg px-4 py-3 text-sm transition-colors dark:text-slate-100 ${
                    errors.nom 
                      ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-600'
                  } focus:outline-none`}
                  placeholder={t('settings.company_form.placeholders.name')}
                />
                {errors.nom && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.nom && <p className="text-red-600 text-xs font-medium mt-1 flex items-center">
                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                {errors.nom}
              </p>}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Raison sociale <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newEntreprise.raisonSociale}
                  onChange={(e) => {
                    setNewEntreprise({...newEntreprise, raisonSociale: e.target.value});
                    if (errors.raisonSociale) setErrors({...errors, raisonSociale: ''});
                  }}
                  className={`w-full border rounded-lg px-4 py-3 text-sm transition-colors ${
                    errors.raisonSociale 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  } focus:outline-none`}
                  placeholder="Saisissez la raison sociale"
                />
                {errors.raisonSociale && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.raisonSociale && <p className="text-red-600 text-xs font-medium mt-1 flex items-center">
                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                {errors.raisonSociale}
              </p>}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                SIRET <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newEntreprise.siret}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 14);
                    setNewEntreprise({...newEntreprise, siret: value});
                    if (errors.siret) setErrors({...errors, siret: ''});
                  }}
                  className={`w-full border rounded-lg px-4 py-3 text-sm transition-colors font-mono ${
                    errors.siret 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  } focus:outline-none`}
                  placeholder="12345678901234"
                  maxLength={14}
                />
                {errors.siret && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.siret && <p className="text-red-600 text-xs font-medium mt-1 flex items-center">
                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                {errors.siret}
              </p>}
              <p className="text-xs text-gray-500">14 chiffres maximum</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Numéro TVA</label>
              <div className="relative">
                <input
                  type="text"
                  value={newEntreprise.tvaNumber}
                  onChange={(e) => setNewEntreprise({...newEntreprise, tvaNumber: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm transition-colors bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                  placeholder="DZ123456789"
                />
              </div>
              <p className="text-xs text-gray-500">Format: DZ + 9 chiffres</p>
            </div>
          </div>

          {/* Adresse */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Adresse</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">Informations d'adresse de l'entreprise</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Adresse <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newEntreprise.adresse}
                  onChange={(e) => {
                    setNewEntreprise({...newEntreprise, adresse: e.target.value});
                    if (errors.adresse) setErrors({...errors, adresse: ''});
                  }}
                  className={`w-full border rounded-lg px-4 py-3 text-sm transition-colors ${
                    errors.adresse 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  } focus:outline-none`}
                  placeholder="123 Rue de l'Exemple, Quartier..."
                />
                {errors.adresse && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.adresse && <p className="text-red-600 text-xs font-medium mt-1 flex items-center">
                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                {errors.adresse}
              </p>}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Ville <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newEntreprise.ville}
                  onChange={(e) => {
                    setNewEntreprise({...newEntreprise, ville: e.target.value});
                    if (errors.ville) setErrors({...errors, ville: ''});
                  }}
                  className={`w-full border rounded-lg px-4 py-3 text-sm transition-colors ${
                    errors.ville 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  } focus:outline-none`}
                  placeholder="Alger"
                />
                {errors.ville && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.ville && <p className="text-red-600 text-xs font-medium mt-1 flex items-center">
                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                {errors.ville}
              </p>}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Code postal <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newEntreprise.codePostal}
                  onChange={(e) => {
                    setNewEntreprise({...newEntreprise, codePostal: e.target.value});
                    if (errors.codePostal) setErrors({...errors, codePostal: ''});
                  }}
                  className={`w-full border rounded-lg px-4 py-3 text-sm transition-colors ${
                    errors.codePostal 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  } focus:outline-none`}
                  placeholder="16000"
                />
                {errors.codePostal && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.codePostal && <p className="text-red-600 text-xs font-medium mt-1 flex items-center">
                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                {errors.codePostal}
              </p>}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Pays</label>
              <select
                value={newEntreprise.pays}
                onChange={(e) => setNewEntreprise({...newEntreprise, pays: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
              >
                <option value="Algérie">🇩🇿 Algérie</option>
                <option value="Maroc">🇲🇦 Maroc</option>
                <option value="Tunisie">🇹🇳 Tunisie</option>
                <option value="France">🇫🇷 France</option>
                <option value="Autre">🌍 Autre</option>
              </select>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700">
            <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Contact</h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">Informations de contact de l'entreprise</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Téléphone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={newEntreprise.telephone}
                  onChange={(e) => {
                    setNewEntreprise({...newEntreprise, telephone: e.target.value});
                    if (errors.telephone) setErrors({...errors, telephone: ''});
                  }}
                  className={`w-full border rounded-lg px-4 py-3 text-sm transition-colors ${
                    errors.telephone 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  } focus:outline-none`}
                  placeholder="+213 21 123 456"
                />
                {errors.telephone && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.telephone && <p className="text-red-600 text-xs font-medium mt-1 flex items-center">
                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                {errors.telephone}
              </p>}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={newEntreprise.email}
                  onChange={(e) => {
                    setNewEntreprise({...newEntreprise, email: e.target.value});
                    if (errors.email) setErrors({...errors, email: ''});
                  }}
                  className={`w-full border rounded-lg px-4 py-3 text-sm transition-colors ${
                    errors.email 
                      ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                  } focus:outline-none`}
                  placeholder="contact@entreprise.dz"
                />
                {errors.email && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {errors.email && <p className="text-red-600 text-xs font-medium mt-1 flex items-center">
                <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                {errors.email}
              </p>}
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Site Web</label>
              <div className="relative">
                <input
                  type="url"
                  value={newEntreprise.siteWeb}
                  onChange={(e) => setNewEntreprise({...newEntreprise, siteWeb: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                  placeholder="www.entreprise.dz"
                />
              </div>
              <p className="text-xs text-gray-500">URL complète avec http:// ou https://</p>
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Configuration</h3>
            <p className="text-sm text-yellow-700">Paramètres comptables et financiers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Devise</label>
              <select
                value={newEntreprise.devise}
                onChange={(e) => setNewEntreprise({...newEntreprise, devise: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
              >
                {devises.map(devise => (
                  <option key={devise.code} value={devise.code}>
                    {devise.symbole} {devise.code} - {devise.nom}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">Devise principale de l'entreprise</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">Plan Comptable</label>
              <select
                value={newEntreprise.planComptable}
                onChange={(e) => setNewEntreprise({...newEntreprise, planComptable: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
              >
                <option value="algerien">🇩🇿 PCA 2010 (Algérien)</option>
                <option value="ifrs">🌍 IFRS/GAAP</option>
              </select>
              <p className="text-xs text-gray-500">Standard comptable utilisé</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">Description</label>
            <textarea
              value={newEntreprise.description}
              onChange={(e) => setNewEntreprise({...newEntreprise, description: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors resize-none"
              rows={3}
              placeholder="Description de l'entreprise (optionnel)"
            />
            <p className="text-xs text-gray-500">Informations complémentaires sur l'entreprise</p>
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
              onClick={handleCreateEntreprise}
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
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Créer l'Entreprise
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Édition d'entreprise */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Modifier - ${selectedEntreprise?.nom || 'Entreprise'}`}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise</label>
              <input
                type="text"
                value={newEntreprise.nom}
                onChange={(e) => setNewEntreprise({...newEntreprise, nom: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Raison sociale</label>
              <input
                type="text"
                value={newEntreprise.raisonSociale}
                onChange={(e) => setNewEntreprise({...newEntreprise, raisonSociale: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SIRET</label>
              <input
                type="text"
                value={newEntreprise.siret}
                onChange={(e) => setNewEntreprise({...newEntreprise, siret: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Numéro TVA</label>
              <input
                type="text"
                value={newEntreprise.tvaNumber}
                onChange={(e) => setNewEntreprise({...newEntreprise, tvaNumber: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Devise</label>
              <select
                value={newEntreprise.devise}
                onChange={(e) => setNewEntreprise({...newEntreprise, devise: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {devises.map(devise => (
                  <option key={devise.code} value={devise.code}>
                    {devise.code} - {devise.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan Comptable</label>
              <select
                value={newEntreprise.planComptable}
                onChange={(e) => setNewEntreprise({...newEntreprise, planComptable: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="algerien">PCA 2010 (Algérien)</option>
                <option value="ifrs">IFRS/GAAP</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              onClick={handleUpdateEntreprise}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Basculement d'entreprise */}
      <Modal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        title="Basculer vers une entreprise"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Sélectionnez l'entreprise vers laquelle vous souhaitez basculer :
          </p>
          <div className="space-y-2">
            {entreprises.filter(e => e.isActive).map((entreprise) => (
              <button
                key={entreprise.id}
                onClick={() => handleSwitchEntreprise(entreprise)}
                className="w-full p-4 text-left border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-500 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">{entreprise.nom}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{entreprise.ville}, {entreprise.pays}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDeviseColor(entreprise.devise)}`}>
                      {entreprise.devise}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{getPlanComptableName(entreprise.planComptable)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modal Configuration des Permissions */}
      <Modal
        isOpen={isPermissionModalOpen}
        onClose={() => {
          setIsPermissionModalOpen(false);
          setSelectedPermission(null);
        }}
        title={`Configuration - ${selectedPermission?.name || 'Permission'}`}
        size="lg"
      >
        {selectedPermission && (
          <div className="space-y-6">
            {/* En-tête avec description */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-slate-600 dark:bg-slate-700 rounded-lg">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{selectedPermission.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedPermission.description}</p>
                </div>
              </div>
            </div>

            {/* Liste des entreprises avec toggle */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Activer cette permission pour les entreprises :
              </h4>
              <div className="space-y-3">
                {entreprises.map((entreprise) => {
                  const hasPermission = entreprise.permissions.includes(selectedPermission.id);
                  return (
                    <div 
                      key={entreprise.id} 
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                          <BuildingOfficeIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{entreprise.nom}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{entreprise.ville} • {entreprise.devise}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTogglePermissionForEntreprise(entreprise.id, selectedPermission.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 ${
                          hasPermission 
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-700' 
                            : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            hasPermission ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Entreprises avec cette permission</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Total des entreprises ayant accès à ce module</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {entreprises.filter(e => e.permissions.includes(selectedPermission.id)).length}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">sur {entreprises.length}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  setIsPermissionModalOpen(false);
                  setSelectedPermission(null);
                }}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  alert(`Configuration enregistrée pour ${selectedPermission.name}`);
                  setIsPermissionModalOpen(false);
                  setSelectedPermission(null);
                }}
                className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-lg transition-all shadow-sm font-medium flex items-center space-x-2"
              >
                <CheckCircleIcon className="h-5 w-5" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GestionEntreprise;



