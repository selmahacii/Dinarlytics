import React, { useState, useMemo } from 'react';
import {
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  CogIcon,
  CalendarIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
} from 'chart.js';
import Card from '@shared/components/UI/Card';
import { useApp } from '@core/context/AppContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);
const AnalyticsFacturation: React.FC = () => {
  const { formatCurrency, companyData } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('30j');
  const [dateFrom, setDateFrom] = useState('2024-01-01');
  const [dateTo, setDateTo] = useState('2024-01-31');
  const [selectedView, setSelectedView] = useState('overview');
  const [compareMode, setCompareMode] = useState(false);
  const [showNewReportModal, setShowNewReportModal] = useState(false);

  // Données dynamiques de facturation à partir de companyData
  const facturationData = useMemo(() => {
    if (!companyData) return {};
    const baseRevenue = companyData.revenueMonth || 0;
    const invoicesCount = companyData.invoicesCount || 0;
    const avgInvoice = companyData.averageInvoice || 0;
    // Génère des évolutions factices pour les graphiques
    const generateEvolution = (days: number) => {
      const arr = [];
      for (let i = 0; i < days; i++) {
        arr.push({
          date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          factures: Math.round(invoicesCount / days + Math.random() * 5),
          montant: Math.round(baseRevenue / days + Math.random() * 10000),
          payees: Math.round((invoicesCount / days) * 0.85 + Math.random() * 3),
          impayees: Math.round((invoicesCount / days) * 0.15 + Math.random()),
          tauxPaiement: 85 + Math.random() * 5
        });
      }
      return arr;
    };
    return {
      '7j': {
        totalCA: baseRevenue * 0.25,
        factures: Math.round(invoicesCount * 0.25),
        panierMoyen: avgInvoice,
        tauxConversion: 78.5,
        evolution: generateEvolution(7)
      },
      '30j': {
        totalCA: baseRevenue,
        factures: invoicesCount,
        panierMoyen: avgInvoice,
        tauxConversion: 78.5,
        evolution: generateEvolution(30)
      },
      '90j': {
        totalCA: baseRevenue * 3,
        factures: invoicesCount * 3,
        panierMoyen: avgInvoice,
        tauxConversion: 76.8,
        evolution: generateEvolution(4)
      },
      '1a': {
        totalCA: baseRevenue * 12,
        factures: invoicesCount * 12,
        panierMoyen: avgInvoice,
        tauxConversion: 75.2,
        evolution: generateEvolution(12)
      }
    };
  }, [companyData]);

  const periods = [
    { id: '7j', name: '7j' },
    { id: '30j', name: '30j' },
    { id: '90j', name: '3M' },
    { id: '1a', name: '1A' }
  ];

  // Calcul des métriques principales avec comparaison
  const currentData = facturationData[selectedPeriod as keyof typeof facturationData];
  const previousPeriod = useMemo(() => {
    const periodMap: Record<string, string> = { '7j': '7j', '30j': '30j', '90j': '30j', '1a': '90j' };
    const prevKey = periodMap[selectedPeriod] || '30j';
    return facturationData[prevKey as keyof typeof facturationData];
  }, [selectedPeriod, facturationData]);

  const metrics = useMemo(() => {
    if (!currentData) return null;
    
    const evolution = currentData.evolution || [];
    const totalFactures = evolution.reduce((sum: number, d: any) => sum + d.factures, 0);
    const totalMontant = evolution.reduce((sum: number, d: any) => sum + d.montant, 0);
    const totalPayees = evolution.reduce((sum: number, d: any) => sum + d.payees, 0);
    const totalImpayees = evolution.reduce((sum: number, d: any) => sum + d.impayees, 0);
    const tauxPaiementMoyen = evolution.length > 0 
      ? evolution.reduce((sum: number, d: any) => sum + d.tauxPaiement, 0) / evolution.length 
      : 0;
    const montantImpaye = evolution.reduce((sum: number, d: any) => sum + (d.montant * (d.impayees / d.factures)), 0);
    
    // Calcul des variations
    const caVariation = previousPeriod 
      ? ((currentData.totalCA - previousPeriod.totalCA) / previousPeriod.totalCA) * 100 
      : 18.5;
    const facturesVariation = previousPeriod 
      ? ((currentData.factures - previousPeriod.factures) / previousPeriod.factures) * 100 
      : 12.3;
    const panierVariation = previousPeriod 
      ? ((currentData.panierMoyen - previousPeriod.panierMoyen) / previousPeriod.panierMoyen) * 100 
      : 5.7;
    const conversionVariation = previousPeriod 
      ? ((currentData.tauxConversion - previousPeriod.tauxConversion) / previousPeriod.tauxConversion) * 100 
      : 3.2;
    
    return {
      totalCA: currentData.totalCA,
      totalFactures: currentData.factures,
      panierMoyen: currentData.panierMoyen,
      tauxConversion: currentData.tauxConversion,
      totalPayees,
      totalImpayees,
      tauxPaiementMoyen,
      montantImpaye,
      factureMoyenne: totalMontant / totalFactures,
      caVariation,
      facturesVariation,
      panierVariation,
      conversionVariation
    };
  }, [currentData, previousPeriod]);

  // Fonction d'export
  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Export ${format} des rapports de facturation`);
    // Ici on implémenterait la logique d'export
    alert(`Export ${format.toUpperCase()} en cours de génération...`);
  };

  // Données pour les graphiques
  const chartData = useMemo(() => {
    if (!currentData || !currentData.evolution) return null;
    
    const data = currentData.evolution;
    const slice = data.slice(
      selectedPeriod === '7j' ? -7 :
      selectedPeriod === '30j' ? -10 :
      selectedPeriod === '90j' ? -4 :
      -12
    );

    const labels = slice.map((d: any) => {
      const date = new Date(d.date);
      return selectedPeriod === '90j' || selectedPeriod === '1a'
        ? date.toLocaleDateString('fr-FR', { month: 'short' })
        : date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    });

    return {
      evolution: {
        labels,
        datasets: [
          {
            label: 'Montant Facturé',
            data: slice.map((d: any) => d.montant),
            backgroundColor: 'rgba(51, 65, 85, 0.1)',
            borderColor: 'rgba(51, 65, 85, 1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          },
          {
            label: 'Montant Payé',
            data: slice.map((d: any) => d.montant * (d.payees / d.factures)),
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }
        ]
      },
      factures: {
        labels,
        datasets: [{
          label: 'Nombre de Factures',
          data: slice.map((d: any) => d.factures),
          backgroundColor: 'rgba(51, 65, 85, 0.8)',
          borderColor: 'rgba(51, 65, 85, 1)',
          borderWidth: 2
        }]
      }
    };
  }, [selectedPeriod, currentData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        padding: 12,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y || context.parsed)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* En-tête amélioré */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Rapports de Facturation
              </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Analyses et statistiques de facturation
              </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => handleExport('pdf')}
              className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-200 shadow-sm flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
              Exporter
            </button>
            <button 
              onClick={() => setShowNewReportModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-sm flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Nouveau Rapport
            </button>
          </div>
        </div>
      </div>

      {/* Section Rapports de Ventes */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              Rapports de Ventes
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Analysez vos performances commerciales et générez des rapports détaillés
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('excel')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Exporter
            </button>
          </div>
              </div>

        {/* Sélecteur de période et dates */}
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Période :</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {periods.map(period => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedPeriod === period.id
                      ? 'bg-slate-700 text-white shadow-md'
                      : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                  }`}
                >
                  {period.name}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Du :</span>
                      <input
                        placeholder="Saisir une valeur"
                        title="Champ de saisie"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Au :</span>
                      <input
                        title="Sélectionner une option"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* KPIs Principaux */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-600 p-3 rounded-lg shadow-sm">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">CA Total</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {formatCurrency(metrics.totalCA)}
              </div>
              <div className="flex items-center text-sm font-medium text-blue-700 dark:text-blue-300 mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1.5" />
                <span>+{metrics.caVariation.toFixed(1)}% vs période précédente</span>
            </div>
          </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl border border-emerald-200 dark:border-emerald-800 p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-emerald-600 p-3 rounded-lg shadow-sm">
                  <DocumentTextIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">Factures</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {metrics.totalFactures}
              </div>
              <div className="flex items-center text-sm font-medium text-emerald-700 dark:text-emerald-300 mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1.5" />
                <span>+{metrics.facturesVariation.toFixed(1)}% vs période précédente</span>
            </div>
          </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-600 p-3 rounded-lg shadow-sm">
                  <BanknotesIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Panier Moyen</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {formatCurrency(metrics.panierMoyen)}
              </div>
              <div className="flex items-center text-sm font-medium text-purple-700 dark:text-purple-300 mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1.5" />
                <span>+{metrics.panierVariation.toFixed(1)}% vs période précédente</span>
            </div>
          </div>

            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl border border-amber-200 dark:border-amber-800 p-6 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-amber-600 p-3 rounded-lg shadow-sm">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300 uppercase tracking-wide">Taux Conversion</span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                {metrics.tauxConversion.toFixed(1)}%
            </div>
              <div className="flex items-center text-sm font-medium text-amber-700 dark:text-amber-300 mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1.5" />
                <span>+{metrics.conversionVariation.toFixed(1)}% vs période précédente</span>
              </div>
          </div>
        </div>
      )}

        {/* Graphiques */}
        {chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
                Évolution des Montants
              </h3>
              <div className="h-80">
                <Line data={chartData.evolution} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
                Nombre de Factures
              </h3>
              <div className="h-80">
                <Bar data={chartData.factures} options={chartOptions} />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Section Rapports de Facturation */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Rapports de Facturation
          </h2>
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            Exporter
          </button>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-600">
          <DocumentTextIcon className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-2">
            Les rapports de facturation seront affichés ici.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500">
            Utilisez le bouton "Exporter" pour générer des rapports personnalisés.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsFacturation;


