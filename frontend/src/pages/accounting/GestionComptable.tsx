import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalculatorIcon, 
  DocumentTextIcon, 
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TrashIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ScaleIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
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
  Filler
} from 'chart.js';
import Card from '../../components/UI/Card';
import Modal from '../../components/UI/Modal';
import { useApp } from '../../context/AppContext';
// ...existing code...
import { AdaptiveContentDisplay, AdaptiveContentGenerator } from '../../utils/AdaptiveContent';
import { usePermission } from '../../hooks/usePermission';
import {
  validerEcriture,
  effectuerControlesComptables,
  genererEcritureAmortissement,
  genererEcritureProvision,
  genererEcritureRegularisation,
  suggererCompte,
  type EcritureComptable,
  type ErreurValidation,
  type ControleComptable
} from '../../utils/comptabilite';

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
  Filler
);

const GestionComptable: React.FC = () => {
  const { formatCurrency, user, companyData } = useApp();
  const { has } = usePermission();

  // Contexte pour le contenu adaptatif
  const contentContext = {
    user,
    segment: user?.segment || 'micro',
    companyType: user?.companyType || 'eurl',
    role: user?.role || 'utilisateur',
    hasPermission: has
  };

  // ========================================
  // INTERFACE EURL MICRO-ENTREPRISE  
  // ========================================
  if (user && user.segment === 'micro' && user.companyType === 'eurl' && companyData) {
    const produits = companyData.revenueMonth;
    const charges = Math.round(produits * 0.65);
    const resultatNet = produits - charges;

    return (
      <div className="space-y-6 max-w-7xl mx-auto p-6">
        {/* En-tête avec contenu adaptatif */}
        {(() => {
          const pageContent = AdaptiveContentGenerator.generatePageContent('comptabilite', contentContext);
          return (
            <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white p-8 rounded-2xl shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                    <CalculatorIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">{pageContent.title}</h1>
                    <p className="text-slate-300 text-lg mt-1">{pageContent.subtitle}</p>
                  </div>
                </div>
              </div>
              {/* Description adaptative */}
              <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <p className="text-slate-100 text-sm">{pageContent.description}</p>
              </div>
            </div>
          );
        })()}

        {/* Contenu adaptatif - Conseils et Insights */}
        <AdaptiveContentDisplay 
          pageId="comptabilite" 
          context={contentContext}
          showTips={true}
          showInsights={true}
        />

        {/* 3 Indicateurs Comptables */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 p-6 shadow-lg">
            <h3 className="text-sm font-bold text-emerald-700 uppercase mb-2">Produits</h3>
            <p className="text-3xl font-extrabold text-emerald-600">{produits?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
            <p className="text-xs text-slate-600 mt-1">Compte 70x - Ventes</p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border-2 border-red-200 p-6 shadow-lg">
            <h3 className="text-sm font-bold text-red-700 uppercase mb-2">Charges</h3>
            <p className="text-3xl font-extrabold text-red-600">{charges?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
            <p className="text-xs text-slate-600 mt-1">Compte 60x - Achats & Charges</p>
          </div>

          <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl p-6 shadow-lg">
            <h3 className="text-sm font-bold text-white uppercase mb-2">Résultat Net</h3>
            <p className="text-3xl font-extrabold text-emerald-400">+{resultatNet?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
            <p className="text-xs text-slate-300 mt-1">Produits - Charges</p>
          </div>
        </div>

        {/* Journaux Principaux */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mr-3">
              <DocumentTextIcon className="h-5 w-5 text-white" />
            </div>
            Journaux Comptables
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Ventes', 'Achats', 'Trésorerie'].map((journal, idx) => (
              <div key={idx} className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all duration-300">
                <p className="font-bold text-slate-900 mb-2">Journal {journal}</p>
                <button className="w-full p-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg font-bold hover:from-slate-800 hover:to-black text-sm transition-all">
                  Voir les écritures
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Actions Rapides</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button className="p-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl font-bold hover:from-slate-800 hover:to-black shadow-md hover:shadow-lg transition-all duration-300">
              📊 Balance générale
            </button>
            <button className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all duration-300">
              📚 Grand livre
            </button>
            <button className="p-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:border-emerald-400 hover:shadow-lg transition-all duration-300">
              📄 Compte de résultat
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // INTERFACE STANDARD (autres entreprises)
  // ========================================
  // Gestion des états pour les modals
  const [selectedPeriod, setSelectedPeriod] = useState('mois');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isReconciliationModalOpen, setIsReconciliationModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Plan Comptable Algérien (SCF) - Comptes principaux détaillés
  const accounts = [
    {
      id: '1',
      code: '411',
      name: 'Clients',
      type: 'Actif',
      balance: 125000,
      change: '+5.2%',
      status: 'active',
      subAccounts: [
        { code: '4111', name: 'Clients - Ventes de biens', balance: 85000 },
        { code: '4112', name: 'Clients - Ventes de services', balance: 40000 }
      ]
    },
    {
      id: '2',
      code: '401',
      name: 'Fournisseurs',
      type: 'Passif',
      balance: 85000,
      change: '-2.1%',
      status: 'active',
      subAccounts: [
        { code: '4011', name: 'Fournisseurs - Achats de biens', balance: 60000 },
        { code: '4012', name: 'Fournisseurs - Achats de services', balance: 25000 }
      ]
    },
    {
      id: '3',
      code: '512',
      name: 'Banque',
      type: 'Actif',
      balance: 450000,
      change: '+8.7%',
      status: 'active',
      subAccounts: [
        { code: '5121', name: 'Banque - Compte principal', balance: 300000 },
        { code: '5122', name: 'Banque - Compte secondaire', balance: 150000 }
      ]
    },
    {
      id: '4',
      code: '701',
      name: 'Ventes',
      type: 'Produit',
      balance: 2450000,
      change: '+12.4%',
      status: 'active',
      subAccounts: [
        { code: '7011', name: 'Ventes de produits finis', balance: 1800000 },
        { code: '7012', name: 'Ventes de marchandises', balance: 650000 }
      ]
    },
    {
      id: '5',
      code: '44571',
      name: 'TVA Collectée',
      type: 'Passif',
      balance: 465500,
      change: '+15.3%',
      status: 'active',
      subAccounts: [
        { code: '445711', name: 'TVA Collectée - Ventes', balance: 380000 },
        { code: '445712', name: 'TVA Collectée - Prestations', balance: 85500 }
      ]
    },
    {
      id: '6',
      code: '44566',
      name: 'TVA Déductible',
      type: 'Actif',
      balance: 28500,
      change: '+8.2%',
      status: 'active',
      subAccounts: [
        { code: '445661', name: 'TVA Déductible - Achats', balance: 20000 },
        { code: '445662', name: 'TVA Déductible - Services', balance: 8500 }
      ]
    }
  ];

  // Journaux comptables selon SCF
  const journauxComptables = [
    { code: 'AC', name: 'Achats', type: 'Achat', description: 'Journal des achats' },
    { code: 'VT', name: 'Ventes', type: 'Vente', description: 'Journal des ventes' },
    { code: 'OD', name: 'Opérations Diverses', type: 'Divers', description: 'Journal des opérations diverses' },
    { code: 'BQ', name: 'Banque', type: 'Banque', description: 'Journal de banque' },
    { code: 'CA', name: 'Caisse', type: 'Caisse', description: 'Journal de caisse' },
    { code: 'AN', name: 'A Nouveaux', type: 'A Nouveaux', description: 'Journal d\'ouverture' }
  ];

  // Écritures comptables détaillées
  const ecrituresComptables = [
    {
      id: 1,
      date: '2024-01-15',
      journal: 'VT',
      piece: 'VT-001',
      libelle: 'Facture client F-2024-001',
      comptes: [
        { code: '411', libelle: 'Clients', debit: 2500, credit: 0 },
        { code: '701', libelle: 'Ventes', debit: 0, credit: 2100 },
        { code: '44571', libelle: 'TVA Collectée', debit: 0, credit: 400 }
      ],
      totalDebit: 2500,
      totalCredit: 2500,
      statut: 'validée'
    },
    {
      id: 2,
      date: '2024-01-15',
      journal: 'AC',
      piece: 'AC-001',
      libelle: 'Facture fournisseur F-2024-001',
      comptes: [
        { code: '601', libelle: 'Achats', debit: 1200, credit: 0 },
        { code: '44566', libelle: 'TVA Déductible', debit: 228, credit: 0 },
        { code: '401', libelle: 'Fournisseurs', debit: 0, credit: 1428 }
      ],
      totalDebit: 1428,
      totalCredit: 1428,
      statut: 'validée'
    }
  ];

  // Transactions récentes
  const recentTransactions = [
    {
      id: '1',
      date: '2024-01-15',
      description: 'Facture client #F-2024-001',
      account: '411 - Clients',
      debit: 2500,
      credit: 0,
      balance: 127500
    },
    {
      id: '2',
      date: '2024-01-15',
      description: 'Paiement fournisseur #P-2024-001',
      account: '401 - Fournisseurs',
      debit: 0,
      credit: 1200,
      balance: 83800
    },
    {
      id: '3',
      date: '2024-01-14',
      description: 'Virement bancaire reçu',
      account: '512 - Banque',
      debit: 5000,
      credit: 0,
      balance: 455000
    },
    {
      id: '4',
      date: '2024-01-14',
      description: 'Vente produit A',
      account: '701 - Ventes',
      debit: 0,
      credit: 1500,
      balance: 2451500
    }
  ];

  // Écritures en attente
  const pendingEntries = [
    {
      id: '1',
      date: '2024-01-15',
      description: 'Ajustement stock',
      amount: 250,
      status: 'pending'
    },
    {
      id: '2',
      date: '2024-01-15',
      description: 'Amortissement matériel',
      amount: 500,
      status: 'pending'
    },
    {
      id: '3',
      date: '2024-01-16',
      description: 'Provision créances douteuses',
      amount: 1000,
      status: 'pending'
    }
  ];
  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'Actif': return 'text-slate-700 bg-slate-100';
      case 'Passif': return 'text-slate-700 bg-slate-200';
      case 'Produit': return 'text-slate-800 bg-slate-100';
      case 'Charge': return 'text-slate-700 bg-slate-200';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête Professionnel Slate */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg p-6 border border-slate-600">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/20 rounded-xl">
              <CalculatorIcon className="h-8 w-8 text-emerald-400" />
            </div>
        <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                Gestion Comptable SCF
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">
                  🇩🇿 Algérie
                </span>
              </h1>
              <p className="text-slate-300 text-sm mt-1">
                Système Comptable Financier • {currentTime.toLocaleDateString('fr-FR')} • {currentTime.toLocaleTimeString('fr-FR')}
          </p>
        </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Période"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-600 text-white text-sm px-4 py-2 rounded-lg border-none outline-none font-medium"
            >
              <option value="jour" className="bg-slate-700">Aujourd'hui</option>
              <option value="semaine" className="bg-slate-700">Cette semaine</option>
              <option value="mois" className="bg-slate-700">Ce mois</option>
              <option value="trimestre" className="bg-slate-700">Ce trimestre</option>
              <option value="annee" className="bg-slate-700">Cette année</option>
          </select>
            
          <button 
            onClick={() => setIsTransactionModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-medium shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nouvelle Écriture</span>
          </button>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-0">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="flex flex-wrap gap-2 px-4 py-3" aria-label="Tabs">
            {[
              { id: 'general', name: 'Général', icon: BuildingOfficeIcon },
              { id: 'journaux', name: 'Journaux', icon: DocumentTextIcon },
              { id: 'ecritures', name: 'Écritures', icon: CalculatorIcon },
              { id: 'balance', name: 'Balance', icon: ScaleIcon },
              { id: 'tva', name: 'TVA', icon: BanknotesIcon },
              { id: 'cloture', name: 'Clôture', icon: CalendarIcon },
              { id: 'rapports', name: 'Rapports', icon: ChartBarIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-700 dark:bg-slate-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <>
              {/* KPIs Principaux */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                      <p className="text-xs text-slate-600 font-medium uppercase">Écritures en attente</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">3</p>
                      </div>
                    <ClockIcon className="h-8 w-8 text-amber-500" />
                    </div>
                  </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                      <p className="text-xs text-slate-600 font-medium uppercase">Clôture</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">75%</p>
                      </div>
                    <CalendarIcon className="h-8 w-8 text-slate-600" />
                    </div>
                  </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                      <p className="text-xs text-slate-600 font-medium uppercase">Contrôles OK</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">4/6</p>
                      </div>
                    <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
                    </div>
                  </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                      <p className="text-xs text-slate-600 font-medium uppercase">Rapports prêts</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">3/4</p>
                      </div>
                    <DocumentTextIcon className="h-8 w-8 text-slate-600" />
                    </div>
                  </div>
                </div>

              {/* Actions Principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <button 
                    onClick={() => setActiveTab('cloture')}
                  className="flex items-center p-4 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <CalendarIcon className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Clôture Comptable</div>
                    <div className="text-xs opacity-90">Gérer la clôture</div>
                  </div>
                  </button>
                <button 
                  onClick={() => setActiveTab('rapports')}
                  className="flex items-center p-4 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors border border-slate-300"
                >
                  <ChartBarIcon className="h-5 w-5 mr-3 text-slate-700" />
                  <div className="text-left">
                    <div className="font-medium text-slate-900">Analyse Financière</div>
                    <div className="text-xs text-slate-600">Ratios & KPIs</div>
                  </div>
                  </button>
                <Link 
                  to="/rapports-analytics"
                  className="flex items-center p-4 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors border border-slate-300"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-3 text-slate-700" />
                  <div className="text-left">
                    <div className="font-medium text-slate-900">Rapports</div>
                    <div className="text-xs text-slate-600">Bilan & Résultat</div>
                    </div>
                  </Link>
                <button 
                  onClick={() => setIsTransactionModalOpen(true)}
                  className="flex items-center p-4 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors border border-slate-300"
                >
                  <CalculatorIcon className="h-5 w-5 mr-3 text-slate-700" />
                  <div className="text-left">
                    <div className="font-medium text-slate-900">Nouvelle Écriture</div>
                    <div className="text-xs text-slate-600">Saisie rapide</div>
                    </div>
                </button>
                    </div>

              {/* Plan Comptable SCF - Version Compacte */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                    <BuildingOfficeIcon className="h-5 w-5 text-slate-700" />
                    <span>Plan Comptable SCF</span>
                </h3>
                  <button className="text-sm text-slate-600 hover:text-slate-900">Voir tout →</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {accounts.map((account) => (
                    <div key={account.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-700">{account.code}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getAccountTypeColor(account.type)}`}>
                          {account.type}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">{account.name}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-slate-900">{formatCurrency(account.balance)}</span>
                        <span className={`text-xs font-medium ${
                          account.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {account.change}
                        </span>
                      </div>
                              </div>
                            ))}
                          </div>
              </Card>

              {/* Transactions récentes et écritures en attente */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Transactions récentes */}
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
                      <DocumentTextIcon className="h-4 w-4 text-slate-700" />
                      <span>Transactions Récentes</span>
                    </h3>
                    <button className="text-xs text-slate-600 hover:text-slate-900">Tout voir →</button>
                        </div>
                  <div className="space-y-2">
                    {recentTransactions.slice(0, 3).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">{transaction.description}</div>
                          <div className="text-xs text-slate-500">{transaction.account} • {transaction.date}</div>
                        </div>
                        <div className="text-right ml-3">
                          {transaction.debit > 0 && (
                            <div className="text-sm font-semibold text-emerald-600">+{formatCurrency(transaction.debit)}</div>
                          )}
                          {transaction.credit > 0 && (
                            <div className="text-sm font-semibold text-red-600">-{formatCurrency(transaction.credit)}</div>
                          )}
                        </div>
                    </div>
                  ))}
                </div>
              </Card>

                {/* Écritures en attente */}
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-amber-600" />
                      <span>Écritures en Attente</span>
                    </h3>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">{pendingEntries.length}</span>
                  </div>
                  <div className="space-y-2">
                    {pendingEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-2 bg-amber-50 rounded border border-amber-200">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900">{entry.description}</div>
                          <div className="text-xs text-slate-600">{entry.date}</div>
                        </div>
                        <div className="flex items-center space-x-1 ml-3">
                          <span className="text-sm font-semibold text-slate-900">{formatCurrency(entry.amount)}</span>
                          <button className="p-1 text-emerald-600 hover:bg-emerald-100 rounded" title="Valider">
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-100 rounded" title="Supprimer">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* Onglet Journaux Comptables */}
          {activeTab === 'journaux' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">Journaux Comptables SCF</h3>
              
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                  <h4 className="text-lg font-medium text-slate-900">Configuration des Journaux</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Nom</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {journauxComptables.map((journal) => (
                        <tr key={journal.code} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-800">
                              {journal.code}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            {journal.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              journal.type === 'Achat' ? 'bg-slate-300 text-slate-900' :
                              journal.type === 'Vente' ? 'bg-slate-200 text-slate-800' :
                              journal.type === 'Banque' ? 'bg-slate-300 text-slate-900' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {journal.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            {journal.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-slate-700 hover:text-slate-900 mr-3">Modifier</button>
                            <button className="text-slate-600 hover:text-slate-800">Voir Écritures</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Écritures Comptables */}
          {activeTab === 'ecritures' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Écritures Comptables</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setIsTransactionModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center text-sm"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nouvelle Écriture
                  </button>
                  <button className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm">
                    Exporter
                  </button>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                  <h4 className="text-lg font-medium text-slate-900">Journal des Écritures</h4>
                  <p className="text-sm text-slate-600 mt-1">Détails complets des écritures avec comptes débit/crédit</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Journal</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Pièce</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Libellé</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Comptes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Débit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Crédit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Statut</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {ecrituresComptables.map((ecriture) => (
                        <React.Fragment key={ecriture.id}>
                          <tr className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700" rowSpan={ecriture.comptes.length + 1}>
                              {ecriture.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap" rowSpan={ecriture.comptes.length + 1}>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-800">
                                {ecriture.journal}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900" rowSpan={ecriture.comptes.length + 1}>
                              {ecriture.piece}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700" rowSpan={ecriture.comptes.length + 1}>
                              {ecriture.libelle}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900" rowSpan={ecriture.comptes.length + 1}>
                              {formatCurrency(ecriture.totalDebit)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900" rowSpan={ecriture.comptes.length + 1}>
                              {formatCurrency(ecriture.totalCredit)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap" rowSpan={ecriture.comptes.length + 1}>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                ecriture.statut === 'validée' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {ecriture.statut}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" rowSpan={ecriture.comptes.length + 1}>
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-900" title="Voir détails">
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button className="text-indigo-600 hover:text-indigo-900" title="Modifier">
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {ecriture.comptes.map((compte, idx) => (
                            <tr key={idx} className="bg-slate-50/50 hover:bg-slate-100">
                              <td colSpan={4} className="px-6 py-2 text-xs text-slate-600">
                                <div className="flex items-center space-x-4">
                                  <span className="font-mono font-semibold text-slate-700">{compte.code}</span>
                                  <span className="text-slate-700">{compte.libelle}</span>
                                </div>
                              </td>
                              <td className="px-6 py-2 text-xs font-medium text-emerald-700">
                                {compte.debit > 0 ? formatCurrency(compte.debit) : '-'}
                              </td>
                              <td className="px-6 py-2 text-xs font-medium text-red-700">
                                {compte.credit > 0 ? formatCurrency(compte.credit) : '-'}
                              </td>
                              <td colSpan={2}></td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Résumé des écritures */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                  <h4 className="font-semibold text-emerald-800 mb-2">Total Débit</h4>
                  <p className="text-2xl font-bold text-emerald-600">
                    {formatCurrency(ecrituresComptables.reduce((sum, e) => sum + e.totalDebit, 0))}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">Total Crédit</h4>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(ecrituresComptables.reduce((sum, e) => sum + e.totalCredit, 0))}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-800 mb-2">Équilibre</h4>
                  <p className="text-2xl font-bold text-slate-900">
                    {ecrituresComptables.reduce((sum, e) => sum + e.totalDebit, 0) === 
                     ecrituresComptables.reduce((sum, e) => sum + e.totalCredit, 0) 
                      ? '✓ Équilibré' : '✗ Déséquilibré'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Balance Comptable */}
          {activeTab === 'balance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">Balance Comptable</h3>
              
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                  <h4 className="text-lg font-medium text-slate-900">Balance Générale - Période: {selectedPeriod}</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Compte</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Intitulé</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Solde Débiteur</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Solde Créditeur</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Type</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {accounts.map((account) => (
                        <tr key={account.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            {account.code}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            {account.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {account.type === 'Actif' || account.type === 'Charge' ? formatCurrency(account.balance) : '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {account.type === 'Passif' || account.type === 'Produit' ? formatCurrency(account.balance) : '0.00'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccountTypeColor(account.type)}`}>
                              {account.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top 5 Dépenses */}
              <Card className="p-5">
                <h4 className="text-base font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                  <BanknotesIcon className="h-5 w-5 text-slate-700" />
                  <span>Top 5 Dépenses</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-slate-700 text-white rounded-full text-sm font-bold">1</div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">Salaires & Charges</div>
                        <div className="text-xs text-slate-600">Compte 631/641</div>
                      </div>
                    </div>
                    <div className="text-base font-bold text-slate-900">850 000 دج</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-slate-600 text-white rounded-full text-sm font-bold">2</div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">Achats Marchandises</div>
                        <div className="text-xs text-slate-600">Compte 380</div>
                      </div>
                    </div>
                    <div className="text-base font-bold text-slate-900">580 000 دج</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-slate-500 text-white rounded-full text-sm font-bold">3</div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">Loyers & Charges</div>
                        <div className="text-xs text-slate-600">Compte 613</div>
                      </div>
                    </div>
                    <div className="text-base font-bold text-slate-900">120 000 دج</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-slate-400 text-white rounded-full text-sm font-bold">4</div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">Services Externes</div>
                        <div className="text-xs text-slate-600">Compte 628</div>
                      </div>
                    </div>
                    <div className="text-base font-bold text-slate-900">95 000 دج</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-slate-300 text-slate-700 rounded-full text-sm font-bold">5</div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">Amortissements</div>
                        <div className="text-xs text-slate-600">Compte 681</div>
                      </div>
                    </div>
                    <div className="text-base font-bold text-slate-900">45 000 دج</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Total Dépenses (Top 5)</span>
                  <span className="text-lg font-bold text-slate-900">1 690 000 دج</span>
                </div>
              </Card>
            </div>
          )}

          {/* Onglet TVA */}
          {activeTab === 'tva' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">Gestion TVA - Réglementation Algérienne</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="TVA Collectée (19%)">
                  <div className="space-y-4">
                    <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700 font-medium">TVA Collectée Total:</span>
                        <span className="text-2xl font-bold text-slate-900">{formatCurrency(465500)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">TVA sur Ventes:</span>
                        <span className="font-medium text-slate-900">{formatCurrency(380000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">TVA sur Prestations:</span>
                        <span className="font-medium text-slate-900">{formatCurrency(85500)}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card title="TVA Déductible (19%)">
                  <div className="space-y-4">
                    <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700 font-medium">TVA Déductible Total:</span>
                        <span className="text-2xl font-bold text-slate-900">{formatCurrency(28500)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">TVA sur Achats:</span>
                        <span className="font-medium text-slate-900">{formatCurrency(20000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">TVA sur Services:</span>
                        <span className="font-medium text-slate-900">{formatCurrency(8500)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <Card title="Calcul TVA à Verser">
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-slate-600 text-sm font-medium">TVA Collectée</p>
                      <p className="text-2xl font-bold text-slate-800">{formatCurrency(465500)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-600 text-sm font-medium">TVA Déductible</p>
                      <p className="text-2xl font-bold text-slate-800">{formatCurrency(28500)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-600 text-sm font-medium">TVA à Verser</p>
                      <p className="text-3xl font-bold text-slate-900">{formatCurrency(437000)}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Onglet Clôture Comptable */}
          {activeTab === 'cloture' && (
            <div className="space-y-6">
              {/* En-tête avec actions */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Clôture Comptable</h3>
                  <p className="text-sm text-slate-600">Période: {selectedPeriod} | Statut: En cours</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 text-sm font-medium">
                    Valider
                  </button>
                  <button className="px-3 py-1.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm font-medium">
                    Rapport
                  </button>
                </div>
              </div>

              {/* Progression globale */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-900">Progression Globale</span>
                  <span className="text-2xl font-bold text-slate-900">75%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 mb-3">
                  <div className="bg-slate-700 h-2.5 rounded-full w-3/4"></div>
                </div>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <div className="text-xs text-slate-600">Préparation</div>
                    <div className="text-sm font-bold text-slate-900">100%</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Ajustements</div>
                    <div className="text-sm font-bold text-slate-800">75%</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Validation</div>
                    <div className="text-sm font-bold text-slate-400">0%</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Finalisation</div>
                    <div className="text-sm font-bold text-slate-400">0%</div>
                  </div>
                </div>
              </Card>

              {/* Contrôles - Version compacte */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-100 rounded-lg border border-slate-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">Équilibre Comptes</span>
                    <CheckCircleIcon className="h-4 w-4 text-slate-600" />
                  </div>
                  <div className="text-sm font-bold text-slate-900">Débit = Crédit</div>
                  <div className="text-xs text-slate-600">2 450 000 دج</div>
                </div>

                <div className="p-3 bg-slate-200 rounded-lg border border-slate-400">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-800">Contrôle TVA</span>
                    <ExclamationTriangleIcon className="h-4 w-4 text-slate-700" />
                  </div>
                  <div className="text-sm font-bold text-slate-900">À verser</div>
                  <div className="text-xs text-slate-700">437 000 دج</div>
                </div>

                <div className="p-3 bg-slate-100 rounded-lg border border-slate-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">Inventaire</span>
                    <CheckCircleIcon className="h-4 w-4 text-slate-600" />
                </div>
                  <div className="text-sm font-bold text-slate-900">Terminé</div>
                  <div className="text-xs text-slate-600">45 articles</div>
            </div>

                <div className="p-3 bg-slate-300 rounded-lg border border-slate-500">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-900">Créances</span>
                    <ExclamationTriangleIcon className="h-4 w-4 text-slate-800" />
            </div>
                  <div className="text-sm font-bold text-slate-900">3 litiges</div>
                  <div className="text-xs text-slate-800">15 000 دج</div>
        </div>

                <div className="p-3 bg-slate-100 rounded-lg border border-slate-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">Rapprochement</span>
                    <CheckCircleIcon className="h-4 w-4 text-slate-600" />
                </div>
                  <div className="text-sm font-bold text-slate-900">3 comptes</div>
                  <div className="text-xs text-slate-600">Écart: 0 دج</div>
                </div>

                <div className="p-3 bg-slate-100 rounded-lg border border-slate-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-700">Amortissements</span>
                    <CheckCircleIcon className="h-4 w-4 text-slate-600" />
              </div>
                  <div className="text-sm font-bold text-slate-900">12 immo.</div>
                  <div className="text-xs text-slate-600">45 000 دج</div>
          </div>
              </div>

              {/* Statistiques clés */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600">Écritures validées</div>
                  <div className="text-lg font-bold text-slate-900">1 250</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600">Rapprochements</div>
                  <div className="text-lg font-bold text-slate-900">3</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600">Contrôles OK</div>
                  <div className="text-lg font-bold text-slate-900">4/6</div>
              </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600">Ajustements</div>
                  <div className="text-lg font-bold text-slate-900">12</div>
          </div>
      </div>

              {/* Note d'alerte */}
              <div className="p-3 bg-slate-100 rounded-lg border border-slate-300">
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-slate-900">Points d'attention</div>
                    <div className="text-xs text-slate-700 mt-1">
                      • 3 créances clients en litige nécessitent une provision<br/>
                      • TVA à déclarer avant le 25/02/2024
        </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rapports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Rapports Comptables & Analyse Financière</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 text-sm font-medium">
                    Exporter PDF
                  </button>
                  <button className="px-3 py-1.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 text-sm font-medium">
                    Imprimer
                  </button>
            </div>
        </div>

              {/* Indicateurs financiers clés */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">Chiffre d'Affaires</div>
                  <div className="text-2xl font-bold text-slate-900">2 450 000 دج</div>
                  <div className="text-xs text-slate-600 mt-1">+12.5% vs mois dernier</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">Résultat Net</div>
                  <div className="text-2xl font-bold text-slate-900">485 000 دج</div>
                  <div className="text-xs text-slate-600 mt-1">Marge nette: 19.8%</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">Trésorerie</div>
                  <div className="text-2xl font-bold text-slate-900">450 000 دج</div>
                  <div className="text-xs text-slate-600 mt-1">+8.7% vs mois dernier</div>
              </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-600 mb-1">Créances Clients</div>
                  <div className="text-2xl font-bold text-slate-900">125 000 دج</div>
                  <div className="text-xs text-slate-600 mt-1">DSO: 15 jours</div>
                </div>
              </div>

              {/* Graphiques principaux */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-5">
                  <h4 className="text-base font-semibold text-slate-900 mb-4">Évolution Produits vs Charges</h4>
                  <div className="h-64">
                    <Line 
                      data={{
                        labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
                        datasets: [
                          {
                            label: 'Produits',
                            data: [2200000, 2350000, 2400000, 2500000, 2450000, 2800000],
                            borderColor: 'rgb(51, 65, 85)',
                            backgroundColor: 'rgba(51, 65, 85, 0.1)',
                            tension: 0.4,
                            fill: true,
                            borderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            pointBackgroundColor: 'rgb(51, 65, 85)',
                          },
                          {
                            label: 'Charges',
                            data: [1800000, 1900000, 1950000, 2000000, 1950000, 2200000],
                            borderColor: 'rgb(148, 163, 184)',
                            backgroundColor: 'rgba(148, 163, 184, 0.1)',
                            tension: 0.4,
                            fill: true,
                            borderWidth: 2,
                            pointRadius: 4,
                            pointHoverRadius: 6,
                            pointBackgroundColor: 'rgb(148, 163, 184)',
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top' as const,
                            labels: {
                              usePointStyle: true,
                              padding: 15,
                              font: { size: 12 },
                              color: 'rgb(51, 65, 85)'
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const value = context.parsed.y ?? 0;
                                return context.dataset.label + ': ' + new Intl.NumberFormat('fr-DZ', { 
                                  style: 'currency', 
                                  currency: 'DZD',
                                  minimumFractionDigits: 0
                                }).format(value);
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return value !== null ? (Number(value) / 1000000).toFixed(1) + 'M' : '';
                              },
                              color: 'rgb(100, 116, 139)'
                            },
                            grid: {
                              color: 'rgba(148, 163, 184, 0.1)'
                            }
                          },
                          x: {
                            ticks: {
                              color: 'rgb(100, 116, 139)'
                            },
                            grid: {
                              display: false
                            }
                          }
                        }
                      }}
                    />
          </div>
        </Card>

                <Card className="p-5">
                  <h4 className="text-base font-semibold text-slate-900 mb-4">Répartition des Charges</h4>
                  <div className="h-64">
                    <Doughnut 
                      data={{
                        labels: ['Personnel', 'Achats', 'Services', 'Autres'],
                        datasets: [{
                          data: [45, 30, 15, 10],
                          backgroundColor: [
                            'rgb(51, 65, 85)',
                            'rgb(100, 116, 139)',
                            'rgb(148, 163, 184)',
                            'rgb(203, 213, 225)',
                          ],
                          borderColor: [
                            'rgb(51, 65, 85)',
                            'rgb(100, 116, 139)',
                            'rgb(148, 163, 184)',
                            'rgb(203, 213, 225)',
                          ],
                          borderWidth: 2,
                          hoverOffset: 10
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom' as const,
                            labels: {
                              usePointStyle: true,
                              padding: 15,
                              font: { size: 12 },
                              color: 'rgb(51, 65, 85)',
                              generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels && data.datasets.length) {
                                  const dataset = data.datasets[0];
                                  const bgColors = Array.isArray(dataset.backgroundColor) ? dataset.backgroundColor : [];
                                  const borderColors = Array.isArray(dataset.borderColor) ? dataset.borderColor : [];
                                  
                                  return data.labels.map((label, i) => {
                                    const value = dataset.data[i];
                                    return {
                                      text: `${label}: ${value}%`,
                                      fillStyle: bgColors[i] as string || 'rgb(51, 65, 85)',
                                      strokeStyle: borderColors[i] as string || 'rgb(51, 65, 85)',
                                      hidden: false,
                                      index: i
                                    };
                                  });
                                }
                                return [];
                              }
                            }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                              }
                            }
                          }
                        }
                      }}
                    />
                </div>
                </Card>
                </div>

              {/* Ratios Financiers */}
              <Card className="p-5">
                <h4 className="text-base font-semibold text-slate-900 mb-4">Ratios Financiers SCF</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Ratio de Liquidité</div>
                    <div className="text-xl font-bold text-slate-900">1.85</div>
                    <div className="text-xs text-slate-600 mt-1">Actif CT / Passif CT</div>
              </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Rentabilité (ROE)</div>
                    <div className="text-xl font-bold text-slate-900">15.2%</div>
                    <div className="text-xs text-slate-600 mt-1">Résultat / Capitaux propres</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Autonomie Financière</div>
                    <div className="text-xl font-bold text-slate-900">68%</div>
                    <div className="text-xs text-slate-600 mt-1">Capitaux propres / Total actif</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1">Rotation Stocks</div>
                    <div className="text-xl font-bold text-slate-900">8.5x</div>
                    <div className="text-xs text-slate-600 mt-1">CA / Stock moyen</div>
                  </div>
          </div>
        </Card>

              {/* Flux de Trésorerie */}
              <Card className="p-5">
                <h4 className="text-base font-semibold text-slate-900 mb-4">Flux de Trésorerie</h4>
                <div className="h-56">
                  <Bar 
                    data={{
                      labels: ['Exploitation', 'Investissement', 'Financement', 'Variation Nette'],
                      datasets: [{
                        label: 'Flux de Trésorerie (DZD)',
                        data: [285000, -120000, 50000, 215000],
                        backgroundColor: [
                          'rgba(51, 65, 85, 0.8)',
                          'rgba(148, 163, 184, 0.8)',
                          'rgba(100, 116, 139, 0.8)',
                          'rgba(71, 85, 105, 0.8)',
                        ],
                        borderColor: [
                          'rgb(51, 65, 85)',
                          'rgb(148, 163, 184)',
                          'rgb(100, 116, 139)',
                          'rgb(71, 85, 105)',
                        ],
                        borderWidth: 2,
                        borderRadius: 6,
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              const value = context.parsed.y ?? 0;
                              return new Intl.NumberFormat('fr-DZ', { 
                                style: 'currency', 
                                currency: 'DZD',
                                minimumFractionDigits: 0
                              }).format(value);
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          ticks: {
                            callback: function(value) {
                              return value !== null ? (Number(value) / 1000).toFixed(0) + 'K' : '';
                            },
                            color: 'rgb(100, 116, 139)'
                          },
                          grid: {
                            color: 'rgba(148, 163, 184, 0.1)'
                          }
                        },
                        x: {
                          ticks: {
                            color: 'rgb(100, 116, 139)',
                            font: { size: 11 }
                          },
                          grid: {
                            display: false
                          }
                        }
                      }
                    }}
                  />
      </div>
              </Card>


              {/* Analyse Comparative */}
              <Card className="p-5">
                <h4 className="text-base font-semibold text-slate-900 mb-4">Analyse Comparative N vs N-1</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Indicateur</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">2024</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">2023</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">Évolution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-sm text-slate-900">Chiffre d'Affaires</td>
                        <td className="px-4 py-2 text-sm text-slate-900 text-right">2 450 000</td>
                        <td className="px-4 py-2 text-sm text-slate-700 text-right">2 180 000</td>
                        <td className="px-4 py-2 text-sm font-medium text-slate-900 text-right">+12.4%</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-sm text-slate-900">Charges d'Exploitation</td>
                        <td className="px-4 py-2 text-sm text-slate-900 text-right">1 690 000</td>
                        <td className="px-4 py-2 text-sm text-slate-700 text-right">1 580 000</td>
                        <td className="px-4 py-2 text-sm font-medium text-slate-900 text-right">+7.0%</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-sm text-slate-900">Résultat d'Exploitation</td>
                        <td className="px-4 py-2 text-sm text-slate-900 text-right">760 000</td>
                        <td className="px-4 py-2 text-sm text-slate-700 text-right">600 000</td>
                        <td className="px-4 py-2 text-sm font-medium text-slate-900 text-right">+26.7%</td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-sm text-slate-900">Résultat Net</td>
                        <td className="px-4 py-2 text-sm text-slate-900 text-right">485 000</td>
                        <td className="px-4 py-2 text-sm text-slate-700 text-right">380 000</td>
                        <td className="px-4 py-2 text-sm font-medium text-slate-900 text-right">+27.6%</td>
                      </tr>
                    </tbody>
                  </table>
        </div>
      </Card>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        title="Nouvelle Écriture Comptable"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              aria-label="Date de l'écriture"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white"
              placeholder="Description de l'écriture"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Compte Débit</label>
              <select aria-label="Compte Débit" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white">
                <option value="">Sélectionner un compte</option>
                <option value="411">411 - Clients</option>
                <option value="512">512 - Banque</option>
                <option value="601">601 - Achats</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Compte Crédit</label>
              <select aria-label="Compte Crédit" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white">
                <option value="">Sélectionner un compte</option>
                <option value="401">401 - Fournisseurs</option>
                <option value="701">701 - Ventes</option>
                <option value="512">512 - Banque</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Montant</label>
            <input
              type="number"
              aria-label="Montant de l'écriture"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white"
              placeholder="0.00"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsTransactionModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:text-slate-800"
            >
              Annuler
            </button>
            <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800">
              Enregistrer
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isReconciliationModalOpen}
        onClose={() => setIsReconciliationModalOpen(false)}
        title="Rapprochement Bancaire"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Compte Bancaire</label>
            <select aria-label="Compte Bancaire" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white">
              <option value="512">512 - Banque Principale</option>
              <option value="513">513 - Banque Secondaire</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Période</label>
            <select aria-label="Période de rapprochement" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 bg-white">
              <option value="janvier">Janvier 2024</option>
              <option value="decembre">Décembre 2023</option>
            </select>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h4 className="text-sm font-medium text-slate-900 mb-2">Informations</h4>
            <p className="text-sm text-slate-700">
              Le rapprochement bancaire permet de vérifier la cohérence entre les écritures comptables et les relevés bancaires.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsReconciliationModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:text-slate-800"
            >
              Annuler
            </button>
            <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800">
              Commencer le Rapprochement
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GestionComptable;