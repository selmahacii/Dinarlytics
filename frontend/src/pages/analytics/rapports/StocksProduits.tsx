import React, { useState } from 'react';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import {
  CubeIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  ShareIcon,
  EyeIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  StarIcon,
  ScaleIcon,
  ChartPieIcon,
  BellIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  CalendarIcon,
  SparklesIcon,
  ClipboardDocumentListIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';
// ...existing code...

const StocksProduits: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, companyData, formatCurrency } = useApp();
  const [selectedView, setSelectedView] = useState('etat-stocks');

  // Fonction pour lancer un inventaire
  const handleLaunchInventory = () => {
    // Naviguer vers la page d'inventaire avec un paramètre pour lancer un nouvel inventaire
    navigate('/inventaire?action=start-inventory');
  };

  // Fonction pour générer le rapport de rotation des produits
  const handleGenerateRotationReport = () => {
    try {
      // Récupérer les données de rotation
      const reportData = {
        rotationMoyenne: companyData ? 8.5 : 0,
        nombreArticles: companyData ? Math.max(15, Math.floor(companyData.clientsCount * 0.6)) : 0,
        valeurStock: companyData ? Math.round(companyData.revenueMonth * 0.35) : 0,
        dateGeneration: new Date().toISOString()
      };

      // Créer le contenu du rapport
      const reportContent = `
RAPPORT DE ROTATION DES PRODUITS
=================================

Date de génération: ${new Date().toLocaleString('fr-FR')}

RÉSUMÉ
------
Rotation moyenne: ${reportData.rotationMoyenne} fois/an
Nombre d'articles: ${reportData.nombreArticles}
Valeur du stock: ${formatCurrency(reportData.valeurStock || 0)}

ANALYSE DE ROTATION
-------------------
Ce rapport analyse la rotation de vos produits en stock.

Dans une application réelle, ce rapport inclurait:
- Rotation par produit
- Produits à rotation lente
- Produits à rotation rapide
- Recommandations d'optimisation
- Analyse ABC
- Prévisions de réapprovisionnement

---
Généré par Dinarlytics
      `.trim();

      // Créer et télécharger le fichier
      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rapport_Rotation_Produits_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      alert('Erreur lors de la génération du rapport. Veuillez réessayer.');
    }
  };

  // Fonction pour gérer les articles
  const handleManageArticles = () => {
    // Naviguer vers la page de gestion des articles
    navigate('/articles');
  };

  // ========================================
  // INTERFACE EURL MICRO-ENTREPRISE
  // ========================================
  if (user && user.segment === 'micro' && user.companyType === 'eurl' && companyData) {

    // Données adaptées pour EURL
    const valeurStock = Math.round(companyData.revenueMonth * 0.35); // 35% du CA en stock
    const nombreArticles = Math.max(15, Math.floor(companyData.clientsCount * 0.6));
    const rotationMoyenne = 8.5; // fois/an
    const articlesRuptureStock = 2;

    // Top 5 produits
    const topProduits = [
      { nom: 'Produit A - Best Seller', stock: Math.round(nombreArticles * 0.25), valeur: Math.round(valeurStock * 0.30), rotation: 12 },
      { nom: 'Produit B', stock: Math.round(nombreArticles * 0.20), valeur: Math.round(valeurStock * 0.25), rotation: 10 },
      { nom: 'Produit C', stock: Math.round(nombreArticles * 0.18), valeur: Math.round(valeurStock * 0.20), rotation: 9 },
      { nom: 'Produit D', stock: Math.round(nombreArticles * 0.15), valeur: Math.round(valeurStock * 0.15), rotation: 7 },
      { nom: 'Produit E', stock: Math.round(nombreArticles * 0.12), valeur: Math.round(valeurStock * 0.10), rotation: 6 }
    ];

    // Répartition stock par catégorie
    const stockParCategorie = [
      { categorie: 'Catégorie A', valeur: Math.round(valeurStock * 0.45), part: 45, couleur: 'from-emerald-500 to-teal-500' },
      { categorie: 'Catégorie B', valeur: Math.round(valeurStock * 0.30), part: 30, couleur: 'from-blue-500 to-indigo-500' },
      { categorie: 'Catégorie C', valeur: Math.round(valeurStock * 0.25), part: 25, couleur: 'from-slate-600 to-slate-800' }
    ];

    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white p-8 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <CubeIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{t('nav.stock_reports')}</h1>
                <p className="text-slate-300 text-lg mt-1">{t('stocks_reports.rotation_report')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 KPIs Principaux */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <CurrencyDollarIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Valeur Stock</h3>
            <p className="text-3xl font-extrabold text-slate-900">{formatCurrency(valeurStock)}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-emerald-600 font-semibold">📦 Actuel</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <CubeIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Articles en Stock</h3>
            <p className="text-3xl font-extrabold text-slate-900">{nombreArticles}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-600 font-semibold">📋 Références</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <ArrowPathIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Rotation Moyenne</h3>
            <p className="text-3xl font-extrabold text-slate-900">{rotationMoyenne}x</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-emerald-600 font-semibold">✅ Par an</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <ExclamationTriangleIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Ruptures Stock</h3>
            <p className="text-3xl font-extrabold text-slate-900">{articlesRuptureStock}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-amber-600 font-semibold">⚠️ Articles</p>
            </div>
          </div>
        </div>

        {/* Top 5 Produits les Plus Vendus */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mr-3">
              <StarIcon className="h-5 w-5 text-white" />
            </div>
            Top 5 Produits les Plus Vendus
          </h2>
          <div className="space-y-3">
            {topProduits.map((produit, idx) => (
              <div key={idx} className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{produit.nom}</p>
                      <p className="text-sm text-slate-600">Stock : {produit.stock} unités • Rotation : {produit.rotation}x/an</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-emerald-600">{formatCurrency(produit.valeur)}</p>
                    <p className="text-xs text-slate-500">Valeur</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition du Stock par Catégorie */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-300 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg mr-3">
              <ChartPieIcon className="h-5 w-5 text-white" />
            </div>
            Répartition du Stock par Catégorie
          </h2>
          <div className="space-y-4">
            {stockParCategorie.map((cat, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border-2 border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-slate-900">{cat.categorie}</p>
                  <p className="text-sm font-bold text-emerald-600">{cat.part}%</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${cat.couleur} rounded-full transition-all duration-500`}
                    style={{ width: `${cat.part}%` }}
                  ></div>
                </div>
                <p className="text-right text-sm text-slate-600 mt-1">{formatCurrency(cat.valeur)}</p>
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
                <BellIcon className="h-5 w-5 text-white" />
              </div>
              Alertes Stock
            </h3>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg border border-red-300">
                <p className="text-sm font-bold text-red-700">🚨 2 articles en rupture de stock</p>
                <p className="text-xs text-slate-600 mt-1">Réapprovisionner rapidement</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-amber-300">
                <p className="text-sm font-bold text-amber-700">⚠️ 3 produits à rotation faible</p>
                <p className="text-xs text-slate-600 mt-1">Considérer promotion ou déstockage</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-300">
                <p className="text-sm font-bold text-slate-700">📦 Inventaire mensuel recommandé</p>
                <p className="text-xs text-slate-600 mt-1">Dernière mise à jour : il y a 15 jours</p>
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
              <button
                onClick={handleLaunchInventory}
                className="w-full p-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl font-bold hover:from-slate-800 hover:to-black shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ClipboardDocumentListIcon className="h-5 w-5" />
                📝 Lancer un inventaire
              </button>
              <button
                onClick={handleGenerateRotationReport}
                className="w-full p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ChartBarIcon className="h-5 w-5" />
                📊 Rapport rotation produits
              </button>
              <button
                onClick={handleManageArticles}
                className="w-full p-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:border-emerald-400 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <TagIcon className="h-5 w-5" />
                🏷️ Gérer les articles
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
      id: 'etat-stocks',
      title: t('stocks_reports.stock_state'),
      icon: CubeIcon,
      description: t('stocks_reports.stock_state_desc'),
      indicators: [
        t('stocks_reports.stock_state_indicators.total_value'),
        t('stocks_reports.stock_state_indicators.turnover_rate'),
        t('stocks_reports.stock_state_indicators.active_refs')
      ]
    },
    {
      id: 'alertes-stocks',
      title: t('stocks_reports.stock_alerts'),
      icon: ExclamationTriangleIcon,
      description: t('stocks_reports.stock_alerts_desc'),
      indicators: [
        t('stocks_reports.stock_alerts_indicators.dormant'),
        t('stocks_reports.stock_alerts_indicators.low_stock'),
        t('stocks_reports.stock_alerts_indicators.overstock'),
        t('stocks_reports.stock_alerts_indicators.discrepancy')
      ]
    },
    {
      id: 'performance-produits',
      title: t('stocks_reports.product_performance'),
      icon: ArrowTrendingUpIcon,
      description: t('stocks_reports.product_performance_desc'),
      indicators: [
        t('stocks_reports.product_performance_indicators.margins'),
        t('stocks_reports.product_performance_indicators.profitability'),
        t('stocks_reports.product_performance_indicators.curve')
      ]
    }
  ];

  const currentView = views.find(v => v.id === selectedView) || views[0];

  // Données de démonstration enrichies
  const stockData = {
    valeurTotale: 2850000,
    tauxRotation: 6.2,
    produitsRupture: 12,
    produitsSurstock: 8,
    valeurImmobilisee: 1250000,
    produitsTotal: 245,
    produitsActifs: 198,
    produitsDormants: 47,
    tauxSatisfaction: 94.5,
    delaiMoyenReappro: 3.2,
    precisionInventaire: 98.2
  };

  const topProducts = [
    {
      name: 'Smartphone Galaxy S24',
      stock: 45,
      valeur: 450000,
      rotation: 8.5,
      category: 'Électronique',
      seuilMin: 10,
      seuilMax: 50,
      derniereVente: '2024-01-15',
      marge: 25.5,
      statut: 'optimal',
      trend: 'up',
      venteMensuelle: 12,
      stockage: 'entrepôt A'
    },
    {
      name: 'Laptop Dell XPS 13',
      stock: 23,
      valeur: 380000,
      rotation: 6.2,
      category: 'Informatique',
      seuilMin: 5,
      seuilMax: 25,
      derniereVente: '2024-01-14',
      marge: 22.8,
      statut: 'faible',
      trend: 'down',
      venteMensuelle: 8,
      stockage: 'entrepôt B'
    },
    {
      name: 'Tablette iPad Pro',
      stock: 67,
      valeur: 320000,
      rotation: 9.1,
      category: 'Électronique',
      seuilMin: 15,
      seuilMax: 40,
      derniereVente: '2024-01-15',
      marge: 28.3,
      statut: 'surstock',
      trend: 'up',
      venteMensuelle: 15,
      stockage: 'entrepôt A'
    },
    {
      name: 'Écouteurs AirPods',
      stock: 89,
      valeur: 180000,
      rotation: 12.3,
      category: 'Accessoires',
      seuilMin: 20,
      seuilMax: 60,
      derniereVente: '2024-01-15',
      marge: 35.2,
      statut: 'surstock',
      trend: 'up',
      venteMensuelle: 22,
      stockage: 'entrepôt C'
    },
    {
      name: 'Montre Apple Watch',
      stock: 34,
      valeur: 150000,
      rotation: 7.8,
      category: 'Accessoires',
      seuilMin: 8,
      seuilMax: 30,
      derniereVente: '2024-01-13',
      marge: 30.1,
      statut: 'optimal',
      trend: 'stable',
      venteMensuelle: 9,
      stockage: 'entrepôt B'
    }
  ];

  // Données pour alertes & anomalies
  const stockAlerts = [
    {
      type: 'rupture',
      severity: 'critical',
      product: 'iPhone 15 Pro',
      currentStock: 2,
      minThreshold: 10,
      daysWithoutStock: 3,
      estimatedLoss: 45000,
      action: 'Commande urgente requise'
    },
    {
      type: 'surstock',
      severity: 'warning',
      product: 'MacBook Air M2',
      currentStock: 45,
      maxThreshold: 25,
      daysInSurplus: 15,
      immobilisedValue: 125000,
      action: 'Promotion recommandée'
    },
    {
      type: 'dormant',
      severity: 'info',
      product: 'iPad Mini 6',
      currentStock: 12,
      daysWithoutSale: 67,
      lastSale: '2024-11-10',
      action: 'Révision prix ou liquidation'
    },
    {
      type: 'anomalie',
      severity: 'critical',
      product: 'AirPods Pro 2',
      discrepancy: -8,
      expectedStock: 25,
      actualStock: 17,
      action: 'Inventaire physique requis'
    }
  ];

  // Données pour performance produits
  const productPerformance = [
    {
      product: 'Smartphone Galaxy S24',
      sales: 145,
      revenue: 1450000,
      margin: 25.5,
      stockTurnover: 8.5,
      profitability: 'excellent',
      trend: 'up',
      marketShare: 12.3,
      customerSatisfaction: 4.7
    },
    {
      product: 'Laptop Dell XPS 13',
      sales: 89,
      revenue: 890000,
      margin: 22.8,
      stockTurnover: 6.2,
      profitability: 'good',
      trend: 'down',
      marketShare: 8.7,
      customerSatisfaction: 4.5
    },
    {
      product: 'Tablette iPad Pro',
      sales: 156,
      revenue: 780000,
      margin: 28.3,
      stockTurnover: 9.1,
      profitability: 'excellent',
      trend: 'up',
      marketShare: 15.2,
      customerSatisfaction: 4.8
    }
  ];

  // Évolution des stocks par catégorie
  const categoryEvolution = [
    { category: 'Électronique', current: 850000, previous: 780000, trend: 9.0, growth: 'up' },
    { category: 'Informatique', current: 620000, previous: 650000, trend: -4.6, growth: 'down' },
    { category: 'Accessoires', current: 380000, previous: 350000, trend: 8.6, growth: 'up' },
    { category: 'Mobilier', current: 280000, previous: 290000, trend: -3.4, growth: 'down' }
  ];

  // Analyse ABC des produits
  const abcAnalysis = [
    { category: 'A', products: 25, value: 1800000, percentage: 63.2, description: t('stocks_reports.abc_analysis.cat_a_desc') },
    { category: 'B', products: 45, value: 750000, percentage: 26.3, description: t('stocks_reports.abc_analysis.cat_b_desc') },
    { category: 'C', products: 175, value: 300000, percentage: 10.5, description: t('stocks_reports.abc_analysis.cat_c_desc') }
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <CubeIcon className="h-8 w-8 mr-3 text-slate-600" />
              {t('nav.stock_reports')}
            </h1>
            <p className="text-slate-600 mt-1">{t('stocks_reports.rotation_report')}</p>
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
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${selectedView === view.id
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
          <currentView.icon className="h-6 w-6 text-slate-600" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{currentView.title}</h2>
            <p className="text-sm text-slate-600">{currentView.description}</p>
          </div>
        </div>

        {/* Indicateurs clés enrichis - Adapt to each view */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 flex items-center">
                <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                Valeur totale
              </span>
              <div className="flex items-center text-sm font-medium text-emerald-600">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                +5.2%
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(stockData.valeurTotale)}
            </div>
            <div className="text-xs text-slate-500 mt-1">stock actuel</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 flex items-center">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                Taux rotation
              </span>
              <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {stockData.tauxRotation}x
            </div>
            <div className="text-xs text-slate-500 mt-1">par an</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 flex items-center">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                Ruptures
              </span>
              <XCircleIcon className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-600">
              {stockData.produitsRupture}
            </div>
            <div className="text-xs text-slate-500 mt-1">produits</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 flex items-center">
                <CubeIcon className="h-4 w-4 mr-1" />
                Surstock
              </span>
              <ExclamationCircleIcon className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600">
              {stockData.produitsSurstock}
            </div>
            <div className="text-xs text-slate-500 mt-1">produits</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 flex items-center">
                <ScaleIcon className="h-4 w-4 mr-1" />
                Produits actifs
              </span>
              <InformationCircleIcon className="h-4 w-4 text-cyan-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {stockData.produitsActifs}
            </div>
            <div className="text-xs text-slate-500 mt-1">sur {stockData.produitsTotal}</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                Précision inventaire
              </span>
              <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {stockData.precisionInventaire}%
            </div>
            <div className="text-xs text-slate-500 mt-1">exactitude</div>
          </div>
        </div>

        {/* Contenu dynamique selon la vue */}
        <div className="space-y-8">
          {/* État des stocks */}
          {selectedView === 'etat-stocks' && (
            <>
              {/* Top produits avec analyses détaillées */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                    <StarIcon className="h-5 w-5 mr-2 text-slate-600" />
                    Analyse Détaillée des Produits
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">Stock moyen:</span>
                    <div className="flex items-center px-2 py-1 bg-slate-200 text-slate-700 rounded-full text-sm font-medium">
                      <CubeIcon className="h-3 w-3 mr-1" />
                      {Math.round(topProducts.reduce((sum, p) => sum + p.stock, 0) / topProducts.length)} unités
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {topProducts.map((product, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{product.name}</div>
                            <div className="text-sm text-slate-600">{product.category}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`flex items-center mb-1 ${product.statut === 'optimal' ? 'text-emerald-600' :
                              product.statut === 'faible' ? 'text-red-600' :
                                'text-amber-600'
                            }`}>
                            {product.trend === 'up' ? (
                              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                            ) : product.trend === 'down' ? (
                              <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                            ) : (
                              <div className="h-4 w-4 bg-slate-400 rounded-full mr-1"></div>
                            )}
                            <span className="text-xs font-medium">{product.statut}</span>
                          </div>
                          <div className="text-xs text-slate-500">Stock: {product.stock} unités</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Valeur stock</div>
                          <div className="font-bold text-slate-900">{formatCurrency(product.valeur)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Rotation</div>
                          <div className="font-bold text-slate-900">{product.rotation}x/an</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs mb-4">
                        <div className="bg-slate-50 rounded p-2 text-center">
                          <div className="font-medium text-slate-900">{product.marge}%</div>
                          <div className="text-slate-600">Marge</div>
                        </div>
                        <div className="bg-slate-50 rounded p-2 text-center">
                          <div className="font-medium text-slate-900">{product.venteMensuelle}</div>
                          <div className="text-slate-600">Ventes/mois</div>
                        </div>
                        <div className="bg-slate-50 rounded p-2 text-center">
                          <div className="font-medium text-slate-900">{product.stockage}</div>
                          <div className="text-slate-600">Entrepôt</div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">Dernière vente:</span>
                          <span className="font-medium text-slate-900">{product.derniereVente}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="text-slate-600">Seuils:</span>
                          <span className="font-medium text-slate-900">
                            {product.seuilMin}-{product.seuilMax}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graphique de rotation des stocks */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ArrowPathIcon className="h-5 w-5 mr-2 text-slate-600" />
                  🔄 Taux de Rotation des Stocks par Produit
                </h3>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="space-y-4">
                    {topProducts.slice(0, 5).map((product, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="text-sm font-bold text-slate-900">{product.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-black text-slate-900">{product.rotation}x/an</span>
                            <div className={`px-2 py-1 rounded-full text-xs font-bold ${product.rotation > 7 ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                                product.rotation > 4 ? 'bg-slate-100 text-slate-700 border border-slate-300' :
                                  'bg-slate-200 text-slate-700 border border-slate-400'
                              }`}>
                              {product.rotation > 7 ? 'Rapide' : product.rotation > 4 ? 'Normal' : 'Lent'}
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-4 shadow-inner">
                          <div
                            className={`h-4 rounded-full transition-all duration-1500 ease-out flex items-center justify-end pr-3 ${product.rotation > 7 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                                'bg-gradient-to-r from-slate-600 to-slate-700'
                              }`}
                            style={{
                              width: `${(product.rotation / 10) * 100}%`,
                              transitionDelay: `${index * 100}ms`
                            }}
                          >
                            <span className="text-xs font-bold text-white">{product.rotation}x</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">Stock: {product.stock} unités</span>
                          <span className="text-slate-600">Ventes/mois: {product.venteMensuelle}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Évolution par catégorie */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ChartPieIcon className="h-5 w-5 mr-2 text-slate-600" />
                  📊 Évolution des Stocks par Catégorie
                </h3>

                <div className="space-y-4">
                  {categoryEvolution.map((category, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 bg-slate-${700 - index * 100} rounded-full`}></div>
                          <span className="font-semibold text-slate-900">{category.category}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <div className="font-bold text-slate-900">{formatCurrency(category.current)}</div>
                            <div className="text-sm text-slate-600">Actuel</div>
                          </div>
                          <div className="flex items-center">
                            {category.growth === 'up' ? (
                              <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
                            ) : (
                              <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className={`text-sm font-medium ${category.growth === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                              {category.trend > 0 ? '+' : ''}{category.trend}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full bg-slate-200 rounded-full h-4">
                        <div
                          className={`h-4 bg-slate-${700 - index * 100} rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2`}
                          style={{ width: `${(category.current / 1000000) * 100}%` }}
                        >
                          <span className="text-xs text-white font-medium">
                            {Math.round((category.current / 1000000) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graphique valeur immobilisée */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2 text-slate-600" />
                  💎 Valeur Immobilisée par Catégorie
                </h3>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  {/* Graphique en barres verticales */}
                  <div className="relative h-80 bg-slate-50 rounded-lg p-8">
                    <svg className="w-full h-full" viewBox="0 0 700 300" preserveAspectRatio="xMidYMid meet">
                      {/* Grille horizontale */}
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <g key={i}>
                          <line x1="60" y1={30 + i * 45} x2="660" y2={30 + i * 45} stroke="#e2e8f0" strokeWidth="1.5" />
                          <text x="45" y={35 + i * 45} fill="#64748b" fontSize="12" fontWeight="700" textAnchor="end">
                            {(5 - i) * 170}k
                          </text>
                        </g>
                      ))}

                      {/* Barres verticales animées */}
                      {categoryEvolution.map((cat, i) => {
                        const x = 120 + (i * 130);
                        const maxVal = 850000;
                        const height = (cat.current / maxVal) * 225;
                        return (
                          <g key={i}>
                            <rect
                              x={x}
                              y={255 - height}
                              width="80"
                              height="0"
                              fill="url(#catGradient)"
                              rx="4"
                            >
                              <animate
                                attributeName="height"
                                from="0"
                                to={height}
                                begin={`${i * 0.2}s`}
                                dur="1s"
                                fill="freeze"
                              />
                              <animate
                                attributeName="y"
                                from="255"
                                to={255 - height}
                                begin={`${i * 0.2}s`}
                                dur="1s"
                                fill="freeze"
                              />
                            </rect>

                            {/* Valeur au-dessus */}
                            <text
                              x={x + 40}
                              y={240 - height}
                              fill="#334155"
                              fontSize="13"
                              fontWeight="800"
                              textAnchor="middle"
                              opacity="0"
                            >
                              {(cat.current / 1000).toFixed(0)}k
                              <animate attributeName="opacity" from="0" to="1" begin={`${i * 0.2 + 0.8}s`} dur="0.3s" fill="freeze" />
                            </text>

                            {/* Label catégorie */}
                            <text
                              x={x + 40}
                              y="280"
                              fill="#334155"
                              fontSize="13"
                              fontWeight="700"
                              textAnchor="middle"
                            >
                              {cat.category}
                            </text>
                          </g>
                        );
                      })}

                      {/* Dégradé */}
                      <defs>
                        <linearGradient id="catGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#334155" />
                          <stop offset="100%" stopColor="#64748b" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Statistiques */}
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t-2 border-slate-200">
                    <div className="text-center p-4 bg-slate-100 rounded-lg border border-slate-300">
                      <div className="text-xs font-semibold text-slate-600 mb-2">Valeur totale immobilisée</div>
                      <div className="text-2xl font-bold text-slate-900">
                        {formatCurrency(categoryEvolution.reduce((sum, c) => sum + c.current, 0))}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <div className="text-xs font-semibold text-emerald-600 mb-2">Catégorie dominante</div>
                      <div className="text-lg font-bold text-emerald-700">
                        {[...categoryEvolution].sort((a, b) => b.current - a.current)[0].category}
                      </div>
                      <div className="text-xs text-emerald-600">
                        {(([...categoryEvolution].sort((a, b) => b.current - a.current)[0].current / categoryEvolution.reduce((sum, c) => sum + c.current, 0)) * 100).toFixed(1)}% du total
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analyse ABC avec graphique */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600" />
                  📊 Analyse ABC des Produits
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Graphique circulaire ABC */}
                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative w-64 h-64">
                        <svg className="w-full h-full transform -rotate-90">
                          {(() => {
                            let currentOffset = 0;
                            const colors = ['#334155', '#64748b', '#94a3b8'];
                            return abcAnalysis.map((cat, idx) => {
                              const circumference = 2 * Math.PI * 100;
                              const strokeLength = (cat.percentage / 100) * circumference;
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
                          <div className="text-3xl font-black text-slate-900">{stockData.produitsTotal}</div>
                          <div className="text-sm text-slate-600 font-semibold">Produits</div>
                        </div>
                      </div>
                    </div>

                    {/* Légende */}
                    <div className="space-y-2">
                      {abcAnalysis.map((cat, index) => {
                        const colors = ['bg-slate-700', 'bg-slate-500', 'bg-slate-400'];
                        return (
                          <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                            <div className="flex items-center space-x-2">
                              <div className={`w-4 h-4 ${colors[index]} rounded-full shadow`}></div>
                              <span className="text-sm font-bold text-slate-900">Catégorie {cat.category}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-black text-slate-900">{cat.percentage}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Détails par catégorie */}
                  <div className="space-y-4">
                    {abcAnalysis.map((category, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-full flex items-center justify-center text-xl font-bold">
                              {category.category}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{category.description}</div>
                              <div className="text-sm text-slate-600">{category.products} produits • {category.percentage}%</div>
                            </div>
                          </div>
                        </div>

                        <div className="w-full bg-slate-200 rounded-full h-4">
                          <div
                            className="h-4 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full transition-all duration-1500 ease-out flex items-center justify-end pr-2"
                            style={{
                              width: `${category.percentage}%`,
                              transitionDelay: `${index * 200}ms`
                            }}
                          >
                            <span className="text-xs text-white font-bold">{category.percentage}%</span>
                          </div>
                        </div>

                        <div className="mt-3 text-lg font-bold text-slate-900 text-center">
                          {formatCurrency(category.value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Alertes & Anomalies */}
          {selectedView === 'alertes-anomalies' && (
            <div className="space-y-6">
              {/* Statistiques des alertes */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border-l-4 border-red-500 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                    <span className="text-xs font-bold text-red-600 uppercase">Critique</span>
                  </div>
                  <div className="text-3xl font-black text-red-700 mb-1">
                    {stockAlerts.filter(a => a.severity === 'critical').length}
                  </div>
                  <div className="text-sm text-red-600 font-medium">Alertes critiques</div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-5 border-l-4 border-amber-500 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <ExclamationCircleIcon className="h-8 w-8 text-amber-600" />
                    <span className="text-xs font-bold text-amber-600 uppercase">Attention</span>
                  </div>
                  <div className="text-3xl font-black text-amber-700 mb-1">
                    {stockAlerts.filter(a => a.severity === 'warning').length}
                  </div>
                  <div className="text-sm text-amber-600 font-medium">Avertissements</div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-5 border-l-4 border-slate-500 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <ClockIcon className="h-8 w-8 text-slate-600" />
                    <span className="text-xs font-bold text-slate-600 uppercase">Dormants</span>
                  </div>
                  <div className="text-3xl font-black text-slate-700 mb-1">
                    {stockData.produitsDormants}
                  </div>
                  <div className="text-sm text-slate-600 font-medium">Produits dormants</div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-5 border-l-4 border-emerald-500 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-600 uppercase">OK</span>
                  </div>
                  <div className="text-3xl font-black text-emerald-700 mb-1">
                    {stockData.produitsActifs - stockData.produitsDormants}
                  </div>
                  <div className="text-sm text-emerald-600 font-medium">Sans problème</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <BellIcon className="h-5 w-5 mr-2 text-slate-600" />
                  Alertes & Anomalies Actives
                </h3>

                <div className="space-y-4">
                  {stockAlerts.map((alert, index) => (
                    <div key={index} className={`bg-white rounded-lg p-4 border-l-4 ${alert.severity === 'critical' ? 'border-red-500 bg-red-50' :
                        alert.severity === 'warning' ? 'border-amber-500 bg-amber-50' :
                          'border-cyan-500 bg-cyan-50'
                      } border border-slate-200`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                              alert.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
                                'bg-cyan-100 text-cyan-600'
                            }`}>
                            {alert.type === 'rupture' && <ExclamationTriangleIcon className="h-4 w-4" />}
                            {alert.type === 'surstock' && <CubeIcon className="h-4 w-4" />}
                            {alert.type === 'dormant' && <ClockIcon className="h-4 w-4" />}
                            {alert.type === 'anomalie' && <ExclamationCircleIcon className="h-4 w-4" />}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{alert.product}</div>
                            <div className="text-sm text-slate-600 capitalize">{alert.type}</div>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                            alert.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                              'bg-cyan-100 text-cyan-700'
                          }`}>
                          {alert.severity}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        {alert.type === 'rupture' && (
                          <>
                            <div>
                              <div className="text-xs text-slate-500">Stock actuel</div>
                              <div className="font-bold text-red-600">{alert.currentStock}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Seuil minimum</div>
                              <div className="font-bold text-slate-900">{alert.minThreshold}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Jours sans stock</div>
                              <div className="font-bold text-slate-900">{alert.daysWithoutStock}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Perte estimée</div>
                              <div className="font-bold text-slate-900">{alert.estimatedLoss ? formatCurrency(alert.estimatedLoss) : 'N/A'}</div>
                            </div>
                          </>
                        )}
                        {alert.type === 'surstock' && (
                          <>
                            <div>
                              <div className="text-xs text-slate-500">Stock actuel</div>
                              <div className="font-bold text-amber-600">{alert.currentStock}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Seuil maximum</div>
                              <div className="font-bold text-slate-900">{alert.maxThreshold}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Jours en surplus</div>
                              <div className="font-bold text-slate-900">{alert.daysInSurplus}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Valeur immobilisée</div>
                              <div className="font-bold text-slate-900">{alert.immobilisedValue ? formatCurrency(alert.immobilisedValue) : 'N/A'}</div>
                            </div>
                          </>
                        )}
                        {alert.type === 'dormant' && (
                          <>
                            <div>
                              <div className="text-xs text-slate-500">Stock actuel</div>
                              <div className="font-bold text-cyan-600">{alert.currentStock}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Jours sans vente</div>
                              <div className="font-bold text-slate-900">{alert.daysWithoutSale}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Dernière vente</div>
                              <div className="font-bold text-slate-900">{alert.lastSale}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Statut</div>
                              <div className="font-bold text-slate-900">Dormant</div>
                            </div>
                          </>
                        )}
                        {alert.type === 'anomalie' && (
                          <>
                            <div>
                              <div className="text-xs text-slate-500">Écart</div>
                              <div className="font-bold text-red-600">{alert.discrepancy}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Stock attendu</div>
                              <div className="font-bold text-slate-900">{alert.expectedStock}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Stock réel</div>
                              <div className="font-bold text-slate-900">{alert.actualStock}</div>
                            </div>
                            <div>
                              <div className="text-xs text-slate-500">Type</div>
                              <div className="font-bold text-slate-900">Écart inventaire</div>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-900">Action recommandée:</span>
                          <span className="text-sm text-slate-600">{alert.action}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graphique de distribution des alertes par type */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ChartPieIcon className="h-5 w-5 mr-2 text-slate-600" />
                  📊 Distribution des Alertes par Type
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Graphique circulaire */}
                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative w-64 h-64">
                        <svg className="w-full h-full transform -rotate-90">
                          {(() => {
                            const alertTypes = [
                              { type: 'Rupture', count: stockAlerts.filter(a => a.type === 'rupture').length, color: '#ef4444' },
                              { type: 'Surstock', count: stockAlerts.filter(a => a.type === 'surstock').length, color: '#f59e0b' },
                              { type: 'Dormant', count: stockAlerts.filter(a => a.type === 'dormant').length, color: '#64748b' },
                              { type: 'Anomalie', count: stockAlerts.filter(a => a.type === 'anomalie').length, color: '#94a3b8' }
                            ];
                            const total = alertTypes.reduce((sum, t) => sum + t.count, 0);
                            let currentOffset = 0;

                            return alertTypes.map((alertType, idx) => {
                              const circumference = 2 * Math.PI * 100;
                              const percentage = (alertType.count / total) * 100;
                              const strokeLength = (percentage / 100) * circumference;
                              const circle = (
                                <circle
                                  key={idx}
                                  cx="128"
                                  cy="128"
                                  r="100"
                                  fill="none"
                                  stroke={alertType.color}
                                  strokeWidth="40"
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
                          <div className="text-4xl font-black text-slate-900">{stockAlerts.length}</div>
                          <div className="text-sm text-slate-600 font-semibold">Alertes</div>
                        </div>
                      </div>
                    </div>

                    {/* Légende */}
                    <div className="space-y-2">
                      {[
                        { type: 'Rupture', count: stockAlerts.filter(a => a.type === 'rupture').length, color: 'bg-red-500' },
                        { type: 'Surstock', count: stockAlerts.filter(a => a.type === 'surstock').length, color: 'bg-amber-500' },
                        { type: 'Dormant', count: stockAlerts.filter(a => a.type === 'dormant').length, color: 'bg-slate-500' },
                        { type: 'Anomalie', count: stockAlerts.filter(a => a.type === 'anomalie').length, color: 'bg-slate-400' }
                      ].map((alertType, index) => {
                        const percentage = ((alertType.count / stockAlerts.length) * 100).toFixed(1);
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 ${alertType.color} rounded-full shadow`}></div>
                              <span className="text-sm font-bold text-slate-900">{alertType.type}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-black text-slate-900">{alertType.count}</span>
                              <span className="text-xs text-slate-600">({percentage}%)</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Statistiques détaillées */}
                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-5 text-lg">Analyse par Type d'Alerte</h4>
                    <div className="space-y-5">
                      {[
                        {
                          type: 'Rupture de stock',
                          count: stockAlerts.filter(a => a.type === 'rupture').length,
                          impact: 'Perte de ventes potentielles',
                          urgence: 'Critique',
                          color: 'red'
                        },
                        {
                          type: 'Surstock',
                          count: stockAlerts.filter(a => a.type === 'surstock').length,
                          impact: 'Immobilisation de capital',
                          urgence: 'Moyen',
                          color: 'amber'
                        },
                        {
                          type: 'Produits dormants',
                          count: stockAlerts.filter(a => a.type === 'dormant').length,
                          impact: 'Obsolescence probable',
                          urgence: 'Faible',
                          color: 'slate'
                        },
                        {
                          type: 'Anomalie inventaire',
                          count: stockAlerts.filter(a => a.type === 'anomalie').length,
                          impact: 'Écarts de gestion',
                          urgence: 'Moyen',
                          color: 'slate'
                        }
                      ].map((stat, index) => {
                        const percentage = ((stat.count / stockAlerts.length) * 100).toFixed(0);
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm font-bold text-slate-900">{stat.type}</span>
                                <div className="text-xs text-slate-600">{stat.impact}</div>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-xs font-bold ${stat.urgence === 'Critique' ? 'bg-red-100 text-red-700 border border-red-300' :
                                  stat.urgence === 'Moyen' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                                    'bg-slate-100 text-slate-700 border border-slate-300'
                                }`}>
                                {stat.urgence}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-full bg-slate-200 rounded-full h-4">
                                <div
                                  className={`h-4 rounded-full transition-all duration-1500 ease-out flex items-center justify-center ${stat.color === 'red' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                      stat.color === 'amber' ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                                        'bg-gradient-to-r from-slate-500 to-slate-600'
                                    }`}
                                  style={{
                                    width: `${percentage}%`,
                                    transitionDelay: `${index * 150}ms`
                                  }}
                                >
                                  <span className="text-xs font-bold text-white">{stat.count}</span>
                                </div>
                              </div>
                              <span className="text-sm font-black text-slate-900 min-w-[45px]">{percentage}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline des alertes */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-slate-600" />
                  📅 Timeline des Alertes - Actions Requises
                </h3>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="space-y-4">
                    {stockAlerts.slice(0, 6).map((alert, index) => (
                      <div key={index} className="flex items-start space-x-4">
                        {/* Timeline indicator */}
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${alert.severity === 'critical' ? 'bg-red-100 text-red-600 border-2 border-red-500' :
                              alert.severity === 'warning' ? 'bg-amber-100 text-amber-600 border-2 border-amber-500' :
                                'bg-slate-100 text-slate-600 border-2 border-slate-500'
                            }`}>
                            {alert.type === 'rupture' && <ExclamationTriangleIcon className="h-5 w-5" />}
                            {alert.type === 'surstock' && <CubeIcon className="h-5 w-5" />}
                            {alert.type === 'dormant' && <ClockIcon className="h-5 w-5" />}
                            {alert.type === 'anomalie' && <ExclamationCircleIcon className="h-5 w-5" />}
                          </div>
                          {index < 5 && (
                            <div className={`w-0.5 h-12 ${alert.severity === 'critical' ? 'bg-red-300' :
                                alert.severity === 'warning' ? 'bg-amber-300' :
                                  'bg-slate-300'
                              }`}></div>
                          )}
                        </div>

                        {/* Contenu */}
                        <div className="flex-1 pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-bold text-slate-900">{alert.product}</div>
                            <div className={`px-2 py-1 rounded-full text-xs font-bold ${alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                alert.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                                  'bg-slate-100 text-slate-700'
                              }`}>
                              {alert.severity}
                            </div>
                          </div>
                          <div className="text-sm text-slate-600 mb-2 capitalize">{alert.type}</div>
                          <div className="bg-slate-50 rounded p-3 text-xs">
                            <div className="font-semibold text-slate-900 mb-1">Action: {alert.action}</div>
                            <div className="text-slate-600">
                              Stock actuel: <span className="font-bold">{alert.currentStock}</span>
                              {alert.type === 'rupture' && ` • Seuil min: ${alert.minThreshold}`}
                              {alert.type === 'surstock' && ` • Seuil max: ${alert.maxThreshold}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Produits */}
          {selectedView === 'performance-produits' && (
            <div className="space-y-6">
              {/* Graphique comparatif des performances */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600" />
                  📊 Comparatif de Performance - Top 3 Produits
                </h3>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {productPerformance.map((product, index) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-full flex items-center justify-center text-lg font-bold">
                            {index + 1}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${product.profitability === 'excellent' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                              'bg-slate-100 text-slate-700 border border-slate-300'
                            }`}>
                            {product.profitability}
                          </div>
                        </div>

                        <h4 className="font-bold text-slate-900 mb-4 text-sm">{product.product}</h4>

                        <div className="space-y-3">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-600">CA</span>
                              <span className="font-bold text-slate-900">{formatCurrency(product.revenue)}</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000"
                                style={{ width: `${(product.revenue / 1450000) * 100}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-600">Marge</span>
                              <span className="font-bold text-slate-900">{product.margin}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className="h-2 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full transition-all duration-1000"
                                style={{ width: `${(product.margin / 30) * 100}%` }}
                              ></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-600">Rotation</span>
                              <span className="font-bold text-slate-900">{product.stockTurnover}x</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className="h-2 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full transition-all duration-1000"
                                style={{ width: `${(product.stockTurnover / 10) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Graphique de barres comparatives */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <h5 className="font-semibold text-slate-900 mb-4 flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 mr-2 text-emerald-600" />
                        Chiffre d'Affaires
                      </h5>
                      <div className="space-y-3">
                        {productPerformance.map((product, index) => (
                          <div key={index}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-slate-700 font-medium truncate">{product.product}</span>
                              <span className="font-bold text-slate-900 ml-2">{(product.revenue / 1000).toFixed(0)}k</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3">
                              <div
                                className="h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 ease-out"
                                style={{
                                  width: `${(product.revenue / 1450000) * 100}%`,
                                  transitionDelay: `${index * 150}ms`
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <h5 className="font-semibold text-slate-900 mb-4 flex items-center">
                        <ChartPieIcon className="h-4 w-4 mr-2 text-slate-600" />
                        Part de Marché
                      </h5>
                      <div className="space-y-3">
                        {productPerformance.map((product, index) => (
                          <div key={index}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-slate-700 font-medium truncate">{product.product}</span>
                              <span className="font-bold text-slate-900 ml-2">{product.marketShare}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3">
                              <div
                                className="h-3 bg-gradient-to-r from-slate-500 to-slate-700 rounded-full transition-all duration-1000 ease-out"
                                style={{
                                  width: `${(product.marketShare / 20) * 100}%`,
                                  transitionDelay: `${index * 150}ms`
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-slate-600" />
                  Analyse Détaillée des Produits
                </h3>

                <div className="space-y-6">
                  {productPerformance.map((product, index) => (
                    <div key={index} className="bg-white rounded-lg p-6 border border-slate-200">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h4 className="text-lg font-semibold text-slate-900">{product.product}</h4>
                          <div className="flex items-center mt-2">
                            {product.trend === 'up' ? (
                              <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
                            ) : (
                              <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                            )}
                            <span className={`text-sm font-medium ${product.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                              Tendance {product.trend === 'up' ? 'croissante' : 'décroissante'}
                            </span>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${product.profitability === 'excellent' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                            'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}>
                          {product.profitability}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                        <div className="text-center">
                          <div className="text-xs text-slate-500 mb-1">Ventes (unités)</div>
                          <div className="text-2xl font-bold text-slate-900">{product.sales}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-500 mb-1">Chiffre d'affaires</div>
                          <div className="text-2xl font-bold text-slate-900">{formatCurrency(product.revenue)}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-500 mb-1">Marge (%)</div>
                          <div className="text-2xl font-bold text-slate-900">{product.margin}%</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-slate-500 mb-1">Rotation stock</div>
                          <div className="text-2xl font-bold text-slate-900">{product.stockTurnover}x</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <div className="text-xs text-slate-500 mb-1">Part de marché</div>
                          <div className="text-lg font-bold text-slate-900">{product.marketShare}%</div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <div className="text-xs text-slate-500 mb-1">Satisfaction client</div>
                          <div className="text-lg font-bold text-slate-900">{product.customerSatisfaction}/5</div>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                          <div className="text-xs text-slate-500 mb-1">Performance globale</div>
                          <div className="flex items-center justify-center">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`h-4 w-4 ${i < Math.round(product.customerSatisfaction) ? 'text-yellow-400' : 'text-slate-300'}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graphique de ventes cumulatives */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600" />
                  📈 Courbe des Ventes Cumulatives - Top 3 Produits
                </h3>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  {/* Légende */}
                  <div className="flex items-center justify-center space-x-6 mb-6">
                    {productPerformance.map((product, index) => {
                      const colors = ['bg-slate-700', 'bg-slate-500', 'bg-emerald-600'];
                      return (
                        <div key={index} className="flex items-center">
                          <div className={`w-8 h-1.5 ${colors[index]} rounded mr-2`}></div>
                          <span className="text-sm font-semibold text-slate-900">{product.product}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Graphique */}
                  <div className="relative h-96 bg-slate-50 rounded-lg p-8">
                    <svg className="w-full h-full" viewBox="0 0 700 350" preserveAspectRatio="xMidYMid meet">
                      {/* Grille */}
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <g key={i}>
                          <line x1="60" y1={30 + i * 50} x2="660" y2={30 + i * 50} stroke="#e2e8f0" strokeWidth="1.5" />
                          <text x="45" y={35 + i * 50} fill="#64748b" fontSize="13" fontWeight="700" textAnchor="end">
                            {(5 - i) * 30}
                          </text>
                        </g>
                      ))}

                      {/* Courbes pour chaque produit */}
                      {productPerformance.map((_, pIndex) => {
                        const colors = ['#334155', '#64748b', '#10b981'];
                        const strokeWidths = [5, 4, 5];
                        // Simulations de ventes cumulatives sur 6 mois
                        const cumulativeData = [
                          [15, 32, 52, 78, 112, 145],  // Smartphone
                          [12, 28, 45, 62, 78, 89],    // Laptop
                          [22, 48, 78, 110, 135, 156]  // Tablette
                        ][pIndex];

                        return (
                          <g key={pIndex}>
                            {/* Zone remplie */}
                            {pIndex === 2 && (
                              <path
                                d={(() => {
                                  const maxVal = 160;
                                  let path = 'M 60 280 ';
                                  cumulativeData.forEach((val, i) => {
                                    const x = 60 + (i * 120);
                                    const y = 280 - ((val / maxVal) * 250);
                                    path += `L ${x} ${y} `;
                                  });
                                  path += 'L 660 280 Z';
                                  return path;
                                })()}
                                fill="url(#cumGradient)"
                                opacity="0.15"
                              />
                            )}

                            {/* Courbe */}
                            <path
                              d={(() => {
                                const maxVal = 160;
                                return cumulativeData.map((val, i) => {
                                  const x = 60 + (i * 120);
                                  const y = 280 - ((val / maxVal) * 250);
                                  return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                                }).join(' ');
                              })()}
                              fill="none"
                              stroke={colors[pIndex]}
                              strokeWidth={strokeWidths[pIndex]}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeDasharray="2000"
                              strokeDashoffset="2000"
                            >
                              <animate
                                attributeName="stroke-dashoffset"
                                from="2000"
                                to="0"
                                begin={`${pIndex * 0.3}s`}
                                dur="2s"
                                fill="freeze"
                              />
                            </path>

                            {/* Points */}
                            {cumulativeData.map((val, i) => {
                              const x = 60 + (i * 120);
                              const maxVal = 160;
                              const y = 280 - ((val / maxVal) * 250);
                              return (
                                <g key={`pt-${pIndex}-${i}`}>
                                  <circle cx={x} cy={y} r="6" fill={colors[pIndex]} opacity="0">
                                    <animate
                                      attributeName="opacity"
                                      from="0"
                                      to="1"
                                      begin={`${pIndex * 0.3 + 2 + i * 0.1}s`}
                                      dur="0.3s"
                                      fill="freeze"
                                    />
                                  </circle>
                                  <circle cx={x} cy={y} r="3" fill="#ffffff" opacity="0">
                                    <animate
                                      attributeName="opacity"
                                      from="0"
                                      to="1"
                                      begin={`${pIndex * 0.3 + 2 + i * 0.1}s`}
                                      dur="0.3s"
                                      fill="freeze"
                                    />
                                  </circle>
                                </g>
                              );
                            })}
                          </g>
                        );
                      })}

                      {/* Labels mois */}
                      {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'].map((month, i) => (
                        <text key={i} x={60 + (i * 120)} y="310" fill="#334155" fontSize="14" fontWeight="800" textAnchor="middle">
                          {month}
                        </text>
                      ))}

                      {/* Dégradé */}
                      <defs>
                        <linearGradient id="cumGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Statistiques finales */}
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-slate-200">
                    {productPerformance.map((product, index) => (
                      <div key={index} className={`text-center p-4 rounded-lg border ${index === 2 ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-100 border-slate-300'
                        }`}>
                        <div className={`text-xs font-semibold mb-2 ${index === 2 ? 'text-emerald-600' : 'text-slate-600'
                          }`}>
                          {product.product}
                        </div>
                        <div className={`text-2xl font-bold ${index === 2 ? 'text-emerald-700' : 'text-slate-900'
                          }`}>
                          {product.sales} ventes
                        </div>
                        <div className="text-xs text-slate-600 mt-1">
                          {formatCurrency(product.revenue)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Matrice de satisfaction client */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-6 border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center">
                  <StarIcon className="h-5 w-5 mr-2 text-slate-600" />
                  ⭐ {t('stocks_reports.performance_matrix_title')}
                </h3>

                <div className="bg-white rounded-lg p-6 border border-slate-200">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {productPerformance.map((product, index) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-5 border border-slate-200 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-4">
                          <div className="font-bold text-slate-900 text-sm">{product.product}</div>
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <StarIcon
                                key={star}
                                className={`h-4 w-4 ${star <= Math.floor(product.customerSatisfaction)
                                    ? 'text-emerald-500 fill-emerald-500'
                                    : 'text-slate-300'
                                  }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Indicateurs de performance */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-white rounded p-3 text-center border border-slate-200">
                            <div className="text-xs text-slate-500 mb-1">CA</div>
                            <div className="text-lg font-bold text-slate-900">
                              {(product.revenue / 1000).toFixed(0)}k
                            </div>
                          </div>
                          <div className="bg-white rounded p-3 text-center border border-slate-200">
                            <div className="text-xs text-slate-500 mb-1">Marge</div>
                            <div className="text-lg font-bold text-emerald-600">
                              {product.margin}%
                            </div>
                          </div>
                        </div>

                        {/* Jauge de satisfaction */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">Satisfaction</span>
                            <span className="font-bold text-slate-900">{product.customerSatisfaction}/5</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-3">
                            <div
                              className="h-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000"
                              style={{ width: `${(product.customerSatisfaction / 5) * 100}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Jauge de rentabilité */}
                        <div className="space-y-2 mt-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-600">Rentabilité</span>
                            <span className="font-bold text-slate-900">{product.margin}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-3">
                            <div
                              className="h-3 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full transition-all duration-1000"
                              style={{ width: `${(product.margin / 30) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
              <p className="text-sm text-slate-600">Gérez vos stocks et analysez vos produits</p>
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

export default StocksProduits;

