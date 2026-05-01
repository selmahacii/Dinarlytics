import React, { useState, useMemo } from 'react';
import {
  ShoppingCartIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  StarIcon,
  PencilSquareIcon,
  BanknotesIcon,
  CalendarIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@shared/hooks/useTranslation';
import { useApp } from '@core/context/AppContext';
import { usePermission } from '@shared/hooks/usePermission';
import Modal from '@shared/components/UI/Modal';
import apiClient from '@/services/apiClient';

type BCStatus = 'draft' | 'pending_approval' | 'approved' | 'ordered' | 'received' | 'cancelled';
type ApprovalStep = { role: string; status: 'pending' | 'approved' | 'rejected'; date?: string; comment?: string };

interface BonCommandeItem { ref: string; designation: string; qty: number; unitPrice: number; tva: number }
interface BonCommande {
  id: string; numero: string; fournisseur: string; fournisseurScore: number;
  dateCreation: string; dateLivraison: string; status: BCStatus;
  montantHT: number; montantTTC: number; items: BonCommandeItem[];
  demandeur: string; department: string; motif: string;
  approvals: ApprovalStep[]; urgency: 'low' | 'medium' | 'high';
}

const MOCK_BC: BonCommande[] = [
  {
    id: 'BC001', numero: 'BC-2024-001', fournisseur: 'Tech Solutions SARL', fournisseurScore: 4.2,
    dateCreation: '2024-01-18', dateLivraison: '2024-02-05', status: 'approved',
    montantHT: 425000, montantTTC: 505750, demandeur: 'Karim Benali', department: 'IT',
    motif: 'Renouvellement parc informatique Q1 2024', urgency: 'medium',
    items: [
      { ref: 'IT-001', designation: 'Ordinateur Portable Dell XPS 15', qty: 3, unitPrice: 95000, tva: 19 },
      { ref: 'IT-002', designation: 'Écran 27" 4K Samsung', qty: 5, unitPrice: 45000, tva: 19 },
      { ref: 'IT-003', designation: 'Clavier + Souris Logitech Pro', qty: 8, unitPrice: 8750, tva: 19 },
    ],
    approvals: [
      { role: 'Responsable IT', status: 'approved', date: '2024-01-19', comment: 'Besoin validé.' },
      { role: 'DAF', status: 'approved', date: '2024-01-20', comment: 'Budget disponible Q1.' },
      { role: 'DG', status: 'approved', date: '2024-01-21' }
    ]
  },
  {
    id: 'BC002', numero: 'BC-2024-002', fournisseur: 'Office Supplies Co EURL', fournisseurScore: 3.8,
    dateCreation: '2024-01-20', dateLivraison: '2024-01-28', status: 'pending_approval',
    montantHT: 85000, montantTTC: 101150, demandeur: 'Sara Bouzid', department: 'Finance',
    motif: 'Fournitures bureau et consommables – Urgent', urgency: 'high',
    items: [
      { ref: 'OFF-201', designation: 'Ramettes A4 80g (carton)', qty: 10, unitPrice: 3500, tva: 19 },
      { ref: 'OFF-045', designation: 'Cartouches imprimante HP', qty: 12, unitPrice: 4500, tva: 19 },
      { ref: 'OFF-112', designation: 'Classeurs et fournitures bureau', qty: 1, unitPrice: 20000, tva: 19 }
    ],
    approvals: [
      { role: 'Chef Comptable', status: 'approved', date: '2024-01-21', comment: 'Nécessaire.' },
      { role: 'DAF', status: 'pending' },
      { role: 'DG', status: 'pending' }
    ]
  },
  {
    id: 'BC003', numero: 'BC-2024-003', fournisseur: 'Fournisseur Industriel SPA', fournisseurScore: 4.7,
    dateCreation: '2024-01-15', dateLivraison: '2024-01-22', status: 'received',
    montantHT: 650000, montantTTC: 773500, demandeur: 'Tahar Rouabah', department: 'Logistique',
    motif: 'Réapprovisionnement stock stratégique', urgency: 'high',
    items: [
      { ref: 'MAT-500', designation: 'Matière Première Grade A', qty: 500, unitPrice: 1100, tva: 9 },
      { ref: 'MAT-501', designation: 'Emballages Protection', qty: 1000, unitPrice: 150, tva: 19 },
    ],
    approvals: [
      { role: 'Responsable Logistique', status: 'approved', date: '2024-01-15' },
      { role: 'DAF', status: 'approved', date: '2024-01-16', comment: 'Priorité absolue.' },
      { role: 'DG', status: 'approved', date: '2024-01-16' }
    ]
  },
  {
    id: 'BC004', numero: 'BC-2024-004', fournisseur: 'Software License Corp', fournisseurScore: 4.5,
    dateCreation: '2024-01-10', dateLivraison: '2024-01-15', status: 'cancelled',
    montantHT: 280000, montantTTC: 333200, demandeur: 'Djamel Khelif', department: 'IT',
    motif: 'Licences logicielles annuelles – annulé car solution interne retenue', urgency: 'low',
    items: [
      { ref: 'SW-001', designation: 'Suite Design Adobe CC (10 postes)', qty: 10, unitPrice: 28000, tva: 19 }
    ],
    approvals: [
      { role: 'Responsable IT', status: 'rejected', date: '2024-01-12', comment: 'Solution alternative développée en interne.' }
    ]
  },
  {
    id: 'BC005', numero: 'BC-2024-005', fournisseur: 'Logistics Pro EURL', fournisseurScore: 3.5,
    dateCreation: '2024-01-22', dateLivraison: '2024-02-10', status: 'draft',
    montantHT: 195000, montantTTC: 232050, demandeur: 'Leila Achour', department: 'Production',
    motif: 'Équipement ligne de production N°3', urgency: 'medium',
    items: [
      { ref: 'PROD-88', designation: 'Composants Mécaniques Série B', qty: 50, unitPrice: 3900, tva: 19 }
    ],
    approvals: [
      { role: 'Directeur Production', status: 'pending' },
      { role: 'DAF', status: 'pending' },
      { role: 'DG', status: 'pending' }
    ]
  }
];

const MOCK_FOURNISSEURS_SCORES = [
  { name: 'Fournisseur Industriel SPA', score: 4.7, delai: '100%', qualite: '98%', prix: '3/5', commandes: 28 },
  { name: 'Tech Solutions SARL', score: 4.2, delai: '95%', qualite: '94%', prix: '4/5', commandes: 15 },
  { name: 'Software License Corp', score: 4.5, delai: '98%', qualite: '99%', prix: '2/5', commandes: 8 },
  { name: 'Office Supplies Co EURL', score: 3.8, delai: '89%', qualite: '90%', prix: '5/5', commandes: 42 },
  { name: 'Logistics Pro EURL', score: 3.5, delai: '82%', qualite: '87%', prix: '4/5', commandes: 19 }
];

const BonCommande: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useApp();
  const { has, user } = usePermission();

  const userRole = (user as any)?.role;
  const canApprove = has('comptabilite-validate') || userRole === 'dg' || userRole === 'daf';
  const canCreate = has('fournisseurs-manage');

  const [activeTab, setActiveTab] = useState<'orders' | 'scores' | 'analytics'>('orders');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BCStatus | 'all'>('all');
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  
  const [orders, setOrders] = useState<BonCommande[]>([]);
  const [selected, setSelected] = useState<BonCommande | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get('/bons-commande');
        setOrders(response.data as BonCommande[]);
      } catch (err) {
        console.error("Failed to fetch BC", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const statusConfig: Record<BCStatus, { label: string; color: string; icon: React.ComponentType<any> }> = {
    draft:            { label: t('bc.status.draft'),            color: 'bg-slate-100 text-slate-600',     icon: PencilSquareIcon },
    pending_approval: { label: t('bc.status.pending_approval'), color: 'bg-amber-100 text-amber-700',     icon: ClockIcon },
    approved:         { label: t('bc.status.approved'),         color: 'bg-blue-100 text-blue-700',       icon: CheckCircleIcon },
    ordered:          { label: t('bc.status.ordered'),          color: 'bg-indigo-100 text-indigo-700',   icon: ShoppingCartIcon },
    received:         { label: t('bc.status.received'),         color: 'bg-emerald-100 text-emerald-700', icon: TruckIcon },
    cancelled:        { label: t('bc.status.cancelled'),        color: 'bg-red-100 text-red-700',         icon: XCircleIcon }
  };

  const urgencyConfig = {
    low:    { label: t('bc.urgency.low'),    color: 'bg-slate-100 text-slate-600' },
    medium: { label: t('bc.urgency.medium'), color: 'bg-amber-100 text-amber-700' },
    high:   { label: t('bc.urgency.high'),   color: 'bg-red-100 text-red-700' }
  };

  const filtered = useMemo(() => orders.filter(bc => {
    const matchSearch = bc.fournisseur.toLowerCase().includes(search.toLowerCase()) ||
                        bc.numero.toLowerCase().includes(search.toLowerCase()) ||
                        bc.demandeur.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || bc.status === statusFilter;
    return matchSearch && matchStatus;
  }), [search, statusFilter, orders]);

  const kpis = useMemo(() => ({
    total: orders.length,
    totalValue: orders.reduce((a, b) => a + b.montantTTC, 0),
    pendingApproval: orders.filter(b => b.status === 'pending_approval').length,
    pendingValue: orders.filter(b => b.status === 'pending_approval').reduce((a, b) => a + b.montantTTC, 0),
    received: orders.filter(b => b.status === 'received').length,
    avgScore: Math.round(MOCK_FOURNISSEURS_SCORES.reduce((a, f) => a + f.score, 0) / MOCK_FOURNISSEURS_SCORES.length * 10) / 10,
  }), [orders]);

  const renderStars = (score: number) => {
    return Array(5).fill(0).map((_, i) => (
      <StarIcon key={i} className={`h-3.5 w-3.5 ${i < Math.round(score) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
    ));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <ShoppingCartIcon className="h-7 w-7 text-indigo-600 mr-3" />
            {t('bc.title')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{t('bc.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          {canApprove && kpis.pendingApproval > 0 && (
            <div className="flex items-center px-4 py-2.5 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold rounded-xl">
              <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
              {kpis.pendingApproval} {t('bc.pending_approval_count')}
            </div>
          )}
          {canCreate && (
            <button className="flex items-center px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm">
              <PlusIcon className="h-4 w-4 mr-2" />{t('bc.create_btn')}
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('bc.kpi.total'), value: kpis.total, sub: t('bc.kpi.total_sub'), color: 'text-slate-800', icon: ShoppingCartIcon },
          { label: t('bc.kpi.pending'), value: kpis.pendingApproval, sub: formatCurrency(kpis.pendingValue), color: 'text-amber-700', icon: ClockIcon },
          { label: t('bc.kpi.received'), value: kpis.received, sub: t('bc.kpi.received_sub'), color: 'text-emerald-700', icon: TruckIcon },
          { label: t('bc.kpi.avg_score'), value: `${kpis.avgScore}/5`, sub: t('bc.kpi.avg_score_sub'), color: 'text-indigo-700', icon: StarIcon },
        ].map((k, i) => { const Icon = k.icon; return (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{k.label}</p>
              <Icon className="h-4 w-4 text-slate-300" />
            </div>
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{k.sub}</p>
          </div>
        );})}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6">
          <nav className="flex overflow-x-auto gap-1 pt-2 no-scrollbar">
            {[
              { id: 'orders', label: t('bc.tabs.orders') },
              { id: 'scores', label: t('bc.tabs.supplier_scores') },
              { id: 'analytics', label: t('bc.tabs.analytics') }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="p-6 space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={t('bc.search_placeholder')}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300" />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none">
                <option value="all">{t('bc.filter.all')}</option>
                {(['draft','pending_approval','approved','ordered','received','cancelled'] as BCStatus[]).map(s => (
                  <option key={s} value={s}>{statusConfig[s].label}</option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {[t('bc.table.numero'), t('bc.table.supplier'), t('bc.table.requester'), t('bc.table.amount'), t('bc.table.delivery'), t('bc.table.urgency'), t('bc.table.status'), t('bc.table.actions')].map((h, i) => (
                      <th key={i} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(bc => {
                    const Cfg = statusConfig[bc.status];
                    const StatusIcon = Cfg.icon;
                    const Urg = urgencyConfig[bc.urgency];
                    return (
                      <tr key={bc.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-4 py-3 font-bold text-slate-800">{bc.numero}</td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-700">{bc.fournisseur}</div>
                          <div className="flex items-center mt-0.5">
                            {renderStars(bc.fournisseurScore)}
                            <span className="text-[10px] text-slate-400 ml-1">{bc.fournisseurScore}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-700 font-medium text-xs">{bc.demandeur}</div>
                          <div className="text-[10px] text-slate-400">{bc.department}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800">{formatCurrency(bc.montantTTC)}</div>
                          <div className="text-[10px] text-slate-400">HT: {formatCurrency(bc.montantHT)}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">{bc.dateLivraison}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${Urg.color}`}>{Urg.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${Cfg.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />{Cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setSelected(bc); setIsDetailOpen(true); }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {canApprove && bc.status === 'pending_approval' && (
                              <button onClick={() => { setSelected(bc); setIsApprovalOpen(true); }}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                <CheckCircleIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Supplier Scores Tab */}
        {activeTab === 'scores' && (
          <div className="p-6 space-y-4">
            <h3 className="font-bold text-slate-800 mb-4">{t('bc.scores.title')}</h3>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {[t('bc.scores.supplier'), t('bc.scores.global'), t('bc.scores.delivery'), t('bc.scores.quality'), t('bc.scores.price'), t('bc.scores.orders')].map((h, i) => (
                      <th key={i} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_FOURNISSEURS_SCORES.sort((a, b) => b.score - a.score).map((f, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-slate-800">{f.name}</div>
                        {i === 0 && <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-bold">{t('bc.scores.best')}</span>}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(f.score)}</div>
                          <span className="font-black text-slate-800">{f.score}/5</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-emerald-500 rounded-full" style={{width: f.delai}}/></div>
                          <span className="text-xs font-bold text-slate-700">{f.delai}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-700">{f.qualite}</td>
                      <td className="px-4 py-4">
                        <div className="flex gap-0.5">{f.prix.split('/')[0].split('').map((_, j) => <div key={j} className="w-2 h-2 rounded-sm bg-indigo-400"/>)}</div>
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-800">{f.commandes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-slate-800 mb-4">{t('bc.analytics.by_status')}</h4>
              <div className="space-y-3">
                {(['draft','pending_approval','approved','received','cancelled'] as BCStatus[]).map(s => {
                  const count = MOCK_BC.filter(b => b.status === s).length;
                  const Cfg = statusConfig[s];
                  return (
                    <div key={s}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700">{Cfg.label}</span>
                        <span className={`px-2 py-0.5 rounded-full ${Cfg.color}`}>{count}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-slate-600 rounded-full" style={{width: `${(count/MOCK_BC.length)*100}%`}}/></div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 mb-4">{t('bc.analytics.by_department')}</h4>
              <div className="space-y-3">
                {['IT','Finance','Logistique','Production'].map(dept => {
                  const val = MOCK_BC.filter(b => b.department === dept).reduce((a, b) => a + b.montantTTC, 0);
                  const total = MOCK_BC.reduce((a, b) => a + b.montantTTC, 0);
                  return (
                    <div key={dept}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700">{dept}</span>
                        <span className="text-slate-800">{formatCurrency(val)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{width: `${(val/total)*100}%`}}/></div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`${t('bc.detail.title')} — ${selected.numero}`} size="xl">
          <div className="p-2 space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: BuildingOfficeIcon, label: t('bc.detail.supplier'), value: selected.fournisseur },
                { icon: UserIcon, label: t('bc.detail.requester'), value: `${selected.demandeur} (${selected.department})` },
                { icon: CalendarIcon, label: t('bc.detail.delivery'), value: selected.dateLivraison },
                { icon: BanknotesIcon, label: t('bc.detail.total'), value: formatCurrency(selected.montantTTC) },
              ].map(({ icon: Icon, label, value }, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><Icon className="h-3 w-3"/>{label}</p>
                  <p className="font-semibold text-slate-800 text-sm">{value}</p>
                </div>
              ))}
            </div>

            {/* Motif */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">{t('bc.detail.purpose')}</p>
              <p className="text-sm text-amber-900">{selected.motif}</p>
            </div>

            {/* Items */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">{t('bc.detail.items')}</h4>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>{[t('bc.detail.ref'), t('bc.detail.designation'), t('bc.detail.qty'), t('bc.detail.unit_price'), t('bc.detail.tva'), t('bc.detail.total')].map((h, i) => (
                      <th key={i} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selected.items.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 text-xs text-slate-500 font-mono">{item.ref}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-800">{item.designation}</td>
                        <td className="px-4 py-2.5 text-slate-600">{item.qty}</td>
                        <td className="px-4 py-2.5 text-slate-600">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-2.5 text-slate-600">{item.tva}%</td>
                        <td className="px-4 py-2.5 font-bold text-slate-800">{formatCurrency(item.qty * item.unitPrice * (1 + item.tva/100))}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr><td colSpan={5} className="px-4 py-3 text-right text-xs font-black text-slate-800 uppercase">{t('bc.detail.total_ttc')}</td>
                    <td className="px-4 py-3 font-black text-slate-900 text-lg">{formatCurrency(selected.montantTTC)}</td></tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Approval Workflow */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1"><CheckCircleIcon className="h-4 w-4"/>{t('bc.detail.workflow')}</h4>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {selected.approvals.map((step, i) => {
                  const colors = { pending: 'border-slate-300 bg-white text-slate-500', approved: 'border-emerald-300 bg-emerald-50 text-emerald-700', rejected: 'border-red-300 bg-red-50 text-red-700' };
                  const icons = { pending: <ClockIcon className="h-4 w-4"/>, approved: <CheckCircleIcon className="h-4 w-4"/>, rejected: <XCircleIcon className="h-4 w-4"/> };
                  return (
                    <React.Fragment key={i}>
                      <div className={`flex-shrink-0 border-2 ${colors[step.status]} rounded-xl p-3 min-w-32 text-center`}>
                        <div className="flex justify-center mb-1">{icons[step.status]}</div>
                        <p className="text-xs font-bold">{step.role}</p>
                        {step.date && <p className="text-[10px] opacity-70 mt-0.5">{step.date}</p>}
                        {step.comment && <p className="text-[10px] italic mt-1 opacity-70">"{step.comment}"</p>}
                      </div>
                      {i < selected.approvals.length - 1 && <div className="text-slate-300 font-bold text-lg flex-shrink-0">→</div>}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button onClick={() => window.print()} className="flex items-center px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50">
                <PrinterIcon className="h-4 w-4 mr-2"/>{t('bc.actions.print')}
              </button>
              {canApprove && selected.status === 'pending_approval' && (
                <button onClick={() => { setIsDetailOpen(false); setIsApprovalOpen(true); }}
                  className="flex items-center px-5 py-2 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">
                  <CheckCircleIcon className="h-4 w-4 mr-2"/>{t('bc.actions.approve')}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Approval Modal */}
      {selected && (
        <Modal isOpen={isApprovalOpen} onClose={() => setIsApprovalOpen(false)} title={t('bc.approval.title')} size="md">
          <div className="p-4 space-y-5">
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="font-bold text-amber-800 text-sm">{selected.numero} — {selected.fournisseur}</p>
              <p className="text-amber-700 text-sm mt-1 font-black">{formatCurrency(selected.montantTTC)}</p>
              <p className="text-amber-600 text-xs mt-1">{selected.motif}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">{t('bc.approval.comment')}</label>
              <textarea value={approvalComment} onChange={e => setApprovalComment(e.target.value)} rows={3}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                placeholder={t('bc.approval.comment_placeholder')} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { alert(t('bc.approval.rejected_msg')); setIsApprovalOpen(false); }}
                className="flex-1 py-2.5 text-sm font-bold border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors">
                <XCircleIcon className="h-4 w-4 inline mr-1"/>{t('bc.actions.reject')}
              </button>
              <button onClick={() => { alert(t('bc.approval.approved_msg')); setIsApprovalOpen(false); }}
                className="flex-1 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
                <CheckCircleIcon className="h-4 w-4 inline mr-1"/>{t('bc.actions.approve')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BonCommande;
