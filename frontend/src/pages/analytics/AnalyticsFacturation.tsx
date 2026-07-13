import React, { useState, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { useTranslation } from '@/shared/hooks/useTranslation';
import {
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  CogIcon,
  CalendarIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  XMarkIcon,
  TrashIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
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
  Filler,
  RadialLinearScale
} from 'chart.js';
import Card from '@shared/components/UI/Card';
import { useApp } from '@core/context/AppContext';
import { usePermission } from '@shared/hooks/usePermission';
import { useClients } from '@shared/hooks/useClients';
import { invoiceService, type Invoice, type InvoiceItem, type EntityDetails, type AuditLog } from '../../services/modules/invoiceService';

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
  Filler,
  RadialLinearScale
);

const AnalyticsFacturation: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { formatCurrency } = useApp();
  const { user, has } = usePermission();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Helper pour convertir les nombres en lettres (Algérie)
  const numberToWords = (n: number): string => {
    const stringify = (n: number): string => {
      if (n < 20) return ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'][n];
      if (n < 100) return ['vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'][Math.floor(n / 10) - 2] + (n % 10 ? '-' + stringify(n % 10) : '');
      if (n < 1000) return (Math.floor(n / 100) > 1 ? stringify(Math.floor(n / 100)) + ' cents' : 'cent') + (n % 100 ? ' ' + stringify(n % 100) : '');
      if (n < 1000000) return (Math.floor(n / 1000) > 1 ? stringify(Math.floor(n / 1000)) + ' mille' : 'mille') + (n % 1000 ? ' ' + stringify(n % 1000) : '');
      return n.toString(); // Simplification pour > 1M dans cet exemple rapide, idéalement on étendrait
    };

    // Extension simple pour les millions (contexte BTP/Industrie)
    const parts = n.toString().split('.');
    let integerPart = parseInt(parts[0]);
    const decimalPart = parts[1] ? parseInt(parts[1].padEnd(2, '0').substring(0, 2)) : 0;

    let result = '';

    if (integerPart >= 1000000) {
      const millions = Math.floor(integerPart / 1000000);
      result += stringify(millions) + (millions > 1 ? ' millions ' : ' million ');
      integerPart %= 1000000;
    }

    result += stringify(integerPart);
    result += ' ' + (i18n.language === 'ar' ? 'دينار جزائري' : i18n.language === 'en' ? 'Algerian Dinars' : 'Dinars Algériens');

    if (decimalPart > 0) {
      result += (i18n.language === 'ar' ? ' و ' : i18n.language === 'en' ? ' and ' : ' et ') + stringify(decimalPart) + (i18n.language === 'ar' ? ' سنتيم' : i18n.language === 'en' ? ' centimes' : ' centimes');
    }

    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  // Coordonnées de l'entreprise (Émetteur)
  const myCompany = {
    nom: 'DINARLYTICS SOLUTIONS ALGERIE',
    adresse: '04 Rue des Frères Bouchakour, Hydra, Alger',
    nif: '001516273849506',
    nis: '001916273849501',
    rc: '16/00-1234567B12',
    ai: '16123456789',
    tel: '+213 (0) 23 45 67 89',
    email: 'contact@dinarlytics.dz'
  };

  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    id: '',
    factureId: '',
    type: 'sale',
    client: '',
    entityDetails: {
      adresse: '',
      nif: '',
      nis: '',
      rc: '',
      ai: '',
      rib: ''
    },
    date: new Date().toISOString().split('T')[0],
    echeance: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    items: [{ desc: '', qty: 1, pu: 0, type: 'bien', tva_rate: 19, line_total_ht: 0, line_total_tva: 0, line_total_ttc: 0 }],
    paymentMode: 'virement',
    tvaRate: 19,
    statut: 'en_cours',
    secteur: 'services',
    audit: [],
    totalHT: 0,
    totalTVA: 0,
    totalTAP: 0,
    droitTimbre: 0,
    totalTTC: 0
  });

  const [isEditing, setIsEditing] = useState(false);
  // La facture réelle est liée à un client_id (clé étrangère), pas à une
  // raison sociale saisie librement — sans quoi le backend rejette la
  // création (client_id requis, "client" en texte libre n'existe pas
  // dans CreateInvoiceRequest).
  const [selectedClientId, setSelectedClientId] = useState('');
  const [savingInvoice, setSavingInvoice] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { clients } = useClients();

  const addItem = () => {
    const items = [...(newInvoice.items || [])];
    items.push({ desc: '', qty: 1, pu: 0, type: 'bien', tva_rate: 19, line_total_ht: 0, line_total_tva: 0, line_total_ttc: 0 });
    setNewInvoice({ ...newInvoice, items });
  };

  // State for invoices (loaded dynamically from backend)
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getAll('sale');
      setInvoices(data);
    } catch (e) {
      console.error("Failed to load invoices", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSaveInvoice = async () => {
    setSaveError(null);

    if (!selectedClientId) {
      setSaveError(t('invoices.modal.client_required', { defaultValue: 'Sélectionnez un client existant.' }));
      return;
    }
    const validItems = (newInvoice.items || []).filter(it => it.desc && it.qty > 0);
    if (validItems.length === 0) {
      setSaveError(t('invoices.modal.items_required', { defaultValue: 'Au moins une ligne valide est requise.' }));
      return;
    }

    // Le backend recalcule TOUJOURS TVA/timbre/totaux côté serveur à
    // partir des lignes — il ne reçoit ni ne fait confiance à des totaux
    // pré-calculés côté client. La TAP (Taxe sur l'Activité
    // Professionnelle) n'est PAS un montant facturé au client : c'est un
    // impôt sur le chiffre d'affaires du VENDEUR, déclaré périodiquement
    // (cf. G50), pas une ligne de la facture — l'inclure dans le TTC dû
    // par le client aurait surfacturé chaque facture de 1%.
    const payload = {
      client_id: selectedClientId,
      date_emission: newInvoice.date,
      date_echeance: newInvoice.echeance,
      payment_mode: newInvoice.paymentMode === 'especes' ? 'cash' : 'transfer',
      notes: undefined as string | undefined,
      items: validItems.map(item => ({
        description: item.desc,
        quantity: item.qty,
        unit_price: item.pu,
        tva_rate: (item.tva_rate || 19) / 100
      }))
    };

    setSavingInvoice(true);
    try {
      if (isEditing && newInvoice.id) {
        await invoiceService.update(newInvoice.id, payload as any);
      } else {
        await invoiceService.create(payload as any);
      }
      await fetchInvoices();
      setIsCreateModalOpen(false);
      setIsEditing(false);
      resetNewInvoice();
    } catch (e: any) {
      // Erreur affichée à l'utilisateur au lieu d'être avalée en console —
      // la fermeture automatique de la modale donnait l'illusion trompeuse
      // que la facture avait été créée alors que la requête échouait.
      setSaveError(e?.response?.data?.detail || e?.message || 'Erreur lors de l\'enregistrement de la facture');
    } finally {
      setSavingInvoice(false);
    }
  };

  const resetNewInvoice = () => {
    setNewInvoice({
      id: '',
      factureId: '',
      type: 'sale',
      client: '',
      entityDetails: { adresse: '', nif: '', nis: '', rc: '', ai: '', rib: '' },
      date: new Date().toISOString().split('T')[0],
      echeance: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      items: [{ desc: '', qty: 1, pu: 0, type: 'bien', tva_rate: 19, line_total_ht: 0, line_total_tva: 0, line_total_ttc: 0 }],
      paymentMode: 'virement',
      tvaRate: 19,
      statut: 'en_cours',
      secteur: 'services',
      audit: []
    });
    setSelectedClientId('');
    setSaveError(null);
  };

  const handleEditInvoice = (inv: Invoice) => {
    if (inv.statut !== 'en_attente') {
      // en_attente == 'draft' côté backend (cf. STATUS_MAP) — seules les
      // factures brouillon sont modifiables ; une facture validée/annulée
      // ne peut être réécrite (pas d'endpoint serveur pour ça, à dessein).
      alert(t('invoices.modal.only_draft_editable', { defaultValue: 'Seules les factures en brouillon peuvent être modifiées.' }));
      return;
    }
    setNewInvoice(inv);
    setSelectedClientId(inv.customerId || '');
    setIsEditing(true);
    setIsCreateModalOpen(true);
  };

  const handleDeleteInvoice = async (id: string) => {
    if (window.confirm(t('common.confirm_delete', "Êtes-vous sûr de vouloir supprimer cette facture ?"))) {
      try {
        await invoiceService.cancel(id);
        await fetchInvoices();
      } catch (e) {
        console.error("Failed to delete/cancel invoice", e);
      }
    }
  };


  // Calcul des métriques basées sur ces données
  const stats = useMemo(() => {
    const totalCA = invoices.reduce((sum, inv) => sum + inv.totalTTC, 0);
    const totalPaye = invoices.filter(i => i.statut === 'payee').reduce((sum, inv) => sum + inv.totalTTC, 0);
    const totalEnCours = invoices.filter(i => i.statut === 'en_cours').reduce((sum, inv) => sum + inv.totalTTC, 0);
    const totalRetard = invoices.filter(i => i.statut === 'en_retard').reduce((sum, inv) => sum + inv.totalTTC, 0);

    return {
      totalCA,
      totalPaye,
      totalEnCours,
      totalRetard,
      tauxRecouvrement: (totalPaye / totalCA) * 100,
      nbFactures: invoices.length,
      panierMoyen: totalCA / invoices.length
    };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = inv.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'tous' || inv.statut === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, searchQuery, statusFilter]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`
        }
      }
    }
  };

  const revenueData = useMemo(() => ({
    labels: t('invoices.chart.labels', { returnObjects: true }) as string[],
    datasets: [
      {
        label: t('invoices.chart.dataset_label'),
        data: [0, 0, 0, 0, 0, stats.totalCA],
        borderColor: '#0f172a', // slate-900
        backgroundColor: 'rgba(15, 23, 42, 0.05)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#0f172a',
        pointBorderWidth: 2
      }
    ]
  }), [stats.totalCA]);

  const openDetails = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-8 p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Header Premium (Sober) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-slate-700 mr-3" />
              {t('invoices.title')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium ml-11">{t('invoices.subtitle')}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {has('facturation-create') && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  resetNewInvoice();
                  setIsCreateModalOpen(true);
                }}
                className="flex-1 sm:flex-none px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" /> {t('invoices.new_invoice')}
              </button>
            )}
            <button className="p-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center">
              <CogIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-slate-600"><CurrencyDollarIcon className="h-6 w-6" /></div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">0%</span>
          </div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('invoices.global_ca')}</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatCurrency(stats.totalCA)}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600"><CheckCircleIcon className="h-6 w-6" /></div>
            <span className="text-xs font-bold text-slate-400">{t('invoices.total_collected')}</span>
          </div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('invoices.recovery')}</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatCurrency(stats.totalPaye)}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600"><ClockIcon className="h-6 w-6" /></div>
            <span className="text-xs font-bold text-amber-600">{t('invoices.pending')}</span>
          </div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('invoices.active_receivables')}</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatCurrency(stats.totalEnCours)}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl text-rose-600"><ExclamationTriangleIcon className="h-6 w-6" /></div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">{t('invoices.critical')}</span>
          </div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('invoices.payment_delays')}</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{formatCurrency(stats.totalRetard)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Graphique d'évolution */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-800 dark:text-white">{t('invoices.evolution_chart')}</h3>
            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
              <button className="px-4 py-1.5 text-xs font-bold bg-white dark:bg-slate-600 rounded-lg shadow-sm">{t('invoices.chart.monthly')}</button>
              <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">{t('invoices.chart.weekly')}</button>
            </div>
          </div>
          <div className="h-[300px]">
            <Line data={revenueData} options={chartOptions} />
          </div>
        </div>

        {/* Répartition par secteur */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">{t('invoices.growing_sectors')}</h3>
          <div className="space-y-6">
            {[
              { label: t('invoices.sectors.industry'), value: 0, color: 'bg-blue-500' },
              { label: t('invoices.sectors.it'), value: 0, color: 'bg-emerald-500' },
              { label: t('invoices.sectors.construction'), value: 0, color: 'bg-amber-500' },
              { label: t('invoices.sectors.others'), value: 0, color: 'bg-slate-300' }
            ].map((s, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{s.label}</span>
                  <span className="text-sm font-black text-slate-800 dark:text-white">{s.value}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                  <div className={`${s.color} h-2.5 rounded-full`} style={{ width: `${s.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center text-slate-900 dark:text-white text-sm font-bold">
              <SparklesIcon className="h-5 w-5 mr-2" /> {t('invoices.ia_tip')}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              <Trans i18nKey="invoices.ia_tip_desc">
                Le secteur <span className="underline italic">Industrie</span> porte 65% de vos revenus ce mois. Pensez à diversifier pour réduire le risque.
              </Trans>
            </p>
          </div>
        </div>
      </div>

      {/* Liste des Factures */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white">{t('invoices.register_title')}</h3>
              <p className="text-sm text-slate-500 font-medium tracking-tight">{t('invoices.register_subtitle')}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('invoices.search_placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none transition-all text-sm font-bold"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-slate-500 outline-none transition-all appearance-none"
              >
                <option value="tous">{t('invoices.all_statuses')}</option>
                <option value="payee">{t('invoices.status.paid')}</option>
                <option value="en_cours">{t('invoices.pending')}</option>
                <option value="en_retard">{t('invoices.status.overdue')}</option>
                <option value="annule">{t('invoices.status.cancelled')}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 text-[10px] font-black uppercase tracking-[0.1em] border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-8 py-5 text-left whitespace-nowrap">{t('invoices.table.invoice_no')}</th>
                <th className="px-8 py-5 text-left whitespace-nowrap">{t('invoices.table.client_dz')}</th>
                <th className="px-8 py-5 text-left whitespace-nowrap">{t('invoices.table.dates')}</th>
                <th className="px-8 py-5 text-right whitespace-nowrap">{t('invoices.table.amount_ttc')}</th>
                <th className="px-8 py-5 text-center whitespace-nowrap">{t('invoices.table.status')}</th>
                <th className="px-8 py-5 text-center whitespace-nowrap">{t('invoices.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg mr-3 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">
                        <DocumentTextIcon className="h-5 w-5 text-slate-500" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{inv.id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{inv.client}</span>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{inv.secteur}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col text-xs font-bold">
                      <span className="text-slate-600 dark:text-slate-400">Émise: {new Date(inv.date).toLocaleDateString()}</span>
                      <span className="text-slate-400 mt-1">Échéance: {new Date(inv.echeance).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right font-black text-slate-900 dark:text-white">
                    {formatCurrency(inv.totalTTC)}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${inv.statut === 'payee' ? 'bg-emerald-100 text-emerald-700' :
                        inv.statut === 'en_retard' ? 'bg-rose-100 text-rose-700' :
                          inv.statut === 'annule' ? 'bg-slate-200 text-slate-700' :
                            'bg-amber-100 text-amber-700'
                        }`}>
                        {inv.statut === 'payee' ? t('invoices.status.collected') :
                          inv.statut === 'en_retard' ? t('invoices.status.critical_delay') :
                            inv.statut === 'annule' ? t('invoices.status.cancelled') : t('invoices.status.pending_attente')}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 hover:text-slate-900 hover:border-slate-900 shadow-sm transition-all" title={t('invoices.actions.view_pdf')}>
                        <PrinterIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditInvoice(inv)}
                        className="p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-600 shadow-sm transition-all"
                        title={t('invoices.actions.edit')}
                      >
                        <CogIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(inv.id)}
                        className="p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 hover:text-rose-600 hover:border-rose-600 shadow-sm transition-all"
                        title={t('invoices.actions.delete')}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDetails(inv)}
                        className="p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 hover:text-slate-900 hover:border-slate-900 shadow-sm transition-all"
                        title={t('invoices.actions.details')}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="p-8 sm:p-20 text-center">
            <MagnifyingGlassIcon className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">{t('invoices.table.no_results')}</p>
          </div>
        )}

        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500">{t('invoices.table.pagination', { count: filteredInvoices.length, total: invoices.length })}</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold disabled:opacity-50">{t('common.previous', "Précédent")}</button>
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold">{t('common.next', "Suivant")}</button>
          </div>
        </div>
      </div>

      {/* Modal Création Facture */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-y-auto border border-white/20 relative">
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditing(false);
                resetNewInvoice();
              }}
              className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 hover:bg-rose-100 hover:text-rose-500 transition-all z-10"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <div className="p-6 sm:p-10">
              <div className="mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center">
                  <DocumentTextIcon className="h-8 w-8 text-slate-700 mr-3" />
                  {isEditing ? t('invoices.modal.edit_title', { id: newInvoice.id }) : t('invoices.modal.create_title')}
                </h2>
                <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest">{t('invoices.modal.legal_info')}</p>
              </div>

              {/* Section Client & Fisc */}
              <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl mb-8 border border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-2" /> {t('invoices.modal.client_id_section')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('invoices.modal.raison_sociale')}</label>
                    <select
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={selectedClientId}
                      onChange={(e) => {
                        const c = clients.find((cl: any) => cl.id === e.target.value);
                        setSelectedClientId(e.target.value);
                        setNewInvoice({ ...newInvoice, client: c ? c.nom : '' });
                      }}
                    >
                      <option value="">{t('invoices.modal.select_client', { defaultValue: 'Sélectionner un client' })}</option>
                      {clients.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.nom || c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('invoices.modal.address_billing')}</label>
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newInvoice.entityDetails?.adresse || ''}
                      onChange={(e) => setNewInvoice({ ...newInvoice, entityDetails: { ...(newInvoice.entityDetails || {} as EntityDetails), adresse: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('invoices.modal.nif')}</label>
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newInvoice.entityDetails?.nif || ''}
                      onChange={(e) => setNewInvoice({ ...newInvoice, entityDetails: { ...(newInvoice.entityDetails || {} as EntityDetails), nif: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('invoices.modal.nis')}</label>
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newInvoice.entityDetails?.nis || ''}
                      onChange={(e) => setNewInvoice({ ...newInvoice, entityDetails: { ...(newInvoice.entityDetails || {} as EntityDetails), nis: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('invoices.modal.rc')}</label>
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newInvoice.entityDetails?.rc || ''}
                      onChange={(e) => setNewInvoice({ ...newInvoice, entityDetails: { ...(newInvoice.entityDetails || {} as EntityDetails), rc: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('invoices.modal.ai')}</label>
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newInvoice.entityDetails?.ai || ''}
                      onChange={(e) => setNewInvoice({ ...newInvoice, entityDetails: { ...(newInvoice.entityDetails || {} as EntityDetails), ai: e.target.value } })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('invoices.modal.rib')}</label>
                    <input
                      type="text"
                      placeholder="001 00016 0123456789 01"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newInvoice.entityDetails?.rib || ''}
                      onChange={(e) => setNewInvoice({ ...newInvoice, entityDetails: { ...(newInvoice.entityDetails || {} as EntityDetails), rib: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('invoices.modal.sector')}</label>
                    <select
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-bold outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                      value={newInvoice.secteur || 'services'}
                      onChange={(e) => setNewInvoice({ ...newInvoice, secteur: e.target.value })}
                    >
                      <option value="btp">Construction / BTP</option>
                      <option value="services">Services IT / Conseil</option>
                      <option value="industrie">Industrie / Oil & Gas</option>
                      <option value="commerce">Commerce / Distribution</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('invoices.table.status')}</label>
                    <select
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-bold outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                      value={newInvoice.statut || 'en_cours'}
                      onChange={(e) => setNewInvoice({ ...newInvoice, statut: e.target.value as any })}
                    >
                      <option value="en_cours">En attente (Pro forma)</option>
                      <option value="payee">Encaissée (Définitive)</option>
                      <option value="en_retard">Retard de paiement</option>
                      <option value="annule">Annulée</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('invoices.modal.date_emission')}</label>
                    <input
                      type="date"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newInvoice.date || ''}
                      onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('invoices.modal.date_echeance')}</label>
                    <input
                      type="date"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newInvoice.echeance || ''}
                      onChange={(e) => setNewInvoice({ ...newInvoice, echeance: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Section Articles */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('invoices.modal.items_title')}</h3>
                  <button
                    onClick={() => {
                      const items = [...(newInvoice.items || [])];
                      items.push({ desc: '', qty: 1, pu: 0, type: 'bien', tva_rate: 19, line_total_ht: 0, line_total_tva: 0, line_total_ttc: 0 });
                      setNewInvoice({ ...newInvoice, items });
                    }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-200 transition-all flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" /> {t('invoices.modal.add_item')}
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-[10px] font-black uppercase text-slate-400 mb-2">
                    <div className="col-span-3">{t('invoices.modal.item_desc')}</div>
                    <div className="col-span-2">Type (Compta)</div>
                    <div className="col-span-2 text-center">{t('invoices.modal.item_qty')}</div>
                    <div className="col-span-2 text-right">{t('invoices.modal.item_pu')}</div>
                    <div className="col-span-2 text-center">{t('invoices.modal.item_tva')}</div>
                    <div className="col-span-1"></div>
                  </div>
                  {(newInvoice.items || []).map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm group">
                      <div className="md:col-span-3">
                        <label className="block md:hidden text-[10px] font-black uppercase text-slate-400 mb-1">{t('invoices.modal.item_desc')}</label>
                        <input
                          type="text"
                          placeholder="Désignation..."
                          className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-500"
                          value={item.desc}
                          onChange={(e) => {
                            const items = [...(newInvoice.items || [])];
                            items[idx].desc = e.target.value;
                            setNewInvoice({ ...newInvoice, items });
                          }}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block md:hidden text-[10px] font-black uppercase text-slate-400 mb-1">Type (Compta)</label>
                        <select
                          className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-slate-500 appearance-none"
                          value={item.type}
                          onChange={(e) => {
                            const items = [...(newInvoice.items || [])];
                            items[idx].type = e.target.value as 'bien' | 'service';
                            setNewInvoice({ ...newInvoice, items });
                          }}
                        >
                          <option value="bien">Bien (700)</option>
                          <option value="service">Service (706)</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block md:hidden text-[10px] font-black uppercase text-slate-400 mb-1 text-center">{t('invoices.modal.item_qty')}</label>
                        <input
                          type="number"
                          className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-slate-500 text-center"
                          value={item.qty}
                          onChange={(e) => {
                            const items = [...(newInvoice.items || [])];
                            items[idx].qty = parseInt(e.target.value) || 0;
                            setNewInvoice({ ...newInvoice, items });
                          }}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block md:hidden text-[10px] font-black uppercase text-slate-400 mb-1 text-right">{t('invoices.modal.item_pu')}</label>
                        <input
                          type="number"
                          className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl px-4 py-3 text-sm font-black outline-none focus:ring-2 focus:ring-slate-500 text-right font-mono"
                          value={item.pu}
                          onChange={(e) => {
                            const items = [...(newInvoice.items || [])];
                            items[idx].pu = parseFloat(e.target.value) || 0;
                            setNewInvoice({ ...newInvoice, items });
                          }}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block md:hidden text-[10px] font-black uppercase text-slate-400 mb-1 text-center">{t('invoices.modal.item_tva')}</label>
                        <select
                          className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl px-4 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-slate-500 appearance-none text-center"
                          value={item.tva_rate}
                          onChange={(e) => {
                            const items = [...(newInvoice.items || [])];
                            items[idx].tva_rate = parseInt(e.target.value);
                            setNewInvoice({ ...newInvoice, items });
                          }}
                        >
                          <option value={19}>19% (Normal)</option>
                          <option value={9}>9% (Réduit)</option>
                          <option value={0}>0% (Exonéré)</option>
                        </select>
                      </div>
                      <div className="md:col-span-1 flex justify-center">
                        <button
                          onClick={() => {
                            if ((newInvoice.items || []).length > 1) {
                              const items = (newInvoice.items || []).filter((_, i) => i !== idx);
                              setNewInvoice({ ...newInvoice, items });
                            }
                          }}
                          className="text-slate-300 hover:text-rose-500 transition-colors p-2"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section Mode de Paiement & Timbre */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{t('invoices.modal.payment_config')}</label>
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-4">
                    {['virement', 'cheque', 'especes', 'carte'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setNewInvoice({ ...newInvoice, paymentMode: mode })}
                        className={`px-4 sm:px-6 py-3 rounded-2xl text-[10px] sm:text-xs font-black uppercase transition-all flex items-center justify-center ${newInvoice.paymentMode === mode
                          ? 'bg-slate-900 text-white shadow-xl scale-105'
                          : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-slate-400'
                          }`}
                      >
                        {mode === 'especes' && <BanknotesIcon className="h-4 w-4 mr-2" />}
                        {mode}
                      </button>
                    ))}
                  </div>
                  {newInvoice.paymentMode === 'especes' && (
                    <div className="mt-4 flex items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800/30">
                      <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 mr-2" />
                      <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500">
                        Attention : Le paiement en espèces génère un droit de timbre de 1% du TTC (arrondi au dinar supérieur), au-delà de 2 500 DA.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Simulateur Comptable & Validation */}
                  <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl shadow-slate-900/30">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-slate-700 pb-8">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('invoices.modal.ttc_total')}</span>
                        <div className="text-4xl font-black mt-2">
                          {formatCurrency(
                            (() => {
                              // La TAP (Taxe sur l'Activité Professionnelle) N'EST PAS
                              // due par le client : c'est un impôt sur le CA du vendeur,
                              // déclaré périodiquement (G50), jamais une ligne facturée.
                              // Le TTC réellement dû par le client = HT + TVA + timbre.
                              const items = (newInvoice.items || []);
                              const totalHT = items.reduce((acc, i) => acc + (i.qty * i.pu), 0);
                              const totalTVA = items.reduce((acc, i) => acc + Math.round((i.qty * i.pu) * ((i.tva_rate || 19) / 100)), 0);
                              const rawTotal = totalHT + totalTVA;
                              const dt = newInvoice.paymentMode === 'especes' && rawTotal > 2500
                                ? Math.round(rawTotal * 0.01) : 0;
                              return rawTotal + dt;
                            })()
                          )}
                        </div>
                      </div>
                      <div className="flex gap-4 mt-6 md:mt-0">
                        <div className="text-right">
                          <span className="block text-[10px] font-bold text-slate-500 uppercase">TVA</span>
                          <span className="font-mono font-bold text-lg">
                            {formatCurrency(
                              (newInvoice.items || []).reduce((acc, i) => acc + Math.round((i.qty * i.pu) * ((i.tva_rate || 19) / 100)), 0)
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Imputation Comptable (Live Preview) */}
                    <div className="space-y-3 mb-8">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-3 flex items-center">
                        <CalculatorIcon className="h-3 w-3 mr-2" /> Simulation d'Imputation Comptable (Grand Livre)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-slate-400">700 - Ventes Marchandises</span>
                            <span className="text-[10px] font-black text-emerald-400">CR</span>
                          </div>
                          <div className="font-mono font-bold">{formatCurrency((newInvoice.items || []).filter(i => i.type === 'bien').reduce((acc, i) => acc + i.qty * i.pu, 0))}</div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-slate-400">706 - Prestations Services</span>
                            <span className="text-[10px] font-black text-emerald-400">CR</span>
                          </div>
                          <div className="font-mono font-bold">{formatCurrency((newInvoice.items || []).filter(i => i.type === 'service').reduce((acc, i) => acc + i.qty * i.pu, 0))}</div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-slate-400" title="Provision interne — impôt sur le CA du vendeur, non facturé au client">443 - TAP (provision interne, 1%)</span>
                            <span className="text-[10px] font-black text-emerald-400">CR</span>
                          </div>
                          <div className="font-mono font-bold">{formatCurrency(Math.round((newInvoice.items || []).reduce((acc, i) => acc + (i.qty * i.pu), 0) * 0.01))}</div>
                        </div>
                        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-slate-400">4457 - TVA Collectée</span>
                            <span className="text-[10px] font-black text-emerald-400">CR</span>
                          </div>
                          <div className="font-mono font-bold">{formatCurrency((newInvoice.items || []).reduce((acc, i) => acc + Math.round((i.qty * i.pu) * ((i.tva_rate || 19) / 100)), 0))}</div>
                        </div>
                      </div>
                    </div>

                    {saveError && (
                      <div className="mb-3 bg-red-500/10 border border-red-500/30 text-red-300 text-xs rounded-xl p-3">{saveError}</div>
                    )}
                    <button
                      onClick={handleSaveInvoice}
                      disabled={savingInvoice}
                      className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl disabled:opacity-50"
                    >
                      {savingInvoice ? t('common.loading', { defaultValue: 'Enregistrement...' }) : t('invoices.modal.save')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Détail Facture (Ultra-réaliste & Conforme Fiscalement) */}
      {
        isDetailModalOpen && selectedInvoice && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto border border-white/20 relative animate-scale-up">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 hover:bg-rose-100 hover:text-rose-500 transition-all z-10"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              {/* Header Document Officiel */}
              <div className="p-6 sm:p-12 border-b border-slate-100 dark:border-slate-700">
                <div className="flex flex-col md:flex-row justify-between gap-12">
                  {/* Émetteur (Mon Entreprise) */}
                  <div className="flex-1">
                    <div className="flex items-center mb-6">
                      <div className="bg-slate-900 p-2 rounded-lg mr-3 shadow-lg shadow-slate-900/20">
                        <SparklesIcon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{myCompany.nom}</h3>
                    </div>
                    <div className="space-y-1 text-xs text-slate-500 font-bold">
                      <p>{myCompany.adresse}</p>
                      <p>Tél: {myCompany.tel} • Email: {myCompany.email}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                        <p><span className="text-slate-400 font-black">NIF:</span> {myCompany.nif}</p>
                        <p><span className="text-slate-400 font-black">RC:</span> {myCompany.rc}</p>
                        <p><span className="text-slate-400 font-black">NIS:</span> {myCompany.nis}</p>
                        <p><span className="text-slate-400 font-black">AI:</span> {myCompany.ai}</p>
                      </div>
                    </div>
                  </div>

                  {/* Info Facture */}
                  <div className="flex-1 md:text-right border-l md:border-l-0 md:border-r border-slate-100 dark:border-slate-800 px-0 md:px-12 order-first md:order-none">
                    <div className="inline-block px-4 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                      {t('invoices.detail.document_original')}
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-2">{selectedInvoice.id}</h2>
                    <p className="text-sm font-black text-slate-500 uppercase">{t('invoices.detail.facture_vente_definitive')}</p>
                    <p className="text-xs text-slate-400 font-bold mt-4 uppercase">{t('invoices.detail.issue_date')} {new Date(selectedInvoice.date).toLocaleDateString(i18n.language)}</p>
                  </div>
                </div>

                {/* Client & Destinataire */}
                <div className="mt-12 bg-slate-50 dark:bg-slate-900/50 p-6 sm:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{t('invoices.detail.billed_to')}</h4>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mb-2">{selectedInvoice.client}</p>
                      <p className="text-sm font-bold text-slate-500 leading-relaxed mb-4">{selectedInvoice.entityDetails?.adresse}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] font-black uppercase">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                          <span className="text-slate-400 block mb-1">{t('invoices.detail.nif_client')}</span>
                          <span className="text-slate-700 dark:text-slate-200">{selectedInvoice.entityDetails?.nif || 'Non communiqué'}</span>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                          <span className="text-slate-400 block mb-1">{t('invoices.detail.rc_client')}</span>
                          <span className="text-slate-700 dark:text-slate-200">{selectedInvoice.entityDetails?.rc || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">{t('invoices.detail.payment_conditions')}</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-400">{t('invoices.detail.due_date')}</span>
                            <span className="text-slate-800 dark:text-slate-200">{new Date(selectedInvoice.echeance).toLocaleDateString(i18n.language)}</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-400">{t('invoices.detail.payment_mode')}</span>
                            <span className="text-slate-800 dark:text-slate-200 uppercase">{selectedInvoice.paymentMode}</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-400">{t('invoices.detail.currency')}</span>
                            <span className="text-slate-800 dark:text-slate-200">{t('invoices.detail.currency_val')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Corps de Facture */}
              <div className="p-6 sm:p-12">
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full mb-12">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-widest border-y border-slate-100 dark:border-slate-700">
                        <th className="px-6 py-4 text-left whitespace-nowrap">{t('invoices.detail.table_desc')}</th>
                        <th className="px-6 py-4 text-center whitespace-nowrap">{t('invoices.detail.table_imputation')}</th>
                        <th className="px-6 py-4 text-center whitespace-nowrap">{t('invoices.detail.table_qty')}</th>
                        <th className="px-6 py-4 text-right whitespace-nowrap">{t('invoices.detail.table_pu')}</th>
                        <th className="px-6 py-4 text-right whitespace-nowrap">{t('invoices.detail.table_total')}</th>
                      </tr>
                    </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {selectedInvoice.items.map((item: any, i: number) => (
                      <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="px-6 py-8">
                          <p className="text-sm font-black text-slate-800 dark:text-slate-100">{item.desc}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{t('invoices.detail.certified_service')}</p>
                        </td>
                        <td className="px-6 py-8 text-center">
                          <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase ${item.type === 'service' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                            {item.type === 'service' ? t('invoices.detail.cpte_706_short', '706 - Services') : t('invoices.detail.cpte_700_short', '700 - Ventes')}
                          </span>
                        </td>
                        <td className="px-6 py-8 text-center text-sm font-black text-slate-500">{item.qty}</td>
                        <td className="px-6 py-8 text-right text-sm font-bold text-slate-600 dark:text-slate-400 font-mono">{formatCurrency(item.pu)}</td>
                        <td className="px-6 py-8 text-right text-sm font-black text-slate-900 dark:text-white font-mono">{formatCurrency(item.qty * item.pu)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

                {/* Totaux & Lettres */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12 items-start">
                  <div className="p-8 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">{t('invoices.detail.legal_mention_title')}</h4>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic leading-relaxed">
                      {t('invoices.detail.legal_mention_sum')} <br />
                      <span className="text-slate-900 dark:text-white font-black not-italic text-lg block mt-2">
                        {numberToWords(selectedInvoice.totalTTC).toUpperCase()}
                      </span>
                    </p>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4 flex items-center">
                        <CalculatorIcon className="h-4 w-4 mr-2" /> {t('invoices.detail.fiscal_summary')}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                          <span className="text-slate-500">{t('invoices.detail.cpte_700')}</span>
                          <span className="font-mono text-slate-800 dark:text-slate-200">
                            {formatCurrency(selectedInvoice.items.filter((i: InvoiceItem) => i.type === 'bien').reduce((acc: number, i: InvoiceItem) => acc + i.qty * i.pu, 0))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                          <span className="text-slate-500">{t('invoices.detail.cpte_706')}</span>
                          <span className="font-mono text-slate-800 dark:text-slate-200">
                            {formatCurrency(selectedInvoice.items.filter((i: InvoiceItem) => i.type === 'service').reduce((acc: number, i: InvoiceItem) => acc + i.qty * i.pu, 0))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                          <span className="text-emerald-600">{t('invoices.detail.cpte_4457')}</span>
                          <span className="font-mono text-emerald-700 dark:text-emerald-400">
                            {formatCurrency(selectedInvoice.totalTVA)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 text-sm font-bold px-6">
                      <span className="text-slate-400 uppercase tracking-widest text-[10px]">{t('invoices.detail.total_ht')}</span>
                      <span className="text-slate-800 dark:text-slate-200 font-mono">{formatCurrency(selectedInvoice.totalHT)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-sm font-bold px-6 border-t border-slate-50 dark:border-slate-800">
                      <span className="text-slate-400 uppercase tracking-widest text-[10px]">{t('invoices.detail.tva')} ({selectedInvoice.tvaRate}%)</span>
                      <span className="text-slate-800 dark:text-slate-200 font-mono">{formatCurrency(selectedInvoice.totalTVA)}</span>
                    </div>
                    {selectedInvoice.droitTimbre > 0 && (
                      <div className="flex justify-between items-center py-2 text-sm font-bold px-6 border-t border-slate-50 dark:border-slate-800">
                        <span className="text-slate-400 uppercase tracking-widest text-[10px]">{t('invoices.detail.stamp_duty')}</span>
                        <span className="text-slate-800 dark:text-slate-200 font-mono">{formatCurrency(selectedInvoice.droitTimbre)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-6 bg-slate-900 text-white rounded-[1.5rem] px-8 shadow-xl shadow-slate-900/20">
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-white/70">{t('invoices.detail.net_to_pay')}</span>
                      <span className="text-3xl font-black font-mono">{formatCurrency(selectedInvoice?.totalTTC || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Journal d'Audit & Traçabilité */}
                <div className="mt-16 pt-12 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
                      <ShareIcon className="h-4 w-4 mr-2" /> {t('invoices.detail.audit_journal')}
                    </h4>
                    <div className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-black rounded-lg border border-blue-100 dark:border-blue-800/30">
                      {t('invoices.detail.digital_seal')}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {selectedInvoice.audit?.map((log: any, i: number) => (
                      <div key={i} className="flex items-start p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-50 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                        <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg mr-4">
                          <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800 dark:text-white uppercase">{log.action}</p>
                          <p className="text-[10px] font-bold text-slate-500 mt-1">{log.user} • {log.date}</p>
                        </div>
                        <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500/20 group-hover:bg-emerald-500 transition-all"></div>
                      </div>
                    ))}
                    <div className="flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-slate-300 text-[10px] font-black uppercase">
                      {t('invoices.detail.audit_end')}
                    </div>
                  </div>
                </div>

                {/* Actions de Fin de Page */}
                <div className="mt-12 flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 py-4 sm:py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center shadow-xl">
                    <PrinterIcon className="h-5 w-5 mr-3" /> {t('invoices.detail.print_official')}
                  </button>
                  <button className="flex-1 py-4 sm:py-5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center">
                    <DocumentArrowDownIcon className="h-5 w-5 mr-3" /> {t('invoices.detail.export_cert')}
                  </button>
                </div>
              </div>
            </div>
        )
      }
    </div>
  );
};

export default AnalyticsFacturation;


