import React, { useState, useMemo, useEffect } from 'react';
import {
  ChartBarIcon,
  CalculatorIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  PencilIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  DocumentCheckIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  TableCellsIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
  Filler
} from 'chart.js';
import Card from '../../components/UI/Card';
import Modal from '../../components/UI/Modal';
import { useApp } from '../../context/AppContext';
import { usePermission } from '../../hooks/usePermission';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';
import type { Budget, LigneBudget, EcartBudget, SuiviBudget, PrevisionFinanciere, ScenarioBudget } from '../../types';

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
  Filler
);

const Budget: React.FC = () => {
  const { formatCurrency, user, companyData } = useApp();
  const { t } = useTranslation();
  const { has } = usePermission();
  
  // États principaux
  const [activeTab, setActiveTab] = useState<'overview' | 'elaboration' | 'suivi' | 'ecarts' | 'previsions'>('overview');
  const [selectedExercice, setSelectedExercice] = useState(() => {
    return new Date().getFullYear().toString();
  });
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  
  // États pour les modals
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isLigneModalOpen, setIsLigneModalOpen] = useState(false);
  const [isEcartModalOpen, setIsEcartModalOpen] = useState(false);
  const [isPrevisionModalOpen, setIsPrevisionModalOpen] = useState(false);
  const [isViewBudgetModalOpen, setIsViewBudgetModalOpen] = useState(false);
  const [isAnalyseModalOpen, setIsAnalyseModalOpen] = useState(false);
  
  // États pour les données
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [selectedLigne, setSelectedLigne] = useState<LigneBudget | null>(null);
  const [selectedEcart, setSelectedEcart] = useState<EcartBudget | null>(null);
  const [loadingBudgets, setLoadingBudgets] = useState(false);

  // Charger les budgets depuis l'API
  useEffect(() => {
    const loadBudgets = async () => {
      setLoadingBudgets(true);
      try {
        const data = await api.budgets.list();
        setBudgets(data || []);
      } catch (err) {
        console.error('Failed to load budgets:', err);
        setBudgets([]);
      } finally {
        setLoadingBudgets(false);
      }
    };
    loadBudgets();
  }, []);

  // Fallback mock data (temporaire si API ne retourne rien)
  const displayBudgets = budgets.length > 0 ? budgets : [
      {
        id: 'bud-001',
        nom: 'Budget Initial 2025',
        description: 'Budget initial pour l\'exercice 2025',
        exercice: '2025',
        type: 'initial' as const,
        statut: 'approuvé' as const,
        dateCreation: '2024-12-15',
        dateDebut: '2025-01-01',
        dateFin: '2025-12-31',
        dateValidation: '2024-12-20',
        creePar: 'Admin',
        validePar: 'Manager',
        lignes: [
          {
            id: 'ligne-001',
            code: 'VTE-001',
            libelle: 'Ventes Produits',
            categorie: 'ventes',
            type: 'recette',
            compteComptable: '701',
            periode: '2025',
            montantBudget: 12000000,
            montantReel: 12500000,
            ecart: 500000,
            ecartPourcentage: 4.17,
            statut: 'depasse',
            dateCreation: '2024-12-01',
            dateModification: '2024-12-15'
          },
          {
            id: 'ligne-002',
            code: 'VTE-002',
            libelle: 'Ventes Services',
            categorie: 'ventes',
            type: 'recette',
            compteComptable: '706',
            periode: '2025',
            montantBudget: 8000000,
            montantReel: 7500000,
            ecart: -500000,
            ecartPourcentage: -6.25,
            statut: 'non_atteint',
            dateCreation: '2024-12-01',
            dateModification: '2024-12-15'
          },
          {
            id: 'ligne-003',
            code: 'ACH-001',
            libelle: 'Achats Matières Premières',
            categorie: 'achats',
            type: 'depense',
            compteComptable: '601',
            periode: '2025',
            montantBudget: 6000000,
            montantReel: 5800000,
            ecart: -200000,
            ecartPourcentage: -3.33,
            statut: 'en_cours',
            dateCreation: '2024-12-01',
            dateModification: '2024-12-15'
          },
          {
            id: 'ligne-004',
            code: 'CHG-001',
            libelle: 'Charges Personnel',
            categorie: 'charges',
            type: 'depense',
            compteComptable: '641',
            periode: '2025',
            montantBudget: 3500000,
            montantReel: 3600000,
            ecart: 100000,
            ecartPourcentage: 2.86,
            statut: 'depasse',
            dateCreation: '2024-12-01',
            dateModification: '2024-12-15'
          },
          {
            id: 'ligne-005',
            code: 'CHG-002',
            libelle: 'Charges Exploitation',
            categorie: 'charges',
            type: 'depense',
            compteComptable: '622',
            periode: '2025',
            montantBudget: 2000000,
            montantReel: 1950000,
            ecart: -50000,
            ecartPourcentage: -2.5,
            statut: 'en_cours',
            dateCreation: '2024-12-01',
            dateModification: '2024-12-15'
          }
        ],
        lignesBudget: [
          {
            id: 'ligne-001',
            code: 'VTE-001',
            libelle: 'Ventes Produits',
            categorie: 'ventes',
            type: 'recette',
            compteComptable: '701',
            periode: '2025',
            montantBudget: 12000000,
            montantReel: 12500000,
            ecart: 500000,
            ecartPourcentage: 4.17,
            statut: 'depasse',
            dateCreation: '2024-12-01',
            dateModification: '2024-12-15'
          },
          {
            id: 'ligne-002',
            code: 'VTE-002',
            libelle: 'Ventes Services',
            categorie: 'ventes',
            type: 'recette',
            compteComptable: '706',
            periode: '2025',
            montantBudget: 8000000,
            montantReel: 7500000,
            ecart: -500000,
            ecartPourcentage: -6.25,
            statut: 'non_atteint',
            dateCreation: '2024-12-01',
            dateModification: '2024-12-15'
          },
          {
            id: 'ligne-003',
            code: 'ACH-001',
            libelle: 'Achats Matières Premières',
            categorie: 'achats',
            type: 'depense',
            compteComptable: '601',
            periode: '2025',
            montantBudget: 6000000,
            montantReel: 5800000,
            ecart: -200000,
            ecartPourcentage: -3.33,
            statut: 'en_cours',
            dateCreation: '2024-12-01',
            dateModification: '2024-12-15'
          },
          {
            id: 'ligne-004',
            code: 'CHG-001',
            libelle: 'Charges Personnel',
            categorie: 'charges',
            type: 'depense',
            compteComptable: '641',
            periode: '2025',
            montantBudget: 3500000,
            montantReel: 3600000,
            ecart: 100000,
            ecartPourcentage: 2.86,
            statut: 'depasse',
            dateCreation: '2024-12-01',
            dateModification: '2024-12-15'
          },
          {
            id: 'ligne-005',
            code: 'CHG-002',
            libelle: 'Charges Exploitation',
            categorie: 'charges',
            type: 'depense',
            compteComptable: '622',
            periode: '2025',
            montantBudget: 2000000,
            montantReel: 1950000,
            ecart: -50000,
            ecartPourcentage: -2.5,
            statut: 'en_cours',
            dateCreation: '2024-12-01',
            dateModification: '2024-12-15'
          }
        ],
        totalRecettes: 20000000,
        totalDepenses: 11500000,
        solde: 8500000,
        soldeBudget: 8500000,
        version: 1
      }
    ];
  
  const [ecarts] = useState<EcartBudget[]>([
    {
      id: 'ecart-001',
      ligneBudgetId: 'ligne-001',
      ligneBudget: budgets[0].lignesBudget[0],
      periode: selectedPeriod,
      montantBudget: 12000000,
      montantReel: 12500000,
      ecart: 500000,
      ecartPourcentage: 4.17,
      montantEcart: 500000,
      pourcentageEcart: 4.17,
      typeEcart: 'favorable' as const,
      seuilAlerte: 5,
      niveauAlerte: 'info' as const,
      statut: 'en_analyse' as const,
      dateDetection: '2025-01-15'
    },
    {
      id: 'ecart-002',
      ligneBudgetId: 'ligne-004',
      ligneBudget: budgets[0].lignesBudget[3],
      periode: selectedPeriod,
      montantBudget: 3500000,
      montantReel: 3600000,
      ecart: 100000,
      ecartPourcentage: 2.86,
      montantEcart: 100000,
      pourcentageEcart: 2.86,
      typeEcart: 'defavorable' as const,
      seuilAlerte: 5,
      niveauAlerte: 'attention' as const,
      statut: 'en_cours' as const,
      dateDetection: '2025-01-15'
    }
  ]);
  
  const [previsions] = useState<PrevisionFinanciere[]>([
    {
      id: 'prev-001',
      nom: 'Prévision T1 2025',
      description: 'Prévision pour le premier trimestre 2025',
      periodeDebut: '2025-01-01',
      periodeFin: '2025-03-31',
      horizon: '3mois',
      methode: 'tendance',
      scenarios: [],
      dateCreation: '2025-01-10',
      dateMiseAJour: '2025-01-10',
      creePar: 'Admin',
      precision: 85
    }
  ]);
  
  // Calculs des KPIs
  const kpis = useMemo(() => {
    const budgetActif = budgets.find(b => b.statut === 'en_cours' || b.statut === 'approuvé');
    if (!budgetActif) {
      return {
        totalBudget: 0,
        totalReel: 0,
        ecartTotal: 0,
        tauxRealisation: 0,
        nombreEcart: 0,
        nombreEcartFavorable: 0,
        nombreEcartDefavorable: 0
      };
    }
    
    const totalBudget = budgetActif.totalRecettes - budgetActif.totalDepenses;
    const totalReel = budgetActif.lignesBudget
      .filter((l: LigneBudget) => l.type === 'recette')
      .reduce((sum: number, l: LigneBudget) => sum + l.montantReel, 0) -
      budgetActif.lignesBudget
      .filter((l: LigneBudget) => l.type === 'depense')
      .reduce((sum: number, l: LigneBudget) => sum + l.montantReel, 0);
    
    const ecartTotal = totalReel - totalBudget;
    const tauxRealisation = totalBudget !== 0 ? (totalReel / totalBudget) * 100 : 0;
    
    const ecartsPeriode = ecarts.filter(e => e.periode === selectedPeriod);
    const nombreEcartFavorable = ecartsPeriode.filter(e => e.typeEcart === 'favorable').length;
    const nombreEcartDefavorable = ecartsPeriode.filter(e => e.typeEcart === 'defavorable').length;
    
    return {
      totalBudget,
      totalReel,
      ecartTotal,
      tauxRealisation,
      nombreEcart: ecartsPeriode.length,
      nombreEcartFavorable,
      nombreEcartDefavorable
    };
  }, [budgets, ecarts, selectedPeriod]);
  
  // Suivi budget
  const suiviBudget = useMemo(() => {
    const budgetActif = budgets.find(b => b.statut === 'en_cours' || b.statut === 'approuvé');
    if (!budgetActif) return null;
    
    const lignesPeriode = budgetActif.lignesBudget.filter((l: LigneBudget) => l.periode === selectedPeriod || l.periode === selectedExercice);
    const totalBudget = lignesPeriode.reduce((sum: number, l: LigneBudget) => sum + (l.type === 'recette' ? l.montantBudget : -l.montantBudget), 0);
    const totalReel = lignesPeriode.reduce((sum: number, l: LigneBudget) => sum + (l.type === 'recette' ? l.montantReel : -l.montantReel), 0);
    const ecartTotal = totalReel - totalBudget;
    const tauxRealisation = totalBudget !== 0 ? (totalReel / totalBudget) * 100 : 0;
    
    return {
      budgetId: budgetActif.id,
      budget: budgetActif,
      periode: selectedPeriod,
      totalBudget,
      totalReel,
      ecartTotal,
      ecartPourcentage: totalBudget !== 0 ? (ecartTotal / totalBudget) * 100 : 0,
      tauxRealisation,
      lignes: lignesPeriode,
      ecarts: ecarts.filter(e => e.periode === selectedPeriod),
      tendance: ecartTotal > 0 ? 'amelioration' : ecartTotal < 0 ? 'deterioration' : 'stable',
      alertes: ecarts.filter(e => e.periode === selectedPeriod && (e.gravite === 'majeur' || e.gravite === 'critique')).length,
      dateCalcul: new Date().toISOString()
    } as SuiviBudget;
  }, [budgets, ecarts, selectedPeriod, selectedExercice]);
  
  // Fonctions de gestion
  const handleCreerBudget = () => {
    const nomNouveauBudget = `Budget ${selectedExercice}`;
    const nouveauBudget: Budget = {
      id: `bud-${budgets.length + 1}`,
      nom: nomNouveauBudget,
      exercice: selectedExercice,
      type: 'initial' as const,
      statut: 'brouillon' as const,
      dateCreation: new Date().toISOString(),
      dateDebut: `${selectedExercice}-01-01`,
      dateFin: `${selectedExercice}-12-31`,
      creePar: user?.nom || user?.email || 'Utilisateur',
      lignes: [],
      lignesBudget: [],
      totalRecettes: 0,
      totalDepenses: 0,
      solde: 0,
      soldeBudget: 0,
      version: 1
    };
    setSelectedBudget(nouveauBudget);
    setIsBudgetModalOpen(true);
  };
  
  const handleAnalyserEcart = (ecart: EcartBudget) => {
    setSelectedEcart(ecart);
    setIsEcartModalOpen(true);
  };
  
  // Données pour graphiques
  const chartDataRecettesDepenses = useMemo(() => {
    const budgetActif = budgets.find(b => b.statut === 'en_cours' || b.statut === 'approuvé');
    if (!budgetActif) return null;
    
    const recettesBudget = budgetActif.lignesBudget
      .filter((l: LigneBudget) => l.type === 'recette')
      .reduce((sum: number, l: LigneBudget) => sum + l.montantBudget, 0);
    const recettesReel = budgetActif.lignesBudget
      .filter((l: LigneBudget) => l.type === 'recette')
      .reduce((sum: number, l: LigneBudget) => sum + l.montantReel, 0);
    const depensesBudget = budgetActif.lignesBudget
      .filter((l: LigneBudget) => l.type === 'depense')
      .reduce((sum: number, l: LigneBudget) => sum + l.montantBudget, 0);
    const depensesReel = budgetActif.lignesBudget
      .filter((l: LigneBudget) => l.type === 'depense')
      .reduce((sum: number, l: LigneBudget) => sum + l.montantReel, 0);
    
    return {
      labels: ['Recettes', 'Dépenses'],
      datasets: [
        {
          label: 'Budget',
          data: [recettesBudget, depensesBudget],
          backgroundColor: ['rgba(59, 130, 246, 0.5)', 'rgba(239, 68, 68, 0.5)'],
          borderColor: ['rgba(59, 130, 246, 1)', 'rgba(239, 68, 68, 1)'],
          borderWidth: 2
        },
        {
          label: 'Réel',
          data: [recettesReel, depensesReel],
          backgroundColor: ['rgba(34, 197, 94, 0.5)', 'rgba(249, 115, 22, 0.5)'],
          borderColor: ['rgba(34, 197, 94, 1)', 'rgba(249, 115, 22, 1)'],
          borderWidth: 2
        }
      ]
    };
  }, [budgets]);
  
  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <ChartBarIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Gestion Budgétaire</h1>
              <p className="text-purple-100">Élaboration, suivi et analyse des budgets</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-purple-100 text-sm">Exercice</p>
              <select title="Sélectionner un exercice"
                value={selectedExercice}
                onChange={(e) => setSelectedExercice(e.target.value)}
                className="mt-1 px-3 py-2 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white font-semibold"
              >
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2026">2026</option>
              </select>
            </div>
            <div className="text-right">
              <p className="text-purple-100 text-sm">Période</p>
              <input title="Sélectionner une période" placeholder="mm/yyyy"
                type="month"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="mt-1 px-3 py-2 rounded-lg bg-white bg-opacity-20 border border-white border-opacity-30 text-white font-semibold"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Budget Total">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">{formatCurrency(kpis.totalBudget)}</div>
            <div className="text-sm text-gray-600">Exercice {selectedExercice}</div>
          </div>
        </Card>
        
        <Card title="Réalisé">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">{formatCurrency(kpis.totalReel)}</div>
            <div className="text-sm text-gray-600">Montant réel</div>
          </div>
        </Card>
        
        <Card title="Écart">
          <div className="text-center">
            <div className={`text-2xl font-bold mb-2 ${
              kpis.ecartTotal >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {kpis.ecartTotal >= 0 ? '+' : ''}{formatCurrency(kpis.ecartTotal)}
            </div>
            <div className="text-sm text-gray-600">Taux réalisation: {kpis.tauxRealisation.toFixed(1)}%</div>
          </div>
        </Card>
        
        <Card title="Écarts Détectés">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">{kpis.nombreEcart}</div>
            <div className="text-sm text-gray-600">
              {kpis.nombreEcartFavorable} favorable, {kpis.nombreEcartDefavorable} défavorable
            </div>
          </div>
        </Card>
      </div>
      
      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Vue d\'ensemble', icon: ChartBarIcon },
              { id: 'elaboration', name: 'Élaboration', icon: DocumentTextIcon },
              { id: 'suivi', name: 'Suivi', icon: EyeIcon },
              { id: 'ecarts', name: 'Écarts', icon: ExclamationTriangleIcon },
              { id: 'previsions', name: 'Prévisions', icon: SparklesIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6">
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Budget vs Réel">
                  {chartDataRecettesDepenses && (
                    <div className="h-64">
                      <Bar
                        data={chartDataRecettesDepenses}
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
                              beginAtZero: true,
                              ticks: {
                                callback: (value) => formatCurrency(value as number)
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </Card>
                
                <Card title="Taux de Réalisation">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600 mb-2">
                        {kpis.tauxRealisation.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Taux de réalisation global</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full ${
                          kpis.tauxRealisation >= 100 ? 'bg-green-500' :
                          kpis.tauxRealisation >= 80 ? 'bg-blue-500' :
                          kpis.tauxRealisation >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, kpis.tauxRealisation)}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Budget</div>
                        <div className="font-semibold">{formatCurrency(kpis.totalBudget)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Réalisé</div>
                        <div className="font-semibold">{formatCurrency(kpis.totalReel)}</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              
              {suiviBudget && (
                <Card title="Top 5 Écarts">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ligne</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Réel</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Écart</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">%</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {suiviBudget.ecarts.slice(0, 5).map((ecart: EcartBudget) => (
                          <tr key={ecart.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {ecart.ligneBudget.libelle}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {formatCurrency(ecart.ligneBudget.montantBudget)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                              {formatCurrency(ecart.ligneBudget.montantReel)}
                            </td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                              ecart.typeEcart === 'favorable' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {ecart.typeEcart === 'favorable' ? '+' : ''}{formatCurrency(ecart.montantEcart)}
                            </td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm ${
                              ecart.typeEcart === 'favorable' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {ecart.pourcentageEcart >= 0 ? '+' : ''}{ecart.pourcentageEcart.toFixed(2)}%
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleAnalyserEcart(ecart)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Analyser
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}
          
          {/* Élaboration */}
          {activeTab === 'elaboration' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Budgets</h3>
                {has('comptabilite-write') && (
                  <button
                    onClick={handleCreerBudget}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Nouveau Budget</span>
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgets.map((budget) => (
                  <Card key={budget.id}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{budget.nom}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          budget.statut === 'approuvé' ? 'bg-green-100 text-green-800' :
                          budget.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                          budget.statut === 'validé' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {budget.statut}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Exercice:</span>
                          <span className="font-medium">{budget.exercice}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Recettes:</span>
                          <span className="font-medium text-green-600">{formatCurrency(budget.totalRecettes)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dépenses:</span>
                          <span className="font-medium text-red-600">{formatCurrency(budget.totalDepenses)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t">
                          <span>Solde:</span>
                          <span className={budget.soldeBudget >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(budget.soldeBudget)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBudget(budget);
                            setIsViewBudgetModalOpen(true);
                          }}
                          className="flex-1 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm font-medium"
                        >
                          Voir détails
                        </button>
                        <button title="Modifier ce budget" className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Suivi */}
          {activeTab === 'suivi' && suiviBudget && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Suivi Budget - {selectedPeriod}</h3>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2">
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    <span>Exporter</span>
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2">
                    <PrinterIcon className="h-5 w-5" />
                    <span>Imprimer</span>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card title="Budget">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(suiviBudget.totalBudget)}</div>
                  </div>
                </Card>
                <Card title="Réalisé">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(suiviBudget.totalReel)}</div>
                  </div>
                </Card>
                <Card title="Taux Réalisation">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{suiviBudget.tauxRealisation.toFixed(1)}%</div>
                  </div>
                </Card>
              </div>
              
              <Card title="Lignes Budgétaires">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Budget</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Réel</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Écart</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {suiviBudget.lignes.map((ligne: LigneBudget) => (
                        <tr key={ligne.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{ligne.code}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{ligne.libelle}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 capitalize">{ligne.type}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                            {formatCurrency(ligne.montantBudget)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                            {formatCurrency(ligne.montantReel)}
                          </td>
                          <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${
                            ligne.ecart >= 0 && ligne.type === 'recette' ? 'text-green-600' :
                            ligne.ecart < 0 && ligne.type === 'depense' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {ligne.ecart >= 0 ? '+' : ''}{formatCurrency(ligne.ecart)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              ligne.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                              ligne.statut === 'atteint' ? 'bg-green-100 text-green-800' :
                              ligne.statut === 'depasse' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {ligne.statut}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
          
          {/* Écarts */}
          {activeTab === 'ecarts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Analyse des Écarts</h3>
                <button
                  onClick={() => setIsAnalyseModalOpen(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                >
                  <SparklesIcon className="h-5 w-5" />
                  <span>Analyse Automatique</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card title="Écarts Favorables">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {kpis.nombreEcartFavorable}
                    </div>
                    <div className="text-sm text-gray-600">Écarts favorables détectés</div>
                  </div>
                </Card>
                <Card title="Écarts Défavorables">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {kpis.nombreEcartDefavorable}
                    </div>
                    <div className="text-sm text-gray-600">Écarts défavorables détectés</div>
                  </div>
                </Card>
              </div>
              
              <Card title="Liste des Écarts">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ligne</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Écart</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gravité</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ecarts.map((ecart) => (
                        <tr key={ecart.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{ecart.ligneBudget.libelle}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{ecart.periode}</td>
                          <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${
                            ecart.typeEcart === 'favorable' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {ecart.typeEcart === 'favorable' ? '+' : ''}{formatCurrency(ecart.montantEcart)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              ecart.typeEcart === 'favorable' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {ecart.typeEcart}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              ecart.gravite === 'critique' ? 'bg-red-100 text-red-800' :
                              ecart.gravite === 'majeur' ? 'bg-orange-100 text-orange-800' :
                              ecart.gravite === 'moyen' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {ecart.gravite}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              ecart.statut === 'resolu' ? 'bg-green-100 text-green-800' :
                              ecart.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {ecart.statut}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleAnalyserEcart(ecart)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Analyser
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
          
          {/* Prévisions */}
          {activeTab === 'previsions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Prévisions Financières</h3>
                {has('comptabilite-write') && (
                  <button
                    onClick={() => setIsPrevisionModalOpen(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Nouvelle Prévision</span>
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {previsions.map((prev) => (
                  <Card key={prev.id}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{prev.nom}</h4>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {prev.horizon}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Méthode:</span>
                          <span className="font-medium capitalize">{prev.methode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Précision:</span>
                          <span className="font-medium">{prev.precision}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Période:</span>
                          <span className="font-medium">
                            {new Date(prev.periodeDebut).toLocaleDateString('fr-FR')} - {new Date(prev.periodeFin).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <button className="flex-1 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-sm font-medium">
                          Voir détails
                        </button>
                        <button title="Modifier ce budget" className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal Analyse Écart */}
      <Modal
        isOpen={isEcartModalOpen}
        onClose={() => setIsEcartModalOpen(false)}
        title="Analyse d'Écart"
        size="lg"
      >
        {selectedEcart && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-semibold text-gray-900 mb-2">{selectedEcart.ligneBudget.libelle}</div>
              <div className="text-sm text-gray-600">Code: {selectedEcart.ligneBudget.code}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Budget</div>
                <div className="font-semibold text-lg">{formatCurrency(selectedEcart.ligneBudget.montantBudget)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Réel</div>
                <div className="font-semibold text-lg">{formatCurrency(selectedEcart.ligneBudget.montantReel)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Écart</div>
                <div className={`font-semibold text-lg ${
                  selectedEcart.typeEcart === 'favorable' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedEcart.typeEcart === 'favorable' ? '+' : ''}{formatCurrency(selectedEcart.montantEcart)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Pourcentage</div>
                <div className={`font-semibold text-lg ${
                  selectedEcart.typeEcart === 'favorable' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedEcart.pourcentageEcart >= 0 ? '+' : ''}{selectedEcart.pourcentageEcart.toFixed(2)}%
                </div>
              </div>
            </div>
            
            {selectedEcart.cause && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Cause identifiée</h4>
                <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded-lg">{selectedEcart.cause}</p>
              </div>
            )}
            
            {selectedEcart.actionCorrective && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Action corrective</h4>
                <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">{selectedEcart.actionCorrective}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setIsEcartModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Fermer
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Planifier Action
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Budget;

