import React, { useState, useMemo, useContext } from 'react';
import { useTranslation } from '@shared/hooks/useTranslation';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CreditCardIcon,
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowPathIcon,
  EyeIcon,
  DocumentTextIcon,
  SparklesIcon,
  CalculatorIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import CashFlowForecast from '@shared/components/Treasury/CashFlowForecast';
// import BankReconciliation from '@shared/components/Treasury/BankReconciliation';
// import LiquidityDashboard from '@shared/components/Treasury/LiquidityDashboard';
import { AppContext } from '@core/context/AppContext';
import type { AppContextType } from '@core/context/AppContext';
import {
  genererPrevisionsTresorerie,
  detecterAlertesLiquidite,
  simulerScenarioTresorerie,
  calculerMetriquesTresorerie,
  genererEcheancesAutomatiques,
  planifierFinancement,
  type EcheanceTresorerie,
  type PrevisionTresorerie,
  type AlerteLiquidite,
  type ScenarioTresorerie
} from '@shared/utils/tresorerie';

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'inflow' | 'outflow';
  amount: number;
  status: 'pending' | 'cleared' | 'reconciled';
  bank?: string;
  reference?: string;
}

interface BankAccount {
  id: string;
  name: string;
  bank: string;
  iban: string;
  balance: number;
  lastUpdated: string;
  currency: string;
}

