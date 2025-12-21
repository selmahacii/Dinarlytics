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
import Card from '../../components/UI/Card';
import Modal from '../../components/UI/Modal';
import { useApp } from '../../context/AppContext';
import { usePermission } from '../../hooks/usePermission';
import { useTranslation } from '../../hooks/useTranslation';
import type { ReleveBancaire, LigneReleveBancaire, EcritureComptable, RapprochementBancaire, ImportReleveResult } from '../../types';

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
  
  // Données mockées - Comptes bancaires
  const [comptesBancaires] = useState([
    {
      id: 'compte-001',
      nom: 'Compte Principal - BNA',
      banque: 'Banque Nationale d\'Algérie',
      iban: 'DZ86 0070 0000 0000 0000 0000',
      solde: 45000000,
      devise: 'DZD' as const
    },
    {
      id: 'compte-002',
      nom: 'Compte Opérationnel - ABC',
      banque: 'Arab Bank Algeria',
      iban: 'DZ86 0060 0000 0000 0000 0001',
      solde: 12500000,
      devise: 'DZD' as const
    }
  ]);
  
  // Données mockées - Relevés bancaires
  const [releves] = useState<ReleveBancaire[]>([
    {
      id: 'rel-001',
      compteBancaireId: 'compte-001',
      compteBancaire: comptesBancaires[0],
      numeroReleve: 'REL-2025-01',
      dateDebut: '2025-01-01',
      dateFin: '2025-01-31',
      soldeDebut: 42000000,
      soldeFin: 45000000,
      dateImport: '2025-02-05',
      formatFichier: 'csv',
      lignes: [
        {
          id: 'ligne-001',
          dateOperation: '2025-01-05',
          dateValeur: '2025-01-05',
          libelle: 'VIR CLIENT SARL DZ',
          reference: 'VIR-001',
          montant: 5000000,
          type: 'credit',
          solde: 47000000,
          statutRapprochement: 'rapproche',
          ecritureRapprocheeId: 'ecr-001',
          scoreConfiance: 95
        },
        {
          id: 'ligne-002',
          dateOperation: '2025-01-10',
          dateValeur: '2025-01-10',
          libelle: 'CHQ FOURNISSEUR ACME',
          reference: 'CHQ-5678',
          montant: 2500000,
          type: 'debit',
          solde: 44500000,
          numeroCheque: '5678',
          statutRapprochement: 'rapproche',
          ecritureRapprocheeId: 'ecr-002',
          scoreConfiance: 98
        },
        {
          id: 'ligne-003',
          dateOperation: '2025-01-15',
          dateValeur: '2025-01-15',
          libelle: 'FRAIS TENUE COMPTE',
          reference: 'FRAIS-JAN',
          montant: 50000,
          type: 'debit',
          solde: 44450000,
          statutRapprochement: 'non_rapproche'
        },
        {
          id: 'ligne-004',
          dateOperation: '2025-01-20',
          dateValeur: '2025-01-20',
          libelle: 'VIREMENT SALAIRES',
          reference: 'VIREMENT-JAN',
          montant: 8000000,
          type: 'debit',
          solde: 36450000,
          statutRapprochement: 'en_attente'
        }
      ],
      statut: 'en_cours',
      nombreLignes: 4,
      nombreRapprochees: 2,
      nombreNonRapprochees: 2,
      tauxRapprochement: 50
    }
  ]);
  
  // Données mockées - Écritures comptables
  const [ecritures] = useState<EcritureComptable[]>([
    {
      id: 'ecr-001',
      numero: 'ECR-2025-001',
      date: '2025-01-05',
      libelle: 'Virement client SARL DZ',
      compte: '512',
      compteLibelle: 'Banque',
      montant: 5000000,
      type: 'credit',
      sens: 'C',
      journal: 'BANQUE',
      piece: 'PIECE-001',
      reference: 'VIR-001',
      statutRapprochement: 'rapproche',
      ligneReleveId: 'ligne-001',
      scoreMatching: 95
    },
    {
      id: 'ecr-002',
      numero: 'ECR-2025-002',
      date: '2025-01-10',
      libelle: 'Chèque fournisseur ACME',
      compte: '512',
      compteLibelle: 'Banque',
      montant: 2500000,
      type: 'debit',
      sens: 'D',
      journal: 'BANQUE',
      piece: 'PIECE-002',
      reference: 'CHQ-5678',
      statutRapprochement: 'rapproche',
      ligneReleveId: 'ligne-002',
      scoreMatching: 98
    },
    {
      id: 'ecr-003',
      numero: 'ECR-2025-003',
      date: '2025-01-20',
      libelle: 'Virement salaires janvier',
      compte: '512',
      compteLibelle: 'Banque',
      montant: 8000000,
      type: 'debit',
      sens: 'D',
      journal: 'BANQUE',
      piece: 'PIECE-003',
      reference: 'VIREMENT-JAN',
      statutRapprochement: 'en_attente',
      scoreMatching: 85
    },
    {
      id: 'ecr-004',
      numero: 'ECR-2025-004',
      date: '2025-01-25',
      libelle: 'Prélèvement assurance',
      compte: '512',
      compteLibelle: 'Banque',
      montant: 150000,
      type: 'debit',
      sens: 'D',
      journal: 'BANQUE',
      piece: 'PIECE-004',
      statutRapprochement: 'non_rapproche'
    }
  ]);
  
  // Données mockées - Rapprochements
  const [rapprochements] = useState<RapprochementBancaire[]>([
    {
      id: 'rapp-001',
      compteBancaireId: 'compte-001',
      releveBancaireId: 'rel-001',
      periode: '2025-01',
      dateDebut: '2025-01-01',
      dateFin: '2025-01-31',
      soldeComptable: 45000000,
      soldeBancaire: 45000000,
      ecarts: [],
      ecartTotal: 0,
      statut: 'en_cours',
      dateRapprochement: '2025-02-01',
      rapprochePar: user?.nom || 'Utilisateur',
      correspondances: [
        {
          ligneReleveId: 'ligne-001',
          ecritureId: 'ecr-001',
          scoreConfiance: 95,
          methodeMatching: 'montant_date',
          dateMatching: '2025-02-01'
        },
        {
          ligneReleveId: 'ligne-002',
          ecritureId: 'ecr-002',
          scoreConfiance: 98,
          methodeMatching: 'reference',
          dateMatching: '2025-02-01'
        }
      ],
      ecrituresNonRapprochees: [ecritures[3]],
      lignesReleveNonRapprochees: [
        releves[0].lignes[2],
        releves[0].lignes[3]
      ]
    }
  ]);
  
  // Calculs des KPIs
  const kpis = useMemo(() => {
    const releveActif = releves.find(r => r.statut === 'en_cours');
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
  }, [releves]);
  
  // Fonctions de gestion
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Détection automatique du format
      const extension = file.name.split('.').pop()?.toLowerCase();
      console.log('Format détecté:', extension);
    }
  };
  
  const handleImportReleve = async () => {
    if (!selectedFile || !selectedCompte) {
      alert('Veuillez sélectionner un fichier et un compte bancaire');
      return;
    }
    
    setIsImporting(true);
    
    // Simulation de l'import
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result: ImportReleveResult = {
      success: true,
      releveId: `rel-${Date.now()}`,
      nombreLignes: 15,
      nombreLignesImportees: 14,
      erreurs: [
        { ligne: 5, message: 'Format de date invalide', donnees: { date: 'invalid' } }
      ],
      avertissements: [
        { ligne: 8, message: 'Montant suspect, vérification recommandée' }
      ],
      formatDetecte: selectedFile.name.split('.').pop()?.toUpperCase()
    };
    
    setImportResult(result);
    setIsImporting(false);
    setIsImportModalOpen(false);
  };
  
  const handleRapprochementAutomatique = async () => {
    const releveARapprocher = selectedReleve || releveActif;
    if (!releveARapprocher) {
      alert('Veuillez sélectionner un relevé');
      return;
    }
    
    setIsRapprochant(true);
    
    // Simulation du rapprochement automatique avec progression
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Logique de matching automatique améliorée
    const lignesNonRapprochees = releveARapprocher.lignes.filter(l => 
      l.statutRapprochement === 'non_rapproche' || l.statutRapprochement === 'en_attente'
    );
    const ecrituresNonRapprochees = ecritures.filter(e => 
      e.statutRapprochement === 'non_rapproche' && e.compte === '512'
    );
    
    const correspondances: Array<{ 
      ligneId: string; 
      ecritureId: string; 
      score: number;
      methode: string;
    }> = [];
    
    lignesNonRapprochees.forEach(ligne => {
      let meilleureCorrespondance: { ecritureId: string; score: number; methode: string } | null = null;
      
      ecrituresNonRapprochees.forEach(ecriture => {
        let score = 0;
        let methode = '';
        
        // Matching par montant exact (priorité haute)
        const diffMontant = Math.abs(ligne.montant - ecriture.montant);
        if (diffMontant <= toleranceMontant) {
          score += 50;
          methode = 'montant_exact';
        } else if (diffMontant <= toleranceMontant * 10) {
          score += 30;
          methode = 'montant_tolerance';
        }
        
        // Matching par date (proximité)
        const dateLigne = new Date(ligne.dateOperation);
        const dateEcriture = new Date(ecriture.date);
        const diffJours = Math.abs((dateLigne.getTime() - dateEcriture.getTime()) / (1000 * 60 * 60 * 24));
        if (diffJours <= toleranceDate) {
          score += 30;
          if (!methode) methode = 'date_proximite';
        } else if (diffJours <= toleranceDate * 2) {
          score += 15;
        }
        
        // Matching par référence exacte (priorité très haute)
        if (ligne.reference && ecriture.reference) {
          if (ligne.reference === ecriture.reference) {
            score += 40;
            methode = 'reference';
          } else if (ligne.reference.toLowerCase().includes(ecriture.reference.toLowerCase()) ||
                     ecriture.reference.toLowerCase().includes(ligne.reference.toLowerCase())) {
            score += 20;
            if (!methode) methode = 'reference_partielle';
          }
        }
        
        // Matching par numéro de chèque
        if (ligne.numeroCheque && ecriture.reference && 
            ecriture.reference.includes(ligne.numeroCheque)) {
          score += 35;
          if (!methode) methode = 'numero_cheque';
        }
        
        // Matching par libellé (mots-clés communs)
        const motsLigne = ligne.libelle.toLowerCase().split(/[\s,.-]+/).filter(m => m.length > 2);
        const motsEcriture = ecriture.libelle.toLowerCase().split(/[\s,.-]+/).filter(m => m.length > 2);
        const motsCommuns = motsLigne.filter(m => motsEcriture.includes(m));
        if (motsCommuns.length >= 2) {
          score += 25;
          if (!methode) methode = 'libelle';
        } else if (motsCommuns.length === 1) {
          score += 10;
        }
        
        // Matching par type (débit/crédit)
        if (ligne.type === ecriture.type) {
          score += 5;
        } else {
          score -= 20; // Pénalité si types différents
        }
        
        // Garder la meilleure correspondance pour cette ligne
        if (score >= 70 && (!meilleureCorrespondance || score > meilleureCorrespondance.score)) {
          meilleureCorrespondance = {
            ecritureId: ecriture.id,
            score: Math.min(100, score),
            methode: methode || 'combinaison'
          };
        }
      });
      
      if (meilleureCorrespondance) {
        const { ecritureId, score, methode } = meilleureCorrespondance;
        correspondances.push({
          ligneId: ligne.id,
          ecritureId,
          score,
          methode
        });
      }
    });
    
    setIsRapprochant(false);
    
    if (correspondances.length > 0) {
      // Mettre à jour les statuts (simulation - en production, cela devrait être géré par l'état)
      alert(`✓ ${correspondances.length} correspondance(s) trouvée(s) automatiquement avec un score de confiance ≥ 70%`);
    } else {
      alert('Aucune correspondance automatique trouvée. Vérifiez les paramètres de tolérance ou effectuez un rapprochement manuel.');
    }
  };
  
  const releveActif = useMemo(() => {
    return releves.find(r => r.statut === 'en_cours') || releves[0];
  }, [releves]);
  
  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <ArrowPathIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Rapprochement Bancaire</h1>
              <p className="text-green-100">Import de relevés et rapprochement automatique</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-100 text-sm">Taux de rapprochement</p>
            <p className="text-3xl font-bold">{kpis.tauxRapprochement}%</p>
          </div>
        </div>
      </div>
      
      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card title="Total Lignes">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{kpis.totalLignes}</div>
            <div className="text-sm text-gray-600">Lignes importées</div>
          </div>
        </Card>
        
        <Card title="Rapprochées">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">{kpis.rapprochees}</div>
            <div className="text-sm text-gray-600">Correspondances</div>
          </div>
        </Card>
        
        <Card title="Non Rapprochées">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">{kpis.nonRapprochees}</div>
            <div className="text-sm text-gray-600">À traiter</div>
          </div>
        </Card>
        
        <Card title="Taux Rapprochement">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">{kpis.tauxRapprochement}%</div>
            <div className="text-sm text-gray-600">Progression</div>
          </div>
        </Card>
        
        <Card title="Écarts">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-2">{kpis.ecarts}</div>
            <div className="text-sm text-gray-600">Disputes</div>
          </div>
        </Card>
      </div>
      
      {/* Onglets */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'import', name: 'Import Relevé', icon: ArrowUpTrayIcon },
              { id: 'rapprochement', name: 'Rapprochement', icon: ArrowPathIcon },
              { id: 'ecarts', name: 'Écarts', icon: ExclamationTriangleIcon },
              { id: 'historique', name: 'Historique', icon: ClockIcon }
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
                <h3 className="text-lg font-semibold text-gray-900">Import de Relevés Bancaires</h3>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Importer Relevé</span>
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
                          {releve.statut}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Compte:</span>
                          <span className="font-medium">{releve.compteBancaire.nom}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Période:</span>
                          <span className="font-medium">
                            {new Date(releve.dateDebut).toLocaleDateString('fr-FR')} - {new Date(releve.dateFin).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lignes:</span>
                          <span className="font-medium">{releve.nombreLignes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rapprochement:</span>
                          <span className="font-medium text-green-600">{releve.tauxRapprochement}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Format:</span>
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
                          Voir détails
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
                <h3 className="text-lg font-semibold text-gray-900">Rapprochement - {releveActif.numeroReleve}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedReleve(releveActif);
                      setIsRapprochementModalOpen(true);
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
                  >
                    <FunnelIcon className="h-5 w-5" />
                    <span>Filtres</span>
                  </button>
                  <button
                    onClick={handleRapprochementAutomatique}
                    disabled={isRapprochant}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isRapprochant ? (
                      <>
                        <ArrowPathIcon className="h-5 w-5 animate-spin" />
                        <span>Rapprochement...</span>
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-5 w-5" />
                        <span>Rapprochement Auto</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card title="Lignes Relevé Non Rapprochées">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {releveActif.lignes.filter(l => l.statutRapprochement === 'non_rapproche').map((ligne) => (
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
                          onClick={() => setIsMatchingModalOpen(true)}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-900"
                        >
                          Chercher correspondance
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
                
                <Card title="Écritures Comptables Non Rapprochées">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {ecritures.filter(e => e.statutRapprochement === 'non_rapproche' && e.compte === '512').map((ecriture) => (
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
                          onClick={() => setIsMatchingModalOpen(true)}
                          className="mt-2 text-xs text-blue-600 hover:text-blue-900"
                        >
                          Chercher correspondance
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
              
              <Card title="Correspondances Trouvées">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ligne Relevé</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Écriture</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Méthode</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confiance</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                              <div className="flex space-x-2">
                                <button className="text-green-600 hover:text-green-900" title="Valider">
                                  <CheckCircleIcon className="h-5 w-5" />
                                </button>
                                <button className="text-red-600 hover:text-red-900" title="Rejeter">
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
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-900">Aucun écart détecté</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Le solde comptable correspond au solde bancaire. Tous les montants sont rapprochés.
                  </p>
                </div>
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
              Tolérance Montant (DZD)
            </label>
            <input
              type="number"
              value={toleranceMontant}
              onChange={(e) => setToleranceMontant(parseFloat(e.target.value))}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              aria-label="Tolérance Montant"
            />
            <p className="text-xs text-gray-500 mt-1">
              Montant maximum d'écart accepté pour le matching (ex: 0.01 pour 1 centime)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tolérance Date (jours)
            </label>
            <input
              type="number"
              value={toleranceDate}
              onChange={(e) => setToleranceDate(parseInt(e.target.value))}
              min="0"
              max="30"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              aria-label="Tolérance Date en jours"
            />
            <p className="text-xs text-gray-500 mt-1">
              Nombre de jours d'écart maximum accepté entre la date bancaire et comptable
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Méthodes de Matching</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Matching par montant exact (±tolérance)</li>
              <li>✓ Matching par date (proximité)</li>
              <li>✓ Matching par référence</li>
              <li>✓ Matching par libellé (mots-clés)</li>
            </ul>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setIsRapprochementModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Fermer
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
        title={selectedReleve ? `Relevé ${selectedReleve.numeroReleve}` : 'Détails Relevé'}
        size="xl"
      >
        {selectedReleve && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Compte</div>
                <div className="font-semibold">{selectedReleve.compteBancaire.nom}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Période</div>
                <div className="font-semibold">
                  {new Date(selectedReleve.dateDebut).toLocaleDateString('fr-FR')} - {new Date(selectedReleve.dateFin).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Solde Début</div>
                <div className="font-semibold">{formatCurrency(selectedReleve.soldeDebut)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Solde Fin</div>
                <div className="font-semibold">{formatCurrency(selectedReleve.soldeFin)}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Lignes du Relevé</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Solde</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
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
                            {ligne.statutRapprochement}
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
                Fermer
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span>Exporter</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RapprochementBancaire;

