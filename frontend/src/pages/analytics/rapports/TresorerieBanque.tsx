import React, { useState } from 'react';
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  ShareIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ChartPieIcon,
  BuildingLibraryIcon,
  BellIcon,
  ScaleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
  SparklesIcon,
  CalendarIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';
import { useTreasuryReports } from '@shared/hooks/useTreasuryReports';

const fmt = (n: number) =>
  new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(n) + ' DA';

const fmtK = (n: number) => `${Math.round(n / 1000)}k DA`;

// ─────────────────────────────────────────────
// DONNÉES COHÉRENTES — exercice Jan-Jun 2024
// ─────────────────────────────────────────────
const monthlyFlows = [
  { month: 'Jan', enc: 850_000, dec: 620_000, solde: 230_000 },
  { month: 'Fév', enc: 920_000, dec: 680_000, solde: 240_000 },
  { month: 'Mar', enc: 980_000, dec: 720_000, solde: 260_000 },
  { month: 'Avr', enc: 890_000, dec: 650_000, solde: 240_000 },
  { month: 'Mai', enc: 1_050_000, dec: 780_000, solde: 270_000 },
  { month: 'Jun', enc: 1_100_000, dec: 820_000, solde: 280_000 },
];

const TOTAL_ENC = monthlyFlows.reduce((s, m) => s + m.enc, 0); // 5 790 000
const TOTAL_DEC = monthlyFlows.reduce((s, m) => s + m.dec, 0); // 4 270 000
const TOTAL_SOLDE = monthlyFlows.reduce((s, m) => s + m.solde, 0); // 1 520 000

const SOLDE_BANQUE = 1_850_000;
const SOLDE_CAISSE = 580_000;
const SOLDE_EPARGNE = 850_000;
const SOLDE_OPS = 750_000;
const SOLDE_TOTAL = SOLDE_BANQUE + SOLDE_CAISSE + SOLDE_EPARGNE + SOLDE_OPS; // 4 030 000
const RATIO_LIQUIDITE = 1.85;
const DSO = 28; // Days Sales Outstanding
const DPO = 35; // Days Payable Outstanding
const COUVERTURE = 45; // jours de charges couvertes
const CAF = 320_000; // Capacité d'autofinancement
const BFR = 720_000; // Besoin en Fonds de Roulement
const FR = 2_100_000; // Fonds de Roulement

const bankAccounts = [
  { name: 'Compte Principal BNA', no: '****7892', type: 'Courant', solde: SOLDE_BANQUE, variation: +8.5, mvt: 45, icon: BuildingLibraryIcon },
  { name: 'Compte Opérationnel CPA', no: '****3421', type: 'Courant', solde: SOLDE_OPS, variation: -3.2, mvt: 32, icon: BuildingLibraryIcon },
  { name: 'Caisse Principale', no: 'CAISSE-01', type: 'Caisse', solde: SOLDE_CAISSE, variation: +15.2, mvt: 68, icon: BanknotesIcon },
  { name: 'Compte Épargne BEA', no: '****9156', type: 'Épargne', solde: SOLDE_EPARGNE, variation: +2.1, mvt: 8, icon: BuildingLibraryIcon },
];

const recentMovements = [
  { date: '15/01/2024', type: 'Encaissement', libelle: 'Paiement Client — Ooredoo Algérie', compte: 'BNA', montant: 150_000 },
  { date: '15/01/2024', type: 'Décaissement', libelle: 'Fournisseur — Global Logistics Algérie', compte: 'CPA', montant: -85_000 },
  { date: '15/01/2024', type: 'Encaissement', libelle: 'Virement Client — Sonatrach', compte: 'BNA', montant: 220_000 },
  { date: '14/01/2024', type: 'Décaissement', libelle: 'Salaires & charges sociales', compte: 'CPA', montant: -350_000 },
  { date: '14/01/2024', type: 'Transfert', libelle: 'Transfert interne BNA → CPA', compte: 'BNA', montant: -100_000 },
  { date: '14/01/2024', type: 'Encaissement', libelle: 'Règlement espèces — Djezzy', compte: 'Caisse', montant: 45_000 },
];

