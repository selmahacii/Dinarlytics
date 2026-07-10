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
import { useDevis } from '@shared/hooks/useDevis';
import { useClients } from '@shared/hooks/useClients';
import type { Devis, DevisStatus } from '@/services/modules/quotesService';

const Devis: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useApp();

  const {
    devis: allDevis,
    loading,
    error,
    createDevis,
    updateStatus,
    convertToInvoice,
  } = useDevis();
  const { clients } = useClients();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DevisStatus | 'all'>('all');
  const [selectedDevis, setSelectedDevis] = useState<Devis | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [newClientId, setNewClientId] = useState('');
  const [newExpiry, setNewExpiry] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newItems, setNewItems] = useState([{ description: '', quantity: 1, unit_price: 0, tva_rate: 0.19 }]);

  const statusConfig: Record<DevisStatus, { label: string; color: string; icon: React.ComponentType<any> }> = {
    draft:    { label: t('devis.status.draft'),    color: 'bg-slate-100 text-slate-600',   icon: PencilIcon },
    sent:     { label: t('devis.status.sent'),     color: 'bg-blue-100 text-blue-700',     icon: PaperAirplaneIcon },
    accepted: { label: t('devis.status.accepted'), color: 'bg-emerald-100 text-emerald-700', icon: CheckCircleIcon },
    refused:  { label: t('devis.status.refused'),  color: 'bg-red-100 text-red-700',       icon: XCircleIcon },
    expired:  { label: t('devis.status.expired'),  color: 'bg-amber-100 text-amber-700',   icon: ClockIcon }
  };

  const filtered = useMemo(() => {
    return allDevis.filter(d => {
      const matchSearch = d.client.toLowerCase().includes(search.toLowerCase()) ||
                          d.numero.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [allDevis, search, statusFilter]);

  const kpis = useMemo(() => ({
    total: allDevis.length,
    totalValue: allDevis.reduce((a, b) => a + b.montantTTC, 0),
    accepted: allDevis.filter(d => d.status === 'accepted').length,
    acceptedRate: allDevis.length ? Math.round((allDevis.filter(d => d.status === 'accepted').length / allDevis.length) * 100) : 0,
    pending: allDevis.filter(d => d.status === 'sent').length,
    pendingValue: allDevis.filter(d => d.status === 'sent').reduce((a, b) => a + b.montantTTC, 0),
  }), [allDevis]);

  const resetCreateForm = () => {
    setNewClientId('');
    setNewExpiry('');
    setNewNotes('');
    setNewItems([{ description: '', quantity: 1, unit_price: 0, tva_rate: 0.19 }]);
    setActionError(null);
  };

  const handleCreateDevis = async () => {
    if (!newClientId || newItems.length === 0) {
      setActionError(t('devis.create_modal.validation_error') || 'Client et au moins une ligne requis');
      return;
    }
    try {
      await createDevis({
        client_id: newClientId,
        date_creation: new Date().toISOString().slice(0, 10),
        date_expiration: newExpiry || undefined,
        notes: newNotes || undefined,
        items: newItems
          .filter(it => it.description && it.quantity > 0)
          .map(it => ({
            description: it.description,
            quantity: it.quantity,
            unit_price: it.unit_price,
            tva_rate: it.tva_rate,
          })),
      });
      resetCreateForm();
      setIsCreateOpen(false);
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err.message || 'Erreur lors de la création');
    }
  };

  const handleSend = async (id: string) => {
    try { await updateStatus(id, 'sent'); } catch (err: any) { setActionError(err.message); }
  };
  const handleAccept = async (id: string) => {
    try { await updateStatus(id, 'accepted'); } catch (err: any) { setActionError(err.message); }
  };
  const handleRefuse = async (id: string) => {
    try { await updateStatus(id, 'refused'); } catch (err: any) { setActionError(err.message); }
  };
  const handleConvert = async (id: string) => {
    try { await convertToInvoice(id); setIsDetailOpen(false); } catch (err: any) { setActionError(err.message); }
  };

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

      {(error || actionError) && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
          {error || actionError}
        </div>
      )}

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
              {loading && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">{t('common.loading')}</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">{t('devis.no_results') || t('common.no_data', { defaultValue: 'Aucun devis' })}</td></tr>
              )}
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
                          <button onClick={() => handleSend(devis.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title={t('devis.actions.send')}>
                            <PaperAirplaneIcon className="h-4 w-4" />
                          </button>
                        )}
                        {devis.status === 'accepted' && (
                          <button onClick={() => handleConvert(devis.id)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title={t('devis.actions.convert')}>
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
                <button onClick={() => handleSend(selectedDevis.id)} className="flex items-center px-5 py-2 text-sm font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                  <CheckCircleIcon className="h-4 w-4 mr-2" />{t('devis.actions.validate_send') || 'Valider & Envoyer'}
                </button>
              )}
              {selectedDevis.status === 'sent' && (
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(selectedDevis.id)} className="flex items-center px-4 py-2 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
                    <CheckCircleIcon className="h-4 w-4 mr-2" />{t('devis.actions.accept') || 'Accepter'}
                  </button>
                  <button onClick={() => handleRefuse(selectedDevis.id)} className="flex items-center px-4 py-2 text-sm font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
                    <XCircleIcon className="h-4 w-4 mr-2" />{t('devis.actions.refuse') || 'Refuser'}
                  </button>
                </div>
              )}
              {selectedDevis.status === 'accepted' && (
                <button onClick={() => handleConvert(selectedDevis.id)} className="flex items-center px-5 py-2 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">
                  <ArrowPathIcon className="h-4 w-4 mr-2" />{t('devis.actions.convert_to_invoice')}
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => { setIsCreateOpen(false); resetCreateForm(); }} title={t('devis.create_modal.title')} size="xl">
        <div className="p-2 space-y-4">
          {actionError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">{actionError}</div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('devis.detail.client')}</label>
              <select
                value={newClientId}
                onChange={e => setNewClientId(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                <option value="">{t('devis.create_modal.select_client') || 'Sélectionner un client'}</option>
                {clients.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.nom || c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('devis.detail.expires')}</label>
              <input
                type="date"
                value={newExpiry}
                onChange={e => setNewExpiry(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">{t('devis.detail.items')}</label>
              <button
                type="button"
                onClick={() => setNewItems([...newItems, { description: '', quantity: 1, unit_price: 0, tva_rate: 0.19 }])}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                + {t('devis.create_modal.add_line') || 'Ajouter une ligne'}
              </button>
            </div>
            <div className="space-y-2">
              {newItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    type="text" placeholder={t('devis.detail.designation') as string}
                    value={item.description}
                    onChange={e => setNewItems(newItems.map((it, i) => i === idx ? { ...it, description: e.target.value } : it))}
                    className="col-span-5 text-sm border border-slate-200 rounded-lg px-2 py-1.5"
                  />
                  <input
                    type="number" min={0} placeholder={t('devis.detail.qty') as string}
                    value={item.quantity}
                    onChange={e => setNewItems(newItems.map((it, i) => i === idx ? { ...it, quantity: Number(e.target.value) } : it))}
                    className="col-span-2 text-sm border border-slate-200 rounded-lg px-2 py-1.5"
                  />
                  <input
                    type="number" min={0} placeholder={t('devis.detail.unit_price') as string}
                    value={item.unit_price}
                    onChange={e => setNewItems(newItems.map((it, i) => i === idx ? { ...it, unit_price: Number(e.target.value) } : it))}
                    className="col-span-3 text-sm border border-slate-200 rounded-lg px-2 py-1.5"
                  />
                  <input
                    type="number" min={0} max={1} step={0.01} placeholder="TVA"
                    value={item.tva_rate}
                    onChange={e => setNewItems(newItems.map((it, i) => i === idx ? { ...it, tva_rate: Number(e.target.value) } : it))}
                    className="col-span-1 text-sm border border-slate-200 rounded-lg px-2 py-1.5"
                  />
                  <button
                    type="button"
                    onClick={() => setNewItems(newItems.filter((_, i) => i !== idx))}
                    disabled={newItems.length === 1}
                    className="col-span-1 p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{t('devis.detail.notes')}</label>
            <textarea
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              rows={3}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              onClick={() => { setIsCreateOpen(false); resetCreateForm(); }}
              className="px-4 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleCreateDevis}
              className="px-5 py-2 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              {t('devis.create_btn')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Devis;
