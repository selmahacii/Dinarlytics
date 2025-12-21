import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
import Card from '../../components/UI/Card';
import { useApp } from '../../context/AppContext';

const SuiviLivraisons: React.FC = () => {
  const { formatCurrency } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [selectedLivraison, setSelectedLivraison] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // TODO: Replace with API hook for deliveries
  // For now, using empty array - should call useDeliveries() hook
  const livraisons: any[] = [];

  // Calcul des statistiques
  const stats = useMemo(() => {
    const total = livraisons.length;
    const livrees = livraisons.filter(l => l.statut === 'livree').length;
    const enTransit = livraisons.filter(l => l.statut === 'en_transit').length;
    const enPreparation = livraisons.filter(l => l.statut === 'en_preparation').length;
    const retardees = livraisons.filter(l => l.statut === 'retardee').length;
    
    const fraisTransportTotal = livraisons.reduce((sum, l) => sum + (l.fraisTransport || 0), 0);
    const fraisTransportMoyen = fraisTransportTotal / total;
    
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
      'livree': { label: 'Livrée', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
      'en_transit': { label: 'En Transit', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
      'en_preparation': { label: 'En Préparation', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
      'retardee': { label: 'Retardée', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
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
    <div className="space-y-6 p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* En-tête */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
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
                Suivi des Livraisons
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Tracking et gestion des livraisons clients
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg">
              <TruckIcon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {stats.total}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Livraisons</div>
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="text-xs text-slate-500 dark:text-slate-400">Ce mois</div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-slate-900 border border-emerald-200 dark:border-emerald-800">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-emerald-700 dark:text-emerald-300" />
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Livrées</span>
          </div>
          <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-1">
            {stats.livrees}
          </div>
          <div className="text-sm text-emerald-600 dark:text-emerald-400">
            {stats.tauxReussite.toFixed(0)}% de réussite
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-900 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
              <ClockIcon className="h-6 w-6 text-blue-700 dark:text-blue-300" />
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">En Transit</span>
          </div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
            {stats.enTransit}
          </div>
          <div className="text-sm text-blue-600 dark:text-blue-400">En cours</div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-slate-900 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-lg">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-700 dark:text-red-300" />
            </div>
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">Retardées</span>
          </div>
          <div className="text-3xl font-bold text-red-900 dark:text-red-100 mb-1">
            {stats.retardees}
          </div>
          <div className="text-sm text-red-600 dark:text-red-400">
            {stats.tauxRetard.toFixed(0)}% de retard
          </div>
        </Card>
      </div>

      {/* Statistiques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Frais Transport Total</h3>
            <TruckIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {formatCurrency(stats.fraisTransportTotal)}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Coût moyen: {formatCurrency(stats.fraisTransportMoyen)}
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Taux de Ponctualité</h3>
            <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {stats.tauxPonctualite.toFixed(0)}%
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {stats.livraisonsPonctuelles} livraisons à l'heure
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Poids Total Livré</h3>
            <TruckIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            {stats.poidsTotal.toFixed(1)} kg
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Volume: {stats.volumeTotal.toFixed(1)} m³
          </div>
        </Card>
      </div>

      {/* Tableau des livraisons */}
      <Card className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Suivi des Livraisons</h2>
          <div className="flex flex-wrap gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500"
            >
              <option value="tous">Tous les statuts</option>
              <option value="livrees">Livrées</option>
              <option value="en_transit">En Transit</option>
              <option value="en_preparation">En Préparation</option>
              <option value="retardees">Retardées</option>
            </select>
            <div className="relative flex-1 md:flex-initial min-w-[250px]">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par N° livraison ou client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="h-5 w-5" />
              Exporter
            </button>
            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center gap-2">
              <PrinterIcon className="h-5 w-5" />
              Rapport
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">N° Livraison</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Date Commande</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Date Livraison</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Transporteur</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Frais Transport</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Actions</th>
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
                      <div>Prévue: {new Date(livraison.dateLivraisonPrevue).toLocaleDateString('fr-FR')}</div>
                      {livraison.dateLivraisonReelle && (
                        <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                          Réelle: {new Date(livraison.dateLivraisonReelle).toLocaleDateString('fr-FR')}
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
                  Détails de la Livraison {selectedLivraison.numero}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Client</label>
                  <p className="text-slate-900 dark:text-slate-100 font-semibold">{selectedLivraison.client}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Statut</label>
                  <div className="mt-1">{getStatusBadge(selectedLivraison.statut)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Date Commande</label>
                  <p className="text-slate-900 dark:text-slate-100">
                    {new Date(selectedLivraison.dateCommande).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Date Livraison Prévue</label>
                  <p className="text-slate-900 dark:text-slate-100">
                    {new Date(selectedLivraison.dateLivraisonPrevue).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                {selectedLivraison.dateLivraisonReelle && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Date Livraison Réelle</label>
                    <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {new Date(selectedLivraison.dateLivraisonReelle).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Transporteur</label>
                  <p className="text-slate-900 dark:text-slate-100">{selectedLivraison.transporteur}</p>
                </div>
                {selectedLivraison.numeroSuivi && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">N° de Suivi</label>
                    <p className="text-slate-900 dark:text-slate-100 font-mono">{selectedLivraison.numeroSuivi}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Frais Transport</label>
                  <p className="text-slate-900 dark:text-slate-100 font-semibold">
                    {formatCurrency(selectedLivraison.fraisTransport || 0)}
                  </p>
                </div>
              </div>
              {selectedLivraison.adresseLivraison && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    Adresse de Livraison
                  </label>
                  <p className="text-slate-900 dark:text-slate-100 mt-1">{selectedLivraison.adresseLivraison}</p>
                </div>
              )}
              {selectedLivraison.articles && selectedLivraison.articles.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Articles</label>
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
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Notes</label>
                  <p className="text-slate-900 dark:text-slate-100 mt-1">{selectedLivraison.notes}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500 text-white rounded-lg transition-colors"
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

export default SuiviLivraisons;

