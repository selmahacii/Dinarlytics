import React, { useState, useEffect } from 'react';
import {
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  ChartPieIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useApp } from '@core/context/AppContext';
import Card from '../UI/Card';

interface GestionPaiementsWidgetProps {
  period?: string;
}

const GestionPaiementsWidget: React.FC<GestionPaiementsWidgetProps> = () => {
  const { formatCurrency, currentDevise } = useApp();
  const [activeView, setActiveView] = useState<'overview' | 'nouveau' | 'programmes' | 'retard' | 'historique'>('overview');
  const [selectedStatus, setSelectedStatus] = useState<string>('tous');
  const [selectedPaiement, setSelectedPaiement] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [nouveauPaiement, setNouveauPaiement] = useState({
    fournisseur: '',
    facture: '',
    description: '',
    montant: '',
    datePaiement: '',
    mode: 'virement',
    reference: '',
    compte: '',
    commentaire: ''
  });

  const statsGenerales = {
    totalPaiements: 0,
    paiementsPayes: 0,
    paiementsProgrammes: 0,
    paiementsEnRetard: 0,
    montantTotal: 0,
    montantPaye: 0,
    montantEnRetard: 0,
    tauxReussite: 0,
    delaiMoyen: 0
  };

  const paiementsRecents: any[] = [];

  const paiementsProgrammes: any[] = [];

  const statistiquesData = {
    evolution: [] as { mois: string; payes: number; enRetard: number; montant: number }[],
    parMode: [] as { mode: string; pourcentage: number; montant: number }[],
    parFournisseur: [] as { fournisseur: string; paiements: number; montant: number }[]
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'paye': return 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700';
      case 'programme': return 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700';
      case 'retard': return 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700';
      case 'en-cours': return 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700';
      default: return 'text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'paye': return CheckCircleIcon;
      case 'programme': return CalendarIcon;
      case 'retard': return ExclamationTriangleIcon;
      case 'en-cours': return ClockIcon;
      default: return BanknotesIcon;
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'virement': return BanknotesIcon;
      case 'virement-auto': return ArrowTrendingUpIcon;
      case 'cheque': return DocumentTextIcon;
      case 'prelevement': return CreditCardIcon;
      case 'especes': return CurrencyDollarIcon;
      default: return BanknotesIcon;
    }
  };

  // Fonctions pour gérer les actions
  const handleViewDetails = (paiement: any) => {
    setSelectedPaiement(paiement);
    setIsDetailModalOpen(true);
  };

  const handleEditPaiement = (paiement: any) => {
    setSelectedPaiement(paiement);
    setIsEditModalOpen(true);
  };


  const handleViewChange = (view: 'overview' | 'nouveau' | 'programmes' | 'retard' | 'historique') => {
    setActiveView(view);
  };

  const handleExportPaiements = () => {
    console.log('Export des paiements...');
    // Ici vous pouvez ajouter la logique d'export
  };

  const handlePrintPaiement = (paiement: any) => {
    console.log('Impression du paiement:', paiement.id);
    // Ici vous pouvez ajouter la logique d'impression
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Paiements Payés</p>
              <p className="text-2xl font-bold text-green-800">{statsGenerales.paiementsPayes}</p>
              <p className="text-xs text-gray-500">{formatCurrency(statsGenerales.montantPaye)}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Programmés</p>
              <p className="text-2xl font-bold text-blue-800">{statsGenerales.paiementsProgrammes}</p>
              <p className="text-xs text-gray-500">Paiements automatiques</p>
            </div>
            <CalendarIcon className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">En Retard</p>
              <p className="text-2xl font-bold text-red-800">{statsGenerales.paiementsEnRetard}</p>
              <p className="text-xs text-gray-500">{formatCurrency(statsGenerales.montantEnRetard)}</p>
            </div>
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Taux de Réussite</p>
              <p className="text-2xl font-bold text-purple-800">{statsGenerales.tauxReussite}%</p>
              <p className="text-xs text-gray-500">Délai moyen: {statsGenerales.delaiMoyen}j</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Graphiques principaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Évolution des Paiements</h4>
          <div className="h-64">
            <Line
              data={{
                labels: statistiquesData.evolution.map(item => item.mois),
                datasets: [{
                  label: 'Paiements Réussis',
                  data: statistiquesData.evolution.map(item => item.payes),
                  borderColor: '#10B981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  tension: 0.4,
                  fill: true
                }, {
                  label: 'En Retard',
                  data: statistiquesData.evolution.map(item => item.enRetard),
                  borderColor: '#EF4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  tension: 0.4,
                  fill: true
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Répartition par Mode de Paiement</h4>
          <div className="h-64">
            <Doughnut
              data={{
                labels: statistiquesData.parMode.map(item => item.mode),
                datasets: [{
                  data: statistiquesData.parMode.map(item => item.pourcentage),
                  backgroundColor: [
                    '#3B82F6', '#10B981', '#F59E0B', '#EF4444'
                  ],
                  borderColor: [
                    '#2563EB', '#059669', '#D97706', '#DC2626'
                  ],
                  borderWidth: 2
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                },
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );

  const handleNouveauPaiementSubmit = () => {
    if (!nouveauPaiement.fournisseur || !nouveauPaiement.montant || !nouveauPaiement.facture) {
      alert('Veuillez remplir tous les champs obligatoires (Fournisseur, Facture, Montant)');
      return;
    }
    
    alert(`Paiement créé avec succès !\n\nFournisseur: ${nouveauPaiement.fournisseur}\nFacture: ${nouveauPaiement.facture}\nMontant: ${formatCurrency(parseFloat(nouveauPaiement.montant))}`);

    // Réinitialiser le formulaire
    setNouveauPaiement({
      fournisseur: '',
      facture: '',
      description: '',
      montant: '',
      datePaiement: '',
      mode: 'virement',
      reference: '',
      compte: '',
      commentaire: ''
    });
    
    // Retourner à la vue d'ensemble
    handleViewChange('overview');
  };

  const renderNouveauPaiement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">Nouveau Paiement</h4>
        <button 
          onClick={handleNouveauPaiementSubmit}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 flex items-center space-x-2 transition-all shadow-sm font-medium"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Ajouter Paiement</span>
        </button>
      </div>

      <Card className="p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Fournisseur <span className="text-red-500">*</span></label>
              <select 
                value={nouveauPaiement.fournisseur}
                onChange={(e) => setNouveauPaiement({...nouveauPaiement, fournisseur: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-slate-500 transition-all"
                aria-label="Sélectionner un fournisseur"
                required
              >
                <option value="">Sélectionner un fournisseur</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Numéro de Facture <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={nouveauPaiement.facture}
                onChange={(e) => setNouveauPaiement({...nouveauPaiement, facture: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-slate-500 transition-all"
                placeholder="FAC-2024-XXX"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</label>
            <input 
              type="text" 
              value={nouveauPaiement.description}
              onChange={(e) => setNouveauPaiement({...nouveauPaiement, description: e.target.value})}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-slate-500 transition-all"
              placeholder="Description du paiement"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Montant ({currentDevise || 'DA'}) <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                value={nouveauPaiement.montant}
                onChange={(e) => setNouveauPaiement({...nouveauPaiement, montant: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-slate-500 transition-all"
                placeholder="0"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Date de Paiement</label>
              <input 
                type="date" 
                value={nouveauPaiement.datePaiement}
                onChange={(e) => setNouveauPaiement({...nouveauPaiement, datePaiement: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-slate-500 transition-all"
                aria-label="Date de Paiement"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Mode de Paiement</label>
              <select 
                value={nouveauPaiement.mode}
                onChange={(e) => setNouveauPaiement({...nouveauPaiement, mode: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-slate-500 transition-all"
                aria-label="Mode de Paiement"
              >
                <option value="virement">Virement</option>
                <option value="cheque">Chèque</option>
                <option value="prelevement">Prélèvement</option>
                <option value="especes">Espèces</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Référence</label>
              <input 
                type="text" 
                value={nouveauPaiement.reference}
                onChange={(e) => setNouveauPaiement({...nouveauPaiement, reference: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-slate-500 transition-all"
                placeholder="Référence du paiement"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Compte</label>
              <input 
                type="text" 
                value={nouveauPaiement.compte}
                onChange={(e) => setNouveauPaiement({...nouveauPaiement, compte: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-slate-500 transition-all"
                placeholder="Numéro de compte"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Commentaire</label>
            <textarea 
              value={nouveauPaiement.commentaire}
              onChange={(e) => setNouveauPaiement({...nouveauPaiement, commentaire: e.target.value})}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-slate-500 transition-all"
              placeholder="Commentaire optionnel"
              rows={3}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button 
              type="button" 
              onClick={() => handleViewChange('overview')}
              className="w-full sm:w-auto px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              onClick={(e) => {
                e.preventDefault();
                handleNouveauPaiementSubmit();
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-sm font-medium"
            >
              Enregistrer Paiement
            </button>
          </div>
        </form>
      </Card>
    </div>
  );

  const renderPaiementsEnRetard = () => {
    const paiementsRetard = paiementsRecents.filter(p => p.statut === 'retard');
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Paiements en Retard</h4>
          <p className="text-sm text-gray-600 dark:text-slate-400">{paiementsRetard.length} paiement{paiementsRetard.length > 1 ? 's' : ''} en retard</p>
        </div>
        
        {paiementsRetard.length === 0 ? (
          <Card className="p-8 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-600 dark:text-slate-400">Aucun paiement en retard</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {paiementsRetard.map((paiement) => {
              const StatutIcon = getStatutIcon(paiement.statut);
              const ModeIcon = getModeIcon(paiement.mode);
              return (
                <Card key={paiement.id} className="p-5 bg-white dark:bg-slate-800 border-2 border-red-200 dark:border-red-800 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/30 p-3 rounded-xl">
                        <StatutIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h5 className="text-base font-bold text-slate-900 dark:text-slate-100">{paiement.fournisseur}</h5>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatutColor(paiement.statut)}`}>
                            {paiement.statut.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-slate-400">Facture: <span className="font-medium text-gray-900 dark:text-slate-100">{paiement.facture}</span></p>
                            <p className="text-gray-600 dark:text-slate-400">Description: <span className="font-medium text-gray-900 dark:text-slate-100">{paiement.description}</span></p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-slate-400">Échéance: <span className="font-medium text-red-600 dark:text-red-400">{paiement.echeance}</span></p>
                            <p className="text-gray-600 dark:text-slate-400">Retard: <span className="font-medium text-red-600 dark:text-red-400">+{paiement.retard} jour{paiement.retard > 1 ? 's' : ''}</span></p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-slate-400">Mode: <span className="font-medium flex items-center space-x-1 text-gray-900 dark:text-slate-100">
                              <ModeIcon className="h-3 w-3" />
                              <span>{paiement.mode.replace('-', ' ')}</span>
                            </span></p>
                            <p className="text-gray-600 dark:text-slate-400">Référence: <span className="font-medium text-gray-900 dark:text-slate-100">{paiement.reference}</span></p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
                            <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                            {paiement.commentaire}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600 dark:text-red-400">{formatCurrency(paiement.montant)}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{currentDevise || 'DA'}</p>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button 
                          onClick={() => handleViewDetails(paiement)}
                          className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleEditPaiement(paiement)}
                          className="p-2 text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                          title="Modifier le paiement"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handlePrintPaiement(paiement)}
                          className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Imprimer"
                        >
                          <PrinterIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderPaiementsRecents = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-900">Paiements Récents</h4>
        <div className="flex space-x-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-slate-500 transition-all font-medium"
            aria-label="Filtrer par statut"
          >
            <option value="tous">Tous les statuts</option>
            <option value="paye">✓ Payés</option>
            <option value="programme">📅 Programmés</option>
            <option value="retard">⚠️ En Retard</option>
            <option value="en-cours">⏳ En Cours</option>
          </select>
          <button 
            onClick={handleExportPaiements}
            className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 dark:hover:from-slate-700 dark:hover:to-slate-800 flex items-center space-x-2 transition-all shadow-sm font-medium"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {paiementsRecents
          .filter(paiement => selectedStatus === 'tous' || paiement.statut === selectedStatus)
          .map((paiement) => {
            const StatutIcon = getStatutIcon(paiement.statut);
            const ModeIcon = getModeIcon(paiement.mode);
            return (
              <Card key={paiement.id} className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 bg-slate-100 dark:bg-slate-700 p-3 rounded-xl">
                      <StatutIcon className="h-8 w-8 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h5 className="text-base font-bold text-slate-900 dark:text-slate-100">{paiement.fournisseur}</h5>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatutColor(paiement.statut)}`}>
                          {paiement.statut.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Facture: <span className="font-medium">{paiement.facture}</span></p>
                          <p className="text-gray-600">Description: <span className="font-medium">{paiement.description}</span></p>
                        </div>
                        <div>
                          <p className="text-gray-600">Date: <span className="font-medium">
                            {paiement.datePaiement ? `${paiement.datePaiement}${paiement.heure ? ` à ${paiement.heure}` : ''}` : 'Non définie'}
                          </span></p>
                          <p className="text-gray-600">Mode: <span className="font-medium flex items-center space-x-1">
                            <ModeIcon className="h-3 w-3" />
                            <span>{paiement.mode.replace('-', ' ')}</span>
                          </span></p>
                        </div>
                        <div>
                          <p className="text-gray-600">Référence: <span className="font-medium">{paiement.reference}</span></p>
                          <p className="text-gray-600">Compte: <span className="font-medium">{paiement.compte}</span></p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">{paiement.commentaire}</p>
                        {paiement.retard > 0 && (
                          <p className="text-sm text-red-600">
                            <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                            +{paiement.retard} jour{paiement.retard > 1 ? 's' : ''} de retard
                          </p>
                        )}
                        {paiement.retard < 0 && (
                          <p className="text-sm text-green-600">
                            <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                            Paiement anticipé de {Math.abs(paiement.retard)} jour{Math.abs(paiement.retard) > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(paiement.montant)}</p>
                      <p className="text-xs text-gray-500">{currentDevise || 'DA'}</p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button 
                        onClick={() => handleViewDetails(paiement)}
                        className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleEditPaiement(paiement)}
                        className="p-2 text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                        title="Modifier le paiement"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handlePrintPaiement(paiement)}
                        className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Imprimer"
                      >
                        <PrinterIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );

  const renderPaiementsProgrammes = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Paiements Programmés</h4>
        <p className="text-sm text-gray-600 dark:text-slate-400">{paiementsProgrammes.length} paiement{paiementsProgrammes.length > 1 ? 's' : ''} programmé{paiementsProgrammes.length > 1 ? 's' : ''}</p>
      </div>
      
      <div className="space-y-4">
        {paiementsProgrammes.map((paiement) => {
          const ModeIcon = getModeIcon(paiement.mode);
          return (
            <Card key={paiement.id} className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                    <CalendarIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h5 className="text-base font-bold text-slate-900 dark:text-slate-100">{paiement.fournisseur}</h5>
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
                        programmé
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-slate-400">Facture: <span className="font-medium text-gray-900 dark:text-slate-100">{paiement.facture}</span></p>
                        <p className="text-gray-600 dark:text-slate-400">Description: <span className="font-medium text-gray-900 dark:text-slate-100">{paiement.description}</span></p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-slate-400">Date programmée: <span className="font-medium text-gray-900 dark:text-slate-100">{paiement.dateProgrammee}</span></p>
                        <p className="text-gray-600 dark:text-slate-400 flex items-center">Mode: <span className="font-medium flex items-center space-x-1 ml-1 text-gray-900 dark:text-slate-100">
                          <ModeIcon className="h-3 w-3" />
                          <span>{paiement.mode.replace('-', ' ')}</span>
                        </span></p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-slate-400">Référence: <span className="font-medium text-gray-900 dark:text-slate-100">{paiement.reference}</span></p>
                        <p className="text-gray-600 dark:text-slate-400">Compte: <span className="font-medium text-gray-900 dark:text-slate-100">{paiement.compte}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{formatCurrency(paiement.montant)}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{currentDevise || 'DA'}</p>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button 
                      onClick={() => handleViewDetails(paiement)}
                      className="p-2 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Voir les détails"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handleEditPaiement(paiement)}
                      className="p-2 text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                      title="Modifier le paiement"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => handlePrintPaiement(paiement)}
                      className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Imprimer"
                    >
                      <PrinterIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderHistorique = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">Historique des Paiements</h4>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Top Fournisseurs</h5>
          <div className="space-y-3">
            {statistiquesData.parFournisseur.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.fournisseur}</p>
                  <p className="text-xs text-gray-500">{item.paiements} paiements</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.montant)}</p>
                  <p className="text-xs text-gray-500">{currentDevise || 'DA'}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h5 className="text-md font-semibold text-gray-900 mb-4">Répartition par Mode</h5>
          <div className="h-48">
            <Bar
              data={{
                labels: statistiquesData.parMode.map(item => item.mode),
                datasets: [{
                  label: `Montant (${currentDevise || 'DA'})`,
                  data: statistiquesData.parMode.map(item => item.montant),
                  backgroundColor: [
                    '#3B82F6', '#10B981', '#F59E0B', '#EF4444'
                  ],
                  borderColor: [
                    '#2563EB', '#059669', '#D97706', '#DC2626'
                  ],
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return formatCurrency(value as number);
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* En-tête - Palette Slate Professionnelle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Gestion des Paiements</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Suivi et gestion des paiements fournisseurs</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleViewChange('nouveau')}
            className="flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-sm font-medium space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Nouveau Paiement</span>
          </button>
          <button 
            onClick={handleExportPaiements}
            className="flex items-center px-4 py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 dark:hover:from-slate-700 dark:hover:to-slate-800 transition-all shadow-sm font-medium space-x-2"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Rapport</span>
          </button>
        </div>
      </div>

      {/* Navigation par onglets - Palette Slate */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-t-xl">
        <nav className="flex space-x-4 px-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'VUE D\'ENSEMBLE', icon: ChartBarIcon },
            { id: 'nouveau', label: 'NOUVEAU PAIEMENT', icon: PlusIcon },
            { id: 'programmes', label: 'PROGRAMMÉS', icon: CalendarIcon },
            { id: 'retard', label: 'EN RETARD', icon: ExclamationTriangleIcon },
            { id: 'historique', label: 'HISTORIQUE', icon: DocumentTextIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleViewChange(tab.id as any)}
                className={`flex items-center py-4 px-3 border-b-3 font-semibold text-sm whitespace-nowrap transition-all ${
                  activeView === tab.id
                    ? 'border-slate-700 dark:border-slate-400 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 rounded-t-lg'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-6">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'nouveau' && renderNouveauPaiement()}
        {activeView === 'programmes' && renderPaiementsProgrammes()}
        {activeView === 'retard' && renderPaiementsEnRetard()}
        {activeView === 'historique' && renderHistorique()}
      </div>

      {/* Modal de détails du paiement */}
      {isDetailModalOpen && selectedPaiement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsDetailModalOpen(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Détails du Paiement</h3>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">ID Paiement</label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{selectedPaiement.id}</p>
                </div>
                {selectedPaiement.statut && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Statut</label>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatutColor(selectedPaiement.statut)}`}>
                      {selectedPaiement.statut.replace('-', ' ')}
                    </span>
                  </div>
                )}
                {selectedPaiement.dateProgrammee && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Statut</label>
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
                      Programmé
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Fournisseur</label>
                <p className="text-sm text-gray-900 dark:text-slate-100">{selectedPaiement.fournisseur}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Facture</label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{selectedPaiement.facture}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Description</label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{selectedPaiement.description}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Montant</label>
                  <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{formatCurrency(selectedPaiement.montant)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                    {selectedPaiement.dateProgrammee ? 'Date Programmée' : 'Date de Paiement'}
                  </label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">
                    {selectedPaiement.dateProgrammee || (selectedPaiement.datePaiement ? `${selectedPaiement.datePaiement}${selectedPaiement.heure ? ` à ${selectedPaiement.heure}` : ''}` : 'Non définie')}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Mode de Paiement</label>
                  <p className="text-sm text-gray-900 dark:text-slate-100 flex items-center space-x-1">
                    {React.createElement(getModeIcon(selectedPaiement.mode), { className: "h-4 w-4" })}
                    <span>{selectedPaiement.mode.replace('-', ' ')}</span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Référence</label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{selectedPaiement.reference}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Compte</label>
                <p className="text-sm text-gray-900 dark:text-slate-100">{selectedPaiement.compte}</p>
              </div>
              
              {selectedPaiement.commentaire && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Commentaire</label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{selectedPaiement.commentaire}</p>
                </div>
              )}

              {selectedPaiement.echeance && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Échéance</label>
                  <p className="text-sm text-gray-900 dark:text-slate-100">{selectedPaiement.echeance}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Fermer
              </button>
              <button 
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleEditPaiement(selectedPaiement);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition du paiement */}
      {isEditModalOpen && selectedPaiement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Modifier le Paiement</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Fournisseur</label>
                  <input 
                    type="text" 
                    defaultValue={selectedPaiement.fournisseur}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Fournisseur"
                    placeholder="Nom du fournisseur"
                    title="Fournisseur"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Facture</label>
                  <input 
                    type="text" 
                    defaultValue={selectedPaiement.facture}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Numéro de facture"
                    placeholder="Numéro de facture"
                    title="Numéro de facture"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Description</label>
                <input 
                  type="text" 
                  defaultValue={selectedPaiement.description}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Description"
                  placeholder="Description du paiement"
                  title="Description"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Montant ({currentDevise || 'DA'})</label>
                  <input 
                    type="number" 
                    defaultValue={selectedPaiement.montant}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Montant"
                    placeholder={`Montant en ${currentDevise || 'DA'}`}
                    title="Montant"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                    {selectedPaiement.dateProgrammee ? 'Date Programmée' : 'Date de Paiement'}
                  </label>
                  <input 
                    type="date" 
                    defaultValue={selectedPaiement.dateProgrammee || selectedPaiement.datePaiement}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label={selectedPaiement.dateProgrammee ? 'Date Programmée' : 'Date de Paiement'}
                    title={selectedPaiement.dateProgrammee ? 'Date Programmée' : 'Date de Paiement'}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Mode de Paiement</label>
                  <select 
                    defaultValue={selectedPaiement.mode}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Mode de Paiement"
                  >
                    <option value="virement">Virement</option>
                    <option value="virement-auto">Virement Automatique</option>
                    <option value="cheque">Chèque</option>
                    <option value="prelevement">Prélèvement</option>
                    <option value="especes">Espèces</option>
                  </select>
                </div>
                {!selectedPaiement.dateProgrammee && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Statut</label>
                    <select 
                      defaultValue={selectedPaiement.statut}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="Statut du paiement"
                    >
                      <option value="paye">Payé</option>
                      <option value="programme">Programmé</option>
                      <option value="retard">En Retard</option>
                      <option value="en-cours">En Cours</option>
                    </select>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Référence</label>
                  <input 
                    type="text" 
                    defaultValue={selectedPaiement.reference}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Référence"
                    placeholder="Référence du paiement"
                    title="Référence"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Compte</label>
                  <input 
                    type="text" 
                    defaultValue={selectedPaiement.compte}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Numéro de compte"
                    placeholder="Numéro de compte"
                    title="Numéro de compte"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Commentaire</label>
                <textarea 
                  defaultValue={selectedPaiement.commentaire || ''}
                  rows={3}
                  placeholder="Ajouter un commentaire (optionnel)"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Annuler
              </button>
              <button 
                onClick={() => {
                  alert('Modifications enregistrées avec succès !');
                  console.log('Sauvegarde des modifications pour:', selectedPaiement.id);
                  setIsEditModalOpen(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default GestionPaiementsWidget;

