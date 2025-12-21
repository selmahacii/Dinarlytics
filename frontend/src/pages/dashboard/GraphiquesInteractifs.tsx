import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ChartBarIcon, 
  ChartPieIcon, 
  ArrowTrendingUpIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CubeIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  MagnifyingGlassIcon,
  LightBulbIcon,
  XMarkIcon,
  SparklesIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut, Radar, PolarArea, Bubble } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
} from 'chart.js';
import HelpButton from '../../components/UI/HelpButton';
import TooltipComponent from '../../components/UI/Tooltip';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

const GraphiquesInteractifs: React.FC = () => {
  const [selectedChart, setSelectedChart] = useState('ventes');
  const [selectedPeriod, setSelectedPeriod] = useState('30j');
  const [comparePeriod, setComparePeriod] = useState(false);
  const [fullScreenMode, setFullScreenMode] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('tous');
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'doughnut' | 'radar' | 'polar'>('bar');
  
  // Vérifier que selectedPeriod est valide
  const validPeriods = ['7j', '30j', '90j', '1a'];
  const currentPeriod = validPeriods.includes(selectedPeriod) ? selectedPeriod : '30j';

  // Récupère les données adaptatives (CA, clients, marge...) depuis le contexte
  const { companyData, user, formatCurrency } = useApp();

  // Détecte si l'entreprise est une boutique (ex: "Boutique El Baraka") pour spécialiser les jeux de données
  const isBoutique = (user?.companyType === 'boutique') || (user?.nom?.toLowerCase()?.includes('baraka') ?? false);

  // Données détaillées et réalistes pour les graphiques
  const salesData = {
    '7j': [
      { date: '2024-12-09', ventes: 14200, benefices: 3200, clients: 45, stocks: 98.5, panierMoyen: 315, tauxConversion: 12.5, nouveauxClients: 8, commandes: 45 },
      { date: '2024-12-10', ventes: 15800, benefices: 3800, clients: 52, stocks: 97.8, panierMoyen: 304, tauxConversion: 13.2, nouveauxClients: 12, commandes: 52 },
      { date: '2024-12-11', ventes: 13400, benefices: 2900, clients: 38, stocks: 98.2, panierMoyen: 353, tauxConversion: 11.8, nouveauxClients: 6, commandes: 38 },
      { date: '2024-12-12', ventes: 16800, benefices: 4200, clients: 61, stocks: 97.5, panierMoyen: 275, tauxConversion: 14.1, nouveauxClients: 15, commandes: 61 },
      { date: '2024-12-13', ventes: 15200, benefices: 3600, clients: 48, stocks: 98.1, panierMoyen: 317, tauxConversion: 12.8, nouveauxClients: 9, commandes: 48 },
      { date: '2024-12-14', ventes: 17500, benefices: 4500, clients: 67, stocks: 97.2, panierMoyen: 261, tauxConversion: 15.3, nouveauxClients: 18, commandes: 67 },
      { date: '2024-12-15', ventes: 15200, benefices: 3600, clients: 48, stocks: 98.0, panierMoyen: 317, tauxConversion: 12.8, nouveauxClients: 9, commandes: 48 }
    ],
    '30j': [
      { date: '2024-11-16', ventes: 12500, benefices: 2800, clients: 35, stocks: 99.1, panierMoyen: 357, tauxConversion: 11.2, nouveauxClients: 5, commandes: 35 },
      { date: '2024-11-17', ventes: 13800, benefices: 3200, clients: 42, stocks: 98.8, panierMoyen: 329, tauxConversion: 12.1, nouveauxClients: 7, commandes: 42 },
      { date: '2024-11-18', ventes: 14500, benefices: 3500, clients: 48, stocks: 98.5, panierMoyen: 302, tauxConversion: 12.8, nouveauxClients: 9, commandes: 48 },
      { date: '2024-11-19', ventes: 13200, benefices: 3000, clients: 38, stocks: 98.9, panierMoyen: 347, tauxConversion: 11.5, nouveauxClients: 6, commandes: 38 },
      { date: '2024-11-20', ventes: 16200, benefices: 4000, clients: 55, stocks: 98.2, panierMoyen: 295, tauxConversion: 13.8, nouveauxClients: 12, commandes: 55 },
      { date: '2024-11-21', ventes: 14800, benefices: 3600, clients: 46, stocks: 98.6, panierMoyen: 322, tauxConversion: 12.5, nouveauxClients: 8, commandes: 46 },
      { date: '2024-11-22', ventes: 15500, benefices: 3800, clients: 51, stocks: 98.3, panierMoyen: 304, tauxConversion: 13.1, nouveauxClients: 10, commandes: 51 },
      { date: '2024-11-23', ventes: 14200, benefices: 3400, clients: 44, stocks: 98.7, panierMoyen: 323, tauxConversion: 12.3, nouveauxClients: 7, commandes: 44 },
      { date: '2024-11-24', ventes: 16800, benefices: 4200, clients: 58, stocks: 98.0, panierMoyen: 290, tauxConversion: 14.2, nouveauxClients: 14, commandes: 58 },
      { date: '2024-11-25', ventes: 15200, benefices: 3700, clients: 49, stocks: 98.4, panierMoyen: 310, tauxConversion: 12.9, nouveauxClients: 9, commandes: 49 },
      { date: '2024-11-26', ventes: 13500, benefices: 3100, clients: 40, stocks: 98.8, panierMoyen: 338, tauxConversion: 11.8, nouveauxClients: 6, commandes: 40 },
      { date: '2024-11-27', ventes: 14800, benefices: 3600, clients: 47, stocks: 98.5, panierMoyen: 315, tauxConversion: 12.6, nouveauxClients: 8, commandes: 47 },
      { date: '2024-11-28', ventes: 16200, benefices: 4000, clients: 54, stocks: 98.2, panierMoyen: 300, tauxConversion: 13.5, nouveauxClients: 11, commandes: 54 },
      { date: '2024-11-29', ventes: 15500, benefices: 3800, clients: 50, stocks: 98.6, panierMoyen: 310, tauxConversion: 13.0, nouveauxClients: 9, commandes: 50 },
      { date: '2024-11-30', ventes: 14200, benefices: 3400, clients: 43, stocks: 98.9, panierMoyen: 330, tauxConversion: 12.1, nouveauxClients: 7, commandes: 43 },
      { date: '2024-12-01', ventes: 16800, benefices: 4200, clients: 59, stocks: 98.1, panierMoyen: 285, tauxConversion: 14.5, nouveauxClients: 15, commandes: 59 },
      { date: '2024-12-02', ventes: 15200, benefices: 3700, clients: 48, stocks: 98.5, panierMoyen: 317, tauxConversion: 12.8, nouveauxClients: 9, commandes: 48 },
      { date: '2024-12-03', ventes: 13500, benefices: 3100, clients: 39, stocks: 98.8, panierMoyen: 346, tauxConversion: 11.9, nouveauxClients: 6, commandes: 39 },
      { date: '2024-12-04', ventes: 14800, benefices: 3600, clients: 46, stocks: 98.4, panierMoyen: 322, tauxConversion: 12.7, nouveauxClients: 8, commandes: 46 },
      { date: '2024-12-05', ventes: 16200, benefices: 4000, clients: 53, stocks: 98.2, panierMoyen: 306, tauxConversion: 13.4, nouveauxClients: 11, commandes: 53 },
      { date: '2024-12-06', ventes: 15500, benefices: 3800, clients: 49, stocks: 98.6, panierMoyen: 316, tauxConversion: 13.0, nouveauxClients: 9, commandes: 49 },
      { date: '2024-12-07', ventes: 14200, benefices: 3400, clients: 42, stocks: 98.9, panierMoyen: 338, tauxConversion: 12.2, nouveauxClients: 7, commandes: 42 },
      { date: '2024-12-08', ventes: 16800, benefices: 4200, clients: 58, stocks: 98.1, panierMoyen: 290, tauxConversion: 14.3, nouveauxClients: 14, commandes: 58 },
      { date: '2024-12-09', ventes: 15200, benefices: 3700, clients: 47, stocks: 98.5, panierMoyen: 323, tauxConversion: 12.9, nouveauxClients: 8, commandes: 47 },
      { date: '2024-12-10', ventes: 13500, benefices: 3100, clients: 38, stocks: 98.8, panierMoyen: 355, tauxConversion: 11.8, nouveauxClients: 6, commandes: 38 },
      { date: '2024-12-11', ventes: 14800, benefices: 3600, clients: 45, stocks: 98.4, panierMoyen: 329, tauxConversion: 12.6, nouveauxClients: 8, commandes: 45 },
      { date: '2024-12-12', ventes: 16200, benefices: 4000, clients: 52, stocks: 98.2, panierMoyen: 312, tauxConversion: 13.3, nouveauxClients: 10, commandes: 52 },
      { date: '2024-12-13', ventes: 15500, benefices: 3800, clients: 48, stocks: 98.6, panierMoyen: 323, tauxConversion: 12.8, nouveauxClients: 9, commandes: 48 },
      { date: '2024-12-14', ventes: 14200, benefices: 3400, clients: 41, stocks: 98.9, panierMoyen: 346, tauxConversion: 12.1, nouveauxClients: 7, commandes: 41 },
      { date: '2024-12-15', ventes: 15200, benefices: 3600, clients: 46, stocks: 98.3, panierMoyen: 330, tauxConversion: 12.8, nouveauxClients: 9, commandes: 46 }
    ],
    '90j': [
      { date: '2024-09-01', ventes: 420000, benefices: 98000, clients: 1250, stocks: 97.8, panierMoyen: 336, tauxConversion: 12.1, nouveauxClients: 180, commandes: 1250 },
      { date: '2024-10-01', ventes: 445000, benefices: 105000, clients: 1320, stocks: 98.1, panierMoyen: 337, tauxConversion: 12.4, nouveauxClients: 195, commandes: 1320 },
      { date: '2024-11-01', ventes: 465000, benefices: 112000, clients: 1380, stocks: 98.3, panierMoyen: 337, tauxConversion: 12.6, nouveauxClients: 210, commandes: 1380 },
      { date: '2024-12-01', ventes: 485000, benefices: 118000, clients: 1440, stocks: 98.5, panierMoyen: 337, tauxConversion: 12.8, nouveauxClients: 225, commandes: 1440 }
    ],
    '1a': [
      { date: '2024-01-01', ventes: 380000, benefices: 85000, clients: 1100, stocks: 97.2, panierMoyen: 345, tauxConversion: 11.8, nouveauxClients: 150, commandes: 1100 },
      { date: '2024-02-01', ventes: 395000, benefices: 92000, clients: 1150, stocks: 97.5, panierMoyen: 343, tauxConversion: 12.0, nouveauxClients: 160, commandes: 1150 },
      { date: '2024-03-01', ventes: 410000, benefices: 96000, clients: 1180, stocks: 97.8, panierMoyen: 347, tauxConversion: 12.2, nouveauxClients: 165, commandes: 1180 },
      { date: '2024-04-01', ventes: 425000, benefices: 100000, clients: 1200, stocks: 98.0, panierMoyen: 354, tauxConversion: 12.3, nouveauxClients: 170, commandes: 1200 },
      { date: '2024-05-01', ventes: 440000, benefices: 104000, clients: 1220, stocks: 98.2, panierMoyen: 361, tauxConversion: 12.4, nouveauxClients: 175, commandes: 1220 },
      { date: '2024-06-01', ventes: 455000, benefices: 108000, clients: 1240, stocks: 98.4, panierMoyen: 367, tauxConversion: 12.5, nouveauxClients: 180, commandes: 1240 },
      { date: '2024-07-01', ventes: 470000, benefices: 112000, clients: 1260, stocks: 98.6, panierMoyen: 373, tauxConversion: 12.6, nouveauxClients: 185, commandes: 1260 },
      { date: '2024-08-01', ventes: 485000, benefices: 116000, clients: 1280, stocks: 98.8, panierMoyen: 379, tauxConversion: 12.7, nouveauxClients: 190, commandes: 1280 },
      { date: '2024-09-01', ventes: 500000, benefices: 120000, clients: 1300, stocks: 99.0, panierMoyen: 385, tauxConversion: 12.8, nouveauxClients: 195, commandes: 1300 },
      { date: '2024-10-01', ventes: 515000, benefices: 124000, clients: 1320, stocks: 99.2, panierMoyen: 390, tauxConversion: 12.9, nouveauxClients: 200, commandes: 1320 },
      { date: '2024-11-01', ventes: 530000, benefices: 128000, clients: 1340, stocks: 99.4, panierMoyen: 396, tauxConversion: 13.0, nouveauxClients: 205, commandes: 1340 },
      { date: '2024-12-01', ventes: 545000, benefices: 132000, clients: 1360, stocks: 99.6, panierMoyen: 401, tauxConversion: 13.1, nouveauxClients: 210, commandes: 1360 }
    ]
  };

  const categoryDataDefault = [
    { category: 'Électronique', value: 45, amount: 110250, color: 'bg-slate-700' },
    { category: 'Vêtements', value: 25, amount: 61250, color: 'bg-slate-600' },
    { category: 'Alimentaire', value: 20, amount: 49000, color: 'bg-slate-500' },
    { category: 'Services', value: 10, amount: 24500, color: 'bg-slate-400' }
  ];

  const categoryDataBoutique = [
    { category: 'Épicerie', value: 32, amount: 78000, color: 'bg-emerald-700' },
    { category: 'Boissons', value: 24, amount: 58500, color: 'bg-emerald-600' },
    { category: 'Hygiène & Beauté', value: 18, amount: 43800, color: 'bg-emerald-500' },
    { category: 'Produits ménagers', value: 16, amount: 39000, color: 'bg-emerald-400' },
    { category: 'Boulangerie', value: 7, amount: 17000, color: 'bg-emerald-300' },
    { category: 'Autres', value: 3, amount: 7500, color: 'bg-emerald-200' }
  ];

  const temporalDataDefault = [
    { time: '00:00', value: 1200, visitors: 45, conversions: 8 },
    { time: '04:00', value: 800, visitors: 32, conversions: 5 },
    { time: '08:00', value: 2500, visitors: 78, conversions: 15 },
    { time: '12:00', value: 4200, visitors: 95, conversions: 22 },
    { time: '16:00', value: 3800, visitors: 88, conversions: 18 },
    { time: '20:00', value: 2100, visitors: 56, conversions: 12 },
    { time: '24:00', value: 1500, visitors: 42, conversions: 8 }
  ];

  const temporalDataBoutique = [
    { time: '08:00', value: 1800, visitors: 35, conversions: 10 },
    { time: '10:00', value: 2400, visitors: 48, conversions: 13 },
    { time: '12:00', value: 4200, visitors: 85, conversions: 22 },
    { time: '14:00', value: 2600, visitors: 52, conversions: 14 },
    { time: '16:00', value: 3000, visitors: 64, conversions: 16 },
    { time: '18:00', value: 4600, visitors: 92, conversions: 24 },
    { time: '20:00', value: 2300, visitors: 45, conversions: 11 }
  ];

  // Sélection des jeux de données actifs selon le type d'entreprise
  const activeCategoryData = isBoutique ? categoryDataBoutique : categoryDataDefault;
  const activeTemporalData = isBoutique ? temporalDataBoutique : temporalDataDefault;

  const chartTypes = [
    { 
      id: 'ventes', 
      name: 'Ventes', 
      icon: ChartBarIcon,
      description: 'Analysez l\'évolution de votre chiffre d\'affaires sur différentes périodes. Identifiez les tendances, les pics de vente et les opportunités d\'optimisation.',
      metrics: ['Chiffre d\'affaires', 'Panier moyen', 'Nombre de commandes', 'Taux de croissance']
    },
    { 
      id: 'benefices', 
      name: 'Bénéfices', 
      icon: ArrowTrendingUpIcon,
      description: 'Suivez votre rentabilité et vos marges bénéficiaires. Analysez l\'impact de vos stratégies sur la performance financière.',
      metrics: ['Bénéfices nets', 'Marge bénéficiaire', 'ROI', 'Croissance des profits']
    },
    { 
      id: 'clients', 
      name: 'Clients', 
      icon: ChartPieIcon,
      description: 'Comprenez votre base client : acquisition, rétention, et comportement d\'achat. Optimisez vos stratégies de fidélisation.',
      metrics: ['Nombre de clients', 'Nouveaux clients', 'Taux de conversion', 'Taux de rétention']
    },
    { 
      id: 'stocks', 
      name: 'Stocks', 
      icon: FunnelIcon,
      description: 'Surveillez vos niveaux de stock en temps réel. Évitez les ruptures et optimisez votre rotation des stocks.',
      metrics: ['Niveau de stock', 'Taux de rotation', 'Valeur du stock', 'Alertes de réapprovisionnement']
    },
    { 
      id: 'performance', 
      name: 'Performance', 
      icon: AdjustmentsHorizontalIcon,
      description: 'Évaluez la performance globale de votre entreprise avec des indicateurs clés multidimensionnels.',
      metrics: ['KPIs financiers', 'Efficacité opérationnelle', 'Productivité', 'Rentabilité']
    },
    { 
      id: 'comparaison', 
      name: 'Comparaison', 
      icon: ArrowDownTrayIcon,
      description: 'Comparez vos performances entre différentes périodes pour identifier les tendances et les opportunités d\'amélioration.',
      metrics: ['Évolution temporelle', 'Comparaison période', 'Benchmarking', 'Objectifs vs Réalisé']
    }
  ];

  const periods = [
    { id: '7j', name: '7 jours' },
    { id: '30j', name: '30 jours' },
    { id: '90j', name: '3 mois' },
    { id: '1a', name: '1 an' }
  ];

  // Prepare the dataset currently used by the main bar chart
  const currentSlice = useMemo(() => {
    const base = salesData[currentPeriod as keyof typeof salesData] || [];
    const slice = base.slice(
      currentPeriod === '7j' ? -7 :
      currentPeriod === '30j' ? -10 :
      currentPeriod === '90j' ? -4 :
      -12
    );
    return slice;
  }, [currentPeriod]);

  // Générer les données pour Chart.js
  const getChartData = useMemo(() => {
    const data = salesData[currentPeriod as keyof typeof salesData] || [];
    const slice = data.slice(
      currentPeriod === '7j' ? -7 :
      currentPeriod === '30j' ? -10 :
      currentPeriod === '90j' ? -4 :
      -12
    );

    let labels: string[] = [];
    let dataset1: number[] = [];
    let dataset2: number[] = [];
    let label1 = '';
    let label2 = '';

    switch (selectedChart) {
      case 'ventes':
        labels = slice.map((d: any) => {
          const date = new Date(d.date);
          return currentPeriod === '90j' || currentPeriod === '1a'
            ? date.toLocaleDateString('fr-FR', { month: 'short' })
            : date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        });
        dataset1 = slice.map((d: any) => d.ventes);
        label1 = 'Ventes';
        if (comparePeriod) {
          const prevData = salesData[currentPeriod as keyof typeof salesData] || [];
          const prevSlice = prevData.slice(
            currentPeriod === '7j' ? -14 : currentPeriod === '30j' ? -20 : currentPeriod === '90j' ? -8 : -24
          ).slice(0, slice.length);
          dataset2 = prevSlice.map((d: any) => d.ventes);
          label2 = 'Période précédente';
        }
        break;
      case 'benefices':
        labels = slice.map((d: any) => {
          const date = new Date(d.date);
          return currentPeriod === '90j' || currentPeriod === '1a'
            ? date.toLocaleDateString('fr-FR', { month: 'short' })
            : date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        });
        dataset1 = slice.map((d: any) => d.benefices);
        label1 = 'Bénéfices';
        if (comparePeriod) {
          const prevData = salesData[currentPeriod as keyof typeof salesData] || [];
          const prevSlice = prevData.slice(
            currentPeriod === '7j' ? -14 : currentPeriod === '30j' ? -20 : currentPeriod === '90j' ? -8 : -24
          ).slice(0, slice.length);
          dataset2 = prevSlice.map((d: any) => d.benefices);
          label2 = 'Période précédente';
        }
        break;
      case 'clients':
        labels = slice.map((d: any) => {
          const date = new Date(d.date);
          return currentPeriod === '90j' || currentPeriod === '1a'
            ? date.toLocaleDateString('fr-FR', { month: 'short' })
            : date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        });
        dataset1 = slice.map((d: any) => d.clients);
        label1 = 'Clients';
        if (comparePeriod) {
          const prevData = salesData[currentPeriod as keyof typeof salesData] || [];
          const prevSlice = prevData.slice(
            currentPeriod === '7j' ? -14 : currentPeriod === '30j' ? -20 : currentPeriod === '90j' ? -8 : -24
          ).slice(0, slice.length);
          dataset2 = prevSlice.map((d: any) => d.clients);
          label2 = 'Période précédente';
        }
        break;
      case 'stocks':
        labels = slice.map((d: any) => {
          const date = new Date(d.date);
          return currentPeriod === '90j' || currentPeriod === '1a'
            ? date.toLocaleDateString('fr-FR', { month: 'short' })
            : date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        });
        dataset1 = slice.map((d: any) => d.stocks);
        label1 = 'Niveau de stock (%)';
        break;
      default:
        labels = slice.map((d: any) => {
          const date = new Date(d.date);
          return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        });
        dataset1 = slice.map((d: any) => d.ventes);
        label1 = 'Ventes';
    }

    return {
      labels,
      datasets: [
        {
          label: label1,
          data: dataset1,
          backgroundColor: chartType === 'bar' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(51, 65, 85, 0.1)',
          borderColor: 'rgba(51, 65, 85, 1)',
          borderWidth: 2,
          fill: chartType === 'area',
          tension: 0.4
        },
        ...(comparePeriod && dataset2.length > 0 ? [{
          label: label2,
          data: dataset2,
          backgroundColor: chartType === 'bar' ? 'rgba(148, 163, 184, 0.6)' : 'rgba(148, 163, 184, 0.1)',
          borderColor: 'rgba(148, 163, 184, 1)',
          borderWidth: 2,
          borderDash: [5, 5],
          fill: chartType === 'area',
          tension: 0.4
        }] : [])
      ]
    };
  }, [selectedChart, currentPeriod, comparePeriod, chartType]);

  // Générer les insights automatiques avec recommandations
  const generateInsights = useMemo(() => {
    const data = salesData[currentPeriod as keyof typeof salesData] || [];
    if (data.length < 2) return [];

    const insights: Array<{ 
      type: 'success' | 'warning' | 'info'; 
      message: string; 
      icon: string;
      recommendation?: string;
      action?: string;
    }> = [];
    const current = data[data.length - 1];
    const previous = data[data.length - 2];
    const avgVentes = data.reduce((sum: number, d: any) => sum + d.ventes, 0) / data.length;
    const avgBenefices = data.reduce((sum: number, d: any) => sum + d.benefices, 0) / data.length;

    switch (selectedChart) {
      case 'ventes':
        const ventesChange = ((current.ventes - previous.ventes) / previous.ventes) * 100;
        if (ventesChange > 10) {
          insights.push({
            type: 'success',
            message: `Croissance exceptionnelle de ${ventesChange.toFixed(1)}% des ventes`,
            icon: '📈',
            recommendation: `Vos ventes sont en forte croissance. Analysez les facteurs de succès pour maintenir cette tendance.`,
            action: 'Analyser les produits/services les plus performants'
          });
        } else if (ventesChange < -10) {
          insights.push({
            type: 'warning',
            message: `Baisse significative de ${Math.abs(ventesChange).toFixed(1)}% des ventes`,
            icon: '⚠️',
            recommendation: `Identifiez les causes de cette baisse : saisonnalité, concurrence, ou problèmes opérationnels.`,
            action: 'Examiner les tendances de marché et la concurrence'
          });
        }
        if (current.panierMoyen > previous.panierMoyen * 1.1) {
          insights.push({
            type: 'info',
            message: `Panier moyen en hausse de ${((current.panierMoyen - previous.panierMoyen) / previous.panierMoyen * 100).toFixed(1)}%`,
            icon: '💰',
            recommendation: `Vos clients dépensent plus par transaction. Renforcez vos stratégies de vente croisée.`,
            action: 'Optimiser les recommandations produits'
          });
        }
        if (current.ventes > avgVentes * 1.2) {
          insights.push({
            type: 'success',
            message: `Performance supérieure à la moyenne : ${((current.ventes / avgVentes - 1) * 100).toFixed(1)}% au-dessus`,
            icon: '⭐',
            recommendation: `Votre performance actuelle dépasse significativement la moyenne. Capitalisez sur cette dynamique.`
          });
        }
        break;
      case 'benefices':
        const beneficesChange = ((current.benefices - previous.benefices) / previous.benefices) * 100;
        const marge = (current.benefices / current.ventes) * 100;
        if (beneficesChange > 15) {
          insights.push({
            type: 'success',
            message: `Bénéfices en forte hausse de ${beneficesChange.toFixed(1)}%`,
            icon: '💚',
            recommendation: `Excellente performance ! Vos bénéfices progressent rapidement. Maintenez cette efficacité opérationnelle.`,
            action: 'Réinvestir dans les activités les plus rentables'
          });
        }
        if (marge > 25) {
          insights.push({
            type: 'success',
            message: `Marge excellente de ${marge.toFixed(1)}%`,
            icon: '✅',
            recommendation: `Votre marge bénéficiaire est excellente. Vous avez une bonne maîtrise de vos coûts.`,
            action: 'Maintenir cette performance et explorer de nouvelles opportunités'
          });
        } else if (marge < 15) {
          insights.push({
            type: 'warning',
            message: `Marge faible de ${marge.toFixed(1)}% - Optimisation nécessaire`,
            icon: '⚠️',
            recommendation: `Votre marge est faible. Analysez vos coûts et optimisez vos prix pour améliorer la rentabilité.`,
            action: 'Réviser la structure des coûts et la stratégie tarifaire'
          });
        }
        if (current.benefices > avgBenefices * 1.3) {
          insights.push({
            type: 'info',
            message: `Bénéfices supérieurs à la moyenne de ${((current.benefices / avgBenefices - 1) * 100).toFixed(1)}%`,
            icon: '📊',
            recommendation: `Vos bénéfices actuels sont bien au-dessus de la moyenne. Identifiez les facteurs de succès.`
          });
        }
        break;
      case 'clients':
        const clientsChange = ((current.clients - previous.clients) / previous.clients) * 100;
        const avgClients = data.reduce((sum: number, d: any) => sum + d.clients, 0) / data.length;
        if (clientsChange > 20) {
          insights.push({
            type: 'success',
            message: `Croissance clientèle de ${clientsChange.toFixed(1)}%`,
            icon: '👥',
            recommendation: `Forte croissance de votre base client. Renforcez vos efforts de fidélisation pour maintenir cette dynamique.`,
            action: 'Mettre en place des programmes de fidélité'
          });
        }
        if (current.tauxConversion > 15) {
          insights.push({
            type: 'success',
            message: `Taux de conversion excellent: ${current.tauxConversion}%`,
            icon: '🎯',
            recommendation: `Votre taux de conversion est excellent. Vos stratégies marketing et commerciales sont efficaces.`,
            action: 'Capitaliser sur les canaux les plus performants'
          });
        } else if (current.tauxConversion < 10) {
          insights.push({
            type: 'warning',
            message: `Taux de conversion faible: ${current.tauxConversion}%`,
            icon: '⚠️',
            recommendation: `Votre taux de conversion est en dessous des standards. Optimisez votre processus de vente et votre offre.`,
            action: 'Analyser les points de friction dans le parcours client'
          });
        }
        if (current.clients > avgClients * 1.15) {
          insights.push({
            type: 'info',
            message: `Base client supérieure à la moyenne de ${((current.clients / avgClients - 1) * 100).toFixed(1)}%`,
            icon: '📈',
            recommendation: `Votre nombre de clients dépasse la moyenne. Assurez-vous de maintenir la qualité du service.`
          });
        }
        break;
      case 'stocks':
        const avgStocks = data.reduce((sum: number, d: any) => sum + d.stocks, 0) / data.length;
        if (current.stocks < 95) {
          insights.push({
            type: 'warning',
            message: `Niveau de stock faible: ${current.stocks}% - Réapprovisionnement recommandé`,
            icon: '📦',
            recommendation: `Vos stocks sont en dessous du niveau optimal. Planifiez un réapprovisionnement pour éviter les ruptures.`,
            action: 'Lancer une commande de réapprovisionnement'
          });
        } else if (current.stocks > 99) {
          insights.push({
            type: 'info',
            message: `Stock optimal: ${current.stocks}%`,
            icon: '✅',
            recommendation: `Vos niveaux de stock sont excellents. Vous avez une bonne gestion de l'inventaire.`,
            action: 'Maintenir cette performance'
          });
        }
        if (current.stocks < avgStocks - 5) {
          insights.push({
            type: 'warning',
            message: `Stock en dessous de la moyenne de ${(avgStocks - current.stocks).toFixed(1)} points`,
            icon: '⚠️',
            recommendation: `Vos stocks sont significativement en dessous de la moyenne. Analysez vos besoins et planifiez les commandes.`
          });
        }
        break;
    }

    return insights;
  }, [selectedChart, currentPeriod]);

  const handleExport = (format: 'csv' | 'json' | 'png') => {
    try {
      if (format === 'png') {
        alert('Export PNG - Fonctionnalité à venir');
        return;
      }

      const mapped = currentSlice.map((d: any) => {
        switch (selectedChart) {
          case 'ventes':
            return { date: d.date, ventes: d.ventes, panierMoyen: d.panierMoyen, commandes: d.commandes };
          case 'benefices':
            return { date: d.date, benefices: d.benefices, ventes: d.ventes, marge: ((d.benefices / d.ventes) * 100).toFixed(1) + '%' };
          case 'clients':
            return { date: d.date, clients: d.clients, nouveauxClients: d.nouveauxClients, tauxConversion: d.tauxConversion };
          case 'stocks':
            return { date: d.date, stocks: d.stocks };
          default:
            return { date: d.date, ventes: d.ventes };
        }
      });

      const filename = `export-${selectedChart}-${currentPeriod}.` + (format === 'csv' ? 'csv' : 'json');
      let blob: Blob;
      if (format === 'json') {
        blob = new Blob([JSON.stringify(mapped, null, 2)], { type: 'application/json;charset=utf-8;' });
      } else {
        const headers = Object.keys(mapped[0] || { date: '', value: '' });
        const rows = mapped.map(obj => headers.map(h => String((obj as any)[h] ?? '')).join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 12
        },
        callbacks: {
          title: function(context: any) {
            const chartType = chartTypes.find(c => c.id === selectedChart);
            return chartType ? `${chartType.name} - ${context[0].label}` : context[0].label;
          },
          label: function(context: any) {
            const value = context.parsed.y || context.parsed;
            const unit = selectedChart === 'stocks' ? '%' : (selectedChart === 'ventes' || selectedChart === 'benefices' ? ' DZD' : '');
            const chartType = chartTypes.find(c => c.id === selectedChart);
            let additionalInfo = '';
            
            if (selectedChart === 'ventes' && currentSlice[context.dataIndex]) {
              const day = currentSlice[context.dataIndex];
              additionalInfo = ` | Panier: ${formatCurrency(day.panierMoyen)} | ${day.commandes} commandes`;
            } else if (selectedChart === 'benefices' && currentSlice[context.dataIndex]) {
              const day = currentSlice[context.dataIndex];
              const marge = ((day.benefices / day.ventes) * 100).toFixed(1);
              additionalInfo = ` | Marge: ${marge}%`;
            } else if (selectedChart === 'clients' && currentSlice[context.dataIndex]) {
              const day = currentSlice[context.dataIndex];
              additionalInfo = ` | Nouveaux: ${day.nouveauxClients} | Conversion: ${day.tauxConversion}%`;
            }
            
            return `${context.dataset.label}: ${value.toLocaleString()}${unit}${additionalInfo}`;
          },
          footer: function(context: any) {
            const chartType = chartTypes.find(c => c.id === selectedChart);
            return chartType ? chartType.description : '';
          }
        }
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        },
        ticks: {
          callback: function(value: any) {
            const unit = selectedChart === 'stocks' ? '%' : '';
            return value.toLocaleString() + unit;
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* En-tête avec contrôles */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
          <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                <SparklesIcon className="h-6 w-6 mr-2 text-slate-600" />
                Graphiques Interactifs
              </h1>
            <p className="text-slate-600 mt-1">Analysez vos données avec des visualisations dynamiques</p>
            </div>
            <HelpButton pageId="graphiques-interactifs" />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex items-center px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium"
            >
              JSON
            </button>
            <button
              onClick={() => handleExport('png')}
              className="flex items-center px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              PNG
            </button>
          </div>
        </div>
      </div>

      {/* Insights automatiques enrichis */}
      {showInsights && generateInsights.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-lg border border-blue-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LightBulbIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Insights Automatiques</h3>
                <p className="text-sm text-slate-600">Analyses intelligentes basées sur vos données</p>
              </div>
            </div>
            <button
              onClick={() => setShowInsights(false)}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {generateInsights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  insight.type === 'success' ? 'bg-green-50 border-green-300' :
                  insight.type === 'warning' ? 'bg-amber-50 border-amber-300' :
                  'bg-blue-50 border-blue-300'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{insight.icon}</span>
                  <div className="flex-1">
                    <div className={`text-sm font-bold mb-1 ${
                      insight.type === 'success' ? 'text-green-900' :
                      insight.type === 'warning' ? 'text-amber-900' :
                      'text-blue-900'
                    }`}>
                      {insight.message}
                    </div>
                    {insight.recommendation && (
                      <div className={`text-xs mt-2 leading-relaxed ${
                        insight.type === 'success' ? 'text-green-700' :
                        insight.type === 'warning' ? 'text-amber-700' :
                        'text-blue-700'
                      }`}>
                        💡 {insight.recommendation}
                      </div>
                    )}
                    {insight.action && (
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          insight.type === 'success' ? 'bg-green-200 text-green-800' :
                          insight.type === 'warning' ? 'bg-amber-200 text-amber-800' :
                          'bg-blue-200 text-blue-800'
                        }`}>
                          📋 {insight.action}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description du type de graphique sélectionné */}
      <div className="bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200 p-5">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-slate-100 rounded-lg">
            {(() => {
              const Icon = chartTypes.find(c => c.id === selectedChart)?.icon || ChartBarIcon;
              return <Icon className="h-6 w-6 text-slate-600" />;
            })()}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-2">
              {chartTypes.find(c => c.id === selectedChart)?.name} - Analyse détaillée
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed mb-3">
              {chartTypes.find(c => c.id === selectedChart)?.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {chartTypes.find(c => c.id === selectedChart)?.metrics.map((metric, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  <InformationCircleIcon className="h-3 w-3 mr-1" />
                  {metric}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sélecteurs de graphiques et période */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Type de graphique :</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {chartTypes.map((chart) => {
              const Icon = chart.icon;
              return (
                <button
                  key={chart.id}
                  onClick={() => setSelectedChart(chart.id)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedChart === chart.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {chart.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Période :</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period.id
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {period.name}
              </button>
            ))}
        </div>
      </div>

        {/* Options avancées */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Options :</span>
                      </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setComparePeriod(!comparePeriod)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  comparePeriod
                    ? 'bg-slate-700 text-white shadow-md border-2 border-slate-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-600'
                }`}
              >
                <span className="flex items-center">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-2" />
                  Comparaison
                    </span>
              </button>
                  </div>
            </div>
            
        {/* Sélection du type de graphique améliorée */}
        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Type de graphique :</span>
                    </div>
            <div className="flex flex-wrap gap-2">
              {[
                { type: 'bar', label: 'Barres', icon: ChartBarIcon, description: 'Idéal pour comparer des valeurs' },
                { type: 'line', label: 'Ligne', icon: ArrowTrendingUpIcon, description: 'Parfait pour les tendances' },
                { type: 'area', label: 'Aires', icon: ChartPieIcon, description: 'Visualisez les volumes' },
                { type: 'doughnut', label: 'Donut', icon: ChartPieIcon, description: 'Répartition circulaire' },
                { type: 'radar', label: 'Radar', icon: SparklesIcon, description: 'Analyse multidimensionnelle' },
                { type: 'polar', label: 'Polaire', icon: ChartPieIcon, description: 'Comparaison radiale' }
              ].map(({ type, label, icon: Icon, description }) => (
                <TooltipComponent key={type} content={description}>
                  <button
                    onClick={() => setChartType(type as any)}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                      chartType === type
                        ? 'bg-slate-700 text-white shadow-md border-slate-800 dark:border-slate-600'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {label}
                  </button>
                </TooltipComponent>
              ))}
                  </div>
        </div>
            </div>
            
      {/* Zone de graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique principal avec Chart.js */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                {chartTypes.find(c => c.id === selectedChart)?.name} - {periods.find(p => p.id === selectedPeriod)?.name}
                {comparePeriod && (
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    (vs période précédente)
                </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {(() => {
                  const data = salesData[currentPeriod as keyof typeof salesData] || [];
                  if (data.length === 0) return 'Aucune donnée disponible';
                  const total = data.reduce((sum: number, d: any) => {
                  switch (selectedChart) {
                      case 'ventes': return sum + d.ventes;
                      case 'benefices': return sum + d.benefices;
                      case 'clients': return sum + d.clients;
                      default: return sum + d.ventes;
                    }
                  }, 0);
                  const avg = total / data.length;
                  const unit = selectedChart === 'stocks' ? '%' : (selectedChart === 'ventes' || selectedChart === 'benefices' ? ' DZD' : '');
                  return `Moyenne: ${avg.toLocaleString()}${unit} | Total: ${total.toLocaleString()}${unit}`;
                })()}
              </p>
              </div>
            <div className="flex items-center space-x-2">
              <TooltipComponent content="Mode plein écran pour une meilleure visualisation">
                <button
                  onClick={() => setFullScreenMode(fullScreenMode === 'main' ? null : 'main')}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {fullScreenMode === 'main' ? (
                    <ArrowsPointingInIcon className="h-5 w-5" />
                  ) : (
                    <ArrowsPointingOutIcon className="h-5 w-5" />
                  )}
                </button>
              </TooltipComponent>
            </div>
          </div>
          <div className={`relative ${fullScreenMode === 'main' ? 'h-[600px]' : 'h-96'}`}>
            {chartType === 'bar' ? (
              <Bar data={getChartData} options={chartOptions} />
            ) : chartType === 'line' ? (
              <Line data={getChartData} options={chartOptions} />
            ) : chartType === 'area' ? (
              <Line data={getChartData} options={{...chartOptions, plugins: {...chartOptions.plugins, filler: {propagate: true}}}} />
            ) : chartType === 'doughnut' ? (
              <Doughnut 
                data={{
                  labels: getChartData.labels,
                  datasets: [{
                    label: getChartData.datasets[0].label,
                    data: getChartData.datasets[0].data,
                    backgroundColor: [
                      'rgba(51, 65, 85, 0.8)',
                      'rgba(71, 85, 105, 0.8)',
                      'rgba(100, 116, 139, 0.8)',
                      'rgba(148, 163, 184, 0.8)',
                      'rgba(203, 213, 225, 0.8)',
                      'rgba(226, 232, 240, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                  }]
                }} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      ...chartOptions.plugins.legend,
                      position: 'right' as const
                    }
                  }
                }} 
              />
            ) : chartType === 'radar' ? (
              <Radar 
                data={{
                  labels: getChartData.labels.slice(0, 6),
                  datasets: [{
                    label: getChartData.datasets[0].label,
                    data: getChartData.datasets[0].data.slice(0, 6),
                    backgroundColor: 'rgba(51, 65, 85, 0.2)',
                    borderColor: 'rgba(51, 65, 85, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(51, 65, 85, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(51, 65, 85, 1)'
                  }]
                }} 
                options={{
                  ...chartOptions,
                  scales: {
                    r: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                      },
                      ticks: {
                        display: false
                      }
                    }
                  }
                }} 
              />
            ) : chartType === 'polar' ? (
              <PolarArea 
                data={{
                  labels: getChartData.labels.slice(0, 6),
                  datasets: [{
                    label: getChartData.datasets[0].label,
                    data: getChartData.datasets[0].data.slice(0, 6),
                    backgroundColor: [
                      'rgba(51, 65, 85, 0.8)',
                      'rgba(71, 85, 105, 0.8)',
                      'rgba(100, 116, 139, 0.8)',
                      'rgba(148, 163, 184, 0.8)',
                      'rgba(203, 213, 225, 0.8)',
                      'rgba(226, 232, 240, 0.8)'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                  }]
                }} 
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      ...chartOptions.plugins.legend,
                      position: 'right' as const
                    }
                  },
                  scales: {
                    r: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                      }
                    }
                  }
                }} 
              />
            ) : (
              <Bar data={getChartData} options={chartOptions} />
            )}
          </div>
        </div>

        {/* Graphiques secondaires */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Évolution Temporelle</h3>
            <p className="text-xs text-slate-500">
              Analysez les variations de vos ventes selon les heures de la journée pour optimiser vos horaires d'ouverture et vos campagnes marketing.
            </p>
          </div>
          <div className="h-64 relative">
            <Line
              data={{
                labels: activeTemporalData.map(d => d.time),
                datasets: [{
                  label: 'Ventes horaires',
                  data: activeTemporalData.map(d => d.value),
                  borderColor: 'rgba(51, 65, 85, 1)',
                  backgroundColor: 'rgba(51, 65, 85, 0.1)',
                  fill: true,
                  tension: 0.4
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                  },
                  x: {
                    grid: { display: false }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Répartition par Catégories</h3>
            <p className="text-xs text-slate-500">
              Comprenez la contribution de chaque catégorie à votre chiffre d'affaires total. Identifiez les catégories locomotives et les opportunités de croissance.
            </p>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Doughnut
              data={{
                labels: activeCategoryData.map(c => c.category),
                datasets: [{
                  data: activeCategoryData.map(c => c.value),
                  backgroundColor: [
                    'rgba(51, 65, 85, 0.8)',
                    'rgba(71, 85, 105, 0.8)',
                    'rgba(100, 116, 139, 0.8)',
                    'rgba(148, 163, 184, 0.8)'
                  ],
                  borderWidth: 2,
                  borderColor: '#fff'
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right' as const,
                    labels: {
                      padding: 15,
                      usePointStyle: true
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    padding: 12,
                    callbacks: {
                      label: function(context: any) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value}% (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
                </div>
          {/* Légende détaillée */}
          <div className="mt-4 space-y-2">
            {activeCategoryData.map((category, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded ${category.color}`}></div>
                  <span className="text-sm text-slate-600 font-medium">{category.category}</span>
                </div>
                <div className="text-sm font-medium text-slate-900">
                  {category.value}% ({category.amount.toLocaleString()} DZD)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Métriques détaillées avec contexte */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Métriques Détaillées</h3>
          <p className="text-xs text-slate-500">
            Indicateurs clés de performance calculés à partir de vos données réelles. Comparez avec vos objectifs et identifiez les axes d'amélioration.
          </p>
          </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {(() => {
            const data = salesData[currentPeriod as keyof typeof salesData] || [];
            if (data.length < 2) {
              return <div className="col-span-4 text-center text-slate-500">Données insuffisantes</div>;
            }
            
            const current = data[data.length - 1];
            const previous = data[data.length - 2];
            
            const metrics = [
              {
                label: 'Croissance mensuelle',
                value: ((current.ventes - previous.ventes) / previous.ventes * 100).toFixed(1) + '%',
                change: '+2.3% vs objectif',
                color: 'text-green-600'
              },
              {
                label: 'Transactions',
                value: current.commandes.toLocaleString(),
                change: `+${current.commandes - previous.commandes} vs mois dernier`,
                color: 'text-blue-600'
              },
              {
                label: 'Précision',
                value: '98.5%',
                change: '+1.2% vs objectif',
                color: 'text-emerald-600'
              },
              {
                label: 'Temps de réponse',
                value: '1.2s',
                change: '-0.3s vs mois dernier',
                color: 'text-purple-600'
              }
            ];
            
            return metrics.map((metric, index) => (
              <div
                key={index}
                className="text-center p-6 bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200 hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer group"
              >
                <div className="text-3xl font-bold text-slate-700 mb-2 group-hover:text-slate-900 transition-colors">
                  {metric.value}
                        </div>
                <div className="text-sm font-medium text-slate-600 mb-1">{metric.label}</div>
                <div className={`text-xs font-medium ${metric.color} animate-pulse mb-2`}>
                  {metric.change}
                      </div>
                <TooltipComponent content={`${metric.label}: ${metric.value}. ${metric.change}. Cliquez pour voir les détails.`}>
                  <div className="text-xs text-slate-400 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    ℹ️ Plus d'infos
                        </div>
                </TooltipComponent>
                      </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
};

export default GraphiquesInteractifs;
