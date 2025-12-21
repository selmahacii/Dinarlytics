import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  CalendarIcon,
  ChartBarIcon,
  TableCellsIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CubeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CogIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';

const RapportsPersonnalises: React.FC = () => {
  const { formatCurrency } = useApp();
  const { t } = useTranslation();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [newReport, setNewReport] = useState({
    name: '',
    description: '',
    category: 'financial',
    metrics: [],
    filters: {},
    schedule: 'none'
  });
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedReportForSchedule, setSelectedReportForSchedule] = useState<any>(null);
  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: 'monthly',
    day: 1,
    time: '09:00',
    recipients: [],
    format: 'pdf',
    autoSend: false
  });

  // Rapports prédéfinis
  const predefinedReports = [
    {
      id: 1,
      name: 'Rapport Financier Mensuel',
      description: 'Analyse complète des performances financières du mois',
      category: 'financial',
      metrics: ['revenue', 'expenses', 'profit', 'cash_flow'],
      lastGenerated: '2024-01-15',
      nextScheduled: '2024-02-15',
      status: 'scheduled',
      icon: CurrencyDollarIcon,
      color: 'green'
    },
    {
      id: 2,
      name: 'Analyse des Ventes par Région',
      description: 'Performance des ventes par région géographique',
      category: 'sales',
      metrics: ['sales_by_region', 'top_products', 'customer_segments'],
      lastGenerated: '2024-01-14',
      nextScheduled: 'none',
      status: 'manual',
      icon: ChartBarIcon,
      color: 'blue'
    },
    {
      id: 3,
      name: 'Rapport d\'Inventaire',
      description: 'État des stocks et alertes de réapprovisionnement',
      category: 'inventory',
      metrics: ['stock_levels', 'low_stock_alerts', 'turnover_rate'],
      lastGenerated: '2024-01-13',
      nextScheduled: '2024-01-20',
      status: 'scheduled',
      icon: CubeIcon,
      color: 'purple'
    },
    {
      id: 4,
      name: 'Performance des Clients',
      description: 'Analyse de la satisfaction et de la rétention client',
      category: 'customers',
      metrics: ['satisfaction_score', 'retention_rate', 'lifetime_value'],
      lastGenerated: '2024-01-12',
      nextScheduled: '2024-01-26',
      status: 'scheduled',
      icon: UserGroupIcon,
      color: 'orange'
    }
  ];

  // Métriques disponibles
  const availableMetrics = [
    { id: 'revenue', name: 'Revenus', category: 'financial', icon: CurrencyDollarIcon },
    { id: 'expenses', name: 'Dépenses', category: 'financial', icon: CurrencyDollarIcon },
    { id: 'profit', name: 'Bénéfices', category: 'financial', icon: CurrencyDollarIcon },
    { id: 'cash_flow', name: 'Flux de trésorerie', category: 'financial', icon: CurrencyDollarIcon },
    { id: 'sales_by_region', name: 'Ventes par région', category: 'sales', icon: ChartBarIcon },
    { id: 'top_products', name: 'Produits les plus vendus', category: 'sales', icon: CubeIcon },
    { id: 'customer_segments', name: 'Segments clients', category: 'customers', icon: UserGroupIcon },
    { id: 'stock_levels', name: 'Niveaux de stock', category: 'inventory', icon: CubeIcon },
    { id: 'low_stock_alerts', name: 'Alertes stock faible', category: 'inventory', icon: CubeIcon },
    { id: 'satisfaction_score', name: 'Score de satisfaction', category: 'customers', icon: UserGroupIcon }
  ];

  // Filtres disponibles
  const availableFilters = [
    { id: 'date_range', name: 'Période', type: 'date' },
    { id: 'region', name: 'Région', type: 'select', options: ['Alger', 'Oran', 'Constantine', 'Annaba'] },
    { id: 'product_category', name: 'Catégorie produit', type: 'select', options: ['Électronique', 'Vêtements', 'Alimentaire', 'Services'] },
    { id: 'customer_type', name: 'Type de client', type: 'select', options: ['Particulier', 'Entreprise', 'Gouvernement'] }
  ];

  // Catégories de rapports
  const categories = [
    { id: 'all', name: 'Tous les rapports', icon: DocumentTextIcon },
    { id: 'financial', name: 'Financier', icon: CurrencyDollarIcon },
    { id: 'sales', name: 'Ventes', icon: ChartBarIcon },
    { id: 'inventory', name: 'Inventaire', icon: CubeIcon },
    { id: 'customers', name: 'Clients', icon: UserGroupIcon }
  ];

  // Rapports filtrés
  const filteredReports = predefinedReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-green-50 text-green-700 border-green-200';
      case 'manual': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'error': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial': return 'text-green-600 bg-green-50 border-green-200';
      case 'sales': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'inventory': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'customers': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleCreateReport = () => {
    // Logique de création de rapport
    console.log('Création du rapport:', newReport);
    setShowCreateModal(false);
    setNewReport({
      name: '',
      description: '',
      category: 'financial',
      metrics: [],
      filters: {},
      schedule: 'none'
    });
  };

  const handleGenerateReport = (reportId: number) => {
    const report = predefinedReports.find(r => r.id === reportId);
    alert(`Génération du rapport "${report?.name}" en cours...\nLe rapport sera disponible dans quelques minutes.`);
  };

  const handleScheduleReport = (report: any) => {
    setSelectedReportForSchedule(report);
    setIsScheduleModalOpen(true);
  };

  const handleConfirmSchedule = () => {
    alert(`Rapport "${selectedReportForSchedule.name}" planifié avec succès !\nFréquence: ${scheduleConfig.frequency}\nHeure: ${scheduleConfig.time}`);
    setIsScheduleModalOpen(false);
    setSelectedReportForSchedule(null);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            📋 Rapports Personnalisés
          </h1>
          <p className="text-gray-600">Créez et gérez vos rapports personnalisés</p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nouveau Rapport
        </button>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          {/* Barre de recherche */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un rapport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filtre par catégorie */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Liste des rapports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${getCategoryColor(report.category)}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleGenerateReport(report.id)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">{report.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Dernière génération:</span>
                  <span className="text-xs font-medium text-gray-700">{report.lastGenerated}</span>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500">Prochaine planifiée:</span>
                  <span className="text-xs font-medium text-gray-700">
                    {report.nextScheduled === 'none' ? 'Manuelle' : report.nextScheduled}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                  {report.status === 'scheduled' ? 'Planifié' : 'Manuel'}
                </span>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleGenerateReport(report.id)}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                  >
                    Générer
                  </button>
                  {report.status === 'manual' && (
                    <button
                      onClick={() => handleScheduleReport(report)}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                    >
                      Planifier
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal de création de rapport */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Créer un Nouveau Rapport</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Informations de base */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du rapport
                </label>
                <input
                  type="text"
                  value={newReport.name}
                  onChange={(e) => setNewReport({...newReport, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Rapport Financier Mensuel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newReport.description}
                  onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Description du rapport..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={newReport.category}
                  onChange={(e) => setNewReport({...newReport, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="financial">Financier</option>
                  <option value="sales">Ventes</option>
                  <option value="inventory">Inventaire</option>
                  <option value="customers">Clients</option>
                </select>
              </div>

              {/* Métriques */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Métriques à inclure
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {availableMetrics
                    .filter(metric => metric.category === newReport.category || newReport.category === 'all')
                    .map((metric) => {
                      const Icon = metric.icon;
                      const isSelected = newReport.metrics.includes(metric.id);
                      return (
                        <label key={metric.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewReport({...newReport, metrics: [...newReport.metrics, metric.id]});
                              } else {
                                setNewReport({...newReport, metrics: newReport.metrics.filter(m => m !== metric.id)});
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <Icon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{metric.name}</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              {/* Planification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Planification
                </label>
                <select
                  value={newReport.schedule}
                  onChange={(e) => setNewReport({...newReport, schedule: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="none">Manuel</option>
                  <option value="daily">Quotidien</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuel</option>
                  <option value="quarterly">Trimestriel</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer le Rapport
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques des rapports */}
      <Card title="📊 Statistiques des Rapports">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{predefinedReports.length}</div>
            <div className="text-sm text-gray-600">Rapports créés</div>
          </div>
          <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {predefinedReports.filter(r => r.status === 'scheduled').length}
            </div>
            <div className="text-sm text-gray-600">Rapports planifiés</div>
          </div>
          <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">24</div>
            <div className="text-sm text-gray-600">Générés ce mois</div>
          </div>
          <div className="text-center p-4 bg-white border border-gray-200 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">98.5%</div>
            <div className="text-sm text-gray-600">Taux de succès</div>
          </div>
        </div>
      </Card>

      {/* Modal de planification */}
      {isScheduleModalOpen && selectedReportForSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Planifier le Rapport: {selectedReportForSchedule.name}
              </h2>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Configuration de la planification */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Configuration de la Planification
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fréquence *
                    </label>
                    <select
                      value={scheduleConfig.frequency}
                      onChange={(e) => setScheduleConfig({...scheduleConfig, frequency: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="daily">Quotidien</option>
                      <option value="weekly">Hebdomadaire</option>
                      <option value="monthly">Mensuel</option>
                      <option value="quarterly">Trimestriel</option>
                      <option value="yearly">Annuel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure d'exécution *
                    </label>
                    <input
                      type="time"
                      value={scheduleConfig.time}
                      onChange={(e) => setScheduleConfig({...scheduleConfig, time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {scheduleConfig.frequency === 'monthly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jour du mois *
                      </label>
                      <select
                        value={scheduleConfig.day}
                        onChange={(e) => setScheduleConfig({...scheduleConfig, day: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Format de sortie *
                    </label>
                    <select
                      value={scheduleConfig.format}
                      onChange={(e) => setScheduleConfig({...scheduleConfig, format: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                      <option value="html">HTML</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Destinataires */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Destinataires
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email des destinataires
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="admin@entreprise.com, manager@entreprise.com"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">Séparez les emails par des virgules</p>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoSend"
                      checked={scheduleConfig.autoSend}
                      onChange={(e) => setScheduleConfig({...scheduleConfig, autoSend: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="autoSend" className="ml-2 text-sm text-gray-700">
                      Envoyer automatiquement par email
                    </label>
                  </div>
                </div>
              </div>

              {/* Résumé de la planification */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckIcon className="h-5 w-5 mr-2 text-green-600" />
                  Résumé de la Planification
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rapport:</span>
                    <span className="font-medium text-gray-900">{selectedReportForSchedule.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fréquence:</span>
                    <span className="font-medium text-gray-900">
                      {scheduleConfig.frequency === 'daily' ? 'Quotidien' :
                       scheduleConfig.frequency === 'weekly' ? 'Hebdomadaire' :
                       scheduleConfig.frequency === 'monthly' ? 'Mensuel' :
                       scheduleConfig.frequency === 'quarterly' ? 'Trimestriel' : 'Annuel'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Heure:</span>
                    <span className="font-medium text-gray-900">{scheduleConfig.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium text-gray-900">{scheduleConfig.format.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmSchedule}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <CheckIcon className="h-5 w-5 mr-2" />
                Confirmer la Planification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RapportsPersonnalises;
