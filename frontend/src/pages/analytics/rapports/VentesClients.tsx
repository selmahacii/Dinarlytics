import React, { useState } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ArrowTrendingDownIcon as TrendingDownIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  ShareIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  StarIcon,
  ChartPieIcon,
  BanknotesIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useApp } from '../../../context/AppContext';
import { useSalesReports } from '../../../hooks/useSalesReports';
import { formatNumber as fmtNumber } from '../../../utils/format';
import type { ProductPerformance, CategorySplit, TopClientSummary } from '../../types/reports';

const VentesClients: React.FC = () => {
  const { user } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('mois');
  const [selectedView, setSelectedView] = useState('rapports-ventes');
  const [showConfidenceBand, setShowConfidenceBand] = useState(true);

  const views = [
    {
      id: 'rapports-ventes',
      title: 'Rapports de ventes',
      icon: ChartBarIcon,
      description: 'Analysez vos performances de vente'
    },
    {
      id: 'analyse-client',
      title: 'Analyse client',
      icon: UserGroupIcon,
      description: 'Analysez vos clients principaux'
    },
    {
      id: 'comparatif-previsions',
      title: 'Comparatif & prévisions',
      icon: ChartPieIcon,
      description: 'Tendances et projections'
    }
  ];

  const currentView = views.find(v => v.id === selectedView) || views[0];

  const formatCurrency = (amount: number) => fmtNumber(amount) + ' DA';
  
  // API Data Hook
  const { data, loading, error } = useSalesReports(selectedPeriod);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Chargement des rapports de ventes...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">Erreur lors du chargement des rapports : {error}</div>;
  }
  if (!data) {
    return <div className="p-8 text-center text-slate-400">Aucune donnée de ventes disponible pour la période sélectionnée.</div>;
  }

  const { salesData, topProducts, salesByCategory, topClients, clientMetrics } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <ChartBarIcon className="h-8 w-8 mr-3 text-slate-600" />
              Ventes & Clients
              <span className="ml-3 px-3 py-1 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-full text-sm font-medium shadow-lg">
                {selectedPeriod === 'jour' ? '📅 Vue du jour' : '📊 Vue mensuelle'}
              </span>
            </h1>
            <p className="text-slate-600 mt-1">
              {selectedPeriod === 'jour' 
                ? 'Performances d\'aujourd\'hui en temps réel' 
                : 'Analysez vos ventes et comportements clients sur le mois'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                onClick={() => setSelectedPeriod('jour')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === 'jour' 
                    ? 'bg-slate-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                Jour
              </button>
              <button
                onClick={() => setSelectedPeriod('mois')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === 'mois' 
                    ? 'bg-slate-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                Mois
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors flex items-center">
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filtres
              </button>
              <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors flex items-center">
                <ShareIcon className="h-4 w-4 mr-2" />
                Partager
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Indicateur de période active */}
      <div className="bg-gradient-to-r from-emerald-50 to-slate-50 border-l-4 border-emerald-500 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ClockIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {selectedPeriod === 'jour' ? 'Données du jour en cours' : 'Données du mois en cours'}
              </h3>
              <p className="text-xs text-slate-600">
                {selectedPeriod === 'jour' 
                  ? 'Les statistiques affichées couvrent les ventes d\'aujourd\'hui uniquement' 
                  : 'Les statistiques affichées couvrent l\'ensemble du mois en cours'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-white rounded-lg border border-emerald-200">
              <div className="text-xs text-slate-600">Dernière mise à jour</div>
              <div className="text-sm font-bold text-slate-900">À l'instant</div>
            </div>
            <div className="px-3 py-1 bg-white rounded-lg border border-slate-200">
              <div className="text-xs text-slate-600">Total données</div>
              <div className="text-sm font-bold text-emerald-600">
                {salesData.facturesEmises} factures
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation des vues */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex space-x-1">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedView === view.id
                    ? 'bg-slate-600 text-white'
                    : 'text-slate-600 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{view.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 font-medium">Chiffre d'affaires</span>
            <CurrencyDollarIcon className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(salesData.ca.value)}</div>
          <div className={`text-sm mt-1 ${salesData.ca.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {salesData.ca.change >= 0 ? '+' : ''}{salesData.ca.change}% vs période précédente
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 font-medium">Panier moyen</span>
            <ShoppingCartIcon className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(salesData.panierMoyen)}</div>
          <div className="text-sm text-slate-600 mt-1">Montant moyen par facture</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 font-medium">Factures émises</span>
            <DocumentTextIcon className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{salesData.facturesEmises}</div>
          <div className="text-sm text-slate-600 mt-1">Sur la période sélectionnée</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 font-medium">Clients actifs</span>
            <UserGroupIcon className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{clientMetrics.clientsActifs}</div>
          <div className="text-sm text-slate-600 mt-1">Clients ayant acheté</div>
        </div>
      </div>

      {/* Top Produits et Catégories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Produits */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
              <StarIcon className="h-5 w-5 mr-2 text-slate-600" />
              Top 5 Produits
            </h3>
          </div>
          <div className="space-y-3">
            {topProducts.map((product: ProductPerformance, index: number) => (
              <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-slate-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{product.name}</div>
                      <div className="text-xs text-slate-600">{product.quantity} unités</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {product.evolution > 0 ? (
                      <TrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
                    ) : (
                      <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${product.evolution > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {product.evolution > 0 ? '+' : ''}{product.evolution}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-slate-900">{formatCurrency(product.sales)}</div>
                  <div className="text-sm text-slate-600">{product.percentage.toFixed(1)}% du CA</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Catégories */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
              <ChartPieIcon className="h-5 w-5 mr-2 text-slate-600" />
              Ventes par catégorie
            </h3>
          </div>
          <div className="space-y-4">
            {salesByCategory.map((cat: CategorySplit, idx: number) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${cat.color}`}></span>
                    <span className="text-sm font-semibold text-slate-900">{cat.category}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{cat.percentage.toFixed(1)}%</div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${cat.color}`} style={{ width: `${cat.percentage}%` }}></div>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600">
                  <span>CA: {formatCurrency(cat.amount)}</span>
                  <span className="font-medium">Tendance: {cat.trend > 0 ? `+${cat.trend}%` : `${cat.trend}%`}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Clients */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2 text-slate-600" />
            Meilleurs clients
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topClients.map((client: TopClientSummary, idx: number) => (
            <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="font-semibold text-slate-900">{client.name}</div>
              <div className="text-sm text-slate-600 mt-1">Ventes: {formatCurrency(client.sales)}</div>
              <div className="text-sm text-slate-600">Commandes: {client.orders}</div>
              <div className="text-sm text-slate-600">Panier moyen: {formatCurrency(client.avgBasket)}</div>
              <div className={`text-sm mt-1 font-medium ${client.trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {client.trend > 0 ? '+' : ''}{client.trend}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Client Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 font-medium">Clients actifs</span>
            <UserGroupIcon className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{clientMetrics.clientsActifs}</div>
          <div className="text-sm text-slate-600 mt-1">sur {clientMetrics.totalClients} clients</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 font-medium">Nouveaux clients</span>
            <StarIcon className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-600">{clientMetrics.nouveauxClients}</div>
          <div className="text-sm text-slate-600 mt-1">cette période</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 font-medium">Taux de fidélisation</span>
            <CheckCircleIcon className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{(clientMetrics.tauxFidelisation || 0).toFixed(1)}%</div>
          <div className="text-sm text-slate-600 mt-1">clients récurrents</div>
        </div>
      </div>
    </div>
  );
};

export default VentesClients;
