import React, { useState } from 'react';
import { useTranslation } from '@shared/hooks/useTranslation';
import {
  BookOpenIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  CalculatorIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import { useApp } from '@core/context/AppContext';

import apiClient from '@/services/apiClient';

const PlanComptable: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

  const [chartOfAccounts, setChartOfAccounts] = useState<any[]>([]);
  const [stats, setStats] = useState({ assets: 0, liabilities: 0, products: 0, charges: 0 });
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadCOA = async () => {
      try {
        setLoading(true);
        const coaRes = await apiClient.get('/accounting/chart-of-accounts');
        const coa = coaRes.data || [];

        const journalRes = await apiClient.get('/accounting/journal-entries');
        const entries = journalRes.data || [];

        const balances: Record<string, number> = {};
        entries.forEach((entry: any) => {
          if (entry.status === 'approved' || entry.status === 'validated' || entry.status === 'draft') {
            (entry.lines || []).forEach((line: any) => {
              const code = line.account_code;
              const debit = Number(line.debit_amount || 0);
              const credit = Number(line.credit_amount || 0);
              balances[code] = (balances[code] || 0) + (debit - credit);
            });
          }
        });

        const grouped: Record<string, any> = {};
        coa.forEach((acc: any) => {
          const type = acc.account_type;
          const mainCode = acc.account_code.substring(0, 2);
          if (!grouped[mainCode]) {
            grouped[mainCode] = {
              id: acc.id,
              code: mainCode,
              name: acc.account_name,
              type: t(`accounting.ledger.types.${type.toLowerCase()}`) || type,
              subAccounts: []
            };
          }
          grouped[mainCode].subAccounts.push({
            code: acc.account_code,
            name: acc.account_name,
            balance: balances[acc.account_code] || 0
          });
        });

        setChartOfAccounts(Object.values(grouped));

        let assets = 0, liabilities = 0, products = 0, charges = 0;
        coa.forEach((acc: any) => {
          const bal = balances[acc.account_code] || 0;
          const type = acc.account_type.toLowerCase();
          if (type === 'actif') assets += bal;
          else if (type === 'passif') liabilities += Math.abs(bal);
          else if (type === 'produit') products += Math.abs(bal);
          else if (type === 'charge') charges += bal;
        });

        setStats({ assets, liabilities, products, charges });
      } catch (err) {
        console.error("Failed to load plan comptable", err);
      } finally {
        setLoading(false);
      }
    };
    loadCOA();
  }, [t]);

  const statistics = [
    {
      title: t('accounting.ledger.stats.total_assets'),
      value: formatCurrency(stats.assets),
      change: '+3.5%',
      icon: BuildingOfficeIcon,
      color: 'green'
    },
    {
      title: t('accounting.ledger.stats.total_liabilities'),
      value: formatCurrency(stats.liabilities),
      change: '+1.2%',
      icon: BanknotesIcon,
      color: 'red'
    },
    {
      title: t('accounting.ledger.stats.total_products'),
      value: formatCurrency(stats.products),
      change: '+8.4%',
      icon: ArrowTrendingUpIcon,
      color: 'blue'
    },
    {
      title: t('accounting.ledger.stats.total_charges'),
      value: formatCurrency(stats.charges),
      change: '-2.1%',
      icon: ArrowTrendingDownIcon,
      color: 'orange'
    }
  ];

  const filteredAccounts = chartOfAccounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.code.includes(searchTerm) ||
                         account.subAccounts.some(sub =>
                           sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sub.code.includes(searchTerm)
                         );
    const matchesCategory = selectedCategory === 'all' || account.type === t(`accounting.ledger.types.${selectedCategory}`);
    return matchesSearch && matchesCategory;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case t('accounting.ledger.types.actif'): return 'text-green-600 bg-green-50 border-green-200';
      case t('accounting.ledger.types.passif'): return 'text-red-600 bg-red-50 border-red-200';
      case t('accounting.ledger.types.produit'): return 'text-blue-600 bg-blue-50 border-blue-200';
      case t('accounting.ledger.types.charge'): return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('accounting.ledger.title')}</h1>
          <p className="text-gray-600">{t('accounting.ledger.subtitle')}</p>
        </div>
        <button
          onClick={() => setIsAddAccountModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>{t('accounting.ledger.actions.new_account')}</span>
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statistics.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className="text-sm font-medium text-green-600">
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filtres */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder={t('accounting.ledger.filters.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('accounting.ledger.filters.all_types')}</option>
              <option value="actif">{t('accounting.ledger.types.actif')}</option>
              <option value="passif">{t('accounting.ledger.types.passif')}</option>
              <option value="produit">{t('accounting.ledger.types.produit')}</option>
              <option value="charge">{t('accounting.ledger.types.charge')}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Plan comptable */}
      <div className="space-y-4">
        {filteredAccounts.map((account) => (
          <Card key={account.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(account.type)}`}>
                  {account.type}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{account.code} - {account.name}</h3>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {account.subAccounts.map((subAccount) => (
                <div key={subAccount.code} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{subAccount.code}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{subAccount.name}</h4>
                  <div className="text-sm font-bold text-gray-900">{formatCurrency(subAccount.balance)}</div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isAddAccountModalOpen}
        onClose={() => setIsAddAccountModalOpen(false)}
        title={t('accounting.ledger.modal.add_title')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('accounting.ledger.modal.code_label')}</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={t('accounting.ledger.modal.code_placeholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('accounting.ledger.modal.name_label')}</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={t('accounting.ledger.modal.name_placeholder')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('accounting.ledger.modal.type_label')}</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="actif">{t('accounting.ledger.types.actif')}</option>
              <option value="passif">{t('accounting.ledger.types.passif')}</option>
              <option value="produit">{t('accounting.ledger.types.produit')}</option>
              <option value="charge">{t('accounting.ledger.types.charge')}</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsAddAccountModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              {t('accounting.ledger.actions.cancel')}
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {t('accounting.ledger.actions.create_account')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PlanComptable;
