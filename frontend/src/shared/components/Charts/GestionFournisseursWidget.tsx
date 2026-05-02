import React, { useState } from 'react';
import Card from '../UI/Card';
import {
  BuildingOfficeIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon, ChartBarIcon,
  ChartPieIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, DocumentTextIcon,
  DocumentArrowDownIcon, PrinterIcon, ClockIcon, ExclamationTriangleIcon,
  CheckCircleIcon, TagIcon, CurrencyDollarIcon, PhoneIcon, EnvelopeIcon,
  TruckIcon, StarIcon, CalendarIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
  ArcElement, BarElement, RadialLinearScale, Filler
} from 'chart.js';
import { useTheme } from '@core/context/ThemeContext';
import { useApp } from '@core/context/AppContext';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
  ArcElement, BarElement, RadialLinearScale, Filler
);

interface GestionFournisseursWidgetProps {
  period?: string;
}

const GestionFournisseursWidget: React.FC<GestionFournisseursWidgetProps> = ({ period = 'mois' }) => {
  const { formatCurrency, currentDevise } = useApp();
  const { currentTheme } = useTheme();
  const [activeView, setActiveView] = useState<'overview' | 'liste' | 'analytics' | 'gestion'>('overview');
  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Données de démonstration pour les fournisseurs
  const fournisseursData = [
    {
      id: '1',
      nom: 'Tech Solutions SARL',
      contact: 'Ahmed Benali',
      email: 'ahmed@techsolutions.dz',
      telephone: '+213 555 123 456',
      adresse: 'Alger, Algérie',
      specialite: 'Équipements informatiques',
      prix: 85000,
      delai: 3,
      qualite: 4.8,
      derniereCommande: '2024-01-15',
      statut: 'actif',
      articles: 45,
      chiffreAffaires: 3825000,
      evaluation: 'excellent'
    },
    {
      id: '2',
      nom: 'Office Supplies Co',
      contact: 'Fatima Khelil',
      email: 'fatima@officesupplies.dz',
      telephone: '+213 555 234 567',
      adresse: 'Oran, Algérie',
      specialite: 'Fournitures de bureau',
      prix: 45000,
      delai: 5,
      qualite: 4.2,
      derniereCommande: '2024-01-12',
      statut: 'actif',
      articles: 32,
      chiffreAffaires: 1500000,
      evaluation: 'bon'
    },
    {
      id: '3',
      nom: 'Furniture Plus',
      contact: 'Omar Cherif',
      email: 'omar@furnitureplus.dz',
      telephone: '+213 555 345 678',
      adresse: 'Constantine, Algérie',
      specialite: 'Mobilier de bureau',
      prix: 120000,
      delai: 7,
      qualite: 3.9,
      derniereCommande: '2024-01-10',
      statut: 'actif',
      articles: 28,
      chiffreAffaires: 1060000,
      evaluation: 'moyen'
    },
    {
      id: '4',
      nom: 'Mobile World',
      contact: 'Yasmine Boudjedra',
      email: 'yasmine@mobileworld.dz',
      telephone: '+213 555 456 789',
      adresse: 'Annaba, Algérie',
      specialite: 'Téléphonie mobile',
      prix: 125000,
      delai: 4,
      qualite: 4.5,
      derniereCommande: '2024-01-08',
      statut: 'actif',
      articles: 22,
      chiffreAffaires: 1430000,
      evaluation: 'bon'
    },
    {
      id: '5',
      nom: 'ElectroMax',
      contact: 'Karim Saadi',
      email: 'karim@electromax.dz',
      telephone: '+213 555 567 890',
      adresse: 'Blida, Algérie',
      specialite: 'Électronique grand public',
      prix: 95000,
      delai: 6,
      qualite: 3.7,
      derniereCommande: '2024-01-05',
      statut: 'attention',
      articles: 18,
      chiffreAffaires: 780000,
      evaluation: 'moyen'
    }
  ];

  const statsGenerales = {
    totalFournisseurs: fournisseursData.length,
    fournisseursActifs: fournisseursData.filter(f => f.statut === 'actif').length,
    fournisseursAttention: fournisseursData.filter(f => f.statut === 'attention').length,
    delaiMoyen: 5.0,
    qualiteMoyenne: 4.2,
    chiffreAffairesTotal: fournisseursData.reduce((sum, f) => sum + f.chiffreAffaires, 0)
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'actif': return 'text-green-600 bg-green-50 border-green-200';
      case 'attention': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'inactif': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'actif': return CheckCircleIcon;
      case 'attention': return ExclamationTriangleIcon;
      case 'inactif': return ClockIcon;
      default: return BuildingOfficeIcon;
    }
  };

  const getEvaluationColor = (evaluation: string) => {
    switch (evaluation) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'bon': return 'text-blue-600 bg-blue-50';
      case 'moyen': return 'text-yellow-600 bg-yellow-50';
      case 'faible': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Fonctions pour gérer les actions
  const handleViewDetails = (fournisseur: any) => {
    setSelectedFournisseur(fournisseur);
    setIsDetailModalOpen(true);
  };

  const handleEditFournisseur = (fournisseur: any) => {
    setSelectedFournisseur(fournisseur);
    setIsEditModalOpen(true);
  };

  const handleDeleteFournisseur = (fournisseurId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      console.log('Suppression du fournisseur:', fournisseurId);
    }
  };

  const handleAddFournisseur = () => {
    setIsAddModalOpen(true);
  };

  const handleExportFournisseurs = () => {
    console.log('Export des fournisseurs...');
  };

  const renderAnalytics = () => {
    // Données pour l'analyse financière des fournisseurs
    const performanceGlobale = {
      tauxPonctualite: 92.5,
      tauxConformite: 88.3,
      economiesRealisees: 285000,
      fournisseursExcellents: 2
    };

    // Performance par fournisseur (données enrichies)
    const performanceParFournisseur = {
      labels: fournisseursData.map(f => f.nom.split(' ')[0]),
      datasets: [
        {
          label: 'Note Globale',
          data: fournisseursData.map(f => f.qualite * 20),
          backgroundColor: 'rgba(71, 85, 105, 0.8)',
          borderColor: 'rgb(71, 85, 105)',
          borderWidth: 2
        }
      ]
    };

    // Évolution des coûts
    const evolutionCouts = {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
      datasets: [
        {
          label: 'Coûts Totaux',
          data: [850000, 920000, 880000, 950000, 1020000, 980000],
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Budget Prévu',
          data: [900000, 900000, 950000, 950000, 1000000, 1000000],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.4
        }
      ]
    };

    // Répartition des achats
    const repartitionAchats = {
      labels: fournisseursData.map(f => f.nom.split(' ')[0]),
      datasets: [{
        data: fournisseursData.map(f => f.chiffreAffaires),
        backgroundColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(139, 92, 246)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)'
        ],
        borderWidth: 0
      }]
    };

    // Performance comparative (Radar)
    const performanceComparative = {
      labels: ['Ponctualité', 'Qualité', 'Prix', 'Flexibilité', 'Service'],
      datasets: fournisseursData.slice(0, 3).map((f, index) => {
        const colors = [
          { border: 'rgb(59, 130, 246)', bg: 'rgba(59, 130, 246, 0.2)' },
          { border: 'rgb(16, 185, 129)', bg: 'rgba(16, 185, 129, 0.2)' },
          { border: 'rgb(139, 92, 246)', bg: 'rgba(139, 92, 246, 0.2)' }
        ];
        return {
          label: f.nom.split(' ')[0],
          data: [
            (10 - f.delai) * 10,
            f.qualite * 20,
            85 - (index * 10),
            75 + (index * 5),
            80 + (index * 3)
          ],
          borderColor: colors[index].border,
          backgroundColor: colors[index].bg,
          borderWidth: 2
        };
      })
    };

    return (
      <div className="space-y-6">
        {/* En-tête - Palette Slate */}
        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <div className="bg-slate-700 dark:bg-slate-600 p-2 rounded-lg mr-3">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                Analytics Fournisseurs
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 ml-14 mt-1">Analyse approfondie des performances et risques</p>
            </div>
            <button 
              onClick={handleExportFournisseurs}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg flex items-center space-x-2 transition-colors text-sm"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        {/* KPIs Fournisseurs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 rounded-xl border border-blue-200 dark:border-blue-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-lg">
                  <ClockIcon className="h-5 w-5 text-white" />
                </div>
                <CheckCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{performanceGlobale.tauxPonctualite}%</div>
              <div className="text-sm text-blue-700 dark:text-blue-300 font-medium mt-1">Taux de Ponctualité</div>
              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                <span className="font-semibold">Excellent</span> - 4/5 fournisseurs
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-5 rounded-xl border border-emerald-200 dark:border-emerald-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-400/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-emerald-600 dark:bg-emerald-500 p-2 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-white" />
                </div>
                <StarIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{performanceGlobale.tauxConformite}%</div>
              <div className="text-sm text-emerald-700 dark:text-emerald-300 font-medium mt-1">Taux de Conformité</div>
              <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                <span className="font-semibold">+5.2%</span> vs trimestre dernier
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 p-5 rounded-xl border border-violet-200 dark:border-violet-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-violet-400/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-violet-600 dark:bg-violet-500 p-2 rounded-lg">
                  <CurrencyDollarIcon className="h-5 w-5 text-white" />
                </div>
                <ArrowTrendingDownIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div className="text-3xl font-bold text-violet-900 dark:text-violet-100">{formatCurrency(performanceGlobale.economiesRealisees)}</div>
              <div className="text-sm text-violet-700 dark:text-violet-300 font-medium mt-1">Économies Réalisées</div>
              <div className="mt-2 text-xs text-violet-600 dark:text-violet-400">
                <span className="font-semibold">Négociations réussies</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-5 rounded-xl border border-amber-200 dark:border-amber-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-400/10 rounded-full -mr-10 -mt-10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-amber-600 dark:bg-amber-500 p-2 rounded-lg">
                  <StarIcon className="h-5 w-5 text-white" />
                </div>
                <TruckIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">{performanceGlobale.fournisseursExcellents}</div>
              <div className="text-sm text-amber-700 dark:text-amber-300 font-medium mt-1">Fournisseurs Excellents</div>
              <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                <span className="font-semibold">Note ≥ 4.5/5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance par fournisseur */}
          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-md font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded mr-2">
                  <ChartBarIcon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                </div>
                Performance par Fournisseur
              </h5>
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Note /100</span>
            </div>
            <div className="h-72">
              <Bar
                data={performanceParFournisseur}
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
                      max: 100,
                      ticks: {
                        callback: function(value) {
                          return value + '/100';
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </Card>

          {/* Répartition des achats */}
          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-md font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded mr-2">
                  <CurrencyDollarIcon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                </div>
                Répartition des Achats
              </h5>
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">CA par fournisseur</span>
            </div>
            <div className="h-72">
              <Doughnut
                data={repartitionAchats}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right' as const,
                    },
                  },
                }}
              />
            </div>
          </Card>
        </div>

        {/* Graphiques avancés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution des coûts */}
          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-md font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded mr-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                </div>
                Évolution des Coûts
              </h5>
              <div className="flex items-center space-x-2">
                <span className="flex items-center text-xs text-red-600 dark:text-red-400">
                  <div className="w-3 h-3 bg-red-600 rounded-full mr-1"></div>
                  Réel
                </span>
                <span className="flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                  <div className="w-3 h-1 bg-emerald-600 mr-1"></div>
                  Budget
                </span>
              </div>
            </div>
            <div className="h-64">
              <Line
                data={evolutionCouts}
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

          {/* Performance comparative */}
          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-md font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded mr-2">
                  <StarIcon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                </div>
                Comparaison Top 3
              </h5>
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">5 critères</span>
            </div>
            <div className="h-64">
              <Radar
                data={performanceComparative}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
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

        {/* Tableau de synthèse enrichi */}
        <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-md font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded mr-2">
                <BuildingOfficeIcon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
              </div>
              Analyse Détaillée par Fournisseur
            </h5>
            <span className="text-xs text-slate-500 dark:text-slate-400">{fournisseursData.length} fournisseurs</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Fournisseur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">CA Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Articles</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Délai</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Qualité</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {fournisseursData.map((fournisseur, index) => {
                  const scoreGlobal = ((fournisseur.qualite * 20 + (10 - fournisseur.delai) * 10) / 2).toFixed(1);
                  return (
                    <tr key={fournisseur.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                            index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white' :
                            index === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white' :
                            'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                          }`}>
                            #{index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fournisseur.nom}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{fournisseur.specialite}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatCurrency(fournisseur.chiffreAffaires)}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {((fournisseur.chiffreAffaires / statsGenerales.chiffreAffairesTotal) * 100).toFixed(1)}% du total
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{fournisseur.articles}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <span className={`text-sm font-medium ${
                            fournisseur.delai <= 4 ? 'text-emerald-600 dark:text-emerald-400' :
                            fournisseur.delai <= 6 ? 'text-amber-600 dark:text-amber-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {fournisseur.delai}j
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <StarIcon className="h-4 w-4 text-amber-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{fournisseur.qualite}/5</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2 w-20">
                            <div 
                              className={`h-full rounded-full ${
                                parseFloat(scoreGlobal) >= 80 ? 'bg-emerald-600' :
                                parseFloat(scoreGlobal) >= 60 ? 'bg-blue-600' :
                                parseFloat(scoreGlobal) >= 40 ? 'bg-amber-600' :
                                'bg-red-600'
                              }`}
                              style={{ width: `${scoreGlobal}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{scoreGlobal}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Insights et Recommandations */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 p-6 rounded-xl border border-slate-200 dark:border-slate-600">
          <div className="flex items-start space-x-3">
            <div className="bg-slate-700 dark:bg-slate-600 p-2 rounded-lg flex-shrink-0">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">💡 Insights & Actions Recommandées</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1 rounded">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Performance</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">Tech Solutions SARL</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-2">Meilleur fournisseur (4.8/5)</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">48% du CA total - Partenaire stratégique</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-1 rounded">
                      <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">À surveiller</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">ElectroMax</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">Performance en baisse (3.7/5)</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Audit qualité recommandé</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded">
                      <TruckIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Optimisation</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">Délais de Livraison</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-2">Délai moyen: 5 jours</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Négocier délais plus courts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risques et Opportunités */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-red-200 dark:border-red-700">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <h5 className="text-md font-bold text-gray-900 dark:text-gray-100">⚠️ Risques Identifiés</h5>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                <p className="text-sm font-semibold text-red-900 dark:text-red-100">Dépendance excessive</p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">Tech Solutions: 48% du volume total</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">→ Diversifier les sources d'approvisionnement</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Délais longs</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Furniture Plus: 7 jours en moyenne</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">→ Revoir les conditions contractuelles</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h5 className="text-md font-bold text-gray-900 dark:text-gray-100">✨ Opportunités</h5>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Négociation volumes</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">Potentiel économie: 15-20%</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">→ Contrats annuels avec engagement volumes</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Nouveaux partenariats</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">3 fournisseurs en prospection</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">→ Élargir le panel fournisseurs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Fournisseurs</p>
              <p className="text-2xl font-bold text-blue-800">{statsGenerales.totalFournisseurs}</p>
              <p className="text-xs text-gray-500">Fournisseurs actifs</p>
            </div>
            <BuildingOfficeIcon className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Délai Moyen</p>
              <p className="text-2xl font-bold text-green-800">{statsGenerales.delaiMoyen}j</p>
              <p className="text-xs text-gray-500">Livraison</p>
            </div>
            <TruckIcon className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Qualité Moyenne</p>
              <p className="text-2xl font-bold text-purple-800">{statsGenerales.qualiteMoyenne}/5</p>
              <p className="text-xs text-gray-500">Évaluation</p>
            </div>
            <StarIcon className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">CA Total</p>
              <p className="text-2xl font-bold text-orange-800">{formatCurrency(statsGenerales.chiffreAffairesTotal)}</p>
              <p className="text-xs text-gray-500">{currentDevise || 'DA'}</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Liste des fournisseurs */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Fournisseurs par Article</h4>
          <button
            onClick={handleAddFournisseur}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nouveau Fournisseur</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Délai (jours)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière Commande</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fournisseursData.map((fournisseur) => {
                const StatutIcon = getStatutIcon(fournisseur.statut);
                return (
                  <tr key={fournisseur.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{fournisseur.nom}</div>
                          <div className="text-sm text-gray-500">{fournisseur.specialite}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(fournisseur.prix)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <TruckIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{fournisseur.delai}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-900">{fournisseur.qualite}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fournisseur.derniereCommande}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewDetails(fournisseur)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditFournisseur(fournisseur)}
                          className="text-green-600 hover:text-green-900"
                          title="Modifier"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteFournisseur(fournisseur.id)}
                          className="text-red-600 hover:text-red-900"
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
    </div>
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestion des Fournisseurs</h2>
          <p className="text-sm text-gray-600">Gestion complète des fournisseurs et analyses de performance</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleExportFournisseurs}
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
            { id: 'overview', name: 'Vue d\'ensemble', icon: BuildingOfficeIcon },
            { id: 'liste', name: 'Liste Complète', icon: DocumentTextIcon },
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
        {activeView === 'liste' && renderOverview()}
        {activeView === 'analytics' && renderAnalytics()}
        {activeView === 'gestion' && <div>Gestion en cours de développement...</div>}
      </div>
    </div>
  );
};

export default GestionFournisseursWidget;


