import React, { useState } from 'react';
import { useTranslation } from '@shared/hooks/useTranslation';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import { useApp } from '@core/context/AppContext';
import { usePermission } from '@shared/hooks/usePermission';

import apiClient from '@/services/apiClient';

// Types réellement stockés côté backend (scf_chart_of_accounts.py) — les
// libellés affichés sont traduits, mais la comparaison logique doit se
// faire sur CES valeurs, pas sur des libellés français en dur.
const ACCOUNT_TYPES = ['asset', 'liability', 'equity', 'revenue', 'expense', 'contra_asset', 'mixed'] as const;
type AccountType = typeof ACCOUNT_TYPES[number];

const CLASS_NAMES: Record<number, string> = {
  1: 'ledger.classes.class1',
  2: 'ledger.classes.class2',
  3: 'ledger.classes.class3',
  4: 'ledger.classes.class4',
  5: 'ledger.classes.class5',
  6: 'ledger.classes.class6',
  7: 'ledger.classes.class7',
};

interface SubAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  balance: number;
}

interface AccountGroup {
  classNumber: number;
  name: string;
  subAccounts: SubAccount[];
}

const PlanComptable: React.FC = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useApp();
  const { has } = usePermission();
  const canManage = has('comptabilite-write');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | AccountType>('all');

  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SubAccount | null>(null);
  const [newAccount, setNewAccount] = useState({ account_code: '', account_name: '', account_class: 1, account_type: 'asset' as AccountType });
  const [formError, setFormError] = useState<string | null>(null);

  const [rawAccounts, setRawAccounts] = useState<any[]>([]);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const loadCOA = async () => {
    try {
      setLoading(true);
      const [coaRes, journalRes] = await Promise.all([
        apiClient.get<any[]>('/accounting/chart-of-accounts'),
        apiClient.get<any[]>('/accounting/journal-entries?limit=1000')
      ]);
      setRawAccounts(coaRes.data || []);

      const newBalances: Record<string, number> = {};
      (journalRes.data || []).forEach((entry: any) => {
        if (entry.status === 'approved' || entry.status === 'validated') {
          (entry.lines || []).forEach((line: any) => {
            const code = line.account_code;
            const debit = Number(line.debit_amount || 0);
            const credit = Number(line.credit_amount || 0);
            newBalances[code] = (newBalances[code] || 0) + (debit - credit);
          });
        }
      });
      setBalances(newBalances);
    } catch (err) {
      console.error('Failed to load plan comptable', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadCOA();
  }, []);

  // Groupement par CLASSE SCF réelle (1-7), pas par un découpage arbitraire
  // du code — un compte 2813000 (amortissement) et 218000 (immobilisation)
  // sont tous deux en classe 2 même si leurs 2 premiers chiffres diffèrent.
  const groups: AccountGroup[] = React.useMemo(() => {
    const byClass: Record<number, AccountGroup> = {};
    rawAccounts.forEach((acc: any) => {
      const cls = acc.account_class as number;
      if (!byClass[cls]) {
        byClass[cls] = { classNumber: cls, name: t(CLASS_NAMES[cls] || '') || `Classe ${cls}`, subAccounts: [] };
      }
      byClass[cls].subAccounts.push({
        id: acc.id,
        code: acc.account_code,
        name: acc.account_name,
        type: acc.account_type,
        balance: balances[acc.account_code] || 0
      });
    });
    return Object.values(byClass).sort((a, b) => a.classNumber - b.classNumber);
  }, [rawAccounts, balances, t]);

  // Statistiques réelles : les comptes de contre-actif (amortissements)
  // viennent en déduction de l'actif, pas en addition — sinon l'actif net
  // est surestimé du montant cumulé des amortissements.
  const stats = React.useMemo(() => {
    let assets = 0, liabilities = 0, products = 0, charges = 0;
    rawAccounts.forEach((acc: any) => {
      const bal = balances[acc.account_code] || 0;
      switch (acc.account_type as AccountType) {
        case 'asset': assets += bal; break;
        case 'contra_asset': assets -= Math.abs(bal); break;
        case 'liability': liabilities += Math.abs(bal); break;
        case 'equity': liabilities += Math.abs(bal); break;
        case 'revenue': products += Math.abs(bal); break;
        case 'expense': charges += bal; break;
        default: break; // mixed : ambigu, non agrégé dans les totaux
      }
    });
    return { assets, liabilities, products, charges };
  }, [rawAccounts, balances]);

  const typeLabel = (type: AccountType) => t(`ledger.types.${type}`, { defaultValue: type });

  const typeColor = (type: AccountType) => {
    switch (type) {
      case 'asset': return 'text-green-600 bg-green-50 border-green-200';
      case 'contra_asset': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'liability': return 'text-red-600 bg-red-50 border-red-200';
      case 'equity': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'revenue': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'expense': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const statistics = [
    { title: t('ledger.stats.total_assets'), value: formatCurrency(stats.assets), icon: BuildingOfficeIcon, color: 'green' },
    { title: t('ledger.stats.total_liabilities'), value: formatCurrency(stats.liabilities), icon: BanknotesIcon, color: 'red' },
    { title: t('ledger.stats.total_products'), value: formatCurrency(stats.products), icon: ArrowTrendingUpIcon, color: 'blue' },
    { title: t('ledger.stats.total_charges'), value: formatCurrency(stats.charges), icon: ArrowTrendingDownIcon, color: 'orange' }
  ];

  const filteredGroups = groups
    .map(g => ({
      ...g,
      subAccounts: g.subAccounts.filter(sa => {
        const matchesSearch = sa.name.toLowerCase().includes(searchTerm.toLowerCase()) || sa.code.includes(searchTerm);
        const matchesType = selectedType === 'all' || sa.type === selectedType;
        return matchesSearch && matchesType;
      })
    }))
    .filter(g => g.subAccounts.length > 0);

  // Validation client-side miroir de la règle serveur : le 1er chiffre du
  // code doit correspondre à la classe déclarée.
  const codeClassMismatch = (code: string, cls: number) => code.length > 0 && Number(code[0]) !== cls;

  const openCreateModal = () => {
    setEditingAccount(null);
    setNewAccount({ account_code: '', account_name: '', account_class: 1, account_type: 'asset' });
    setFormError(null);
    setIsAddAccountModalOpen(true);
  };

  const openEditModal = (sub: SubAccount, classNumber: number) => {
    setEditingAccount(sub);
    setNewAccount({ account_code: sub.code, account_name: sub.name, account_class: classNumber, account_type: sub.type });
    setFormError(null);
    setIsAddAccountModalOpen(true);
  };

  const handleSaveAccount = async () => {
    setFormError(null);
    if (!newAccount.account_code || !newAccount.account_name) {
      setFormError(t('ledger.modal.validation_error', { defaultValue: 'Code et nom requis' }));
      return;
    }
    if (codeClassMismatch(newAccount.account_code, newAccount.account_class)) {
      setFormError(t('ledger.modal.class_mismatch_error', {
        defaultValue: `Le code doit commencer par ${newAccount.account_class} pour la classe sélectionnée.`
      }));
      return;
    }
    try {
      if (editingAccount) {
        // account_code n'est jamais modifiable (les écritures y font
        // référence par valeur) — seuls nom/classe/type le sont.
        await apiClient.put(`/accounting/chart-of-accounts/${editingAccount.id}`, {
          account_name: newAccount.account_name,
          account_class: newAccount.account_class,
          account_type: newAccount.account_type
        });
      } else {
        await apiClient.post('/accounting/chart-of-accounts', {
          account_code: newAccount.account_code,
          account_name: newAccount.account_name,
          account_class: newAccount.account_class,
          account_type: newAccount.account_type
        });
      }
      setIsAddAccountModalOpen(false);
      await loadCOA();
    } catch (err: any) {
      setFormError(err?.response?.data?.detail || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm(t('common.confirm_delete', { defaultValue: 'Confirmer la suppression ?' }))) return;
    try {
      await apiClient.delete(`/accounting/chart-of-accounts/${accountId}`);
      await loadCOA();
    } catch (err: any) {
      // Le backend refuse (409) la suppression d'un compte mouvementé —
      // affichage du message serveur plutôt qu'un échec silencieux.
      alert(err?.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('ledger.title')}</h1>
          <p className="text-gray-600">{t('ledger.subtitle')}</p>
        </div>
        {canManage && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>{t('ledger.actions.new_account')}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statistics.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
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

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder={t('ledger.filters.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'all' | AccountType)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{t('ledger.filters.all_types')}</option>
              {ACCOUNT_TYPES.map(ty => (
                <option key={ty} value={ty}>{typeLabel(ty)}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {loading ? (
        <p className="text-gray-500">{t('common.loading', { defaultValue: 'Chargement...' })}</p>
      ) : (
        <div className="space-y-4">
          {filteredGroups.map((group) => (
            <Card key={group.classNumber} className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="px-3 py-1 rounded-full text-sm font-medium border text-slate-700 bg-slate-50 border-slate-200">
                  {t('ledger.class_prefix', { defaultValue: 'Classe' })} {group.classNumber}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.subAccounts.map((sub) => (
                  <div key={sub.code} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{sub.code}</span>
                      {canManage && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditModal(sub, group.classNumber)} className="p-1 text-blue-500 hover:bg-blue-50 rounded" title={t('common.edit', { defaultValue: 'Modifier' })}>
                            <PencilIcon className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDeleteAccount(sub.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title={t('common.delete')}>
                            <TrashIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">{sub.name}</h4>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mb-1 ${typeColor(sub.type)}`}>
                      {typeLabel(sub.type)}
                    </span>
                    <div className="text-sm font-bold text-gray-900">{formatCurrency(sub.balance)}</div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isAddAccountModalOpen}
        onClose={() => setIsAddAccountModalOpen(false)}
        title={editingAccount ? t('ledger.modal.edit_title', { defaultValue: 'Modifier le compte' }) : t('ledger.modal.add_title')}
      >
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">{formError}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('ledger.modal.code_label')}</label>
            <input
              type="text"
              value={newAccount.account_code}
              disabled={!!editingAccount}
              onChange={(e) => setNewAccount({ ...newAccount, account_code: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
              placeholder={t('ledger.modal.code_placeholder')}
            />
            {editingAccount && (
              <p className="text-xs text-gray-400 mt-1">
                {t('ledger.modal.code_immutable', { defaultValue: "Le code n'est pas modifiable : des écritures peuvent y faire référence." })}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('ledger.modal.name_label')}</label>
            <input
              type="text"
              value={newAccount.account_name}
              onChange={(e) => setNewAccount({ ...newAccount, account_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={t('ledger.modal.name_placeholder')}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('ledger.modal.class_label', { defaultValue: 'Classe SCF' })}</label>
              <select
                value={newAccount.account_class}
                onChange={(e) => setNewAccount({ ...newAccount, account_class: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7].map(c => (
                  <option key={c} value={c}>{c} — {t(CLASS_NAMES[c])}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('ledger.modal.type_label')}</label>
              <select
                value={newAccount.account_type}
                onChange={(e) => setNewAccount({ ...newAccount, account_type: e.target.value as AccountType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {ACCOUNT_TYPES.map(ty => (
                  <option key={ty} value={ty}>{typeLabel(ty)}</option>
                ))}
              </select>
            </div>
          </div>
          {codeClassMismatch(newAccount.account_code, newAccount.account_class) && (
            <p className="text-xs text-amber-600">
              {t('ledger.modal.class_mismatch_warning', { defaultValue: `Le code doit commencer par ${newAccount.account_class}.` })}
            </p>
          )}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsAddAccountModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              {t('ledger.actions.cancel')}
            </button>
            <button onClick={handleSaveAccount} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {editingAccount ? t('common.save', { defaultValue: 'Enregistrer' }) : t('ledger.actions.create_account')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PlanComptable;
