import React, { useState } from 'react';
import {
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  FunnelIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut, PolarArea, Radar, Bubble } from 'react-chartjs-2';
import { useTheme } from '@core/context/ThemeContext';
import { useApp } from '@core/context/AppContext';
import Card from '../UI/Card';

interface AnalysesVisuellesWidgetProps {
  period?: string;
}

const AnalysesVisuellesWidget: React.FC<AnalysesVisuellesWidgetProps> = ({ period = 'mois' }) => {
  const { formatCurrency, currentDevise } = useApp();
  const { currentTheme } = useTheme();
  const [selectedGraph, setSelectedGraph] = useState<string>('ventes-secteur');

  // Données de démonstration pour les analyses visuelles
  const ventesParSecteur = {
    labels: ['Technologie', 'Industrie', 'Services', 'Commerce', 'Santé', 'Éducation'],
    datasets: [{
      label: `Chiffre d'Affaires (${currentDevise || 'DA'})`,
      data: [850000, 720000, 450000, 380000, 280000, 150000],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      borderColor: [
        '#2563EB',
        '#059669',
        '#D97706',
        '#DC2626',
        '#7C3AED',
        '#DB2777'
      ],
      borderWidth: 2
    }]
  };

  const repartitionPaiements = {
    labels: ['Espèces', 'Virement', 'Chèque', 'Carte Bancaire', 'Autres'],
    datasets: [{
      data: [35, 28, 20, 12, 5],
      backgroundColor: [
        '#10B981',
        '#3B82F6',
        '#F59E0B',
        '#EF4444',
        '#8B5CF6'
      ],
      borderColor: [
        '#059669',
        '#2563EB',
        '#D97706',
        '#DC2626',
        '#7C3AED'
      ],
      borderWidth: 2
    }]
  };

  const evolutionVentes = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [{
      label: `Ventes (${currentDevise || 'DA'})`,
      data: [2100000, 2250000, 2180000, 2400000, 2320000, 2450000],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#2563EB',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6
    }, {
      label: `Objectif (${currentDevise || 'DA'})`,
      data: [2000000, 2200000, 2200000, 2300000, 2300000, 2400000],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      borderDash: [5, 5],
      pointBackgroundColor: '#059669',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4
    }]
  };

  const performanceClients = {
    labels: ['Fidélité', 'Fréquence', 'Montant', 'Satisfaction', 'Ponctualité'],
    datasets: [{
      label: 'Performance Moyenne',
      data: [78, 85, 72, 88, 75],
      borderColor: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderWidth: 2,
      pointBackgroundColor: '#2563EB',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6
    }, {
      label: 'Objectifs',
      data: [80, 80, 80, 80, 80],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      borderWidth: 2,
      borderDash: [5, 5],
      pointBackgroundColor: '#059669',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 4
    }]
  };

  const repartitionGeographique = {
    labels: ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Autres'],
    datasets: [{
      data: [450, 280, 200, 150, 120, 50],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      borderColor: [
        '#2563EB',
        '#059669',
        '#D97706',
        '#DC2626',
        '#7C3AED',
        '#DB2777'
      ],
      borderWidth: 2
    }]
  };

  const tendancesPaiements = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [{
      label: 'Paiements à l\'Échéance',
      data: [85, 88, 82, 90, 87, 92],
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true
    }, {
      label: 'Retards de Paiement',
      data: [15, 12, 18, 10, 13, 8],
      borderColor: '#EF4444',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const graphiques = [
    {
      id: 'ventes-secteur',
      titre: 'Ventes par Secteur d\'Activit\u00e9',
      type: 'barre',
      description: 'Répartition du chiffre d\'affaires par secteur',
      data: ventesParSecteur,
      component: Bar,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return formatCurrency(value);
              }
            }
          }
        }
      }
    },
    {
      id: 'repartition-paiements',
      titre: 'Répartition des Paiements',
      type: 'camembert',
      description: 'Distribution des modes de paiement',
      data: repartitionPaiements,
      component: Doughnut,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom' as const,
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                return `${context.label}: ${context.parsed}%`;
              }
            }
          }
        }
      }
    },
    {
      id: 'evolution-ventes',
      titre: 'Évolution des Ventes (6 derniers mois)',
      type: 'ligne',
      description: 'Tendance des ventes et objectifs',
      data: evolutionVentes,
      component: Line,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return formatCurrency(value);
              }
            }
          }
        }
      }
    },
    {
      id: 'performance-clients',
      titre: 'Performance Clients (Radar)',
      type: 'radar',
      description: 'Analyse multidimensionnelle des clients',
      data: performanceClients,
      component: Radar,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20
            }
          }
        }
      }
    },
    {
      id: 'repartition-geographique',
      titre: 'Répartition Géographique',
      type: 'polar',
      description: 'Distribution des clients par région',
      data: repartitionGeographique,
      component: PolarArea,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom' as const,
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                return `${context.label}: ${context.parsed} clients`;
              }
            }
          }
        }
      }
    },
    {
      id: 'tendances-paiements',
      titre: 'Tendances des Paiements',
      type: 'ligne',
      description: 'Évolution des paiements à l\'échéance vs retards',
      data: tendancesPaiements,
      component: Line,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                return `${context.dataset.label}: ${context.parsed.y}%`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value: any) {
                return `${value}%`;
              }
            }
          }
        }
      }
    }
  ];

  const getGraphIcon = (type: string) => {
    switch (type) {
      case 'barre': return ChartBarIcon;
      case 'camembert': return ChartPieIcon;
      case 'ligne': return ArrowTrendingUpIcon;
      case 'radar': return ChartBarIcon;
      case 'polar': return ChartPieIcon;
      default: return ChartBarIcon;
    }
  };

  const selectedGraphData = graphiques.find(g => g.id === selectedGraph);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Analyses Visuelles</h2>
          <p className="text-sm text-gray-600">Graphiques interactifs et analyses détaillées</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Exporter</span>
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <PrinterIcon className="h-4 w-4" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Liste des graphiques */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Graphiques Disponibles</h3>
            <div className="space-y-2">
              {graphiques.map((graphique) => {
                const Icon = getGraphIcon(graphique.type);
                return (
                  <button
                    key={graphique.id}
                    onClick={() => setSelectedGraph(graphique.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${
                      selectedGraph === graphique.id 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">{graphique.titre}</h4>
                        <p className="text-xs text-gray-500">{graphique.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Graphique sélectionné */}
        <div className="lg:col-span-3">
          {selectedGraphData && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedGraphData.titre}</h3>
                  <p className="text-sm text-gray-600">{selectedGraphData.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                    <DocumentArrowDownIcon className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                    <PrinterIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="h-96">
                <selectedGraphData.component
                  data={selectedGraphData.data}
                  options={selectedGraphData.options}
                />
              </div>

              {/* Statistiques du graphique */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedGraphData.id === 'ventes-secteur' && (
                  <>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Total CA</p>
                      <p className="text-lg font-bold text-blue-800">{formatCurrency(2830000)}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Meilleur Secteur</p>
                      <p className="text-lg font-bold text-green-800">Technologie</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">Secteurs</p>
                      <p className="text-lg font-bold text-purple-800">6</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-600 font-medium">Moyenne</p>
                      <p className="text-lg font-bold text-orange-800">{formatCurrency(471667)}</p>
                    </div>
                  </>
                )}
                {selectedGraphData.id === 'repartition-paiements' && (
                  <>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Espèces</p>
                      <p className="text-lg font-bold text-green-800">35%</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Virement</p>
                      <p className="text-lg font-bold text-blue-800">28%</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-yellow-600 font-medium">Chèque</p>
                      <p className="text-lg font-bold text-yellow-800">20%</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600 font-medium">Carte</p>
                      <p className="text-lg font-bold text-red-800">12%</p>
                    </div>
                  </>
                )}
                {selectedGraphData.id === 'evolution-ventes' && (
                  <>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">CA Actuel</p>
                      <p className="text-lg font-bold text-blue-800">{formatCurrency(2450000)}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Objectif</p>
                      <p className="text-lg font-bold text-green-800">{formatCurrency(2400000)}</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">Évolution</p>
                      <p className="text-lg font-bold text-purple-800">+2.1%</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-sm text-orange-600 font-medium">Moyenne</p>
                      <p className="text-lg font-bold text-orange-800">{formatCurrency(2283333)}</p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysesVisuellesWidget;


