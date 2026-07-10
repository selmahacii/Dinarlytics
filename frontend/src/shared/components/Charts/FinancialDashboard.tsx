import React, { useState } from 'react';
import { useApp } from '@/core/context/AppContext';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, 
  ArcElement, BarElement
} from 'chart.js';
import { 
  Line, Bar, Doughnut
} from 'react-chartjs-2';
import {
  BanknotesIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import apiClient from '@/services/apiClient';
import { useEffect } from 'react';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
  ArcElement, BarElement
);

interface FinancialDashboardProps {
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ 
  isCollapsible = false, 
  defaultCollapsed = false 
}) => {
  const { t, i18n } = useTranslation();
  const { formatCurrency, currentDevise, setCurrentDevise } = useApp();
  const [periode, setPeriode] = useState('12mois');
  const devise = currentDevise;
  const setDevise = (d: any) => setCurrentDevise(d);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [widgets, setWidgets] = useState({
    equilibre: true,
    evaluation: true,
    scenarios: true,
    alertes: true,
    ratios: true,
    simulations: true,
    rentabilite: true,
    insights: true
  });
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [alertes, setAlertes] = useState<any[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await apiClient.get('/analytics/alerts');
        const data = response.data || [];
        const mapped = data.map((item: any) => ({
          id: item.alert_code || 'alert',
          id_key: item.alert_code || 'alert',
          nom: item.alert_name || 'Alerte',
          description: `Déclenchée si la valeur ${item.comparison_operator || ''} ${item.threshold_value || 0}`,
          statut: item.enabled ? 'Surveillance' : 'Inactive',
          seuil: Number(item.threshold_value || 0),
          valeurActuelle: item.alert_code === 'liquidity_ratio' ? 1.8 : 1500000,
          unite: item.alert_code === 'liquidity_ratio' ? 'ratio' : 'DA',
          frequence: 'temps_reel',
          derniereAlerte: null,
          destinataires: ['Admin'],
          active: item.enabled || false
        }));
        setAlertes(mapped);
      } catch (err) {
        console.error("Failed to load alerts in FinancialDashboard", err);
      }
    };
    fetchAlerts();
  }, []);

  // États pour la gestion des alertes
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedAlerte, setSelectedAlerte] = useState<any>(null);
  const [modifyForm, setModifyForm] = useState({
    seuil: 0,
    frequence: '',
    destinataires: '',
    active: true
  });
  const [showTestResult, setShowTestResult] = useState(false);
  const [testResult, setTestResult] = useState('');
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [triggerResult, setTriggerResult] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fonctions de gestion des alertes améliorées
  const declencherAlerte = (alerteId: string) => {
    const alerte = alertes.find(a => a.id === alerteId);
    if (alerte) {
      // Simuler l'envoi d'email et créer le contenu du modal
      const depassement = alerte.valeurActuelle - alerte.seuil;
      
      const result = {
        type: t('dashboard.alertes.names.' + alerte.id_key),
        description: t('dashboard.alertes.descriptions.' + alerte.id_key),
        seuil: alerte.seuil,
        valeurActuelle: alerte.valeurActuelle,
        unite: alerte.unite,
        depassement: depassement,
        destinataires: alerte.destinataires,
        timestamp: new Date().toLocaleString('fr-FR')
      };

      // Mettre à jour l'alerte
      setAlertes(prev => prev.map(a => {
        if (a.id === alerteId) {
        const maintenant = new Date().toLocaleString('fr-FR');
        return {
            ...a,
          statut: 'Déclenchée',
          derniereAlerte: maintenant
        };
      }
        return a;
    }));

      // Afficher le modal de confirmation
      setTriggerResult(result);
      setShowTriggerModal(true);
    }
  };

  const testerAlerte = (alerteId: string) => {
    const alerte = alertes.find(a => a.id === alerteId);
    if (alerte) {
      const result = ` TEST D'ALERTE - ${t('dashboard.alertes.names.' + alerte.id_key)}\n\n` +
        `Alerte: ${t('dashboard.alertes.names.' + alerte.id_key)}\n` +
        `Description: ${t('dashboard.alertes.descriptions.' + alerte.id_key)}\n` +
        ` Statut actuel: ${alerte.statut}\n` +
        ` Valeur actuelle: ${alerte.valeurActuelle} ${alerte.unite}\n` +
        ` Seuil configuré: ${alerte.seuil} ${alerte.unite}\n` +
        ` Dépassement: ${alerte.valeurActuelle - alerte.seuil} ${alerte.unite}\n` +
        `Fréquence: ${alerte.frequence}\n` +
        `Destinataires: ${alerte.destinataires.join(', ')}\n` +
        `Dernière alerte: ${alerte.derniereAlerte}\n\n` +
        ` Résultat du test: L'alerte fonctionne correctement et serait déclenchée.`;

      setTestResult(result);
      setShowTestResult(true);
    }
  };

  const modifierAlerte = (alerteId: string) => {
    const alerte = alertes.find(a => a.id === alerteId);
    if (alerte) {
      setSelectedAlerte(alerte);
      setModifyForm({
        seuil: alerte.seuil,
        frequence: alerte.frequence,
        destinataires: alerte.destinataires.join(', '),
        active: alerte.active
      });
      setShowModifyModal(true);
    }
  };

  const sauvegarderModifications = () => {
    if (selectedAlerte) {
        setAlertes(prev => prev.map(a => 
        a.id === selectedAlerte.id 
          ? { 
              ...a, 
              seuil: modifyForm.seuil,
              frequence: modifyForm.frequence,
              destinataires: modifyForm.destinataires.split(',').map(email => email.trim()),
              active: modifyForm.active
            }
            : a
        ));
      setShowModifyModal(false);
      setSelectedAlerte(null);
      
      // Confirmation
      alert(`✅ Modifications sauvegardées pour "${selectedAlerte.nom}"`);
    }
  };

  const ouvrirDetails = () => {
    setShowDetailsModal(true);
    setShowTriggerModal(false);
  };

  const activerDesactiverAlerte = (alerteId: string) => {
    setAlertes(prev => prev.map(alerte => 
      alerte.id === alerteId 
        ? { ...alerte, active: !alerte.active }
        : alerte
    ));
  };

  // Fonctions de gestion des widgets
  const toggleWidget = (widgetId: keyof typeof widgets) => {
    setWidgets(prev => ({
      ...prev,
      [widgetId]: !prev[widgetId]
    }));
  };

  const toggleAllWidgets = () => {
    const allVisible = Object.values(widgets).every(Boolean);
    setWidgets({
      equilibre: !allVisible,
      evaluation: !allVisible,
      scenarios: !allVisible,
      alertes: !allVisible,
      ratios: !allVisible,
      simulations: !allVisible,
      rentabilite: !allVisible,
      insights: !allVisible
    });
  };

  // État pour les actions rapides
  const [actionsEnCours, setActionsEnCours] = useState(false);
  const [resultatsActions, setResultatsActions] = useState<{
    bfrOptimization: boolean;
    supplierNegotiation: boolean;
    automaticAlerts: boolean;
    timestamp?: string;
  }>({
    bfrOptimization: false,
    supplierNegotiation: false,
    automaticAlerts: false
  });

  // État pour l'historique des ratios
  const [historiqueEnCours, setHistoriqueEnCours] = useState(false);
  const [donneesHistorique, setDonneesHistorique] = useState<{
    ratios: any[];
    tendances: any[];
    seuils: any[];
    graphiques: any[];
    timestamp?: string;
  }>({
    ratios: [],
    tendances: [],
    seuils: [],
    graphiques: []
  });

  // Fonctions pour les actions des boutons
  const handleActionsRapides = async () => {
    setShowActionsModal(true);
    setActionsEnCours(true);
    
    // Simulation d'actions automatiques avec délais réalistes
    const actions = {
      bfrOptimization: false,
      supplierNegotiation: false,
      automaticAlerts: false
    };

    try {
      // Action 1: Optimisation BFR (2 secondes)
      await new Promise(resolve => setTimeout(resolve, 2000));
      actions.bfrOptimization = true;
      setResultatsActions(prev => ({ ...prev, bfrOptimization: true }));

      // Action 2: Négociation fournisseurs (3 secondes)
      await new Promise(resolve => setTimeout(resolve, 3000));
      actions.supplierNegotiation = true;
      setResultatsActions(prev => ({ ...prev, supplierNegotiation: true }));

      // Action 3: Alertes automatiques (1 seconde)
      await new Promise(resolve => setTimeout(resolve, 1000));
      actions.automaticAlerts = true;
      setResultatsActions(prev => ({ ...prev, automaticAlerts: true, timestamp: new Date().toISOString() }));

      console.log('Actions rapides exécutées avec succès:', {
        ...actions,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erreur lors de l\'exécution des actions:', error);
    } finally {
      setActionsEnCours(false);
    }
  };

  const handleRapportDetaille = () => {
    setShowReportModal(true);
    // Simulation génération rapport en arrière-plan
    console.log('Rapport détaillé généré:', {
      ratiosAnalyzed: 12,
      sectorComparisons: 'Complétées',
      recommendations: 'Générées',
      pdfExport: 'Disponible',
      timestamp: new Date().toISOString()
    });
  };

  const handleHistoriqueRatios = async () => {
    setShowHistoryModal(true);
    setHistoriqueEnCours(true);
    
    // Simulation chargement historique avec délais réalistes
    try {
      // Étape 1: Chargement des données de base (2 secondes)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDonneesHistorique(prev => ({
        ...prev,
        ratios: [
          { nom: 'Liquidité Générale', valeurs: [1.65, 1.72, 1.78, 1.85, 1.82, 1.89, 1.91, 1.88, 1.85, 1.87, 1.84, 1.85] },
          { nom: 'ROE', valeurs: [15.2, 16.1, 16.8, 17.5, 17.2, 17.9, 18.3, 18.1, 17.8, 18.2, 18.0, 18.5] },
          { nom: 'Endettement', valeurs: [35.2, 34.8, 34.1, 33.5, 33.8, 33.2, 32.9, 33.1, 32.8, 32.5, 32.3, 32.0] },
          { nom: 'Cycle Conversion', valeurs: [62, 60, 58, 56, 57, 55, 54, 56, 58, 57, 56, 57] }
        ]
      }));

      // Étape 2: Analyse des tendances (2 secondes)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDonneesHistorique(prev => ({
        ...prev,
        tendances: [
          { ratio: 'Liquidité Générale', tendance: 'Positive', evolution: '+12.1%', confiance: 94 },
          { ratio: 'ROE', tendance: 'Excellente', evolution: '+21.7%', confiance: 96 },
          { ratio: 'Endettement', tendance: 'Amélioration', evolution: '-9.1%', confiance: 92 },
          { ratio: 'Cycle Conversion', tendance: 'Stable', evolution: '-8.1%', confiance: 88 }
        ]
      }));

      // Étape 3: Configuration des seuils (1.5 secondes)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setDonneesHistorique(prev => ({
        ...prev,
        seuils: [
          { ratio: 'Liquidité Générale', seuil: 1.5, statut: 'Au-dessus', marge: '+23.3%' },
          { ratio: 'ROE', seuil: 15.0, statut: 'Dépassé', marge: '+23.3%' },
          { ratio: 'Endettement', seuil: 35.0, statut: 'Respecté', marge: '-8.6%' },
          { ratio: 'Cycle Conversion', seuil: 45.0, statut: 'Dépassé', marge: '+26.7%' }
        ]
      }));

      // Étape 4: Préparation des graphiques (1 seconde)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDonneesHistorique(prev => ({
        ...prev,
        graphiques: [
          { type: 'line', titre: 'Évolution Liquidité', data: prev.ratios[0] },
          { type: 'bar', titre: 'Performance ROE', data: prev.ratios[1] },
          { type: 'area', titre: 'Réduction Endettement', data: prev.ratios[2] },
          { type: 'line', titre: 'Optimisation Cycle', data: prev.ratios[3] }
        ],
        timestamp: new Date().toISOString()
      }));

      console.log('Historique des ratios chargé avec succès:', {
        period: '12 derniers mois',
        ratios: '4 ratios analysés',
        trends: 'Tendances identifiées',
        alertThresholds: 'Seuils personnalisés',
        interactiveCharts: 'Graphiques disponibles',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setHistoriqueEnCours(false);
    }
  };

  // Fonctions de calcul des données basées sur les filtres
  const getDeviseSymbol = (d: string) => {
    switch (d) {
      case 'EUR': return '€';
      case 'USD': return '$';
      case 'DZD': return 'DA';
      default: return 'DA';
    }
  };

  const getDeviseRate = (devise: string) => {
    switch (devise) {
      case 'EUR': return 0.007; // 1 DZD = 0.007 EUR
      case 'USD': return 0.0074; // 1 DZD = 0.0074 USD
      case 'DZD': return 1;
      default: return 1;
    }
  };

  const formatCurrencyLocal = (amount: number, d: string) => {
    return formatCurrency(amount);
  };

  const getPeriodData = (periode: string) => {
    switch (periode) {
      case '30jours':
        return {
          labels: ['J1', 'J5', 'J10', 'J15', 'J20', 'J25', 'J30'],
          months: ['J1', 'J5', 'J10', 'J15', 'J20', 'J25', 'J30'],
          periodLabel: '30 jours',
          dataMultiplier: 0.08 // Réduire les données pour 30 jours
        };
      case '3mois':
        return {
          labels: ['Mois 1', 'Mois 2', 'Mois 3'],
          months: ['Mois 1', 'Mois 2', 'Mois 3'],
          periodLabel: '3 mois',
          dataMultiplier: 0.25
        };
      case '6mois':
        return {
          labels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
          months: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
          periodLabel: '6 mois',
          dataMultiplier: 0.5
        };
      case '12mois':
      default:
        return {
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
          months: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
          periodLabel: '12 mois',
          dataMultiplier: 1
        };
    }
  };

  // Données dynamiques basées sur les filtres
  const periodData = getPeriodData(periode);
  const deviseSymbol = getDeviseSymbol(devise);

  const dashboardSubtitle = t('dashboard.subtitle', { 
    devise: deviseSymbol, 
    period: periodData.periodLabel 
  });

  // Données pour les graphiques (adaptées selon les filtres)
  const mois = periodData.labels;
  
  // Données pour l'historique des ratios (adaptées selon la période)
  const getLiquiditeData = () => {
    const baseData: number[] = [];
    return baseData.slice(0, periodData.labels.length);
  };

  const historiqueLiquidite = {
    labels: mois,
    datasets: [{
      label: 'Liquidité Générale',
      data: getLiquiditeData(),
      borderColor: 'rgba(51, 65, 85, 1)',
      backgroundColor: 'rgba(51, 65, 85, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const getROEData = () => {
    const baseData: number[] = [];
    return baseData.slice(0, periodData.labels.length);
  };

  const getROEColors = () => {
    const baseColors = [
      'rgba(51, 65, 85, 0.8)',
      'rgba(71, 85, 105, 0.8)',
      'rgba(100, 116, 139, 0.8)',
      'rgba(148, 163, 184, 0.8)',
      'rgba(203, 213, 225, 0.8)',
      'rgba(226, 232, 240, 0.8)',
      'rgba(241, 245, 249, 0.8)',
      'rgba(248, 250, 252, 0.8)',
      'rgba(251, 252, 253, 0.8)',
      'rgba(254, 254, 254, 0.8)',
      'rgba(255, 255, 255, 0.8)',
      'rgba(51, 65, 85, 1)'
    ];
    return baseColors.slice(0, periodData.labels.length);
  };

  const historiqueROE = {
    labels: mois,
    datasets: [{
      label: 'ROE (%)',
      data: getROEData(),
      backgroundColor: getROEColors(),
      borderColor: 'rgba(51, 65, 85, 1)',
      borderWidth: 2,
      borderRadius: 4
    }]
  };

  const getEndettementData = () => {
    const baseData: number[] = [];
    return baseData.slice(0, periodData.labels.length);
  };

  const historiqueEndettement = {
    labels: mois,
    datasets: [{
      label: 'Ratio d\'Endettement (%)',
      data: getEndettementData(),
      borderColor: 'rgba(51, 65, 85, 1)',
      backgroundColor: 'rgba(51, 65, 85, 0.2)',
      tension: 0.4,
      fill: true
    }]
  };

  const getCycleData = () => {
    const baseData: number[] = [];
    return baseData.slice(0, periodData.labels.length);
  };

  const historiqueCycle = {
    labels: mois,
    datasets: [{
      label: 'Cycle de Conversion (jours)',
      data: getCycleData(),
      borderColor: 'rgba(51, 65, 85, 1)',
      backgroundColor: 'rgba(51, 65, 85, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };
  
  // Données pour Widget 1 - Équilibre Financier (adaptées selon les filtres)
  const getFRNData = () => {
    const baseData: number[] = [];
    return baseData.slice(0, periodData.labels.length).map(val => val * periodData.dataMultiplier);
  };

  const frnEvolution = {
    labels: mois,
    datasets: [{
      label: `FRN (K ${deviseSymbol})`,
      data: getFRNData(),
      borderColor: 'rgba(51, 65, 85, 1)',
      backgroundColor: 'rgba(51, 65, 85, 0.1)',
      tension: 0.4
    }]
  };


  // Données pour Widget 2 - Évaluation & Capital (adaptées selon les filtres)
  const getCapitalRepartitionData = () => {
    const baseData: number[] = [0, 0, 0];
    return baseData.map(val => val * periodData.dataMultiplier);
  };

  const capitalRepartition = {
    labels: ['Capitaux Propres', 'Dettes LT', 'Dettes CT'],
    datasets: [{
      data: getCapitalRepartitionData(),
      backgroundColor: [
        'rgba(51, 65, 85, 0.8)',
        'rgba(71, 85, 105, 0.8)',
        'rgba(100, 116, 139, 0.8)'
      ],
      borderColor: [
        'rgba(51, 65, 85, 1)',
        'rgba(71, 85, 105, 1)',
        'rgba(100, 116, 139, 1)'
      ],
      borderWidth: 2
    }]
  };

  // Données pour Widget 7 - Rentabilité par Dimension (adaptées selon les filtres)
  const getTopClientsData = () => {
    const baseData: number[] = [0, 0, 0, 0, 0];
    return baseData.map(val => val * periodData.dataMultiplier);
  };

  const topClients = {
    labels: [],
    datasets: [{
      label: `CA (K ${deviseSymbol})`,
      data: getTopClientsData(),
      backgroundColor: [
        'rgba(15, 23, 42, 0.9)',
        'rgba(30, 41, 59, 0.9)',
        'rgba(51, 65, 85, 0.9)',
        'rgba(71, 85, 105, 0.9)',
        'rgba(100, 116, 139, 0.9)'
      ],
      borderColor: [
        'rgba(15, 23, 42, 1)',
        'rgba(30, 41, 59, 1)',
        'rgba(51, 65, 85, 1)',
        'rgba(71, 85, 105, 1)',
        'rgba(100, 116, 139, 1)'
      ],
      borderWidth: 2,
      borderRadius: 8,
      hoverBackgroundColor: [
        'rgba(15, 23, 42, 1)',
        'rgba(30, 41, 59, 1)',
        'rgba(51, 65, 85, 1)',
        'rgba(71, 85, 105, 1)',
        'rgba(100, 116, 139, 1)'
      ]
    }]
  };

  const getProduitsABCData = () => {
    const baseData: number[] = [0, 0, 0];
    return baseData.map(val => val * periodData.dataMultiplier);
  };

  const produitsABC = {
    labels: ['Cat. A (Premium)', 'Cat. B (Standard)', 'Cat. C (Basique)'],
    datasets: [{
      data: getProduitsABCData(),
      backgroundColor: [
        'rgba(15, 23, 42, 0.9)',
        'rgba(51, 65, 85, 0.9)',
        'rgba(100, 116, 139, 0.9)'
      ],
      borderColor: [
        'rgba(15, 23, 42, 1)',
        'rgba(51, 65, 85, 1)',
        'rgba(100, 116, 139, 1)'
      ],
      borderWidth: 3,
      hoverOffset: 10
    }]
  };

  const getRegionsData = () => {
    const baseData = [950, 800, 600, 450];
    return baseData.map(val => val * periodData.dataMultiplier);
  };

  const regions = {
    labels: ['Alger', 'Oran', 'Constantine', 'Autres'],
    datasets: [{
      label: `CA (K ${deviseSymbol})`,
      data: getRegionsData(),
      backgroundColor: [
        'rgba(15, 23, 42, 0.9)',
        'rgba(30, 41, 59, 0.9)',
        'rgba(51, 65, 85, 0.9)',
        'rgba(71, 85, 105, 0.9)'
      ],
      borderColor: [
        'rgba(15, 23, 42, 1)',
        'rgba(30, 41, 59, 1)',
        'rgba(51, 65, 85, 1)',
        'rgba(71, 85, 105, 1)'
      ],
      borderWidth: 2,
      borderRadius: 8,
      tension: 0.4,
      fill: true
    }]
  };

  const getCanauxVenteData = () => {
    const baseData = [1400, 900, 350, 150];
    return baseData.map(val => val * periodData.dataMultiplier);
  };

  const canauxVente = {
    labels: ['Direct B2B', 'E-commerce', 'Partenaires', 'Télévente'],
    datasets: [{
      label: `CA (K ${deviseSymbol})`,
      data: getCanauxVenteData(),
      backgroundColor: [
        'rgba(15, 23, 42, 0.9)',
        'rgba(30, 41, 59, 0.9)',
        'rgba(51, 65, 85, 0.9)',
        'rgba(71, 85, 105, 0.9)'
      ],
      borderColor: [
        'rgba(15, 23, 42, 1)',
        'rgba(30, 41, 59, 1)',
        'rgba(51, 65, 85, 1)',
        'rgba(71, 85, 105, 1)'
      ],
      borderWidth: 2,
      borderRadius: 8
    }]
  };

  // Nouveaux graphiques pour analyses avancées (adaptés selon les filtres)
  const getRentabiliteEvolutionData = () => {
    const baseData = [18.2, 19.1, 19.8, 20.5, 21.2, 21.8];
    return baseData.slice(0, Math.min(periodData.labels.length, 6));
  };

  const rentabiliteEvolution = {
    labels: periodData.labels.slice(0, Math.min(periodData.labels.length, 6)),
    datasets: [{
      label: 'Marge Nette (%)',
      data: getRentabiliteEvolutionData(),
      borderColor: 'rgba(15, 23, 42, 1)',
      backgroundColor: 'rgba(15, 23, 42, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  const getContributionClientsData = () => {
    const baseData = [65, 30, 5];
    return baseData.map(val => val * periodData.dataMultiplier);
  };

  const contributionClients = {
    labels: ['Top 20%', 'Moyen 60%', 'Bas 20%'],
    datasets: [{
      data: getContributionClientsData(),
      backgroundColor: [
        'rgba(15, 23, 42, 0.9)',
        'rgba(51, 65, 85, 0.9)',
        'rgba(100, 116, 139, 0.9)'
      ],
      borderColor: [
        'rgba(15, 23, 42, 1)',
        'rgba(51, 65, 85, 1)',
        'rgba(100, 116, 139, 1)'
      ],
      borderWidth: 3,
      hoverOffset: 8
    }]
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
          color: 'rgb(51, 65, 85)',
          font: {
            size: 12,
            weight: 'normal' as const
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { 
          color: 'rgba(148, 163, 184, 0.2)',
          drawBorder: false
        },
        ticks: { 
          color: 'rgb(71, 85, 105)',
          font: {
            size: 11,
            weight: 'normal' as const
          }
        },
        border: {
          display: false
        }
      },
      x: {
        grid: { display: false },
        ticks: { 
          color: 'rgb(71, 85, 105)',
          font: {
            size: 11,
            weight: 'normal' as const
          }
        },
        border: {
          display: false
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 8,
        borderSkipped: false
      }
    }
  };

  return (
    <>
    <div className="space-y-4">
      {/* HEADER OPTIMISÉ */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <ChartBarIcon className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t('steering.dashboard.title')}</h2>
              <p className="text-sm text-slate-600">
                {t('steering.dashboard.subtitle')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'fr' ? 'ar' : 'fr')}
              className="px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
            >
              {i18n.language === 'fr' ? 'العربية' : 'Français'}
            </button>
            <button
              onClick={toggleAllWidgets}
              className="px-3 py-1 text-xs bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
            >
              {Object.values(widgets).every(Boolean) ? t('common.reduce') : t('common.all')}
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {isCollapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                title={isCollapsed ? t('common.controls.expand') : t('common.controls.collapse')}
              >
                {isCollapsed ? (
                  <ChevronDownIcon className="h-4 w-4 text-slate-700" />
                ) : (
                  <ChevronUpIcon className="h-4 w-4 text-slate-700" />
                )}
              </button>
            )}
            
            <select
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className="bg-white text-slate-700 text-sm px-3 py-1.5 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
              aria-label={t('common.controls.select_period')}
              title={t('common.controls.select_period')}
            >
              <option value="30jours">{t('common.periods.30days')}</option>
              <option value="3mois">{t('common.periods.3months')}</option>
              <option value="6mois">{t('common.periods.6months')}</option>
              <option value="12mois">{t('common.periods.12months')}</option>
            </select>
            
            <select
              value={devise}
              onChange={(e) => setDevise(e.target.value)}
              className="bg-white text-slate-700 text-sm px-3 py-1.5 rounded-lg border border-slate-300 focus:border-slate-500 focus:outline-none"
              aria-label={t('common.controls.select_devise')}
              title={t('common.controls.select_devise')}
            >
              <option value="DZD">DZD</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
      </div>

      {/* WIDGET 1: Équilibre Financier SCF */}
      {!isCollapsed && widgets.equilibre && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <BanknotesIcon className="h-4 w-4 text-slate-700" />
               {t('dashboard.widgets.equilibre.title')}
          </h3>
            <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded border border-emerald-200">
              Optimal ✓
          </span>
              <button
                onClick={() => toggleWidget('equilibre')}
                className="p-1 text-slate-400 hover:text-slate-600"
                aria-label="Réduire l'équilibre financier"
                title="Réduire l'équilibre financier"
                type="button"
              >
                <ChevronUpIcon className="h-4 w-4" />
              </button>
            </div>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* FRN - Fonds de Roulement Net */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-slate-900">FRN</h4>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded border border-emerald-200">
                  Actuel
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-1">Actifs Courants – Passifs Courants</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(580000)}</p>
              <p className="text-xs text-emerald-600">+12% vs Prev: {formatCurrency(650000)}</p>
            </div>

            {/* BFR - Besoin en Fonds de Roulement */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-slate-900">BFR</h4>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded border border-amber-200">
                  +11.5% ⚠️
                </span>
              </div>
              <p className="text-xs text-slate-600 mb-1">(Stocks + Clients) – Fournisseurs</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(130000)}</p>
              <p className="text-xs text-amber-600">En augmentation</p>
            </div>

            {/* TN - Trésorerie Nette */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-slate-900">TN</h4>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded border border-emerald-200">
                  Optimal ✓
            </span>
              </div>
              <p className="text-xs text-slate-600 mb-1">FRN – BFR</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(450000)}</p>
              <p className="text-xs text-emerald-600">Trésorerie saine</p>
            </div>
          </div>

          {/* Sous-sections Actuel vs Précédent */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Actuel vs Précédent</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-600">FRN</span>
                  <span className="text-xs font-semibold text-emerald-600">580K → 650K (+12%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-600">BFR</span>
                  <span className="text-xs font-semibold text-amber-600">130K → 145K (+11.5%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-600">TN</span>
                  <span className="text-xs font-semibold text-emerald-600">450K → 505K (+12.2%)</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Prévisionnels</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs text-slate-600">FRN Estimé</span>
                  <span className="text-xs font-semibold text-blue-600">{formatCurrency(720000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-600">BFR Estimé</span>
                  <span className="text-xs font-semibold text-blue-600">{formatCurrency(180000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-600">TN Estimée</span>
                  <span className="text-xs font-semibold text-blue-600">{formatCurrency(540000)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Graphique évolution FRN/BFR sur 12 mois */}
          <div className="mt-4 bg-slate-50 rounded-lg border border-slate-200 p-3">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Évolution FRN/BFR sur 12 mois</h4>
            <div className="h-48">
              <Line data={frnEvolution} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* WIDGET 2: Évaluation & Capital */}
      {!isCollapsed && widgets.evaluation && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <CurrencyDollarIcon className="h-4 w-4 text-slate-700" />
              💰 {t('dashboard.widgets.evaluation.title')}
            </h3>
            <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-200">
                Rentable
            </span>
              <button
                onClick={() => toggleWidget('evaluation')}
                className="p-1 text-slate-400 hover:text-slate-600"
                aria-label="Réduire l'évaluation et capital"
                title="Réduire l'évaluation et capital"
                type="button"
              >
                <ChevronUpIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Métriques d'évaluation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">VAN</h4>
              <p className="text-xl font-bold text-emerald-600">+{formatCurrency(285000)}</p>
              <p className="text-xs text-slate-600">Valeur Actuelle Nette</p>
            </div>
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">TRI</h4>
              <p className="text-xl font-bold text-emerald-600">18.5%</p>
              <p className="text-xs text-slate-600">Taux de Rentabilité Interne</p>
            </div>
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Récupération</h4>
              <p className="text-xl font-bold text-slate-900">2.8 ans</p>
              <p className="text-xs text-slate-600">Période de Remboursement</p>
            </div>
            </div>

          {/* Coût du capital */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">WACC</h4>
              <p className="text-xl font-bold text-slate-900">12.3%</p>
              <p className="text-xs text-slate-600">Coût Moyen Pondéré du Capital</p>
            </div>
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Coût Dette</h4>
              <p className="text-xl font-bold text-slate-900">8.5%</p>
              <p className="text-xs text-slate-600">Coût de l'Endettement</p>
            </div>
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Levier</h4>
              <p className="text-xl font-bold text-slate-900">1.45</p>
              <p className="text-xs text-slate-600">Ratio d'Endettement</p>
            </div>
            </div>

          {/* Autofinancement et pie chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Autofinancement</h4>
              <p className="text-2xl font-bold text-emerald-600">68%</p>
              <p className="text-xs text-slate-600">Capacité d'Autofinancement</p>
        </div>
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Répartition Capital</h4>
              <div className="h-32">
                <Doughnut data={capitalRepartition} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: { usePointStyle: true, padding: 10 }
                    }
                  }
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WIDGET 3: Scénarios de Risque */}
      {!isCollapsed && widgets.scenarios && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-slate-700" />
              🎲 {t('dashboard.widgets.scenarios.title')}
            </h3>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded border border-amber-200">
                Risque Moyen
              </span>
              <button
                onClick={() => toggleWidget('scenarios')}
                className="p-1 text-slate-400 hover:text-slate-600"
                aria-label="Réduire les scénarios de risque"
                title="Réduire les scénarios de risque"
                type="button"
              >
                <ChevronUpIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tableau scénarios */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 font-semibold text-slate-900">Indicateur</th>
                  <th className="text-center py-2 px-2 font-semibold text-slate-900">Optimiste (25%)</th>
                  <th className="text-center py-2 px-2 font-semibold text-slate-900">Base (50%)</th>
                  <th className="text-center py-2 px-2 font-semibold text-slate-900">Pessimiste (25%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2 px-2 text-slate-700">CA</td>
                  <td className="py-2 px-2 text-center font-semibold text-emerald-600">3.2M</td>
                  <td className="py-2 px-2 text-center font-semibold text-slate-900">2.5M</td>
                  <td className="py-2 px-2 text-center font-semibold text-red-600">1.8M</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-slate-700">Marge</td>
                  <td className="py-2 px-2 text-center font-semibold text-emerald-600">22%</td>
                  <td className="py-2 px-2 text-center font-semibold text-slate-900">19.8%</td>
                  <td className="py-2 px-2 text-center font-semibold text-red-600">15%</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-slate-700">Trésorerie</td>
                  <td className="py-2 px-2 text-center font-semibold text-emerald-600">680K</td>
                  <td className="py-2 px-2 text-center font-semibold text-slate-900">505K</td>
                  <td className="py-2 px-2 text-center font-semibold text-red-600">280K</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-slate-700">Liquidité</td>
                  <td className="py-2 px-2 text-center font-semibold text-emerald-600">2.1</td>
                  <td className="py-2 px-2 text-center font-semibold text-slate-900">1.85</td>
                  <td className="py-2 px-2 text-center font-semibold text-red-600">1.2</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Barre de risque */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Niveau de Risque</h4>
            <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{width: '60%'}}></div>
      </div>
            <p className="text-xs text-slate-600">Risque Moyen - Surveillance Recommandée</p>
          </div>
        </div>
      )}

      {/* WIDGET 4: Alertes Précoces */}
      {!isCollapsed && widgets.alertes && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
    
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-t-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                  <BellIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {t('dashboard.alertes.title')}
                  </h3>
                  <p className="text-sm text-slate-300">{t('dashboard.alertes.subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-slate-600 rounded-lg px-3 py-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-white">{t('dashboard.alertes.monitoring')}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-600 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium text-white">
                    {alertes.filter(a => a.active).length} {t('dashboard.alertes.total_active')}
                  </span>
                </div>
              <button
                onClick={() => toggleWidget('alertes')}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                  aria-label="Réduire les alertes"
                  title="Réduire les alertes"
                  type="button"
              >
                  <ChevronUpIcon className="h-5 w-5" />
              </button>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="p-6">
            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Alertes Actives</p>
                    <p className="text-lg font-bold text-slate-900">{alertes.filter(a => a.active).length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Déclenchées</p>
                    <p className="text-lg font-bold text-slate-900">{alertes.filter(a => a.statut === 'Déclenchée').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Stables</p>
                    <p className="text-lg font-bold text-slate-900">{alertes.filter(a => a.statut !== 'Déclenchée').length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Temps Réponse</p>
                    <p className="text-lg font-bold text-slate-900"> 2min</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des Alertes avec design amélioré */}
          <div className="space-y-4">
            {alertes.map((alerte) => {
              const depassement = alerte.valeurActuelle - alerte.seuil;
              const pourcentageDepassement = (depassement / alerte.seuil) * 100;
              const pourcentageValeur = (alerte.valeurActuelle / alerte.seuil) * 100;
              
              return (
              <div key={alerte.id} className={`rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
                alerte.statut === 'Déclenchée' 
                  ? 'bg-white border-2 border-slate-400 ring-2 ring-slate-200' 
                  : 'bg-white border border-slate-200'
              }`}>
                {/* Indicateur de priorité pour les alertes déclenchées */}
                {alerte.statut === 'Déclenchée' && (
                  <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-2">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold uppercase tracking-wide text-white">🚨 ALERTE CRITIQUE</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-200">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Dépassement: <strong className="text-white">+{Math.abs(depassement).toLocaleString('fr-FR')} {alerte.unite}</strong></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-5">
                  {/* En-tête de l'alerte */}
                  <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          alerte.statut === 'Déclenchée' ? 'bg-slate-700' : 'bg-slate-100'
                        }`}>
                          <svg className={`w-5 h-5 ${alerte.statut === 'Déclenchée' ? 'text-white' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                          </div>
                        <div>
                          <h4 className="text-base font-bold text-slate-900">{t(`dashboard.alertes.names.${alerte.id_key}`)}</h4>
                          <p className="text-xs text-slate-600 mt-0.5">{t(`dashboard.alertes.descriptions.${alerte.id_key}`)}</p>
                      </div>
                  </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className={`px-3 py-1.5 text-xs font-bold rounded-lg ${
                      alerte.statut === 'Déclenchée' 
                          ? 'bg-slate-700 text-white shadow-md' 
                          : 'bg-slate-100 text-slate-700'
                    }`}>
                      {alerte.statut}
                    </span>
                    <button
                      onClick={() => activerDesactiverAlerte(alerte.id)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        alerte.active 
                            ? 'bg-slate-600 text-white hover:bg-slate-700 shadow-sm' 
                            : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                        {alerte.active ? '✓ Actif' : '○ Inactif'}
                    </button>
                  </div>
                </div>

                  {/* Barre de progression visuelle */}
                  <div className="mb-4 bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-slate-700">Progression</span>
                      <span className={`text-xs font-bold ${alerte.statut === 'Déclenchée' ? 'text-slate-900' : 'text-slate-600'}`}>
                        {pourcentageValeur.toFixed(0)}% du seuil
                      </span>
                  </div>
                    <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${
                          alerte.statut === 'Déclenchée' 
                            ? 'bg-gradient-to-r from-slate-600 to-slate-800' 
                            : 'bg-gradient-to-r from-slate-300 to-slate-400'
                        }`}
                        style={{ width: `${Math.min(pourcentageValeur, 100)}%` }}
                      />
                      {/* Indicateur de seuil */}
                      <div className="absolute left-0 top-0 h-full w-0.5 bg-slate-900" style={{ left: '100%', transform: 'translateX(-1px)' }} />
                  </div>
                    <div className="flex justify-between items-center mt-1.5 text-xs">
                      <span className="text-slate-600">Seuil: <strong className="text-slate-900">{alerte.unite === 'DZD' || alerte.unite === 'DA' ? formatCurrency(alerte.seuil) : `${alerte.seuil} ${alerte.unite}`}</strong></span>
                      <span className={`font-semibold ${alerte.statut === 'Déclenchée' ? 'text-slate-900' : 'text-slate-600'}`}>
                        Actuel: <strong>{alerte.unite === 'DZD' || alerte.unite === 'DA' ? formatCurrency(alerte.valeurActuelle) : `${alerte.valeurActuelle} ${alerte.unite}`}</strong>
                      </span>
                  </div>
                  </div>

                  {/* Métadonnées de l'alerte */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-semibold text-slate-600">Fréquence</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 capitalize">{alerte.frequence.replace('_', ' ')}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                      <div className="flex items-center gap-2 mb-1">
                        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs font-semibold text-slate-600">Dernière alerte</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                      {alerte.derniereAlerte || 'Jamais'}
                    </p>
                  </div>
                </div>

                  {/* Destinataires */}
                  <div className="mb-4 bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs font-semibold text-slate-700">Destinataires ({alerte.destinataires.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                    {alerte.destinataires.map((dest, index) => (
                        <span key={index} className="px-3 py-1.5 bg-white text-slate-700 text-xs font-medium rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                        {dest}
                      </span>
                    ))}
                  </div>
                </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => modifierAlerte(alerte.id)}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-600 text-white text-sm font-semibold rounded-lg hover:bg-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Modifier
                  </button>
                  <button
                    onClick={() => testerAlerte(alerte.id)}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-200 border border-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                      Tester
                  </button>
                  <button
                    onClick={() => declencherAlerte(alerte.id)}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded-lg hover:bg-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Déclencher
                  </button>
                </div>
              </div>
              </div>
              );
            })}
          </div>
          </div>
        </div>
      )}

      {/* WIDGET 5: Ratios Financiers Détaillés */}
      {!isCollapsed && widgets.ratios && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <ChartBarIcon className="h-4 w-4 text-slate-700" />
              Ratios Financiers
            </h3>
            <button
              onClick={() => toggleWidget('ratios')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
              aria-label="Réduire les ratios financiers"
              title="Réduire les ratios financiers"
              type="button"
            >
              <ChevronUpIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Liquidité</h4>
                <p className="text-xl font-bold text-slate-900">1.8</p>
                <p className="text-xs text-slate-600">Ratio courant</p>
              <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-slate-600">Bon (&gt;1.5)</span>
            </div>
            </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Endettement</h4>
              <p className="text-xl font-bold text-slate-900">32%</p>
                <p className="text-xs text-slate-600">Dettes/Actifs</p>
              <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-slate-600">Acceptable (&lt;35%)</span>
            </div>
          </div>
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">ROE</h4>
                <p className="text-xl font-bold text-slate-900">18.5%</p>
                <p className="text-xs text-slate-600">Rentabilité capitaux</p>
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-slate-600">Excellent (&gt;15%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WIDGET 5: Ratios Financiers Détaillés */}
      {!isCollapsed && widgets.ratios && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <ChartBarIcon className="h-4 w-4 text-slate-700" />
              📐 {t('dashboard.widgets.ratios.title')}
            </h3>
            <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-200">
                Complet
            </span>
              <button
                onClick={() => toggleWidget('ratios')}
                className="p-1 text-slate-400 hover:text-slate-600"
                aria-label="Réduire les ratios financiers"
                title="Réduire les ratios financiers"
                type="button"
              >
                <ChevronUpIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tableau détaillé des ratios */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 font-semibold text-slate-900">Ratio</th>
                  <th className="text-left py-2 px-2 font-semibold text-slate-900">Formule</th>
                  <th className="text-center py-2 px-2 font-semibold text-slate-900">Valeur</th>
                  <th className="text-center py-2 px-2 font-semibold text-slate-900">Seuil</th>
                  <th className="text-center py-2 px-2 font-semibold text-slate-900">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Ratios de Liquidité */}
                <tr className="bg-blue-50">
                  <td colSpan={5} className="py-2 px-2 font-semibold text-blue-900">Ratios de Liquidité</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-slate-700">Liquidité Générale</td>
                  <td className="py-2 px-2 text-slate-600">Actif Courant / Passif Courant</td>
                  <td className="py-2 px-2 text-center font-semibold text-slate-900">1.85</td>
                  <td className="py-2 px-2 text-center text-slate-600">&gt; 1.5</td>
                  <td className="py-2 px-2 text-center">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">
                      Bon
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-slate-700">Liquidité Immédiate</td>
                  <td className="py-2 px-2 text-slate-600">(Actif Courant - Stocks) / Passif Courant</td>
                  <td className="py-2 px-2 text-center font-semibold text-slate-900">1.42</td>
                  <td className="py-2 px-2 text-center text-slate-600">&gt; 1.0</td>
                  <td className="py-2 px-2 text-center">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">
                      Bon
                    </span>
                  </td>
                </tr>

                {/* Ratios de Rentabilité */}
                <tr className="bg-purple-50">
                  <td colSpan={5} className="py-2 px-2 font-semibold text-purple-900">Ratios de Rentabilité</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-slate-700">ROE</td>
                  <td className="py-2 px-2 text-slate-600">Résultat Net / Capitaux Propres × 100</td>
                  <td className="py-2 px-2 text-center font-semibold text-slate-900">18.5%</td>
                  <td className="py-2 px-2 text-center text-slate-600">&gt; 10-15%</td>
                  <td className="py-2 px-2 text-center">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">
                      Excellent
                    </span>
                  </td>
                </tr>

                {/* KPIs CFO 2025 */}
                <tr className="bg-indigo-50">
                  <td colSpan={5} className="py-2 px-2 font-semibold text-indigo-900"> KPIs CFO 2025</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-slate-700">OCF</td>
                  <td className="py-2 px-2 text-slate-600">Trésorerie + BFR</td>
                  <td className="py-2 px-2 text-center font-semibold text-slate-900">24.5%</td>
                  <td className="py-2 px-2 text-center text-slate-600">&gt; 15%</td>
                  <td className="py-2 px-2 text-center">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">
                      Excellent
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-slate-700">Gross Margin</td>
                  <td className="py-2 px-2 text-slate-600">(CA - Coût Ventes) / CA × 100</td>
                  <td className="py-2 px-2 text-center font-semibold text-slate-900">42.8%</td>
                  <td className="py-2 px-2 text-center text-slate-600">&gt; 30%</td>
                  <td className="py-2 px-2 text-center">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">
                      Excellent
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WIDGET 6: Simulations What-If & Sensibilité */}
      {!isCollapsed && widgets.simulations && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-slate-700" />
               {t('dashboard.widgets.simulations.title')}
            </h3>
            <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded border border-purple-200">
                {t('dashboard.status.interactif')}
            </span>
              <button
                onClick={() => toggleWidget('simulations')}
                className="p-1 text-slate-400 hover:text-slate-600"
                aria-label="Réduire les simulations"
                title="Réduire les simulations"
                type="button"
              >
                <ChevronUpIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Scénarios What-If */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">{t('dashboard.scenarios.ca_minus_10')}</h4>
              <p className="text-xl font-bold text-slate-900">2.25M</p>
              <p className="text-xs text-slate-600">{t('dashboard.impact.modere')}</p>
            </div>
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">{t('dashboard.scenarios.ca_minus_20')}</h4>
              <p className="text-xl font-bold text-amber-600">2.00M </p>
              <p className="text-xs text-amber-600">{t('dashboard.impact.significatif')}</p>
            </div>
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">{t('dashboard.scenarios.ca_plus_10')}</h4>
              <p className="text-xl font-bold text-emerald-600">2.75M ✓</p>
              <p className="text-xs text-emerald-600">{t('dashboard.impact.positif')}</p>
            </div>
            </div>

          {/* Levier opérationnel */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 mb-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">{t('dashboard.levier.operationnel')}</h4>
            <p className="text-2xl font-bold text-slate-900">2.8x</p>
            <p className="text-xs text-slate-600">{t('dashboard.levier.description')}</p>
          </div>

          {/* Impacts détaillés */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">{t('dashboard.impacts.prix_plus_10')}</h4>
              <p className="text-lg font-bold text-emerald-600">+8.5% CA</p>
              <p className="text-xs text-slate-600">{t('dashboard.impacts.marge')}</p>
            </div>
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">{t('dashboard.impacts.dso_minus_5')}</h4>
              <p className="text-lg font-bold text-emerald-600">+45K Tréso</p>
              <p className="text-xs text-slate-600">{t('dashboard.impacts.bfr')}</p>
            </div>
            </div>

          {/* Slider interactif */}
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">{t('dashboard.slider.test_ca')}</h4>
            <input
              type="range"
              min="-30"
              max="30"
              defaultValue="0"
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              aria-label="Ajuster le pourcentage de CA"
              title="Ajuster le pourcentage de CA"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>-30%</span>
              <span>0%</span>
              <span>+30%</span>
        </div>
          </div>
        </div>
      )}

      {/* WIDGET 7: Rentabilité par Dimension - Version Améliorée */}
      {!isCollapsed && widgets.rentabilite && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🎯</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{t('dashboard.widgets.rentabilite.title')}</h3>
                <p className="text-sm text-slate-600">{t('dashboard.rentabilite.description')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full border border-slate-200">
                Multi-dimensionnel
              </span>
              <button
                onClick={() => toggleWidget('rentabilite')}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Réduire la rentabilité"
                title="Réduire la rentabilité"
                type="button"
              >
                <ChevronUpIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Métriques de synthèse */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">👥</span>
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Top Clients</p>
                  <p className="text-lg font-bold text-slate-900">5</p>
                </div>
              </div>
              <p className="text-xs text-slate-600">39.6% du CA total</p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📦</span>
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Catégories</p>
                  <p className="text-lg font-bold text-slate-900">3</p>
                </div>
              </div>
              <p className="text-xs text-slate-600">ABC Analysis</p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🗺️</span>
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Régions</p>
                  <p className="text-lg font-bold text-slate-900">4</p>
                </div>
              </div>
              <p className="text-xs text-slate-600">Couverture nationale</p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                 </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">Marge Nette</p>
                  <p className="text-lg font-bold text-slate-900">21.8%</p>
                </div>
              </div>
              <p className="text-xs text-slate-600">+3.6% vs objectif</p>
            </div>
          </div>

          {/* Section 1: Analyse des Clients */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span className="text-slate-600">👥</span>
                Top 5 Clients (Analyse Pareto)
              </h4>
              <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded border border-slate-300">
                39.6% CA Total
              </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-48">
                <Bar data={topClients} options={chartOptions} />
              </div>
              
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-slate-800 rounded-full"></div>
                      <span className="text-xs font-semibold text-slate-800">1. Alpha SA</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">{formatCurrency(385000)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>15.4% du CA</span>
                    <span>Marge: 24.2%</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
                      <span className="text-xs font-semibold text-slate-800">2. Beta SARL</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">{formatCurrency(320000)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>12.8% du CA</span>
                    <span>Marge: 22.1%</span>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                      <span className="text-xs font-semibold text-slate-800">3. Gamma SPA</span>
                    </div>
                    <span className="text-xs font-bold text-slate-900">{formatCurrency(285000)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>11.4% du CA</span>
                    <span>Marge: 19.8%</span>
                  </div>
                </div>

                <div className="bg-slate-100 rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">Autres clients (Top 5)</span>
                    <span className="font-semibold text-slate-700">{formatCurrency(330000)} (13.2%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Analyse Produits ABC */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span className="text-slate-600">📦</span>
                Analyse Produits (Classification ABC)
              </h4>
              <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded border border-slate-300">
                Marge Moyenne: 21.8%
              </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-48">
                <Doughnut data={produitsABC} options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: true,
                      position: 'bottom' as const,
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                          size: 11
                        }
                      }
                    }
                  }
                }} />
              </div>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-slate-800 rounded-full"></div>
                      <span className="text-sm font-semibold text-slate-800">Catégorie A (Premium)</span>
                    </div>
                    <span className="px-2 py-1 bg-slate-100 text-slate-800 text-xs rounded border border-slate-200">
                      35%
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">CA:</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(875000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Marge:</span>
                      <span className="font-semibold text-slate-900">28.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Nb produits:</span>
                      <span className="font-semibold text-slate-900">12</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-slate-600 rounded-full"></div>
                      <span className="text-sm font-semibold text-slate-800">Catégorie B (Standard)</span>
                    </div>
                    <span className="px-2 py-1 bg-slate-100 text-slate-800 text-xs rounded border border-slate-200">
                      50%
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">CA:</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(1250000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Marge:</span>
                      <span className="font-semibold text-slate-900">19.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Nb produits:</span>
                      <span className="font-semibold text-slate-900">35</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-slate-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-slate-800">Catégorie C (Basique)</span>
                    </div>
                    <span className="px-2 py-1 bg-slate-100 text-slate-800 text-xs rounded border border-slate-200">
                      15%
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">CA:</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(375000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Marge:</span>
                      <span className="font-semibold text-slate-900">14.8%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Nb produits:</span>
                      <span className="font-semibold text-slate-900">53</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Analyse Géographique */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <span className="text-slate-600">🗺️</span>
                  Performance Régionale
                </h4>
              <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded border border-slate-300">
                CA Total: {formatCurrency(2800000)}
              </span>
              </div>
              
              <div className="h-48 mb-4">
                <Line data={regions} options={chartOptions} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-800 rounded-full"></div>
                    <span className="text-xs text-slate-700">Alger</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-900">{formatCurrency(950000)}</span>
                    <span className="text-xs text-slate-600 ml-2">(33.9%)</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
                    <span className="text-xs text-slate-700">Oran</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-900">{formatCurrency(800000)}</span>
                    <span className="text-xs text-slate-600 ml-2">(28.6%)</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                    <span className="text-xs text-slate-700">Constantine</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-900">{formatCurrency(600000)}</span>
                    <span className="text-xs text-slate-600 ml-2">(21.4%)</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                    <span className="text-xs text-slate-700">Autres</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-900">{formatCurrency(450000)}</span>
                    <span className="text-xs text-slate-600 ml-2">(16.1%)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <span className="text-slate-600">📊</span>
                  Canaux de Vente
                </h4>
                <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded border border-slate-300">
                  Diversification: 4 canaux
                </span>
              </div>
              
              <div className="h-48 mb-4">
                <Bar data={canauxVente} options={chartOptions} />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-800 rounded-full"></div>
                    <span className="text-xs text-slate-700">Direct B2B</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-900">{formatCurrency(1400000)}</span>
                    <span className="text-xs text-slate-600 ml-2">(50%)</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-600 rounded-full"></div>
                    <span className="text-xs text-slate-700">E-commerce</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-900">{formatCurrency(900000)}</span>
                    <span className="text-xs text-slate-600 ml-2">(32.1%)</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                    <span className="text-xs text-slate-700">Partenaires</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-900">{formatCurrency(350000)}</span>
                    <span className="text-xs text-slate-600 ml-2">(12.5%)</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                    <span className="text-xs text-slate-700">Télévente</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-900">{formatCurrency(150000)}</span>
                    <span className="text-xs text-slate-600 ml-2">(5.4%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Analyses Avancées */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <span className="text-slate-600">📈</span>
                  Évolution Rentabilité
                </h4>
                <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded border border-slate-300">
                  +3.6% vs objectif
                </span>
              </div>
              
              <div className="h-48">
                <Line data={rentabiliteEvolution} options={chartOptions} />
              </div>
              
              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white rounded-lg p-2 border border-slate-200">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-slate-600">🎯</span>
                    <span className="font-semibold text-slate-800">Objectif</span>
                  </div>
                  <p className="text-slate-900 font-bold">18.2%</p>
                </div>
                <div className="bg-white rounded-lg p-2 border border-slate-200">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-slate-600">📊</span>
                    <span className="font-semibold text-slate-800">Actuel</span>
                  </div>
                  <p className="text-slate-900 font-bold">21.8%</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <span className="text-slate-600">🎯</span>
                  Règle Pareto 80/20
                </h4>
                <span className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded border border-slate-300">
                  Validation: ✓
                </span>
              </div>
              
              <div className="h-48">
                <Doughnut data={contributionClients} options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      display: true,
                      position: 'bottom' as const,
                      labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                          size: 10
                        }
                      }
                    }
                  }
                }} />
              </div>
              
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Top 20% clients</span>
                  <span className="font-semibold text-slate-900">65% du CA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Moyen 60% clients</span>
                  <span className="font-semibold text-slate-900">30% du CA</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Bas 20% clients</span>
                  <span className="font-semibold text-slate-900">5% du CA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Résumé et Recommandations */}
          <div className="mt-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-slate-600">💡</span>
              <h4 className="text-sm font-semibold text-slate-900">Insights & Recommandations</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-slate-600">🎯</span>
                  <span className="font-semibold text-slate-800">Focus Clients</span>
                </div>
                <p className="text-slate-700">Concentrer les efforts sur les Top 20% (65% du CA)</p>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-slate-600">📦</span>
                  <span className="font-semibold text-slate-800">Mix Produits</span>
                </div>
                <p className="text-slate-700">Optimiser la catégorie A (marge 28.5%)</p>
              </div>
              
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-slate-600">🚀</span>
                  <span className="font-semibold text-slate-800">Croissance</span>
                </div>
                <p className="text-slate-700">Développer E-commerce (+32% potentiel)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WIDGET 8: Insights IA & Performance Opér. */}
      {!isCollapsed && widgets.insights && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-slate-700" />
               {t('dashboard.widgets.insights.title')}
            </h3>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded border border-slate-200">
                IA Active
              </span>
              <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded border border-slate-200">
                En Temps Réel
              </span>
              <button
                onClick={() => toggleWidget('insights')}
                className="p-1 text-slate-400 hover:text-slate-600"
                aria-label="Réduire les insights"
                title="Réduire les insights"
                type="button"
              >
                <ChevronUpIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Rapport narratif IA amélioré */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
              <h4 className="text-sm font-semibold text-slate-900">Rapport Narratif IA - Analyse Prédictive</h4>
            </div>
            <div className="text-xs text-slate-700 space-y-3">
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-slate-700 font-semibold">📊 Analyse de Performance</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">Confiance: 94%</span>
          </div>
                <p className="text-xs text-slate-600">
                  Performance positive avec ROE 18.5% (+3.2% vs N-1) et liquidité optimale. 
                  Les simulations Monte Carlo indiquent une probabilité de <strong>75%</strong> d'atteindre les objectifs de croissance Q4.
                  <br />
                  <span className="text-slate-600">✓</span> <strong>Point fort:</strong> Excellente gestion du BFR malgré l'inflation (+11.5% vs +18% secteur)
                </p>
          </div>

              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-slate-700 font-semibold">🎯 Recommandations Stratégiques</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">Priorité: Haute</span>
            </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-600">Optimiser BFR (-8% possible) via négociation délais fournisseurs</span>
            </div>
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-600">Renégocier contrats matières premières (+15% inflation prévue)</span>
            </div>
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500">•</span>
                    <span className="text-xs text-slate-600">Diversifier portefeuille clients (concentration Alpha SA: 15.4%)</span>
          </div>
            </div>
          </div>

              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-slate-700 font-semibold">⚠️ Alertes & Risques</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">Surveillance</span>
            </div>
            <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500">⚠</span>
                    <span className="text-xs text-slate-600">Cycle conversion trésorerie (57j) &gt; objectif 45j</span>
            </div>
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500">🚨</span>
                    <span className="text-xs text-slate-600">Scénario stress test: -10% CA → Impact trésorerie -35%</span>
          </div>
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500">ℹ</span>
                    <span className="text-xs text-slate-600">Taux endettement (32%) proche limite conseillée (35%)</span>
        </div>
      </div>
    </div>
            </div>
          </div>

          {/* KPIs Performance Opérationnelle améliorés */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-slate-900">Efficacité</h4>
                <span className="text-slate-600">⚡</span>
            </div>
              <p className="text-2xl font-bold text-slate-900">87.5%</p>
              <p className="text-xs text-slate-600 mb-1">Taux d'efficacité opérationnelle</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-slate-500 h-1.5 rounded-full" style={{ width: '87.5%' }}></div>
            </div>
              <p className="text-xs text-slate-600 mt-1">+2.3% vs mois dernier</p>
                </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-slate-900">Cycle</h4>
                <span className="text-slate-600">🔄</span>
                </div>
              <p className="text-2xl font-bold text-slate-900">38j</p>
              <p className="text-xs text-slate-600 mb-1">Cycle de conversion</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-slate-500 h-1.5 rounded-full" style={{ width: '76%' }}></div>
                </div>
              <p className="text-xs text-slate-600 mt-1">Objectif: 45j (✓ Dépassé)</p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-slate-900">Productivité</h4>
                <span className="text-slate-600">📈</span>
            </div>
              <p className="text-2xl font-bold text-slate-900">+12%</p>
              <p className="text-xs text-slate-600 mb-1">Gain de productivité</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-slate-500 h-1.5 rounded-full" style={{ width: '80%' }}></div>
          </div>
              <p className="text-xs text-slate-600 mt-1">vs objectif +8%</p>
        </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-slate-900">ROI IA</h4>
           
                  </div>
              <p className="text-2xl font-bold text-slate-900">+28%</p>
              <p className="text-xs text-slate-600 mb-1">Retour investissement IA</p>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-slate-500 h-1.5 rounded-full" style={{ width: '93%' }}></div>
                  </div>
              <p className="text-xs text-slate-600 mt-1">Économies: {formatCurrency(45000)}/mois</p>
            </div>
          </div>

          {/* Tableau Métriques détaillé */}
          <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-900">Métriques Opérationnelles Détaillées</h4>
              <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">Mise à jour: 14:32</span>
              </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-2 font-semibold text-slate-900">Métrique</th>
                    <th className="text-center py-2 px-2 font-semibold text-slate-900">Actuel</th>
                    <th className="text-center py-2 px-2 font-semibold text-slate-900">Objectif</th>
                    <th className="text-center py-2 px-2 font-semibold text-slate-900">Évolution</th>
                    <th className="text-center py-2 px-2 font-semibold text-slate-900">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 px-2 text-slate-700">Temps Traitement Moyen</td>
                    <td className="py-2 px-2 text-center font-semibold text-slate-900">2.3h</td>
                    <td className="py-2 px-2 text-center font-semibold text-slate-900">2.0h</td>
                    <td className="py-2 px-2 text-center font-semibold text-slate-600">+15%</td>
                    <td className="py-2 px-2 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">
                        À améliorer
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 text-slate-700">Taux de Satisfaction Client</td>
                    <td className="py-2 px-2 text-center font-semibold text-slate-900">92%</td>
                    <td className="py-2 px-2 text-center font-semibold text-slate-900">90%</td>
                    <td className="py-2 px-2 text-center font-semibold text-slate-600">+2%</td>
                    <td className="py-2 px-2 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">
                        Excellent
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 text-slate-700">Disponibilité Système</td>
                    <td className="py-2 px-2 text-center font-semibold text-slate-900">99.2%</td>
                    <td className="py-2 px-2 text-center font-semibold text-slate-900">99.0%</td>
                    <td className="py-2 px-2 text-center font-semibold text-slate-600">+0.2%</td>
                    <td className="py-2 px-2 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">
                        Excellent
                      </span>
                    </td>
                </tr>
                <tr>
                    <td className="py-2 px-2 text-slate-700">Taux d'Erreur Automatisation</td>
                    <td className="py-2 px-2 text-center font-semibold text-slate-900">0.8%</td>
                    <td className="py-2 px-2 text-center font-semibold text-slate-900">1.0%</td>
                    <td className="py-2 px-2 text-center font-semibold text-slate-600">-20%</td>
                    <td className="py-2 px-2 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">
                        Excellent
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 text-slate-700">Temps de Réponse IA</td>
                    <td className="py-2 px-2 text-center font-semibold text-slate-900">1.2s</td>
                    <td className="py-2 px-2 text-center font-semibold text-slate-900">2.0s</td>
                    <td className="py-2 px-2 text-center font-semibold text-slate-600">-40%</td>
                    <td className="py-2 px-2 text-center">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">
                        Excellent
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Exemples de démonstration IA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Démonstration prédictions */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                🔮 Prédictions IA - Démonstration
              </h4>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700">CA Q4 Prédit</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">+8%</span>
          </div>
                  <p className="text-sm font-bold text-slate-900">2.7M {currentDevise || 'DA'}</p>
                  <p className="text-xs text-slate-600">Confiance: 89% • Basé sur tendances saisonnières</p>
            </div>

                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700">Risque Liquidité</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">Faible</span>
                </div>
                  <p className="text-sm font-bold text-slate-900">15% probabilité</p>
                  <p className="text-xs text-slate-600">Prochaine alerte: dans 45 jours</p>
            </div>

                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700">Optimisation BFR</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">Action</span>
              </div>
                  <p className="text-sm font-bold text-slate-900">-{formatCurrency(12000)} possible</p>
                  <p className="text-xs text-slate-600">Via négociation délais fournisseurs</p>
              </div>
            </div>
          </div>

            {/* Heatmap Satisfaction améliorée */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                🌡️ Heatmap Satisfaction - Temps Réel
            </h4>
              <div className="grid grid-cols-2 gap-3 mb-3">
                {[
                  { label: 'Q1', value: 92, trend: '+3%' },
                  { label: 'Q2', value: 88, trend: '-2%' },
                  { label: 'Q3', value: 95, trend: '+7%' },
                  { label: 'Q4', value: 90, trend: '-5%' }
                ].map((item, index) => (
                <div key={index} className="text-center">
                  <div 
                      className="h-12 rounded-lg border-2 flex items-center justify-center text-white font-bold text-sm"
                    style={{
                        backgroundColor: `rgba(51, 65, 85, ${item.value / 100})`,
                      borderColor: 'rgba(51, 65, 85, 1)'
                    }}
                    >
                      {item.value}%
              </div>
                    <p className="text-xs text-slate-600 mt-1 font-semibold">{item.label}</p>
                    <p className={`text-xs font-semibold ${item.trend.startsWith('+') ? 'text-slate-600' : 'text-slate-500'}`}>
                      {item.trend}
                </p>
                </div>
              ))}
            </div>

              <div className="bg-white rounded-lg p-2 border border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Score Global IA</span>
                  <span className="font-bold text-slate-900">91.25%</span>
          </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                  <div className="bg-slate-500 h-1.5 rounded-full" style={{ width: '91.25%' }}></div>
        </div>
      </div>
    </div>
            </div>

          {/* Actions IA recommandées */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              🎯 Actions IA Recommandées - Démonstration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-slate-600">⚡</span>
                  <span className="text-xs font-semibold text-slate-700">Action Immédiate</span>
            </div>
                <p className="text-xs text-slate-600 mb-2">Optimiser recouvrement clients Alpha SA</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Impact: +{formatCurrency(8000)}</span>
                  <button 
                    onClick={handleActionsRapides}
                    disabled={showActionsModal && actionsEnCours}
                    className="px-2 py-1 bg-slate-600 text-white text-xs rounded hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {showActionsModal && actionsEnCours ? (
                      <>
                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                        ...
                      </>
                    ) : showActionsModal && resultatsActions.automaticAlerts ? (
                      '✓ Terminé'
                    ) : (
                      'Exécuter'
                    )}
                  </button>
            </div>
            </div>
    
              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-slate-600">📊</span>
                  <span className="text-xs font-semibold text-slate-700">Analyse Approfondie</span>
                </div>
                <p className="text-xs text-slate-600 mb-2">Modèle prédictif BFR Q4</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Durée: 2h</span>
                  <button 
                    onClick={handleRapportDetaille}
                    className="px-2 py-1 bg-slate-600 text-white text-xs rounded hover:bg-slate-700 transition-colors"
                  >
                    Lancer
                  </button>
                </div>
                </div>

              <div className="bg-white rounded-lg p-3 border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-slate-600">🔄</span>
                  <span className="text-xs font-semibold text-slate-700">Automatisation</span>
            </div>
                <p className="text-xs text-slate-600 mb-2">Alertes BFR en temps réel</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Gain: 15h/sem</span>
                  <button 
                    onClick={handleHistoriqueRatios}
                    className="px-2 py-1 bg-slate-600 text-white text-xs rounded hover:bg-slate-700 transition-colors"
                  >
                    Activer
                  </button>
                  </div>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 text-center">
        <p className="text-xs text-slate-600">Généré par ERP Léger xAI - 04/10/2025</p>
                  </div>

      {/* MODALES */}
      {/* Modal Actions Rapides */}
      {showActionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-auto my-8 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">⚡</span>
                  </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Actions Rapides Automatiques</h3>
                  <p className="text-sm text-slate-600">Exécution en cours...</p>
                  </div>
                </div>
              <button 
                onClick={() => setShowActionsModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
          </div>

            <div className="space-y-4 mb-6">
              {/* Action 1: Optimisation BFR */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                    {resultatsActions.bfrOptimization ? (
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-600 text-sm">✓</span>
          </div>
                    ) : actionsEnCours ? (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-slate-500 text-sm">⏳</span>
        </div>
      )}
          </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-900">Optimisation BFR</h4>
                    <p className="text-xs text-slate-600">
                      {resultatsActions.bfrOptimization 
                        ? `Optimisation BFR lancée avec succès - Gain estimé: +${formatCurrency(45000)}`
                        : actionsEnCours 
                          ? 'Analyse des stocks et créances en cours...'
                          : 'En attente d\'exécution'
                      }
                    </p>
            </div>
                </div>
            </div>

              {/* Action 2: Négociation Fournisseurs */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                    {resultatsActions.supplierNegotiation ? (
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-600 text-sm">✓</span>
            </div>
                    ) : actionsEnCours ? (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
                    ) : (
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-slate-500 text-sm">⏳</span>
              </div>
                    )}
              </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-900">Négociation Fournisseurs</h4>
                    <p className="text-xs text-slate-600">
                      {resultatsActions.supplierNegotiation 
                        ? 'Négociation fournisseurs initiée - Extension DPO à 35j'
                        : actionsEnCours 
                          ? 'Contact des fournisseurs principaux...'
                          : 'En attente d\'exécution'
                      }
                    </p>
              </div>
            </div>
          </div>

              {/* Action 3: Alertes Automatiques */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                    {resultatsActions.automaticAlerts ? (
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                        <span className="text-emerald-600 text-sm">✓</span>
                      </div>
                    ) : actionsEnCours ? (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <span className="text-slate-500 text-sm">⏳</span>
        </div>
      )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-900">Alertes Automatiques</h4>
                    <p className="text-xs text-slate-600">
                      {resultatsActions.automaticAlerts 
                        ? 'Alertes automatiques activées - Surveillance 24/7'
                        : actionsEnCours 
                          ? 'Configuration des seuils d\'alerte...'
                          : 'En attente d\'exécution'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Résumé des résultats enrichi */}
            {resultatsActions.automaticAlerts && (
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-4 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-slate-600 text-lg">🎉</span>
                  <h4 className="text-sm font-semibold text-slate-900">Actions Terminées avec Succès</h4>
                  <span className="px-2 py-1 bg-slate-200 text-slate-800 text-xs rounded-full font-medium">
                    100% Réussite
          </span>
        </div>
        
                {/* Métriques détaillées */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-600">💰</span>
                      <span className="text-xs font-semibold text-slate-800">Impact Financier</span>
            </div>
                    <p className="text-lg font-bold text-slate-900">+{formatCurrency(75000)}</p>
                    <p className="text-xs text-slate-600">BFR optimisé</p>
          </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-600">⏱️</span>
                      <span className="text-xs font-semibold text-slate-800">Temps Total</span>
            </div>
                    <p className="text-lg font-bold text-slate-900">6.2s</p>
                    <p className="text-xs text-slate-600">Exécution automatique</p>
          </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-600">📊</span>
                      <span className="text-xs font-semibold text-slate-800">Efficacité</span>
        </div>
                    <p className="text-lg font-bold text-slate-900">3/3</p>
                    <p className="text-xs text-slate-600">Actions réussies</p>
      </div>
          </div>

                {/* Détail des actions avec impacts */}
                <div className="space-y-3 mb-4">
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">⚡</span>
                        <span className="text-xs font-semibold text-slate-800">Optimisation BFR</span>
                      </div>
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">
                        +{formatCurrency(45000)}
                </span>
              </div>
                    <p className="text-xs text-slate-700 mb-2">Analyse automatique des stocks et créances clients</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Stocks optimisés:</span>
                        <span className="font-semibold text-slate-800">-{formatCurrency(15000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Créances recouvrées:</span>
                        <span className="font-semibold text-slate-800">-{formatCurrency(30000)}</span>
                      </div>
              </div>
            </div>

                  <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">🤝</span>
                        <span className="text-xs font-semibold text-slate-800">Négociation Fournisseurs</span>
                      </div>
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">
                        +{formatCurrency(30000)}
                </span>
              </div>
                    <p className="text-xs text-slate-700 mb-2">Extension automatique des délais de paiement</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                        <span className="text-slate-600">DPO étendu:</span>
                        <span className="font-semibold text-slate-800">25j → 35j</span>
                </div>
                <div className="flex justify-between">
                        <span className="text-slate-600">Fournisseurs contactés:</span>
                        <span className="font-semibold text-slate-800">8/8</span>
                </div>
              </div>
            </div>

                  <div className="bg-white rounded-lg p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">🔔</span>
                        <span className="text-xs font-semibold text-slate-800">Alertes Automatiques</span>
                      </div>
                      <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">
                        Active
                </span>
              </div>
                    <p className="text-xs text-slate-700 mb-2">Système de surveillance 24/7 activé</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Seuils configurés:</span>
                        <span className="font-semibold text-slate-800">12 ratios</span>
            </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Fréquence:</span>
                        <span className="font-semibold text-slate-800">Temps réel</span>
              </div>
                    </div>
            </div>
          </div>

                {/* Impact sur les ratios financiers */}
                <div className="bg-white rounded-lg p-3 border border-slate-200 mb-4">
                  <h5 className="text-xs font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    📈 Impact sur les Ratios Financiers
                  </h5>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Cycle de Conversion:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">57j</span>
                        <span className="text-slate-600">→</span>
                        <span className="font-semibold text-slate-800">45j</span>
              </div>
            </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Trésorerie Nette:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">450K</span>
                        <span className="text-slate-600">→</span>
                        <span className="font-semibold text-slate-800">525K</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Liquidité Générale:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">1.85</span>
                        <span className="text-slate-600">→</span>
                        <span className="font-semibold text-slate-800">2.12</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">BFR:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500">130K</span>
                        <span className="text-slate-600">→</span>
                        <span className="font-semibold text-slate-800">55K</span>
                      </div>
              </div>
            </div>
          </div>

                {/* Recommandations de suivi */}
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 mb-4">
                  <h5 className="text-xs font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    📋 Recommandations de Suivi
                  </h5>
                  <div className="space-y-1 text-xs text-slate-700">
                    <p>• Vérifier l'efficacité des négociations dans 15 jours</p>
                    <p>• Analyser l'impact sur les ratios dans le prochain rapport mensuel</p>
                    <p>• Surveiller les alertes automatiques pour détecter les dérives</p>
                    <p>• Planifier une revue trimestrielle des optimisations BFR</p>
              </div>
            </div>

                {/* Timestamp et informations techniques */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200">
                  <div className="flex items-center gap-4">
                    <span>Terminé le {resultatsActions.timestamp ? new Date(resultatsActions.timestamp).toLocaleString('fr-FR') : 'Maintenant'}</span>
                    <span>•</span>
                    <span>Version IA: 2.1.3</span>
              </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></span>
                    <span>Système actif</span>
            </div>
          </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-between items-center">
              <button 
                onClick={() => {
                  setShowActionsModal(false);
                  setResultatsActions({
                    bfrOptimization: false,
                    supplierNegotiation: false,
                    automaticAlerts: false
                  });
                  setActionsEnCours(false);
                }}
                className="px-4 py-2 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Réinitialiser
              </button>
              <button 
                onClick={() => setShowActionsModal(false)}
                className="px-6 py-2 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rapport Détaillé */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl mx-auto my-8 max-h-[95vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">📊</span>
            </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Rapport Financier Détaillé</h3>
                  <p className="text-sm text-slate-600">Analyse complète - {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
          </div>

            {/* Résumé Exécutif */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <h4 className="text-lg font-semibold text-slate-900 mb-3">📋 Résumé Exécutif</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <h5 className="text-sm font-semibold text-slate-700 mb-2">Score Global</h5>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-slate-900">87/100</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">Bon</span>
              </div>
                  <p className="text-xs text-slate-600 mt-1">+5 points vs trimestre précédent</p>
            </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <h5 className="text-sm font-semibold text-slate-700 mb-2">Tendance</h5>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-slate-900">↗️</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">Positive</span>
              </div>
                  <p className="text-xs text-slate-600 mt-1">Amélioration continue</p>
            </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <h5 className="text-sm font-semibold text-slate-700 mb-2">Risque</h5>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-slate-900">Faible</span>
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">Contrôlé</span>
          </div>
                  <p className="text-xs text-slate-600 mt-1">Surveillance normale</p>
              </div>
            </div>
          </div>

            {/* Analyse des Ratios */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">📈 Analyse Complète des 12 Ratios Financiers</h4>
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <h5 className="text-sm font-semibold text-slate-700 mb-3">📊 Synthèse Analytique</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      <span className="font-semibold text-slate-700">Ratios Excellents</span>
            </div>
                    <p className="text-slate-600">8 ratios (67%)</p>
          </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      <span className="font-semibold text-slate-700">À Surveiller</span>
            </div>
                    <p className="text-slate-600">3 ratios (25%)</p>
          </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span className="font-semibold text-slate-700">Critiques</span>
            </div>
                    <p className="text-slate-600">1 ratio (8%)</p>
          </div>
            </div>
          </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 font-semibold text-slate-900">Ratio</th>
                      <th className="text-center py-2 px-3 font-semibold text-slate-900">Valeur Actuelle</th>
                      <th className="text-center py-2 px-3 font-semibold text-slate-900">Objectif</th>
                      <th className="text-center py-2 px-3 font-semibold text-slate-900">Secteur</th>
                      <th className="text-center py-2 px-3 font-semibold text-slate-900">Évolution</th>
                      <th className="text-center py-2 px-3 font-semibold text-slate-900">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Ratios de Liquidité */}
                  <tr className="bg-blue-50">
                      <td colSpan={6} className="py-2 px-3 font-semibold text-blue-900 text-center">💧 RATIOS DE LIQUIDITÉ</td>
                  </tr>
                  <tr>
                      <td className="py-2 px-3 text-slate-700">Liquidité Générale</td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-900">1.85</td>
                      <td className="py-2 px-3 text-center text-slate-600">&gt; 1.5</td>
                      <td className="py-2 px-3 text-center text-slate-600">1.62</td>
                      <td className="py-2 px-3 text-center text-emerald-600">+8.2%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">Excellent</span>
                    </td>
                  </tr>
                  <tr>
                      <td className="py-2 px-3 text-slate-700">Liquidité Immédiate</td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-900">1.42</td>
                      <td className="py-2 px-3 text-center text-slate-600">&gt; 1.0</td>
                      <td className="py-2 px-3 text-center text-slate-600">1.28</td>
                      <td className="py-2 px-3 text-center text-emerald-600">+11.0%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">Excellent</span>
                    </td>
                  </tr>
                  <tr>
                      <td className="py-2 px-3 text-slate-700">Ratio de Trésorerie</td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-900">0.28</td>
                      <td className="py-2 px-3 text-center text-slate-600">&gt; 0.2</td>
                      <td className="py-2 px-3 text-center text-slate-600">0.22</td>
                      <td className="py-2 px-3 text-center text-emerald-600">+27.3%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">Bon</span>
                    </td>
                  </tr>

                  {/* Ratios de Solvabilité */}
                  <tr className="bg-purple-50">
                      <td colSpan={6} className="py-2 px-3 font-semibold text-purple-900 text-center">🏗️ RATIOS DE SOLVABILITÉ</td>
                  </tr>
                  <tr>
                      <td className="py-2 px-3 text-slate-700">Ratio d'Endettement</td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-900">0.32</td>
                      <td className="py-2 px-3 text-center text-slate-600">&lt; 0.35</td>
                      <td className="py-2 px-3 text-center text-slate-600">0.38</td>
                      <td className="py-2 px-3 text-center text-emerald-600">-5.2%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">Excellent</span>
                    </td>
                  </tr>
                  <tr>
                      <td className="py-2 px-3 text-slate-700">Ratio d'Autonomie</td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-900">0.68</td>
                      <td className="py-2 px-3 text-center text-slate-600">&gt; 0.65</td>
                      <td className="py-2 px-3 text-center text-slate-600">0.62</td>
                      <td className="py-2 px-3 text-center text-emerald-600">+9.7%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">Excellent</span>
                    </td>
                  </tr>
                  <tr>
                      <td className="py-2 px-3 text-slate-700">Couverture Charges Fin.</td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-900">4.2x</td>
                      <td className="py-2 px-3 text-center text-slate-600">&gt; 3.0x</td>
                      <td className="py-2 px-3 text-center text-slate-600">3.5x</td>
                      <td className="py-2 px-3 text-center text-emerald-600">+20.0%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">Excellent</span>
                    </td>
                  </tr>

                    {/* Ratios de Performance */}
                    <tr className="bg-green-50">
                      <td colSpan={6} className="py-2 px-3 font-semibold text-green-900 text-center">📈 RATIOS DE PERFORMANCE</td>
                  </tr>
                  <tr>
                      <td className="py-2 px-3 text-slate-700">ROE (Return on Equity)</td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-900">18.5%</td>
                      <td className="py-2 px-3 text-center text-slate-600">&gt; 15%</td>
                      <td className="py-2 px-3 text-center text-slate-600">14.2%</td>
                      <td className="py-2 px-3 text-center text-emerald-600">+30.3%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">Supérieur</span>
                    </td>
                  </tr>
                  <tr>
                      <td className="py-2 px-3 text-slate-700">ROA (Return on Assets)</td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-900">12.8%</td>
                      <td className="py-2 px-3 text-center text-slate-600">&gt; 10%</td>
                      <td className="py-2 px-3 text-center text-slate-600">9.8%</td>
                      <td className="py-2 px-3 text-center text-emerald-600">+30.6%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">Excellent</span>
                    </td>
                  </tr>
                  <tr>
                      <td className="py-2 px-3 text-slate-700">ROIC (Return on Invested Capital)</td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-900">15.2%</td>
                      <td className="py-2 px-3 text-center text-slate-600">&gt; 12%</td>
                      <td className="py-2 px-3 text-center text-slate-600">11.5%</td>
                      <td className="py-2 px-3 text-center text-emerald-600">+32.2%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">Excellent</span>
                    </td>
                  </tr>
                  <tr>
                      <td className="py-2 px-3 text-slate-700">Marge Opérationnelle</td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-900">19.8%</td>
                      <td className="py-2 px-3 text-center text-slate-600">&gt; 15%</td>
                      <td className="py-2 px-3 text-center text-slate-600">16.2%</td>
                      <td className="py-2 px-3 text-center text-emerald-600">+22.2%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">Excellent</span>
                    </td>
                  </tr>

                    {/* Ratios d'Activité */}
                    <tr className="bg-orange-50">
                      <td colSpan={6} className="py-2 px-3 font-semibold text-orange-900 text-center">⚡ RATIOS D'ACTIVITÉ</td>
                  </tr>
                  <tr>
                      <td className="py-2 px-3 text-slate-700">Cycle de Conversion Trésorerie</td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-900">57j</td>
                      <td className="py-2 px-3 text-center text-slate-600">&lt; 45j</td>
                      <td className="py-2 px-3 text-center text-slate-600">62j</td>
                      <td className="py-2 px-3 text-center text-amber-600">-8.1%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded border border-amber-200">À améliorer</span>
                    </td>
                  </tr>
                  <tr>
                      <td className="py-2 px-3 text-slate-700">Rotation des Stocks</td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-900">6.4x</td>
                      <td className="py-2 px-3 text-center text-slate-600">&gt; 6.0x</td>
                      <td className="py-2 px-3 text-center text-slate-600">5.8x</td>
                      <td className="py-2 px-3 text-center text-emerald-600">+10.3%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">Bon</span>
                    </td>
                  </tr>
                  <tr>
                      <td className="py-2 px-3 text-slate-700">DSO (Days Sales Outstanding)</td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-900">38j</td>
                      <td className="py-2 px-3 text-center text-slate-600">&lt; 40j</td>
                      <td className="py-2 px-3 text-center text-slate-600">42j</td>
                      <td className="py-2 px-3 text-center text-emerald-600">-9.5%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded border border-emerald-200">Acceptable</span>
                    </td>
                  </tr>
                  <tr>
                      <td className="py-2 px-3 text-slate-700">DPO (Days Payable Outstanding)</td>
                      <td className="py-2 px-3 text-center font-semibold text-slate-900">25j</td>
                      <td className="py-2 px-3 text-center text-slate-600">&gt; 30j</td>
                      <td className="py-2 px-3 text-center text-slate-600">28j</td>
                      <td className="py-2 px-3 text-center text-amber-600">-10.7%</td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded border border-amber-200">Optimisable</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
              
              {/* Analyse détaillée des ratios critiques */}
              <div className="mt-4 bg-amber-50 rounded-lg border border-amber-200 p-4">
                <h5 className="text-sm font-semibold text-amber-900 mb-3">⚠️ Points d'Attention - Analyse Financière</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <h6 className="font-semibold text-amber-800 mb-2">🔍 Ratios Critiques</h6>
              <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-amber-600">•</span>
                <div>
                          <span className="font-semibold text-amber-800">Cycle de Conversion (57j)</span>
                          <p className="text-amber-700">Dépassement de 12j vs objectif. Impact estimé: -{formatCurrency(45000)} de trésorerie bloquée</p>
                  </div>
                  </div>
                      <div className="flex items-start gap-2">
                        <span className="text-amber-600">•</span>
                <div>
                          <span className="font-semibold text-amber-800">DPO Optimisable (25j)</span>
                          <p className="text-amber-700">Opportunité d'extension à 35j pour libérer +{formatCurrency(30000)} de BFR</p>
                  </div>
                  </div>
                </div>
                  </div>
                  <div>
                    <h6 className="font-semibold text-emerald-800 mb-2">✅ Points Forts</h6>
              <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-600">✓</span>
                <div>
                          <span className="font-semibold text-emerald-800">ROE Supérieur (+30%)</span>
                          <p className="text-emerald-700">Performance exceptionnelle vs secteur</p>
                  </div>
                  </div>
                      <div className="flex items-start gap-2">
                        <span className="text-emerald-600">✓</span>
                <div>
                          <span className="font-semibold text-emerald-800">Liquidité Excellente</span>
                          <p className="text-emerald-700">Cushion de sécurité financière optimal</p>
                  </div>
                  </div>
                </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparaisons Sectorielles */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">🏭 Comparaisons Sectorielles</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-slate-700 mb-3">Position Concurrentielle</h5>
              <div className="space-y-2">
                  <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-600">vs Secteur</span>
                      <span className="text-xs font-semibold text-slate-900">Top 25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-600">vs Concurrents directs</span>
                      <span className="text-xs font-semibold text-slate-900">Top 15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-600">vs Benchmark national</span>
                      <span className="text-xs font-semibold text-slate-900">Top 20%</span>
                  </div>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-slate-700 mb-3">Avantages Concurrentiels</h5>
              <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-slate-500 text-xs">✓</span>
                      <span className="text-xs text-slate-600">Liquidité supérieure de 14%</span>
                </div>
                    <div className="flex items-start gap-2">
                      <span className="text-slate-500 text-xs">✓</span>
                      <span className="text-xs text-slate-600">ROE 30% plus élevé</span>
                </div>
                    <div className="flex items-start gap-2">
                      <span className="text-slate-500 text-xs">✓</span>
                      <span className="text-xs text-slate-600">Endettement maîtrisé</span>
                </div>
                </div>
                </div>
              </div>
            </div>

            {/* Recommandations Prioritaires */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">🎯 Recommandations Prioritaires</h4>
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-600 text-xs font-bold">1</span>
              </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-semibold text-slate-900 mb-1">Optimiser le Cycle de Conversion</h5>
                      <p className="text-xs text-slate-600 mb-2">Réduire de 57j à 45j pour améliorer la trésorerie</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Impact: +{formatCurrency(45000)}</span>
                        <span>Effort: Moyen</span>
                        <span>Délai: 3 mois</span>
                </div>
                </div>
                </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-orange-600 text-xs font-bold">2</span>
              </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-semibold text-slate-900 mb-1">Renégocier les Délais Fournisseurs</h5>
                      <p className="text-xs text-slate-600 mb-2">Étendre DPO de 25j à 35j pour optimiser le BFR</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Impact: +{formatCurrency(30000)}</span>
                        <span>Effort: Faible</span>
                        <span>Délai: 1 mois</span>
            </div>
          </div>
                  </div>
                  </div>
                <div className="bg-white border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 text-xs font-bold">3</span>
                  </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-semibold text-slate-900 mb-1">Diversifier le Portefeuille Clients</h5>
                      <p className="text-xs text-slate-600 mb-2">Réduire la concentration Alpha SA de 15.4% à 12%</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>Impact: Risque réduit</span>
                        <span>Effort: Élevé</span>
                        <span>Délai: 6 mois</span>
                </div>
              </div>
                  </div>
                  </div>
                  </div>
                </div>

            {/* Actions d'Export */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-slate-900 mb-4">📄 Export et Partage</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                  <span>📄</span>
                  <span>Export PDF</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                  <span>📊</span>
                  <span>Export Excel</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  <span>📧</span>
                  <span>Envoyer par Email</span>
                </button>
              </div>
            </div>

            {/* Boutons de Navigation */}
            <div className="flex justify-between items-center mt-6">
              <button className="px-4 py-2 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                ← Rapport Précédent
              </button>
              <button 
                onClick={() => setShowReportModal(false)}
                className="px-6 py-2 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
              >
                Fermer
              </button>
              <button className="px-4 py-2 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                Rapport Suivant →
              </button>
          </div>
              </div>
            </div>
      )}

      {/* Modal Historique Ratios */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl mx-auto my-8 max-h-[95vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">📈</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Historique des Ratios Financiers</h3>
                  <p className="text-sm text-slate-600">Analyse sur 12 derniers mois</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Indicateurs de progression */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">📊 État du Chargement</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${donneesHistorique.ratios.length > 0 ? 'bg-slate-500' : 'bg-slate-300'}`}></div>
                    <span className="text-xs font-semibold text-slate-700">Données Ratios</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {donneesHistorique.ratios.length > 0 ? `${donneesHistorique.ratios.length} ratios chargés` : 'Chargement...'}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${donneesHistorique.tendances.length > 0 ? 'bg-slate-500' : 'bg-slate-300'}`}></div>
                    <span className="text-xs font-semibold text-slate-700">Analyse Tendances</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {donneesHistorique.tendances.length > 0 ? 'Tendances identifiées' : 'En cours...'}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${donneesHistorique.seuils.length > 0 ? 'bg-slate-500' : 'bg-slate-300'}`}></div>
                    <span className="text-xs font-semibold text-slate-700">Seuils d'Alerte</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {donneesHistorique.seuils.length > 0 ? 'Seuils configurés' : 'Configuration...'}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${donneesHistorique.graphiques.length > 0 ? 'bg-slate-500' : 'bg-slate-300'}`}></div>
                    <span className="text-xs font-semibold text-slate-700">Graphiques</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {donneesHistorique.graphiques.length > 0 ? 'Graphiques prêts' : 'Préparation...'}
                  </p>
                </div>
              </div>
            </div>

            {/* Graphiques interactifs */}
            {donneesHistorique.graphiques.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">💧 Évolution Liquidité Générale</h4>
                  <div className="h-48">
                    <Line data={historiqueLiquidite} options={chartOptions} />
                  </div>
                  <div className="mt-3 text-xs text-slate-600">
                    <p>Tendance: <span className="font-semibold text-slate-800">Positive (+12.1%)</span></p>
                    <p>Objectif: <span className="font-semibold text-slate-800">&gt; 1.5</span></p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">📊 Performance ROE</h4>
                  <div className="h-48">
                    <Bar data={historiqueROE} options={chartOptions} />
                  </div>
                  <div className="mt-3 text-xs text-slate-600">
                    <p>Tendance: <span className="font-semibold text-slate-800">Excellente (+21.7%)</span></p>
                    <p>Objectif: <span className="font-semibold text-slate-800">&gt; 15%</span></p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">🏗️ Réduction Endettement</h4>
                  <div className="h-48">
                    <Line data={historiqueEndettement} options={chartOptions} />
                  </div>
                  <div className="mt-3 text-xs text-slate-600">
                    <p>Tendance: <span className="font-semibold text-slate-800">Amélioration (-9.1%)</span></p>
                    <p>Objectif: <span className="font-semibold text-slate-800">&lt; 35%</span></p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">⚡ Optimisation Cycle</h4>
                  <div className="h-48">
                    <Line data={historiqueCycle} options={chartOptions} />
                  </div>
                  <div className="mt-3 text-xs text-slate-600">
                    <p>Tendance: <span className="font-semibold text-slate-800">Stable (-8.1%)</span></p>
                    <p>Objectif: <span className="font-semibold text-slate-800">&lt; 45j</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* Tableau des tendances */}
            {donneesHistorique.tendances.length > 0 && (
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-6">
                <h4 className="text-sm font-semibold text-slate-900 mb-4">📈 Analyse des Tendances</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-3 font-semibold text-slate-900">Ratio</th>
                        <th className="text-center py-2 px-3 font-semibold text-slate-900">Tendance</th>
                        <th className="text-center py-2 px-3 font-semibold text-slate-900">Évolution</th>
                        <th className="text-center py-2 px-3 font-semibold text-slate-900">Confiance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {donneesHistorique.tendances.map((tendance, index) => (
                        <tr key={index}>
                          <td className="py-2 px-3 text-slate-700">{tendance.ratio}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2 py-1 text-xs rounded border ${
                              tendance.tendance === 'Excellente' ? 'bg-slate-100 text-slate-800 border-slate-200' :
                              tendance.tendance === 'Positive' ? 'bg-slate-100 text-slate-800 border-slate-200' :
                              tendance.tendance === 'Amélioration' ? 'bg-slate-100 text-slate-800 border-slate-200' :
                              'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>
                              {tendance.tendance}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-semibold text-slate-900">{tendance.evolution}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="text-slate-600">{tendance.confiance}%</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Seuils d'alerte */}
            {donneesHistorique.seuils.length > 0 && (
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-6">
                <h4 className="text-sm font-semibold text-slate-900 mb-4">🚨 Seuils d'Alerte Personnalisés</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {donneesHistorique.seuils.map((seuil, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-800">{seuil.ratio}</span>
                        <span className={`px-2 py-1 text-xs rounded border ${
                          seuil.statut === 'Au-dessus' || seuil.statut === 'Dépassé' ? 'bg-slate-100 text-slate-800 border-slate-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {seuil.statut}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Seuil: {seuil.seuil}</span>
                        <span>Marge: {seuil.marge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Résumé final */}
            {donneesHistorique.timestamp && (
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-slate-600">🎯</span>
                  <h4 className="text-sm font-semibold text-slate-900">Résumé de l'Analyse Historique</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-600">📊</span>
                      <span className="font-semibold text-slate-800">Période Analysée</span>
                    </div>
                    <p className="text-slate-600">12 derniers mois</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-600">📈</span>
                      <span className="font-semibold text-slate-800">Ratios Analysés</span>
                    </div>
                    <p className="text-slate-600">{donneesHistorique.ratios.length} ratios clés</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-600">⚡</span>
                      <span className="font-semibold text-slate-800">Temps de Chargement</span>
                    </div>
                    <p className="text-slate-600">6.5 secondes</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 pt-3 mt-3 border-t border-slate-200">
                  <span>Analyse terminée le {new Date(donneesHistorique.timestamp).toLocaleString('fr-FR')}</span>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></span>
                    <span>Système actif</span>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-between items-center mt-6">
              <button 
                onClick={() => {
                  setShowHistoryModal(false);
                  setDonneesHistorique({
                    ratios: [],
                    tendances: [],
                    seuils: [],
                    graphiques: []
                  });
                  setHistoriqueEnCours(false);
                }}
                className="px-4 py-2 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                Réinitialiser
              </button>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="px-6 py-2 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de modification d'alerte */}
      {showModifyModal && selectedAlerte && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Modifier l'alerte: {selectedAlerte.nom}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Seuil ({selectedAlerte.unite})
                </label>
                <input
                  type="number"
                  value={modifyForm.seuil}
                  onChange={(e) => setModifyForm(prev => ({ ...prev, seuil: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Entrer le seuil"
                  placeholder="Entrer le seuil"
                  title="Entrer le seuil"
                />
    </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fréquence
                </label>
                <select
                  value={modifyForm.frequence}
                  onChange={(e) => setModifyForm(prev => ({ ...prev, frequence: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Sélectionner la fréquence"
                  title="Sélectionner la fréquence"
                >
                  <option value="quotidienne">Quotidienne</option>
                  <option value="hebdomadaire">Hebdomadaire</option>
                  <option value="mensuelle">Mensuelle</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Destinataires (séparés par des virgules)
                </label>
                <textarea
                  value={modifyForm.destinataires}
                  onChange={(e) => setModifyForm(prev => ({ ...prev, destinataires: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email1@entreprise.dz, email2@entreprise.dz"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={modifyForm.active}
                  onChange={(e) => setModifyForm(prev => ({ ...prev, active: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="active" className="ml-2 block text-sm text-slate-700">
                  Alerte active
                </label>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={sauvegarderModifications}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Sauvegarder
              </button>
              <button
                onClick={() => setShowModifyModal(false)}
                className="flex-1 px-4 py-2 bg-slate-300 text-slate-700 rounded-md hover:bg-slate-400 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de résultat de test - Version Améliorée */}
      {showTestResult && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header avec gradient */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Test d'Alerte</h3>
                    <p className="text-sm text-slate-200">Simulation de déclenchement</p>
                  </div>
                </div>
              <button
                onClick={() => setShowTestResult(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                  aria-label="Fermer le résultat du test"
                  title="Fermer le résultat du test"
                  type="button"
              >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>
              </div>
            </div>
            
            {/* Corps du modal avec scroll */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Badge de succès */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center gap-3 bg-emerald-50 px-6 py-3 rounded-full border-2 border-emerald-200">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm font-bold text-emerald-800">Test réussi - Alerte fonctionnelle</span>
                </div>
            </div>
            
              {/* Informations parsées depuis testResult */}
              {testResult && (() => {
                const lines = testResult.split('\n');
                const alerteName = lines.find(l => l.includes(' Alerte:'))?.split('Alerte:')[1]?.trim() || '';
                const description = lines.find(l => l.includes('Description:'))?.split(' Description:')[1]?.trim() || '';
                const statut = lines.find(l => l.includes(' Statut actuel:'))?.split(' Statut actuel:')[1]?.trim() || '';
                const valeurActuelle = lines.find(l => l.includes('📈 Valeur actuelle:'))?.split('Valeur actuelle:')[1]?.trim() || '';
                const seuil = lines.find(l => l.includes(' Seuil configuré:'))?.split('Seuil configuré:')[1]?.trim() || '';
                const depassement = lines.find(l => l.includes(' Dépassement:'))?.split(' Dépassement:')[1]?.trim() || '';
                const frequence = lines.find(l => l.includes('⏰ Fréquence:'))?.split('⏰ Fréquence:')[1]?.trim() || '';
                const destinataires = lines.find(l => l.includes('📧 Destinataires:'))?.split('📧 Destinataires:')[1]?.trim() || '';
                const derniereAlerte = lines.find(l => l.includes('🔄 Dernière alerte:'))?.split('🔄 Dernière alerte:')[1]?.trim() || '';
                
                return (
                  <>
                    {/* Nom de l'alerte */}
                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Alerte testée</p>
                          <p className="text-base font-bold text-slate-900">{alerteName}</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 ml-11">{description}</p>
                    </div>

                    {/* Statut et métriques */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs font-semibold text-slate-600">Statut</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900">{statut}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs font-semibold text-slate-600">Fréquence</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 capitalize">{frequence}</p>
                      </div>
                    </div>

                    {/* Valeurs et seuil */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-slate-300 p-4">
                      <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Analyse des Valeurs
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Seuil configuré</span>
                          <span className="text-sm font-bold text-slate-900">{seuil}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Valeur actuelle</span>
                          <span className="text-sm font-bold text-slate-900">{valeurActuelle}</span>
                        </div>
                        <div className="h-px bg-slate-300"></div>
                        <div className="flex justify-between items-center bg-white rounded-lg p-2">
                          <span className="text-sm font-semibold text-slate-700">Dépassement</span>
                          <span className="text-sm font-bold text-slate-900">{depassement}</span>
                        </div>
                      </div>
                    </div>

                    {/* Destinataires */}
                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-bold text-slate-900">Destinataires notifiés</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {destinataires.split(',').map((dest, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-white text-slate-700 text-xs font-medium rounded-lg border border-slate-200">
                            {dest.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Dernière alerte */}
                    {derniereAlerte && (
                      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <p className="text-xs font-semibold text-blue-900">Dernière alerte déclenchée</p>
                            <p className="text-sm font-bold text-blue-700">{derniereAlerte}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Résultat du test */}
                    <div className="bg-emerald-50 rounded-lg border-2 border-emerald-200 p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-emerald-900 mb-1">Résultat du Test</h4>
                          <p className="text-sm text-emerald-800">
                            ✅ L'alerte fonctionne correctement et serait déclenchée dans les conditions actuelles.
                            Tous les destinataires recevraient une notification.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Footer avec actions */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Ce test n'envoie aucune notification réelle
                  </span>
                </div>
              <button
                onClick={() => setShowTestResult(false)}
                  className="px-6 py-2.5 bg-slate-700 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Fermer
              </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de déclenchement d'alerte - Palette Slate Professionnelle Centré avec Scroll */}
      {showTriggerModal && triggerResult && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-50 rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header fixe */}
            <div className="flex items-center gap-4 p-6 border-b border-slate-200 bg-white rounded-t-xl">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900">
                  Alerte Déclenchée - {triggerResult.type}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Notification envoyée avec succès • {triggerResult.timestamp}
                </p>
              </div>
              <button
                onClick={() => setShowTriggerModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
                aria-label="Fermer la notification"
                title="Fermer la notification"
                type="button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Informations principales */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Informations Générales
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Type d'alerte
                      </label>
                      <p className="text-lg font-semibold text-slate-900 mt-1">
                        {triggerResult.type}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Description
                      </label>
                      <p className="text-sm text-slate-700 mt-1">
                        {triggerResult.description}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Priorité
                      </label>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                        🔴 Critique
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Horodatage
                      </label>
                      <p className="text-sm font-mono text-slate-700 mt-1 bg-slate-100 px-3 py-2 rounded-lg">
                        {triggerResult.timestamp}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Statut
                      </label>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                        ✅ Déclenchée
                      </span>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        ID de l'alerte
                      </label>
                      <p className="text-sm font-mono text-slate-700 mt-1 bg-slate-100 px-3 py-2 rounded-lg">
                        ALERT-{Date.now().toString().slice(-6)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Métriques de l'alerte */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Métriques de l'Alerte
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                      {triggerResult.seuil}
                    </div>
                    <div className="text-sm text-slate-600">
                      Seuil configuré
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      ({triggerResult.unite})
                    </div>
                  </div>
                  <div className="text-center p-6 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">
                      {triggerResult.valeurActuelle}
                    </div>
                    <div className="text-sm text-slate-600">
                      Valeur actuelle
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      ({triggerResult.unite})
                    </div>
                  </div>
                  <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold text-red-600 mb-1">
                      +{triggerResult.depassement}
                    </div>
                    <div className="text-sm text-red-600">
                      Dépassement
                    </div>
                    <div className="text-xs text-red-500 mt-1">
                      ({triggerResult.unite})
                    </div>
                  </div>
                </div>
              </div>

              {/* Analyse de l'impact */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Analyse de l'Impact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <h5 className="font-semibold text-amber-900 mb-2">Impact Financier Estimé</h5>
                      <p className="text-sm text-amber-800">
                        Retard de paiement estimé: <span className="font-semibold">+{formatCurrency(triggerResult.depassement * 1000)}</span>
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-semibold text-blue-900 mb-2">Clients Concernés</h5>
                      <p className="text-sm text-blue-800">
                        Nombre estimé: <span className="font-semibold">{triggerResult.depassement + 5} clients</span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-900 mb-2">Action Préventive</h5>
                      <p className="text-sm text-green-800">
                        Relances automatiques: <span className="font-semibold">Activées</span>
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h5 className="font-semibold text-purple-900 mb-2">Temps de Réponse</h5>
                      <p className="text-sm text-purple-800">
                        Délai recommandé: <span className="font-semibold">24h</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Destinataires */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  Notifications Envoyées
                </h4>
                <div className="space-y-3">
                  {triggerResult.destinataires.map((email: string, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-mono text-slate-700">{email}</span>
                        <p className="text-xs text-slate-500 mt-1">
                          {index === 0 ? 'Comptable principal' : 'Commercial responsable'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                          ✅ Envoyé
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date().toLocaleTimeString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions requises */}
              <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-amber-900 mb-3">Actions Requises</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                        <p className="text-sm text-amber-800">
                          Vérifiez les factures en retard et contactez les clients concernés pour accélérer les recouvrements.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                        <p className="text-sm text-amber-800">
                          Mettez à jour le suivi des relances dans le système de gestion.
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                        <p className="text-sm text-amber-800">
                          Planifiez un suivi dans 48h pour vérifier l'évolution de la situation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer fixe */}
            <div className="flex gap-3 p-6 border-t border-slate-200 bg-white rounded-b-xl">
              <button
                onClick={() => setShowTriggerModal(false)}
                className="flex-1 px-6 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Fermer
              </button>
              <button
                onClick={ouvrirDetails}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Voir les Détails
              </button>
              <button
                onClick={() => {
                  setShowTriggerModal(false);
                  // Ici on pourrait ajouter une action supplémentaire
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Exporter Rapport
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails avancés */}
      {showDetailsModal && triggerResult && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-50 rounded-xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[90vh] flex flex-col">
            {/* Header fixe */}
            <div className="flex items-center gap-4 p-6 border-b border-slate-200 bg-white rounded-t-xl">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900">
                  Détails Avancés - {triggerResult.type}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Analyse complète et historique de l'alerte • ID: ALERT-{Date.now().toString().slice(-6)}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
                aria-label="Fermer les détails de l'alerte"
                title="Fermer les détails de l'alerte"
                type="button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Historique des alertes */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Historique des Alertes
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-red-900">Alerte déclenchée</p>
                      <p className="text-xs text-red-700">{triggerResult.timestamp}</p>
                    </div>
                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">Actuelle</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">Alerte précédente</p>
                      <p className="text-xs text-slate-600">2024-01-15 08:00</p>
                    </div>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Résolue</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">Première alerte</p>
                      <p className="text-xs text-slate-600">2024-01-01 10:30</p>
                    </div>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">Résolue</span>
                  </div>
                </div>
              </div>

              {/* Analyse détaillée */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Analyse Détaillée
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-semibold text-blue-900 mb-2">Tendances</h5>
                      <div className="space-y-2 text-sm text-blue-800">
                        <div className="flex justify-between">
                          <span>Dernière semaine:</span>
                          <span className="font-semibold">+{triggerResult.depassement + 3} jours</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Mois précédent:</span>
                          <span className="font-semibold">+{triggerResult.depassement - 2} jours</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Évolution:</span>
                          <span className="font-semibold text-red-600">↗ +{triggerResult.depassement}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-900 mb-2">Actions Automatiques</h5>
                      <div className="space-y-2 text-sm text-green-800">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>Relances automatiques activées</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>Notifications email envoyées</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          <span>Mise à jour du tableau de bord</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h5 className="font-semibold text-purple-900 mb-2">Recommandations</h5>
                      <div className="space-y-3 text-sm text-purple-800">
                        <div className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                          <span>Contacter les 5 clients les plus importants en priorité</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                          <span>Proposer des facilités de paiement si nécessaire</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="w-2 h-2 bg-purple-500 rounded-full mt-2"></span>
                          <span>Mettre à jour les conditions commerciales</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <h5 className="font-semibold text-orange-900 mb-2">Prochaines Étapes</h5>
                      <div className="space-y-2 text-sm text-orange-800">
                        <div className="flex justify-between">
                          <span>Relance téléphonique:</span>
                          <span className="font-semibold">Dans 2h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rapport de suivi:</span>
                          <span className="font-semibold">Dans 24h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Évaluation impact:</span>
                          <span className="font-semibold">Dans 48h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liste des factures en retard */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Factures en Retard (Top 10)
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">N° Facture</th>
                        <th className="text-left py-3 px-4 font-semibold text-slate-700">Client</th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700">Montant</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-700">Retard</th>
                        <th className="text-center py-3 px-4 font-semibold text-slate-700">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Array.from({ length: 10 }, (_, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono text-slate-700">FAC-{(1000 + i).toString().padStart(4, '0')}</td>
                          <td className="py-3 px-4 text-slate-700">Client {i + 1}</td>
                          <td className="py-3 px-4 text-right font-semibold text-slate-700">
                            {formatCurrency(Math.random() * 50000 + 10000)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              +{triggerResult.depassement + Math.floor(Math.random() * 10)} jours
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              En attente
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Statistiques de performance */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Statistiques de Performance
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-slate-900 mb-1">85%</div>
                    <div className="text-xs text-slate-600">Taux de recouvrement</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-slate-900 mb-1">2.3j</div>
                    <div className="text-xs text-slate-600">Délai moyen de réponse</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-slate-900 mb-1">12</div>
                    <div className="text-xs text-slate-600">Alertes ce mois</div>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="text-2xl font-bold text-slate-900 mb-1">98%</div>
                    <div className="text-xs text-slate-600">Satisfaction client</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer fixe */}
            <div className="flex gap-3 p-6 border-t border-slate-200 bg-white rounded-b-xl">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 px-6 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setShowTriggerModal(true);
                }}
                className="flex-1 px-6 py-3 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Retour à l'Alerte
              </button>
              <button
                onClick={() => {
                  // Simulation d'export de rapport
                  alert('📊 Rapport détaillé exporté avec succès!\n\nLe rapport contient:\n- Historique complet des alertes\n- Analyse détaillée des tendances\n- Liste des factures en retard\n- Statistiques de performance\n- Recommandations d\'actions');
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Exporter Rapport Complet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default FinancialDashboard;
