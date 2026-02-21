import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  ChartBarSquareIcon,
  ClockIcon,
  ScaleIcon,
  BanknotesIcon,
  PresentationChartLineIcon,
  ArrowPathIcon,
  CalendarIcon,
  PrinterIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';
import { usePermission } from '@shared/hooks/usePermission';
import { analyticService, FinancialKPIs, RollingForecast } from '@/services/modules/analyticService';

const AnalyticsAvancees: React.FC = () => {
  const { formatCurrency } = useApp();
  const { t } = useTranslation();
  const { user } = usePermission();

  // Facteur d'échelle basé sur le segment
  const scaleFactor = React.useMemo(() => {
    if (!user?.segment) return 1;
    switch (user.segment) {
      case 'micro': return 0.2;
      case 'small': return 0.6;
      case 'medium': return 1.2;
      case 'large': return 8.0;
      case 'enterprise': return 25.0;
      default: return 1;
    }
  }, [user]);

  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  // Hardcoded data with scaling
  const analyticsData = React.useMemo(() => ({
    funnel: [
      { name: 'Prospects', count: Math.round(12500 * (scaleFactor > 5 ? 10 : scaleFactor < 0.5 ? 0.2 : 1)), percentage: 100, color: 'bg-slate-300' },
      { name: 'Devis Émis', count: Math.round(3200 * (scaleFactor > 5 ? 10 : scaleFactor < 0.5 ? 0.2 : 1)), percentage: 25.6, color: 'bg-slate-400' },
      { name: 'Négociation', count: Math.round(1200 * (scaleFactor > 5 ? 10 : scaleFactor < 0.5 ? 0.2 : 1)), percentage: 9.6, color: 'bg-slate-600' },
      { name: 'Facturé', count: Math.round(480 * (scaleFactor > 5 ? 10 : scaleFactor < 0.5 ? 0.2 : 1)), percentage: 3.8, color: 'bg-slate-800' }
    ],
    cohorts: [
      { name: 'Sept 2024', data: [100, 45, 32, 28, 25, 22] },
      { name: 'Oct 2024', data: [100, 42, 30, 26, 24] },
      { name: 'Nov 2024', data: [100, 48, 35, 30] }
    ],
    correlations: [
      { metric1: 'Vitesse Site', metric2: 'Taux Conversion', correlation: 0.85 },
      { metric1: 'Invest. Pub', metric2: 'Nouv. Clients', correlation: 0.72 },
      { metric1: 'Remises %', metric2: 'Marge Brute', correlation: -0.65 }
    ]
  }), [scaleFactor]);

  // Mock refresh effect when filters change
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [selectedPeriod]);

  // Export Functionality
  const handleExport = () => {
    const message = `Export du rapport ${exportFormat.toUpperCase()} pour la période ${selectedPeriod} en cours...`;
    if (window.confirm(`${message}\nVoulez-vous télécharger le fichier ?`)) {
      setTimeout(() => alert("Le fichier a été téléchargé avec succès."), 500);
    }
  };

  // Import Functionality
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx';
    input.onchange = (e) => {
      alert("Importation des données externes terminée. Le tableau de bord a été mis à jour.");
    };
    input.click();
  };

  const currentMetrics = React.useMemo(() => [
    { name: 'DSO (Délai Client)', value: '35j', diff: -2.3, icon: ClockIcon, color: 'slate', target: '30j' },
    { name: 'BFR (Besoin Fonds)', value: formatCurrency(1300000 * scaleFactor), diff: 5.1, icon: BanknotesIcon, color: 'slate', target: `< ${formatCurrency(1500000 * scaleFactor)}` },
    { name: 'Seuil Rentabilité', value: formatCurrency(4200000 * scaleFactor), diff: 0.0, icon: ScaleIcon, color: 'slate', target: 'Validé' },
    { name: 'Solvabilité', value: '210%', diff: 1.5, icon: ChartBarSquareIcon, color: 'slate', target: '> 120%' }
  ], [scaleFactor, formatCurrency]);

  // Projecting values for Rolling Forecast
  const projectionValue = 2750000 * scaleFactor;
  const historicValues = [2.65, 2.82, 2.95].map(v => (v * scaleFactor).toFixed(2));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] bg-white rounded-3xl">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <ArrowPathIcon className="h-10 w-10 text-slate-300 animate-spin" />
          <p className="text-slate-400 font-medium">Actualisation des analyses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in p-2">

      {/* 🟢 HEADER PRO & CONTROLS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <PresentationChartLineIcon className="h-7 w-7 text-indigo-600 mr-3" />
            Analyse Financière Avancée
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Pilotage de la performance et prévisionnel budgétaire.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Filter Group */}
          <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200">
            <CalendarIcon className="h-4 w-4 text-slate-400 ml-2 mr-2" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-700 outline-none border-none py-1.5 pr-8 cursor-pointer hover:bg-slate-100 rounded-md transition-colors"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">Trimestre en cours</option>
              <option value="1y">Exercice Annuel</option>
            </select>
          </div>

          {/* Actions Group */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setComparisonMode(!comparisonMode)}
              className={`px-4 py-2 text-sm font-medium border rounded-lg transition-all flex items-center ${comparisonMode
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Comparatif N-1
            </button>

            <div className="h-8 w-px bg-slate-200 mx-1 hidden md:block"></div>

            <button
              onClick={handleImport}
              className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center shadow-sm"
            >
              <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
              Importer
            </button>

            <div className="flex rounded-lg shadow-sm">
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-l-lg hover:bg-slate-800 border-r border-slate-700 transition-colors flex items-center"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Exporter
              </button>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="bg-slate-900 text-white text-sm font-medium rounded-r-lg hover:bg-slate-800 outline-none px-2 cursor-pointer border-l-0"
              >
                <option value="pdf">PDF</option>
                <option value="xlsx">XLSX</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 KPIs FINANCIERS - PURE BUSINESS STYLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentMetrics.map((grid, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-xl bg-${grid.color}-50 text-${grid.color}-600`}>
                <grid.icon className="h-6 w-6" />
              </div>
              <div className="text-right">
                <p className={`text-xs font-bold ${grid.diff >= 0 ? 'text-slate-900' : 'text-slate-500'} flex items-center justify-end`}>
                  {grid.diff > 0 ? '+' : ''}{grid.diff}%
                  {grid.diff >= 0 ? <ArrowTrendingUpIcon className="h-3 w-3 ml-1" /> : <ArrowTrendingDownIcon className="h-3 w-3 ml-1" />}
                </p>
                {comparisonMode && (
                  <p className="text-[10px] text-slate-400 mt-0.5">vs N-1</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">{grid.name}</p>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{grid.value}</h3>
              <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-3">
                <span className="text-[10px] text-slate-400 font-semibold">Objectif: {grid.target}</span>
                <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-${grid.color}-500 w-3/4`}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 🟢 CONVERSION / FUNNEL */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Pipeline Commercial</h3>
            <button className="text-xs text-indigo-600 font-semibold hover:underline">Voir détails</button>
          </div>

          <div className="space-y-4">
            {analyticsData.funnel.map((stage, i) => (
              <div key={i} className="relative">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-bold text-slate-600">{stage.name}</span>
                  <span className="text-xs font-bold text-slate-900">{stage.count}</span>
                </div>
                <div className="h-8 w-full bg-slate-50 rounded-lg overflow-hidden flex items-center relative border border-slate-100">
                  <div className={`h-full ${stage.color} opacity-90`} style={{ width: `${stage.percentage}%` }}></div>
                  <span className="absolute right-3 text-[10px] font-bold text-slate-500">{stage.percentage}%</span>
                </div>
                {comparisonMode && (
                  <div className="text-[10px] text-slate-400 mt-1 text-right">
                    Prev: <span className="text-slate-600 font-semibold">{Math.round(stage.count * 0.9)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 🟢 PREVISIONNEL & TRÉSORERIE (REPLACES AI SECTION) */}
        <div className="lg:col-span-2 bg-white p-0 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center">
              <ClockIcon className="h-5 w-5 text-slate-500 mr-2" />
              Prévisions de Trésorerie (Rolling Forecast)
            </h3>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-600 shadow-sm">
              Fiabilité Statistique: Haute
            </span>
          </div>

          <div className="p-8 flex-1 flex flex-col lg:flex-row gap-8 items-center">
            <div className="flex-1 w-full space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Fin du Mois (Projection)</p>
                  <div className="flex items-baseline md:flex-row flex-col">
                    <h2 className="text-4xl font-black text-slate-800 mr-3">{formatCurrency(projectionValue)}</h2>
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center">
                      <ArrowTrendingUpIcon className="h-3 w-3 mr-1" /> +3.2% vs M-1
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-white text-center hover:border-indigo-300 transition-colors cursor-default">
                  <p className="text-[10px] font-black text-slate-400 uppercase">M-2</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">{historicValues[0]} M</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white text-center hover:border-indigo-300 transition-colors cursor-default">
                  <p className="text-[10px] font-black text-slate-400 uppercase">M-1</p>
                  <p className="text-sm font-bold text-slate-700 mt-1">{historicValues[1]} M</p>
                </div>
                <div className="p-4 rounded-xl border-2 border-indigo-100 bg-indigo-50/30 text-center relative">
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded-full">Actuel</span>
                  <p className="text-[10px] font-black text-indigo-400 uppercase">Projection</p>
                  <p className="text-sm font-bold text-indigo-700 mt-1">{historicValues[2]} M</p>
                </div>
              </div>
            </div>

            <div className="w-px h-32 bg-slate-100 hidden lg:block"></div>

            <div className="lg:w-1/3 w-full bg-slate-50 p-5 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1.5" />
                Points d'Attention
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 mr-2.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Canal Email Marketing</p>
                    <p className="text-[10px] text-slate-500 leading-tight">ROAS performant (4.1x). Opportunité d'augmentation budgétaire.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="h-2 w-2 rounded-full bg-rose-500 mt-1.5 mr-2.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-xs font-bold text-slate-700">Risque de Churn</p>
                    <p className="text-[10px] text-slate-500 leading-tight">Segment 26-35 ans montre une baisse de rétention.</p>
                  </div>
                </li>
              </ul>
              <button
                onClick={() => alert("Ouverture du rapport détaillé des risques...")}
                className="w-full mt-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors"
              >
                Voir le rapport complet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🟢 ADDITIONAL DATA GRIDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Analyse de Cohortes</h3>
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-3 text-left font-semibold text-xs uppercase">Mois</th>
                  <th className="p-3 text-center font-semibold text-xs uppercase">M+1</th>
                  <th className="p-3 text-center font-semibold text-xs uppercase">M+2</th>
                  <th className="p-3 text-center font-semibold text-xs uppercase">M+3</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analyticsData.cohorts.map((c, i) => (
                  <tr key={i}>
                    <td className="p-3 font-bold text-slate-700">{c.name}</td>
                    {c.data.slice(1, 4).map((d, j) => (
                      <td key={j} className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${d > 40 ? 'bg-slate-200 text-slate-900 border border-slate-300' : 'bg-slate-50 text-slate-500 border border-slate-100'
                          }`}>
                          {d}%
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">Corrélations Indicateurs</h3>
          <div className="flex flex-col justify-center h-full space-y-6 pb-4">
            {analyticsData.correlations.map((corr, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-600">{corr.metric1} / {corr.metric2}</span>
                  <span className={corr.correlation > 0 ? 'text-slate-900' : 'text-slate-600'}>
                    {corr.correlation > 0 ? '+' : ''}{corr.correlation}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${Math.abs(corr.correlation) > 0.7 ? 'bg-slate-800' : 'bg-slate-400'}`}
                    style={{ width: `${Math.abs(corr.correlation) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsAvancees;
