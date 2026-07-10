import React, { useState } from 'react';
import {
  DocumentTextIcon,
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  TagIcon,
  CurrencyDollarIcon,
  CubeIcon,
  BuildingOfficeIcon,
  TruckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  ArrowPathIcon,
  ShoppingCartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut, PolarArea, Radar, Bubble } from 'react-chartjs-2';
import { useTheme } from '@core/context/ThemeContext';
import { useApp } from '@core/context/AppContext';
import Card from '../UI/Card';

interface RapportsArticlesWidgetProps {
  period?: string;
  articles?: any[];
  stats?: any;
}

const RapportsArticlesWidget: React.FC<RapportsArticlesWidgetProps> = ({ period = 'mois', articles = [], stats }) => {
  const { user, companyData, formatCurrency, currentDevise } = useApp();
  const { currentTheme } = useTheme();
  const [activeView, setActiveView] = useState<'overview' | 'ventes' | 'stock' | 'performance' | 'analytique'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('tous');
  const [selectedPeriod, setSelectedPeriod] = useState('mois');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null);
  const [isFournisseurModalOpen, setIsFournisseurModalOpen] = useState(false);
  const [isEditFournisseurModalOpen, setIsEditFournisseurModalOpen] = useState(false);
  const [editFournisseurData, setEditFournisseurData] = useState<any>({});

  const statsGenerales = {
    totalArticles: 0,
    articlesActifs: 0,
    articlesEnRupture: 0,
    articlesStockFaible: 0,
    valeurStock: 0,
    chiffreAffaires: 0,
    margeBrute: 0,
    tauxRotation: 0
  };

  const articlesPerformance: any[] = [];

  const ventesParCategorie = {
    labels: ['Informatique', 'Mobilier', 'Téléphonie', 'Électronique', 'Accessoires'],
    datasets: [{
      label: `Chiffre d'Affaires (${currentDevise || 'DA'})`,
      data: [0, 0, 0, 0, 0],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ],
      borderColor: [
        '#2563EB',
        '#059669',
        '#D97706',
        '#DC2626',
        '#7C3AED'
      ],
      borderWidth: 2
    }]
  };

  const displayedStats = stats || statsGenerales;
  const displayedArticles = articles.length > 0 ? articles : articlesPerformance;

  // Calcul de la répartition du stock basée sur les articles réels si disponibles
  const stockDistributionData = articles.length > 0 ? [
    articles.filter(a => a.stock > 20).length,
    articles.filter(a => a.stock <= 20 && a.stock > 0).length,
    articles.filter(a => a.stock === 0).length,
    articles.filter(a => a.stock > 100).length
  ] : [0, 0, 0, 0];

  const evolutionVentes = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [{
      label: 'Ventes',
      // On base les ventes sur la valeur totale pour la cohérence
      data: [
        displayedStats.totalValue * 0.7,
        displayedStats.totalValue * 0.8,
        displayedStats.totalValue * 0.75,
        displayedStats.totalValue * 0.9,
        displayedStats.totalValue * 0.95,
        displayedStats.totalValue
      ],
      borderColor: '#0F172A',
      backgroundColor: 'rgba(15, 23, 42, 0.05)',
      tension: 0.4,
      fill: true,
      borderWidth: 4,
      pointRadius: 6,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#0F172A',
      pointBorderWidth: 2
    }]
  };

  const repartitionStock = {
    labels: ['Stock Normal', 'Stock Faible', 'En Rupture', 'Surstock'],
    datasets: [{
      data: stockDistributionData,
      backgroundColor: [
        '#0F172A', // Slate 900
        '#64748B', // Slate 500
        '#EF4444', // Red 500
        '#334155'  // Slate 700
      ],
      hoverOffset: 20,
      borderWidth: 0
    }]
  };

  const performanceFournisseurs: any[] = [];

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'actif': return 'text-green-600 bg-green-50 border-green-200';
      case 'stock-faible': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rupture': return 'text-red-600 bg-red-50 border-red-200';
      case 'surstock': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'actif': return CheckCircleIcon;
      case 'stock-faible': return ExclamationTriangleIcon;
      case 'rupture': return XCircleIcon;
      case 'surstock': return ClockIcon;
      default: return CubeIcon;
    }
  };

  // Fonctions pour gérer les actions
  const handleViewDetails = (article: any) => {
    setSelectedArticle(article);
    setIsDetailModalOpen(true);
  };

  const handleEditArticle = (article: any) => {
    setSelectedArticle(article);
    setIsEditModalOpen(true);
  };

  const handleDeleteArticle = (articleId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      console.log('Suppression de l\'article:', articleId);
      // Ici vous pouvez ajouter la logique de suppression
    }
  };

  const handleExportArticles = () => {
    console.log('Export des articles...');
    // Ici vous pouvez ajouter la logique d'export
  };

  // Gestion du fournisseur
  const handleEditFournisseur = (fournisseur: any) => {
    setSelectedFournisseur(fournisseur);
    setEditFournisseurData({ ...fournisseur });
    setIsEditFournisseurModalOpen(true);
  };

  const handleSaveFournisseur = () => {
    console.log('Sauvegarde des modifications:', editFournisseurData);
    // Ici vous pouvez ajouter la logique de sauvegarde API
    alert(`✅ Modifications sauvegardées pour ${editFournisseurData.fournisseur}`);
    setIsEditFournisseurModalOpen(false);
  };

  const handleContactFournisseur = (fournisseur: any) => {
    console.log('Contact du fournisseur:', fournisseur.fournisseur);
    alert(`📞 Appel en cours vers ${fournisseur.fournisseur}\n\n📱 +213 (0) 23 456 789\n\nCette fonctionnalité peut être connectée à votre système VoIP.`);
  };

  const handlePrintArticle = (article: any) => {
    console.log('Impression de l\'article:', article.id);
    // Ici vous pouvez ajouter la logique d'impression
  };

  const handleReorderArticle = (article: any) => {
    console.log('Commande de réapprovisionnement pour:', article.id);
    // Ici vous pouvez ajouter la logique de commande
  };

  const renderOverview = () => (
    <div className="space-y-10">
      {/* Barre de résumé analytique */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Valeur Totale Stock', value: formatCurrency(displayedStats.totalValue), icon: CurrencyDollarIcon, color: 'text-slate-900' },
          { label: 'Articles en Catalogue', value: displayedArticles.length, icon: CubeIcon, color: 'text-slate-900' },
          { label: 'Besoin Réappro.', value: displayedStats.lowStock || 0, icon: ExclamationTriangleIcon, color: 'text-amber-600' },
          { label: 'Taux de Rotation', value: '8.5x', icon: ArrowPathIcon, color: 'text-blue-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-slate-900 transition-all">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
              <p className={`text-xl font-black font-mono tracking-tighter ${stat.color}`}>{stat.value}</p>
            </div>
            <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all text-slate-400">
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
            <ArrowTrendingUpIcon className="h-32 w-32 text-slate-900" />
          </div>
          <h4 className="text-xl font-black uppercase tracking-tighter italic mb-8 flex items-center gap-3">
            <div className="h-2 w-2 bg-slate-900 rounded-full animate-pulse"></div>
            Évolution des Ventes
          </h4>
          <div className="h-64">
            <Line
              data={evolutionVentes}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: '#0F172A',
                    titleFont: { size: 10, weight: 'bold' },
                    bodyFont: { size: 12, weight: 'bold' },
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                      label: (context) => formatCurrency(context.parsed.y || 0)
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.03)', drawTicks: false },
                    border: { display: false },
                    ticks: {
                      font: { size: 9, weight: 'bold' },
                      color: '#94a3b8',
                      callback: (value) => formatCurrency(Number(value))
                    }
                  },
                  x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: { font: { size: 9, weight: 'bold' }, color: '#94a3b8' }
                  }
                }
              }}
            />
          </div>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
            <CubeIcon className="h-32 w-32 text-slate-900" />
          </div>
          <h4 className="text-xl font-black uppercase tracking-tighter italic mb-8 flex items-center gap-3">
            <div className="h-2 w-2 bg-slate-400 rounded-full"></div>
            Répartition du Stock
          </h4>
          <div className="h-64">
            <Doughnut
              data={repartitionStock}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      usePointStyle: true,
                      pointStyle: 'circle',
                      padding: 20,
                      font: { size: 10, weight: 'bold' },
                      color: '#64748b'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Top Articles List */}
      <div className="space-y-6">
        <div className="px-4">
          <h4 className="text-xl font-black uppercase tracking-tighter italic">Top Articles les Plus Performants</h4>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Analyse basée sur le stock et la valorisation actuelle</p>
        </div>
        <div className="space-y-3">
          {displayedArticles.slice(0, 5).map((article: any, index: number) => (
            <div key={article.id || index} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-sm italic ${index === 0 ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400'
                  }`}>
                  #{index + 1}
                </div>
                <div>
                  <h5 className="text-sm font-black uppercase tracking-tight text-slate-900">{article.nom}</h5>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {article.codePCA || article.code} <span className="mx-2 opacity-30">•</span> {article.categorie}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-6 sm:gap-12 border-t sm:border-t-0 sm:border-l border-slate-50 pt-6 sm:pt-0 sm:pl-12">
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Stock</p>
                  <p className="text-lg font-black font-mono text-slate-900">{article.stock}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Prix Unit.</p>
                  <p className="text-lg font-black font-mono text-blue-600">{formatCurrency(article.prixUnitaire || article.prixVente)}</p>
                </div>
                <div className="text-center min-w-[120px]">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Valeur</p>
                  <p className="text-lg font-black font-mono text-emerald-600">{formatCurrency((article.prixUnitaire || article.prixVente) * article.stock)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderVentes = () => {
    const tendanceMensuelle = {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
      datasets: [
        {
          label: 'Ventes',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: 'rgb(71, 85, 105)',
          backgroundColor: 'rgba(71, 85, 105, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Objectif',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.4
        }
      ]
    };

    const ventesParCanal = {
      labels: ['E-commerce', 'Magasin', 'B2B', 'Distributeurs'],
      datasets: [{
        data: [0, 0, 0, 0],
        backgroundColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(139, 92, 246)',
          'rgb(245, 158, 11)'
        ],
        borderWidth: 0
      }]
    };

    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h4 className="text-xl font-black uppercase tracking-tighter italic">Analyse des Ventes & Rentabilité</h4>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Pilotage de la performance commerciale</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-slate-500"
            >
              <option value="tous">Toutes les catégories</option>
              <option value="Informatique">Informatique</option>
              <option value="Mobilier">Mobilier</option>
              <option value="Téléphonie">Téléphonie</option>
              <option value="Électronique">Électronique</option>
              <option value="Accessoires">Accessoires</option>
            </select>
            <button
              onClick={handleExportArticles}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg flex items-center space-x-2 transition-colors"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              <span>Exporter</span>
            </button>
          </div>
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-md font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded mr-2">
                  <ChartBarIcon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                </div>
                Ventes par Catégorie
              </h5>
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Ce mois</span>
            </div>
            <div className="h-64">
              <Bar
                data={ventesParCategorie}
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
                      beginAtZero: true,
                      ticks: {
                        callback: function (value) {
                          return formatCurrency(value as number);
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-md font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded mr-2">
                  <StarIcon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                </div>
                Top Articles Performants
              </h5>
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Top 5</span>
            </div>
            <div className="space-y-3">
              {articlesPerformance.slice(0, 5).map((article, index) => (
                <div key={article.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' :
                      index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white' :
                        index === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white' :
                          'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                      }`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{article.nom}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{article.categorie}</p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{formatCurrency(article.chiffreAffaires)}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{article.ventesMois} ventes</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Graphiques avancés */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tendance mensuelle */}
          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-md font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded mr-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                </div>
                Tendance Mensuelle
              </h5>
              <div className="flex items-center space-x-2">
                <span className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                  <div className="w-3 h-3 bg-slate-700 rounded-full mr-1"></div>
                  Ventes
                </span>
                <span className="flex items-center text-xs text-emerald-600 dark:text-emerald-400">
                  <div className="w-3 h-1 bg-emerald-600 mr-1"></div>
                  Objectif
                </span>
              </div>
            </div>
            <div className="h-64">
              <Line
                data={tendanceMensuelle}
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
                      beginAtZero: true,
                      ticks: {
                        callback: function (value) {
                          return formatCurrency(value as number);
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </Card>

          {/* Répartition par canal */}
          <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-md font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded mr-2">
                  <ShoppingCartIcon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                </div>
                Répartition par Canal
              </h5>
              <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">4 canaux</span>
            </div>
            <div className="h-64">
              <Doughnut
                data={ventesParCanal}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                  },
                }}
              />
            </div>
          </Card>
        </div>

      </div>
    );
  };

  const renderStock = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">Gestion du Stock</h4>

      <div className="space-y-4">
        {articlesPerformance.map((article) => {
          const StatutIcon = getStatutIcon(article.statut);
          return (
            <Card key={article.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <StatutIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h5 className="text-sm font-semibold text-gray-900">{article.nom}</h5>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatutColor(article.statut)}`}>
                        {article.statut.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Code: <span className="font-medium">{article.code}</span></p>
                        <p className="text-gray-600">Catégorie: <span className="font-medium">{article.categorie}</span></p>
                      </div>
                      <div>
                        <p className="text-gray-600">Stock: <span className="font-medium">{article.stock}</span></p>
                        <p className="text-gray-600">Stock Min: <span className="font-medium">{article.stockMin}</span></p>
                      </div>
                      <div>
                        <p className="text-gray-600">Prix: <span className="font-medium">{formatCurrency(article.prixVente)}</span></p>
                        <p className="text-gray-600">Ventes: <span className="font-medium">{article.ventesMois}</span></p>
                      </div>
                      <div>
                        <p className="text-gray-600">Fournisseur: <span className="font-medium">{article.fournisseur}</span></p>
                        <p className="text-gray-600">Rotation: <span className="font-medium">{article.tauxRotation}</span></p>
                      </div>
                    </div>
                    {article.statut === 'rupture' && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-600">
                          <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                          Stock en rupture - Commande urgente nécessaire
                        </p>
                      </div>
                    )}
                    {article.statut === 'stock-faible' && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-600">
                          <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                          Stock faible - Seuil minimum atteint
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(article.chiffreAffaires)}</p>
                    <p className="text-xs text-gray-500">CA ce mois</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => handleViewDetails(article)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Voir les détails"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditArticle(article)}
                      className="p-1 text-green-600 hover:bg-green-100 rounded"
                      title="Modifier l'article"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handlePrintArticle(article)}
                      className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                      title="Imprimer"
                    >
                      <PrinterIcon className="h-4 w-4" />
                    </button>
                    {(article.statut === 'rupture' || article.statut === 'stock-faible') && (
                      <button
                        onClick={() => handleReorderArticle(article)}
                        className="p-1 text-orange-600 hover:bg-orange-100 rounded"
                        title="Commander"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-900">Performance des Fournisseurs</h4>
        <div className="flex space-x-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="mois">Ce mois</option>
            <option value="trimestre">Ce trimestre</option>
            <option value="annee">Cette année</option>
          </select>
          <button
            onClick={handleExportArticles}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Classement Fournisseurs</h5>
          <div className="space-y-3">
            {performanceFournisseurs.map((fournisseur, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{fournisseur.fournisseur}</p>
                    <p className="text-xs text-gray-500">{fournisseur.articles} articles</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(fournisseur.chiffreAffaires)}</p>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-yellow-500">★</span>
                    <span className="text-xs text-gray-600">{fournisseur.qualite}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Analyse Radar - Performance</h5>
          <div className="h-64">
            <Radar
              data={{
                labels: ['Qualité', 'Délai', 'Prix', 'Service', 'Innovation'],
                datasets: [{
                  label: 'Performance Moyenne',
                  data: [4.2, 3.8, 4.0, 4.1, 3.9],
                  borderColor: '#3B82F6',
                  backgroundColor: 'rgba(59, 130, 246, 0.2)',
                  borderWidth: 2
                }]
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
                  r: {
                    beginAtZero: true,
                    max: 5
                  }
                }
              }}
            />
          </div>
        </Card>
      </div>

      {/* Nouveaux graphiques ajoutés */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Chiffre d'Affaires par Fournisseur</h5>
          <div className="h-64">
            <Bar
              data={{
                labels: performanceFournisseurs.map(f => f.fournisseur.split(' ')[0]),
                datasets: [{
                  label: `Chiffre d'Affaires (${currentDevise || 'DA'})`,
                  data: performanceFournisseurs.map(f => f.chiffreAffaires),
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                  ],
                  borderColor: [
                    '#2563EB',
                    '#059669',
                    '#D97706',
                    '#DC2626'
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
                    beginAtZero: true,
                    ticks: {
                      callback: function (value) {
                        return formatCurrency(value as number);
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Répartition des Articles</h5>
          <div className="h-64">
            <Doughnut
              data={{
                labels: performanceFournisseurs.map(f => f.fournisseur.split(' ')[0]),
                datasets: [{
                  data: performanceFournisseurs.map(f => f.articles),
                  backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                  ],
                  borderColor: [
                    '#2563EB',
                    '#059669',
                    '#D97706',
                    '#DC2626'
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
                },
              }}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Évolution des Délais</h5>
          <div className="h-64">
            <Line
              data={{
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
                datasets: [{
                  label: 'Tech Solutions',
                  data: [3, 2, 3, 2, 3, 3],
                  borderColor: '#3B82F6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  tension: 0.4
                }, {
                  label: 'Office Supplies',
                  data: [5, 6, 5, 4, 5, 5],
                  borderColor: '#10B981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  tension: 0.4
                }, {
                  label: 'Furniture Plus',
                  data: [7, 8, 7, 6, 7, 7],
                  borderColor: '#F59E0B',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  tension: 0.4
                }, {
                  label: 'Mobile World',
                  data: [4, 3, 4, 4, 4, 4],
                  borderColor: '#EF4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  tension: 0.4
                }]
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
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Jours'
                    }
                  }
                }
              }}
            />
          </div>
        </Card>
      </div>

      {/* Métriques détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Meilleur Fournisseur</p>
              <p className="text-lg font-bold text-blue-800">Tech Solutions</p>
              <p className="text-xs text-gray-500">Note: 4.8/5</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Délai Moyen</p>
              <p className="text-lg font-bold text-green-800">4.8 jours</p>
              <p className="text-xs text-gray-500">Livraison</p>
            </div>
            <ClockIcon className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">CA Total</p>
              <p className="text-lg font-bold text-purple-800">{formatCurrency(7815000)}</p>
              <p className="text-xs text-gray-500">Tous fournisseurs</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Satisfaction</p>
              <p className="text-lg font-bold text-orange-800">4.4/5</p>
              <p className="text-xs text-gray-500">Moyenne générale</p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Tableau détaillé des fournisseurs */}
      <Card className="p-6">
        <h5 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">Analyse Détaillée des Fournisseurs</h5>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Fournisseur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Articles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Chiffre d'Affaires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Délai Moyen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Qualité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {performanceFournisseurs.map((fournisseur, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center border border-slate-200 dark:border-slate-600">
                          <BuildingOfficeIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fournisseur.fournisseur}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">#{index + 1} au classement</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{fournisseur.articles}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">articles</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(fournisseur.chiffreAffaires)}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{currentDevise || 'DA'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{fournisseur.delaiMoyen} jours</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">moyenne</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{fournisseur.qualite}</span>
                      <span className="text-amber-500 dark:text-amber-400 ml-1">★</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-lg ${fournisseur.statut === 'excellent' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' :
                      fournisseur.statut === 'bon' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' :
                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700'
                      }`}>
                      {fournisseur.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedFournisseur(fournisseur);
                          setIsFournisseurModalOpen(true);
                        }}
                        className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleContactFournisseur(fournisseur)}
                        className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Contacter le fournisseur"
                      >
                        <PhoneIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditFournisseur(fournisseur)}
                        className="p-2 text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                        title="Modifier le fournisseur"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderAnalytique = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Analyses Avancées</h4>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h5 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">Taux de Rotation</h5>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Moyenne générale</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsGenerales.tauxRotation}</span>
            </div>
            <div className="flex justify-between items-center p-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Meilleur article</span>
              <span className="text-base font-semibold text-emerald-600 dark:text-emerald-400">2.8</span>
            </div>
            <div className="flex justify-between items-center p-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Plus lent</span>
              <span className="text-base font-semibold text-red-600 dark:text-red-400">0.3</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h5 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">Alertes Stock</h5>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700 dark:text-red-300 font-semibold">45 articles en rupture</p>
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">Action immédiate requise</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <ClockIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-700 dark:text-amber-300 font-semibold">125 articles stock faible</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Commande recommandée</p>
                </div>
              </div>
            </div>
            <div className="p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <CubeIcon className="h-5 w-5 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-violet-700 dark:text-violet-300 font-semibold">100 articles en surstock</p>
                  <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">Optimisation nécessaire</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <h5 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">Prévisions</h5>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Ventes prévues</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">+12%</span>
            </div>
            <div className="flex justify-between items-center p-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Stock optimal</span>
              <span className="text-base font-semibold text-slate-900 dark:text-slate-100">1,100 articles</span>
            </div>
            <div className="flex justify-between items-center p-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Investissement</span>
              <span className="text-base font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(2800000)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900">Rapports Articles</h2>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Analyse complète des articles et de leur performance</p>
        </div>
        <div className="relative z-10 flex space-x-3">
          <button
            onClick={handleExportArticles}
            className="px-6 py-4 bg-slate-50 text-slate-900 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 flex items-center gap-3 border border-slate-100 shadow-sm"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Exporter Rapport</span>
          </button>
          <button
            onClick={() => console.log('Impression du rapport...')}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-900/10 flex items-center gap-3"
          >
            <PrinterIcon className="h-4 w-4" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="mt-6">
        {renderOverview()}
      </div>

      {/* Modal de détails de l'article */}
      {isDetailModalOpen && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Détails de l'Article</h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID Article</label>
                  <p className="text-sm text-gray-900">{selectedArticle.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatutColor(selectedArticle.statut)}`}>
                    {selectedArticle.statut.replace('-', ' ')}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Nom de l'Article</label>
                <p className="text-sm text-gray-900">{selectedArticle.nom}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code</label>
                  <p className="text-sm text-gray-900">{selectedArticle.code}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                  <p className="text-sm text-gray-900">{selectedArticle.categorie}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prix de Vente</label>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedArticle.prixVente)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Actuel</label>
                  <p className="text-lg font-bold text-gray-900">{selectedArticle.stock}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Minimum</label>
                  <p className="text-sm text-gray-900">{selectedArticle.stockMin}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ventes ce Mois</label>
                  <p className="text-sm text-gray-900">{selectedArticle.ventesMois}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Chiffre d'Affaires</label>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedArticle.chiffreAffaires)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marge</label>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedArticle.marge)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Taux de Rotation</label>
                  <p className="text-sm text-gray-900">{selectedArticle.tauxRotation}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fournisseur</label>
                  <p className="text-sm text-gray-900">{selectedArticle.fournisseur}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleEditArticle(selectedArticle);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition de l'article */}
      {isEditModalOpen && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Modifier l'Article</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom de l'Article</label>
                  <input
                    type="text"
                    defaultValue={selectedArticle.nom}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code</label>
                  <input
                    type="text"
                    defaultValue={selectedArticle.code}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                  <select
                    defaultValue={selectedArticle.categorie}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Informatique">Informatique</option>
                    <option value="Mobilier">Mobilier</option>
                    <option value="Téléphonie">Téléphonie</option>
                    <option value="Électronique">Électronique</option>
                    <option value="Accessoires">Accessoires</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <select
                    defaultValue={selectedArticle.statut}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="actif">Actif</option>
                    <option value="stock-faible">Stock Faible</option>
                    <option value="rupture">Rupture</option>
                    <option value="surstock">Surstock</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prix de Vente ({currentDevise || 'DA'})</label>
                  <input
                    type="number"
                    defaultValue={selectedArticle.prixVente}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Actuel</label>
                  <input
                    type="number"
                    defaultValue={selectedArticle.stock}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock Minimum</label>
                  <input
                    type="number"
                    defaultValue={selectedArticle.stockMin}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fournisseur</label>
                  <input
                    type="text"
                    defaultValue={selectedArticle.fournisseur}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </form>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  console.log('Sauvegarde des modifications pour:', selectedArticle.id);
                  setIsEditModalOpen(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détaillé du Fournisseur - Riche et Esthétique */}
      {isFournisseurModalOpen && selectedFournisseur && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden animate-scale-in border border-slate-200 dark:border-slate-700">
            {/* En-tête Professionnel */}
            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 dark:bg-blue-500 p-3 rounded-xl">
                    <BuildingOfficeIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedFournisseur.fournisseur}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Fiche détaillée du fournisseur</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFournisseurModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-2 transition-all"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>

            {/* Corps du Modal - Scrollable */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Statistiques Clés */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium uppercase">Articles</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{selectedFournisseur.articles}</p>
                    </div>
                    <CubeIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </Card>

                <Card className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium uppercase">Chiffre d'Affaires</p>
                      <p className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">{formatCurrency(selectedFournisseur.chiffreAffaires)}</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">{currentDevise || 'DA'}</p>
                    </div>
                    <CurrencyDollarIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </Card>

                <Card className="p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-violet-700 dark:text-violet-300 font-medium uppercase">Délai Livraison</p>
                      <p className="text-2xl font-bold text-violet-900 dark:text-violet-100 mt-1">{selectedFournisseur.delaiMoyen}</p>
                      <p className="text-xs text-violet-600 dark:text-violet-400">jours</p>
                    </div>
                    <ClockIcon className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                  </div>
                </Card>

                <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-amber-700 dark:text-amber-300 font-medium uppercase">Qualité</p>
                      <div className="flex items-center mt-1">
                        <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{selectedFournisseur.qualite}</p>
                        <span className="text-amber-500 dark:text-amber-400 text-xl ml-1">★</span>
                      </div>
                      <p className="text-xs text-amber-600 dark:text-amber-400">sur 5</p>
                    </div>
                    <CheckCircleIcon className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                </Card>
              </div>

              {/* Informations Détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Coordonnées */}
                <Card className="p-6 border border-slate-200 dark:border-slate-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center">
                    <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded mr-2">
                      <BuildingOfficeIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    Coordonnées
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded mr-3">
                        <BuildingOfficeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Raison Sociale</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedFournisseur.fournisseur}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded mr-3">
                        <PhoneIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Téléphone</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">+213 (0) 23 456 789</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-violet-100 dark:bg-violet-900/30 p-2 rounded mr-3">
                        <TagIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Adresse</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Zone Industrielle, Alger, Algérie</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Performance */}
                <Card className="p-6 border border-slate-200 dark:border-slate-700">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center">
                    <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded mr-2">
                      <ChartBarIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    Performance
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Statut Global</span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-lg ${selectedFournisseur.statut === 'excellent' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                        selectedFournisseur.statut === 'bon' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                          'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                        }`}>
                        {selectedFournisseur.statut.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Taux de Satisfaction</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">96%</span>
                    </div>
                    <div className="flex justify-between items-center p-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Commandes ce mois</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">24</span>
                    </div>
                    <div className="flex justify-between items-center p-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Taux de conformité</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">98.5%</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Historique des Commandes */}
              <Card className="p-6 mb-6 border border-slate-200 dark:border-slate-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center">
                  <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded mr-2">
                    <ClockIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                  </div>
                  Dernières Commandes
                </h4>
                <div className="space-y-2">
                  {[
                    { date: '28 Sep 2025', montant: 450000, statut: 'Livrée', delai: 3 },
                    { date: '20 Sep 2025', montant: 320000, statut: 'Livrée', delai: 2 },
                    { date: '15 Sep 2025', montant: 580000, statut: 'En cours', delai: 5 }
                  ].map((commande, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                          <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{commande.date}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(commande.montant)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-slate-600 dark:text-slate-400">{commande.delai} jours</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${commande.statut === 'Livrée' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                          'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                          }`}>
                          {commande.statut}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Indicateurs de Performance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Ponctualité</p>
                    <CheckCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">94%</p>
                  <div className="flex items-center mt-2">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 mr-2">
                      <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">94%</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Livraisons à temps</p>
                </Card>

                <Card className="p-4 border-l-4 border-l-emerald-500">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Conformité</p>
                    <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">98.5%</p>
                  <div className="flex items-center mt-2">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 mr-2">
                      <div className="bg-emerald-600 dark:bg-emerald-500 h-2 rounded-full" style={{ width: '98.5%' }}></div>
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">98%</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Articles conformes</p>
                </Card>

                <Card className="p-4 border-l-4 border-l-violet-500">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Fiabilité</p>
                    <ArrowTrendingUpIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">4.{selectedFournisseur.qualite}/5</p>
                  <div className="flex items-center mt-2">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 mr-2">
                      <div className="bg-violet-600 dark:bg-violet-500 h-2 rounded-full" style={{ width: `${(selectedFournisseur.qualite / 5) * 100}%` }}></div>
                    </div>
                    <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">{Math.round((selectedFournisseur.qualite / 5) * 100)}%</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Note globale</p>
                </Card>
              </div>

              {/* Informations Complémentaires */}
              <Card className="p-6 border border-slate-200 dark:border-slate-700">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">Informations Complémentaires</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Type de fournisseur</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Grossiste Agréé</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Date de partenariat</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">15 Janvier 2023</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Conditions de paiement</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">30 jours net</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Mode de livraison</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Franco de port</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Responsable commercial</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Mohamed Cherif</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Email</p>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">contact@{selectedFournisseur.fournisseur.toLowerCase().replace(/\s+/g, '')}.dz</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Pied du Modal avec Actions */}
            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => alert(`📞 Appel à ${selectedFournisseur.fournisseur}`)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <PhoneIcon className="h-4 w-4" />
                  <span>Contacter</span>
                </button>
                <button
                  onClick={() => alert(`📧 Email envoyé à ${selectedFournisseur.fournisseur}`)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>Envoyer Email</span>
                </button>
              </div>
              <button
                onClick={() => setIsFournisseurModalOpen(false)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-colors font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'Édition du Fournisseur - Professionnel */}
      {isEditFournisseurModalOpen && editFournisseurData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in border border-slate-200 dark:border-slate-700">
            {/* En-tête */}
            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-600 dark:bg-emerald-500 p-2 rounded-lg">
                    <PencilIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Modifier le Fournisseur</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Mise à jour des informations</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditFournisseurModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg p-2 transition-all"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
            </div>

            {/* Corps du formulaire */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <form className="space-y-6">
                {/* Informations Générales */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded mr-2">
                      <BuildingOfficeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    Informations Générales
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Raison Sociale <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editFournisseurData.fournisseur || ''}
                        onChange={(e) => setEditFournisseurData({ ...editFournisseurData, fournisseur: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="text"
                        defaultValue="+213 (0) 23 456 789"
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        defaultValue={`contact@${editFournisseurData.fournisseur?.toLowerCase().replace(/\s+/g, '')}.dz`}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Responsable Commercial
                      </label>
                      <input
                        type="text"
                        defaultValue="Mohamed Cherif"
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-all"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Adresse
                    </label>
                    <textarea
                      defaultValue="Zone Industrielle, Alger, Algérie"
                      rows={2}
                      className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-all"
                    />
                  </div>
                </div>

                {/* Performance et Délais */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center">
                    <div className="bg-violet-100 dark:bg-violet-900/30 p-1.5 rounded mr-2">
                      <ChartBarIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    Performance et Délais
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Délai Moyen (jours)
                      </label>
                      <input
                        type="number"
                        value={editFournisseurData.delaiMoyen || ''}
                        onChange={(e) => setEditFournisseurData({ ...editFournisseurData, delaiMoyen: parseInt(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-slate-700 dark:text-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Note de Qualité (sur 5)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        value={editFournisseurData.qualite || ''}
                        onChange={(e) => setEditFournisseurData({ ...editFournisseurData, qualite: parseFloat(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-slate-700 dark:text-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Statut
                      </label>
                      <select
                        value={editFournisseurData.statut || ''}
                        onChange={(e) => setEditFournisseurData({ ...editFournisseurData, statut: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-slate-700 dark:text-white transition-all"
                      >
                        <option value="excellent">✅ Excellent</option>
                        <option value="bon">👍 Bon</option>
                        <option value="moyen">⚠️ Moyen</option>
                        <option value="mauvais">❌ Mauvais</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Conditions Commerciales */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded mr-2">
                      <CurrencyDollarIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Conditions Commerciales
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Conditions de Paiement
                      </label>
                      <select
                        defaultValue="30-net"
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:text-white transition-all"
                      >
                        <option value="comptant">Comptant</option>
                        <option value="15-net">15 jours net</option>
                        <option value="30-net">30 jours net</option>
                        <option value="45-net">45 jours net</option>
                        <option value="60-net">60 jours net</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mode de Livraison
                      </label>
                      <select
                        defaultValue="franco"
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:text-white transition-all"
                      >
                        <option value="franco">Franco de port</option>
                        <option value="port-du">Port dû</option>
                        <option value="mixte">Mixte</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Remise Globale (%)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        defaultValue="5"
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:text-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type de Fournisseur
                      </label>
                      <select
                        defaultValue="grossiste"
                        className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:text-white transition-all"
                      >
                        <option value="grossiste">Grossiste</option>
                        <option value="fabricant">Fabricant</option>
                        <option value="distributeur">Distributeur</option>
                        <option value="importateur">Importateur</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Notes et Remarques */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700 flex items-center">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded mr-2">
                      <DocumentTextIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    Notes et Remarques
                  </h4>
                  <textarea
                    placeholder="Ajoutez des notes ou remarques sur ce fournisseur..."
                    rows={4}
                    defaultValue="Fournisseur fiable avec de bons délais de livraison. Excellente qualité de service."
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-slate-700 dark:text-white transition-all"
                  />
                </div>
              </form>
            </div>

            {/* Pied du Modal */}
            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditFournisseurModalOpen(false)}
                className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveFournisseur}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-lg transition-colors font-medium flex items-center space-x-2"
              >
                <CheckCircleIcon className="h-5 w-5" />
                <span>Sauvegarder les Modifications</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RapportsArticlesWidget;


