import React, { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  ChartBarIcon, 
  PrinterIcon, 
  ArrowDownTrayIcon,
  CalendarIcon,
  EyeIcon,
  CogIcon,
  DocumentArrowDownIcon,
  BanknotesIcon,
  CalculatorIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartPieIcon,
  TableCellsIcon,
  DocumentChartBarIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Modal from '../../components/UI/Modal';
import { useApp } from '../../context/AppContext';
import BilanComptableWidget from '../../components/Charts/BilanComptableWidget';
import CompteResultatWidget from '../../components/Charts/CompteResultatWidget';
import TresorerieWidget from '../../components/Charts/TresorerieWidget';
import RatiosFinanciersWidget from '../../components/Charts/RatiosFinanciersWidget';
import GrandLivreWidget from '../../components/Charts/GrandLivreWidget';
// import BalanceComptableWidget from '../../components/Charts/BalanceComptableWidget'; // Component does not exist
import TendancesFinancieresChart from '../../components/Charts/TendancesFinancieresChart';
import RepartitionSectorielleChart from '../../components/Charts/RepartitionSectorielleChart';
// import ComparaisonTemporelleChart from '../../components/Charts/ComparaisonTemporelleChart'; // Component does not exist

const RapportsComptables: React.FC = () => {
  const { formatCurrency } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('2024');
  const [selectedReport, setSelectedReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isViewReportModalOpen, setIsViewReportModalOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Données de démonstration pour les rapports
  const reportTypes = [
    {
      id: 'bilan',
      name: 'Bilan Comptable',
      description: 'Situation patrimoniale de l\'entreprise',
      icon: BuildingOfficeIcon,
      category: 'États Financiers',
      frequency: 'Annuel',
      complexity: 'Élevée',
      lastGenerated: '2024-01-15',
      status: 'Disponible'
    },
    {
      id: 'compte-resultat',
      name: 'Compte de Résultat',
      description: 'Résultat d\'exploitation et financier',
      icon: ChartBarIcon,
      category: 'États Financiers',
      frequency: 'Mensuel',
      complexity: 'Moyenne',
      lastGenerated: '2024-01-20',
      status: 'Disponible'
    },
    {
      id: 'flux-tresorerie',
      name: 'Tableau de Flux de Trésorerie',
      description: 'Mouvements de liquidités',
      icon: BanknotesIcon,
      category: 'États Financiers',
      frequency: 'Trimestriel',
      complexity: 'Élevée',
      lastGenerated: '2024-01-10',
      status: 'Disponible'
    },
    {
      id: 'grand-livre',
      name: 'Grand Livre',
      description: 'Toutes les écritures comptables',
      icon: BookOpenIcon,
      category: 'Comptabilité',
      frequency: 'Mensuel',
      complexity: 'Faible',
      lastGenerated: '2024-01-25',
      status: 'Disponible'
    },
    {
      id: 'balance',
      name: 'Balance Comptable',
      description: 'Soldes des comptes par période',
      icon: CalculatorIcon,
      category: 'Comptabilité',
      frequency: 'Mensuel',
      complexity: 'Faible',
      lastGenerated: '2024-01-25',
      status: 'Disponible'
    },
    {
      id: 'journal',
      name: 'Journal Général',
      description: 'Chronologie des écritures',
      icon: ClockIcon,
      category: 'Comptabilité',
      frequency: 'Mensuel',
      complexity: 'Faible',
      lastGenerated: '2024-01-25',
      status: 'Disponible'
    },
    {
      id: 'tva',
      name: 'Déclaration TVA',
      description: 'Calcul et déclaration de la TVA',
      icon: DocumentArrowDownIcon,
      category: 'Fiscal',
      frequency: 'Mensuel',
      complexity: 'Moyenne',
      lastGenerated: '2024-01-30',
      status: 'En attente'
    },
    {
      id: 'tresorerie',
      name: 'Rapport de Trésorerie',
      description: 'Position de liquidité détaillée',
      icon: BanknotesIcon,
      category: 'Trésorerie',
      frequency: 'Hebdomadaire',
      complexity: 'Moyenne',
      lastGenerated: '2024-01-28',
      status: 'Disponible'
    },
    {
      id: 'clients',
      name: 'Rapport Clients',
      description: 'Analyse des comptes clients',
      icon: UserGroupIcon,
      category: 'Commercial',
      frequency: 'Mensuel',
      complexity: 'Moyenne',
      lastGenerated: '2024-01-22',
      status: 'Disponible'
    },
    {
      id: 'fournisseurs',
      name: 'Rapport Fournisseurs',
      description: 'Analyse des comptes fournisseurs',
      icon: BuildingOfficeIcon,
      category: 'Commercial',
      frequency: 'Mensuel',
      complexity: 'Moyenne',
      lastGenerated: '2024-01-22',
      status: 'Disponible'
    },
    {
      id: 'ratios',
      name: 'Ratios Financiers',
      description: 'Analyse des ratios de performance',
      icon: CalculatorIcon,
      category: 'Analytique',
      frequency: 'Mensuel',
      complexity: 'Élevée',
      lastGenerated: '2024-01-28',
      status: 'Disponible'
    },
    {
      id: 'tendances',
      name: 'Tendances Financières',
      description: 'Graphiques d\'évolution des indicateurs',
      icon: ChartBarIcon,
      category: 'Analytique',
      frequency: 'Mensuel',
      complexity: 'Moyenne',
      lastGenerated: '2024-01-29',
      status: 'Disponible'
    },
    {
      id: 'sectorielle',
      name: 'Analyse Sectorielle',
      description: 'Répartition par secteur d\'activité',
      icon: ChartPieIcon,
      category: 'Analytique',
      frequency: 'Trimestriel',
      complexity: 'Moyenne',
      lastGenerated: '2024-01-25',
      status: 'Disponible'
    },
    {
      id: 'temporelle',
      name: 'Comparaison Temporelle',
      description: 'Analyse comparative dans le temps',
      icon: CalendarIcon,
      category: 'Analytique',
      frequency: 'Mensuel',
      complexity: 'Moyenne',
      lastGenerated: '2024-01-30',
      status: 'Disponible'
    }
  ];

  const reportCategories = [
    { name: 'États Financiers', count: 3, color: 'bg-blue-100 text-blue-800' },
    { name: 'Comptabilité', count: 3, color: 'bg-green-100 text-green-800' },
    { name: 'Fiscal', count: 1, color: 'bg-red-100 text-red-800' },
    { name: 'Trésorerie', count: 1, color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Commercial', count: 2, color: 'bg-purple-100 text-purple-800' },
    { name: 'Analytique', count: 4, color: 'bg-indigo-100 text-indigo-800' }
  ];

  const recentReports = [
    {
      id: 1,
      name: 'Bilan Comptable 2023',
      type: 'Bilan Comptable',
      generatedAt: '2024-01-15T10:30:00',
      status: 'Complété',
      size: '2.4 MB',
      format: 'PDF'
    },
    {
      id: 2,
      name: 'Compte de Résultat Janvier 2024',
      type: 'Compte de Résultat',
      generatedAt: '2024-01-20T14:15:00',
      status: 'Complété',
      size: '1.8 MB',
      format: 'PDF'
    },
    {
      id: 3,
      name: 'Grand Livre Décembre 2023',
      type: 'Grand Livre',
      generatedAt: '2024-01-25T09:45:00',
      status: 'Complété',
      size: '5.2 MB',
      format: 'Excel'
    },
    {
      id: 4,
      name: 'Déclaration TVA Janvier 2024',
      type: 'Déclaration TVA',
      generatedAt: '2024-01-30T16:20:00',
      status: 'En cours',
      size: '0.8 MB',
      format: 'PDF'
    }
  ];

  const reportStats = {
    totalReports: 156,
    generatedThisMonth: 23,
    pendingReports: 3,
    averageGenerationTime: '2.3 min'
  };

  // Données de démonstration pour le bilan comptable
  const bilanData = {
    actif: {
      immobilisations: {
        immobilisations_incorporelles: 125000,
        immobilisations_corporelles: 450000,
        immobilisations_financieres: 75000
      },
      stocks: {
        stocks_marchandises: 180000,
        stocks_produits_finis: 95000,
        stocks_matieres_premieres: 45000
      },
      creances: {
        clients: 220000,
        etat: 15000,
        autres_creances: 25000
      },
      disponibilites: {
        banque: 185000,
        caisse: 5000
      }
    },
    passif: {
      capitaux_propres: {
        capital_social: 500000,
        reserves: 125000,
        resultat_net: 85000
      },
      dettes: {
        dettes_fournisseurs: 95000,
        dettes_fiscales: 25000,
        dettes_sociales: 15000,
        autres_dettes: 20000
      }
    }
  };

  const compteResultatData = {
    chiffre_affaires: 1250000,
    achats: -450000,
    charges_personnel: -280000,
    charges_exploitation: -120000,
    dotations_amortissements: -35000,
    resultat_exploitation: 365000,
    resultat_financier: 15000,
    resultat_exceptionnel: -5000,
    impot_societes: -93750,
    resultat_net: 281250
  };

  // Données pour les widgets enrichis
  const tresorerieData = {
    solde_initial: 150000,
    encaissements: {
      ventes: 800000,
      creances_recouvrees: 120000,
      autres_encaissements: 30000
    },
    decaissements: {
      achats: 450000,
      charges_personnel: 280000,
      charges_exploitation: 120000,
      investissements: 50000,
      autres_decaissements: 25000
    },
    solde_final: 185000
  };

  const ratiosFinanciersData = {
    ratio_liquidite_generale: 1.8,
    ratio_liquidite_reduite: 1.2,
    ratio_liquidite_immediate: 0.4,
    ratio_endettement: 0.35,
    ratio_autonomie: 0.65,
    ratio_couverture_dettes: 4.2,
    marge_brute: 32.5,
    marge_exploitation: 12.8,
    marge_nette: 8.2,
    roe: 18.5,
    roa: 12.3,
    rotation_stocks: 5.8,
    delai_paiement_clients: 35,
    delai_paiement_fournisseurs: 45,
    croissance_ca: 12.5,
    croissance_resultat: 15.8,
    croissance_effectif: 8.2
  };

  const grandLivreData = [
    {
      id: '1',
      date: '2024-01-15',
      numero: 'FAC001',
      compte: '411000',
      libelle: 'Vente de marchandises',
      debit: 0,
      credit: 50000,
      solde: -50000,
      piece: 'FAC001',
      journal: 'VT'
    },
    {
      id: '2',
      date: '2024-01-15',
      numero: 'FAC001',
      compte: '701000',
      libelle: 'Vente de marchandises',
      debit: 50000,
      credit: 0,
      solde: 50000,
      piece: 'FAC001',
      journal: 'VT'
    },
    {
      id: '3',
      date: '2024-01-16',
      numero: 'ACH001',
      compte: '401000',
      libelle: 'Achat de matières premières',
      debit: 25000,
      credit: 0,
      solde: 25000,
      piece: 'ACH001',
      journal: 'ACH'
    },
    {
      id: '4',
      date: '2024-01-16',
      numero: 'ACH001',
      compte: '601000',
      libelle: 'Achat de matières premières',
      debit: 0,
      credit: 25000,
      solde: -25000,
      piece: 'ACH001',
      journal: 'ACH'
    }
  ];

  const balanceComptableData = [
    {
      compte: '411000',
      libelle: 'Clients',
      solde_debut: 120000,
      debit: 0,
      credit: 50000,
      solde_fin: 170000,
      type: 'actif' as const,
      classe: 'Créances'
    },
    {
      compte: '401000',
      libelle: 'Fournisseurs',
      solde_debut: 80000,
      debit: 25000,
      credit: 0,
      solde_fin: 55000,
      type: 'passif' as const,
      classe: 'Dettes'
    },
    {
      compte: '601000',
      libelle: 'Achats',
      solde_debut: 0,
      debit: 0,
      credit: 25000,
      solde_fin: -25000,
      type: 'charge' as const,
      classe: 'Charges d\'exploitation'
    },
    {
      compte: '701000',
      libelle: 'Ventes',
      solde_debut: 0,
      debit: 50000,
      credit: 0,
      solde_fin: 50000,
      type: 'produit' as const,
      classe: 'Produits d\'exploitation'
    }
  ];

  const handleGenerateReport = async (reportType: string) => {
    setIsGenerating(true);
    setSelectedReport(reportType);
    
    // Simulation de génération de rapport
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const reportData = {
      type: reportType,
      period: selectedPeriod,
      generatedAt: new Date().toISOString(),
      data: reportType === 'bilan' ? bilanData : 
            reportType === 'compte-resultat' ? compteResultatData : 
            { message: 'Données de démonstration' }
    };
    
    setGeneratedReport(reportData);
    setIsGenerating(false);
    setIsReportModalOpen(true);
  };

  const handleExportReport = (format: string) => {
    alert(`Export du rapport en format ${format} en cours...`);
  };

  const handleExportAll = () => {
    alert('Export de tous les rapports en cours... Cette action va télécharger tous les rapports disponibles.');
  };

  const handleViewReport = (reportId: number) => {
    const report = recentReports.find(r => r.id === reportId);
    if (report) {
      setViewingReport(report);
      setIsViewReportModalOpen(true);
    }
  };

  const handleDownloadReport = (reportId: number) => {
    const report = recentReports.find(r => r.id === reportId);
    if (report) {
      try {
        // Créer un contenu de rapport simulé
        const reportContent = `
RAPPORT: ${report.name}
Type: ${report.type}
Généré le: ${new Date(report.generatedAt).toLocaleString('fr-FR')}
Statut: ${report.status}
Taille: ${report.size}
Format: ${report.format}

---
Ceci est un rapport de démonstration.
Dans une application réelle, ce fichier contiendrait les données complètes du rapport.
        `.trim();

        // Créer un blob selon le format
        const mimeType = report.format === 'PDF' 
          ? 'application/pdf' 
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        
        const blob = new Blob([reportContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.name.replace(/\s+/g, '_')}.${report.format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        alert('Erreur lors du téléchargement du rapport');
      }
    }
  };

  const handlePrintReport = (reportId: number) => {
    const report = recentReports.find(r => r.id === reportId);
    if (report) {
      // Ouvrir le rapport dans une modal pour impression
      setViewingReport(report);
      setIsViewReportModalOpen(true);
      // Attendre que la modal soit ouverte puis imprimer
      setTimeout(() => {
        window.print();
      }, 500);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Disponible': return 'text-green-600 bg-green-100';
      case 'En cours': return 'text-yellow-600 bg-yellow-100';
      case 'En attente': return 'text-orange-600 bg-orange-100';
      case 'Complété': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Faible': return 'text-green-600 bg-green-100';
      case 'Moyenne': return 'text-yellow-600 bg-yellow-100';
      case 'Élevée': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête - Palette Slate Professionnelle Améliorée */}
      <div className="relative bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm overflow-hidden">
        {/* Effet de fond décoratif */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-slate-300/10 to-transparent dark:from-slate-600/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-slate-300/10 to-transparent dark:from-slate-600/10 rounded-full blur-3xl -ml-36 -mb-36"></div>
        
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-start space-x-5">
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 p-4 rounded-2xl shadow-lg">
              <DocumentTextIcon className="h-9 w-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Rapports Comptables
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-base">
                Génération et gestion des rapports comptables conformes SCF/IFRS
              </p>
            </div>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-6 py-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Horodatage
            </div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {currentTime.toLocaleString('fr-FR')}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Période
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {selectedPeriod}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques rapides - Enrichies avec palette Slate */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-5 rounded-xl border border-blue-200 dark:border-blue-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-400/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
              <CheckCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{reportStats.totalReports}</div>
            <div className="text-sm text-blue-700 dark:text-blue-300 font-medium mt-1">Total Rapports</div>
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              <span className="font-semibold">14 types</span> disponibles
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-5 rounded-xl border border-emerald-200 dark:border-emerald-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-400/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-emerald-600 dark:bg-emerald-500 p-2 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
              <ArrowPathIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
            <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{reportStats.generatedThisMonth}</div>
            <div className="text-sm text-emerald-700 dark:text-emerald-300 font-medium mt-1">Générés ce Mois</div>
            <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
              <span className="font-semibold">+18%</span> vs mois dernier
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-5 rounded-xl border border-amber-200 dark:border-amber-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-400/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-amber-600 dark:bg-amber-500 p-2 rounded-lg">
                <ClockIcon className="h-6 w-6 text-white" />
            </div>
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
            <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">{reportStats.pendingReports}</div>
            <div className="text-sm text-amber-700 dark:text-amber-300 font-medium mt-1">En Attente</div>
            <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
              <span className="font-semibold">À générer</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20 p-5 rounded-xl border border-violet-200 dark:border-violet-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-violet-400/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-violet-600 dark:bg-violet-500 p-2 rounded-lg">
                <ClockIcon className="h-6 w-6 text-white" />
            </div>
              <CheckCircleIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
            <div className="text-3xl font-bold text-violet-900 dark:text-violet-100">{reportStats.averageGenerationTime}</div>
            <div className="text-sm text-violet-700 dark:text-violet-300 font-medium mt-1">Temps Moyen</div>
            <div className="mt-2 text-xs text-violet-600 dark:text-violet-400">
              <span className="font-semibold">Très rapide</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et contrôles - Palette Slate */}
      <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg px-4 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-slate-500"
            >
              <option value="2024">Exercice 2024</option>
              <option value="2023">Exercice 2023</option>
              <option value="2022">Exercice 2022</option>
            </select>
          </div>
          
          <div className="flex gap-2">
          <button
            onClick={() => setIsConfigModalOpen(true)}
              className="flex items-center px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            <CogIcon className="h-5 w-5 mr-2" />
            Configuration
          </button>
            <button
              onClick={handleExportAll}
              className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-colors shadow-sm"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Exporter Tout
            </button>
          </div>
        </div>
      </Card>

      {/* Catégories de rapports - Palette Slate Enrichie */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mr-3">
              <ChartPieIcon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                </div>
            Catégories de Rapports
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">6 catégories</span>
              </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {reportCategories.map((category, index) => {
            const colors = [
              { bg: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20', border: 'border-blue-200 dark:border-blue-700', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-blue-600' },
              { bg: 'from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20', border: 'border-emerald-200 dark:border-emerald-700', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-600' },
              { bg: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20', border: 'border-red-200 dark:border-red-700', text: 'text-red-700 dark:text-red-300', badge: 'bg-red-600' },
              { bg: 'from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20', border: 'border-amber-200 dark:border-amber-700', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-600' },
              { bg: 'from-violet-50 to-violet-100 dark:from-violet-900/20 dark:to-violet-800/20', border: 'border-violet-200 dark:border-violet-700', text: 'text-violet-700 dark:text-violet-300', badge: 'bg-violet-600' },
              { bg: 'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20', border: 'border-indigo-200 dark:border-indigo-700', text: 'text-indigo-700 dark:text-indigo-300', badge: 'bg-indigo-600' }
            ];
            const color = colors[index];
            return (
              <div key={category.name} className={`bg-gradient-to-br ${color.bg} p-5 rounded-xl border ${color.border} hover:shadow-lg transition-all cursor-pointer relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                <div className="relative text-center">
                  <div className={`${color.badge} w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center`}>
                    <span className="text-white font-bold text-lg">{category.count}</span>
                  </div>
                  <p className={`text-xs font-semibold ${color.text} mb-1`}>{category.name}</p>
                  <p className={`text-[10px] ${color.text} opacity-75`}>rapports</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Graphiques Enrichis - Palette Slate Professionnelle */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mr-3">
              <ChartBarIcon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            </div>
            Analyses Graphiques Avancées
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">Période: {selectedPeriod}</span>
        </div>
        <div className="space-y-6">
          {/* Tendances Financières */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded mr-2">
                    <ChartBarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  Tendances Financières
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">Vue sur 6 mois</span>
              </div>
            </div>
            <div className="p-6">
              <TendancesFinancieresChart period={selectedPeriod} />
            </div>
          </div>
          
          {/* Répartition Sectorielle */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 rounded mr-2">
                    <ChartPieIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Répartition Sectorielle
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">Par secteur d'activité</span>
              </div>
            </div>
            <div className="p-6">
              <RepartitionSectorielleChart period={selectedPeriod} />
            </div>
          </div>
          
          {/* Comparaison Temporelle */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                  <div className="bg-violet-100 dark:bg-violet-900/30 p-1.5 rounded mr-2">
                    <CalendarIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  Comparaison Temporelle
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">Années comparées</span>
              </div>
            </div>
            <div className="p-6">
              {/* <ComparaisonTemporelleChart period={selectedPeriod} /> */}
              <p className="text-slate-500">Comparaison temporelle à charger via API</p>
            </div>
          </div>
        </div>
      </div>

      {/* Types de rapports - Design Enrichi Palette Slate */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mr-3">
              <DocumentTextIcon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            </div>
            Types de Rapports Disponibles
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">{reportTypes.length} rapports</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map((report) => {
            const IconComponent = report.icon;
            return (
              <Card key={report.id} className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:border-slate-400 dark:hover:border-slate-500 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg flex-shrink-0">
                      <IconComponent className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 truncate">{report.name}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{report.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                    report.status === 'Disponible' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' :
                    report.status === 'En attente' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700' :
                    'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                  } flex-shrink-0 ml-2`}>
                    {report.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Catégorie:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{report.category}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Fréquence:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{report.frequency}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Complexité:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      report.complexity === 'Faible' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                      report.complexity === 'Moyenne' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {report.complexity}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Dernière génération:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{report.lastGenerated}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={isGenerating}
                    className="flex-1 flex items-center justify-center px-4 py-2.5 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    {isGenerating && selectedReport === report.id ? (
                      <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                    )}
                    {isGenerating && selectedReport === report.id ? 'Génération...' : 'Générer'}
                  </button>
                  
                  <button
                    onClick={() => handleExportReport('PDF')}
                    className="px-3 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    title="Imprimer"
                  >
                    <PrinterIcon className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Rapports récents - Palette Slate Professionnelle */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mr-3">
              <ClockIcon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            </div>
            Rapports Récents
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">{recentReports.length} rapports</span>
        </div>
        <Card className="overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Nom du Rapport
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Généré le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Taille
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {recentReports.map((report, index) => (
                  <tr key={report.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                          <DocumentTextIcon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                        </div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{report.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400">{report.type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(report.generatedAt).toLocaleString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                        report.status === 'Complété' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700' :
                        'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          report.format === 'PDF' ? 'bg-red-500' : 'bg-emerald-500'
                        }`}></div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{report.size}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewReport(report.id)}
                          className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" 
                          title="Voir"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDownloadReport(report.id)}
                          className="p-2 text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors" 
                          title="Télécharger"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handlePrintReport(report.id)}
                          className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" 
                          title="Imprimer"
                        >
                          <PrinterIcon className="h-4 w-4" />
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

      {/* Modal de rapport généré */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title={`Rapport ${selectedReport} - ${selectedPeriod}`}
        size="lg"
      >
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Rapport généré avec succès !
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Le rapport a été généré le {new Date().toLocaleString('fr-FR')}
                </p>
              </div>
            </div>
          </div>

          {selectedReport === 'bilan' && (
            <div className="space-y-6">
              <BilanComptableWidget data={bilanData} period={selectedPeriod} />
            </div>
          )}

          {selectedReport === 'compte-resultat' && (
            <div className="space-y-6">
              <CompteResultatWidget data={compteResultatData} period={selectedPeriod} />
                </div>
          )}

          {selectedReport === 'flux-tresorerie' && (
            <div className="space-y-6">
              <TresorerieWidget data={tresorerieData} period={selectedPeriod} />
                </div>
          )}

          {selectedReport === 'ratios' && (
            <div className="space-y-6">
              <RatiosFinanciersWidget data={ratiosFinanciersData} period={selectedPeriod} />
                </div>
          )}

          {selectedReport === 'grand-livre' && (
            <div className="space-y-6">
              <GrandLivreWidget data={grandLivreData} period={selectedPeriod} />
                </div>
          )}

          {selectedReport === 'balance' && (
            <div className="space-y-6">
              <BalanceComptableWidget data={balanceComptableData} period={selectedPeriod} />
                </div>
          )}

          {selectedReport === 'tendances' && (
            <div className="space-y-6">
              <TendancesFinancieresChart period={selectedPeriod} />
                </div>
          )}

          {selectedReport === 'sectorielle' && (
            <div className="space-y-6">
              <RepartitionSectorielleChart period={selectedPeriod} />
                </div>
          )}

          {selectedReport === 'temporelle' && (
            <div className="space-y-6">
              {/* <ComparaisonTemporelleChart period={selectedPeriod} /> */}
              <p className="text-slate-500">Comparaison temporelle à charger via API</p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => handleExportReport('PDF')}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-sm font-medium"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Exporter PDF
            </button>
            <button
              onClick={() => handleExportReport('Excel')}
              className="flex items-center px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-sm font-medium"
            >
              <TableCellsIcon className="h-4 w-4 mr-2" />
              Exporter Excel
            </button>
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de configuration */}
      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="Configuration des Rapports"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Période par défaut
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format d'export par défaut
            </label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoGenerate"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="autoGenerate" className="ml-2 block text-sm text-gray-900">
              Génération automatique des rapports mensuels
            </label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsConfigModalOpen(false)}
              className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              Annuler
            </button>
            <button
              onClick={() => {
                setIsConfigModalOpen(false);
                alert('Configuration sauvegardée avec succès !');
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all shadow-sm font-medium"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de visualisation de rapport */}
      <Modal
        isOpen={isViewReportModalOpen}
        onClose={() => {
          setIsViewReportModalOpen(false);
          setViewingReport(null);
        }}
        title={viewingReport ? viewingReport.name : 'Visualisation du Rapport'}
        size="lg"
      >
        {viewingReport && (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Type:</span>
                  <p className="text-gray-900 dark:text-gray-100 mt-1">{viewingReport.type}</p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Format:</span>
                  <p className="text-gray-900 dark:text-gray-100 mt-1">{viewingReport.format}</p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Généré le:</span>
                  <p className="text-gray-900 dark:text-gray-100 mt-1">
                    {new Date(viewingReport.generatedAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Taille:</span>
                  <p className="text-gray-900 dark:text-gray-100 mt-1">{viewingReport.size}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Statut:</span>
                  <p className="mt-1">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      viewingReport.status === 'Complété' 
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700' 
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700'
                    }`}>
                      {viewingReport.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Aperçu du Rapport
              </h3>
              <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Nom:</strong> {viewingReport.name}
                </p>
                <p>
                  <strong>Type:</strong> {viewingReport.type}
                </p>
                <p>
                  <strong>Date de génération:</strong> {new Date(viewingReport.generatedAt).toLocaleString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                    📄 Ceci est un aperçu du rapport. Dans une application réelle, 
                    le contenu complet du rapport serait affiché ici avec toutes les données financières, 
                    graphiques et analyses détaillées.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => handleDownloadReport(viewingReport.id)}
                className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Télécharger
              </button>
              <button
                onClick={() => handlePrintReport(viewingReport.id)}
                className="flex items-center px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
              >
                <PrinterIcon className="h-4 w-4 mr-2" />
                Imprimer
              </button>
              <button
                onClick={() => {
                  setIsViewReportModalOpen(false);
                  setViewingReport(null);
                }}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RapportsComptables;
