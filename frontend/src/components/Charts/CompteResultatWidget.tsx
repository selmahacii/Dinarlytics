import React, { useState } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  CalculatorIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BanknotesIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { Line, Bar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';

interface CompteResultatWidgetProps {
  data: {
    chiffre_affaires: number;
    achats: number;
    charges_personnel: number;
    charges_exploitation: number;
    dotations_amortissements: number;
    resultat_exploitation: number;
    resultat_financier: number;
    resultat_exceptionnel: number;
    impot_societes: number;
    resultat_net: number;
  };
  period: string;
  previousData?: {
    chiffre_affaires: number;
    resultat_exploitation: number;
    resultat_net: number;
  };
}

const CompteResultatWidget: React.FC<CompteResultatWidgetProps> = ({ data, period, previousData }) => {
  const { currentTheme } = useTheme();
  const { formatCurrency } = useApp();
  const [activeView, setActiveView] = useState<'details' | 'evolution' | 'analyse'>('details');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['produits', 'charges']));

  // Calculs des variations
  const variationCA = previousData ? 
    ((data.chiffre_affaires - previousData.chiffre_affaires) / previousData.chiffre_affaires) * 100 : 0;
  const variationRE = previousData ? 
    ((data.resultat_exploitation - previousData.resultat_exploitation) / Math.abs(previousData.resultat_exploitation)) * 100 : 0;
  const variationRN = previousData ? 
    ((data.resultat_net - previousData.resultat_net) / Math.abs(previousData.resultat_net)) * 100 : 0;

  // Calculs des ratios
  const margeBrute = ((data.chiffre_affaires + data.achats) / data.chiffre_affaires) * 100;
  const margeExploitation = (data.resultat_exploitation / data.chiffre_affaires) * 100;
  const margeNette = (data.resultat_net / data.chiffre_affaires) * 100;
  const tauxChargesPersonnel = (Math.abs(data.charges_personnel) / data.chiffre_affaires) * 100;
  const tauxChargesExploitation = (Math.abs(data.charges_exploitation) / data.chiffre_affaires) * 100;

  // Données pour les graphiques
  const evolutionData = {
    labels: ['Période Précédente', 'Période Actuelle'],
    datasets: [
      {
        label: 'Chiffre d\'Affaires',
        data: previousData ? [previousData.chiffre_affaires, data.chiffre_affaires] : [0, data.chiffre_affaires],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Résultat d\'Exploitation',
        data: previousData ? [previousData.resultat_exploitation, data.resultat_exploitation] : [0, data.resultat_exploitation],
        borderColor: 'rgba(51, 65, 85, 1)',
        backgroundColor: 'rgba(51, 65, 85, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Résultat Net',
        data: previousData ? [previousData.resultat_net, data.resultat_net] : [0, data.resultat_net],
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const repartitionChargesData = {
    labels: ['Personnel', 'Exploitation', 'Amortissements', 'Autres'],
    datasets: [{
      data: [
        Math.abs(data.charges_personnel),
        Math.abs(data.charges_exploitation),
        Math.abs(data.dotations_amortissements),
        Math.abs(data.achats)
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(51, 65, 85, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ],
      borderColor: [
        'rgba(239, 68, 68, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(51, 65, 85, 1)',
        'rgba(139, 92, 246, 1)'
      ],
      borderWidth: 2
    }]
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getVariationColor = (variation: number) => {
    return variation >= 0 ? 'text-emerald-600' : 'text-red-600';
  };

  const getVariationIcon = (variation: number) => {
    return variation >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  };

  const getStatusColor = (value: number, threshold: number, isPositive: boolean = true) => {
    if (isPositive) {
      return value >= threshold ? 'text-emerald-600' : 'text-amber-600';
    } else {
      return value <= threshold ? 'text-emerald-600' : 'text-red-600';
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* En-tête du widget */}
      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-800">Compte de Résultat</h3>
              <p className="text-sm text-emerald-600">Période {period}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-200 rounded-lg transition-colors">
              <EyeIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-200 rounded-lg transition-colors">
              <DocumentArrowDownIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-200 rounded-lg transition-colors">
              <PrinterIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'details', label: 'DÉTAILS', icon: CalculatorIcon, color: 'emerald' },
            { id: 'evolution', label: 'ÉVOLUTION', icon: ArrowTrendingUpIcon, color: 'blue' },
            { id: 'analyse', label: 'ANALYSE', icon: ChartBarIcon, color: 'purple' }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === tab.id
                    ? `border-${tab.color}-500 text-${tab.color}-600`
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="p-6">
        {activeView === 'details' && (
          <div className="space-y-6">
            {/* Résultat Net - Indicateur principal */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CurrencyDollarIcon className="h-8 w-8 text-emerald-600" />
                  <div>
                    <h4 className="text-xl font-bold text-emerald-800">RÉSULTAT NET</h4>
                    <p className="text-sm text-emerald-600">Bénéfice ou perte de l'exercice</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-emerald-800">{formatCurrency(data.resultat_net)}</p>
                  {previousData && (
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      {(() => {
                        const VariationIcon = getVariationIcon(variationRN);
                        return <VariationIcon className={`h-4 w-4 ${getVariationColor(variationRN)}`} />;
                      })()}
                      <span className={`text-sm font-medium ${getVariationColor(variationRN)}`}>
                        {variationRN >= 0 ? '+' : ''}{variationRN.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Produits */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('produits')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-slate-800">PRODUITS</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600">{formatCurrency(data.chiffre_affaires)}</span>
                  <ArrowTrendingUpIcon className={`h-4 w-4 text-slate-400 transition-transform ${
                    expandedSections.has('produits') ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>
              {expandedSections.has('produits') && (
                <div className="px-4 pb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Chiffre d'affaires:</span>
                    <span className="font-medium text-emerald-600">{formatCurrency(data.chiffre_affaires)}</span>
                  </div>
                  {previousData && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Variation:</span>
                      <span className={`font-medium ${getVariationColor(variationCA)}`}>
                        {variationCA >= 0 ? '+' : ''}{variationCA.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Charges */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('charges')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-slate-800">CHARGES</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600">
                    {formatCurrency(Math.abs(data.achats + data.charges_personnel + data.charges_exploitation + data.dotations_amortissements))}
                  </span>
                  <ArrowTrendingUpIcon className={`h-4 w-4 text-slate-400 transition-transform ${
                    expandedSections.has('charges') ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>
              {expandedSections.has('charges') && (
                <div className="px-4 pb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Achats:</span>
                    <span className="font-medium text-red-600">{formatCurrency(data.achats)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Charges personnel:</span>
                    <span className="font-medium text-red-600">{formatCurrency(data.charges_personnel)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Charges exploitation:</span>
                    <span className="font-medium text-red-600">{formatCurrency(data.charges_exploitation)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Dotations amortissements:</span>
                    <span className="font-medium text-red-600">{formatCurrency(data.dotations_amortissements)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Résultats intermédiaires */}
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-800">Résultat d'exploitation:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-800">{formatCurrency(data.resultat_exploitation)}</span>
                  {previousData && (
                    <>
                      {(() => {
                        const VariationIcon = getVariationIcon(variationRE);
                        return <VariationIcon className={`h-4 w-4 ${getVariationColor(variationRE)}`} />;
                      })()}
                      <span className={`text-sm ${getVariationColor(variationRE)}`}>
                        {variationRE >= 0 ? '+' : ''}{variationRE.toFixed(1)}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-800">Résultat financier:</span>
                <span className="font-bold text-slate-800">{formatCurrency(data.resultat_financier)}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-800">Résultat exceptionnel:</span>
                <span className="font-bold text-slate-800">{formatCurrency(data.resultat_exceptionnel)}</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="font-medium text-red-800">Impôt sur les sociétés:</span>
                <span className="font-bold text-red-800">{formatCurrency(data.impot_societes)}</span>
              </div>
            </div>
          </div>
        )}

        {activeView === 'evolution' && (
          <div className="space-y-6">
            {/* Graphique d'évolution */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Évolution des Indicateurs Clés</h4>
              <div className="h-80">
                <Line data={evolutionData} options={chartOptions} />
              </div>
            </div>

            {/* Répartition des charges */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-slate-800 mb-4">Répartition des Charges</h4>
              <div className="h-64">
                <Bar data={repartitionChargesData} options={barOptions} />
              </div>
            </div>
          </div>
        )}

        {activeView === 'analyse' && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Analyse de Performance</h4>
            
            {/* Ratios de rentabilité */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-slate-800">Marge Brute</h5>
                  {(() => {
                    const StatusIcon = getStatusIcon(margeBrute, 30, true) ? CheckCircleIcon : ExclamationTriangleIcon;
                    return <StatusIcon className={`h-5 w-5 ${getStatusColor(margeBrute, 30, true)}`} />;
                  })()}
                </div>
                <p className="text-2xl font-bold text-slate-800">{margeBrute.toFixed(1)}%</p>
                <p className="text-sm text-slate-600">Rentabilité commerciale</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-slate-800">Marge d'Exploitation</h5>
                  {(() => {
                    const StatusIcon = getStatusIcon(margeExploitation, 10, true) ? CheckCircleIcon : ExclamationTriangleIcon;
                    return <StatusIcon className={`h-5 w-5 ${getStatusColor(margeExploitation, 10, true)}`} />;
                  })()}
                </div>
                <p className="text-2xl font-bold text-slate-800">{margeExploitation.toFixed(1)}%</p>
                <p className="text-sm text-slate-600">Efficacité opérationnelle</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-slate-800">Marge Nette</h5>
                  {(() => {
                    const StatusIcon = getStatusIcon(margeNette, 5, true) ? CheckCircleIcon : ExclamationTriangleIcon;
                    return <StatusIcon className={`h-5 w-5 ${getStatusColor(margeNette, 5, true)}`} />;
                  })()}
                </div>
                <p className="text-2xl font-bold text-slate-800">{margeNette.toFixed(1)}%</p>
                <p className="text-sm text-slate-600">Rentabilité finale</p>
              </div>
            </div>

            {/* Structure des coûts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-slate-800 mb-3">Structure des Coûts</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Charges personnel:</span>
                    <span className="font-medium">{tauxChargesPersonnel.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Charges exploitation:</span>
                    <span className="font-medium">{tauxChargesExploitation.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Achats:</span>
                    <span className="font-medium">{((Math.abs(data.achats) / data.chiffre_affaires) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-slate-800 mb-3">Indicateurs Clés</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Chiffre d'affaires:</span>
                    <span className="font-medium">{formatCurrency(data.chiffre_affaires)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Résultat net:</span>
                    <span className="font-medium text-emerald-600">{formatCurrency(data.resultat_net)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Impôt sociétés:</span>
                    <span className="font-medium text-red-600">{formatCurrency(data.impot_societes)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommandations */}
            <div className="space-y-3">
              <h5 className="font-semibold text-slate-800">Recommandations</h5>
              {margeBrute < 30 && (
                <div className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Marge brute faible</p>
                    <p className="text-sm text-amber-700">Considérez réviser vos prix de vente ou optimiser vos coûts d'achat.</p>
                  </div>
                </div>
              )}
              {margeExploitation < 10 && (
                <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Marge d'exploitation insuffisante</p>
                    <p className="text-sm text-red-700">Optimisez vos charges d'exploitation pour améliorer la rentabilité.</p>
                  </div>
                </div>
              )}
              {margeNette > 5 && (
                <div className="flex items-start space-x-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-800">Excellente rentabilité</p>
                    <p className="text-sm text-emerald-700">L'entreprise génère une marge nette satisfaisante.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompteResultatWidget;
