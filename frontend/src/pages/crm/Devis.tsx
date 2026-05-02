import React, { useState, useMemo } from 'react';
import {
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowPathIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  UserIcon,
  CalendarIcon,
  BanknotesIcon,
  ChevronDownIcon,
  PaperAirplaneIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { useTranslation } from '@shared/hooks/useTranslation';
import { useApp } from '@core/context/AppContext';
import Modal from '@shared/components/UI/Modal';

type DevisStatus = 'draft' | 'sent' | 'accepted' | 'refused' | 'expired';

interface DevisItem {
  designation: string;
  qty: number;
  unitPrice: number;
  tva: number;
}

interface Devis {
  id: string;
  numero: string;
  client: string;
  clientEmail: string;
  dateCreation: string;
  dateExpiration: string;
  status: DevisStatus;
  montantHT: number;
  montantTVA: number;
  montantTTC: number;
  items: DevisItem[];
  notes: string;
  commercial: string;
}

const MOCK_DEVIS: Devis[] = [
  {
    id: 'DEV001', numero: 'DEV-2024-001', client: 'Sonatrach EP', clientEmail: 'achats@sonatrach.dz',
    dateCreation: '2024-01-15', dateExpiration: '2024-02-15', status: 'accepted',
    montantHT: 850000, montantTVA: 161500, montantTTC: 1011500,
    items: [
      { designation: 'Licence ERP Annuelle', qty: 1, unitPrice: 650000, tva: 19 },
      { designation: 'Formation & Déploiement', qty: 10, unitPrice: 20000, tva: 19 }
    ],
    notes: 'Offre valable 30 jours. Livraison sous 15 jours ouvrables.', commercial: 'Karim Benali'
  },
  {
    id: 'DEV002', numero: 'DEV-2024-002', client: 'Air Algérie', clientEmail: 'dsi@airalgerie.dz',
    dateCreation: '2024-01-20', dateExpiration: '2024-02-20', status: 'sent',
    montantHT: 420000, montantTVA: 79800, montantTTC: 499800,
    items: [
      { designation: 'Module Comptabilité SPA', qty: 1, unitPrice: 320000, tva: 19 },
      { designation: 'Support Premium 1 an', qty: 1, unitPrice: 100000, tva: 19 }
    ],
    notes: 'Solution adaptée au contexte SPA avec consolidation multi-entités.', commercial: 'Amira Hadj'
  },
  {
    id: 'DEV003', numero: 'DEV-2024-003', client: 'SARL El Khabar', clientEmail: 'direction@elkhabar.com',
    dateCreation: '2024-01-22', dateExpiration: '2024-02-22', status: 'draft',
    montantHT: 185000, montantTVA: 35150, montantTTC: 220150,
    items: [
      { designation: 'Pack PME Professionnel', qty: 1, unitPrice: 150000, tva: 19 },
      { designation: 'Migration Données', qty: 1, unitPrice: 35000, tva: 19 }
    ],
    notes: 'En attente de validation interne avant envoi.', commercial: 'Yacine Maamar'
  },
  {
    id: 'DEV004', numero: 'DEV-2024-004', client: 'Groupe Cévital', clientEmail: 'procurement@cevital.com',
    dateCreation: '2023-12-10', dateExpiration: '2024-01-10', status: 'expired',
    montantHT: 1250000, montantTVA: 237500, montantTTC: 1487500,
    items: [
      { designation: 'Solution Enterprise Multi-Sites', qty: 1, unitPrice: 950000, tva: 19 },
      { designation: 'Consolidation IFRS', qty: 1, unitPrice: 200000, tva: 19 },
      { designation: 'Formation Direction Financière', qty: 5, unitPrice: 20000, tva: 19 }
    ],
    notes: 'Offre expirée - relance en cours de préparation.', commercial: 'Karim Benali'
  },
  {
    id: 'DEV005', numero: 'DEV-2024-005', client: 'Pharmacie Centrale DZ', clientEmail: 'si@phcdz.dz',
    dateCreation: '2024-01-25', dateExpiration: '2024-02-25', status: 'refused',
    montantHT: 95000, montantTVA: 18050, montantTTC: 113050,
    items: [
      { designation: 'Pack Starter EURL', qty: 1, unitPrice: 95000, tva: 19 }
    ],
    notes: 'Client a opté pour une solution concurrente.', commercial: 'Amira Hadj'
  }
];

const Devis: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DevisStatus | 'all'>('all');
  const [selectedDevis, setSelectedDevis] = useState<Devis | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const statusConfig: Record<DevisStatus, { label: string; color: string; icon: React.ComponentType<any> }> = {
    draft:    { label: t('devis.status.draft'),    color: 'bg-slate-100 text-slate-600',   icon: PencilIcon },
    sent:     { label: t('devis.status.sent'),     color: 'bg-blue-100 text-blue-700',     icon: PaperAirplaneIcon },
    accepted: { label: t('devis.status.accepted'), color: 'bg-emerald-100 text-emerald-700', icon: CheckCircleIcon },
    refused:  { label: t('devis.status.refused'),  color: 'bg-red-100 text-red-700',       icon: XCircleIcon },
    expired:  { label: t('devis.status.expired'),  color: 'bg-amber-100 text-amber-700',   icon: ClockIcon }
  };

  const filtered = useMemo(() => {
    return MOCK_DEVIS.filter(d => {
      const matchSearch = d.client.toLowerCase().includes(search.toLowerCase()) ||
                          d.numero.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const kpis = useMemo(() => ({
    total: MOCK_DEVIS.length,
    totalValue: MOCK_DEVIS.reduce((a, b) => a + b.montantTTC, 0),
    accepted: MOCK_DEVIS.filter(d => d.status === 'accepted').length,
    acceptedRate: Math.round((MOCK_DEVIS.filter(d => d.status === 'accepted').length / MOCK_DEVIS.length) * 100),
    pending: MOCK_DEVIS.filter(d => d.status === 'sent').length,
    pendingValue: MOCK_DEVIS.filter(d => d.status === 'sent').reduce((a, b) => a + b.montantTTC, 0),
  }), []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
            <DocumentTextIcon className="h-7 w-7 text-indigo-600 mr-3" />
            {t('devis.title')}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{t('devis.subtitle')}</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          {t('devis.create_btn')}
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: t('devis.kpi.total'), value: kpis.total, sub: t('devis.kpi.total_sub'), color: 'text-slate-800' },
          { label: t('devis.kpi.pipeline'), value: formatCurrency(kpis.pendingValue), sub: `${kpis.pending} ${t('devis.kpi.pipeline_sub')}`, color: 'text-blue-700' },
          { label: t('devis.kpi.accepted'), value: kpis.accepted, sub: t('devis.kpi.accepted_sub'), color: 'text-emerald-700' },
          { label: t('devis.kpi.rate'), value: `${kpis.acceptedRate}%`, sub: t('devis.kpi.rate_sub'), color: 'text-indigo-700' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">{kpi.label}</p>
            <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[11px] text-slate-400 mt-1">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('devis.search_placeholder')}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-4 w-4 text-slate-400" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none">
            <option value="all">{t('devis.filter.all')}</option>
            <option value="draft">{t('devis.status.draft')}</option>
            <option value="sent">{t('devis.status.sent')}</option>
            <option value="accepted">{t('devis.status.accepted')}</option>
            <option value="refused">{t('devis.status.refused')}</option>
            <option value="expired">{t('devis.status.expired')}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {[t('devis.table.numero'), t('devis.table.client'), t('devis.table.date'), t('devis.table.expiry'), t('devis.table.amount'), t('devis.table.status'), t('devis.table.actions')].map((h, i) => (
                  <th key={i} className="px-5 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(devis => {
                const Cfg = statusConfig[devis.status];
                const StatusIcon = Cfg.icon;
                return (
                  <tr key={devis.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 py-4 font-bold text-slate-800">{devis.numero}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-700">{devis.client}</div>
                      <div className="text-[11px] text-slate-400">{devis.clientEmail}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{devis.dateCreation}</td>
                    <td className="px-5 py-4 text-slate-600">{devis.dateExpiration}</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-800">{formatCurrency(devis.montantTTC)}</div>
                      <div className="text-[11px] text-slate-400">{t('devis.table.ht')}: {formatCurrency(devis.montantHT)}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${Cfg.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {Cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setSelectedDevis(devis); setIsDetailOpen(true); }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title={t('devis.actions.view')}>
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {devis.status === 'draft' && (
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={t('devis.actions.send')}>
                            <PaperAirplaneIcon className="h-4 w-4" />
                          </button>
                        )}
                        {devis.status === 'accepted' && (
                          <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title={t('devis.actions.convert')}>
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        )}
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title={t('devis.actions.print')}>
                          <PrinterIcon className="h-4 w-4" />
                        </button>
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
      {selectedDevis && (
        <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`${t('devis.detail.title')} — ${selectedDevis.numero}`} size="xl">
          <div className="space-y-6 p-2">
            {/* Header Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center"><UserIcon className="h-3 w-3 mr-1"/>{t('devis.detail.client')}</p>
                <p className="font-bold text-slate-800 text-sm">{selectedDevis.client}</p>
                <p className="text-[11px] text-slate-500">{selectedDevis.clientEmail}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center"><CalendarIcon className="h-3 w-3 mr-1"/>{t('devis.detail.dates')}</p>
                <p className="text-sm font-semibold text-slate-700">{selectedDevis.dateCreation}</p>
                <p className="text-[11px] text-slate-400">{t('devis.detail.expires')}: {selectedDevis.dateExpiration}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center"><BanknotesIcon className="h-3 w-3 mr-1"/>{t('devis.detail.amount')}</p>
                <p className="text-lg font-black text-slate-900">{formatCurrency(selectedDevis.montantTTC)}</p>
                <p className="text-[11px] text-slate-400">{t('devis.table.ht')}: {formatCurrency(selectedDevis.montantHT)}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t('devis.detail.status')}</p>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${statusConfig[selectedDevis.status].color}`}>
                  {statusConfig[selectedDevis.status].label}
                </span>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">{t('devis.detail.items')}</h4>
              <div className="overflow-x-auto no-scrollbar rounded-xl border border-slate-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {[t('devis.detail.designation'), t('devis.detail.qty'), t('devis.detail.unit_price'), t('devis.detail.tva'), t('devis.detail.total')].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedDevis.items.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{item.designation}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{item.qty}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{item.tva}%</td>
                        <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">{formatCurrency(item.qty * item.unitPrice * (1 + item.tva / 100))}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase whitespace-nowrap">{t('devis.detail.total_ht')}</td>
                      <td className="px-4 py-3 font-bold text-slate-800 whitespace-nowrap">{formatCurrency(selectedDevis.montantHT)}</td>
                    </tr>
                    <tr>
                      <td colSpan={4} className="px-4 py-2 text-right text-xs font-bold text-slate-600 uppercase whitespace-nowrap">{t('devis.detail.tva_total')}</td>
                      <td className="px-4 py-2 font-bold text-slate-800 whitespace-nowrap">{formatCurrency(selectedDevis.montantTVA)}</td>
                    </tr>
                    <tr className="bg-slate-100">
                      <td colSpan={4} className="px-4 py-3 text-right text-xs font-black text-slate-800 uppercase whitespace-nowrap">{t('devis.detail.total_ttc')}</td>
                      <td className="px-4 py-3 font-black text-slate-900 text-lg whitespace-nowrap">{formatCurrency(selectedDevis.montantTTC)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Notes */}
            {selectedDevis.notes && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-[10px] font-bold text-amber-700 uppercase mb-1">{t('devis.detail.notes')}</p>
                <p className="text-sm text-amber-900">{selectedDevis.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button onClick={() => window.print()} className="flex items-center px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <PrinterIcon className="h-4 w-4 mr-2" />{t('devis.actions.print')}
              </button>
              <button className="flex items-center px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />{t('devis.actions.download')} PDF
              </button>
              {selectedDevis.status === 'draft' && (
                <button className="flex items-center px-5 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                  <CheckCircleIcon className="h-4 w-4 mr-2" />{t('devis.actions.validate_send') || 'Valider & Envoyer'}
                </button>
              )}
              {selectedDevis.status === 'sent' && (
                <div className="flex gap-2">
                  <button className="flex items-center px-4 py-2 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
                    <CheckCircleIcon className="h-4 w-4 mr-2" />{t('devis.actions.accept') || 'Accepter'}
                  </button>
                  <button className="flex items-center px-4 py-2 text-sm font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
                    <XCircleIcon className="h-4 w-4 mr-2" />{t('devis.actions.refuse') || 'Refuser'}
                  </button>
                </div>
              )}
              {selectedDevis.status === 'accepted' && (
                <button className="flex items-center px-5 py-2 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">
                  <ArrowPathIcon className="h-4 w-4 mr-2" />{t('devis.actions.convert_to_invoice')}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Create Modal Placeholder */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title={t('devis.create_modal.title')} size="xl">
        <div className="p-4 text-center text-slate-500 py-12">
          <DocumentTextIcon className="h-12 w-12 mx-auto text-slate-300 mb-4" />
          <p className="font-semibold text-slate-700">{t('devis.create_modal.placeholder')}</p>
          <p className="text-sm mt-2">{t('devis.create_modal.desc')}</p>
        </div>
      </Modal>
    </div>
  );
};

export default Devis;
