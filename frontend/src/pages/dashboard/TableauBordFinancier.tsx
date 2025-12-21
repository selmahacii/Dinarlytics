import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/UI/Card';
import FinancialDashboard from '../../components/Charts/FinancialDashboard';
import { useTranslation } from '../../hooks/useTranslation';
import { useApp } from '../../context/AppContext';
import { computeRatios } from '../../utils/ratios';
import { getBenchmarks } from '../../utils/benchmarks';
import Modal from '../../components/UI/Modal';
import ProgressBar from '../../components/UI/ProgressBar';
import { generateRatioAlerts } from '../../utils/ratioAlerts.ts';
import TemporaryNotification from '../../components/UI/TemporaryNotification';
import { forecastCashFlow } from '../../utils/predictiveAnalysis';
import {
  genererVueEnsemble,
  genererRecommandations,
  prioriserInsights,
  type VueEnsemble,
  type InsightConsolide
} from '../../utils/dashboardInsights';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
import {
  BanknotesIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  CalculatorIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ArrowPathIcon,
  BellIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  CogIcon,
  BookOpenIcon,
  DocumentCheckIcon,
  ScaleIcon,
  ClipboardDocumentListIcon,
  StarIcon,
  DocumentDuplicateIcon,
  PlusIcon,
  SparklesIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
// duplicate import removed

const TableauBordFinancier: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formatCurrency, planComptable, companyData, user } = useApp();
  const segment = ((user?.segment as string) || 'micro') as 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
  const companyType = (user?.companyType as string) || 'eurl';
  const sector = (user?.secteur as string) || 'general';
  const { base: baseRatios, advanced: advRatios, notes: ratioNotes } = computeRatios({ companyData, segment, companyType, sector });
  const bm = getBenchmarks({ segment, companyType, sector });
  
  // États pour les modals et contrôles
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Notifications temporaires LIA
  const [liaNotifications, setLiaNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'warning' | 'info' | 'critical';
    title: string;
    message: string;
  }>>([]);

  // Données comptables SCF/IFRS
  const normesComptables = {
    algerien: {
      nom: 'SCF (Système Comptable Financier)',
      code: 'SCF',
      emoji: '🇩🇿',
      comptes: {
        ventes: '701 - Ventes de biens',
        tva: '44571 - TVA collectée',
        clients: '411 - Clients',
        stocks: '31 - Stocks',
        produits: '7011 - Ventes de produits finis',
        charges: '601 - Achats de marchandises',
        immobilisations: '20 - Immobilisations corporelles',
        banque: '512 - Banque',
        caisse: '531 - Caisse'
      }
    },
    international: {
      nom: 'IFRS (International Financial Reporting Standards)',
      code: 'IFRS',
      emoji: '🌍',
      comptes: {
        ventes: 'Revenue - Sales of goods',
        tva: 'VAT Payable',
        clients: 'Trade Receivables',
        stocks: 'Inventory',
        produits: 'Sales Revenue',
        charges: 'Cost of Goods Sold',
        immobilisations: 'Property, Plant & Equipment',
        banque: 'Cash and Cash Equivalents',
        caisse: 'Petty Cash'
      }
    }
  };

  // KPI Comptables pour le Tableau de Bord
  const kpiComptables = {
    ecrituresComptables: {
      total: 1250,
      validees: 1180,
      enAttente: 70,
      evolution: 15.2
    },
    tva: {
      collectee: 512000,
      deductible: 380000,
      aVerser: 132000,
      taux: 16
    },
    bilans: {
      actif: 8500000,
      passif: 6200000,
      capitauxPropres: 2300000,
      dateDernier: '2025-01-31'
    },
    journaux: [
      { nom: 'Ventes', nombre: 245, montant: 3200000, statut: 'Validé' },
      { nom: 'Achats', nombre: 180, montant: 2100000, statut: 'Validé' },
      { nom: 'Banque', nombre: 95, montant: 1500000, statut: 'En cours' },
      { nom: 'TVA', nombre: 45, montant: 512000, statut: 'Validé' }
    ]
  };

  // Données de monitoring en temps réel
  const [financialMetrics] = useState({
    cashFlow: 1250000,
    cashFlowChange: 8.5,
    debtRatio: 0.35,
    debtRatioChange: -2.1,
    liquidityRatio: 2.8,
    liquidityRatioChange: 5.2,
    profitability: 12.3,
    profitabilityChange: 3.7
  });

  // Alertes financières
  const [alerts] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Ratio de liquidité élevé',
      message: 'Le ratio de liquidité dépasse 2.5, considérez un investissement',
      time: 'Il y a 2 heures',
      priority: 'medium'
    },
    {
      id: 2,
      type: 'success',
      title: 'Objectif de CA atteint',
      message: 'Le chiffre d\'affaires mensuel dépasse l\'objectif de 15%',
      time: 'Il y a 4 heures',
      priority: 'low'
    },
    {
      id: 3,
      type: 'critical',
      title: 'Échéance fiscale proche',
      message: 'Déclaration TVA G50 à soumettre dans 3 jours',
      time: 'Il y a 6 heures',
      priority: 'high'
    }
  ]);

  // Conformité réglementaire algérienne
  const [complianceStatus] = useState({
    tva: { status: 'compliant', nextDue: '2025-01-15', progress: 100 },
    ibs: { status: 'pending', nextDue: '2025-03-31', progress: 75 },
    cnss: { status: 'compliant', nextDue: '2025-01-31', progress: 100 },
    g50: { status: 'warning', nextDue: '2025-01-12', progress: 90 }
  });
  
  // Vue d'ensemble consolidée
  const vueEnsemble = useMemo(() => {
    return genererVueEnsemble({
      ratios: {
        dso: baseRatios.dso,
        dio: baseRatios.dio,
        dpo: baseRatios.dpo,
        ccc: baseRatios.ccc,
        liquiditeGenerale: baseRatios.liqGen,
        margeBrute: baseRatios.marginPct,
        roe: advRatios.roePct,
        roa: advRatios.roaPct
      },
      tresorerie: {
        solde: companyData?.cashBalance || 0,
        alertes: 0, // À calculer depuis les alertes de trésorerie
        joursSousSeuil: 0 // À calculer depuis les prévisions
      },
      comptabilite: {
        ecrituresEnAttente: kpiComptables.ecrituresComptables.enAttente,
        erreurs: 0 // À calculer depuis les contrôles comptables
      },
      fiscalite: {
        declarationsEnRetard: complianceStatus.g50.status === 'warning' ? 1 : 0,
        echeancesProches: 1 // À calculer depuis le calendrier fiscal
      },
      paie: {
        bulletinsEnAttente: 0, // À calculer depuis le module paie
        declarationsEnRetard: 0
      },
      budget: {
        ecartsSignificatifs: 0, // À calculer depuis le module budget
        depassements: 0
      }
    });
  }, [baseRatios, advRatios, companyData, kpiComptables, complianceStatus]);
  
  // Recommandations intelligentes
  const recommandations = useMemo(() => {
    return genererRecommandations(vueEnsemble, {
      segment: segment,
      secteur: sector,
      taille: segment
    });
  }, [vueEnsemble, segment, sector]);
  
  // Insights consolidés et priorisés
  const insightsPriorises = useMemo(() => {
    const tousInsights = [
      ...vueEnsemble.alertesConsolidees,
      ...vueEnsemble.opportunites,
      ...recommandations
    ];
    return prioriserInsights(tousInsights);
  }, [vueEnsemble, recommandations]);

  // Prévisions financières
  const [forecasts] = useState({
    nextMonth: { revenue: 2800000, expenses: 2100000, profit: 700000 },
    nextQuarter: { revenue: 8500000, expenses: 6400000, profit: 2100000 },
    nextYear: { revenue: 32000000, expenses: 24000000, profit: 8000000 }
  });

  // Génération des insights LIA et notifications
  useEffect(() => {
    if (!companyData) return;
    
    const alerts = generateRatioAlerts({ base: baseRatios as any, advanced: advRatios as any, bm });
    const newNotifications: Array<{id: string; type: 'success' | 'warning' | 'info' | 'critical'; title: string; message: string}> = [];
    
    // Analyser les ratios et créer des notifications
    if (baseRatios.liqGen < 1.5) {
      newNotifications.push({
        id: 'liquidite-faible',
        type: 'critical',
        title: 'Liquidité faible',
        message: `Ratio de liquidité à ${baseRatios.liqGen.toFixed(2)}. Surveillez votre trésorerie quotidiennement.`
      });
    }
    
    if (baseRatios.marginPct < 10) {
      newNotifications.push({
        id: 'marge-faible',
        type: 'warning',
        title: 'Marge faible',
        message: `Marge nette à ${baseRatios.marginPct.toFixed(1)}%. Analysez votre rentabilité par produit.`
      });
    }
    
    if (alerts.length > 0) {
      alerts.slice(0, 2).forEach((alert, idx) => {
        newNotifications.push({
          id: `alert-${idx}`,
          type: 'info',
          title: 'Insight LIA',
          message: alert
        });
      });
    }
    
    // Notifications sur la trésorerie
    const cashRatio = (companyData.cashBalance || 0) / Math.max(1, companyData.revenueMonth || 1);
    if (cashRatio < 0.5) {
      newNotifications.push({
        id: 'tresorerie-faible',
        type: 'critical',
        title: 'Trésorerie à surveiller',
        message: `Votre trésorerie représente ${(cashRatio * 100).toFixed(0)}% de votre CA mensuel. Anticipez vos besoins.`
      });
    }
    
    // Notifications sur les déclarations fiscales
    const g50Due = new Date(complianceStatus.g50.nextDue);
    const daysUntilG50 = Math.ceil((g50Due.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilG50 <= 5 && daysUntilG50 > 0) {
      newNotifications.push({
        id: 'g50-proche',
        type: 'warning',
        title: 'Déclaration G50 proche',
        message: `Déclaration G50 à soumettre dans ${daysUntilG50} jour${daysUntilG50 > 1 ? 's' : ''}.`
      });
    }
    
    // Afficher les notifications avec un délai
    newNotifications.forEach((notif, idx) => {
      setTimeout(() => {
        setLiaNotifications(prev => [...prev, notif]);
      }, idx * 2000);
    });
  }, [companyData, baseRatios, advRatios, bm, complianceStatus]);

  const removeNotification = (id: string) => {
    setLiaNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Calcul du BFR
  const bfr = useMemo(() => {
    if (!companyData) return 0;
    const stocks = companyData.inventoryValue || 0;
    const creances = companyData.accountsReceivable || 0;
    const dettes = companyData.accountsPayable || 0;
    return stocks + creances - dettes;
  }, [companyData]);

  // Top clients (3-5 représentant 80% de l'activité)
  const topClients = useMemo(() => {
    const totalCA = companyData?.revenueTotal || 0;
    const caMensuel = companyData?.revenueMonth || 0;
    const nombreClients = companyData?.clientsCount || 5;
    
    // Simuler les top clients
    const clients = [];
    let cumulCA = 0;
    const targetCA = totalCA * 0.8;
    
    for (let i = 0; i < Math.min(5, nombreClients); i++) {
      const pourcentage = i === 0 ? 0.35 : i === 1 ? 0.25 : i === 2 ? 0.15 : i === 3 ? 0.10 : 0.05;
      const caClient = totalCA * pourcentage;
      cumulCA += caClient;
      
      if (cumulCA <= targetCA || i < 3) {
        clients.push({
          nom: `Client ${String.fromCharCode(65 + i)}`,
          ca: Math.round(caClient),
          pourcentage: pourcentage * 100,
          factures: Math.round((caClient / caMensuel) * 12),
          dso: Math.round(20 + Math.random() * 15),
          statut: i < 2 ? 'excellent' : 'bon'
        });
      }
    }
    
    return clients;
  }, [companyData]);

  // Rentabilité par produit/service
  const rentabiliteProduits = useMemo(() => {
    const caMensuel = companyData?.revenueMonth || 0;
    return [
      { produit: 'Produit A', ca: Math.round(caMensuel * 0.40), marge: 22.5, evolution: 8.2 },
      { produit: 'Produit B', ca: Math.round(caMensuel * 0.30), marge: 18.3, evolution: 5.1 },
      { produit: 'Service C', ca: Math.round(caMensuel * 0.20), marge: 35.0, evolution: 12.4 },
      { produit: 'Produit D', ca: Math.round(caMensuel * 0.10), marge: 15.2, evolution: -2.3 }
    ];
  }, [companyData]);

  // Prévision trésorerie 13 semaines
  const tresorerie13Semaines = useMemo(() => {
    if (!companyData) return [];
    const cash0 = companyData.cashBalance || 0;
    const revM = companyData.revenueMonth || 0;
    const expenses = revM * (1 - (companyData.profitMargin || 18) / 100);
    const ar = companyData.accountsReceivable || 0;
    const ap = companyData.accountsPayable || 0;
    
    return forecastCashFlow(cash0, revM, expenses, ar, ap, 13);
  }, [companyData]);

  // Charges déductibles et amortissements
  const chargesFiscales = useMemo(() => {
    const caMensuel = companyData?.revenueMonth || 0;
    return {
      chargesDeductibles: Math.round(caMensuel * 0.65),
      amortissements: Math.round(caMensuel * 0.08),
      chargesPersonnel: Math.round(caMensuel * 0.25),
      chargesExploitation: Math.round(caMensuel * 0.32)
    };
  }, [companyData]);

  // Mise à jour automatique
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleAlertClick = (alert: any) => {
    setSelectedAlert(alert);
    setShowAlertModal(true);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return ExclamationTriangleIcon;
      case 'warning': return ExclamationTriangleIcon;
      case 'success': return CheckCircleIcon;
      default: return BellIcon;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'overdue': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header avec contrôles en temps réel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tableau de Bord Financier
            </h1>
            <p className="text-gray-600 mb-1">
              Vue d'ensemble de votre activité
            </p>
            <p className="text-sm text-gray-500">
              Solution professionnelle adaptée aux micro-entreprise. Analysez vos performances financières en temps réel - Interface comptable professionnelle conforme aux normes comptable - Solution optimisée pour EURL
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <ClockIcon className="h-4 w-4 inline mr-1" />
              Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
            </div>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                autoRefresh 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <ArrowPathIcon className="h-4 w-4 inline mr-2" />
              Auto-refresh
            </button>
          </div>
        </div>
      </div>

      {/* KPIs Financiers en Temps Réel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card title="💰 Trésorerie">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatCurrency(financialMetrics.cashFlow)}
            </div>
            <div className="flex items-center justify-center text-sm">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+{financialMetrics.cashFlowChange}%</span>
            </div>
          </div>
        </Card>

        <Card title="📊 Ratio d'Endettement">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {(financialMetrics.debtRatio * 100).toFixed(1)}%
            </div>
            <div className="flex items-center justify-center text-sm">
              <ArrowTrendingDownIcon className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">{financialMetrics.debtRatioChange}%</span>
            </div>
          </div>
        </Card>

        <Card title="💧 Liquidité">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {financialMetrics.liquidityRatio.toFixed(1)}
            </div>
            <div className="flex items-center justify-center text-sm">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+{financialMetrics.liquidityRatioChange}%</span>
            </div>
          </div>
        </Card>

        <Card title="📈 Rentabilité">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {financialMetrics.profitability}%
            </div>
            <div className="flex items-center justify-center text-sm">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+{financialMetrics.profitabilityChange}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Ratios essentiels (aperçu rapide) */}
      <Card title="📐 Ratios Essentiels">
        {(() => {
          const { dso, dio, dpo, ccc, liqGen, marginPct } = baseRatios;
          return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
                <div className="text-xs text-gray-600 mb-1">DSO</div>
                <div className="text-2xl font-bold text-gray-900">{dso} j</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
                <div className="text-xs text-gray-600 mb-1">DIO</div>
                <div className="text-2xl font-bold text-gray-900">{dio} j</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
                <div className="text-xs text-gray-600 mb-1">DPO</div>
                <div className="text-2xl font-bold text-gray-900">{dpo} j</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
                <div className="text-xs text-gray-600 mb-1">CCC</div>
                <div className="text-2xl font-bold text-gray-900">{ccc} j</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
                <div className="text-xs text-gray-600 mb-1">Liq. générale</div>
                <div className="text-2xl font-bold text-gray-900">{liqGen.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
                <div className="text-xs text-gray-600 mb-1">Marge</div>
                <div className="text-2xl font-bold text-gray-900">{marginPct.toFixed(1)}%</div>
              </div>
            </div>
          );
        })()}
      </Card>

      {/* Ratios avancés */}
      <Card title="🧭 Ratios Avancés">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
            <div className="text-xs text-gray-600 mb-1">ROE</div>
            <div className="text-2xl font-bold text-gray-900">{advRatios.roePct}%</div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
            <div className="text-xs text-gray-600 mb-1">ROA</div>
            <div className="text-2xl font-bold text-gray-900">{advRatios.roaPct}%</div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
            <div className="text-xs text-gray-600 mb-1">EBITDA %</div>
            <div className="text-2xl font-bold text-gray-900">{advRatios.ebitdaMarginPct}%</div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
            <div className="text-xs text-gray-600 mb-1">Net Debt/EBITDA</div>
            <div className="text-2xl font-bold text-gray-900">{advRatios.netDebtToEbitda ?? '—'}</div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
            <div className="text-xs text-gray-600 mb-1">Couverture intérêts</div>
            <div className="text-2xl font-bold text-gray-900">{advRatios.interestCoverage ?? '—'}x</div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
            <div className="text-xs text-gray-600 mb-1">Autonomie financière</div>
            <div className="text-2xl font-bold text-gray-900">{advRatios.autonomyPct}%</div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
            <div className="text-xs text-gray-600 mb-1">Solvabilité A/D</div>
            <div className="text-2xl font-bold text-gray-900">{advRatios.solvencyAssetsToDebt ?? '—'}</div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
            <div className="text-xs text-gray-600 mb-1">Quick ratio</div>
            <div className="text-2xl font-bold text-gray-900">{baseRatios.liqQuick.toFixed(2)}</div>
          </div>
          {['saas','software'].includes(sector.toLowerCase()) && (
            <>
              <div className="p-4 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
                <div className="text-xs text-gray-600 mb-1">MRR</div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(advRatios.mrr || 0)}</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
                <div className="text-xs text-gray-600 mb-1">Churn</div>
                <div className="text-2xl font-bold text-gray-900">{(advRatios.churnPct || 0).toFixed(1)}%</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
                <div className="text-xs text-gray-600 mb-1">CAC</div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(advRatios.cac || 0)}</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
                <div className="text-xs text-gray-600 mb-1">LTV</div>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(advRatios.ltv || 0)}</div>
              </div>
            </>
          )}
          {['industrie','manufacturing'].includes(sector.toLowerCase()) && (
            <div className="p-4 bg-white rounded-lg border border-gray-200 text-center shadow-sm">
              <div className="text-xs text-gray-600 mb-1">OEE</div>
              <div className="text-2xl font-bold text-gray-900">{((advRatios as any).oee ?? 0).toFixed(2)}</div>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-3">{ratioNotes.join(' • ')}</div>
      </Card>

      {/* Notifications temporaires LIA - Insights LIA en bas à droite */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {liaNotifications.map(notif => (
          <TemporaryNotification
            key={notif.id}
            id={notif.id}
            type={notif.type}
            title={notif.title}
            message={notif.message}
            onClose={removeNotification}
          />
        ))}
      </div>

      {/* Vue d'Ensemble Consolidée - Santé Financière */}
      <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldCheckIcon className="h-7 w-7 text-blue-600" />
            Vue d'Ensemble - Santé Financière
          </h2>
          <div className={`px-4 py-2 rounded-full text-sm font-bold ${
            vueEnsemble.santeFinanciere.classement === 'excellent' ? 'bg-green-100 text-green-800' :
            vueEnsemble.santeFinanciere.classement === 'bon' ? 'bg-blue-100 text-blue-800' :
            vueEnsemble.santeFinanciere.classement === 'moyen' ? 'bg-yellow-100 text-yellow-800' :
            vueEnsemble.santeFinanciere.classement === 'faible' ? 'bg-orange-100 text-orange-800' :
            'bg-red-100 text-red-800'
          }`}>
            Score: {vueEnsemble.santeFinanciere.score.toFixed(0)}/100 - {vueEnsemble.santeFinanciere.classement}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 mb-1">Liquidité</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">{vueEnsemble.metriquesCles.liquidite.toFixed(0)}</span>
              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    vueEnsemble.metriquesCles.liquidite >= 70 ? 'bg-green-500' :
                    vueEnsemble.metriquesCles.liquidite >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${vueEnsemble.metriquesCles.liquidite}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 mb-1">Rentabilité</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">{vueEnsemble.metriquesCles.rentabilite.toFixed(0)}</span>
              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    vueEnsemble.metriquesCles.rentabilite >= 70 ? 'bg-green-500' :
                    vueEnsemble.metriquesCles.rentabilite >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${vueEnsemble.metriquesCles.rentabilite}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 mb-1">Solvabilité</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-purple-600">{vueEnsemble.metriquesCles.solvabilite.toFixed(0)}</span>
              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    vueEnsemble.metriquesCles.solvabilite >= 70 ? 'bg-green-500' :
                    vueEnsemble.metriquesCles.solvabilite >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${vueEnsemble.metriquesCles.solvabilite}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 mb-1">Efficacité</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-indigo-600">{vueEnsemble.metriquesCles.efficacite.toFixed(0)}</span>
              <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    vueEnsemble.metriquesCles.efficacite >= 70 ? 'bg-green-500' :
                    vueEnsemble.metriquesCles.efficacite >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${vueEnsemble.metriquesCles.efficacite}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Points Forts et Faibles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {vueEnsemble.santeFinanciere.pointsFort.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5" />
                Points Forts
              </h3>
              <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                {vueEnsemble.santeFinanciere.pointsFort.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}
          {vueEnsemble.santeFinanciere.pointsFaible.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-5 w-5" />
                Points à Améliorer
              </h3>
              <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                {vueEnsemble.santeFinanciere.pointsFaible.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Insights Prioritaires */}
        {insightsPriorises.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <SparklesIcon className="h-5 w-5 text-blue-600" />
              Insights & Recommandations Prioritaires
            </h3>
            <div className="space-y-3">
              {insightsPriorises.slice(0, 5).map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg border-2 ${
                    insight.priorite === 'critique' ? 'bg-red-50 border-red-300' :
                    insight.priorite === 'haute' ? 'bg-orange-50 border-orange-300' :
                    insight.type === 'opportunite' ? 'bg-green-50 border-green-300' :
                    'bg-blue-50 border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {insight.type === 'alerte' && <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />}
                      {insight.type === 'opportunite' && <StarIcon className="h-5 w-5 text-green-600" />}
                      {insight.type === 'recommandation' && <LightBulbIcon className="h-5 w-5 text-blue-600" />}
                      <h4 className="font-semibold text-slate-900">{insight.titre}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        insight.module === 'tresorerie' ? 'bg-blue-100 text-blue-800' :
                        insight.module === 'comptabilite' ? 'bg-purple-100 text-purple-800' :
                        insight.module === 'fiscalite' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {insight.module}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      insight.priorite === 'critique' ? 'bg-red-200 text-red-800' :
                      insight.priorite === 'haute' ? 'bg-orange-200 text-orange-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {insight.priorite}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">{insight.message}</p>
                  {insight.actions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs font-semibold text-slate-600 mb-1">Actions recommandées:</p>
                      <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                        {insight.actions.slice(0, 3).map((action, idx) => (
                          <li key={idx}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* KPIs Quotidiens */}
      <Card title="Indicateurs Clés Quotidiens">
        <p className="text-sm text-gray-600 mb-4">
          Suivez quotidiennement vos indicateurs clés de performance : chiffre d'affaires, trésorerie disponible, et créances clients
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-700 font-medium mb-1">Chiffre d'Affaires</div>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(companyData?.revenueMonth || 0)}</div>
            <div className="text-xs text-blue-600 mt-1">Ce mois</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="text-sm text-green-700 font-medium mb-1">Trésorerie Disponible</div>
            <div className="text-2xl font-bold text-green-900">{formatCurrency(companyData?.cashBalance || 0)}</div>
            <div className="text-xs text-green-600 mt-1">Solde actuel</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-700 font-medium mb-1">Créances Clients</div>
            <div className="text-2xl font-bold text-purple-900">{formatCurrency(companyData?.accountsReceivable || 0)}</div>
            <div className="text-xs text-purple-600 mt-1">À recouvrer</div>
          </div>
        </div>
      </Card>

      {/* Top Clients (3-5 représentant 80% de l'activité) */}
      <Card title="Top Clients - 80% de l'Activité">
        <p className="text-sm text-gray-600 mb-4">
          Le suivi de vos 3 à 5 clients principaux représentant 80% de votre activité
        </p>
        <div className="space-y-3">
          {topClients.map((client, idx) => (
            <div key={idx} className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{client.nom}</div>
                <div className="text-sm text-gray-600">{formatCurrency(client.ca)} ({client.pourcentage.toFixed(1)}% du CA)</div>
                <div className="text-xs text-gray-500 mt-1">{client.factures} factures/an • DSO: {client.dso}j</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                client.statut === 'excellent' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {client.statut === 'excellent' ? 'Excellent' : 'Bon'}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Déclarations Fiscales */}
      <Card title="Déclarations Fiscales">
        <p className="text-sm text-gray-600 mb-4">
          Suivez vos déclarations fiscales pour garantir la conformité et optimiser votre temps
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(complianceStatus).map(([key, status]: [string, any]) => (
            <div key={key} className={`p-4 rounded-lg border ${getComplianceColor(status.status)}`}>
              <div className="font-semibold mb-2">{key.toUpperCase()}</div>
              <div className="text-sm mb-2">Statut: {status.status}</div>
              <div className="text-xs mb-2">Prochaine échéance: {new Date(status.nextDue).toLocaleDateString('fr-FR')}</div>
              <ProgressBar value={status.progress} />
            </div>
          ))}
        </div>
      </Card>

      {/* Rentabilité Mensuelle par Produit/Service */}
      <Card title="Rentabilité Mensuelle par Produit/Service">
        <p className="text-sm text-gray-600 mb-4">
          Analysez votre rentabilité mensuelle par produit/service pour identifier les opportunités d'optimisation tarifaire
        </p>
        <div className="space-y-4">
          {rentabiliteProduits.map((prod, idx) => (
            <div key={idx} className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-gray-900">{prod.produit}</div>
                <div className={`text-sm font-medium ${prod.evolution >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {prod.evolution >= 0 ? '+' : ''}{prod.evolution.toFixed(1)}%
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <div className="text-xs text-gray-600">CA Mensuel</div>
                  <div className="text-lg font-bold text-gray-900">{formatCurrency(prod.ca)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600">Marge</div>
                  <div className="text-lg font-bold text-gray-900">{prod.marge.toFixed(1)}%</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${prod.marge}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* BFR - Besoin en Fonds de Roulement */}
      <Card title="Besoin en Fonds de Roulement (BFR)">
        <p className="text-sm text-gray-600 mb-4">
          Un suivi rigoureux de votre besoin en fonds de roulement (BFR) pour anticiper vos besoins de trésorerie
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
            <div className="text-sm text-orange-700 font-medium mb-1">BFR Actuel</div>
            <div className="text-2xl font-bold text-orange-900">{formatCurrency(bfr)}</div>
            <div className="text-xs text-orange-600 mt-1">Stocks + Créances - Dettes</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
            <div className="text-sm text-indigo-700 font-medium mb-1">Stocks</div>
            <div className="text-xl font-bold text-indigo-900">{formatCurrency(companyData?.inventoryValue || 0)}</div>
          </div>
          <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg border border-cyan-200">
            <div className="text-sm text-cyan-700 font-medium mb-1">Créances - Dettes</div>
            <div className="text-xl font-bold text-cyan-900">
              {formatCurrency((companyData?.accountsReceivable || 0) - (companyData?.accountsPayable || 0))}
            </div>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800">
            <strong>Formule BFR:</strong> Stocks + Créances Clients - Dettes Fournisseurs
          </div>
        </div>
      </Card>

      {/* Trésorerie Prévisionnelle 13 Semaines */}
      <Card title="Trésorerie Prévisionnelle - 13 Semaines">
        <p className="text-sm text-gray-600 mb-4">
          Un tableau de bord de trésorerie prévisionnel sur 13 semaines pour anticiper vos besoins financiers
        </p>
        {tresorerie13Semaines.length > 0 ? (
          <div className="space-y-4">
            <div className="h-64">
              <Line
                data={{
                  labels: tresorerie13Semaines.map(f => f.period),
                  datasets: [{
                    label: 'Trésorerie prévue',
                    data: tresorerie13Semaines.map(f => f.value),
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: true },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${formatCurrency(context.parsed.y !== null && context.parsed.y !== undefined ? context.parsed.y : 0)}`
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: false,
                      ticks: {
                        callback: (value) => formatCurrency(value as number)
                      }
                    }
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tresorerie13Semaines.slice(0, 4).map((forecast, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">{forecast.period}</div>
                  <div className="text-lg font-bold text-gray-900">{formatCurrency(forecast.value)}</div>
                  <div className={`text-xs mt-1 ${forecast.confidence === 'high' ? 'text-green-600' : forecast.confidence === 'medium' ? 'text-yellow-600' : 'text-orange-600'}`}>
                    {forecast.confidence === 'high' ? 'Haute' : forecast.confidence === 'medium' ? 'Moyenne' : 'Basse'} confiance
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-gray-600">Chargement des prévisions...</div>
        )}
      </Card>

      {/* Charges Déductibles et Amortissements */}
      <Card title="Fiscalité Légale - Charges Déductibles et Amortissements">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Charges Déductibles</div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(chargesFiscales.chargesDeductibles)}</div>
            <div className="text-xs text-gray-500 mt-1">Mensuel</div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Amortissements</div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(chargesFiscales.amortissements)}</div>
            <div className="text-xs text-gray-500 mt-1">Mensuel</div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Charges Personnel</div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(chargesFiscales.chargesPersonnel)}</div>
            <div className="text-xs text-gray-500 mt-1">Mensuel</div>
          </div>
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Charges Exploitation</div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(chargesFiscales.chargesExploitation)}</div>
            <div className="text-xs text-gray-500 mt-1">Mensuel</div>
          </div>
        </div>
      </Card>

      {/* Insights LIA (ancienne section - maintenant vide car remplacée par notifications) */}
      <div style={{ display: 'none' }}>
        {(() => {
          const alerts: string[] = generateRatioAlerts({ base: baseRatios as any, advanced: advRatios as any, bm });
          if (alerts.length === 0) return null;
          return (
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              {alerts.map((a: string, i: number) => (<li key={i}>{a}</li>))}
            </ul>
          );
        })()}
      </div>

      {/* Alertes et Notifications */}
      <Card title=" Alertes Financières Intelligentes">
          <div className="space-y-4">
          {alerts.map((alert) => {
            const AlertIcon = getAlertIcon(alert.type);
            return (
              <div
                key={alert.id}
                onClick={() => handleAlertClick(alert)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors hover:shadow-md ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <AlertIcon className="h-5 w-5 mt-0.5" />
                    <div>
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm opacity-90 mt-1">{alert.message}</p>
                    </div>
                  </div>
                  <div className="text-xs opacity-75">{alert.time}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Conformité Réglementaire Algérienne */}
      <Card title="⚖️ Conformité Réglementaire - Algérie">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(complianceStatus).map(([key, status]) => (
            <div key={key} className={`p-4 rounded-lg border ${getComplianceColor(status.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm uppercase">{key}</h4>
                <ShieldCheckIcon className="h-4 w-4" />
              </div>
              <div className="text-xs mb-2">
                Prochaine échéance: {status.nextDue}
              </div>
              <ProgressBar value={status.progress} color="current" />
              <div className="text-xs mt-1">{status.progress}% complété</div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowComplianceModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <EyeIcon className="h-4 w-4 inline mr-2" />
            Voir Détails
          </button>
        </div>
      </Card>

      {/* Section Comptable SCF/IFRS */}
      <Card title="📚 Indicateurs Comptables">
        <div className="space-y-6">
          {/* En-tête avec norme comptable */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Norme Comptable Active
                </h3>
                <p className="text-gray-600 text-sm">
                  <BookOpenIcon className="h-4 w-4 inline mr-2" />
                  {normesComptables[planComptable].nom}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {normesComptables[planComptable].emoji} {normesComptables[planComptable].code}
                </span>
              </div>
            </div>
          </div>

          {/* KPI Comptables */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Écritures Comptables */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-xs text-gray-500">Écritures</span>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">
                  {kpiComptables.ecrituresComptables.total}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 font-medium">
                    {kpiComptables.ecrituresComptables.validees} validées
                  </span>
                  <span className="text-gray-500">
                    {kpiComptables.ecrituresComptables.enAttente} en attente
                  </span>
                </div>
                <ProgressBar
                  value={(kpiComptables.ecrituresComptables.validees / kpiComptables.ecrituresComptables.total) * 100}
                  color="blue"
                  height="sm"
                />
                <p className="text-xs text-green-600">
                  +{kpiComptables.ecrituresComptables.evolution}% vs mois dernier
                </p>
              </div>
            </div>

            {/* TVA */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DocumentCheckIcon className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-xs text-gray-500">TVA</span>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(kpiComptables.tva.aVerser)}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-600 font-medium">
                    Collectée: {formatCurrency(kpiComptables.tva.collectee)}
                  </span>
                  <span className="text-gray-500">
                    Déductible: {formatCurrency(kpiComptables.tva.deductible)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Taux: {kpiComptables.tva.taux}%
                </p>
                <p className="text-xs text-gray-500">
                  {normesComptables[planComptable].comptes.tva}
                </p>
              </div>
            </div>

            {/* Bilan */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ScaleIcon className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-xs text-gray-500">Bilan</span>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(kpiComptables.bilans.actif)}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 font-medium">
                    Actif: {formatCurrency(kpiComptables.bilans.actif)}
                  </span>
                  <span className="text-gray-500">
                    Passif: {formatCurrency(kpiComptables.bilans.passif)}
                  </span>
                </div>
                <p className="text-xs text-blue-600">
                  Capitaux propres: {formatCurrency(kpiComptables.bilans.capitauxPropres)}
                </p>
                <p className="text-xs text-gray-500">
                  Dernier bilan: {kpiComptables.bilans.dateDernier}
                </p>
              </div>
            </div>

            {/* Journaux */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <DocumentTextIcon className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-xs text-gray-500">Journaux</span>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">
                  {kpiComptables.journaux.length}
                </p>
                <div className="space-y-1">
                  {kpiComptables.journaux.slice(0, 2).map((journal, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{journal.nom}</span>
                      <span className={`px-1 py-0.5 rounded text-xs ${
                        journal.statut === 'Validé' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {journal.statut}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {kpiComptables.journaux.reduce((acc, journal) => acc + journal.nombre, 0)} écritures total
                </p>
              </div>
            </div>
          </div>

          {/* Codes Comptables Principaux */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4">Codes Comptables Principaux</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900 text-sm">Ventes</h5>
                <div className="space-y-1">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <span className="text-gray-600">Ventes de biens</span>
                    <span className="font-mono text-gray-500">{normesComptables[planComptable].comptes.ventes}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <span className="text-gray-600">Produits finis</span>
                    <span className="font-mono text-gray-500">{normesComptables[planComptable].comptes.produits}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900 text-sm">Gestion</h5>
                <div className="space-y-1">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <span className="text-gray-600">TVA Collectée</span>
                    <span className="font-mono text-gray-500">{normesComptables[planComptable].comptes.tva}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <span className="text-gray-600">Clients</span>
                    <span className="font-mono text-gray-500">{normesComptables[planComptable].comptes.clients}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900 text-sm">Trésorerie</h5>
                <div className="space-y-1">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <span className="text-gray-600">Banque</span>
                    <span className="font-mono text-gray-500">{normesComptables[planComptable].comptes.banque}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <span className="text-gray-600">Caisse</span>
                    <span className="font-mono text-gray-500">{normesComptables[planComptable].comptes.caisse}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Comptables */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button className="flex items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
              <DocumentCheckIcon className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-blue-700 text-sm font-medium">Écritures</span>
            </button>
            <button className="flex items-center justify-center p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
              <CalculatorIcon className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-green-700 text-sm font-medium">Calcul TVA</span>
            </button>
            <button className="flex items-center justify-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
              <BookOpenIcon className="h-4 w-4 text-purple-600 mr-2" />
              <span className="text-purple-700 text-sm font-medium">Plan Comptable</span>
            </button>
            <button className="flex items-center justify-center p-3 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors">
              <ScaleIcon className="h-4 w-4 text-orange-600 mr-2" />
              <span className="text-orange-700 text-sm font-medium">Bilans</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Prévisions et Planification */}
      <Card title="🔮 Prévisions Financières Intelligentes">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">📅 Mois Prochain</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Revenus:</span>
                <span className="font-medium">{formatCurrency(forecasts.nextMonth.revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span>Dépenses:</span>
                <span className="font-medium">{formatCurrency(forecasts.nextMonth.expenses)}</span>
              </div>
              <div className="flex justify-between font-bold text-blue-600">
                <span>Bénéfice:</span>
                <span>{formatCurrency(forecasts.nextMonth.profit)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-3">📊 Trimestre Prochain</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Revenus:</span>
                <span className="font-medium">{formatCurrency(forecasts.nextQuarter.revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span>Dépenses:</span>
                <span className="font-medium">{formatCurrency(forecasts.nextQuarter.expenses)}</span>
              </div>
              <div className="flex justify-between font-bold text-green-600">
                <span>Bénéfice:</span>
                <span>{formatCurrency(forecasts.nextQuarter.profit)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-3">🎯 Année Prochaine</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Revenus:</span>
                <span className="font-medium">{formatCurrency(forecasts.nextYear.revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span>Dépenses:</span>
                <span className="font-medium">{formatCurrency(forecasts.nextYear.expenses)}</span>
              </div>
              <div className="flex justify-between font-bold text-purple-600">
                <span>Bénéfice:</span>
                <span>{formatCurrency(forecasts.nextYear.profit)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowForecastModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <CalculatorIcon className="h-4 w-4 inline mr-2" />
            Modifier Prévisions
          </button>
        </div>
      </Card>

      {/* Tableau de Bord Financier Complet */}
      <Card title="📊 Tableau de Bord Financier Complet">
        <FinancialDashboard />
      </Card>

      {/* Actions Rapides */}
      <div className="flex flex-wrap justify-center gap-4">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          Exporter Rapport
        </button>
        <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center">
          <ShareIcon className="h-5 w-5 mr-2" />
          Partager
        </button>
        <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center">
          <ArrowPathIcon className="h-5 w-5 mr-2" />
          Actualiser
        </button>
        <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center">
          <CogIcon className="h-5 w-5 mr-2" />
          Paramètres
        </button>
      </div>

      {/* Modal Détails d'Alerte */}
      <Modal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title="🚨 Détails de l'Alerte"
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${getAlertColor(selectedAlert.type)}`}>
              <h3 className="font-semibold mb-2">{selectedAlert.title}</h3>
              <p className="text-sm mb-3">{selectedAlert.message}</p>
              <div className="text-xs opacity-75">
                Priorité: {selectedAlert.priority} • {selectedAlert.time}
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Actions Recommandées:</h4>
              <ul className="text-sm space-y-2 text-gray-600">
                <li>• Vérifier les données financières récentes</li>
                <li>• Consulter l'équipe comptable</li>
                <li>• Mettre à jour les prévisions si nécessaire</li>
              </ul>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAlertModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Fermer
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Marquer comme Lu
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Conformité */}
      <Modal
        isOpen={showComplianceModal}
        onClose={() => setShowComplianceModal(false)}
        title="⚖️ Détails de Conformité Réglementaire"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(complianceStatus).map(([key, status]) => (
              <div key={key} className={`p-4 rounded-lg border ${getComplianceColor(status.status)}`}>
                <h4 className="font-semibold mb-3 uppercase">{key}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Statut:</span>
                    <span className="font-medium capitalize">{status.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prochaine échéance:</span>
                    <span className="font-medium">{status.nextDue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Progression:</span>
                    <span className="font-medium">{status.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">📋 Prochaines Actions</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Soumettre la déclaration G50 avant le 12 janvier 2025</li>
              <li>• Préparer la déclaration IBS pour mars 2025</li>
              <li>• Vérifier les cotisations CNSS pour janvier 2025</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Modal Prévisions */}
      <Modal
        isOpen={showForecastModal}
        onClose={() => setShowForecastModal(false)}
        title="🔮 Modifier les Prévisions Financières"
      >
        <div className="space-y-6">
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              ⚠️ Les prévisions sont basées sur l'analyse des tendances historiques et des facteurs économiques algériens.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium">Ajuster les Paramètres de Prévision:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="forecast-growth" className="block text-sm font-medium text-gray-700 mb-2">Taux de Croissance (%)</label>
                <input
                  id="forecast-growth"
                  name="forecast-growth"
                  type="number"
                  defaultValue="8.5"
                  title="Taux de croissance prévisionnel en pourcentage"
                  placeholder="Ex: 8.5"
                  aria-label="Taux de croissance prévisionnel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="forecast-inflation" className="block text-sm font-medium text-gray-700 mb-2">Inflation Algérienne (%)</label>
                <input
                  id="forecast-inflation"
                  name="forecast-inflation"
                  type="number"
                  defaultValue="4.2"
                  title="Inflation Algérienne estimée en pourcentage"
                  placeholder="Ex: 4.2"
                  aria-label="Inflation Algérienne estimée"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowForecastModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Sauvegarder
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TableauBordFinancier;
