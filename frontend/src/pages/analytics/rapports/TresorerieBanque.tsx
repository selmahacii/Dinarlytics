import React, { useState } from 'react';
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  ShareIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ChartPieIcon,
  BuildingLibraryIcon,
  BellIcon,
  ScaleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../../../context/AppContext';
import { useTreasuryReports } from '../../../hooks/useTreasuryReports';

const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0 }).format(amount);

const TresorerieBanque: React.FC = () => {
  const { user } = useApp();
  const [selectedView, setSelectedView] = useState('flux-tresorerie');
  const { data, loading, error } = useTreasuryReports('mois');

  // Loading and error handling
  if (loading) {
    return <div className="p-8 text-center text-slate-500">Chargement des données de trésorerie...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-500">Erreur lors du chargement : {error}</div>;
  }
  if (!data) {
    return <div className="p-8 text-center text-slate-400">Aucune donnée disponible</div>;
  }

  // Use API data
  const { soldeBanque, soldeCaisse, soldeTotal, fluxEntrants, fluxSortants, soldeNet, previsionTresorerie, repartitionFlux, repartitionSorties } = data;

  // ========================================
  // INTERFACE EURL MICRO-ENTREPRISE
  // ========================================
  if (user && user.segment === 'micro' && user.companyType === 'eurl') {

    return (
      <div className="space-y-6 max-w-7xl mx-auto p-6">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white p-8 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <BuildingLibraryIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Trésorerie & Banque</h1>
                <p className="text-slate-300 text-lg mt-1">Suivi des flux financiers et gestion bancaire</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 KPIs Principaux */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <CurrencyDollarIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Solde Total</h3>
            <p className="text-3xl font-extrabold text-slate-900">{formatCurrency(soldeTotal)}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-emerald-600 font-semibold">✅ Positif</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <BuildingLibraryIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Solde Banque</h3>
            <p className="text-3xl font-extrabold text-slate-900">{formatCurrency(soldeBanque)}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-600 font-semibold">🏦 Compte principal</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <BanknotesIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Solde Caisse</h3>
            <p className="text-3xl font-extrabold text-slate-900">{formatCurrency(soldeCaisse)}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-600 font-semibold">💵 Espèces</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <ArrowTrendingUpIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Solde Net du Mois</h3>
            <p className="text-3xl font-extrabold text-emerald-600">+{formatCurrency(soldeNet)}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-emerald-600 font-semibold">📈 Positif</p>
            </div>
          </div>
        </div>

        {/* Flux Entrants vs Sortants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-300 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mr-3">
                <ArrowTrendingUpIcon className="h-5 w-5 text-white" />
              </div>
              Flux Entrants
            </h3>
            <p className="text-4xl font-extrabold text-emerald-600 mb-4">{formatCurrency(fluxEntrants)}</p>
            <div className="space-y-2">
              {repartitionFlux.map((flux, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-slate-700">{flux.type}</p>
                    <p className="text-sm font-bold text-emerald-600">{flux.part}%</p>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(flux.montant)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border-2 border-red-300 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg mr-3">
                <ArrowTrendingDownIcon className="h-5 w-5 text-white" />
              </div>
              Flux Sortants
            </h3>
            <p className="text-4xl font-extrabold text-red-600 mb-4">{formatCurrency(fluxSortants)}</p>
            <div className="space-y-2">
              {repartitionSorties.map((sortie, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-slate-700">{sortie.type}</p>
                    <p className="text-sm font-bold text-red-600">{sortie.part}%</p>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(sortie.montant)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Courbe Prévisionnelle Trésorerie (3 mois) */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mr-3">
              <ChartBarIcon className="h-5 w-5 text-white" />
            </div>
            Évolution Prévisionnelle de la Trésorerie (3 mois)
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {previsionTresorerie.map((data, idx) => {
              const maxSolde = Math.max(...previsionTresorerie.map(d => d.solde));
              const hauteur = (data.solde / maxSolde) * 200;
              const isPositif = data.solde > soldeTotal;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden" style={{ height: '200px', display: 'flex', alignItems: 'flex-end' }}>
                    <div 
                      className={`w-full ${isPositif ? 'bg-gradient-to-t from-emerald-500 to-teal-400' : 'bg-gradient-to-t from-blue-500 to-indigo-400'} rounded-t-xl transition-all duration-500 hover:opacity-90`}
                      style={{ height: `${hauteur}px` }}
                    ></div>
                  </div>
                  <p className="text-xs font-bold text-slate-600 mt-2">{data.mois}</p>
                  <p className="text-xs text-slate-500">{formatCurrency(data.solde)}</p>
                  {isPositif && <p className="text-xs text-emerald-600 font-bold">+{Math.round((data.solde - soldeTotal) / soldeTotal * 100)}%</p>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Alertes & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Alertes */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-300 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg mr-3">
                <BellIcon className="h-5 w-5 text-white" />
              </div>
              Alertes Trésorerie
            </h3>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg border border-emerald-300">
                <p className="text-sm font-bold text-emerald-700">✅ Trésorerie saine</p>
                <p className="text-xs text-slate-600 mt-1">Solde positif et croissant</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-blue-300">
                <p className="text-sm font-bold text-blue-700">💡 Optimisation possible</p>
                <p className="text-xs text-slate-600 mt-1">Envisager placement court terme</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-300">
                <p className="text-sm font-bold text-slate-700">📊 Suivi recommandé</p>
                <p className="text-xs text-slate-600 mt-1">Revoir les flux hebdomadairement</p>
              </div>
            </div>
          </div>

          {/* Actions Rapides */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mr-3">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              Actions Rapides
            </h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl font-bold hover:from-slate-800 hover:to-black shadow-md hover:shadow-lg transition-all duration-300">
                💳 Rapprocher les comptes
              </button>
              <button className="w-full p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all duration-300">
                📊 Rapport flux complet
              </button>
              <button className="w-full p-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:border-emerald-400 hover:shadow-lg transition-all duration-300">
                🏦 Gérer les banques
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // INTERFACE STANDARD (autres entreprises)
  // ========================================

  const views = [
    {
      id: 'flux-tresorerie',
      title: 'Flux de trésorerie',
      icon: CurrencyDollarIcon,
      description: 'Analysez vos flux financiers',
      indicators: ['Encaissements / décaissements', 'Solde bancaire cumulé', 'Prévision de trésorerie']
    },
    {
      id: 'suivi-comptes',
      title: 'Suivi des comptes bancaires / caisses',
      icon: CreditCardIcon,
      description: 'Surveillez vos comptes',
      indicators: ['Soldes multi-comptes', 'Mouvements journaliers', 'Dépôts / retraits / transferts']
    },
    {
      id: 'previsions-tensions',
      title: 'Prévisions et tensions',
      icon: ClockIcon,
      description: 'Anticipez les besoins',
      indicators: ['Périodes à risque (solde < 0)', 'Prévision du besoin de trésorerie', 'Ratio liquidité actuelle']
    }
  ];

  const currentView = views.find(v => v.id === selectedView) || views[0];

  // Données enrichies pour flux de trésorerie
  const cashFlowData = {
    encaissements: 5200000,
    decaissements: 3800000,
    soldeNet: 1400000,
    liquidite: 1.8,
    previsions: 1650000,
    soldeBancaire: 2850000,
    variationMensuelle: 12.5,
    ratioLiquidite: 1.85,
    delaiMoyenEncaissement: 28,
    delaiMoyenDecaissement: 35
  };

  // Flux mensuels
  const monthlyFlows = [
    { month: 'Jan', encaissements: 850000, decaissements: 620000, solde: 230000 },
    { month: 'Fév', encaissements: 920000, decaissements: 680000, solde: 240000 },
    { month: 'Mar', encaissements: 980000, decaissements: 720000, solde: 260000 },
    { month: 'Avr', encaissements: 890000, decaissements: 650000, solde: 240000 },
    { month: 'Mai', encaissements: 1050000, decaissements: 780000, solde: 270000 },
    { month: 'Jun', encaissements: 1100000, decaissements: 820000, solde: 280000 }
  ];

  // Comptes bancaires et caisses
  const bankAccounts = [
    {
      name: 'Compte Principal BNA',
      number: '****7892',
      type: 'Compte courant',
      solde: 1850000,
      devise: 'DA',
      status: 'actif',
      variation: 8.5,
      lastMovement: '2024-01-15',
      movements: 45,
      icon: BuildingLibraryIcon
    },
    {
      name: 'Compte Opérationnel CPA',
      number: '****3421',
      type: 'Compte courant',
      solde: 750000,
      devise: 'DA',
      status: 'actif',
      variation: -3.2,
      lastMovement: '2024-01-15',
      movements: 32,
      icon: BuildingLibraryIcon
    },
    {
      name: 'Caisse Principale',
      number: 'CAISSE-01',
      type: 'Caisse',
      solde: 180000,
      devise: 'DA',
      status: 'actif',
      variation: 15.2,
      lastMovement: '2024-01-15',
      movements: 68,
      icon: BanknotesIcon
    },
    {
      name: 'Compte Épargne BEA',
      number: '****9156',
      type: 'Compte épargne',
      solde: 850000,
      devise: 'DA',
      status: 'actif',
      variation: 2.1,
      lastMovement: '2024-01-10',
      movements: 8,
      icon: BuildingLibraryIcon
    }
  ];

  // Mouvements récents
  const recentMovements = [
    { date: '2024-01-15', type: 'Encaissement', libelle: 'Paiement Client ABC', compte: 'BNA', montant: 150000, statut: 'validé' },
    { date: '2024-01-15', type: 'Décaissement', libelle: 'Fournisseur Tech Plus', compte: 'CPA', montant: -85000, statut: 'validé' },
    { date: '2024-01-15', type: 'Encaissement', libelle: 'Virement Client XYZ', compte: 'BNA', montant: 220000, statut: 'validé' },
    { date: '2024-01-14', type: 'Décaissement', libelle: 'Salaires', compte: 'CPA', montant: -350000, statut: 'validé' },
    { date: '2024-01-14', type: 'Transfert', libelle: 'Transfert BNA → CPA', compte: 'BNA', montant: -100000, statut: 'validé' },
    { date: '2024-01-14', type: 'Encaissement', libelle: 'Paiement Client DEF', compte: 'Caisse', montant: 45000, statut: 'validé' }
  ];

  // Prévisions et tensions
  const forecasts = [
    { month: 'Jan', prevu: 230000, reel: 230000, ecart: 0, risque: 'faible' },
    { month: 'Fév', prevu: 250000, reel: 240000, ecart: -10000, risque: 'faible' },
    { month: 'Mar', prevu: 270000, reel: 260000, ecart: -10000, risque: 'faible' },
    { month: 'Avr', prevu: 260000, reel: 240000, ecart: -20000, risque: 'moyen' },
    { month: 'Mai', prevu: 300000, reel: 270000, ecart: -30000, risque: 'moyen' },
    { month: 'Jun', prevu: 320000, reel: null, ecart: null, risque: 'faible' }
  ];

  // Tensions et alertes
  const tensions = [
    {
      date: '2024-02-05',
      type: 'Tension de trésorerie',
      description: 'Solde prévu < 100k DA',
      montant: 85000,
      severity: 'warning',
      action: 'Négocier délais fournisseurs'
    },
    {
      date: '2024-02-15',
      type: 'Échéance importante',
      description: 'Salaires + charges sociales',
      montant: 420000,
      severity: 'critical',
      action: 'Préparer virement'
    },
    {
      date: '2024-02-20',
      type: 'Pic de dépenses',
      description: 'Factures fournisseurs importantes',
      montant: 380000,
      severity: 'warning',
      action: 'Surveiller encaissements'
    }
  ];

  // Ratios financiers
  const financialRatios = [
    { label: 'Ratio de liquidité', value: 1.85, target: '> 1.5', status: 'excellent', description: 'Capacité à payer les dettes court terme' },
    { label: 'Délai moyen encaissement', value: 28, target: '< 30j', status: 'bon', description: 'Temps moyen de recouvrement' },
    { label: 'Délai moyen décaissement', value: 35, target: '30-45j', status: 'optimal', description: 'Temps moyen de paiement fournisseurs' },
    { label: 'Couverture trésorerie', value: 45, target: '> 30j', status: 'excellent', description: 'Nombre de jours de charges couvertes' }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <BanknotesIcon className="h-8 w-8 mr-3 text-slate-600" />
              Trésorerie & Banque
            </h1>
            <p className="text-slate-600 mt-1">Analysez vos flux financiers et comptes bancaires</p>
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

      {/* Contenu de la vue sélectionnée */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          {(() => {
            const CurrentViewIcon = currentView.icon;
            return <CurrentViewIcon className="h-6 w-6 text-slate-600" />;
          })()}
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{currentView.title}</h2>
            <p className="text-sm text-slate-600">{currentView.description}</p>
          </div>
        </div>

        {/* Contenu dynamique selon la vue */}
        <div className="space-y-8">
          {/* VUE 1: FLUX DE TRÉSORERIE */}
          {selectedView === 'flux-tresorerie' && (
            <>
              {/* KPIs principaux */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-emerald-600 font-semibold"> Encaissements</span>
                    <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-700">
              +{cashFlowData.encaissements.toLocaleString()} DA
            </div>
                  <div className="text-xs text-emerald-600 mt-1">+{cashFlowData.variationMensuelle}% vs mois dernier</div>
          </div>

                <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-red-600 font-semibold"> Décaissements</span>
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="text-2xl font-black text-red-700">
              -{cashFlowData.decaissements.toLocaleString()} DA
            </div>
                  <div className="text-xs text-red-600 mt-1">Paiements effectués</div>
          </div>

                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 font-semibold"> Solde net</span>
                    <CheckCircleIcon className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
              +{cashFlowData.soldeNet.toLocaleString()} DA
            </div>
                  <div className="text-xs text-slate-600 mt-1">Flux net positif</div>
          </div>

                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 font-semibold"> Solde bancaire</span>
                    <BanknotesIcon className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="text-2xl font-black text-slate-900">
                    {cashFlowData.soldeBancaire.toLocaleString()} DA
                  </div>
                  <div className="text-xs text-slate-600 mt-1">Tous comptes</div>
                </div>

                <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-emerald-600 font-semibold"> Liquidité</span>
                    <ScaleIcon className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-700">
                    {cashFlowData.ratioLiquidite}
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">Ratio excellent</div>
            </div>
          </div>

              {/* Graphique flux mensuels */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600" />
                   Évolution des Flux de Trésorerie (6 mois)
                </h3>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  {/* Légende */}
                  <div className="flex items-center justify-center space-x-6 mb-6">
                    <div className="flex items-center">
                      <div className="w-8 h-1.5 bg-emerald-600 rounded mr-2"></div>
                      <span className="text-sm font-semibold text-slate-900">Encaissements</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-1.5 bg-red-600 rounded mr-2"></div>
                      <span className="text-sm font-semibold text-slate-900">Décaissements</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-1.5 bg-slate-700 rounded mr-2"></div>
                      <span className="text-sm font-semibold text-slate-900">Solde net</span>
            </div>
          </div>

                  {/* Graphique SVG */}
                  <div className="relative h-96 bg-slate-50 rounded-lg p-8">
                    <svg className="w-full h-full" viewBox="0 0 700 350" preserveAspectRatio="xMidYMid meet">
                      {/* Grille */}
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <g key={i}>
                          <line x1="60" y1={30 + i * 50} x2="660" y2={30 + i * 50} stroke="#e2e8f0" strokeWidth="1.5" />
                          <text x="45" y={35 + i * 50} fill="#64748b" fontSize="13" fontWeight="700" textAnchor="end">
                            {(5-i) * 200}k
                          </text>
                        </g>
                      ))}

                      {/* Barres Encaissements */}
                      {monthlyFlows.map((flow, i) => {
                        const x = 80 + (i * 100);
                        const maxVal = 1200000;
                        const height = (flow.encaissements / maxVal) * 250;
                        return (
                          <rect
                            key={`enc-${i}`}
                            x={x}
                            y={280 - height}
                            width="22"
                            height="0"
                            fill="url(#encGradient)"
                            rx="2"
                          >
                            <animate
                              attributeName="height"
                              from="0"
                              to={height}
                              begin={`${i * 0.1}s`}
                              dur="0.8s"
                              fill="freeze"
                            />
                            <animate
                              attributeName="y"
                              from="280"
                              to={280 - height}
                              begin={`${i * 0.1}s`}
                              dur="0.8s"
                              fill="freeze"
                            />
                          </rect>
                        );
                      })}

                      {/* Barres Décaissements */}
                      {monthlyFlows.map((flow, i) => {
                        const x = 107 + (i * 100);
                        const maxVal = 1200000;
                        const height = (flow.decaissements / maxVal) * 250;
                        return (
                          <rect
                            key={`dec-${i}`}
                            x={x}
                            y={280 - height}
                            width="22"
                            height="0"
                            fill="url(#decGradient)"
                            rx="2"
                          >
                            <animate
                              attributeName="height"
                              from="0"
                              to={height}
                              begin={`${i * 0.1 + 0.2}s`}
                              dur="0.8s"
                              fill="freeze"
                            />
                            <animate
                              attributeName="y"
                              from="280"
                              to={280 - height}
                              begin={`${i * 0.1 + 0.2}s`}
                              dur="0.8s"
                              fill="freeze"
                            />
                          </rect>
                        );
                      })}

                      {/* Courbe Solde net */}
                      <path
                        d={(() => {
                          const maxVal = 1200000;
                          return monthlyFlows.map((flow, i) => {
                            const x = 118 + (i * 100);
                            const y = 280 - ((flow.solde / maxVal) * 250);
                            return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                          }).join(' ');
                        })()}
                        fill="none"
                        stroke="#334155"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="2000"
                        strokeDashoffset="2000"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          from="2000"
                          to="0"
                          begin="1s"
                          dur="1.5s"
                          fill="freeze"
                        />
                      </path>

                      {/* Points Solde */}
                      {monthlyFlows.map((flow, i) => {
                        const x = 118 + (i * 100);
                        const maxVal = 1200000;
                        const y = 280 - ((flow.solde / maxVal) * 250);
                        return (
                          <circle
                            key={`pt-${i}`}
                            cx={x}
                            cy={y}
                            r="6"
                            fill="#334155"
                            opacity="0"
                          >
                            <animate
                              attributeName="opacity"
                              from="0"
                              to="1"
                              begin={`${1.5 + i * 0.1}s`}
                              dur="0.3s"
                              fill="freeze"
                            />
                          </circle>
                        );
                      })}

                      {/* Labels mois */}
                      {monthlyFlows.map((flow, i) => (
                        <text
                          key={`lbl-${i}`}
                          x={105 + (i * 100)}
                          y="310"
                          fill="#334155"
                          fontSize="14"
                          fontWeight="800"
                          textAnchor="middle"
                        >
                          {flow.month}
                        </text>
                      ))}

                      {/* Dégradés */}
                      <defs>
                        <linearGradient id="encGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                        <linearGradient id="decGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Statistiques */}
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-slate-200">
                    <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="text-xs font-semibold text-emerald-600 mb-2">Total Encaissements</div>
                      <div className="text-2xl font-bold text-emerald-700">
                        {monthlyFlows.reduce((sum, m) => sum + m.encaissements, 0).toLocaleString()} DA
                      </div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-xs font-semibold text-red-600 mb-2">Total Décaissements</div>
                      <div className="text-2xl font-bold text-red-700">
                        {monthlyFlows.reduce((sum, m) => sum + m.decaissements, 0).toLocaleString()} DA
                      </div>
                    </div>
                    <div className="text-center p-4 bg-slate-100 rounded-lg border border-slate-300">
                      <div className="text-xs font-semibold text-slate-600 mb-2">Solde Net Cumulé</div>
            <div className="text-2xl font-bold text-slate-900">
                        +{monthlyFlows.reduce((sum, m) => sum + m.solde, 0).toLocaleString()} DA
                      </div>
                    </div>
            </div>
            </div>
          </div>

              {/* Graphique de solde cumulé */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600" />
                  Évolution du Solde Cumulé de Trésorerie
                </h3>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="relative h-80 bg-slate-50 rounded-lg p-8">
                    <svg className="w-full h-full" viewBox="0 0 700 300" preserveAspectRatio="xMidYMid meet">
                      {/* Grille */}
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <g key={i}>
                          <line x1="60" y1={30 + i * 45} x2="660" y2={30 + i * 45} stroke="#e2e8f0" strokeWidth="1.5" />
                          <text x="45" y={35 + i * 45} fill="#64748b" fontSize="12" fontWeight="700" textAnchor="end">
                            {(5-i) * 50}k
                          </text>
                        </g>
                      ))}

                      {/* Zone remplie sous la courbe */}
                      <path
                        d={(() => {
                          const maxVal = 280000;
                          let soldeCumule = 0;
                          let path = 'M 60 255 ';
                          monthlyFlows.forEach((flow, i) => {
                            soldeCumule += flow.solde;
                            const x = 60 + (i * 120);
                            const y = 255 - ((soldeCumule / maxVal) * 225);
                            path += `L ${x} ${y} `;
                          });
                          path += 'L 660 255 Z';
                          return path;
                        })()}
                        fill="url(#soldeGradient)"
                      />

                      {/* Courbe du solde cumulé */}
                      <path
                        d={(() => {
                          const maxVal = 280000;
                          let soldeCumule = 0;
                          return monthlyFlows.map((flow, i) => {
                            soldeCumule += flow.solde;
                            const x = 60 + (i * 120);
                            const y = 255 - ((soldeCumule / maxVal) * 225);
                            return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                          }).join(' ');
                        })()}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="2000"
                        strokeDashoffset="2000"
                        className="drop-shadow-lg"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          from="2000"
                          to="0"
                          dur="2.5s"
                          fill="freeze"
                        />
                      </path>

                      {/* Points avec labels */}
                      {(() => {
                        let soldeCumule = 0;
                        return monthlyFlows.map((flow, i) => {
                          soldeCumule += flow.solde;
                          const x = 60 + (i * 120);
                          const maxVal = 280000;
                          const y = 255 - ((soldeCumule / maxVal) * 225);
                          return (
                            <g key={i}>
                              {/* Point */}
                              <circle cx={x} cy={y} r="10" fill="#10b981" className="drop-shadow-md" opacity="0">
                                <animate attributeName="opacity" from="0" to="1" begin={`${2.5 + i * 0.15}s`} dur="0.4s" fill="freeze" />
                              </circle>
                              <circle cx={x} cy={y} r="5" fill="#ffffff" opacity="0">
                                <animate attributeName="opacity" from="0" to="1" begin={`${2.5 + i * 0.15}s`} dur="0.4s" fill="freeze" />
                              </circle>

                              {/* Label valeur */}
                              <text
                                x={x}
                                y={y - 20}
                                fill="#10b981"
                                fontSize="12"
                                fontWeight="900"
                                textAnchor="middle"
                                opacity="0"
                              >
                                {(soldeCumule / 1000).toFixed(0)}k
                                <animate attributeName="opacity" from="0" to="1" begin={`${2.5 + i * 0.15 + 0.2}s`} dur="0.3s" fill="freeze" />
                              </text>
                            </g>
                          );
                        });
                      })()}

                      {/* Labels mois */}
                      {monthlyFlows.map((flow, i) => (
                        <text key={i} x={60 + (i * 120)} y="285" fill="#334155" fontSize="14" fontWeight="800" textAnchor="middle">
                          {flow.month}
                        </text>
                      ))}

                      <defs>
                        <linearGradient id="soldeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Statistiques */}
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-slate-200">
                    <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="text-xs font-semibold text-emerald-600 mb-2">Croissance cumulée</div>
                      <div className="text-2xl font-bold text-emerald-700">
                        +{monthlyFlows.reduce((sum, m) => sum + m.solde, 0).toLocaleString()} DA
                      </div>
                    </div>
                    <div className="text-center p-4 bg-slate-100 rounded-lg border border-slate-300">
                      <div className="text-xs font-semibold text-slate-600 mb-2">Croissance moyenne</div>
            <div className="text-2xl font-bold text-slate-900">
                        +{(monthlyFlows.reduce((sum, m) => sum + m.solde, 0) / monthlyFlows.length).toLocaleString()} DA
            </div>
          </div>
                    <div className="text-center p-4 bg-slate-100 rounded-lg border border-slate-300">
                      <div className="text-xs font-semibold text-slate-600 mb-2">Meilleur mois</div>
                      <div className="text-2xl font-bold text-slate-900">
                        {[...monthlyFlows].sort((a, b) => b.solde - a.solde)[0].month}
                      </div>
                      <div className="text-xs text-slate-600">
                        +{[...monthlyFlows].sort((a, b) => b.solde - a.solde)[0].solde.toLocaleString()} DA
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tableau de flux détaillés */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2 text-slate-600" />
                  Tableau Détaillé des Flux Mensuels
                </h3>

                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-700 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase">Mois</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase">Encaissements</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase">Décaissements</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase">Solde Net</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase">Ratio E/D</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {monthlyFlows.map((flow, index) => {
                        const ratio = ((flow.encaissements / flow.decaissements) * 100).toFixed(0);
                        return (
                          <tr key={index} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">{flow.month}</td>
                            <td className="px-6 py-4 text-right font-bold text-emerald-600">
                              +{flow.encaissements.toLocaleString()} DA
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-red-600">
                              -{flow.decaissements.toLocaleString()} DA
                            </td>
                            <td className="px-6 py-4 text-right font-black text-slate-900">
                              +{flow.solde.toLocaleString()} DA
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                                parseInt(ratio) > 140 ? 'bg-emerald-100 text-emerald-700' :
                                parseInt(ratio) > 120 ? 'bg-slate-100 text-slate-700' :
                                'bg-slate-200 text-slate-700'
                              }`}>
                                {ratio}%
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {flow.solde > 260000 ? (
                                <CheckCircleIcon className="h-6 w-6 text-emerald-500 inline" />
                              ) : flow.solde > 230000 ? (
                                <InformationCircleIcon className="h-6 w-6 text-slate-500 inline" />
                              ) : (
                                <ExclamationTriangleIcon className="h-6 w-6 text-amber-500 inline" />
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                      <tr>
                        <td className="px-6 py-4 font-black text-slate-900">TOTAL</td>
                        <td className="px-6 py-4 text-right font-black text-emerald-700">
                          +{monthlyFlows.reduce((sum, m) => sum + m.encaissements, 0).toLocaleString()} DA
                        </td>
                        <td className="px-6 py-4 text-right font-black text-red-700">
                          -{monthlyFlows.reduce((sum, m) => sum + m.decaissements, 0).toLocaleString()} DA
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">
                          +{monthlyFlows.reduce((sum, m) => sum + m.solde, 0).toLocaleString()} DA
                        </td>
                        <td className="px-6 py-4 text-center font-black text-slate-900">
                          {((monthlyFlows.reduce((sum, m) => sum + m.encaissements, 0) / monthlyFlows.reduce((sum, m) => sum + m.decaissements, 0)) * 100).toFixed(0)}%
                        </td>
                        <td className="px-6 py-4 text-center">
                          <CheckCircleIcon className="h-6 w-6 text-emerald-600 inline" />
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Ratios financiers avec jauges */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ScaleIcon className="h-5 w-5 mr-2 text-slate-600" />
            Ratios Financiers Clés avec Visualisations
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {financialRatios.map((ratio, index) => (
                    <div key={index} className="bg-white rounded-lg p-5 border border-slate-200 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-slate-900">{ratio.label}</span>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          ratio.status === 'excellent' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                          ratio.status === 'bon' ? 'bg-slate-100 text-slate-700 border border-slate-300' :
                          'bg-slate-200 text-slate-700 border border-slate-400'
                        }`}>
                          {ratio.status}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl font-black text-slate-900">{ratio.value}{ratio.label.includes('Délai') ? ' jours' : ratio.label.includes('Couverture') ? ' jours' : ''}</div>
                        <div className="text-right">
                          <div className="text-xs text-slate-500">Cible</div>
                          <div className="text-sm font-medium text-slate-700">{ratio.target}</div>
                        </div>
                      </div>

                      {/* Jauge de progression */}
                      <div className="w-full bg-slate-200 rounded-full h-4 mb-3 shadow-inner">
                        <div 
                          className={`h-4 rounded-full transition-all duration-1500 ease-out ${
                            ratio.status === 'excellent' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                            'bg-gradient-to-r from-slate-600 to-slate-700'
                          }`}
                          style={{ 
                            width: ratio.status === 'excellent' ? '100%' : '85%',
                            transitionDelay: `${index * 150}ms`
                          }}
                        ></div>
                      </div>

                      <div className="text-xs text-slate-600">{ratio.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prévisions de trésorerie 3 mois */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-slate-600" />
                  🔮 Prévisions de Trésorerie - 3 Prochains Mois
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { month: 'Juillet', encPrev: 1180000, decPrev: 890000, soldePrev: 290000, confiance: 'Élevée', risque: 'Faible' },
                    { month: 'Août', encPrev: 1050000, decPrev: 850000, soldePrev: 200000, confiance: 'Moyenne', risque: 'Moyen' },
                    { month: 'Septembre', encPrev: 1250000, decPrev: 920000, soldePrev: 330000, confiance: 'Élevée', risque: 'Faible' }
                  ].map((prev, index) => (
                    <div key={index} className="bg-white rounded-lg p-5 border border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-black text-slate-900 text-lg">{prev.month}</div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          prev.risque === 'Faible' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                          'bg-amber-100 text-amber-700 border border-amber-300'
                        }`}>
                          {prev.risque}
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-600">Encaissements prévus</span>
                            <span className="font-bold text-emerald-700">+{(prev.encPrev / 1000).toFixed(0)}k</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000"
                              style={{ width: `${(prev.encPrev / 1250000) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-600">Décaissements prévus</span>
                            <span className="font-bold text-red-700">-{(prev.decPrev / 1000).toFixed(0)}k</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="h-2 bg-gradient-to-r from-red-400 to-red-600 rounded-full transition-all duration-1000"
                              style={{ width: `${(prev.decPrev / 1250000) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4">
                        <div className="text-xs text-slate-600 mb-1">Solde net prévu</div>
                        <div className="text-2xl font-black text-slate-900">
                          +{prev.soldePrev.toLocaleString()} DA
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">Confiance:</span>
                          <span className={`font-bold ${
                            prev.confiance === 'Élevée' ? 'text-emerald-600' : 'text-slate-700'
                          }`}>
                            {prev.confiance}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Décomposition des flux par nature */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ChartPieIcon className="h-5 w-5 mr-2 text-slate-600" />
                  🎯 Décomposition des Flux par Nature d'Opération
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Graphique circulaire Encaissements */}
                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <h4 className="font-bold text-emerald-700 mb-4 text-center text-lg"> Encaissements</h4>
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative w-56 h-56">
                        <svg className="w-full h-full transform -rotate-90">
                          {(() => {
                            const encTypes = [
                              { type: 'Ventes', percentage: 62, color: '#10b981' },
                              { type: 'Créances', percentage: 28, color: '#34d399' },
                              { type: 'Autres', percentage: 10, color: '#6ee7b7' }
                            ];
                            let currentOffset = 0;
                            
                            return encTypes.map((encType, idx) => {
                              const circumference = 2 * Math.PI * 90;
                              const strokeLength = (encType.percentage / 100) * circumference;
                              const circle = (
                                <circle
                                  key={idx}
                                  cx="112"
                                  cy="112"
                                  r="90"
                                  fill="none"
                                  stroke={encType.color}
                                  strokeWidth="35"
                                  strokeDasharray={`${strokeLength} ${circumference}`}
                                  strokeDashoffset={-currentOffset}
                                  strokeLinecap="round"
                                  opacity="0"
                                >
                                  <animate attributeName="opacity" from="0" to="1" begin={`${idx * 0.2}s`} dur="0.4s" fill="freeze" />
                                  <animate
                                    attributeName="stroke-dashoffset"
                                    from={-currentOffset + strokeLength}
                                    to={-currentOffset}
                                    begin={`${idx * 0.2}s`}
                                    dur="1s"
                                    fill="freeze"
                                  />
                                </circle>
                              );
                              currentOffset += strokeLength;
                              return circle;
                            });
                          })()}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-3xl font-black text-emerald-700">100%</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {[
                        { type: 'Ventes clients', percentage: 62, montant: (cashFlowData.encaissements * 0.62), color: 'bg-emerald-600' },
                        { type: 'Créances recouvrées', percentage: 28, montant: (cashFlowData.encaissements * 0.28), color: 'bg-emerald-400' },
                        { type: 'Autres produits', percentage: 10, montant: (cashFlowData.encaissements * 0.10), color: 'bg-emerald-300' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                            <span className="text-xs font-bold text-slate-900">{item.type}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-slate-900">{item.percentage}%</span>
                            <span className="text-xs text-slate-600">({item.montant.toLocaleString()} DA)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Graphique circulaire Décaissements */}
                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <h4 className="font-bold text-red-700 mb-4 text-center text-lg">💸 Décaissements</h4>
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative w-56 h-56">
                        <svg className="w-full h-full transform -rotate-90">
                          {(() => {
                            const decTypes = [
                              { type: 'Fournisseurs', percentage: 45, color: '#ef4444' },
                              { type: 'Salaires', percentage: 32, color: '#f87171' },
                              { type: 'Charges', percentage: 15, color: '#fca5a5' },
                              { type: 'Autres', percentage: 8, color: '#fecaca' }
                            ];
                            let currentOffset = 0;
                            
                            return decTypes.map((decType, idx) => {
                              const circumference = 2 * Math.PI * 90;
                              const strokeLength = (decType.percentage / 100) * circumference;
                              const circle = (
                                <circle
                                  key={idx}
                                  cx="112"
                                  cy="112"
                                  r="90"
                                  fill="none"
                                  stroke={decType.color}
                                  strokeWidth="35"
                                  strokeDasharray={`${strokeLength} ${circumference}`}
                                  strokeDashoffset={-currentOffset}
                                  strokeLinecap="round"
                                  opacity="0"
                                >
                                  <animate attributeName="opacity" from="0" to="1" begin={`${idx * 0.2}s`} dur="0.4s" fill="freeze" />
                                  <animate
                                    attributeName="stroke-dashoffset"
                                    from={-currentOffset + strokeLength}
                                    to={-currentOffset}
                                    begin={`${idx * 0.2}s`}
                                    dur="1s"
                                    fill="freeze"
                                  />
                                </circle>
                              );
                              currentOffset += strokeLength;
                              return circle;
                            });
                          })()}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-3xl font-black text-red-700">100%</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {[
                        { type: 'Achats fournisseurs', percentage: 45, montant: (cashFlowData.decaissements * 0.45), color: 'bg-red-600' },
                        { type: 'Salaires & charges', percentage: 32, montant: (cashFlowData.decaissements * 0.32), color: 'bg-red-400' },
                        { type: 'Charges fixes', percentage: 15, montant: (cashFlowData.decaissements * 0.15), color: 'bg-red-300' },
                        { type: 'Autres dépenses', percentage: 8, montant: (cashFlowData.decaissements * 0.08), color: 'bg-red-200' }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                            <span className="text-xs font-bold text-slate-900">{item.type}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-slate-900">{item.percentage}%</span>
                            <span className="text-xs text-slate-600">({item.montant.toLocaleString()} DA)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Indicateurs de santé financière */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2 text-slate-600" />
                  Indicateurs de Santé Financière
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Fonds de roulement', value: cashFlowData.soldeBancaire, unit: 'DA', status: 'excellent', icon: BanknotesIcon },
                    { label: 'Cycle de trésorerie', value: 0, unit: 'jours', status: 'excellent', icon: ClockIcon },
                    { label: 'Capacité d\'autofinancement', value: 10000, unit: 'DA', status: 'bon', icon: CurrencyDollarIcon },
                    { label: 'Besoin en fonds de roulement', value: 1475450000, unit: 'DA', status: 'excellent', icon: ScaleIcon }
                  ].map((indicator, index) => {
                    const IndicatorIcon = indicator.icon;
                    return (
                      <div key={index} className="bg-white rounded-lg p-5 border border-slate-200 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <IndicatorIcon className="h-8 w-8 text-slate-600" />
                          <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                            indicator.status === 'excellent' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                            'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}>
                            {indicator.status}
                          </div>
                        </div>
                        
                        <div className="text-xs text-slate-600 mb-2">{indicator.label}</div>
                        <div className="text-2xl font-black text-slate-900">
                          {typeof indicator.value === 'number' && indicator.value < 0 && indicator.unit === 'jours' ? '' : ''}
                          {typeof indicator.value === 'number' ? indicator.value.toLocaleString() : indicator.value} {indicator.unit}
                        </div>
                        
                        {/* Mini jauge */}
                        <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
                          <div 
                            className={`h-2 rounded-full transition-all duration-1000 ${
                              indicator.status === 'excellent' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                              'bg-gradient-to-r from-slate-500 to-slate-600'
                            }`}
                            style={{ 
                              width: indicator.status === 'excellent' ? '100%' : '85%',
                              transitionDelay: `${index * 100}ms`
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* VUE 2: SUIVI DES COMPTES */}
          {selectedView === 'suivi-comptes' && (
            <>
              {/* Synthèse comptes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-5 border-l-4 border-emerald-500 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <BuildingLibraryIcon className="h-8 w-8 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-600 uppercase">Total</span>
                  </div>
                  <div className="text-3xl font-black text-emerald-700 mb-1">
                    {bankAccounts.reduce((sum, acc) => sum + acc.solde, 0).toLocaleString()} DA
                  </div>
                  <div className="text-sm text-emerald-600 font-medium">Tous comptes confondus</div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-5 border-l-4 border-slate-500 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <CreditCardIcon className="h-8 w-8 text-slate-600" />
                    <span className="text-xs font-bold text-slate-600 uppercase">Comptes</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">
                    {bankAccounts.length}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">Comptes actifs</div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-5 border-l-4 border-slate-500 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <ArrowPathIcon className="h-8 w-8 text-slate-600" />
                    <span className="text-xs font-bold text-slate-600 uppercase">Mouvements</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 mb-1">
                    {bankAccounts.reduce((sum, acc) => sum + acc.movements, 0)}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">Ce mois</div>
                </div>
              </div>

              {/* Graphique circulaire répartition */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ChartPieIcon className="h-5 w-5 mr-2 text-slate-600" />
                  🎯 Répartition des Soldes par Compte
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Graphique circulaire */}
                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative w-72 h-72">
                        <svg className="w-full h-full transform -rotate-90">
                          {(() => {
                            let currentOffset = 0;
                            const totalSolde = bankAccounts.reduce((sum, acc) => sum + acc.solde, 0);
                            const colors = ['#334155', '#475569', '#64748b', '#94a3b8'];
                            return bankAccounts.map((acc, idx) => {
                              const circumference = 2 * Math.PI * 110;
                              const percentage = (acc.solde / totalSolde) * 100;
                              const strokeLength = (percentage / 100) * circumference;
                              const circle = (
                                <circle
                                  key={idx}
                                  cx="144"
                                  cy="144"
                                  r="110"
                                  fill="none"
                                  stroke={colors[idx % colors.length]}
                                  strokeWidth="45"
                                  strokeDasharray={`${strokeLength} ${circumference}`}
                                  strokeDashoffset={-currentOffset}
                                  strokeLinecap="round"
                                  opacity="0"
                                >
                                  <animate
                                    attributeName="opacity"
                                    from="0"
                                    to="1"
                                    begin={`${idx * 0.3}s`}
                                    dur="0.5s"
                                    fill="freeze"
                                  />
                                  <animate
                                    attributeName="stroke-dashoffset"
                                    from={-currentOffset + strokeLength}
                                    to={-currentOffset}
                                    begin={`${idx * 0.3}s`}
                                    dur="1s"
                                    fill="freeze"
                                  />
                                </circle>
                              );
                              currentOffset += strokeLength;
                              return circle;
                            });
                          })()}
                        </svg>
                        
                        {/* Texte au centre */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-4xl font-black text-slate-900">
                            {bankAccounts.reduce((sum, acc) => sum + acc.solde, 0).toLocaleString()}
                          </div>
                          <div className="text-sm text-slate-600 font-semibold">DA Total</div>
                        </div>
                      </div>
                    </div>

                    {/* Légende */}
                    <div className="space-y-2">
                      {bankAccounts.map((acc, index) => {
                        const colors = ['bg-slate-700', 'bg-slate-600', 'bg-slate-500', 'bg-slate-400'];
                        const totalSolde = bankAccounts.reduce((sum, a) => sum + a.solde, 0);
                        const percentage = ((acc.solde / totalSolde) * 100).toFixed(1);
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 ${colors[index % colors.length]} rounded-full shadow`}></div>
                              <span className="text-sm font-bold text-slate-900">{acc.name}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-black text-slate-900">{percentage}%</span>
                              <span className="text-xs text-slate-600">({acc.solde.toLocaleString()} DA)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Détails avec barres */}
                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-5 text-lg">Analyse par Compte</h4>
                    <div className="space-y-5">
                      {bankAccounts.map((acc, index) => {
                        const totalSolde = bankAccounts.reduce((sum, a) => sum + a.solde, 0);
                        const percentage = ((acc.solde / totalSolde) * 100).toFixed(1);
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-slate-900">{acc.name}</span>
                              <div className="flex items-center space-x-2">
                                {acc.variation > 0 ? (
                                  <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-600" />
                                ) : (
                                  <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
                                )}
                                <span className={`text-sm font-black ${acc.variation > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {acc.variation > 0 ? '+' : ''}{acc.variation}%
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-6 shadow-inner relative overflow-hidden">
                              <div 
                                className="h-6 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-end pr-3 transition-all duration-1500 ease-out"
                                style={{ 
                                  width: `${percentage}%`,
                                  transitionDelay: `${index * 200}ms`
                                }}
                              >
                                <span className="text-xs font-bold text-white">{percentage}%</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">{acc.solde.toLocaleString()} DA</span>
                              <span className="font-bold text-slate-900">{percentage}% du total</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des comptes */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <BuildingLibraryIcon className="h-5 w-5 mr-2 text-slate-600" />
                  💳 Détail des Comptes Bancaires & Caisses
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {bankAccounts.map((account, index) => {
                    const AccountIcon = account.icon;
                    return (
                      <div key={index} className="bg-white rounded-lg p-6 border border-slate-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                              <AccountIcon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{account.name}</div>
                              <div className="text-sm text-slate-600">{account.number}</div>
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                            account.status === 'actif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {account.status}
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-4 mb-4">
                          <div className="text-xs text-slate-500 mb-1">Solde actuel</div>
                          <div className="text-3xl font-black text-slate-900">
                            {account.solde.toLocaleString()} {account.devise}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                          <div className="text-center">
                            <div className="text-xs text-slate-500 mb-1">Type</div>
                            <div className="text-sm font-semibold text-slate-900">{account.type}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-500 mb-1">Variation</div>
                            <div className={`text-sm font-semibold ${account.variation > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {account.variation > 0 ? '+' : ''}{account.variation}%
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-500 mb-1">Mouvements</div>
                            <div className="text-sm font-semibold text-slate-900">{account.movements}</div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-200 text-xs text-slate-600">
                          Dernier mouvement: {account.lastMovement}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mouvements récents */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-slate-600" />
                  ⏱️ Mouvements Récents
                </h3>

                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Libellé</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Compte</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-700 uppercase">Montant</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {recentMovements.map((movement, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-900 font-medium">{movement.date}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              movement.type === 'Encaissement' ? 'bg-emerald-100 text-emerald-700' :
                              movement.type === 'Décaissement' ? 'bg-red-100 text-red-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {movement.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900">{movement.libelle}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{movement.compte}</td>
                          <td className="px-6 py-4 text-sm text-right font-bold">
                            <span className={movement.montant > 0 ? 'text-emerald-600' : 'text-red-600'}>
                              {movement.montant > 0 ? '+' : ''}{movement.montant.toLocaleString()} DA
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <CheckCircleIcon className="h-5 w-5 text-emerald-500 inline" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* VUE 3: PRÉVISIONS ET TENSIONS */}
          {selectedView === 'previsions-tensions' && (
            <>
              {/* Alertes de tensions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border-l-4 border-red-500 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                    <span className="text-xs font-bold text-red-600 uppercase">Critique</span>
                  </div>
                  <div className="text-3xl font-black text-red-700 mb-1">
                    {tensions.filter(t => t.severity === 'critical').length}
                  </div>
                  <div className="text-sm text-red-600 font-medium">Alertes critiques</div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-5 border-l-4 border-amber-500 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <BellIcon className="h-8 w-8 text-amber-600" />
                    <span className="text-xs font-bold text-amber-600 uppercase">Attention</span>
                  </div>
                  <div className="text-3xl font-black text-amber-700 mb-1">
                    {tensions.filter(t => t.severity === 'warning').length}
                  </div>
                  <div className="text-sm text-amber-600 font-medium">Avertissements</div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-5 border-l-4 border-emerald-500 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-600 uppercase">Sain</span>
                  </div>
                  <div className="text-3xl font-black text-emerald-700 mb-1">
                    {cashFlowData.ratioLiquidite.toFixed(2)}
                  </div>
                  <div className="text-sm text-emerald-600 font-medium">Ratio de liquidité</div>
                </div>
              </div>

              {/* Liste des tensions */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-slate-600" />
                  ⚠️ Tensions & Alertes Identifiées
                </h3>

                <div className="space-y-4">
                  {tensions.map((tension, index) => (
                    <div key={index} className={`bg-white rounded-lg p-5 border-l-4 ${
                      tension.severity === 'critical' ? 'border-red-500 bg-red-50' :
                      'border-amber-500 bg-amber-50'
                    } border border-slate-200`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            tension.severity === 'critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                          }`}>
                            {tension.severity === 'critical' ? (
                              <ExclamationTriangleIcon className="h-5 w-5" />
                            ) : (
                              <BellIcon className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{tension.type}</div>
                            <div className="text-sm text-slate-600">{tension.description}</div>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          tension.severity === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {tension.date}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Montant concerné</div>
                          <div className="text-xl font-bold text-slate-900">{tension.montant.toLocaleString()} DA</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Action recommandée</div>
                          <div className="text-sm font-semibold text-slate-900">{tension.action}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graphique courbe prévisions */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600" />
                  📈 Courbe de Prévision de Trésorerie
                </h3>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  {/* Légende */}
                  <div className="flex items-center justify-center space-x-6 mb-6">
                    <div className="flex items-center">
                      <div className="w-8 h-1.5 bg-slate-700 rounded mr-2"></div>
                      <span className="text-sm font-semibold text-slate-900">Prévu</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-1.5 bg-emerald-600 rounded mr-2"></div>
                      <span className="text-sm font-semibold text-slate-900">Réalisé</span>
                    </div>
                  </div>

                  {/* Graphique SVG */}
                  <div className="relative h-80 bg-slate-50 rounded-lg p-8">
                    <svg className="w-full h-full" viewBox="0 0 700 300" preserveAspectRatio="xMidYMid meet">
                      {/* Grille */}
                      {[0, 1, 2, 3, 4].map((i) => (
                        <g key={i}>
                          <line x1="60" y1={30 + i * 50} x2="660" y2={30 + i * 50} stroke="#e2e8f0" strokeWidth="1.5" />
                          <text x="45" y={35 + i * 50} fill="#64748b" fontSize="12" fontWeight="700" textAnchor="end">
                            {(4-i) * 80}k
                          </text>
                        </g>
                      ))}

                      {/* Courbe Prévu */}
                      <path
                        d={(() => {
                          const maxVal = 320000;
                          return forecasts.map((f, i) => {
                            const x = 80 + (i * 100);
                            const y = 230 - ((f.prevu / maxVal) * 200);
                            return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                          }).join(' ');
                        })()}
                        fill="none"
                        stroke="#334155"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray="8,4"
                        strokeDashoffset="2000"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          from="2000"
                          to="0"
                          dur="2s"
                          fill="freeze"
                        />
                      </path>

                      {/* Courbe Réalisé */}
                      <path
                        d={(() => {
                          const maxVal = 320000;
                          return forecasts.filter(f => f.reel !== null).map((f, i) => {
                            const x = 80 + (i * 100);
                            const y = 230 - ((f.reel! / maxVal) * 200);
                            return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                          }).join(' ');
                        })()}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="2000"
                        strokeDashoffset="2000"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          from="2000"
                          to="0"
                          begin="0.5s"
                          dur="1.5s"
                          fill="freeze"
                        />
                      </path>

                      {/* Points Prévu */}
                      {forecasts.map((f, i) => {
                        const x = 80 + (i * 100);
                        const maxVal = 320000;
                        const y = 230 - ((f.prevu / maxVal) * 200);
                        return (
                          <g key={`prev-${i}`} className="group">
                            <circle cx={x} cy={y} r="7" fill="#334155" opacity="0">
                              <animate attributeName="opacity" from="0" to="1" begin={`${0.3 * i}s`} dur="0.4s" fill="freeze" />
                            </circle>
                            <circle cx={x} cy={y} r="3" fill="#ffffff" opacity="0">
                              <animate attributeName="opacity" from="0" to="1" begin={`${0.3 * i}s`} dur="0.4s" fill="freeze" />
                            </circle>
                          </g>
                        );
                      })}

                      {/* Points Réalisé */}
                      {forecasts.filter(f => f.reel !== null).map((f, i) => {
                        const x = 80 + (i * 100);
                        const maxVal = 320000;
                        const y = 230 - ((f.reel! / maxVal) * 200);
                        return (
                          <g key={`real-${i}`} className="group">
                            <circle cx={x} cy={y} r="8" fill="#10b981" opacity="0">
                              <animate attributeName="opacity" from="0" to="1" begin={`${0.5 + 0.3 * i}s`} dur="0.4s" fill="freeze" />
                            </circle>
                            <circle cx={x} cy={y} r="4" fill="#ffffff" opacity="0">
                              <animate attributeName="opacity" from="0" to="1" begin={`${0.5 + 0.3 * i}s`} dur="0.4s" fill="freeze" />
                            </circle>
                          </g>
                        );
                      })}

                      {/* Labels */}
                      {forecasts.map((f, i) => (
                        <text key={`lbl-${i}`} x={80 + (i * 100)} y="270" fill="#334155" fontSize="14" fontWeight="800" textAnchor="middle">
                          {f.month}
                        </text>
                      ))}
                    </svg>
                  </div>

                  {/* Statistiques */}
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t-2 border-slate-200">
                    <div className="text-center p-4 bg-slate-100 rounded-lg border border-slate-300">
                      <div className="text-xs font-semibold text-slate-600 mb-2">Prévision Juin</div>
                      <div className="text-2xl font-bold text-slate-900">
                        {forecasts[forecasts.length - 1].prevu.toLocaleString()} DA
                      </div>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="text-xs font-semibold text-emerald-600 mb-2">Écart moyen</div>
                      <div className="text-2xl font-bold text-emerald-700">
                        {Math.abs(forecasts.filter(f => f.ecart !== null).reduce((sum, f) => sum + (f.ecart || 0), 0) / forecasts.filter(f => f.ecart !== null).length).toLocaleString()} DA
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Détail prévisions */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ChartPieIcon className="h-5 w-5 mr-2 text-slate-600" />
                  🔮 Détail Prévisions vs Réalisations
                </h3>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="space-y-4">
                    {forecasts.map((forecast, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{forecast.month}</span>
                          <div className="flex items-center space-x-3">
                            {forecast.reel !== null && (
                              <span className="text-sm text-slate-600">
                                Écart: <span className={`font-bold ${forecast.ecart && forecast.ecart < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                  {forecast.ecart && forecast.ecart.toLocaleString()} DA
                                </span>
                              </span>
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              forecast.risque === 'faible' ? 'bg-emerald-100 text-emerald-700' :
                              forecast.risque === 'moyen' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              Risque: {forecast.risque}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-600">Prévu</span>
                              <span className="font-bold text-slate-900">{forecast.prevu.toLocaleString()} DA</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3">
                              <div 
                                className="h-3 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full transition-all duration-1000"
                                style={{ width: `${(forecast.prevu / 320000) * 100}%` }}
                              ></div>
                            </div>
                          </div>

                          {forecast.reel !== null && (
                            <div>
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-slate-600">Réel</span>
                                <span className="font-bold text-slate-900">{forecast.reel.toLocaleString()} DA</span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-3">
                                <div 
                                  className={`h-3 rounded-full transition-all duration-1000 ${
                                    forecast.reel >= forecast.prevu ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                                    'bg-gradient-to-r from-amber-500 to-amber-600'
                                  }`}
                                  style={{ width: `${(forecast.reel / 320000) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors flex items-center shadow-sm">
            <EyeIcon className="h-4 w-4 mr-2" />
            Voir le rapport complet
          </button>
          <button className="px-4 py-2 bg-white text-slate-700 rounded-md hover:bg-slate-50 transition-colors flex items-center border border-slate-300 shadow-sm">
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export PDF
          </button>
          <button className="px-4 py-2 bg-white text-slate-700 rounded-md hover:bg-slate-50 transition-colors flex items-center border border-slate-300 shadow-sm">
            <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
            Export Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TresorerieBanque;
