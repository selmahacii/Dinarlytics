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
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Modal from '../../components/UI/Modal';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
// import api from '../../services/api'; // Removed in favor of useSuppliers
import { useSuppliers } from '../../hooks/useSuppliers';
import { Fournisseur } from '../../types';
import LineChart from '../../components/Charts/LineChart';
import BarChart from '../../components/Charts/BarChart';
import DoughnutChart from '../../components/Charts/DoughnutChart';
import HelpButton from '../../components/UI/HelpButton';
import SuccessMessage from '../../components/UI/SuccessMessage';
import SignaturePad from '../../components/UI/SignaturePad';
// ...existing code...
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
} from '../../utils/fournisseurs';

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
    totalTTC: 0,
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Total TTC</label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
              placeholder="0"
              value={formData.totalTTC}
              onChange={e => setFormData({ ...formData, totalTTC: Number(e.target.value) })}
            />
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
        console.error("Erreur lors de la suppression:", err);
      }
    }
  };

  // States for dynamic suppliers loading
  const {
    suppliers: fournisseurs,
    loading: loadingFournisseurs,
    error: fournisseursError,
    createSupplier,
    updateSupplier,
    deleteSupplier
  } = useSuppliers();

  const mockFournisseurs = fournisseurs;

  // States pour les modales (doivent être déclarés avant le return early)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState<any>(null);
  const [isNouvelleFactureModalOpen, setIsNouvelleFactureModalOpen] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [isPaiementModalOpen, setIsPaiementModalOpen] = useState(false);
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

  // Calculer les analyses de performance
  const analysesPerformance = useMemo(() => {
    const historique = mockFournisseurs.flatMap((fournisseur: any) => {
      const nombreCommandes = Math.floor(0.5 * 20) + 5;
      return Array.from({ length: nombreCommandes }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (nombreCommandes - i));
        return {
          fournisseurId: fournisseur.id?.toString() || fournisseur.nom || '',
          montant: (fournisseur.montantTotal || 1000000) / nombreCommandes,
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
    analyses.forEach((analyse, fournisseurId) => {
      const fournisseur = mockFournisseurs.find((f: any) => (f.id?.toString() || f.nom) === fournisseurId);
      if (fournisseur) {
        analyse.fournisseurNom = fournisseur.nom || fournisseurId;
      }
    });

    return Array.from(analyses.values());
  }, []);

  // Optimiser les coûts
  const optimisationsCouts = useMemo(() => {
    const fournisseursAvecDonnees = mockFournisseurs.map((fournisseur: any) => ({
      id: fournisseur.id?.toString() || fournisseur.nom || '',
      nom: fournisseur.nom || '',
      coutActuel: fournisseur.montantTotal || 1000000,
      nombreCommandes: Math.floor(0.5 * 30) + 5,
      delaiPaiement: 30 + 0.5 * 30,
      qualite: 75 + 0.5 * 20
    }));

    return optimiserCouts(fournisseursAvecDonnees);
  }, []);

  // Générer les prévisions d'achats
  const previsionsAchats = useMemo(() => {
    const historique = mockFournisseurs.flatMap((fournisseur: any) => {
      const nombreCommandes = Math.floor(0.5 * 12) + 3;
      return Array.from({ length: nombreCommandes }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (nombreCommandes - i));
        return {
          fournisseurId: fournisseur.id?.toString() || fournisseur.nom || '',
          montant: (fournisseur.montantTotal || 1000000) / nombreCommandes,
          date: date.toISOString().split('T')[0]
        };
      });
    });

    return genererPrevisionsAchats(historique, 6);
  }, []);

  // Générer les opportunités de négociation
  const opportunitesNegociation = useMemo(() => {
    const fournisseursAvecDonnees = mockFournisseurs.map((fournisseur: any) => ({
      id: fournisseur.id?.toString() || fournisseur.nom || '',
      nom: fournisseur.nom || '',
      coutActuel: fournisseur.montantTotal || 1000000,
      nombreCommandes: Math.floor(0.5 * 30) + 5,
      delaiPaiement: 30 + 0.5 * 30,
      qualite: 75 + 0.5 * 20,
      delaiLivraison: 5 + 0.5 * 20
    }));

    return genererOpportunitesNegociation(fournisseursAvecDonnees);
  }, []);

  // Évaluer les risques
  const risquesFournisseurs = useMemo(() => {
    const totalCA = mockFournisseurs.reduce((sum: number, f: any) => sum + (f.montantTotal || 0), 0);
    const fournisseursAvecDonnees = mockFournisseurs.map((fournisseur: any) => ({
      id: fournisseur.id?.toString() || fournisseur.nom || '',
      nom: fournisseur.nom || '',
      partCA: totalCA > 0 ? ((fournisseur.montantTotal || 0) / totalCA) * 100 : 0,
      delaiLivraison: 5 + 0.5 * 20,
      qualite: 75 + 0.5 * 20,
      localisation: fournisseur.adresse || 'Algérie',
      nombreCommandes: Math.floor(0.5 * 30) + 5
    }));

    return evaluerRisquesFournisseurs(fournisseursAvecDonnees);
  }, []);

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
    const totalAchats = fournisseurs.reduce((sum, f) => sum + Number(f.total_purchases || 0), 0);
    const nombreFournisseurs = fournisseurs.length;
    const dettesFournisseurs = fournisseurs.reduce((sum, f) => sum + Number(f.balance || 0), 0);
    const facturesAPayer = fournisseurs.reduce((sum, f) => sum + (f.pending_invoices_count || 0), 0);


    // Top 3 fournisseurs
    const topFournisseurs = fournisseurs.slice(0, 3).map(f => ({
      nom: (f as any).nom || (f as any).name || '',
      nif: (f as any).nif || (f as any).tax_id || '',
      montant: Number((f as any).total_purchases || 0),
      factures: (f as any).invoices_count || 0,
      delai: (f as any).average_payment_days || 30
    }));


    return (
      <div className="space-y-6 max-w-7xl mx-auto p-6">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white p-8 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <TruckIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold">Gestion Fournisseurs</h1>
                  <HelpButton pageId="fournisseurs" variant="icon" className="text-white/80 hover:text-white" />
                </div>
                <p className="text-slate-300 text-lg mt-1">Suivi des achats et relations fournisseurs</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <CurrencyDollarIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Volume Achats</h3>
            <p className="text-3xl font-extrabold text-slate-900">{totalAchats?.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' })}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-emerald-600 font-semibold">📦 Ce mois</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <BuildingOfficeIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Fournisseurs</h3>
            <p className="text-3xl font-extrabold text-slate-900">{nombreFournisseurs}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-blue-600 font-semibold">🏢 Actifs</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <BanknotesIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Dettes Fournisseurs</h3>
            <p className="text-3xl font-extrabold text-slate-900">{dettesFournisseurs?.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' })}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-amber-600 font-semibold">💳 À payer</p>
            </div>
          </div>
        </div>

        {/* Top 3 Fournisseurs */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mr-3">
              <StarIcon className="h-5 w-5 text-white" />
            </div>
            Top 3 Fournisseurs Principaux
          </h2>
          <div className="space-y-3">
            {topFournisseurs.map((fournisseur, idx) => (
              <div key={idx} className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{fournisseur.nom}</p>
                      <p className="text-sm text-slate-600">{fournisseur.factures} factures • Délai: {fournisseur.delai}j</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-emerald-600">{fournisseur.montant?.toLocaleString('fr-FR', { style: 'currency', currency: 'DZD' })}</p>
                    <p className="text-xs text-slate-500">{Math.round((fournisseur.montant / totalAchats) * 100)}% du total</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertes & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Alertes */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-300 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg mr-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-white" />
              </div>
              Alertes Fournisseurs
            </h3>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg border border-red-300">
                <p className="text-sm font-bold text-red-700">🚨 {facturesAPayer} factures à payer</p>
                <p className="text-xs text-slate-600 mt-1">Échéance dans 5 jours</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-amber-300">
                <p className="text-sm font-bold text-amber-700">⚠️ Concentration 40% sur 1 fournisseur</p>
                <p className="text-xs text-slate-600 mt-1">Diversifier les sources</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mr-3">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              Actions Rapides
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSelectedFournisseur(null);
                  setIsModalOpen(true);
                }}
                className="w-full p-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl font-bold hover:from-slate-800 hover:to-black shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Nouveau fournisseur
              </button>
              <button
                onClick={() => setIsNouvelleFactureModalOpen(true)}
                className="w-full p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <DocumentTextIcon className="h-5 w-5" />
                + Nouvelle facture fournisseur
              </button>
              <button
                onClick={() => navigate('/rapports/achats-fournisseurs')}
                className="w-full p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ChartBarIcon className="h-5 w-5" />
                Rapport achats
              </button>
              <button
                type="button"
                onClick={() => {
                  // Ouvrir la modal de paiement avec la première facture en attente
                  const facturesEnAttente = mockFournisseurs
                    .flatMap(f => (f as any).factures || [])
                    .filter((f: any) => f.statut === 'En attente' || f.statut === 'À payer')
                    .sort((a: any, b: any) => new Date(a.dateEcheance || '').getTime() - new Date(b.dateEcheance || '').getTime());

                  if (facturesEnAttente.length > 0) {
                    setSelectedFacture(facturesEnAttente[0]);
                    setIsPaiementModalOpen(true);
                  } else {
                    alert('Aucune facture en attente de paiement');
                  }
                }}
                className="w-full p-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:border-emerald-400 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <BanknotesIcon className="h-5 w-5" />
                Payer factures
              </button>
            </div>
          </div>
        </div>

        {/* Modal Nouveau Fournisseur pour EURL */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedFournisseur(null);
            setNifError(null);
          }}
          title={selectedFournisseur ? 'Modifier Fournisseur' : 'Nouveau Fournisseur'}
          size="lg"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const nom = formData.get('nom') as string;
              const contact = formData.get('contact') as string;
              const email = formData.get('email') as string;
              const adresse = formData.get('adresse') as string;
              const notes = formData.get('notes') as string;

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
                tax_id: tax_id,
                // note: notes // not supported by backend yet
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
                // e.currentTarget.reset(); // Form resets automatically or we can force it if needed, but closing modal usually enough.

                setTimeout(() => {
                  setShowSuccessMessage(false);
                  setSuccessData(null);
                }, 5000);
              } catch (err: any) {
                alert("Erreur: " + err.message);
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du fournisseur <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  required
                  defaultValue={selectedFournisseur?.nom || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Fournisseur ABC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIF (Numéro d'Identification Fiscale)
                </label>
                <input
                  type="text"
                  name="tax_id"
                  defaultValue={selectedFournisseur?.tax_id || selectedFournisseur?.nif || ''}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${nifError ? 'border-red-500 py-2' : 'border-gray-300'
                    }`}
                  placeholder="15 chiffres"
                  onChange={(e) => {
                    const val = e.target.value;
                    // Validation simple : doit être numérique. La longueur 15/20 est recommandée mais on peut être souple ou strict.
                    // Le backend est strict (15 ou 20). Soyons stricts aussi pour le feedback visuel.
                    if (val && !/^\d{15}$|^\d{20}$/.test(val)) {
                      setNifError("Le NIF doit comporter 15 ou 20 chiffres");
                    } else {
                      setNifError(null);
                    }
                  }}
                />
                {nifError && (
                  <p className="text-xs text-red-500 mt-1 flex items-center">
                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                    {nifError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact
                </label>
                <input
                  type="text"
                  name="contact"
                  defaultValue={selectedFournisseur?.contact || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: +213 XXX XX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={selectedFournisseur?.email || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="exemple@fournisseur.dz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  name="adresse"
                  defaultValue={selectedFournisseur?.adresse || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Adresse complète"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                defaultValue={selectedFournisseur?.notes || ''}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notes sur le fournisseur..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedFournisseur(null);
                }}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg hover:from-slate-800 hover:to-black transition-colors font-medium"
              >
                {selectedFournisseur ? 'Modifier' : 'Créer'} le fournisseur
              </button>
            </div>
          </form>
        </Modal>

        {/* Modal Nouvelle Facture Fournisseur pour EURL */}
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
      </div>
    );
  }

  // ========================================
  // INTERFACE STANDARD (autres entreprises)
  // ========================================
  // Note: isModalOpen et selectedFournisseur sont déjà déclarés plus haut (avant le return early)


  const filteredFournisseurs = mockFournisseurs.filter(fournisseur =>
    fournisseur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fournisseur.nif.includes(searchTerm)
  );

  const handleEdit = (fournisseur: Fournisseur) => {
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
  const totalSoldeDu = mockFournisseurs.reduce((sum, f) => sum + f.soldeDu, 0);
  const fournisseursActifs = mockFournisseurs.filter(f => f.soldeDu > 0).length;

  return (
    <div className="space-y-6">
      {/* Header de la page */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <TruckIcon className="h-6 w-6 text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Fournisseurs & Achats</h1>
            </div>
            <p className="text-slate-600">Gestion complète des fournisseurs, commandes d'achat et approvisionnements</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-sm text-slate-500">Total fournisseurs</div>
              <div className="text-2xl font-bold text-amber-600">{totalFournisseurs}</div>
            </div>
          </div>
        </div>
      </div>

      {/* En-tête avec statistiques */}
      <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Statistiques globales</h2>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Total Fournisseurs</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalFournisseurs}</p>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Solde Total Dû</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(totalSoldeDu)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Fournisseurs Actifs</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{fournisseursActifs}</p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="border-b border-slate-200">
          <nav className="flex overflow-x-auto" aria-label="Tabs">
            {[
              { id: 'liste', name: 'Liste des Fournisseurs', icon: UserGroupIcon },
              { id: 'commandes', name: 'Commandes', icon: ClipboardDocumentListIcon },
              { id: 'factures', name: 'Factures Fournisseurs', icon: DocumentTextIcon },
              { id: 'paiements', name: 'Paiements', icon: BanknotesIcon },
              { id: 'livraisons', name: 'Livraisons', icon: TruckIcon },
              { id: 'analytics', name: 'Analytics', icon: ChartBarIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                  ? 'border-amber-500 text-amber-600 bg-amber-50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'liste' && (
        <Card title="Liste des Fournisseurs">
          {/* Section Analyses Avancées */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <button
              onClick={() => setIsPerformanceModalOpen(true)}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              <span className="font-semibold">Performance</span>
            </button>
            <button
              onClick={() => setIsOptimisationModalOpen(true)}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
            >
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              <span className="font-semibold">Optimisation</span>
            </button>
            <button
              onClick={() => setIsPrevisionsAchatsModalOpen(true)}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              <ChartPieIcon className="h-5 w-5 mr-2" />
              <span className="font-semibold">Prévisions</span>
            </button>
            <button
              onClick={() => setIsNegociationsModalOpen(true)}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg"
            >
              <SparklesIcon className="h-5 w-5 mr-2" />
              <span className="font-semibold">Négociations</span>
              {opportunitesNegociation.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                  {opportunitesNegociation.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsRisquesModalOpen(true)}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg hover:from-red-700 hover:to-rose-700 transition-all shadow-lg"
            >
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
              <span className="font-semibold">Risques</span>
              {risquesFournisseurs.filter(r => r.niveauRisque === 'eleve' || r.niveauRisque === 'critique').length > 0 && (
                <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                  {risquesFournisseurs.filter(r => r.niveauRisque === 'eleve' || r.niveauRisque === 'critique').length}
                </span>
              )}
            </button>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
            <div className="w-full sm:w-auto">
              <input
                type="text"
                placeholder="Rechercher par nom ou NIF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <button
              onClick={handleAdd}
              className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              {t('ajouter')} Fournisseur
            </button>
          </div>

          {/* Suppliers Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fournisseur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    NIF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Solde Dû
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFournisseurs.map((fournisseur) => (
                  <tr key={fournisseur.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{fournisseur.nom}</div>
                        <div className="text-sm text-gray-500">{fournisseur.adresse}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{fournisseur.nif}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{fournisseur.telephone}</div>
                      <div className="text-sm text-gray-500">{fournisseur.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-red-600">
                        {formatCurrency(fournisseur.soldeDu)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(fournisseur)}
                          className="text-slate-600 hover:text-slate-800"
                          aria-label="Modifier"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => fournisseur.id && handleDelete(fournisseur.id)}
                          className="text-red-600 hover:text-red-900"
                          aria-label="Supprimer"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Onglet Commandes */}
      {activeTab === 'commandes' && (
        <Card title="Gestion des Commandes Fournisseurs">
          <div className="space-y-6">
            {/* Statistiques des commandes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Total Commandes</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">156</p>
                  </div>
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-slate-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">En Attente</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">23</p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Livrées</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">128</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">En Retard</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">5</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filtres et actions avancés */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                {/* Filtres */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="h-5 w-5 text-slate-500" />
                    <select className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm font-medium" aria-label="Filtrer par statut">
                      <option>Tous les statuts</option>
                      <option>En attente</option>
                      <option>Confirmée</option>
                      <option>En préparation</option>
                      <option>En livraison</option>
                      <option>Livrée</option>
                      <option>Annulée</option>
                    </select>
                  </div>
                  <select className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm font-medium" aria-label="Filtrer par fournisseur">
                    <option>Tous les fournisseurs</option>
                    <option>ABC Corp</option>
                    <option>Tech Solutions</option>
                    <option>Office Supplies</option>
                    <option>Logistics Pro</option>
                  </select>
                  <input
                    type="date"
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                    placeholder="Date de début"
                  />
                  <input
                    type="date"
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                    placeholder="Date de fin"
                  />
                  <input
                    type="text"
                    placeholder="Rechercher par N° commande..."
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm w-64"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleNouvelleCommande}
                    className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Nouvelle Commande
                  </button>
                  <button
                    onClick={() => alert('Export des commandes en cours...')}
                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Exporter
                  </button>
                  <button
                    onClick={() => alert('Impression de toutes les commandes en cours...')}
                    className="flex items-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                  >
                    <PrinterIcon className="h-5 w-5 mr-2" />
                    Imprimer
                  </button>
                </div>
              </div>
            </div>

            {/* Indicateurs de Performance - Bons de Commande */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg p-6 border-2 border-slate-200 shadow-sm mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-slate-600" />
                Indicateurs de Performance - Bons de Commande
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Taux de complétion */}
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 uppercase">Taux Complétion</span>
                    <ChartBarIcon className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">72%</div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                    <div className="bg-emerald-500 h-2 rounded-full w-[72%]"></div>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">18/25 commandes livrées</div>
                </div>

                {/* Délai moyen de livraison */}
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 uppercase">Délai Moyen</span>
                    <ClockIcon className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">7.2j</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center">
                    <ArrowTrendingDownIcon className="h-3 w-3 mr-1 text-emerald-600" />
                    <span className="text-emerald-600">-0.5j vs mois dernier</span>
                  </div>
                </div>

                {/* Valeur moyenne par commande */}
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 uppercase">Valeur Moyenne</span>
                    <CurrencyDollarIcon className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">
                    {formatCurrency(Math.round((125000 + 275000 + 85000 + 45000 + 180000 + 65000) / 6))}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Par commande</div>
                </div>

                {/* Score de performance */}
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 uppercase">Score Performance</span>
                    <SparklesIcon className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900">85/100</div>
                  <div className="text-xs text-slate-500 mt-1">Excellent</div>
                </div>
              </div>

              {/* Métriques supplémentaires */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Commandes en cours</span>
                    <span className="text-sm font-bold text-slate-900">3</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Commandes en retard</span>
                    <span className="text-sm font-bold text-red-600">1</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Taux de ponctualité</span>
                    <span className="text-sm font-bold text-emerald-600">80%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tableau des commandes avec exemples détaillés */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Commandes Fournisseurs</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">N° Commande</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fournisseur</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date Commande</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Échéance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Montant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Délai</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Commande 1 - Livrée */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">CMD-2024-001</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">ABC Corp SPA</div>
                          <div className="text-sm text-gray-500">Matériel de bureau</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">15/01/2024</td>
                      <td className="px-6 py-4 text-sm text-gray-900">15/02/2024</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(125000)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1 text-emerald-600" />
                          <span className="text-emerald-600 font-medium">30j</span>
                        </div>
                        <div className="text-xs text-gray-500">À l'heure</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Livrée
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <SparklesIcon className="h-4 w-4 mr-1 text-emerald-600" />
                          <span className="text-sm font-bold text-emerald-600">95</span>
                        </div>
                        <div className="text-xs text-gray-500">Excellent</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleVoirCommande({ numero: 'CMD-2024-001', fournisseur: 'ABC Corp SPA', montant: 125000, statut: 'Livrée' })}
                            className="text-slate-600 hover:text-slate-800" title="Voir détails"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleImprimerCommande({ numero: 'CMD-2024-001' })}
                            className="text-emerald-600 hover:text-emerald-800" title="Imprimer"
                          >
                            <PrinterIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDupliquerCommande({ numero: 'CMD-2024-001' })}
                            className="text-purple-600 hover:text-purple-900" title="Dupliquer"
                          >
                            <DocumentDuplicateIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Commande 2 - En attente */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">CMD-2024-002</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Tech Solutions SARL</div>
                          <div className="text-sm text-gray-500">Équipements informatiques</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">18/01/2024</td>
                      <td className="px-6 py-4 text-sm text-gray-900">18/02/2024</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(275000)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1 text-amber-600" />
                          <span className="text-amber-600 font-medium">12j</span>
                        </div>
                        <div className="text-xs text-gray-500">En attente</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          En attente
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <SparklesIcon className="h-4 w-4 mr-1 text-amber-600" />
                          <span className="text-sm font-bold text-amber-600">65</span>
                        </div>
                        <div className="text-xs text-gray-500">Moyen</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleVoirCommande({ numero: 'CMD-2024-002', fournisseur: 'Tech Solutions SARL', montant: 275000, statut: 'En attente' })}
                            className="text-slate-600 hover:text-slate-800" title="Voir détails"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleConfirmerCommande({ numero: 'CMD-2024-002' })}
                            className="text-emerald-600 hover:text-emerald-800" title="Confirmer"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleModifierCommande({ numero: 'CMD-2024-002' })}
                            className="text-orange-600 hover:text-orange-900" title="Modifier"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Commande 3 - En préparation */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">CMD-2024-003</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Office Supplies Co</div>
                          <div className="text-sm text-gray-500">Fournitures de bureau</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">20/01/2024</td>
                      <td className="px-6 py-4 text-sm text-gray-900">20/02/2024</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(85000)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1 text-blue-600" />
                          <span className="text-blue-600 font-medium">18j</span>
                        </div>
                        <div className="text-xs text-gray-500">En préparation</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          En préparation
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <SparklesIcon className="h-4 w-4 mr-1 text-blue-600" />
                          <span className="text-sm font-bold text-blue-600">70</span>
                        </div>
                        <div className="text-xs text-gray-500">Bon</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleVoirCommande({ numero: 'CMD-2024-003', fournisseur: 'Office Supplies Co', montant: 85000, statut: 'En préparation' })}
                            className="text-slate-600 hover:text-slate-800" title="Voir détails"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleMarquerLivraison({ numero: 'CMD-2024-003' })}
                            className="text-emerald-600 hover:text-emerald-800" title="Marquer en livraison"
                          >
                            <TruckIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleImprimerCommande({ numero: 'CMD-2024-003' })}
                            className="text-emerald-600 hover:text-emerald-800" title="Imprimer"
                          >
                            <PrinterIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Commande 4 - En livraison */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">CMD-2024-004</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Logistics Pro EURL</div>
                          <div className="text-sm text-gray-500">Services de transport</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">22/01/2024</td>
                      <td className="px-6 py-4 text-sm text-gray-900">22/02/2024</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(45000)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1 text-yellow-600" />
                          <span className="text-yellow-600 font-medium">20j</span>
                        </div>
                        <div className="text-xs text-gray-500">En livraison</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          En livraison
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <SparklesIcon className="h-4 w-4 mr-1 text-yellow-600" />
                          <span className="text-sm font-bold text-yellow-600">75</span>
                        </div>
                        <div className="text-xs text-gray-500">Bon</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleVoirCommande({ numero: 'CMD-2024-004', fournisseur: 'Logistics Pro EURL', montant: 45000, statut: 'En livraison' })}
                            className="text-slate-600 hover:text-slate-800" title="Voir détails"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleMarquerLivree({ numero: 'CMD-2024-004' })}
                            className="text-emerald-600 hover:text-emerald-800" title="Marquer livrée"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleSuiviCommande({ numero: 'CMD-2024-004' })}
                            className="text-slate-600 hover:text-slate-800" title="Suivi"
                          >
                            <TruckIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Commande 5 - En retard */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">CMD-2024-005</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Maintenance Plus SPA</div>
                          <div className="text-sm text-gray-500">Services de maintenance</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">10/01/2024</td>
                      <td className="px-6 py-4 text-sm text-gray-900">10/02/2024</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(180000)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1 text-red-600" />
                          <span className="text-red-600 font-medium">+5j</span>
                        </div>
                        <div className="text-xs text-red-500">Retard</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          En retard
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <SparklesIcon className="h-4 w-4 mr-1 text-red-600" />
                          <span className="text-sm font-bold text-red-600">35</span>
                        </div>
                        <div className="text-xs text-gray-500">À améliorer</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleVoirCommande({ numero: 'CMD-2024-005', fournisseur: 'Maintenance Plus SPA', montant: 180000, statut: 'En retard' })}
                            className="text-slate-600 hover:text-slate-800" title="Voir détails"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleRelancerCommande({ numero: 'CMD-2024-005' })}
                            className="text-red-600 hover:text-red-800" title="Urgent - Relancer"
                          >
                            <ExclamationTriangleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleModifierCommande({ numero: 'CMD-2024-005' })}
                            className="text-orange-600 hover:text-orange-900" title="Modifier"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Commande 6 - Annulée */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">CMD-2024-006</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Clean Services SARL</div>
                          <div className="text-sm text-gray-500">Services de nettoyage</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">25/01/2024</td>
                      <td className="px-6 py-4 text-sm text-gray-900">25/02/2024</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(65000)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1 text-slate-400" />
                          <span className="text-slate-400 font-medium">-</span>
                        </div>
                        <div className="text-xs text-gray-500">Annulée</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Annulée
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <SparklesIcon className="h-4 w-4 mr-1 text-slate-400" />
                          <span className="text-sm font-bold text-slate-400">0</span>
                        </div>
                        <div className="text-xs text-gray-500">-</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleVoirCommande({ numero: 'CMD-2024-006', fournisseur: 'Clean Services SARL', montant: 65000, statut: 'Annulée' })}
                            className="text-slate-600 hover:text-slate-800" title="Voir détails"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleRetablirCommande({ numero: 'CMD-2024-006' })}
                            className="text-emerald-600 hover:text-emerald-800" title="Rétablir"
                          >
                            <ArrowTrendingUpIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleSupprimerCommande({ numero: 'CMD-2024-006' })}
                            className="text-red-600 hover:text-red-800" title="Supprimer"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Onglet Factures Fournisseurs */}
      {activeTab === 'factures' && (
        <Card title="Factures Fournisseurs">
          <div className="space-y-6">
            {/* Filtres et actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex space-x-4">
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" aria-label="Filtrer par statut">
                  <option>Tous les statuts</option>
                  <option>En attente</option>
                  <option>Payée</option>
                  <option>En retard</option>
                </select>
                <input
                  type="date"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  aria-label="Filtrer par date"
                />
              </div>
              <div className="flex space-x-2">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  Exporter
                </button>
                <button
                  onClick={handleNouvelleFacture}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nouvelle Facture
                </button>
              </div>
            </div>

            {/* Statistiques des factures */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Factures</p>
                    <p className="text-xl font-bold text-blue-800">24</p>
                  </div>
                  <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">En Attente</p>
                    <p className="text-xl font-bold text-orange-800">8</p>
                  </div>
                  <ClockIcon className="h-8 w-8 text-orange-600" />
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Payées</p>
                    <p className="text-xl font-bold text-green-800">14</p>
                  </div>
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-600 text-sm font-medium">En Retard</p>
                    <p className="text-xl font-bold text-red-800">2</p>
                  </div>
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Tableau des factures avec exemples détaillés */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Factures Fournisseurs</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Facture</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Échéance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">FAC-2024-001</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Fournisseur ABC SPA</div>
                          <div className="text-sm text-gray-500">Matériel de bureau</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">15/01/2024</td>
                      <td className="px-6 py-4 text-sm text-gray-900">15/02/2024</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(125000)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Payée
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleVoirFacture({ numero: 'FAC-2024-001', fournisseur: 'Fournisseur ABC SPA', montant: 125000, statut: 'Payée' })}
                            className="text-slate-600 hover:text-slate-800" title="Voir détails"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleImprimerFacture({ numero: 'FAC-2024-001' })}
                            className="text-emerald-600 hover:text-emerald-800" title="Imprimer"
                          >
                            <PrinterIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDupliquerFacture({ numero: 'FAC-2024-001' })}
                            className="text-purple-600 hover:text-purple-900" title="Dupliquer"
                          >
                            <DocumentDuplicateIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">FAC-2024-002</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Tech Solutions SARL</div>
                          <div className="text-sm text-gray-500">Équipements informatiques</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">18/01/2024</td>
                      <td className="px-6 py-4 text-sm text-gray-900">18/02/2024</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(275000)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          En attente
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleVoirFacture({ numero: 'FAC-2024-002', fournisseur: 'Tech Solutions SARL', montant: 275000, statut: 'En attente' })}
                            className="text-slate-600 hover:text-slate-800" title="Voir détails"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handlePayerFacture({ numero: 'FAC-2024-002' })}
                            className="text-emerald-600 hover:text-emerald-800" title="Payer"
                          >
                            <BanknotesIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleImprimerFacture({ numero: 'FAC-2024-002' })}
                            className="text-emerald-600 hover:text-emerald-800" title="Imprimer"
                          >
                            <PrinterIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">FAC-2024-003</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Office Supplies Co</div>
                          <div className="text-sm text-gray-500">Fournitures de bureau</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">10/01/2024</td>
                      <td className="px-6 py-4 text-sm text-gray-900">10/02/2024</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(85000)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          En retard
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleVoirFacture({ numero: 'FAC-2024-003', fournisseur: 'Office Supplies Co', montant: 85000, statut: 'En retard' })}
                            className="text-slate-600 hover:text-slate-800" title="Voir détails"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleUrgentPayerFacture({ numero: 'FAC-2024-003' })}
                            className="text-red-600 hover:text-red-800" title="Urgent - Payer"
                          >
                            <ExclamationTriangleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleImprimerFacture({ numero: 'FAC-2024-003' })}
                            className="text-emerald-600 hover:text-emerald-800" title="Imprimer"
                          >
                            <PrinterIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">FAC-2024-004</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Logistics Pro EURL</div>
                          <div className="text-sm text-gray-500">Services de transport</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">22/01/2024</td>
                      <td className="px-6 py-4 text-sm text-gray-900">22/02/2024</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(45000)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Payée
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleVoirFacture({ numero: 'FAC-2024-004', fournisseur: 'Logistics Pro EURL', montant: 45000, statut: 'Payée' })}
                            className="text-slate-600 hover:text-slate-800" title="Voir détails"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleImprimerFacture({ numero: 'FAC-2024-004' })}
                            className="text-emerald-600 hover:text-emerald-800" title="Imprimer"
                          >
                            <PrinterIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDupliquerFacture({ numero: 'FAC-2024-004' })}
                            className="text-purple-600 hover:text-purple-900" title="Dupliquer"
                          >
                            <DocumentDuplicateIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Onglet Paiements */}
      {activeTab === 'paiements' && (
        <Card title="Gestion des Paiements">
          <div className="space-y-6">
            {/* Actions de paiement */}
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <BanknotesIcon className="h-5 w-5 mr-2" />
                Nouveau Paiement
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Paiements Programmes
              </button>
              <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                Paiements en Retard
              </button>
            </div>

            {/* Historique des paiements détaillé */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">Historique des Paiements</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Paiement 1 - Payé */}
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                        <CheckCircleIcon className="h-7 w-7 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Paiement Fournisseur ABC SPA</p>
                            <p className="text-sm text-gray-600">Facture FAC-2024-001 - Matériel de bureau</p>
                            <p className="text-xs text-gray-500">15/01/2024 à 14:30 - Virement bancaire</p>
                            <p className="text-xs text-gray-500">Référence: VIR-2024-001 | Compte: 1234567890</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-800 text-lg">{formatCurrency(125000)}</p>
                            <p className="text-sm text-green-600 font-medium">Payé</p>
                            <p className="text-xs text-gray-500">Échéance respectée</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Paiement 2 - En attente */}
                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                        <ClockIcon className="h-7 w-7 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Paiement Tech Solutions SARL</p>
                            <p className="text-sm text-gray-600">Facture FAC-2024-002 - Équipements informatiques</p>
                            <p className="text-xs text-gray-500">Programmé pour le 18/02/2024 - Virement automatique</p>
                            <p className="text-xs text-gray-500">Référence: VIR-2024-002 | Compte: 0987654321</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-orange-800 text-lg">{formatCurrency(275000)}</p>
                            <p className="text-sm text-orange-600 font-medium">En attente</p>
                            <p className="text-xs text-gray-500">Échéance: 18/02/2024</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Paiement 3 - En retard */}
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-red-200 rounded-lg flex items-center justify-center">
                        <ExclamationTriangleIcon className="h-7 w-7 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Paiement Office Supplies Co</p>
                            <p className="text-sm text-gray-600">Facture FAC-2024-003 - Fournitures de bureau</p>
                            <p className="text-xs text-red-600">ÉCHÉANCE DÉPASSÉE - 10/02/2024</p>
                            <p className="text-xs text-gray-500">Référence: VIR-2024-003 | Compte: 1122334455</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-800 text-lg">{formatCurrency(85000)}</p>
                            <p className="text-sm text-red-600 font-medium">En retard</p>
                            <p className="text-xs text-red-500">+5 jours de retard</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Paiement 4 - Payé */}
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-200 rounded-lg flex items-center justify-center">
                        <CheckCircleIcon className="h-7 w-7 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Paiement Logistics Pro EURL</p>
                            <p className="text-sm text-gray-600">Facture FAC-2024-004 - Services de transport</p>
                            <p className="text-xs text-gray-500">22/01/2024 à 09:15 - Chèque</p>
                            <p className="text-xs text-gray-500">Référence: CHQ-2024-001 | N°: 0001234</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-800 text-lg">{formatCurrency(45000)}</p>
                            <p className="text-sm text-green-600 font-medium">Payé</p>
                            <p className="text-xs text-gray-500">Paiement anticipé</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Paiement 5 - En cours */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center">
                        <BanknotesIcon className="h-7 w-7 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Paiement Maintenance Plus SPA</p>
                            <p className="text-sm text-gray-600">Facture FAC-2024-005 - Services de maintenance</p>
                            <p className="text-xs text-blue-600">EN COURS - Traitement bancaire</p>
                            <p className="text-xs text-gray-500">Référence: VIR-2024-004 | Compte: 5566778899</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-800 text-lg">{formatCurrency(180000)}</p>
                            <p className="text-sm text-blue-600 font-medium">En cours</p>
                            <p className="text-xs text-gray-500">Traitement en cours</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Onglet Livraisons */}
      {activeTab === 'livraisons' && (
        <Card title="Suivi des Livraisons">
          <div className="space-y-6">
            {/* Statuts de livraison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-800">En Transit</h3>
                  <TruckIcon className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-blue-800">5</p>
                <p className="text-sm text-blue-600">Livraisons en cours</p>
              </div>

              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-green-800">Livrées</h3>
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-800">18</p>
                <p className="text-sm text-green-600">Cette semaine</p>
              </div>

              <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-orange-800">En Retard</h3>
                  <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-orange-800">2</p>
                <p className="text-sm text-orange-600">Nécessitent suivi</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Onglet Analytics - Palette Slate Professionnelle */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* En-tête Analytics avec palette Slate */}
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white p-6 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl shadow-lg">
                  <ChartBarIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Analytics Fournisseurs</h2>
                  <p className="text-slate-300 text-lg mt-1">Analyse approfondie des performances et tendances</p>
                </div>
              </div>
              <button className="px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                <ArrowDownTrayIcon className="h-5 w-5" />
                Exporter Rapport
              </button>
            </div>
          </div>

          {/* Métriques clés - Palette Slate */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border-2 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg group-hover:scale-110 transition-transform shadow-lg">
                  <ChartPieIcon className="h-6 w-6 text-white" />
                </div>
                <ArrowTrendingUpIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wide mb-2">Dépenses Mensuelles</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">{formatCurrency(450000)}</p>
              <div className="flex items-center text-sm text-slate-700 dark:text-slate-300">
                <ArrowTrendingUpIcon className="h-4 w-4 mr-1 text-slate-600" />
                <span className="font-semibold">+12.5%</span>
                <span className="text-slate-500 dark:text-slate-400 ml-1">vs mois dernier</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border-2 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg group-hover:scale-110 transition-transform shadow-lg">
                  <StarIcon className="h-6 w-6 text-white" />
                </div>
                <BuildingOfficeIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wide mb-2">Fournisseur Top</p>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">ABC Corp</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">35% du volume total</p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border-2 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg group-hover:scale-110 transition-transform shadow-lg">
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
                <ArrowTrendingDownIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wide mb-2">Délai Moyen</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">7.2</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">jours de livraison</p>
            </div>

            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border-2 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-xl transition-all duration-300 group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg group-hover:scale-110 transition-transform shadow-lg">
                  <StarIcon className="h-6 w-6 text-white" />
                </div>
                <CheckCircleIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wide mb-2">Satisfaction</p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">4.8</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">/ 5.0 - Excellent</p>
            </div>
          </div>

          {/* Graphiques Analytics - Palette Slate */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique 1: Évolution des Dépenses */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center mr-3 shadow-md">
                    <ArrowTrendingUpIcon className="h-5 w-5 text-white" />
                  </div>
                  Évolution des Dépenses
                </h3>
                <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg font-medium">12 mois</div>
              </div>
              <div className="h-64">
                <LineChart
                  data={[320000, 380000, 420000, 390000, 450000, 480000, 520000, 490000, 550000, 580000, 620000, 650000]}
                  labels={['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']}
                  borderColor="rgba(71, 85, 105, 1)"
                  backgroundColor="rgba(71, 85, 105, 0.1)"
                  title=""
                  yAxisLabel="Montant (DA)"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-300 dark:border-slate-600">
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(650000)}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Décembre 2024</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-xl border border-slate-300 dark:border-slate-600">
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">+103%</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">vs Janvier</div>
                </div>
              </div>
            </div>

            {/* Graphique 2: Répartition par Secteur */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center mr-3 shadow-md">
                    <ChartPieIcon className="h-5 w-5 text-white" />
                  </div>
                  Répartition par Secteur
                </h3>
                <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg font-medium">Volume total</div>
              </div>
              <div className="h-64">
                <DoughnutChart
                  data={[35, 25, 20, 12, 8]}
                  labels={['Matériel Bureau', 'Informatique', 'Transport', 'Maintenance', 'Autres']}
                  colors={['#475569', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0']}
                  title=""
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-300 dark:border-slate-600">
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">35%</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Matériel Bureau</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-xl border border-slate-300 dark:border-slate-600">
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">25%</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Informatique</div>
                </div>
              </div>
            </div>

            {/* Graphique 3: Performance des Fournisseurs */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center mr-3 shadow-md">
                    <ChartBarIcon className="h-5 w-5 text-white" />
                  </div>
                  Performance des Fournisseurs
                </h3>
                <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg font-medium">Score moyen</div>
              </div>
              <div className="h-64">
                <BarChart
                  data={[4.8, 4.6, 4.9, 4.3, 4.7, 4.5]}
                  labels={['ABC Corp', 'Tech Solutions', 'Office Supplies', 'Logistics Pro', 'Maintenance Plus', 'Clean Services']}
                  backgroundColor="rgba(71, 85, 105, 0.7)"
                  title=""
                  yAxisLabel="Score (/5)"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-300 dark:border-slate-600">
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">4.8</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Score Moyen</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-xl border border-slate-300 dark:border-slate-600">
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">6</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Fournisseurs</div>
                </div>
              </div>
            </div>

            {/* Graphique 4: Délais de Livraison */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center mr-3 shadow-md">
                    <ClockIcon className="h-5 w-5 text-white" />
                  </div>
                  Délais de Livraison
                </h3>
                <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg font-medium">Jours moyens</div>
              </div>
              <div className="h-64">
                <LineChart
                  data={[8.5, 7.2, 6.8, 7.5, 6.9, 7.1, 6.5, 7.0, 6.7, 6.8, 6.9, 7.2]}
                  labels={['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']}
                  borderColor="rgba(71, 85, 105, 1)"
                  backgroundColor="rgba(71, 85, 105, 0.1)"
                  title=""
                  yAxisLabel="Jours"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-300 dark:border-slate-600">
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">7.2</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Délai Actuel</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-xl border border-slate-300 dark:border-slate-600">
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">-15%</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Amélioration</div>
                </div>
              </div>
            </div>

            {/* Graphique 5: Volume de Commandes */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center mr-3 shadow-md">
                    <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
                  </div>
                  Volume de Commandes
                </h3>
                <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg font-medium">Mensuel</div>
              </div>
              <div className="h-64">
                <BarChart
                  data={[45, 52, 48, 61, 55, 67, 72, 68, 75, 82, 78, 85]}
                  labels={['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']}
                  backgroundColor="rgba(71, 85, 105, 0.7)"
                  title=""
                  yAxisLabel="Nombre"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-300 dark:border-slate-600">
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">85</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Décembre</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-xl border border-slate-300 dark:border-slate-600">
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">+89%</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">vs Janvier</div>
                </div>
              </div>
            </div>

            {/* Graphique 6: Satisfaction Client */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg flex items-center justify-center mr-3 shadow-md">
                    <StarIcon className="h-5 w-5 text-white" />
                  </div>
                  Satisfaction Client
                </h3>
                <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg font-medium">Note /5</div>
              </div>
              <div className="h-64">
                <LineChart
                  data={[4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.6, 4.8, 4.7, 4.8, 4.9, 4.8]}
                  labels={['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']}
                  borderColor="rgba(71, 85, 105, 1)"
                  backgroundColor="rgba(71, 85, 105, 0.1)"
                  title=""
                  yAxisLabel="Note"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-300 dark:border-slate-600">
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">4.8</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Note Actuelle</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-xl border border-slate-300 dark:border-slate-600">
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100">+14%</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Amélioration</div>
                </div>
              </div>
            </div>
          </div>
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
          <form className="space-y-6">
            {/* Informations générales */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-blue-600" />
                Informations Générales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedFournisseur?.nom || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Fournisseur ABC SPA"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIF (15 chiffres) *
                  </label>
                  <input
                    type="text"
                    defaultValue={selectedFournisseur?.nif || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123456789012345"
                    maxLength={15}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type d'entreprise
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Type d'entreprise">
                    <option>SPA (Société par Actions)</option>
                    <option>SARL (Société à Responsabilité Limitée)</option>
                    <option>EURL (Entreprise Unipersonnelle à Responsabilité Limitée)</option>
                    <option>SNC (Société en Nom Collectif)</option>
                    <option>Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secteur d'activité
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Secteur d'activité">
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
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-green-600" />
                Adresse et Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse complète *
                  </label>
                  <textarea
                    defaultValue={selectedFournisseur?.adresse || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Rue, numéro, ville, wilaya, code postal"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone principal *
                  </label>
                  <input
                    type="tel"
                    defaultValue={selectedFournisseur?.telephone || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+213 XX XXX XXX"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone secondaire
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+213 XX XXX XXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email principal *
                  </label>
                  <input
                    type="email"
                    defaultValue={selectedFournisseur?.email || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="contact@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email secondaire
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        onClose={() => setIsNouvelleCommandeModalOpen(false)}
        title={selectedCommande ? 'Modifier Commande' : 'Nouvelle Commande'}
        size="xl"
      >
        <div className="max-h-[80vh] overflow-y-auto pr-2">
          <form className="space-y-6">
            {/* Informations générales */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-blue-600" />
                Informations Générales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fournisseur *
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required aria-label="Fournisseur">
                    <option value="">Sélectionner un fournisseur</option>
                    <option value="abc">ABC Corp SPA</option>
                    <option value="tech">Tech Solutions SARL</option>
                    <option value="office">Office Supplies Co</option>
                    <option value="logistics">Logistics Pro EURL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de commande *
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    aria-label="Date de commande"
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
                    aria-label="Date d'échéance"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Statut">
                    <option value="en_attente">En attente</option>
                    <option value="confirmee">Confirmée</option>
                    <option value="en_preparation">En préparation</option>
                    <option value="en_livraison">En livraison</option>
                    <option value="livree">Livrée</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Articles */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-green-600" />
                Articles
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Article</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nom de l'article"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix Unitaire</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-600" />
                Notes
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes internes
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Notes sur la commande..."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsNouvelleCommandeModalOpen(false)}
                className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                {selectedCommande ? 'Modifier Commande' : 'Créer Commande'}
              </button>
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
            topFournisseurs={fournisseurs.slice(0, 10).map((f: any) => ({
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
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              Analyse de performance basée sur la qualité, les délais, le service et le DPO.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Fournisseur</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Score</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Qualité</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Délai Liv.</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Service</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">DPO</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Classement</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {analysesPerformance.slice(0, 10).map((analyse) => (
                  <tr key={analyse.fournisseurId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{analyse.fournisseurNom}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${analyse.scorePerformance >= 85 ? 'bg-green-100 text-green-800' :
                        analyse.scorePerformance >= 70 ? 'bg-blue-100 text-blue-800' :
                          analyse.scorePerformance >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {analyse.scorePerformance}/100
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">{analyse.tauxQualite.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-sm text-right">{analyse.delaiLivraisonMoyen.toFixed(0)}j</td>
                    <td className="px-4 py-3 text-sm text-right">{analyse.tauxService.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-sm text-right">{analyse.dpoMoyen.toFixed(0)}j</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${analyse.classement === 'excellent' ? 'bg-green-100 text-green-800' :
                        analyse.classement === 'bon' ? 'bg-blue-100 text-blue-800' :
                          analyse.classement === 'moyen' ? 'bg-yellow-100 text-yellow-800' :
                            analyse.classement === 'faible' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
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

      {/* Modal Évaluation des Risques */}
      <Modal
        isOpen={isRisquesModalOpen}
        onClose={() => setIsRisquesModalOpen(false)}
        title="Évaluation des Risques Fournisseurs"
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-800">
              Évaluation des risques liés aux fournisseurs : concentration, qualité, délais, localisation.
            </p>
          </div>

          <div className="space-y-4">
            {risquesFournisseurs.slice(0, 10).map((risque) => (
              <div
                key={risque.fournisseurId}
                className={`p-4 rounded-lg border-2 ${risque.niveauRisque === 'critique' ? 'bg-red-50 border-red-300' :
                  risque.niveauRisque === 'eleve' ? 'bg-orange-50 border-orange-300' :
                    risque.niveauRisque === 'moyen' ? 'bg-yellow-50 border-yellow-300' :
                      'bg-green-50 border-green-300'
                  }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{risque.fournisseurNom}</h4>
                    <p className="text-sm text-slate-600">Score de risque: {risque.scoreRisque}/100</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${risque.niveauRisque === 'critique' ? 'bg-red-200 text-red-800' :
                    risque.niveauRisque === 'eleve' ? 'bg-orange-200 text-orange-800' :
                      risque.niveauRisque === 'moyen' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                    }`}>
                    {risque.niveauRisque}
                  </span>
                </div>

                <div className="space-y-2 mb-3">
                  <p className="text-xs font-semibold text-slate-600">Facteurs de risque:</p>
                  {risque.facteursRisque.map((facteur, idx) => (
                    <div key={idx} className="bg-white p-2 rounded text-xs">
                      <span className="font-medium capitalize">{facteur.type}:</span>
                      <span className="ml-2">{facteur.description}</span>
                      <span className={`ml-2 px-1 py-0.5 rounded text-xs ${facteur.impact === 'eleve' ? 'bg-red-100 text-red-800' :
                        facteur.impact === 'moyen' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                        {facteur.impact}
                      </span>
                    </div>
                  ))}
                </div>

                {risque.recommandations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Recommandations:</p>
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                      {risque.recommandations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setIsRisquesModalOpen(false)}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Fournisseurs;
