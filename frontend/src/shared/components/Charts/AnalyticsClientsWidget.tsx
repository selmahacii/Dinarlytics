import React, { useState } from 'react';
import {
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartPieIcon,
  TableCellsIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut, Radar, PolarArea } from 'react-chartjs-2';
import { useTheme } from '@core/context/ThemeContext';
import { useApp } from '@core/context/AppContext';
import Card from '../UI/Card';

interface AnalyticsClientsWidgetProps {
  clientId?: string;
}

const AnalyticsClientsWidget: React.FC<AnalyticsClientsWidgetProps> = ({ clientId }) => {
  const { formatCurrency, currentDevise } = useApp();
  const { currentTheme } = useTheme();
  const [activeView, setActiveView] = useState<'overview' | 'performance' | 'segmentation' | 'tendances'>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('mois');

  // Handlers pour les actions
  const handleExportRapport = () => {
    alert('Export du rapport analytique en cours... Le fichier sera téléchargé dans quelques instants.');
  };

  const handleGenerateDashboard = () => {
    alert('Génération du dashboard personnalisé en cours... Cette fonctionnalité créera un tableau de bord détaillé avec toutes les métriques clients.');
  };

  const handleExportPerformance = () => {
    alert(`Export des données de performance (${selectedPeriod}) en cours...`);
  };

  const handleViewClient = (clientId: string) => {
    alert(`Ouverture du dossier client ${clientId}...`);
  };

  const handleDownloadClientReport = (clientId: string) => {
    alert(`Téléchargement du rapport pour le client ${clientId}...`);
  };

  // Données de démonstration pour les analytics clients
  const analyticsData = {
    totalClients: 1250,
    clientsActifs: 980,
    nouveauxClients: 45,
    clientsInactifs: 270,
    chiffreAffaires: 2450000,
    panierMoyen: 1950,
    tauxFidelite: 78.4,
    delaiPaiementMoyen: 28.5,
    satisfaction: 4.2
  };

  const performanceClients = [
    {
      id: '1',
      nom: 'Entreprise ABC',
      secteur: 'Technologie',
      chiffreAffaires: 125000,
      evolution: '+15.2%',
      evolutionType: 'positive',
      panierMoyen: 2500,
      frequence: 12,
      derniereCommande: '2024-01-15',
      statut: 'actif',
      satisfaction: 4.5
    },
    {
      id: '2',
      nom: 'Société XYZ',
      secteur: 'Industrie',
      chiffreAffaires: 85000,
      evolution: '+8.7%',
      evolutionType: 'positive',
      panierMoyen: 1700,
      frequence: 8,
      derniereCommande: '2024-01-12',
      statut: 'actif',
      satisfaction: 4.2
    },
    {
      id: '3',
      nom: 'Compagnie DEF',
      secteur: 'Services',
      chiffreAffaires: 65000,
      evolution: '-5.3%',
      evolutionType: 'negative',
      panierMoyen: 1300,
      frequence: 6,
      derniereCommande: '2024-01-08',
      statut: 'risque',
      satisfaction: 3.8
    },
    {
      id: '4',
      nom: 'Groupe GHI',
      secteur: 'Commerce',
      chiffreAffaires: 95000,
      evolution: '+22.1%',
      evolutionType: 'positive',
      panierMoyen: 1900,
      frequence: 15,
      derniereCommande: '2024-01-18',
      statut: 'actif',
      satisfaction: 4.7
    }
  ];

  const segmentationData = {
    parSecteur: [
      { secteur: 'Technologie', clients: 320, pourcentage: 25.6, chiffreAffaires: 850000 },
      { secteur: 'Industrie', clients: 280, pourcentage: 22.4, chiffreAffaires: 720000 },
      { secteur: 'Services', clients: 250, pourcentage: 20.0, chiffreAffaires: 450000 },
      { secteur: 'Commerce', clients: 200, pourcentage: 16.0, chiffreAffaires: 380000 },
      { secteur: 'Autres', clients: 200, pourcentage: 16.0, chiffreAffaires: 50000 }
    ],
    parTaille: [
      { taille: 'Grande Entreprise', clients: 150, chiffreAffaires: 1200000 },
      { taille: 'PME', clients: 650, chiffreAffaires: 1000000 },
      { taille: 'TPE', clients: 450, chiffreAffaires: 250000 }
    ],
    parRegion: [
      { region: 'Alger', clients: 450, chiffreAffaires: 1200000 },
      { region: 'Oran', clients: 280, chiffreAffaires: 650000 },
      { region: 'Constantine', clients: 200, chiffreAffaires: 400000 },
      { region: 'Autres', clients: 320, chiffreAffaires: 200000 }
    ]
  };

  const tendancesData = {
    evolutionClients: [
      { mois: 'Jan', nouveaux: 45, perdus: 12, net: 33 },
      { mois: 'Fév', nouveaux: 52, perdus: 8, net: 44 },
      { mois: 'Mar', nouveaux: 38, perdus: 15, net: 23 },
      { mois: 'Avr', nouveaux: 61, perdus: 10, net: 51 },
      { mois: 'Mai', nouveaux: 48, perdus: 18, net: 30 },
      { mois: 'Jun', nouveaux: 55, perdus: 12, net: 43 }
    ],
    chiffreAffaires: [
      { mois: 'Jan', montant: 2100000 },
      { mois: 'Fév', montant: 2250000 },
      { mois: 'Mar', montant: 2180000 },
      { mois: 'Avr', montant: 2400000 },
      { mois: 'Mai', montant: 2320000 },
      { mois: 'Jun', montant: 2450000 }
    ]
  };

  const getEvolutionColor = (type: string) => {
    return type === 'positive' ? 'text-green-600' : 'text-red-600';
  };

  const getEvolutionIcon = (type: string) => {
    return type === 'positive' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'actif': return 'text-green-600 bg-green-50 border-green-200';
      case 'risque': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'inactif': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Clients</p>
              <p className="text-2xl font-bold text-blue-800">{analyticsData.totalClients}</p>
              <p className="text-xs text-gray-500">+{analyticsData.nouveauxClients} ce mois</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Clients Actifs</p>
              <p className="text-2xl font-bold text-green-800">{analyticsData.clientsActifs}</p>
              <p className="text-xs text-gray-500">{((analyticsData.clientsActifs / analyticsData.totalClients) * 100).toFixed(1)}% du total</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Chiffre d'Affaires</p>
              <p className="text-2xl font-bold text-purple-800">{formatCurrency(analyticsData.chiffreAffaires)}</p>
              <p className="text-xs text-gray-500">Panier moyen: {formatCurrency(analyticsData.panierMoyen)}</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Taux de Fidélité</p>
              <p className="text-2xl font-bold text-orange-800">{analyticsData.tauxFidelite}%</p>
              <p className="text-xs text-gray-500">Satisfaction: {analyticsData.satisfaction}/5</p>
            </div>
            <ChartPieIcon className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Évolution du Chiffre d'Affaires</h4>
          <div className="h-64">
            <Line
              data={{
                labels: tendancesData.chiffreAffaires.map(item => item.mois),
                datasets: [{
                  label: `Chiffre d'Affaires (${currentDevise || 'DA'})`,
                  data: tendancesData.chiffreAffaires.map(item => item.montant),
                  borderColor: '#3B82F6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  tension: 0.4,
                  fill: true
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return formatCurrency(value as number);
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Secteur</h4>
          <div className="h-64">
            <Doughnut
              data={{
                labels: segmentationData.parSecteur.map(item => item.secteur),
                datasets: [{
                  data: segmentationData.parSecteur.map(item => item.clients),
                  backgroundColor: [
                    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
                  ],
                  borderColor: [
                    '#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED'
                  ],
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                },
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-900">Performance des Clients</h4>
        <div className="flex space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-slate-500"
          >
            <option value="mois">Ce mois</option>
            <option value="trimestre">Ce trimestre</option>
            <option value="annee">Cette année</option>
          </select>
          <button 
            onClick={handleExportPerformance}
            className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 dark:hover:from-slate-700 dark:hover:to-slate-800 flex items-center space-x-2 transition-all shadow-sm font-medium"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {performanceClients.map((client) => {
          const EvolutionIcon = getEvolutionIcon(client.evolutionType);
          return (
            <Card key={client.id} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{client.nom}</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{client.secteur}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(client.chiffreAffaires)}</p>
                    <div className="flex items-center space-x-1">
                      <EvolutionIcon className={`h-3 w-3 ${getEvolutionColor(client.evolutionType)}`} />
                      <span className={`text-xs ${getEvolutionColor(client.evolutionType)}`}>
                        {client.evolution}
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Panier: {formatCurrency(client.panierMoyen)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{client.frequence} commandes</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatutColor(client.statut)}`}>
                      {client.statut}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-yellow-500">★</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400">{client.satisfaction}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleViewClient(client.id)}
                    className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Voir les détails"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDownloadClientReport(client.id)}
                    className="p-2 text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                    title="Télécharger le rapport"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderSegmentation = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">Segmentation des Clients</h4>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Par Secteur */}
        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Par Secteur d'Activité</h5>
          <div className="space-y-3">
            {segmentationData.parSecteur.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.secteur}</p>
                  <p className="text-xs text-gray-500">{item.clients} clients</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{item.pourcentage}%</p>
                  <p className="text-xs text-gray-500">{formatCurrency(item.chiffreAffaires)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Par Taille */}
        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Par Taille d'Entreprise</h5>
          <div className="h-48">
            <Bar
              data={{
                labels: segmentationData.parTaille.map(item => item.taille),
                datasets: [{
                  label: 'Nombre de Clients',
                  data: segmentationData.parTaille.map(item => item.clients),
                  backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
                  borderColor: ['#2563EB', '#059669', '#D97706'],
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                },
              }}
            />
          </div>
        </Card>

        {/* Par Région */}
        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Par Région</h5>
          <div className="h-48">
            <PolarArea
              data={{
                labels: segmentationData.parRegion.map(item => item.region),
                datasets: [{
                  data: segmentationData.parRegion.map(item => item.clients),
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(139, 92, 246, 0.8)'
                  ],
                  borderColor: [
                    '#2563EB',
                    '#059669',
                    '#D97706',
                    '#7C3AED'
                  ],
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                },
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );

  const renderTendances = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">Tendances et Évolutions</h4>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Évolution des Clients</h5>
          <div className="h-64">
            <Bar
              data={{
                labels: tendancesData.evolutionClients.map(item => item.mois),
                datasets: [{
                  label: 'Nouveaux Clients',
                  data: tendancesData.evolutionClients.map(item => item.nouveaux),
                  backgroundColor: '#10B981',
                  borderColor: '#059669',
                  borderWidth: 1
                }, {
                  label: 'Clients Perdus',
                  data: tendancesData.evolutionClients.map(item => item.perdus),
                  backgroundColor: '#EF4444',
                  borderColor: '#DC2626',
                  borderWidth: 1
                }, {
                  label: 'Net',
                  data: tendancesData.evolutionClients.map(item => item.net),
                  backgroundColor: '#3B82F6',
                  borderColor: '#2563EB',
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
              }}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Analyse Radar - Performance</h5>
          <div className="h-64">
            <Radar
              data={{
                labels: ['Fidélité', 'Fréquence', 'Montant', 'Satisfaction', 'Ponctualité'],
                datasets: [{
                  label: 'Performance Moyenne',
                  data: [78, 85, 72, 88, 75],
                  borderColor: '#3B82F6',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  borderWidth: 2
                }, {
                  label: 'Objectifs',
                  data: [80, 80, 80, 80, 80],
                  borderColor: '#10B981',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  borderWidth: 2
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  r: {
                    beginAtZero: true,
                    max: 100
                  }
                }
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* En-tête - Palette Slate Professionnelle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Analytics Clients</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Analyse approfondie de la base clients</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleExportRapport}
            className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm font-medium space-x-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Exporter Rapport</span>
          </button>
          <button 
            onClick={handleGenerateDashboard}
            className="flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-sm font-medium space-x-2"
          >
            <ChartBarIcon className="h-4 w-4" />
            <span>Générer Dashboard</span>
          </button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'VUE D\'ENSEMBLE', icon: ChartBarIcon },
            { id: 'performance', label: 'PERFORMANCE', icon: ArrowTrendingUpIcon },
            { id: 'segmentation', label: 'SEGMENTATION', icon: ChartPieIcon },
            { id: 'tendances', label: 'TENDANCES', icon: ClockIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center py-3 px-1 border-b-2 font-medium text-sm ${
                  activeView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-6">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'performance' && renderPerformance()}
        {activeView === 'segmentation' && renderSegmentation()}
        {activeView === 'tendances' && renderTendances()}
      </div>
    </div>
  );
};

export default AnalyticsClientsWidget;


