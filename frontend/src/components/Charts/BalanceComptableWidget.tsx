import React, { useState, useMemo } from 'react';
import {
  CalculatorIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';

interface SoldeCompte {
  compte: string;
  libelle: string;
  solde_debut: number;
  debit: number;
  credit: number;
  solde_fin: number;
  type: 'actif' | 'passif' | 'charge' | 'produit';
  classe: string;
}

interface BalanceComptableWidgetProps {
  data: SoldeCompte[];
  period: string;
  previousData?: SoldeCompte[];
}

const BalanceComptableWidget: React.FC<BalanceComptableWidgetProps> = ({ data, period, previousData }) => {
  const { currentTheme } = useTheme();
  const { formatCurrency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'actif' | 'passif' | 'charge' | 'produit'>('all');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [sortBy, setSortBy] = useState<'compte' | 'solde' | 'mouvement'>('compte');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState<'balance' | 'analyse' | 'graphiques'>('balance');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['actif', 'passif']));

  // Filtrage et tri des données
  const filteredData = useMemo(() => {
    let filtered = data.filter(entry => {
      const matchesSearch = entry.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           entry.compte.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === 'all' || entry.type === selectedType;
      const matchesClasse = !selectedClasse || entry.classe === selectedClasse;
      
      return matchesSearch && matchesType && matchesClasse;
    });

    // Tri
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'compte':
          comparison = a.compte.localeCompare(b.compte);
          break;
        case 'solde':
          comparison = Math.abs(a.solde_fin) - Math.abs(b.solde_fin);
          break;
        case 'mouvement':
          comparison = (a.debit + a.credit) - (b.debit + b.credit);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [data, searchTerm, selectedType, selectedClasse, sortBy, sortOrder]);

  // Statistiques globales
  const stats = useMemo(() => {
    const totalActif = filteredData
      .filter(entry => entry.type === 'actif')
      .reduce((sum, entry) => sum + Math.abs(entry.solde_fin), 0);
    
    const totalPassif = filteredData
      .filter(entry => entry.type === 'passif')
      .reduce((sum, entry) => sum + Math.abs(entry.solde_fin), 0);
    
    const totalCharges = filteredData
      .filter(entry => entry.type === 'charge')
      .reduce((sum, entry) => sum + Math.abs(entry.solde_fin), 0);
    
    const totalProduits = filteredData
      .filter(entry => entry.type === 'produit')
      .reduce((sum, entry) => sum + Math.abs(entry.solde_fin), 0);
    
    const totalDebit = filteredData.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredit = filteredData.reduce((sum, entry) => sum + entry.credit, 0);
    
    return {
      totalActif,
      totalPassif,
      totalCharges,
      totalProduits,
      totalDebit,
      totalCredit,
      balance: totalActif - totalPassif,
      resultat: totalProduits - totalCharges
    };
  }, [filteredData]);

  // Données par type
  const dataByType = useMemo(() => {
    const types = ['actif', 'passif', 'charge', 'produit'] as const;
    return types.reduce((acc, type) => {
      acc[type] = filteredData.filter(entry => entry.type === type);
      return acc;
    }, {} as Record<typeof types[number], SoldeCompte[]>);
  }, [filteredData]);

  // Classes uniques
  const classes = useMemo(() => {
    return Array.from(new Set(data.map(entry => entry.classe))).sort();
  }, [data]);

  // Données pour les graphiques
  const repartitionParTypeData = {
    labels: ['Actif', 'Passif', 'Charges', 'Produits'],
    datasets: [{
      data: [stats.totalActif, stats.totalPassif, stats.totalCharges, stats.totalProduits],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ],
      borderColor: [
        'rgba(16, 185, 129, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(139, 92, 246, 1)'
      ],
      borderWidth: 2
    }]
  };

  const topComptesData = {
    labels: filteredData
      .sort((a, b) => Math.abs(b.solde_fin) - Math.abs(a.solde_fin))
      .slice(0, 10)
      .map(entry => entry.compte),
    datasets: [{
      label: 'Soldes',
      data: filteredData
        .sort((a, b) => Math.abs(b.solde_fin) - Math.abs(a.solde_fin))
        .slice(0, 10)
        .map(entry => Math.abs(entry.solde_fin)),
      backgroundColor: 'rgba(51, 65, 85, 0.8)',
      borderColor: 'rgba(51, 65, 85, 1)',
      borderWidth: 2
    }]
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedClasse('');
    setSortBy('compte');
    setSortOrder('asc');
  };

  const getTypeColor = (type: string) => {
    const colors = {
      actif: 'bg-emerald-100 text-emerald-800',
      passif: 'bg-blue-100 text-blue-800',
      charge: 'bg-red-100 text-red-800',
      produit: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      actif: ArrowTrendingUpIcon,
      passif: ArrowTrendingDownIcon,
      charge: MinusIcon,
      produit: PlusIcon
    };
    return icons[type as keyof typeof icons] || InformationCircleIcon;
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const renderBalanceTable = () => (
    <div className="space-y-6">
      {/* Actif */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('actif')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-600" />
            <span className="font-medium text-slate-800">ACTIF</span>
            <span className="text-sm text-slate-600">({dataByType.actif.length} comptes)</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-bold text-emerald-600">{formatCurrency(stats.totalActif)}</span>
            <ArrowTrendingUpIcon className={`h-4 w-4 text-slate-400 transition-transform ${
              expandedSections.has('actif') ? 'rotate-180' : ''
            }`} />
          </div>
        </button>
        {expandedSections.has('actif') && (
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-emerald-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase">Compte</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-emerald-800 uppercase">Libellé</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-emerald-800 uppercase">Solde Début</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-emerald-800 uppercase">Débit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-emerald-800 uppercase">Crédit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-emerald-800 uppercase">Solde Fin</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dataByType.actif.map((entry) => (
                    <tr key={entry.compte} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.compte}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{entry.libelle}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCurrency(entry.solde_debut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-emerald-600">
                        {entry.debit > 0 && formatCurrency(entry.debit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                        {entry.credit > 0 && formatCurrency(entry.credit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-emerald-600">
                        {formatCurrency(entry.solde_fin)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Passif */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('passif')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <ArrowTrendingDownIcon className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-slate-800">PASSIF</span>
            <span className="text-sm text-slate-600">({dataByType.passif.length} comptes)</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-bold text-blue-600">{formatCurrency(stats.totalPassif)}</span>
            <ArrowTrendingUpIcon className={`h-4 w-4 text-slate-400 transition-transform ${
              expandedSections.has('passif') ? 'rotate-180' : ''
            }`} />
          </div>
        </button>
        {expandedSections.has('passif') && (
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase">Compte</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase">Libellé</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase">Solde Début</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase">Débit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase">Crédit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase">Solde Fin</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dataByType.passif.map((entry) => (
                    <tr key={entry.compte} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.compte}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{entry.libelle}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCurrency(entry.solde_debut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-emerald-600">
                        {entry.debit > 0 && formatCurrency(entry.debit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                        {entry.credit > 0 && formatCurrency(entry.credit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-blue-600">
                        {formatCurrency(entry.solde_fin)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Charges */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('charge')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <MinusIcon className="h-5 w-5 text-red-600" />
            <span className="font-medium text-slate-800">CHARGES</span>
            <span className="text-sm text-slate-600">({dataByType.charge.length} comptes)</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-bold text-red-600">{formatCurrency(stats.totalCharges)}</span>
            <ArrowTrendingUpIcon className={`h-4 w-4 text-slate-400 transition-transform ${
              expandedSections.has('charge') ? 'rotate-180' : ''
            }`} />
          </div>
        </button>
        {expandedSections.has('charge') && (
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-red-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Compte</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-800 uppercase">Libellé</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-red-800 uppercase">Solde Début</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-red-800 uppercase">Débit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-red-800 uppercase">Crédit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-red-800 uppercase">Solde Fin</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dataByType.charge.map((entry) => (
                    <tr key={entry.compte} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.compte}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{entry.libelle}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCurrency(entry.solde_debut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-emerald-600">
                        {entry.debit > 0 && formatCurrency(entry.debit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                        {entry.credit > 0 && formatCurrency(entry.credit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                        {formatCurrency(entry.solde_fin)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Produits */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('produit')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <PlusIcon className="h-5 w-5 text-purple-600" />
            <span className="font-medium text-slate-800">PRODUITS</span>
            <span className="text-sm text-slate-600">({dataByType.produit.length} comptes)</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-bold text-purple-600">{formatCurrency(stats.totalProduits)}</span>
            <ArrowTrendingUpIcon className={`h-4 w-4 text-slate-400 transition-transform ${
              expandedSections.has('produit') ? 'rotate-180' : ''
            }`} />
          </div>
        </button>
        {expandedSections.has('produit') && (
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase">Compte</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-800 uppercase">Libellé</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-purple-800 uppercase">Solde Début</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-purple-800 uppercase">Débit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-purple-800 uppercase">Crédit</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-purple-800 uppercase">Solde Fin</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dataByType.produit.map((entry) => (
                    <tr key={entry.compte} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.compte}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{entry.libelle}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCurrency(entry.solde_debut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-emerald-600">
                        {entry.debit > 0 && formatCurrency(entry.debit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                        {entry.credit > 0 && formatCurrency(entry.credit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-purple-600">
                        {formatCurrency(entry.solde_fin)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* En-tête du widget */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-amber-600 rounded-lg">
              <CalculatorIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-800">Balance Comptable</h3>
              <p className="text-sm text-amber-600">Période {period}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-200 rounded-lg transition-colors"
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-200 rounded-lg transition-colors">
              <EyeIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-200 rounded-lg transition-colors">
              <DocumentArrowDownIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-200 rounded-lg transition-colors">
              <PrinterIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation par vues */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'balance', label: 'BALANCE', icon: CalculatorIcon },
            { id: 'analyse', label: 'ANALYSE', icon: ChartBarIcon },
            { id: 'graphiques', label: 'GRAPHIQUES', icon: ChartBarIcon }
          ].map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === view.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{view.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="bg-amber-50 border-b border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Recherche */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Type */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="actif">Actif</option>
              <option value="passif">Passif</option>
              <option value="charge">Charges</option>
              <option value="produit">Produits</option>
            </select>

            {/* Classe */}
            <select
              value={selectedClasse}
              onChange={(e) => setSelectedClasse(e.target.value)}
              className="px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Toutes les classes</option>
              {classes.map(classe => (
                <option key={classe} value={classe}>{classe}</option>
              ))}
            </select>

            {/* Tri */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="compte">Trier par compte</option>
              <option value="solde">Trier par solde</option>
              <option value="mouvement">Trier par mouvement</option>
            </select>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center space-x-2 px-3 py-2 border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <ArrowTrendingUpIcon className={`h-4 w-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                <span>{sortOrder === 'asc' ? 'Croissant' : 'Décroissant'}</span>
              </button>
            </div>

            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-3 py-2 text-amber-600 hover:text-amber-800 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Effacer les filtres</span>
            </button>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="bg-amber-50 border-b border-gray-200 p-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-800">{filteredData.length}</p>
            <p className="text-sm text-amber-600">Comptes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalActif)}</p>
            <p className="text-sm text-amber-600">Total Actif</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalPassif)}</p>
            <p className="text-sm text-amber-600">Total Passif</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalCharges)}</p>
            <p className="text-sm text-amber-600">Total Charges</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalProduits)}</p>
            <p className="text-sm text-amber-600">Total Produits</p>
          </div>
          <div className="text-center">
            <p className={`text-2xl font-bold ${stats.resultat >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {formatCurrency(stats.resultat)}
            </p>
            <p className="text-sm text-amber-600">Résultat</p>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="p-6">
        {activeView === 'balance' && renderBalanceTable()}

        {activeView === 'analyse' && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Analyse de la Balance</h4>
            
            {/* Équilibre */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {Math.abs(stats.balance) < 1000 ? (
                    <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
                  )}
                  <div>
                    <h5 className="font-semibold text-slate-800">Équilibre Actif/Passif</h5>
                    <p className="text-sm text-slate-600">Différence entre actif et passif</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-800">
                    {formatCurrency(stats.totalActif)} - {formatCurrency(stats.totalPassif)}
                  </p>
                  <p className={`text-sm ${Math.abs(stats.balance) < 1000 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {Math.abs(stats.balance) < 1000 ? '✓ Équilibré' : '⚠ Déséquilibre'}
                  </p>
                </div>
              </div>
            </div>

            {/* Résultat */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {stats.resultat >= 0 ? (
                    <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  )}
                  <div>
                    <h5 className="font-semibold text-slate-800">Résultat d'Exploitation</h5>
                    <p className="text-sm text-slate-600">Produits - Charges</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-800">
                    {formatCurrency(stats.totalProduits)} - {formatCurrency(stats.totalCharges)}
                  </p>
                  <p className={`text-sm ${stats.resultat >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {stats.resultat >= 0 ? '✓ Bénéfice' : '⚠ Déficit'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommandations */}
            <div className="space-y-3">
              <h5 className="font-semibold text-slate-800">Recommandations</h5>
              {Math.abs(stats.balance) > 1000 && (
                <div className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Déséquilibre détecté</p>
                    <p className="text-sm text-amber-700">Vérifiez les écritures comptables pour corriger l'équilibre.</p>
                  </div>
                </div>
              )}
              {stats.resultat < 0 && (
                <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Déficit d'exploitation</p>
                    <p className="text-sm text-red-700">Les charges dépassent les produits. Analysez la structure des coûts.</p>
                  </div>
                </div>
              )}
              {stats.resultat > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-800">Bénéfice d'exploitation</p>
                    <p className="text-sm text-emerald-700">L'entreprise génère un bénéfice. Maintenez cette performance.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'graphiques' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Répartition par type */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Répartition par Type</h4>
                <div className="h-80">
                  <Doughnut data={repartitionParTypeData} options={chartOptions} />
                </div>
              </div>

              {/* Top 10 comptes */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-slate-800 mb-4">Top 10 Comptes par Solde</h4>
                <div className="h-80">
                  <Bar data={topComptesData} options={barOptions} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceComptableWidget;
