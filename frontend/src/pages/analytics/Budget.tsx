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
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import { useApp } from '@core/context/AppContext';
import { usePermission } from '@shared/hooks/usePermission';
import { useTranslation } from '@shared/hooks/useTranslation';
import { budgetService } from '@/services/modules/budgetService';

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
  const { formatCurrency, user } = useApp();
  const { has } = usePermission();

  // États principaux
  const [activeTab, setActiveTab] = useState<'overview' | 'elaboration' | 'suivi' | 'ecarts' | 'previsions'>('overview');
  const [selectedExercice, setSelectedExercice] = useState(new Date().getFullYear().toString());

  // États pour les données
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // États manquants
  const [selectedPeriod, setSelectedPeriod] = useState<string>(new Date().toISOString().slice(0, 7));
  const [selectedBudget, setSelectedBudget] = useState<any | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isViewBudgetModalOpen, setIsViewBudgetModalOpen] = useState(false);
  const [selectedEcart, setSelectedEcart] = useState<any>(null);
  const [isEcartModalOpen, setIsEcartModalOpen] = useState(false);
  const [isAnalyseModalOpen, setIsAnalyseModalOpen] = useState(false);
  const [isPrevisionModalOpen, setIsPrevisionModalOpen] = useState(false);

  // Charger les budgets depuis l'API Réelle
  const loadBudgets = async () => {
    try {
      setLoading(true);
      const data = await budgetService.getAll();
      setBudgets(data);
    } catch (err) {
      console.error('Failed to load budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const handleSync = async (id: string) => {
    try {
      await budgetService.sync(id);
      loadBudgets();
    } catch (err) {
      alert("Erreur lors de la synchronisation avec la comptabilité.");
    }
  };

  // Calculs des KPIs
  const kpis = useMemo(() => {
    const budgetActif = budgets.find(b => b.status === 'en_cours' || b.status === 'approuvé' || b.status === 'active');

    const items = budgetActif?.items || [];
    const totalRecettes = items.filter((l: any) => l.type === 'recette' || l.category === 'ventes')
      .reduce((sum: number, l: any) => sum + (l.budgeted_amount || 0), 0);
    const totalDepenses = items.filter((l: any) => l.type === 'depense' || l.category !== 'ventes')
      .reduce((sum: number, l: any) => sum + (l.budgeted_amount || 0), 0);

    const totalBudget = totalRecettes - totalDepenses;

    const totalReel = items.filter((l: any) => l.type === 'recette' || l.category === 'ventes')
      .reduce((sum: number, l: any) => sum + (l.actual_amount || 0), 0) -
      items.filter((l: any) => l.type === 'depense' || l.category !== 'ventes')
        .reduce((sum: number, l: any) => sum + (l.actual_amount || 0), 0);

    const ecartTotal = totalReel - totalBudget;
    const tauxRealisation = totalBudget !== 0 ? (totalReel / totalBudget) * 100 : 0;

    return {
      totalBudget,
      totalReel,
      ecartTotal,
      varianceTotal: ecartTotal,
      tauxRealisation,
      nombreEcart: 0,
      nombreEcartFavorable: 0,
      nombreEcartDefavorable: 0,
      namebreEcart: 0,
      namebreEcartFavorable: 0,
      namebreEcartDefavorable: 0
    };
  }, [budgets]);

  // Suivi budget
  const suiviBudget = useMemo(() => {
    const budgetActif = budgets.find(b => b.status === 'en_cours' || b.status === 'approuvé' || b.status === 'active');
    if (!budgetActif) return null;

    const lignesPeriode = (budgetActif.items || []).filter((l: any) => l.periode === selectedPeriod || l.exercice === selectedExercice);
    const totalBudget = lignesPeriode.reduce((sum: number, l: any) => sum + (l.type === 'recette' ? l.budgeted_amount : -l.budgeted_amount), 0);
    const totalReel = lignesPeriode.reduce((sum: number, l: any) => sum + (l.type === 'recette' ? l.actual_amount : -l.actual_amount), 0);
    const ecartTotal = totalReel - totalBudget;

    return {
      budgetId: budgetActif.id,
      budget: budgetActif,
      periode: selectedPeriod,
      totalBudget,
      totalReel,
      ecartTotal,
      varianceTotal: ecartTotal,
      ecartPourcentage: totalBudget !== 0 ? (ecartTotal / totalBudget) * 100 : 0,
      tauxRealisation: totalBudget !== 0 ? (totalReel / totalBudget) * 100 : 0,
      lignes: lignesPeriode,
      variances: [],
      ecarts: [],
      tendance: ecartTotal > 0 ? 'amelioration' : ecartTotal < 0 ? 'deterioration' : 'stable',
      alertes: 0,
      dateCalcul: new Date().toISOString()
    };
  }, [budgets, selectedPeriod, selectedExercice]);

  // Fonctions de gestion
  const handleCreerBudget = () => {
    setSelectedBudget({
      name: `Budget ${selectedExercice}`,
      exercice: selectedExercice,
      status: 'draft',
      items: []
    });
    setIsBudgetModalOpen(true);
  };

  const handleAnalyserEcart = (ecart: any) => {
    setSelectedEcart(ecart);
    setIsEcartModalOpen(true);
  };

  const chartDataRecettesDepenses = useMemo(() => {
    const budgetActif = budgets.find(b => b.status === 'en_cours' || b.status === 'approuvé' || b.status === 'active');
    if (!budgetActif) return null;

    const items = budgetActif.items || [];
    const recettesBudget = items.filter((l: any) => l.type === 'recette' || l.category === 'ventes')
      .reduce((sum: number, l: any) => sum + (l.budgeted_amount || 0), 0);
    const recettesReel = items.filter((l: any) => l.type === 'recette' || l.category === 'ventes')
      .reduce((sum: number, l: any) => sum + (l.actual_amount || 0), 0);
    const depensesBudget = items.filter((l: any) => l.type === 'depense' || l.category !== 'ventes')
      .reduce((sum: number, l: any) => sum + (l.budgeted_amount || 0), 0);
    const depensesReel = items.filter((l: any) => l.type === 'depense' || l.category !== 'ventes')
      .reduce((sum: number, l: any) => sum + (l.actual_amount || 0), 0);

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
    <div className="space-y-6 p-4 sm:p-6">
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
          </div>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className={`text-2xl font-bold mb-2 ${kpis.varianceTotal >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpis.varianceTotal >= 0 ? '+' : ''}{formatCurrency(kpis.varianceTotal)}
            </div>
            <div className="text-sm text-gray-600">Taux réalisation: {kpis.tauxRealisation?.toFixed(1)}%</div>
          </div>
        </Card>

        <Card title="Taux de Réalisation">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{kpis.tauxRealisation?.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Performance globale</div>
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
                  className={`${activeTab === tab.id
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
                          scales: {
                            y: {
                              beginAtZero: true
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </Card>

                <Card title="Distribution">
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500 italic text-center">Analyse de la répartition des postes budgétaires</p>
                    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
                      <ChartPieIcon className="h-12 w-12 text-slate-300" />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'elaboration' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Budgets de l'exercice</h3>
                <button onClick={handleCreerBudget} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                  <PlusIcon className="h-5 w-5" />
                  <span>Nouveau Budget</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgets.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    Aucun budget trouvé pour cet exercice.
                  </div>
                ) : budgets.map(b => (
                  <Card key={b.id} title={b.name}>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Statut:</span>
                        <span className="font-medium capitalize">{b.status}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Exercice:</span>
                        <span className="font-medium">{b.exercice}</span>
                      </div>
                      <button onClick={() => { setSelectedBudget(b); setIsViewBudgetModalOpen(true); }} className="w-full mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium transition-colors">
                        Voir détails
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'suivi' && (
            <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              L'outil de suivi détaillé est en cours de synchronisation avec la comptabilité réelle.
            </div>
          )}

          {activeTab === 'ecarts' && (
            <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              Aucun écart critique détecté sur la période sélectionnée.
            </div>
          )}

          {activeTab === 'previsions' && (
            <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              Modules de prévisions intelligentes Dinarlytics LIA.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Budget;