// --- Composant Gestion des Chèques ---
const ChecksManagement: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useContext(AppContext) as AppContextType;
  const [checks, setChecks] = useState<any[]>([]);
  const [selectedChecks, setSelectedChecks] = useState<string[]>([]);
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [bankAccount, setBankAccount] = useState('512001'); // BNA par défaut
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    fetchChecks();
  }, []);

  const fetchChecks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/payments/checks-in-safe', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setChecks(data);
      }
    } catch (error) {
      console.error("Erreur chargement chèques", error);
    }
  };

  const handleGenerateDeposit = async () => {
    if (selectedChecks.length === 0) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/payments/deposit-checks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          payment_ids: selectedChecks,
          bank_account_code: bankAccount,
          deposit_date: depositDate
        })
      });

      if (response.ok) {
        const result = await response.json();
        setSuccessMessage(t('treasury.checks.success_deposit', { no: result.slip_number, amount: result.total_amount }));
        setSelectedChecks([]);
        fetchChecks(); // Refresh list
      }
    } catch (error) {
      console.error("Erreur remise chèque", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedChecks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const totalSelected = checks.filter(c => selectedChecks.includes(c.id)).reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-amber-900 flex items-center">
            <BanknotesIcon className="h-6 w-6 mr-2" />
            {t('treasury.checks.safe_title')}
          </h3>
          <p className="text-sm text-amber-800">{t('treasury.checks.safe_subtitle')}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-amber-900">{t('treasury.checks.total_in_safe')}</p>
          <p className="text-2xl font-bold text-amber-700">
            {formatCurrency(checks.reduce((s, c) => s + Number(c.amount), 0))}
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-green-100 text-green-800 rounded-lg flex items-center border border-green-300">
          <CheckIcon className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg shadow border border-slate-200 p-6">
        <div className="flex justify-between items-end mb-4">
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('treasury.checks.deposit_date')}</label>
              <input type="date" value={depositDate} onChange={e => setDepositDate(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('treasury.checks.bank_account')}</label>
              <select value={bankAccount} onChange={e => setBankAccount(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                <option value="512001">BNA - Compte Principal</option>
                <option value="512002">BADR - Compte Secondaire</option>
              </select>
            </div>
          </div>
          <div>
            <button
              onClick={handleGenerateDeposit}
              disabled={selectedChecks.length === 0 || loading}
              className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${selectedChecks.length === 0 ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {loading ? t('treasury.checks.processing') : `${t('treasury.checks.generate_deposit')} (${formatCurrency(totalSelected)})`}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  <input type="checkbox"
                    onChange={e => setSelectedChecks(e.target.checked ? checks.map(c => c.id) : [])}
                    checked={selectedChecks.length === checks.length && checks.length > 0}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('treasury.checks.table.reception_date')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('treasury.checks.table.check_no')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('treasury.checks.table.payment_ref')}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">{t('treasury.checks.table.amount')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {checks.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-500">{t('treasury.checks.no_checks')}</td></tr>
              ) : (
                checks.map((check) => (
                  <tr key={check.id} className={selectedChecks.includes(check.id) ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" checked={selectedChecks.includes(check.id)} onChange={() => toggleSelect(check.id)} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{check.payment_date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{check.check_number || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">Paiement #{check.id.substring(0, 8)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right font-bold">
                      {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(Number(check.amount))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import treasuryService from '@/services/modules/treasuryService';

const Tresorerie: React.FC = () => {
  const { t } = useTranslation();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [accountsData, transactionsData] = await Promise.all([
          treasuryService.getAccounts(),
          treasuryService.getTransactions({ limit: 10 })
        ]);

        setBankAccounts(accountsData.map(acc => ({
          id: acc.id,
          name: acc.bank_name,
          bank: acc.bank_name,
          iban: acc.iban || '',
          balance: Number(acc.balance),
          lastUpdated: new Date().toISOString().split('T')[0],
          currency: acc.currency
        })));

        setTransactions(transactionsData.map(tx => ({
          id: tx.id,
          date: tx.date,
          description: tx.label,
          type: tx.type === 'credit' ? 'inflow' : 'outflow',
          amount: Number(tx.amount),
          status: 'cleared', // Default to cleared for approved journal entries
          bank: t('accounting.treasury.accounts.prefix') + ' ' + tx.account_code,
          reference: tx.reference
        })));
      } catch (error) {
        console.error("Error fetching treasury data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [activeTab, setActiveTab] = useState<'overview' | 'forecast' | 'reconciliation' | 'liquidity' | 'checks'>('overview');
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isEcheancesModalOpen, setIsEcheancesModalOpen] = useState(false);

  const appCtx = useContext(AppContext) as AppContextType | undefined;
  const user = appCtx?.user;
  const company = appCtx?.companyData;
  const segment = (company && 'segment' in company ? (company as any).segment : 'micro');
  const role = user?.role || 'utilisateur';

  // Filtrage des données selon la taille et le rôle
  const visibleAccounts = useMemo(() => {
    if (role === 'comptable-junior' && (segment === 'micro' || segment === 'small')) {
      return bankAccounts.slice(0, 1); // Vue simplifiée
    }
    if (role === 'comptable' && (segment === 'small' || segment === 'medium')) {
      return bankAccounts.slice(0, 2);
    }
    if (role === 'comptable-senior' || role === 'manager' || role === 'admin') {
      return bankAccounts;
    }
    return bankAccounts.slice(0, 1);
  }, [bankAccounts, role, segment]);

  const visibleTransactions = useMemo(() => {
    if (role === 'comptable-junior') {
      return transactions.filter(t => t.amount < 5000000);
    }
    if (role === 'comptable') {
      return transactions;
    }
    if (role === 'comptable-senior' || role === 'manager' || role === 'admin') {
      return transactions;
    }
    return transactions.slice(0, 3);
  }, [transactions, role]);

  // Calculs KPI
  const totalBalance = useMemo(() => visibleAccounts.reduce((sum, acc) => sum + acc.balance, 0), [visibleAccounts]);
  const totalInflow = useMemo(() => visibleTransactions.filter(t => t.type === 'inflow').reduce((sum, t) => sum + t.amount, 0), [visibleTransactions]);
  const totalOutflow = useMemo(() => visibleTransactions.filter(t => t.type === 'outflow').reduce((sum, t) => sum + t.amount, 0), [visibleTransactions]);
  const netCashFlow = totalInflow - totalOutflow;
  const pendingAmount = useMemo(() => visibleTransactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + (t.type === 'outflow' ? t.amount : -t.amount), 0), [visibleTransactions]);

  // Générer les échéances automatiques
  const echeancesAutomatiques = useMemo(() => {
    const caMensuel = company?.revenueMonth || 2500000;
    const chargesMensuelles = caMensuel * 0.7;
    const dso = 45; // Estimation
    const dpo = 30; // Estimation

    return genererEcheancesAutomatiques({
      caMensuel,
      chargesMensuelles,
      dso,
      dpo,
      dateDebut: new Date().toISOString().split('T')[0],
      nombreMois: 3
    });
  }, [company]);

  // Générer les prévisions de trésorerie
  const previsionsTresorerie = useMemo(() => {
    return genererPrevisionsTresorerie(
      totalBalance,
      echeancesAutomatiques,
      90, // 90 jours
      new Date().toISOString().split('T')[0]
    );
  }, [totalBalance, echeancesAutomatiques]);

  // Détecter les alertes de liquidité
  const alertesLiquidite = useMemo(() => {
    const seuilMinimum = totalBalance * 0.1; // 10% du solde actuel comme seuil
    return detecterAlertesLiquidite(previsionsTresorerie, seuilMinimum, -500000);
  }, [previsionsTresorerie, totalBalance]);

  // Calculer les métriques
  const metriquesTresorerie = useMemo(() => {
    const seuilMinimum = totalBalance * 0.1;
    return calculerMetriquesTresorerie(previsionsTresorerie, seuilMinimum);
  }, [previsionsTresorerie, totalBalance]);

  // Planifier les besoins de financement
  const planFinancement = useMemo(() => {
    const seuilMinimum = totalBalance * 0.1;
    return planifierFinancement(previsionsTresorerie, seuilMinimum);
  }, [previsionsTresorerie, totalBalance]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <BanknotesIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t('accounting.treasury.title')}</h1>
              <p className="text-blue-100">{t('accounting.treasury.subtitle')}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">{t('accounting.treasury.global_balance')}</p>
            <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
          </div>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Solde Total */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">{t('accounting.treasury.stats.total_balance')}</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(totalBalance)}</p>
              <p className="text-xs text-slate-500 mt-1">{t('accounting.treasury.stats.active_accounts', { count: 3 })}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Cash-flow Net */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">{t('accounting.treasury.stats.net_cashflow')}</p>
              <p className={`text-2xl font-bold mt-2 ${netCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(netCashFlow)}
              </p>
              <p className="text-xs text-slate-500 mt-1">{t('accounting.treasury.stats.this_month')}</p>
            </div>
            <div className={`p-3 rounded-lg ${netCashFlow >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
              {netCashFlow >= 0 ? (
                <ArrowTrendingUpIcon className="h-6 w-6 text-emerald-600" />
              ) : (
                <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
        </div>

        {/* Entrées */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">{t('accounting.treasury.stats.inflows')}</p>
              <p className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(totalInflow)}</p>
              <p className="text-xs text-slate-500 mt-1">{t('accounting.treasury.stats.receipts')}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Sorties */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">{t('accounting.treasury.stats.outflows')}</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(totalOutflow)}</p>
              <p className="text-xs text-slate-500 mt-1">{t('accounting.treasury.stats.expenses')}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* En Attente */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">{t('accounting.treasury.stats.pending')}</p>
              <p className="text-2xl font-bold text-amber-600 mt-2">{formatCurrency(Math.abs(pendingAmount))}</p>
              <p className="text-xs text-slate-500 mt-1">{t('accounting.treasury.stats.transactions_count', { count: transactions.filter(t => t.status === 'pending').length })}</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Onglets Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-4 py-3 font-medium transition-colors text-center ${activeTab === 'overview'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <BanknotesIcon className="h-5 w-5 inline mr-2" />
            {t('accounting.treasury.tabs.overview')}
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`flex-1 px-4 py-3 font-medium transition-colors text-center ${activeTab === 'forecast'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <ChartBarIcon className="h-5 w-5 inline mr-2" />
            {t('accounting.treasury.tabs.forecast')}
          </button>
          <button
            onClick={() => {
              setActiveTab('reconciliation');
            }}
            className={`flex-1 px-4 py-3 font-medium transition-colors text-center ${activeTab === 'reconciliation'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <ArrowPathIcon className="h-5 w-5 inline mr-2" />
            {t('accounting.treasury.tabs.reconciliation')}
          </button>
          <button
            onClick={() => setActiveTab('liquidity')}
            className={`flex-1 px-4 py-3 font-medium transition-colors text-center ${activeTab === 'liquidity'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <DocumentTextIcon className="h-5 w-5 inline mr-2" />
            {t('accounting.treasury.tabs.liquidity')}
          </button>
          <button
            onClick={() => setActiveTab('checks')}
            className={`flex-1 px-4 py-3 font-medium transition-colors text-center ${activeTab === 'checks'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <CheckIcon className="h-5 w-5 inline mr-2" />
            {t('accounting.treasury.tabs.checks')}
          </button>
        </div>

        <div className="p-6">
          {/* Onglet Chèques */}
          {activeTab === 'checks' && (
            <ChecksManagement />
          )}

          {/* Onglet Aperçu */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Comptes Bancaires */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">{t('accounting.treasury.accounts.title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {visibleAccounts.map((account) => (
                    <div key={account.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-cyan-100 rounded">
                            <CreditCardIcon className="h-5 w-5 text-cyan-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{account.name}</p>
                            <p className="text-xs text-slate-500">{account.bank}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">{t('accounting.treasury.accounts.iban')}:</span>
                          <span className="font-mono text-xs text-slate-900">{account.iban.slice(0, 10)}...</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200">
                          <span className="text-slate-600">{t('accounting.treasury.accounts.balance')}:</span>
                          <span className="font-bold text-slate-900">{formatCurrency(account.balance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 text-xs">{t('accounting.treasury.accounts.last_updated')}:</span>
                          <span className="text-slate-500 text-xs">{account.lastUpdated}</span>
                        </div>
                      </div>
                      <button className="w-full mt-3 px-3 py-2 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 text-sm font-medium transition-colors">
                        <EyeIcon className="h-4 w-4 inline mr-1" />
                        {t('accounting.treasury.accounts.details')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions Récentes */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">{t('accounting.treasury.transactions.title')}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-slate-600 font-semibold">{t('accounting.treasury.transactions.date')}</th>
                        <th className="px-4 py-3 text-left text-slate-600 font-semibold">{t('accounting.treasury.transactions.description')}</th>
                        <th className="px-4 py-3 text-left text-slate-600 font-semibold">{t('accounting.treasury.transactions.amount')}</th>
                        <th className="px-4 py-3 text-left text-slate-600 font-semibold">{t('accounting.treasury.transactions.status')}</th>
                        <th className="px-4 py-3 text-left text-slate-600 font-semibold">{t('accounting.treasury.transactions.ref')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {visibleTransactions.slice(0, 6).map((txn) => (
                        <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-600">{txn.date}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <div className={`p-2 rounded ${txn.type === 'inflow' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                {txn.type === 'inflow' ? (
                                  <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                                )}
                              </div>
                              <span className="font-medium text-slate-900">{txn.description}</span>
                            </div>
                          </td>
                          <td className={`px-4 py-3 font-bold ${txn.type === 'inflow' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {txn.type === 'inflow' ? '+' : '-'}{formatCurrency(txn.amount)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-1">
                              {txn.status === 'cleared' && (
                                <span className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                  <CheckIcon className="h-3 w-3 mr-1" />
                                  {t('accounting.treasury.transactions.cleared')}
                                </span>
                              )}
                              {txn.status === 'pending' && (
                                <span className="inline-flex items-center px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                  <ClockIcon className="h-3 w-3 mr-1" />
                                  {t('accounting.treasury.transactions.pending')}
                                </span>
                              )}
                              {txn.status === 'reconciled' && (
                                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  <CheckIcon className="h-3 w-3 mr-1" />
                                  {t('accounting.treasury.transactions.reconciled')}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-mono text-xs">{txn.reference}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Prévisions */}
          {activeTab === 'forecast' && (
            <div className="space-y-6">
              <CashFlowForecast bankAccounts={visibleAccounts} transactions={visibleTransactions} />

              {/* Alertes de Liquidité */}
              {alertesLiquidite.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <BellIcon className="h-5 w-5 text-red-600" />
                      {t('accounting.treasury.alerts.title')}
                    </h3>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      {t('accounting.treasury.alerts.active_alerts', { count: alertesLiquidite.length })}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {alertesLiquidite.slice(0, 5).map((alerte) => (
                      <div
                        key={alerte.id}
                        className={`p-4 rounded-lg border-2 ${alerte.type === 'critique' ? 'bg-red-50 border-red-300' :
                          alerte.type === 'avertissement' ? 'bg-yellow-50 border-yellow-300' :
                            'bg-blue-50 border-blue-300'
                          }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {alerte.type === 'critique' && <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />}
                            <h4 className="font-semibold text-slate-900">{alerte.message}</h4>
                          </div>
                          <span className="text-xs text-slate-500">
                            {alerte.joursAvant > 0 ? t('accounting.treasury.alerts.in_days', { count: alerte.joursAvant }) : t('accounting.treasury.alerts.today')}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div>
                            <span className="text-slate-600">{t('accounting.treasury.alerts.projected_balance')}:</span>
                            <span className={`font-bold ml-2 ${alerte.soldeProjete < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                              {formatCurrency(alerte.soldeProjete)}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">{t('accounting.treasury.alerts.min_threshold')}:</span>
                            <span className="font-medium ml-2">{formatCurrency(alerte.seuilMinimum)}</span>
                          </div>
                        </div>
                        {alerte.recommandations.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-xs font-semibold text-slate-600 mb-1">{t('accounting.treasury.alerts.recommendations')}:</p>
                            <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                              {alerte.recommandations.slice(0, 3).map((rec, idx) => (
                                <li key={idx}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Métriques de Trésorerie */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('accounting.treasury.metrics.title')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium mb-1">{t('accounting.treasury.metrics.min_balance')}</p>
                    <p className="text-xl font-bold text-blue-900">{formatCurrency(metriquesTresorerie.soldeMinimum)}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-xs text-green-600 font-medium mb-1">{t('accounting.treasury.metrics.max_balance')}</p>
                    <p className="text-xl font-bold text-green-900">{formatCurrency(metriquesTresorerie.soldeMaximum)}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-xs text-purple-600 font-medium mb-1">{t('accounting.treasury.metrics.avg_balance')}</p>
                    <p className="text-xl font-bold text-purple-900">{formatCurrency(metriquesTresorerie.soldeMoyen)}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-xs text-red-600 font-medium mb-1">{t('accounting.treasury.metrics.days_under_threshold')}</p>
                    <p className="text-xl font-bold text-red-900">{t('accounting.treasury.funding.days_count', { count: metriquesTresorerie.joursSousSeuil })}</p>
                  </div>
                </div>

                {metriquesTresorerie.pointBas && (
                  <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm font-semibold text-amber-900 mb-1">{t('accounting.treasury.metrics.low_point')}</p>
                    <p className="text-sm text-amber-800">
                      {t('accounting.treasury.metrics.on_date', { 
                        amount: formatCurrency(metriquesTresorerie.pointBas.solde), 
                        date: new Date(metriquesTresorerie.pointBas.date).toLocaleDateString('fr-FR')
                      })}
                    </p>
                  </div>
                )}
              </Card>

              {/* Planification de Financement */}
              {planFinancement.besoins.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('accounting.treasury.funding.title')}</h3>
                  <div className="space-y-3">
                    {planFinancement.besoins.map((besoin, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-2 ${besoin.priorite === 'critique' ? 'bg-red-50 border-red-300' :
                          besoin.priorite === 'haute' ? 'bg-orange-50 border-orange-300' :
                            'bg-yellow-50 border-yellow-300'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-slate-900">
                            {t('accounting.treasury.funding.need_at', { date: new Date(besoin.date).toLocaleDateString('fr-FR') })}
                          </h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${besoin.priorite === 'critique' ? 'bg-red-200 text-red-800' :
                            besoin.priorite === 'haute' ? 'bg-orange-200 text-orange-800' :
                              'bg-yellow-200 text-yellow-800'
                            }`}>
                            {besoin.priorite}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600">{t('accounting.treasury.funding.amount')}:</span>
                            <span className="font-bold ml-2 text-slate-900">{formatCurrency(besoin.montant)}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">{t('accounting.treasury.funding.duration')}:</span>
                            <span className="font-medium ml-2">{t('accounting.treasury.funding.days_count', { count: besoin.duree })}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">{t('accounting.treasury.funding.total_needs')}:</span>
                            <span className="font-bold ml-2 text-slate-900">{formatCurrency(planFinancement.totalBesoins)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setIsScenarioModalOpen(true)}
                  className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                >
                  <CalculatorIcon className="h-5 w-5 mr-2" />
                  <span className="font-semibold">{t('accounting.treasury.actions.simulate_scenario')}</span>
                </button>
                <button
                  onClick={() => setIsEcheancesModalOpen(true)}
                  className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                >
                  <ClockIcon className="h-5 w-5 mr-2" />
                  <span className="font-semibold">{t('accounting.treasury.actions.manage_deadlines')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Onglet Rapprochement */}
          {/* {activeTab === 'reconciliation' && (
              <BankReconciliation bankAccounts={bankAccounts} transactions={transactions} />
            )} */}

          {/* Onglet Liquidités */}
          {/* {activeTab === 'liquidity' && (
              <LiquidityDashboard bankAccounts={bankAccounts} transactions={transactions} />
            )} */}
        </div>
      </div>

      {/* Modal Simulation de Scénario */}
      <Modal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        title="Simulation de Scénario de Trésorerie"
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              Simulez l'impact de différents scénarios sur votre trésorerie (variation CA, délais clients/fournisseurs, investissements).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Variation du CA (%)
              </label>
              <input
                type="number"
                defaultValue={0}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Ex: +10 ou -5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Variation Délai Clients (jours)
              </label>
              <input
                type="number"
                defaultValue={0}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Ex: +5 ou -10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Variation Délai Fournisseurs (jours)
              </label>
              <input
                type="number"
                defaultValue={0}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Ex: -5 ou +10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nouveaux Investissements (DZD)
              </label>
              <input
                type="number"
                defaultValue={0}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Ex: 1000000"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsScenarioModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:text-slate-800"
            >
              Annuler
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <SparklesIcon className="h-4 w-4 inline mr-2" />
              Lancer la Simulation
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Gestion des Échéances */}
      <Modal
        isOpen={isEcheancesModalOpen}
        onClose={() => setIsEcheancesModalOpen(false)}
        title="Gestion des Échéances de Trésorerie"
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-800">
              Gérez et planifiez vos échéances de trésorerie (encaissements et décaissements) pour optimiser votre cash flow.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Libellé</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Catégorie</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {echeancesAutomatiques.slice(0, 10).map((echeance) => (
                  <tr key={echeance.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">{new Date(echeance.date).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{echeance.libelle}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${echeance.type === 'encaissement' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {echeance.type === 'encaissement' ? 'Entrée' : 'Sortie'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{echeance.categorie}</td>
                    <td className={`px-4 py-3 text-sm text-right font-semibold ${echeance.type === 'encaissement' ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {echeance.type === 'encaissement' ? '+' : '-'}{formatCurrency(echeance.montant)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${echeance.statut === 'confirme' ? 'bg-blue-100 text-blue-800' :
                        echeance.statut === 'probable' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {echeance.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setIsEcheancesModalOpen(false)}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tresorerie;



