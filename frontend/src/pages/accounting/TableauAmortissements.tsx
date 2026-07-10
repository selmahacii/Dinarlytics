import React, { useState, useMemo } from 'react';
import {
  CalculatorIcon,
  PlusIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CalendarIcon,
  BanknotesIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@shared/hooks/useTranslation';
import { useApp } from '@core/context/AppContext';
import { usePermission } from '@shared/hooks/usePermission';
import Modal from '@shared/components/UI/Modal';
import apiClient from '@/services/apiClient';

type ValoMethod = 'pmp' | 'fifo' | 'lifo';
type AmortMethod = 'lineaire' | 'degressif' | 'uop';
type AssetStatus = 'active' | 'fully_depreciated' | 'disposed';

interface Immobilisation {
  id: string; code: string; designation: string; categorie: string;
  dateAcquisition: string; dureeVie: number; valeurAcquisition: number;
  methode: AmortMethod; tauxAmort: number; valeurResiduelle: number;
  departement: string; fournisseur: string; status: AssetStatus;
  // Plan comptable codes
  comptePCA: string; compteIFRS: string;
}



const calculateDepreciation = (immo: Immobilisation, year: number): { amortCumul: number; amortAnnuel: number; valeurNette: number } => {
  const yearsElapsed = year;
  const valeurAmortissable = immo.valeurAcquisition - immo.valeurResiduelle;
  let amortAnnuel = 0, amortCumul = 0;

  if (immo.methode === 'lineaire') {
    amortAnnuel = valeurAmortissable / immo.dureeVie;
    amortCumul = Math.min(valeurAmortissable, amortAnnuel * yearsElapsed);
  } else if (immo.methode === 'degressif') {
    let valeurRestante = valeurAmortissable;
    for (let i = 0; i < yearsElapsed && i < immo.dureeVie; i++) {
      const annuel = valeurRestante * (immo.tauxAmort / 100);
      amortCumul += annuel;
      if (i === yearsElapsed - 1) amortAnnuel = annuel;
      valeurRestante -= annuel;
    }
    amortCumul = Math.min(amortCumul, valeurAmortissable);
  }

  return { amortAnnuel, amortCumul, valeurNette: immo.valeurAcquisition - amortCumul };
};

const TableauAmortissements: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency, planComptable } = useApp();
  const { has } = usePermission();

  const isIFRS = planComptable === 'international';
  const [activeTab, setActiveTab] = useState<'immobilisations' | 'tableau' | 'valorisation' | 'analytics'>('immobilisations');
  const [selectedImmo, setSelectedImmo] = useState<Immobilisation | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [methodeValo, setMethodeValo] = useState<ValoMethod>('pmp');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [assets, setAssets] = useState<Immobilisation[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stockLots, setStockLots] = useState<any[]>([]);
  const [valoResults, setValoResults] = useState<any>(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/amortissements');
        const data = response.data as { assets?: Immobilisation[]; summary?: any };
        setAssets(data.assets || []);
        setSummary(data.summary || null);

        const articlesRes = await apiClient.get<any[]>('/articles/');
        const articles = articlesRes.data || [];

        const lots = articles.filter((a: any) => (a.stock_quantity || 0) > 0).map((art: any) => ({
          date: new Date(art.created_at || Date.now()).toLocaleDateString('fr-FR'),
          qty: art.stock_quantity || 0,
          unitCost: art.cost_price || art.unit_price || 0,
          method: art.category || 'Standard'
        }));
        setStockLots(lots);

        const totalQty = articles.reduce((sum: number, a: any) => sum + (a.stock_quantity || 0), 0);
        const totalCostVal = articles.reduce((sum: number, a: any) => sum + ((a.stock_quantity || 0) * (a.cost_price || a.unit_price || 0)), 0);
        const avgUnitCost = totalQty > 0 ? totalCostVal / totalQty : 0;

        // Sans historique d'achats par lot, seul le CUMP est réellement
        // calculable : FIFO/LIFO exigent un suivi des lots d'entrée. On
        // affiche donc la même valorisation réelle avec une mention explicite,
        // au lieu d'inventer des écarts ±2% qui ne correspondent à rien.
        setValoResults({
          pmp:  { label: t('amort.valo.pmp_label') || 'CUMP (Coût Unitaire Moyen Pondéré)',  unitCost: avgUnitCost, totalValue: totalCostVal, impact: t('amort.valo.pmp_impact') || 'Lisse les variations de prix' },
          fifo: { label: t('amort.valo.fifo_label') || 'FIFO (Premier Entré, Premier Sorti)', unitCost: avgUnitCost, totalValue: totalCostVal, impact: 'Identique au CUMP — le suivi des lots d\'achat n\'est pas encore disponible' },
          lifo: { label: t('amort.valo.lifo_label') || 'LIFO (Dernier Entré, Premier Sorti)', unitCost: avgUnitCost, totalValue: totalCostVal, impact: 'Identique au CUMP — le suivi des lots d\'achat n\'est pas encore disponible' },
        });
      } catch (err) {
        console.error("Failed to fetch assets or articles", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  const currentYear = new Date().getFullYear();
  const categories = useMemo(() => [...new Set(assets.map(i => i.categorie))], [assets]);

  const enrichedImmos = useMemo(() => assets.map(immo => {
    const acqYear = new Date(immo.dateAcquisition).getFullYear();
    const yearsElapsed = currentYear - acqYear;
    const depr = calculateDepreciation(immo, yearsElapsed);
    return { ...immo, ...depr, yearsElapsed, tauxAmortActuel: Math.round((depr.amortCumul / (immo.valeurAcquisition - immo.valeurResiduelle)) * 100) };
  }), [assets]);

  const filtered = useMemo(() => {
    if (categoryFilter === 'all') return enrichedImmos;
    return enrichedImmos.filter(i => i.categorie === categoryFilter);
  }, [enrichedImmos, categoryFilter]);

  const kpis = useMemo(() => ({
    totalGross: summary?.totalBrut || assets.reduce((a, i) => a + i.valeurAcquisition, 0),
    totalNetBook: summary?.totalNet || enrichedImmos.reduce((a, i) => a + i.valeurNette, 0),
    totalDepreciated: summary?.amortCumule || enrichedImmos.reduce((a, i) => a + i.amortCumul, 0),
    annualCharge: summary?.dotationAnnuelle || enrichedImmos.reduce((a, i) => a + i.amortAnnuel, 0),
    aktiveCount: assets.filter(i => i.status === 'active').length,
    avgUsage: enrichedImmos.length > 0 ? Math.round(enrichedImmos.reduce((a, i) => a + i.tauxAmortActuel, 0) / enrichedImmos.length) : 0,
  }), [enrichedImmos, assets, summary]);

  const statusConfig = {
    active:            { label: t('amort.status.active'),            color: 'bg-emerald-100 text-emerald-700' },
    fully_depreciated: { label: t('amort.status.fully_depreciated'), color: 'bg-slate-100 text-slate-600' },
    disposed:          { label: t('amort.status.disposed'),          color: 'bg-red-100 text-red-700' }
  };

  const methodeAmort = {
    lineaire:   { label: t('amort.methods.lineaire'),   sub: t('amort.methods.lineaire_sub') },
    degressif:  { label: t('amort.methods.degressif'),  sub: t('amort.methods.degressif_sub') },
    uop:        { label: t('amort.methods.uop'),        sub: t('amort.methods.uop_sub') }
  };

  const defaultValoResults = {
    pmp:  { label: t('amort.valo.pmp_label'),  unitCost: 0, totalValue: 0, impact: t('amort.valo.pmp_impact') },
    fifo: { label: t('amort.valo.fifo_label'), unitCost: 0, totalValue: 0, impact: t('amort.valo.fifo_impact') },
    lifo: { label: t('amort.valo.lifo_label'), unitCost: 0, totalValue: 0, impact: t('amort.valo.lifo_impact') },
  };

  const selectedValo = valoResults ? valoResults[methodeValo] : defaultValoResults[methodeValo];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <CalculatorIcon className="h-7 w-7 text-indigo-600 mr-3" />
            {t('amort.title')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{t('amort.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Plan Comptable Badge */}
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${isIFRS ? 'bg-blue-50 border border-blue-200 text-blue-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
            <span className="w-2 h-2 rounded-full bg-current"/>
            {isIFRS ? t('amort.plan.ifrs') : t('amort.plan.pca')}
          </span>
          {has('comptabilite-write') && (
            <button className="flex items-center px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
              <PlusIcon className="h-4 w-4 mr-2" />{t('amort.add_btn')}
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: t('amort.kpi.gross'), value: formatCurrency(kpis.totalGross), color: 'text-slate-800' },
          { label: t('amort.kpi.net'), value: formatCurrency(kpis.totalNetBook), color: 'text-indigo-700' },
          { label: t('amort.kpi.cumul'), value: formatCurrency(kpis.totalDepreciated), color: 'text-red-600' },
          { label: t('amort.kpi.annual_charge'), value: formatCurrency(kpis.annualCharge), color: 'text-amber-700' },
          { label: t('amort.kpi.active'), value: kpis.aktiveCount, color: 'text-emerald-700' },
          { label: t('amort.kpi.avg_usage'), value: `${kpis.avgUsage}%`, color: 'text-slate-700' },
        ].map((k, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">{k.label}</p>
            <p className={`text-lg font-black ${k.color} truncate`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6">
          <nav className="flex gap-1 pt-2">
            {[
              { id: 'immobilisations', label: t('amort.tabs.assets') },
              { id: 'tableau', label: t('amort.tabs.schedule') },
              { id: 'valorisation', label: t('amort.tabs.valuation') },
              { id: 'analytics', label: t('amort.tabs.analytics') }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${activeTab === tab.id ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Assets Tab */}
        {activeTab === 'immobilisations' && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none">
                <option value="all">{t('amort.filter.all')}</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex gap-2">
                <button className="flex items-center px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50">
                  <PrinterIcon className="h-4 w-4 mr-2"/>{t('amort.actions.print')}
                </button>
                <button className="flex items-center px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50">
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2"/>{t('amort.actions.export')}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>{[t('amort.table.code'), t('amort.table.asset'), t('amort.table.category'), t('amort.table.acq_date'), t('amort.table.gross'), t('amort.table.cumul'), t('amort.table.net'), t('amort.table.usage'), t('amort.table.method'), isIFRS ? 'IFRS' : t('amort.table.pca'), t('amort.table.status'), ''].map((h, i) => (
                    <th key={i} className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(immo => {
                    const Cfg = statusConfig[immo.status];
                    return (
                      <tr key={immo.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-3 py-3 font-mono text-xs text-slate-500">{immo.code}</td>
                        <td className="px-3 py-3">
                          <div className="font-semibold text-slate-800 text-xs max-w-48 truncate">{immo.designation}</div>
                          <div className="text-[10px] text-slate-400">{immo.departement}</div>
                        </td>
                        <td className="px-3 py-3 text-xs text-slate-600">{immo.categorie}</td>
                        <td className="px-3 py-3 text-xs text-slate-600">{immo.dateAcquisition}</td>
                        <td className="px-3 py-3 text-xs font-semibold text-slate-800">{formatCurrency(immo.valeurAcquisition)}</td>
                        <td className="px-3 py-3 text-xs text-red-600 font-semibold">{formatCurrency(immo.amortCumul)}</td>
                        <td className="px-3 py-3 text-xs font-bold text-indigo-700">{formatCurrency(immo.valeurNette)}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-slate-100 rounded-full"><div className={`h-full rounded-full ${immo.tauxAmortActuel >= 80 ? 'bg-red-400' : immo.tauxAmortActuel >= 50 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{width: `${Math.min(immo.tauxAmortActuel, 100)}%`}}/></div>
                            <span className="text-[10px] font-bold text-slate-600">{immo.tauxAmortActuel}%</span>
                          </div>
                        </td>
                        <td className="px-3 py-3"><span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{methodeAmort[immo.methode].label}</span></td>
                        <td className="px-3 py-3"><span className="text-[10px] font-mono text-slate-500">{isIFRS ? immo.compteIFRS : immo.comptePCA}</span></td>
                        <td className="px-3 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${Cfg.color}`}>{Cfg.label}</span></td>
                        <td className="px-3 py-3">
                          <button onClick={() => { setSelectedImmo(immo as any); setIsDetailOpen(true); }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                            <EyeIcon className="h-4 w-4"/>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Depreciation Schedule Tab */}
        {activeTab === 'tableau' && selectedImmo && (
          <div className="p-6">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
              <p className="font-bold text-indigo-900">{selectedImmo.designation}</p>
              <p className="text-indigo-700 text-sm">{t('amort.schedule.caption')}: {methodeAmort[selectedImmo.methode].label} ({selectedImmo.tauxAmort}%)</p>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>{[t('amort.schedule.year'), t('amort.schedule.start_value'), t('amort.schedule.annual'), t('amort.schedule.cumul'), t('amort.schedule.end_value')].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Array(selectedImmo.dureeVie).fill(0).map((_, yr) => {
                    const yearNum = new Date(selectedImmo.dateAcquisition).getFullYear() + yr;
                    const prev = calculateDepreciation(selectedImmo, yr);
                    const curr = calculateDepreciation(selectedImmo, yr + 1);
                    const annualAmt = curr.amortCumul - prev.amortCumul;
                    const isCurrentYear = yearNum === currentYear;
                    return (
                      <tr key={yr} className={isCurrentYear ? 'bg-indigo-50' : 'hover:bg-slate-50'}>
                        <td className="px-4 py-3 font-bold text-slate-800 flex items-center gap-2">
                          {yearNum}{isCurrentYear && <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">{t('amort.schedule.current')}</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatCurrency(selectedImmo.valeurAcquisition - prev.amortCumul)}</td>
                        <td className="px-4 py-3 text-red-600 font-semibold">{formatCurrency(annualAmt)}</td>
                        <td className="px-4 py-3 text-slate-700">{formatCurrency(curr.amortCumul)}</td>
                        <td className="px-4 py-3 font-bold text-indigo-700">{formatCurrency(selectedImmo.valeurAcquisition - curr.amortCumul)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'tableau' && !selectedImmo && (
          <div className="p-12 text-center">
            <DocumentTextIcon className="h-12 w-12 mx-auto text-slate-300 mb-4"/>
            <p className="text-slate-500 font-semibold">{t('amort.schedule.select_asset')}</p>
            <button onClick={() => setActiveTab('immobilisations')} className="mt-4 px-4 py-2 text-sm font-semibold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50">
              {t('amort.schedule.go_to_assets')}
            </button>
          </div>
        )}

        {/* Valuation Tab */}
        {activeTab === 'valorisation' && (
          <div className="p-6 space-y-6">
            <div className="bg-white">
              <h3 className="font-bold text-slate-800 mb-1">{t('amort.valo.title')}</h3>
              <p className="text-slate-500 text-sm mb-6">{t('amort.valo.subtitle')}</p>
              
              {/* Method Selector */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {(['pmp','fifo','lifo'] as ValoMethod[]).map(m => {
                  const v = valoResults ? valoResults[m] : defaultValoResults[m];
                  return (
                    <button key={m} onClick={() => setMethodeValo(m)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${methodeValo === m ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white hover:border-slate-400'}`}>
                      <p className={`font-black text-base ${methodeValo === m ? 'text-white' : 'text-slate-800'}`}>{m.toUpperCase()}</p>
                      <p className={`text-[11px] font-semibold mt-0.5 uppercase tracking-wide ${methodeValo === m ? 'text-slate-400' : 'text-slate-500'}`}>{v.label}</p>
                    </button>
                  );
                })}
              </div>

              {/* Result */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('amort.valo.unit_cost')}</p>
                  <p className="text-3xl font-black text-slate-900">{formatCurrency(selectedValo.unitCost)}</p>
                </div>
                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-200">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">{t('amort.valo.stock_value')}</p>
                  <p className="text-3xl font-black text-indigo-900">{formatCurrency(selectedValo.totalValue)}</p>
                  <p className="text-[11px] text-indigo-600 mt-1">{stockLots.reduce((sum, lot) => sum + lot.qty, 0)} {t('amort.valo.units')}</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                  <p className="text-[10px] font-bold text-amber-500 uppercase mb-1">{t('amort.valo.fiscal_impact')}</p>
                  <p className="text-sm font-bold text-amber-900 leading-relaxed">{selectedValo.impact}</p>
                </div>
              </div>

              {/* Lots detail */}
              <div className="mt-6">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">{t('amort.valo.lots_detail')}</h4>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50"><tr>
                      {[t('amort.valo.lot_date'), t('amort.valo.lot_qty'), t('amort.valo.lot_cost'), t('amort.valo.lot_total')].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {stockLots.map((lot, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-600">{lot.date}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">{lot.qty} {t('amort.valo.units')}</td>
                          <td className="px-4 py-3 text-slate-700">{formatCurrency(lot.unitCost)}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(lot.qty * lot.unitCost)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-slate-800 mb-4">{t('amort.analytics.by_category')}</h4>
              {categories.map(cat => {
                const catImmos = enrichedImmos.filter(i => i.categorie === cat);
                const totalGross = catImmos.reduce((a, i) => a + i.valeurAcquisition, 0);
                const totalNet = catImmos.reduce((a, i) => a + i.valeurNette, 0);
                const globalGross = kpis.totalGross;
                return (
                  <div key={cat} className="mb-3">
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-700">{cat}</span>
                      <span className="text-slate-900">{formatCurrency(totalNet)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full relative">
                      <div className="h-full bg-slate-300 rounded-full absolute top-0 left-0" style={{width: `${(totalGross/globalGross)*100}%`}}/>
                      <div className="h-full bg-indigo-500 rounded-full absolute top-0 left-0" style={{width: `${(totalNet/globalGross)*100}%`}}/>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>{t('amort.analytics.gross')}: {formatCurrency(totalGross)}</span>
                      <span>{catImmos.length} {t('amort.analytics.assets')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-4">{t('amort.analytics.depreciation_rate')}</h4>
              {enrichedImmos.sort((a, b) => b.tauxAmortActuel - a.tauxAmortActuel).slice(0, 6).map((immo, i) => (
                <div key={i} className="mb-3">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700 truncate max-w-40">{immo.code} — {immo.categorie}</span>
                    <span className={`font-black ${immo.tauxAmortActuel >= 80 ? 'text-red-600' : immo.tauxAmortActuel >= 50 ? 'text-amber-600' : 'text-emerald-600'}`}>{immo.tauxAmortActuel}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full">
                    <div className={`h-full rounded-full ${immo.tauxAmortActuel >= 80 ? 'bg-red-400' : immo.tauxAmortActuel >= 50 ? 'bg-amber-400' : 'bg-emerald-400'}`} style={{width: `${immo.tauxAmortActuel}%`}}/>
                  </div>
                </div>
              ))}
              {enrichedImmos.filter(i => i.tauxAmortActuel >= 80).length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5"/>
                  <p className="text-xs text-red-700 font-semibold">
                    {enrichedImmos.filter(i => i.tauxAmortActuel >= 80).length} {t('amort.analytics.renewal_alert')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedImmo && (
        <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`${selectedImmo.code} — ${selectedImmo.designation}`} size="lg">
          <div className="p-2 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t('amort.detail.category'), value: selectedImmo.categorie },
                { label: t('amort.detail.method'), value: methodeAmort[selectedImmo.methode].label },
                { label: t('amort.detail.duration'), value: `${selectedImmo.dureeVie} ans` },
                { label: t('amort.detail.rate'), value: `${selectedImmo.tauxAmort}%` },
                { label: t('amort.detail.department'), value: selectedImmo.departement },
                { label: t('amort.detail.supplier'), value: selectedImmo.fournisseur },
                { label: isIFRS ? 'IFRS Standard' : t('amort.detail.pca_account'), value: isIFRS ? selectedImmo.compteIFRS : selectedImmo.comptePCA },
                { label: t('amort.detail.residual'), value: formatCurrency(selectedImmo.valeurResiduelle) },
              ].map(({ label, value }, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</p>
                  <p className="font-semibold text-slate-800 text-sm">{value}</p>
                </div>
              ))}
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 grid grid-cols-3 gap-4">
              <div><p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">{t('amort.detail.gross')}</p><p className="text-lg font-black text-indigo-900">{formatCurrency(selectedImmo.valeurAcquisition)}</p></div>
              <div><p className="text-[10px] font-bold text-red-400 uppercase mb-1">{t('amort.detail.cumul')}</p><p className="text-lg font-black text-red-700">-{formatCurrency((selectedImmo as any).amortCumul)}</p></div>
              <div><p className="text-[10px] font-bold text-slate-600 uppercase mb-1">{t('amort.detail.net')}</p><p className="text-lg font-black text-slate-900">{formatCurrency((selectedImmo as any).valeurNette)}</p></div>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button onClick={() => { setIsDetailOpen(false); setActiveTab('tableau'); }}
                className="flex items-center px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800">
                <ChartBarIcon className="h-4 w-4 mr-2"/>{t('amort.detail.view_schedule')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TableauAmortissements;
