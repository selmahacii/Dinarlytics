import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
  DocumentIcon,
  DocumentCheckIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  FunnelIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  StarIcon,
  TagIcon,
  BanknotesIcon,
  DocumentDuplicateIcon,
  ChartPieIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';
// import api from '@/services/api'; // Removed in favor of useSuppliers
import { useSuppliers } from '@shared/hooks/useSuppliers';
import { Fournisseur } from '@/types';
import LineChart from '@shared/components/Charts/LineChart';
import BarChart from '@shared/components/Charts/BarChart';
import DoughnutChart from '@shared/components/Charts/DoughnutChart';
import HelpButton from '@shared/components/UI/HelpButton';
import SuccessMessage from '@shared/components/UI/SuccessMessage';
import SignaturePad from '@shared/components/UI/SignaturePad';
import {
  analyserPerformanceFournisseur,
  optimiserCouts,
  genererPrevisionsAchats,
  genererOpportunitesNegociation,
  evaluerRisquesFournisseurs,
  type AnalysePerformanceFournisseur,
  type OptimisationCout,
  type PrevisionAchat,
  type Negociation,
  type RisqueFournisseur
} from '@shared/utils/fournisseurs';

// Missing icons for the new UI
import {
  BuildingLibraryIcon,
  ShieldCheckIcon,
  CpuChipIcon as CpuChipIconSolid,
  SparklesIcon as SparklesIconSolid
} from '@heroicons/react/24/solid';

// --- Composant Formulaire Facture avec OCR ---

interface InvoiceFormWithOCRProps {
  topFournisseurs: any[];
  onClose: () => void;
}

