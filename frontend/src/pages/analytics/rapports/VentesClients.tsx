import React, { useState } from 'react';
import {
  ChartBarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  StarIcon,
  ChartPieIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  CalendarIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@core/context/AppContext';
import { useSalesReports } from '@shared/hooks/useSalesReports';
import Modal from '@shared/components/UI/Modal';
import { usePermission } from '@shared/hooks/usePermission';
import { useTranslation } from '@/shared/hooks/useTranslation';

const VentesClients: React.FC = () => {
  const navigate = useNavigate();
  const { t, currentLang } = useTranslation();
  const { user, formatCurrency } = useApp();
  const fmt = (n: number) => formatCurrency(n); // Defensive alias for removed helper
  const [selectedPeriod, setSelectedPeriod] = useState('mois');
  const [activeTab, setActiveTab] = useState<'rapports' | 'analyse' | 'previsions'>('rapports');
  const [showExportModal, setShowExportModal] = useState(false);
  const [isAiAuditModalOpen, setIsAiAuditModalOpen] = useState(false);
  const [isGeneratingAiAudit, setIsGeneratingAiAudit] = useState(false);
  const [aiAuditReport, setAiAuditReport] = useState<any>(null);

  // API Data Hook
  const { data, loading, error } = useSalesReports(selectedPeriod);

  const tabs = [
    { id: 'rapports' as const, label: t('sales.tabs.sales_reports'), icon: ChartBarIcon },
    { id: 'analyse' as const, label: t('sales.tabs.client_analysis'), icon: UserGroupIcon },
    { id: 'previsions' as const, label: t('sales.tabs.forecasts'), icon: ChartPieIcon },
  ];

  // ── Export PDF ───────────────────────────────
  const handleExportPDF = () => {
    window.print();
  };

  // ── Export Excel (CSV) ───────────────────────
  const handleExportExcel = () => {
    console.log('Generating Excel export...');
    if (!data) return;
    const { salesData, topProducts, salesByCategory, topClients, clientMetrics, forecasts } = data;
    const BOM = '\uFEFF';
    const sep = ';';
    const rows: string[][] = [
      ['DINARLYTICS — RAPPORT DÉTAILLÉ DES VENTES & ANALYSE CLIENT'],
      [`Période : ${selectedPeriod === 'jour' ? 'Journalier' : 'Mensuel'} — Exercice 2024`],
      [`Généré par : ${user?.nom || 'Administrateur'} le ${new Date().toLocaleDateString('fr-DZ')} à ${new Date().toLocaleTimeString('fr-DZ')}`],
      [],
      ['=== RÉSUMÉ DES INDICATEURS CLÉS (KPI) ==='],
      ['Indicateur', 'Valeur', 'Tendance/Information'],
      ['Chiffre d\'Affaires (DA)', salesData.ca.value.toString(), `${salesData.ca.change > 0 ? '+' : ''}${salesData.ca.change}% vs période précédente`],
      ['Marge Brute (%)', salesData.margeBrute.toString(), 'Objectif : 45%'],
      ['Panier Moyen (DA)', salesData.panierMoyen.toString(), ''],
      ['Nombre de Factures', salesData.facturesEmises.toString(), 'Validées'],
      ['Clients Actifs', clientMetrics.clientsActifs.toString(), `Total base : ${clientMetrics.totalClients}`],
      ['Taux de Fidélisation (%)', clientMetrics.tauxFidelisation.toString(), ''],
      [],
      ['=== ANALYSE PAR CATÉGORIE DE PRODUITS ==='],
      ['Catégorie', 'Chiffre d\'Affaires (DA)', 'Part du CA (%)', 'Tendance'],
      ...salesByCategory.map(cat => [cat.category, cat.amount.toString(), cat.percentage.toString(), `${cat.trend}%`]),
      [],
      ['=== TOP 5 PRODUITS (VOLUME & VALEUR) ==='],
      ['Nom du Produit', 'Quantité', 'Ventes (DA)', 'Part (%)', 'Évolution (%)'],
      ...topProducts.map(p => [p.name, p.quantity.toString(), p.sales.toString(), p.percentage.toString(), p.evolution.toString()]),
      [],
      ['=== ANALYSE QUALITATIVE TOP CLIENTS ==='],
      ['ID Client', 'Nom / Raison Sociale', 'Ventes Totales (DA)', 'Commandes', 'Panier Moyen (DA)', 'Croissance (%)'],
      ...topClients.map(c => [c.id, c.name, c.sales.toString(), c.orders.toString(), c.avgBasket.toString(), c.trend.toString()]),
      [],
      ['=== PRÉVISIONS & OBJECTIFS TRIMESTRIELS ==='],
      ['Mois', 'Chiffre Réel (DA)', 'Objectif (DA)', 'Prévision AI (DA)', 'Variance (%)'],
      ...forecasts.map(f => [f.month, f.actual.toString(), f.target.toString(), f.forecast.toString(), f.variance.toString()]),
      [],
      ['DOCUMENT GÉNÉRÉ AUTOMATIQUEMENT PAR LE SYSTÈME DINARLYTICS. TOUS DROITS RÉSERVÉS.'],
    ];
    const csv = BOM + rows.map(r => r.join(sep)).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Dinarlytics_Sales_Report_${selectedPeriod}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!data) return;
    const text = `${t('sales.excel.report_title')} — ${new Date().toLocaleDateString('fr-DZ')}\n` +
      `${t('sales.kpi.revenue')} : ${formatCurrency(data.salesData.ca.value)}\n` +
      `${t('sales.client_metrics.active_clients')} : ${data.clientMetrics.clientsActifs}\n` +
      `${t('sales.client_metrics.retention')} : ${data.clientMetrics.tauxFidelisation}%`;
    if (navigator.share) {
      try { await navigator.share({ title: t('sales.excel.report_title'), text }); } catch { }
    } else {
      await navigator.clipboard.writeText(text);
      alert(t('common.success'));
    }
  };

  const handleGenererAuditIA = async () => {
    setIsAiAuditModalOpen(true);
    setIsGeneratingAiAudit(true);
    setAiAuditReport(null);

    // Simulation IA
    await new Promise(resolve => setTimeout(resolve, 2500));

    if (data) {
      const dsoValue = data.clientMetrics.dsoMoyen;
      const caValue = data.salesData.ca.value;
      const topClientCa = data.topClients[0]?.sales || 0;
      const concentration = Math.round((topClientCa / caValue) * 100);

      setAiAuditReport({
        score: dsoValue < 30 ? 94 : 88,
        status: dsoValue < 30 ? 'Excellence Opérationnelle' : 'Optimisation Requise',
        summary: `Analyse croisée des cycles de vente et du comportement client. L'entreprise affiche une résilience ${caValue > 1000000 ? 'forte' : 'modérée'} avec un CA de ${caValue.toLocaleString()} DA. Le DSO moyen est de ${dsoValue} jours.`,
        risks: [
          {
            level: concentration > 30 ? 'medium' : 'low',
            title: 'Concentration Client',
            message: `Le premier client (${data.topClients[0]?.name}) représente ${concentration}% du CA. ${concentration > 30 ? 'Risque de dépendance élevé.' : 'Dépendance maîtrisée.'}`
          },
          {
            level: data.clientMetrics.tauxImpayes > 2 ? 'high' : 'medium',
            title: 'Qualité du Poste Client',
            message: `Le taux d'impayés est de ${data.clientMetrics.tauxImpayes}%. ${data.clientMetrics.tauxImpayes > 2 ? 'Action corrective immédiate requise.' : 'Sous surveillance.'}`
          }
        ],
        opportunities: [
          {
            title: 'Optimisation Trésorerie',
            message: `Une réduction du DSO de 5 jours dégagerait environ ${Math.round(caValue / 30 * 5).toLocaleString()} DA de liquidités immédiates.`
          },
          {
            title: 'Développement B2B',
            message: `Le client ${data.topClients[1]?.name} est en croissance de ${data.topClients[1]?.trend}%. Potentiel d'up-selling détecté.`
          }
        ]
      });
    }
    setIsGeneratingAiAudit(false);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <ArrowPathIcon className="h-10 w-10 text-slate-300 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Chargement des données en cours...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 bg-white rounded-[3rem] border border-slate-100">
        <InformationCircleIcon className="h-12 w-12 text-slate-200 mb-4" />
        <p className="text-sm font-bold text-slate-900">Une erreur est survenue</p>
        <p className="text-xs text-slate-500 mt-2">{error || 'Données indisponibles'}</p>
      </div>
    );
  }

  const { salesData, topProducts, salesByCategory, topClients, clientMetrics, forecasts } = data;

  return (
    <>
      <div className="space-y-8 pb-12" id="sales-print-root">

        {/* ══════════════ HERO HEADER ══════════════ */}
        <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.02),transparent)]" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2 opacity-60">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('sales.hero.performance')}</p>
                <div className="h-px w-6 bg-slate-700" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">{t('sales.hero.audited')}</p>
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight leading-none text-white">{t('sales.title')}</h1>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setSelectedPeriod('jour')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedPeriod === 'jour' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400'}`}
                  >
                    {t('common.periods.day')}
                  </button>
                  <button
                    onClick={() => setSelectedPeriod('mois')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedPeriod === 'mois' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400'}`}
                  >
                    {t('common.periods.month')}
                  </button>
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                  {selectedPeriod === 'jour' ? t('sales.hero.view_daily') : t('sales.hero.view_monthly')} · {new Date().toLocaleDateString(currentLang === 'ar' ? 'ar-DZ' : currentLang === 'en' ? 'en-US' : 'fr-FR', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportPDF}
                className="px-6 py-3 bg-white text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:bg-slate-100 flex items-center gap-2"
              >
                <PrinterIcon className="h-3.5 w-3.5" />
                {t('common.print')}
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center gap-2"
              >
                <ShareIcon className="h-3.5 w-3.5" />
                {t('common.share')}
              </button>
            </div>
          </div>

          {/* Métriques HERO */}
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-12 border-t border-white/5">
            {[
              { label: t("sales.kpi.revenue"), val: formatCurrency(salesData.ca.value), sub: `${salesData.ca.change > 0 ? '+' : ''}${salesData.ca.change}% ${t('sales.kpi.vs_previous')}`, icon: CurrencyDollarIcon, color: 'text-white' },
              { label: t("sales.kpi.invoices"), val: salesData.facturesEmises, sub: t('sales.kpi.validated_ops'), icon: DocumentArrowDownIcon, color: 'text-slate-400' },
              { label: t("sales.kpi.avg_basket"), val: formatCurrency(salesData.panierMoyen), sub: t('sales.kpi.avg_unit_value'), icon: ShoppingCartIcon, color: 'text-slate-400' },
              { label: t("sales.kpi.margin_rate"), val: salesData.margeBrute + '%', sub: t('sales.kpi.global_profitability'), icon: ChartPieIcon, color: 'text-slate-400' },
            ].map((m, i) => (
              <div key={i} className="group cursor-default border border-white/5 hover:border-white/20 transition-all rounded-[2rem] p-6 bg-white/[0.02]">
                <m.icon className={`h-5 w-5 ${m.color} mb-4 opacity-50`} />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{m.label}</p>
                <p className={`text-2xl font-black font-mono ${m.color} tracking-tighter`}>{m.val}</p>
                <p className="text-[10px] font-bold text-slate-600 mt-2 uppercase opacity-80">{m.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════ NAVIGATION ONGLETS ══════════════ */}
        <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm sticky top-4 z-20">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id
                ? 'bg-slate-950 text-white shadow-2xl'
                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════ CONTENU RAPPORT ══════════════ */}
        {activeTab === 'rapports' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Produits */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-950 rounded-2xl">
                      <StarIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t("sales.sections.top_products")}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 opacity-60">{t("sales.sections.product_performance")}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                    <ArrowDownTrayIcon className="h-5 w-5 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  {topProducts.map((p, i) => (
                    <div key={i} className="group relative bg-slate-50/50 hover:bg-slate-900 transition-all duration-300 p-6 rounded-[2rem] border border-slate-100 overflow-hidden">
                      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <span className="text-4xl font-black text-slate-200 group-hover:text-white/20 transition-colors italic">0{i + 1}</span>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 group-hover:text-slate-500 uppercase tracking-widest mb-1">{t('sales.client_metrics.units_sold', { count: p.quantity })}</p>
                            <h4 className="text-sm font-black text-slate-900 group-hover:text-white uppercase tracking-tight">{p.name}</h4>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black font-mono text-slate-900 group-hover:text-white leading-none tracking-tighter">{formatCurrency(p.sales)}</p>
                          <div className="flex items-center justify-end gap-1 mt-2">
                            {p.evolution > 0 ? <ArrowTrendingUpIcon className="h-3 w-3 text-slate-400" /> : <ArrowTrendingDownIcon className="h-3 w-3 text-slate-400" />}
                            <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-slate-300">{Math.abs(p.evolution)}%</span>
                          </div>
                        </div>
                      </div>
                      {/* Progress indicator */}
                      <div className="absolute bottom-0 left-0 h-1 bg-slate-900 group-hover:bg-white/30 transition-all" style={{ width: `${p.percentage}%` }} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Ventes par Catégorie */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 mb-10">
                  <div className="p-3 bg-slate-950 rounded-2xl">
                    <ChartPieIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t("sales.sections.categories_split")}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 opacity-60">{t("sales.sections.revenue_weight")}</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center space-y-10">
                  {salesByCategory.map((cat, idx) => (
                    <div key={idx} className="relative">
                      <div className="flex justify-between items-end mb-3">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                            {cat.category === 'Services' ? t('sales.categories.services') :
                             cat.category === 'Licences' ? t('sales.categories.licences') :
                             cat.category === 'Formations' ? t('sales.categories.formations') :
                             cat.category === 'Autres' ? t('sales.categories.autres') :
                             cat.category}
                          </p>
                          <p className="text-sm font-black text-slate-900 uppercase">{formatCurrency(cat.amount)}</p>
                        </div>
                        <p className="text-3xl font-black italic text-slate-100">{cat.percentage}%</p>
                      </div>
                      <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-950 rounded-full transition-all duration-1000" style={{ width: `${cat.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Metrics Clients */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: t("sales.client_metrics.active_clients"), val: clientMetrics.clientsActifs, sub: t("sales.client_metrics.total_base", { total: clientMetrics.totalClients }), icon: UserGroupIcon },
                { label: t("sales.client_metrics.new_clients"), val: clientMetrics.nouveauxClients, sub: t("sales.client_metrics.this_month"), icon: StarIcon },
                { label: t("sales.client_metrics.retention"), val: (clientMetrics.tauxFidelisation || 0).toFixed(1) + '%', sub: t("sales.client_metrics.recurring_clients"), icon: CheckCircleIcon },
                { label: t("sales.client_metrics.avg_dso"), val: clientMetrics.dsoMoyen + 'j', sub: t("sales.client_metrics.collection_delay"), icon: CalendarIcon },
              ].map((m, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 text-center flex flex-col items-center">
                  <div className="p-3 bg-slate-50 rounded-2xl mb-4 group hover:bg-slate-950 transition-all cursor-pointer">
                    <m.icon className="h-5 w-5 text-slate-900 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
                  <p className="text-3xl font-black font-mono text-slate-950 leading-none">{m.val}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase opacity-60">{m.sub}</p>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ══════════════ ANALYSE CLIENT ══════════════ */}
        {activeTab === 'analyse' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-950 rounded-2xl shadow-xl shadow-slate-900/10">
                    <UserGroupIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight italic">{t('sales.analysis.excellence_ranking')}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 opacity-60">{t('sales.analysis.ranking_desc')}</p>
                  </div>
                </div>
                <button
                  onClick={handleExportExcel}
                  className="px-6 py-3 bg-slate-50 text-slate-900 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  {t('sales.analysis.export_csv')}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topClients.map((client, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(`/clients?id=${client.id}`)}
                    className="group relative bg-white hover:bg-slate-50 border border-slate-100 hover:border-slate-900 transition-all duration-500 rounded-[2.5rem] p-8 overflow-hidden cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-slate-950/5 group-hover:bg-slate-950/10 -mr-8 -mt-8 rounded-full transition-all" />

                    <div className="flex items-start justify-between relative z-10 mb-8">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{t('sales.client_metrics.orders_validated', { count: client.orders })}</p>
                        <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{client.name}</h4>
                      </div>
                      <div className={`p-2 rounded-xl border ${client.trend > 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : client.trend < 0 ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                        {client.trend > 0 ? <ArrowTrendingUpIcon className="h-5 w-5" /> : client.trend < 0 ? <ArrowTrendingDownIcon className="h-5 w-5" /> : <InformationCircleIcon className="h-5 w-5" />}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 relative z-10">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('sales.analysis.total_sales')}</p>
                        <p className="text-xl font-black font-mono text-slate-900 tracking-tighter">{formatCurrency(client.sales)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('sales.analysis.avg_basket')}</p>
                        <p className="text-xl font-black font-mono text-slate-900 tracking-tighter">{formatCurrency(client.avgBasket)}</p>
                      </div>
                    </div>

                    <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter underline underline-offset-4 hover:text-slate-600 transition-colors">
                        {t('sales.analysis.view_details')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ COMPARATIF & PRÉVISIONS ══════════════ */}
        {activeTab === 'previsions' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-10">
                <div className="p-3 bg-slate-950 rounded-2xl shadow-xl shadow-slate-900/10">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight italic">{t('sales.forecast.predictive_analysis')}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 opacity-60">{t('sales.forecast.forecast_desc')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {forecasts.map((f, i) => (
                  <div key={i} className={`p-8 rounded-[2.5rem] border transition-all duration-500 ${f.actual > 0 ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 hover:border-slate-950 shadow-sm hover:shadow-2xl'}`}>
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {(() => {
                          const monthKey = f.month.toLowerCase().startsWith('jan') ? 'january' :
                                           f.month.toLowerCase().startsWith('fév') || f.month.toLowerCase().startsWith('feb') ? 'february' :
                                           f.month.toLowerCase().startsWith('mar') ? 'march' :
                                           f.month.toLowerCase().startsWith('avr') || f.month.toLowerCase().startsWith('apr') ? 'april' :
                                           f.month.toLowerCase().startsWith('mai') || f.month.toLowerCase().startsWith('may') ? 'may' :
                                           f.month.toLowerCase().startsWith('jun') ? 'june' : f.month;
                          return t(`common.months.${monthKey}`);
                        })()} 2024
                      </span>
                      {f.actual > 0 ? (
                        <div className="px-3 py-1 bg-slate-900 text-white rounded-full text-[8px] font-black uppercase tracking-tighter">{t('sales.forecast.realized')}</div>
                      ) : (
                        <div className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[8px] font-black uppercase tracking-tighter">{t('sales.forecast.projection')}</div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{t('sales.forecast.target_objective')}</p>
                        <p className="text-xl font-black font-mono text-slate-900 tracking-tighter">{formatCurrency(f.target)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{f.actual > 0 ? t('sales.forecast.realized_amount') : t('sales.forecast.expected_forecast')}</p>
                        <p className="text-2xl font-black font-mono text-slate-950 tracking-tighter">{formatCurrency(f.actual > 0 ? f.actual : f.forecast)}</p>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('sales.forecast.variance_target')}</p>
                        <span className="text-xs font-black font-mono text-slate-600">
                          {f.variance > 0 ? '+' : ''}{f.variance}%
                        </span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 rounded-full mt-3 overflow-hidden">
                        <div
                          className="h-full transition-all duration-1000 bg-slate-300"
                          style={{ width: `${Math.min(100, Math.max(10, 50 + f.variance))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 p-8 bg-slate-950 rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -mr-32 -mt-32 rounded-full blur-3xl text-white" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div>
                    <h4 className="text-white text-xl font-black uppercase tracking-tight italic mb-2">{t('sales.forecast.ai_recommendation')}</h4>
                    <p className="text-slate-400 text-sm max-w-xl">
                      {t('sales.forecast.growth_trend', { percent: '16.3' })}
                      {' '}
                      {t('sales.forecast.stock_increase', { category: t('sales.categories.services'), months: 'Mai/Juin' })}
                    </p>
                  </div>
                  <button
                    onClick={handleGenererAuditIA}
                    className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                  >
                    {t('sales.forecast.generate_audit')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ ACTIONS PIED DE PAGE ══════════════ */}
        <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-100">
          <button
            onClick={handleExportPDF}
            className="px-10 py-5 bg-slate-950 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            <PrinterIcon className="h-5 w-5" />
            {t('sales.actions.exportable_report')}
          </button>
          <button
            onClick={handleExportExcel}
            className="px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-50 transition-all flex items-center gap-3"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            {t('sales.actions.excel_file')}
          </button>
        </div>
      </div>

      {/* 🟢 MODAL AUDIT IA */}
      <Modal
        isOpen={isAiAuditModalOpen}
        onClose={() => setIsAiAuditModalOpen(false)}
        title="Audit Stratégique Commercial (LIA)"
        size="xl"
      >
        <div className="bg-slate-50 -m-6 p-10 min-h-[500px]">
          {isGeneratingAiAudit ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
                <SparklesIcon className="h-8 w-8 text-indigo-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">LIA analyse vos données commerciales...</p>
            </div>
          ) : aiAuditReport && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Score Efficacité</p>
                    <p className="text-5xl font-black text-indigo-600">{aiAuditReport.score}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100">Audit Temps Réel</div>
                </div>
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight max-w-md">{aiAuditReport.status}</h3>
                <p className="text-sm text-slate-500 font-medium mt-4 max-w-xl leading-relaxed">{aiAuditReport.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-4 w-4 text-orange-400" />
                    Points de Vigilance
                  </h4>
                  {aiAuditReport.risks.map((r: any, i: number) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <p className="text-xs font-black text-slate-900 uppercase mb-1">{r.title}</p>
                      <p className="text-xs text-slate-500">{r.message}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                    <ArrowTrendingUpIcon className="h-4 w-4 text-indigo-500" />
                    Opportunités de Croissance
                  </h4>
                  {aiAuditReport.opportunities.map((o: any, i: number) => (
                    <div key={i} className="bg-indigo-900 p-6 rounded-2xl shadow-xl shadow-indigo-950/20">
                      <p className="text-xs font-black text-white uppercase mb-1">{o.title}</p>
                      <p className="text-xs text-indigo-200">{o.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[2rem] flex items-center justify-between">
                <p className="text-slate-400 text-xs font-medium">Recommandation : <span className="text-white font-bold">Planifiez une revue de stock pour la catégorie "Services Conseil" sous 72h.</span></p>
                <button onClick={() => window.print()} className="px-6 py-3 bg-white text-slate-900 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all">Télécharger l'Audit</button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default VentesClients;
