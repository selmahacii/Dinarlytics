import React, { useState, useEffect } from 'react';
import {
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CalendarIcon,
  UserIcon,
  PhoneIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  ArrowPathIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut, PolarArea } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';

interface SuiviLivraisonsWidgetProps {
  period?: string;
  initialView?: 'overview' | 'en-cours' | 'statistiques' | 'geographie';
  initialStatus?: 'tous' | 'en-transit' | 'livrees' | 'en-retard';
  onViewChange?: (view: 'overview' | 'en-cours' | 'statistiques' | 'geographie') => void;
}

const SuiviLivraisonsWidget: React.FC<SuiviLivraisonsWidgetProps> = ({ 
  period = 'semaine',
  initialView,
  initialStatus,
  onViewChange
}) => {
  const { formatCurrency } = useApp();
  const { currentTheme } = useTheme();
  const [activeView, setActiveView] = useState<'overview' | 'en-cours' | 'statistiques' | 'geographie'>(initialView || 'overview');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus || 'tous');
  
  // Mettre à jour la vue si initialView change
  useEffect(() => {
    if (initialView) {
      setActiveView(initialView);
    }
  }, [initialView]);
  
  // Mettre à jour le statut si initialStatus change
  useEffect(() => {
    if (initialStatus) {
      setSelectedStatus(initialStatus);
      // Si un statut spécifique est demandé, passer à la vue "en-cours"
      if (initialStatus !== 'tous') {
        setActiveView('en-cours');
        if (onViewChange) {
          onViewChange('en-cours');
        }
      }
    }
  }, [initialStatus, onViewChange]);
  
  // Notifier le parent des changements de vue
  const handleViewChange = (view: 'overview' | 'en-cours' | 'statistiques' | 'geographie') => {
    setActiveView(view);
    if (onViewChange) {
      onViewChange(view);
    }
  };

  // Données de démonstration pour le suivi des livraisons
  const statsGenerales = {
    enTransit: 5,
    livrees: 18,
    enRetard: 2,
    total: 25,
    tauxReussite: 72, // 18/25 * 100
    delaiMoyen: 2.3, // jours
    satisfaction: 4.2
  };

  const livraisonsEnCours = [
    {
      id: 'LIV-2024-001',
      client: 'Entreprise ABC',
      adresse: '123 Rue de la Paix, Alger',
      dateLivraison: '2024-01-20',
      statut: 'en-transit',
      chauffeur: 'Ahmed Benali',
      telephone: '+213 555 123 456',
      produits: 'Matériel informatique',
      valeur: 125000,
      priorite: 'haute',
      retard: 0,
      position: 'En route vers Alger',
      progression: 75
    },
    {
      id: 'LIV-2024-002',
      client: 'Société XYZ',
      adresse: '456 Avenue des Martyrs, Oran',
      dateLivraison: '2024-01-19',
      statut: 'en-transit',
      chauffeur: 'Fatima Khelil',
      telephone: '+213 555 789 012',
      produits: 'Équipements industriels',
      valeur: 85000,
      priorite: 'moyenne',
      retard: 1,
      position: 'Sortie d\'entrepôt',
      progression: 25
    },
    {
      id: 'LIV-2024-003',
      client: 'Compagnie DEF',
      adresse: '789 Boulevard de la République, Constantine',
      dateLivraison: '2024-01-18',
      statut: 'en-retard',
      chauffeur: 'Mohamed Tazi',
      telephone: '+213 555 345 678',
      produits: 'Fournitures de bureau',
      valeur: 45000,
      priorite: 'basse',
      retard: 2,
      position: 'Retard - Problème technique',
      progression: 60
    },
    {
      id: 'LIV-2024-004',
      client: 'Groupe GHI',
      adresse: '321 Rue de la Liberté, Annaba',
      dateLivraison: '2024-01-21',
      statut: 'en-transit',
      chauffeur: 'Aicha Bouzid',
      telephone: '+213 555 901 234',
      produits: 'Matériel médical',
      valeur: 180000,
      priorite: 'haute',
      retard: 0,
      position: 'En cours de livraison',
      progression: 90
    },
    {
      id: 'LIV-2024-005',
      client: 'Entreprise JKL',
      adresse: '654 Avenue de l\'Indépendance, Blida',
      dateLivraison: '2024-01-17',
      statut: 'en-retard',
      chauffeur: 'Karim Saadi',
      telephone: '+213 555 567 890',
      produits: 'Produits chimiques',
      valeur: 95000,
      priorite: 'moyenne',
      retard: 4,
      position: 'Retard - Conditions météo',
      progression: 30
    }
  ];

  const livraisonsLivrees = [
    {
      id: 'LIV-2024-006',
      client: 'Société MNO',
      dateLivraison: '2024-01-16',
      dateReelle: '2024-01-16',
      statut: 'livree',
      chauffeur: 'Nadia Cherif',
      satisfaction: 5,
      commentaire: 'Livraison parfaite, client très satisfait'
    },
    {
      id: 'LIV-2024-007',
      client: 'Compagnie PQR',
      dateLivraison: '2024-01-15',
      dateReelle: '2024-01-15',
      statut: 'livree',
      chauffeur: 'Omar Benali',
      satisfaction: 4,
      commentaire: 'Bon service, délai respecté'
    },
    {
      id: 'LIV-2024-008',
      client: 'Groupe STU',
      dateLivraison: '2024-01-14',
      dateReelle: '2024-01-14',
      statut: 'livree',
      chauffeur: 'Leila Mansouri',
      satisfaction: 5,
      commentaire: 'Excellent, recommandé'
    }
  ];

  const statistiquesData = {
    evolution: [
      { mois: 'Jan', livrees: 45, enRetard: 8, tauxReussite: 85 },
      { mois: 'Fév', livrees: 52, enRetard: 5, tauxReussite: 91 },
      { mois: 'Mar', livrees: 48, enRetard: 12, tauxReussite: 80 },
      { mois: 'Avr', livrees: 61, enRetard: 7, tauxReussite: 90 },
      { mois: 'Mai', livrees: 55, enRetard: 9, tauxReussite: 86 },
      { mois: 'Jun', livrees: 58, enRetard: 6, tauxReussite: 91 }
    ],
    parRegion: [
      { region: 'Alger', livraisons: 45, tauxReussite: 89 },
      { region: 'Oran', livraisons: 32, tauxReussite: 84 },
      { region: 'Constantine', livraisons: 28, tauxReussite: 79 },
      { region: 'Annaba', livraisons: 22, tauxReussite: 86 },
      { region: 'Autres', livraisons: 18, tauxReussite: 83 }
    ],
    parChauffeur: [
      { chauffeur: 'Ahmed Benali', livraisons: 25, tauxReussite: 92, satisfaction: 4.5 },
      { chauffeur: 'Fatima Khelil', livraisons: 22, tauxReussite: 86, satisfaction: 4.2 },
      { chauffeur: 'Mohamed Tazi', livraisons: 20, tauxReussite: 80, satisfaction: 3.9 },
      { chauffeur: 'Aicha Bouzid', livraisons: 18, tauxReussite: 89, satisfaction: 4.4 },
      { chauffeur: 'Karim Saadi', livraisons: 15, tauxReussite: 87, satisfaction: 4.1 }
    ]
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'en-transit': return 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700';
      case 'livree': return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700';
      case 'en-retard': return 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700';
      default: return 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'en-transit': return TruckIcon;
      case 'livree': return CheckCircleIcon;
      case 'en-retard': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'haute': return 'text-red-600 bg-red-50';
      case 'moyenne': return 'text-yellow-600 bg-yellow-50';
      case 'basse': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Métriques principales - Palette Slate Professionnelle */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">En Transit</p>
              <p className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-1">{statsGenerales.enTransit}</p>
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Livraisons en cours</p>
              <div className="mt-2 flex items-center text-xs">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1 text-blue-600" />
                <span className="text-blue-600">+12% vs semaine dernière</span>
              </div>
            </div>
            <div className="bg-blue-600 dark:bg-blue-500 p-3 rounded-xl shadow-lg">
              <TruckIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-700 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-400/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Livrées</p>
              <p className="text-4xl font-bold text-emerald-900 dark:text-emerald-100 mb-1">{statsGenerales.livrees}</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Cette semaine</p>
              <div className="mt-2 flex items-center text-xs">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1 text-emerald-600" />
                <span className="text-emerald-600">+8% vs semaine dernière</span>
              </div>
            </div>
            <div className="bg-emerald-600 dark:bg-emerald-500 p-3 rounded-xl shadow-lg">
              <CheckCircleIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-xl border border-red-200 dark:border-red-700 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-400/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">En Retard</p>
              <p className="text-4xl font-bold text-red-900 dark:text-red-100 mb-1">{statsGenerales.enRetard}</p>
              <p className="text-xs text-red-700 dark:text-red-300 font-medium">Nécessitent suivi</p>
              <div className="mt-2 flex items-center text-xs">
                <ArrowTrendingDownIcon className="h-3 w-3 mr-1 text-red-600" />
                <span className="text-red-600">-25% vs semaine dernière</span>
              </div>
            </div>
            <div className="bg-red-600 dark:bg-red-500 p-3 rounded-xl shadow-lg">
              <ExclamationTriangleIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-slate-400/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Taux de Réussite</p>
              <p className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">{statsGenerales.tauxReussite}%</p>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Délai moyen: {statsGenerales.delaiMoyen}j</p>
              <div className="mt-2 flex items-center text-xs">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1 text-slate-600" />
                <span className="text-slate-600">+3% vs semaine dernière</span>
              </div>
            </div>
            <div className="bg-slate-700 dark:bg-slate-600 p-3 rounded-xl shadow-lg">
              <ChartBarIcon className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Indicateurs de Performance Avancés */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
          <SparklesIcon className="h-5 w-5 mr-2 text-slate-600 dark:text-slate-400" />
          Indicateurs de Performance Avancés
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Taux de ponctualité */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase">Ponctualité</span>
              <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {Math.round((statsGenerales.livrees / statsGenerales.total) * 100)}%
            </div>
            <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
              Livraisons à l'heure
            </div>
          </div>

          {/* Valeur moyenne par livraison */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase">Valeur Moyenne</span>
              <CurrencyDollarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {formatCurrency(Math.round(livraisonsEnCours.reduce((sum, l) => sum + l.valeur, 0) / Math.max(livraisonsEnCours.length, 1)))}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Par livraison
            </div>
          </div>

          {/* Temps moyen de livraison */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase">Délai Moyen</span>
              <ClockIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              {statsGenerales.delaiMoyen}j
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Temps de traitement
            </div>
          </div>

          {/* Score de satisfaction */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase">Satisfaction</span>
              <StarIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {statsGenerales.satisfaction}/5
            </div>
            <div className="text-xs text-purple-700 dark:text-purple-300 mt-1">
              Note moyenne clients
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Livraisons</h4>
          <div className="h-64">
            <Line
              data={{
                labels: statistiquesData.evolution.map(item => item.mois),
                datasets: [{
                  label: 'Livraisons Réussies',
                  data: statistiquesData.evolution.map(item => item.livrees),
                  borderColor: '#10B981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  tension: 0.4,
                  fill: true
                }, {
                  label: 'En Retard',
                  data: statistiquesData.evolution.map(item => item.enRetard),
                  borderColor: '#EF4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  tension: 0.4,
                  fill: true
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
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Région</h4>
          <div className="h-64">
            <Doughnut
              data={{
                labels: statistiquesData.parRegion.map(item => item.region),
                datasets: [{
                  data: statistiquesData.parRegion.map(item => item.livraisons),
                  backgroundColor: [
                    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
                  ],
                  borderColor: [
                    '#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED'
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
      </div>
    </div>
  );

  const renderEnCours = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-900">Livraisons en Cours</h4>
        <div className="flex space-x-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 transition-all font-medium"
          >
            <option value="tous">Tous les statuts</option>
            <option value="en-transit">🚚 En Transit</option>
            <option value="en-retard">⚠️ En Retard</option>
          </select>
          <button 
            onClick={() => alert('Création d\'une nouvelle livraison...')}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 flex items-center space-x-2 transition-all shadow-sm font-medium"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nouvelle Livraison</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {livraisonsEnCours
          .filter(livraison => selectedStatus === 'tous' || livraison.statut === selectedStatus)
          .map((livraison) => {
            const StatutIcon = getStatutIcon(livraison.statut);
            return (
              <Card key={livraison.id} className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-700 p-3 rounded-xl">
                      <StatutIcon className="h-8 w-8 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="text-base font-bold text-slate-900 dark:text-slate-100">{livraison.id}</h5>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatutColor(livraison.statut)}`}>
                          {livraison.statut.replace('-', ' ')}
                        </span>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPrioriteColor(livraison.priorite)}`}>
                          {livraison.priorite}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Client: <span className="font-medium">{livraison.client}</span></p>
                          <p className="text-gray-600">Produits: <span className="font-medium">{livraison.produits}</span></p>
                        </div>
                        <div>
                          <p className="text-gray-600">Chauffeur: <span className="font-medium">{livraison.chauffeur}</span></p>
                          <p className="text-gray-600">Tél: <span className="font-medium">{livraison.telephone}</span></p>
                        </div>
                        <div>
                          <p className="text-gray-600">Valeur: <span className="font-medium">{formatCurrency(livraison.valeur)}</span></p>
                          <p className="text-gray-600">Position: <span className="font-medium">{livraison.position}</span></p>
                        </div>
                      </div>
                      {livraison.retard > 0 && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm text-red-600">
                            <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                            Retard de {livraison.retard} jour{livraison.retard > 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Progression</p>
                      <p className="text-lg font-bold text-blue-600">{livraison.progression}%</p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button 
                        onClick={() => alert(`Détails de la livraison ${livraison.id}`)}
                        className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => alert(`Appel au chauffeur: ${livraison.telephone}`)}
                        className="p-2 text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                        title="Contacter"
                      >
                        <PhoneIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => alert(`Modification de la livraison ${livraison.id}`)}
                        className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );

  const renderStatistiques = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">Statistiques Détaillées</h4>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Performance par Chauffeur</h5>
          <div className="space-y-3">
            {statistiquesData.parChauffeur.map((chauffeur, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900">{chauffeur.chauffeur}</p>
                  <p className="text-xs text-gray-500">{chauffeur.livraisons} livraisons</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{chauffeur.tauxReussite}%</p>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-yellow-500">★</span>
                    <span className="text-xs text-gray-600">{chauffeur.satisfaction}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Taux de Réussite par Région</h5>
          <div className="h-48">
            <Bar
              data={{
                labels: statistiquesData.parRegion.map(item => item.region),
                datasets: [{
                  label: 'Taux de Réussite (%)',
                  data: statistiquesData.parRegion.map(item => item.tauxReussite),
                  backgroundColor: [
                    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
                  ],
                  borderColor: [
                    '#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED'
                  ],
                  borderWidth: 1
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
                    max: 100
                  }
                }
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );

  const renderGeographie = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">Suivi Géographique</h4>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Répartition Géographique</h5>
          <div className="h-64">
            <PolarArea
              data={{
                labels: statistiquesData.parRegion.map(item => item.region),
                datasets: [{
                  data: statistiquesData.parRegion.map(item => item.livraisons),
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
          <h5 className="text-md font-semibold text-gray-900 mb-4">Détails par Région</h5>
          <div className="space-y-4">
            {statistiquesData.parRegion.map((region, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h6 className="text-sm font-semibold text-gray-900">{region.region}</h6>
                  <span className="text-sm text-gray-600">{region.livraisons} livraisons</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${region.tauxReussite}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{region.tauxReussite}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* En-tête - Palette Slate Professionnelle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Suivi des Livraisons</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Gestion et suivi en temps réel des livraisons</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => alert('Création d\'une nouvelle livraison...')}
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm font-medium space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nouvelle Livraison</span>
          </button>
          <button 
            onClick={() => alert('Génération du rapport de livraisons...')}
            className="flex items-center px-5 py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all shadow-sm font-medium space-x-2"
          >
            <DocumentTextIcon className="h-4 w-4" />
            <span>Rapport</span>
          </button>
        </div>
      </div>

      {/* Navigation par onglets - Palette Slate */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-t-xl">
        <nav className="flex space-x-4 px-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'VUE D\'ENSEMBLE', icon: ChartBarIcon },
            { id: 'en-cours', label: 'EN COURS', icon: TruckIcon },
            { id: 'statistiques', label: 'STATISTIQUES', icon: ChartPieIcon },
            { id: 'geographie', label: 'GÉOGRAPHIE', icon: GlobeAltIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center py-4 px-3 border-b-3 font-semibold text-sm whitespace-nowrap transition-all ${
                  activeView === tab.id
                    ? 'border-slate-700 dark:border-slate-400 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 rounded-t-lg'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-6">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'en-cours' && renderEnCours()}
        {activeView === 'statistiques' && renderStatistiques()}
        {activeView === 'geographie' && renderGeographie()}
      </div>
    </div>
  );
};

export default SuiviLivraisonsWidget;
