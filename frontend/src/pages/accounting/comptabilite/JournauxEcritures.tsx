import React, { useState, useEffect } from 'react';
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalculatorIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Modal from "../../../components/UI/Modal";
import { useNotification } from "../../../hooks/useNotification";
import { useAccountingReports } from "../../../hooks/useAccountingReports";

const JournauxEcritures: React.FC = () => {
  const { success, error, warning, info, confirm, notification, closeNotification } = useNotification();
  const { journaux: apiJournaux, entries: apiEntries, loadingJournaux, loadingEntries, error: apiError, fetchJournaux, fetchEntries } = useAccountingReports();
  const [selectedJournal, setSelectedJournal] = useState('tous');
  const [selectedPeriode, setSelectedPeriode] = useState('mois');

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchJournaux(selectedPeriode);
    fetchEntries({ period: selectedPeriode, journal_type: selectedJournal !== 'tous' ? selectedJournal : undefined });
  }, [selectedPeriode, selectedJournal]);
  const [showFilters, setShowFilters] = useState(false);
  const [isNouvelleEcritureModalOpen, setIsNouvelleEcritureModalOpen] = useState(false);
  const [isClotureModalOpen, setIsClotureModalOpen] = useState(false);
  const [selectedEcritures, setSelectedEcritures] = useState<number[]>([]);
  
  // État pour le formulaire de nouvelle écriture
  const [nouvelleEcriture, setNouvelleEcriture] = useState({
    date: new Date().toISOString().split('T')[0],
    journal: 'OD',
    libelle: '',
    compteDebit: '',
    montantDebit: '',
    compteCredit: '',
    montantCredit: '',
    piece: ''
  });

  // Use API data or fallback to empty array
  const journaux = apiJournaux || [];
  
  // Use API data or fallback to empty array
  const ecritures = apiEntries || [];

  // Calculer les totaux
  const totalDebit = ecritures.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = ecritures.reduce((sum, e) => sum + e.credit, 0);
  const ecrituresNonValidees = ecritures.filter(e => !e.valide).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Handlers pour les actions rapides
  const handleNouvelleEcriture = () => {
    setIsNouvelleEcritureModalOpen(true);
  };

  const handleExporterGrandLivre = () => {
    // Filtrer les écritures selon les critères
    const ecrituresFiltrees = ecritures.filter(e => {
      if (selectedJournal !== 'tous' && e.journal !== selectedJournal) return false;
      return true;
    });

    if (ecrituresFiltrees.length === 0) {
      warning(
        'Aucune écriture à exporter',
        'Aucune écriture ne correspond aux critères de filtrage sélectionnés.',
        ['Veuillez ajuster les filtres et réessayer']
      );
      return;
    }

    // Simuler l'export
    const csvContent = [
      ['N° Écriture', 'Date', 'Journal', 'Compte', 'Libellé', 'Débit', 'Crédit', 'Statut'].join(','),
      ...ecrituresFiltrees.map(e => [
        e.numero,
        e.date,
        e.journal,
        e.compte,
        `"${e.libelle}"`,
        e.debit,
        e.credit,
        e.valide ? 'Validé' : 'Brouillon'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Grand_Livre_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    success(
      'Export réussi',
      `Grand Livre exporté avec succès !`,
      [
        `${ecrituresFiltrees.length} écriture(s) exportée(s)`,
        `Fichier: Grand_Livre_${new Date().toISOString().split('T')[0]}.csv`,
        'Le téléchargement a démarré automatiquement'
      ]
    );
  };

  const handleValiderEcritures = () => {
    if (selectedEcritures.length === 0) {
      warning(
        'Aucune écriture sélectionnée',
        'Veuillez sélectionner au moins une écriture à valider.',
        ['Cochez les écritures que vous souhaitez valider dans le tableau']
      );
      return;
    }

    confirm(
      'Valider les écritures',
      `Êtes-vous sûr de vouloir valider ${selectedEcritures.length} écriture(s) ?`,
      () => {
        // Simuler la validation
        success(
          'Validation réussie',
          `${selectedEcritures.length} écriture(s) validée(s) avec succès !`,
          [
            'Les écritures ont été marquées comme validées',
            'Elles peuvent maintenant être utilisées pour la clôture mensuelle'
          ]
        );
        setSelectedEcritures([]);
      },
      [
        'Cette action est irréversible',
        'Les écritures validées seront verrouillées'
      ],
      'Valider',
      'Annuler'
    );
  };

  const handleClotureMensuelle = () => {
    // Vérifier que toutes les écritures sont validées
    const ecrituresNonValidees = ecritures.filter(e => !e.valide);
    if (ecrituresNonValidees.length > 0) {
      error(
        'Clôture impossible',
        `Impossible de clôturer : ${ecrituresNonValidees.length} écriture(s) non validée(s).`,
        [
          'Toutes les écritures doivent être validées avant la clôture',
          'Veuillez valider les écritures en attente et réessayer'
        ]
      );
      return;
    }

    // Vérifier l'équilibre
    if (totalDebit !== totalCredit) {
      error(
        'Clôture impossible',
        'Impossible de clôturer : les écritures ne sont pas équilibrées.',
        [
          `Total Débit: ${formatCurrency(totalDebit)}`,
          `Total Crédit: ${formatCurrency(totalCredit)}`,
          `Écart: ${formatCurrency(Math.abs(totalDebit - totalCredit))}`,
          'Veuillez corriger les écritures et réessayer'
        ]
      );
      return;
    }

    setIsClotureModalOpen(true);
  };

  const handleSubmitNouvelleEcriture = () => {
    if (!nouvelleEcriture.libelle || !nouvelleEcriture.compteDebit || !nouvelleEcriture.compteCredit) {
      warning(
        'Champs manquants',
        'Veuillez remplir tous les champs obligatoires.',
        ['Libellé, Compte Débit et Compte Crédit sont requis']
      );
      return;
    }

    const montantDebit = parseFloat(nouvelleEcriture.montantDebit) || 0;
    const montantCredit = parseFloat(nouvelleEcriture.montantCredit) || 0;

    if (montantDebit === 0 && montantCredit === 0) {
      warning(
        'Montant manquant',
        'Veuillez saisir un montant en débit ou en crédit.',
        ['Au moins un des deux montants doit être renseigné']
      );
      return;
    }

    if (montantDebit > 0 && montantCredit > 0) {
      error(
        'Erreur de saisie',
        'Une écriture ne peut avoir un montant en débit ET en crédit simultanément.',
        [
          'Choisissez soit un montant en débit, soit un montant en crédit',
          'Les deux ne peuvent pas être renseignés en même temps'
        ]
      );
      return;
    }

    // Simuler la création
    success(
      'Écriture créée',
      `Écriture créée avec succès !`,
      [
        `Journal: ${nouvelleEcriture.journal}`,
        `Libellé: ${nouvelleEcriture.libelle}`,
        `Montant: ${formatCurrency(montantDebit || montantCredit)}`,
        'L\'écriture a été enregistrée et est prête à être validée'
      ]
    );

    // Réinitialiser le formulaire
    setNouvelleEcriture({
      date: new Date().toISOString().split('T')[0],
      journal: 'OD',
      libelle: '',
      compteDebit: '',
      montantDebit: '',
      compteCredit: '',
      montantCredit: '',
      piece: ''
    });

    setIsNouvelleEcritureModalOpen(false);
  };

  const handleConfirmCloture = () => {
    const mois = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    success(
      'Clôture mensuelle réussie',
      `Clôture mensuelle effectuée avec succès pour ${mois} !`,
      [
        `Total Débit: ${formatCurrency(totalDebit)}`,
        `Total Crédit: ${formatCurrency(totalCredit)}`,
        `Écritures: ${ecritures.length}`,
        'La période est maintenant clôturée et verrouillée'
      ]
    );
    setIsClotureModalOpen(false);
  };

  const handleToggleEcritureSelection = (id: number) => {
    setSelectedEcritures(prev => 
      prev.includes(id) 
        ? prev.filter(eId => eId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedEcritures.length === ecritures.length) {
      setSelectedEcritures([]);
    } else {
      setSelectedEcritures(ecritures.map(e => e.id));
    }
  };

  if (loadingJournaux || loadingEntries) {
    return <div className="p-8 text-center text-slate-500">Chargement des données comptables...</div>;
  }
  if (apiError) {
    return <div className="p-8 text-center text-red-500">Erreur lors du chargement des données : {apiError.toString()}</div>;
  }
  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-100 rounded-lg">
              <ClipboardDocumentListIcon className="h-8 w-8 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Journaux & Écritures Comptables</h1>
              <p className="text-slate-600">Gestion des écritures et journaux comptables</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
            >
              <FunnelIcon className="h-5 w-5 inline mr-2" />
              Filtres
            </button>
            <button 
              onClick={handleNouvelleEcriture}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              <PlusIcon className="h-5 w-5 inline mr-2" />
              Nouvelle Écriture
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Écritures</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{ecritures.length}</p>
              <p className="text-xs text-slate-500 mt-1">Ce mois</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              <ClipboardDocumentListIcon className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Débit</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalDebit)}</p>
              <p className="text-xs text-slate-500 mt-1">Somme cumulée</p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-lg">
              <CalculatorIcon className="h-6 w-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Crédit</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalCredit)}</p>
              <p className="text-xs text-slate-500 mt-1">Somme cumulée</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CalculatorIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Équilibre</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {totalDebit === totalCredit ? '✓ Équilibré' : '⚠ Déséquilibré'}
              </p>
              <p className="text-xs text-slate-500 mt-1">{ecrituresNonValidees} en attente</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Filtres</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Journal</label>
              <select title="Sélectionner un journal"
                value={selectedJournal}
                onChange={(e) => setSelectedJournal(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
              >
                <option value="tous">Tous les journaux</option>
                {journaux.map(j => (
                  <option key={j.code} value={j.code}>{j.code} - {j.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Période</label>
              <select title="Sélectionner une période"
                value={selectedPeriode}
                onChange={(e) => setSelectedPeriode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
              >
                <option value="jour">Aujourd'hui</option>
                <option value="semaine">Cette semaine</option>
                <option value="mois">Ce mois</option>
                <option value="trimestre">Ce trimestre</option>
                <option value="annee">Cette année</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date début</label>
              <input title="Sélectionner une date de début" placeholder="jj/mm/aaaa"
                type="date"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date fin</label>
              <input title="Sélectionner une date de fin" placeholder="jj/mm/aaaa"
                type="date"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Vue des journaux */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {journaux.length === 0 ? (
          <div className="col-span-5 text-center text-slate-400">Aucun journal disponible pour la période sélectionnée.</div>
        ) : (
          journaux.map((journal) => (
            <div 
              key={journal.code}
              className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelectedJournal(journal.code)}
            >
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-${journal.color}-100 rounded-lg mb-3`}>
                  <span className={`text-xl font-bold text-${journal.color}-600`}>{journal.code}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{journal.nom}</h3>
                <div className="space-y-1">
                  <p className="text-xs text-slate-600">{journal.ecritures} écritures</p>
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(journal.montant)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tableau des écritures */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Liste des Écritures Comptables</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleExporterGrandLivre}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
            >
              <DocumentArrowDownIcon className="h-4 w-4 inline mr-1" />
              Exporter
            </button>
            <button 
              onClick={handleValiderEcritures}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              <CheckCircleIcon className="h-4 w-4 inline mr-1" />
              Valider Sélection ({selectedEcritures.length})
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  <input title="Tout sélectionner" placeholder="Tout sélectionner"
                    type="checkbox" 
                    className="rounded border-slate-300"
                    checked={selectedEcritures.length === ecritures.length && ecritures.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  N° Écriture
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Journal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Compte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Libellé
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Débit
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Crédit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {ecritures.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-slate-400">Aucune écriture comptable pour la période et le journal sélectionnés.</td>
                </tr>
              ) : (
                ecritures.map((ecriture) => (
                  <tr key={ecriture.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input title="Sélectionner cette écriture" placeholder="Sélectionner"
                        type="checkbox" 
                        className="rounded border-slate-300"
                        checked={selectedEcritures.includes(ecriture.id)}
                        onChange={() => handleToggleEcritureSelection(ecriture.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-900">{ecriture.numero}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-600">{ecriture.date}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-bold rounded bg-slate-100 text-slate-700">
                        {ecriture.journal}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-900">{ecriture.compte}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-700">{ecriture.libelle}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-cyan-600">
                        {ecriture.debit > 0 ? formatCurrency(ecriture.debit) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-emerald-600">
                        {ecriture.credit > 0 ? formatCurrency(ecriture.credit) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ecriture.valide ? (
                        <span className="inline-flex px-3 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-300">
                          Validé
                        </span>
                      ) : (
                        <span className="inline-flex px-3 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-700 border border-amber-300">
                          Brouillon
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button title="Voir les détails" className="p-1 text-cyan-600 hover:bg-cyan-50 rounded">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button title="Modifier l'écriture" className="p-1 text-slate-600 hover:bg-slate-50 rounded">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button title="Supprimer l'écriture" className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-300">
              <tr>
                <td colSpan={6} className="px-6 py-4 text-right">
                  <span className="text-sm font-bold text-slate-900">TOTAUX :</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-bold text-cyan-600">{formatCurrency(totalDebit)}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-bold text-emerald-600">{formatCurrency(totalCredit)}</span>
                </td>
                <td colSpan={2} className="px-6 py-4">
                  {totalDebit === totalCredit ? (
                    <span className="inline-flex px-3 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-300">
                      ✓ Équilibré
                    </span>
                  ) : (
                    <span className="inline-flex px-3 py-1 text-xs font-bold rounded-lg bg-red-100 text-red-700 border border-red-300">
                      ⚠ Déséquilibre
                    </span>
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={handleNouvelleEcriture}
            className="flex items-center p-4 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            <div className="p-2 bg-emerald-100 rounded-lg mr-3">
              <PlusIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">Nouvelle Écriture</span>
          </button>
          <button 
            onClick={handleExporterGrandLivre}
            className="flex items-center p-4 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            <div className="p-2 bg-cyan-100 rounded-lg mr-3">
              <DocumentArrowDownIcon className="h-5 w-5 text-cyan-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">Exporter Grand Livre</span>
          </button>
          <button 
            onClick={handleValiderEcritures}
            className="flex items-center p-4 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            <div className="p-2 bg-amber-100 rounded-lg mr-3">
              <CheckCircleIcon className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">Valider Écritures</span>
          </button>
          <button 
            onClick={handleClotureMensuelle}
            className="flex items-center p-4 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            <div className="p-2 bg-slate-100 rounded-lg mr-3">
              <CalendarIcon className="h-5 w-5 text-slate-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">Clôture Mensuelle</span>
          </button>
        </div>
      </div>

      {/* Modal Nouvelle Écriture */}
      {isNouvelleEcritureModalOpen && (
        <Modal
          isOpen={isNouvelleEcritureModalOpen}
          onClose={() => setIsNouvelleEcritureModalOpen(false)}
          title="Nouvelle Écriture Comptable"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input title="Sélectionner la date" placeholder="jj/mm/aaaa"
                  type="date"
                  value={nouvelleEcriture.date}
                  onChange={(e) => setNouvelleEcriture({...nouvelleEcriture, date: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Journal <span className="text-red-500">*</span>
                </label>
                <select title="Sélectionner un journal"
                  value={nouvelleEcriture.journal}
                  onChange={(e) => setNouvelleEcriture({...nouvelleEcriture, journal: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  required
                >
                  {journaux.map(j => (
                    <option key={j.code} value={j.code}>{j.code} - {j.nom}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Libellé <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nouvelleEcriture.libelle}
                onChange={(e) => setNouvelleEcriture({...nouvelleEcriture, libelle: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                placeholder="Description de l'écriture"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Compte Débit
                </label>
                <input
                  type="text"
                  value={nouvelleEcriture.compteDebit}
                  onChange={(e) => setNouvelleEcriture({...nouvelleEcriture, compteDebit: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="Ex: 411 - Clients"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Montant Débit (DA)
                </label>
                <input
                  type="number"
                  value={nouvelleEcriture.montantDebit}
                  onChange={(e) => setNouvelleEcriture({...nouvelleEcriture, montantDebit: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Compte Crédit
                </label>
                <input
                  type="text"
                  value={nouvelleEcriture.compteCredit}
                  onChange={(e) => setNouvelleEcriture({...nouvelleEcriture, compteCredit: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="Ex: 701 - Ventes"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Montant Crédit (DA)
                </label>
                <input
                  type="number"
                  value={nouvelleEcriture.montantCredit}
                  onChange={(e) => setNouvelleEcriture({...nouvelleEcriture, montantCredit: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pièce justificative
              </label>
              <input
                type="text"
                value={nouvelleEcriture.piece}
                onChange={(e) => setNouvelleEcriture({...nouvelleEcriture, piece: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                placeholder="Ex: FAC-2025-125"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setIsNouvelleEcritureModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitNouvelleEcriture}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Créer l'Écriture
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Clôture Mensuelle */}
      {isClotureModalOpen && (
        <Modal
          isOpen={isClotureModalOpen}
          onClose={() => setIsClotureModalOpen(false)}
          title="Clôture Mensuelle"
        >
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900 mb-3">Résumé de la période</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Période:</span>
                  <span className="font-medium text-slate-900">{new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Débit:</span>
                  <span className="font-medium text-cyan-600">{formatCurrency(totalDebit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Crédit:</span>
                  <span className="font-medium text-emerald-600">{formatCurrency(totalCredit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Nombre d'écritures:</span>
                  <span className="font-medium text-slate-900">{ecritures.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Équilibre:</span>
                  <span className={`font-medium ${totalDebit === totalCredit ? 'text-emerald-600' : 'text-red-600'}`}>
                    {totalDebit === totalCredit ? '✓ Équilibré' : '⚠ Déséquilibré'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>⚠️ Attention:</strong> La clôture mensuelle verrouillera toutes les écritures de cette période. 
                Cette action est irréversible. Assurez-vous que toutes les écritures sont validées et équilibrées.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setIsClotureModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmCloture}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Confirmer la Clôture
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de notification */}
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        details={notification.details}
        onConfirm={notification.onConfirm}
        confirmText={notification.confirmText}
        cancelText={notification.cancelText}
      />
    </div>
  );
};

export default JournauxEcritures;





