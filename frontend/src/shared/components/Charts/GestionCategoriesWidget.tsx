import React, { useState } from 'react';
import Card from '../UI/Card';
import {
  TagIcon, PlusIcon, PencilIcon, TrashIcon, EyeIcon, ChartBarIcon,
  ChartPieIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, DocumentTextIcon,
  DocumentArrowDownIcon, PrinterIcon, BuildingOfficeIcon, CubeIcon,
  ExclamationTriangleIcon, CheckCircleIcon, ClockIcon, CurrencyDollarIcon,
  ArrowPathIcon, UserIcon, SparklesIcon, BanknotesIcon, FlagIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
  ArcElement, BarElement, RadialLinearScale, Filler
} from 'chart.js';
import { useTheme } from '@core/context/ThemeContext';
import { useApp } from '@core/context/AppContext';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
  ArcElement, BarElement, RadialLinearScale, Filler
);

interface GestionCategoriesWidgetProps {
  period?: string;
}

const GestionCategoriesWidget: React.FC<GestionCategoriesWidgetProps> = ({ period = 'mois' }) => {
  const { formatCurrency } = useApp();
  const { currentTheme } = useTheme();
  const [activeView, setActiveView] = useState<'overview' | 'analytics' | 'performance' | 'gestion'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // États pour le formulaire de nouvelle catégorie
  const [newCategory, setNewCategory] = useState({
    nom: '',
    code: '',
    description: '',
    couleur: '#3B82F6',
    responsable: '',
    priorite: 'normale',
    objectifVente: '',
    budget: '',
    statut: 'actif'
  });
  const [formErrors, setFormErrors] = useState<any>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Données de démonstration pour les catégories
  const categoriesData = [
    {
      id: '1',
      nom: 'Informatique',
      code: 'INF',
      description: 'Équipements informatiques et accessoires',
      couleur: '#3B82F6',
      articles: 245,
      valeurStock: 1850000,
      chiffreAffaires: 2250000,
      marge: 450000,
      croissance: 12.5,
      statut: 'actif',
      dateCreation: '2023-01-15',
      responsable: 'Ahmed Benali'
    },
    {
      id: '2',
      nom: 'Mobilier',
      code: 'MOB',
      description: 'Mobilier de bureau et équipements',
      couleur: '#10B981',
      articles: 180,
      valeurStock: 1200000,
      chiffreAffaires: 980000,
      marge: 196000,
      croissance: 8.2,
      statut: 'actif',
      dateCreation: '2023-02-20',
      responsable: 'Fatima Khelil'
    },
    {
      id: '3',
      nom: 'Téléphonie',
      code: 'TEL',
      description: 'Téléphones et accessoires mobiles',
      couleur: '#F59E0B',
      articles: 95,
      valeurStock: 750000,
      chiffreAffaires: 1100000,
      marge: 220000,
      croissance: 15.8,
      statut: 'actif',
      dateCreation: '2023-03-10',
      responsable: 'Omar Cherif'
    },
    {
      id: '4',
      nom: 'Électronique',
      code: 'ELE',
      description: 'Appareils électroniques grand public',
      couleur: '#EF4444',
      articles: 120,
      valeurStock: 950000,
      chiffreAffaires: 780000,
      marge: 156000,
      croissance: -2.1,
      statut: 'attention',
      dateCreation: '2023-01-25',
      responsable: 'Yasmine Boudjedra'
    },
    {
      id: '5',
      nom: 'Accessoires',
      code: 'ACC',
      description: 'Accessoires et consommables',
      couleur: '#8B5CF6',
      articles: 320,
      valeurStock: 450000,
      chiffreAffaires: 650000,
      marge: 130000,
      croissance: 5.4,
      statut: 'actif',
      dateCreation: '2023-02-05',
      responsable: 'Karim Saadi'
    }
  ];

  const statsGenerales = {
    totalCategories: categoriesData.length,
    categoriesActives: categoriesData.filter(c => c.statut === 'actif').length,
    totalArticles: categoriesData.reduce((sum, c) => sum + c.articles, 0),
    valeurStockTotal: categoriesData.reduce((sum, c) => sum + c.valeurStock, 0),
    chiffreAffairesTotal: categoriesData.reduce((sum, c) => sum + c.chiffreAffaires, 0),
    margeTotal: categoriesData.reduce((sum, c) => sum + c.marge, 0)
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'actif': return 'text-emerald-600 dark:text-emerald-400 bg-green-50 border-green-200';
      case 'attention': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-yellow-200';
      case 'inactif': return 'text-red-600 dark:text-red-400 bg-red-50 border-red-200';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'actif': return CheckCircleIcon;
      case 'attention': return ExclamationTriangleIcon;
      case 'inactif': return ClockIcon;
      default: return TagIcon;
    }
  };

  // Fonctions pour gérer les actions
  const handleViewDetails = (category: any) => {
    setSelectedCategory(category);
    setIsDetailModalOpen(true);
  };

  const handleEditCategory = (category: any) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      console.log('Suppression de la catégorie:', categoryId);
    }
  };

  const handleAddCategory = () => {
    setIsAddModalOpen(true);
  };

  const handleExportCategories = () => {
    console.log('Export des catégories...');
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors: any = {};
    
    if (!newCategory.nom.trim()) {
      errors.nom = 'Le nom est obligatoire';
    }
    
    if (!newCategory.code.trim()) {
      errors.code = 'Le code est obligatoire';
    } else if (newCategory.code.length > 5) {
      errors.code = 'Le code ne doit pas dépasser 5 caractères';
    }
    
    if (!newCategory.responsable.trim()) {
      errors.responsable = 'Le responsable est obligatoire';
    }
    
    if (newCategory.objectifVente && isNaN(Number(newCategory.objectifVente))) {
      errors.objectifVente = 'Veuillez entrer un nombre valide';
    }
    
    if (newCategory.budget && isNaN(Number(newCategory.budget))) {
      errors.budget = 'Veuillez entrer un nombre valide';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gestion de la soumission du formulaire
  const handleSubmitNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Logique de création (à connecter à une API)
      console.log('Nouvelle catégorie créée:', newCategory);
      
      // Afficher message de succès
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        setIsAddModalOpen(false);
        // Réinitialiser le formulaire
        setNewCategory({
          nom: '',
          code: '',
          description: '',
          couleur: '#3B82F6',
          responsable: '',
          priorite: 'normale',
          objectifVente: '',
          budget: '',
          statut: 'actif'
        });
        setFormErrors({});
      }, 2000);
    }
  };

  // Gestion des changements dans le formulaire
  const handleInputChange = (field: string, value: string) => {
    setNewCategory(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ si elle existe
    if (formErrors[field]) {
      setFormErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Catégories</p>
              <p className="text-2xl font-bold text-blue-800">{statsGenerales.totalCategories}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Catégories actives</p>
            </div>
            <TagIcon className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Articles Total</p>
              <p className="text-2xl font-bold text-green-800">{statsGenerales.totalArticles}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Dans toutes catégories</p>
            </div>
            <CubeIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Valeur Stock</p>
              <p className="text-2xl font-bold text-purple-800">{formatCurrency(statsGenerales.valeurStockTotal)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">دج</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Chiffre d'Affaires</p>
              <p className="text-2xl font-bold text-orange-800">{formatCurrency(statsGenerales.chiffreAffairesTotal)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">دج ce mois</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Liste des catégories */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Catégories d'Articles</h4>
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nouvelle Catégorie</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriesData.map((category) => {
            const StatutIcon = getStatutIcon(category.statut);
            return (
              <div key={category.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.couleur }}
                    ></div>
                    <span className="text-sm font-medium text-gray-900">{category.nom}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getStatutColor(category.statut)}`}>
                    <StatutIcon className="h-3 w-3 inline mr-1" />
                    {category.statut}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Code:</span>
                    <span className="font-medium">{category.code}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Articles:</span>
                    <span className="font-medium">{category.articles}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Valeur Stock:</span>
                    <span className="font-medium">{formatCurrency(category.valeurStock)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">CA ce mois:</span>
                    <span className="font-medium">{formatCurrency(category.chiffreAffaires)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Croissance:</span>
                    <span className={`font-medium ${category.croissance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {category.croissance >= 0 ? '+' : ''}{category.croissance}%
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Responsable: {category.responsable}
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleViewDetails(category)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="Voir les détails"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleEditCategory(category)}
                      className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-green-100 rounded"
                      title="Modifier"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 rounded"
                      title="Supprimer"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">Analyses des Catégories</h4>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Répartition des Articles par Catégorie</h5>
          <div className="h-64">
            <Doughnut
              data={{
                labels: categoriesData.map(c => c.nom),
                datasets: [{
                  data: categoriesData.map(c => c.articles),
                  backgroundColor: categoriesData.map(c => c.couleur + '80'),
                  borderColor: categoriesData.map(c => c.couleur),
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
          <h5 className="text-md font-semibold text-gray-900 mb-4">Chiffre d'Affaires par Catégorie</h5>
          <div className="h-64">
            <Bar
              data={{
                labels: categoriesData.map(c => c.nom),
                datasets: [{
                  label: 'Chiffre d\'Affaires (DA)',
                  data: categoriesData.map(c => c.chiffreAffaires),
                  backgroundColor: categoriesData.map(c => c.couleur + '80'),
                  borderColor: categoriesData.map(c => c.couleur),
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
                      callback: function(value) {
                        return formatCurrency(value as number);
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Évolution des Ventes (6 derniers mois)</h5>
          <div className="h-64">
            <Line
              data={{
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
                datasets: categoriesData.slice(0, 3).map((category, index) => ({
                  label: category.nom,
                  data: [120000, 135000, 145000, 160000, 175000, category.chiffreAffaires / 6],
                  borderColor: category.couleur,
                  backgroundColor: category.couleur + '20',
                  tension: 0.4
                }))
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
                    ticks: {
                      callback: function(value) {
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
          <h5 className="text-md font-semibold text-gray-900 mb-4">Performance Radar - Top 3 Catégories</h5>
          <div className="h-64">
            <Radar
              data={{
                labels: ['Ventes', 'Marge', 'Croissance', 'Stock', 'Rotation'],
                datasets: categoriesData.slice(0, 3).map((category, index) => ({
                  label: category.nom,
                  data: [
                    (category.chiffreAffaires / 1000000) * 5,
                    (category.marge / 100000) * 5,
                    Math.max(0, Math.min(5, category.croissance + 2.5)),
                    (category.articles / 100) * 5,
                    3.5 + index * 0.5
                  ],
                  borderColor: category.couleur,
                  backgroundColor: category.couleur + '20',
                  borderWidth: 2
                }))
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
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">Performance des Catégories</h4>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Meilleure Catégorie</p>
              <p className="text-lg font-bold text-green-800">Informatique</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">+12.5% croissance</p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Plus de Ventes</p>
              <p className="text-lg font-bold text-blue-800">Téléphonie</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">1.1M DA ce mois</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Meilleure Marge</p>
              <p className="text-lg font-bold text-purple-800">Informatique</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">450K DA marge</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Tableau de performance */}
      <Card className="p-6">
        <h5 className="text-md font-semibold text-gray-900 mb-4">Classement des Catégories</h5>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rang</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Articles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Chiffre d'Affaires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Marge</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Croissance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200">
              {categoriesData
                .sort((a, b) => b.chiffreAffaires - a.chiffreAffaires)
                .map((category, index) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded-full mr-3" 
                        style={{ backgroundColor: category.couleur }}
                      ></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{category.nom}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{category.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{category.articles}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(category.chiffreAffaires)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(category.marge)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      category.croissance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {category.croissance >= 0 ? <ArrowTrendingUpIcon className="h-3 w-3 mr-1" /> : <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />}
                      {category.croissance >= 0 ? '+' : ''}{category.croissance}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewDetails(category)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditCategory(category)}
                        className="text-emerald-600 dark:text-emerald-400 hover:text-green-900"
                      >
                        <PencilIcon className="h-4 w-4" />
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

  const renderGestion = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gestion Avancée des Catégories</h4>
      
      {/* Statistiques Principales Enrichies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Catégories Actives</p>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {statsGenerales.categoriesActives}/{statsGenerales.totalCategories}
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-1" />
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">80% actif</span>
          </div>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 p-3 rounded-lg shadow-md">
              <TagIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30 border-emerald-200 dark:border-emerald-700 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Total Articles</p>
              <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{statsGenerales.totalArticles}</p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mr-1" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">+12% ce mois</span>
        </div>
        </div>
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-600 p-3 rounded-lg shadow-md">
              <CubeIcon className="h-8 w-8 text-white" />
      </div>
      </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/30 dark:to-violet-800/30 border-violet-200 dark:border-violet-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-violet-700 dark:text-violet-300 font-medium">Valeur Stock Total</p>
              <p className="text-2xl font-bold text-violet-900 dark:text-violet-100">{formatCurrency(statsGenerales.valeurStockTotal)}</p>
              <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">دج</p>
      </div>
            <div className="bg-gradient-to-br from-violet-600 to-violet-700 dark:from-violet-500 dark:to-violet-600 p-3 rounded-lg shadow-md">
              <BuildingOfficeIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </Card>
            
        <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-200 dark:border-amber-700 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
                <div>
              <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">CA Total</p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{formatCurrency(statsGenerales.chiffreAffairesTotal)}</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">دج ce mois</p>
                </div>
            <div className="bg-gradient-to-br from-amber-600 to-amber-700 dark:from-amber-500 dark:to-amber-600 p-3 rounded-lg shadow-md">
              <ChartBarIcon className="h-8 w-8 text-white" />
                </div>
              </div>
        </Card>
              </div>
              
      {/* Indicateurs de Performance Supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Marge Totale</p>
            <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(statsGenerales.margeTotal)}</p>
          <div className="flex items-center mt-2">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
              <div className="bg-emerald-600 dark:bg-emerald-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">68%</span>
              </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Taux de marge moyen</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Rotation Stock</p>
            <ArrowPathIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">4.2×</p>
          <div className="flex items-center mt-2">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
              <div className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style={{ width: '84%' }}></div>
                </div>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">+18%</span>
              </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Par rapport au trimestre dernier</p>
        </Card>

        <Card className="p-4 border-l-4 border-l-violet-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Taux de Croissance</p>
            <ArrowTrendingUpIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">+8.9%</p>
          <div className="flex items-center mt-2">
            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
              <div className="bg-violet-600 dark:bg-violet-500 h-2 rounded-full" style={{ width: '89%' }}></div>
                </div>
            <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">89%</span>
              </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Objectif mensuel atteint</p>
        </Card>
            </div>
            
      {/* Actions Rapides et Statistiques Détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <PlusIcon className="h-5 w-5 mr-2 text-blue-600" />
            Actions Rapides
          </h5>
          <div className="space-y-3">
              <button 
              onClick={handleAddCategory}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
              <PlusIcon className="h-5 w-5 mr-2" />
              Créer une Nouvelle Catégorie
              </button>
              <button 
              onClick={handleExportCategories}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Exporter les Catégories
              </button>
              <button 
              onClick={() => console.log('Impression des catégories...')}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-lg hover:from-violet-700 hover:to-violet-800 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <PrinterIcon className="h-5 w-5 mr-2" />
              Imprimer le Rapport
            </button>
            <button 
              onClick={() => console.log('Import des catégories...')}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Importer 
              </button>
            </div>
        </Card>

        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <ChartPieIcon className="h-5 w-5 mr-2 text-violet-600" />
            Statistiques Détaillées
          </h5>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 p-2 rounded-lg mr-3 shadow-sm">
                  <TagIcon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Catégories Actives</span>
                </div>
              <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{statsGenerales.categoriesActives}/{statsGenerales.totalCategories}</span>
              </div>
              
            <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-500 dark:to-emerald-600 p-2 rounded-lg mr-3 shadow-sm">
                  <CubeIcon className="h-4 w-4 text-white" />
              </div>
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Total Articles</span>
                </div>
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{statsGenerales.totalArticles}</span>
                </div>
            
            <div className="flex justify-between items-center p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-700 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-violet-600 to-violet-700 dark:from-violet-500 dark:to-violet-600 p-2 rounded-lg mr-3 shadow-sm">
                  <CurrencyDollarIcon className="h-4 w-4 text-white" />
            </div>
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Valeur Stock</span>
          </div>
              <span className="text-sm font-bold text-violet-700 dark:text-violet-300">{formatCurrency(statsGenerales.valeurStockTotal)} دج</span>
        </div>
            
            <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-amber-600 to-amber-700 dark:from-amber-500 dark:to-amber-600 p-2 rounded-lg mr-3 shadow-sm">
                  <ChartBarIcon className="h-4 w-4 text-white" />
            </div>
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">CA Total</span>
                </div>
              <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{formatCurrency(statsGenerales.chiffreAffairesTotal)} دج</span>
              </div>
              
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-500 dark:to-slate-600 p-2 rounded-lg mr-3 shadow-sm">
                  <CurrencyDollarIcon className="h-4 w-4 text-white" />
              </div>
                <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">Marge Totale</span>
                </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatCurrency(statsGenerales.margeTotal)} دج</span>
                </div>
              </div>
        </Card>
            </div>

      {/* Alertes et Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-l-amber-500">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 dark:text-amber-400 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Catégorie en Attention</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                La catégorie "Électronique" présente une croissance négative de -2.1%. Analyse recommandée.
              </p>
          </div>
          </div>
        </Card>

        <Card className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border-l-4 border-l-emerald-500">
          <div className="flex items-start">
            <CheckCircleIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Performance Excellente</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                La catégorie "Téléphonie" affiche une croissance de +15.8%, meilleure performance du mois.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tendances par Catégorie */}
      <Card className="p-6">
        <h5 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
          Tendances Récentes
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriesData.slice(0, 3).map((category) => (
            <div key={category.id} className="p-4 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div 
                    className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: category.couleur }}
                      ></div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{category.nom}</p>
                      </div>
                {category.croissance >= 0 ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
                    </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Articles</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{category.articles}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">CA</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(category.chiffreAffaires)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Croissance</span>
                  <span className={`font-medium ${category.croissance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {category.croissance >= 0 ? '+' : ''}{category.croissance}%
                    </span>
                    </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                  <div 
                    className={`h-1.5 rounded-full ${category.croissance >= 0 ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-red-600 dark:bg-red-500'}`}
                    style={{ width: `${Math.min(100, Math.abs(category.croissance) * 6)}%` }}
                  ></div>
        </div>
    </div>
          </div>
          ))}
            </div>
        </Card>
      </div>
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestion des Catégories</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">Gestion complète des catégories d'articles et analyses de performance</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleExportCategories}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 flex items-center space-x-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Exporter</span>
          </button>
          <button 
            onClick={() => console.log('Impression du rapport...')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
          >
            <PrinterIcon className="h-4 w-4" />
            <span>Imprimer</span>
          </button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', name: 'Vue d\'ensemble', icon: TagIcon },
            { id: 'analytics', name: 'Analyses', icon: ChartBarIcon },
            { id: 'performance', name: 'Performance', icon: ArrowTrendingUpIcon },
            { id: 'gestion', name: 'Gestion', icon: PencilIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-6">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'analytics' && renderAnalytics()}
        {activeView === 'performance' && renderPerformance()}
        {activeView === 'gestion' && renderGestion()}
      </div>

      {/* Modal de détails de la catégorie */}
      {isDetailModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Détails de la Catégorie</h3>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-slate-600 dark:text-slate-400"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom de la Catégorie</label>
                  <p className="text-sm text-gray-900">{selectedCategory.nom}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code</label>
                  <p className="text-sm text-gray-900">{selectedCategory.code}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900">{selectedCategory.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre d'Articles</label>
                  <p className="text-lg font-bold text-gray-900">{selectedCategory.articles}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Valeur du Stock</label>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedCategory.valeurStock)} دج</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Chiffre d'Affaires</label>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedCategory.chiffreAffaires)} دج</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marge</label>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedCategory.marge)} دج</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Croissance</label>
                  <p className={`text-lg font-bold ${selectedCategory.croissance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {selectedCategory.croissance >= 0 ? '+' : ''}{selectedCategory.croissance}%
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Responsable</label>
                  <p className="text-sm text-gray-900">{selectedCategory.responsable}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-slate-50 dark:bg-slate-900"
              >
                Fermer
              </button>
              <button 
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleEditCategory(selectedCategory);
                }}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition de la catégorie */}
      {isEditModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Modifier la Catégorie</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-slate-600 dark:text-slate-400"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom de la Catégorie</label>
                  <input 
                    type="text" 
                    defaultValue={selectedCategory.nom}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code</label>
                  <input 
                    type="text" 
                    defaultValue={selectedCategory.code}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  defaultValue={selectedCategory.description}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Couleur</label>
                  <input 
                    type="color" 
                    defaultValue={selectedCategory.couleur}
                    className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Responsable</label>
                  <input 
                    type="text" 
                    defaultValue={selectedCategory.responsable}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </form>

            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-slate-50 dark:bg-slate-900"
              >
                Annuler
              </button>
              <button 
                onClick={() => {
                  console.log('Sauvegarde des modifications pour:', selectedCategory.id);
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

      {/* Modal d'ajout de catégorie enrichi */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-0 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden animate-scale-in border border-gray-200 dark:border-slate-700">
            {/* En-tête du modal professionnel */}
            <div className="bg-slate-50 dark:bg-slate-900 p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-lg">
                    <TagIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Nouvelle Catégorie</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Créez une nouvelle catégorie d'articles</p>
                  </div>
                </div>
              <button 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setFormErrors({});
                    setNewCategory({
                      nom: '',
                      code: '',
                      description: '',
                      couleur: '#3B82F6',
                      responsable: '',
                      priorite: 'normale',
                      objectifVente: '',
                      budget: '',
                      statut: 'actif'
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg p-2 transition-all"
                >
                <span className="text-2xl">&times;</span>
              </button>
              </div>
            </div>

            {/* Message de succès */}
            {showSuccessMessage && (
              <div className="mx-6 mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg flex items-center space-x-3 animate-slide-in-down">
                <CheckCircleIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Catégorie créée avec succès !</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">La catégorie a été ajoutée à votre système.</p>
                </div>
              </div>
            )}

            {/* Corps du formulaire */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <form onSubmit={handleSubmitNewCategory} className="space-y-6">
                {/* Informations de base */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center pb-2 border-b border-gray-200 dark:border-slate-700">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded mr-2">
                      <TagIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    Informations de Base
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nom de la Catégorie <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                  <input 
                    type="text" 
                          value={newCategory.nom}
                          onChange={(e) => handleInputChange('nom', e.target.value)}
                    placeholder="Ex: Électronique"
                          className={`w-full px-4 py-2.5 pl-10 border ${formErrors.nom ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-all`}
                  />
                        <TagIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                </div>
                      {formErrors.nom && <p className="text-xs text-red-500 mt-1">{formErrors.nom}</p>}
                    </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Code <span className="text-red-500">*</span>
                      </label>
                  <input 
                    type="text" 
                        value={newCategory.code}
                        onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                    placeholder="Ex: ELE"
                        maxLength={5}
                        className={`w-full px-4 py-2.5 border ${formErrors.code ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white uppercase transition-all`}
                  />
                      {formErrors.code && <p className="text-xs text-red-500 mt-1">{formErrors.code}</p>}
                </div>
              </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                <textarea 
                      value={newCategory.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Description détaillée de la catégorie..."
                  rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white transition-all"
                />
                  </div>
              </div>

                {/* Apparence et Responsable */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center pb-2 border-b border-gray-200 dark:border-slate-700">
                    <div className="bg-violet-100 dark:bg-violet-900/30 p-1.5 rounded mr-2">
                      <SparklesIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    Apparence et Responsabilité
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Couleur de la Catégorie
                      </label>
                      <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                          value={newCategory.couleur}
                          onChange={(e) => handleInputChange('couleur', e.target.value)}
                          className="w-16 h-10 border-2 border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer"
                        />
                        <div className="flex-1">
                          <div 
                            className="w-full h-10 rounded-lg border-2 border-gray-300 dark:border-slate-600 flex items-center justify-center text-white font-semibold shadow-md"
                            style={{ backgroundColor: newCategory.couleur }}
                          >
                            Aperçu
                </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Code: {newCategory.couleur}</p>
                    </div>
                <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Responsable <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                  <input 
                    type="text" 
                          value={newCategory.responsable}
                          onChange={(e) => handleInputChange('responsable', e.target.value)}
                    placeholder="Nom du responsable"
                          className={`w-full px-4 py-2.5 pl-10 border ${formErrors.responsable ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'} rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-slate-700 dark:text-white transition-all`}
                        />
                        <UserIcon className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
                      </div>
                      {formErrors.responsable && <p className="text-xs text-red-500 mt-1">{formErrors.responsable}</p>}
                    </div>
                  </div>
                </div>

                {/* Objectifs et Budget */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center pb-2 border-b border-gray-200 dark:border-slate-700">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded mr-2">
                      <BanknotesIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    Objectifs Financiers (Optionnel)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Objectif de Vente Mensuel (دج)
                      </label>
                      <input 
                        type="text" 
                        value={newCategory.objectifVente}
                        onChange={(e) => handleInputChange('objectifVente', e.target.value)}
                        placeholder="Ex: 1000000"
                        className={`w-full px-4 py-2.5 border ${formErrors.objectifVente ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:text-white transition-all`}
                      />
                      {formErrors.objectifVente && <p className="text-xs text-red-500 mt-1">{formErrors.objectifVente}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Budget Alloué (دج)
                      </label>
                      <input 
                        type="text" 
                        value={newCategory.budget}
                        onChange={(e) => handleInputChange('budget', e.target.value)}
                        placeholder="Ex: 500000"
                        className={`w-full px-4 py-2.5 border ${formErrors.budget ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'} rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:text-white transition-all`}
                      />
                      {formErrors.budget && <p className="text-xs text-red-500 mt-1">{formErrors.budget}</p>}
                    </div>
                  </div>
              </div>

                {/* Paramètres Avancés */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center pb-2 border-b border-gray-200 dark:border-slate-700">
                    <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded mr-2">
                      <FlagIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    Paramètres Avancés
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Niveau de Priorité
                      </label>
                      <select
                        value={newCategory.priorite}
                        onChange={(e) => handleInputChange('priorite', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-slate-700 dark:text-white transition-all"
                      >
                        <option value="basse">🟢 Basse</option>
                        <option value="normale">🟡 Normale</option>
                        <option value="haute">🟠 Haute</option>
                        <option value="critique">🔴 Critique</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Statut Initial
                      </label>
                      <select
                        value={newCategory.statut}
                        onChange={(e) => handleInputChange('statut', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-slate-700 dark:text-white transition-all"
                      >
                        <option value="actif">✅ Actif</option>
                        <option value="inactif">⏸️ Inactif</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200 dark:border-slate-700">
              <button 
                    type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                      setFormErrors({});
                      setNewCategory({
                        nom: '',
                        code: '',
                        description: '',
                        couleur: '#3B82F6',
                        responsable: '',
                        priorite: 'normale',
                        objectifVente: '',
                        budget: '',
                        statut: 'actif'
                      });
                    }}
                    className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium"
                  >
                    Annuler
              </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center space-x-2"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Créer la Catégorie</span>
                  </button>
            </div>
              </form>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};

export default GestionCategoriesWidget;


