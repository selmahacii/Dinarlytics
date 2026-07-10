import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowPathIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  ChartBarIcon,
  ChartPieIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  AdjustmentsHorizontalIcon,
  UserIcon,
  ClockIcon,
  DocumentTextIcon,
  TruckIcon,
  ShoppingCartIcon,
  PrinterIcon,
  XMarkIcon,
  Squares2X2Icon,
  TableCellsIcon,
  CheckCircleIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import Card from '@shared/components/UI/Card';
import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';
import { useProducts } from '@core/context/ProductsContext';
import apiClient from '@/services/apiClient';

const Inventaire: React.FC = () => {
  const { formatCurrency, user, companyData } = useApp();
  const { t, currentLang } = useTranslation();
  const navigate = useNavigate();

  const [articles, setArticles] = useState<any[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);

  React.useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoadingArticles(true);
        const response = await apiClient.get<any[]>('/articles/');
        setArticles(response.data || []);
      } catch (err) {
        console.error("Failed to fetch articles", err);
      } finally {
        setLoadingArticles(false);
      }
    };
    fetchArticles();
  }, []);

  // Helper: map percentage to Tailwind width classes to avoid inline styles
  const percentToWidth = (percent: number) => {
    const p = Math.max(0, Math.min(100, Math.round(percent)));
    if (p >= 98) return 'w-[100%]';
    if (p >= 95) return 'w-[95%]';
    if (p >= 90) return 'w-[90%]';
    if (p >= 80) return 'w-[80%]';
    if (p >= 70) return 'w-[70%]';
    if (p >= 60) return 'w-[60%]';
    if (p >= 50) return 'w-[50%]';
    if (p >= 40) return 'w-[40%]';
    if (p >= 30) return 'w-[30%]';
    if (p >= 20) return 'w-[20%]';
    if (p >= 10) return 'w-[10%]';
    if (p >= 5) return 'w-[5%]';
    return 'w-[0%]';
  };

  // ========================================
  // INTERFACE EURL MICRO-ENTREPRISE  
  // ========================================
  if (loadingArticles) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-gray-500 font-medium">Chargement des données d'inventaire...</p>
        </div>
      </div>
    );
  }

  if (user && user.segment === 'micro' && user.companyType === 'eurl' && companyData) {
    const valeurStock = articles.reduce((sum, art) => sum + ((art.stock_quantity || 0) * (art.cost_price || art.unit_price || 0)), 0);
    const nombreArticles = articles.length;
    const articlesEnStock = articles.filter(art => (art.stock_quantity || 0) > 0).length;
    const articlesRupture = articles.filter(art => (art.stock_quantity || 0) <= 0).length;

    // Répartition par famille
    const stockParFamille = [
      { famille: t('inventory.sections.category_distribution') + ' A', valeur: Math.round(valeurStock * 0.45), articles: Math.max(1, Math.round(nombreArticles * 0.40)), couleur: 'from-emerald-500 to-teal-500' },
      { famille: t('inventory.sections.category_distribution') + ' B', valeur: Math.round(valeurStock * 0.30), articles: Math.max(1, Math.round(nombreArticles * 0.35)), couleur: 'from-blue-500 to-indigo-500' },
      { famille: t('inventory.sections.category_distribution') + ' C', valeur: Math.round(valeurStock * 0.25), articles: Math.max(1, Math.round(nombreArticles * 0.25)), couleur: 'from-slate-600 to-slate-800' }
    ];

    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <CubeIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{t('inventory.title')}</h1>
                <p className="text-slate-300 text-lg mt-1">{t('inventory.subtitle')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <CubeIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">{t('inventory.stats.refs')}</h3>
            <p className="text-3xl font-extrabold text-slate-900">{articlesEnStock}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-emerald-600 font-semibold">✅ {t('inventory.status.available')}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <ExclamationTriangleIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">{t('inventory.tabs.alerts')}</h3>
            <p className="text-3xl font-extrabold text-slate-900">{articlesRupture}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-red-600 font-semibold">🚨 {t('inventory.status.to_reorder')}</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <CurrencyDollarIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">{t('inventory.stats.total_value')}</h3>
            <p className="text-3xl font-extrabold text-slate-900">{valeurStock?.toLocaleString(currentLang === 'ar' ? 'ar-DZ' : 'fr-FR', { style: 'currency', currency: 'DZD' })}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-blue-600 font-semibold">📦 {t('inventory.tabs.stock')}</p>
            </div>
          </div>
        </div>

        {/* Stock par Famille */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-300 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mr-3">
              <ChartPieIcon className="h-5 w-5 text-white" />
            </div>
            {t('inventory.sections.category_distribution')}
          </h2>
          <div className="space-y-4">
            {stockParFamille.map((famille, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border-2 border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-slate-900">{famille.famille}</p>
                    <p className="text-xs text-slate-600">{famille.articles} {t('inventory.stats.units')}</p>
                  </div>
                  <p className="text-xl font-extrabold text-slate-900">{formatCurrency(famille.valeur)}</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${famille.couleur} rounded-full transition-all duration-500 ${percentToWidth(Math.round((famille.valeur / valeurStock) * 100))}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertes & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border-2 border-red-300 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg mr-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-white" />
              </div>
              {t('inventory.sections.alerts_title')}
            </h3>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg border border-red-300">
                <p className="text-sm font-bold text-red-700">🚨 {t('inventory.alerts_msg.out_of_stock_msg', { count: articlesRupture })}</p>
                <p className="text-xs text-slate-600 mt-1">{t('inventory.reordering.optimize_desc')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mr-3">
                <CubeIcon className="h-5 w-5 text-white" />
              </div>
              {t('inventory.sections.quick_actions')}
            </h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl font-bold hover:from-slate-800 hover:to-black shadow-md hover:shadow-lg transition-all duration-300">
                📝 {t('inventory.actions.start_inventory')}
              </button>
              <button className="w-full p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all duration-300">
                📊 {t('inventory.actions.full_report')}
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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'nom' | 'stock' | 'valeur'>('nom');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState('stock');
  const [stockStatusFilter, setStockStatusFilter] = useState<'tous' | 'normal' | 'faible' | 'critique'>('tous');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedReorderArticle, setSelectedReorderArticle] = useState<any>(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [selectedBarcodeArticle, setSelectedBarcodeArticle] = useState<any>(null);
  const [valuationMethod, setValuationMethod] = useState<'FIFO' | 'LIFO' | 'PMP'>('PMP');

  const { products, refetch } = useProducts();
  
  useEffect(() => {
    refetch();
  }, []);
  const totalStock = products.reduce((total, article) => 
    total + (article.prixUnitaire * article.stock), 0
  );

  const categoriesStock = products.reduce((acc, article) => {
    const valeur = article.prixUnitaire * article.stock;
    acc[article.categorie] = (acc[article.categorie] || 0) + valeur;
    return acc;
  }, {} as Record<string, number>);

  const categories = Array.from(new Set(products.map(article => article.categorie)));

  const getStockStatus = (stock: number): 'normal' | 'faible' | 'critique' => {
    if (stock > 50) return 'normal';
    if (stock > 20) return 'faible';
    return 'critique';
  };

  const filteredAndSortedArticles = useMemo(() => {
    let filtered = products.filter(article => {
      const matchesSearch = article.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.codePCA.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || article.categorie === selectedCategory;
      const status = getStockStatus(article.stock);
      const matchesStatus = stockStatusFilter === 'tous' || status === stockStatusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });

    return filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'stock':
          aValue = a.stock;
          bValue = b.stock;
          break;
        case 'valeur':
          aValue = a.prixUnitaire * a.stock;
          bValue = b.prixUnitaire * b.stock;
          break;
        default:
          aValue = a.nom;
          bValue = b.nom;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [products, searchTerm, selectedCategory, sortBy, sortOrder, stockStatusFilter]);

  // Fonctions pour gérer les actions
  const handleInventoryCount = () => {
    setShowInventoryModal(true);
  };

  const handleReordering = () => {
    setActiveTab('reordering');
  };

  const handleExportStock = () => {
    alert('📊 ' + t('inventory.actions.export') + '...');
  };

  const handlePrintStock = () => {
    alert('🖨️ ' + t('inventory.actions.print') + '...');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setStockStatusFilter('tous');
    setSortBy('nom');
    setSortOrder('asc');
  };

  // Alertes d'inventaire dérivées du référentiel produits (cohérence globale)
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 20).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const overstockCount = products.filter(p => p.stock >= 100).length;
  const inventoryAlerts = [
    { id: 1, type: 'low_stock', message: t('inventory.alerts_msg.low_stock_msg', { count: lowStockCount }), count: lowStockCount, severity: 'warning' as const },
    { id: 2, type: 'out_of_stock', message: t('inventory.alerts_msg.out_of_stock_msg', { count: outOfStockCount }), count: outOfStockCount, severity: 'critical' as const },
    { id: 3, type: 'expiring', message: t('inventory.alerts_msg.expiring_msg', { count: 0 }), count: 0, severity: 'info' as const },
    { id: 4, type: 'overstock', message: t('inventory.alerts_msg.overstock_msg', { count: overstockCount }), count: overstockCount, severity: 'info' as const }
  ];

  // Aucun historique de mouvements de stock n'est encore suivi côté backend
  // (pas de table dédiée) : on n'invente pas de mouvements fictifs.
  const stockMovements: Array<{
    id: number; article: string; codePCA: string; type: 'in' | 'out' | 'adjustment';
    quantity: number; date: string; heure: string; reason: string; reference: string;
    valeurUnitaire: number; responsable: string; fournisseur?: string; client?: string;
  }> = [];

  const reorderSuggestions = products
    .filter(article => article.stock < 20)
    .map(article => ({
      ...article,
      suggestedOrder: Math.max(50, article.stock * 2),
      urgency: article.stock < 10 ? 'high' : article.stock < 15 ? 'medium' : 'low',
      stockMinimum: 20,
      stockOptimal: 100,
      delaiLivraison: 0,
      fournisseurPrincipal: '',
      dernierAchat: '',
      coutEstime: article.prixUnitaire * Math.max(50, article.stock * 2)
    }));

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Header simple et professionnel */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
          {t('inventory.title')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">{t('inventory.subtitle')}</p>
      </div>

      {/* Disclaimer sobre */}
      <div className="bg-slate-100 dark:bg-slate-800 border-l-2 border-slate-400 dark:border-slate-600 p-4 rounded">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-4 w-4 text-slate-600 dark:text-slate-400 mr-3" />
          <p className="text-slate-700 dark:text-slate-300 text-xs">
          {t('disclaimer')}
        </p>
        </div>
      </div>

      {/* Navigation par onglets */}
      <Card className="p-0">
        <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
          <nav className="flex overflow-x-auto no-scrollbar space-x-4 px-6" aria-label="Tabs">
            {[
              { id: 'stock', name: t('inventory.tabs.stock'), icon: CubeIcon },
              { id: 'movements', name: t('inventory.tabs.movements'), icon: ArrowPathIcon },
              { id: 'alerts', name: t('inventory.tabs.alerts'), icon: ExclamationTriangleIcon },
              { id: 'reordering', name: t('inventory.tabs.reordering'), icon: MagnifyingGlassIcon },
              { id: 'barcode', name: t('inventory.tabs.barcode'), icon: FunnelIcon },
              { id: 'reports', name: t('inventory.tabs.reports'), icon: ChartBarIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2.5 px-1 border-b-2 font-medium text-xs uppercase tracking-wide transition-colors ${
                  activeTab === tab.id
                    ? 'border-slate-700 dark:border-slate-400 text-slate-900 dark:text-slate-100'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-1.5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'stock' && (
            <>

              {/* Cartes de résumé professionnelles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{products.length}</p>
                      <p className="text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wide mt-1">{t('inventory.stats.refs')}</p>
                    </div>
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded">
                      <CubeIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                      {products.reduce((total, article) => total + article.stock, 0)}
                    </p>
                      <p className="text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wide mt-1">{t('inventory.stats.total_units')}</p>
                    </div>
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded">
                      <ChartBarIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(totalStock)}</p>
                      <p className="text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wide mt-1">{t('inventory.stats.total_value')}</p>
                    </div>
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded">
                      <CurrencyDollarIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons d'action améliorés */}
              <div className="flex flex-wrap justify-end gap-3 mt-6">
                <button
                  onClick={handleInventoryCount}
                  className="flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
                >
                  <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                  {t('inventory.actions.physical_inventory')}
                </button>
                <button
                  onClick={handleReordering}
                  className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  {t('inventory.actions.reordering')}
                </button>
                <button
                  onClick={handleExportStock}
                  className="flex items-center px-4 py-2.5 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 dark:from-slate-500 dark:to-slate-600 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  {t('inventory.actions.export')}
                </button>
                <button
                  onClick={handlePrintStock}
                  className="flex items-center px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-all shadow-sm"
                >
                  <PrinterIcon className="h-4 w-4 mr-2" />
                  {t('inventory.actions.print')}
                </button>
              </div>

              {/* Répartition par Catégorie simple */}
              <Card title={t('inventory.sections.category_distribution')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categoriesStock)
            .sort(([,a], [,b]) => b - a)
            .map(([categorie, valeur], index) => {
              const percentage = (valeur / totalStock) * 100;
              const colors = [
                { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', accent: 'text-blue-500' },
                { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', accent: 'text-green-500' },
                { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', accent: 'text-purple-500' },
                { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', accent: 'text-orange-500' },
                { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', accent: 'text-pink-500' },
                { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', accent: 'text-indigo-500' }
              ];
              const colorScheme = colors[index % colors.length];
              
              return (
                <div key={categorie} className={`${colorScheme.bg} ${colorScheme.border} border p-4 rounded-lg hover:shadow-sm transition-shadow duration-200`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-semibold ${colorScheme.text}`}>{categorie}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${colorScheme.bg} ${colorScheme.text}`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <p className={`text-xl font-bold ${colorScheme.text} mb-1`}>{formatCurrency(valeur)}</p>
                  <p className={`text-sm ${colorScheme.text} opacity-70`}>
                    {products.filter(a => a.categorie === categorie).length} items
                  </p>
                </div>
              );
            })}
        </div>
      </Card>

      {/* Barre de recherche et filtres améliorés */}
      <Card className="mt-6">
        <div className="mb-6 space-y-4">
          {/* En-tête avec actions */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('inventory.sections.stock_detail')}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('inventory.sections.stock_detail_subtitle', { count: filteredAndSortedArticles.length })}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-slate-700 dark:bg-slate-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                title="Vue tableau"
              >
                <TableCellsIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-slate-700 dark:bg-slate-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                title="Vue cartes"
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Barre de recherche */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder={t('inventory.filters.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-slate-500 dark:focus:ring-slate-400 focus:border-slate-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                aria-label="Effacer la recherche"
                title="Effacer la recherche"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filtres avancés */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Filtre par catégorie */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm font-medium"
                aria-label="Filtrer par catégorie"
                title="Filtrer par catégorie"
              >
                <option value="">{t('inventory.filters.all_categories')}</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Filtre par statut de stock */}
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value as 'tous' | 'normal' | 'faible' | 'critique')}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm font-medium"
              aria-label="Filtrer par statut de stock"
              title="Filtrer par statut de stock"
            >
              <option value="tous">{t('inventory.filters.all_statuses')}</option>
              <option value="normal">✅ {t('inventory.filters.status_normal')}</option>
              <option value="faible">⚠️ {t('inventory.filters.status_low')}</option>
              <option value="critique">🔴 {t('inventory.filters.status_critical')}</option>
            </select>

            {/* Valuation Method */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Valuation:</span>
              <select
                value={valuationMethod}
                onChange={(e) => setValuationMethod(e.target.value as 'FIFO' | 'LIFO' | 'PMP')}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm font-medium"
              >
                <option value="PMP">PMP (Prix Moyen Pondéré)</option>
                <option value="FIFO">FIFO (First-In, First-Out)</option>
                <option value="LIFO">LIFO (Last-In, First-Out)</option>
              </select>
            </div>

            {/* Tri */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{t('inventory.filters.sort_nom')}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'nom' | 'stock' | 'valeur')}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm font-medium"
                aria-label={t('inventory.filters.sort_nom')}
                title={t('inventory.filters.sort_nom')}
              >
                <option value="nom">{t('inventory.filters.sort_nom')}</option>
                <option value="stock">{t('inventory.filters.sort_stock')}</option>
                <option value="valeur">{t('inventory.filters.sort_valeur')}</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors text-sm font-semibold"
                title={sortOrder === 'asc' ? t('common.asc') : t('common.desc')}
              >
                {sortOrder === 'asc' ? '↑ ' + t('common.asc') : '↓ ' + t('common.desc')}
              </button>
            </div>

            {/* Bouton réinitialiser */}
            {(searchTerm || selectedCategory || stockStatusFilter !== 'tous') && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm font-medium"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                {t('inventory.actions.reset')}
              </button>
            )}
          </div>
        </div>

        {/* Vue tableau */}
        {viewMode === 'table' && (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t('inventory.table.article')}
                </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t('inventory.table.pca_code')}
                </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t('inventory.table.quantity')}
                </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t('inventory.table.pu')}
                </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t('inventory.table.total_value')}
                </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t('inventory.table.status')}
                </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    {t('inventory.table.actions')}
                </th>
              </tr>
            </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredAndSortedArticles.map((article) => {
                const valeurTotale = article.prixUnitaire * article.stock;
                  const statusType = getStockStatus(article.stock);
                  const statusConfig = {
                    normal: { text: t('inventory.status.normal'), class: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700' },
                    faible: { text: t('inventory.status.low'), class: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700' },
                    critique: { text: t('inventory.status.critical'), class: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700' }
                  };
                  const status = statusConfig[statusType];

                return (
                    <tr key={article.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{article.nom}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{article.categorie}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600">
                        {article.codePCA}
                      </span>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                      {article.stock} {t('inventory.stats.units')}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                      {formatCurrency(article.prixUnitaire)}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(valeurTotale)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${status.class}`}>
                        {status.text}
                      </span>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => navigate(`/articles?id=${article.id}`)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title={t('inventory.actions.view_details')}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => navigate(`/articles?id=${article.id}`)}
                            className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors"
                            title={t('inventory.actions.edit')}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
                </div>
        )}

        {/* Vue cartes */}
        {viewMode === 'cards' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedArticles.map((article) => {
              const valeurTotale = article.prixUnitaire * article.stock;
              const statusType = getStockStatus(article.stock);
              const statusConfig = {
                normal: { 
                  bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
                  border: 'border-emerald-200 dark:border-emerald-700',
                  text: 'text-emerald-700 dark:text-emerald-300',
                  icon: 'text-emerald-600 dark:text-emerald-400',
                  label: '✅ ' + t('inventory.filters.status_normal')
                },
                faible: { 
                  bg: 'bg-amber-50 dark:bg-amber-900/20', 
                  border: 'border-amber-200 dark:border-amber-700',
                  text: 'text-amber-700 dark:text-amber-300',
                  icon: 'text-amber-600 dark:text-amber-400',
                  label: '⚠️ ' + t('inventory.filters.status_low')
                },
                critique: { 
                  bg: 'bg-red-50 dark:bg-red-900/20', 
                  border: 'border-red-200 dark:border-red-700',
                  text: 'text-red-700 dark:text-red-300',
                  icon: 'text-red-600 dark:text-red-400',
                  label: '🔴 ' + t('inventory.filters.status_critical')
                }
              };
              const config = statusConfig[statusType];

              return (
                <div key={article.id} className={`bg-white dark:bg-slate-800 rounded-xl border-2 ${config.border} p-5 hover:shadow-lg transition-all`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${config.bg} border ${config.border}`}>
                      <CubeIcon className={`h-6 w-6 ${config.icon}`} />
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${config.bg} ${config.border} ${config.text}`}>
                      {config.label}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{article.nom}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{article.categorie}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{t('inventory.table_labels.pca_code')}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{article.codePCA}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{t('inventory.table.quantity')}:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{article.stock} {t('inventory.stats.units')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{t('inventory.table_labels.unit_price')}</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(article.prixUnitaire)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{t('inventory.table_labels.total_value')}</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(valeurTotale)}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => navigate(`/articles?id=${article.id}`)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {t('inventory.actions.view_details')}
                    </button>
                    <button 
                      onClick={() => navigate(`/articles?id=${article.id}`)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      {t('inventory.actions.edit')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredAndSortedArticles.length === 0 && (
          <div className="text-center py-12">
            <CubeIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{t('inventory.messages.no_article_found')}</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{t('inventory.messages.search_crit_desc')}</p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {t('inventory.actions.reset')}
            </button>
          </div>
        )}
              </Card>
            </>
          )}

          {/* Onglet Mouvements de Stock */}
          {activeTab === 'movements' && (
            <div className="space-y-6">
              {/* En-tête avec statistiques */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('inventory.movements.title')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('inventory.movements.subtitle')}</p>
                </div>
                <button className="flex items-center px-4 py-2.5 bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 text-white rounded-lg transition-all shadow-sm font-medium space-x-2">
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>{t('inventory.actions.export')}</span>
                </button>
              </div>

              {/* Statistiques rapides */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-5 rounded-xl border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">{t('inventory.movements.in')}</p>
                      <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">+{stockMovements.filter(m => m.type === 'in').reduce((s, m) => s + m.quantity, 0)}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{t('inventory.movements.units_month')}</p>
                </div>
                    <div className="p-3 bg-emerald-200 dark:bg-emerald-800 rounded-lg">
                      <ArrowDownTrayIcon className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-5 rounded-xl border border-red-200 dark:border-red-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">{t('inventory.movements.out')}</p>
                      <p className="text-2xl font-bold text-red-900 dark:text-red-100">-{stockMovements.filter(m => m.type === 'out').reduce((s, m) => s + Math.abs(m.quantity), 0)}</p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{t('inventory.movements.units_month')}</p>
                    </div>
                    <div className="p-3 bg-red-200 dark:bg-red-800 rounded-lg">
                      <ArrowUpTrayIcon className="h-6 w-6 text-red-700 dark:text-red-300" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-5 rounded-xl border border-amber-200 dark:border-amber-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">{t('inventory.movements.adjustment')}</p>
                      <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{stockMovements.filter(m => m.type === 'adjustment').reduce((s, m) => s + m.quantity, 0)}</p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{t('inventory.movements.units_month')}</p>
                    </div>
                    <div className="p-3 bg-amber-200 dark:bg-amber-800 rounded-lg">
                      <AdjustmentsHorizontalIcon className="h-6 w-6 text-amber-700 dark:text-amber-300" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 p-5 rounded-xl border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('inventory.movements.transactions')}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stockMovements.length}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{t('inventory.movements.units_month')}</p>
                    </div>
                    <div className="p-3 bg-slate-200 dark:bg-slate-600 rounded-lg">
                      <ArrowPathIcon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Historique des mouvements enrichi */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('inventory.movements.history')}</h4>
                </div>
                
                <div className="space-y-0">
                  {stockMovements.length === 0 && (
                    <div className="p-10 text-center text-slate-400 text-sm">
                      {t('inventory.movements.not_available', { defaultValue: "Le suivi des mouvements de stock n'est pas encore disponible." })}
                    </div>
                  )}
                  {stockMovements.map((movement, index) => {
                    const isLast = index === stockMovements.length - 1;
                    const TypeIcon = movement.type === 'in' ? ArrowDownTrayIcon :
                                     movement.type === 'out' ? ArrowUpTrayIcon :
                                     AdjustmentsHorizontalIcon;
                    
                    const typeConfig: Record<string, {
                      bg: string;
                      border: string;
                      text: string;
                      icon: string;
                      label: string;
                    }> = {
                      in: {
                        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                        border: 'border-emerald-200 dark:border-emerald-700',
                        text: 'text-emerald-700 dark:text-emerald-300',
                        icon: 'text-emerald-600 dark:text-emerald-400',
                        label: t('inventory.movements.in')
                      },
                      out: {
                        bg: 'bg-red-50 dark:bg-red-900/20',
                        border: 'border-red-200 dark:border-red-700',
                        text: 'text-red-700 dark:text-red-300',
                        icon: 'text-red-600 dark:text-red-400',
                        label: t('inventory.movements.out')
                      },
                      adjustment: {
                        bg: 'bg-amber-50 dark:bg-amber-900/20',
                        border: 'border-amber-200 dark:border-amber-700',
                        text: 'text-amber-700 dark:text-amber-300',
                        icon: 'text-amber-600 dark:text-amber-400',
                        label: t('inventory.movements.adjustment')
                      }
                    };

                    const config = typeConfig[movement.type];
                    const valeurTotale = movement.quantity * movement.valeurUnitaire;

                    return (
                      <div 
                        key={movement.id} 
                        className={`px-6 py-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${!isLast ? 'border-b border-slate-200 dark:border-slate-700' : ''}`}
                      >
                        <div className="flex items-start space-x-4">
                          {/* Icône de type */}
                          <div className={`flex-shrink-0 p-3 rounded-xl ${config.bg} border ${config.border}`}>
                            <TypeIcon className={`h-6 w-6 ${config.icon}`} />
                          </div>

                          {/* Contenu principal */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h5 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            {movement.article}
                                  </h5>
                                  <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${config.bg} ${config.border} ${config.text}`}>
                                    {config.label}
                            </span>
                                  <span className="px-2 py-1 text-xs font-medium rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                    {movement.codePCA}
                                  </span>
                                </div>

                                {/* Détails en grille */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                      <ClockIcon className="h-4 w-4 mr-2" />
                                      <span className="font-medium text-slate-900 dark:text-slate-100">
                                        {movement.date} {t('common.at')} {movement.heure}
                            </span>
                                    </div>
                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                                      <span>{t('inventory.movements.ref')}: <span className="font-medium text-slate-900 dark:text-slate-100">{movement.reference}</span></span>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    {movement.fournisseur && (
                                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                        <TruckIcon className="h-4 w-4 mr-2" />
                                        <span>{t('inventory.movements.provider')}: <span className="font-medium text-slate-900 dark:text-slate-100">{movement.fournisseur}</span></span>
                                      </div>
                                    )}
                                    {movement.client && (
                                      <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                        <ShoppingCartIcon className="h-4 w-4 mr-2" />
                                        <span>{t('inventory.movements.client')}: <span className="font-medium text-slate-900 dark:text-slate-100">{movement.client}</span></span>
                                      </div>
                                    )}
                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                      <UserIcon className="h-4 w-4 mr-2" />
                                      <span>{t('inventory.movements.responsible')}: <span className="font-medium text-slate-900 dark:text-slate-100">{movement.responsable}</span></span>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                      {t('inventory.movements.reason')}: <span className="font-medium text-slate-900 dark:text-slate-100">{movement.reason}</span>
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {t('inventory.movements.unit_val')}: {formatCurrency(movement.valeurUnitaire)}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Quantité et valeur */}
                              <div className="text-right ml-4">
                                <p className={`text-2xl font-bold ${movement.quantity > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('inventory.stats.units')}</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-2">
                                  {formatCurrency(Math.abs(valeurTotale))}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">دج</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Onglet Alertes */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">{t('inventory.tabs.alerts')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inventoryAlerts.map((alert) => (
                  <div key={alert.id} className={`p-4 rounded-lg border ${
                    alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                    alert.severity === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ExclamationTriangleIcon className={`h-6 w-6 ${
                          alert.severity === 'critical' ? 'text-red-600' :
                          alert.severity === 'warning' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                        <div>
                          <p className={`font-medium ${
                            alert.severity === 'critical' ? 'text-red-900' :
                            alert.severity === 'warning' ? 'text-yellow-900' :
                            'text-blue-900'
                          }`}>
                            {alert.message}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Réapprovisionnement */}
          {activeTab === 'reordering' && (
            <div className="space-y-6">
              {/* En-tête */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('inventory.reordering.suggestions')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('inventory.reordering.subtitle')}</p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => alert(`📊 ${t('inventory.actions.export')}...\n\nFichier Excel généré avec succès !`)}
                    className="flex items-center px-4 py-2.5 bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 text-white rounded-lg transition-all shadow-sm font-medium space-x-2"
                  >
                    <DocumentTextIcon className="h-4 w-4" />
                    <span>{t('inventory.actions.export')}</span>
                  </button>
                  <button 
                    onClick={() => {
                      const totalCost = reorderSuggestions.reduce((sum, a) => sum + a.coutEstime, 0);
                      const totalQuantity = reorderSuggestions.reduce((sum, a) => sum + a.suggestedOrder, 0);
                      alert(`🛒 ${t('inventory.actions.order_all')}\n\n` +
                            `${t('inventory.table.quantity')} : ${totalQuantity} ${t('inventory.stats.units')}\n` +
                            `${t('inventory.reordering.est_cost')} : ${formatCurrency(totalCost)}\n\n` +
                            `✅ ${reorderSuggestions.length} ${t('crm.suppliers.purchase_orders')} ${t('common.success')}`);
                    }}
                    className="flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-sm font-medium space-x-2"
                  >
                    <ShoppingCartIcon className="h-4 w-4" />
                    <span>{t('inventory.actions.order_all')}</span>
                  </button>
                </div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-5 rounded-xl border border-red-200 dark:border-red-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">{t('inventory.reordering.high_urgency')}</p>
                      <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                        {reorderSuggestions.filter(a => a.urgency === 'high').length}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{t('inventory.reordering.critical_articles')}</p>
                </div>
                    <div className="p-3 bg-red-200 dark:bg-red-800 rounded-lg">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-700 dark:text-red-300" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-5 rounded-xl border border-amber-200 dark:border-amber-700">
                  <div className="flex items-center justify-between">
                            <div>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">{t('inventory.reordering.medium_urgency')}</p>
                      <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                        {reorderSuggestions.filter(a => a.urgency === 'medium').length}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{t('inventory.reordering.to_watch')}</p>
                            </div>
                    <div className="p-3 bg-amber-200 dark:bg-amber-800 rounded-lg">
                      <ClockIcon className="h-6 w-6 text-amber-700 dark:text-amber-300" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 p-5 rounded-xl border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('common.total')} {t('inventory.table.article')}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{reorderSuggestions.length}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{t('inventory.stats.to_reorder')}</p>
                    </div>
                    <div className="p-3 bg-slate-200 dark:bg-slate-600 rounded-lg">
                      <CubeIcon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-5 rounded-xl border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">{t('inventory.reordering.est_cost')}</p>
                      <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                        {formatCurrency(reorderSuggestions.reduce((sum, a) => sum + a.coutEstime, 0))}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{t('inventory.reordering.total_orders')}</p>
                    </div>
                    <div className="p-3 bg-emerald-200 dark:bg-emerald-800 rounded-lg">
                      <CurrencyDollarIcon className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Articles à réapprovisionner */}
              <div className="space-y-4">
                {reorderSuggestions.map((article) => {
                  const urgencyConfig: Record<string, {
                    bg: string;
                    border: string;
                    text: string;
                    badge: string;
                    icon: string;
                    label: string;
                  }> = {
                                    high: {
                      bg: 'bg-red-50 dark:bg-red-900/20',
                      border: 'border-red-200 dark:border-red-700',
                      text: 'text-red-700 dark:text-red-300',
                      badge: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700',
                      icon: 'text-red-600 dark:text-red-400',
                      label: '🔴 ' + t('inventory.reordering.high_urgency')
                    },
                    medium: {
                      bg: 'bg-amber-50 dark:bg-amber-900/20',
                      border: 'border-amber-200 dark:border-amber-700',
                      text: 'text-amber-700 dark:text-amber-300',
                      badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700',
                      icon: 'text-amber-600 dark:text-amber-400',
                      label: '🟡 ' + t('inventory.reordering.medium_urgency')
                    },
                    low: {
                      bg: 'bg-slate-50 dark:bg-slate-800',
                      border: 'border-slate-200 dark:border-slate-700',
                      text: 'text-slate-700 dark:text-slate-300',
                      badge: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
                      icon: 'text-slate-600 dark:text-slate-400',
                      label: '🟢 ' + t('inventory.reordering.low_urgency')
                    }
                  };

                  const config = urgencyConfig[article.urgency];
                  const stockPourcentage = (article.stock / article.stockOptimal) * 100;

                  return (
                    <div 
                      key={article.id}
                      className={`bg-white dark:bg-slate-800 rounded-xl border-2 ${config.border} overflow-hidden hover:shadow-lg transition-all`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          {/* Informations principales */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className={`p-2 rounded-lg ${config.bg} border ${config.border}`}>
                                <CubeIcon className={`h-6 w-6 ${config.icon}`} />
                              </div>
                            <div>
                                <h5 className="text-lg font-bold text-slate-900 dark:text-slate-100">{article.nom}</h5>
                                <p className="text-sm text-slate-600 dark:text-slate-400">{article.codePCA} • {article.categorie}</p>
                              </div>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${config.badge}`}>
                                {config.label}
                            </span>
                            </div>

                            {/* Barre de progression du stock */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-slate-600 dark:text-slate-400">{t('inventory.status.available')}</span>
                                <span className="font-semibold text-slate-900 dark:text-slate-100">{article.stock} / {article.stockOptimal} {t('inventory.stats.units')}</span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all ${
                                    article.urgency === 'high' ? 'bg-red-600' :
                                    article.urgency === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                  } ${percentToWidth(Math.min(stockPourcentage, 100))}`}
                                />
                              </div>
                            </div>

                            {/* Détails en grille */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="space-y-1">
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('inventory.reordering.stock_min')}</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{article.stockMinimum} {t('inventory.stats.units')}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('inventory.reordering.suggested_order')}</p>
                                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">+{article.suggestedOrder} {t('inventory.stats.units')}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('inventory.reordering.lead_time')}</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{article.delaiLivraison} {t('common.days')}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('inventory.reordering.est_cost')}</p>
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(article.coutEstime)}</p>
                              </div>
                            </div>

                            {/* Informations fournisseur */}
                            <div className="mt-4 flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                              <div className="flex items-center space-x-2">
                                <TruckIcon className="h-4 w-4" />
                                <span>{t('inventory.movements.provider')}: <span className="font-medium text-slate-900 dark:text-slate-100">{article.fournisseurPrincipal}</span></span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <ClockIcon className="h-4 w-4" />
                                <span>{t('inventory.reordering.last_purchase')}: <span className="font-medium text-slate-900 dark:text-slate-100">{article.dernierAchat}</span></span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="ml-6 flex flex-col space-y-2">
                            <button 
                              onClick={() => {
                                setSelectedReorderArticle(article);
                                setShowOrderModal(true);
                              }}
                              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2 whitespace-nowrap"
                            >
                              <ShoppingCartIcon className="h-4 w-4" />
                              <span>{t('inventory.actions.order')}</span>
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedReorderArticle(article);
                                setShowDetailModal(true);
                              }}
                              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors font-medium"
                            >
                              {t('inventory.actions.view_details')}
                            </button>
                </div>
              </div>
                      </div>
                </div>
                  );
                })}
              </div>

              {reorderSuggestions.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <CubeIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">{t('inventory.reordering.no_reorder_suggestion')}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{t('inventory.reordering.opt_level_msg')}</p>
                </div>
              )}
            </div>
          )}

          {/* Onglet Codes-barres enrichi */}
          {activeTab === 'barcode' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('inventory.barcode.title')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('inventory.barcode.subtitle')}</p>
                </div>
                <button 
                  onClick={() => alert(`🖨️ Impression groupée de codes-barres\n\n${filteredAndSortedArticles.length} étiquettes à imprimer\nFormat: EAN-13 (50x30mm)\n\n✅ Envoi vers l'imprimante...`)}
                  className="flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all shadow-sm font-medium space-x-2"
                >
                  <PrinterIcon className="h-4 w-4" />
                  <span>{t('inventory.actions.print_barcode')}</span>
                </button>
              </div>

              {/* Statistiques codes-barres */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 rounded-xl border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">{t('inventory.barcode.scanned')}</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">0</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{t('inventory.movements.units_month')}</p>
                    </div>
                    <div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-lg">
                      <FunnelIcon className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-5 rounded-xl border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">{t('inventory.barcode.generated')}</p>
                      <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{products.length}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{t('common.total')}</p>
                    </div>
                    <div className="p-3 bg-emerald-200 dark:bg-emerald-800 rounded-lg">
                      <CheckCircleIcon className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 p-5 rounded-xl border border-slate-200 dark:border-slate-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('inventory.barcode.missing')}</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">0</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{t('inventory.barcode.to_generate')}</p>
                    </div>
                    <div className="p-3 bg-slate-200 dark:bg-slate-600 rounded-lg">
                      <ExclamationTriangleIcon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des articles avec codes-barres */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('inventory.barcode.recent_articles')}</h4>
                </div>
                <div className="p-6 space-y-4">
                  {filteredAndSortedArticles.slice(0, 5).map((article) => (
                    <div key={article.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                          <FunnelIcon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-900 dark:text-slate-100">{article.nom}</h5>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{article.codePCA}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedBarcodeArticle(article);
                            setShowBarcodeModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          {t('inventory.actions.generate')}
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedBarcodeArticle(article);
                            setShowBarcodeModal(true);
                          }}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors"
                          aria-label="Imprimer l'étiquette"
                          title="Imprimer l'étiquette"
                        >
                          <PrinterIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Onglet Rapports enrichi avec graphiques */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('inventory.reports.title')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('inventory.reports.subtitle')}</p>
                </div>
                <button 
                  onClick={handleExportStock}
                  className="flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg transition-all shadow-sm font-medium space-x-2"
                >
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>{t('common.new_report', { defaultValue: 'Nouveau Rapport' })}</span>
                </button>
              </div>

              {/* Types de rapports */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { 
                    title: t('inventory.reports.full_stock'), 
                    icon: CubeIcon, 
                    color: 'blue', 
                    desc: 'Vue d\'ensemble de tous les articles', 
                    count: `${products.length} articles`,
                    details: `Contenu du rapport:\n- Liste complète de ${products.length} articles\n- Valeur totale: ${formatCurrency(totalStock)}\n- Répartition par catégorie\n- Niveaux de stock\n- Historique des mouvements`
                  },
                  {
                    title: t('inventory.reports.monthly_moves'),
                    icon: ArrowPathIcon,
                    color: 'emerald',
                    desc: 'Entrées et sorties mensuelles',
                    count: `${stockMovements.length} mouvements`,
                    details: `Contenu du rapport:\n- ${stockMovements.length} mouvements enregistrés\n- Entrées: +${stockMovements.filter(m => m.type === 'in').reduce((s, m) => s + m.quantity, 0)} unités\n- Sorties: -${stockMovements.filter(m => m.type === 'out').reduce((s, m) => s + Math.abs(m.quantity), 0)} unités\n- Détail par fournisseur/client`
                  },
                  {
                    title: t('inventory.reports.stock_valuation'),
                    icon: CurrencyDollarIcon,
                    color: 'amber',
                    desc: 'Valorisation totale des stocks',
                    count: formatCurrency(totalStock),
                    details: `Contenu du rapport:\n- Valeur totale: ${formatCurrency(totalStock)}\n- Répartition par catégorie\n- Articles à forte valeur\n- Comparaison avec objectifs`
                  },
                  {
                    title: t('inventory.reports.alert_summary'),
                    icon: ExclamationTriangleIcon,
                    color: 'red',
                    desc: 'Stock faible et ruptures',
                    count: `${reorderSuggestions.length} articles`,
                    details: `Contenu du rapport:\n- ${reorderSuggestions.filter(a => a.urgency === 'high').length} articles en urgence élevée\n- ${reorderSuggestions.filter(a => a.urgency === 'medium').length} articles en urgence moyenne\n- Coût total réapprovisionnement: ${formatCurrency(reorderSuggestions.reduce((sum, a) => sum + a.coutEstime, 0))}\n- Recommandations de commande`
                  },
                  {
                    title: t('inventory.reports.rotation_rate'),
                    icon: ArrowPathIcon,
                    color: 'purple',
                    desc: 'Taux de rotation des stocks',
                    count: 'N/A',
                    details: `Contenu du rapport:\n- Articles à rotation rapide\n- Articles à rotation lente\n- Recommandations d'optimisation`
                  },
                  { 
                    title: t('inventory.reports.abc_analysis'), 
                    icon: ChartBarIcon, 
                    color: 'slate', 
                    desc: 'Classification par valeur', 
                    count: 'A:20% B:30% C:50%',
                    details: `Contenu du rapport:\n- Catégorie A: ${Math.floor(products.length * 0.20)} articles (80% valeur)\n- Catégorie B: ${Math.floor(products.length * 0.30)} articles (15% valeur)\n- Catégorie C: ${Math.floor(products.length * 0.50)} articles (5% valeur)\n- Stratégies de gestion par catégorie`
                  }
                ].map((report, index) => {
                  const colorConfig: Record<string, any> = {
                    blue: { bg: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20', border: 'border-blue-200 dark:border-blue-700', text: 'text-blue-700 dark:text-blue-300', icon: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-200 dark:bg-blue-800' },
                    emerald: { bg: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20', border: 'border-emerald-200 dark:border-emerald-700', text: 'text-emerald-700 dark:text-emerald-300', icon: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-200 dark:bg-emerald-800' },
                    amber: { bg: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20', border: 'border-amber-200 dark:border-amber-700', text: 'text-amber-700 dark:text-amber-300', icon: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-200 dark:bg-amber-800' },
                    red: { bg: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20', border: 'border-red-200 dark:border-red-700', text: 'text-red-700 dark:text-red-300', icon: 'text-red-600 dark:text-red-400', iconBg: 'bg-red-200 dark:bg-red-800' },
                    purple: { bg: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20', border: 'border-purple-200 dark:border-purple-700', text: 'text-purple-700 dark:text-purple-300', icon: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-200 dark:bg-purple-800' },
                    slate: { bg: 'from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700', border: 'border-slate-200 dark:border-slate-600', text: 'text-slate-700 dark:text-slate-300', icon: 'text-slate-600 dark:text-slate-400', iconBg: 'bg-slate-200 dark:bg-slate-600' }
                  };
                  const config = colorConfig[report.color];
                  const Icon = report.icon;
                  const pages = 0;

                  return (
                    <div 
                      key={index} 
                      className={`bg-gradient-to-br ${config.bg} p-5 rounded-xl border ${config.border} hover:shadow-lg transition-all cursor-pointer`}
                      onClick={() => {
                        alert(`📊 GÉNÉRATION DU RAPPORT\n\n` +
                              `📄 Titre: ${report.title}\n` +
                              `📋 Description: ${report.desc}\n` +
                              `📊 Données: ${report.count}\n` +
                              `📑 Pages estimées: ${pages}\n` +
                              `📅 Date: ${new Date().toLocaleDateString('fr-FR')}\n\n` +
                              `${report.details}\n\n` +
                              `✅ Rapport généré avec succès !\n` +
                              `💾 Format: PDF\n` +
                              `📂 Enregistré dans: Rapports/Inventaire/`);
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`p-3 ${config.iconBg} rounded-lg`}>
                          <Icon className={`h-6 w-6 ${config.icon}`} />
                        </div>
                      </div>
                      <h4 className={`text-lg font-bold ${config.text} mb-1`}>{report.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{report.desc}</p>
                      <p className={`text-sm font-semibold ${config.text}`}>{report.count}</p>
                    </div>
                  );
                })}
              </div>

              {/* Graphiques d'analyse */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graphique Évolution du Stock */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('inventory.reports.stock_valuation')} (6 {t('common.months', { defaultValue: 'derniers mois' })})</h4>
                  <div className="h-64">
                    <Line
                      data={{
                        labels: [t('inventory.tabs.stock')],
                        datasets: [
                          {
                            label: t('inventory.reports.stock_valuation'),
                            data: [totalStock],
                            borderColor: '#3B82F6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                            fill: true
                          },
                          {
                            label: t('inventory.stats.total_items'),
                            data: [products.reduce((sum, a) => sum + a.stock, 0)],
                            borderColor: '#10B981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            fill: true,
                            yAxisID: 'y1'
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                          },
                        },
                        scales: {
                          y: {
                            type: 'linear' as const,
                            display: true,
                            position: 'left' as const,
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return formatCurrency(value as number);
                              }
                            }
                          },
                          y1: {
                            type: 'linear' as const,
                            display: true,
                            position: 'right' as const,
                            beginAtZero: true,
                            grid: {
                              drawOnChartArea: false,
                            },
                          },
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Graphique Répartition par Catégorie */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('inventory.tabs.stock')} {t('common.by_category', { defaultValue: 'par Catégorie' })}</h4>
                  <div className="h-64">
                    <Doughnut
                      data={{
                        labels: Object.keys(categoriesStock),
                        datasets: [{
                          data: Object.values(categoriesStock),
                          backgroundColor: [
                            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'
                          ],
                          borderColor: [
                            '#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#DB2777'
                          ],
                          borderWidth: 2
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom' as const,
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0) as number;
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                              }
                            }
                          }
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Graphique Mouvements Mensuels */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('inventory.tabs.movements')} {t('common.monthly', { defaultValue: 'Mensuels' })}</h4>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: [t('inventory.movements.transactions')],
                        datasets: [
                          {
                            label: t('inventory.movements.in'),
                            data: [stockMovements.filter(m => m.type === 'in').reduce((s, m) => s + m.quantity, 0)],
                            backgroundColor: '#10B981',
                            borderColor: '#059669',
                            borderWidth: 1
                          },
                          {
                            label: t('inventory.movements.out'),
                            data: [stockMovements.filter(m => m.type === 'out').reduce((s, m) => s + Math.abs(m.quantity), 0)],
                            backgroundColor: '#EF4444',
                            borderColor: '#DC2626',
                            borderWidth: 1
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Graphique Analyse ABC */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{t('inventory.reports.abc_analysis')} - {t('common.classification_by_value', { defaultValue: 'Classification par Valeur' })}</h4>
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: ['Catégorie A\n(Haute Valeur)', 'Catégorie B\n(Valeur Moyenne)', 'Catégorie C\n(Faible Valeur)'],
                        datasets: [{
                          label: t('inventory.stats.total_items'),
                          data: [
                            Math.floor(products.length * 0.20),
                            Math.floor(products.length * 0.30),
                            Math.floor(products.length * 0.50)
                          ],
                          backgroundColor: [
                            '#10B981',
                            '#F59E0B',
                            '#64748B'
                          ],
                          borderColor: [
                            '#059669',
                            '#D97706',
                            '#475569'
                          ],
                          borderWidth: 2
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">{t('inventory.sections.abc.cat_a')}</p>
                      <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100">20%</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{t('inventory.sections.abc.value_a')}</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <p className="text-xs text-amber-600 dark:text-amber-400">{t('inventory.sections.abc.cat_b')}</p>
                      <p className="text-lg font-bold text-amber-900 dark:text-amber-100">30%</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{t('inventory.sections.abc.value_b')}</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                      <p className="text-xs text-slate-600 dark:text-slate-400">{t('inventory.sections.abc.cat_c')}</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">50%</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{t('inventory.sections.abc.value_c')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistiques détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 rounded-xl border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">{t('inventory.status.normal')}</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {products.filter(a => a.stock > 50).length}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{t('inventory.stats.articles_count')}</p>
                    </div>
                    <div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-lg">
                      <CheckCircleIcon className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-5 rounded-xl border border-amber-200 dark:border-amber-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-1">{t('inventory.status.low')}</p>
                      <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                        {products.filter(a => a.stock <= 50 && a.stock > 20).length}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{t('inventory.stats.articles_count')}</p>
                    </div>
                    <div className="p-3 bg-amber-200 dark:bg-amber-800 rounded-lg">
                      <ExclamationTriangleIcon className="h-6 w-6 text-amber-700 dark:text-amber-300" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-5 rounded-xl border border-red-200 dark:border-red-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">{t('inventory.status.critical')}</p>
                      <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                        {products.filter(a => a.stock <= 20).length}
                      </p>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{t('inventory.stats.articles_count')}</p>
                    </div>
                    <div className="p-3 bg-red-200 dark:bg-red-800 rounded-lg">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-700 dark:text-red-300" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-5 rounded-xl border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">{t('inventory.reordering.turnover')}</p>
                      <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">0×</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{t('inventory.reordering.times_per_year')}</p>
                    </div>
                    <div className="p-3 bg-emerald-200 dark:bg-emerald-800 rounded-lg">
                      <ArrowPathIcon className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Historique des rapports */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t('inventory.reports.recent_reports')}</h4>
                </div>
                <div className="p-6 space-y-3">
                  {([] as Array<{ nom: string; date: string; type: string; taille: string; pages: number; auteur: string }>).length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">{t('inventory.reports.no_reports', { defaultValue: 'Aucun rapport disponible' })}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Modal Inventaire Physique */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowInventoryModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('inventory.modal.physical_title')}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('inventory.actions.physical_audit')}</p>
              </div>
              <button 
                onClick={() => setShowInventoryModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                aria-label={t('common.close')}
                title={t('common.close')}
              >
                <XMarkIcon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <MagnifyingGlassIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">{t('inventory.modal.session_active')}</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{t('common.date')}: {new Date().toLocaleDateString()} • {filteredAndSortedArticles.length} {t('inventory.stats.articles_count')}</p>
                  </div>
                </div>
              </div>

              {/* Liste des articles pour comptage */}
              <div className="space-y-3">
                {filteredAndSortedArticles.slice(0, 8).map((article) => (
                  <div key={article.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-slate-900 dark:text-slate-100">{article.nom}</h5>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{article.codePCA} • {article.categorie}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-xs text-slate-500 dark:text-slate-400">{t('inventory.modal.system_stock')}</p>
                          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{article.stock}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('inventory.modal.physical_stock')}</p>
                          <input 
                            type="number" 
                            defaultValue={article.stock}
                            className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded text-center font-semibold"
                            aria-label={t('inventory.modal.physical_stock')}
                          />
                        </div>
                        <button className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors" aria-label={t('inventory.actions.validate')} title={t('inventory.actions.validate')}>
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => setShowInventoryModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    alert('✅ Inventaire physique validé avec succès !');
                    setShowInventoryModal(false);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  {t('inventory.actions.validate')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détails Article */}
      {showDetailModal && selectedReorderArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">📦 Détails de l'Article</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{selectedReorderArticle.codePCA}</p>
              </div>
              <button 
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Fermer"
                title="Fermer"
              >
                <XMarkIcon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Badge d'urgence */}
              <div className={`p-4 rounded-lg border ${
                selectedReorderArticle.urgency === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' :
                selectedReorderArticle.urgency === 'medium' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700' :
                'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
              }`}>
                <div className="flex items-center space-x-3">
                  <ExclamationTriangleIcon className={`h-6 w-6 ${
                    selectedReorderArticle.urgency === 'high' ? 'text-red-600 dark:text-red-400' :
                    selectedReorderArticle.urgency === 'medium' ? 'text-amber-600 dark:text-amber-400' :
                    'text-slate-600 dark:text-slate-400'
                  }`} />
                  <div className="flex-1">
                    <h4 className={`font-semibold ${
                      selectedReorderArticle.urgency === 'high' ? 'text-red-900 dark:text-red-100' :
                      selectedReorderArticle.urgency === 'medium' ? 'text-amber-900 dark:text-amber-100' :
                      'text-slate-900 dark:text-slate-100'
                    }`}>
                      {selectedReorderArticle.urgency === 'high' ? '🔴 Urgence Élevée' :
                       selectedReorderArticle.urgency === 'medium' ? '🟡 Urgence Moyenne' : '🟢 Urgence Faible'}
                    </h4>
                    <p className={`text-sm ${
                      selectedReorderArticle.urgency === 'high' ? 'text-red-700 dark:text-red-300' :
                      selectedReorderArticle.urgency === 'medium' ? 'text-amber-700 dark:text-amber-300' :
                      'text-slate-600 dark:text-slate-400'
                    }`}>
                      Réapprovisionnement {selectedReorderArticle.urgency === 'high' ? 'immédiat' : selectedReorderArticle.urgency === 'medium' ? 'sous 7 jours' : 'à planifier'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informations principales */}
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Informations générales</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Nom de l'article</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedReorderArticle.nom}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Catégorie</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedReorderArticle.categorie}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Code PCA</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedReorderArticle.codePCA}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Prix unitaire</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(selectedReorderArticle.prixUnitaire)}</p>
                  </div>
                </div>
              </div>

              {/* Niveaux de stock */}
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Niveaux de stock</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Stock actuel</span>
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">{selectedReorderArticle.stock} unités</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        selectedReorderArticle.urgency === 'high' ? 'bg-red-600' :
                        selectedReorderArticle.urgency === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                      } ${percentToWidth((selectedReorderArticle.stock / selectedReorderArticle.stockOptimal) * 100)}`}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Stock minimum</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedReorderArticle.stockMinimum} unités</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Stock optimal</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedReorderArticle.stockOptimal} unités</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">À commander</p>
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">+{selectedReorderArticle.suggestedOrder} unités</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations fournisseur */}
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">Fournisseur et logistique</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TruckIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      <p className="text-xs text-slate-500 dark:text-slate-400">Fournisseur principal</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedReorderArticle.fournisseurPrincipal}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <ClockIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      <p className="text-xs text-slate-500 dark:text-slate-400">Délai de livraison</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedReorderArticle.delaiLivraison} jours ouvrés</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Dernier achat</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedReorderArticle.dernierAchat}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Coût estimé</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(selectedReorderArticle.coutEstime)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
                >
                  Fermer
                </button>
                <button 
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowOrderModal(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <ShoppingCartIcon className="h-4 w-4" />
                  <span>Commander</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Commander Article */}
      {showOrderModal && selectedReorderArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowOrderModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">🛒 Bon de Commande</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Créer une commande de réapprovisionnement</p>
              </div>
              <button 
                onClick={() => setShowOrderModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Fermer"
                title="Fermer"
              >
                <XMarkIcon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Récapitulatif article */}
              <div className="bg-slate-50 dark:bg-slate-700/50 p-5 rounded-lg border border-slate-200 dark:border-slate-600">
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">{selectedReorderArticle.nom}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Code: </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedReorderArticle.codePCA}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Stock actuel: </span>
                    <span className="font-semibold text-red-600 dark:text-red-400">{selectedReorderArticle.stock} unités</span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Catégorie: </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedReorderArticle.categorie}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Prix unitaire: </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(selectedReorderArticle.prixUnitaire)}</span>
                  </div>
                </div>
              </div>

              {/* Formulaire de commande */}
              <form className="space-y-4">
                <div>
                  <label htmlFor="order-qty" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Quantité à commander <span className="text-red-600">*</span>
                  </label>
                  <input 
                    id="order-qty"
                    type="number" 
                    defaultValue={selectedReorderArticle.suggestedOrder}
                    min={1}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-semibold text-lg"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Quantité suggérée: {selectedReorderArticle.suggestedOrder} unités (pour atteindre le stock optimal)
                  </p>
                </div>

                <div>
                  <label htmlFor="order-supplier" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Fournisseur <span className="text-red-600">*</span>
                  </label>
                  <select id="order-supplier" className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option>{selectedReorderArticle.fournisseurPrincipal}</option>
                    <option>Fournisseur Alternatif 1</option>
                    <option>Fournisseur Alternatif 2</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="order-date" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Date de livraison souhaitée
                    </label>
                    <input 
                      id="order-date"
                      type="date" 
                      defaultValue={new Date(Date.now() + selectedReorderArticle.delaiLivraison * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="order-priority" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Priorité
                    </label>
                    <select 
                      id="order-priority"
                      defaultValue={selectedReorderArticle.urgency}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="high">🔴 Urgente</option>
                      <option value="medium">🟡 Normale</option>
                      <option value="low">🟢 Faible</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Notes / Instructions spéciales
                  </label>
                  <textarea 
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Ajouter des instructions particulières pour cette commande..."
                  />
                </div>

                {/* Récapitulatif du coût */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 p-5 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-emerald-700 dark:text-emerald-300">Coût estimé total:</span>
                    <span className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                      {formatCurrency(selectedReorderArticle.coutEstime)}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Délai de livraison: {selectedReorderArticle.delaiLivraison} jours ouvrés
                  </p>
                </div>
              </form>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => {
                    alert(`✅ Bon de commande créé avec succès !\n\nArticle: ${selectedReorderArticle.nom}\nQuantité: ${selectedReorderArticle.suggestedOrder} unités\nFournisseur: ${selectedReorderArticle.fournisseurPrincipal}\nMontant: ${formatCurrency(selectedReorderArticle.coutEstime)}`);
                    setShowOrderModal(false);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Valider la Commande</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Génération Code-barres */}
      {showBarcodeModal && selectedBarcodeArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowBarcodeModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">📊 Génération de Code-barres</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Code EAN-13 / Code 128</p>
              </div>
              <button 
                onClick={() => setShowBarcodeModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Fermer"
                title="Fermer"
              >
                <XMarkIcon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informations article */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 p-5 rounded-lg">
                <h4 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2">{selectedBarcodeArticle.nom}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Code PCA: </span>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">{selectedBarcodeArticle.codePCA}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Catégorie: </span>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">{selectedBarcodeArticle.categorie}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Stock: </span>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">{selectedBarcodeArticle.stock} unités</span>
                  </div>
                  <div>
                    <span className="text-blue-700 dark:text-blue-300">Prix: </span>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">{formatCurrency(selectedBarcodeArticle.prixUnitaire)}</span>
                  </div>
                </div>
              </div>

              {/* Visualisation du code-barres */}
              <div className="bg-white dark:bg-slate-700 p-8 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-center">
                <div className="bg-white p-6 rounded-lg inline-block">
                  {/* Barres verticales représentant le code-barres */}
                  <div className="flex items-end justify-center space-x-0.5 mb-4">
                    {Array.from({ length: 95 }).map((_, i) => {
                      const heightClass = i % 3 === 0 ? 'h-16' : 'h-12';
                      const opacityClass = i % 7 === 0 ? 'opacity-0' : 'opacity-100';
                      return (
                        <div 
                          key={i}
                          className={`bg-black w-[2px] ${heightClass} ${opacityClass}`}
                        />
                      );
                    })}
                  </div>
                  <p className="font-mono text-sm font-bold text-slate-900 mb-1">
                    {selectedBarcodeArticle.codePCA.replace(/\D/g, '').padStart(13, '8')}
                  </p>
                  <p className="text-xs text-slate-600 uppercase tracking-wider">{selectedBarcodeArticle.nom}</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">Format: EAN-13 / Code 128</p>
              </div>

              {/* Options de génération */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Options d'impression</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="barcode-format" className="block text-sm text-slate-600 dark:text-slate-400 mb-2">Format</label>
                    <select id="barcode-format" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>EAN-13 (Standard)</option>
                      <option>Code 128</option>
                      <option>QR Code</option>
                      <option>DataMatrix</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="barcode-qty" className="block text-sm text-slate-600 dark:text-slate-400 mb-2">Quantité d'étiquettes</label>
                    <input 
                      id="barcode-qty"
                      type="number" 
                      defaultValue={10}
                      min={1}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="barcode-size" className="block text-sm text-slate-600 dark:text-slate-400 mb-2">Taille</label>
                    <select id="barcode-size" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>Petit (30x20mm)</option>
                      <option selected>Moyen (50x30mm)</option>
                      <option>Grand (70x40mm)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="barcode-price" className="block text-sm text-slate-600 dark:text-slate-400 mb-2">Inclure le prix</label>
                    <select id="barcode-price" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>Oui</option>
                      <option selected>Non</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Informations techniques */}
              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Code généré</p>
                    <p className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {selectedBarcodeArticle.codePCA.replace(/\D/g, '').padStart(13, '8')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Type</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">EAN-13</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Date de création</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{new Date().toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => setShowBarcodeModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
                >
                  Fermer
                </button>
                <button 
                  onClick={() => alert(`📥 Code-barres téléchargé avec succès !\n\nFichier: ${selectedBarcodeArticle.nom}_barcode.pdf`)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  <span>Télécharger PDF</span>
                </button>
                <button 
                  onClick={() => alert(`🖨️ Impression de 10 étiquettes en cours...\n\nArticle: ${selectedBarcodeArticle.nom}\nFormat: EAN-13 (50x30mm)`)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <PrinterIcon className="h-5 w-5" />
                  <span>Imprimer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventaire;