const tensions = [
  { date: '05/02/2024', type: 'Tension de trésorerie', desc: 'Solde prévu < 100k DA', montant: 85_000, sev: 'warning', action: 'Négocier délais fournisseurs' },
  { date: '15/02/2024', type: 'Échéance importante', desc: 'Salaires + charges sociales', montant: 420_000, sev: 'critical', action: 'Préparer virement sous 48h' },
  { date: '20/02/2024', type: 'Pic de dépenses', desc: 'Factures fournisseurs lourdes', montant: 380_000, sev: 'warning', action: 'Surveiller les encaissements' },
];

const forecasts = [
  { month: 'Juil', prevu: 290_000, reel: null, risque: 'Faible', confiance: 'Élevée', enc: 1_180_000, dec: 890_000 },
  { month: 'Août', prevu: 200_000, reel: null, risque: 'Moyen', confiance: 'Moyenne', enc: 1_050_000, dec: 850_000 },
  { month: 'Sep', prevu: 330_000, reel: null, risque: 'Faible', confiance: 'Élevée', enc: 1_250_000, dec: 920_000 },
];

// ─────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────
const TresorerieBanque: React.FC = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<'flux' | 'comptes' | 'previsions'>('flux');
  const [showRapport, setShowRapport] = useState(false);

  const tabs = [
    { id: 'flux' as const, label: 'Flux de Trésorerie', icon: CurrencyDollarIcon },
    { id: 'comptes' as const, label: 'Comptes & Caisses', icon: BuildingLibraryIcon },
    { id: 'previsions' as const, label: 'Prévisions & Tensions', icon: ClockIcon },
  ];

  // Cumul mensuel du solde
  let cumul = 0;
  const cumulData = monthlyFlows.map(m => { cumul += m.solde; return { ...m, cumul }; });

  // ── Export PDF ───────────────────────────────
  const handleExportPDF = () => {
    const style = document.createElement('style');
    style.id = '__print_override';
    style.innerHTML = `
      @media print {
        body > *:not(#tresorerie-print-root) { display: none !important; }
        #tresorerie-print-root { display: block !important; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => document.getElementById('__print_override')?.remove(), 1000);
  };

  // ── Export Excel (CSV) ───────────────────────
  const handleExportExcel = () => {
    const BOM = '\uFEFF';
    const sep = ';';
    const rows: string[][] = [
      ['RAPPORT TRÉSORERIE & BANQUE — Exercice 2024'],
      ['Généré le', new Date().toLocaleDateString('fr-DZ')],
      [],
      ['=== FLUX MENSUELS ==='],
      ['Mois', 'Encaissements (DA)', 'Décaissements (DA)', 'Solde Net (DA)', 'Ratio E/D (%)'],
      ...monthlyFlows.map(m => [
        m.month,
        m.enc.toString(),
        m.dec.toString(),
        m.solde.toString(),
        Math.round((m.enc / m.dec) * 100).toString(),
      ]),
      ['TOTAL', TOTAL_ENC.toString(), TOTAL_DEC.toString(), TOTAL_SOLDE.toString(), Math.round((TOTAL_ENC / TOTAL_DEC) * 100).toString()],
      [],
      ['=== COMPTES BANCAIRES ==='],
      ['Compte', 'Numéro', 'Type', 'Solde (DA)', 'Variation (%)', 'Mouvements'],
      ...bankAccounts.map(a => [a.name, a.no, a.type, a.solde.toString(), a.variation.toString(), a.mvt.toString()]),
      [],
      ['=== INDICATEURS FINANCIERS ==='],
      ['Indicateur', 'Valeur'],
      ['Ratio de liquidité', RATIO_LIQUIDITE.toString()],
      ['Délai moyen encaissement (j)', DSO.toString()],
      ['Délai moyen décaissement (j)', DPO.toString()],
      ['Couverture trésorerie (j)', COUVERTURE.toString()],
      ['Fonds de Roulement (DA)', FR.toString()],
      ['Besoin en Fonds de Roulement (DA)', BFR.toString()],
      ['Capacité d\'autofinancement (DA)', CAF.toString()],
      [],
      ['=== PRÉVISIONS 3 MOIS ==='],
      ['Mois', 'Encaissements prévus (DA)', 'Décaissements prévus (DA)', 'Solde net prévu (DA)', 'Risque', 'Confiance'],
      ...forecasts.map(f => [f.month, f.enc.toString(), f.dec.toString(), f.prevu.toString(), f.risque, f.confiance]),
    ];
    const csv = BOM + rows.map(r => r.join(sep)).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Tresorerie_Banque_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Partager ─────────────────────────────────
  const handleShare = async () => {
    const text = `Rapport Trésorerie & Banque — ${new Date().toLocaleDateString('fr-DZ')}\n` +
      `Encaissements S1 : ${fmt(TOTAL_ENC)}\n` +
      `Décaissements S1 : ${fmt(TOTAL_DEC)}\n` +
      `Solde net : +${fmt(TOTAL_SOLDE)}\n` +
      `Solde bancaire total : ${fmt(SOLDE_TOTAL)}\n` +
      `Ratio liquidité : ${RATIO_LIQUIDITE}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Trésorerie & Banque', text }); } catch { }
    } else {
      await navigator.clipboard.writeText(text);
      alert('Résumé copié dans le presse-papiers !');
    }
  };

  return (
    <div className="space-y-8">

      {/* ══════════════ HERO HEADER ══════════════ */}
      <div className="bg-slate-900 text-white p-12 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)]" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Gestion Financière</p>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Trésorerie & Banque</h1>
            <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-[0.3em] opacity-80 decoration-slate-600 underline underline-offset-8">
              Analyse des Flux · Comptes Bancaires · Prévisions — Exercice 2024
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-2xl shadow-white/10"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Export PDF
            </button>
            <button
              onClick={handleShare}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 active:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center gap-2"
            >
              <ShareIcon className="h-4 w-4" />
              Partager
            </button>
          </div>
        </div>

        {/* Métriques synthèse */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-10 border-t border-white/5">
          {[
            { label: 'Encaissements', val: fmt(TOTAL_ENC), sub: 'Jan → Jun 2024', icon: ArrowTrendingUpIcon },
            { label: 'Décaissements', val: fmt(TOTAL_DEC), sub: 'Jan → Jun 2024', icon: ArrowTrendingDownIcon },
            { label: 'Solde Net', val: '+' + fmt(TOTAL_SOLDE), sub: 'Flux net positif', icon: ScaleIcon },
            { label: 'Solde Banque', val: fmt(SOLDE_TOTAL), sub: 'Tous comptes', icon: BuildingLibraryIcon },
          ].map((m, i) => (
            <div key={i} className="border border-white/5 rounded-2xl p-5">
              <m.icon className="h-5 w-5 text-slate-500 mb-3" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">{m.label}</p>
              <p className="text-xl font-black font-mono text-white">{m.val}</p>
              <p className="text-[10px] text-slate-500 mt-1">{m.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════ ONGLETS ══════════════ */}
      <div className="flex gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id
              ? 'bg-slate-900 text-white shadow-lg'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          VUE 1 — FLUX DE TRÉSORERIE
      ══════════════════════════════════════ */}
      {activeTab === 'flux' && (
        <div className="space-y-8">

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
            {[
              { label: 'Encaissements', val: fmt(TOTAL_ENC), sub: '+12.5% vs S1-2023', icon: ArrowTrendingUpIcon },
              { label: 'Décaissements', val: fmt(TOTAL_DEC), sub: 'Paiements cumulés', icon: ArrowTrendingDownIcon },
              { label: 'Solde Net', val: '+' + fmt(TOTAL_SOLDE), sub: 'Flux net positif', icon: CheckCircleIcon },
              { label: 'Solde Bancaire', val: fmt(SOLDE_TOTAL), sub: '4 comptes actifs', icon: BanknotesIcon },
              { label: 'Liquidité', val: RATIO_LIQUIDITE.toFixed(2), sub: 'Ratio excellent', icon: ScaleIcon },
            ].map((kpi, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl w-fit mb-4">
                  <kpi.icon className="h-5 w-5 text-slate-900 dark:text-white" />
                </div>
                <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">{kpi.label}</p>
                <p className="text-xl font-black font-mono text-slate-900 dark:text-white leading-none">{kpi.val}</p>
                <p className="text-xs font-medium text-slate-400 mt-2">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* Graphique barres + courbe */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Évolution des Flux de Trésorerie — S1 2024</h2>
              <div className="flex gap-6">
                {[['bg-slate-900 dark:bg-white', 'Encaissements'], ['bg-slate-300', 'Décaissements'], ['', 'Solde net ●']].map(([cls, lbl]) => (
                  <div key={lbl} className="flex items-center gap-2">
                    {cls && <div className={`w-6 h-1.5 ${cls} rounded`} />}
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{lbl}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-72">
              <svg className="w-full h-full" viewBox="0 0 700 260" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="encG" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#334155" />
                  </linearGradient>
                  <linearGradient id="decG" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                  </linearGradient>
                </defs>
                {/* Grille */}
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <g key={i}>
                    <line x1="50" y1={10 + i * 40} x2="680" y2={10 + i * 40} stroke="#f1f5f9" strokeWidth="1" />
                    <text x="42" y={15 + i * 40} fill="#94a3b8" fontSize="11" fontWeight="700" textAnchor="end">{(5 - i) * 200}k</text>
                  </g>
                ))}
                {/* Barres */}
                {monthlyFlows.map((m, i) => {
                  const x = 70 + i * 100;
                  const maxV = 1_200_000;
                  const hE = (m.enc / maxV) * 210;
                  const hD = (m.dec / maxV) * 210;
                  const hS = (m.solde / maxV) * 210;
                  return (
                    <g key={i}>
                      <rect x={x} y={220 - hE} width="22" height={hE} fill="url(#encG)" rx="3" />
                      <rect x={x + 25} y={220 - hD} width="22" height={hD} fill="url(#decG)" rx="3" />
                      <circle cx={x + 11} cy={220 - hS} r="5" fill="#0f172a" />
                      <text x={x + 22} y="240" fill="#475569" fontSize="12" fontWeight="800" textAnchor="middle">{m.month}</text>
                    </g>
                  );
                })}
                {/* Courbe solde net */}
                <polyline
                  points={monthlyFlows.map((m, i) => `${81 + i * 100},${220 - (m.solde / 1_200_000) * 210}`).join(' ')}
                  fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6,4"
                />
              </svg>
            </div>

            {/* Totaux */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              {[
                { label: 'Total Encaissements', val: fmt(TOTAL_ENC), cls: 'text-slate-900 dark:text-white' },
                { label: 'Total Décaissements', val: '-' + fmt(TOTAL_DEC), cls: 'text-slate-500' },
                { label: 'Solde Net Cumulé', val: '+' + fmt(TOTAL_SOLDE), cls: 'text-slate-900 dark:text-white' },
              ].map((s, i) => (
                <div key={i} className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">{s.label}</p>
                  <p className={`text-lg font-black font-mono ${s.cls}`}>{s.val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tableau détaillé */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Tableau Détaillé des Flux Mensuels</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr>
                    {['Mois', 'Encaissements', 'Décaissements', 'Solde Net', 'Ratio E/D', 'Statut'].map(h => (
                      <th key={h} className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left last:text-center">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {monthlyFlows.map((m, i) => {
                    const ratio = Math.round((m.enc / m.dec) * 100);
                    return (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 text-xs font-black text-slate-900 dark:text-white">{m.month}</td>
                        <td className="px-6 py-4 text-xs font-bold font-mono text-slate-900">+{m.enc.toLocaleString()} DA</td>
                        <td className="px-6 py-4 text-xs font-bold font-mono text-slate-400">-{m.dec.toLocaleString()} DA</td>
                        <td className="px-6 py-4 text-xs font-black font-mono text-slate-900 dark:text-white">+{m.solde.toLocaleString()} DA</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{ratio}%</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {m.solde >= 260_000
                            ? <CheckCircleIcon className="h-5 w-5 text-slate-900 dark:text-white inline" />
                            : <InformationCircleIcon className="h-5 w-5 text-slate-400 inline" />
                          }
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 dark:bg-slate-800/50 border-t-2 border-slate-200 dark:border-slate-700">
                  <tr>
                    <td className="px-6 py-4 text-xs font-black text-slate-900 dark:text-white">TOTAL</td>
                    <td className="px-6 py-4 text-xs font-black font-mono text-slate-900 dark:text-white">+{TOTAL_ENC.toLocaleString()} DA</td>
                    <td className="px-6 py-4 text-xs font-black font-mono text-slate-400">-{TOTAL_DEC.toLocaleString()} DA</td>
                    <td className="px-6 py-4 text-xs font-black font-mono text-slate-900 dark:text-white">+{TOTAL_SOLDE.toLocaleString()} DA</td>
                    <td className="px-6 py-4 text-xs font-black text-slate-900 dark:text-white">{Math.round((TOTAL_ENC / TOTAL_DEC) * 100)}%</td>
                    <td className="px-6 py-4 text-center"><CheckCircleIcon className="h-5 w-5 text-slate-900 dark:text-white inline" /></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Ratios financiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: 'Ratio de liquidité', val: RATIO_LIQUIDITE, unit: '', target: '> 1.5', status: 'excellent', pct: 100, desc: 'Capacité à payer les dettes court terme' },
              { label: 'Délai moyen encaissement', val: DSO, unit: ' jours', target: '< 30j', status: 'bon', pct: 85, desc: 'Délai moyen de recouvrement clients' },
              { label: 'Délai moyen décaissement', val: DPO, unit: ' jours', target: '30–45j', status: 'optimal', pct: 90, desc: 'Délai moyen de paiement fournisseurs' },
              { label: 'Couverture de trésorerie', val: COUVERTURE, unit: ' jours', target: '> 30j', status: 'excellent', pct: 100, desc: 'Jours de charges courantes couvertes' },
            ].map((r, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{r.label}</span>
                  <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500">{r.status}</span>
                </div>
                <div className="flex items-end justify-between mb-4">
                  <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">{r.val}{r.unit}</span>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest">Cible</p>
                    <p className="text-xs font-black text-slate-600 dark:text-slate-300">{r.target}</p>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-3">
                  <div
                    className="h-2 bg-slate-900 dark:bg-white rounded-full transition-all duration-1000"
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">{r.desc}</p>
              </div>
            ))}
          </div>

          {/* Décomposition flux */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Encaissements */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Décomposition Encaissements</h3>
              <div className="space-y-4">
                {[
                  { label: 'Ventes clients', pct: 62, mont: Math.round(TOTAL_ENC * 0.62) },
                  { label: 'Créances recouvrées', pct: 28, mont: Math.round(TOTAL_ENC * 0.28) },
                  { label: 'Autres produits', pct: 10, mont: Math.round(TOTAL_ENC * 0.10) },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black font-mono text-slate-900 dark:text-white">{item.pct}%</span>
                        <span className="text-[10px] text-slate-400">{item.mont.toLocaleString()} DA</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div className="h-2 bg-slate-900 dark:bg-white rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Décaissements */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Décomposition Décaissements</h3>
              <div className="space-y-4">
                {[
                  { label: 'Achats fournisseurs', pct: 45, mont: Math.round(TOTAL_DEC * 0.45) },
                  { label: 'Salaires & charges', pct: 32, mont: Math.round(TOTAL_DEC * 0.32) },
                  { label: 'Charges fixes', pct: 15, mont: Math.round(TOTAL_DEC * 0.15) },
                  { label: 'Autres dépenses', pct: 8, mont: Math.round(TOTAL_DEC * 0.08) },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-slate-700 dark:text-slate-300">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black font-mono text-slate-900 dark:text-white">{item.pct}%</span>
                        <span className="text-[10px] text-slate-400">{item.mont.toLocaleString()} DA</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div className="h-2 bg-slate-400 dark:bg-slate-500 rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Indicateurs de Santé Financière */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Indicateurs de Santé Financière</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Fonds de Roulement', val: fmt(FR), status: 'excellent', icon: BanknotesIcon, desc: 'Ressources stables > Emplois LT' },
                { label: 'Besoin en Fonds de Roulement', val: fmt(BFR), status: 'bon', icon: ScaleIcon, desc: 'Décalage financement court terme' },
                { label: 'Capacité Autofinancement', val: fmt(CAF), status: 'bon', icon: CurrencyDollarIcon, desc: 'Résultat net + dotations' },
                { label: 'Cycle de Trésorerie', val: `${DSO - DPO + 7} j`, status: 'optimal', icon: ClockIcon, desc: `DSO ${DSO}j − DPO ${DPO}j + stock 7j` },
              ].map((ind, idx) => (
                <div key={idx} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <ind.icon className="h-4 w-4 text-slate-900 dark:text-white" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{ind.status}</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">{ind.label}</p>
                  <p className="text-lg font-black font-mono text-slate-900 dark:text-white">{ind.val}</p>
                  <p className="text-[9px] text-slate-400 mt-2">{ind.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          VUE 2 — COMPTES & CAISSES
      ══════════════════════════════════════ */}
      {activeTab === 'comptes' && (
        <div className="space-y-8">

          {/* Synthèse */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Solde Total', val: fmt(SOLDE_TOTAL), sub: 'Tous comptes actifs', icon: BanknotesIcon },
              { label: 'Comptes', val: bankAccounts.length.toString(), sub: '2 bancaires + 1 caisse + 1 épargne', icon: BuildingLibraryIcon },
              { label: 'Mouvements', val: bankAccounts.reduce((s, a) => s + a.mvt, 0).toString(), sub: 'Ce mois-ci', icon: ArrowPathIcon },
            ].map((k, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <k.icon className="h-6 w-6 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider">{k.label}</p>
                  <p className="text-2xl font-black font-mono text-slate-900 dark:text-white">{k.val}</p>
                  <p className="text-[10px] text-slate-400">{k.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Détail comptes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bankAccounts.map((acc, i) => {
              const total = bankAccounts.reduce((s, a) => s + a.solde, 0);
              const pct = ((acc.solde / total) * 100).toFixed(1);
              const Icon = acc.icon;
              return (
                <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all group">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center">
                        <Icon className="h-5 w-5 text-white dark:text-slate-900" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{acc.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">{acc.no} · {acc.type}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-1 rounded-lg uppercase tracking-widest">Actif</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-4">
                    <p className="text-[10px] text-slate-400 mb-1">Solde actuel</p>
                    <p className="text-2xl font-black font-mono text-slate-900 dark:text-white">{acc.solde.toLocaleString()} DA</p>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-3">
                    <div className="h-1.5 bg-slate-900 dark:bg-white rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-black text-slate-500">{pct}% du total</span>
                    <div className="flex items-center gap-1">
                      {acc.variation > 0
                        ? <ArrowTrendingUpIcon className="h-3.5 w-3.5 text-slate-900" />
                        : <ArrowTrendingDownIcon className="h-3.5 w-3.5 text-slate-300" />
                      }
                      <span className={`font-black ${acc.variation > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-300'}`}>
                        {acc.variation > 0 ? '+' : ''}{acc.variation}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Répartition */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Répartition par Compte</h3>
            <div className="space-y-4">
              {bankAccounts.map((acc, i) => {
                const total = bankAccounts.reduce((s, a) => s + a.solde, 0);
                const pct = ((acc.solde / total) * 100);
                return (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase w-48 tracking-tight shrink-0">{acc.name}</span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                      <div
                        className="h-4 bg-slate-900 dark:bg-white rounded-full flex items-center justify-end pr-2 transition-all duration-1000"
                        style={{ width: `${pct}%` }}
                      >
                        <span className="text-[9px] font-black text-white dark:text-slate-900">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <span className="text-xs font-black font-mono text-slate-900 dark:text-white w-32 text-right shrink-0">{acc.solde.toLocaleString()} DA</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mouvements récents */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Derniers Mouvements</h3>
            </div>
            <table className="w-full border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  {['Date', 'Type', 'Libellé', 'Compte', 'Montant', 'Statut'].map(h => (
                    <th key={h} className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentMovements.map((mv, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 text-[10px] font-bold font-mono text-slate-500">{mv.date}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${mv.type === 'Encaissement' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' :
                        mv.type === 'Décaissement' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>{mv.type}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">{mv.libelle}</td>
                    <td className="px-6 py-4 text-[10px] text-slate-400">{mv.compte}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`text-xs font-black font-mono ${mv.montant > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                        {mv.montant > 0 ? '+' : ''}{mv.montant.toLocaleString()} DA
                      </span>
                    </td>
                    <td className="px-6 py-4"><CheckCircleIcon className="h-5 w-5 text-slate-900 dark:text-white" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          VUE 3 — PRÉVISIONS & TENSIONS
      ══════════════════════════════════════ */}
      {activeTab === 'previsions' && (
        <div className="space-y-8">

          {/* Alertes KPI */}
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: 'Alertes Critiques', val: tensions.filter(t => t.sev === 'critical').length.toString(), sub: 'Action immédiate requise', icon: ExclamationTriangleIcon, pulse: true },
              { label: 'Avertissements', val: tensions.filter(t => t.sev === 'warning').length.toString(), sub: 'Surveillance requise', icon: BellIcon, pulse: false },
              { label: 'Ratio Liquidité', val: RATIO_LIQUIDITE.toFixed(2), sub: 'Cible : > 1.5 — Excellent', icon: ScaleIcon, pulse: false },
            ].map((k, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                <div className="relative">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <k.icon className="h-6 w-6 text-slate-900 dark:text-white" />
                  </div>
                  {k.pulse && <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-slate-900 animate-ping dark:bg-white" />}
                </div>
                <div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider">{k.label}</p>
                  <p className="text-2xl font-black font-mono text-slate-900 dark:text-white">{k.val}</p>
                  <p className="text-[10px] text-slate-400">{k.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tensions identifiées */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Tensions & Alertes Identifiées</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {tensions.map((t, i) => (
                <div key={i} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${t.sev === 'critical' ? 'bg-slate-900 dark:bg-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    {t.sev === 'critical'
                      ? <ExclamationTriangleIcon className="h-5 w-5 text-white dark:text-slate-900" />
                      : <BellIcon className="h-5 w-5 text-slate-900 dark:text-white" />
                    }
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.type}</span>
                      <span className="text-[10px] font-black text-slate-400 font-mono">{t.date}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">{t.desc}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black font-mono text-slate-900 dark:text-white">{t.montant.toLocaleString()} DA</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg">{t.action}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prévisions 3 mois */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {forecasts.map((f, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{f.month}</h3>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${f.risque === 'Faible' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-slate-900 text-white'
                    }`}>{f.risque}</span>
                </div>
                <div className="space-y-4 mb-5">
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-500 uppercase tracking-widest font-black">Encaissements</span>
                      <span className="font-black font-mono text-slate-900 dark:text-white">+{fmtK(f.enc)}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                      <div className="h-1.5 bg-slate-900 dark:bg-white rounded-full" style={{ width: `${(f.enc / 1_250_000) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-500 uppercase tracking-widest font-black">Décaissements</span>
                      <span className="font-black font-mono text-slate-400">-{fmtK(f.dec)}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                      <div className="h-1.5 bg-slate-400 dark:bg-slate-600 rounded-full" style={{ width: `${(f.dec / 1_250_000) * 100}%` }} />
                    </div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">Solde net prévu</p>
                  <p className="text-xl font-black font-mono text-slate-900 dark:text-white">+{f.prevu.toLocaleString()} DA</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Confiance</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${f.confiance === 'Élevée' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                    {f.confiance}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Prévisions vs réalisé Jan-Jun */}
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Courbe Prévisions vs Réalisations — S1 2024</h3>
            </div>
            <div className="p-8">
              <div className="relative h-48">
                <svg className="w-full h-full" viewBox="0 0 700 180" preserveAspectRatio="xMidYMid meet">
                  {[0, 1, 2, 3].map(i => (
                    <g key={i}>
                      <line x1="50" y1={10 + i * 45} x2="680" y2={10 + i * 45} stroke="#f1f5f9" strokeWidth="1" />
                      <text x="42" y={15 + i * 45} fill="#94a3b8" fontSize="11" fontWeight="700" textAnchor="end">{(3 - i) * 100}k</text>
                    </g>
                  ))}
                  {/* Prévu (dashed) */}
                  <polyline
                    points={monthlyFlows.map((m, i) => `${80 + i * 100},${145 - (m.solde / 300_000) * 135}`).join(' ')}
                    fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6,4"
                  />
                  {/* Réalisé */}
                  <polyline
                    points={monthlyFlows.map((m, i) => `${80 + i * 100},${145 - (m.solde / 300_000) * 135}`).join(' ')}
                    fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  />
                  {monthlyFlows.map((m, i) => (
                    <g key={i}>
                      <circle cx={80 + i * 100} cy={145 - (m.solde / 300_000) * 135} r="5" fill="#0f172a" />
                      <text x={80 + i * 100} y="170" fill="#475569" fontSize="12" fontWeight="800" textAnchor="middle">{m.month}</text>
                    </g>
                  ))}
                </svg>
              </div>
              <div className="flex gap-6 mt-4">
                <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-slate-300" style={{ borderTop: '2px dashed #94a3b8' }} /><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prévu</span></div>
                <div className="flex items-center gap-2"><div className="w-6 h-0.5 bg-slate-900 dark:bg-white" /><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Réalisé</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ ACTIONS BAS DE PAGE ══════════════ */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={() => setShowRapport(true)}
          className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-800 active:scale-95 flex items-center gap-2"
        >
          <EyeIcon className="h-4 w-4" />
          Rapport Complet
        </button>
        <button
          onClick={handleExportPDF}
          className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Export PDF
        </button>
        <button
          onClick={handleExportExcel}
          className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2"
        >
          <DocumentArrowDownIcon className="h-4 w-4" />
          Export Excel
        </button>
      </div>

      {/* ══════════════ MODAL RAPPORT COMPLET ══════════════ */}
      {showRapport && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowRapport(false)}
        >
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowRapport(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* En-tête modale */}
            <div className="sticky top-0 bg-slate-900 text-white p-8 rounded-t-[2rem] flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Synthèse Complète</p>
                <h2 className="text-2xl font-black uppercase tracking-tight italic">Trésorerie & Banque</h2>
                <p className="text-[10px] text-slate-400 mt-1">Exercice 2024 · Généré le {new Date().toLocaleDateString('fr-DZ')}</p>
              </div>
              <button
                onClick={() => setShowRapport(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white text-lg font-black"
              >
                ✕
              </button>
            </div>

            <div className="p-8 space-y-8">
              {/* Résumé exécutif */}
              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Résumé Exécutif — S1 2024</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Total Encaissements', val: fmt(TOTAL_ENC) },
                    { label: 'Total Décaissements', val: fmt(TOTAL_DEC) },
                    { label: 'Solde Net Cumulé', val: '+' + fmt(TOTAL_SOLDE) },
                    { label: 'Solde Bancaire Total', val: fmt(SOLDE_TOTAL) },
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                      <p className="text-lg font-black font-mono text-slate-900 dark:text-white">{item.val}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Flux mensuels */}
              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Flux Mensuels Détaillés</h3>
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <table className="w-full text-xs border-collapse">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        {['Mois', 'Encaissements', 'Décaissements', 'Solde Net', 'E/D'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {monthlyFlows.map((m, i) => (
                        <tr key={i} className="odd:bg-slate-50 dark:odd:bg-slate-800/20">
                          <td className="px-4 py-3 font-black text-slate-900 dark:text-white">{m.month}</td>
                          <td className="px-4 py-3 font-mono text-slate-900">+{m.enc.toLocaleString()}</td>
                          <td className="px-4 py-3 font-mono text-slate-400">-{m.dec.toLocaleString()}</td>
                          <td className="px-4 py-3 font-black font-mono text-slate-900 dark:text-white">+{m.solde.toLocaleString()}</td>
                          <td className="px-4 py-3 font-mono text-slate-500">{Math.round((m.enc / m.dec) * 100)}%</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-100 dark:bg-slate-800 border-t-2 border-slate-300 dark:border-slate-600">
                      <tr>
                        <td className="px-4 py-3 font-black text-slate-900 dark:text-white">TOTAL</td>
                        <td className="px-4 py-3 font-black font-mono text-slate-900 dark:text-white">+{TOTAL_ENC.toLocaleString()}</td>
                        <td className="px-4 py-3 font-black font-mono text-slate-400">-{TOTAL_DEC.toLocaleString()}</td>
                        <td className="px-4 py-3 font-black font-mono text-slate-900 dark:text-white">+{TOTAL_SOLDE.toLocaleString()}</td>
                        <td className="px-4 py-3 font-black font-mono text-slate-500">{Math.round((TOTAL_ENC / TOTAL_DEC) * 100)}%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>

              {/* Indicateurs clés */}
              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Indicateurs Financiers Clés</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Ratio de liquidité', val: RATIO_LIQUIDITE.toFixed(2), status: 'Excellent — cible > 1.5' },
                    { label: 'DSO (Délai encaissement)', val: `${DSO} jours`, status: 'Bon — cible < 30j' },
                    { label: 'DPO (Délai décaissement)', val: `${DPO} jours`, status: 'Optimal — cible 30–45j' },
                    { label: 'Couverture trésorerie', val: `${COUVERTURE} jours`, status: 'Excellent — cible > 30j' },
                    { label: 'Fonds de Roulement', val: fmt(FR), status: 'Positif' },
                    { label: 'BFR', val: fmt(BFR), status: 'Maîtrisé' },
                    { label: 'CAF', val: fmt(CAF), status: 'Satisfaisante' },
                  ].map((ind, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ind.label}</p>
                        <p className="text-xs font-black text-slate-900 dark:text-white font-mono">{ind.val}</p>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 text-right max-w-[110px]">{ind.status}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Prévisions */}
              <section>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Prévisions Trimestrielles</h3>
                <div className="grid grid-cols-3 gap-4">
                  {forecasts.map((f, i) => (
                    <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase mb-1">{f.month}</p>
                      <p className="text-base font-black font-mono text-slate-900 dark:text-white">+{f.prevu.toLocaleString()} DA</p>
                      <p className="text-[10px] text-slate-400 mt-1">Risque : {f.risque} · {f.confiance}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Actions modale */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleExportPDF}
                  className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Imprimer / PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  Export Excel / CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TresorerieBanque;
