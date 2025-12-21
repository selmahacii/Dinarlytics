/* eslint-disable react/no-inline-styles */
import React, { useState } from 'react';
import {
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CubeIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  BeakerIcon,
  FunnelIcon,
  ChartBarSquareIcon,
  UserCircleIcon,
  BellIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';
import InsightsSummary from '../../components/AI/InsightsSummary';
import AnalysisRunReport from '../../components/AI/AnalysisRunReport';
import InsightsPanel from '../../components/AI/InsightsPanel';

const AnalysesLIA: React.FC = () => {
  const { user, companyData } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('mois');
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isRunOpen, setIsRunOpen] = useState(false);

  // ========================================
  // INTERFACE EURL MICRO-ENTREPRISE  
  // ========================================
  if (user && user.segment === 'micro' && user.companyType === 'eurl' && companyData) {
    const caActuel = companyData.revenueMonth;
    const previsionM1 = Math.round(caActuel * 1.08);
    const previsionM2 = Math.round(caActuel * 1.15);
    const previsionM3 = Math.round(caActuel * 1.22);

    const tresorerieActuelle = companyData.cashBalance;
    const previsionTresoM1 = Math.round(tresorerieActuelle * 1.05);
    const previsionTresoM2 = Math.round(tresorerieActuelle * 1.12);
    const previsionTresoM3 = Math.round(tresorerieActuelle * 1.18);

    // Recommandations
    const margeActuelle = (companyData as any)?.profitMargin ?? 0;
    const recommandations = [
      { titre: 'Optimiser les stocks', detail: 'Rotation faible sur 2 articles - Envisager promotion', couleur: 'amber', icon: CubeIcon },
      { titre: 'Réduire les charges fixes', detail: 'Loyer représente 28% du CA - Objectif: <25%', couleur: 'red', icon: ExclamationTriangleIcon },
      { titre: 'Augmenter la marge', detail: `Marge actuelle ${margeActuelle}% - Potentiel: +5%`, couleur: 'emerald', icon: ArrowTrendingUpIcon }
    ];

    return (
      <div className="space-y-6 max-w-7xl mx-auto p-6">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white p-8 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <LightBulbIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Intelligence Décisionnelle LIA</h1>
                <p className="text-slate-300 text-lg mt-1">Prévisions et recommandations financières</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAIChatOpen(true)}
                className="px-4 py-2 rounded-lg bg-slate-200/20 hover:bg-slate-200/30 text-white border border-white/20 transition-colors"
                aria-label="Ouvrir l'assistant IA"
                title="Ouvrir l'assistant IA"
              >
                Assistant IA
              </button>
              <button
                onClick={() => setIsInsightsOpen(true)}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white shadow"
                aria-label="Ouvrir les Insights IA"
                title="Ouvrir les Insights IA"
              >
                Insights IA
              </button>
              <button
                onClick={() => setIsRunOpen(true)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
                aria-label="Ouvrir le rapport d'exécution IA"
                title="Rapport d'exécution IA"
              >
                Rapport IA
              </button>
            </div>
          </div>
        </div>

        {/* Aperçu rapide des Insights IA */}
        <InsightsSummary onOpenInsights={() => setIsInsightsOpen(true)} />

        {/* Boutons IA complémentaires */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRunOpen(true)}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900 border border-slate-700"
            aria-label="Ouvrir le rapport d'exécution IA"
            title="Rapport d'exécution IA"
          >
            Rapport IA
          </button>
        </div>

        {/* Prévisions CA (3 mois) */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mr-3">
              <ChartBarIcon className="h-5 w-5 text-white" />
            </div>
            Prévisions Chiffre d'Affaires (3 mois)
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { mois: 'Actuel', ca: caActuel, couleur: 'from-slate-600 to-slate-800' },
              { mois: 'M+1', ca: previsionM1, couleur: 'from-emerald-500 to-teal-500' },
              { mois: 'M+2', ca: previsionM2, couleur: 'from-blue-500 to-indigo-500' },
              { mois: 'M+3', ca: previsionM3, couleur: 'from-purple-500 to-pink-500' }
            ].map((data, idx) => (
              <div key={idx} className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl border-2 border-slate-200">
                <p className="text-xs font-bold text-slate-600 uppercase mb-2">{data.mois}</p>
                <p className="text-2xl font-extrabold text-slate-900">{AdaptiveDataGenerator.formatCurrency(data.ca)}</p>
                {idx > 0 && <p className="text-xs text-emerald-600 font-bold mt-1">+{Math.round((data.ca - caActuel) / caActuel * 100)}%</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Prévisions Trésorerie (3 mois) */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg mr-3">
              <BanknotesIcon className="h-5 w-5 text-white" />
            </div>
            Prévisions Trésorerie (3 mois)
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {[
              { mois: 'Actuel', solde: tresorerieActuelle },
              { mois: 'M+1', solde: previsionTresoM1 },
              { mois: 'M+2', solde: previsionTresoM2 },
              { mois: 'M+3', solde: previsionTresoM3 }
            ].map((data, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border-2 border-blue-200">
                <p className="text-xs font-bold text-blue-700 uppercase mb-2">{data.mois}</p>
                <p className="text-xl font-extrabold text-blue-600">{AdaptiveDataGenerator.formatCurrency(data.solde)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommandations Automatiques */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-300 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg mr-3">
              <LightBulbIcon className="h-5 w-5 text-white" />
            </div>
            Recommandations LIA
          </h2>
          <div className="space-y-3">
            {recommandations.map((reco, idx) => {
              const Icon = reco.icon;
              const couleurClasses = {
                amber: { bg: 'bg-amber-50', border: 'border-amber-300', gradient: 'from-amber-500 to-orange-500', text: 'text-amber-700' },
                red: { bg: 'bg-red-50', border: 'border-red-300', gradient: 'from-red-500 to-pink-500', text: 'text-red-700' },
                emerald: { bg: 'bg-emerald-50', border: 'border-emerald-300', gradient: 'from-emerald-500 to-teal-500', text: 'text-emerald-700' }
              };
              const couleur = couleurClasses[reco.couleur as keyof typeof couleurClasses];

              return (
                <div key={idx} className={`${couleur.bg} p-4 rounded-xl border-2 ${couleur.border} hover:shadow-xl transition-all duration-300`}>
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 bg-gradient-to-br ${couleur.gradient} rounded-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className={`font-bold ${couleur.text}`}>{reco.titre}</p>
                      <p className="text-sm text-slate-600 mt-1">{reco.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scénarios Interactifs */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mr-3">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            Scénarios Interactifs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-xl border-2 border-emerald-200 hover:shadow-xl transition-all duration-300">
              <p className="font-bold text-emerald-700 mb-2">📈 Et si +10% de ventes ?</p>
              <p className="text-2xl font-extrabold text-emerald-600">+{AdaptiveDataGenerator.formatCurrency(Math.round(caActuel * 0.10))}</p>
              <p className="text-xs text-slate-600 mt-1">Résultat net supplémentaire estimé</p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-5 rounded-xl border-2 border-red-200 hover:shadow-xl transition-all duration-300">
              <p className="font-bold text-red-700 mb-2">📉 Et si +5% coûts achats ?</p>
              <p className="text-2xl font-extrabold text-red-600">-{AdaptiveDataGenerator.formatCurrency(Math.round(caActuel * 0.45 * 0.05))}</p>
              <p className="text-xs text-slate-600 mt-1">Impact négatif sur le résultat</p>
            </div>
          </div>
        </div>

  {/* Modales IA */}
  <InsightsPanel isOpen={isInsightsOpen} onClose={() => setIsInsightsOpen(false)} />
  {/* <StaticAIChat isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} /> */}
  <AnalysisRunReport isOpen={isRunOpen} onClose={() => setIsRunOpen(false)} />
      </div>
    );
  }

  // ========================================
  // INTERFACE STANDARD (autres entreprises)
  // ========================================

  // Helpers calculs IA à partir des données réelles de contexte (companyData)
  const cd = companyData;
  const businessDays = 22; // approximation jours ouvrés/mois
  const caMonth = cd?.revenueMonth ?? 4_850_000;
  const growthPct = cd?.revenueGrowth ?? 8; // %
  const grossMarginPct = cd?.profitMargin ?? 24.2; // %
  const achatsMonth = Math.max(0, Math.round(caMonth * (1 - grossMarginPct / 100))); // COGS approx.
  const encInMonth = Math.round(caMonth * 1.07); // CA + taxes/ajustements
  const encOutMonth = Math.round(achatsMonth * 0.95 + (cd?.accountsPayable ?? 0) / 6); // décaissements approx.
  const articlesSoldMonth = Math.max(200, Math.round((cd?.invoicesCount ?? 800) * 1.5));
  const articlesRemaining = Math.max(0, Math.round((cd?.inventoryItems ?? 3200) - articlesSoldMonth * 0.1));
  const dso = Math.round(((cd?.accountsReceivable ?? caMonth) / Math.max(1, caMonth)) * 30); // jours de CA en créances
  const dpo = Math.round(((cd?.accountsPayable ?? achatsMonth) / Math.max(1, achatsMonth)) * 30); // jours d'achats en dettes
  const quickRatio = ((cd?.cashBalance ?? 0) + (cd?.accountsReceivable ?? 0)) / Math.max(1, (cd?.accountsPayable ?? 1));

  // Résumé intelligent calé sur jour/mois
  const dailySummary = {
    ca: { value: Math.round(caMonth / businessDays), change: growthPct / businessDays, trend: growthPct >= 0 ? 'up' : 'down' },
    achats: { value: Math.round(achatsMonth / businessDays), change: (Math.random() * 2 - 1), trend: achatsMonth >= 0 ? 'up' : 'down' },
    articlesVendus: { sold: Math.round(articlesSoldMonth / businessDays), remaining: articlesRemaining },
    encaissements: { in: Math.round(encInMonth / businessDays), out: Math.round(encOutMonth / businessDays) },
    margeBrute: Math.round(grossMarginPct * 10) / 10,
    igp: { score: Math.max(60, Math.min(95, Math.round(70 + (grossMarginPct - 20) + (growthPct / 2)))), status: 'bon' as const }
  };

  const monthlySummary = {
    ca: { value: caMonth, change: Math.round(growthPct), trend: growthPct >= 0 ? 'up' : 'down' },
    achats: { value: achatsMonth, change: Math.round(Math.random() * 6 - 3), trend: 'up' as const },
    articlesVendus: { sold: articlesSoldMonth, remaining: articlesRemaining },
    encaissements: { in: encInMonth, out: encOutMonth },
    margeBrute: Math.round(grossMarginPct * 10) / 10,
    igp: { score: Math.max(60, Math.min(95, Math.round(75 + (grossMarginPct - 20) + (growthPct / 2)))), status: 'excellent' as const }
  };

  const currentSummary = selectedPeriod === 'jour' ? dailySummary : monthlySummary;

  // Données pour les ratios de performance
  const netMarginApprox = Math.max(3, Math.round((grossMarginPct - 15) * 10) / 10); // approximation conservatrice
  const stockTurn = cd?.stockTurnover ?? 6.2;
  const performanceRatios = [
    { name: 'Rentabilité nette', value: netMarginApprox, target: 10, unit: '%', status: netMarginApprox >= 10 ? 'Bien' : netMarginApprox >= 7 ? 'Alerte' : 'danger', interpretation: 'Bénéfice net estimé par DA vendue' },
    { name: 'Marge brute', value: Math.round(grossMarginPct * 10) / 10, target: 25, unit: '%', status: grossMarginPct >= 25 ? 'Bien' : 'Alerte', interpretation: 'Capacité à générer du profit avant charges' },
    { name: 'Rotation du stock', value: Math.round(stockTurn * 10) / 10, target: 8, unit: 'x', status: stockTurn >= 8 ? 'good' : 'warning', interpretation: 'Rapidité d\'écoulement du stock' },
    { name: 'DSO (jours)', value: dso, target: 30, unit: 'j', status: dso <= 30 ? 'good' : dso <= 45 ? 'warning' : 'danger', interpretation: 'Temps moyen avant paiement client' },
    { name: 'DPO (jours)', value: dpo, target: 30, unit: 'j', status: dpo >= 30 ? 'good' : 'warning', interpretation: 'Temps moyen avant règlement fournisseur' },
    { name: 'Liquidité immédiate', value: Math.round(quickRatio * 100) / 100, target: 1, unit: '', status: quickRatio >= 1 ? 'good' : quickRatio >= 0.8 ? 'Alerte' : 'danger', interpretation: 'Capacité à payer rapidement' },
    { name: 'Croissance CA', value: Math.round(growthPct * 10) / 10, target: 5, unit: '%', status: growthPct >= 5 ? 'excellent' : growthPct >= 0 ? 'Bien' : 'danger', interpretation: 'Dynamique des ventes' }
  ];

  // Données pour les prévisions IA
  const nextMonthCA = Math.round(caMonth * (1 + (growthPct / 100)));
  const cash30 = Math.round((cd?.cashBalance ?? caMonth) * (1 + (growthPct / 200)));
  const riskClientLabel = 'Client prioritaire';
  const predictions = [
    { type: 'CA', period: 'M+1', value: `${nextMonthCA.toLocaleString()} DA`, change: Math.round(growthPct), confidence: 85 },
    { type: 'Trésorerie', period: 'J+30', value: `${cash30 >= 0 ? '+' : ''}${cash30.toLocaleString()} DA`, change: Math.round(growthPct / 2), confidence: 88 },
    { type: 'Stock', period: '10 jours', value: `${Math.max(1, Math.round((cd?.inventoryItems ?? 200) * 0.01))} articles`, change: -15, confidence: 72 },
    { type: 'Risque client', period: riskClientLabel, value: `${Math.max(50, Math.min(90, 60 + (dso - 30)))}% retard`, change: 0, confidence: 80 },
    { type: 'Marge future', period: 'M+1', value: `${(grossMarginPct + 0.3).toFixed(1)}%`, change: 0.3, confidence: 82 }
  ];

  // Recommandations personnalisées
  const recommendations = [
    {
      category: 'Optimisation commerciale',
      icon: ChartBarIcon,
      color: 'blue',
      items: [
        growthPct < 5 ? 'Croissance faible: intensifier les promotions ciblées et optimiser le mix produits.' : 'Croissance saine: maintenir la politique tarifaire et surveiller les ruptures.',
        `Ticket moyen estimé: ${(caMonth / Math.max(1, cd?.invoicesCount ?? 1)).toLocaleString()} DA — envisagez un upsell léger (+5%).`
      ]
    },
    {
      category: 'Amélioration de trésorerie',
      icon: CurrencyDollarIcon,
      color: 'green',
      items: [
        `Écart DSO (${dso}j) vs DPO (${dpo}j) → accélérer les encaissements (objectif DSO ≤ 30j).`,
        `Ratio de liquidité ${quickRatio.toFixed(2)} — sécuriser un coussin de trésorerie (≥ 1.0).`
      ]
    },
    {
      category: 'Gestion des coûts',
      icon: DocumentTextIcon,
      color: 'orange',
      items: [
        grossMarginPct < 22 ? 'Marge brute sous pression — réviser remises et conditions fournisseurs.' : 'Marge brute correcte — poursuivre l’optimisation progressive.',
        'Cibler 2 postes de charges pour -5% sur 3 mois.'
      ]
    },
    {
      category: 'Pilotage du stock',
      icon: CubeIcon,
      color: 'purple',
      items: [
        stockTurn < 8 ? 'Rotation faible — liquider les dormants (remises, bundles).' : 'Rotation correcte — sécuriser l’approvisionnement des top sellers.',
        'Mettre des seuils de réapprovisionnement automatiques.'
      ]
    },
    {
      category: 'Santé financière',
      icon: BanknotesIcon,
      color: 'red',
      items: [
        quickRatio >= 1 ? 'Liquidité confortable — rester vigilant sur les créances.' : 'Liquidité à renforcer — prioriser le recouvrement.',
        `Marge nette estimée ${netMarginApprox}% — objectif 10% à 12 mois.`
      ]
    },
    {
      category: 'Préparation fiscale',
      icon: BuildingOfficeIcon,
      color: 'indigo',
      items: [
        `Prochaine G50: prévoir TVA nette selon ventes/achats du mois.`,
        'Consolider pièces justificatives et lettrages pour la clôture.'
      ]
    }
  ];

  // Score global FinScan
  // Score global (pondérations simples): rentabilité 40%, trésorerie 30%, rotation 20%, discipline 10%
  const scRent = Math.max(0, Math.min(40, Math.round((netMarginApprox / 15) * 40)));
  const scCash = Math.max(0, Math.min(30, Math.round(Math.min(1.5, quickRatio) / 1.5 * 30)));
  const scRot = Math.max(0, Math.min(20, Math.round(Math.min(12, stockTurn) / 12 * 20)));
  const scDisc = Math.max(0, Math.min(10, Math.round(Math.max(0, 40 - Math.abs(dso - 30)) / 40 * 10)));
  const finScanScore = {
    total: scRent + scCash + scRot + scDisc,
    breakdown: {
      rentabilite: scRent,
      tresorerie: scCash,
      rotation: scRot,
      discipline: scDisc
    },
    interpretation: quickRatio < 1 ? 'Renforcez la liquidité et accélérez les encaissements.' : 'Structure saine — continuer l’optimisation des marges.',
    status: (scRent + scCash + scRot + scDisc) >= 80 ? 'bonne' : 'moyenne'
  } as const;

  // Données pour les graphiques de synthèse
  const evolutionData = (() => {
    const months = ['Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct'];
    const base = caMonth * 0.9;
    return months.map((m, i) => ({ month: m, ca: Math.round(base * (1 + (i * (growthPct / 600)))), marge: Math.round((grossMarginPct - 1 + i * 0.3) * 10) / 10 }));
  })();

  const cashFlowProjection = Array.from({ length: 6 }).map((_, i) => ({
    period: `Sem ${i + 1}`,
    actual: i < 2 ? Math.round((encInMonth - encOutMonth) / 6 * (0.9 + i * 0.05)) : null,
    projected: Math.round((encInMonth - encOutMonth) / 6 * (1 + (i * (growthPct / 300))))
  }));

  const costBreakdown = (() => {
    const achats = achatsMonth;
    const fixes = Math.round(caMonth * 0.18);
    const personnel = Math.round(caMonth * 0.14);
    const transport = Math.round(caMonth * 0.07);
    const autres = Math.round(caMonth * 0.10);
    const impots = Math.round(caMonth * 0.06);
    const total = achats + fixes + personnel + transport + autres + impots;
    const pct = (x: number) => Math.round((x / total) * 100);
    return [
      { category: 'Achats fournisseurs', amount: achats, percentage: pct(achats), color: 'bg-slate-600' },
      { category: 'Charges fixes', amount: fixes, percentage: pct(fixes), color: 'bg-slate-500' },
      { category: 'Personnel', amount: personnel, percentage: pct(personnel), color: 'bg-slate-400' },
      { category: 'Transport', amount: transport, percentage: pct(transport), color: 'bg-slate-300' },
      { category: 'Autres charges', amount: autres, percentage: pct(autres), color: 'bg-slate-200' },
      { category: 'Impôts & taxes', amount: impots, percentage: pct(impots), color: 'bg-slate-100' }
    ];
  })();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-slate-700 bg-slate-200';
      case 'good': return 'text-slate-600 bg-slate-100';
      case 'warning': return 'text-slate-600 bg-slate-100';
      case 'danger': return 'text-slate-700 bg-slate-200';
      case 'moyenne': return 'text-slate-600 bg-slate-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getCategoryColor = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-slate-100 text-slate-700';
      case 'green': return 'bg-slate-100 text-slate-700';
      case 'orange': return 'bg-slate-100 text-slate-700';
      case 'purple': return 'bg-slate-100 text-slate-700';
      case 'red': return 'bg-slate-100 text-slate-700';
      case 'indigo': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <SparklesIcon className="h-8 w-8 mr-3 text-slate-600" />
            Analyse
            </h1>
            <p className="text-slate-600 mt-1">"Comprendre, prévoir et recommander"</p>
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
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setIsAIChatOpen(true)}
                className="px-3 py-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                aria-label="Ouvrir l'assistant IA"
              >Assistant IA</button>
              <button
                onClick={() => setIsInsightsOpen(true)}
                className="px-3 py-2 rounded-md bg-slate-600 text-white hover:bg-slate-700"
                aria-label="Ouvrir les Insights IA"
              >Insights IA</button>
              <button
                onClick={() => setIsRunOpen(true)}
                className="px-3 py-2 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                aria-label="Ouvrir le rapport d'exécution IA"
              >Rapport IA</button>
            </div>
          </div>
        </div>
      </div>

      {/* 1️⃣ Résumé intelligent du jour/mois */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          <EyeIcon className="h-5 w-5 mr-2 text-slate-600" />
          Résumé Intelligent {selectedPeriod === 'jour' ? 'du Jour' : 'du Mois'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">💰 Chiffre d'affaires</span>
              <span className={`text-sm font-medium flex items-center ${
                currentSummary.ca.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentSummary.ca.trend === 'up' ? <ArrowTrendingUpIcon className="h-4 w-4 mr-1" /> : <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />}
                {currentSummary.ca.change > 0 ? '+' : ''}{currentSummary.ca.change}%
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {currentSummary.ca.value.toLocaleString()} DA
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600"> Achats</span>
              <span className={`text-sm font-medium flex items-center ${
                currentSummary.achats.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentSummary.achats.trend === 'up' ? <ArrowTrendingUpIcon className="h-4 w-4 mr-1" /> : <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />}
                {currentSummary.achats.change > 0 ? '+' : ''}{currentSummary.achats.change}%
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {currentSummary.achats.value.toLocaleString()} DA
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600 mb-2"> Articles vendus / restants</div>
            <div className="text-2xl font-bold text-slate-900">
              {currentSummary.articlesVendus.sold} / {currentSummary.articlesVendus.remaining}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600 mb-2"> Encaissements / Décaissements</div>
            <div className="text-2xl font-bold text-slate-900">
              +{currentSummary.encaissements.in.toLocaleString()} / -{currentSummary.encaissements.out.toLocaleString()} DA
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600 mb-2"> Marge brute moyenne</div>
            <div className="text-2xl font-bold text-slate-900">
              {currentSummary.margeBrute}%
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="text-sm text-slate-600 mb-2">📊 Indice Global de Performance</div>
            <div className="text-2xl font-bold text-slate-900">
              {currentSummary.igp.score}/100
            </div>
            <div className={`text-sm font-medium ${getStatusColor(currentSummary.igp.status)} px-2 py-1 rounded-full inline-block mt-1`}>
              {currentSummary.igp.status === 'bon' ? 'Bon équilibre' : 'Excellent'}
            </div>
          </div>
        </div>

        {/* Message LIA intelligent */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ChatBubbleLeftRightIcon className="h-5 w-5 text-slate-600 mt-0.5" />
            <div>
              <p className="text-sm text-slate-800">
                <strong>LIA :</strong> Vos ventes ont augmenté de {currentSummary.ca.change}% par rapport au mois dernier, 
                mais votre marge a légèrement baissé (-2%). Pensez à réviser vos prix sur les produits à faible rentabilité.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2️⃣ Analyses de performance */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600" />
          Analyses de Performance (Ratios & Indicateurs clés)
        </h2>
        <div className="text-xs text-slate-500 mb-4">Basé sur vos données du mois en cours (CA, créances, dettes, stock). Hypothèses: 22 jours ouvrés, COGS ≈ 1 - marge brute.</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {performanceRatios.map((ratio, index) => (
            <div key={index} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">{ratio.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ratio.status)}`}>
                  {ratio.status}
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-1">
                {ratio.value}{ratio.unit}
              </div>
              <div className="text-xs text-slate-500 mb-2">
                Objectif: {ratio.target}{ratio.unit}
              </div>
              <div className="text-xs text-slate-600">
                {ratio.interpretation}
              </div>
            </div>
          ))}
        </div>

        {/* Message intelligent sur les ratios */}
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-slate-600 mt-0.5" />
            <div>
              <p className="text-sm text-slate-800">
                <strong>LIA :</strong> Votre ratio de liquidité est passé sous 0.8, ce qui indique un risque de tension de trésorerie. 
                La rotation du stock est faible (60 jours). Essayez d'écouler vos produits dormants.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3️⃣ Prévisions & Tendances IA */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          <LightBulbIcon className="h-5 w-5 mr-2 text-slate-600" />
          Prévisions & Tendances (IA Prédictive)
        </h2>
        <div className="text-xs text-slate-500 mb-4">Méthodologie: projection courte (M+1) sur croissance actuelle {Math.round((companyData?.revenueGrowth ?? 8) * 10) / 10}% et marge {Math.round((companyData?.profitMargin ?? 24.2) * 10) / 10}%. Confiance qualitative.</div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictions.map((prediction, index) => (
            <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">{prediction.type}</span>
                <span className="text-xs text-slate-500">Confiance: {prediction.confidence}%</span>
              </div>
              <div className="text-lg font-bold text-slate-900 mb-1">
                {prediction.value}
              </div>
              <div className="text-sm text-slate-600 mb-1">
                Période: {prediction.period}
              </div>
              <div className={`text-xs font-medium ${
                prediction.change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {prediction.change > 0 ? '+' : ''}{prediction.change}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4️⃣ Recommandations personnalisées */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          <CheckCircleIcon className="h-5 w-5 mr-2 text-slate-600" />
          Recommandations Personnalisées & Conseils Intelligents
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <div key={index} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <IconComponent className="h-5 w-5 mr-2 text-slate-600" />
                  <h3 className="text-sm font-semibold text-slate-900">{category.category}</h3>
                </div>
                <div className="space-y-3">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 rounded-full mt-2 bg-slate-500"></div>
                      <p className="text-sm text-slate-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5️⃣ Score global FinScan */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          <SparklesIcon className="h-5 w-5 mr-2 text-slate-600" />
          Score Global FinScan (Indice d'Intelligence Financière)
        </h2>
        <div className="text-xs text-slate-500 mb-4">Pondérations: Rentabilité 40%, Trésorerie 30%, Rotation 20%, Discipline 10%.</div>
        
        <div className="flex flex-col lg:flex-row items-center justify-between mb-6">
          {/* Jauge circulaire principale */}
          <div className="relative w-48 h-48 mb-6 lg:mb-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Cercle de fond */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8"/>
              {/* Cercle de progression */}
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                stroke="#475569" 
                strokeWidth="8"
                strokeDasharray={`${(finScanScore.total / 100) * 251.2} 251.2`}
                className="transition-all duration-1000 ease-out"
              />
              {/* Texte central */}
              <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold text-slate-900">
                {finScanScore.total}
              </text>
              <text x="50" y="58" textAnchor="middle" dominantBaseline="middle" className="text-sm text-slate-600">
                /100
              </text>
            </svg>
          </div>

          {/* Message d'interprétation */}
          <div className="flex-1 lg:ml-8">
            <div className={`inline-block px-6 py-3 rounded-lg text-base font-medium ${getStatusColor(finScanScore.status)} mb-4`}>
              {finScanScore.interpretation}
            </div>
            <div className="text-sm text-slate-600">
              <p className="mb-2">Votre score global de <strong>{finScanScore.total}/100</strong> indique une performance {finScanScore.status === 'moyenne' ? 'moyenne' : 'bonne'}.</p>
              <p>Continuez à optimiser vos processus pour améliorer votre indice d'intelligence financière.</p>
            </div>
          </div>
        </div>

        {/* Détail des composants avec barres de progression */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-slate-900 mb-4">Détail des Composants</h3>
          
          {/* Rentabilité */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Rentabilité</span>
              <span className="text-sm text-slate-600">{finScanScore.breakdown.rentabilite}/40 (40%)</span>
            </div>
            <div className="w-full">
              <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none" aria-label="Progression rentabilité">
                <rect x="0" y="0" width="100" height="12" fill="#e2e8f0" rx="6" ry="6" />
                <rect x="0" y="0" width={(finScanScore.breakdown.rentabilite / 40) * 100} height="12" fill="#475569" rx="6" ry="6" />
              </svg>
            </div>
          </div>

          {/* Trésorerie */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Trésorerie</span>
              <span className="text-sm text-slate-600">{finScanScore.breakdown.tresorerie}/30 (30%)</span>
            </div>
            <div className="w-full">
              <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none" aria-label="Progression trésorerie">
                <rect x="0" y="0" width="100" height="12" fill="#e2e8f0" rx="6" ry="6" />
                <rect x="0" y="0" width={(finScanScore.breakdown.tresorerie / 30) * 100} height="12" fill="#64748b" rx="6" ry="6" />
              </svg>
            </div>
          </div>

          {/* Rotation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Rotation du Stock</span>
              <span className="text-sm text-slate-600">{finScanScore.breakdown.rotation}/20 (20%)</span>
            </div>
            <div className="w-full">
              <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none" aria-label="Progression rotation du stock">
                <rect x="0" y="0" width="100" height="12" fill="#e2e8f0" rx="6" ry="6" />
                <rect x="0" y="0" width={(finScanScore.breakdown.rotation / 20) * 100} height="12" fill="#94a3b8" rx="6" ry="6" />
              </svg>
            </div>
          </div>

          {/* Discipline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Discipline Paiements</span>
              <span className="text-sm text-slate-600">{finScanScore.breakdown.discipline}/10 (10%)</span>
            </div>
            <div className="w-full">
              <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none" aria-label="Progression discipline paiements">
                <rect x="0" y="0" width="100" height="12" fill="#e2e8f0" rx="6" ry="6" />
                <rect x="0" y="0" width={(finScanScore.breakdown.discipline / 10) * 100} height="12" fill="#cbd5e1" rx="6" ry="6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Recommandations d'amélioration */}
        <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Recommandations d'Amélioration</h4>
          <div className="space-y-2 text-sm text-slate-700">
            {finScanScore.breakdown.rentabilite < 35 && (
              <p>• <strong>Rentabilité :</strong> Optimisez vos marges et réduisez les coûts opérationnels</p>
            )}
            {finScanScore.breakdown.tresorerie < 25 && (
              <p>• <strong>Trésorerie :</strong> Améliorez votre gestion des encaissements et décaissements</p>
            )}
            {finScanScore.breakdown.rotation < 18 && (
              <p>• <strong>Rotation :</strong> Accélérez l'écoulement de vos stocks dormants</p>
            )}
            {finScanScore.breakdown.discipline < 8 && (
              <p>• <strong>Discipline :</strong> Respectez mieux les délais de paiement clients et fournisseurs</p>
            )}
            {finScanScore.total >= 80 && (
              <p>• <strong>Excellent !</strong> Continuez sur cette lancée et maintenez vos bonnes pratiques</p>
            )}
          </div>
        </div>
      </div>

      {/* 8️⃣ Détection d'Anomalies IA */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-slate-600" />
          Détection d'Anomalies & Alertes Intelligentes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Anomalies détectées */}
          {(() => {
            const anomalies = [
              {
                type: 'Facture dupliquée',
                severity: 'high',
                description: 'Facture #F-2025-0012 apparaît 2 fois avec montants identiques',
                impact: 'Risque de double comptabilisation',
                action: 'Vérifier et supprimer le doublon',
                confidence: 95
              },
              {
                type: 'Paiement en retard',
                severity: 'medium',
                description: '3 factures impayées depuis plus de 45 jours',
                impact: 'Impact trésorerie: -125,000 DA',
                action: 'Relancer les clients concernés',
                confidence: 88
              },
              {
                type: 'Écart comptable',
                severity: 'high',
                description: 'Écart de 15,000 DA entre journal et grand livre',
                impact: 'Risque d\'erreur comptable',
                action: 'Réconcilier les comptes',
                confidence: 92
              },
              {
                type: 'Stock anormal',
                severity: 'low',
                description: '5 articles avec rotation < 0.5x/an',
                impact: 'Stock dormant: 45,000 DA',
                action: 'Envisager promotion ou liquidation',
                confidence: 75
              },
              {
                type: 'Client à risque',
                severity: 'medium',
                description: 'Client "ABC Corp" avec 3 retards consécutifs',
                impact: 'Risque de défaut de paiement',
                action: 'Mettre en place un suivi renforcé',
                confidence: 82
              },
              {
                type: 'Charge anormale',
                severity: 'low',
                description: 'Charge "Transport" +35% vs mois précédent',
                impact: 'Vérifier la légitimité',
                action: 'Analyser les justificatifs',
                confidence: 70
              }
            ];
            
            return anomalies.map((anomaly, idx) => {
              const severityColors = {
                high: 'bg-red-50 border-red-300 text-red-800',
                medium: 'bg-amber-50 border-amber-300 text-amber-800',
                low: 'bg-blue-50 border-blue-300 text-blue-800'
              };
              const severityIcons = {
                high: ExclamationTriangleIcon,
                medium: ClockIcon,
                low: LightBulbIcon
              };
              const Icon = severityIcons[anomaly.severity as keyof typeof severityIcons];
              
              return (
                <div key={idx} className={`p-4 rounded-lg border-2 ${severityColors[anomaly.severity as keyof typeof severityColors]}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5" />
                      <span className="font-semibold">{anomaly.type}</span>
                    </div>
                    <span className="text-xs font-medium opacity-75">{anomaly.confidence}%</span>
                  </div>
                  <p className="text-sm mb-2">{anomaly.description}</p>
                  <div className="text-xs mb-2">
                    <strong>Impact:</strong> {anomaly.impact}
                  </div>
                  <div className="text-xs">
                    <strong>Action:</strong> {anomaly.action}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {/* 9️⃣ Optimisation Fiscale Intelligente */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg shadow-sm border-2 border-emerald-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          <BeakerIcon className="h-5 w-5 mr-2 text-emerald-600" />
          Optimisation Fiscale Intelligente
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scénarios fiscaux */}
          <div className="bg-white rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-slate-900 mb-4">Simulation de Scénarios Fiscaux</h3>
            <div className="space-y-3">
              {[
                { scenario: 'Scénario actuel', tva: 125000, ibs: 85000, total: 210000, color: 'slate' },
                { scenario: 'Optimisation légère', tva: 118000, ibs: 80000, total: 198000, color: 'emerald', savings: 12000 },
                { scenario: 'Optimisation maximale', tva: 110000, ibs: 75000, total: 185000, color: 'teal', savings: 25000 }
              ].map((scenario, idx) => (
                <div key={idx} className={`p-3 rounded-lg border-2 ${
                  scenario.color === 'slate' ? 'bg-slate-50 border-slate-200' :
                  scenario.color === 'emerald' ? 'bg-emerald-50 border-emerald-300' :
                  'bg-teal-50 border-teal-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">{scenario.scenario}</span>
                    {scenario.savings && (
                      <span className="text-xs font-bold text-emerald-600">Économie: {scenario.savings.toLocaleString()} DA</span>
                    )}
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-600">TVA:</span>
                      <span className="font-medium">{scenario.tva.toLocaleString()} DA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">IBS:</span>
                      <span className="font-medium">{scenario.ibs.toLocaleString()} DA</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                      <span className="font-semibold text-slate-900">Total:</span>
                      <span className="font-bold text-slate-900">{scenario.total.toLocaleString()} DA</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommandations fiscales */}
          <div className="bg-white rounded-lg p-4 border border-emerald-200">
            <h3 className="font-semibold text-slate-900 mb-4">Recommandations Fiscales Personnalisées</h3>
            <div className="space-y-3">
              {[
                {
                  title: 'Récupération TVA',
                  description: 'TVA récupérable estimée: 45,000 DA sur les achats du mois',
                  action: 'Vérifier les factures d\'achat et déclarer la TVA récupérable',
                  impact: 'Économie potentielle: 45,000 DA',
                  priority: 'high'
                },
                {
                  title: 'Planification fiscale',
                  description: 'Répartir les charges sur plusieurs mois pour optimiser l\'IBS',
                  action: 'Décaler certaines dépenses au trimestre suivant',
                  impact: 'Réduction IBS estimée: -12,000 DA',
                  priority: 'medium'
                },
                {
                  title: 'Conformité G50',
                  description: 'Déclaration G50 à effectuer avant le 25 du mois',
                  action: 'Préparer les pièces justificatives et valider les montants',
                  impact: 'Éviter les pénalités de retard',
                  priority: 'high'
                },
                {
                  title: 'Optimisation charges',
                  description: 'Certaines charges peuvent être déduites de l\'IBS',
                  action: 'Identifier les charges déductibles non encore comptabilisées',
                  impact: 'Réduction IBS estimée: -8,000 DA',
                  priority: 'low'
                }
              ].map((reco, idx) => (
                <div key={idx} className={`p-3 rounded-lg border-2 ${
                  reco.priority === 'high' ? 'bg-red-50 border-red-200' :
                  reco.priority === 'medium' ? 'bg-amber-50 border-amber-200' :
                  'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-slate-900">{reco.title}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      reco.priority === 'high' ? 'bg-red-100 text-red-800' :
                      reco.priority === 'medium' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {reco.priority === 'high' ? 'Prioritaire' : reco.priority === 'medium' ? 'Moyen' : 'Faible'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{reco.description}</p>
                  <div className="text-xs text-slate-600 mb-1">
                    <strong>Action:</strong> {reco.action}
                  </div>
                  <div className="text-xs font-semibold text-emerald-700">
                    💰 {reco.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🔟 Détection de Fraudes & Conformité */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          <ShieldCheckIcon className="h-5 w-5 mr-2 text-slate-600" />
          Détection de Fraudes & Vérification de Conformité
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vérifications de conformité */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Vérifications de Conformité</h3>
            {[
              { check: 'Conformité règles comptables algériennes', status: 'pass', details: 'Toutes les écritures respectent le PCA 2010' },
              { check: 'Vérification des déclarations fiscales', status: 'warning', details: '1 déclaration G50 en attente de validation' },
              { check: 'Cohérence des écritures comptables', status: 'pass', details: 'Aucun écart détecté' },
              { check: 'Validation des factures', status: 'pass', details: 'Toutes les factures sont conformes' },
              { check: 'Traçabilité des opérations', status: 'pass', details: 'Traçabilité complète assurée' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                {item.status === 'pass' ? (
                  <CheckCircleIcon className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{item.check}</p>
                  <p className="text-sm text-slate-600">{item.details}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Détection de fraudes */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Détection de Fraudes</h3>
            {[
              { type: 'Doublons factures', count: 1, risk: 'low', action: 'Vérifier facture #F-2025-0012' },
              { type: 'Montants suspects', count: 0, risk: 'none', action: 'Aucun montant suspect détecté' },
              { type: 'Écritures anormales', count: 0, risk: 'none', action: 'Toutes les écritures sont normales' },
              { type: 'Clients fictifs', count: 0, risk: 'none', action: 'Tous les clients sont valides' },
              { type: 'Paiements suspects', count: 0, risk: 'none', action: 'Aucun paiement suspect détecté' }
            ].map((item, idx) => (
              <div key={idx} className={`p-3 rounded-lg border-2 ${
                item.risk === 'none' ? 'bg-emerald-50 border-emerald-200' :
                item.risk === 'low' ? 'bg-amber-50 border-amber-200' :
                item.risk === 'medium' ? 'bg-orange-50 border-orange-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">{item.type}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.risk === 'none' ? 'bg-emerald-100 text-emerald-800' :
                    item.risk === 'low' ? 'bg-amber-100 text-amber-800' :
                    item.risk === 'medium' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.count} {item.count === 1 ? 'cas' : 'cas'}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{item.action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 1️⃣1️⃣ Analyse Comportementale & Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          <UserCircleIcon className="h-5 w-5 mr-2 text-slate-600" />
          Analyse Comportementale & Segmentation Clients
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Segmentation clients */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" />
              Segmentation Clients
            </h3>
            <div className="space-y-3">
              {[
                { segment: 'Clients VIP', count: 12, revenue: '45%', trend: '+8%', color: 'emerald' },
                { segment: 'Clients réguliers', count: 45, revenue: '35%', trend: '+5%', color: 'blue' },
                { segment: 'Clients occasionnels', count: 28, revenue: '20%', trend: '-2%', color: 'amber' }
              ].map((seg, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">{seg.segment}</span>
                    <span className="text-xs font-semibold text-slate-600">{seg.count} clients</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-600">CA:</span>
                      <span className="font-semibold">{seg.revenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tendance:</span>
                      <span className={`font-semibold ${
                        seg.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {seg.trend}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prédiction de churn */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4 border-2 border-red-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-600" />
              Prédiction de Churn
            </h3>
            <div className="space-y-3">
              {[
                { client: 'Client A', risk: 'high', reason: '3 retards de paiement', action: 'Relance urgente' },
                { client: 'Client B', risk: 'medium', reason: 'Baisse d\'activité -50%', action: 'Contacter pour comprendre' },
                { client: 'Client C', risk: 'low', reason: 'Légère baisse d\'activité', action: 'Surveiller' }
              ].map((item, idx) => (
                <div key={idx} className={`p-3 rounded-lg border-2 ${
                  item.risk === 'high' ? 'bg-red-100 border-red-300' :
                  item.risk === 'medium' ? 'bg-amber-100 border-amber-300' :
                  'bg-blue-100 border-blue-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">{item.client}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.risk === 'high' ? 'bg-red-200 text-red-800' :
                      item.risk === 'medium' ? 'bg-amber-200 text-amber-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {item.risk === 'high' ? 'Risque élevé' : item.risk === 'medium' ? 'Risque moyen' : 'Risque faible'}
                  </span>
                  </div>
                  <p className="text-sm text-slate-700 mb-1">{item.reason}</p>
                  <p className="text-xs text-slate-600"><strong>Action:</strong> {item.action}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommandations de fidélisation */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border-2 border-emerald-200">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
              <LightBulbIcon className="h-5 w-5 mr-2 text-emerald-600" />
              Recommandations Fidélisation
            </h3>
            <div className="space-y-3">
              {[
                { action: 'Programme de fidélité', impact: 'Augmenter rétention de 15%', priority: 'high' },
                { action: 'Offres personnalisées', impact: 'Augmenter panier moyen de 10%', priority: 'medium' },
                { action: 'Suivi proactif', impact: 'Réduire churn de 20%', priority: 'high' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-emerald-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">{item.action}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.priority === 'high' ? 'Prioritaire' : 'Moyen'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">💡 {item.impact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 1️⃣2️⃣ Génération Automatique de Rapports */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-slate-600" />
          Génération Automatique de Rapports IA
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { 
              type: 'Rapport mensuel', 
              description: 'Synthèse complète des performances du mois',
              features: ['CA, marges, ratios', 'Prévisions', 'Recommandations'],
              generate: () => console.log('Générer rapport mensuel')
            },
            { 
              type: 'Rapport trimestriel', 
              description: 'Analyse approfondie sur 3 mois',
              features: ['Tendances', 'Comparaisons', 'Benchmarking'],
              generate: () => console.log('Générer rapport trimestriel')
            },
            { 
              type: 'Rapport annuel', 
              description: 'Bilan complet de l\'année',
              features: ['Évolution annuelle', 'Objectifs atteints', 'Perspectives'],
              generate: () => console.log('Générer rapport annuel')
            },
            { 
              type: 'Rapport fiscal', 
              description: 'Synthèse pour déclarations fiscales',
              features: ['TVA, IBS', 'Conformité', 'Optimisations'],
              generate: () => console.log('Générer rapport fiscal')
            },
            { 
              type: 'Rapport trésorerie', 
              description: 'Analyse de la trésorerie et cash-flow',
              features: ['Encaissements', 'Décaissements', 'Prévisions'],
              generate: () => console.log('Générer rapport trésorerie')
            },
            { 
              type: 'Rapport personnalisé', 
              description: 'Créez votre propre rapport',
              features: ['Sélection de métriques', 'Période personnalisée', 'Export PDF/Excel'],
              generate: () => console.log('Générer rapport personnalisé')
            }
          ].map((report, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200 hover:border-slate-400 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900">{report.type}</h3>
                <DocumentTextIcon className="h-5 w-5 text-slate-600" />
              </div>
              <p className="text-sm text-slate-600 mb-3">{report.description}</p>
              <div className="space-y-1 mb-4">
                {report.features.map((feature, fIdx) => (
                  <div key={fIdx} className="text-xs text-slate-600 flex items-center">
                    <CheckCircleIcon className="h-3 w-3 mr-1 text-emerald-600" />
                    {feature}
                  </div>
                ))}
              </div>
              <button
                onClick={report.generate}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
              >
                <SparklesIcon className="h-4 w-4" />
                <span>Générer avec IA</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 7️⃣ Méthodologie & traçabilité */}
      <div className="bg-slate-50 rounded-lg shadow-inner border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-2">Méthodologie & Hypothèses</h3>
        <ul className="text-xs text-slate-600 list-disc pl-5 space-y-1">
          <li>Sources: données adaptatives de votre profil (CA, trésorerie, créances/dettes, stock).</li>
          <li>Hypothèses: 22 jours ouvrés/mois; COGS ≈ 1 - marge brute; DSO/DPO ≈ jours de CA/achats.</li>
          <li>Prévisions M+1: extrapolation de la croissance actuelle, ajustée pour trésorerie.</li>
          <li>Scores: échelles normalisées; seuils cibles: DSO ≤ 30j, DPO ≥ 30j, liquidité ≥ 1.0.</li>
          <li>Usage démo: chiffres réalistes mais synthétiques, sans connexion à des systèmes externes.</li>
          <li><strong>Nouvelles fonctionnalités IA:</strong> Détection d'anomalies, optimisation fiscale, détection de fraudes, analyse comportementale, génération automatique de rapports.</li>
        </ul>
      </div>

      {/* 6️⃣ Tableaux et graphiques de synthèse */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
          <ChartPieIcon className="h-5 w-5 mr-2 text-slate-600" />
          Tableaux et Graphiques de Synthèse
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Évolution CA / Marge */}
          <div>
            <h3 className="text-md font-semibold text-slate-900 mb-4">Évolution CA / Marge sur 6 mois</h3>
            <div className="space-y-2">
              {evolutionData.map((month, index) => {
                const maxCA = Math.max(...evolutionData.map(m => m.ca));
                const caWidth = (month.ca / maxCA) * 100;
                const margeWidth = (month.marge / 30) * 100; // Normalisé sur 30%
                
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{month.month}</span>
                      <span className="text-slate-600">{month.ca.toLocaleString()} DA</span>
                    </div>
                    <div className="flex space-x-2">
                      <div className="flex-1 relative">
                        <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none" aria-label="CA">
                          <rect x="0" y="0" width="100" height="12" fill="#e2e8f0" rx="6" ry="6" />
                          <rect x="0" y="0" width={caWidth} height="12" fill="#475569" rx="6" ry="6" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">CA</div>
                      </div>
                      <div className="w-20 relative">
                        <svg className="w-full h-3" viewBox="0 0 100 12" preserveAspectRatio="none" aria-label="Marge %">
                          <rect x="0" y="0" width="100" height="12" fill="#e2e8f0" rx="6" ry="6" />
                          <rect x="0" y="0" width={margeWidth} height="12" fill="#64748b" rx="6" ry="6" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">{month.marge}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Répartition des coûts */}
          <div>
            <h3 className="text-md font-semibold text-slate-900 mb-4">Répartition des Coûts</h3>
            <div className="space-y-3">
              {costBreakdown.map((cost, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{cost.category}</span>
                    <span className="text-slate-600">{cost.amount.toLocaleString()} DA</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 relative overflow-hidden">
                    {/* eslint-disable-next-line react/no-inline-styles */}
                    <div 
                      className={`h-full ${cost.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${cost.percentage}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                      {cost.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Projection de trésorerie */}
        <div className="mt-6">
          <h3 className="text-md font-semibold text-slate-900 mb-4">Projection de Trésorerie</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {cashFlowProjection.map((period, index) => {
              const maxValue = Math.max(...cashFlowProjection.filter(p => p.projected).map(p => p.projected!));
              const height = period.projected ? (period.projected / maxValue) * 100 : 0;
              
              return (
                <div key={index} className="text-center">
                  <div className="text-xs text-slate-500 mb-2">{period.period}</div>
                  <div className="h-24 flex items-end justify-center space-x-1">
                    {period.actual && (
                      <div 
                        className="w-4 bg-slate-400 rounded-t"
                        style={{ height: `${(period.actual / maxValue) * 100}%` }} // eslint-disable-line react/no-inline-styles
                        title={`Réel: ${period.actual.toLocaleString()} DA`}
                      ></div>
                    )}
                    <div 
                      className="w-4 bg-slate-600 rounded-t"
                      style={{ height: `${height}%` }} // eslint-disable-line react/no-inline-styles
                      title={`Prévu: ${period.projected.toLocaleString()} DA`}
                    ></div>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {period.projected.toLocaleString()} DA
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-slate-400 rounded"></div>
              <span className="text-sm text-slate-600">Réel</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-slate-600 rounded"></div>
              <span className="text-sm text-slate-600">Prévu</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modales IA */}
      <InsightsPanel isOpen={isInsightsOpen} onClose={() => setIsInsightsOpen(false)} />
      {/* <StaticAIChat isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} /> */}
      <AnalysisRunReport isOpen={isRunOpen} onClose={() => setIsRunOpen(false)} />
    </div>
  );
};

export default AnalysesLIA;

// Modales rendues à la racine du composant pour accessibilité
// Note: Elles s'affichent uniquement quand isOpen = true
// Ces rendus doivent être inclus au même niveau que le return principal
