import React, { useState, useMemo } from 'react';
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  CalendarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@core/context/ThemeContext';
import { useApp } from '@core/context/AppContext';

interface EcritureComptable {
  id: string;
  date: string;
  numero: string;
  compte: string;
  libelle: string;
  debit: number;
  credit: number;
  solde: number;
  piece: string;
  journal: string;
}

interface GrandLivreWidgetProps {
  data: EcritureComptable[];
  period: string;
  selectedAccount?: string;
}

const GrandLivreWidget: React.FC<GrandLivreWidgetProps> = ({ data, period, selectedAccount }) => {
  const { currentTheme } = useTheme();
  const { formatCurrency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJournal, setSelectedJournal] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState<'date' | 'compte' | 'montant'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  // Filtrage et tri des données
  const filteredData = useMemo(() => {
    let filtered = data.filter(entry => {
      const matchesSearch = entry.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.compte.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.numero.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesJournal = !selectedJournal || entry.journal === selectedJournal;
      
      const matchesDateRange = (!dateRange.start || entry.date >= dateRange.start) &&
                              (!dateRange.end || entry.date <= dateRange.end);
      
      const matchesAccount = !selectedAccount || entry.compte === selectedAccount;
      
      return matchesSearch && matchesJournal && matchesDateRange && matchesAccount;
    });

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'compte':
          comparison = a.compte.localeCompare(b.compte);
          break;
        case 'montant':
          comparison = Math.abs(a.debit + a.credit) - Math.abs(b.debit + b.credit);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [data, searchTerm, selectedJournal, dateRange, selectedAccount, sortBy, sortOrder]);

  // Statistiques
  const stats = useMemo(() => {
    const totalDebit = filteredData.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredit = filteredData.reduce((sum, entry) => sum + entry.credit, 0);
    const totalEntries = filteredData.length;
    const uniqueAccounts = new Set(filteredData.map(entry => entry.compte)).size;
    const uniqueJournals = new Set(filteredData.map(entry => entry.journal)).size;
    
    return {
      totalDebit,
      totalCredit,
      totalEntries,
      uniqueAccounts,
      uniqueJournals,
      balance: totalDebit - totalCredit
    };
  }, [filteredData]);

  // Liste des journaux uniques
  const journals = useMemo(() => {
    return Array.from(new Set(data.map(entry => entry.journal))).sort();
  }, [data]);

  // Liste des comptes uniques
  const accounts = useMemo(() => {
    return Array.from(new Set(data.map(entry => entry.compte))).sort();
  }, [data]);

  const toggleEntryExpansion = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedJournal('');
    setDateRange({ start: '', end: '' });
    setSortBy('date');
    setSortOrder('asc');
  };

  const getAccountType = (account: string) => {
    const firstDigit = account.charAt(0);
    switch (firstDigit) {
      case '1': return { type: 'Immobilisations', color: 'blue' };
      case '2': return { type: 'Stocks', color: 'green' };
      case '3': return { type: 'Tiers', color: 'purple' };
      case '4': return { type: 'Tiers', color: 'purple' };
      case '5': return { type: 'Financier', color: 'amber' };
      case '6': return { type: 'Charges', color: 'red' };
      case '7': return { type: 'Produits', color: 'emerald' };
      case '8': return { type: 'Résultat', color: 'slate' };
      default: return { type: 'Autre', color: 'gray' };
    }
  };

  const getAccountTypeColor = (account: string) => {
    const { color } = getAccountType(account);
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      amber: 'bg-amber-100 text-amber-800',
      red: 'bg-red-100 text-red-800',
      emerald: 'bg-emerald-100 text-emerald-800',
      slate: 'bg-slate-100 text-slate-800',
      gray: 'bg-gray-100 text-gray-800'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* En-tête du widget */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-600 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Grand Livre</h3>
              <p className="text-sm text-slate-600">
                {selectedAccount ? `Compte ${selectedAccount}` : 'Tous les comptes'} - Période {period}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors">
              <EyeIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors">
              <DocumentArrowDownIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors">
              <PrinterIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="bg-slate-50 border-b border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            {/* Journal */}
            <select
              value={selectedJournal}
              onChange={(e) => setSelectedJournal(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            >
              <option value="">Tous les journaux</option>
              {journals.map(journal => (
                <option key={journal} value={journal}>{journal}</option>
              ))}
            </select>

            {/* Date de début */}
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />

            {/* Date de fin */}
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              >
                <option value="date">Trier par date</option>
                <option value="compte">Trier par compte</option>
                <option value="montant">Trier par montant</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowPathIcon className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                <span>{sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}</span>
              </button>
            </div>

            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Effacer les filtres</span>
            </button>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="bg-slate-50 border-b border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{stats.totalEntries}</p>
            <p className="text-sm text-slate-600">Écritures</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{stats.uniqueAccounts}</p>
            <p className="text-sm text-slate-600">Comptes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{stats.uniqueJournals}</p>
            <p className="text-sm text-slate-600">Journaux</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalDebit)}</p>
            <p className="text-sm text-slate-600">Total Débit</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalCredit)}</p>
            <p className="text-sm text-slate-600">Total Crédit</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(stats.balance)}
            </p>
            <p className="text-sm text-slate-600">Solde</p>
          </div>
        </div>
      </div>

      {/* Tableau des écritures */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° Pièce
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Compte
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Libellé
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Journal
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Débit
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Crédit
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Solde
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((entry) => {
              const accountType = getAccountType(entry.compte);
              const isExpanded = expandedEntries.has(entry.id);
              
              return (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(entry.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.numero}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{entry.compte}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getAccountTypeColor(entry.compte)}`}>
                        {accountType.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {entry.libelle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.journal}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {entry.debit > 0 && (
                      <span className="text-emerald-600 font-medium">
                        {formatCurrency(entry.debit)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {entry.credit > 0 && (
                      <span className="text-red-600 font-medium">
                        {formatCurrency(entry.credit)}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`font-medium ${entry.solde >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(entry.solde)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => toggleEntryExpansion(entry.id)}
                      className="text-slate-600 hover:text-slate-800 transition-colors"
                    >
                      {isExpanded ? (
                        <MinusIcon className="h-4 w-4" />
                      ) : (
                        <PlusIcon className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination et informations */}
      <div className="bg-slate-50 border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Affichage de {filteredData.length} écriture(s) sur {data.length} total
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              Précédent
            </button>
            <span className="px-3 py-1 text-sm text-slate-600">Page 1</span>
            <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Équilibre des écritures */}
      {stats.balance !== 0 && (
        <div className="bg-amber-50 border-t border-amber-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Déséquilibre détecté</p>
              <p className="text-sm text-amber-700">
                La différence entre le total débit et crédit est de {formatCurrency(Math.abs(stats.balance))}.
                Vérifiez les écritures pour corriger l'erreur.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Équilibre correct */}
      {stats.balance === 0 && filteredData.length > 0 && (
        <div className="bg-emerald-50 border-t border-emerald-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-800">Écritures équilibrées</p>
              <p className="text-sm text-emerald-700">
                Le total débit ({formatCurrency(stats.totalDebit)}) est égal au total crédit ({formatCurrency(stats.totalCredit)}).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrandLivreWidget;


