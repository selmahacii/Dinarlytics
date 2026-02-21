import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  PrinterIcon,
  EyeIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ChartBarIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';
import api from '@/services/api';

// Les données sont maintenant récupérées via l'API


const GestionPaiementsClients: React.FC = () => {
  const { formatCurrency } = useApp();
  const [paiements, setPaiements] = useState<any[]>([]);
  const [loadingPaiements, setLoadingPaiements] = useState(true);
  const [paiementsError, setPaiementsError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [filterMode, setFilterMode] = useState('tous');
  const [selectedPaiement, setSelectedPaiement] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    setLoadingPaiements(true);
    api.invoices.getAll()
      .then(data => {
        setPaiements(data);
      })
      .catch(() => setPaiementsError('Erreur lors du chargement des paiements'))
      .finally(() => setLoadingPaiements(false));
  }, []);


  // Calcul des statistiques
  const stats = useMemo(() => {
    const total = paiements.length;
    const payes = paiements.filter(p => p.statut === 'paye').length;
    const enAttente = paiements.filter(p => p.statut === 'en_attente').length;
    const enRetard = paiements.filter(p => p.statut === 'en_retard').length;

    const montantTotal = paiements.reduce((sum, p) => sum + p.montant, 0);
    const montantPaye = paiements.reduce((sum, p) => sum + p.montantPaye, 0);
    const montantEnAttente = montantTotal - montantPaye;
    const montantEnRetard = paiements
      .filter(p => p.statut === 'en_retard')
      .reduce((sum, p) => sum + p.montant, 0);

    const tauxEncaissement = (montantPaye / montantTotal) * 100;

    // Répartition par mode de paiement
    const modesPaiement = {
      virement: paiements.filter(p => p.modePaiement === 'virement').length,
      cheque: paiements.filter(p => p.modePaiement === 'cheque').length,
      especes: paiements.filter(p => p.modePaiement === 'especes').length,
      carte: paiements.filter(p => p.modePaiement === 'carte').length
    };

    return {
      total,
      payes,
      enAttente,
      enRetard,
      montantTotal,
      montantPaye,
      montantEnAttente,
      montantEnRetard,
      tauxEncaissement,
      modesPaiement
    };
  }, [paiements]);

  // Filtrage des paiements
  const filteredPaiements = useMemo(() => {
    return paiements.filter(paiement => {
      const matchesSearch =
        paiement.factureId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paiement.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (paiement.reference && paiement.reference.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        filterStatus === 'tous' ||
        (filterStatus === 'payes' && paiement.statut === 'paye') ||
        (filterStatus === 'en_attente' && paiement.statut === 'en_attente') ||
        (filterStatus === 'en_retard' && paiement.statut === 'en_retard');

      const matchesMode =
        filterMode === 'tous' ||
        paiement.modePaiement === filterMode;

      return matchesSearch && matchesStatus && matchesMode;
    });
  }, [paiements, searchTerm, filterStatus, filterMode]);

  const getStatusBadge = (statut: string) => {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      'paye': { label: 'Payé', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
      'en_attente': { label: 'En Attente', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
      'en_retard': { label: 'En Retard', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
    };

    const status = statusMap[statut] || { label: statut, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${status.className}`}>
        {status.label}
      </span>
    );
  };

  const getModePaiementLabel = (mode: string | null) => {
    const modes: { [key: string]: string } = {
      'virement': 'Virement bancaire',
      'cheque': 'Chèque',
      'especes': 'Espèces',
      'carte': 'Carte bancaire'
    };
    return mode ? modes[mode] || mode : '-';
  };

  const handleViewDetails = (paiement: any) => {
    setSelectedPaiement(paiement);
    setIsDetailsModalOpen(true);
  };

  const handleExport = () => {
    const csvContent = [
      ['N° Paiement', 'Facture', 'Client', 'Date Facture', 'Date Échéance', 'Date Paiement', 'Montant', 'Montant Payé', 'Mode Paiement', 'Statut'],
      ...filteredPaiements.map(p => [
        p.id,
        p.factureId,
        p.client,
        p.dateFacture,
        p.dateEcheance,
        p.datePaiement || '',
        p.montant,
        p.montantPaye,
        getModePaiementLabel(p.modePaiement),
        p.statut
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `paiements_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* En-tête - Amélioré */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-3 rounded-xl shadow-md">
                <BanknotesIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Gestion des Paiements
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">
                  Suivi des encaissements et paiements clients - Virements, chèques et espèces
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques principales - Améliorées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-3 rounded-lg shadow-sm">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {formatCurrency(stats.montantTotal)}
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">{stats.total} facture{stats.total > 1 ? 's' : ''}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 rounded-lg shadow-sm">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Encaissé</span>
          </div>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            {formatCurrency(stats.montantPaye)}
          </div>
          <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            {stats.tauxEncaissement.toFixed(1)}% encaissé
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-3 rounded-lg shadow-sm">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">En Attente</span>
          </div>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
            {formatCurrency(stats.montantEnAttente)}
          </div>
          <div className="text-sm font-medium text-amber-600 dark:text-amber-400">{stats.enAttente} facture{stats.enAttente > 1 ? 's' : ''}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-lg shadow-sm">
              <ExclamationTriangleIcon className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">En Retard</span>
          </div>
          <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
            {formatCurrency(stats.montantEnRetard)}
          </div>
          <div className="text-sm font-medium text-red-600 dark:text-red-400">{stats.enRetard} facture{stats.enRetard > 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Répartition par mode de paiement - Améliorée */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-slate-600 dark:text-slate-400" />
            Répartition par Mode de Paiement
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Virement</div>
              <BanknotesIcon className="h-5 w-5 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.modesPaiement.virement}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">paiement{stats.modesPaiement.virement > 1 ? 's' : ''}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Chèque</div>
              <DocumentTextIcon className="h-5 w-5 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.modesPaiement.cheque}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">paiement{stats.modesPaiement.cheque > 1 ? 's' : ''}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Espèces</div>
              <CurrencyDollarIcon className="h-5 w-5 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.modesPaiement.especes}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">paiement{stats.modesPaiement.especes > 1 ? 's' : ''}</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">Carte</div>
              <BanknotesIcon className="h-5 w-5 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.modesPaiement.carte}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">paiement{stats.modesPaiement.carte > 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {/* Tableau des paiements - Amélioré */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 px-6 py-5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-2 rounded-lg shadow-sm">
                <BanknotesIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Suivi des Paiements</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{filteredPaiements.length} paiement{filteredPaiements.length > 1 ? 's' : ''} trouvé{filteredPaiements.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <select
                title="Filtrer par statut"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 shadow-sm"
              >
                <option value="tous">Tous les statuts</option>
                <option value="payes">Payés</option>
                <option value="en_attente">En Attente</option>
                <option value="en_retard">En Retard</option>
              </select>
              <select
                title="Filtrer par mode de paiement"
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value)}
                className="px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 shadow-sm"
              >
                <option value="tous">Tous les modes</option>
                <option value="virement">Virement</option>
                <option value="cheque">Chèque</option>
                <option value="especes">Espèces</option>
                <option value="carte">Carte</option>
              </select>
              <div className="relative flex-1 md:flex-initial min-w-[250px]">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par facture, client..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 shadow-sm"
                />
              </div>
              <button
                onClick={handleExport}
                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-all duration-200 flex items-center gap-2 font-semibold shadow-sm hover:shadow-md"
              >
                <DocumentArrowDownIcon className="h-5 w-5" />
                Exporter
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Facture</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Client</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Date Facture</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Date Échéance</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Date Paiement</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Montant</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Mode Paiement</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Statut</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredPaiements.map((paiement) => (
                <tr key={paiement.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <DocumentTextIcon className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{paiement.factureId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{paiement.client}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{new Date(paiement.dateFacture).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{new Date(paiement.dateEcheance).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {paiement.datePaiement ? (
                      <div className="flex items-center space-x-2">
                        <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                          {new Date(paiement.datePaiement).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{formatCurrency(paiement.montant)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600">
                      {getModePaiementLabel(paiement.modePaiement)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {getStatusBadge(paiement.statut)}
                      {paiement.retard > 0 && (
                        <div className="text-xs font-medium text-red-600 dark:text-red-400">
                          {paiement.retard} jours de retard
                        </div>
                      )}
                      {paiement.retard < 0 && (
                        <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          {Math.abs(paiement.retard)} jours d'avance
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewDetails(paiement)}
                      className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 shadow-sm hover:shadow-md"
                      title="Voir détails"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de détails - Améliorée */}
      {isDetailsModalOpen && selectedPaiement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 px-6 py-5 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-2 rounded-lg shadow-sm">
                    <BanknotesIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      Détails du Paiement
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{selectedPaiement.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-2">Facture</label>
                  <p className="text-slate-900 dark:text-slate-100 font-bold">{selectedPaiement.factureId}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-2">Client</label>
                  <p className="text-slate-900 dark:text-slate-100 font-bold">{selectedPaiement.client}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-2">Date Facture</label>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                    <p className="text-slate-900 dark:text-slate-100 font-medium">
                      {new Date(selectedPaiement.dateFacture).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-2">Date Échéance</label>
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-4 w-4 text-slate-400" />
                    <p className="text-slate-900 dark:text-slate-100 font-medium">
                      {new Date(selectedPaiement.dateEcheance).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                {selectedPaiement.datePaiement && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                    <label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide block mb-2">Date Paiement</label>
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {new Date(selectedPaiement.datePaiement).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                )}
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-2">Statut</label>
                  <div className="mt-1">{getStatusBadge(selectedPaiement.statut)}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-2">Montant Total</label>
                  <p className="text-slate-900 dark:text-slate-100 font-bold text-lg">
                    {formatCurrency(selectedPaiement.montant)}
                  </p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                  <label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide block mb-2">Montant Payé</label>
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">
                    {formatCurrency(selectedPaiement.montantPaye)}
                  </p>
                </div>
                {selectedPaiement.modePaiement && (
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-2">Mode de Paiement</label>
                    <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600">
                      {getModePaiementLabel(selectedPaiement.modePaiement)}
                    </span>
                  </div>
                )}
                {selectedPaiement.reference && (
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-2">Référence</label>
                    <p className="text-slate-900 dark:text-slate-100 font-mono text-sm">{selectedPaiement.reference}</p>
                  </div>
                )}
                {selectedPaiement.retard !== 0 && (
                  <div className={`rounded-lg p-4 border ${selectedPaiement.retard > 0
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                    }`}>
                    <label className={`text-xs font-semibold uppercase tracking-wide block mb-2 ${selectedPaiement.retard > 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                      {selectedPaiement.retard > 0 ? 'Retard' : 'Avance'}
                    </label>
                    <p className={`font-bold text-lg ${selectedPaiement.retard > 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                      {selectedPaiement.retard > 0 ? '+' : ''}{selectedPaiement.retard} jours
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionPaiementsClients;

