import React, { useState } from 'react';
import { 
  ChartPieIcon, 
  CurrencyDollarIcon, 
  ArrowTrendingUpIcon, 
  BanknotesIcon,
  MagnifyingGlassIcon,
  CameraIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  DocumentTextIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import Card from '../../components/UI/Card';

const VueEnsemble: React.FC = () => {
  const navigate = useNavigate();
  const { user, companyData } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showScanModal, setShowScanModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedView, setSelectedView] = useState('jour');
  const [selectedStatus, setSelectedStatus] = useState('tous');

  const segment = user?.segment || 'micro';
  const companyType = user?.companyType || 'eurl';

  // ========================================
  // INTERFACE EURL SIMPLIFIÉE (Tableau Bord 360°)
  // ========================================
  if (segment === 'micro' && companyType === 'eurl' && companyData) {
    const formatCurrency = (amount: number) => AdaptiveDataGenerator.formatCurrency(amount);
    
    const caMensuel = companyData.revenueMonth;
    const caAnnuel = companyData.revenueTotal;
    const resultatNet = Math.round(caMensuel * companyData.profitMargin / 100);
    const margeBrute = companyData.profitMargin;
    const soldeTresorerie = companyData.cashBalance;
    const endettement = companyData.accountsPayable;
    const tauxEndettement = (endettement / caAnnuel) * 100;
    const depensesFixes = Math.round(caMensuel * 0.35);
    const depensesVariables = Math.round(caMensuel * 0.25);

    // KPIs
    const kpis = [
      { titre: 'CA du Mois', valeur: formatCurrency(caMensuel), sous: `Cumul annuel: ${formatCurrency(caAnnuel)}`, icon: CurrencyDollarIcon, color: 'slate' },
      { titre: 'Résultat Net', valeur: formatCurrency(resultatNet), sous: `Marge: ${margeBrute.toFixed(1)}%`, icon: ArrowTrendingUpIcon, color: 'emerald' },
      { titre: 'Trésorerie', valeur: formatCurrency(soldeTresorerie), sous: `À recevoir: ${formatCurrency(companyData.accountsReceivable)}`, icon: BanknotesIcon, color: 'slate' },
      { titre: 'Endettement', valeur: `${tauxEndettement.toFixed(1)}%`, sous: formatCurrency(endettement), icon: ChartBarIcon, color: tauxEndettement < 30 ? 'emerald' : 'red' },
      { titre: 'Dépenses Fixes', valeur: formatCurrency(depensesFixes), sous: '35% du CA', icon: DocumentTextIcon, color: 'slate' },
      { titre: 'Dépenses Variables', valeur: formatCurrency(depensesVariables), sous: '25% du CA', icon: ShoppingCartIcon, color: 'slate' },
      { titre: 'Clients Actifs', valeur: companyData.clientsActive.toString(), sous: `${companyData.clientsNew} nouveaux`, icon: UserGroupIcon, color: 'slate' },
      { titre: 'Factures Attente', valeur: companyData.pendingInvoices.toString(), sous: formatCurrency(companyData.accountsReceivable), icon: ClockIcon, color: companyData.pendingInvoices > 10 ? 'red' : 'emerald' }
    ];

    // Données graphiques
    const moisLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const caData = moisLabels.map(() => Math.round(caMensuel * (0.7 + Math.random() * 0.6)));

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center">
          <ChartBarIcon className="h-8 w-8 mr-3 text-slate-700" />
          Tableau de Bord 360°
        </h1>

        {/* Alertes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companyData.revenueGrowth < 0 && (
            <Card className="p-4 bg-red-50 border-2 border-red-300 text-red-900">
              <ExclamationTriangleIcon className="h-6 w-6 inline mr-2" />
              <span className="font-bold">CA en baisse de {Math.abs(companyData.revenueGrowth).toFixed(1)}% ce mois-ci</span>
            </Card>
          )}
          {(depensesFixes + depensesVariables) > caMensuel * 0.7 && (
            <Card className="p-4 bg-amber-50 border-2 border-amber-300 text-amber-900">
              <ExclamationTriangleIcon className="h-6 w-6 inline mr-2" />
              <span className="font-bold">Dépassement des charges prévues (&gt;70% du CA)</span>
            </Card>
          )}
        </div>

        {/* 8 KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon;
            const colorClass = kpi.color === 'emerald' ? 'from-emerald-500 to-teal-500' : kpi.color === 'red' ? 'from-red-500 to-red-600' : 'from-slate-700 to-slate-900';
            return (
              <Card key={i} className="p-5 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 hover:shadow-xl transition-all">
                <div className={`p-2 bg-gradient-to-br ${colorClass} rounded-lg w-fit mb-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs text-slate-600 font-bold uppercase mb-1">{kpi.titre}</p>
                <p className="text-2xl font-extrabold text-slate-900 mb-1">{kpi.valeur}</p>
                <p className="text-xs text-slate-500">{kpi.sous}</p>
              </Card>
            );
          })}
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CA Mensuel */}
          <Card className="p-6 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">📈 CA Mensuel (12 mois)</h3>
            <div className="h-64 flex items-end justify-between space-x-1">
              {caData.map((val, i) => {
                const max = Math.max(...caData);
                const h = (val / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group">
                    <div className="w-full bg-gradient-to-t from-slate-700 to-slate-500 rounded-t-xl hover:from-emerald-500 hover:to-emerald-400 transition-all cursor-pointer shadow-md" style={{ height: `${h * 2}px` }} title={formatCurrency(val)} />
                    <span className="text-xs text-slate-600 mt-2">{moisLabels[i]}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Camembert Dépenses */}
          <Card className="p-6 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">🧾 Répartition des Dépenses</h3>
            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
                <div className="flex items-center"><div className="w-4 h-4 bg-slate-700 rounded mr-2" /><span>Dépenses Fixes</span></div>
                <span className="font-bold">{formatCurrency(depensesFixes)} (35%)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-100 rounded-lg">
                <div className="flex items-center"><div className="w-4 h-4 bg-emerald-500 rounded mr-2" /><span>Dépenses Variables</span></div>
                <span className="font-bold">{formatCurrency(depensesVariables)} (25%)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-teal-100 rounded-lg">
                <div className="flex items-center"><div className="w-4 h-4 bg-teal-500 rounded mr-2" /><span>Résultat Net</span></div>
                <span className="font-bold">{formatCurrency(resultatNet)} (40%)</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Top 5 Clients */}
        <Card className="p-6 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">🧍‍♂️ Ventes par Client (Top 5)</h3>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => {
              const ca = companyData.averageInvoice * 12 * (2 - i * 0.3);
              const pct = ((ca / caAnnuel) * 100).toFixed(1);
              return (
                <div key={i} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-white font-bold">{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-slate-900">Client {String.fromCharCode(65 + i)}</span>
                      <span className="font-bold text-slate-900">{formatCurrency(ca)}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${100 - i * 15}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{pct}% du CA total</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Raccourcis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => navigate('/rapports-comptables')} className="p-6 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105">
            <DocumentTextIcon className="h-10 w-10 mb-3 mx-auto" />
            <p className="font-bold">Rapports Financiers</p>
          </button>
          <button onClick={() => navigate('/factures-vente')} className="p-6 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105">
            <DocumentTextIcon className="h-10 w-10 mb-3 mx-auto" />
            <p className="font-bold">Facturation</p>
          </button>
          <button onClick={() => navigate('/inventaire')} className="p-6 bg-gradient-to-br from-slate-600 to-slate-800 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105">
            <ShoppingCartIcon className="h-10 w-10 mb-3 mx-auto" />
            <p className="font-bold">Gestion de Stock</p>
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // INTERFACE STANDARD (Autres tailles)
  // ========================================

  // ========== DONNÉES PAR PÉRIODE ==========
  const dataByPeriod: Record<string, any> = {
    jour: {
      mainIndicators: [
    {
      title: 'CA du jour',
      value: '15,200',
      unit: 'DZD',
          change: '+12.0%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
          color: 'text-cyan-600'
    },
    {
          title: 'Variation vs hier',
      value: '+12%',
      unit: '',
      change: '+2.5%',
      changeType: 'positive',
      icon: ArrowTrendingUpIcon,
      color: 'text-emerald-600'
    },
    {
      title: 'Solde trésorerie',
      value: '45,000',
      unit: 'DZD',
      change: '+8.3%',
      changeType: 'positive',
      icon: BanknotesIcon,
          color: 'text-slate-600'
        }
      ],
      chartData: [
        { date: '09/12', ca: 14200, depenses: 8500 },
        { date: '10/12', ca: 15800, depenses: 9200 },
        { date: '11/12', ca: 13400, depenses: 7800 },
        { date: '12/12', ca: 16800, depenses: 10100 },
        { date: '13/12', ca: 15200, depenses: 8900 },
        { date: '14/12', ca: 17500, depenses: 11200 },
        { date: '15/12', ca: 15200, depenses: 9500 }
      ],
      chartLabel: 'Évolution CA Quotidien (7 derniers jours)',
      revenueSources: [
        { source: 'Ventes', percentage: 60, amount: 91200, color: 'bg-emerald-500' },
        { source: 'Services', percentage: 30, amount: 45600, color: 'bg-amber-500' },
        { source: 'Autres', percentage: 10, amount: 15200, color: 'bg-slate-500' }
      ],
      totalRevenue: 152000,
      kpiCards: [
        { title: 'Ventes', value: '2,450,000', unit: 'DZD', icon: ShoppingCartIcon, color: 'bg-emerald-500', link: '/factures-vente' },
    { title: 'Achats', value: '1,890,000', unit: 'DZD', icon: DocumentTextIcon, color: 'bg-red-500', link: '/fournisseurs' },
        { title: 'Clients', value: '1,247', unit: '', icon: UserGroupIcon, color: 'bg-cyan-500', link: '/clients' },
        { title: 'Fournisseurs', value: '89', unit: '', icon: BuildingOfficeIcon, color: 'bg-amber-500', link: '/fournisseurs' },
        { title: 'Articles', value: '2,156', unit: '', icon: ChartBarIcon, color: 'bg-slate-600', link: '/articles' },
        { title: 'Inventaire', value: '98.5%', unit: '', icon: EyeIcon, color: 'bg-slate-700', link: '/inventaire' }
      ],
      movements: [
        { id: 1, date: '2024-12-15', type: 'Vente', amount: 15200, status: 'Payé', priority: 'normale', client: 'Client Alpha' },
        { id: 2, date: '2024-12-15', type: 'Achat', amount: -8500, status: 'En attente', priority: 'haute', fournisseur: 'Fournisseur Beta' },
        { id: 3, date: '2024-12-15', type: 'Vente', amount: 17500, status: 'Payé', priority: 'normale', client: 'Client Gamma' },
        { id: 4, date: '2024-12-15', type: 'Achat', amount: -11200, status: 'Payé', priority: 'normale', fournisseur: 'Fournisseur Delta' },
        { id: 5, date: '2024-12-15', type: 'Vente', amount: 15200, status: 'En attente', priority: 'haute', client: 'Client Epsilon' },
        { id: 6, date: '2024-12-15', type: 'Achat', amount: -25000, status: 'En attente', priority: 'critique', fournisseur: 'Fournisseur Zeta' },
        { id: 7, date: '2024-12-15', type: 'Vente', amount: 32000, status: 'Terminé', priority: 'normale', client: 'Client Eta' },
        { id: 8, date: '2024-12-15', type: 'Achat', amount: -15000, status: 'Terminé', priority: 'normale', fournisseur: 'Fournisseur Theta' }
      ],
      calendarEvents: [
    { id: 1, date: '2024-12-16', title: 'Échéance TVA', type: 'fiscal', priority: 'haute', status: 'en_attente' },
        { id: 2, date: '2024-12-16', title: 'Paiement fournisseur ABC', type: 'paiement', priority: 'normale', status: 'en_attente' },
        { id: 3, date: '2024-12-16', title: 'Relance client XYZ', type: 'relance', priority: 'haute', status: 'en_attente' },
        { id: 4, date: '2024-12-16', title: 'Inventaire quotidien', type: 'inventaire', priority: 'normale', status: 'en_attente' }
      ]
    },
    
    semaine: {
      mainIndicators: [
        {
          title: 'CA de la semaine',
          value: '108,500',
          unit: 'DZD',
          change: '+18.5%',
          changeType: 'positive',
          icon: CurrencyDollarIcon,
          color: 'text-cyan-600'
        },
        {
          title: 'Variation vs S-1',
          value: '+18.5%',
          unit: '',
          change: '+5.2%',
          changeType: 'positive',
          icon: ArrowTrendingUpIcon,
          color: 'text-emerald-600'
        },
        {
          title: 'Solde moyen',
          value: '48,200',
          unit: 'DZD',
          change: '+11.7%',
          changeType: 'positive',
          icon: BanknotesIcon,
          color: 'text-slate-600'
        }
      ],
      chartData: [
        { date: 'Lun', ca: 14200, depenses: 8500 },
        { date: 'Mar', ca: 15800, depenses: 9200 },
        { date: 'Mer', ca: 13400, depenses: 7800 },
        { date: 'Jeu', ca: 16800, depenses: 10100 },
        { date: 'Ven', ca: 18200, depenses: 9500 },
        { date: 'Sam', ca: 17500, depenses: 11200 },
        { date: 'Dim', ca: 12600, depenses: 7300 }
      ],
      chartLabel: 'Évolution CA Hebdomadaire (Semaine en cours)',
      revenueSources: [
        { source: 'Ventes', percentage: 65, amount: 706250, color: 'bg-emerald-500' },
        { source: 'Services', percentage: 28, amount: 304200, color: 'bg-amber-500' },
        { source: 'Autres', percentage: 7, amount: 76050, color: 'bg-slate-500' }
      ],
      totalRevenue: 1086500,
      kpiCards: [
        { title: 'Ventes', value: '17,150,000', unit: 'DZD', icon: ShoppingCartIcon, color: 'bg-emerald-500', link: '/factures-vente' },
        { title: 'Achats', value: '13,230,000', unit: 'DZD', icon: DocumentTextIcon, color: 'bg-red-500', link: '/fournisseurs' },
        { title: 'Clients actifs', value: '287', unit: '', icon: UserGroupIcon, color: 'bg-cyan-500', link: '/clients' },
        { title: 'Fournisseurs sollicités', value: '34', unit: '', icon: BuildingOfficeIcon, color: 'bg-amber-500', link: '/fournisseurs' },
        { title: 'Articles vendus', value: '842', unit: '', icon: ChartBarIcon, color: 'bg-slate-600', link: '/articles' },
        { title: 'Rotation stock', value: '12.3%', unit: '', icon: EyeIcon, color: 'bg-slate-700', link: '/inventaire' }
      ],
      movements: [
        { id: 1, date: '2024-12-15', type: 'Vente', amount: 125000, status: 'Payé', priority: 'normale', client: 'Société Algérienne Corp' },
        { id: 2, date: '2024-12-14', type: 'Achat', amount: -87500, status: 'En attente', priority: 'haute', fournisseur: 'Import-Export DZ' },
        { id: 3, date: '2024-12-13', type: 'Vente', amount: 95000, status: 'Payé', priority: 'normale', client: 'Entreprise Nationale' },
        { id: 4, date: '2024-12-12', type: 'Achat', amount: -62000, status: 'Payé', priority: 'normale', fournisseur: 'Fournisseur Industriel' },
        { id: 5, date: '2024-12-11', type: 'Vente', amount: 148000, status: 'En attente', priority: 'haute', client: 'Trading SARL' },
        { id: 6, date: '2024-12-10', type: 'Achat', amount: -125000, status: 'En attente', priority: 'critique', fournisseur: 'Distributeur Officiel' },
        { id: 7, date: '2024-12-09', type: 'Vente', amount: 78000, status: 'Terminé', priority: 'normale', client: 'Commerce Détail' },
        { id: 8, date: '2024-12-09', type: 'Achat', amount: -95000, status: 'Terminé', priority: 'normale', fournisseur: 'Grossiste Central' }
      ],
      calendarEvents: [
        { id: 1, date: '2024-12-16', title: 'Déclaration TVA mensuelle', type: 'fiscal', priority: 'haute', status: 'en_attente' },
        { id: 2, date: '2024-12-17', title: 'Paiements fournisseurs (batch)', type: 'paiement', priority: 'haute', status: 'en_attente' },
        { id: 3, date: '2024-12-18', title: 'Relances clients (15)', type: 'relance', priority: 'normale', status: 'en_attente' },
        { id: 4, date: '2024-12-19', title: 'Inventaire hebdomadaire', type: 'inventaire', priority: 'normale', status: 'en_attente' },
        { id: 5, date: '2024-12-20', title: 'Réunion comptable', type: 'meeting', priority: 'normale', status: 'en_attente' }
      ]
    },
    
    mois: {
      mainIndicators: [
        {
          title: 'CA du mois',
          value: '485,900',
          unit: 'DZD',
          change: '+25.4%',
          changeType: 'positive',
          icon: CurrencyDollarIcon,
          color: 'text-cyan-600'
        },
        {
          title: 'Croissance vs M-1',
          value: '+25.4%',
          unit: '',
          change: '+8.9%',
          changeType: 'positive',
          icon: ArrowTrendingUpIcon,
          color: 'text-emerald-600'
        },
        {
          title: 'Trésorerie moyenne',
          value: '52,800',
          unit: 'DZD',
          change: '+15.6%',
          changeType: 'positive',
          icon: BanknotesIcon,
          color: 'text-slate-600'
        }
      ],
      chartData: [
        { date: 'Sem 1', ca: 95000, depenses: 62000 },
        { date: 'Sem 2', ca: 108500, depenses: 71000 },
        { date: 'Sem 3', ca: 125000, depenses: 85000 },
        { date: 'Sem 4', ca: 157400, depenses: 98000 }
      ],
      chartLabel: 'Évolution CA Mensuel (4 semaines)',
      revenueSources: [
        { source: 'Ventes', percentage: 70, amount: 3401300, color: 'bg-emerald-500' },
        { source: 'Services', percentage: 22, amount: 1069180, color: 'bg-amber-500' },
        { source: 'Autres', percentage: 8, amount: 388720, color: 'bg-slate-500' }
      ],
      totalRevenue: 4859200,
      kpiCards: [
        { title: 'CA Total', value: '68,975,000', unit: 'DZD', icon: ShoppingCartIcon, color: 'bg-emerald-500', link: '/factures-vente' },
        { title: 'Achats cumulés', value: '53,420,000', unit: 'DZD', icon: DocumentTextIcon, color: 'bg-red-500', link: '/fournisseurs' },
        { title: 'Clients uniques', value: '1,834', unit: '', icon: UserGroupIcon, color: 'bg-cyan-500', link: '/clients' },
        { title: 'Fournisseurs actifs', value: '127', unit: '', icon: BuildingOfficeIcon, color: 'bg-amber-500', link: '/fournisseurs' },
        { title: 'Références vendues', value: '3,987', unit: '', icon: ChartBarIcon, color: 'bg-slate-600', link: '/articles' },
        { title: 'Taux rotation global', value: '42.8%', unit: '', icon: EyeIcon, color: 'bg-slate-700', link: '/inventaire' }
      ],
      movements: [
        { id: 1, date: '2024-12-14', type: 'Vente', amount: 540000, status: 'Payé', priority: 'normale', client: 'Groupe Industriel DZ' },
        { id: 2, date: '2024-12-12', type: 'Achat', amount: -320000, status: 'En attente', priority: 'haute', fournisseur: 'Importateur International' },
        { id: 3, date: '2024-12-10', type: 'Vente', amount: 425000, status: 'Payé', priority: 'normale', client: 'Holding Commercial' },
        { id: 4, date: '2024-12-08', type: 'Achat', amount: -285000, status: 'Payé', priority: 'normale', fournisseur: 'Fournisseur Premium' },
        { id: 5, date: '2024-12-06', type: 'Vente', amount: 680000, status: 'En attente', priority: 'haute', client: 'Enterprise Publique' },
        { id: 6, date: '2024-12-05', type: 'Achat', amount: -450000, status: 'En attente', priority: 'critique', fournisseur: 'Constructeur OEM' },
        { id: 7, date: '2024-12-03', type: 'Vente', amount: 395000, status: 'Terminé', priority: 'normale', client: 'Société Distribution' },
        { id: 8, date: '2024-12-01', type: 'Achat', amount: -320000, status: 'Terminé', priority: 'normale', fournisseur: 'Grossiste National' }
      ],
      calendarEvents: [
        { id: 1, date: '2024-12-28', title: 'Clôture mensuelle comptable', type: 'cloture', priority: 'haute', status: 'en_attente' },
        { id: 2, date: '2024-12-30', title: 'Paiement salaires (34 employés)', type: 'paiement', priority: 'critique', status: 'en_attente' },
        { id: 3, date: '2024-12-31', title: 'Déclaration fiscale trimestrielle', type: 'fiscal', priority: 'critique', status: 'en_attente' },
        { id: 4, date: '2024-12-25', title: 'Inventaire annuel anticipé', type: 'inventaire', priority: 'haute', status: 'en_attente' },
        { id: 5, date: '2024-12-20', title: 'Relances clients (batch complet)', type: 'relance', priority: 'haute', status: 'en_attente' },
        { id: 6, date: '2024-12-22', title: 'Fermeture exceptionnelle', type: 'fermeture', priority: 'normale', status: 'en_attente' }
      ]
    }
  };

  // Options de filtres
  const viewOptions = [
    { id: 'jour', name: 'Jour', icon: ClockIcon },
    { id: 'semaine', name: 'Semaine', icon: CalendarIcon },
    { id: 'mois', name: 'Mois', icon: ChartBarIcon }
  ];

  const statusOptions = [
    { id: 'tous', name: 'Tous', icon: EyeIcon },
    { id: 'en_attente', name: 'En attente', icon: ClockIcon },
    { id: 'termines', name: 'Terminés', icon: CheckCircleIcon },
    { id: 'priorite_haute', name: 'Priorité haute', icon: ExclamationTriangleIcon }
  ];

  // Récupération des données selon la vue sélectionnée
  const currentData = dataByPeriod[selectedView];

  // Fonction de filtrage des mouvements
  const filteredMovements = currentData.movements.filter((movement: any) => {
    if (selectedStatus === 'tous') return true;
    if (selectedStatus === 'en_attente') return movement.status === 'En attente';
    if (selectedStatus === 'termines') return movement.status === 'Terminé' || movement.status === 'Payé';
    if (selectedStatus === 'priorite_haute') return movement.priority === 'haute' || movement.priority === 'critique';
    return true;
  });

  // Fonction de filtrage des événements du calendrier
  const filteredCalendarEvents = currentData.calendarEvents.filter((event: any) => {
    if (selectedStatus === 'tous') return true;
    if (selectedStatus === 'en_attente') return event.status === 'en_attente';
    if (selectedStatus === 'termines') return event.status === 'termine';
    if (selectedStatus === 'priorite_haute') return event.priority === 'haute' || event.priority === 'critique';
    return true;
  });

  const handleKPIClick = (link: string) => {
    // Navigation vers le module correspondant
    window.location.href = link;
  };

  const handleScanClick = () => {
    setShowScanModal(true);
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vue d'ensemble</h1>
            <p className="text-slate-600 mt-1">Aperçu général de votre activité</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Barre de recherche globale */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher dans tous les modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-96 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              />
            </div>
            {/* Bouton Scan Rapide */}
            <button
              onClick={handleScanClick}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              <CameraIcon className="h-5 w-5 mr-2" />
              Scan Rapide
            </button>
          </div>
        </div>
        
        {/* Filtres */}
        <div className="flex items-center space-x-6 pt-4 border-t border-slate-200">
          {/* Filtre Vue */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-700">Vue :</span>
            <div className="flex space-x-1">
              {viewOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedView(option.id)}
                    className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedView === option.id
                        ? 'bg-cyan-100 text-cyan-700 border border-cyan-200'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-1.5" />
                    {option.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtre Statut */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-slate-700">Filtrer :</span>
            <div className="flex space-x-1">
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedStatus(option.id)}
                    className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedStatus === option.id
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-1.5" />
                    {option.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Badge de filtre actif */}
      <div className="flex items-center space-x-2">
        <div className="px-3 py-1.5 bg-cyan-50 border border-cyan-200 rounded-lg">
          <span className="text-sm font-medium text-cyan-700">
            Affichage: {selectedView === 'jour' ? 'Journalier' : selectedView === 'semaine' ? 'Hebdomadaire' : 'Mensuel'}
          </span>
        </div>
        <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
          <span className="text-sm font-medium text-emerald-700">
            Filtre: {selectedStatus === 'tous' ? 'Tous' : selectedStatus === 'en_attente' ? 'En attente' : selectedStatus === 'termines' ? 'Terminés' : 'Priorité haute'}
          </span>
        </div>
        <div className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg">
          <span className="text-sm text-slate-600">
            {filteredMovements.length} mouvement{filteredMovements.length > 1 ? 's' : ''} • {filteredCalendarEvents.length} événement{filteredCalendarEvents.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Indicateurs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentData.mainIndicators.map((indicator: any, index: number) => {
          const Icon = indicator.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{indicator.title}</p>
                  <div className="flex items-baseline mt-2">
                    <p className={`text-3xl font-bold ${indicator.color}`}>
                      {indicator.value}
                    </p>
                    {indicator.unit && (
                      <span className="ml-2 text-sm text-slate-500">{indicator.unit}</span>
                    )}
                  </div>
                  <div className="flex items-center mt-2">
                    {indicator.changeType === 'positive' ? (
                      <ArrowUpIcon className="h-4 w-4 text-emerald-600 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      indicator.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {indicator.change}
                    </span>
                  </div>
                </div>
                <Icon className={`h-12 w-12 ${indicator.color} opacity-20`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Évolution CA */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">{currentData.chartLabel}</h3>
          <div className="h-80 relative">
            {/* Simulation du graphique en ligne */}
            <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
              {currentData.chartData.map((day: any, index: number) => {
                const maxCA = Math.max(...currentData.chartData.map((d: any) => d.ca));
                const caHeight = (day.ca / maxCA) * 200;
                const depensesHeight = (day.depenses / maxCA) * 200;
                
                return (
                  <div key={index} className="flex flex-col items-center space-y-2">
                    <div className="flex flex-col items-center space-y-1">
                      {/* Barre CA (cyan) */}
                      <div 
                        className="w-8 bg-cyan-600 rounded-t hover:bg-cyan-700 transition-colors cursor-pointer"
                        style={{ height: `${caHeight}px` }}
                        title={`CA: ${day.ca.toLocaleString()} DZD`}
                      ></div>
                      {/* Barre Dépenses (rouge) */}
                      <div 
                        className="w-8 bg-red-600 rounded-b hover:bg-red-700 transition-colors cursor-pointer"
                        style={{ height: `${depensesHeight}px` }}
                        title={`Dépenses: ${day.depenses.toLocaleString()} DZD`}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-600">
                      {day.date}
                    </span>
                  </div>
                );
              })}
            </div>
            {/* Légende */}
            <div className="absolute top-4 right-4 flex space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-cyan-600 rounded"></div>
                <span className="text-sm text-slate-600">CA</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-600 rounded"></div>
                <span className="text-sm text-slate-600">Dépenses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pie Chart - Répartition sources revenus */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Répartition Sources Revenus</h3>
          <div className="h-80 flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* Simulation du graphique en secteurs */}
              <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
              <div className="absolute inset-0 rounded-full" style={{
                background: `conic-gradient(
                  #10b981 0deg ${currentData.revenueSources[0].percentage * 3.6}deg,
                  #f59e0b ${currentData.revenueSources[0].percentage * 3.6}deg ${(currentData.revenueSources[0].percentage + currentData.revenueSources[1].percentage) * 3.6}deg,
                  #6b7280 ${(currentData.revenueSources[0].percentage + currentData.revenueSources[1].percentage) * 3.6}deg 360deg
                )`
              }}></div>
              <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{currentData.totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-slate-500">DZD Total</div>
                </div>
              </div>
            </div>
          </div>
          {/* Légende */}
          <div className="mt-4 space-y-2">
            {currentData.revenueSources.map((source: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded ${source.color}`}></div>
                  <span className="text-sm text-slate-600">{source.source}</span>
                </div>
                <div className="text-sm font-medium text-slate-900">
                  {source.percentage}% ({source.amount.toLocaleString()} DZD)
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grille KPI 3x2 */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Indicateurs Clés (Cliquables)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentData.kpiCards.map((card: any, index: number) => {
            const Icon = card.icon;
            return (
              <button
                key={index}
                onClick={() => handleKPIClick(card.link)}
                className="p-4 border border-slate-200 rounded-lg hover:shadow-md hover:border-slate-300 transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{card.title}</p>
                    <div className="flex items-baseline mt-1">
                      <p className="text-xl font-bold text-slate-900">
                        {card.value}
                      </p>
                      {card.unit && (
                        <span className="ml-1 text-sm text-slate-500">{card.unit}</span>
                      )}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${card.color} opacity-20 group-hover:opacity-30 transition-opacity`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section Calendrier et Mouvements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendrier avec exemples */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Calendrier & Rappels</h3>
          <div className="space-y-3">
            {filteredCalendarEvents.map((event: any) => {
              const getPriorityColor = (priority: string) => {
                switch (priority) {
                  case 'critique': return 'bg-red-100 text-red-800 border-red-200';
                  case 'haute': return 'bg-amber-100 text-amber-800 border-amber-200';
                  default: return 'bg-slate-100 text-slate-800 border-slate-200';
                }
              };

              const getTypeIcon = (type: string) => {
                switch (type) {
                  case 'fiscal': return <DocumentTextIcon className="h-4 w-4" />;
                  case 'paiement': return <CurrencyDollarIcon className="h-4 w-4" />;
                  case 'relance': return <ExclamationTriangleIcon className="h-4 w-4" />;
                  case 'inventaire': return <EyeIcon className="h-4 w-4" />;
                  case 'cloture': return <CheckCircleIcon className="h-4 w-4" />;
                  default: return <CalendarIcon className="h-4 w-4" />;
                }
              };

              return (
                <div key={event.id} className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex-shrink-0 mr-3">
                    {getTypeIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-900 truncate">{event.title}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(event.priority)}`}>
                        {event.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {new Date(event.date).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            {filteredCalendarEvents.length === 0 && (
              <div className="text-center py-12">
                <CalendarIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Aucun événement pour ce filtre</p>
              </div>
            )}
          </div>
        </div>

        {/* Tableau récap mouvements récents */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Mouvements Récents</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Montant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priorité</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredMovements.map((movement: any) => {
                  const getPriorityColor = (priority: string) => {
                    switch (priority) {
                      case 'critique': return 'bg-red-100 text-red-800';
                      case 'haute': return 'bg-amber-100 text-amber-800';
                      default: return 'bg-slate-100 text-slate-800';
                    }
                  };

                  return (
                    <tr key={movement.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                        {new Date(movement.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          movement.type === 'Vente' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {movement.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={movement.amount > 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {movement.amount > 0 ? '+' : ''}{movement.amount.toLocaleString()} DZD
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          movement.status === 'Payé' || movement.status === 'Terminé'
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {movement.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(movement.priority)}`}>
                          {movement.priority}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredMovements.length === 0 && (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Aucun mouvement pour ce filtre</p>
            </div>
          )}
          {/* Pagination */}
          {filteredMovements.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-500">
                Affichage de {filteredMovements.length} mouvements sur {currentData.movements.length} au total
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200">
                Précédent
              </button>
                <button className="px-3 py-1 text-sm bg-cyan-600 text-white rounded">
                1
              </button>
              <button className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded hover:bg-slate-200">
                Suivant
              </button>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Modal Scan Rapide */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Scan Rapide</h3>
              <div className="text-center py-8">
                <CameraIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">Positionnez la facture devant la caméra</p>
                <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-slate-500">Zone de scan</span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowScanModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                    Scanner
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VueEnsemble;
