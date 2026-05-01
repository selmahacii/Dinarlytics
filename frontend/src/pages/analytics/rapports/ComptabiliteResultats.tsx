import React, { useState } from 'react';
import {
  CalculatorIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  ShareIcon,
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ArrowTrendingDownIcon,
  ChartPieIcon,
  ScaleIcon,
  ClockIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';
import { useAccountingStatements } from '@shared/hooks/useAccountingStatements';

const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0 }).format(amount);

const ComptabiliteResultats: React.FC = () => {
  const { user, companyData } = useApp();
  const [selectedView, setSelectedView] = useState('comptes-journaux');
  const { data, loading, error } = useAccountingStatements('mois');

  if (loading) return <div className="p-8 text-center text-slate-500">Chargement des états comptables...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Erreur : {error}</div>;
  if (!data) return <div className="p-8 text-center text-slate-400">Aucune donnée disponible</div>;

  const { produits, charges, resultatNet, actifTotal, actifCirculant, actifImmobilise, passifTotal, capitauxPropres, dettes, ratioLiquidite, ratioRentabilite, ratioAutonomie, ratioEndettement, repartitionCharges } = data;

  // ========================================
  // INTERFACE EURL MICRO-ENTREPRISE
  // ========================================



  if (user && user.segment === 'micro' && user.companyType === 'eurl') {

    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white p-8 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <CalculatorIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Comptabilité & Résultats</h1>
                <p className="text-slate-300 text-lg mt-1">Compte de résultat, bilan simplifié et ratios financiers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Compte de Résultat Synthétique */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mr-3">
              <DocumentTextIcon className="h-5 w-5 text-white" />
            </div>
            Compte de Résultat Synthétique (Mois en cours)
          </h2>
          
          <div className="space-y-4">
            {/* Produits */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border-2 border-emerald-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-emerald-700 uppercase">Produits d'Exploitation</p>
                  <p className="text-xs text-slate-600 mt-1">Chiffre d'affaires + Autres produits</p>
                </div>
                <p className="text-3xl font-extrabold text-emerald-600">{formatCurrency(produits)}</p>
              </div>
            </div>

            {/* Charges */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border-2 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-red-700 uppercase">Charges d'Exploitation</p>
                  <p className="text-xs text-slate-600 mt-1">Achats + Personnel + Autres charges</p>
                </div>
                <p className="text-3xl font-extrabold text-red-600">{formatCurrency(charges)}</p>
              </div>
            </div>

            {/* Résultat Net */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white uppercase">Résultat Net</p>
                  <p className="text-xs text-slate-300 mt-1">Produits - Charges</p>
                </div>
                <p className="text-4xl font-extrabold text-emerald-400">+{formatCurrency(resultatNet)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Répartition des Charges */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-300 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg mr-3">
              <ChartPieIcon className="h-5 w-5 text-white" />
            </div>
            Répartition Détaillée des Charges
          </h2>
          <div className="space-y-4">
            {repartitionCharges.map((charge, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border-2 border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-slate-900">{charge.type}</p>
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-slate-900">{formatCurrency(charge.montant)}</p>
                    <p className="text-xs font-bold text-red-600">{charge.part}%</p>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${charge.couleur} rounded-full transition-all duration-500`}
                    style={{ width: `${charge.part}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bilan Simplifié */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ACTIF */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-300 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg mr-3">
                <ScaleIcon className="h-5 w-5 text-white" />
              </div>
              ACTIF
            </h3>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-bold text-slate-700">Actif Immobilisé</p>
                <p className="text-2xl font-extrabold text-blue-600 mt-1">{formatCurrency(actifImmobilise)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <p className="text-sm font-bold text-slate-700">Actif Circulant</p>
                <p className="text-2xl font-extrabold text-blue-600 mt-1">{formatCurrency(actifCirculant)}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 rounded-lg">
                <p className="text-sm font-bold text-white">TOTAL ACTIF</p>
                <p className="text-3xl font-extrabold text-white mt-1">{formatCurrency(actifTotal)}</p>
              </div>
            </div>
          </div>

          {/* PASSIF */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-300 p-6 shadow-lg">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mr-3">
                <ScaleIcon className="h-5 w-5 text-white" />
              </div>
              PASSIF
            </h3>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <p className="text-sm font-bold text-slate-700">Capitaux Propres</p>
                <p className="text-2xl font-extrabold text-purple-600 mt-1">{formatCurrency(capitauxPropres)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-purple-200">
                <p className="text-sm font-bold text-slate-700">Dettes</p>
                <p className="text-2xl font-extrabold text-purple-600 mt-1">{formatCurrency(dettes)}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-lg">
                <p className="text-sm font-bold text-white">TOTAL PASSIF</p>
                <p className="text-3xl font-extrabold text-white mt-1">{formatCurrency(passifTotal)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ratios Financiers Clés */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mr-3">
              <ChartBarIcon className="h-5 w-5 text-white" />
            </div>
            Ratios Financiers Clés
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border-2 border-emerald-200">
              <p className="text-xs font-bold text-slate-600 uppercase">Liquidité Générale</p>
              <p className="text-3xl font-extrabold text-emerald-600 mt-2">{ratioLiquidite}%</p>
              <p className="text-xs text-slate-500 mt-1">Actif Circ. / Dettes</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
              <p className="text-xs font-bold text-slate-600 uppercase">Rentabilité</p>
              <p className="text-3xl font-extrabold text-blue-600 mt-2">{ratioRentabilite}%</p>
              <p className="text-xs text-slate-500 mt-1">Résultat / CA</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border-2 border-purple-200">
              <p className="text-xs font-bold text-slate-600 uppercase">Autonomie Financière</p>
              <p className="text-3xl font-extrabold text-purple-600 mt-2">{ratioAutonomie}%</p>
              <p className="text-xs text-slate-500 mt-1">Cap. Propres / Total</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border-2 border-amber-200">
              <p className="text-xs font-bold text-slate-600 uppercase">Endettement</p>
              <p className="text-3xl font-extrabold text-amber-600 mt-2">{ratioEndettement}%</p>
              <p className="text-xs text-slate-500 mt-1">Dettes / Cap. Propres</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button className="p-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl font-bold hover:from-slate-800 hover:to-black shadow-md hover:shadow-lg transition-all duration-300">
              📊 Exporter le bilan
            </button>
            <button className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all duration-300">
              📈 Rapport complet
            </button>
            <button className="p-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:border-emerald-400 hover:shadow-lg transition-all duration-300">
              🖨️ Imprimer
            </button>
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
      id: 'comptes-journaux',
      title: 'Comptes & journaux',
      icon: ClipboardDocumentListIcon,
      description: 'Rapports comptables de base',
      indicators: ['Balance générale / auxiliaire', 'Grand livre par compte', 'Journal des ventes / achats / trésorerie', 'États comptables exportables (PDF, Excel)']
    },
    {
      id: 'resultats-rentabilite',
      title: 'Résultats & rentabilité',
      icon: ChartBarIcon,
      description: 'Analyse de rentabilité',
      indicators: ['Compte de résultat (simplifié)', 'Résultat net / marge nette', 'Ratios : rentabilité, solvabilité, rotation']
    },
    {
      id: 'analyse-comparative',
      title: 'Analyse comparative',
      icon: ArrowTrendingUpIcon,
      description: 'Comparaisons temporelles',
      indicators: ['Année N vs N-1', 'Résultat par département / activité', 'Corrélation charges ↔ ventes']
    }
  ];

  const currentView = views.find(v => v.id === selectedView) || views[0];

  // Données enrichies pour comptabilité
  const accountingData = {
    resultatNet: 485000,
    margeNette: 8.5,
    rentabilite: 12.3,
    solvabilite: 1.8,
    rotation: 6.2,
    // Données pour Comptes & Journaux
    nombreEcritures: 1248,
    totalDebit: 5240000,
    totalCredit: 5240000,
    soldeBanque: 245000,
    ecrituresEnAttente: 8,
    // Données pour Résultats
    chiffreAffaires: 5720000,
    coutAchat: 3180000,
    margeBrute: 2540000,
    chargesExploitation: 1950000,
    resultatExploitation: 590000,
    tauxRentabiliteNette: 8.5,
    seuilRentabilite: 4280000,
    indicePerformance: 87
  };

  // Journaux comptables
  const journaux = [
    { type: 'Ventes', compte: '70x', nbEcritures: 385, debit: 0, credit: 5720000, statut: 'validé' },
    { type: 'Achats', compte: '60x', nbEcritures: 428, debit: 3180000, credit: 0, statut: 'validé' },
    { type: 'Trésorerie', compte: '5xx', nbEcritures: 312, debit: 2850000, credit: 2640000, statut: 'validé' },
    { type: 'Divers', compte: 'Autres', nbEcritures: 123, debit: 450000, credit: 420000, statut: 'en cours' }
  ];

  // Écritures récentes
  const recentEntries = [
    { date: '15/01/2024', piece: 'VTE-2024-015', libelle: 'Vente Client ABC', compte: '7011', debit: 0, credit: 185000, journal: 'Ventes', statut: 'validé' },
    { date: '15/01/2024', piece: 'ACH-2024-042', libelle: 'Achat Fournisseur XYZ', compte: '6011', debit: 125000, credit: 0, journal: 'Achats', statut: 'validé' },
    { date: '14/01/2024', piece: 'BQ-2024-028', libelle: 'Virement salaires', compte: '421', debit: 350000, credit: 0, journal: 'Trésorerie', statut: 'validé' },
    { date: '14/01/2024', piece: 'VTE-2024-014', libelle: 'Vente Client DEF', compte: '7011', debit: 0, credit: 220000, journal: 'Ventes', statut: 'validé' },
    { date: '13/01/2024', piece: 'DIV-2024-005', libelle: 'Dotation amortissement', compte: '6811', debit: 45000, credit: 0, journal: 'Divers', statut: 'brouillon' }
  ];

  // Résultats mensuels
  const monthlyResults = [
    { month: 'Jan', ca: 920000, charges: 820000, resultat: 100000 },
    { month: 'Fév', ca: 880000, charges: 790000, resultat: 90000 },
    { month: 'Mar', ca: 980000, charges: 850000, resultat: 130000 },
    { month: 'Avr', ca: 950000, charges: 830000, resultat: 120000 },
    { month: 'Mai', ca: 1050000, charges: 880000, resultat: 170000 },
    { month: 'Jun', ca: 1100000, charges: 920000, resultat: 180000 }
  ];

  // Répartition des charges
  const chargesBreakdown = [
    { type: 'Salaires & charges sociales', montant: 1248000, percentage: 32, color: 'bg-slate-700' },
    { type: 'Achats de marchandises', montant: 1170000, percentage: 30, color: 'bg-slate-600' },
    { type: 'Loyers & charges fixes', montant: 585000, percentage: 15, color: 'bg-slate-500' },
    { type: 'Services extérieurs', montant: 468000, percentage: 12, color: 'bg-slate-400' },
    { type: 'Autres charges', montant: 429000, percentage: 11, color: 'bg-slate-300' }
  ];

  // Comparatif N vs N-1
  const comparativeData = [
    { indicator: 'Chiffre d\'affaires', n: 5720000, n1: 5280000, evolution: 8.3 },
    { indicator: 'Marge brute', n: 2540000, n1: 2180000, evolution: 16.5 },
    { indicator: 'Charges exploitation', n: 1950000, n1: 1880000, evolution: 3.7 },
    { indicator: 'Résultat d\'exploitation', n: 590000, n1: 300000, evolution: 96.7 },
    { indicator: 'Résultat net', n: 485000, n1: 245000, evolution: 98.0 }
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <CalculatorIcon className="h-8 w-8 mr-3 text-slate-600" />
              Comptabilité & Résultats
            </h1>
            <p className="text-slate-600 mt-1">Rapports comptables et analyse de rentabilité</p>
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
          {/* VUE 1: COMPTES & JOURNAUX */}
          {selectedView === 'comptes-journaux' && (
            <>
              {/* KPIs principaux */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 font-semibold flex items-center">
                      <DocumentTextIcon className="h-4 w-4 mr-1" />
                      Écritures totales
                    </span>
                    <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="text-3xl font-black text-slate-900">
                    {accountingData.nombreEcritures}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">lignes comptables</div>
                </div>

                <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-emerald-600 font-semibold flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                      Total Débit
                    </span>
                    <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-black text-emerald-700">
                    {accountingData.totalDebit.toLocaleString()} DA
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">somme des débits</div>
                </div>

                <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 font-semibold flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                      Total Crédit
                    </span>
                    <ArrowTrendingDownIcon className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="text-3xl font-black text-slate-900">
                    {accountingData.totalCredit.toLocaleString()} DA
                  </div>
                  <div className="text-xs text-slate-600 mt-1">somme des crédits</div>
                </div>

                <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-emerald-600 font-semibold flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Équilibre
                    </span>
                    <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-700">
                    ✅ Équilibré
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">Débit = Crédit</div>
                </div>

                <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600 font-semibold flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      En attente
                    </span>
                    <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="text-3xl font-black text-amber-600">
                    {accountingData.ecrituresEnAttente}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">à valider</div>
                </div>
              </div>

              {/* Journaux comptables avec graphiques */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2 text-slate-600" />
                    📚 Synthèse des Journaux Comptables
                  </h3>
                  <button className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors flex items-center text-sm">
                    <PrinterIcon className="h-4 w-4 mr-2" />
                    Impression officielle
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-slate-700 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase">Type Journal</th>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase">Comptes</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase">Nb Écritures</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase">Total Débit</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase">Total Crédit</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase">Statut</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {journaux.map((journal, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{journal.type}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{journal.compte}</td>
                          <td className="px-6 py-4 text-center font-semibold text-slate-900">{journal.nbEcritures}</td>
                          <td className="px-6 py-4 text-right font-bold text-emerald-600">
                            {journal.debit > 0 ? journal.debit.toLocaleString() : '-'} DA
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-700">
                            {journal.credit > 0 ? journal.credit.toLocaleString() : '-'} DA
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              journal.statut === 'validé' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                              'bg-amber-100 text-amber-700 border border-amber-300'
                            }`}>
                              {journal.statut}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button className="px-3 py-1 bg-slate-600 text-white rounded text-xs hover:bg-slate-700 transition-colors">
                              <MagnifyingGlassIcon className="h-3 w-3 inline mr-1" />
                              Analyser
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-300">
                      <tr>
                        <td className="px-6 py-4 font-black text-slate-900" colSpan={2}>TOTAL</td>
                        <td className="px-6 py-4 text-center font-black text-slate-900">
                          {journaux.reduce((sum, j) => sum + j.nbEcritures, 0)}
                        </td>
                        <td className="px-6 py-4 text-right font-black text-emerald-700">
                          {journaux.reduce((sum, j) => sum + j.debit, 0).toLocaleString()} DA
                        </td>
                        <td className="px-6 py-4 text-right font-black text-slate-900">
                          {journaux.reduce((sum, j) => sum + j.credit, 0).toLocaleString()} DA
                        </td>
                        <td className="px-6 py-4 text-center" colSpan={2}>
                          <CheckCircleIcon className="h-6 w-6 text-emerald-600 inline" />
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Écritures récentes */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2 text-slate-600" />
                  ⏱️ Dernières Écritures Comptables
                </h3>

                <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Pièce</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Libellé</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase">Compte</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-700 uppercase">Débit</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-slate-700 uppercase">Crédit</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase">Journal</th>
                        <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {recentEntries.map((entry, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-900 font-medium">{entry.date}</td>
                          <td className="px-6 py-4 text-sm text-slate-700 font-mono">{entry.piece}</td>
                          <td className="px-6 py-4 text-sm text-slate-900">{entry.libelle}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-mono">{entry.compte}</td>
                          <td className="px-6 py-4 text-sm text-right font-bold text-emerald-600">
                            {entry.debit > 0 ? entry.debit.toLocaleString() : '-'} DA
                          </td>
                          <td className="px-6 py-4 text-sm text-right font-bold text-slate-700">
                            {entry.credit > 0 ? entry.credit.toLocaleString() : '-'} DA
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                              {entry.journal}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {entry.statut === 'validé' ? (
                              <CheckCircleIcon className="h-5 w-5 text-emerald-500 inline" />
                            ) : (
                              <ClockIcon className="h-5 w-5 text-amber-500 inline" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Graphiques analytiques */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Répartition par type de journal */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                    <ChartPieIcon className="h-5 w-5 mr-2 text-slate-600" />
                    🎯 Répartition par Type de Journal
                  </h3>

                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative w-64 h-64">
                        <svg className="w-full h-full transform -rotate-90">
                          {(() => {
                            let currentOffset = 0;
                            const colors = ['#10b981', '#ef4444', '#334155', '#94a3b8'];
                            const total = journaux.reduce((sum, j) => sum + j.nbEcritures, 0);
                            
                            return journaux.map((journal, idx) => {
                              const circumference = 2 * Math.PI * 100;
                              const percentage = (journal.nbEcritures / total) * 100;
                              const strokeLength = (percentage / 100) * circumference;
                              const circle = (
                                <circle
                                  key={idx}
                                  cx="128"
                                  cy="128"
                                  r="100"
                                  fill="none"
                                  stroke={colors[idx]}
                                  strokeWidth="40"
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
                          <div className="text-3xl font-black text-slate-900">{accountingData.nombreEcritures}</div>
                          <div className="text-sm text-slate-600 font-semibold">Écritures</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {journaux.map((journal, index) => {
                        const colors = ['bg-emerald-500', 'bg-red-500', 'bg-slate-700', 'bg-slate-400'];
                        const total = journaux.reduce((sum, j) => sum + j.nbEcritures, 0);
                        const percentage = ((journal.nbEcritures / total) * 100).toFixed(1);
                        return (
                          <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 ${colors[index]} rounded-full`}></div>
                              <span className="text-xs font-bold text-slate-900">{journal.type}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-black text-slate-900">{journal.nbEcritures}</span>
                              <span className="text-xs text-slate-600">({percentage}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Évolution mensuelle des écritures */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600" />
                    📈 Volume d'Activité Comptable
                  </h3>

                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <div className="space-y-4">
                      {monthlyResults.map((month, index) => {
                        const ecritures = Math.round((month.ca + month.charges) / 10000);
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{month.month}</span>
                              <span className="text-sm font-black text-slate-900">{ecritures} écritures</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-4 shadow-inner">
                              <div 
                                className="h-4 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full transition-all duration-1500 ease-out flex items-center justify-end pr-3"
                                style={{ 
                                  width: `${(ecritures / 220) * 100}%`,
                                  transitionDelay: `${index * 100}ms`
                                }}
                              >
                                <span className="text-xs font-bold text-white">{ecritures}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* VUE 2: RÉSULTATS & RENTABILITÉ */}
          {selectedView === 'resultats-rentabilite' && (
            <>
              {/* Indicateurs de performance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                  <span className="text-sm text-emerald-600 font-semibold flex items-center mb-2">
                    <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                    CA net
                  </span>
                  <div className="text-3xl font-black text-emerald-700">
                    {(accountingData.chiffreAffaires / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">Chiffre d'affaires</div>
                </div>

                <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                  <span className="text-sm text-slate-600 font-semibold flex items-center mb-2">
                    <BanknotesIcon className="h-4 w-4 mr-1" />
                    Marge brute
                  </span>
                  <div className="text-3xl font-black text-slate-900">
                    {(accountingData.margeBrute / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {((accountingData.margeBrute / accountingData.chiffreAffaires) * 100).toFixed(1)}% du CA
                  </div>
                </div>

                <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                  <span className="text-sm text-slate-600 font-semibold flex items-center mb-2">
                    <DocumentTextIcon className="h-4 w-4 mr-1" />
                    Charges
                  </span>
                  <div className="text-3xl font-black text-red-600">
                    {(accountingData.chargesExploitation / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-xs text-slate-600 mt-1">Exploitation</div>
                </div>

                <div className="p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                  <span className="text-sm text-emerald-600 font-semibold flex items-center mb-2">
                    <ChartBarIcon className="h-4 w-4 mr-1" />
                    Résultat net
                  </span>
                  <div className="text-3xl font-black text-emerald-700">
                    {(accountingData.resultatNet / 1000).toFixed(0)}k
                  </div>
                  <div className="text-xs text-emerald-600 mt-1">+{accountingData.tauxRentabiliteNette}%</div>
                </div>

                <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                  <span className="text-sm text-slate-600 font-semibold flex items-center mb-2">
                    <SparklesIcon className="h-4 w-4 mr-1" />
                    Performance AI
                  </span>
                  <div className="text-3xl font-black text-slate-900">
                    {accountingData.indicePerformance}/100
                  </div>
                  <div className="text-xs text-slate-600 mt-1">Indice global</div>
                </div>
              </div>

              {/* Graphique Résultat net mensuel - Amélioré */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg mr-3 shadow-md">
                      <ChartBarIcon className="h-6 w-6 text-white" />
                    </div>
                    Évolution du Résultat Net Mensuel
                </h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-600">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full mr-1"></div>
                      <span>Résultat Net</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <div className="relative h-96 bg-gradient-to-b from-slate-50 to-white rounded-lg p-8">
                    {(() => {
                      const maxVal = 180000;
                      const moyenneResultat = monthlyResults.reduce((sum, m) => sum + m.resultat, 0) / monthlyResults.length;
                      const moyenneY = 40 + ((maxVal - moyenneResultat) / maxVal) * 250;
                      return (
                        <svg className="w-full h-full" viewBox="0 0 800 350" preserveAspectRatio="xMidYMid meet">
                          {/* Grille améliorée */}
                          {[0, 1, 2, 3, 4, 5].map((i) => (
                        <g key={i}>
                              <line 
                                x1="80" 
                                y1={40 + i * 50} 
                                x2="720" 
                                y2={40 + i * 50} 
                                stroke={i === 0 ? "#cbd5e1" : "#e2e8f0"} 
                                strokeWidth={i === 0 ? "2" : "1"} 
                                strokeDasharray={i === 0 ? "0" : "4,4"}
                              />
                              <text 
                                x="70" 
                                y={45 + i * 50} 
                                fill="#475569" 
                                fontSize="13" 
                                fontWeight="700" 
                                textAnchor="end"
                              >
                                {(5-i) * 36}k
                          </text>
                        </g>
                      ))}

                          {/* Ligne de référence moyenne */}
                          <line 
                            x1="80" 
                            y1={moyenneY} 
                            x2="720" 
                            y2={moyenneY} 
                            stroke="#94a3b8" 
                            strokeWidth="2" 
                            strokeDasharray="8,4"
                            opacity="0.6"
                          />
                          <text 
                            x="725" 
                            y={moyenneY - 5} 
                            fill="#64748b" 
                            fontSize="11" 
                            fontWeight="600"
                          >
                            Moyenne
                          </text>

                      {/* Zone remplie avec gradient amélioré */}
                      <path
                        d={(() => {
                          let path = 'M 80 290 ';
                          monthlyResults.forEach((m, i) => {
                            const x = 120 + (i * 100);
                            const y = 290 - ((m.resultat / maxVal) * 250);
                            path += `L ${x} ${y} `;
                          });
                          path += 'L 720 290 Z';
                          return path;
                        })()}
                        fill="url(#resultGradientImproved)"
                        opacity="0.3"
                      />

                      {/* Barres verticales pour chaque mois */}
                      {monthlyResults.map((m, i) => {
                        const x = 120 + (i * 100);
                        const y = 290 - ((m.resultat / maxVal) * 250);
                        const barHeight = 290 - y;
                        return (
                          <g key={`bar-${i}`}>
                            <rect
                              x={x - 30}
                              y={y}
                              width="60"
                              height={barHeight}
                              fill="url(#barGradient)"
                              opacity="0.6"
                              rx="4"
                            >
                              <animate attributeName="opacity" from="0" to="0.6" begin={`${i * 0.15}s`} dur="0.5s" fill="freeze" />
                              <animateTransform
                                attributeName="transform"
                                type="scale"
                                values="1 0; 1 1"
                                begin={`${i * 0.15}s`}
                                dur="0.5s"
                                fill="freeze"
                              />
                            </rect>
                          </g>
                        );
                      })}

                      {/* Courbe améliorée */}
                      <path
                        d={(() => {
                          return monthlyResults.map((m, i) => {
                            const x = 120 + (i * 100);
                            const y = 290 - ((m.resultat / maxVal) * 250);
                            return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                          }).join(' ');
                        })()}
                        fill="none"
                        stroke="url(#lineGradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="2000"
                        strokeDashoffset="2000"
                      >
                        <animate attributeName="stroke-dashoffset" from="2000" to="0" dur="2.5s" fill="freeze" />
                      </path>

                      {/* Points améliorés avec ombre */}
                      {monthlyResults.map((m, i) => {
                        const x = 120 + (i * 100);
                        const y = 290 - ((m.resultat / maxVal) * 250);
                        return (
                          <g key={i}>
                            {/* Ombre */}
                            <circle cx={x + 2} cy={y + 2} r="10" fill="#000" opacity="0.1" />
                            {/* Point externe */}
                            <circle cx={x} cy={y} r="10" fill="#ffffff" stroke="#10b981" strokeWidth="3" opacity="0">
                              <animate attributeName="opacity" from="0" to="1" begin={`${2.5 + i * 0.15}s`} dur="0.3s" fill="freeze" />
                            </circle>
                            {/* Point interne */}
                            <circle cx={x} cy={y} r="6" fill="#10b981" opacity="0">
                              <animate attributeName="opacity" from="0" to="1" begin={`${2.5 + i * 0.15 + 0.1}s`} dur="0.3s" fill="freeze" />
                            </circle>
                            {/* Valeur */}
                            <g opacity="0">
                              <rect 
                                x={x - 35} 
                                y={y - 45} 
                                width="70" 
                                height="28" 
                                rx="6" 
                                fill="#1e293b" 
                                opacity="0.9"
                              />
                              <text 
                                x={x} 
                                y={y - 28} 
                                fill="#ffffff" 
                                fontSize="12" 
                                fontWeight="900" 
                                textAnchor="middle"
                              >
                                {(m.resultat / 1000).toFixed(0)}k DA
                            </text>
                              <animate attributeName="opacity" from="0" to="1" begin={`${2.5 + i * 0.15 + 0.2}s`} dur="0.3s" fill="freeze" />
                            </g>
                          </g>
                        );
                      })}

                      {/* Labels améliorés */}
                      {monthlyResults.map((m, i) => (
                        <g key={`label-${i}`}>
                          <text 
                            x={120 + (i * 100)} 
                            y="320" 
                            fill="#334155" 
                            fontSize="15" 
                            fontWeight="800" 
                            textAnchor="middle"
                          >
                          {m.month}
                        </text>
                          <text 
                            x={120 + (i * 100)} 
                            y="335" 
                            fill="#64748b" 
                            fontSize="11" 
                            fontWeight="600" 
                            textAnchor="middle"
                          >
                            {m.ca.toLocaleString().slice(0, -3)}k
                          </text>
                        </g>
                      ))}

                      <defs>
                        <linearGradient id="resultGradientImproved" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                          <stop offset="50%" stopColor="#10b981" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="50%" stopColor="#059669" />
                          <stop offset="100%" stopColor="#047857" />
                        </linearGradient>
                        <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                          <stop offset="100%" stopColor="#059669" stopOpacity="0.4" />
                        </linearGradient>
                      </defs>
                    </svg>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t-2 border-slate-200">
                    <div className="text-center p-5 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-300 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">Total Résultat</div>
                      <div className="text-3xl font-black text-emerald-900 mb-1">
                        {monthlyResults.reduce((sum, m) => sum + m.resultat, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-emerald-600 font-semibold">6 mois</div>
                    </div>
                    <div className="text-center p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-300 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Moyenne</div>
                      <div className="text-3xl font-black text-slate-900 mb-1">
                        {(monthlyResults.reduce((sum, m) => sum + m.resultat, 0) / monthlyResults.length).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-600 font-semibold">Par mois</div>
                    </div>
                    <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Meilleur mois</div>
                      <div className="text-2xl font-black text-blue-900 mb-1">
                        {[...monthlyResults].sort((a, b) => b.resultat - a.resultat)[0].month}
                      </div>
                      <div className="text-xs text-blue-600 font-semibold">
                        {[...monthlyResults].sort((a, b) => b.resultat - a.resultat)[0].resultat.toLocaleString()} DA
                      </div>
                    </div>
                    <div className="text-center p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-300 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2">Tendance</div>
                      <div className="flex items-center justify-center mb-1">
                        <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="text-xs text-purple-600 font-semibold">
                        {((monthlyResults[monthlyResults.length - 1].resultat - monthlyResults[0].resultat) / monthlyResults[0].resultat * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Répartition des charges */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                  <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-700 rounded-lg mr-3 shadow-md">
                    <ChartPieIcon className="h-6 w-6 text-white" />
                  </div>
                  Répartition des Charges par Type
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Graphique circulaire amélioré */}
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative w-80 h-80">
                        <svg className="w-full h-full transform -rotate-90">
                          {(() => {
                            let currentOffset = 0;
                            const colors = [
                              { start: '#1e293b', end: '#334155' },
                              { start: '#475569', end: '#64748b' },
                              { start: '#64748b', end: '#94a3b8' },
                              { start: '#94a3b8', end: '#cbd5e1' },
                              { start: '#cbd5e1', end: '#e2e8f0' }
                            ];
                            const total = chargesBreakdown.reduce((sum, c) => sum + c.montant, 0);
                            
                            return chargesBreakdown.map((charge, idx) => {
                              const circumference = 2 * Math.PI * 120;
                              const percentage = (charge.montant / total) * 100;
                              const strokeLength = (percentage / 100) * circumference;
                              const gradientId = `chargeGradient${idx}`;
                              return (
                                <g key={idx}>
                                  <defs>
                                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                                      <stop offset="0%" stopColor={colors[idx].start} />
                                      <stop offset="100%" stopColor={colors[idx].end} />
                                    </linearGradient>
                                  </defs>
                                <circle
                                    cx="160"
                                    cy="160"
                                    r="120"
                                  fill="none"
                                    stroke={`url(#${gradientId})`}
                                    strokeWidth="50"
                                  strokeDasharray={`${strokeLength} ${circumference}`}
                                  strokeDashoffset={-currentOffset}
                                  strokeLinecap="round"
                                  opacity="0"
                                    filter="url(#shadow)"
                                >
                                    <animate attributeName="opacity" from="0" to="1" begin={`${idx * 0.2}s`} dur="0.6s" fill="freeze" />
                                  <animate
                                    attributeName="stroke-dashoffset"
                                    from={-currentOffset + strokeLength}
                                    to={-currentOffset}
                                      begin={`${idx * 0.2}s`}
                                      dur="1.2s"
                                    fill="freeze"
                                  />
                                </circle>
                                </g>
                              );
                              currentOffset += strokeLength;
                            });
                          })()}
                          <defs>
                            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                              <feOffset dx="2" dy="2" result="offsetblur"/>
                              <feComponentTransfer>
                                <feFuncA type="linear" slope="0.3"/>
                              </feComponentTransfer>
                              <feMerge>
                                <feMergeNode/>
                                <feMergeNode in="SourceGraphic"/>
                              </feMerge>
                            </filter>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-5xl font-black text-slate-900 mb-1">100%</div>
                          <div className="text-sm text-slate-600 font-bold uppercase tracking-wide">Charges</div>
                          <div className="text-xs text-slate-500 mt-1">
                            {chargesBreakdown.reduce((sum, c) => sum + c.montant, 0).toLocaleString()} DA
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {chargesBreakdown.map((charge, index) => {
                        const colorClasses = [
                          'bg-gradient-to-r from-slate-700 to-slate-800',
                          'bg-gradient-to-r from-slate-600 to-slate-700',
                          'bg-gradient-to-r from-slate-500 to-slate-600',
                          'bg-gradient-to-r from-slate-400 to-slate-500',
                          'bg-gradient-to-r from-slate-300 to-slate-400'
                        ];
                        return (
                          <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all">
                            <div className="flex items-center space-x-4 flex-1">
                              <div className={`w-5 h-5 ${colorClasses[index]} rounded-full shadow-md`}></div>
                            <span className="text-sm font-bold text-slate-900">{charge.type}</span>
                          </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="text-sm font-black text-slate-900">{charge.percentage}%</div>
                                <div className="text-xs text-slate-600">{charge.montant.toLocaleString()} DA</div>
                          </div>
                        </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Détails avec barres améliorées */}
                  <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-6 text-lg flex items-center">
                      <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600" />
                      Analyse Détaillée
                    </h4>
                    <div className="space-y-6">
                      {chargesBreakdown.map((charge, index) => {
                        const gradientColors = [
                          'from-slate-700 to-slate-800',
                          'from-slate-600 to-slate-700',
                          'from-slate-500 to-slate-600',
                          'from-slate-400 to-slate-500',
                          'from-slate-300 to-slate-400'
                        ];
                        return (
                          <div key={index} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-900">{charge.type}</span>
                              <div className="flex items-center space-x-3">
                            <span className="text-sm font-black text-slate-900">{charge.percentage}%</span>
                                <span className="text-xs text-slate-600 font-semibold">{charge.montant.toLocaleString()} DA</span>
                          </div>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-8 shadow-inner border border-slate-200">
                            <div 
                                className={`h-8 bg-gradient-to-r ${gradientColors[index]} rounded-full transition-all duration-1500 ease-out flex items-center justify-end pr-4 shadow-md`}
                              style={{ 
                                width: `${charge.percentage}%`,
                                transitionDelay: `${index * 150}ms`
                              }}
                            >
                              <span className="text-xs font-bold text-white">{charge.percentage}%</span>
                            </div>
                          </div>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>Part du total des charges</span>
                              <span className="font-semibold">{((charge.montant / chargesBreakdown.reduce((sum, c) => sum + c.montant, 0)) * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphique Comparatif CA vs Charges */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3 shadow-md">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  Comparaison CA vs Charges (6 mois)
                </h3>

                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <div className="relative h-80 bg-gradient-to-b from-slate-50 to-white rounded-lg p-8">
                    <svg className="w-full h-full" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">
                      {/* Grille */}
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <g key={i}>
                          <line 
                            x1="80" 
                            y1={40 + i * 50} 
                            x2="720" 
                            y2={40 + i * 50} 
                            stroke="#e2e8f0" 
                            strokeWidth="1" 
                            strokeDasharray="4,4"
                          />
                          <text 
                            x="70" 
                            y={45 + i * 50} 
                            fill="#64748b" 
                            fontSize="12" 
                            fontWeight="700" 
                            textAnchor="end"
                          >
                            {(5-i) * 200}k
                          </text>
                        </g>
                      ))}

                      {/* Barres CA */}
                      {monthlyResults.map((m, i) => {
                        const x = 120 + (i * 100);
                        const maxVal = 1100000;
                        const barHeight = (m.ca / maxVal) * 250;
                        const y = 290 - barHeight;
                        return (
                          <g key={`ca-${i}`}>
                            <rect
                              x={x - 35}
                              y={y}
                              width="35"
                              height={barHeight}
                              fill="url(#caGradient)"
                              opacity="0.8"
                              rx="4"
                            >
                              <animate attributeName="opacity" from="0" to="0.8" begin={`${i * 0.1}s`} dur="0.6s" fill="freeze" />
                              <animateTransform
                                attributeName="transform"
                                type="scale"
                                values="1 0; 1 1"
                                begin={`${i * 0.1}s`}
                                dur="0.6s"
                                fill="freeze"
                              />
                            </rect>
                            <text 
                              x={x - 17.5} 
                              y={y - 8} 
                              fill="#3b82f6" 
                              fontSize="10" 
                              fontWeight="900" 
                              textAnchor="middle"
                              opacity="0"
                            >
                              {(m.ca / 1000).toFixed(0)}k
                              <animate attributeName="opacity" from="0" to="1" begin={`${i * 0.1 + 0.5}s`} dur="0.3s" fill="freeze" />
                            </text>
                          </g>
                        );
                      })}

                      {/* Barres Charges */}
                      {monthlyResults.map((m, i) => {
                        const x = 120 + (i * 100);
                        const maxVal = 1100000;
                        const barHeight = (m.charges / maxVal) * 250;
                        const y = 290 - barHeight;
                        return (
                          <g key={`charges-${i}`}>
                            <rect
                              x={x}
                              y={y}
                              width="35"
                              height={barHeight}
                              fill="url(#chargesGradient)"
                              opacity="0.8"
                              rx="4"
                            >
                              <animate attributeName="opacity" from="0" to="0.8" begin={`${i * 0.1 + 0.3}s`} dur="0.6s" fill="freeze" />
                              <animateTransform
                                attributeName="transform"
                                type="scale"
                                values="1 0; 1 1"
                                begin={`${i * 0.1 + 0.3}s`}
                                dur="0.6s"
                                fill="freeze"
                              />
                            </rect>
                            <text 
                              x={x + 17.5} 
                              y={y - 8} 
                              fill="#ef4444" 
                              fontSize="10" 
                              fontWeight="900" 
                              textAnchor="middle"
                              opacity="0"
                            >
                              {(m.charges / 1000).toFixed(0)}k
                              <animate attributeName="opacity" from="0" to="1" begin={`${i * 0.1 + 0.8}s`} dur="0.3s" fill="freeze" />
                            </text>
                          </g>
                        );
                      })}

                      {/* Labels */}
                      {monthlyResults.map((m, i) => (
                        <text 
                          key={i} 
                          x={120 + (i * 100)} 
                          y="310" 
                          fill="#334155" 
                          fontSize="14" 
                          fontWeight="800" 
                          textAnchor="middle"
                        >
                          {m.month}
                        </text>
                      ))}

                      {/* Légende */}
                      <g>
                        <rect x="80" y="20" width="15" height="15" fill="url(#caGradient)" rx="2" />
                        <text x="100" y="32" fill="#334155" fontSize="12" fontWeight="700">CA</text>
                        <rect x="150" y="20" width="15" height="15" fill="url(#chargesGradient)" rx="2" />
                        <text x="170" y="32" fill="#334155" fontSize="12" fontWeight="700">Charges</text>
                      </g>

                      <defs>
                        <linearGradient id="caGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#2563eb" />
                        </linearGradient>
                        <linearGradient id="chargesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                      </defs>
                    </svg>
                    </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t-2 border-slate-200">
                    <div className="text-center p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                      <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Total CA</div>
                      <div className="text-2xl font-black text-blue-900">
                        {monthlyResults.reduce((sum, m) => sum + m.ca, 0).toLocaleString()} DA
                      </div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-xl border-2 border-red-200">
                      <div className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2">Total Charges</div>
                      <div className="text-2xl font-black text-red-900">
                        {monthlyResults.reduce((sum, m) => sum + m.charges, 0).toLocaleString()} DA
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comparaison Marge brute vs nette */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg mr-3 shadow-md">
                    <ChartBarIcon className="h-6 w-6 text-white" />
                  </div>
                  Marge Brute vs Marge Nette
                </h3>

                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border-2 border-emerald-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-900 text-lg">Marge Brute</h4>
                        <div className="p-2 bg-emerald-500 rounded-lg">
                          <ChartBarIcon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="space-y-4">
                    <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-slate-700 font-semibold">CA - Coût d'achat</span>
                            <span className="font-black text-slate-900 text-lg">{(accountingData.margeBrute / 1000).toFixed(0)}k DA</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-10 shadow-inner border border-slate-300">
                            <div 
                              className="h-10 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1500 flex items-center justify-end pr-4 shadow-lg"
                              style={{ width: `${(accountingData.margeBrute / accountingData.chiffreAffaires) * 100}%` }}
                            >
                              <span className="text-sm font-black text-white">
                                {((accountingData.margeBrute / accountingData.chiffreAffaires) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-600 mt-2">
                            Sur un CA de {(accountingData.chiffreAffaires / 1000).toFixed(0)}k DA
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-slate-300">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-900 text-lg">Marge Nette</h4>
                        <div className="p-2 bg-slate-600 rounded-lg">
                          <CurrencyDollarIcon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <div className="space-y-4">
                    <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-slate-700 font-semibold">Après charges</span>
                            <span className="font-black text-slate-900 text-lg">{(accountingData.resultatNet / 1000).toFixed(0)}k DA</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-10 shadow-inner border border-slate-300">
                            <div 
                              className="h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full transition-all duration-1500 flex items-center justify-end pr-4 shadow-lg"
                              style={{ width: `${accountingData.tauxRentabiliteNette}%` }}
                            >
                              <span className="text-sm font-black text-white">
                                {accountingData.tauxRentabiliteNette}%
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-600 mt-2">
                            Après déduction de {(accountingData.chargesExploitation / 1000).toFixed(0)}k DA de charges
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t-2 border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border-2 border-emerald-200">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-emerald-500 rounded-lg flex-shrink-0">
                        <SparklesIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-emerald-900 mb-1">Analyse IA:</div>
                        <div className="text-sm text-emerald-800 leading-relaxed">
                          "Votre marge brute est stable à {((accountingData.margeBrute / accountingData.chiffreAffaires) * 100).toFixed(1)}%, mais la marge nette est à {accountingData.tauxRentabiliteNette}% après charges. 
                          L'écart de {((accountingData.margeBrute / accountingData.chiffreAffaires) * 100 - accountingData.tauxRentabiliteNette).toFixed(1)}% 
                          indique un potentiel d'optimisation des charges opérationnelles."
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Jauge de santé financière - Améliorée */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg mr-3 shadow-md">
                    <SparklesIcon className="h-6 w-6 text-white" />
                  </div>
                  Indice de Santé Financière (IA)
                </h3>

                <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-center mb-8">
                    <div className="relative w-96 h-96">
                      <svg className="w-full h-full transform -rotate-90">
                        {/* Fond du cercle avec ombre */}
                        <defs>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                          <linearGradient id="healthGradientImproved" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="50%" stopColor="#059669" />
                            <stop offset="100%" stopColor="#047857" />
                          </linearGradient>
                        </defs>
                        
                        {/* Fond du cercle */}
                        <circle 
                          cx="192" 
                          cy="192" 
                          r="160" 
                          fill="none" 
                          stroke="#e2e8f0" 
                          strokeWidth="30"
                        />
                        
                        {/* Progression animée avec ombre */}
                        <circle
                          cx="192"
                          cy="192"
                          r="160"
                          fill="none"
                          stroke="url(#healthGradientImproved)"
                          strokeWidth="30"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 160}`}
                          strokeDashoffset={`${2 * Math.PI * 160 * (1 - accountingData.indicePerformance / 100)}`}
                          filter="url(#glow)"
                          opacity="0"
                        >
                          <animate attributeName="opacity" from="0" to="1" begin="0.5s" dur="1s" fill="freeze" />
                          <animate
                            attributeName="stroke-dashoffset"
                            from={`${2 * Math.PI * 160}`}
                            to={`${2 * Math.PI * 160 * (1 - accountingData.indicePerformance / 100)}`}
                            begin="0.5s"
                            dur="2s"
                            fill="freeze"
                          />
                        </circle>

                        {/* Marqueurs de progression */}
                        {[0, 25, 50, 75, 100].map((value, i) => {
                          const angle = (value / 100) * 360 - 90;
                          const radian = (angle * Math.PI) / 180;
                          const x = 192 + 160 * Math.cos(radian);
                          const y = 192 + 160 * Math.sin(radian);
                          return (
                            <g key={i}>
                              <line
                                x1={192 + 150 * Math.cos(radian)}
                                y1={192 + 150 * Math.sin(radian)}
                                x2={192 + 160 * Math.cos(radian)}
                                y2={192 + 160 * Math.sin(radian)}
                                stroke="#cbd5e1"
                                strokeWidth="2"
                              />
                              <text
                                x={192 + 135 * Math.cos(radian)}
                                y={192 + 135 * Math.sin(radian)}
                                fill="#64748b"
                                fontSize="11"
                                fontWeight="700"
                                textAnchor="middle"
                                dominantBaseline="middle"
                              >
                                {value}
                              </text>
                            </g>
                          );
                        })}
                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-800 mb-2">
                          {accountingData.indicePerformance}
                        </div>
                        <div className="text-xl text-slate-600 font-bold">/ 100</div>
                        <div className={`text-sm font-bold mt-3 px-4 py-1 rounded-full ${
                          accountingData.indicePerformance >= 85 ? 'bg-emerald-100 text-emerald-700' :
                          accountingData.indicePerformance >= 70 ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {accountingData.indicePerformance >= 85 ? 'Excellente santé' :
                           accountingData.indicePerformance >= 70 ? 'Bonne santé' :
                           'Santé à améliorer'}
                        </div>
                      </div>
            </div>
          </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[
                      { critere: 'Rentabilité', score: 92, icon: ChartBarIcon, color: 'emerald' },
                      { critere: 'Liquidité', score: 88, icon: BanknotesIcon, color: 'blue' },
                      { critere: 'Solvabilité', score: 85, icon: ScaleIcon, color: 'purple' },
                      { critere: 'Croissance', score: 90, icon: ArrowTrendingUpIcon, color: 'amber' },
                      { critere: 'Efficience', score: 80, icon: CheckCircleIcon, color: 'cyan' }
                    ].map((crit, index) => {
                      const CritIcon = crit.icon;
                      const colorClasses = {
                        emerald: {
                          bg: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700',
                          icon: 'text-emerald-600',
                          bar: 'bg-emerald-500'
                        },
                        blue: {
                          bg: 'from-blue-50 to-blue-100 border-blue-200 text-blue-700',
                          icon: 'text-blue-600',
                          bar: 'bg-blue-500'
                        },
                        purple: {
                          bg: 'from-purple-50 to-purple-100 border-purple-200 text-purple-700',
                          icon: 'text-purple-600',
                          bar: 'bg-purple-500'
                        },
                        amber: {
                          bg: 'from-amber-50 to-amber-100 border-amber-200 text-amber-700',
                          icon: 'text-amber-600',
                          bar: 'bg-amber-500'
                        },
                        cyan: {
                          bg: 'from-cyan-50 to-cyan-100 border-cyan-200 text-cyan-700',
                          icon: 'text-cyan-600',
                          bar: 'bg-cyan-500'
                        }
                      };
                      const colors = colorClasses[crit.color as keyof typeof colorClasses];
                      return (
                        <div key={index} className={`bg-gradient-to-br ${colors.bg} rounded-xl p-4 text-center border-2 shadow-sm hover:shadow-md transition-all`}>
                          <div className="p-2 bg-white/50 rounded-lg mb-3 inline-flex">
                            <CritIcon className={`h-6 w-6 ${colors.icon}`} />
                          </div>
                          <div className="text-xs font-bold uppercase tracking-wide mb-2">{crit.critere}</div>
                          <div className="text-3xl font-black mb-1">{crit.score}</div>
                          <div className="w-full bg-white/50 rounded-full h-2 mt-2">
                            <div 
                              className={`${colors.bar} h-2 rounded-full transition-all duration-1000`}
                              style={{ width: `${crit.score}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Ratios de Rentabilité Détaillés */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600" />
                  📊 Ratios de Rentabilité Détaillés
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: 'ROE (Return on Equity)',
                      value: ((accountingData.resultatNet / 1850000) * 100).toFixed(1),
                      benchmark: 15.0,
                      description: 'Rentabilité des capitaux propres',
                      icon: CurrencyDollarIcon,
                      color: 'emerald'
                    },
                    {
                      label: 'ROA (Return on Assets)',
                      value: ((accountingData.resultatNet / 4200000) * 100).toFixed(1),
                      benchmark: 8.0,
                      description: 'Rentabilité de l\'actif total',
                      icon: BanknotesIcon,
                      color: 'blue'
                    },
                    {
                      label: 'Marge Opérationnelle',
                      value: ((accountingData.resultatExploitation / accountingData.chiffreAffaires) * 100).toFixed(1),
                      benchmark: 12.0,
                      description: 'Résultat d\'exploitation / CA',
                      icon: ChartBarIcon,
                      color: 'purple'
                    },
                    {
                      label: 'ROI (Return on Investment)',
                      value: ((accountingData.resultatNet / 2500000) * 100).toFixed(1),
                      benchmark: 10.0,
                      description: 'Rentabilité des investissements',
                      icon: ArrowTrendingUpIcon,
                      color: 'amber'
                    }
                  ].map((ratio, index) => {
                    const RatioIcon = ratio.icon;
                    const isGood = parseFloat(ratio.value) >= ratio.benchmark;
                    const colorClasses = {
                      emerald: 'text-emerald-600',
                      blue: 'text-blue-600',
                      purple: 'text-purple-600',
                      amber: 'text-amber-600'
                    };
                    return (
                      <div key={index} className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <RatioIcon className={`h-6 w-6 ${colorClasses[ratio.color as keyof typeof colorClasses]}`} />
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            isGood ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {isGood ? '✓' : '⚠'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mb-1">{ratio.label}</h4>
                        <div className="text-3xl font-black text-slate-900 mb-2">{ratio.value}%</div>
                        <div className="text-xs text-slate-600 mb-3">{ratio.description}</div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">Benchmark secteur:</span>
                            <span className="font-semibold text-slate-700">{ratio.benchmark}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-1000 ${
                                isGood ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min((parseFloat(ratio.value) / ratio.benchmark) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Seuil de Rentabilité (Point Mort) */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <CalculatorIcon className="h-5 w-5 mr-2 text-slate-600" />
                  🎯 Seuil de Rentabilité (Point Mort)
                </h3>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                      <div className="text-xs font-semibold text-emerald-700 mb-2">Seuil de Rentabilité</div>
                      <div className="text-2xl font-black text-emerald-900">
                        {(accountingData.seuilRentabilite / 1000).toFixed(0)}k DA
                      </div>
                      <div className="text-xs text-emerald-600 mt-1">CA minimum requis</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-xs font-semibold text-blue-700 mb-2">CA Actuel</div>
                      <div className="text-2xl font-black text-blue-900">
                        {(accountingData.chiffreAffaires / 1000).toFixed(0)}k DA
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {((accountingData.chiffreAffaires / accountingData.seuilRentabilite) * 100).toFixed(0)}% du seuil
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <div className="text-xs font-semibold text-purple-700 mb-2">Marge de Sécurité</div>
                      <div className="text-2xl font-black text-purple-900">
                        {(((accountingData.chiffreAffaires - accountingData.seuilRentabilite) / accountingData.chiffreAffaires) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-purple-600 mt-1">Zone de profitabilité</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Charges fixes:</span>
                        <span className="font-bold text-slate-900">
                          {((accountingData.chargesExploitation * 0.4) / 1000).toFixed(0)}k DA
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Taux de marge sur coût variable:</span>
                        <span className="font-bold text-slate-900">
                          {((accountingData.margeBrute / accountingData.chiffreAffaires) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-300">
                        <div className="text-xs text-slate-600">
                          <strong>Formule:</strong> Seuil = Charges fixes / (1 - Coûts variables / CA)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rentabilité par Produit/Service */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ChartPieIcon className="h-5 w-5 mr-2 text-slate-600" />
                  📦 Analyse de Rentabilité par Produit/Service
                </h3>

                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold uppercase">Produit/Service</th>
                          <th className="px-6 py-4 text-right text-xs font-bold uppercase">CA (DA)</th>
                          <th className="px-6 py-4 text-right text-xs font-bold uppercase">Coûts (DA)</th>
                          <th className="px-6 py-4 text-right text-xs font-bold uppercase">Marge (DA)</th>
                          <th className="px-6 py-4 text-right text-xs font-bold uppercase">Marge %</th>
                          <th className="px-6 py-4 text-center text-xs font-bold uppercase">Performance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {[
                          { produit: 'Produit A', ca: 2200000, couts: 1200000, marge: 1000000, margePct: 45.5 },
                          { produit: 'Produit B', ca: 1800000, couts: 1080000, marge: 720000, margePct: 40.0 },
                          { produit: 'Service C', ca: 1200000, couts: 600000, marge: 600000, margePct: 50.0 },
                          { produit: 'Produit D', ca: 520000, couts: 300000, marge: 220000, margePct: 42.3 }
                        ].map((item, index) => {
                          const performance = item.margePct >= 45 ? 'excellent' : item.margePct >= 40 ? 'bon' : 'moyen';
                          return (
                            <tr key={index} className="hover:bg-slate-50 transition-colors">
                              <td className="px-6 py-4 font-bold text-slate-900">{item.produit}</td>
                              <td className="px-6 py-4 text-right font-semibold text-slate-900">
                                {item.ca.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-right text-slate-600">
                                {item.couts.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                {item.marge.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                  performance === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                                  performance === 'bon' ? 'bg-blue-100 text-blue-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {item.margePct.toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {performance === 'excellent' && <CheckCircleIcon className="h-5 w-5 text-emerald-600 mx-auto" />}
                                {performance === 'bon' && <ChartBarIcon className="h-5 w-5 text-blue-600 mx-auto" />}
                                {performance === 'moyen' && <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mx-auto" />}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Recommandations d'Amélioration */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-6 border-2 border-amber-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2 text-amber-600" />
                  💡 Recommandations d'Amélioration de la Rentabilité
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      titre: 'Optimiser les coûts variables',
                      description: 'Réduire les coûts d\'achat de 5% pourrait améliorer la marge brute de 2.2%',
                      impact: 'Impact: +125k DA/an',
                      priorite: 'haute',
                      icon: ArrowTrendingDownIcon
                    },
                    {
                      titre: 'Augmenter le prix des produits à faible marge',
                      description: 'Produit D: augmenter le prix de 8% pour atteindre 45% de marge',
                      impact: 'Impact: +42k DA/an',
                      priorite: 'moyenne',
                      icon: ArrowTrendingUpIcon
                    },
                    {
                      titre: 'Réduire les charges fixes',
                      description: 'Négocier les contrats de services pour économiser 3% sur les charges',
                      impact: 'Impact: +59k DA/an',
                      priorite: 'haute',
                      icon: CalculatorIcon
                    },
                    {
                      titre: 'Développer les produits à forte marge',
                      description: 'Augmenter les ventes de Service C (+15%) pour maximiser la rentabilité',
                      impact: 'Impact: +90k DA/an',
                      priorite: 'moyenne',
                      icon: ChartBarIcon
                    }
                  ].map((reco, index) => {
                    const RecoIcon = reco.icon;
                    return (
                      <div key={index} className="bg-white rounded-lg p-5 border border-amber-200 shadow-sm">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <RecoIcon className={`h-5 w-5 ${
                              reco.priorite === 'haute' ? 'text-red-600' : 'text-amber-600'
                            }`} />
                            <h4 className="font-bold text-slate-900">{reco.titre}</h4>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            reco.priorite === 'haute' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {reco.priorite === 'haute' ? 'Haute' : 'Moyenne'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{reco.description}</p>
                        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                          <p className="text-sm font-semibold text-emerald-700">{reco.impact}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* VUE 3: ANALYSE COMPARATIVE */}
          {selectedView === 'analyse-comparative' && (
            <>
              {/* Tableau comparatif N vs N-1 */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600" />
                  📅 Comparatif Année N vs N-1
                </h3>

                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-700 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase">Indicateur</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase">Année N</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase">Année N-1</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase">Évolution</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase">Tendance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {comparativeData.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{item.indicator}</td>
                          <td className="px-6 py-4 text-right font-black text-slate-900">
                            {item.n.toLocaleString()} DA
                          </td>
                          <td className="px-6 py-4 text-right font-medium text-slate-600">
                            {item.n1.toLocaleString()} DA
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                              item.evolution > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {item.evolution > 0 ? '+' : ''}{item.evolution.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {item.evolution > 0 ? (
                              <ArrowTrendingUpIcon className="h-6 w-6 text-emerald-600 inline" />
                            ) : (
                              <ArrowTrendingDownIcon className="h-6 w-6 text-red-600 inline" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
            </div>
          </div>

              {/* Graphique comparatif */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600" />
                  📊 Évolution des Indicateurs Clés
                </h3>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="space-y-6">
                    {comparativeData.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{item.indicator}</span>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.evolution > 0 ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                            'bg-red-100 text-red-700 border border-red-300'
                          }`}>
                            {item.evolution > 0 ? '+' : ''}{item.evolution.toFixed(1)}%
            </div>
          </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-600">Année N</span>
                              <span className="font-bold text-slate-900">{(item.n / 1000).toFixed(0)}k</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-4">
                              <div 
                                className="h-4 bg-gradient-to-r from-slate-700 to-slate-900 rounded-full transition-all duration-1000"
                                style={{ width: '100%' }}
                              ></div>
            </div>
          </div>

                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-600">Année N-1</span>
                              <span className="font-bold text-slate-900">{(item.n1 / 1000).toFixed(0)}k</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-4">
                              <div 
                                className="h-4 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full transition-all duration-1000"
                                style={{ width: `${(item.n1 / item.n) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
            </div>
          </div>
              </div>

              {/* Graphique comparatif en courbes */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600" />
                  📈 CA Mensuel - Année N vs N-1
                </h3>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="flex items-center justify-center space-x-6 mb-6">
                    <div className="flex items-center">
                      <div className="w-8 h-1.5 bg-slate-900 rounded mr-2"></div>
                      <span className="text-sm font-semibold text-slate-900">Année N (2024)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-1.5 bg-slate-400 rounded mr-2"></div>
                      <span className="text-sm font-semibold text-slate-900">Année N-1 (2023)</span>
                    </div>
                  </div>

                  <div className="relative h-96 bg-slate-50 rounded-lg p-8">
                    <svg className="w-full h-full" viewBox="0 0 700 350" preserveAspectRatio="xMidYMid meet">
                      {/* Grille */}
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <g key={i}>
                          <line x1="60" y1={30 + i * 50} x2="660" y2={30 + i * 50} stroke="#e2e8f0" strokeWidth="1.5" />
                          <text x="45" y={35 + i * 50} fill="#64748b" fontSize="13" fontWeight="700" textAnchor="end">
                            {(5-i) * 220}k
                          </text>
                        </g>
                      ))}

                      {/* Zone remplie Année N */}
                      <path
                        d={(() => {
                          const maxVal = 1100000;
                          let path = 'M 60 280 ';
                          monthlyResults.forEach((m, i) => {
                            const x = 60 + (i * 120);
                            const y = 280 - ((m.ca / maxVal) * 250);
                            path += `L ${x} ${y} `;
                          });
                          path += 'L 660 280 Z';
                          return path;
                        })()}
                        fill="url(#compareGradient)"
                        opacity="0.15"
                      />

                      {/* Courbe Année N */}
                      <path
                        d={(() => {
                          const maxVal = 1100000;
                          return monthlyResults.map((m, i) => {
                            const x = 60 + (i * 120);
                            const y = 280 - ((m.ca / maxVal) * 250);
                            return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                          }).join(' ');
                        })()}
                        fill="none"
                        stroke="#0f172a"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="2000"
                        strokeDashoffset="2000"
                        className="drop-shadow-lg"
                      >
                        <animate attributeName="stroke-dashoffset" from="2000" to="0" dur="2s" fill="freeze" />
                      </path>

                      {/* Courbe Année N-1 */}
                      <path
                        d={(() => {
                          const maxVal = 1100000;
                          return monthlyResults.map((m, i) => {
                            const x = 60 + (i * 120);
                            const caN1 = m.ca * 0.92; // -8% en moyenne
                            const y = 280 - ((caN1 / maxVal) * 250);
                            return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                          }).join(' ');
                        })()}
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="2000"
                        strokeDashoffset="2000"
                      >
                        <animate attributeName="stroke-dashoffset" from="2000" to="0" begin="0.5s" dur="1.5s" fill="freeze" />
                      </path>

                      {/* Points Année N */}
                      {monthlyResults.map((m, i) => {
                        const x = 60 + (i * 120);
                        const maxVal = 1100000;
                        const y = 280 - ((m.ca / maxVal) * 250);
                        return (
                          <g key={`n-${i}`}>
                            <circle cx={x} cy={y} r="10" fill="#0f172a" opacity="0">
                              <animate attributeName="opacity" from="0" to="1" begin={`${2 + i * 0.15}s`} dur="0.3s" fill="freeze" />
                            </circle>
                            <circle cx={x} cy={y} r="5" fill="#ffffff" opacity="0">
                              <animate attributeName="opacity" from="0" to="1" begin={`${2 + i * 0.15}s`} dur="0.3s" fill="freeze" />
                            </circle>
                            <text x={x} y={y - 18} fill="#0f172a" fontSize="12" fontWeight="900" textAnchor="middle" opacity="0">
                              {(m.ca / 1000).toFixed(0)}k
                              <animate attributeName="opacity" from="0" to="1" begin={`${2 + i * 0.15 + 0.2}s`} dur="0.3s" fill="freeze" />
                            </text>
                          </g>
                        );
                      })}

                      {/* Points Année N-1 */}
                      {monthlyResults.map((m, i) => {
                        const x = 60 + (i * 120);
                        const maxVal = 1100000;
                        const caN1 = m.ca * 0.92;
                        const y = 280 - ((caN1 / maxVal) * 250);
                        return (
                          <circle key={`n1-${i}`} cx={x} cy={y} r="6" fill="#94a3b8" opacity="0">
                            <animate attributeName="opacity" from="0" to="1" begin={`${2.5 + i * 0.15}s`} dur="0.3s" fill="freeze" />
                          </circle>
                        );
                      })}

                      {/* Labels */}
                      {monthlyResults.map((m, i) => (
                        <text key={i} x={60 + (i * 120)} y="310" fill="#334155" fontSize="14" fontWeight="800" textAnchor="middle">
                          {m.month}
                        </text>
                      ))}

                      <defs>
                        <linearGradient id="compareGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t-2 border-slate-200">
                    <div className="text-center p-4 bg-slate-100 rounded-lg border border-slate-300">
                      <div className="text-xs font-semibold text-slate-600 mb-2">CA Total Année N</div>
                      <div className="text-2xl font-bold text-slate-900">
                        {monthlyResults.reduce((sum, m) => sum + m.ca, 0).toLocaleString()} DA
                      </div>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="text-xs font-semibold text-emerald-600 mb-2">Croissance vs N-1</div>
                      <div className="text-2xl font-bold text-emerald-700">
                        +8.3%
                      </div>
                    </div>
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

export default ComptabiliteResultats;


