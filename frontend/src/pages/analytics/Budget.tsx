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

    // Écarts calculés par ligne budgétaire réelle : favorable si le réel
    // dépasse le budget pour une recette, ou reste sous le budget pour une
    // dépense ; défavorable dans le cas contraire.
    const lineEcarts = items.map((l: any) => {
      const isRecette = l.type === 'recette' || l.category === 'ventes';
      const budgeted = l.budgeted_amount || 0;
      const actual = l.actual_amount || 0;
      const diff = actual - budgeted;
      const favorable = isRecette ? diff >= 0 : diff <= 0;
      return { ...l, diff, favorable, isRecette };
    }).filter((l: any) => l.diff !== 0);

    return {
      totalBudget,
      totalReel,
      ecartTotal,
      varianceTotal: ecartTotal,
      tauxRealisation,
      nombreEcart: lineEcarts.length,
      nombreEcartFavorable: lineEcarts.filter((l: any) => l.favorable).length,
      nombreEcartDefavorable: lineEcarts.filter((l: any) => !l.favorable).length,
      lineEcarts
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

  // Distribution réelle des postes budgétaires par catégorie
  const chartDataDistribution = useMemo(() => {
    const budgetActif = budgets.find(b => b.status === 'en_cours' || b.status === 'approuvé' || b.status === 'active');
    if (!budgetActif) return null;
    const items = budgetActif.items || [];
    if (items.length === 0) return null;

    const totals: Record<string, number> = {};
    items.forEach((l: any) => {
      const cat = l.category || 'Autre';
      totals[cat] = (totals[cat] || 0) + Math.abs(l.budgeted_amount || 0);
    });
    const labels = Object.keys(totals);
    const palette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

    return {
      labels,
      datasets: [{
        data: labels.map(l => totals[l]),
        backgroundColor: labels.map((_, i) => palette[i % palette.length])
      }]
    };
  }, [budgets]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* En-tête */}
      <div className="bg-slate-900 text-white rounded-[2rem] shadow-2xl border border-white/5 p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)]"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl">
              <ChartBarIcon className="h-10 w-10 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter italic">Gestion Budgétaire</h1>
                <span className="px-3 py-1 bg-purple-500 text-[9px] font-black uppercase tracking-widest rounded-lg">Pro</span>
              </div>
              <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-[0.3em] opacity-80 italic">Élaboration & Pilotage Prédictif</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Exercice</p>
              <select title="Sélectionner un exercice"
                value={selectedExercice}
                onChange={(e) => setSelectedExercice(e.target.value)}
                className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-black text-[10px] uppercase tracking-widest outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option value="2025" className="text-slate-900">2025</option>
                <option value="2024" className="text-slate-900">2024</option>
                <option value="2026" className="text-slate-900">2026</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:scale-[1.02]">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Budget Total</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{formatCurrency(kpis.totalBudget)}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Exercice {selectedExercice}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:scale-[1.02]">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Réalisé</p>
          <p className="text-2xl font-black text-emerald-500 font-mono">{formatCurrency(kpis.totalReel)}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Montant réel</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:scale-[1.02]">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Écart</p>
          <p className={`text-2xl font-black font-mono ${kpis.varianceTotal >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {kpis.varianceTotal >= 0 ? '+' : ''}{formatCurrency(kpis.varianceTotal)}
          </p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Variance absolute</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:scale-[1.02]">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Réalisation</p>
          <p className="text-2xl font-black text-purple-500 font-mono">{kpis.tauxRealisation?.toFixed(1)}%</p>
          <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Performance globale</p>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-slate-100 dark:border-slate-700 overflow-x-auto no-scrollbar">
          <nav className="flex px-8" aria-label="Tabs">
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
                    ? 'text-slate-900 border-slate-900 dark:text-white dark:border-white'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                    } whitespace-nowrap py-6 px-6 border-b-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3`}
                >
                  <Icon className="h-4 w-4" />
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
                    {chartDataDistribution ? (
                      <div className="h-64">
                        <Doughnut
                          data={chartDataDistribution}
                          options={{ responsive: true, maintainAspectRatio: false }}
                        />
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
                        <ChartPieIcon className="h-12 w-12 text-slate-300" />
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'elaboration' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Budgets de l'exercice</h3>
                {has('comptabilite-write') && (
                  <button onClick={handleCreerBudget} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                    <PlusIcon className="h-5 w-5" />
                    <span>Nouveau Budget</span>
                  </button>
                )}
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
            suiviBudget ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="month"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <span className="text-sm text-gray-500">Budget: {suiviBudget.budget.name}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-bold">Budget période</p>
                    <p className="text-xl font-black">{formatCurrency(suiviBudget.totalBudget)}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-bold">Réel période</p>
                    <p className="text-xl font-black">{formatCurrency(suiviBudget.totalReel)}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-500 uppercase font-bold">Taux de réalisation</p>
                    <p className="text-xl font-black">{suiviBudget.tauxRealisation.toFixed(1)}%</p>
                  </div>
                </div>
                {suiviBudget.lignes.length === 0 && (
                  <div className="py-8 text-center text-gray-400 text-sm">Aucune ligne budgétaire pour cette période.</div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                Aucun budget actif à suivre pour cet exercice.
              </div>
            )
          )}

          {activeTab === 'ecarts' && (
            kpis.lineEcarts && kpis.lineEcarts.length > 0 ? (
              <div className="space-y-2">
                {kpis.lineEcarts.map((l: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{l.category || l.name || 'Ligne budgétaire'}</p>
                      <p className="text-xs text-gray-400">{l.isRecette ? 'Recette' : 'Dépense'}</p>
                    </div>
                    <span className={`font-black font-mono ${l.favorable ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {l.diff >= 0 ? '+' : ''}{formatCurrency(l.diff)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                Aucun écart entre budget et réel sur les lignes du budget actif.
              </div>
            )
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



