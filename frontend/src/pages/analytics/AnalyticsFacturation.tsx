import React, { useState, useMemo } from 'react';
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
import { invoiceService, type Invoice, type InvoiceItem, type ClientDetails, type AuditLog } from '../../services/modules/invoiceService';

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
    result += ' Dinars Algériens';

    if (decimalPart > 0) {
      result += ' et ' + stringify(decimalPart) + ' centimes';
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
    client: '',
    clientDetails: {
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

  const addItem = () => {
    const items = [...(newInvoice.items || [])];
    items.push({ desc: '', qty: 1, pu: 0, type: 'bien', tva_rate: 19, line_total_ht: 0, line_total_tva: 0, line_total_ttc: 0 });
    setNewInvoice({ ...newInvoice, items });
  };

  // Détermination du facteur d'échelle selon la taille de l'entreprise
  const scaleFactor = useMemo(() => {
    if (!user?.segment) return 1;
    switch (user.segment) {
      case 'micro': return 0.15;
      case 'small': return 0.6;
      case 'medium': return 1.2;
      case 'large': return 6.0;
      case 'enterprise': return 25.0;
      default: return 1;
    }
  }, [user]);

  // Initial data generator
  const getInitialInvoices = useMemo(() => {
    const rawInvoices = [
      {
        id: 'F-2024-0001',
        factureId: 'FAC-2024-0001',
        client: 'SARL El-Mountazah Construction',
        clientDetails: {
          adresse: 'Zone Industrielle Oued Smar, Alger',
          nif: '000516019012345',
          nis: '000516019012345001',
          rc: '16/00-0987654B15',
          ai: '16001234567',
          rib: '001 00016 0123456789 01'
        },
        date: '2024-02-15',
        echeance: '2024-03-15',
        paymentMode: 'virement',
        items: [
          { desc: 'Ciment Portland CPJ 42.5 (Sac 50kg)', qty: 200, pu: 850 * scaleFactor, type: 'bien', tva_rate: 19 },
          { desc: 'Rond à béton 12mm (Tonne)', qty: 5, pu: 115000 * scaleFactor, type: 'bien', tva_rate: 19 },
          { desc: 'Briques creuses 8 trous', qty: 5000, pu: 25 * scaleFactor, type: 'bien', tva_rate: 19 }
        ],
        tvaRate: 19,
        statut: 'payee',
        secteur: 'btp',
        audit: [
          { action: 'Création', user: 'Admin', date: '2024-02-15 09:12' },
          { action: 'Validation Fiscale', user: 'Comptable', date: '2024-02-15 10:45' },
          { action: 'Envoi par Email', user: 'Système', date: '2024-02-15 10:50' }
        ]
      },
      {
        id: 'F-2024-0002',
        factureId: 'FAC-2024-0002',
        client: 'EURL Kouba Telecom',
        clientDetails: {
          adresse: '12 Rue des Glycines, Kouba, Alger',
          nif: '001216059045678',
          nis: '001216059045678002',
          rc: '16/00-1122334A16',
          ai: '16056789012',
          rib: '003 00014 9876543210 99'
        },
        date: '2024-02-10',
        echeance: '2024-03-10',
        paymentMode: 'cheque',
        items: [
          { desc: 'Installation Fibre Optique (Forfait)', qty: 1, pu: 350000 * scaleFactor, type: 'service', tva_rate: 19 },
          { desc: 'Configuration Routeurs Cisco', qty: 2, pu: 50000 * scaleFactor, type: 'service', tva_rate: 19 }
        ],
        tvaRate: 19,
        statut: 'payee',
        secteur: 'services',
        audit: [
          { action: 'Création', user: 'Admin', date: '2024-02-10 14:20' }
        ]
      },
      {
        id: 'F-2024-0003',
        factureId: 'FAC-2024-0003',
        client: 'Groupement Algerian Petroleum',
        clientDetails: {
          adresse: 'Base de Vie, Hassi Messaoud, Ouargla',
          nif: '000030019000011',
          nis: '000030019000011003',
          rc: '30/00-5566778B22',
          ai: '30009988776',
          rib: '005 00030 1122334455 11'
        },
        date: '2024-02-05',
        echeance: '2024-03-07',
        paymentMode: 'virement',
        items: [
          { desc: 'Main d\'œuvre technique (Heures)', qty: 120, pu: 4500 * scaleFactor, type: 'service', tva_rate: 19 },
          { desc: 'Maintenance préventive groupe électrogène', qty: 2, pu: 155000 * scaleFactor, type: 'service', tva_rate: 9 },
          { desc: 'Kit de rechange filtration Heavy Duty', qty: 10, pu: 225000 * scaleFactor, type: 'bien', tva_rate: 19 }
        ],
        tvaRate: 19,
        statut: 'en_retard',
        secteur: 'industrie',
        audit: [
          { action: 'Création', user: 'Finance MG', date: '2024-02-05 08:00' }
        ]
      }
    ];

    return rawInvoices.map(inv => {
      const itemsWithTotals = inv.items.map(item => {
        const line_total_ht = item.qty * item.pu;
        const line_total_tva = Math.round(line_total_ht * (item.tva_rate / 100));
        return {
          ...item,
          line_total_ht,
          line_total_tva,
          line_total_ttc: line_total_ht + line_total_tva
        };
      });

      const totalHT = itemsWithTotals.reduce((sum, i) => sum + i.line_total_ht, 0);
      const totalTVA = itemsWithTotals.reduce((sum, i) => sum + i.line_total_tva, 0);
      const totalTAP = Math.round(totalHT * 0.01);
      const rawTotal = totalHT + totalTVA + totalTAP;
      const droitTimbre = inv.paymentMode === 'especes' ? Math.min(Math.round(rawTotal * 0.01), 10000) : 0;
      const totalTTC = rawTotal + droitTimbre;

      return {
        ...inv,
        items: itemsWithTotals,
        totalHT,
        totalTVA,
        totalTAP,
        droitTimbre,
        totalTTC,
        montant: totalTTC,
        montantPaye: inv.statut === 'payee' ? totalTTC : 0,
        retard: inv.statut === 'en_retard' ? 15 : 0
      } as Invoice;
    });
  }, [scaleFactor]);

  // State for invoices (persistent in localStorage for demo)
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('demo_invoices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved invoices", e);
      }
    }
    return getInitialInvoices;
  });

  // Sync with localStorage
  React.useEffect(() => {
    localStorage.setItem('demo_invoices', JSON.stringify(invoices));
  }, [invoices]);

  const handleSaveInvoice = () => {
    const itemsWithTotals = (newInvoice.items || []).map(item => {
      const line_total_ht = item.qty * item.pu;
      const tva_rate = item.tva_rate || 19;
      const line_total_tva = Math.round(line_total_ht * (tva_rate / 100));
      return {
        ...item,
        tva_rate,
        line_total_ht,
        line_total_tva,
        line_total_ttc: line_total_ht + line_total_tva
      };
    });

    const totalHT = itemsWithTotals.reduce((sum, item) => sum + item.line_total_ht, 0);
    const totalTVA = itemsWithTotals.reduce((sum, item) => sum + item.line_total_tva, 0);
    const totalTAP = Math.round(totalHT * 0.01); // 1% Taxe sur l'Activité Professionnelle
    const rawTotal = totalHT + totalTVA + totalTAP;
    const droitTimbre = newInvoice.paymentMode === 'especes' ? Math.min(Math.round(rawTotal * 0.01), 10000) : 0;
    const totalTTC = rawTotal + droitTimbre;

    const invoiceToSave: Invoice = {
      ...newInvoice as Invoice,
      id: isEditing ? (newInvoice.id || '') : `F-2024-${(invoices.length + 1).toString().padStart(4, '0')}`,
      factureId: isEditing ? (newInvoice.factureId || '') : `FAC-2024-${(invoices.length + 1).toString().padStart(4, '0')}`,
      items: itemsWithTotals as InvoiceItem[],
      totalHT,
      totalTVA,
      totalTAP,
      droitTimbre,
      totalTTC,
      montant: totalTTC,
      montantPaye: isEditing ? (newInvoice.montantPaye || 0) : 0,
      retard: isEditing ? (newInvoice.retard || 0) : 0,
      statut: newInvoice.statut || 'en_cours',
      audit: [
        ...(newInvoice.audit || []),
        { action: isEditing ? 'Modification' : 'Création', user: user?.nom || 'Admin', date: new Date().toLocaleString() }
      ]
    };

    if (isEditing) {
      setInvoices(invoices.map(inv => inv.id === invoiceToSave.id ? invoiceToSave : inv));
    } else {
      setInvoices([invoiceToSave, ...invoices]);
    }

    setIsCreateModalOpen(false);
    setIsEditing(false);
    resetNewInvoice();
  };

  const resetNewInvoice = () => {
    setNewInvoice({
      id: '',
      factureId: '',
      client: '',
      clientDetails: { adresse: '', nif: '', nis: '', rc: '', ai: '', rib: '' },
      date: new Date().toISOString().split('T')[0],
      echeance: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      items: [{ desc: '', qty: 1, pu: 0, type: 'bien', tva_rate: 19, line_total_ht: 0, line_total_tva: 0, line_total_ttc: 0 }],
      paymentMode: 'virement',
      tvaRate: 19,
      statut: 'en_cours',
      secteur: 'services',
      audit: []
    });
  };

  const handleEditInvoice = (inv: Invoice) => {
    setNewInvoice(inv);
    setIsEditing(true);
    setIsCreateModalOpen(true);
  };

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?")) {
      setInvoices(invoices.filter(inv => inv.id !== id));
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
    labels: ['Sept', 'Oct', 'Nov', 'Dec', 'Jan', 'Fev'],
    datasets: [
      {
        label: 'CA TTC Mensuel (DZD)',
        data: [
          12500000 * scaleFactor,
          14200000 * scaleFactor,
          11800000 * scaleFactor,
          18500000 * scaleFactor,
          15400000 * scaleFactor,
          stats.totalCA
        ],
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
  }), [scaleFactor, stats.totalCA]);

  const openDetails = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-8 p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* Header Premium (Sober) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-slate-700 mr-3" />
              Facturation Client
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium ml-11">Gestion et pilotage du poste clients algérien</p>
          </div>
          <div className="flex gap-3">
            {has('facturation-create') && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  resetNewInvoice();
                  setIsCreateModalOpen(true);
                }}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 flex items-center"
              >
                <PlusIcon className="h-5 w-5 mr-2" /> Nouvelle Facture
              </button>
            )}
            <button className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all">
              <CogIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl text-slate-600"><CurrencyDollarIcon className="h-6 w-6" /></div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+12.4%</span>
          </div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">CA Global TTC</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatCurrency(stats.totalCA)}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600"><CheckCircleIcon className="h-6 w-6" /></div>
            <span className="text-xs font-bold text-slate-400">Total Encaissé</span>
          </div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Recouvrement</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatCurrency(stats.totalPaye)}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl text-amber-600"><ClockIcon className="h-6 w-6" /></div>
            <span className="text-xs font-bold text-amber-600">En attente</span>
          </div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Créances en cours</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatCurrency(stats.totalEnCours)}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl text-rose-600"><ExclamationTriangleIcon className="h-6 w-6" /></div>
            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">Critique</span>
          </div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Retards de paiement</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{formatCurrency(stats.totalRetard)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Graphique d'évolution */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-800 dark:text-white">Évolution de la Facturation</h3>
            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
              <button className="px-4 py-1.5 text-xs font-bold bg-white dark:bg-slate-600 rounded-lg shadow-sm">Mensuel</button>
              <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700">Hebdo</button>
            </div>
          </div>
          <div className="h-[300px]">
            <Line data={revenueData} options={chartOptions} />
          </div>
        </div>

        {/* Répartition par secteur */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-6">Secteurs Porteurs</h3>
          <div className="space-y-6">
            {[
              { label: 'Industrie & Gaz', value: 45, color: 'bg-blue-500' },
              { label: 'Services IT', value: 25, color: 'bg-emerald-500' },
              { label: 'Construction', value: 20, color: 'bg-amber-500' },
              { label: 'Autres', value: 10, color: 'bg-slate-300' }
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
              <SparklesIcon className="h-5 w-5 mr-2" /> Conseil IA
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
              Le secteur <span className="underline italic">Industrie</span> porte 65% de vos revenus ce mois. Pensez à diversifier pour réduire le risque.
            </p>
          </div>
        </div>
      </div>

      {/* Liste des Factures */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white">Registre des Factures de Vente</h3>
              <p className="text-sm text-slate-500 font-medium tracking-tight">Poste clients mis à jour en temps réel</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Client ou N° de facture..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              >
                <option value="tous">Tous les statuts</option>
                <option value="payee">Encaissées</option>
                <option value="en_cours">En attente</option>
                <option value="en_retard">En retard</option>
                <option value="annulee">Annulées</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 text-[10px] font-black uppercase tracking-[0.1em] border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-8 py-5 text-left">N° Facture</th>
                <th className="px-8 py-5 text-left">Client (Algérie)</th>
                <th className="px-8 py-5 text-left">Dates</th>
                <th className="px-8 py-5 text-right">Montant TTC</th>
                <th className="px-8 py-5 text-center">Statut</th>
                <th className="px-8 py-5 text-center">Actions</th>
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
                          inv.statut === 'annulee' ? 'bg-slate-200 text-slate-700' :
                            'bg-amber-100 text-amber-700'
                        }`}>
                        {inv.statut === 'payee' ? 'Encaissée' :
                          inv.statut === 'en_retard' ? 'Retard critique' :
                            inv.statut === 'annulee' ? 'Annulée' : 'Partiel / Attente'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button className="p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 hover:text-slate-900 hover:border-slate-900 shadow-sm transition-all" title="Voir PDF">
                        <PrinterIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditInvoice(inv)}
                        className="p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-600 shadow-sm transition-all"
                        title="Modifier"
                      >
                        <CogIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(inv.id)}
                        className="p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 hover:text-rose-600 hover:border-rose-600 shadow-sm transition-all"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openDetails(inv)}
                        className="p-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 hover:text-slate-900 hover:border-slate-900 shadow-sm transition-all"
                        title="Détails"
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
          <div className="p-20 text-center">
            <MagnifyingGlassIcon className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">Aucune facture trouvée pour votre recherche.</p>
          </div>
        )}

        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500">Affichage de {filteredInvoices.length} sur {invoices.length} factures</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold disabled:opacity-50">Précédent</button>
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold">Suivant</button>
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

            <div className="p-10">
              <div className="mb-8 border-b border-slate-100 dark:border-slate-700 pb-6">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center">
                  <DocumentTextIcon className="h-8 w-8 text-slate-700 mr-3" />
                  {isEditing ? `Modifier la Facture ${newInvoice.id}` : 'Nouvel Acte de Facturation'}
                </h2>
                <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest">Conformité fiscale DZ - Décret 05-468</p>
              </div>

              {/* Section Client & Fisc */}
              <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-3xl mb-8 border border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-2" /> Identification du Client & Fiscalité
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Raison Sociale</label>
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ex: SARL Boissons du Sahel"
                      value={newInvoice.client || ''}
                      onChange={(e) => setNewInvoice({ ...newInvoice, client: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Adresse de Siège / Facturation</label>
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newInvoice.clientDetails?.adresse || ''}
                      onChange={(e) => setNewInvoice({ ...newInvoice, clientDetails: { ...(newInvoice.clientDetails || {} as ClientDetails), adresse: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">N.I.F</label>
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newInvoice.clientDetails?.nif || ''}
                      onChange={(e) => setNewInvoice({ ...newInvoice, clientDetails: { ...(newInvoice.clientDetails || {} as ClientDetails), nif: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">N.I.S</label>
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newInvoice.clientDetails?.nis || ''}
                      onChange={(e) => setNewInvoice({ ...newInvoice, clientDetails: { ...(newInvoice.clientDetails || {} as ClientDetails), nis: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">R.C</label>
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newInvoice.clientDetails?.rc || ''}
                      onChange={(e) => setNewInvoice({ ...newInvoice, clientDetails: { ...(newInvoice.clientDetails || {} as ClientDetails), rc: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">A.I</label>
                    <input
                      type="text"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newInvoice.clientDetails?.ai || ''}
                      onChange={(e) => setNewInvoice({ ...newInvoice, clientDetails: { ...(newInvoice.clientDetails || {} as ClientDetails), ai: e.target.value } })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">RIB (Banque/CCP)</label>
                    <input
                      type="text"
                      placeholder="001 00016 0123456789 01"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-mono text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newInvoice.clientDetails?.rib || ''}
                      onChange={(e) => setNewInvoice({ ...newInvoice, clientDetails: { ...(newInvoice.clientDetails || {} as ClientDetails), rib: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Secteur Activité</label>
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
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Statut Facture</label>
                    <select
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-bold outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
                      value={newInvoice.statut || 'en_cours'}
                      onChange={(e) => setNewInvoice({ ...newInvoice, statut: e.target.value })}
                    >
                      <option value="en_cours">En attente (Pro forma)</option>
                      <option value="payee">Encaissée (Définitive)</option>
                      <option value="en_retard">Retard de paiement</option>
                      <option value="annulee">Annulée</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Date d'Émission</label>
                    <input
                      type="date"
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={newInvoice.date || ''}
                      onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Date d'Échéance</label>
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
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Détails des Prestations / Ventes</h3>
                  <button
                    onClick={() => {
                      const items = [...(newInvoice.items || [])];
                      items.push({ desc: '', qty: 1, pu: 0, type: 'bien', tva_rate: 19, line_total_ht: 0, line_total_tva: 0, line_total_ttc: 0 });
                      setNewInvoice({ ...newInvoice, items });
                    }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-black hover:bg-slate-200 transition-all flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" /> Ajouter Ligne
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-[10px] font-black uppercase text-slate-400 mb-2">
                    <div className="col-span-3">Désignation</div>
                    <div className="col-span-2">Type (Compta)</div>
                    <div className="col-span-2 text-center">Qté</div>
                    <div className="col-span-2 text-right">P.U HT</div>
                    <div className="col-span-2 text-center">TVA (%)</div>
                    <div className="col-span-1"></div>
                  </div>
                  {(newInvoice.items || []).map((item, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm group">
                      <div className="col-span-3">
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
                      <div className="col-span-2">
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
                      <div className="col-span-2">
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
                      <div className="col-span-2">
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
                      <div className="col-span-2">
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
                      <div className="col-span-1 flex justify-center">
                        <button
                          onClick={() => {
                            if ((newInvoice.items || []).length > 1) {
                              const items = (newInvoice.items || []).filter((_, i) => i !== idx);
                              setNewInvoice({ ...newInvoice, items });
                            }
                          }}
                          className="text-slate-300 hover:text-rose-500 transition-colors"
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
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Modalités de Règlement</label>
                  <div className="flex flex-wrap gap-4">
                    {['virement', 'cheque', 'especes', 'carte'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setNewInvoice({ ...newInvoice, paymentMode: mode })}
                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all flex items-center ${newInvoice.paymentMode === mode
                          ? 'bg-slate-900 text-white shadow-xl scale-105'
                          : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 hover:border-emerald-300'
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
                        Attention : Le paiement en espèces génère un droit de timbre de 1% (Plafonné à 10.000 DA).
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* Simulateur Comptable & Validation */}
                  <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl shadow-slate-900/30">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-slate-700 pb-8">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Global TTC</span>
                        <div className="text-4xl font-black mt-2">
                          {formatCurrency(
                            (() => {
                              const items = (newInvoice.items || []);
                              const totalHT = items.reduce((acc, i) => acc + (i.qty * i.pu), 0);
                              const totalTVA = items.reduce((acc, i) => acc + Math.round((i.qty * i.pu) * ((i.tva_rate || 19) / 100)), 0);
                              const totalTAP = Math.round(totalHT * 0.01);
                              const rawTotal = totalHT + totalTVA + totalTAP;
                              const dt = newInvoice.paymentMode === 'especes' ? Math.min(Math.round(rawTotal * 0.01), 10000) : 0;
                              return rawTotal + dt;
                            })()
                          )}
                        </div>
                      </div>
                      <div className="flex gap-4 mt-6 md:mt-0">
                        <div className="text-right">
                          <span className="block text-[10px] font-bold text-slate-500 uppercase">TVA & TAP (1%)</span>
                          <span className="font-mono font-bold text-lg">
                            {formatCurrency(
                              (newInvoice.items || []).reduce((acc, i) => acc + Math.round((i.qty * i.pu) * ((i.tva_rate || 19) / 100)), 0) +
                              Math.round((newInvoice.items || []).reduce((acc, i) => acc + (i.qty * i.pu), 0) * 0.01)
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <span className="text-[10px] font-bold text-slate-400">443 - TAP (Activité Prof.)</span>
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

                    <button
                      onClick={handleSaveInvoice}
                      className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl"
                    >
                      {isEditing ? 'Enregistrer les Modifications' : "Valider l'Émission"}
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
              <div className="p-12 border-b border-slate-100 dark:border-slate-700">
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
                      Document Original
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-2">{selectedInvoice.id}</h2>
                    <p className="text-sm font-black text-slate-500 uppercase">Facture de Vente Définitive</p>
                    <p className="text-xs text-slate-400 font-bold mt-4 uppercase">Date d'émission : {new Date(selectedInvoice.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                {/* Client & Destinataire */}
                <div className="mt-12 bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Facturé à (Client)</h4>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mb-2">{selectedInvoice.client}</p>
                      <p className="text-sm font-bold text-slate-500 leading-relaxed mb-4">{selectedInvoice.clientDetails?.adresse}</p>
                      <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase">
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                          <span className="text-slate-400 block mb-1">NIF Client</span>
                          <span className="text-slate-700 dark:text-slate-200">{selectedInvoice.clientDetails?.nif || 'Non communiqué'}</span>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
                          <span className="text-slate-400 block mb-1">RC Client</span>
                          <span className="text-slate-700 dark:text-slate-200">{selectedInvoice.clientDetails?.rc || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Conditions de Règlement</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-400">Échéance :</span>
                            <span className="text-slate-800 dark:text-slate-200">{new Date(selectedInvoice.echeance).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-400">Mode de paiement :</span>
                            <span className="text-slate-800 dark:text-slate-200 uppercase">{selectedInvoice.paymentMode}</span>
                          </div>
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-400">Devise :</span>
                            <span className="text-slate-800 dark:text-slate-200">Dinar Algérien (DZD)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Corps de Facture */}
              <div className="p-12">
                <table className="w-full mb-12">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-widest border-y border-slate-100 dark:border-slate-700">
                      <th className="px-6 py-4 text-left">Désignation des Articles / Prestations</th>
                      <th className="px-6 py-4 text-center">Imputation</th>
                      <th className="px-6 py-4 text-center">Qté</th>
                      <th className="px-6 py-4 text-right">Prix Unitaire HT</th>
                      <th className="px-6 py-4 text-right">Total HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {selectedInvoice.items.map((item: any, i: number) => (
                      <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        <td className="px-6 py-8">
                          <p className="text-sm font-black text-slate-800 dark:text-slate-100">{item.desc}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Service certifié par Dinarlytics</p>
                        </td>
                        <td className="px-6 py-8 text-center">
                          <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase ${item.type === 'service' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                            {item.type === 'service' ? '706 - Services' : '700 - Ventes'}
                          </span>
                        </td>
                        <td className="px-6 py-8 text-center text-sm font-black text-slate-500">{item.qty}</td>
                        <td className="px-6 py-8 text-right text-sm font-bold text-slate-600 dark:text-slate-400 font-mono">{formatCurrency(item.pu)}</td>
                        <td className="px-6 py-8 text-right text-sm font-black text-slate-900 dark:text-white font-mono">{formatCurrency(item.qty * item.pu)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Totaux & Lettres */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12 items-start">
                  <div className="p-8 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Mention Légale Arrêtée</h4>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic leading-relaxed">
                      Arrêtée la présente facture à la somme de : <br />
                      <span className="text-slate-900 dark:text-white font-black not-italic text-lg block mt-2">
                        {numberToWords(selectedInvoice.totalTTC).toUpperCase()}
                      </span>
                    </p>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-4 flex items-center">
                        <CalculatorIcon className="h-4 w-4 mr-2" /> Récapitulatif Fiscal & Comptable
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-bold p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                          <span className="text-slate-500">Cpte 700 (Ventes Marchandises)</span>
                          <span className="font-mono text-slate-800 dark:text-slate-200">
                            {formatCurrency(selectedInvoice.items.filter((i: InvoiceItem) => i.type === 'bien').reduce((acc: number, i: InvoiceItem) => acc + i.qty * i.pu, 0))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                          <span className="text-slate-500">Cpte 706 (Prestations Services)</span>
                          <span className="font-mono text-slate-800 dark:text-slate-200">
                            {formatCurrency(selectedInvoice.items.filter((i: InvoiceItem) => i.type === 'service').reduce((acc: number, i: InvoiceItem) => acc + i.qty * i.pu, 0))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                          <span className="text-emerald-600">Cpte 4457 (TVA Collectée)</span>
                          <span className="font-mono text-emerald-700 dark:text-emerald-400">
                            {formatCurrency(selectedInvoice.totalTVA)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 text-sm font-bold px-6">
                      <span className="text-slate-400 uppercase tracking-widest text-[10px]">Total Hors Taxes</span>
                      <span className="text-slate-800 dark:text-slate-200 font-mono">{formatCurrency(selectedInvoice.totalHT)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-sm font-bold px-6 border-t border-slate-50 dark:border-slate-800">
                      <span className="text-slate-400 uppercase tracking-widest text-[10px]">TVA ({selectedInvoice.tvaRate}%)</span>
                      <span className="text-slate-800 dark:text-slate-200 font-mono">{formatCurrency(selectedInvoice.totalTVA)}</span>
                    </div>
                    {selectedInvoice.droitTimbre > 0 && (
                      <div className="flex justify-between items-center py-2 text-sm font-bold px-6 border-t border-slate-50 dark:border-slate-800">
                        <span className="text-slate-400 uppercase tracking-widest text-[10px]">Droit de Timbre (Espèces)</span>
                        <span className="text-slate-800 dark:text-slate-200 font-mono">{formatCurrency(selectedInvoice.droitTimbre)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-6 bg-slate-900 text-white rounded-[1.5rem] px-8 shadow-xl shadow-slate-900/20">
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Net à Payer (TTC)</span>
                      <span className="text-3xl font-black font-mono">{formatCurrency(selectedInvoice?.totalTTC || 0)}</span>
                    </div>
                  </div>
                </div>

                {/* Journal d'Audit & Traçabilité */}
                <div className="mt-16 pt-12 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-8">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center">
                      <ShareIcon className="h-4 w-4 mr-2" /> Journal d'Audit & Traçabilité (GRC)
                    </h4>
                    <div className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-[10px] font-black rounded-lg border border-blue-100 dark:border-blue-800/30">
                      SCELLÉ DIGITAL DINARLYTICS
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
                      Fin du journal d'audit
                    </div>
                  </div>
                </div>

                {/* Actions de Fin de Page */}
                <div className="mt-12 flex gap-4">
                  <button className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center shadow-xl">
                    <PrinterIcon className="h-5 w-5 mr-3" /> Imprimer via Registre Officiel
                  </button>
                  <button className="flex-1 py-5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center">
                    <DocumentArrowDownIcon className="h-5 w-5 mr-3" /> Exporter Certificat Fiscal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default AnalyticsFacturation;


