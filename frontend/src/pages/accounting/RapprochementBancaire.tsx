import React, { useState, useMemo, useRef } from 'react';
import {
  ArrowPathIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  BanknotesIcon,
  CalculatorIcon,
  ClockIcon,
  ChartBarIcon,
  TableCellsIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import { useApp } from '@core/context/AppContext';
import { usePermission } from '@shared/hooks/usePermission';
import { useTranslation } from '@shared/hooks/useTranslation';
import type { ReleveBancaire, LigneReleveBancaire, EcritureComptable, RapprochementBancaire, ImportReleveResult } from '@/types';
import treasuryService from '../../services/modules/treasuryService';
import reconciliationService from '../../services/modules/reconciliationService';
import { useEffect } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RapprochementBancaire: React.FC = () => {
  const { formatCurrency, user, companyData } = useApp();
  const { t } = useTranslation();
  const { has } = usePermission();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // États principaux
  const [activeTab, setActiveTab] = useState<'import' | 'rapprochement' | 'ecarts' | 'historique'>('import');
  const [selectedCompte, setSelectedCompte] = useState<string>('');
  const [selectedReleve, setSelectedReleve] = useState<ReleveBancaire | null>(null);
  const [selectedRapprochement, setSelectedRapprochement] = useState<RapprochementBancaire | null>(null);
  
  // États pour les modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isRapprochementModalOpen, setIsRapprochementModalOpen] = useState(false);
  const [isEcartModalOpen, setIsEcartModalOpen] = useState(false);
  const [isViewReleveModalOpen, setIsViewReleveModalOpen] = useState(false);
  const [isMatchingModalOpen, setIsMatchingModalOpen] = useState(false);
  
  // États pour l'import
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportReleveResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // États pour le rapprochement
  const [isRapprochant, setIsRapprochant] = useState(false);
  const [toleranceMontant, setToleranceMontant] = useState(0.01); // 1 centime
  const [toleranceDate, setToleranceDate] = useState(5); // 5 jours
  
  const [comptesBancaires, setComptesBancaires] = useState<any[]>([]);
  const [releves, setReleves] = useState<ReleveBancaire[]>([]);
  const [ecritures, setEcritures] = useState<EcritureComptable[]>([]);
  const [selectedLigneToMatch, setSelectedLigneToMatch] = useState<LigneReleveBancaire | null>(null);
  const [selectedEcritureToMatch, setSelectedEcritureToMatch] = useState<EcritureComptable | null>(null);

  const fetchAccounts = async () => {
    try {
      const data = await treasuryService.getAccounts();
      setComptesBancaires(data);
      if (data.length > 0 && !selectedCompte) {
        setSelectedCompte(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load accounts", err);
    }
  };

  const fetchStatements = async () => {
    if (!selectedCompte) return;
    try {
      const data = await reconciliationService.getStatements(selectedCompte);
      setReleves(data);
      if (data.length > 0 && !selectedReleve) {
        setSelectedReleve(data[0]);
      }
    } catch (err) {
      console.error("Failed to load statements", err);
    }
  };

  const fetchEntries = async () => {
    if (!selectedCompte) return;
    const account = comptesBancaires.find(c => c.id === selectedCompte);
    if (!account) return;
    try {
      const data = await treasuryService.getTransactions({
        account_code: account.account_code
      });
      const mapped: EcritureComptable[] = data.map((t: any) => ({
        id: t.id,
        numero: t.id.substring(0, 8),
        date: t.date,
        libelle: t.label,
        compte: t.account_code,
        compteLibelle: "Banque",
        montant: Number(t.amount),
        type: t.type,
        sens: t.type === 'debit' ? 'D' : 'C',
        journal: "BQ",
        piece: t.reference || "",
        reference: t.reference,
        statutRapprochement: t.reconciliation_status || 'non_rapproche',
        ligneReleveId: t.ligne_releve_id
      }));
      setEcritures(mapped);
    } catch (err) {
      console.error("Failed to load transactions", err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    fetchStatements();
  }, [selectedCompte]);

  useEffect(() => {
    fetchEntries();
  }, [selectedCompte, comptesBancaires, releves]);

  const releveActif = useMemo(() => {
    return releves.find(r => r.statut === 'en_cours') || releves[0];
  }, [releves]);

  const rapprochements = useMemo<RapprochementBancaire[]>(() => {
    if (!releveActif) return [];
    const matchedLines = releveActif.lignes.filter(l => l.statutRapprochement === 'rapproche');
    const correspondances = matchedLines.map(l => ({
      ligneReleveId: l.id,
      ecritureId: l.ecritureRapprocheeId || '',
      scoreConfiance: l.scoreConfiance || 100,
      methodeMatching: 'manuel' as const,
      dateMatching: new Date().toISOString()
    }));

    // Solde comptable = somme des mouvements du compte bancaire (classe 512)
    // dans le grand livre, jusqu'à la date de fin du relevé — comparé au
    // solde de clôture du relevé bancaire lui-même (soldeBancaire). Les deux
    // étaient auparavant fixés à la même valeur (releveActif.soldeFin),
    // rendant l'écart toujours nul par construction.
    const soldeComptable = ecritures
      .filter(e => e.date <= releveActif.dateFin)
      .reduce((sum, e) => sum + (e.sens === 'D' ? e.montant : -e.montant), 0);
    const soldeBancaire = releveActif.soldeFin;
    const ecartTotal = Math.round((soldeComptable - soldeBancaire) * 100) / 100;

    return [{
      id: releveActif.id,
      compteBancaireId: selectedCompte,
      releveBancaireId: releveActif.id,
      periode: releveActif.dateDebut.substring(0, 7),
      dateDebut: releveActif.dateDebut,
      dateFin: releveActif.dateFin,
      soldeComptable,
      soldeBancaire,
      ecarts: [],
      ecartTotal,
      statut: releveActif.statut === 'rapproche' ? 'rapproche' : 'en_cours',
      dateRapprochement: new Date().toISOString(),
      rapprochePar: "Admin",
      correspondances,
      ecrituresNonRapprochees: ecritures.filter(e => e.statutRapprochement === 'non_rapproche'),
      lignesReleveNonRapprochees: releveActif.lignes.filter(l => l.statutRapprochement === 'non_rapproche')
    }];
  }, [releveActif, ecritures, selectedCompte]);
  
  // Calculs des KPIs
  const kpis = useMemo(() => {
    if (!releveActif) {
      return {
        totalLignes: 0,
        rapprochees: 0,
        nonRapprochees: 0,
        tauxRapprochement: 0,
        ecarts: 0
      };
    }
    
    return {
      totalLignes: releveActif.nombreLignes,
      rapprochees: releveActif.nombreRapprochees,
      nonRapprochees: releveActif.nombreNonRapprochees,
      tauxRapprochement: releveActif.tauxRapprochement,
      ecarts: releveActif.lignes.filter(l => l.statutRapprochement === 'dispute').length
    };
  }, [releveActif]);
  
  // Fonctions de gestion
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Parses a real bank statement CSV (comma or semicolon delimited).
  // Expected columns (case-insensitive, order-flexible): date, libelle/description, montant (signed)
  // or separate debit/credit columns, and optionally a running balance column.
  const parseStatementFile = async (file: File) => {
    const text = await file.text();
    const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (rawLines.length === 0) {
      throw new Error('Fichier vide');
    }

    const delimiter = rawLines[0].includes(';') ? ';' : ',';
    const splitRow = (row: string) => row.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));

    const headerCells = splitRow(rawLines[0]).map(c => c.toLowerCase());
    const looksLikeHeader = headerCells.some(c => /date|libell|montant|debit|credit|solde/.test(c));
    const dataRows = looksLikeHeader ? rawLines.slice(1) : rawLines;
    const idx = {
      date: headerCells.findIndex(c => c.includes('date')),
      libelle: headerCells.findIndex(c => c.includes('libell') || c.includes('description')),
      montant: headerCells.findIndex(c => c === 'montant' || c.includes('amount')),
      debit: headerCells.findIndex(c => c.includes('debit')),
      credit: headerCells.findIndex(c => c.includes('credit')),
      solde: headerCells.findIndex(c => c.includes('solde') || c.includes('balance')),
    };

    const parseAmount = (raw: string) => {
      const n = parseFloat(raw.replace(/\s/g, '').replace(',', '.'));
      return isNaN(n) ? 0 : n;
    };

    const lignes: Array<{ id: string; dateOperation: string; dateValeur: string; libelle: string; montant: number; type: 'credit' | 'debit'; solde: number; statutRapprochement: string }> = [];
    let runningBalance = 0;
    const dates: string[] = [];

    dataRows.forEach((row, i) => {
      const cells = splitRow(row);
      if (cells.length < 2) return;

      const dateRaw = idx.date >= 0 ? cells[idx.date] : cells[0];
      const libelle = idx.libelle >= 0 ? cells[idx.libelle] : (cells[1] || 'Opération');

      let montant = 0;
      let type: 'credit' | 'debit' = 'credit';
      if (idx.debit >= 0 || idx.credit >= 0) {
        const debitVal = idx.debit >= 0 ? parseAmount(cells[idx.debit] || '0') : 0;
        const creditVal = idx.credit >= 0 ? parseAmount(cells[idx.credit] || '0') : 0;
        if (debitVal > 0) { montant = debitVal; type = 'debit'; } else { montant = creditVal; type = 'credit'; }
      } else if (idx.montant >= 0) {
        const val = parseAmount(cells[idx.montant] || '0');
        montant = Math.abs(val);
        type = val < 0 ? 'debit' : 'credit';
      } else {
        const val = parseAmount(cells[cells.length - 1] || '0');
        montant = Math.abs(val);
        type = val < 0 ? 'debit' : 'credit';
      }

      runningBalance += type === 'credit' ? montant : -montant;
      const solde = idx.solde >= 0 ? parseAmount(cells[idx.solde] || '0') : runningBalance;

      const isoDate = /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? dateRaw : new Date().toISOString().split('T')[0];
      dates.push(isoDate);

      lignes.push({
        id: `line-${Date.now()}-${i}`,
        dateOperation: isoDate,
        dateValeur: isoDate,
        libelle: libelle || 'Opération',
        montant,
        type,
        solde,
        statutRapprochement: 'non_rapproche'
      });
    });

    if (lignes.length === 0) {
      throw new Error('Aucune ligne exploitable trouvée dans le fichier');
    }

    dates.sort();
    return {
      lignes,
      dateDebut: dates[0],
      dateFin: dates[dates.length - 1],
      soldeDebut: 0,
      soldeFin: lignes[lignes.length - 1].solde
    };
  };

  const handleImportReleve = async () => {
    if (!selectedFile || !selectedCompte) {
      alert('Veuillez sélectionner un fichier et un compte bancaire');
      return;
    }

    setIsImporting(true);

    try {
      const parsed = await parseStatementFile(selectedFile);
      const data = await reconciliationService.importStatement({
        compteBancaireId: selectedCompte,
        numeroReleve: `REL-${Date.now().toString().substring(6)}`,
        dateDebut: parsed.dateDebut,
        dateFin: parsed.dateFin,
        soldeDebut: parsed.soldeDebut,
        soldeFin: parsed.soldeFin,
        formatFichier: selectedFile.name.split('.').pop()?.toLowerCase() || "manuel",
        lignes: parsed.lignes
      });
      
      const result: ImportReleveResult = {
        success: true,
        releveId: data.id,
        nombreLignes: data.nombreLignes,
        nombreLignesImportees: data.nombreLignes,
        erreurs: [],
        avertissements: [],
        formatDetecte: data.formatFichier.toUpperCase()
      };
      
      setImportResult(result);
      await fetchStatements();
    } catch (err) {
      console.error("Failed to import bank statement", err);
      alert("Erreur lors de l'import du relevé bancaire");
    } finally {
      setIsImporting(false);
      setIsImportModalOpen(false);
    }
  };
  
  const handleRapprochementAutomatique = async () => {
    const releveARapprocher = selectedReleve || releveActif;
    if (!releveARapprocher) {
      alert('Veuillez sélectionner un relevé');
      return;
    }
    
    setIsRapprochant(true);
    
    try {
      const result = await reconciliationService.autoMatch(releveARapprocher.id, toleranceDate, toleranceMontant);
      alert(`✓ ${result.matched_lines_count} correspondance(s) trouvée(s) automatiquement avec un score de confiance ≥ 70%`);
      await fetchStatements();
    } catch (err) {
      console.error("Failed to auto match", err);
      alert("Erreur lors du rapprochement automatique");
    } finally {
      setIsRapprochant(false);
    }
  };

  const handleManualMatch = async (ligneId: string, ecritureId: string) => {
    try {
      await reconciliationService.match(ligneId, ecritureId);
      await fetchStatements();
    } catch (err) {
      console.error("Failed to match manually", err);
      alert("Erreur lors du rapprochement manuel");
    }
  };

  const handleUnmatch = async (lineId: string) => {
    try {
      await reconciliationService.unmatch(lineId);
      await fetchStatements();
    } catch (err) {
      console.error("Failed to remove match", err);
      alert("Erreur lors de la suppression de la correspondance");
    }
  };
  
  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <ArrowPathIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t('accounting.treasury.reconciliation.title')}</h1>
              <p className="text-green-100">{t('accounting.treasury.reconciliation.subtitle')}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-100 text-sm">{t('accounting.treasury.reconciliation.kpis.reconciliation_rate')}</p>
            <p className="text-3xl font-bold">{kpis.tauxRapprochement}%</p>
          </div>
        </div>
      </div>
      
      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card title={t('accounting.treasury.reconciliation.kpis.total_lines')}>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{kpis.totalLignes || 0}</div>
            <div className="text-sm text-gray-600">{t('accounting.treasury.reconciliation.kpis.lines_imported')}</div>
          </div>
        </Card>
        
        <Card title={t('accounting.treasury.reconciliation.kpis.matched')}>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">{kpis.rapprochees}</div>
            <div className="text-sm text-gray-600">{t('accounting.treasury.reconciliation.kpis.matches')}</div>
          </div>
        </Card>
        
        <Card title={t('accounting.treasury.reconciliation.kpis.unmatched')}>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">{kpis.nonRapprochees}</div>
            <div className="text-sm text-gray-600">{t('accounting.treasury.reconciliation.kpis.to_process')}</div>
          </div>
        </Card>
        
        <Card title={t('accounting.treasury.reconciliation.kpis.reconciliation_rate')}>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">{kpis.tauxRapprochement}%</div>
            <div className="text-sm text-gray-600">{t('accounting.treasury.reconciliation.kpis.progression')}</div>
          </div>
        </Card>
        
        <Card title={t('accounting.treasury.reconciliation.kpis.discrepancies')}>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-2">{kpis.ecarts}</div>
            <div className="text-sm text-gray-600">{t('accounting.treasury.reconciliation.kpis.disputes')}</div>
          </div>
        </Card>
      </div>
      
      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'import', name: t('accounting.treasury.reconciliation.tabs.import'), icon: ArrowUpTrayIcon },
              { id: 'rapprochement', name: t('accounting.treasury.reconciliation.tabs.reconciliation'), icon: ArrowPathIcon },
              { id: 'ecarts', name: t('accounting.treasury.reconciliation.tabs.discrepancies'), icon: ExclamationTriangleIcon },
              { id: 'historique', name: t('accounting.treasury.reconciliation.tabs.history'), icon: ClockIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6">
          {/* Import Relevé */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">{t('accounting.treasury.reconciliation.import.title')}</h3>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>{t('accounting.treasury.reconciliation.import.action')}</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {releves.map((releve) => (
                  <Card key={releve.id}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{releve.numeroReleve}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          releve.statut === 'rapproche' ? 'bg-green-100 text-green-800' :
                          releve.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                          releve.statut === 'importe' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {t(`accounting.treasury.reconciliation.status.${releve.statut}`)}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('accounting.treasury.reconciliation.details.account')}:</span>
                          <span className="font-medium">{releve.compteBancaire.nom}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('accounting.treasury.reconciliation.details.period')}:</span>
                          <span className="font-medium">
                            {new Date(releve.dateDebut).toLocaleDateString('fr-FR')} - {new Date(releve.dateFin).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('accounting.treasury.reconciliation.details.lines')}:</span>
                          <span className="font-medium">{releve.nombreLignes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('accounting.treasury.reconciliation.details.reconciliation')}:</span>
                          <span className="font-medium text-green-600">{releve.tauxRapprochement}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('accounting.treasury.reconciliation.details.format')}:</span>
                          <span className="font-medium uppercase">{releve.formatFichier}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedReleve(releve);
                            setIsViewReleveModalOpen(true);
                          }}
                          className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-sm font-medium"
                        >
                          {t('accounting.treasury.reconciliation.details.view_details')}
                        </button>
                        <button type="button" className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100" aria-label="Télécharger le relevé">
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Rapprochement */}
          {activeTab === 'rapprochement' && releveActif && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">{t('accounting.treasury.reconciliation.tabs.reconciliation')} - {releveActif.numeroReleve}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedReleve(releveActif);
                      setIsRapprochementModalOpen(true);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
                  >
                    <FunnelIcon className="h-5 w-5" />
                    <span>{t('accounting.treasury.reconciliation.reconciliation.filters')}</span>
                  </button>
                  <button
                    onClick={handleRapprochementAutomatique}
                    disabled={isRapprochant}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isRapprochant ? (
                      <>
                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                        <span>{t('accounting.treasury.reconciliation.reconciliation.auto_running')}</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-5 w-5" />
                        <span>{t('accounting.treasury.reconciliation.reconciliation.automate')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card title={t('accounting.treasury.reconciliation.reconciliation.unmatched_lines')}>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {releveActif?.lignes?.filter(l => l.statutRapprochement === 'non_rapproche').map((ligne) => (
                      <div key={ligne.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-gray-900">{ligne.libelle}</div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            ligne.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {ligne.type === 'credit' ? '+' : '-'}{formatCurrency(ligne.montant)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {new Date(ligne.dateOperation).toLocaleDateString('fr-FR')} • {ligne.reference || 'Sans référence'}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedLigneToMatch(ligne);
                            setIsMatchingModalOpen(true);
                          }}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-900"
                        >
                          {t('accounting.treasury.reconciliation.reconciliation.search_match')}
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
                
                <Card title={t('accounting.treasury.reconciliation.reconciliation.unmatched_entries')}>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {ecritures?.filter(e => e.statutRapprochement === 'non_rapproche').map((ecriture) => (
                      <div key={ecriture.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium text-gray-900">{ecriture.libelle}</div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            ecriture.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {ecriture.type === 'credit' ? '+' : '-'}{formatCurrency(ecriture.montant)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          {new Date(ecriture.date).toLocaleDateString('fr-FR')} • {ecriture.reference || 'Sans référence'}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedEcritureToMatch(ecriture);
                            setIsMatchingModalOpen(true);
                          }}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-900"
                        >
                          {t('accounting.treasury.reconciliation.reconciliation.search_match')}
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
              
              <Card title={t('accounting.treasury.reconciliation.reconciliation.found_matches')}>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('accounting.treasury.reconciliation.table.bank_line')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('accounting.treasury.reconciliation.table.accounting_entry')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('accounting.treasury.reconciliation.table.amount')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('accounting.treasury.reconciliation.table.method')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('accounting.treasury.reconciliation.table.confidence')}</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('accounting.treasury.reconciliation.table.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rapprochements[0]?.correspondances.map((corr, idx) => {
                        const ligne = releveActif.lignes.find(l => l.id === corr.ligneReleveId);
                        const ecriture = ecritures.find(e => e.id === corr.ecritureId);
                        if (!ligne || !ecriture) return null;
                        
                        return (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-sm text-gray-900">{ligne.libelle}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{ecriture.libelle}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {formatCurrency(ligne.montant)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                              {corr.methodeMatching.replace('_', ' ')}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      corr.scoreConfiance >= 90 ? 'bg-green-500' :
                                      corr.scoreConfiance >= 70 ? 'bg-yellow-500' : 'bg-orange-500'
                                    }`}
                                    style={{ width: `${corr.scoreConfiance}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-600">{corr.scoreConfiance}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center space-x-2">
                                <span className="flex items-center text-green-600" title="Déjà rapproché">
                                  <CheckCircleIcon className="h-5 w-5" />
                                </span>
                                <button
                                  className="text-red-600 hover:text-red-900"
                                  title="Annuler le rapprochement"
                                  onClick={() => handleUnmatch(ligne.id)}
                                >
                                  <XCircleIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
          
          {/* Écarts */}
          {activeTab === 'ecarts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Écarts et Disputes</h3>
              </div>
              
              <Card title="Écarts Identifiés">
                {rapprochements[0] && rapprochements[0].ecartTotal !== 0 ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                      <span className="font-semibold text-red-900">
                        Écart de {formatCurrency(Math.abs(rapprochements[0].ecartTotal))} détecté
                      </span>
                    </div>
                    <p className="text-sm text-red-700">
                      Solde comptable : {formatCurrency(rapprochements[0].soldeComptable)} — Solde bancaire : {formatCurrency(rapprochements[0].soldeBancaire)}.
                      Vérifiez les lignes non rapprochées ci-dessous.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-900">Aucun écart détecté</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Le solde comptable correspond au solde bancaire. Tous les montants sont rapprochés.
                    </p>
                  </div>
                )}
                {releveActif && releveActif.lignes.filter(l => l.statutRapprochement === 'non_rapproche').length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700">Lignes non rapprochées</h4>
                    {releveActif.lignes.filter(l => l.statutRapprochement === 'non_rapproche').map(l => (
                      <div key={l.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                        <span className="text-gray-700">{l.libelle} — {l.dateOperation}</span>
                        <span className="font-medium text-gray-900">{formatCurrency(l.montant)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}
          
          {/* Historique */}
          {activeTab === 'historique' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Historique des Rapprochements</h3>
              </div>
              
              <Card title="Rapprochements Précédents">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compte</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solde Comptable</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solde Bancaire</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Écart</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rapprochements.map((rapp) => (
                        <tr key={rapp.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{rapp.periode}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {comptesBancaires.find(c => c.id === rapp.compteBancaireId)?.nom}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {formatCurrency(rapp.soldeComptable)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {formatCurrency(rapp.soldeBancaire)}
                          </td>
                          <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                            rapp.ecartTotal === 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {rapp.ecartTotal === 0 ? '✓ Équilibré' : formatCurrency(rapp.ecartTotal)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              rapp.statut === 'rapproche' ? 'bg-green-100 text-green-800' :
                              rapp.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                              rapp.statut === 'dispute' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {rapp.statut}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <button type="button" className="text-blue-600 hover:text-blue-900" aria-label="Voir détails">
                              <EyeIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal Import Relevé */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Importer un Relevé Bancaire"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compte Bancaire
            </label>
            <select
              value={selectedCompte}
              onChange={(e) => setSelectedCompte(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              aria-label="Compte Bancaire"
            >
              <option value="">Sélectionner un compte</option>
              {comptesBancaires.map((compte) => (
                <option key={compte.id} value={compte.id}>
                  {compte.nom} - {compte.iban}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fichier Relevé
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                    <span>Choisir un fichier</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".csv,.ofx,.xml,.xlsx,.xls,.pdf"
                    />
                  </label>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <p className="text-xs text-gray-500">
                  CSV, OFX, XML, Excel, PDF jusqu'à 10MB
                </p>
                {selectedFile && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {importResult && (
            <div className={`p-4 rounded-lg ${
              importResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {importResult.success ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-semibold ${
                  importResult.success ? 'text-green-900' : 'text-red-900'
                }`}>
                  {importResult.success ? 'Import réussi' : 'Erreur d\'import'}
                </span>
              </div>
              <div className="text-sm text-gray-700">
                <p>{importResult.nombreLignesImportees} / {importResult.nombreLignes} lignes importées</p>
                {importResult.erreurs.length > 0 && (
                  <p className="text-red-600 mt-1">
                    {importResult.erreurs.length} erreur(s) détectée(s)
                  </p>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              onClick={handleImportReleve}
              disabled={!selectedFile || !selectedCompte || isImporting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {isImporting ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  <span>Import en cours...</span>
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="h-5 w-5" />
                  <span>Importer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Modal Paramètres Rapprochement */}
      <Modal
        isOpen={isRapprochementModalOpen}
        onClose={() => setIsRapprochementModalOpen(false)}
        title="Paramètres de Rapprochement Automatique"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('accounting.treasury.reconciliation.modals.tolerance_montant')}
            </label>
            <input
              type="number"
              value={toleranceMontant}
              onChange={(e) => setToleranceMontant(parseFloat(e.target.value))}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              aria-label={t('accounting.treasury.reconciliation.modals.tolerance_montant')}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('accounting.treasury.reconciliation.modals.tolerance_montant_desc')}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('accounting.treasury.reconciliation.modals.tolerance_date')}
            </label>
            <input
              type="number"
              value={toleranceDate}
              onChange={(e) => setToleranceDate(parseInt(e.target.value))}
              min="0"
              max="30"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              aria-label={t('accounting.treasury.reconciliation.modals.tolerance_date')}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t('accounting.treasury.reconciliation.modals.tolerance_date_desc')}
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">{t('accounting.treasury.reconciliation.modals.matching_methods')}</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ {t('accounting.treasury.reconciliation.modals.method_exact')}</li>
              <li>✓ {t('accounting.treasury.reconciliation.modals.method_date')}</li>
              <li>✓ {t('accounting.treasury.reconciliation.modals.method_ref')}</li>
              <li>✓ {t('accounting.treasury.reconciliation.modals.method_label')}</li>
            </ul>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setIsRapprochementModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              {t('accounting.treasury.reconciliation.modals.close')}
            </button>
            <button
              onClick={() => {
                handleRapprochementAutomatique();
                setIsRapprochementModalOpen(false);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Appliquer et Rapprocher
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Modal Voir Relevé */}
      <Modal
        isOpen={isViewReleveModalOpen}
        onClose={() => setIsViewReleveModalOpen(false)}
        title={selectedReleve ? t('accounting.treasury.reconciliation.modals.statement_title', { numero: selectedReleve.numeroReleve }) : t('accounting.treasury.reconciliation.modals.statement_details')}
        size="xl"
      >
        {selectedReleve && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">{t('accounting.treasury.reconciliation.details.account')}</div>
                <div className="font-semibold">{selectedReleve.compteBancaire.nom}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">{t('accounting.treasury.reconciliation.details.period')}</div>
                <div className="font-semibold">
                  {new Date(selectedReleve.dateDebut).toLocaleDateString('fr-FR')} - {new Date(selectedReleve.dateFin).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">{t('accounting.treasury.reconciliation.modals.solde_debut')}</div>
                <div className="font-semibold">{formatCurrency(selectedReleve.soldeDebut)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">{t('accounting.treasury.reconciliation.modals.solde_fin')}</div>
                <div className="font-semibold">{formatCurrency(selectedReleve.soldeFin)}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">{t('accounting.treasury.reconciliation.modals.statement_lines')}</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('accounting.treasury.reconciliation.table.date')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('accounting.treasury.reconciliation.table.bank_line')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('accounting.treasury.reconciliation.table.reference')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('accounting.treasury.reconciliation.table.amount')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{t('common.balance')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('accounting.treasury.reconciliation.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedReleve.lignes.map((ligne) => (
                      <tr key={ligne.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {new Date(ligne.dateOperation).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{ligne.libelle}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{ligne.reference || '-'}</td>
                        <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-medium ${
                          ligne.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {ligne.type === 'credit' ? '+' : '-'}{formatCurrency(ligne.montant)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-600">
                          {formatCurrency(ligne.solde)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            ligne.statutRapprochement === 'rapproche' ? 'bg-green-100 text-green-800' :
                            ligne.statutRapprochement === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                            ligne.statutRapprochement === 'dispute' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {t(`accounting.treasury.reconciliation.status.${ligne.statutRapprochement}`)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setIsViewReleveModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                {t('accounting.treasury.reconciliation.modals.close')}
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>{t('accounting.treasury.reconciliation.modals.export')}</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Matching Manuel */}
      <Modal
        isOpen={isMatchingModalOpen}
        onClose={() => {
          setIsMatchingModalOpen(false);
          setSelectedLigneToMatch(null);
          setSelectedEcritureToMatch(null);
        }}
        title="Rapprochement Manuel"
        size="lg"
      >
        <div className="space-y-4">
          {selectedLigneToMatch && (
            <div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <div className="text-xs font-semibold uppercase text-blue-800">Ligne de relevé bancaire sélectionnée</div>
                <div className="text-sm font-medium text-gray-900 mt-1">{selectedLigneToMatch.libelle}</div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                  <span>{new Date(selectedLigneToMatch.dateOperation).toLocaleDateString('fr-FR')} • Ref: {selectedLigneToMatch.reference || 'Aucune'}</span>
                  <span className={`font-semibold ${selectedLigneToMatch.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedLigneToMatch.type === 'credit' ? '+' : '-'}{formatCurrency(selectedLigneToMatch.montant)}
                  </span>
                </div>
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">Sélectionner une écriture comptable correspondante :</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {ecritures?.filter(e => e.statutRapprochement === 'non_rapproche').map((entry) => {
                  const isSameAmount = Math.abs(entry.montant - selectedLigneToMatch.montant) < 0.01;
                  return (
                    <div 
                      key={entry.id} 
                      onClick={() => handleManualMatch(selectedLigneToMatch.id, entry.id).then(() => {
                        setIsMatchingModalOpen(false);
                        setSelectedLigneToMatch(null);
                      })}
                      className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition ${
                        isSameAmount 
                          ? 'bg-green-50 border-green-300 hover:bg-green-100' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">{entry.libelle}</div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(entry.date).toLocaleDateString('fr-FR')} • Journal: {entry.journal}</div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-semibold ${entry.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {entry.type === 'credit' ? '+' : '-'}{formatCurrency(entry.montant)}
                        </span>
                        {isSameAmount && (
                          <div className="text-[10px] text-green-700 font-semibold mt-1">Montant identique</div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {ecritures?.filter(e => e.statutRapprochement === 'non_rapproche').length === 0 && (
                  <p className="text-sm text-gray-500 italic text-center py-4">Aucune écriture comptable non rapprochée disponible.</p>
                )}
              </div>
            </div>
          )}

          {selectedEcritureToMatch && (
            <div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <div className="text-xs font-semibold uppercase text-blue-800">Écriture comptable sélectionnée</div>
                <div className="text-sm font-medium text-gray-900 mt-1">{selectedEcritureToMatch.libelle}</div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                  <span>{new Date(selectedEcritureToMatch.date).toLocaleDateString('fr-FR')} • Ref: {selectedEcritureToMatch.reference || 'Aucune'}</span>
                  <span className={`font-semibold ${selectedEcritureToMatch.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedEcritureToMatch.type === 'credit' ? '+' : '-'}{formatCurrency(selectedEcritureToMatch.montant)}
                  </span>
                </div>
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">Sélectionner une ligne de relevé correspondante :</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {releveActif?.lignes?.filter(l => l.statutRapprochement === 'non_rapproche').map((ligne) => {
                  const isSameAmount = Math.abs(ligne.montant - selectedEcritureToMatch.montant) < 0.01;
                  return (
                    <div 
                      key={ligne.id} 
                      onClick={() => handleManualMatch(ligne.id, selectedEcritureToMatch.id).then(() => {
                        setIsMatchingModalOpen(false);
                        setSelectedEcritureToMatch(null);
                      })}
                      className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition ${
                        isSameAmount 
                          ? 'bg-green-50 border-green-300 hover:bg-green-100' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ligne.libelle}</div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(ligne.dateOperation).toLocaleDateString('fr-FR')} • Ref: {ligne.reference || 'Aucune'}</div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-semibold ${ligne.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {ligne.type === 'credit' ? '+' : '-'}{formatCurrency(ligne.montant)}
                        </span>
                        {isSameAmount && (
                          <div className="text-[10px] text-green-700 font-semibold mt-1">Montant identique</div>
                        )}
                      </div>
                    </div>
                  );
                })}
                {(!releveActif || releveActif.lignes.filter(l => l.statutRapprochement === 'non_rapproche').length === 0) && (
                  <p className="text-sm text-gray-500 italic text-center py-4">Aucune ligne de relevé non rapprochée disponible.</p>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                setIsMatchingModalOpen(false);
                setSelectedLigneToMatch(null);
                setSelectedEcritureToMatch(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              {t('accounting.treasury.reconciliation.modals.close')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RapprochementBancaire;





