import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '@/services/apiClient';
import {
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  EyeIcon,
  MapPinIcon,
  PhoneIcon,
  CalendarIcon,
  ChartBarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';

const SuiviLivraisons: React.FC = () => {
  const { formatCurrency } = useApp();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [selectedLivraison, setSelectedLivraison] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [livraisons, setLivraisons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLivraisons = async () => {
      try {
        const response = await apiClient.get('/procurement/deliveries');
        const mapped = (Array.isArray(response.data) ? response.data : []).map((dn: any) => ({
          id: dn.id,
          numero: dn.delivery_number,
          client: dn.client_name || 'Client Inconnu',
          dateCommande: dn.created_at ? dn.created_at.split('T')[0] : dn.delivery_date,
          dateLivraisonPrevue: dn.delivery_date,
          dateLivraisonReelle: dn.delivery_date,
          // Transporteur/destination/frais ne sont pas suivis par le backend :
          // affichés vides plutôt qu'avec des valeurs inventées identiques
          // pour chaque livraison.
          transporteur: '',
          statut: dn.statut || 'livree',
          fraisTransport: 0,
          details: dn.notes || '',
          destination: '',
          items: (dn.items || []).map((item: any) => ({
            name: item.article_name || item.description || 'Article',
            quantity: item.quantity,
            barcode: item.barcode
          }))
        }));
        setLivraisons(mapped);
      } catch (err) {
        console.error('Failed to fetch deliveries', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLivraisons();
  }, []);

  // Calcul des statistiques
  const stats = useMemo(() => {
    const total = livraisons.length;
    const livrees = livraisons.filter(l => l.statut === 'livree').length;
    const enTransit = livraisons.filter(l => l.statut === 'en_transit').length;
    const enPreparation = livraisons.filter(l => l.statut === 'en_preparation').length;
    const retardees = livraisons.filter(l => l.statut === 'retardee').length;
    
    const fraisTransportTotal = livraisons.reduce((sum, l) => sum + (l.fraisTransport || 0), 0);
    const fraisTransportMoyen = total > 0 ? fraisTransportTotal / total : 0;
    
    const poidsTotal = livraisons.reduce((sum, l) => sum + (l.poids || 0), 0);
    const volumeTotal = livraisons.reduce((sum, l) => sum + (l.volume || 0), 0);
    
    // Calcul du taux de ponctualité (livraisons à l'heure)
    const livraisonsPonctuelles = livraisons.filter(l => {
      if (l.statut === 'livree' && l.dateLivraisonReelle && l.dateLivraisonPrevue) {
        const dateReelle = new Date(l.dateLivraisonReelle);
        const datePrevue = new Date(l.dateLivraisonPrevue);
        return dateReelle <= datePrevue;
      }
      return false;
    }).length;
    const tauxPonctualite = livrees > 0 ? (livraisonsPonctuelles / livrees) * 100 : 0;

    return {
      total,
      livrees,
      enTransit,
      enPreparation,
      retardees,
      tauxReussite: (livrees / total) * 100,
      tauxRetard: (retardees / total) * 100,
      fraisTransportTotal,
      fraisTransportMoyen,
      poidsTotal,
      volumeTotal,
      tauxPonctualite,
      livraisonsPonctuelles
    };
  }, [livraisons]);

  // Filtrage des livraisons
  const filteredLivraisons = useMemo(() => {
    return livraisons.filter(livraison => {
      const matchesSearch = 
        livraison.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        livraison.client.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = 
        filterStatus === 'tous' ||
        (filterStatus === 'livrees' && livraison.statut === 'livree') ||
        (filterStatus === 'en_transit' && livraison.statut === 'en_transit') ||
        (filterStatus === 'en_preparation' && livraison.statut === 'en_preparation') ||
        (filterStatus === 'retardees' && livraison.statut === 'retardee');
      
      return matchesSearch && matchesStatus;
    });
  }, [livraisons, searchTerm, filterStatus]);

  const getStatusBadge = (statut: string) => {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      'livree': { label: t('inventory.deliveries.status.delivered'), className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
      'en_transit': { label: t('inventory.deliveries.status.in_transit'), className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      'en_preparation': { label: t('inventory.deliveries.status.preparing'), className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
      'retardee': { label: t('inventory.deliveries.status.delayed'), className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
    };
    
    const status = statusMap[statut] || { label: statut, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${status.className}`}>
        {status.label}
      </span>
    );
  };

  const handleViewDetails = (livraison: any) => {
    setSelectedLivraison(livraison);
    setIsDetailsModalOpen(true);
  };

  const handleExport = () => {
    const csvContent = [
      ['N° Livraison', 'Client', 'Date Commande', 'Date Livraison Prévue', 'Date Livraison Réelle', 'Transporteur', 'Statut', 'Frais Transport'],
      ...filteredLivraisons.map(l => [
        l.numero,
        l.client,
        l.dateCommande,
        l.dateLivraisonPrevue,
        l.dateLivraisonReelle || '',
        l.transporteur,
        l.statut,
        l.fraisTransport
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `livraisons_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* En-tête */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {t('inventory.deliveries.title')}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {t('inventory.deliveries.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
              <TruckIcon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('inventory.deliveries.stats.total')}</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {stats.total}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{t('inventory.deliveries.title')}</div>
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('common.this_month', { defaultValue: 'Ce mois' })}</div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{t('inventory.deliveries.stats.delivered')}</span>
          </div>
          <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-1">
            {stats.livrees}
          </div>
          <div className="text-sm text-emerald-600 dark:text-emerald-400">
            {t('inventory.deliveries.stats.success_rate', { percent: stats.tauxReussite.toFixed(0) })}
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-700 dark:text-blue-300" />
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{t('inventory.deliveries.stats.in_transit')}</span>
          </div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
            {stats.enTransit}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">{t('inventory.deliveries.status.in_transit')}</div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-slate-900 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-700 dark:text-red-300" />
            </div>
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">{t('inventory.deliveries.stats.delayed')}</span>
          </div>
          <div className="text-3xl font-bold text-red-900 dark:text-red-100 mb-1">
            {stats.retardees}
          </div>
          <div className="text-sm text-red-600 dark:text-red-400">
            {t('inventory.deliveries.stats.delay_rate', { percent: stats.tauxRetard.toFixed(0) })}
          </div>
        </Card>
      </div>

      {/* Statistiques secondaires */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <Card className="p-4 sm:p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('inventory.deliveries.stats.transport_fees')}</h3>
            <TruckIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-400 dark:text-slate-500 mb-1">—</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Frais de transport non suivis par livraison
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('inventory.deliveries.stats.on_time_rate')}</h3>
            <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {stats.tauxPonctualite.toFixed(0)}%
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {t('inventory.deliveries.stats.on_time_count', { count: stats.livraisonsPonctuelles })}
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('inventory.deliveries.stats.weight_total')}</h3>
            <TruckIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {stats.poidsTotal.toFixed(1)} kg
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {t('inventory.deliveries.stats.volume', { volume: stats.volumeTotal.toFixed(1) })}
          </div>
        </Card>
      </div>

      {/* Tableau des livraisons */}
      <Card className="p-4 sm:p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t('inventory.deliveries.title')}</h2>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full sm:w-auto">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 w-full sm:w-auto"
            >
              <option value="tous">{t('inventory.deliveries.status.all')}</option>
              <option value="livrees">{t('inventory.deliveries.status.delivered')}</option>
              <option value="en_transit">{t('inventory.deliveries.status.in_transit')}</option>
              <option value="en_preparation">{t('inventory.deliveries.status.preparing')}</option>
              <option value="retardees">{t('inventory.deliveries.status.delayed')}</option>
            </select>
            <div className="relative w-full sm:w-auto sm:min-w-[250px]">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder={t('inventory.deliveries.placeholders.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
              {t('common.export')}
            </button>
            <button onClick={() => window.print()} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
              <PrinterIcon className="h-5 w-5" />
              {t('common.report', { defaultValue: 'Rapport' })}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('inventory.deliveries.table.no')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('inventory.deliveries.table.client')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('inventory.deliveries.table.order_date')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('inventory.deliveries.table.delivery_date')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('inventory.deliveries.table.carrier')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('inventory.deliveries.table.status')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('inventory.deliveries.table.fees')}</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredLivraisons.map((livraison) => (
                <tr key={livraison.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                    {livraison.numero}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                    {livraison.client}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    {new Date(livraison.dateCommande).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    <div>
                      <div>{t('inventory.deliveries.table.planned')}: {new Date(livraison.dateLivraisonPrevue).toLocaleDateString('fr-FR')}</div>
                      {livraison.dateLivraisonReelle && (
                        <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {t('inventory.deliveries.table.actual')}: {new Date(livraison.dateLivraisonReelle).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    <div>
                      <div>{livraison.transporteur}</div>
                      {livraison.numeroSuivi && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {livraison.numeroSuivi}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(livraison.statut)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(livraison.fraisTransport || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(livraison)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="Voir détails"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal de détails */}
      {isDetailsModalOpen && selectedLivraison && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                   {t('inventory.deliveries.modal.details_title', { no: selectedLivraison.numero })}
                </h3>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('inventory.deliveries.table.client')}</label>
                  <p className="text-slate-900 dark:text-slate-100 font-semibold">{selectedLivraison.client}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('inventory.deliveries.table.status')}</label>
                  <div className="mt-1">{getStatusBadge(selectedLivraison.statut)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('inventory.deliveries.table.order_date')}</label>
                  <p className="text-slate-900 dark:text-slate-100">
                    {new Date(selectedLivraison.dateCommande).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('inventory.deliveries.table.planned')}</label>
                  <p className="text-slate-900 dark:text-slate-100">
                    {new Date(selectedLivraison.dateLivraisonPrevue).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                {selectedLivraison.dateLivraisonReelle && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('inventory.deliveries.table.actual')}</label>
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {new Date(selectedLivraison.dateLivraisonReelle).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('inventory.deliveries.table.carrier')}</label>
                  <p className="text-slate-900 dark:text-slate-100">{selectedLivraison.transporteur}</p>
                </div>
                {selectedLivraison.numeroSuivi && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('inventory.deliveries.table.tracking_no')}</label>
                    <p className="text-slate-900 dark:text-slate-100 font-mono">{selectedLivraison.numeroSuivi}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('inventory.deliveries.table.fees')}</label>
                  <p className="text-slate-900 dark:text-slate-100 font-semibold">
                    {formatCurrency(selectedLivraison.fraisTransport || 0)}
                  </p>
                </div>
              </div>
              {selectedLivraison.adresseLivraison && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    {t('inventory.deliveries.modal.address')}
                  </label>
                  <p className="text-slate-900 dark:text-slate-100 mt-1">{selectedLivraison.adresseLivraison}</p>
                </div>
              )}
              {selectedLivraison.articles && selectedLivraison.articles.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('inventory.deliveries.modal.items')}</label>
                  <div className="mt-2 space-y-2">
                    {selectedLivraison.articles.map((article: any, index: number) => (
                      <div key={index} className="bg-slate-50 dark:bg-slate-700 p-3 rounded-lg">
                        <p className="text-slate-900 dark:text-slate-100 font-medium">{article.nom}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Quantité: {article.quantite} - {article.conditionnement}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedLivraison.notes && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('inventory.deliveries.modal.notes')}</label>
                  <p className="text-slate-900 dark:text-slate-100 mt-1">{selectedLivraison.notes}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                  {t('common.close', { defaultValue: 'Fermer' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuiviLivraisons;



