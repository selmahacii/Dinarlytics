import React, { useState } from 'react';
import Card from '../UI/Card';
import {
  CurrencyDollarIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon, ChartBarIcon,
  ChartPieIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, DocumentTextIcon,
  DocumentArrowDownIcon, PrinterIcon, ClockIcon, ExclamationTriangleIcon,
  CheckCircleIcon, TagIcon, BuildingOfficeIcon, CalendarIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
  ArcElement, BarElement, RadialLinearScale, Filler
} from 'chart.js';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
  ArcElement, BarElement, RadialLinearScale, Filler
);

interface GestionTarifsWidgetProps {
  period?: string;
}

const GestionTarifsWidget: React.FC<GestionTarifsWidgetProps> = ({ period = 'mois' }) => {
  const { formatCurrency } = useApp();
  const { currentTheme } = useTheme();
  const [activeView, setActiveView] = useState<'overview' | 'historique' | 'analytics' | 'gestion'>('overview');
  const [selectedPricing, setSelectedPricing] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Données de démonstration pour l'historique des prix
  const pricingHistory = [
    {
      id: '1',
      article: 'Ordinateur Portable Dell',
      code: 'PC-DELL-001',
      date: '2024-01-15',
      prix: 85000,
      ancienPrix: 82000,
      variation: '+3.7%',
      raison: 'Augmentation des coûts matières premières',
      responsable: 'Ahmed Benali',
      statut: 'appliqué'
    },
    {
      id: '2',
      article: 'Chaise de Bureau Ergonomique',
      code: 'CHAIR-ERG-001',
      date: '2024-01-12',
      prix: 45000,
      ancienPrix: 48000,
      variation: '-6.3%',
      raison: 'Promotion commerciale',
      responsable: 'Fatima Khelil',
      statut: 'appliqué'
    },
    {
      id: '3',
      article: 'Smartphone Samsung Galaxy',
      code: 'PHONE-SAM-001',
      date: '2024-01-10',
      prix: 125000,
      ancienPrix: 130000,
      variation: '-3.8%',
      raison: 'Concurrence marché',
      responsable: 'Omar Cherif',
      statut: 'appliqué'
    },
    {
      id: '4',
      article: 'Tablette iPad Pro',
      code: 'TAB-IPAD-001',
      date: '2024-01-08',
      prix: 180000,
      ancienPrix: 175000,
      variation: '+2.9%',
      raison: 'Nouvelle version',
      responsable: 'Yasmine Boudjedra',
      statut: 'en_attente'
    },
    {
      id: '5',
      article: 'Écran 27" 4K',
      code: 'MON-4K-001',
      date: '2024-01-05',
      prix: 95000,
      ancienPrix: 90000,
      variation: '+5.6%',
      raison: 'Inflation générale',
      responsable: 'Karim Saadi',
      statut: 'appliqué'
    }
  ];

  const statsGenerales = {
    totalModifications: pricingHistory.length,
    modificationsAppliqees: pricingHistory.filter(p => p.statut === 'appliqué').length,
    modificationsEnAttente: pricingHistory.filter(p => p.statut === 'en_attente').length,
    augmentationMoyenne: 2.1,
    diminutionMoyenne: -4.2,
    impactTotal: 125000
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'appliqué': return 'text-green-600 bg-green-50 border-green-200';
      case 'en_attente': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'annulé': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'appliqué': return CheckCircleIcon;
      case 'en_attente': return ClockIcon;
      case 'annulé': return ExclamationTriangleIcon;
      default: return CurrencyDollarIcon;
    }
  };

  // Fonctions pour gérer les actions
  const handleViewDetails = (pricing: any) => {
    setSelectedPricing(pricing);
    setIsDetailModalOpen(true);
  };

  const handleEditPricing = (pricing: any) => {
    setSelectedPricing(pricing);
    setIsEditModalOpen(true);
  };

  const handleDeletePricing = (pricingId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette modification de prix ?')) {
      console.log('Suppression de la modification:', pricingId);
    }
  };

  const handleAddPricing = () => {
    setIsAddModalOpen(true);
  };

  const handleExportPricing = () => {
    console.log('Export de l\'historique des prix...');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Modifications</p>
              <p className="text-2xl font-bold text-blue-800">{statsGenerales.totalModifications}</p>
              <p className="text-xs text-gray-500">Ce mois</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Appliquées</p>
              <p className="text-2xl font-bold text-green-800">{statsGenerales.modificationsAppliqees}</p>
              <p className="text-xs text-gray-500">Prix mis à jour</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">En Attente</p>
              <p className="text-2xl font-bold text-yellow-800">{statsGenerales.modificationsEnAttente}</p>
              <p className="text-xs text-gray-500">Validation requise</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Impact Total</p>
              <p className="text-2xl font-bold text-purple-800">{formatCurrency(statsGenerales.impactTotal)}</p>
              <p className="text-xs text-gray-500">دج</p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Historique récent */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Modifications Récentes</h4>
          <button
            onClick={handleAddPricing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nouvelle Modification</span>
          </button>
        </div>

        <div className="space-y-3">
          {pricingHistory.slice(0, 5).map((pricing) => {
            const StatutIcon = getStatutIcon(pricing.statut);
            return (
              <div key={pricing.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <StatutIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pricing.article}</p>
                      <p className="text-xs text-gray-500">{pricing.code} • {pricing.date}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getStatutColor(pricing.statut)}`}>
                    {pricing.statut.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Nouveau Prix</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(pricing.prix)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ancien Prix</p>
                    <p className="text-sm text-gray-600">{formatCurrency(pricing.ancienPrix)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Variation</p>
                    <p className={`text-sm font-medium ${pricing.variation.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {pricing.variation}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Raison: {pricing.raison} • Par: {pricing.responsable}
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleViewDetails(pricing)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Voir les détails"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleEditPricing(pricing)}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                      title="Modifier"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeletePricing(pricing.id)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Supprimer"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  const renderHistorique = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">Historique Complet des Prix</h4>
      
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h5 className="text-md font-semibold text-gray-900">Toutes les Modifications</h5>
          <div className="flex space-x-2">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="tous">Tous les statuts</option>
              <option value="appliqué">Appliquées</option>
              <option value="en_attente">En attente</option>
              <option value="annulé">Annulées</option>
            </select>
            <button 
              onClick={handleExportPricing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Article</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ancien Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nouveau Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Raison</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pricingHistory.map((pricing) => {
                const StatutIcon = getStatutIcon(pricing.statut);
                return (
                  <tr key={pricing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pricing.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{pricing.article}</div>
                        <div className="text-sm text-gray-500">{pricing.code}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(pricing.ancienPrix)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(pricing.prix)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        pricing.variation.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {pricing.variation.startsWith('+') ? <ArrowTrendingUpIcon className="h-3 w-3 mr-1" /> : <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />}
                        {pricing.variation}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {pricing.raison}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(pricing.statut)}`}>
                        <StatutIcon className="h-3 w-3 mr-1" />
                        {pricing.statut.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewDetails(pricing)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditPricing(pricing)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <PencilIcon className="h-4 w-4" />
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
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">Analyses des Prix</h4>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Évolution des Prix (6 derniers mois)</h5>
          <div className="h-64">
            <Line
              data={{
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
                datasets: [{
                  label: 'Prix Moyen',
                  data: [85000, 87000, 86000, 88000, 90000, 92000],
                  borderColor: '#3B82F6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  tension: 0.4
                }, {
                  label: 'Prix Minimum',
                  data: [45000, 46000, 45000, 47000, 48000, 49000],
                  borderColor: '#10B981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  tension: 0.4
                }, {
                  label: 'Prix Maximum',
                  data: [180000, 185000, 182000, 188000, 190000, 195000],
                  borderColor: '#EF4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  tension: 0.4
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
          <h5 className="text-md font-semibold text-gray-900 mb-4">Répartition des Variations</h5>
          <div className="h-64">
            <Doughnut
              data={{
                labels: ['Augmentations', 'Diminutions', 'Stables'],
                datasets: [{
                  data: [3, 2, 0],
                  backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(156, 163, 175, 0.8)'
                  ],
                  borderColor: [
                    '#DC2626',
                    '#059669',
                    '#6B7280'
                  ],
                  borderWidth: 2
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Impact par Catégorie</h5>
          <div className="h-64">
            <Bar
              data={{
                labels: ['Informatique', 'Mobilier', 'Téléphonie', 'Électronique', 'Accessoires'],
                datasets: [{
                  label: 'Impact Financier (DA)',
                  data: [45000, -15000, -25000, 35000, 10000],
                  backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                  ],
                  borderColor: [
                    '#DC2626',
                    '#059669',
                    '#059669',
                    '#DC2626',
                    '#DC2626'
                  ],
                  borderWidth: 2
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
          <h5 className="text-md font-semibold text-gray-900 mb-4">Tendances des Modifications</h5>
          <div className="h-64">
            <Bar
              data={{
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
                datasets: [{
                  label: 'Modifications',
                  data: [8, 12, 6, 15, 10, 5],
                  backgroundColor: 'rgba(59, 130, 246, 0.8)',
                  borderColor: '#2563EB',
                  borderWidth: 2
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
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Nombre de modifications'
                    }
                  }
                }
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );

  const renderGestion = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">Gestion Avancée des Tarifs</h4>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Actions Rapides</h5>
          <div className="space-y-3">
            <button 
              onClick={handleAddPricing}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nouvelle Modification de Prix
            </button>
            <button 
              onClick={handleExportPricing}
              className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Exporter l'Historique
            </button>
            <button 
              onClick={() => console.log('Impression de l\'historique...')}
              className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <PrinterIcon className="h-5 w-5 mr-2" />
              Imprimer le Rapport
            </button>
          </div>
        </Card>

        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Statistiques Rapides</h5>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Modifications ce Mois</span>
              <span className="text-sm font-medium text-gray-900">{statsGenerales.totalModifications}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Appliquées</span>
              <span className="text-sm font-medium text-gray-900">{statsGenerales.modificationsAppliqees}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">En Attente</span>
              <span className="text-sm font-medium text-gray-900">{statsGenerales.modificationsEnAttente}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Augmentation Moyenne</span>
              <span className="text-sm font-medium text-red-600">+{statsGenerales.augmentationMoyenne}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Diminution Moyenne</span>
              <span className="text-sm font-medium text-green-600">{statsGenerales.diminutionMoyenne}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Impact Total</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(statsGenerales.impactTotal)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestion des Tarifs</h2>
          <p className="text-sm text-gray-600">Historique et gestion complète des modifications de prix</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleExportPricing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Exporter</span>
          </button>
          <button 
            onClick={() => console.log('Impression du rapport...')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <PrinterIcon className="h-4 w-4" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', name: 'Vue d\'ensemble', icon: CurrencyDollarIcon },
            { id: 'historique', name: 'Historique', icon: ClockIcon },
            { id: 'analytics', name: 'Analyses', icon: ChartBarIcon },
            { id: 'gestion', name: 'Gestion', icon: PencilIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-6">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'historique' && renderHistorique()}
        {activeView === 'analytics' && renderAnalytics()}
        {activeView === 'gestion' && renderGestion()}
      </div>

      {/* Modales */}
      {isDetailModalOpen && selectedPricing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Détails de la Modification</h3>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Article</label>
                  <p className="text-sm text-gray-900">{selectedPricing.article}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code</label>
                  <p className="text-sm text-gray-900">{selectedPricing.code}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ancien Prix</label>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedPricing.ancienPrix)} دج</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nouveau Prix</label>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedPricing.prix)} دج</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Variation</label>
                  <p className={`text-lg font-bold ${selectedPricing.variation.startsWith('+') ? 'text-red-600' : 'text-green-600'}`}>
                    {selectedPricing.variation}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="text-sm text-gray-900">{selectedPricing.date}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Raison</label>
                <p className="text-sm text-gray-900">{selectedPricing.raison}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Responsable</label>
                  <p className="text-sm text-gray-900">{selectedPricing.responsable}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getStatutColor(selectedPricing.statut)}`}>
                    {selectedPricing.statut.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Fermer
              </button>
              <button 
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleEditPricing(selectedPricing);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {isEditModalOpen && selectedPricing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Modifier le Prix</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nouveau Prix (DA)</label>
                  <input 
                    type="number" 
                    defaultValue={selectedPricing.prix}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <select 
                    defaultValue={selectedPricing.statut}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="appliqué">Appliqué</option>
                    <option value="en_attente">En Attente</option>
                    <option value="annulé">Annulé</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Raison</label>
                <textarea 
                  defaultValue={selectedPricing.raison}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button 
                onClick={() => {
                  console.log('Sauvegarde des modifications pour:', selectedPricing.id);
                  setIsEditModalOpen(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'ajout */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nouvelle Modification de Prix</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Article</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Sélectionner un article</option>
                    <option value="PC-DELL-001">Ordinateur Portable Dell</option>
                    <option value="CHAIR-ERG-001">Chaise de Bureau Ergonomique</option>
                    <option value="PHONE-SAM-001">Smartphone Samsung Galaxy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nouveau Prix (DA)</label>
                  <input 
                    type="number" 
                    placeholder="Ex: 85000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Raison</label>
                <textarea 
                  placeholder="Ex: Augmentation des coûts matières premières"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button 
                onClick={() => {
                  console.log('Création d\'une nouvelle modification de prix...');
                  setIsAddModalOpen(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionTarifsWidget;
