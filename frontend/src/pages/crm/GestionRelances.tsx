import React, { useState, useMemo } from 'react';
import {
  BellAlertIcon,
  EnvelopeIcon,
  PhoneIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  BanknotesIcon,
  UserIcon,
  ArrowPathIcon,
  ChartBarIcon,
  PrinterIcon,
  EyeIcon,
  PaperAirplaneIcon,
  CurrencyDollarIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@shared/hooks/useTranslation';
import { useApp } from '@core/context/AppContext';
import { usePermission } from '@shared/hooks/usePermission';
import Modal from '@shared/components/UI/Modal';
import apiClient from '@/services/apiClient';

type RelanceStatus = 'pending' | 'sent' | 'responded' | 'escalated' | 'resolved' | 'litigation';
type RelanceLevel = 1 | 2 | 3;

interface Relance {
  id: string; factureNum: string; client: string; clientEmail: string; clientPhone: string;
  montant: number; dateFact: string; dateEcheance: string; daysOverdue: number;
  level: RelanceLevel; status: RelanceStatus; lastContact: string | null;
  commercial: string; notes: string;
}

const MOCK_RELANCES: Relance[] = [
  { id: 'R001', factureNum: 'FAC-2023-098', client: 'Sonatrach EP', clientEmail: 'comptabilite@sonatrach.dz', clientPhone: '021-XX-XX-XX', montant: 850000, dateFact: '2023-11-15', dateEcheance: '2023-12-15', daysOverdue: 47, level: 2, status: 'sent', lastContact: '2024-01-10', commercial: 'Karim Benali', notes: 'En attente de visa DG pour paiement' },
  { id: 'R002', factureNum: 'FAC-2023-112', client: 'SARL El Khabar', clientEmail: 'direction@elkhabar.com', clientPhone: '021-YY-YY-YY', montant: 185000, dateFact: '2023-12-01', dateEcheance: '2023-12-31', daysOverdue: 31, level: 1, status: 'pending', lastContact: null, commercial: 'Amira Hadj', notes: 'Première relance à envoyer' },
  { id: 'R003', factureNum: 'FAC-2023-065', client: 'Pharmacie Centrale DZ', clientEmail: 'si@phcdz.dz', clientPhone: '023-ZZ-ZZ-ZZ', montant: 95000, dateFact: '2023-10-20', dateEcheance: '2023-11-20', daysOverdue: 72, level: 3, status: 'escalated', lastContact: '2024-01-05', commercial: 'Yacine Maamar', notes: 'Dossier transmis au service juridique' },
  { id: 'R004', factureNum: 'FAC-2024-008', client: 'Groupe Cévital', clientEmail: 'procurement@cevital.com', clientPhone: '024-AA-AA-AA', montant: 1250000, dateFact: '2024-01-05', dateEcheance: '2024-01-20', daysOverdue: 11, level: 1, status: 'sent', lastContact: '2024-01-22', commercial: 'Karim Benali', notes: 'Contact DG établi, paiement promis 30/01' },
  { id: 'R005', factureNum: 'FAC-2023-145', client: 'Air Algérie', clientEmail: 'dsi@airalgerie.dz', clientPhone: '021-BB-BB-BB', montant: 420000, dateFact: '2023-12-10', dateEcheance: '2024-01-10', daysOverdue: 21, level: 1, status: 'responded', lastContact: '2024-01-15', commercial: 'Amira Hadj', notes: 'Promesse de paiement reçue pour le 05/02' },
  { id: 'R006', factureNum: 'FAC-2023-055', client: 'EURL Boulangerie Nord', clientEmail: 'contact@boulangerienord.dz', clientPhone: '025-CC-CC-CC', montant: 42000, dateFact: '2023-10-01', dateEcheance: '2023-10-31', daysOverdue: 92, level: 3, status: 'litigation', lastContact: '2023-12-20', commercial: 'Yacine Maamar', notes: 'Mise en demeure envoyée. Passage en contentieux.' },
];

const RELANCE_TEMPLATES = {
  level1: { subject: 'relances.template.l1_subject', tone: 'relances.template.l1_tone', delay: '30' },
  level2: { subject: 'relances.template.l2_subject', tone: 'relances.template.l2_tone', delay: '60' },
  level3: { subject: 'relances.template.l3_subject', tone: 'relances.template.l3_tone', delay: '90+' }
};

const GestionRelances: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useApp();
  const { has } = usePermission();

  const canSendRelance = has('facturation-create');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RelanceStatus | 'all'>('all');
  const [levelFilter, setLevelFilter] = useState<RelanceLevel | 0>(0);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [emailContent, setEmailContent] = useState('');
  
  const [relances, setRelances] = useState<Relance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Relance | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  React.useEffect(() => {
    const fetchRelances = async () => {
      try {
        const response = await apiClient.get('/relances-clients');
        setRelances(response.data as Relance[]);
      } catch (err) {
        console.error("Failed to fetch relances, using mock data", err);
        setRelances(MOCK_RELANCES);
      } finally {
        setLoading(false);
      }
    };
    fetchRelances();
  }, []);

  const statusConfig: Record<RelanceStatus, { label: string; color: string; icon: React.ComponentType<any> }> = {
    pending:    { label: t('relances.status.pending'),    color: 'bg-slate-100 text-slate-600',     icon: ClockIcon },
    sent:       { label: t('relances.status.sent'),       color: 'bg-blue-100 text-blue-700',       icon: EnvelopeIcon },
    responded:  { label: t('relances.status.responded'),  color: 'bg-amber-100 text-amber-700',     icon: ArrowPathIcon },
    escalated:  { label: t('relances.status.escalated'),  color: 'bg-orange-100 text-orange-700',   icon: ExclamationTriangleIcon },
    resolved:   { label: t('relances.status.resolved'),   color: 'bg-emerald-100 text-emerald-700', icon: CheckCircleIcon },
    litigation: { label: t('relances.status.litigation'), color: 'bg-red-100 text-red-700',         icon: XCircleIcon }
  };

  const levelConfig: Record<RelanceLevel, { label: string; color: string; bgCard: string }> = {
    1: { label: t('relances.level.1'), color: 'text-amber-700', bgCard: 'bg-amber-50 border-amber-200' },
    2: { label: t('relances.level.2'), color: 'text-orange-700', bgCard: 'bg-orange-50 border-orange-200' },
    3: { label: t('relances.level.3'), color: 'text-red-700', bgCard: 'bg-red-50 border-red-200' }
  };

  const filtered = useMemo(() => relances.filter(r => {
    const matchSearch = r.client.toLowerCase().includes(search.toLowerCase()) ||
                        r.factureNum.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchLevel = levelFilter === 0 || r.level === levelFilter;
    return matchSearch && matchStatus && matchLevel;
  }), [search, statusFilter, levelFilter, relances]);

  const kpis = useMemo(() => ({
    totalOverdue: relances.reduce((a, r) => a + r.montant, 0),
    count: relances.length,
    critical: relances.filter(r => r.level === 3).length,
    avgDays: relances.length > 0 ? Math.round(relances.reduce((a, r) => a + r.daysOverdue, 0) / relances.length) : 0,
    litigation: relances.filter(r => r.status === 'litigation').length,
  }), [relances]);

  const generateEmailContent = (relance: Relance) => {
    const urgency = relance.daysOverdue > 60 ? t('relances.send.urgency_critical') : t('relances.send.urgency_normal');
    return t('relances.send.email_body', {
      invoiceNum: relance.factureNum,
      amount: formatCurrency(relance.montant),
      dueDate: new Date(relance.dateEcheance).toLocaleDateString(),
      urgencyNote: urgency,
      commercial: relance.commercial
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <BellAlertIcon className="h-7 w-7 text-orange-500 mr-3" />
            {t('relances.title')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{t('relances.subtitle')}</p>
        </div>
        {canSendRelance && (
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />{t('relances.create_btn')}
          </button>
        )}
      </div>

      {/* Alert Banner for critical */}
      {kpis.critical > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <FireIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-bold text-red-800 text-sm">{kpis.critical} {t('relances.alert.critical_count')}</p>
            <p className="text-red-600 text-xs mt-0.5">{t('relances.alert.critical_desc')}</p>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: t('relances.kpi.total_overdue'), value: formatCurrency(kpis.totalOverdue), color: 'text-red-700', icon: BanknotesIcon },
          { label: t('relances.kpi.count'), value: kpis.count, color: 'text-slate-800', icon: DocumentTextIcon },
          { label: t('relances.kpi.critical'), value: kpis.critical, color: 'text-red-600', icon: ExclamationTriangleIcon },
          { label: t('relances.kpi.avg_days'), value: `${kpis.avgDays} ${t('common.days_short') || 'j'}`, color: 'text-amber-700', icon: CalendarIcon },
          { label: t('relances.kpi.litigation'), value: kpis.litigation, color: 'text-red-800', icon: XCircleIcon },
        ].map((k, i) => { const Icon = k.icon; return (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between mb-1"><p className="text-[10px] font-bold text-slate-400 uppercase">{k.label}</p><Icon className="h-4 w-4 text-slate-300"/></div>
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
          </div>
        );})}
      </div>

      {/* Relance Level Legend */}
      <div className="grid grid-cols-3 gap-3">
        {([1, 2, 3] as RelanceLevel[]).map(lvl => {
          const Cfg = levelConfig[lvl];
          const tmpl = RELANCE_TEMPLATES[`level${lvl}`];
          const count = relances.filter(r => r.level === lvl).length;
          return (
            <button key={lvl} onClick={() => setLevelFilter(levelFilter === lvl ? 0 : lvl)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${levelFilter === lvl ? `${Cfg.bgCard} border-current` : 'bg-white border-slate-200 hover:border-slate-300'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`font-black text-sm ${Cfg.color}`}>{Cfg.label}</span>
                <span className={`text-lg font-black ${Cfg.color}`}>{count}</span>
              </div>
              <p className="text-[10px] text-slate-500">{t('relances.template.tone')}: <strong>{t(tmpl.tone)}</strong></p>
              <p className="text-[10px] text-slate-500">{t('relances.template.delay')}: {tmpl.delay} {t('common.days')}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('relances.search_placeholder')}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none">
          <option value="all">{t('relances.filter.all')}</option>
          {(Object.keys(statusConfig) as RelanceStatus[]).map(s => (
            <option key={s} value={s}>{statusConfig[s].label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>{[t('relances.table.invoice'), t('relances.table.client'), t('relances.table.amount'), t('relances.table.overdue'), t('relances.table.level'), t('relances.table.status'), t('relances.table.last_contact'), t('relances.table.actions')].map((h, i) => (
                <th key={i} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(r => {
                const Cfg = statusConfig[r.status];
                const LCfg = levelConfig[r.level];
                const StatusIcon = Cfg.icon;
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-3 font-bold text-slate-800">{r.factureNum}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-700">{r.client}</div>
                      <div className="text-[11px] text-slate-400">{r.commercial}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-red-700">{formatCurrency(r.montant)}</td>
                    <td className="px-4 py-3">
                      <div className={`font-black text-sm ${r.daysOverdue >= 60 ? 'text-red-700' : r.daysOverdue >= 30 ? 'text-orange-600' : 'text-amber-600'}`}>
                        {r.daysOverdue} {t('common.days_short') || 'j'}
                      </div>
                      <div className="text-[10px] text-slate-400">{t('relances.table.since')} {new Date(r.dateEcheance).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${LCfg.bgCard} ${LCfg.color}`}>{LCfg.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${Cfg.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1"/>{Cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{r.lastContact ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelected(r); setIsDetailOpen(true); }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                          <EyeIcon className="h-4 w-4"/>
                        </button>
                        {canSendRelance && (
                          <button onClick={() => { setSelected(r); setEmailContent(generateEmailContent(r)); setIsSendOpen(true); }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                            <PaperAirplaneIcon className="h-4 w-4"/>
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

      {/* Detail Modal */}
      {selected && (
        <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`${t('relances.detail.title')} — ${selected.factureNum}`} size="lg">
          <div className="p-2 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-xl p-4 col-span-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1"><UserIcon className="h-3 w-3"/>{t('relances.detail.client')}</p>
                <p className="font-bold text-slate-800">{selected.client}</p>
                <div className="flex gap-4 mt-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1"><EnvelopeIcon className="h-3 w-3"/>{selected.clientEmail}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1"><PhoneIcon className="h-3 w-3"/>{selected.clientPhone}</span>
                </div>
              </div>
              {[
                { label: t('relances.detail.amount'), value: formatCurrency(selected.montant), bold: true },
                { label: t('relances.detail.overdue'), value: `${selected.daysOverdue} ${t('common.days')}`, bold: true },
                { label: t('relances.detail.due_date'), value: new Date(selected.dateEcheance).toLocaleDateString(), bold: false },
                { label: t('relances.detail.invoice_date'), value: new Date(selected.dateFact).toLocaleDateString(), bold: false },
              ].map(({ label, value, bold }, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</p>
                  <p className={`text-sm ${bold ? 'font-black text-slate-900' : 'font-semibold text-slate-700'}`}>{value}</p>
                </div>
              ))}
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">{t('relances.detail.notes')}</p>
              <p className="text-sm text-amber-900">{selected.notes}</p>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              {canSendRelance && (
                <button onClick={() => { setIsDetailOpen(false); setEmailContent(generateEmailContent(selected)); setIsSendOpen(true); }}
                  className="flex items-center px-5 py-2 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800">
                  <PaperAirplaneIcon className="h-4 w-4 mr-2"/>{t('relances.actions.send')} {t(`relances.level.${selected.level}`)}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Send Modal */}
      {selected && (
        <Modal isOpen={isSendOpen} onClose={() => setIsSendOpen(false)} title={t('relances.send.title')} size="lg">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-4">
              <EnvelopeIcon className="h-5 w-5 text-slate-500 flex-shrink-0"/>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">{t('relances.send.to')}</p>
                <p className="font-semibold text-slate-800">{selected.client} &lt;{selected.clientEmail}&gt;</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">{t('relances.send.email_content')}</label>
              <textarea value={emailContent} onChange={e => setEmailContent(e.target.value)} rows={12}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 font-mono"/>
            </div>
            <div className="flex gap-3">
              <button onClick={() => window.print()} className="flex items-center px-4 py-2 text-sm font-semibold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50">
                <PrinterIcon className="h-4 w-4 mr-2"/>{t('relances.send.print')}
              </button>
              <button onClick={() => { alert(t('relances.send.sent_msg')); setIsSendOpen(false); }}
                className="flex-1 flex items-center justify-center px-5 py-2 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800">
                <PaperAirplaneIcon className="h-4 w-4 mr-2"/>{t('relances.send.confirm_btn')}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create New Follow-up Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={t('relances.create_btn')} size="lg">
        <form className="p-4 space-y-6" onSubmit={(e) => { e.preventDefault(); alert(t('relances.send.sent_msg')); setIsCreateOpen(false); }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('relances.detail.client')}</label>
              <select required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold">
                <option value="">{t('crm.clients.placeholders.select_client') || 'Sélectionner un client'}</option>
                {MOCK_RELANCES.map(r => (
                  <option key={r.id} value={r.client}>{r.client}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('relances.table.invoice')}</label>
              <input type="text" placeholder="FAC-2024-XXX" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('relances.table.level')}</label>
              <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold">
                <option value="1">{t('relances.level.1')}</option>
                <option value="2">{t('relances.level.2')}</option>
                <option value="3">{t('relances.level.3')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('relances.detail.amount')}</label>
              <input type="number" placeholder="0.00" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{t('relances.detail.notes')}</label>
            <textarea rows={4} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium" placeholder={t('relances.search_placeholder')} />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={() => setIsCreateOpen(false)} className="px-8 py-3 bg-slate-100 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest">
              {t('common.cancel')}
            </button>
            <button type="submit" className="px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
              {t('common.save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GestionRelances;
