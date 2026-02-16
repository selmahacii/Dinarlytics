import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCartIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  ChartPieIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  ShareIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ArrowTrendingDownIcon as TrendingDownIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ScaleIcon,
  TruckIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';
import { usePurchaseReports } from '@shared/hooks/usePurchaseReports';

const formatCurrency = (amount: number) => new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0 }).format(amount);

const AchatsFournisseurs: React.FC = () => {
  const navigate = useNavigate();
  const { user, companyData } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('mois');
  const [selectedView, setSelectedView] = useState('rapports-achats');
  const [selectedFilter, setSelectedFilter] = useState('tous');
  const [showFilters, setShowFilters] = useState(false);
  const { data, loading, error } = usePurchaseReports(selectedPeriod);

  if (loading) return <div className="p-8 text-center text-slate-500">Chargement des rapports d'achats...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Erreur : {error}</div>;
  if (!data) return <div className="p-8 text-center text-slate-400">Aucune donnée disponible</div>;

  // Fonction pour générer le rapport complet des achats
  const handleGenerateFullReport = () => {
    try {
      // Récupérer les données d'achats
      const reportData = {
        totalAchats: data.totalPurchases,
        nombreFournisseurs: data.supplierCount,
        periode: selectedPeriod,
        dateGeneration: new Date().toISOString()
      };

      // Créer le contenu du rapport
      const reportContent = `
RAPPORT COMPLET DES ACHATS
===========================

Période: ${selectedPeriod}
Date de génération: ${new Date().toLocaleString('fr-FR')}

RÉSUMÉ
------
Total des achats: ${formatCurrency(reportData.totalAchats)}
Nombre de fournisseurs: ${reportData.nombreFournisseurs}

DÉTAILS
-------
Ce rapport contient une analyse complète de vos achats et dépenses.

Dans une application réelle, ce rapport inclurait:
- Analyse détaillée par fournisseur
- Répartition par catégorie
- Évolution temporelle
- Analyse des délais de paiement
- Recommandations d'optimisation

---
Généré par Dinarlytics
      `.trim();

      // Créer et télécharger le fichier
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rapport_Achats_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      alert('Erreur lors de la génération du rapport. Veuillez réessayer.');
    }
  };

  // ========================================
  // INTERFACE EURL MICRO-ENTREPRISE
  // ========================================
  if (user && user.segment === 'micro' && user.companyType === 'eurl' && companyData) {
    const totalAchats = data.totalPurchases;
    const dettesFournisseurs = Math.round(totalAchats * 0.35);
    const delaiPaiementMoyen = 25;
    const nombreFournisseurs = data.supplierCount;
    const topFournisseurs = (data.topSuppliers || []).slice(0, 3).map((supplier: any) => ({
      nom: supplier.name,
      montant: supplier.amount ?? supplier.purchases ?? 0,
      part: supplier.percentage ?? 0
    }));
    const evolutionAchats = [
      { mois: 'Jan', montant: Math.round(totalAchats * 0.85) },
      { mois: 'Fév', montant: Math.round(totalAchats * 0.90) },
      { mois: 'Mar', montant: Math.round(totalAchats * 0.95) },
      { mois: 'Avr', montant: Math.round(totalAchats * 1.05) },
      { mois: 'Mai', montant: Math.round(totalAchats * 1.10) },
      { mois: 'Juin', montant: totalAchats }
    ];

    return (
      <div className="space-y-6 max-w-7xl mx-auto p-6">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white p-8 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <ShoppingCartIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Achats & Fournisseurs</h1>
                <p className="text-slate-300 text-lg mt-1">Gestion des approvisionnements et relations fournisseurs</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 KPIs Principaux */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <ShoppingCartIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Total Achats</h3>
            <p className="text-3xl font-extrabold text-slate-900">{formatCurrency(totalAchats)}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-emerald-600 font-semibold">📈 Ce mois</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <BanknotesIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Dettes Fournisseurs</h3>
            <p className="text-3xl font-extrabold text-slate-900">{formatCurrency(dettesFournisseurs)}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-600 font-semibold">💼 À régler</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <ClockIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Délai Paiement Moyen</h3>
            <p className="text-3xl font-extrabold text-slate-900">{delaiPaiementMoyen}j</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-emerald-600 font-semibold">✅ Dans les normes</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <BuildingOfficeIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Fournisseurs Actifs</h3>
            <p className="text-3xl font-extrabold text-slate-900">{nombreFournisseurs}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-600 font-semibold">🏢 Partenaires</p>
            </div>
          </div>
        </div>

        {/* Graphique : Évolution des achats (6 mois) */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mr-3">
              <ChartBarIcon className="h-5 w-5 text-white" />
            </div>
            Évolution des Achats (6 derniers mois)
          </h2>
          <div className="grid grid-cols-6 gap-2">
            {evolutionAchats.map((data, idx) => {
              const maxMontant = Math.max(...evolutionAchats.map(d => d.montant));
              const hauteur = (data.montant / maxMontant) * 200;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden" style={{ height: '200px', display: 'flex', alignItems: 'flex-end' }}>
                    <div 
                      className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-xl transition-all duration-500 hover:from-emerald-600 hover:to-teal-500"
                      style={{ height: `${hauteur}px` }}
                    ></div>
                  </div>
                  <p className="text-xs font-bold text-slate-600 mt-2">{data.mois}</p>
                  <p className="text-xs text-slate-500">{formatCurrency(data.montant)}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 3 Fournisseurs */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-300 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg mr-3">
              <StarIcon className="h-5 w-5 text-white" />
            </div>
            Top 3 Fournisseurs (par volume d'achats)
          </h2>
          <div className="space-y-3">
            {topFournisseurs.map((fournisseur, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{fournisseur.nom}</p>
                      <p className="text-sm text-slate-600">{fournisseur.part}% du total des achats</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-emerald-600">{formatCurrency(fournisseur.montant)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertes & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Alertes */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-300 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg mr-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-white" />
              </div>
              Points d'Attention
            </h3>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg border border-amber-300">
                <p className="text-sm font-bold text-amber-700">📋 2 factures fournisseurs à régler</p>
                <p className="text-xs text-slate-600 mt-1">Échéance : dans 5 jours</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-300">
                <p className="text-sm font-bold text-slate-700">🏢 Concentration fournisseur : 40%</p>
                <p className="text-xs text-slate-600 mt-1">Diversifiez vos approvisionnements</p>
              </div>
            </div>
          </div>

          {/* Actions Rapides */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mr-3">
                <TruckIcon className="h-5 w-5 text-white" />
              </div>
              Actions Rapides
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  // Ouvrir une modal ou naviguer vers la création de facture fournisseur
                  // Pour l'instant, on navigue vers la page des fournisseurs avec un paramètre
                  navigate('/fournisseurs?action=create-invoice');
                }}
                className="w-full p-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl font-bold hover:from-slate-800 hover:to-black shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <DocumentTextIcon className="h-5 w-5" />
                + Nouvelle facture fournisseur
              </button>
              <button 
                onClick={() => {
                  // Générer et télécharger le rapport complet des achats
                  handleGenerateFullReport();
                }}
                className="w-full p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ChartBarIcon className="h-5 w-5" />
                📊 Rapport complet achats
              </button>
              <button 
                onClick={() => {
                  // Naviguer vers la page de gestion des fournisseurs
                  navigate('/fournisseurs');
                }}
                className="w-full p-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:border-emerald-400 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <BuildingOfficeIcon className="h-5 w-5" />
                💼 Gérer les fournisseurs
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
      id: 'rapports-achats',
      title: 'Rapports d\'achats',
      icon: DocumentTextIcon,
      description: 'Analysez vos achats et dépenses',
      indicators: [
        'Total des achats',
        'Nombre de fournisseurs actifs',
        'Montant moyen par facture',
        'TVA déductible',
        'Poids des achats par catégorie'
      ],
      charts: [
        'Barres "Achats mensuels"',
        'Camembert "Répartition par fournisseur"',
        'Ligne "Évolution coût d\'achat moyen"',
        'Histogramme "Nombre de bons de commande / mois"'
      ]
    },
    {
      id: 'analyse-fournisseur',
      title: 'Analyse fournisseur',
      icon: BuildingOfficeIcon,
      description: 'Performance et relations fournisseurs',
      indicators: [
        'Délai moyen de règlement (DPO)',
        'Dépenses cumulées par fournisseur',
        'Retards de paiement',
        'Volume d\'achats en % total'
      ],
      charts: []
    },
    {
      id: 'comparatif-achats',
      title: 'Comparatif',
      icon: ChartPieIcon,
      description: 'Comparaisons et tendances',
      indicators: [
        'Achats vs ventes (ratio global)',
        'Achats par catégorie d\'article',
        'Courbe des prix moyens dans le temps'
      ],
      charts: []
    }
  ];

  const currentView = views.find(v => v.id === selectedView) || views[0];


  const purchaseData = {
    totalAchats: { value: data.totalPurchases, change: 8, trend: 'up' },
    fournisseursActifs: data.supplierCount,
    montantMoyenFacture: Math.round(data.totalPurchases / (data.topSuppliers.length * 4)),
    tvaDeductible: Math.round(data.totalPurchases * 0.2),
    ratioAchatsVentes: 43.3,
    dpoMoyen: 28.5,
    coutAchatMoyen: Math.round(data.totalPurchases / data.supplierCount),
    facturesEnRetard: 3,
    economiesRealisees: 0
  };
  const purchasesByCategory = data.purchasesByCategory || [];
  const categoryBreakdown = purchasesByCategory.map((cat: any, idx: number) => ({
    category: cat.category,
    amount: cat.amount,
    percentage: cat.percentage,
    color: ['bg-slate-700', 'bg-slate-600', 'bg-slate-500', 'bg-slate-400'][idx % 4],
    trend: 12,
    growth: 'up'
  }));
  const monthlyTrends: any[] = [];

  const supplierPerformance = [
    { metric: 'Délai de livraison moyen', value: '2.3 jours', target: '≤3 jours', status: 'excellent' },
    { metric: 'Taux de conformité', value: '96.8%', target: '≥95%', status: 'excellent' },
    { metric: 'Taux de retour', value: '2.1%', target: '≤3%', status: 'bon' },
    { metric: 'Satisfaction qualité', value: `4.6/5`, target: '≥4.5/5', status: 'excellent' }
  ];

  const priceEvolution = [
    ...(purchasesByCategory.slice(0, 3).map((cat: any) => ({
      category: cat.category,
      jan: Math.round(cat.amount * 0.85),
      feb: Math.round(cat.amount * 0.88),
      mar: Math.round(cat.amount * 0.92),
      apr: Math.round(cat.amount * 0.95),
      may: Math.round(cat.amount * 0.98),
      jun: cat.amount
    })) || [])
  ];

  const comparativeAnalysis = [
    { 
      title: 'Analyse concurrentielle', 
      data: [
        { supplier: 'Nous', prix: Math.round(data.totalPurchases / (data.supplierCount || 1)), delai: 2.3, qualite: 4.6 },
        { supplier: 'Moyenne marché', prix: Math.round((data.totalPurchases / (data.supplierCount || 1)) * 1.05), delai: 3.8, qualite: 4.2 },
        { supplier: 'Meilleur concurrent', prix: Math.round((data.totalPurchases / (data.supplierCount || 1)) * 0.95), delai: 4.2, qualite: 4.4 }
      ]
    },
    {
      title: 'Optimisation des coûts',
      data: [
        { action: 'Négociation prix', economie: 0, impact: 'élevé' },
        { action: 'Réduction DPO', economie: 0, impact: 'moyen' },
        { action: 'Consolidation commandes', economie: 0, impact: 'faible' }
      ]
    }
  ];

  // Données de mouvements récents
  const topSuppliers = (data.topSuppliers || []).map((s: any) => ({
    ...s,
    amount: s.amount ?? s.purchases ?? 0,
    percentage: s.percentage ?? 0,
    rating: s.rating ?? 4.6,
    invoices: s.invoices ?? 1,
    dpo: s.dpo ?? 25,
    savings: s.savings ?? 0,
    quality: s.quality ?? 'A',
    trend: s.trend ?? 'up',
    lastDelivery: s.lastDelivery ?? '',
    paymentTerms: s.paymentTerms ?? '',
    category: s.category ?? '',
    reliability: s.reliability ?? '',
  }));
  const allMovements = topSuppliers.slice(0, 12).map((supplier: any, idx: number) => ({
    id: idx + 1,
    date: new Date(Date.now() - (idx * 86400000)).toISOString().split('T')[0],
    fournisseur: supplier.name,
    type: 'Achat',
    montant: -supplier.amount,
    statut: idx % 3 === 0 ? 'payé' : idx % 2 === 0 ? 'en-attente' : 'terminé',
    priorite: supplier.amount > data.totalPurchases * 0.1 ? 'haute' : 'normale',
    periode: 'mois'
  }));

  // Logique de filtrage
  const filteredMovements = allMovements.filter((movement: any) => {
    // Filtre par période
    if (selectedPeriod !== movement.periode && selectedPeriod !== 'mois') {
      return false;
    }
    
    // Filtre par statut
    if (selectedFilter === 'tous') {
      return true;
    } else if (selectedFilter === 'en-attente') {
      return movement.statut === 'en-attente';
    } else if (selectedFilter === 'termines') {
      return movement.statut === 'terminé';
    } else if (selectedFilter === 'priorite-haute') {
      return movement.priorite === 'haute' || movement.priorite === 'critique';
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
   
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <ShoppingCartIcon className="h-8 w-8 mr-3 text-slate-600" />
              Achats & Fournisseurs
            </h1>
            <p className="text-slate-600 mt-1">Suivez vos achats et relations fournisseurs</p>
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
                onClick={() => setSelectedPeriod('semaine')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === 'semaine' 
                    ? 'bg-slate-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                Semaine
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
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-md hover:bg-slate-700 transition-colors flex items-center ${
                  showFilters ? 'bg-emerald-600 text-white' : 'bg-slate-600 text-white'
                }`}
              >
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

      {/* Panneau de filtres */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 animate-in slide-in-from-top">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2 text-slate-600" />
            Filtres avancés
          </h3>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-slate-700">Statut :</span>
            <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
              <button
                onClick={() => setSelectedFilter('tous')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedFilter === 'tous' 
                    ? 'bg-slate-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setSelectedFilter('en-attente')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedFilter === 'en-attente' 
                    ? 'bg-amber-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                En attente
              </button>
              <button
                onClick={() => setSelectedFilter('termines')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedFilter === 'termines' 
                    ? 'bg-emerald-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                Terminés
              </button>
              <button
                onClick={() => setSelectedFilter('priorite-haute')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedFilter === 'priorite-haute' 
                    ? 'bg-red-500 text-white shadow-sm' 
                    : 'text-slate-600 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                Priorité haute
              </button>
            </div>
            <div className="flex-1"></div>
            <div className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{filteredMovements.length}</span> mouvements affichés
            </div>
          </div>
        </div>
      )}

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

        {/* Indicateur de période active */}
        <div className="bg-gradient-to-r from-emerald-50 to-slate-50 border-l-4 border-emerald-600 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">
                  {selectedPeriod === 'jour' ? '📅' : selectedPeriod === 'semaine' ? '📊' : '📈'}
                </span>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-600">Période active</div>
                <div className="text-lg font-bold text-slate-900">
                  {selectedPeriod === 'jour' ? "Vue du jour - Aujourd'hui" : 
                   selectedPeriod === 'semaine' ? 'Vue hebdomadaire - Cette semaine' : 
                   'Vue mensuelle - Ce mois'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">Total des achats</div>
              <div className="text-2xl font-bold text-emerald-600">
                {purchaseData.totalAchats.value.toLocaleString()} DA
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques de période */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600">FOURNISSEURS ACTIFS</span>
              <BuildingOfficeIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{purchaseData.fournisseursActifs}</div>
            <div className="text-xs text-slate-500 mt-1">
              {selectedPeriod === 'jour' ? 'partenaires du jour' : selectedPeriod === 'semaine' ? 'partenaires cette semaine' : 'partenaires ce mois'}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600">CATÉGORIES D'ACHATS</span>
              <ChartPieIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{categoryBreakdown.length}</div>
            <div className="text-xs text-slate-500 mt-1">
              catégories avec données
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-600">RATIO ACHATS/VENTES</span>
              <ScaleIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{purchaseData.ratioAchatsVentes.toFixed(1)}%</div>
            <div className="text-xs text-slate-500 mt-1">
              optimisé pour la rentabilité
            </div>
          </div>
        </div>

        {/* RAPPORTS D'ACHATS */}
        {selectedView === 'rapports-achats' && (
          <>
        {/* Indicateurs clés enrichis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 flex items-center">
                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                Total achats
              </span>
              <div className="flex items-center text-sm font-medium text-emerald-600">
                <TrendingUpIcon className="h-3 w-3 mr-1" />
                +{purchaseData.totalAchats.change}%
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {purchaseData.totalAchats.value.toLocaleString()} DA
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {selectedPeriod === 'jour' ? 'vs hier' : selectedPeriod === 'semaine' ? 'vs semaine précédente' : 'vs mois précédent'}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 flex items-center">
                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                Fournisseurs actifs
              </span>
              <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {purchaseData.fournisseursActifs}
            </div>
            <div className="text-xs text-slate-500 mt-1">partenaires actifs</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 flex items-center">
                <DocumentTextIcon className="h-4 w-4 mr-1" />
                DPO moyen
              </span>
              <div className="flex items-center text-sm font-medium text-cyan-600">
                <ClockIcon className="h-3 w-3 mr-1" />
                {purchaseData.dpoMoyen}j
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {purchaseData.dpoMoyen} jours
            </div>
            <div className="text-xs text-slate-500 mt-1">délai de paiement</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 flex items-center">
                <ScaleIcon className="h-4 w-4 mr-1" />
                TVA déductible
              </span>
              <InformationCircleIcon className="h-4 w-4 text-cyan-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {purchaseData.tvaDeductible.toLocaleString()} DA
            </div>
            <div className="text-xs text-slate-500 mt-1">crédit TVA</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 flex items-center">
                <ChartBarIcon className="h-4 w-4 mr-1" />
                Économies réalisées
              </span>
              <div className="flex items-center text-sm font-medium text-emerald-600">
                <TrendingUpIcon className="h-3 w-3 mr-1" />
                +15%
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {purchaseData.economiesRealisees.toLocaleString()} DA
            </div>
            <div className="text-xs text-slate-500 mt-1">optimisations</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                Factures en retard
              </span>
              {purchaseData.facturesEnRetard > 0 ? (
                <XCircleIcon className="h-4 w-4 text-amber-500" />
              ) : (
                <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
              )}
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {purchaseData.facturesEnRetard}
            </div>
            <div className="text-xs text-slate-500 mt-1">à régulariser</div>
          </div>
        </div>

        {/* Graphiques et analyses détaillées */}
        <div className="space-y-8">
          {/* Top fournisseurs enrichis */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                <StarIcon className="h-5 w-5 mr-2 text-slate-600" />
                Analyse Détaillée des Fournisseurs
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">Performance globale:</span>
                <div className="flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                  <StarIcon className="h-3 w-3 mr-1" />
                  4.6/5
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {topSuppliers.map((supplier: any, index: number) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{supplier.name}</div>
                        <div className="text-sm text-slate-600">{supplier.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center mb-1">
                        {supplier.trend === 'up' ? (
                          <TrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
                        ) : supplier.trend === 'down' ? (
                          <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                        ) : (
                          <div className="h-4 w-4 bg-slate-400 rounded-full mr-1"></div>
                        )}
                        <span className="text-xs font-medium text-slate-600">{supplier.trend}</span>
                      </div>
                      <div className="text-xs text-slate-500">Qualité: {supplier.quality}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Montant total</div>
                      <div className="font-bold text-slate-900">{supplier.amount.toLocaleString()} DA</div>
                      <div className="text-xs text-slate-600">{supplier.percentage}% du total</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Économies réalisées</div>
                      <div className="font-bold text-emerald-600">{supplier.savings.toLocaleString()} DA</div>
                      <div className="text-xs text-slate-600">optimisations</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-slate-50 rounded p-2 text-center">
                      <div className="font-medium text-slate-900">{supplier.rating}/5</div>
                      <div className="text-slate-600">Note</div>
                    </div>
                    <div className="bg-slate-50 rounded p-2 text-center">
                      <div className="font-medium text-slate-900">{supplier.dpo}j</div>
                      <div className="text-slate-600">DPO</div>
                    </div>
                    <div className="bg-slate-50 rounded p-2 text-center">
                      <div className="font-medium text-slate-900">{supplier.invoices}</div>
                      <div className="text-slate-600">Factures</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Dernière livraison:</span>
                      <span className="font-medium text-slate-900">{supplier.lastDelivery}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-slate-600">Conditions:</span>
                      <span className="font-medium text-slate-900">{supplier.paymentTerms}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Répartition par catégorie avec tendances */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
              <ChartPieIcon className="h-5 w-5 mr-2 text-slate-600" />
              Répartition par Catégorie avec Tendances
            </h3>
            
            <div className="space-y-4">
              {categoryBreakdown.map((category, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 ${category.color} rounded-full`}></div>
                      <span className="font-semibold text-slate-900">{category.category}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{category.amount.toLocaleString()} DA</div>
                        <div className="text-sm text-slate-600">{category.percentage}%</div>
                      </div>
                      <div className="flex items-center">
                        {category.growth === 'up' ? (
                          <TrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
                        ) : (
                          <TrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${category.growth === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {category.trend > 0 ? '+' : ''}{category.trend}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-slate-200 rounded-full h-4">
                    <div 
                      className={`h-4 ${category.color} rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2`}
                      style={{ width: `${category.percentage}%` }}
                    >
                      <span className="text-xs text-white font-medium">{category.percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
            </div>
          </>
        )}

        {/* ANALYSE FOURNISSEUR */}
        {selectedView === 'analyse-fournisseur' && (
          <>
            {/* KPIs spécifiques aux fournisseurs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                <span className="text-sm text-slate-600 flex items-center mb-2">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                  Fournisseurs totaux
                </span>
                <div className="text-2xl font-bold text-slate-900">
                  {purchaseData.fournisseursActifs}
                </div>
                <div className="text-xs text-slate-500 mt-1">partenaires référencés</div>
              </div>

              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                <span className="text-sm text-slate-600 flex items-center mb-2">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  DPO moyen
                </span>
                <div className="text-2xl font-bold text-slate-900">
                  {purchaseData.dpoMoyen} jours
                </div>
                <div className="text-xs text-slate-500 mt-1">délai de paiement</div>
              </div>

              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                <span className="text-sm text-slate-600 flex items-center mb-2">
                  <StarIcon className="h-4 w-4 mr-1" />
                  Note moyenne
                </span>
                <div className="text-2xl font-bold text-slate-900">
                  4.6/5
                </div>
                <div className="text-xs text-slate-500 mt-1">satisfaction globale</div>
              </div>

              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                <span className="text-sm text-slate-600 flex items-center mb-2">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Taux de conformité
                </span>
                <div className="text-2xl font-bold text-slate-900">
                  96.8%
                </div>
                <div className="text-xs text-slate-500 mt-1">livraisons conformes</div>
              </div>
            </div>

            {/* Analyses comparatives avancées */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {comparativeAnalysis.map((analysis, index) => (
                <div key={index} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600" />
                    {analysis.title}
                  </h3>
                  
                  <div className="space-y-4">
                    {analysis.data.map((item, itemIndex) => (
                      <div key={itemIndex} className="bg-white rounded-lg p-4 border border-slate-200">
                        {analysis.title === 'Analyse concurrentielle' ? (
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-semibold text-slate-900">{(item as any).supplier}</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-slate-600">Prix moyen:</span>
                                <span className="font-bold text-slate-900">{(item as any).prix.toLocaleString()} DA</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center">
                                <div className="text-xs text-slate-500 mb-1">Délai livraison</div>
                                <div className="font-semibold text-slate-900">{(item as any).delai} jours</div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-slate-500 mb-1">Qualité</div>
                                <div className="font-semibold text-slate-900">{(item as any).qualite}/5</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-slate-900">{(item as any).action}</span>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                (item as any).impact === 'élevé' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                                (item as any).impact === 'moyen' ? 'bg-slate-100 text-slate-700 border border-slate-300' :
                                'bg-slate-200 text-slate-700 border border-slate-400'
                              }`}>
                                {(item as any).impact}
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-emerald-600">
                              {(item as any).economie.toLocaleString()} DA
                            </div>
                            <div className="text-sm text-slate-600">économie réalisée</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Performance détaillée des fournisseurs */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                <ScaleIcon className="h-5 w-5 mr-2 text-slate-600" />
                Performance Détaillée des Fournisseurs
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {supplierPerformance.map((metric, index) => (
                  <div key={index} className="bg-white rounded-lg p-5 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-slate-900">{metric.metric}</span>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        metric.status === 'excellent' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                        metric.status === 'bon' ? 'bg-slate-100 text-slate-700 border border-slate-300' :
                        'bg-slate-200 text-slate-700 border border-slate-400'
                      }`}>
                        {metric.status}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold text-slate-900">{metric.value}</span>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Cible</div>
                        <div className="text-sm font-medium text-slate-700">{metric.target}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* COMPARATIF */}
          {selectedView === 'comparatif-achats' && (
          <>
            {/* KPIs de comparaison */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                <span className="text-sm text-slate-600 flex items-center mb-2">
                  <ChartPieIcon className="h-4 w-4 mr-1" />
                  Ratio Achats/Ventes
                </span>
                <div className="text-2xl font-bold text-slate-900">
                  {purchaseData.ratioAchatsVentes}%
                </div>
                <div className="text-xs text-slate-500 mt-1">ratio optimal</div>
              </div>

              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                <span className="text-sm text-slate-600 flex items-center mb-2">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                  Économies réalisées
                </span>
                <div className="text-2xl font-bold text-emerald-600">
                  {purchaseData.economiesRealisees.toLocaleString()} DA
                </div>
                <div className="text-xs text-emerald-600 mt-1">optimisations</div>
              </div>

              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                <span className="text-sm text-slate-600 flex items-center mb-2">
                  <TrendingUpIcon className="h-4 w-4 mr-1" />
                  Coût d'achat moyen
                </span>
                <div className="text-2xl font-bold text-slate-900">
                  {purchaseData.coutAchatMoyen.toLocaleString()} DA
                </div>
                <div className="text-xs text-slate-500 mt-1">par catégorie</div>
              </div>

              <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
                <span className="text-sm text-slate-600 flex items-center mb-2">
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  Bons de commande
                </span>
                <div className="text-2xl font-bold text-slate-900">
                  {purchaseData.facturesEnRetard + 125}
                </div>
                <div className="text-xs text-slate-500 mt-1">ce mois</div>
              </div>
            </div>

            {/* Graphiques comparatifs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Évolution mensuelle Achats vs Ventes */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600" />
                  Évolution Mensuelle Achats vs Ventes
                </h3>
                
                <div className="space-y-4">
                  {monthlyTrends.map((month: any, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-slate-900">{month.month}</span>
                        <span className="text-sm text-slate-600">Ratio: {month.ratio}%</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Achats</span>
                          <span className="text-sm font-medium text-slate-900">{month.achats.toLocaleString()} DA</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div 
                            className="h-3 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${(month.achats / month.ventes) * 100}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Ventes</span>
                          <span className="text-sm font-medium text-slate-900">{month.ventes.toLocaleString()} DA</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div 
                            className="h-3 bg-gradient-to-r from-slate-400 to-slate-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: '100%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance fournisseurs */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ScaleIcon className="h-5 w-5 mr-2 text-slate-600" />
                  Performance Fournisseurs
                </h3>
                
                <div className="space-y-4">
                  {supplierPerformance.map((metric, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-900">{metric.metric}</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          metric.status === 'excellent' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                          metric.status === 'bon' ? 'bg-slate-100 text-slate-700 border border-slate-300' :
                          'bg-slate-200 text-slate-700 border border-slate-400'
                        }`}>
                          {metric.status}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-slate-900">{metric.value}</span>
                        <span className="text-sm text-slate-600">Cible: {metric.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Section Comparatif  - Accessible depuis tous les onglets pour démonstration */}
        {selectedView === 'comparatif-achats' && (
          <>
            {/* Graph animé 1: Évolution Achats vs Ventes en courbes */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200 mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600" />
                📈 Courbe Comparative: Achats vs Ventes ({selectedPeriod === 'jour' ? '6 derniers jours' : selectedPeriod === 'semaine' ? '6 dernières semaines' : '6 mois'})
                  </h3>
                  
              <div className="bg-white rounded-lg p-6 border border-slate-200">
                {/* Légende */}
                <div className="flex items-center justify-center space-x-6 mb-6">
                  <div className="flex items-center">
                    <div className="w-8 h-1.5 bg-red-600 rounded mr-2"></div>
                    <span className="text-sm font-semibold text-slate-900">Achats</span>
                              </div>
                  <div className="flex items-center">
                    <div className="w-8 h-1.5 bg-emerald-600 rounded mr-2"></div>
                    <span className="text-sm font-semibold text-slate-900">Ventes</span>
                            </div>
                              </div>

                {/* Graphique SVG */}
                <div className="relative h-96 bg-slate-50 rounded-lg p-8">
                  <svg className="w-full h-full" viewBox="0 0 700 350" preserveAspectRatio="xMidYMid meet">
                    {/* Grille horizontale */}
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <g key={`grid-${i}`}>
                        <line
                          x1="60"
                          y1={30 + i * 50}
                          x2="660"
                          y2={30 + i * 50}
                          stroke="#e2e8f0"
                          strokeWidth="1.5"
                        />
                        <text
                          x="45"
                          y={35 + i * 50}
                          fill="#64748b"
                          fontSize="13"
                          fontWeight="700"
                          textAnchor="end"
                        >
                          {(5-i) * 150}k
                        </text>
                      </g>
                    ))}

                    {/* Zone remplie Achats (sous la courbe) */}
                    <path
                      d={(() => {
                        const maxVal = 750000;
                        let path = 'M 60 280 ';
                        monthlyTrends.forEach((month: any, i: number) => {
                          const x = 60 + (i * 120);
                          const y = 280 - ((month.achats / maxVal) * 250);
                          path += `L ${x} ${y} `;
                        });
                        path += 'L 660 280 Z';
                        return path;
                      })()}
                      fill="url(#achatsGradient)"
                    />

                    {/* Zone remplie Ventes (sous la courbe) */}
                    <path
                      d={(() => {
                        const maxVal = 750000;
                        let path = 'M 60 280 ';
                        monthlyTrends.forEach((month, i) => {
                          const x = 60 + (i * 120);
                          const y = 280 - ((month.ventes / maxVal) * 250);
                          path += `L ${x} ${y} `;
                        });
                        path += 'L 660 280 Z';
                        return path;
                      })()}
                      fill="url(#ventesGradient)"
                    />

                    {/* Courbe Achats avec animation */}
                    <path
                      d={(() => {
                        const maxVal = 750000;
                        return monthlyTrends.map((month: any, i: number) => {
                          const x = 60 + (i * 120);
                          const y = 280 - ((month.achats / maxVal) * 250);
                          return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                        }).join(' ');
                      })()}
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="drop-shadow-lg"
                      strokeDasharray="2000"
                      strokeDashoffset="2000"
                    >
                      <animate
                        attributeName="strokeDashoffset"
                        from="2000"
                        to="0"
                        dur="2s"
                        fill="freeze"
                      />
                    </path>

                    {/* Courbe Ventes avec animation */}
                    <path
                      d={(() => {
                        const maxVal = 750000;
                        return monthlyTrends.map((month, i) => {
                          const x = 60 + (i * 120);
                          const y = 280 - ((month.ventes / maxVal) * 250);
                          return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                        }).join(' ');
                      })()}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="drop-shadow-lg"
                      strokeDasharray="2000"
                      strokeDashoffset="2000"
                    >
                      <animate
                        attributeName="strokeDashoffset"
                        from="2000"
                        to="0"
                        dur="2s"
                        fill="freeze"
                      />
                    </path>

                    {/* Points Achats avec animation */}
                    {monthlyTrends.map((month, i) => {
                      const x = 60 + (i * 120);
                      const maxVal = 750000;
                      const y = 280 - ((month.achats / maxVal) * 250);
                      return (
                        <g key={`ach-${i}`} className="group">
                          <circle cx={x} cy={y} r="10" fill="#dc2626" className="drop-shadow-md" opacity="0">
                            <animate
                              attributeName="opacity"
                              from="0"
                              to="1"
                              begin={`${0.3 * (i + 1)}s`}
                              dur="0.4s"
                              fill="freeze"
                            />
                          </circle>
                          <circle cx={x} cy={y} r="5" fill="#ffffff" opacity="0">
                            <animate
                              attributeName="opacity"
                              from="0"
                              to="1"
                              begin={`${0.3 * (i + 1)}s`}
                              dur="0.4s"
                              fill="freeze"
                            />
                          </circle>
                          
                          {/* Tooltip au survol */}
                          <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <rect x={x - 55} y={y - 55} width="110" height="40" fill="#dc2626" rx="6" />
                            <text x={x} y={y - 35} fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle">
                              Achats {month.month}
                            </text>
                            <text x={x} y={y - 20} fill="#ffffff" fontSize="13" fontWeight="800" textAnchor="middle">
                              {month.achats.toLocaleString()} DA
                            </text>
                          </g>
                        </g>
                      );
                    })}

                    {/* Points Ventes avec animation */}
                    {monthlyTrends.map((month, i) => {
                      const x = 60 + (i * 120);
                      const maxVal = 750000;
                      const y = 280 - ((month.ventes / maxVal) * 250);
                      return (
                        <g key={`vent-${i}`} className="group">
                          <circle cx={x} cy={y} r="10" fill="#10b981" className="drop-shadow-md" opacity="0">
                            <animate
                              attributeName="opacity"
                              from="0"
                              to="1"
                              begin={`${0.3 * (i + 1) + 0.1}s`}
                              dur="0.4s"
                              fill="freeze"
                            />
                          </circle>
                          <circle cx={x} cy={y} r="5" fill="#ffffff" opacity="0">
                            <animate
                              attributeName="opacity"
                              from="0"
                              to="1"
                              begin={`${0.3 * (i + 1) + 0.1}s`}
                              dur="0.4s"
                              fill="freeze"
                            />
                          </circle>
                          
                          {/* Tooltip au survol */}
                          <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <rect x={x - 55} y={y - 55} width="110" height="40" fill="#10b981" rx="6" />
                            <text x={x} y={y - 35} fill="#ffffff" fontSize="11" fontWeight="700" textAnchor="middle">
                              Ventes {month.month}
                            </text>
                            <text x={x} y={y - 20} fill="#ffffff" fontSize="13" fontWeight="800" textAnchor="middle">
                              {month.ventes.toLocaleString()} DA
                            </text>
                          </g>
                        </g>
                      );
                    })}

                    {/* Labels des mois */}
                    {monthlyTrends.map((month, i) => {
                      const x = 60 + (i * 120);
                      return (
                        <text
                          key={`lbl-${i}`}
                          x={x}
                          y="310"
                          fill="#334155"
                          fontSize="15"
                          fontWeight="800"
                          textAnchor="middle"
                          opacity="0"
                        >
                          {month.month}
                          <animate
                            attributeName="opacity"
                            from="0"
                            to="1"
                            begin={`${0.3 * (i + 1)}s`}
                            dur="0.3s"
                            fill="freeze"
                          />
                        </text>
                      );
                    })}

                    {/* Dégradés */}
                    <defs>
                      <linearGradient id="achatsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#dc2626" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="ventesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                              </div>

                {/* Statistiques récapitulatives */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-slate-200">
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="text-xs font-semibold text-red-600 mb-2">
                      Total Achats ({selectedPeriod === 'jour' ? '6 jours' : selectedPeriod === 'semaine' ? '6 semaines' : '6 mois'})
                            </div>
                    <div className="text-2xl font-bold text-red-700">
                      {monthlyTrends.reduce((sum, m) => sum + m.achats, 0).toLocaleString()} DA
                          </div>
                              </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="text-xs font-semibold text-emerald-600 mb-2">
                      Total Ventes ({selectedPeriod === 'jour' ? '6 jours' : selectedPeriod === 'semaine' ? '6 semaines' : '6 mois'})
                            </div>
                    <div className="text-2xl font-bold text-emerald-700">
                      {monthlyTrends.reduce((sum, m) => sum + m.ventes, 0).toLocaleString()} DA
                            </div>
                          </div>
                  <div className="text-center p-4 bg-slate-100 rounded-lg border border-slate-300">
                    <div className="text-xs font-semibold text-slate-600 mb-2">Ratio Moyen</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {(monthlyTrends.reduce((sum, m) => sum + m.ratio, 0) / monthlyTrends.length).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Graphique circulaire animé - Répartition des achats par catégorie */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200 mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                <ChartPieIcon className="h-5 w-5 mr-2 text-slate-600" />
                🎯 Répartition Détaillée des Achats par Catégorie
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graphique circulaire */}
                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative w-72 h-72">
                      <svg className="w-full h-full transform -rotate-90">
                        {(() => {
                          let currentOffset = 0;
                          const colors = ['#334155', '#475569', '#64748b', '#94a3b8'];
                          return categoryBreakdown.map((cat, idx) => {
                            const circumference = 2 * Math.PI * 110;
                            const strokeLength = (cat.percentage / 100) * circumference;
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
                        <div className="text-4xl font-black text-slate-900">100%</div>
                        <div className="text-sm text-slate-600 font-semibold">Total achats</div>
                      </div>
                    </div>
                  </div>

                  {/* Légende */}
                  <div className="space-y-2">
                    {categoryBreakdown.map((cat, index) => {
                      const colors = ['bg-slate-700', 'bg-slate-600', 'bg-slate-500', 'bg-slate-400'];
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 ${colors[index % colors.length]} rounded-full shadow`}></div>
                            <span className="text-sm font-bold text-slate-900">{cat.category}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-black text-slate-900">{cat.percentage}%</span>
                            <span className="text-xs text-slate-600">({cat.amount.toLocaleString()} DA)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Détails avec barres horizontales animées */}
                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-5 text-lg">Analyse par Catégorie</h4>
                  <div className="space-y-5">
                    {categoryBreakdown.map((cat, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900">{cat.category}</span>
                          <div className="flex items-center space-x-2">
                            {cat.growth === 'up' ? (
                              <TrendingUpIcon className="h-5 w-5 text-emerald-600" />
                            ) : (
                              <TrendingDownIcon className="h-5 w-5 text-red-600" />
                            )}
                            <span className={`text-sm font-black ${cat.growth === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                              {cat.trend > 0 ? '+' : ''}{cat.trend}%
                            </span>
                      </div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-6 shadow-inner relative overflow-hidden">
                          <div 
                            className="h-6 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-end pr-3 transition-all duration-1500 ease-out"
                            style={{ 
                              width: `${cat.percentage}%`,
                              transitionDelay: `${index * 200}ms`
                            }}
                          >
                            <span className="text-xs font-bold text-white">{cat.percentage}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">{cat.amount.toLocaleString()} DA</span>
                          <span className="font-bold text-slate-900">{cat.percentage}% du total</span>
                  </div>
                </div>
              ))}
            </div>
                </div>
              </div>
            </div>

        {/* Évolution des prix par catégorie */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200 mt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                <TrendingUpIcon className="h-5 w-5 mr-2 text-slate-600" />
                Évolution des Prix par Catégorie
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {priceEvolution.map((category, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-4">{category.category}</h4>
                    
                    <div className="space-y-2">
                      {(() => {
                        const months = [
                        { label: 'Jan', value: category.jan },
                        { label: 'Fév', value: category.feb },
                        { label: 'Mar', value: category.mar },
                        { label: 'Avr', value: category.apr },
                        { label: 'Mai', value: category.may },
                        { label: 'Jun', value: category.jun }
                        ];
                        return months.map((month, monthIndex) => (
                        <div key={monthIndex} className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">{month.label}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-slate-900">
                              {month.value.toLocaleString()} DA
                            </span>
                            {monthIndex > 0 && (
                              <div className={`text-xs ${
                                  month.value > months[monthIndex - 1].value ? 'text-red-500' : 'text-emerald-500'
                              }`}>
                                  {month.value > months[monthIndex - 1].value ? '↗' : '↘'}
                              </div>
                            )}
                          </div>
                        </div>
                        ));
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Mouvements récents avec filtres */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              Mouvements Récents - {selectedPeriod === 'jour' ? 'Aujourd\'hui' : selectedPeriod === 'semaine' ? 'Cette semaine' : 'Ce mois'}
              <span className="ml-3 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                {filteredMovements.length} mouvement{filteredMovements.length > 1 ? 's' : ''}
              </span>
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Fournisseur</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-700 uppercase tracking-wider">Montant</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-700 uppercase tracking-wider">Priorité</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredMovements.length > 0 ? (
                  filteredMovements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                        {new Date(movement.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {movement.fournisseur}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {movement.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                        <span className={movement.montant < 0 ? 'text-red-600' : 'text-emerald-600'}>
                          {movement.montant < 0 ? '-' : '+'}{Math.abs(movement.montant).toLocaleString()} DZD
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          movement.statut === 'payé' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                          movement.statut === 'en-attente' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                          'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}>
                          {movement.statut === 'payé' ? '✓ Payé' : 
                           movement.statut === 'en-attente' ? '⏳ En attente' : 
                           '✓ Terminé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          movement.priorite === 'critique' ? 'bg-red-100 text-red-700 border border-red-300' :
                          movement.priorite === 'haute' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                          'bg-slate-100 text-slate-600 border border-slate-300'
                        }`}>
                          {movement.priorite === 'critique' ? '🔴 Critique' :
                           movement.priorite === 'haute' ? '⚠️ Haute' :
                           '○ Normale'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center">
                        <InformationCircleIcon className="h-12 w-12 text-slate-400 mb-3" />
                        <p className="text-lg font-medium">Aucun mouvement trouvé</p>
                        <p className="text-sm">Essayez de modifier les filtres pour voir plus de résultats</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredMovements.length > 0 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <div>
                  Affichage de <span className="font-semibold text-slate-900">{filteredMovements.length}</span> mouvement{filteredMovements.length > 1 ? 's' : ''} sur <span className="font-semibold text-slate-900">{allMovements.length}</span> au total
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-900">
                    Total: {filteredMovements.reduce((sum, m) => sum + m.montant, 0).toLocaleString()} DZD
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions enrichies */}
        <div className="mt-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Actions & Exports</h3>
              <p className="text-sm text-slate-600">Générez et partagez vos rapports d'achats</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors flex items-center shadow-sm">
                <EyeIcon className="h-4 w-4 mr-2" />
                Rapport complet
              </button>
              <button className="px-4 py-2 bg-white text-slate-700 rounded-md hover:bg-slate-50 transition-colors flex items-center border border-slate-300 shadow-sm">
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export PDF
              </button>
              <button className="px-4 py-2 bg-white text-slate-700 rounded-md hover:bg-slate-50 transition-colors flex items-center border border-slate-300 shadow-sm">
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Export Excel
              </button>
              <button className="px-4 py-2 bg-white text-slate-700 rounded-md hover:bg-slate-50 transition-colors flex items-center border border-slate-300 shadow-sm">
                <ShareIcon className="h-4 w-4 mr-2" />
                Partager
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchatsFournisseurs;