const InvoiceFormWithOCR: React.FC<InvoiceFormWithOCRProps> = ({ topFournisseurs, onClose }) => {
  const [ocrLoading, setOcrLoading] = useState(false);
  const [scannedFile, setScannedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    fournisseur: '',
    numero: '',
    dateEmission: new Date().toISOString().split('T')[0],
    dateEcheance: '',
    totalHT: 0,
    totalTVA: 0,
    droitTimbre: 0,
    totalTTC: 0,
    paymentMode: 'virement',
    notes: ''
  });
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const { formatCurrency } = useApp();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScannedFile(file);
      await processOCR(file);
    }
  };

  const processOCR = async (file: File) => {
    setOcrLoading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/ocr/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const extracted = result.data;

          // Auto-fill logic
          setFormData(prev => ({
            ...prev,
            totalTTC: extracted.total_amount || prev.totalTTC,
            dateEmission: extracted.date ? formatDateForInput(extracted.date) : prev.dateEmission,
            notes: `[OCR] NIF détecté: ${extracted.merchant_nif || 'Non'}. \n` + prev.notes
          }));

          // Tentative de mapping fournisseur
          if (extracted.merchant_nif) {
            const matched = topFournisseurs.find(f => f.nif === extracted.merchant_nif);
            if (matched) {
              setFormData(prev => ({
                ...prev,
                fournisseur: matched.nom,
                totalTTC: extracted.total_amount || prev.totalTTC,
                dateEmission: extracted.date ? formatDateForInput(extracted.date) : prev.dateEmission,
              }));
              alert(`OCR Terminé ! Fournisseur détecté: ${matched.nom}. Montant: ${extracted.total_amount}`);
            } else {
              alert(`OCR Terminé ! Montant: ${extracted.total_amount}, NIF: ${extracted.merchant_nif}`);
            }
          } else {
            alert(`OCR Terminé ! Montant: ${extracted.total_amount}`);
          }
        }
      }
    } catch (error) {
      console.error("OCR Error", error);
      alert("Erreur lors de l'analyse OCR.");
    } finally {
      setOcrLoading(false);
    }
  };

  // Helper to convert DD/MM/YYYY to YYYY-MM-DD
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    // Basic parser assuming DD/MM/YYYY or similar
    const parts = dateStr.split(/[\/\-\.]/);
    if (parts.length === 3) {
      // Assume day/month/year if first part is small? Or strict format?
      // Let's assume DD/MM/YYYY
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  }

  return (
    <form className="space-y-6">
      {/* Zone OCR */}
      <div className="bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-lg p-6 text-center hover:bg-indigo-100 transition-colors cursor-pointer relative">
        <input
          type="file"
          accept="image/*,application/pdf"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
        />
        {ocrLoading ? (
          <div className="flex flex-col items-center">
            <ArrowPathIcon className="h-10 w-10 text-indigo-600 animate-spin" />
            <p className="mt-2 text-sm font-medium text-indigo-800">Analyse intelligente en cours...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <DocumentTextIcon className="h-10 w-10 text-indigo-500 mb-2" />
            <p className="text-sm font-medium text-indigo-900">
              {scannedFile ? `Fichier prêt: ${scannedFile.name}` : "Scanner / Importer une facture"}
            </p>
            <p className="text-xs text-indigo-600 mt-1">
              {scannedFile ? "Cliquez pour changer" : "Glissez un fichier ou cliquez pour utiliser la caméra"}
            </p>
          </div>
        )}
      </div>

      {/* Informations générales */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
          Informations Générales
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fournisseur *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              value={formData.fournisseur}
              onChange={e => setFormData({ ...formData, fournisseur: e.target.value })}
            >
              <option value="">Sélectionner un fournisseur</option>
              {topFournisseurs.map((f, idx) => (
                <option key={idx} value={f.nom}>{f.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de Facture *
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="FAC-2024-XXX"
              required
              value={formData.numero}
              onChange={e => setFormData({ ...formData, numero: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'émission *
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              value={formData.dateEmission}
              onChange={e => setFormData({ ...formData, dateEmission: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'échéance *
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              value={formData.dateEcheance}
              onChange={e => setFormData({ ...formData, dateEcheance: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Articles (Simplifié pour l'exemple, normalement dynamique) */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2 text-green-600" />
          Articles (Saisie manuelle pour l'instant)
        </h3>
        <p className="text-sm text-gray-500 mb-4">L'extraction automatique des lignes d'articles est prévue pour la version 2.0.</p>
      </div>

      {/* Totaux */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <CurrencyDollarIcon className="h-5 w-5 mr-2 text-blue-600" />
          Totaux (Détectés par OCR)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total HT</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              value={formData.totalHT}
              onChange={e => setFormData({ ...formData, totalHT: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total TVA</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              value={formData.totalTVA}
              onChange={e => setFormData({ ...formData, totalTVA: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode de Paiement</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.paymentMode}
              onChange={e => {
                const mode = e.target.value;
                let timbre = 0;
                if (mode === 'especes') {
                  const rawTimbre = (formData.totalHT + formData.totalTVA) * 0.01;
                  timbre = Math.min(Math.max(Math.ceil(rawTimbre), 5), 2500);
                }
                setFormData({ ...formData, paymentMode: mode, droitTimbre: timbre, totalTTC: formData.totalHT + formData.totalTVA + timbre });
              }}
            >
              <option value="virement">Virement Bancaire</option>
              <option value="cheque">Chèque</option>
              <option value="especes">Espèces (Droit de timbre)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total TTC</label>
            <div className="relative">
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold bg-slate-50"
                placeholder="0"
                value={formData.totalTTC}
                readOnly
              />
              {formData.paymentMode === 'especes' && (
                <span className="absolute right-3 top-2 text-[10px] font-black text-amber-600 uppercase">Incl. Timbre: {formData.droitTimbre} DZD</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Signature Électronique */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <DocumentCheckIcon className="h-5 w-5 mr-2 text-blue-600" />
          Signature Électronique
        </h3>

        {!signatureData && !showSignaturePad && (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowSignaturePad(true)}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <DocumentCheckIcon className="h-5 w-5" />
              Ajouter une signature
            </button>
          </div>
        )}

        {showSignaturePad && !signatureData && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border-2 border-gray-300 p-2">
              <SignaturePad
                onSave={(dataUrl: string) => {
                  setSignatureData(dataUrl);
                  setShowSignaturePad(false);
                }}
                onCancel={() => setShowSignaturePad(false)}
                className="w-full"
              />
            </div>
          </div>
        )}

        {signatureData && (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800 flex items-center gap-2">
              <CheckCircleIcon className="h-5 w-5" />
              Signature ajoutée avec succès
            </div>
            <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
              <img src={signatureData} alt="Signature" className="h-16 object-contain" />
              <button onClick={() => setSignatureData(null)} className="text-xs text-red-600 mt-2">Supprimer</button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          onClick={(e) => {
            e.preventDefault();
            alert('Facture OCR créée avec succès !');
            onClose();
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <CheckCircleIcon className="h-5 w-5 mr-2" />
          Créer Facture
        </button>
      </div>
    </form>
  );
};

const Fournisseurs: React.FC = () => {
  const { formatCurrency, user, companyData } = useApp();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      try {
        await deleteSupplier(id);
      } catch (err) {
        console.error("Erreur lors de la suppression API:", err);
      }
      // Update local state regardless of API success for demo
      setFournisseursList(prev => prev.filter(f => f.id !== id));
    }
  };

  // States for dynamic suppliers loading
  const {
    suppliers: apiFournisseurs,
    loading: loadingFournisseurs,
    error: fournisseursError,
    createSupplier,
    updateSupplier,
    deleteSupplier
  } = useSuppliers();

  // Local state for suppliers to allow immediate UI updates (Demo Mode)
  const [fournisseursList, setFournisseursList] = useState<any[]>([
    { id: 'f-001', nom: 'Global Logistics Algerie', nif: '000116109000101', email: 'contact@global-log.dz', telephone: '023 45 67 89', adresse: 'Zone Industrielle, Oued Smar', balance: 450000, total_purchases: 2850000, status: 'actif' },
    { id: 'f-002', nom: 'Industrie Plastique Nord', nif: '000216109000202', email: 'sales@ip-nord.dz', telephone: '024 12 34 56', adresse: 'Z.I Rouiba, Alger', balance: 0, total_purchases: 1920000, status: 'actif' },
    { id: 'f-003', nom: 'Tech Solutions Import', nif: '000316109000303', email: 'info@tech-sol.dz', telephone: '021 98 76 54', adresse: 'Sidi Abdellah, Alger', balance: 125000, total_purchases: 850000, status: 'actif' },
    { id: 'f-004', nom: 'Papeterie Centrale SPA', nif: '000416109000404', email: 'order@papeterie.dz', telephone: '025 55 44 33', adresse: 'Bordj El Kiffan, Alger', balance: 0, total_purchases: 320000, status: 'actif' }
  ]);

  // Sync API data if available and list is empty (initial load)
  useEffect(() => {
    if (apiFournisseurs && apiFournisseurs.length > 0 && fournisseursList.length === 0) {
      setFournisseursList(apiFournisseurs);
    }
  }, [apiFournisseurs]);

  const mockFournisseurs = fournisseursList;

  const handleFournisseurSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newFournisseur = {
      id: selectedFournisseur?.id || `f-${Date.now()}`,
      nom: formData.get('nom') as string,
      nif: formData.get('nif') as string,
      email: formData.get('email') as string,
      telephone: formData.get('telephone') as string,
      adresse: formData.get('adresse') as string,
      balance: selectedFournisseur?.balance || 0,
      total_purchases: selectedFournisseur?.total_purchases || 0,
      status: 'actif'
    };

    if (selectedFournisseur) {
      setFournisseursList(fournisseursList.map(f => f.id === selectedFournisseur.id ? { ...f, ...newFournisseur } : f));
      alert('Fournisseur modifié avec succès !');
    } else {
      setFournisseursList([...fournisseursList, newFournisseur]);
      alert('Nouveau fournisseur ajouté avec succès !');
    }
    setIsModalOpen(false);
  };

  const handleLocalDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      setFournisseursList(fournisseursList.filter(f => f.id !== id));
    }
  };

  // States pour les modales (doivent être déclarés avant le return early)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null);
  const [isNouvelleFactureModalOpen, setIsNouvelleFactureModalOpen] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [isPaiementModalOpen, setIsPaiementModalOpen] = useState(false);
  const [isEcheancierModalOpen, setIsEcheancierModalOpen] = useState(false);
  const [isRapportExecutifModalOpen, setIsRapportExecutifModalOpen] = useState(false);
  const [isGeneratingRapport, setIsGeneratingRapport] = useState(false);
  const [selectedReglement, setSelectedReglement] = useState<any>(null);
  const [selectedFacture, setSelectedFacture] = useState<any>(null);
  const [nifError, setNifError] = useState<string | null>(null);

  // États pour les nouvelles fonctionnalités
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [isOptimisationModalOpen, setIsOptimisationModalOpen] = useState(false);
  const [isPrevisionsAchatsModalOpen, setIsPrevisionsAchatsModalOpen] = useState(false);
  const [isNegociationsModalOpen, setIsNegociationsModalOpen] = useState(false);
  const [isRisquesModalOpen, setIsRisquesModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successData, setSuccessData] = useState<{
    title: string;
    message: string;
    details: string[];
    nextSteps: string[];
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('liste');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [selectedCommande, setSelectedCommande] = useState<any>(null);
  const [isCommandeModalOpen, setIsCommandeModalOpen] = useState(false);
  const [isNouvelleCommandeModalOpen, setIsNouvelleCommandeModalOpen] = useState(false);
  const [isFactureModalOpen, setIsFactureModalOpen] = useState(false);

  // State for Orders (Commandes) to make the tab functional
  const [commandes, setCommandes] = useState([
    { id: 'CMD-2024-042', name: 'ABC Corp SPA', val: 1450000, status: 'TRANSIT', date: '12/02/2024' },
    { id: 'CMD-2024-043', name: 'Tech Solutions', val: 890000, status: 'APPROBATION', date: '14/02/2024' },
    { id: 'CMD-2024-044', name: 'Global Logistics', val: 450000, status: 'LIVRÉE', date: '10/02/2024' },
    { id: 'CMD-2024-045', name: 'Office Supplies', val: 125000, status: 'INSTANCE', date: '08/02/2024' }
  ]);

  const handleCreateCommande = (newCommande: any) => {
    setCommandes([...commandes, { ...newCommande, id: `CMD-2024-${Math.floor(Math.random() * 1000)}` }]);
    setIsNouvelleCommandeModalOpen(false);
    alert('Commande créée avec succès !');
  };

  const handleDeleteCommandeList = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      setCommandes(commandes.filter(c => c.id !== id));
    }
  };

  const handleCommandeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fournisseurName = formData.get('fournisseur_name') as string;

    const newCmd = {
      name: fournisseurName || 'Nouveau',
      val: Math.floor(Math.random() * 1000000) + 100000,
      status: 'INSTANCE',
      date: new Date().toLocaleDateString('fr-FR')
    };

    if (selectedCommande) {
      // Update existing
      setCommandes(commandes.map(c => c.id === selectedCommande.id ? { ...c, ...newCmd, id: c.id } : c));
      alert('Commande modifiée avec succès !');
    } else {
      // Create new
      handleCreateCommande(newCmd);
    }
    setIsNouvelleCommandeModalOpen(false);
  };

  // Calculer les analyses de performance
  const analysesPerformance = useMemo(() => {
    const historique = (mockFournisseurs || []).flatMap((fournisseur: any) => {
      const nombreCommandes = Math.floor(0.5 * 20) + 5;
      return Array.from({ length: nombreCommandes }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (nombreCommandes - i));
        return {
          fournisseurId: (fournisseur.id || fournisseur.nom || fournisseur.name || '').toString(),
          montant: ((fournisseur.total_purchases || fournisseur.montantTotal || 1000000) as number) / nombreCommandes,
          delaiLivraison: 5 + 0.5 * 20,
          qualite: 75 + 0.5 * 20,
          service: 70 + 0.5 * 25,
          date: date.toISOString().split('T')[0],
          dpo: 30 + 0.5 * 30
        };
      });
    });

    const analyses = analyserPerformanceFournisseur(historique);

    // Mettre à jour les noms des fournisseurs
    analyses.forEach((analyse: any, fournisseurId: string) => {
      const fournisseur = mockFournisseurs.find((f: any) => ((f.id || f.nom || f.name) || '').toString() === fournisseurId);
      if (fournisseur) {
        analyse.fournisseurNom = (fournisseur as any).nom || (fournisseur as any).name || fournisseurId;
      }
    });

    return Array.from(analyses.values());
  }, [mockFournisseurs]);

  // Handlers pour la Trésorerie
  const handleNouveauReglement = () => {
    setSelectedReglement(null);
    setIsPaiementModalOpen(true);
  };

  const handleGenererEcheancier = () => {
    setIsEcheancierModalOpen(true);
  };

  const handleVoirReglement = (pay: any) => {
    setSelectedReglement(pay);
    setIsPaiementModalOpen(true);
  };

  const handleGenererRapportExecutif = async () => {
    setIsGeneratingRapport(true);
    setIsRapportExecutifModalOpen(true);
    // Simulation d'analyse IA
    await new Promise(resolve => setTimeout(resolve, 2500));
    setIsGeneratingRapport(false);
  };

  // Optimiser les coûts
  const optimisationsCouts = useMemo(() => {
    const fournisseursAvecDonnees = mockFournisseurs.map((fournisseur: any) => ({
      id: (fournisseur.id || fournisseur.nom || fournisseur.name || '').toString(),
      nom: fournisseur.nom || fournisseur.name || '',
      coutActuel: (fournisseur.total_purchases || fournisseur.montantTotal || 1000000) as number,
      nombreCommandes: Math.floor(0.5 * 30) + 5,
      delaiPaiement: 30 + 0.5 * 30,
      qualite: 75 + 0.5 * 20
    }));

    return optimiserCouts(fournisseursAvecDonnees);
  }, [mockFournisseurs]);

  // Générer les prévisions d'achats
  const previsionsAchats = useMemo(() => {
    const historique = (mockFournisseurs || []).flatMap((fournisseur: any) => {
      const nombreCommandes = Math.floor(0.5 * 12) + 3;
      return Array.from({ length: nombreCommandes }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (nombreCommandes - i));
        return {
          fournisseurId: (fournisseur.id || fournisseur.nom || fournisseur.name || '').toString(),
          montant: ((fournisseur.total_purchases || fournisseur.montantTotal || 1000000) as number) / nombreCommandes,
          date: date.toISOString().split('T')[0]
        };
      });
    });

    return genererPrevisionsAchats(historique, 6);
  }, [mockFournisseurs]);

  // Générer les opportunités de négociation
  const opportunitesNegociation = useMemo(() => {
    const fournisseursAvecDonnees = mockFournisseurs.map((fournisseur: any) => ({
      id: (fournisseur.id || fournisseur.nom || fournisseur.name || '').toString(),
      nom: fournisseur.nom || fournisseur.name || '',
      coutActuel: (fournisseur.total_purchases || fournisseur.montantTotal || 1000000) as number,
      nombreCommandes: Math.floor(0.5 * 30) + 5,
      delaiPaiement: 30 + 0.5 * 30,
      qualite: 75 + 0.5 * 20,
      delaiLivraison: 5 + 0.5 * 20
    }));

    return genererOpportunitesNegociation(fournisseursAvecDonnees);
  }, [mockFournisseurs]);

  // Évaluer les risques
  const risquesFournisseurs = useMemo(() => {
    const totalCA = mockFournisseurs.reduce((sum: number, f: any) => sum + ((f.total_purchases || f.montantTotal || 0) as number), 0);
    const fournisseursAvecDonnees = mockFournisseurs.map((fournisseur: any) => ({
      id: (fournisseur.id || fournisseur.nom || fournisseur.name || '').toString(),
      nom: fournisseur.nom || fournisseur.name || '',
      partCA: totalCA > 0 ? (((fournisseur.total_purchases || fournisseur.montantTotal || 0) as number) / totalCA) * 100 : 0,
      delaiLivraison: 5 + 0.5 * 20,
      qualite: 75 + 0.5 * 20,
      localisation: fournisseur.adresse || fournisseur.address || 'Algérie',
      nombreCommandes: Math.floor(0.5 * 30) + 5
    }));

    return evaluerRisquesFournisseurs(fournisseursAvecDonnees);
  }, [mockFournisseurs]);

  const filteredFournisseurs = useMemo(() => {
    return (mockFournisseurs || []).filter((fournisseur: any) =>
      (fournisseur.nom || fournisseur.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((fournisseur.nif || fournisseur.tax_id) && (fournisseur.nif || fournisseur.tax_id).includes(searchTerm))
    );
  }, [mockFournisseurs, searchTerm]);

  // Détecter le paramètre URL pour ouvrir automatiquement la modal de nouvelle facture
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('action') === 'create-invoice') {
      setIsNouvelleFactureModalOpen(true);
      // Nettoyer l'URL pour éviter de rouvrir la modal à chaque re-render
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  // ========================================
  // INTERFACE EURL MICRO-ENTREPRISE
  // ========================================
  if (user && user.segment === 'micro' && user.companyType === 'eurl' && companyData) {
    const totalAchats = mockFournisseurs.reduce((sum: number, f: any) => sum + Number(f.total_purchases || 0), 0);
    const nombreFournisseurs = mockFournisseurs.length;
    const dettesFournisseurs = mockFournisseurs.reduce((sum: number, f: any) => sum + Number(f.balance || 0), 0);
    const facturesAPayer = mockFournisseurs.reduce((sum: number, f: any) => sum + (f.pending_invoices_count || 0), 0);


    // Top 3 fournisseurs
    const topFournisseurs = mockFournisseurs.slice(0, 3).map(f => ({
      nom: (f as any).nom || (f as any).name || '',
      nif: (f as any).nif || (f as any).tax_id || '',
      montant: Number((f as any).total_purchases || 0),
      factures: (f as any).invoices_count || 0,
      delai: (f as any).average_payment_days || 30
    }));

    const handleSubmitFournisseur = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const nom = formData.get('nom') as string;
      const contact = formData.get('contact') as string;
      const email = formData.get('email') as string;
      const adresse = formData.get('adresse') as string;
      const tax_id = formData.get('tax_id') as string;

      if (nifError) {
        alert("Veuillez corriger les erreurs avant de soumettre.");
        return;
      }

      const apiData = {
        name: nom,
        phone: contact,
        email: email,
        address: adresse,
        tax_id: tax_id
      };

      try {
        if (selectedFournisseur) {
          await updateSupplier(selectedFournisseur.id, apiData);
        } else {
          await createSupplier(apiData);
        }

        setSuccessData({
          title: `✅ Fournisseur ${selectedFournisseur ? 'modifié' : 'créé'} avec succès !`,
          message: `Le fournisseur "${nom}" a été ${selectedFournisseur ? 'mis à jour' : 'ajouté'} à votre liste.`,
          details: [
            `Nom : ${nom}`,
            contact ? `Contact : ${contact}` : null,
            email ? `Email : ${email}` : null,
            adresse ? `Adresse : ${adresse}` : null
          ].filter(Boolean) as string[],
          nextSteps: [
            'Créer une première commande pour ce fournisseur',
            'Configurer les conditions de paiement',
            'Ajouter des notes sur les délais de livraison'
          ]
        });
        setIsModalOpen(false);
        setSelectedFournisseur(null);
        setShowSuccessMessage(true);

        setTimeout(() => {
          setShowSuccessMessage(false);
          setSuccessData(null);
        }, 5000);
      } catch (err: any) {
        alert("Erreur: " + err.message);
      }
    };

    return (
      <div className="space-y-8 max-w-7xl mx-auto p-8 animate-in fade-in duration-700">
        {/* En-tête Sober ERP - Ultra Premium Monochrome */}
        <div className="bg-slate-900 text-white p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl opacity-30"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="p-5 bg-white/5 rounded-3xl backdrop-blur-xl shadow-2xl border border-white/10">
                <TruckIcon className="h-10 w-10 text-slate-100" />
              </div>
              <div>
                <div className="flex items-center gap-4">
                  <h1 className="text-4xl font-black uppercase tracking-tighter">Flux Fournisseurs</h1>
                  <span className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border border-white/20 text-slate-300">Procurement Module v4.0</span>
                </div>
                <p className="text-slate-400 text-sm font-bold mt-2 uppercase tracking-[0.1em] opacity-80">Contrôle des Engagements & Logistique d'Appuis</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setIsNouvelleFactureModalOpen(true)}
                className="px-6 py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl shadow-white/5 ring-1 ring-white/20"
              >
                Intégration Facture
              </button>
            </div>
          </div>
        </div>

        {/* 4 KPIs Sober - Grayscale Structural */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Dette Exigible", val: formatCurrency(mockFournisseurs.reduce((acc: number, f: any) => acc + (f.balance || f.soldeDu || 0), 0)), icon: BanknotesIcon, sub: "Passif Circulant" },
            { label: "Volume Appro.", val: formatCurrency(mockFournisseurs.reduce((acc: number, f: any) => acc + (f.total_purchases || 0), 0)), icon: CurrencyDollarIcon, sub: "Cumul Exercice" },
            { label: "Partenaires", val: mockFournisseurs.length, icon: BuildingOfficeIcon, sub: "Entités Référencées" },
            { label: "DPO Standard", val: "32.5j", icon: ClockIcon, sub: "Rotation Dettes" }
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-400 transition-all group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl transition-colors group-hover:bg-slate-900 group-hover:text-white">
                  <kpi.icon className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</p>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{kpi.val}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Navigation Tabs - Sober Style */}
        <div className="flex gap-2 p-2 bg-slate-100 dark:bg-slate-900/50 rounded-2xl w-fit">
          {['liste', 'commandes', 'factures', 'paiements', 'analytics'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'liste' && (
          <div className="space-y-8">
            {/* Engine Panel - Technical Monospace Grayscale */}
            <div className="p-12 bg-slate-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden border border-white/5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)]"></div>
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/10">
                      <CpuChipIconSolid className="h-8 w-8 text-white/80" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Système Expert d'Analyse</p>
                      <h3 className="text-2xl font-black uppercase tracking-tight">Optimisation & Compliance</h3>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
                    Indicateurs de solvabilité consolidés par agrégation des délais de règlement et conformité contractuelle des partenaires logistiques.
                  </p>
                  <div className="flex gap-4">
                    <button onClick={() => setIsPerformanceModalOpen(true)} className="px-5 py-3 bg-white/5 hover:bg-white/15 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10">Tableau de Bord</button>
                    <button onClick={() => setIsRisquesModalOpen(true)} className="px-5 py-3 bg-white/5 hover:bg-white/15 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10">Matrice de Vigilance</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 hover:bg-white/[0.07] transition-all">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Ratio Risque Composite</p>
                    <div className="flex items-end gap-3">
                      <span className="text-4xl font-black font-mono text-slate-200">12.4</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase mb-2">Certifié</span>
                    </div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 hover:bg-white/[0.07] transition-all">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Delta Économie (Target)</p>
                    <div className="flex items-end gap-3">
                      <span className="text-4xl font-black font-mono text-slate-200">8.2%</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase mb-2">Exigible</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des Fournisseurs Table - Sober */}
            <Card className="p-0 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm bg-white dark:bg-slate-900">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Partenaires Commerciaux</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{mockFournisseurs.length} entités actives</p>
                </div>
                <div className="flex gap-4">
                  <div className="relative">
                    <FunnelIcon className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="FILTRER PAR NOM OU NIF..."
                      className="pl-10 pr-6 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[10px] font-black uppercase tracking-widest w-64 focus:ring-1 ring-slate-400 transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                    Ajouter Partenaire
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Partenaire</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identifiant (NIF)</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact</th>
                      <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Volume d'Affaires</th>
                      <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Solde Dû</th>
                      <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Niveau Risque</th>
                      <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {mockFournisseurs.length > 0 ? (
                      mockFournisseurs.map((f: any) => (
                        <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group border-b border-slate-50 dark:border-slate-800">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl flex items-center justify-center font-black text-xs uppercase border border-slate-200 dark:border-slate-700 shadow-sm transition-all group-hover:bg-slate-900 group-hover:text-white">
                                {(f.nom || f.name || '?')[0]}
                              </div>
                              <div>
                                <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{f.nom || f.name}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{f.adresse || 'Siège Non Référencé'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-[11px] font-black text-slate-500 dark:text-slate-400 font-mono tracking-tight">{f.nif || f.tax_id || '—'}</td>
                          <td className="px-8 py-6">
                            <div className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{f.telephone || f.phone || '—'}</div>
                            <div className="text-[10px] font-bold text-slate-400 lowercase truncate w-32 border-b border-transparent group-hover:border-slate-300 transition-all">{f.email || '—'}</div>
                          </td>
                          <td className="px-8 py-6 text-right text-xs font-black text-slate-900 dark:text-white font-mono whitespace-nowrap">
                            {formatCurrency(f.total_purchases || 0)}
                          </td>
                          <td className="px-8 py-6 text-right text-xs font-black text-slate-900 dark:text-white font-mono whitespace-nowrap">
                            <span className={(f.balance || 0) > 0 ? 'text-slate-900 bg-slate-100 dark:bg-slate-100 dark:text-slate-900 px-2 py-1 rounded-md' : 'text-slate-400'}>
                              {formatCurrency(f.balance || 0)}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className={`px-3 py-1 bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase tracking-[0.1em] rounded-lg border border-slate-200 dark:border-slate-700 ${(f.total_purchases || 0) > 2000000 ? 'bg-slate-900 text-white' : 'text-slate-600'
                              }`}>
                              {(f.total_purchases || 0) > 2000000 ? 'STRATÉGIQUE' : (f.total_purchases || 0) > 500000 ? 'ACTIF' : 'STABLE'}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center justify-center gap-2 opacity-10 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setSelectedFournisseur(f)} className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm" title="Détails de l'entité">
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button onClick={() => f.id && handleDelete(f.id)} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors border border-slate-200 dark:border-slate-700" title="Archiver / Révoquer">
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-8 py-12 text-center text-slate-400 uppercase font-black text-xs tracking-widest">
                          AUCUN PARTENAIRE DÉTECTÉ DANS LA BASE DE DONNÉES
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Modals for EURL view */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedFournisseur(null);
            setNifError(null);
          }}
          title={selectedFournisseur ? 'Modifier Partenaire' : 'Nouveau Partenaire Commercial'}
          size="lg"
        >
          <form onSubmit={handleSubmitFournisseur} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Dénomination Sociale</label>
                <input
                  type="text"
                  name="nom"
                  required
                  defaultValue={selectedFournisseur?.nom || ''}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[11px] font-black uppercase tracking-tight focus:ring-1 ring-slate-400"
                  placeholder="NOM DE L'ENTITÉ"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Identifiant Fiscal (NIF)</label>
                <input
                  type="text"
                  name="tax_id"
                  defaultValue={selectedFournisseur?.tax_id || selectedFournisseur?.nif || ''}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[11px] font-black uppercase tracking-tight font-mono focus:ring-1 ring-slate-400"
                  placeholder="15 OU 20 CHIFFRES"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val && !/^\d{15}$|^\d{20}$/.test(val)) {
                      setNifError("Format NIF invalide (15 ou 20 chiffres requis)");
                    } else {
                      setNifError(null);
                    }
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Téléphone Intel</label>
                <input
                  type="text"
                  name="contact"
                  defaultValue={selectedFournisseur?.contact || selectedFournisseur?.telephone || ''}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[11px] font-black uppercase tracking-tight focus:ring-1 ring-slate-400"
                  placeholder="+213..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email de Liaison</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={selectedFournisseur?.email || ''}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[11px] font-black focus:ring-1 ring-slate-400"
                  placeholder="contact@fournisseur.dz"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Art. Imposition (AI)</label>
                <input
                  type="text"
                  name="ai"
                  defaultValue={selectedFournisseur?.ai || ''}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[11px] font-black font-mono focus:ring-1 ring-slate-400"
                  placeholder="11 chiffres"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Registre Commerce (RC)</label>
                <input
                  type="text"
                  name="rc"
                  defaultValue={selectedFournisseur?.rc || ''}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[11px] font-black font-mono focus:ring-1 ring-slate-400"
                  placeholder="00B1234567"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Identifiant Stat. (NIS)</label>
                <input
                  type="text"
                  name="nis"
                  defaultValue={selectedFournisseur?.nis || ''}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[11px] font-black font-mono focus:ring-1 ring-slate-400"
                  placeholder="15 chiffres"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Siège Social</label>
              <input
                type="text"
                name="adresse"
                defaultValue={selectedFournisseur?.adresse || ''}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[11px] font-black uppercase tracking-tight focus:ring-1 ring-slate-400"
                placeholder="RUE, COMMUNE, WILAYA"
              />
            </div>
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all shadow-xl shadow-slate-900/20"
              >
                {selectedFournisseur ? 'Mettre à jour' : 'Enregistrer Partenaire'}
              </button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={isNouvelleFactureModalOpen}
          onClose={() => setIsNouvelleFactureModalOpen(false)}
          title="Nouvelle Facture Fournisseur"
          size="xl"
        >
          <div className="max-h-[80vh] overflow-y-auto pr-2">
            <InvoiceFormWithOCR
              topFournisseurs={topFournisseurs}
              onClose={() => setIsNouvelleFactureModalOpen(false)}
            />
          </div>
        </Modal>

        <Modal
          isOpen={isPaiementModalOpen}
          onClose={() => setIsPaiementModalOpen(false)}
          title={`Paiement Facture ${selectedFacture?.numero || ''}`}
          size="lg"
        >
          <div className="max-h-[80vh] overflow-y-auto pr-2">
            {selectedFacture && (
              <div className="space-y-6">
                {/* Informations de la facture */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Facture à Payer
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
                      <p className="text-sm text-gray-900 font-medium">{selectedFacture.numero}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                      <p className="text-sm text-gray-900">{selectedFacture.fournisseur}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Montant à Payer</label>
                      <p className="text-lg text-gray-900 font-bold">{formatCurrency(selectedFacture.montant)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Échéance</label>
                      <p className="text-sm text-gray-900">{selectedFacture.dateEcheance || '15/02/2024'}</p>
                    </div>
                  </div>
                </div>

                {/* Formulaire de paiement */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <BanknotesIcon className="h-5 w-5 mr-2 text-green-600" />
                    Détails du Paiement
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mode de Paiement *
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required aria-label="Mode de Paiement">
                        <option value="">Sélectionner un mode</option>
                        <option value="virement">Virement bancaire</option>
                        <option value="cheque">Chèque</option>
                        <option value="especes">Espèces</option>
                        <option value="carte">Carte bancaire</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de Paiement *
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        aria-label="Date de Paiement"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Référence du Paiement
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Numéro de chèque, référence virement..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Notes sur le paiement..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setIsPaiementModalOpen(false)}
                    className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      alert(`Paiement de la facture ${selectedFacture.numero} enregistré avec succès !`);
                      setIsPaiementModalOpen(false);
                      setSelectedFacture(null);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Confirmer le Paiement
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div >
    );
  }

  // ========================================
  // INTERFACE STANDARD (autres entreprises)
  // ========================================
  // Note: isModalOpen et selectedFournisseur sont déjà déclarés plus haut (avant le return early)


  // Réutilisation des variables déclarées en haut du composant
  const suppliers = mockFournisseurs; // Alias for backward compatibility if needed below
  const loading = loadingFournisseurs;

  const handleEdit = (fournisseur: any) => {
    setSelectedFournisseur(fournisseur);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedFournisseur(null);
    setIsModalOpen(true);
  };

  // Fonctions pour les commandes
  const handleVoirCommande = (commande: any) => {
    setSelectedCommande(commande);
    setIsCommandeModalOpen(true);
  };

  const handleNouvelleCommande = () => {
    setIsNouvelleCommandeModalOpen(true);
  };

  const handleConfirmerCommande = (commande: any) => {
    alert(`Commande ${commande.numero} confirmée avec succès !`);
  };

  const handleModifierCommande = (commande: any) => {
    setSelectedCommande(commande);
    setIsNouvelleCommandeModalOpen(true);
  };

  const handleImprimerCommande = (commande: any) => {
    alert(`Impression de la commande ${commande.numero} en cours...`);
  };

  const handleDupliquerCommande = (commande: any) => {
    alert(`Commande ${commande.numero} dupliquée avec succès !`);
  };

  const handleMarquerLivraison = (commande: any) => {
    alert(`Commande ${commande.numero} marquée en livraison !`);
  };

  const handleMarquerLivree = (commande: any) => {
    alert(`Commande ${commande.numero} marquée comme livrée !`);
  };

  const handleRelancerCommande = (commande: any) => {
    alert(`Relance envoyée pour la commande ${commande.numero} !`);
  };

  const handleRetablirCommande = (commande: any) => {
    alert(`Commande ${commande.numero} rétablie avec succès !`);
  };

  const handleSupprimerCommande = (commande: any) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la commande ${commande.numero} ?`)) {
      alert(`Commande ${commande.numero} supprimée !`);
    }
  };

  const handleSuiviCommande = (commande: any) => {
    alert(`Ouverture du suivi pour la commande ${commande.numero}...`);
  };

  // Fonctions pour les factures
  const handleVoirFacture = (facture: any) => {
    setSelectedFacture(facture);
    setIsFactureModalOpen(true);
  };

  const handleImprimerFacture = (facture: any) => {
    alert(`Impression de la facture ${facture.numero} en cours...`);
  };

  const handleDupliquerFacture = (facture: any) => {
    alert(`Facture ${facture.numero} dupliquée avec succès !`);
  };

  const handlePayerFacture = (facture: any) => {
    setSelectedFacture(facture);
    setIsPaiementModalOpen(true);
  };

  const handleUrgentPayerFacture = (facture: any) => {
    if (confirm(`Marquer la facture ${facture.numero} comme URGENTE et procéder au paiement ?`)) {
      setSelectedFacture(facture);
      setIsPaiementModalOpen(true);
    }
  };

  const handleNouvelleFacture = () => {
    setIsNouvelleFactureModalOpen(true);
  };

  // Statistiques des fournisseurs
  const totalFournisseurs = mockFournisseurs.length;
  const totalSoldeDu = mockFournisseurs.reduce((sum: number, f: any) => sum + (f.balance || 0), 0);
  const fournisseursActifs = mockFournisseurs.filter((f: any) => (f.balance || 0) > 0).length;

  return (
    <div className="space-y-6">
      {/* Header de la page - High-End ERP Monochrome */}
      <div className="bg-slate-900 rounded-[2rem] shadow-2xl border border-white/5 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-20"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
              <TruckIcon className="h-8 w-8 text-slate-100" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">Registre des Flux Fournisseurs</h1>
              <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest opacity-80 underline decoration-slate-600 underline-offset-4">Module de Gestion des Passifs & Approvisionnements</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Entités Référencées</div>
            <div className="text-4xl font-mono font-black text-white">{totalFournisseurs}</div>
          </div>
        </div>
      </div>

      {/* Statistiques Consolideés - Grayscale Structural */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Répertoire Partenaires", val: totalFournisseurs, sub: "Entités actives", icon: UserGroupIcon },
          { label: "Engagement Global Brut", val: formatCurrency(totalSoldeDu), sub: "Encours exigible", icon: CurrencyDollarIcon },
          { label: "Indice de Solvabilité", val: `${((fournisseursActifs / (totalFournisseurs || 1)) * 100).toFixed(1)}%`, sub: "Activité consolidée", icon: CheckCircleIcon }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-400 transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl transition-colors group-hover:bg-slate-900 group-hover:text-white">
                <stat.icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-black text-slate-900 dark:text-white font-mono">{stat.val}</p>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation - Ultra Minimalist Monochrome */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit flex gap-2 overflow-x-auto max-w-full">
        {[
          { id: 'liste', name: 'Répertoire', icon: UserGroupIcon },
          { id: 'commandes', name: 'Engagements BC', icon: ClipboardDocumentListIcon },
          { id: 'factures', name: 'Pièces Comptables', icon: DocumentTextIcon },
          { id: 'paiements', name: 'Règlements', icon: BanknotesIcon },
          { id: 'analytics', name: 'Analytique Consolidée', icon: ChartBarIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id
              ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10'
              : 'text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.name}
          </button>
        ))}
      </div>


      {/* Contenu des onglets */}
      <div className="space-y-6">
        {/* Onglet Répertoire */}
        {activeTab === 'liste' && (
          <Card className="p-0 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900">
            <div className="p-8 space-y-8">
              {/* Services d'Audit Shortcut */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { label: "Performance", icon: ChartBarIcon, modal: () => setIsPerformanceModalOpen(true) },
                  { label: "Audit Coûts", icon: CurrencyDollarIcon, modal: () => setIsOptimisationModalOpen(true) },
                  { label: "Modélisation", icon: ChartPieIcon, modal: () => setIsPrevisionsAchatsModalOpen(true) },
                  { label: "Négociation", icon: SparklesIcon, modal: () => setIsNegociationsModalOpen(true) },
                  { label: "Vigilance", icon: ExclamationTriangleIcon, modal: () => setIsRisquesModalOpen(true) }
                ].map((bench, idx) => (
                  <button key={idx} onClick={bench.modal} className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-3xl hover:bg-slate-900 hover:text-white transition-all group">
                    <bench.icon className="h-6 w-6 mb-2 text-slate-400 group-hover:text-white" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-100">{bench.label}</span>
                  </button>
                ))}
              </div>

              {/* Recherche et Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-80">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrer le registre (Nom, NIF...)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-1 ring-slate-400 transition-all outline-none"
                  />
                </div>
                <button onClick={handleAdd} className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
                  <PlusIcon className="h-4 w-4 mr-2 inline-block" />
                  Nouveau Portefeuille
                </button>
              </div>

              {/* Table Registre */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Partenaire Logistique</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Identité Fiscale</th>
                      <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Canaux de Contact</th>
                      <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Engagement</th>
                      <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredFournisseurs.map((f: any) => (
                      <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl flex items-center justify-center font-black text-xs uppercase border border-slate-200 dark:border-slate-700">
                              {(f.nom || f.name || '?')[0]}
                            </div>
                            <div>
                              <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{f.nom || f.name}</div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{f.adresse || 'Siège Social'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-[11px] font-black text-slate-500 font-mono">{f.nif || 'NON_RENSEIGNÉ'}</td>
                        <td className="px-8 py-6">
                          <div className="text-[11px] font-black text-slate-900 dark:text-white uppercase">{f.telephone || '—'}</div>
                          <div className="text-[10px] font-bold text-slate-400 lowercase">{f.email || '—'}</div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className={`text-sm font-black font-mono ${(f.balance || 0) > 0 ? 'text-slate-900 bg-slate-100 px-3 py-1 rounded-lg' : 'text-slate-300'}`}>
                            {formatCurrency(f.balance || f.soldeDu || 0)}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex justify-center gap-2 opacity-10 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(f)} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-900 rounded-lg">
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>
                            <button onClick={() => f.id && handleDelete(f.id)} className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}


        {/* Onglet Commandes */}
        {activeTab === 'commandes' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Total BC Émis", val: "156", icon: ClipboardDocumentListIcon },
                { label: "En Approbation", val: "12", icon: ClockIcon },
                { label: "En Transit", val: "08", icon: GlobeAltIcon },
                { label: "Anomalies", val: "03", icon: ExclamationTriangleIcon }
              ].map((stat, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="h-5 w-5 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                  </div>
                  <p className="text-3xl font-black font-mono text-slate-900 dark:text-white">{stat.val}</p>
                </div>
              ))}
            </div>

            <Card className="p-0 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900">
              <div className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Registre des Engagements</h3>
                  <button onClick={handleNouvelleCommande} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
                    Nouveau Bon de Commande
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800/50">
                      <tr>
                        <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Référence BC</th>
                        <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Partenaire</th>
                        <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume HT</th>
                        <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Flux</th>
                        <th className="px-8 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {commandes.map((cmd) => (
                        <tr key={cmd.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                          <td className="px-8 py-6 text-[11px] font-black text-slate-900 dark:text-white font-mono">{cmd.id}</td>
                          <td className="px-8 py-6 text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{cmd.name}</td>
                          <td className="px-8 py-6 text-right text-sm font-black font-mono">{formatCurrency(cmd.val)}</td>
                          <td className="px-8 py-6 text-center">
                            <span className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${cmd.status === 'LIVRÉE' ? 'bg-slate-900 text-white' :
                              cmd.status === 'TRANSIT' ? 'bg-slate-200 text-slate-600' :
                                'bg-slate-100 text-slate-400'
                              }`}>
                              {cmd.status}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex justify-center gap-2 opacity-10 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setSelectedCommande(cmd); setIsNouvelleCommandeModalOpen(true); }} className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 pointer-events-auto" title="Voir / Modifier">
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button onClick={() => alert(`Impression commande ${cmd.id}`)} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 rounded-lg hover:text-slate-900 pointer-events-auto" title="Imprimer">
                                <PrinterIcon className="h-4 w-4" />
                              </button>
                              <button onClick={() => handleDeleteCommandeList(cmd.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 pointer-events-auto" title="Supprimer">
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Onglet Factures Fournisseurs - Structured Monochrome */}
        {activeTab === 'factures' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="bg-slate-900 text-white p-12 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)]"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Passif Fournisseurs</p>
                  <h2 className="text-4xl font-black uppercase tracking-tighter italic">Gestion des Passifs</h2>
                  <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-[0.3em] opacity-80 decoration-slate-600 underline underline-offset-8">Audit & Certification des Pièces Comptables</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleNouvelleFacture} className="px-10 py-5 bg-white text-slate-900 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/5 flex items-center gap-2">
                    <DocumentTextIcon className="h-4 w-4" />
                    Intégrer Facture (OCR)
                  </button>
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Total Factures", val: "12", sub: "Exercice 2024", icon: DocumentTextIcon, trend: "+3 ce mois" },
                { label: "Montant TTC", val: "2 458 900", unit: "DA", sub: "Toutes pièces", icon: CurrencyDollarIcon, trend: "HT: 2 057 059 DA" },
                { label: "En Instance", val: "4", sub: "En attente de validation", icon: ClockIcon, trend: "Délai moy: 3j" },
                { label: "Compliance", val: "67%", sub: "Pièces certifiées (8/12)", icon: DocumentCheckIcon, trend: "8/12 vérifiées" },
              ].map((kpi, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <kpi.icon className="h-5 w-5 text-slate-900 dark:text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{kpi.trend}</span>
                  </div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">{kpi.label}</p>
                  <p className="text-2xl font-black font-mono text-slate-900 dark:text-white leading-none">
                    {kpi.val}
                    {'unit' in kpi && <span className="text-sm font-bold text-slate-400 ml-1">{(kpi as any).unit}</span>}
                  </p>
                  <p className="text-xs font-medium text-slate-400 mt-2">{kpi.sub}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              {['Toutes', 'VÉRIFIÉ', 'EN ATTENTE', 'REJETÉ'].map((f, i) => (
                <button key={f} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${i === 0 ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900'}`}>
                  {f}
                </button>
              ))}
              <div className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest">12 pièces — 2024</div>
            </div>

            {/* Main Table */}
            <Card className="p-0 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Référence PIÈCE</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Émetteur</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                      <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Réf. BC</th>
                      <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant HT</th>
                      <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant TTC</th>
                      <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Échéance</th>
                      <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance</th>
                      <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { id: 'FAC-2024-881', emetteur: 'Global Logistics Algerie', fournisseurId: 'f-001', type: 'FACTURE', refBC: 'BC-2024-101', ht: 378151, ttc: 450000, tva: 19, echeance: '15/02/2024', compliance: 'VÉRIFIÉ', joursRetard: 0 },
                      { id: 'FAC-2024-882', emetteur: 'Industrie Plastique Nord', fournisseurId: 'f-002', type: 'FACTURE', refBC: 'BC-2024-087', ht: 100840, ttc: 120000, tva: 19, echeance: '28/02/2024', compliance: 'EN ATTENTE', joursRetard: 0 },
                      { id: 'FAC-2024-883', emetteur: 'Tech Solutions Import', fournisseurId: 'f-003', type: 'AVOIR', refBC: 'BC-2024-064', ht: 71429, ttc: 85000, tva: 19, echeance: '10/01/2024', compliance: 'REJETÉ', joursRetard: 40 },
                      { id: 'FAC-2024-884', emetteur: 'Papeterie Centrale SPA', fournisseurId: 'f-004', type: 'FACTURE', refBC: 'BC-2024-092', ht: 252101, ttc: 300000, tva: 19, echeance: '05/03/2024', compliance: 'EN ATTENTE', joursRetard: 0 },
                      { id: 'FAC-2024-885', emetteur: 'Global Logistics Algerie', fournisseurId: 'f-001', type: 'FACTURE', refBC: 'BC-2024-115', ht: 630252, ttc: 750000, tva: 19, echeance: '20/03/2024', compliance: 'VÉRIFIÉ', joursRetard: 0 },
                      { id: 'FAC-2024-886', emetteur: 'Industrie Plastique Nord', fournisseurId: 'f-002', type: 'FACTURE', refBC: 'BC-2024-098', ht: 168067, ttc: 200000, tva: 19, echeance: '12/01/2024', compliance: 'VÉRIFIÉ', joursRetard: 38 },
                      { id: 'NOTE-2024-021', emetteur: 'Tech Solutions Import', fournisseurId: 'f-003', type: 'NOTE DÉBIT', refBC: 'BC-2024-071', ht: 42017, ttc: 50000, tva: 19, echeance: '01/03/2024', compliance: 'EN ATTENTE', joursRetard: 0 },
                      { id: 'FAC-2024-887', emetteur: 'Papeterie Centrale SPA', fournisseurId: 'f-004', type: 'FACTURE', refBC: 'BC-2024-103', ht: 84034, ttc: 100000, tva: 19, echeance: '08/04/2024', compliance: 'VÉRIFIÉ', joursRetard: 0 },
                    ].map((fac) => (
                      <tr key={fac.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                        <td className="px-6 py-5">
                          <div>
                            <div className="text-[11px] font-black font-mono text-slate-900 dark:text-white">{fac.id}</div>
                            {fac.joursRetard > 0 && (
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 animate-pulse">+{fac.joursRetard}j retard</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                              {fac.emetteur[0]}
                            </div>
                            <div>
                              <div className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{fac.emetteur}</div>
                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">TVA {fac.tva}%</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${fac.type === 'FACTURE' ? 'bg-slate-900 text-white border-slate-900' :
                            fac.type === 'AVOIR' ? 'bg-white text-slate-500 border-slate-300' :
                              'bg-slate-100 text-slate-700 border-slate-200'
                            }`}>{fac.type}</span>
                        </td>
                        <td className="px-6 py-5 text-[10px] font-bold font-mono text-slate-500">{fac.refBC}</td>
                        <td className="px-6 py-5 text-right text-[11px] font-black font-mono text-slate-500">{formatCurrency(fac.ht)}</td>
                        <td className="px-6 py-5 text-right">
                          <span className="text-sm font-black font-mono text-slate-900 dark:text-white">{formatCurrency(fac.ttc)}</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`text-[10px] font-black font-mono ${fac.joursRetard > 0 ? 'text-slate-900 dark:text-white animate-pulse' : 'text-slate-500'}`}>
                            {fac.echeance}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className={`h-1.5 w-1.5 rounded-full ${fac.compliance === 'VÉRIFIÉ' ? 'bg-slate-900 dark:bg-white' :
                              fac.compliance === 'EN ATTENTE' ? 'bg-slate-400 animate-pulse' :
                                'bg-slate-300'
                              }`}></div>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${fac.compliance === 'VÉRIFIÉ' ? 'text-slate-900 dark:text-white' :
                              fac.compliance === 'EN ATTENTE' ? 'text-slate-500' :
                                'text-slate-300'
                              }`}>{fac.compliance}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-center gap-2 opacity-10 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setSelectedFacture(fac as any); setIsFactureModalOpen(true); }} className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors" title="Voir détails">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button onClick={() => alert(`Impression de ${fac.id}`)} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-900 rounded-lg transition-colors" title="Imprimer">
                              <PrinterIcon className="h-4 w-4" />
                            </button>
                            <button onClick={() => alert(`Validation de ${fac.id}`)} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-900 rounded-lg transition-colors" title="Valider">
                              <DocumentCheckIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-800/50 border-t-2 border-slate-200 dark:border-slate-700">
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Exercice 2024</td>
                      <td className="px-6 py-4 text-right text-[11px] font-black font-mono text-slate-600 dark:text-slate-300">{formatCurrency(1726891)}</td>
                      <td className="px-6 py-4 text-right text-sm font-black font-mono text-slate-900 dark:text-white">{formatCurrency(2055000)}</td>
                      <td colSpan={3}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          </div>
        )}


        {/* Onglet Paiements */}
        {activeTab === 'paiements' && (
          <div className="space-y-8">
            {/* Header */}
            <div className="bg-slate-900 text-white p-12 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)]"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Trésorerie Fournisseurs</p>
                  <h2 className="text-4xl font-black uppercase tracking-tighter italic">Règlements & Échéancier</h2>
                  <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-[0.3em] opacity-80 decoration-slate-600 underline underline-offset-8">Gestion des Flux de Décaissement</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleNouveauReglement}
                    className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 flex items-center gap-2"
                  >
                    <BanknotesIcon className="h-4 w-4" />
                    Nouveau Règlement
                  </button>
                  <button
                    onClick={handleGenererEcheancier}
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10"
                  >
                    Générer Échéancier
                  </button>
                </div>
              </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Total Décaissé", val: formatCurrency(575000), sub: "Exercice 2024", icon: BanknotesIcon, trend: "3 virements" },
                { label: "En Instance", val: formatCurrency(825000), sub: "Règlements à émettre", icon: ClockIcon, trend: "2 éch. proches" },
                { label: "En Retard", val: formatCurrency(125000), sub: "Pénalités potentielles", icon: ExclamationTriangleIcon, trend: "1 fournisseur" },
                { label: "DPO Moyen", val: "42 jours", sub: "Days Payable Outstanding", icon: ChartBarIcon, trend: "Cible: 45j" },
              ].map((kpi, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <kpi.icon className="h-5 w-5 text-slate-900 dark:text-white" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{kpi.trend}</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{kpi.label}</p>
                  <p className="text-lg font-black font-mono text-slate-900 dark:text-white">{kpi.val}</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1">{kpi.sub}</p>
                </div>
              ))}
            </div>

            {/* Payments Table */}
            <Card className="p-0 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Historique des Règlements</h3>
                <div className="flex gap-2">
                  {['Tous', 'EFFECTUÉ', 'INSTANCE', 'RETARD'].map((f, i) => (
                    <button key={f} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${i === 0 ? 'bg-slate-900 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900'}`}>{f}</button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Référence</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Fournisseur</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Réf. Facture</th>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Statut</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { id: 'VIR-2024-001', name: 'Global Logistics Algerie', fId: 'f-001', facture: 'FAC-2024-881', mode: 'Virement', date: '15/01/2024', echeance: '15/01/2024', mount: 450000, status: 'EFFECTUÉ', retard: 0 },
                      { id: 'VIR-2024-002', name: 'Industrie Plastique Nord', fId: 'f-002', facture: 'FAC-2024-882', mode: 'Chèque', date: '18/02/2024', echeance: '28/02/2024', mount: 120000, status: 'INSTANCE', retard: 0 },
                      { id: 'VIR-2024-003', name: 'Tech Solutions Import', fId: 'f-003', facture: 'FAC-2024-883', mode: 'Virement', date: '10/01/2024', echeance: '10/01/2024', mount: 85000, status: 'RETARD', retard: 40 },
                      { id: 'VIR-2024-004', name: 'Papeterie Centrale SPA', fId: 'f-004', facture: 'FAC-2024-884', mode: 'Traite', date: '', echeance: '05/03/2024', mount: 300000, status: 'INSTANCE', retard: 0 },
                      { id: 'VIR-2024-005', name: 'Global Logistics Algerie', fId: 'f-001', facture: 'FAC-2024-885', mode: 'Virement', date: '20/01/2024', echeance: '20/01/2024', mount: 125000, status: 'EFFECTUÉ', retard: 0 },
                      { id: 'VIR-2024-006', name: 'Industrie Plastique Nord', fId: 'f-002', facture: 'FAC-2024-886', mode: 'Virement', date: '', echeance: '12/03/2024', mount: 200000, status: 'INSTANCE', retard: 0 },
                    ].map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="text-[10px] font-black font-mono text-slate-900 dark:text-white">{pay.id}</div>
                          {pay.retard > 0 && <div className="text-[9px] font-black text-slate-400 animate-pulse">+{pay.retard}j retard</div>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-7 w-7 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-[9px] font-black text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
                              {pay.name[0]}
                            </div>
                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{pay.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[10px] font-bold font-mono text-slate-500">{pay.facture}</td>
                        <td className="px-6 py-4">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{pay.mode}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-[10px] font-bold font-mono text-slate-500">{pay.date || '—'}</div>
                          <div className="text-[9px] font-bold text-slate-400">Éch: {pay.echeance}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-black font-mono text-slate-900 dark:text-white">{formatCurrency(pay.mount)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className={`h-1.5 w-1.5 rounded-full ${pay.status === 'EFFECTUÉ' ? 'bg-slate-900 dark:bg-white' :
                              pay.status === 'INSTANCE' ? 'bg-slate-400 animate-pulse' :
                                'bg-slate-300 animate-pulse'
                              }`}></div>
                            <span className={`text-[9px] font-black uppercase tracking-widest ${pay.status === 'EFFECTUÉ' ? 'text-slate-900 dark:text-white' :
                              pay.status === 'INSTANCE' ? 'text-slate-500' : 'text-slate-300'
                              }`}>{pay.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2 opacity-10 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleVoirReglement(pay)}
                              className="p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                              title="Voir"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => alert(`Impression de la pièce ${pay.id}`)}
                              className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-900 rounded-lg"
                              title="Imprimer"
                            >
                              <PrinterIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 dark:bg-slate-800/50 border-t-2 border-slate-200 dark:border-slate-700">
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Exercice 2024</td>
                      <td className="px-6 py-4 text-right text-sm font-black font-mono text-slate-900 dark:text-white">{formatCurrency(1280000)}</td>
                      <td colSpan={2}></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Onglet Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Hero Header */}
            <div className="bg-slate-900 text-white p-12 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)]"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">Performance & Volume</p>
                  <h2 className="text-4xl font-black uppercase tracking-tighter italic">Analytique Consolidée</h2>
                  <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-[0.3em] opacity-80">Exercice 2024 — 4 fournisseurs actifs</p>
                </div>
                <button
                  onClick={handleGenererRapportExecutif}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 flex items-center gap-2"
                >
                  <DocumentCheckIcon className="h-4 w-4" />
                  Générer Rapport Exécutif
                </button>
              </div>
            </div>

            {/* KPI Cards — Enriched */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Engagements Totaux", val: formatCurrency(5940000), sub: "Total achats 2024", trend: "+18.3% vs 2023", icon: ChartPieIcon },
                { label: "Lead Time Moyen", val: "12.4j", sub: "Cmd → livraison", trend: "-2.1j vs 2023", icon: ClockIcon },
                { label: "Score Qualité", val: "87/100", sub: "Avg. 4 fournisseurs", trend: "STABLE", icon: StarIcon },
                { label: "Bons de Commande", val: "156", sub: "Émis sur l'exercice", trend: "+8% vs 2023", icon: ChartBarIcon },
              ].map((kpi, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <kpi.icon className="h-5 w-5 text-slate-900 dark:text-white" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{kpi.trend}</span>
                  </div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">{kpi.label}</p>
                  <p className="text-2xl font-black font-mono text-slate-900 dark:text-white">{kpi.val}</p>
                  <p className="text-xs font-medium text-slate-400 mt-2">{kpi.sub}</p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card title="Évolution des Engagements HT (k DA)" className="p-8 border-slate-200 dark:border-slate-800 rounded-[2rem]">
                <div className="h-64 mt-6">
                  <LineChart
                    title="Évolution des Engagements HT"
                    data={[285, 320, 410, 375, 495, 480, 540, 510, 620, 665, 710, 730]}
                    labels={['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']}
                    borderColor="#0f172a"
                    backgroundColor="rgba(15, 23, 42, 0.05)"
                  />
                </div>
              </Card>

              <Card title="Répartition par Fournisseur" className="p-8 border-slate-200 dark:border-slate-800 rounded-[2rem]">
                <div className="h-64 mt-6">
                  <DoughnutChart
                    title="Répartition par Fournisseur"
                    data={[48, 32, 14, 6]}
                    labels={['Global Logistics Algerie', 'Industrie Plastique Nord', 'Tech Solutions Import', 'Papeterie Centrale SPA']}
                    colors={['#0f172a', '#334155', '#475569', '#94a3b8']}
                  />
                </div>
              </Card>
            </div>

            {/* Top Fournisseurs Performance Table */}
            <Card className="p-0 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Performance par Fournisseur — Exercice 2024</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Fournisseur</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Achats HT</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Nb BC</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Lead Time</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Qualité</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">DPO</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Part (%)</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Tendance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { nom: 'Global Logistics Algerie', achats: 2850000, bc: 67, leadTime: '10j', qualite: 92, dpo: 45, part: 48, trend: '▲' },
                      { nom: 'Industrie Plastique Nord', achats: 1920000, bc: 48, leadTime: '14j', qualite: 86, dpo: 38, part: 32, trend: '▲' },
                      { nom: 'Tech Solutions Import', achats: 850000, bc: 27, leadTime: '18j', qualite: 78, dpo: 52, part: 14, trend: '▼' },
                      { nom: 'Papeterie Centrale SPA', achats: 320000, bc: 14, leadTime: '7j', qualite: 95, dpo: 30, part: 6, trend: '—' },
                    ].map((f, i) => (
                      <tr key={f.nom} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-7 w-7 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black">{i + 1}</div>
                            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{f.nom}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-black font-mono text-slate-900 dark:text-white">{formatCurrency(f.achats)}</td>
                        <td className="px-6 py-4 text-center text-xs font-black font-mono text-slate-500">{f.bc}</td>
                        <td className="px-6 py-4 text-center text-xs font-black font-mono text-slate-500">{f.leadTime}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-900 dark:bg-white rounded-full" style={{ width: `${f.qualite}%` }}></div>
                            </div>
                            <span className="text-[10px] font-black font-mono text-slate-900 dark:text-white">{f.qualite}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-xs font-black font-mono text-slate-500">{f.dpo}j</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-slate-900 dark:bg-white rounded-full" style={{ width: `${f.part * 2}%` }}></div>
                            </div>
                            <span className="text-[10px] font-black font-mono text-slate-900 dark:text-white">{f.part}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-sm font-black ${f.trend === '▲' ? 'text-slate-900 dark:text-white' :
                            f.trend === '▼' ? 'text-slate-300' : 'text-slate-400'
                            }`}>{f.trend}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Add/Edit Supplier Modal Amélioré */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedFournisseur ? 'Modifier Fournisseur' : 'Ajouter Nouveau Fournisseur'}
          size="xl"
        >
          <div className="max-h-[80vh] overflow-y-auto pr-2">
            <form className="space-y-6" onSubmit={handleFournisseurSubmit}>
              {/* Informations générales */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <BuildingOfficeIcon className="h-4 w-4 text-slate-900 dark:text-white" />
                  </div>
                  Informations Générales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      Nom de l'entreprise *
                    </label>
                    <input
                      name="nom"
                      type="text"
                      defaultValue={selectedFournisseur?.nom || ''}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                      placeholder="Ex: Fournisseur ABC SPA"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      NIF (15 chiffres) *
                    </label>
                    <input
                      name="nif"
                      type="text"
                      defaultValue={selectedFournisseur?.nif || ''}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                      placeholder="123456789012345"
                      maxLength={15}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      Type d'entreprise
                    </label>
                    <select name="type_entreprise" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all" aria-label="Type d'entreprise">
                      <option>SPA (Société par Actions)</option>
                      <option>SARL (Société à Responsabilité Limitée)</option>
                      <option>EURL (Entreprise Unipersonnelle à Responsabilité Limitée)</option>
                      <option>SNC (Société en Nom Collectif)</option>
                      <option>Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      Secteur d'activité
                    </label>
                    <select name="secteur_activite" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all" aria-label="Secteur d'activité">
                      <option>Matériel de bureau</option>
                      <option>Équipements informatiques</option>
                      <option>Fournitures de bureau</option>
                      <option>Services de transport</option>
                      <option>Services de maintenance</option>
                      <option>Services de nettoyage</option>
                      <option>Services de sécurité</option>
                      <option>Autre</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Adresse et contact */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <MapPinIcon className="h-4 w-4 text-slate-900 dark:text-white" />
                  </div>
                  Adresse et Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      Adresse complète *
                    </label>
                    <textarea
                      name="adresse"
                      defaultValue={selectedFournisseur?.adresse || ''}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                      placeholder="Rue, numéro, ville, wilaya, code postal"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      Téléphone principal *
                    </label>
                    <input
                      name="telephone"
                      type="tel"
                      defaultValue={selectedFournisseur?.telephone || ''}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                      placeholder="+213 XX XXX XXX"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      Téléphone secondaire
                    </label>
                    <input
                      name="telephone_secondaire"
                      type="tel"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                      placeholder="+213 XX XXX XXX"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      Email principal *
                    </label>
                    <input
                      name="email"
                      type="email"
                      defaultValue={selectedFournisseur?.email || ''}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                      placeholder="contact@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                      Email secondaire
                    </label>
                    <input
                      name="email_secondaire"
                      type="email"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                      placeholder="comptabilite@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Informations financières */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Informations Financières
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Banque
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Banque">
                      <option>Banque Nationale d'Algérie (BNA)</option>
                      <option>Crédit Populaire d'Algérie (CPA)</option>
                      <option>Banque Extérieure d'Algérie (BEA)</option>
                      <option>Banque de l'Agriculture et du Développement Rural (BADR)</option>
                      <option>Banque de Développement Local (BDL)</option>
                      <option>Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro de compte
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Conditions de paiement
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Conditions de paiement">
                      <option>Paiement comptant</option>
                      <option>30 jours</option>
                      <option>45 jours</option>
                      <option>60 jours</option>
                      <option>90 jours</option>
                      <option>Autre</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Limite de crédit (DA)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1000000"
                    />
                  </div>
                </div>
              </div>

              {/* Informations de contact */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-orange-600" />
                  Personnes de Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact commercial
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nom et prénom"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone contact commercial
                    </label>
                    <input
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+213 XX XXX XXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact comptabilité
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nom et prénom"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email contact comptabilité
                    </label>
                    <input
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="comptabilite@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Notes et observations */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-600" />
                  Notes et Observations
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes internes
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Informations supplémentaires, conditions spéciales, etc."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  {selectedFournisseur ? 'Modifier Fournisseur' : 'Ajouter Fournisseur'}
                </button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Modal Détails Commande */}
        <Modal
          isOpen={isCommandeModalOpen}
          onClose={() => setIsCommandeModalOpen(false)}
          title={`Détails Commande ${selectedCommande?.numero || ''}`}
          size="xl"
        >
          <div className="max-h-[80vh] overflow-y-auto pr-2">
            {selectedCommande && (
              <div className="space-y-6">
                {/* Informations générales */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Informations Générales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de Commande</label>
                      <p className="text-sm text-gray-900 font-medium">{selectedCommande.numero}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                      <p className="text-sm text-gray-900">{selectedCommande.fournisseur}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Montant</label>
                      <p className="text-sm text-gray-900 font-bold">{formatCurrency(selectedCommande.montant)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedCommande.statut === 'Livrée' ? 'bg-green-100 text-green-800' :
                        selectedCommande.statut === 'En attente' ? 'bg-orange-100 text-orange-800' :
                          selectedCommande.statut === 'En préparation' ? 'bg-blue-100 text-blue-800' :
                            selectedCommande.statut === 'En livraison' ? 'bg-yellow-100 text-yellow-800' :
                              selectedCommande.statut === 'En retard' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                        }`}>
                        {selectedCommande.statut}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Articles de la commande */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2 text-green-600" />
                    Articles Commandés
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix Unitaire HT</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">TVA (19%)</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total TTC</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td className="px-4 py-2 text-sm text-gray-900">Matériel de bureau - Classeur</td>
                          <td className="px-4 py-2 text-sm text-gray-900">10</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(4200)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(800)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">{formatCurrency(50000)}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2 text-sm text-gray-900">Fournitures de bureau - Papier A4</td>
                          <td className="px-4 py-2 text-sm text-gray-900">5</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(12600)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(2400)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">{formatCurrency(75000)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Informations fiscales et SCF */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <DocumentCheckIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Conformité Fiscale Algérienne & SCF
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Informations fiscales */}
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-blue-800 flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                        Informations Fiscales
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Montant HT :</span>
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(168000)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">TVA (19%) :</span>
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(32000)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-sm font-semibold text-gray-800">Total TTC :</span>
                          <span className="text-sm font-bold text-gray-900">{formatCurrency(200000)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Timbre fiscal :</span>
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(200)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Informations SCF */}
                    <div className="space-y-4">
                      <h4 className="text-md font-semibold text-blue-800 flex items-center">
                        <ClipboardDocumentCheckIcon className="h-4 w-4 mr-2" />
                        Système SCF
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Code SCF :</span>
                          <span className="text-sm font-medium text-gray-900">SCF-2024-001</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Date SCF :</span>
                          <span className="text-sm font-medium text-gray-900">15/01/2024</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Statut SCF :</span>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Validé
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Référence fiscale :</span>
                          <span className="text-sm font-medium text-gray-900">RF-2024-001</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents et pièces justificatives */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <DocumentIcon className="h-5 w-5 mr-2 text-green-600" />
                    Documents & Pièces Justificatives
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Bon de commande</p>
                            <p className="text-xs text-gray-500">CMD-2024-001.pdf</p>
                          </div>
                        </div>
                        <button type="button" className="text-blue-600 hover:text-blue-800" aria-label="Télécharger le document">
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex items-center">
                          <DocumentCheckIcon className="h-5 w-5 text-green-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Facture fournisseur</p>
                            <p className="text-xs text-gray-500">FAC-2024-001.pdf</p>
                          </div>
                        </div>
                        <button type="button" className="text-green-600 hover:text-green-800" aria-label="Télécharger le document">
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex items-center">
                          <DocumentIcon className="h-5 w-5 text-purple-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Attestation SCF</p>
                            <p className="text-xs text-gray-500">SCF-2024-001.pdf</p>
                          </div>
                        </div>
                        <button type="button" className="text-purple-600 hover:text-purple-800" aria-label="Télécharger le document">
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-5 w-5 text-orange-600 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Bordereau de livraison</p>
                            <p className="text-xs text-gray-500">BL-2024-001.pdf</p>
                          </div>
                        </div>
                        <button type="button" className="text-orange-600 hover:text-orange-800" aria-label="Télécharger le document">
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Historique des modifications */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2 text-yellow-600" />
                    Historique des Modifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Commande livrée</p>
                        <p className="text-xs text-gray-500">15/02/2024 - 14:30 par Ahmed Benali</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Commande confirmée</p>
                        <p className="text-xs text-gray-500">16/01/2024 - 09:15 par Fatima Khelil</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Commande créée</p>
                        <p className="text-xs text-gray-500">15/01/2024 - 10:00 par Mohamed Boudiaf</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => alert('Génération du rapport fiscal en cours...')}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center text-sm"
                    >
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      Rapport Fiscal
                    </button>
                    <button
                      onClick={() => alert('Export SCF en cours...')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center text-sm"
                    >
                      <DocumentCheckIcon className="h-4 w-4 mr-2" />
                      Export SCF
                    </button>
                    <button
                      onClick={() => alert('Génération de la déclaration TVA...')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                    >
                      <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                      Déclaration TVA
                    </button>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsCommandeModalOpen(false)}
                      className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Fermer
                    </button>
                    <button
                      onClick={() => handleImprimerCommande(selectedCommande)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <PrinterIcon className="h-5 w-5 mr-2" />
                      Imprimer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* Modal Nouvelle Commande */}
        <Modal
          isOpen={isNouvelleCommandeModalOpen}
          onClose={() => { setIsNouvelleCommandeModalOpen(false); setSelectedCommande(null); }}
          title={selectedCommande ? 'Modifier Bon de Commande' : 'Nouveau Bon de Commande'}
          size="xl"
        >
          <div className="max-h-[82vh] overflow-y-auto pr-2 space-y-5">
            <form className="space-y-5" onSubmit={handleCommandeSubmit}>

              {/* Section 1 — Identité */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-5 flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <ClipboardDocumentListIcon className="h-4 w-4 text-slate-900 dark:text-white" />
                  </div>
                  Identification du Bon de Commande
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Réf. BC</label>
                    <input
                      name="ref_bc"
                      type="text"
                      defaultValue={selectedCommande ? selectedCommande.id : `BC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                      placeholder="BC-2024-XXX"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Fournisseur *</label>
                    <select
                      name="fournisseur_name"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all"
                      required
                      defaultValue={selectedCommande ? selectedCommande.name : ""}
                    >
                      <option value="">Sélectionner un fournisseur</option>
                      {fournisseursList.map(f => (
                        <option key={f.id} value={f.nom}>{f.nom}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Statut</label>
                    <select name="statut" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all" defaultValue={selectedCommande?.status || 'INSTANCE'}>
                      <option value="INSTANCE">En instance</option>
                      <option value="APPROBATION">En approbation</option>
                      <option value="CONFIRMÉE">Confirmée</option>
                      <option value="TRANSIT">En transit</option>
                      <option value="LIVRÉE">Livrée</option>
                      <option value="ANNULÉE">Annulée</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2 — Dates & Conditions */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-5 flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <ClockIcon className="h-4 w-4 text-slate-900 dark:text-white" />
                  </div>
                  Dates & Conditions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Date d'émission *</label>
                    <input name="date_commande" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Date de livraison *</label>
                    <input name="date_livraison" type="date" required className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Délai de règlement</label>
                    <select name="delai_reglement" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all">
                      <option>Comptant</option>
                      <option>30 jours</option>
                      <option>45 jours</option>
                      <option>60 jours</option>
                      <option>90 jours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Mode de paiement</label>
                    <select name="mode_paiement" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all">
                      <option>Virement bancaire</option>
                      <option>Chèque</option>
                      <option>Espèces</option>
                      <option>Traite</option>
                      <option>LC (Lettre de Crédit)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3 — Adresse de livraison */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-5 flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <MapPinIcon className="h-4 w-4 text-slate-900 dark:text-white" />
                  </div>
                  Adresse de Livraison
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Adresse complète</label>
                    <input name="adresse_livraison" type="text" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all" placeholder="Rue, zone industrielle, commune..." />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Wilaya</label>
                    <input name="wilaya" type="text" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all" placeholder="Alger, Oran, Constantine..." />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Responsable réception</label>
                    <input name="responsable_reception" type="text" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all" placeholder="Nom et prénom" />
                  </div>
                </div>
              </div>

              {/* Section 4 — Lignes d'articles */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-5 flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <DocumentTextIcon className="h-4 w-4 text-slate-900 dark:text-white" />
                  </div>
                  Lignes d'Articles
                </h3>

                {/* Table header */}
                <div className="hidden md:grid grid-cols-12 gap-2 mb-3 px-2">
                  <div className="col-span-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Désignation</div>
                  <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Qté</div>
                  <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Unité</div>
                  <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">PU HT (DA)</div>
                  <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total HT</div>
                </div>

                <div className="space-y-3">
                  {[1, 2, 3].map((line) => (
                    <div key={line} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="col-span-4">
                        <input type="text" name={`article_${line}_nom`} className="w-full px-3 py-2 bg-transparent border-b border-slate-200 dark:border-slate-700 text-sm font-medium focus:border-slate-900 outline-none transition-all" placeholder={`Article ${line}`} />
                      </div>
                      <div className="col-span-2">
                        <input type="number" name={`article_${line}_qte`} min="0" defaultValue="1" className="w-full px-3 py-2 bg-transparent border-b border-slate-200 dark:border-slate-700 text-sm font-mono font-medium focus:border-slate-900 outline-none transition-all" />
                      </div>
                      <div className="col-span-2">
                        <select name={`article_${line}_unite`} className="w-full px-2 py-2 bg-transparent border-b border-slate-200 dark:border-slate-700 text-xs font-medium focus:border-slate-900 outline-none transition-all">
                          <option>Unité</option>
                          <option>Kg</option>
                          <option>Tonne</option>
                          <option>m²</option>
                          <option>Litre</option>
                          <option>Carton</option>
                          <option>Palette</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input type="number" name={`article_${line}_pu`} min="0" defaultValue="0" className="w-full px-3 py-2 bg-transparent border-b border-slate-200 dark:border-slate-700 text-sm font-mono font-medium focus:border-slate-900 outline-none transition-all" />
                      </div>
                      <div className="col-span-2 text-right text-xs font-black font-mono text-slate-400">—</div>
                    </div>
                  ))}
                </div>

                {/* Totaux */}
                <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                  <div className="space-y-2 min-w-[260px]">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant HT</span>
                      <span className="text-sm font-black font-mono text-slate-900 dark:text-white">—</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TVA (19%)</span>
                      <span className="text-sm font-black font-mono text-slate-600">—</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Total TTC</span>
                      <span className="text-base font-black font-mono text-slate-900 dark:text-white">—</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5 — Notes & Conditions */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-5 flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                    <DocumentTextIcon className="h-4 w-4 text-slate-900 dark:text-white" />
                  </div>
                  Notes & Conditions Particulières
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Notes internes</label>
                    <textarea name="notes_internes" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all resize-none" placeholder="Instructions internes, budget alloué, priorité..." rows={4} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Conditions du fournisseur</label>
                    <textarea name="conditions_fournisseur" className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all resize-none" placeholder="Incoterms, garanties, pénalités de retard..." rows={4} />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                <button type="button" onClick={() => alert('Génération du BC en PDF...')} className="flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                  <PrinterIcon className="h-4 w-4" /> Aperçu PDF
                </button>
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setIsNouvelleCommandeModalOpen(false); setSelectedCommande(null); }} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                    Annuler
                  </button>
                  <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
                    <CheckCircleIcon className="h-4 w-4" />
                    {selectedCommande ? 'Mettre à jour' : 'Émettre le BC'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </Modal>

        {/* Modal Détails Facture */}
        <Modal
          isOpen={isFactureModalOpen}
          onClose={() => setIsFactureModalOpen(false)}
          title={`Détails Facture ${selectedFacture?.numero || ''}`}
          size="xl"
        >
          <div className="max-h-[80vh] overflow-y-auto pr-2">
            {selectedFacture && (
              <div className="space-y-6">
                {/* Informations générales */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Informations Générales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de Facture</label>
                      <p className="text-sm text-gray-900 font-medium">{selectedFacture.numero}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                      <p className="text-sm text-gray-900">{selectedFacture.fournisseur}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Montant</label>
                      <p className="text-sm text-gray-900 font-bold">{formatCurrency(selectedFacture.montant)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedFacture.statut === 'Payée' ? 'bg-green-100 text-green-800' :
                        selectedFacture.statut === 'En attente' ? 'bg-orange-100 text-orange-800' :
                          selectedFacture.statut === 'En retard' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {selectedFacture.statut}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Détails fiscaux */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Détails Fiscaux
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Montant HT :</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedFacture.montant * 0.84)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">TVA (19%) :</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedFacture.montant * 0.16)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-sm font-semibold text-gray-800">Total TTC :</span>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(selectedFacture.montant)}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Date d'émission :</span>
                        <span className="text-sm font-medium text-gray-900">15/01/2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Date d'échéance :</span>
                        <span className="text-sm font-medium text-gray-900">15/02/2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Référence SCF :</span>
                        <span className="text-sm font-medium text-gray-900">SCF-{selectedFacture.numero}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setIsFactureModalOpen(false)}
                    className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => handleImprimerFacture(selectedFacture)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <PrinterIcon className="h-5 w-5 mr-2" />
                    Imprimer
                  </button>
                  {selectedFacture.statut !== 'Payée' && (
                    <button
                      onClick={() => handlePayerFacture(selectedFacture)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <BanknotesIcon className="h-5 w-5 mr-2" />
                      Payer
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* Modal Paiement */}
        <Modal
          isOpen={isPaiementModalOpen}
          onClose={() => setIsPaiementModalOpen(false)}
          title={`Paiement Facture ${selectedFacture?.numero || ''}`}
          size="lg"
        >
          <div className="max-h-[80vh] overflow-y-auto pr-2">
            {selectedFacture && (
              <div className="space-y-6">
                {/* Informations de la facture */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Facture à Payer
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
                      <p className="text-sm text-gray-900 font-medium">{selectedFacture.numero}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                      <p className="text-sm text-gray-900">{selectedFacture.fournisseur}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Montant à Payer</label>
                      <p className="text-lg text-gray-900 font-bold">{formatCurrency(selectedFacture.montant)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Échéance</label>
                      <p className="text-sm text-gray-900">15/02/2024</p>
                    </div>
                  </div>
                </div>

                {/* Formulaire de paiement */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <BanknotesIcon className="h-5 w-5 mr-2 text-green-600" />
                    Détails du Paiement
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mode de Paiement *
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required aria-label="Mode de Paiement">
                        <option value="">Sélectionner un mode</option>
                        <option value="virement">Virement bancaire</option>
                        <option value="cheque">Chèque</option>
                        <option value="especes">Espèces</option>
                        <option value="carte">Carte bancaire</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de Paiement *
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        aria-label="Date de Paiement"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Référence du Paiement
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Numéro de chèque, référence virement..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Notes sur le paiement..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setIsPaiementModalOpen(false)}
                    className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      alert(`Paiement de la facture ${selectedFacture.numero} enregistré avec succès !`);
                      setIsPaiementModalOpen(false);
                    }}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Confirmer le Paiement
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>

        {/* Modal Nouvelle Facture */}
        <Modal
          isOpen={isNouvelleFactureModalOpen}
          onClose={() => {
            setIsNouvelleFactureModalOpen(false);
            setSignatureData(null);
            setShowSignaturePad(false);
          }}
          title="Nouvelle Facture Fournisseur"
          size="xl"
        >
          <div className="space-y-6">
            <InvoiceFormWithOCR
              onClose={() => {
                setIsNouvelleFactureModalOpen(false);
                setSignatureData(null);
                setShowSignaturePad(false);
              }}
              topFournisseurs={mockFournisseurs.slice(0, 10).map((f: any) => ({
                nom: f.name || f.nom || '',
                nif: f.tax_id || f.nif || '',
                montant: Number(f.total_purchases || f.soldeDu || 0),
                factures: f.invoices_count || 0,
                delai: f.average_payment_days || 30
              }))}
            />
          </div>
        </Modal>

        {/* Modal Analyse de Performance */}
        <Modal
          isOpen={isPerformanceModalOpen}
          onClose={() => setIsPerformanceModalOpen(false)}
          title="Analyse de Performance des Fournisseurs"
          size="xl"
        >
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Analyse de performance basée sur la qualité, les délais, le service et le DPO.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest">Fournisseur</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Score</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Qualité</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Délai Liv.</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Service</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">DPO</th>
                    <th className="px-6 py-4 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">Classement</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
                  {analysesPerformance.slice(0, 10).map((analyse) => (
                    <tr key={analyse.fournisseurId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">{analyse.fournisseurNom}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs font-black font-mono text-slate-900 dark:text-white">
                          {analyse.scorePerformance}/100
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-right text-slate-600 dark:text-slate-400 font-mono">{analyse.tauxQualite.toFixed(1)}%</td>
                      <td className="px-6 py-4 text-xs font-medium text-right text-slate-600 dark:text-slate-400 font-mono">{analyse.delaiLivraisonMoyen.toFixed(0)}j</td>
                      <td className="px-6 py-4 text-xs font-medium text-right text-slate-600 dark:text-slate-400 font-mono">{analyse.tauxService.toFixed(1)}%</td>
                      <td className="px-6 py-4 text-xs font-medium text-right text-slate-600 dark:text-slate-400 font-mono">{analyse.dpoMoyen.toFixed(0)}j</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${analyse.classement === 'excellent' ? 'bg-slate-900 text-white border-slate-900' :
                          analyse.classement === 'bon' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                            analyse.classement === 'moyen' ? 'bg-white text-slate-500 border-slate-200' :
                              'bg-white text-slate-400 border-slate-200'
                          }`}>
                          {analyse.classement}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsPerformanceModalOpen(false)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal Optimisation des Coûts */}
        <Modal
          isOpen={isOptimisationModalOpen}
          onClose={() => setIsOptimisationModalOpen(false)}
          title="Optimisation des Coûts Fournisseurs"
          size="xl"
        >
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                Opportunités d'optimisation des coûts avec stratégies de négociation, volume et paiement.
              </p>
            </div>

            <div className="space-y-4">
              {optimisationsCouts.slice(0, 10).map((opt) => (
                <div key={opt.fournisseurId} className="p-4 rounded-lg border-2 border-green-200 bg-green-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-900">{opt.fournisseurNom}</h4>
                      <p className="text-sm text-slate-600">Économie potentielle: {formatCurrency(opt.economiePotentielle)} ({opt.economiePourcentage.toFixed(1)}%)</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${opt.priorite === 'haute' ? 'bg-red-100 text-red-800' :
                      opt.priorite === 'moyenne' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                      {opt.priorite}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-slate-600">Coût actuel</p>
                      <p className="text-lg font-bold text-slate-900">{formatCurrency(opt.coutActuel)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Coût optimisé</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(opt.coutOptimise)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-600">Stratégies:</p>
                    {opt.strategies.map((strategy, idx) => (
                      <div key={idx} className="bg-white p-2 rounded text-xs">
                        <span className="font-medium">{strategy.description}</span>
                        <span className="ml-2 text-green-600">({formatCurrency(strategy.economie)})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsOptimisationModalOpen(false)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal Prévisions d'Achats */}
        <Modal
          isOpen={isPrevisionsAchatsModalOpen}
          onClose={() => setIsPrevisionsAchatsModalOpen(false)}
          title="Prévisions d'Achats par Fournisseur"
          size="xl"
        >
          <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-800">
                Prévisions d'achats sur 6 mois basées sur l'historique, la tendance et la saisonnalité.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Fournisseur</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Période</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Montant Prévu</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Probabilité</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Confiance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {previsionsAchats.slice(0, 20).map((prev, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{prev.fournisseurNom}</td>
                      <td className="px-4 py-3 text-sm text-right">{prev.periode}</td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(prev.montantPrevu)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-16 bg-slate-200 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${prev.probabilite >= 80 ? 'bg-green-500' :
                                prev.probabilite >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                              style={{ width: `${prev.probabilite}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">{prev.probabilite.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${prev.confiance === 'haute' ? 'bg-green-100 text-green-800' :
                          prev.confiance === 'moyenne' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                          {prev.confiance}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsPrevisionsAchatsModalOpen(false)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal Opportunités de Négociation */}
        <Modal
          isOpen={isNegociationsModalOpen}
          onClose={() => setIsNegociationsModalOpen(false)}
          title="Opportunités de Négociation"
          size="xl"
        >
          <div className="space-y-6">
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="text-sm text-amber-800">
                Opportunités de négociation identifiées pour optimiser les relations fournisseurs.
              </p>
            </div>

            <div className="space-y-3">
              {opportunitesNegociation.slice(0, 15).map((neg) => (
                <div
                  key={neg.id}
                  className={`p-4 rounded-lg border-2 ${neg.priorite === 'haute' ? 'bg-red-50 border-red-300' :
                    neg.priorite === 'moyenne' ? 'bg-yellow-50 border-yellow-300' :
                      'bg-blue-50 border-blue-300'
                    }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-900">{neg.fournisseurNom}</h4>
                      <p className="text-sm text-slate-700">{neg.objectif}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${neg.statut === 'terminee' ? 'bg-green-100 text-green-800' :
                      neg.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {neg.statut}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Type:</span>
                      <span className="ml-2 font-medium capitalize">{neg.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Actuel:</span>
                      <span className="ml-2 font-medium">{typeof neg.valeurActuelle === 'number' ? formatCurrency(neg.valeurActuelle) : neg.valeurActuelle}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Cible:</span>
                      <span className="ml-2 font-medium text-green-600">{typeof neg.valeurCible === 'number' ? formatCurrency(neg.valeurCible) : neg.valeurCible}</span>
                    </div>
                    {neg.economiePotentielle > 0 && (
                      <div>
                        <span className="text-slate-600">Économie:</span>
                        <span className="ml-2 font-bold text-green-600">{formatCurrency(neg.economiePotentielle)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${neg.difficulte === 'facile' ? 'bg-green-100 text-green-800' :
                      neg.difficulte === 'moyenne' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {neg.difficulte}
                    </span>
                    <span className="text-xs text-slate-500">Date limite: {new Date(neg.dateLimite).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsNegociationsModalOpen(false)}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal Évaluation des Risques - High-End Monochrome */}
        <Modal
          isOpen={isRisquesModalOpen}
          onClose={() => setIsRisquesModalOpen(false)}
          title="Matrice de Vigilance Fournisseurs"
          size="xl"
        >
          <div className="space-y-8 p-4">
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-20"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Évaluation de Conformité</h3>
                <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-widest opacity-80">Audit de Robustesse & Stabilité des Partenaires</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {risquesFournisseurs.slice(0, 10).map((risque) => (
                <div
                  key={risque.fournisseurId}
                  className={`p-6 rounded-[2.5rem] border-2 transition-all ${risque.niveauRisque === 'critique'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'
                    }`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h4 className={`text-lg font-black uppercase tracking-tight ${risque.niveauRisque === 'critique' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {risque.fournisseurNom}
                      </h4>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${risque.niveauRisque === 'critique' ? 'text-slate-400' : 'text-slate-500'}`}>
                        Indice Composite : {risque.scoreRisque}/100
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] ${risque.niveauRisque === 'critique' ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
                      }`}>
                      {risque.niveauRisque}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${risque.niveauRisque === 'critique' ? 'text-slate-400' : 'text-slate-500'}`}>Facteurs de Risque :</p>
                    {risque.facteursRisque.map((facteur, idx) => (
                      <div key={idx} className={`p-4 rounded-2xl flex justify-between items-center ${risque.niveauRisque === 'critique' ? 'bg-white/5' : 'bg-slate-50 dark:bg-slate-800'
                        }`}>
                        <span className="text-xs font-bold">{facteur.description}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">{facteur.type}</span>
                      </div>
                    ))}
                  </div>

                  {risque.recommandations.length > 0 && (
                    <div className={`pt-4 border-t ${risque.niveauRisque === 'critique' ? 'border-white/10' : 'border-slate-100 dark:border-slate-800'}`}>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${risque.niveauRisque === 'critique' ? 'text-slate-400' : 'text-slate-500'}`}>Recommandations Audit :</p>
                      <ul className="space-y-2">
                        {risque.recommandations.map((rec, idx) => (
                          <li key={idx} className="text-xs font-medium flex items-start gap-3 opacity-80">
                            <span className="mt-1.5 h-1 w-1 rounded-full bg-current shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-8 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsRisquesModalOpen(false)}
                className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all font-bold"
              >
                Fermer l'Audit
              </button>
            </div>
          </div>
        </Modal>

        {/* 💳 MODAL PAIEMENT FOURNISSEUR */}
        <Modal
          isOpen={isPaiementModalOpen}
          onClose={() => setIsPaiementModalOpen(false)}
          title={selectedReglement ? `Règlement ${selectedReglement.id}` : "Nouveau Règlement Fournisseur"}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fournisseur</label>
                <input
                  type="text"
                  disabled={!!selectedReglement}
                  value={selectedReglement?.name || "Global Logistics Algerie"}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Référence Facture</label>
                <input
                  type="text"
                  disabled={!!selectedReglement}
                  value={selectedReglement?.facture || "FAC-2024-887"}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold bg-slate-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode de Règlement</label>
                <select
                  disabled={!!selectedReglement}
                  value={selectedReglement?.mode?.toLowerCase() || "virement"}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none"
                >
                  <option value="virement">Virement Bancaire</option>
                  <option value="cheque">Chèque</option>
                  <option value="traite">Traite</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant (DZD)</label>
                <input
                  type="text"
                  disabled={!!selectedReglement}
                  value={selectedReglement?.mount?.toLocaleString() || "100,000"}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm font-black font-mono"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3">
              <InformationCircleIcon className="h-5 w-5 text-slate-400 mt-0.5" />
              <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
                {selectedReglement?.status === 'EFFECTUÉ'
                  ? "Ce règlement a été validé et le flux est clos. Toute modification nécessite une annulation comptable."
                  : "Le règlement sera marqué comme 'INSTANCE' jusqu'à confirmation du débit bancaire."}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
              <button
                onClick={() => setIsPaiementModalOpen(false)}
                className="px-6 py-3 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors"
              >
                Fermer
              </button>
              {!selectedReglement && (
                <button
                  onClick={() => {
                    alert('Règlement enregistré avec succès !');
                    setIsPaiementModalOpen(false);
                  }}
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10"
                >
                  Valider le Règlement
                </button>
              )}
            </div>
          </div>
        </Modal>

        {/* 📅 MODAL ÉCHÉANCIER FISCAL/PAIEMENT */}
        <Modal
          isOpen={isEcheancierModalOpen}
          onClose={() => setIsEcheancierModalOpen(false)}
          title="Échéancier de Paiement Consolidé"
          size="xl"
        >
          <div className="space-y-8 p-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-6 bg-slate-900 text-white rounded-2xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Total à 30 jours</p>
                <p className="text-2xl font-black font-mono">1 250 000 DA</p>
              </div>
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Retards Critiques</p>
                <p className="text-2xl font-black font-mono text-red-600">85 000 DA</p>
              </div>
              <div className="p-6 bg-slate-100 rounded-2xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Trésorerie Disponible</p>
                <p className="text-2xl font-black font-mono text-slate-900">4 820 000 DA</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Prochaines Échéances</h4>
              <div className="space-y-2">
                {[
                  { date: '28/02/2024', provider: 'Industrie Plastique Nord', mount: 120000, status: 'INSTANCE' },
                  { date: '05/03/2024', provider: 'Papeterie Centrale SPA', mount: 300000, status: 'INSTANCE' },
                  { date: '12/03/2024', provider: 'Industrie Plastique Nord', mount: 200000, status: 'TRÉSORERIE PRÉVUE' },
                  { date: '20/03/2024', provider: 'Global Logistics Algerie', mount: 630000, status: 'PROGRAMMÉ' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-slate-300 transition-all group">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mars</p>
                        <p className="text-lg font-black font-mono text-slate-900">{item.date.split('/')[0]}</p>
                      </div>
                      <div className="h-10 w-[1px] bg-slate-100"></div>
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.provider}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.status}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black font-mono text-slate-900">{formatCurrency(item.mount)}</p>
                      <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-all hover:text-slate-900">Programmer</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setIsEcheancierModalOpen(false)}
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
              >
                Fermer l'Échéancier
              </button>
            </div>
          </div>
        </Modal>

        {/* 🤖 MODAL RAPPORT EXÉCUTIF IA */}
        <Modal
          isOpen={isRapportExecutifModalOpen}
          onClose={() => setIsRapportExecutifModalOpen(false)}
          title="Audit IA : Performance & Flux Fournisseurs"
          size="xl"
        >
          <div className="space-y-8 p-2">
            {isGeneratingRapport ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full border-4 border-slate-100 border-t-slate-900 animate-spin"></div>
                  <CpuChipIconSolid className="h-10 w-10 text-slate-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="text-center">
                  <h4 className="text-xl font-black uppercase tracking-tighter">Analyse Cognitive en cours</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Croisement des cycles de décaissement & performance logistique</p>
                </div>
                <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900 animate-loading-bar"></div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="bg-slate-900 text-white p-8 rounded-3xl border border-white/5 shadow-2xl mb-8 relative overflow-hidden">
                  <SparklesIconSolid className="h-24 w-24 text-white/5 absolute -right-6 -top-6 rotate-12" />
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <h4 className="text-3xl font-black uppercase tracking-tighter italic">Supplier Intelligence</h4>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Génération du 22 Février 2026 — 22:45</p>
                    </div>
                    <div className="px-6 py-3 bg-white/10 rounded-2xl border border-white/20">
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 text-center mb-1">Score Efficacité</p>
                      <p className="text-2xl font-black font-mono">84.2%</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-100">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <ShieldCheckIcon className="h-4 w-4 text-emerald-500" /> Points de Robustesse
                    </h5>
                    <ul className="space-y-4">
                      {[
                        { t: "Concentration Maîtrisée", d: "Le top 1 représente 48% du volume, seuil de sécurité respecté (<50%)." },
                        { t: "Cycle de Paiement", d: "DPO moyen à 42 jours, offrant un levier de trésorerie de 1.2M DA." },
                        { t: "Qualité Stable", d: "92% de conformité sur les livraisons de Global Logistics." }
                      ].map((item, i) => (
                        <li key={i} className="flex gap-4">
                          <CheckCircleIcon className="h-5 w-5 text-emerald-500 shrink-0" />
                          <div>
                            <p className="text-xs font-black uppercase tracking-tight">{item.t}</p>
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-0.5">{item.d}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-100">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" /> Alertes & Optimisations
                    </h5>
                    <ul className="space-y-4">
                      <li className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                        <p className="text-xs font-black text-amber-900 flex items-center gap-2">
                          <ClockIcon className="h-4 w-4" /> Risque Tech Solutions
                        </p>
                        <p className="text-[10px] text-amber-700 font-medium mt-1">Délai de livraison en hausse (+4j). Impact potentiel sur le stock tampon.</p>
                      </li>
                      <li className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                        <p className="text-xs font-black text-indigo-900 flex items-center gap-2">
                          <BanknotesIcon className="h-4 w-4" /> Opportunité Escompte
                        </p>
                        <p className="text-[10px] text-indigo-700 font-medium mt-1">Industrie Plastique propose -2% pour paiement à 10j. Gain estimé: 38k DA.</p>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">Exporter PDF</button>
                  <button
                    onClick={() => setIsRapportExecutifModalOpen(false)}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Fermer le Rapport
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>

      </div>
    </div>
  );
};

export default Fournisseurs;




