import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CalculatorIcon, 
  CurrencyDollarIcon, 
  BuildingOfficeIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChartPieIcon,
  TableCellsIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@shared/hooks/useTranslation';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import { useApp } from '@core/context/AppContext';
import {
  calculerConsolidation,
  detecterTransactionsInterSocietes,
  genererEliminations,
  genererBilanConsolide,
  genererCompteResultatConsolide,
  type EntrepriseConsolidation,
  type TransactionInterSocietes,
  type DonneesConsolidees
} from '@shared/utils/consolidation';
import apiClient from '@/services/apiClient';

const Consolidation: React.FC = () => {
  const { formatCurrency } = useApp();
  const { t } = useTranslation();
  const [consolidationData, setConsolidationData] = useState<any>(null);
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('2024');
  const [selectedReport, setSelectedReport] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [consolidationProgress, setConsolidationProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [entreprises, setEntreprises] = useState<any[]>([]);
  const [eliminationData, setEliminationData] = useState<any[]>([]);
  const [conversionData, setConversionData] = useState<any[]>([]);
  const [consolidatedData, setConsolidatedData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Devise de référence
  const deviseReference = 'DZD';

  // Données consolidées calculées
  const calculateConsolidation = (ents: any[]) => {
    const consolidated = {
      totalChiffreAffaires: 0,
      totalBenefice: 0,
      totalActif: 0,
      totalPassif: 0,
      totalTresorerie: 0,
      nombreEntreprises: ents.length,
      deviseReference: deviseReference,
      dateConsolidation: new Date().toISOString().split('T')[0],
      entreprises: ents.map(entreprise => ({
        ...entreprise,
        chiffreAffairesConverti: entreprise.chiffreAffaires * (entreprise.tauxChange || 1.0),
        beneficeConverti: entreprise.benefice * (entreprise.tauxChange || 1.0),
        actifConverti: entreprise.actif * (entreprise.tauxChange || 1.0),
        passifConverti: entreprise.passif * (entreprise.tauxChange || 1.0),
        tresorerieConvertie: entreprise.tresorerie * (entreprise.tauxChange || 1.0)
      }))
    };

    // Calcul des totaux consolidés
    consolidated.totalChiffreAffaires = consolidated.entreprises.reduce((sum, e) => sum + e.chiffreAffairesConverti, 0);
    consolidated.totalBenefice = consolidated.entreprises.reduce((sum, e) => sum + e.beneficeConverti, 0);
    consolidated.totalActif = consolidated.entreprises.reduce((sum, e) => sum + e.actifConverti, 0);
    consolidated.totalPassif = consolidated.entreprises.reduce((sum, e) => sum + e.passifConverti, 0);
    consolidated.totalTresorerie = consolidated.entreprises.reduce((sum, e) => sum + e.tresorerieConvertie, 0);

    return consolidated;
  };

  useEffect(() => {
    const fetchConsolidation = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/consolidation');
        const ents = response.data.entreprises || [];
        const txs = response.data.transactions || [];
        
        const mappedEnts = ents.map((e: any) => ({
          ...e,
          isActive: e.statut === 'consolidated'
        }));
        
        setEntreprises(mappedEnts);
        setEliminationData(txs);
        
        // Map conversionData
        const convs = mappedEnts.map((e: any) => ({
          entreprise: e.nom,
          deviseOrigine: e.devise,
          deviseReference: 'DZD',
          tauxChange: e.tauxChange,
          montantOrigine: e.chiffreAffaires,
          montantConverti: e.chiffreAffaires * (e.tauxChange || 1.0),
          ecartConversion: 0
        }));
        setConversionData(convs);
        
        // Calculate initial consolidation
        const cons = calculateConsolidation(mappedEnts);
        setConsolidatedData(cons);
      } catch (err) {
        console.error("Failed to load consolidation data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConsolidation();
  }, []);

  // Types de rapports consolidés
  const reportTypes = [
    {
      id: 'bilan-consolide',
      name: t('consolidation.reports_list.bilan'),
      description: 'Situation patrimoniale consolidée du groupe',
      icon: BuildingOfficeIcon,
      category: 'États Financiers',
      lastGenerated: '',
      status: t('consolidation.reports_list.available')
    },
    {
      id: 'compte-resultat-consolide',
      name: t('consolidation.reports_list.compte_resultat'),
      description: 'Résultat consolidé du groupe',
      icon: ChartBarIcon,
      category: 'États Financiers',
      lastGenerated: '',
      status: t('consolidation.reports_list.available')
    },
    {
      id: 'flux-tresorerie-consolide',
      name: t('consolidation.reports_list.flux_tresorerie'),
      description: 'Mouvements de liquidités consolidés',
      icon: BanknotesIcon,
      category: 'États Financiers',
      lastGenerated: '',
      status: t('consolidation.reports_list.available')
    },
    {
      id: 'analyse-performance',
      name: t('consolidation.reports_list.performance'),
      description: 'Comparaison des performances par entreprise',
      icon: ChartPieIcon,
      category: 'Analyse',
      lastGenerated: '',
      status: t('consolidation.reports_list.available')
    },
    {
      id: 'elimination-inter',
      name: t('consolidation.reports_list.elimination'),
      description: 'Transactions inter-entreprises éliminées',
      icon: MinusIcon,
      category: 'Consolidation',
      lastGenerated: '',
      status: t('consolidation.reports_list.available')
    },
    {
      id: 'conversion-devises',
      name: t('consolidation.reports_list.conversion'),
      description: 'Détail des conversions de devises',
      icon: CurrencyDollarIcon,
      category: 'Consolidation',
      lastGenerated: '',
      status: t('consolidation.reports_list.available')
    }
  ];

  const handleConsolidation = async () => {
    setIsConsolidating(true);
    setConsolidationProgress(0);
    
    const steps = [
      { progress: 20, message: 'Conversion des devises...' },
      { progress: 40, message: 'Détection des transactions inter-sociétés...' },
      { progress: 60, message: 'Génération des éliminations...' },
      { progress: 80, message: 'Calcul des totaux consolidés...' },
      { progress: 100, message: 'Finalisation...' }
    ];
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setConsolidationProgress(step.progress);
    }
    
    // Préparer les données au format attendu
    const entreprisesFormat: EntrepriseConsolidation[] = entreprises.map(e => ({
      id: e.id.toString(),
      nom: e.nom,
      pays: e.pays,
      devise: e.devise,
      tauxChange: e.tauxChange,
      type: e.id === 1 ? 'mere' : 'filiale',
      pourcentageDetention: 100,
      chiffreAffaires: e.chiffreAffaires,
      benefice: e.benefice,
      actif: e.actif,
      passif: e.passif,
      tresorerie: e.tresorerie,
      statut: e.status as 'consolidated' | 'pending' | 'error',
      dateDerniereMAJ: e.lastUpdate
    }));
    
    const transactionsFormat: TransactionInterSocietes[] = eliminationData.map(e => ({
      id: e.id.toString(),
      entrepriseDebit: entreprises.find(ent => ent.nom === e.entrepriseDebit)?.id.toString() || '',
      entrepriseCredit: entreprises.find(ent => ent.nom === e.entrepriseCredit)?.id.toString() || '',
      montant: e.montant,
      devise: e.devise,
      type: e.type.toLowerCase() as TransactionInterSocietes['type'],
      description: e.description,
      date: new Date().toISOString().split('T')[0],
      statut: 'a_eliminer'
    }));
    
    // Calculer la consolidation avec les nouvelles fonctions
    const donneesConsolidees = calculerConsolidation(
      entreprisesFormat,
      transactionsFormat,
      deviseReference,
      selectedPeriod
    );
    
    // Convertir au format existant pour compatibilité
    const newData = {
      ...calculateConsolidation(entreprises),
      eliminations: donneesConsolidees.eliminations,
      transactionsInterSocietes: donneesConsolidees.transactionsInterSocietes,
      totalEliminations: donneesConsolidees.totalEliminations,
      nombreTransactionsEliminees: donneesConsolidees.nombreTransactionsEliminees
    };
    
    setConsolidatedData(newData);
    setConsolidationData(newData);
    setIsConsolidating(false);
    setConsolidationProgress(0);
    
    alert(`Consolidation terminée avec succès !\n${donneesConsolidees.nombreTransactionsEliminees} transaction(s) éliminée(s)`);
  };

  const handleGenerateReport = (reportType: string) => {
    setSelectedReport(reportType);
    setIsReportModalOpen(true);
  };

  const handleExportReport = (format: string) => {
    alert(`Export du rapport consolidé en format ${format} en cours...`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponible': return 'text-green-600 bg-green-100';
      case 'En cours': return 'text-yellow-600 bg-yellow-100';
      case 'En attente': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'États Financiers': return 'bg-blue-100 text-blue-800';
      case 'Analyse': return 'bg-green-100 text-green-800';
      case 'Consolidation': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddCompany = () => {
    setIsCompanyModalOpen(true);
  };

  const handleCurrencyManagement = () => {
    setIsCurrencyModalOpen(true);
  };

  const handlePrintReport = (reportType: string) => {
    alert(`Impression du rapport ${reportType} en cours...`);
  };

  const getCompanyStatusColor = (status: string) => {
    switch (status) {
      case 'consolidated': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompanyStatusIcon = (status: string) => {
    switch (status) {
      case 'consolidated': return CheckCircleIcon;
      case 'pending': return ClockIcon;
      case 'error': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  // Filtrage des entreprises
  const filteredEntreprises = entreprises.filter(entreprise => {
    const matchesSearch = entreprise.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entreprise.pays.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && entreprise.isActive) ||
                         (filterStatus === 'inactive' && !entreprise.isActive) ||
                         (filterStatus === 'consolidated' && entreprise.status === 'consolidated') ||
                         (filterStatus === 'pending' && entreprise.status === 'pending');
    return matchesSearch && matchesFilter;
  });

  if (loading || !consolidatedData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('consolidation.title')}</h1>
          <p className="text-gray-600 mt-2">{t('consolidation.subtitle')}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">
            {currentTime.toLocaleString('fr-FR')}
          </div>
          <div className="text-sm text-gray-400">
            {t('consolidation.period')}: {selectedPeriod} | {t('consolidation.currency')}: {deviseReference}
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      {isGenerating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">{t('consolidation.progress')}</span>
            <span className="text-sm text-blue-700">{consolidationProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${consolidationProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={t('consolidation.placeholders.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t('consolidation.filters.all')}</option>
              <option value="active">{t('consolidation.filters.active')}</option>
              <option value="inactive">{t('consolidation.filters.inactive')}</option>
              <option value="consolidated">{t('consolidation.filters.consolidated')}</option>
              <option value="pending">{t('consolidation.filters.pending')}</option>
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
            <button
              onClick={handleAddCompany}
              className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              {t('consolidation.actions.add')}
            </button>
            <button
              onClick={handleCurrencyManagement}
              className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              <CurrencyDollarIcon className="h-4 w-4 mr-2" />
              {t('consolidation.actions.currencies')}
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques consolidées */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('consolidation.stats.companies')}</p>
              <p className="text-2xl font-bold text-gray-900">{consolidatedData.nombreEntreprises}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('consolidation.stats.total_ca')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(consolidatedData.totalChiffreAffaires)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('consolidation.stats.total_profit')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(consolidatedData.totalBenefice)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <BanknotesIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('consolidation.stats.total_active')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(consolidatedData.totalActif)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('consolidation.stats.total_treasury')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(consolidatedData.totalTresorerie)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions principales */}
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleConsolidation}
            disabled={isConsolidating}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isConsolidating ? (
              <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <CalculatorIcon className="h-5 w-5 mr-2" />
            )}
            {isConsolidating ? t('consolidation.actions.consolidating') : t('consolidation.actions.start')}
          </button>

          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="flex items-center px-4 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <CogIcon className="h-5 w-5 mr-2" />
            {t('consolidation.actions.config')}
          </button>

          <button
            onClick={() => setIsAnalysisModalOpen(true)}
            className="flex items-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <ChartPieIcon className="h-5 w-5 mr-2" />
            {t('consolidation.actions.analysis')}
          </button>
        </div>
      </Card>

      {/* Liste des entreprises */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{t('consolidation.companies_list.title')}</h3>
          <div className="text-sm text-gray-500">
            {t('consolidation.companies_list.found_count', { count: filteredEntreprises.length })}
          </div>
        </div>
        
        <div className="space-y-4">
          {filteredEntreprises.map((entreprise) => {
            const StatusIcon = getCompanyStatusIcon(entreprise.status);
            return (
              <div key={entreprise.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-medium text-gray-900">{entreprise.nom}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCompanyStatusColor(entreprise.status)}`}>
                          <StatusIcon className="h-3 w-3 inline mr-1" />
                          {entreprise.status === 'consolidated' ? t('consolidation.companies_list.status.consolidated') : 
                           entreprise.status === 'pending' ? t('consolidation.companies_list.status.pending') : t('consolidation.companies_list.status.error')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-500">{entreprise.pays}</span>
                        <span className="text-sm text-gray-500">{entreprise.devise}</span>
                        <span className="text-sm text-gray-500">{t('consolidation.companies_list.last_update')}: {entreprise.lastUpdate}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{t('consolidation.table.revenue')}</div>
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(entreprise.chiffreAffaires * entreprise.tauxChange)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{t('consolidation.table.profit')}</div>
                      <div className="font-semibold text-green-600">
                        {formatCurrency(entreprise.benefice * entreprise.tauxChange)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">{t('consolidation.table.active')}</div>
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(entreprise.actif * entreprise.tauxChange)}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleGenerateReport(`entreprise-${entreprise.id}`)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="Voir les détails"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleExportReport(`entreprise-${entreprise.id}`)}
                        className="p-2 text-gray-400 hover:text-green-600"
                        title="Exporter"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: t('consolidation.tabs.overview'), icon: ChartBarIcon },
            { id: 'reports', name: t('consolidation.tabs.reports'), icon: DocumentTextIcon },
            { id: 'eliminations', name: t('consolidation.tabs.eliminations'), icon: MinusIcon },
            { id: 'conversions', name: t('consolidation.tabs.conversions'), icon: CurrencyDollarIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Détail par entreprise */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('consolidation.tabs.overview')}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('consolidation.table.company')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('consolidation.table.currency')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('consolidation.table.revenue')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('consolidation.table.profit')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('consolidation.table.active')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('consolidation.table.treasury')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {consolidatedData.entreprises.map((entreprise) => (
                    <tr key={entreprise.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{entreprise.nom}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {entreprise.devise}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(entreprise.chiffreAffairesConverti)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(entreprise.beneficeConverti)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(entreprise.actifConverti)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(entreprise.tresorerieConvertie)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <Card key={report.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Icon className="h-8 w-8 text-blue-600" />
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                        <p className="text-sm text-gray-600">{report.description}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Catégorie:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(report.category)}`}>
                        {report.category}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Dernière génération:</span>
                      <span className="font-medium">{report.lastGenerated}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleGenerateReport(report.id)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Générer
                    </button>
                    
                    <button
                      onClick={() => handleExportReport('PDF')}
                      className="px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'eliminations' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Éliminations Inter-Entreprises</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entreprise Débit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entreprise Crédit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eliminationData.map((elimination) => (
                    <tr key={elimination.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {elimination.entrepriseDebit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {elimination.entrepriseCredit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(elimination.montant)} {elimination.devise}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {elimination.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {elimination.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {elimination.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'conversions' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversion des Devises</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entreprise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Devise Origine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taux de Change
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant Origine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant Converti
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Écart
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {conversionData.map((conversion, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {conversion.entreprise}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {conversion.deviseOrigine} → {conversion.deviseReference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {conversion.tauxChange}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(conversion.montantOrigine)} {conversion.deviseOrigine}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(conversion.montantConverti)} {conversion.deviseReference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(conversion.ecartConversion)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de rapport */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title={`Rapport Consolidé - ${selectedReport}`}
        size="xl"
      >
        <div className="space-y-6">
          {/* En-tête du rapport */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-blue-900 mb-2">
                  Bilan Consolidé du Groupe
                </h3>
                <p className="text-blue-700">
                  Période: {selectedPeriod} | Devise: {deviseReference} | 
                  Date de génération: {new Date().toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-600">Nombre d'entreprises</div>
                <div className="text-3xl font-bold text-blue-900">
                  {consolidatedData.nombreEntreprises}
                </div>
              </div>
            </div>
          </div>

          {/* Résumé exécutif */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Chiffre d'Affaires</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(consolidatedData.totalChiffreAffaires)}
                  </p>
                </div>
                <ChartBarIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Bénéfice Net</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(consolidatedData.totalBenefice)}
                  </p>
                </div>
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Actif Total</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(consolidatedData.totalActif)}
                  </p>
                </div>
                <BuildingOfficeIcon className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Trésorerie</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {formatCurrency(consolidatedData.totalTresorerie)}
                  </p>
                </div>
                <BanknotesIcon className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Bilan détaillé par entreprise */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">Détail par Entreprise</h4>
              <p className="text-sm text-gray-600">Données consolidées de chaque entité du groupe</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entreprise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pays
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Devise
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CA (DZD)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bénéfice (DZD)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actif (DZD)
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trésorerie (DZD)
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {consolidatedData.entreprises.map((entreprise: any) => {
                    const StatusIcon = getCompanyStatusIcon(entreprise.status || 'consolidated');
                    return (
                      <tr key={entreprise.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {entreprise.nom}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {entreprise.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {entreprise.pays || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {entreprise.devise}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(entreprise.chiffreAffairesConverti)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right font-medium">
                          {formatCurrency(entreprise.beneficeConverti)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(entreprise.actifConverti)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatCurrency(entreprise.tresorerieConvertie)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCompanyStatusColor(entreprise.status || 'consolidated')}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {entreprise.status === 'consolidated' ? 'Consolidée' : 
                             entreprise.status === 'pending' ? 'En attente' : 'Erreur'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ratios financiers consolidés */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h5 className="text-lg font-semibold text-gray-900 mb-4">Ratios de Rentabilité</h5>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Marge brute</span>
                  <span className="text-sm font-medium text-gray-900">
                    {((consolidatedData.totalBenefice / consolidatedData.totalChiffreAffaires) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ROA</span>
                  <span className="text-sm font-medium text-gray-900">
                    {((consolidatedData.totalBenefice / consolidatedData.totalActif) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ROE</span>
                  <span className="text-sm font-medium text-gray-900">
                    {((consolidatedData.totalBenefice / (consolidatedData.totalActif - consolidatedData.totalPassif)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h5 className="text-lg font-semibold text-gray-900 mb-4">Ratios de Liquidité</h5>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ratio de liquidité</span>
                  <span className="text-sm font-medium text-gray-900">
                    {(consolidatedData.totalTresorerie / consolidatedData.totalPassif).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Trésorerie/Actif</span>
                  <span className="text-sm font-medium text-gray-900">
                    {((consolidatedData.totalTresorerie / consolidatedData.totalActif) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Endettement</span>
                  <span className="text-sm font-medium text-gray-900">
                    {((consolidatedData.totalPassif / consolidatedData.totalActif) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h5 className="text-lg font-semibold text-gray-900 mb-4">Analyse Comparative</h5>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">CA moyen/entreprise</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(consolidatedData.totalChiffreAffaires / consolidatedData.nombreEntreprises)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bénéfice moyen/entreprise</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(consolidatedData.totalBenefice / consolidatedData.nombreEntreprises)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Actif moyen/entreprise</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(consolidatedData.totalActif / consolidatedData.nombreEntreprises)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes et commentaires */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h5 className="text-sm font-medium text-yellow-800 mb-2">Notes importantes</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Tous les montants sont convertis en {deviseReference} selon les taux de change en vigueur</li>
              <li>• Les transactions inter-entreprises ont été éliminées de la consolidation</li>
              <li>• Les écarts de conversion sont inclus dans les capitaux propres</li>
              <li>• Les données sont arrondies au millier le plus proche</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Rapport généré le {new Date().toLocaleString('fr-FR')} | 
              Version 1.0 | 
              {consolidatedData.nombreEntreprises} entreprise(s) consolidée(s)
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handlePrintReport(selectedReport)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Imprimer
              </button>
              <button
                onClick={() => handleExportReport('PDF')}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export PDF
              </button>
              <button
                onClick={() => handleExportReport('Excel')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <TableCellsIcon className="h-4 w-4 mr-2" />
                Export Excel
              </button>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de configuration */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="Configuration de la Consolidation"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période de consolidation
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Devise de référence
            </label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="DZD">DZD - Dinar Algérien</option>
              <option value="EUR">EUR - Euro</option>
              <option value="USD">USD - Dollar US</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoConsolidation"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="autoConsolidation" className="ml-2 block text-sm text-gray-900">
              Consolidation automatique mensuelle
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsConfigModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              onClick={() => setIsConfigModalOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal d'analyses */}
      <Modal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        title="Analyses et Comparaisons"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h4 className="font-medium text-gray-900 mb-2">Performance par Entreprise</h4>
              <div className="space-y-2">
                {consolidatedData.entreprises.map((entreprise) => (
                  <div key={entreprise.id} className="flex justify-between text-sm">
                    <span>{entreprise.nom}:</span>
                    <span className="font-medium">
                      {((entreprise.beneficeConverti / entreprise.chiffreAffairesConverti) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-medium text-gray-900 mb-2">Répartition du CA</h4>
              <div className="space-y-2">
                {consolidatedData.entreprises.map((entreprise) => (
                  <div key={entreprise.id} className="flex justify-between text-sm">
                    <span>{entreprise.nom}:</span>
                    <span className="font-medium">
                      {((entreprise.chiffreAffairesConverti / consolidatedData.totalChiffreAffaires) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setIsAnalysisModalOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Ajouter une entreprise */}
      <Modal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        title="Ajouter une Entreprise au Groupe"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Nouvelle Entreprise</h3>
            <p className="text-sm text-blue-700">Ajoutez une nouvelle entreprise au groupe de consolidation</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'entreprise</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nom de l'entreprise"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="Algérie">Algérie</option>
                <option value="France">France</option>
                <option value="Maroc">Maroc</option>
                <option value="Tunisie">Tunisie</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Devise</label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="DZD">DZD - Dinar Algérien</option>
                <option value="EUR">EUR - Euro</option>
                <option value="MAD">MAD - Dirham Marocain</option>
                <option value="TND">TND - Dinar Tunisien</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Taux de change</label>
              <input
                type="number"
                step="0.0001"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1.0000"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsCompanyModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                alert('Entreprise ajoutée avec succès !');
                setIsCompanyModalOpen(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Ajouter
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Gestion des devises */}
      <Modal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        title="Gestion des Taux de Change"
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Taux de Change</h3>
            <p className="text-sm text-yellow-700">Gérez les taux de change pour la consolidation</p>
          </div>

          <div className="space-y-4">
            {[
              { code: 'EUR', nom: 'Euro', symbole: '€', taux: 0.0067, isDefault: false },
              { code: 'MAD', nom: 'Dirham Marocain', symbole: 'MAD', taux: 0.055, isDefault: false },
              { code: 'TND', nom: 'Dinar Tunisien', symbole: 'TND', taux: 0.0028, isDefault: false },
              { code: 'USD', nom: 'Dollar US', symbole: '$', taux: 0.0074, isDefault: false }
            ].map((devise) => (
              <div key={devise.code} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    devise.isDefault ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {devise.code}
                  </div>
                  <div>
                    <p className="font-medium">{devise.nom}</p>
                    <p className="text-sm text-gray-500">Symbole: {devise.symbole}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Taux de change</p>
                    <p className="font-medium">1 DZD = {devise.taux} {devise.code}</p>
                  </div>
                  <button
                    onClick={() => {
                      const nouveauTaux = prompt(`Nouveau taux pour ${devise.code}:`, devise.taux.toString());
                      if (nouveauTaux && !isNaN(parseFloat(nouveauTaux))) {
                        alert(`Taux mis à jour pour ${devise.code}: ${nouveauTaux}`);
                      }
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Modifier
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsCurrencyModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Fermer
            </button>
            <button
              onClick={() => {
                alert('Taux de change mis à jour !');
                setIsCurrencyModalOpen(false);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Mettre à jour
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Consolidation;



