import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
  PlusIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PrinterIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BanknotesIcon,
  TruckIcon,
  ArrowTrendingUpIcon,
  ChartPieIcon,
  PhoneIcon,
  MapPinIcon,
  CalculatorIcon,
  DocumentCheckIcon,
  CalendarIcon,
  XMarkIcon,
  EnvelopeIcon,
  CubeIcon,
  SparklesIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Modal from '../../components/UI/Modal';
import NotificationModal from '../../components/UI/NotificationModal';
import SignaturePad from '../../components/UI/SignaturePad';
import { useNotification } from '../../hooks/useNotification';
import InvoicePrintView from '../../components/Factures/InvoicePrintView.tsx';
import { useApp } from '../../context/AppContext';
import { useProducts } from '../../context/ProductsContext';
import LineChart from '../../components/Charts/LineChart';
import DoughnutChart from '../../components/Charts/DoughnutChart';
import { usePermission } from '../../hooks/usePermission';
import { formatNumber as fmtNumber, formatCurrency } from '../../utils/format';
import { AdaptiveContentDisplay, AdaptiveContentGenerator } from '../../utils/AdaptiveContent';
import AdaptiveNotifications from '../../components/UI/AdaptiveNotifications';
import HelpButton from '../../components/UI/HelpButton';
import GlossaryTerm from '../../components/UI/GlossaryTerm';
import Tooltip from '../../components/UI/Tooltip';
import { invoiceService, Invoice, ArticleItem } from '../../services/modules/invoiceService';
import { clientsService, Client } from '../../services/modules/clientsService';
import {
  genererRelancesAutomatiques,
  analyserRentabiliteClient,
  genererPrevisionsRecouvrement,
  calculerDSOParClient,
  genererPropositionsEscompte,
  type RelanceAutomatique,
  type AnalyseRentabiliteClient,
  type Escompte
} from '../../utils/facturesVente';

// NOTE: Legacy variable names kept for minimal changes, but data now fetched from API

// Interfaces TypeScript
type StatutFacture = 'brouillon' | 'validée' | 'payée' | 'en_retard' | 'annulée';

interface ArticleFacture {
  id: string;
  designation: string;
  quantite: number;
  prixUnitaire: number;
  tva: number;
  remise: number;
  montant: number;
}

interface Facture {
  id: string;
  numero: string;
  client: string;
  date: string;
  dateEcheance: string;
  montant: number;
  statut: StatutFacture;
  articles: ArticleFacture[];
  conditionsPaiement?: string;
  reference?: string;
  montantHT?: number;
  tva?: number;
  total?: number;
  notes?: string;
  signature?: string;
  paiements?: any[];
}

interface AnalyseRentabilite {
  id: number;
  client: string;
  marge: number;
  statut: string;
  clientId?: string;
  clientNom?: string;
  caTotal?: number;
  margeNette?: number;
  dsoMoyen?: number;
  tauxRecouvrement?: number;
  score?: number;
  rentabilite?: string;
}

interface PrevisionRecouvrement {
  id: number;
  client: string;
  montant: number;
  dateEcheance: string;
  statut: string;
  factureId?: string;
  numeroFacture?: string;
  datePrevisionRecouvrement?: string;
  delaiPrevu?: number;
  probabiliteRecouvrement?: number;
  confiance?: number;
}

// Data sources are now handled by centralized services.

interface PropositionEscompte {
  id: number;
  facture: string;
  montant: number;
  taux: number;
  gain: number;
  statut: string;
  montantRemise?: number;
  montantFinal?: number;
  dateLimite?: string;
}

// Données initiales pour les relances
const initialRelances = [
  {
    id: 1,
    numero: 'REL-2024-001',
    facture: 'FAC-2024-001',
    client: 'SARL DZ',
    montant: 125000,
    dateEcheance: '2024-01-15',
    dateRelance: '2024-01-20',
    type: '1ère relance',
    statut: 'En attente',
    couleur: 'bg-amber-100 text-amber-800',
    motif: 'Paiement en retard',
    contact: 'contact@sarldz.dz',
    telephone: '+213 555 123 456'
  },
  {
    id: 2,
    numero: 'REL-2024-002',
    facture: 'FAC-2024-002',
    client: 'Entreprise ABC',
    montant: 85000,
    dateEcheance: '2024-01-18',
    dateRelance: '2024-01-25',
    type: '2ème relance',
    statut: 'Relancé',
    couleur: 'bg-orange-100 text-orange-800',
    motif: 'Paiement en retard',
    contact: 'comptabilite@entreprise-abc.dz',
    telephone: '+213 555 789 012'
  },
  {
    id: 3,
    numero: 'REL-2024-003',
    facture: 'FAC-2024-003',
    client: 'Société XYZ',
    montant: 200000,
    dateEcheance: '2024-01-20',
    dateRelance: '2024-01-30',
    type: 'Mise en demeure',
    statut: 'Urgent',
    couleur: 'bg-red-100 text-red-800',
    motif: 'Paiement en retard',
    contact: 'admin@societe-xyz.dz',
    telephone: '+213 555 345 678'
  }
];

// Données initiales pour les communications
const initialCommunications = [
  {
    id: 1,
    type: 'Email',
    client: 'SARL DZ',
    sujet: 'Relance de paiement - Facture FAC-2024-001',
    date: '2024-01-20',
    statut: 'Envoyé',
    couleur: 'bg-blue-100 text-blue-800',
    contenu:
      "Madame, Monsieur,\n\nNous vous informons que votre facture FAC-2024-001 d'un montant de 125,000 DZD est en retard de paiement depuis le 15/01/2024.\n\nNous vous remercions de bien vouloir procéder au règlement dans les plus brefs délais.\n\nCordialement,\nL'équipe comptable"
  },
  {
    id: 2,
    type: 'Appel téléphonique',
    client: 'Entreprise ABC',
    sujet: 'Relance téléphonique - Facture FAC-2024-002',
    date: '2024-01-25',
    statut: 'Effectué',
    couleur: 'bg-green-100 text-green-800',
    contenu:
      "Appel effectué le 25/01/2024 à 14h30. Le client confirme le règlement pour le 30/01/2024. Suivi à effectuer."
  },
  {
    id: 3,
    type: 'Lettre recommandée',
    client: 'Société XYZ',
    sujet: 'Mise en demeure - Facture FAC-2024-003',
    date: '2024-01-30',
    statut: 'En cours',
    couleur: 'bg-orange-100 text-orange-800',
    contenu:
      'Lettre recommandée envoyée le 30/01/2024. Délai de 8 jours pour le règlement avant procédure de recouvrement.'
  }
];

type Communication = (typeof initialCommunications)[number];

const FacturesVente = () => {
  // ========================================
  // ÉTATS PRINCIPAUX (DYNAMIC REAL-TIME)
  // ========================================
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errorData, setErrorData] = useState<string | null>(null);

  const loadData = async () => {
    setLoadingData(true);
    try {
      const [fetchedInvoices, fetchedClients] = await Promise.all([
        invoiceService.getAll('sale'),
        clientsService.getAll()
      ]);
      setInvoices(fetchedInvoices);
      setClients(fetchedClients);
      setErrorData(null);
    } catch (err) {
      console.error('Erreur chargement ventes dynamiques:', err);
      setErrorData('Impossible de se connecter au serveur en temps réel.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
    // In a real environment, we could set up a Poll or WebSocket here for Real-Time
  }, []);

  // Navigation et filtres
  const [activeTab, setActiveTab] = useState('factures');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('tous');
  const [selectedFacture, setSelectedFacture] = useState<Facture | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isNouvelleFactureModalOpen, setIsNouvelleFactureModalOpen] = useState(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [selectedLivraison, setSelectedLivraison] = useState<any>(null);
  const [isLivraisonDetailsModalOpen, setIsLivraisonDetailsModalOpen] = useState(false);
  const [selectedBrouillon, setSelectedBrouillon] = useState<any>(null);
  const [isBrouillonModalOpen, setIsBrouillonModalOpen] = useState(false);
  const [brouillonToValidate, setBrouillonToValidate] = useState<any>(null);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [communications, setCommunications] = useState<Communication[]>(initialCommunications);
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
  const [isCommunicationModalOpen, setIsCommunicationModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7j' | '30j' | '3M' | '1A'>('30j');
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [isPaiementsModalOpen, setIsPaiementsModalOpen] = useState(false);
  const [isAnalyseRentabiliteModalOpen, setIsAnalyseRentabiliteModalOpen] = useState(false);
  const [isPrevisionsRecouvrementModalOpen, setIsPrevisionsRecouvrementModalOpen] = useState(false);
  const [isEscomptesModalOpen, setIsEscomptesModalOpen] = useState(false);
  const [isTaxCalculationModalOpen, setIsTaxCalculationModalOpen] = useState(false);
  const [isDeclarationModalOpen, setIsDeclarationModalOpen] = useState(false);
  const [isConformiteModalOpen, setIsConformiteModalOpen] = useState(false);
  const [isActionComptableModalOpen, setIsActionComptableModalOpen] = useState(false);
  const [isPaiementModalOpen, setIsPaiementModalOpen] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [tvaCalculationData, setTvaCalculationData] = useState<{
    montantHT: number;
    tauxTVA: number;
    montantTVA: number;
    montantTTC: number;
  }>({ montantHT: 0, tauxTVA: 19, montantTVA: 0, montantTTC: 0 });
  const [conformiteResults, setConformiteResults] = useState<any>(null);
  const [filterLivraisonStatus, setFilterLivraisonStatus] = useState('tous');

  // Gestion de la période (7j, 30j, 3M, 1A)
  const handlePeriodChange = (period: '7j' | '30j' | '3M' | '1A') => {
    setSelectedPeriod(period);
    const today = new Date();
    const from = new Date(today);
    if (period === '7j') {
      from.setDate(today.getDate() - 7);
    } else if (period === '30j') {
      from.setDate(today.getDate() - 30);
    } else if (period === '3M') {
      from.setMonth(today.getMonth() - 3);
    } else {
      from.setFullYear(today.getFullYear() - 1);
    }
    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  };

  // États pour la gestion des factures (déclarés une seule fois)

  // État pour la gestion de la facture
  const [nouvelleFacture, setNouvelleFacture] = useState<{
    client: any;
    date: string;
    dateEcheance: string;
    reference: string;
    articles: any[];
    remise: number;
    tva: number;
    statut: string;
    notes: string;
    numero: string;
    typeDocument: 'devis' | 'facture';
    conditionPaiement: string;
    modeReglement: string;
    signatureDataUrl: string;
    devise: string;
  }>({
    client: null,
    date: new Date().toISOString().split('T')[0],
    dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reference: '',
    articles: [],
    remise: 0,
    tva: 20,
    statut: 'brouillon',
    notes: '',
    numero: '',
    typeDocument: 'facture',
    conditionPaiement: '30',
    modeReglement: 'virement',
    signatureDataUrl: '',
    devise: 'DZD'
  });

  // État pour la gestion des articles
  const [articleEnCours, setArticleEnCours] = useState({
    article: '',
    description: '',
    quantite: 1,
    prixUnitaire: 0,
    tva: 20,
    remise: 0,
    total: 0
  });

  type Article = typeof articleEnCours;

  const { products } = useProducts();
  const { user, currentDevise, setCurrentDevise, formatCurrency: formatCurrencyContext, fiscalRates: globalFiscalRates } = useApp();
  const { has } = usePermission();
  // Vérifications de permissions pour les actions de facturation
  const canCreate = has('facturation-create');
  const canValidate = has('facturation-validate');
  const canCancel = has('facturation-cancel');
  const { notification, closeNotification, success, error, warning, info, confirm } = useNotification();

  // Fonction pour gérer les actions comptables
  const handleActionComptable = (type: string) => {
    // Logique d'action comptable
    console.log(`Action comptable: ${type}`);
  };

  // Contexte pour le contenu adaptatif
  const contentContext = {
    user,
    segment: user?.segment || 'micro',
    companyType: user?.companyType || 'eurl',
    role: user?.role || 'utilisateur',
    hasPermission: has
  };

  // Helper to convert percentage to Tailwind width classes (avoid inline styles)
  const percentToWidth = (percent: number) => {
    const p = Math.max(0, Math.min(100, Math.round(percent)));
    if (p >= 98) return 'w-[100%]';
    if (p >= 95) return 'w-[95%]';
    if (p >= 90) return 'w-[90%]';
    if (p >= 80) return 'w-[80%]';
    if (p >= 70) return 'w-[70%]';
    if (p >= 60) return 'w-[60%]';
    if (p >= 50) return 'w-[50%]';
    if (p >= 40) return 'w-[40%]';
    if (p >= 30) return 'w-[30%]';
    if (p >= 20) return 'w-[20%]';
    if (p >= 10) return 'w-[10%]';
    if (p >= 5) return 'w-[5%]';
    return 'w-[0%]';
  };

  // ========================================
  // DONNÉES INITIALES
  // ========================================

  // Données initiales pour les relances
  const initialRelances = [
    {
      id: 1,
      numero: 'REL-2024-001',
      facture: 'FAC-2024-001',
      client: 'SARL DZ',
      montant: 125000,
      dateEcheance: '2024-01-15',
      dateRelance: '2024-01-20',
      type: '1ère relance',
      statut: 'En attente',
      couleur: 'bg-amber-100 text-amber-800',
      motif: 'Paiement en retard',
      contact: 'contact@sarldz.dz',
      telephone: '+213 555 123 456'
    },
    {
      id: 2,
      numero: 'REL-2024-002',
      facture: 'FAC-2024-002',
      client: 'Entreprise ABC',
      montant: 85000,
      dateEcheance: '2024-01-18',
      dateRelance: '2024-01-25',
      type: '2ème relance',
      statut: 'Relancé',
      couleur: 'bg-orange-100 text-orange-800',
      motif: 'Paiement en retard',
      contact: 'comptabilite@entreprise-abc.dz',
      telephone: '+213 555 789 012'
    },
    {
      id: 3,
      numero: 'REL-2024-003',
      facture: 'FAC-2024-003',
      client: 'Société XYZ',
      montant: 200000,
      dateEcheance: '2024-01-20',
      dateRelance: '2024-01-30',
      type: 'Mise en demeure',
      statut: 'Urgent',
      couleur: 'bg-red-100 text-red-800',
      motif: 'Paiement en retard',
      contact: 'admin@societe-xyz.dz',
      telephone: '+213 555 345 678'
    }
  ];

  // Calculer les relances automatiques intelligentes
  const relancesAutomatiques = useMemo(() => {
    const facturesNonPayees = mockFacturesVente
      .filter((f: any) => f.statut !== 'payee')
      .map((f: any) => ({
        id: f.numero || f.id?.toString() || '',
        numero: f.numero || '',
        clientId: f.client || '',
        clientNom: f.client || 'Client',
        montant: f.total || f.montantHT || 0,
        dateEcheance: f.dateEcheance || f.date || new Date().toISOString().split('T')[0],
        statut: f.statut || 'validee'
      }));

    return genererRelancesAutomatiques(facturesNonPayees);
  }, []);

  // Analyser la rentabilité par client
  const analysesRentabilite = useMemo(() => {
    const facturesAvecMarge = mockFacturesVente.map((f: any) => ({
      id: f.numero || f.id?.toString() || '',
      clientId: f.client || '',
      clientNom: f.client || 'Client',
      montantHT: f.montantHT || 0,
      montantTTC: f.total || f.montantHT || 0,
      date: f.date || new Date().toISOString().split('T')[0],
      dateEcheance: f.dateEcheance || f.date || new Date().toISOString().split('T')[0],
      datePaiement: f.statut === 'payee' ? f.datePaiement || f.date : undefined,
      statut: f.statut || 'validee',
      margeBrute: (f.montantHT || 0) * 0.3 // Estimation 30% de marge
    }));

    const dateDebut = new Date();
    dateDebut.setMonth(dateDebut.getMonth() - 3);
    const dateFin = new Date();

    return analyserRentabiliteClient(facturesAvecMarge, {
      debut: dateDebut.toISOString().split('T')[0],
      fin: dateFin.toISOString().split('T')[0]
    });
  }, []);

  // Générer les prévisions de recouvrement
  const previsionsRecouvrement = useMemo(() => {
    const facturesNonPayees = mockFacturesVente
      .filter((f: any) => f.statut !== 'payee')
      .map((f: any) => ({
        id: f.numero || f.id?.toString() || '',
        numero: f.numero || '',
        clientId: f.client || '',
        montant: f.total || f.montantHT || 0,
        dateEcheance: f.dateEcheance || f.date || new Date().toISOString().split('T')[0],
        statut: f.statut || 'validee'
      }));

    // Historique des clients basé sur les factures payées
    const historiqueClients = analysesRentabilite.map(analyse => ({
      clientId: analyse.clientId,
      dsoMoyen: analyse.dsoMoyen,
      tauxPaiement: analyse.tauxRecouvrement,
      nombreFactures: analyse.nombreFactures
    }));

    return genererPrevisionsRecouvrement(facturesNonPayees, historiqueClients);
  }, [analysesRentabilite]);

  // Générer les propositions d'escompte
  const propositionsEscompte = useMemo(() => {
    const facturesEnRetard = mockFacturesVente
      .filter((f: any) => {
        if (f.statut === 'payee') return false;
        const dateEcheance = new Date(f.dateEcheance || f.date);
        const maintenant = new Date();
        return maintenant > dateEcheance;
      })
      .map((f: any) => {
        const dateEcheance = new Date(f.dateEcheance || f.date);
        const maintenant = new Date();
        const joursRetard = Math.floor((maintenant.getTime() - dateEcheance.getTime()) / (1000 * 60 * 60 * 24));

        return {
          id: f.numero || f.id?.toString() || '',
          numero: f.numero || '',
          montant: f.total || f.montantHT || 0,
          dateEcheance: f.dateEcheance || f.date || new Date().toISOString().split('T')[0],
          joursRetard
        };
      });

    return genererPropositionsEscompte(facturesEnRetard);
  }, []);

  // États pour les paiements
  const [paiements, setPaiements] = useState([
    {
      id: 1,
      numero: 'PAY-2024-001',
      facture: 'FAC-2024-001',
      client: 'SARL DZ',
      montant: 125000,
      date: '2024-01-15',
      mode: 'Virement bancaire',
      statut: 'Confirmé',
      reference: 'VIR-2024-001',
      couleur: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 2,
      numero: 'PAY-2024-002',
      facture: 'FAC-2024-002',
      client: 'Entreprise ABC',
      montant: 85000,
      date: '2024-01-18',
      mode: 'Chèque',
      statut: 'En attente',
      reference: 'CHQ-2024-002',
      couleur: 'bg-amber-100 text-amber-800'
    },
    {
      id: 3,
      numero: 'PAY-2024-003',
      facture: 'FAC-2024-003',
      client: 'Société XYZ',
      montant: 200000,
      date: '2024-01-20',
      mode: 'Espèces',
      statut: 'Confirmé',
      reference: 'ESP-2024-003',
      couleur: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 4,
      numero: 'PAY-2024-004',
      facture: 'FAC-2024-004',
      client: 'Groupe DEF',
      montant: 150000,
      date: '2024-01-22',
      mode: 'Carte bancaire',
      statut: 'Confirmé',
      reference: 'CB-2024-004',
      couleur: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 5,
      numero: 'PAY-2024-005',
      facture: 'FAC-2024-005',
      client: 'Compagnie GHI',
      montant: 95000,
      date: '2024-01-25',
      mode: 'Virement bancaire',
      statut: 'En attente',
      reference: 'VIR-2024-005',
      couleur: 'bg-amber-100 text-amber-800'
    }
  ]);
  const [selectedPaiement, setSelectedPaiement] = useState<any>(null);
  const [isPaiementDetailsModalOpen, setIsPaiementDetailsModalOpen] = useState(false);

  // États pour les brouillons
  const [brouillons, setBrouillons] = useState([
    {
      id: 1,
      numero: 'BROUILLON-2024-001',
      client: 'Entreprise ABC SARL',
      montant: 125000,
      date: '2024-01-28',
      statut: 'En rédaction',
      articles: 3,
      progression: 45,
      dernierModif: '28/01/2024 15:30',
      creePar: 'Ahmed Benali',
      couleur: 'bg-amber-100 text-amber-800'
    },
    {
      id: 2,
      numero: 'BROUILLON-2024-002',
      client: 'Société XYZ SPA',
      montant: 89000,
      date: '2024-01-27',
      statut: 'En attente validation',
      articles: 2,
      progression: 85,
      dernierModif: '27/01/2024 10:15',
      creePar: 'Fatima Zohra',
      couleur: 'bg-cyan-100 text-cyan-800'
    },
    {
      id: 3,
      numero: 'BROUILLON-2024-003',
      client: 'Groupe DEF EURL',
      montant: 156000,
      date: '2024-01-26',
      statut: 'En rédaction',
      articles: 4,
      progression: 30,
      dernierModif: '26/01/2024 16:45',
      creePar: 'Karim Messaoudi',
      couleur: 'bg-amber-100 text-amber-800'
    },
    {
      id: 4,
      numero: 'BROUILLON-2024-004',
      client: 'Compagnie GHI SARL',
      montant: 78000,
      date: '2024-01-25',
      statut: 'Prêt pour validation',
      articles: 1,
      progression: 95,
      dernierModif: '25/01/2024 14:20',
      creePar: 'Nadia Hamidi',
      couleur: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 5,
      numero: 'BROUILLON-2024-005',
      client: 'Firme JKL SPA',
      montant: 203000,
      date: '2024-01-24',
      statut: 'En rédaction',
      articles: 5,
      progression: 60,
      dernierModif: '24/01/2024 11:00',
      creePar: 'Said Boumediene',
      couleur: 'bg-amber-100 text-amber-800'
    },
    {
      id: 6,
      numero: 'BROUILLON-2024-006',
      client: 'Industrie MNO EURL',
      montant: 67000,
      date: '2024-01-23',
      statut: 'En attente validation',
      articles: 2,
      progression: 75,
      dernierModif: '23/01/2024 09:30',
      creePar: 'Leila Kaci',
      couleur: 'bg-cyan-100 text-cyan-800'
    },
    {
      id: 7,
      numero: 'BROUILLON-2024-007',
      client: 'Commerce PQR SARL',
      montant: 134000,
      date: '2024-01-22',
      statut: 'En rédaction',
      articles: 3,
      progression: 20,
      dernierModif: '22/01/2024 17:00',
      creePar: 'Mohamed Cherif',
      couleur: 'bg-amber-100 text-amber-800'
    },
    {
      id: 8,
      numero: 'BROUILLON-2024-008',
      client: 'Services STU SPA',
      montant: 95000,
      date: '2024-01-21',
      statut: 'En attente validation',
      articles: 2,
      progression: 80,
      dernierModif: '21/01/2024 13:45',
      creePar: 'Yasmine Djaballah',
      couleur: 'bg-cyan-100 text-cyan-800'
    }
  ]);

  // KPI Comptables
  /* const kpiComptables = {
    chiffreAffaires: {
      montant: 3200000,
      evolution: 12.5,
      objectif: 3500000,
      realisation: 91.4
    },
    creancesClients: {
      montant: 450000,
      delaiMoyen: 35,
      risque: 'Faible',
      provision: 15000
    },
    tvaCollectee: {
      montant: 512000,
      taux: 16,
      aVerser: 480000,
      credit: 32000
    },
    rotationStocks: {
      ratio: 6.5,
      delai: 56,
      objectif: 8.0,
      performance: 81.3
    },
    margeBrute: {
      montant: 1120000,
      pourcentage: 35.0,
      evolution: 8.2,
      objectif: 38.0
    }
  }; */

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'brouillon': return 'bg-gray-100 text-gray-800';
      case 'validee': return 'bg-blue-100 text-blue-800';
      case 'payee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLivraisonStatusColor = (statut: string) => {
    switch (statut) {
      case 'preparation': return 'bg-yellow-100 text-yellow-800';
      case 'en_transit': return 'bg-blue-100 text-blue-800';
      case 'livree': return 'bg-green-100 text-green-800';
      case 'retardee': return 'bg-red-100 text-red-800';
      case 'annulee': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLivraisonStatusText = (statut: string) => {
    switch (statut) {
      case 'preparation': return 'En Préparation';
      case 'en_transit': return 'En Transit';
      case 'livree': return 'Livrée';
      case 'retardee': return 'Retardée';
      case 'annulee': return 'Annulée';
      default: return statut;
    }
  };

  const handleViewDetails = (facture: any) => {
    setSelectedFacture(facture);
    setIsDetailsModalOpen(true);
  };

  const handleNouvelleFacture = () => {
    // Générer un numéro initial basé sur le type de document
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const initialNumero = `FAC-2024-${String(timestamp).slice(-6)}${randomSuffix}`;

    setNouvelleFacture((prev: any) => ({
      ...prev,
      numero: initialNumero,
      typeDocument: 'facture',
      date: new Date().toISOString().split('T')[0],
      dateEcheance: ''
    }));
    setIsNouvelleFactureModalOpen(true);
  };

  const handleImprimerFacture = (facture: any) => {
    // Aperçu imprimable dans une modale React (démo statique)
    setSelectedFacture(facture);
    setIsPrintPreviewOpen(true);
  };

  const handleDupliquerFacture = (facture: any) => {
    success(
      'Facture dupliquée',
      `La facture ${facture.numero} a été dupliquée avec succès. Vous pouvez maintenant la modifier selon vos besoins.`
    );
  };

  const handleModifierFacture = (facture: any) => {
    setSelectedFacture(facture);
    setIsNouvelleFactureModalOpen(true);
  };

  const handleSupprimerFacture = (facture: any) => {
    confirm(
      'Supprimer la facture',
      `Êtes-vous sûr de vouloir supprimer la facture ${facture.numero} ?`,
      () => {
        // Ici on supprimerait vraiment la facture
        success(
          'Facture supprimée',
          `La facture ${facture.numero} a été supprimée avec succès.`,
          [
            `Numéro: ${facture.numero}`,
            `Client: ${facture.client}`,
            `Montant: ${formatCurrency(facture.total)}`,
            `Date de suppression: ${new Date().toLocaleDateString('fr-FR')}`
          ]
        );
      },
      [
        `Cette action est irréversible.`,
        `La facture ${facture.numero} sera définitivement supprimée du système.`
      ],
      'Supprimer',
      'Annuler'
    );
  };


  const handleEnvoyerFacture = (facture: any) => {
    success(
      'Facture envoyée',
      `La facture ${facture.numero} a été envoyée avec succès au client par email.`,
      [
        `Destinataire: ${facture.client}`,
        `Numéro de facture: ${facture.numero}`,
        `Montant: ${formatCurrency(facture.total)}`,
        `Date d'envoi: ${new Date().toLocaleString('fr-FR')}`
      ]
    );
  };

  const handleViewLivraisonDetails = (livraison: any) => {
    setSelectedLivraison(livraison);
    setIsLivraisonDetailsModalOpen(true);
  };

  const handleUpdateLivraisonStatus = (livraison: any, newStatus: string) => {
    // Mise à jour du statut dans l'état local
    setLivraisons((prev: any[]) => prev.map((l: any) =>
      l.id === livraison.id
        ? {
          ...l,
          statut: newStatus,
          dateLivraisonReelle: newStatus === 'livree' ? new Date().toISOString().split('T')[0] : l.dateLivraisonReelle
        }
        : l
    ));

    // Mise à jour de la livraison sélectionnée si c'est la même
    if (selectedLivraison && selectedLivraison.id === livraison.id) {
      setSelectedLivraison((prev: any) => ({
        ...prev,
        statut: newStatus,
        dateLivraisonReelle: newStatus === 'livree' ? new Date().toISOString().split('T')[0] : prev.dateLivraisonReelle
      }));
    }

    // Message de confirmation amélioré avec détails
    const statusText = getLivraisonStatusText(newStatus);
    const currentDate = new Date().toLocaleDateString('fr-FR');
    const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    if (newStatus === 'livree') {
      success(
        'Livraison confirmée',
        `La livraison ${livraison.numero} a été marquée comme livrée avec succès.`,
        [
          `📦 Numéro: ${livraison.numero}`,
          `🏢 Client: ${livraison.client}`,
          `📅 Date de livraison: ${currentDate}`,
          `🕐 Heure: ${currentTime}`,
          `🚚 Transporteur: ${livraison.transporteur || 'Transport Express DZ'}`,
          `📞 Contact: ${livraison.contactClient || '+213 21 123 456'}`
        ]
      );
    } else {
      success(
        'Statut mis à jour',
        `Le statut de la livraison ${livraison.numero} a été modifié avec succès.`,
        [
          `Nouveau statut: ${statusText}`,
          `Date de mise à jour: ${currentDate} à ${currentTime}`,
          `Client: ${livraison.client}`
        ]
      );
    }
  };

  const handleTrackLivraison = (livraison: any) => {
    info(
      'Suivi de livraison',
      `Informations de suivi pour la livraison ${livraison.numero}`,
      [
        `Numéro de suivi: ${livraison.numeroSuivi}`,
        `Transporteur: ${livraison.transporteur}`,
        `Client: ${livraison.client}`,
        `Statut actuel: ${getLivraisonStatusText(livraison.statut)}`
      ]
    );
  };

  const handleContactClient = (livraison: any) => {
    info(
      'Coordonnées client',
      `Informations de contact pour ${livraison.client}`,
      [
        `Téléphone: ${livraison.contactClient}`,
        `Adresse: ${livraison.adresseLivraison || 'Non spécifiée'}`,
        `Livraison: ${livraison.numero}`
      ]
    );
  };


  // Handlers pour les brouillons
  const handleViewBrouillon = (brouillon: any) => {
    setSelectedBrouillon(brouillon);
    setIsBrouillonModalOpen(true);
  };

  const handleEditBrouillon = (brouillon: any) => {
    info(
      'Modification du brouillon',
      `Ouverture de l'éditeur pour le brouillon ${brouillon.numero}`,
      [
        `Client: ${brouillon.client}`,
        `Montant: ${formatCurrency(brouillon.montant)}`,
        `Progression: ${brouillon.progression}%`
      ]
    );
    // Ici on ouvrirait vraiment l'éditeur
  };

  const handleValidateBrouillon = (brouillon: any) => {
    setBrouillonToValidate(brouillon);
    setIsValidationModalOpen(true);
  };

  const confirmValidation = () => {
    if (brouillonToValidate) {
      setBrouillons((prev: any) => prev.map((b: any) =>
        b.id === brouillonToValidate.id
          ? { ...b, statut: 'Validé', couleur: 'bg-emerald-100 text-emerald-800' }
          : b
      ));
      success(
        'Brouillon validé',
        `Le brouillon ${brouillonToValidate.numero} a été validé avec succès et est maintenant une facture officielle.`,
        [
          `Numéro: ${brouillonToValidate.numero}`,
          `Client: ${brouillonToValidate.client}`,
          `Montant: ${formatCurrency(brouillonToValidate.montant)}`,
          `Date de validation: ${new Date().toLocaleString('fr-FR')}`
        ]
      );
      setIsValidationModalOpen(false);
      setBrouillonToValidate(null);
    }
  };

  const handleDeleteBrouillon = (brouillon: any) => {
    confirm(
      'Supprimer le brouillon',
      `Êtes-vous sûr de vouloir supprimer le brouillon ${brouillon.numero} ?`,
      () => {
        setBrouillons((prev: any) => prev.filter((b: any) => b.id !== brouillon.id));
        success(
          'Brouillon supprimé',
          `Le brouillon ${brouillon.numero} a été supprimé avec succès.`,
          [
            `Numéro: ${brouillon.numero}`,
            `Client: ${brouillon.client}`,
            `Date de suppression: ${new Date().toLocaleDateString('fr-FR')}`
          ]
        );
      },
      ['Cette action est irréversible.', 'Toutes les données du brouillon seront perdues.'],
      'Supprimer',
      'Annuler'
    );
  };

  const handleCreateNewBrouillon = () => {
    const newId = Math.max(...brouillons.map((b: any) => b.id)) + 1;
    const newBrouillon = {
      id: newId,
      numero: `FAC-2024-${String(newId).padStart(3, '0')}`,
      client: 'Nouveau Client',
      montant: 0,
      date: new Date().toISOString().split('T')[0],
      statut: 'En rédaction',
      articles: 0,
      couleur: 'bg-amber-100 text-amber-800'
    };
    setBrouillons((prev: any) => [newBrouillon, ...prev]);
    success(
      'Nouveau brouillon créé',
      `Le brouillon ${newBrouillon.numero} a été créé avec succès. Vous pouvez maintenant commencer à le remplir.`,
      [
        `Numéro: ${newBrouillon.numero}`,
        `Statut: ${newBrouillon.statut}`,
        `Date de création: ${new Date().toLocaleDateString('fr-FR')}`
      ]
    );
  };

  const handleDuplicateBrouillon = () => {
    if (brouillons.length > 0) {
      const lastBrouillon = brouillons[0];
      const newId = Math.max(...brouillons.map((b: any) => b.id)) + 1;
      const duplicatedBrouillon = {
        ...lastBrouillon,
        id: newId,
        numero: `FAC-2024-${String(newId).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        statut: 'En rédaction',
        couleur: 'bg-amber-100 text-amber-800'
      };
      setBrouillons((prev: any) => [duplicatedBrouillon, ...prev]);
      success(
        'Brouillon dupliqué',
        `Le brouillon ${duplicatedBrouillon.numero} a été créé à partir de ${lastBrouillon.numero}.`,
        [
          `Nouveau numéro: ${duplicatedBrouillon.numero}`,
          `Client: ${duplicatedBrouillon.client}`,
          `Montant: ${formatCurrency(duplicatedBrouillon.montant)}`,
          `Date: ${new Date().toLocaleDateString('fr-FR')}`
        ]
      );
    }
  };

  // Handlers pour la nouvelle facture
  const handleArticleChange = (field: string, value: string | number) => {
    const updatedArticle = { ...articleEnCours, [field]: value };

    // Calcul automatique du total avec remise
    if (field === 'prixUnitaire' || field === 'quantite' || field === 'remise') {
      const prixUnitaire = parseFloat(String(updatedArticle.prixUnitaire)) || 0;
      const quantite = parseInt(String(updatedArticle.quantite)) || 0;
      const remise = parseFloat(String(updatedArticle.remise)) || 0;

      const sousTotal = prixUnitaire * quantite;
      const montantRemise = sousTotal * (remise / 100);
      const total = sousTotal - montantRemise;

      updatedArticle.total = total;
    }

    setArticleEnCours(updatedArticle);
  };

  const handleAddArticle = () => {
    if (articleEnCours.article && articleEnCours.quantite > 0) {
      const articleId = String(articleEnCours.article);
      const selectedProduct = products.find(p => p.id === articleId);

      if (!selectedProduct) {
        error(
          'Article introuvable',
          'L\'article sélectionné n\'a pas été trouvé dans le référentiel.',
          [
            'Vérifiez que l\'article existe dans votre catalogue.',
            'Assurez-vous que l\'ID de l\'article est correct.'
          ]
        );
        return;
      }

      // Utiliser le prix du référentiel si non saisi ou nul
      const prixBase = parseFloat(String(articleEnCours.prixUnitaire)) || selectedProduct.prixUnitaire || 0;
      const quantite = parseInt(String(articleEnCours.quantite)) || 0;
      const remise = parseFloat(String(articleEnCours.remise)) || 0;

      const sousTotal = prixBase * quantite;
      const montantRemise = sousTotal * (remise / 100);
      const total = sousTotal - montantRemise;

      const newArticle = {
        id: Date.now(),
        nom: selectedProduct.nom,
        description: articleEnCours.description || '',
        prixUnitaire: prixBase,
        quantite: quantite,
        remise: remise,
        total: total
      };

      setNouvelleFacture((prev: any) => ({
        ...prev,
        articles: [...prev.articles, newArticle]
      }));

      // Reset du formulaire d'article
      setArticleEnCours({
        article: '',
        description: '',
        prixUnitaire: 0,
        quantite: 1,
        tva: 20,
        remise: 0,
        total: 0
      });
    }
  };

  // const handleActionComptable = (type: string) => {
  //   setActionComptableType(type);
  //   setIsActionComptableModalOpen(true);
  // };

  // Handlers pour les rapports de ventes (doublon supprimé, voir handlePeriodChange défini plus haut)

  const handleExportReport = () => {
    info(
      'Export en cours',
      `Génération du rapport de ventes pour la période sélectionnée...`,
      [
        `Période: ${selectedPeriod}`,
        `Du ${new Date(dateFrom).toLocaleDateString('fr-FR')} au ${new Date(dateTo).toLocaleDateString('fr-FR')}`,
        'Le fichier sera téléchargé automatiquement une fois prêt.'
      ]
    );
  };

  const handleNewReport = () => {
    setIsNewReportModalOpen(true);
  };

  // Handlers pour les paiements
  const handleViewPaiement = (paiement: any) => {
    setSelectedPaiement(paiement);
    setIsPaiementDetailsModalOpen(true);
  };

  const handleEditPaiement = (paiement: any) => {
    info(
      'Modification du paiement',
      `Ouverture de l'éditeur pour le paiement ${paiement.numero}`,
      [
        `Facture: ${paiement.facture}`,
        `Client: ${paiement.client}`,
        `Montant: ${formatCurrency(paiement.montant)}`,
        `Mode: ${paiement.mode}`
      ]
    );
  };

  const handleDeletePaiement = (paiement: any) => {
    confirm(
      'Supprimer le paiement',
      `Êtes-vous sûr de vouloir supprimer le paiement ${paiement.numero} ?`,
      () => {
        setPaiements((prev: any) => prev.filter((p: any) => p.id !== paiement.id));
        success(
          'Paiement supprimé',
          `Le paiement ${paiement.numero} a été supprimé avec succès.`,
          [
            `Numéro: ${paiement.numero}`,
            `Facture: ${paiement.facture}`,
            `Montant: ${formatCurrency(paiement.montant)}`,
            `Date de suppression: ${new Date().toLocaleDateString('fr-FR')}`
          ]
        );
      },
      ['Cette action est irréversible.', 'Le paiement sera définitivement supprimé.'],
      'Supprimer',
      'Annuler'
    );
  };

  const handleNewPaiement = () => {
    setIsPaiementsModalOpen(true);
  };

  const handleExportPaiements = () => {
    info(
      'Export en cours',
      'Génération du fichier d\'export des paiements...',
      [
        `Nombre de paiements: ${paiements.length}`,
        'Format: Excel (.xlsx)',
        'Le fichier sera téléchargé automatiquement une fois prêt.'
      ]
    );
  };

  // Fonctions pour les actions fiscales

  // const handleGenererDeclaration = () => {
  //   setIsDeclarationModalOpen(true);
  // };

  // const handleVerifierConformite = () => {
  //   setIsConformiteModalOpen(true);
  // };

  const calculateTVA = (montantHT: number, tauxTVA: number = 19) => {
    const montantTVA = montantHT * (tauxTVA / 100);
    const montantTTC = montantHT + montantTVA;

    setTvaCalculationData({
      montantHT,
      tauxTVA,
      montantTVA,
      montantTTC
    });

    return { montantTVA, montantTTC };
  };

  const generateDeclarationG50 = async () => {
    // Simulation de génération de déclaration G50
    const today = new Date();
    const periode = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    // Calcul des totaux des factures de la période
    const facturesPeriode = mockFacturesVente.filter((f: any) => {
      const factureDate = new Date(f.date);
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      return factureDate.getMonth() === currentMonth && factureDate.getFullYear() === currentYear;
    });

    const chiffreAffaires = facturesPeriode.reduce((sum: number, f: any) => sum + (f.montantHT || 0), 0);
    const tvaCollectee = facturesPeriode.reduce((sum: number, f: any) => sum + (f.tva || 0), 0);

    const declaration = {
      id: `G50-${Date.now()}`,
      numero: `G50-${periode}`,
      periode: periode,
      dateGeneration: today.toISOString().split('T')[0],
      chiffreAffaires: chiffreAffaires,
      tvaCollectee: tvaCollectee,
      tvaDeductible: 0, // À calculer selon les achats
      tvaAVerser: tvaCollectee,
      statut: 'Générée',
      observations: 'Déclaration générée automatiquement par le système'
    };

    success(
      'Déclaration G50 générée',
      `La déclaration G50 ${declaration.numero} a été générée avec succès.`,
      [
        `Période: ${declaration.periode}`,
        `Chiffre d'affaires HT: ${formatCurrency(declaration.chiffreAffaires)}`,
        `TVA collectée: ${formatCurrency(declaration.tvaCollectee)}`,
        `TVA à verser: ${formatCurrency(declaration.tvaAVerser)}`,
        `Date de génération: ${new Date(declaration.dateGeneration).toLocaleDateString('fr-FR')}`
      ]
    );
  };

  const verifierConformite = () => {
    const today = new Date();

    // Vérifications de conformité
    const verifications = {
      factures: {
        total: mockFacturesVente.length,
        conformes: mockFacturesVente.filter((f: any) => f.numero && f.client && f.total > 0).length,
        nonConformes: mockFacturesVente.filter((f: any) => !f.numero || !f.client || f.total <= 0).length
      },
      tva: {
        tauxCorrect: mockFacturesVente.every((f: any) => Math.abs((f.tva || 0) - (f.montantHT || 0) * 0.19) < 0.01),
        declarationsEnRetard: 0, // À calculer selon les échéances
        montantTotal: mockFacturesVente.reduce((sum: number, f: any) => sum + (f.tva || 0), 0)
      },
      numerotation: {
        facturesSansNumero: mockFacturesVente.filter((f: any) => !f.numero).length,
        numerosDupliques: 0, // À vérifier
        sequenceCorrecte: true // À vérifier
      },
      echeances: {
        facturesEnRetard: mockFacturesVente.filter((f: any) => {
          const echeance = new Date(f.dateEcheance || f.date);
          return echeance < today && f.statut !== 'payée';
        }).length,
        totalEnRetard: mockFacturesVente.filter((f: any) => {
          const echeance = new Date(f.dateEcheance || f.date);
          return echeance < today && f.statut !== 'payée';
        }).reduce((sum: number, f: any) => sum + f.total, 0)
      }
    };

    const scoreConformite = Math.round(
      ((verifications.factures.conformes / verifications.factures.total) * 40 +
        (verifications.tva.tauxCorrect ? 30 : 0) +
        (verifications.numerotation.facturesSansNumero === 0 ? 20 : 0) +
        (verifications.echeances.facturesEnRetard === 0 ? 10 : 0))
    );

    const resultats = {
      score: scoreConformite,
      niveau: scoreConformite >= 90 ? 'Excellent' :
        scoreConformite >= 75 ? 'Bon' :
          scoreConformite >= 60 ? 'Moyen' : 'À améliorer',
      verifications,
      recommandations: [
        ...(verifications.factures.nonConformes > 0 ? ['Corriger les factures non conformes'] : []),
        ...(verifications.tva.tauxCorrect ? [] : ['Vérifier les calculs de TVA']),
        ...(verifications.numerotation.facturesSansNumero > 0 ? ['Compléter la numérotation des factures'] : []),
        ...(verifications.echeances.facturesEnRetard > 0 ? ['Suivre les échéances de paiement'] : [])
      ],
      dateVerification: today.toISOString().split('T')[0]
    };

    setConformiteResults(resultats);
    const niveauColor = scoreConformite >= 90 ? 'Excellent' :
      scoreConformite >= 75 ? 'Bon' :
        scoreConformite >= 60 ? 'Moyen' : 'À améliorer';

    (scoreConformite >= 75 ? success : warning)(
      'Vérification de conformité terminée',
      `Score de conformité: ${scoreConformite}% (${niveauColor})`,
      [
        `Factures conformes: ${resultats.verifications.factures.conformes}/${resultats.verifications.factures.total}`,
        `TVA correcte: ${resultats.verifications.tva.tauxCorrect ? 'Oui' : 'Non'}`,
        `Factures en retard: ${resultats.verifications.echeances.facturesEnRetard}`,
        ...(resultats.recommandations.length > 0 ? ['Recommandations disponibles dans le rapport'] : [])
      ]
    );
  };

  // Fonctions pour les rapports comptables
  const generateGrandLivre = () => {
    const grandLivre = {
      type: 'Grand Livre',
      periode: `${dateFrom} - ${dateTo}`,
      comptes: [
        {
          numero: '701',
          libelle: 'Ventes de biens',
          soldeInitial: 0,
          debit: mockFacturesVente.reduce((sum: number, f: any) => sum + (f.montantHT || 0), 0),
          credit: 0,
          soldeFinal: mockFacturesVente.reduce((sum: number, f: any) => sum + (f.montantHT || 0), 0)
        },
        {
          numero: '44571',
          libelle: 'TVA collectée',
          soldeInitial: 0,
          debit: 0,
          credit: mockFacturesVente.reduce((sum: number, f: any) => sum + (f.tva || 0), 0),
          soldeFinal: -mockFacturesVente.reduce((sum: number, f: any) => sum + (f.tva || 0), 0)
        },
        {
          numero: '411',
          libelle: 'Clients',
          soldeInitial: 0,
          debit: mockFacturesVente.reduce((sum: number, f: any) => sum + (f.total || 0), 0),
          credit: 0,
          soldeFinal: mockFacturesVente.reduce((sum: number, f: any) => sum + (f.total || 0), 0)
        }
      ],
      totalDebit: mockFacturesVente.reduce((sum: number, f: any) => sum + (f.total || 0), 0),
      totalCredit: mockFacturesVente.reduce((sum: number, f: any) => sum + (f.total || 0), 0)
    };

    setReportData(grandLivre);
    setIsReportModalOpen(true);
  };

  const generateBalance = () => {
    const balance = {
      type: 'Balance',
      periode: `${dateFrom} - ${dateTo}`,
      comptes: [
        {
          numero: '701',
          libelle: 'Ventes de biens',
          soldeDebiteur: mockFacturesVente.reduce((sum: number, f: any) => sum + (f.montantHT || 0), 0),
          soldeCrediteur: 0
        },
        {
          numero: '44571',
          libelle: 'TVA collectée',
          soldeDebiteur: 0,
          soldeCrediteur: mockFacturesVente.reduce((sum: number, f: any) => sum + (f.tva || 0), 0)
        },
        {
          numero: '411',
          libelle: 'Clients',
          soldeDebiteur: mockFacturesVente.reduce((sum: number, f: any) => sum + (f.total || 0), 0),
          soldeCrediteur: 0
        }
      ],
      totalDebiteur: mockFacturesVente.reduce((sum: number, f: any) => sum + (f.total || 0), 0),
      totalCrediteur: mockFacturesVente.reduce((sum: number, f: any) => sum + (f.total || 0), 0)
    };

    setReportData(balance);
    setIsReportModalOpen(true);
  };

  const generateJournal = () => {
    const journal = {
      type: 'Journal des Ventes',
      periode: `${dateFrom} - ${dateTo}`,
      ecritures: mockFacturesVente.map((facture: any, index: number) => ({
        numero: index + 1,
        date: facture.date,
        piece: facture.numero,
        libelle: `Vente à ${facture.client}`,
        compte: '701',
        libelleCompte: 'Ventes de biens',
        debit: facture.montantHT || 0,
        credit: 0
      })).concat(
        mockFacturesVente.map((facture: any, index: number) => ({
          numero: mockFacturesVente.length + index + 1,
          date: facture.date,
          piece: facture.numero,
          libelle: `TVA sur vente à ${facture.client}`,
          compte: '44571',
          libelleCompte: 'TVA collectée',
          debit: 0,
          credit: facture.tva || 0
        }))
      ).concat(
        mockFacturesVente.map((facture: any, index: number) => ({
          numero: (mockFacturesVente.length * 2) + index + 1,
          date: facture.date,
          piece: facture.numero,
          libelle: `Facturation client ${facture.client}`,
          compte: '411',
          libelleCompte: 'Clients',
          debit: facture.total || 0,
          credit: 0
        }))
      )
    };

    setReportData(journal);
    setIsReportModalOpen(true);
  };

  const generateEtatTVA = () => {
    const etatTVA = {
      type: 'État de TVA',
      periode: `${dateFrom} - ${dateTo}`,
      tvaCollectee: {
        montant: mockFacturesVente.reduce((sum: number, f: any) => sum + (f.tva || 0), 0),
        nombreFactures: mockFacturesVente.length
      },
      tvaDeductible: {
        montant: 0, // À calculer selon les achats
        nombreFactures: 0
      },
      tvaAVerser: mockFacturesVente.reduce((sum: number, f: any) => sum + (f.tva || 0), 0),
      details: mockFacturesVente.map((facture: any) => ({
        numero: facture.numero,
        date: facture.date,
        client: facture.client,
        montantHT: facture.montantHT || 0,
        tva: facture.tva || 0,
        montantTTC: facture.total || 0
      }))
    };

    setReportData(etatTVA);
    setIsReportModalOpen(true);
  };

  const handleReportGeneration = (reportType: string) => {
    switch (reportType) {
      case 'grand-livre':
        generateGrandLivre();
        break;
      case 'balance':
        generateBalance();
        break;
      case 'journal':
        generateJournal();
        break;
      case 'etat-tva':
        generateEtatTVA();
        break;
      default:
        error(
          'Type de rapport inconnu',
          'Le type de rapport demandé n\'est pas reconnu par le système.',
          [
            'Types disponibles: Grand Livre, Balance, Journal, État de TVA',
            'Vérifiez que le type de rapport est correct.'
          ]
        );
    }
  };

  // Fonctions pour les relances et communication client
  const handleCreateRelance = () => {
    const newRelance = {
      id: Date.now(),
      numero: `REL-2024-${String(relances.length + 1).padStart(3, '0')}`,
      facture: 'FAC-2024-NEW',
      client: 'Nouveau Client',
      montant: 0,
      dateEcheance: new Date().toISOString().split('T')[0],
      dateRelance: new Date().toISOString().split('T')[0],
      type: '1ère relance',
      statut: 'En attente',
      couleur: 'bg-amber-100 text-amber-800',
      motif: 'Paiement en retard',
      contact: 'contact@client.dz',
      telephone: '+213 555 000 000'
    };

    setRelances((prev: any) => [newRelance, ...prev]);
    setSelectedRelance(newRelance);
    setIsRelanceModalOpen(true);
  };

  const handleViewRelance = (relance: any) => {
    setSelectedRelance(relance);
    setIsRelanceModalOpen(true);
  };


  const handleSendCommunication = (relance: any, type: string) => {
    const newCommunication = {
      id: Date.now(),
      type: type,
      client: relance.client,
      sujet: `${type} - ${relance.facture}`,
      date: new Date().toISOString().split('T')[0],
      statut: 'En cours',
      couleur: type === 'Email' ? 'bg-blue-100 text-blue-800' :
        type === 'Appel téléphonique' ? 'bg-green-100 text-green-800' :
          'bg-orange-100 text-orange-800',
      contenu: type === 'Email' ?
        `Madame, Monsieur,\n\nNous vous informons que votre facture ${relance.facture} d'un montant de ${formatCurrency(relance.montant)} est en retard de paiement depuis le ${relance.dateEcheance}.\n\nNous vous remercions de bien vouloir procéder au règlement dans les plus brefs délais.\n\nCordialement,\nL'équipe comptable` :
        `Communication ${type.toLowerCase()} effectuée le ${new Date().toLocaleDateString('fr-FR')} pour la relance ${relance.numero}.`
    };

    setCommunications((prev: any) => [newCommunication, ...prev]);
    success(
      'Communication envoyée',
      `${type} envoyé(e) avec succès à ${relance.client}.`,
      [
        `Type: ${type}`,
        `Client: ${relance.client}`,
        `Facture: ${relance.facture}`,
        `Date: ${new Date().toLocaleString('fr-FR')}`,
        `Statut: ${newCommunication.statut}`
      ]
    );
  };

  const handleViewCommunication = (communication: any) => {
    setSelectedCommunication(communication);
    setIsCommunicationModalOpen(true);
  };

  // const handleCreateNewCommunication = () => {
  //   setIsCommunicationModalOpen(true);
  // };

  // Données dynamiques selon la période sélectionnée
  const getReportData = () => {
    const baseData = {
      '7j': {
        chiffreAffaires: 850000,
        nombreFactures: 45,
        panierMoyen: 18889,
        tauxConversion: 72.5,
        evolutionCA: 8.2,
        evolutionFactures: 5.1,
        evolutionPanier: 2.3,
        evolutionConversion: 1.8
      },
      '30j': {
        chiffreAffaires: 3200000,
        nombreFactures: 247,
        panierMoyen: 12955,
        tauxConversion: 78.5,
        evolutionCA: 18.5,
        evolutionFactures: 12.3,
        evolutionPanier: 5.7,
        evolutionConversion: 3.2
      },
      '3M': {
        chiffreAffaires: 9500000,
        nombreFactures: 720,
        panierMoyen: 13194,
        tauxConversion: 81.2,
        evolutionCA: 25.8,
        evolutionFactures: 18.7,
        evolutionPanier: 6.1,
        evolutionConversion: 4.5
      },
      '1A': {
        chiffreAffaires: 38500000,
        nombreFactures: 2890,
        panierMoyen: 13322,
        tauxConversion: 83.7,
        evolutionCA: 32.4,
        evolutionFactures: 24.1,
        evolutionPanier: 6.8,
        evolutionConversion: 5.2
      }
    };

    return baseData[selectedPeriod as keyof typeof baseData] || baseData['30j'];
  };

  const formatReportCurrency = (amount: any) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M DZD`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K DZD`;
    }
    return `${fmtNumber(amount)} DZD`;
  };

  const handleRemoveArticle = (articleId: any) => {
    setNouvelleFacture((prev: any) => ({
      ...prev,
      articles: prev.articles.filter((a: any) => a.id !== articleId)
    }));
  };

  const handleUpdateArticle = (articleId: any, field: string, value: any) => {
    setNouvelleFacture((prev: any) => ({
      ...prev,
      articles: prev.articles.map((a: any) => {
        if (a.id === articleId) {
          const updated = { ...a, [field]: value };
          if (field === 'prixUnitaire' || field === 'quantite' || field === 'remise') {
            const sousTotal = updated.prixUnitaire * updated.quantite;
            const montantRemise = sousTotal * (updated.remise / 100);
            updated.total = sousTotal - montantRemise;
          }
          return updated;
        }
        return a;
      })
    }));
  };

  // Fonction de conversion de devise
  const convertCurrency = (amount: number, fromDevise: string, toDevise: string) => {
    if (fromDevise === toDevise) return amount;

    // Taux de change approximatifs (à remplacer par des taux réels)
    const rates: Record<string, Record<string, number>> = {
      DZD: { EUR: 0.007, USD: 0.0074 },
      EUR: { DZD: 142.86, USD: 1.06 },
      USD: { DZD: 135.14, EUR: 0.94 }
    };

    return amount * (rates[fromDevise]?.[toDevise] || 1);
  };

  const calculateTotals = () => {
    // Calcul du sous-total HT (somme des totaux des articles)
    const sousTotalHT = nouvelleFacture.articles.reduce((sum: number, article: Article) => {
      return sum + ((article as any).total || 0);
    }, 0);

    // Calcul des remises totales
    const totalRemises = nouvelleFacture.articles.reduce((sum: number, article: Article) => {
      const sousTotal = ((article as any).prixUnitaire || 0) * ((article as any).quantite || 0);
      const montantRemise = sousTotal * (((article as any).remise || 0) / 100);
      return sum + montantRemise;
    }, 0);

    // Total HT après remises
    const totalHT = sousTotalHT;

    // TVA selon la devise de la facture (ou devise globale si non définie)
    const deviseFacture = nouvelleFacture.devise || currentDevise;
    const tauxTVA = deviseFacture === 'DZD' ? 0.19 : (deviseFacture === 'EUR' ? 0.20 : 0.10);
    const tva = totalHT * tauxTVA;

    // Total TTC
    const totalTTC = totalHT + tva;

    return {
      sousTotalHT,
      totalRemises,
      totalHT,
      tva,
      totalTTC,
      tauxTVA: tauxTVA * 100
    };
  };

  // Calcul automatique de la date d'échéance
  React.useEffect(() => {
    if (nouvelleFacture.date && nouvelleFacture.conditionPaiement) {
      const dateFacture = new Date(nouvelleFacture.date);
      const jours = parseInt(nouvelleFacture.conditionPaiement);
      if (jours > 0) {
        dateFacture.setDate(dateFacture.getDate() + jours);
        setNouvelleFacture((prev: any) => ({
          ...prev,
          dateEcheance: dateFacture.toISOString().split('T')[0]
        }));
      } else {
        setNouvelleFacture((prev: any) => ({
          ...prev,
          dateEcheance: nouvelleFacture.date
        }));
      }
    }
  }, [nouvelleFacture.date, nouvelleFacture.conditionPaiement]);

  // Synchroniser la devise avec le contexte global
  React.useEffect(() => {
    if (nouvelleFacture.devise && nouvelleFacture.devise !== currentDevise) {
      setCurrentDevise(nouvelleFacture.devise as any);
    }
  }, [nouvelleFacture.devise, currentDevise, setCurrentDevise]);

  // Initialiser le numéro selon le type de document
  React.useEffect(() => {
    if (!nouvelleFacture.numero || nouvelleFacture.numero.startsWith('AUTO')) {
      const prefix = nouvelleFacture.typeDocument === 'devis' ? 'DEV' : 'FAC';
      setNouvelleFacture((prev: any) => ({
        ...prev,
        numero: `${prefix}-2024-${String(Date.now()).slice(-6)}`
      }));
    }
  }, [nouvelleFacture.typeDocument]);

  // Force le recalcul des totaux quand les articles changent

  // Calcul automatique du total de l'article en cours
  React.useEffect(() => {
    const prixUnitaire = parseFloat(String(articleEnCours.prixUnitaire)) || 0;
    const quantite = parseInt(String(articleEnCours.quantite)) || 0;
    const remise = parseFloat(String(articleEnCours.remise)) || 0;

    const sousTotal = prixUnitaire * quantite;
    const montantRemise = sousTotal * (remise / 100);
    const total = sousTotal - montantRemise;

    // Mettre à jour le total seulement s'il a changé
    if (Math.abs(total - (articleEnCours.total || 0)) > 0.01) {
      setArticleEnCours((prev: any) => ({ ...prev, total }));
    }
  }, [articleEnCours.prixUnitaire, articleEnCours.quantite, articleEnCours.remise]);

  const handleCreateFacture = () => {
    if (nouvelleFacture.client && nouvelleFacture.articles.length > 0) {
      const { totalHT, tva, totalTTC } = calculateTotals();
      const prefix = nouvelleFacture.typeDocument === 'devis' ? 'DEV' : 'FAC';
      const newFacture = {
        id: Date.now(),
        numero: nouvelleFacture.numero || `${prefix}-2024-${String(Date.now()).slice(-6)}`,
        typeDocument: nouvelleFacture.typeDocument,
        devise: nouvelleFacture.devise,
        client: mockClients.find(c => c.id === nouvelleFacture.client)?.nom || 'Client',
        date: nouvelleFacture.date,
        dateEcheance: nouvelleFacture.dateEcheance,
        conditionPaiement: nouvelleFacture.conditionPaiement,
        reference: nouvelleFacture.reference,
        notes: nouvelleFacture.notes,
        articles: nouvelleFacture.articles,
        montantHT: totalHT,
        tva: tva,
        total: totalTTC,
        statut: 'brouillon',
        signature: nouvelleFacture.signatureDataUrl || undefined
      };

      const factureResume: Facture = {
        id: String(newFacture.id),
        numero: newFacture.numero,
        client: newFacture.client,
        date: typeof newFacture.date === 'string' ? newFacture.date : new Date(newFacture.date).toISOString(),
        dateEcheance:
          typeof newFacture.dateEcheance === 'string'
            ? newFacture.dateEcheance
            : new Date(newFacture.dateEcheance).toISOString(),
        montant: newFacture.total,
        statut: 'brouillon',
        articles: newFacture.articles as ArticleFacture[]
      };

      success(
        'Facture créée',
        `La facture ${newFacture.numero} a été créée avec succès.`,
        [
          `Numéro: ${newFacture.numero}`,
          `Client: ${newFacture.client}`,
          `Montant HT: ${formatCurrency(newFacture.montantHT)}`,
          `TVA (19%): ${formatCurrency(newFacture.tva)}`,
          `Total TTC: ${formatCurrency(newFacture.total)}`,
          `Date: ${new Date(newFacture.date).toLocaleDateString('fr-FR')}`,
          ...(newFacture.signature ? ['✅ Signature électronique incluse'] : [])
        ]
      );
      // Fermer la modale de création et ouvrir directement les détails de la facture créée
      setIsNouvelleFactureModalOpen(false);
      setSelectedFacture(factureResume);
      setIsDetailsModalOpen(true);

      // Reset du formulaire
      setNouvelleFacture({
        client: null,
        date: new Date().toISOString().split('T')[0],
        dateEcheance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reference: '',
        articles: [],
        remise: 0,
        tva: 20,
        statut: 'brouillon',
        notes: '',
        numero: '',
        typeDocument: 'facture',
        conditionPaiement: '30',
        modeReglement: 'virement',
        signatureDataUrl: '',
        devise: 'DZD'
      });
    } else {
      warning(
        'Informations manquantes',
        'Pour créer une facture, vous devez remplir les champs obligatoires.',
        [
          '✓ Sélectionner un client',
          '✓ Ajouter au moins un article',
          '✓ Vérifier les montants et la TVA'
        ]
      );
    }
  };

  // Données de workflow ERPNext
  const workflowSteps = [
    { id: 1, name: 'Création', status: 'completed', user: 'Utilisateur', date: '2024-01-15 10:00' },
    { id: 2, name: 'Validation Comptable', status: 'pending', user: 'Comptable', date: null },
    { id: 3, name: 'Validation Direction', status: 'pending', user: 'Directeur', date: null },
    { id: 4, name: 'Envoi Client', status: 'pending', user: 'Commercial', date: null },
    { id: 5, name: 'Paiement', status: 'pending', user: 'Client', date: null }
  ];

  // Données de test pour les relances
  const [relances, setRelances] = useState<any[]>([
    { id: 1, type: 'email', date: '2024-01-20', destinataire: 'client@example.com', statut: 'envoyé', objet: 'Rappel de paiement' },
    { id: 2, type: 'appel', date: '2024-01-22', destinataire: '0612345678', statut: 'réussi', notes: 'Client a promis de payer' }
  ]);
  const [selectedRelance, setSelectedRelance] = useState<any | null>(null);
  const [isRelanceModalOpen, setIsRelanceModalOpen] = useState(false);

  // Données de test pour les communications


  // Données de test pour les prévisions de recouvrement
  // (Supprimé: redondant avec la version calculée via useMemo plus haut)

  // Données de test pour les propositions d'escompte
  // (Supprimé: redondant avec la version calculée via useMemo plus haut)

  // Statistiques des factures
  const totalFactures = mockFacturesVente.length;
  const totalMontant = mockFacturesVente.reduce((sum, f) => sum + (f.total || 0), 0);
  const facturesPayees = mockFacturesVente.filter(f => f.statut === 'payée').length;
  const facturesEnAttente = mockFacturesVente.filter(f => f.statut === 'validée').length;

  // Statistiques des livraisons
  const totalLivraisons = livraisons.length;
  const livraisonsLivrees = livraisons.filter(l => l.statut === 'livree').length;
  const livraisonsEnTransit = livraisons.filter(l => l.statut === 'en_transit').length;
  const livraisonsRetardees = livraisons.filter(l => l.statut === 'retardee').length;
  const totalFraisTransport = livraisons.reduce((sum, l) => sum + (l.fraisTransport || 0), 0);

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Header de la page amélioré */}
        {(() => {
          const pageContent = AdaptiveContentGenerator.generatePageContent('factures', contentContext);
          const tauxPaiement = totalFactures > 0 ? Math.round((facturesPayees / totalFactures) * 100) : 0;
          const caVariation = 15.2; // Calculer dynamiquement si nécessaire

          return (
            <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white rounded-xl shadow-2xl border border-slate-200 p-8 mb-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm shadow-lg">
                    <DocumentTextIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-white">Facturation</h1>
                      <HelpButton pageId="factures" variant="icon" className="text-white/80 hover:text-white" />
                      <LIAContextualButton
                        question="Comment optimiser ma gestion des factures ?"
                        context="factures"
                        variant="icon"
                        className="text-white/80 hover:text-white"
                        tooltip="Demander à LIA sur les factures"
                      />
                    </div>
                    <p className="text-slate-200 text-base font-medium">Gestion complète de vos factures</p>
                    <p className="text-slate-300 text-sm mt-1">{pageContent.description}</p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
                  <div className="text-sm text-slate-300 mb-1">Total factures</div>
                  <div className="text-4xl font-bold text-white mb-2">{totalFactures}</div>
                  <div className="text-xs text-slate-400">
                    Solution professionnelle adaptée aux micro-entreprise. Créez, suivez et analysez vos factures avec des outils avancés
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    - Solution optimisée pour {user?.companyType?.toUpperCase() || 'EURL'}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Notifications adaptatives en bas à droite */}
        <AdaptiveNotifications
          pageId="factures"
          context={contentContext}
          enabled={true}
        />

        {/* En-tête avec statistiques améliorées */}
        <div className="space-y-6">

          {/* Métriques principales améliorées */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Factures */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl shadow-lg border-2 border-blue-200 dark:border-blue-800 p-6 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-blue-700 dark:text-blue-300 text-sm font-semibold uppercase tracking-wide mb-2">Total Factures</p>
                  <p className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">{totalFactures}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Ce mois</p>
                </div>
                <div className="bg-blue-600 rounded-xl p-4 shadow-lg">
                  <DocumentTextIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              {/* Mini graphique linéaire amélioré */}
              <div className="h-20 bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 mt-4">
                <div className="flex items-end justify-between h-full space-x-1">
                  {[65, 70, 68, 75, 72, 78, 80, 82, 85, 88, 90, 95].map((h, index) => (
                    <div
                      key={index}
                      className={`bg-blue-600 rounded-sm flex-1 transition-all hover:bg-blue-700 ${h === 65 ? 'h-[65%]' : h === 68 ? 'h-[68%]' : h === 70 ? 'h-[70%]' :
                        h === 72 ? 'h-[72%]' : h === 75 ? 'h-[75%]' : h === 78 ? 'h-[78%]' :
                          h === 80 ? 'h-[80%]' : h === 82 ? 'h-[82%]' : h === 85 ? 'h-[85%]' :
                            h === 88 ? 'h-[88%]' : h === 90 ? 'h-[90%]' : 'h-[95%]'
                        }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chiffre d'Affaires */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl shadow-lg border-2 border-emerald-200 dark:border-emerald-800 p-6 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-emerald-700 dark:text-emerald-300 text-sm font-semibold uppercase tracking-wide mb-2">Chiffre d'Affaires</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{formatCurrency(totalMontant)}</p>
                  <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                    <span>+{15.2}% vs mois dernier</span>
                  </div>
                </div>
                <div className="bg-emerald-600 rounded-xl p-4 shadow-lg">
                  <CurrencyDollarIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              {/* Mini graphique en barres amélioré */}
              <div className="h-20 bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 mt-4">
                <div className="flex items-end justify-between h-full space-x-1">
                  {[60, 65, 70, 75, 80, 85, 88, 90, 92, 95, 98, 100].map((h, index) => (
                    <div
                      key={index}
                      className={`bg-emerald-600 rounded-sm flex-1 transition-all hover:bg-emerald-700 ${h === 60 ? 'h-[60%]' : h === 65 ? 'h-[65%]' : h === 70 ? 'h-[70%]' :
                        h === 75 ? 'h-[75%]' : h === 80 ? 'h-[80%]' : h === 85 ? 'h-[85%]' :
                          h === 88 ? 'h-[88%]' : h === 90 ? 'h-[90%]' : h === 92 ? 'h-[92%]' :
                            h === 95 ? 'h-[95%]' : h === 98 ? 'h-[98%]' : 'h-[100%]'
                        }`}
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* En Attente */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl shadow-lg border-2 border-amber-200 dark:border-amber-800 p-6 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-amber-700 dark:text-amber-300 text-sm font-semibold uppercase tracking-wide mb-2">En Attente</p>
                  <p className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">{facturesEnAttente}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">En cours de traitement</p>
                </div>
                <div className="bg-amber-600 rounded-xl p-4 shadow-lg">
                  <ClockIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              {/* Indicateur de progression amélioré */}
              <div className="h-20 bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 mt-4 flex items-center">
                <div className="w-full bg-amber-200 dark:bg-amber-900/30 rounded-full h-3 shadow-inner">
                  <div
                    className={`bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full transition-all duration-500 shadow-sm ${totalFactures > 0 && (facturesEnAttente / totalFactures) * 100 >= 90 ? 'w-[95%]' :
                      totalFactures > 0 && (facturesEnAttente / totalFactures) * 100 >= 75 ? 'w-[80%]' :
                        totalFactures > 0 && (facturesEnAttente / totalFactures) * 100 >= 50 ? 'w-[60%]' :
                          totalFactures > 0 && (facturesEnAttente / totalFactures) * 100 >= 25 ? 'w-[40%]' :
                            'w-[25%]'
                      }`}
                  ></div>
                </div>
              </div>
            </div>

            {/* Payées avec taux de paiement */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl shadow-lg border-2 border-purple-200 dark:border-purple-800 p-6 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-purple-700 dark:text-purple-300 text-sm font-semibold uppercase tracking-wide mb-2">Payées</p>
                  <p className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-1">{facturesPayees}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                    {totalFactures > 0 ? Math.round((facturesPayees / totalFactures) * 100) : 0}% de taux de paiement
                  </p>
                </div>
                <div className="bg-purple-600 rounded-xl p-4 shadow-lg">
                  <CheckCircleIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              {/* Graphique circulaire amélioré */}
              <div className="h-20 bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 mt-4 flex items-center justify-center">
                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200 dark:text-slate-700"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-purple-600"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      strokeDasharray={`${totalFactures > 0 ? (facturesPayees / totalFactures) * 100 : 0}, 100`}
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {totalFactures > 0 ? Math.round((facturesPayees / totalFactures) * 100) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Navigation par onglets */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="border-b border-slate-200">
            <nav className="flex overflow-x-auto px-6" aria-label="Tabs">
              {[
                { id: 'liste', name: 'Liste des Factures', icon: DocumentTextIcon },
                { id: 'brouillons', name: 'Brouillons', icon: PencilIcon },
                { id: 'paiements', name: 'Paiements', icon: BanknotesIcon },
                { id: 'relances', name: 'Relances', icon: ExclamationTriangleIcon },
                { id: 'livraisons', name: 'Suivi des Livraisons', icon: TruckIcon },
                { id: 'rapports', name: 'Rapports', icon: ChartBarIcon },
                { id: 'analytics', name: 'Analytics', icon: ChartPieIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                    ? 'border-slate-500 text-slate-700 bg-slate-50'
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
          <Card title="Liste des Factures de Vente">
            <div className="space-y-6">
              {/* Filtres et actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="flex space-x-4">
                  <select
                    aria-label="Filtrer par statut"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  >
                    <option value="tous">Tous les statuts</option>
                    <option value="brouillon">Brouillons</option>
                    <option value="validee">Validées</option>
                    <option value="payee">Payées</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Rechercher par N° facture ou client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-sm w-64"
                  />
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleNouvelleFacture}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Nouvelle Facture
                  </button>
                  <button
                    onClick={() => info(
                      'Export en cours',
                      'Génération du fichier d\'export des factures...',
                      [
                        `Nombre de factures: ${mockFacturesVente.length}`,
                        'Format: Excel (.xlsx)',
                        'Le fichier sera téléchargé automatiquement une fois prêt.'
                      ]
                    )}
                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Exporter
                  </button>
                  <button
                    onClick={() => info(
                      'Impression en cours',
                      'Préparation de l\'impression de toutes les factures...',
                      [
                        `Nombre de factures: ${mockFacturesVente.length}`,
                        'Format: PDF',
                        'L\'aperçu d\'impression s\'ouvrira dans une nouvelle fenêtre.'
                      ]
                    )}
                    className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                  >
                    <PrinterIcon className="h-4 w-4 mr-2" />
                    Imprimer
                  </button>
                </div>
              </div>

              {/* Table des factures */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        N° Facture
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Montant HT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        TVA (19%)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Total TTC
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockFacturesVente.map((facture) => (
                      <tr key={facture.numero} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          <div>
                            <div>{facture.numero}</div>
                            <div className="mt-1 flex items-center gap-1">
                              {Boolean((facture as any).signature) && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-300" title="Signature électronique enregistrée">
                                  Signé
                                </span>
                              )}
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-300" title="QR inclus dans l'aperçu d'impression">
                                QR
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(facture.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{facture.client}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatCurrency(facture.montantHT)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatCurrency(facture.tva)}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {formatCurrency(facture.total)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(facture.statut)}`}>
                            {facture.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(facture)}
                              className="text-slate-600 hover:text-slate-800"
                              title="Voir détails"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleImprimerFacture(facture)}
                              className="text-emerald-600 hover:text-emerald-800"
                              title="Imprimer"
                            >
                              <PrinterIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDupliquerFacture(facture)}
                              className="text-purple-600 hover:text-purple-800"
                              title="Dupliquer"
                            >
                              <DocumentDuplicateIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleModifierFacture(facture)}
                              className="text-amber-600 hover:text-amber-800"
                              title="Modifier"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleSupprimerFacture(facture)}
                              className="text-red-600 hover:text-red-800"
                              title="Supprimer"
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
            </div>
          </Card>
        )}

        {/* Autres onglets - à implémenter */}
        {activeTab === 'brouillons' && (
          <div className="space-y-6">
            {/* En-tête avec actions - Amélioré */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl shadow-sm border border-amber-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-amber-500 rounded-xl shadow-md">
                    <PencilIcon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">Brouillons de Factures</h2>
                    <p className="text-slate-600 mt-1">Factures en cours de création et modification</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleDuplicateBrouillon}
                    className="inline-flex items-center px-5 py-2.5 bg-white text-slate-700 rounded-xl hover:bg-slate-50 border border-slate-300 hover:border-slate-400 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                  >
                    <DocumentDuplicateIcon className="h-5 w-5 mr-2" />
                    Dupliquer
                  </button>
                  <button
                    onClick={handleCreateNewBrouillon}
                    className="inline-flex items-center px-5 py-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Nouveau Brouillon
                  </button>
                </div>
              </div>
            </div>

            {/* Statistiques des brouillons - Améliorées */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Total Brouillons</p>
                    <p className="text-3xl font-bold text-slate-900 mb-1">{brouillons.length}</p>
                    <p className="text-xs font-medium text-amber-600">En cours de création</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-md">
                    <PencilIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Montant Total</p>
                    <p className="text-3xl font-bold text-slate-900 mb-1">{formatCurrency(brouillons.reduce((sum, b) => sum + b.montant, 0))}</p>
                    <p className="text-xs font-medium text-slate-500">Valeur des brouillons</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-md">
                    <CurrencyDollarIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Prêts à Valider</p>
                    <p className="text-3xl font-bold text-emerald-600 mb-1">{brouillons.filter(b => b.progression >= 85).length}</p>
                    <p className="text-xs font-medium text-emerald-600">Progression ≥ 85%</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md">
                    <CheckCircleIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des brouillons - Améliorée */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-5 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-500 rounded-lg">
                      <DocumentTextIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Brouillons en Cours</h3>
                      <p className="text-sm text-slate-600 mt-0.5">{brouillons.length} facture{brouillons.length > 1 ? 's' : ''} en cours de création</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                {brouillons.map((brouillon) => (
                  <div
                    key={brouillon.id}
                    className="bg-white rounded-xl p-5 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Section principale */}
                      <div className="flex items-start space-x-4 flex-1 min-w-0">
                        {/* Icône de statut */}
                        <div className={`p-3 rounded-xl flex-shrink-0 ${brouillon.statut === 'En rédaction' ? 'bg-amber-100' :
                          brouillon.statut === 'Prêt pour validation' ? 'bg-emerald-100' :
                            brouillon.statut === 'En attente validation' ? 'bg-cyan-100' :
                              'bg-slate-100'
                          }`}>
                          <DocumentTextIcon className={`h-6 w-6 ${brouillon.statut === 'En rédaction' ? 'text-amber-600' :
                            brouillon.statut === 'Prêt pour validation' ? 'text-emerald-600' :
                              brouillon.statut === 'En attente validation' ? 'text-cyan-600' :
                                'text-slate-600'
                            }`} />
                        </div>

                        {/* Informations principales */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h4 className="text-base font-bold text-slate-900">{brouillon.numero}</h4>
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${brouillon.statut === 'En rédaction' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                              brouillon.statut === 'Prêt pour validation' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                brouillon.statut === 'En attente validation' ? 'bg-cyan-100 text-cyan-700 border border-cyan-200' :
                                  'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                              {brouillon.statut}
                            </span>
                          </div>

                          <p className="text-sm font-semibold text-slate-800 mb-3">{brouillon.client}</p>

                          {/* Métadonnées */}
                          <div className="flex items-center gap-4 text-xs text-slate-600 mb-4 flex-wrap">
                            <span className="flex items-center gap-1.5">
                              <CubeIcon className="h-4 w-4" />
                              <span className="font-medium">{brouillon.articles} article{brouillon.articles > 1 ? 's' : ''}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <ClockIcon className="h-4 w-4" />
                              <span>Modifié: {brouillon.dernierModif}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <UserGroupIcon className="h-4 w-4" />
                              <span>Par: {brouillon.creePar}</span>
                            </span>
                          </div>

                          {/* Barre de progression améliorée */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-700">Progression</span>
                              <span className="text-sm font-bold text-slate-900">{brouillon.progression}%</span>
                            </div>
                            <div className="relative w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ease-out ${brouillon.progression >= 90 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
                                  brouillon.progression >= 60 ? 'bg-gradient-to-r from-cyan-500 to-cyan-600' :
                                    brouillon.progression >= 30 ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
                                      'bg-gradient-to-r from-red-500 to-red-600'
                                  }`}
                                style={{ width: `${brouillon.progression}%` }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section montant et actions */}
                      <div className="flex flex-col items-end space-y-4 flex-shrink-0">
                        {/* Montant */}
                        <div className="text-right">
                          <div className="text-xs font-medium text-slate-500 mb-1">Montant</div>
                          <div className="text-xl font-bold text-slate-900">{formatCurrency(brouillon.montant)}</div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewBrouillon(brouillon)}
                            className="p-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 hover:text-slate-900 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Voir le brouillon"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditBrouillon(brouillon)}
                            className="p-2.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 hover:text-amber-900 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Modifier le brouillon"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={canValidate ? () => handleValidateBrouillon(brouillon) : undefined}
                            disabled={!canValidate}
                            className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 hover:text-emerald-900 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                            title={canValidate ? 'Valider le brouillon' : 'Permission requise: facturation-validate'}
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBrouillon(brouillon)}
                            className="p-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 hover:text-red-900 transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Supprimer le brouillon"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions rapides - Améliorées */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={handleCreateNewBrouillon}
                className="bg-white rounded-xl shadow-md border border-slate-200 p-5 hover:shadow-lg hover:border-amber-300 transition-all duration-200 text-left w-full group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-3 shadow-md group-hover:shadow-lg transition-shadow">
                    <PencilIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors">Créer un Brouillon</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Nouvelle facture</p>
                  </div>
                </div>
              </button>

              <button
                onClick={handleDuplicateBrouillon}
                className="bg-white rounded-xl shadow-md border border-slate-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-left w-full group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 shadow-md group-hover:shadow-lg transition-shadow">
                    <DocumentDuplicateIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">Dupliquer</h4>
                    <p className="text-xs text-slate-600 mt-0.5">À partir d'une facture</p>
                  </div>
                </div>
              </button>

              <button
                onClick={canValidate ? () => {
                  const brouillonsEnAttente = brouillons.filter(b => b.statut === 'En attente validation');
                  if (brouillonsEnAttente.length > 0) {
                    confirm(
                      'Valider tous les brouillons',
                      `Êtes-vous sûr de vouloir valider tous les brouillons en attente (${brouillonsEnAttente.length}) ?`,
                      () => {
                        setBrouillons((prev: any) => prev.map((b: any) =>
                          b.statut === 'En attente validation'
                            ? { ...b, statut: 'Validé', couleur: 'bg-emerald-100 text-emerald-800' }
                            : b
                        ));
                        success(
                          'Brouillons validés',
                          `${brouillonsEnAttente.length} brouillon(s) ont été validé(s) avec succès.`,
                          [
                            `Nombre validé: ${brouillonsEnAttente.length}`,
                            `Date: ${new Date().toLocaleString('fr-FR')}`,
                            'Les brouillons sont maintenant des factures officielles.'
                          ]
                        );
                      },
                      [
                        'Cette action validera tous les brouillons en attente.',
                        'Ils deviendront des factures officielles.'
                      ],
                      'Valider',
                      'Annuler'
                    );
                  } else {
                    info(
                      'Aucun brouillon en attente',
                      'Il n\'y a actuellement aucun brouillon en attente de validation.',
                      [
                        'Tous les brouillons ont déjà été traités.',
                        'Créez de nouveaux brouillons pour les valider.'
                      ]
                    );
                  }
                } : undefined}
                disabled={!canValidate}
                title={canValidate ? 'Valider tous les brouillons' : 'Permission requise: facturation-validate'}
                className="bg-white rounded-xl shadow-md border border-slate-200 p-5 hover:shadow-lg hover:border-emerald-300 transition-all duration-200 text-left w-full disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-3 shadow-md group-hover:shadow-lg transition-shadow">
                    <DocumentCheckIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">Finaliser</h4>
                    <p className="text-xs text-slate-600 mt-0.5">Valider les brouillons</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => info(
                  'Fonctionnalité en développement',
                  'La fonction d\'impression des brouillons sera bientôt disponible.',
                  [
                    'Cette fonctionnalité est en cours de développement.',
                    'Vous pourrez bientôt imprimer vos brouillons directement depuis cette interface.'
                  ]
                )}
                className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200 text-left w-full"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-50 rounded-full p-3">
                    <PrinterIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">Imprimer</h4>
                    <p className="text-xs text-slate-600">Aperçu avant impression</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'paiements' && (
          <div className="space-y-6">
            {/* En-tête avec statistiques */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-3">
                    <BanknotesIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800">Paiements Reçus</h1>
                    <p className="text-slate-600">Gestion des paiements clients et suivi des encaissements</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleExportPaiements}
                    className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all duration-200"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                    Exporter
                  </button>
                  <button
                    onClick={handleNewPaiement}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200"
                  >
                    <BanknotesIcon className="h-5 w-5 mr-2" />
                    Nouveau Paiement
                  </button>
                </div>
              </div>
            </div>

            {/* Statistiques des paiements */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Reçu</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{formatCurrency(655000)}</p>
                    <p className="text-xs text-emerald-600 mt-1">+12.5% vs mois dernier</p>
                  </div>
                  <div className="bg-emerald-50 rounded-full p-3">
                    <CurrencyDollarIcon className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Paiements Confirmés</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">3</p>
                    <p className="text-xs text-emerald-600 mt-1">60% du total</p>
                  </div>
                  <div className="bg-blue-50 rounded-full p-3">
                    <CheckCircleIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">En Attente</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">2</p>
                    <p className="text-xs text-amber-600 mt-1">40% du total</p>
                  </div>
                  <div className="bg-amber-50 rounded-full p-3">
                    <ClockIcon className="h-8 w-8 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Paiement Moyen</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{formatCurrency(131000)}</p>
                    <p className="text-xs text-purple-600 mt-1">+8.3% vs mois dernier</p>
                  </div>
                  <div className="bg-purple-50 rounded-full p-3">
                    <ChartBarIcon className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tableau des paiements - Amélioré */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 px-6 py-5 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-br from-slate-600 to-slate-700 p-2 rounded-lg shadow-sm">
                      <BanknotesIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Liste des Paiements</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{paiements.length} paiement{paiements.length > 1 ? 's' : ''} enregistré{paiements.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">N° Paiement</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Facture</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Client</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Montant</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Mode</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Statut</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {paiements.map((paiement) => (
                      <tr key={paiement.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="bg-slate-100 dark:bg-slate-700 p-1.5 rounded">
                              <BanknotesIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{paiement.numero}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{paiement.facture}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{paiement.client}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{formatCurrency(paiement.montant)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">{new Date(paiement.date).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600">
                            {paiement.mode}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1.5 text-xs font-semibold rounded-full border ${paiement.statut === 'Confirmé'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
                            }`}>
                            {paiement.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewPaiement(paiement)}
                              className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 shadow-sm hover:shadow-md"
                              title="Voir les détails"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditPaiement(paiement)}
                              className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all duration-200 shadow-sm hover:shadow-md"
                              title="Modifier"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePaiement(paiement)}
                              className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-all duration-200 shadow-sm hover:shadow-md"
                              title="Supprimer"
                            >
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
          </div>
        )}

        {activeTab === 'relances' && (
          <div className="space-y-6">
            {/* En-tête */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <ExclamationTriangleIcon className="h-7 w-7 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Gestion des Relances</h2>
                    <p className="text-slate-600">Suivez et gérez les impayés de vos clients</p>
                  </div>
                </div>
                <button
                  onClick={handleCreateRelance}
                  className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  Nouvelle Relance
                </button>
              </div>
            </div>

            {/* Statistiques des relances */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Total Relances</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{relances.length}</p>
                    <p className="text-xs text-slate-500 mt-1">{formatCurrency(relances.reduce((sum, r) => sum + r.montant, 0))} en attente</p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">En Attente</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">{relances.filter(r => r.statut === 'En attente').length}</p>
                    <p className="text-xs text-slate-500 mt-1">Relances à traiter</p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Urgentes</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{relances.filter(r => r.statut === 'Urgent').length}</p>
                    <p className="text-xs text-slate-500 mt-1">Action immédiate</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Communications</p>
                    <p className="text-2xl font-bold text-cyan-600 mt-1">{communications.length}</p>
                    <p className="text-xs text-slate-500 mt-1">Messages envoyés</p>
                  </div>
                  <div className="p-3 bg-cyan-100 rounded-lg">
                    <EnvelopeIcon className="h-6 w-6 text-cyan-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Relances Automatiques Intelligentes */}
            {relancesAutomatiques.length > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5 text-blue-600" />
                    Relances Automatiques Intelligentes
                  </h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {relancesAutomatiques.length} relance(s) générée(s)
                  </span>
                </div>

                <div className="space-y-3">
                  {relancesAutomatiques.slice(0, 10).map((relance) => (
                    <div
                      key={relance.id}
                      className={`p-4 rounded-lg border-2 ${relance.priorite === 'critique' ? 'bg-red-50 border-red-300' :
                        relance.priorite === 'haute' ? 'bg-orange-50 border-orange-300' :
                          relance.priorite === 'moyenne' ? 'bg-yellow-50 border-yellow-300' :
                            'bg-blue-50 border-blue-300'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                          <h4 className="font-semibold text-slate-900">{relance.numeroFacture} - {relance.clientNom}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${relance.niveauRelance === 1 ? 'bg-blue-100 text-blue-800' :
                            relance.niveauRelance === 2 ? 'bg-yellow-100 text-yellow-800' :
                              relance.niveauRelance === 3 ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                            {relance.type === 'rappel' ? 'Rappel' :
                              relance.type === 'relance' ? `${relance.niveauRelance}ère relance` :
                                relance.type === 'mise_en_demeure' ? 'Mise en demeure' :
                                  'Recouvrement'}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${relance.priorite === 'critique' ? 'bg-red-200 text-red-800' :
                          relance.priorite === 'haute' ? 'bg-orange-200 text-orange-800' :
                            'bg-yellow-200 text-yellow-800'
                          }`}>
                          {relance.priorite}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 mb-3">{relance.message}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Montant:</span>
                          <span className="font-bold ml-2">{formatCurrency(relance.montant)}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Jours de retard:</span>
                          <span className="font-bold ml-2 text-red-600">{relance.joursRetard}j</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Canaux:</span>
                          <span className="font-medium ml-2">{relance.canaux.join(', ')}</span>
                        </div>
                        {relance.dateProchaineRelance && (
                          <div>
                            <span className="text-slate-600">Prochaine relance:</span>
                            <span className="font-medium ml-2">{new Date(relance.dateProchaineRelance).toLocaleDateString('fr-FR')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Actions Rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setIsAnalyseRentabiliteModalOpen(true)}
                className="flex items-center justify-center p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                <span className="font-semibold">Analyse de Rentabilité</span>
              </button>
              <button
                onClick={() => setIsPrevisionsRecouvrementModalOpen(true)}
                className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
              >
                <CalculatorIcon className="h-5 w-5 mr-2" />
                <span className="font-semibold">Prévisions Recouvrement</span>
              </button>
              <button
                onClick={() => setIsEscomptesModalOpen(true)}
                className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
              >
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                <span className="font-semibold">Propositions Escompte</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'rapports' && (
          <div className="space-y-6">
            {/* En-tête */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <ChartBarIcon className="h-7 w-7 text-slate-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Rapports de Facturation</h2>
                    <p className="text-slate-600">Analyses et statistiques de facturation</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
                  <DocumentArrowDownIcon className="h-5 w-5 inline mr-2" />
                  Exporter
                </button>
              </div>
            </div>

            {/* Message temporaire */}
            <div className="bg-slate-50 rounded-lg p-12 border border-slate-200 text-center">
              <ChartBarIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Rapports de Facturation</h3>
              <p className="text-slate-600">Les rapports de facturation seront affichés ici.</p>
              <p className="text-sm text-slate-500 mt-2">Utilisez le bouton "Exporter" pour générer des rapports personnalisés.</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* En-tête */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-cyan-100 rounded-lg">
                    <ChartPieIcon className="h-7 w-7 text-cyan-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Analytics de Facturation</h2>
                    <p className="text-slate-600">Analyses avancées et visualisations</p>
                  </div>
                </div>
              </div>
            </div>

            {/* KPIs principaux */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">CA Total</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">2,850,000 DZD</p>
                    <p className="text-xs text-emerald-600 mt-1">+15.2% vs mois dernier</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Factures</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">247</p>
                    <p className="text-xs text-emerald-600 mt-1">+8.5% vs mois dernier</p>
                  </div>
                  <div className="p-3 bg-cyan-100 rounded-lg">
                    <DocumentTextIcon className="h-6 w-6 text-cyan-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Panier Moyen</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">11,538 DZD</p>
                    <p className="text-xs text-emerald-600 mt-1">+6.2% vs mois dernier</p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Taux de Paiement</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">92.4%</p>
                    <p className="text-xs text-emerald-600 mt-1">+2.1% vs mois dernier</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Graphiques principaux */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Évolution CA */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Évolution du Chiffre d'Affaires</h3>
                <div className="space-y-3">
                  {[
                    { mois: 'Jan', montant: 2100000, pourcent: 70 },
                    { mois: 'Fév', montant: 2350000, pourcent: 78 },
                    { mois: 'Mar', montant: 2650000, pourcent: 88 },
                    { mois: 'Avr', montant: 2850000, pourcent: 95 }
                  ].map((data, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{data.mois} 2025</span>
                        <span className="font-bold text-slate-900">{formatCurrency(data.montant)}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                          className={`bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500 ${percentToWidth(data.pourcent)}`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Répartition par statut */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Répartition des Factures</h3>
                <div className="flex items-center justify-center mb-6">
                  <svg className="w-48 h-48" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#e2e8f0" strokeWidth="40" />
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#10b981" strokeWidth="40"
                      strokeDasharray="375 500" transform="rotate(-90 100 100)" />
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#f59e0b" strokeWidth="40"
                      strokeDasharray="63 500" strokeDashoffset="-375" transform="rotate(-90 100 100)" />
                    <circle cx="100" cy="100" r="80" fill="none" stroke="#ef4444" strokeWidth="40"
                      strokeDasharray="62 500" strokeDashoffset="-438" transform="rotate(-90 100 100)" />
                    <text x="100" y="95" textAnchor="middle" className="text-2xl font-bold" fill="#1e293b">247</text>
                    <text x="100" y="115" textAnchor="middle" className="text-sm" fill="#64748b">factures</text>
                  </svg>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">Payées</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">185 (75%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">En attente</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">37 (15%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-slate-600">En retard</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">25 (10%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top clients et produits */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Clients */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Top 5 Clients</h3>
                <div className="space-y-3">
                  {[
                    { nom: 'SARL DZ', ca: 450000, pourcent: 100 },
                    { nom: 'Entreprise ABC', ca: 380000, pourcent: 84 },
                    { nom: 'Société XYZ', ca: 320000, pourcent: 71 },
                    { nom: 'Groupe DEF', ca: 285000, pourcent: 63 },
                    { nom: 'Client GHI', ca: 240000, pourcent: 53 }
                  ].map((client, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{client.nom}</span>
                        <span className="font-bold text-slate-900">{formatCurrency(client.ca)}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`bg-gradient-to-r from-cyan-500 to-cyan-600 h-2 rounded-full ${client.pourcent >= 90 ? 'w-[95%]' :
                            client.pourcent >= 75 ? 'w-[80%]' :
                              client.pourcent >= 60 ? 'w-[60%]' :
                                client.pourcent >= 40 ? 'w-[40%]' :
                                  'w-[25%]'
                            }`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tendances hebdomadaires */}
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Hebdomadaire</h3>
                <div className="space-y-4">
                  {[
                    { jour: 'Lundi', factures: 42, montant: 485000, trend: 'up' },
                    { jour: 'Mardi', factures: 38, montant: 441000, trend: 'up' },
                    { jour: 'Mercredi', factures: 51, montant: 592000, trend: 'up' },
                    { jour: 'Jeudi', factures: 45, montant: 520000, trend: 'down' },
                    { jour: 'Vendredi', factures: 48, montant: 556000, trend: 'up' }
                  ].map((jour, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{jour.jour}</p>
                        <p className="text-xs text-slate-500">{jour.factures} factures</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-900">{formatCurrency(jour.montant)}</p>
                        <p className={`text-xs ${jour.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {jour.trend === 'up' ? '↗' : '↘'} {jour.trend === 'up' ? '+12%' : '-5%'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Prévisions */}
            <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-emerald-600" />
                Prévisions & Tendances
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-emerald-200">
                  <p className="text-sm text-slate-600 mb-2">Prévision Mai 2025</p>
                  <p className="text-2xl font-bold text-emerald-600">3,100,000 DZD</p>
                  <p className="text-xs text-slate-500 mt-1">+8.8% projeté</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-cyan-200">
                  <p className="text-sm text-slate-600 mb-2">Objectif Trimestriel</p>
                  <p className="text-2xl font-bold text-cyan-600">9,200,000 DZD</p>
                  <p className="text-xs text-slate-500 mt-1">92% atteint</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-amber-200">
                  <p className="text-sm text-slate-600 mb-2">Croissance Annuelle</p>
                  <p className="text-2xl font-bold text-amber-600">+18.5%</p>
                  <p className="text-xs text-slate-500 mt-1">vs année précédente</p>
                </div>
              </div>
            </div>
          </div>
        )}


        {activeTab === 'relances' && (
          <div className="space-y-6">
            {/* En-tête avec statistiques */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <ExclamationTriangleIcon className="h-7 w-7 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Gestion des Relances</h2>
                    <p className="text-slate-600">Suivez et gérez les impayés de vos clients</p>
                  </div>
                </div>
                <button
                  onClick={handleCreateRelance}
                  className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                  Nouvelle Relance
                </button>
              </div>
            </div>

            {/* Statistiques des relances */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Total Relances</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{relances.length}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatCurrency(relances.reduce((sum: number, r: any) => sum + r.montant, 0))} en attente
                    </p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">En Attente</p>
                    <p className="text-2xl font-bold text-amber-600 mt-1">
                      {relances.filter((r: any) => r.statut === 'En attente').length}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Relances à traiter</p>
                  </div>
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Urgentes</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {relances.filter((r: any) => r.statut === 'Urgent').length}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Action immédiate</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Communications</p>
                    <p className="text-2xl font-bold text-cyan-600 mt-1">{communications.length}</p>
                    <p className="text-xs text-slate-500 mt-1">Messages envoyés</p>
                  </div>
                  <div className="p-3 bg-cyan-100 rounded-lg">
                    <EnvelopeIcon className="h-6 w-6 text-cyan-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Liste des relances */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Relances en Cours</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Relance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Facture
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                        Type
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
                    {relances.map((relance: any) => (
                      <tr key={relance.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">{relance.numero}</div>
                          <div className="text-sm text-slate-500">{relance.dateRelance}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900">{relance.client}</div>
                          <div className="text-sm text-slate-500">{relance.contact}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {relance.facture}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-slate-900">{formatCurrency(relance.montant)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {relance.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-lg border ${relance.couleur.replace('bg-amber-100 text-amber-800', 'bg-amber-100 text-amber-700 border-amber-300').replace('bg-orange-100 text-orange-800', 'bg-amber-100 text-amber-700 border-amber-300').replace('bg-red-100 text-red-800', 'bg-red-100 text-red-700 border-red-300')}`}>
                            {relance.statut}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewRelance(relance)}
                              className="inline-flex items-center px-2 py-1 bg-cyan-100 text-cyan-600 rounded hover:bg-cyan-200 transition-colors"
                            >
                              Voir
                            </button>
                            <button
                              onClick={() => handleSendCommunication(relance, 'Email')}
                              className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200 transition-colors"
                            >
                              Email
                            </button>
                            <button
                              onClick={() => handleSendCommunication(relance, 'Appel téléphonique')}
                              className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors"
                            >
                              Appel
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Communications récentes */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
              <div className="px-6 py-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Communications Récentes</h3>
              </div>
              <div className="p-6 space-y-3">
                {communications.slice(0, 3).map((communication: any) => (
                  <div key={communication.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${communication.type === 'Email' ? 'bg-cyan-100' : communication.type === 'Appel téléphonique' ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                          {communication.type === 'Email' ? (
                            <EnvelopeIcon className="h-5 w-5 text-cyan-600" />
                          ) : communication.type === 'Appel téléphonique' ? (
                            <PhoneIcon className="h-5 w-5 text-emerald-600" />
                          ) : (
                            <DocumentTextIcon className="h-5 w-5 text-slate-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-900">{communication.sujet}</h4>
                          <p className="text-sm text-slate-500">{communication.client} • {communication.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-lg border ${communication.statut === 'Envoyé' ? 'bg-cyan-100 text-cyan-700 border-cyan-300' :
                          communication.statut === 'Effectué' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                            'bg-amber-100 text-amber-700 border-amber-300'
                          }`}>
                          {communication.statut}
                        </span>
                        <button
                          onClick={() => handleViewCommunication(communication)}
                          className="inline-flex items-center px-2 py-1 bg-cyan-100 text-cyan-600 rounded hover:bg-cyan-200 transition-colors text-sm"
                        >
                          Voir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}


        {activeTab === 'rapports' && (
          <div className="space-y-8">
            {/* En-tête avec actions */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl p-3">
                    <ChartBarIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800">Rapports de Ventes</h1>
                    <p className="text-slate-600">Analysez vos performances commerciales et générez des rapports détaillés</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleExportReport}
                    className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all duration-200"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                    Exporter
                  </button>
                  <button
                    onClick={handleNewReport}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all duration-200"
                  >
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    Nouveau Rapport
                  </button>
                </div>
              </div>
            </div>

            {/* Filtres de période */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Période :</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePeriodChange('7j')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${selectedPeriod === '7j'
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    7j
                  </button>
                  <button
                    onClick={() => handlePeriodChange('30j')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${selectedPeriod === '30j'
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    30j
                  </button>
                  <button
                    onClick={() => handlePeriodChange('3M')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${selectedPeriod === '3M'
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    3M
                  </button>
                  <button
                    onClick={() => handlePeriodChange('1A')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${selectedPeriod === '1A'
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    1A
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-600">Du :</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="px-3 py-1 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    aria-label="Date de début"
                    title="Date de début"
                  />
                  <span className="text-sm text-slate-600">Au :</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="px-3 py-1 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    aria-label="Date de fin"
                    title="Date de fin"
                  />
                </div>
              </div>
            </div>

            {/* Résumé exécutif */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Chiffre d'Affaires Total</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{formatReportCurrency(getReportData().chiffreAffaires)}</p>
                    <p className="text-xs text-emerald-600 mt-1">+{getReportData().evolutionCA}% vs période précédente</p>
                  </div>
                  <div className="bg-emerald-50 rounded-full p-3">
                    <CurrencyDollarIcon className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Nombre de Factures</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{getReportData().nombreFactures}</p>
                    <p className="text-xs text-emerald-600 mt-1">+{getReportData().evolutionFactures}% vs période précédente</p>
                  </div>
                  <div className="bg-blue-50 rounded-full p-3">
                    <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Panier Moyen</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{formatReportCurrency(getReportData().panierMoyen)}</p>
                    <p className="text-xs text-emerald-600 mt-1">+{getReportData().evolutionPanier}% vs période précédente</p>
                  </div>
                  <div className="bg-amber-50 rounded-full p-3">
                    <ChartBarIcon className="h-8 w-8 text-amber-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Taux de Conversion</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{getReportData().tauxConversion}%</p>
                    <p className="text-xs text-emerald-600 mt-1">+{getReportData().evolutionConversion}% vs période précédente</p>
                  </div>
                  <div className="bg-purple-50 rounded-full p-3">
                    <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Section Rapports de Facturation */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Rapports de Facturation
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Analyses et statistiques de facturation
                  </p>
                </div>
                <button
                  onClick={() => handleExportReport()}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-200 shadow-sm flex items-center gap-2"
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  Exporter
                </button>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                <DocumentTextIcon className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  Les rapports de facturation seront affichés ici.
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500">
                  Utilisez le bouton "Exporter" pour générer des rapports personnalisés.
                </p>
              </div>
            </Card>

            {/* Section Rapports de Ventes */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Rapports de Ventes
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Analysez vos performances commerciales et générez des rapports détaillés
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExportReport()}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    Exporter
                  </button>
                  <button
                    onClick={() => setIsNewReportModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Nouveau Rapport
                  </button>
                </div>
              </div>

              {/* Sélecteur de période et dates */}
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Période :</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: '7j', name: '7j' },
                      { id: '30j', name: '30j' },
                      { id: '3M', name: '3M' },
                      { id: '1A', name: '1A' }
                    ].map(period => (
                      <button
                        key={period.id}
                        onClick={() => handlePeriodChange(period.id as '7j' | '30j' | '3M' | '1A')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selectedPeriod === period.id
                          ? 'bg-slate-700 text-white shadow-md'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                          }`}
                      >
                        {period.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Du :</span>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500"
                        aria-label="Date de début"
                        placeholder="Date de début"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Au :</span>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500"
                        aria-label="Date de fin"
                        placeholder="Date de fin"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* KPIs Principaux */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-emerald-700 dark:text-emerald-300 text-sm font-semibold uppercase tracking-wide mb-2">Chiffre d'Affaires Total</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{formatReportCurrency(getReportData().chiffreAffaires)}</p>
                      <div className="flex items-center text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                        <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                        <span>+{getReportData().evolutionCA}% vs période précédente</span>
                      </div>
                    </div>
                    <div className="bg-emerald-600 rounded-xl p-3 shadow-lg">
                      <CurrencyDollarIcon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-blue-700 dark:text-blue-300 text-sm font-semibold uppercase tracking-wide mb-2">Nombre de Factures</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{getReportData().nombreFactures}</p>
                      <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                        <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                        <span>+{getReportData().evolutionFactures}% vs période précédente</span>
                      </div>
                    </div>
                    <div className="bg-blue-600 rounded-xl p-3 shadow-lg">
                      <DocumentTextIcon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border-2 border-purple-200 dark:border-purple-800 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-purple-700 dark:text-purple-300 text-sm font-semibold uppercase tracking-wide mb-2">Panier Moyen</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{formatReportCurrency(getReportData().panierMoyen)}</p>
                      <div className="flex items-center text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
                        <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                        <span>+{getReportData().evolutionPanier}% vs période précédente</span>
                      </div>
                    </div>
                    <div className="bg-purple-600 rounded-xl p-3 shadow-lg">
                      <BanknotesIcon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl border-2 border-amber-200 dark:border-amber-800 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-amber-700 dark:text-amber-300 text-sm font-semibold uppercase tracking-wide mb-2">Taux de Conversion</p>
                      <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">{getReportData().tauxConversion}%</p>
                      <div className="flex items-center text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                        <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                        <span>+{getReportData().evolutionConversion}% vs période précédente</span>
                      </div>
                    </div>
                    <div className="bg-amber-600 rounded-xl p-3 shadow-lg">
                      <ChartBarIcon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Graphiques principaux */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Évolution des Ventes */}
              <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-slate-50 rounded-full p-3 mr-4">
                      <ArrowTrendingUpIcon className="h-6 w-6 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-800">Évolution des Ventes</h3>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs bg-slate-100 text-slate-700 rounded-full">6M</button>
                    <button className="px-3 py-1 text-xs bg-slate-600 text-white rounded-full">1A</button>
                  </div>
                </div>
                <LineChart
                  labels={['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']}
                  data={[120000, 150000, 180000, 160000, 200000, 220000, 240000, 210000, 260000, 280000, 300000, 320000]}
                  borderColor="rgba(51, 65, 85, 1)"
                  backgroundColor="rgba(51, 65, 85, 0.1)"
                  title="Évolution des Ventes (DZD)"
                />
              </div>

              {/* Répartition par Statut */}
              <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center mb-6">
                  <div className="bg-emerald-50 rounded-full p-3 mr-4">
                    <ChartPieIcon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">Répartition par Statut</h3>
                </div>
                <DoughnutChart
                  labels={['Payées', 'En attente', 'Brouillons', 'Annulées']}
                  data={[156, 23, 12, 4]}
                  colors={['rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(107, 114, 128, 0.8)', 'rgba(239, 68, 68, 0.8)']}
                  title="Répartition par Statut"
                />
              </div>
            </div>

            {/* Graphiques secondaires */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Évolution des Factures */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-slate-50 rounded-full p-3 mr-4">
                      <ArrowTrendingUpIcon className="h-6 w-6 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Évolution des Factures</h3>
                  </div>
                  <div className="flex space-x-1">
                    <button className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded">7j</button>
                    <button className="px-2 py-1 text-xs bg-slate-600 text-white rounded">30j</button>
                  </div>
                </div>
                <div className="h-32 bg-slate-50 rounded-lg p-3">
                  <div className="flex items-end justify-between h-full space-x-1">
                    {[45, 48, 52, 55, 58, 62, 68, 72, 75, 78, 82, 85, 88, 90, 92, 95, 98, 100, 105, 108, 110, 112, 115, 118, 120, 125, 128, 130, 135, 138].map((h, index) => (
                      <div
                        key={index}
                        className={`bg-slate-600 rounded-sm flex-1 hover:bg-slate-700 transition-colors ${h === 45 ? 'h-[45%]' : h === 48 ? 'h-[48%]' : h === 52 ? 'h-[52%]' :
                          h === 55 ? 'h-[55%]' : h === 58 ? 'h-[58%]' : h === 62 ? 'h-[62%]' :
                            h === 68 ? 'h-[68%]' : h === 72 ? 'h-[72%]' : h === 75 ? 'h-[75%]' :
                              h === 78 ? 'h-[78%]' : h === 82 ? 'h-[82%]' : h === 85 ? 'h-[85%]' :
                                h === 88 ? 'h-[88%]' : h === 90 ? 'h-[90%]' : h === 92 ? 'h-[92%]' :
                                  h === 95 ? 'h-[95%]' : h === 98 ? 'h-[98%]' : h === 100 ? 'h-[100%]' :
                                    h === 105 ? 'h-[105%]' : h === 108 ? 'h-[108%]' : h === 110 ? 'h-[110%]' :
                                      h === 112 ? 'h-[112%]' : h === 115 ? 'h-[115%]' : h === 118 ? 'h-[118%]' :
                                        h === 120 ? 'h-[120%]' : h === 125 ? 'h-[125%]' : h === 128 ? 'h-[128%]' :
                                          h === 130 ? 'h-[130%]' : h === 135 ? 'h-[135%]' : 'h-[138%]'
                          }`}
                        title={`Jour ${index + 1}: ${h} factures`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Répartition par Statut */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center mb-6">
                  <div className="bg-emerald-50 rounded-full p-3 mr-4">
                    <ChartPieIcon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Répartition par Statut</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                      <span className="text-sm text-slate-600">Payées</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{facturesPayees}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                      <span className="text-sm text-slate-600">En Attente</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{facturesEnAttente}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-slate-500 rounded-full mr-2"></div>
                      <span className="text-sm text-slate-600">Brouillons</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{totalFactures - facturesPayees - facturesEnAttente}</span>
                  </div>
                </div>
                <div className="mt-4 h-20 bg-slate-50 rounded-lg p-2">
                  <div className="flex h-full">
                    <div
                      className={`bg-emerald-500 rounded-l-lg ${percentToWidth((facturesPayees / totalFactures) * 100)}`}
                    ></div>
                    <div
                      className={`bg-amber-500 ${percentToWidth((facturesEnAttente / totalFactures) * 100)}`}
                    ></div>
                    <div
                      className={`bg-slate-500 rounded-r-lg ${percentToWidth(((totalFactures - facturesPayees - facturesEnAttente) / totalFactures) * 100)}`}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Performance Mensuelle */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center mb-6">
                  <div className="bg-purple-50 rounded-full p-3 mr-4">
                    <ChartBarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Performance Mensuelle</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { month: 'Jan', target: 50, actual: 45, color: 'bg-red-500' },
                    { month: 'Fév', target: 55, actual: 52, color: 'bg-amber-500' },
                    { month: 'Mar', target: 60, actual: 58, color: 'bg-amber-500' },
                    { month: 'Avr', target: 65, actual: 68, color: 'bg-emerald-500' },
                    { month: 'Mai', target: 70, actual: 72, color: 'bg-emerald-500' },
                    { month: 'Jun', target: 75, actual: 78, color: 'bg-emerald-500' }
                  ].map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">{item.month}</span>
                        <span className="text-slate-800 font-medium">{item.actual}/{item.target}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${item.color} ${percentToWidth(Math.min((item.actual / item.target) * 100, 100))}`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Graphiques supplémentaires */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Top Clients */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-50 rounded-full p-3 mr-4">
                    <UserGroupIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Top 5 Clients</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Entreprise ABC', amount: '450K DZD', percentage: 16 },
                    { name: 'Société XYZ', amount: '380K DZD', percentage: 14 },
                    { name: 'Groupe DEF', amount: '320K DZD', percentage: 11 },
                    { name: 'Compagnie GHI', amount: '280K DZD', percentage: 10 },
                    { name: 'Firme JKL', amount: '250K DZD', percentage: 9 }
                  ].map((client, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{client.name}</p>
                        <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                          <div
                            className={`bg-slate-600 h-2 rounded-full ${percentToWidth(client.percentage)}`}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-slate-600 ml-4">{client.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Évolution Mensuelle */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center mb-6">
                  <div className="bg-purple-50 rounded-full p-3 mr-4">
                    <ChartBarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Ventes Mensuelles</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { month: 'Jan', amount: 120000, target: 150000 },
                    { month: 'Fév', amount: 150000, target: 150000 },
                    { month: 'Mar', amount: 180000, target: 160000 },
                    { month: 'Avr', amount: 160000, target: 160000 },
                    { month: 'Mai', amount: 200000, target: 180000 },
                    { month: 'Jun', amount: 220000, target: 180000 }
                  ].map((month, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">{month.month}</span>
                        <span className="text-slate-800 font-medium">{formatCurrency(month.amount)}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${month.amount >= month.target ? 'bg-emerald-500' : 'bg-amber-500'} ${percentToWidth(Math.min((month.amount / month.target) * 100, 100))}`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Métriques de Performance */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center mb-6">
                  <div className="bg-amber-50 rounded-full p-3 mr-4">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">Métriques Clés</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-emerald-800">Taux de Conversion</p>
                      <p className="text-xs text-emerald-600">Devis → Factures</p>
                    </div>
                    <span className="text-lg font-bold text-emerald-800">78%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Délai Moyen</p>
                      <p className="text-xs text-blue-600">Paiement</p>
                    </div>
                    <span className="text-lg font-bold text-blue-800">12j</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Satisfaction</p>
                      <p className="text-xs text-purple-600">Clients</p>
                    </div>
                    <span className="text-lg font-bold text-purple-800">4.8/5</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-amber-800">Croissance</p>
                      <p className="text-xs text-amber-600">Mensuelle</p>
                    </div>
                    <span className="text-lg font-bold text-amber-800">+15%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'livraisons' && (
          <div className="space-y-6">
            {/* Statistiques des livraisons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Total Livraisons</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">{totalLivraisons}</p>
                    <p className="text-xs text-slate-500 mt-1">Ce mois</p>
                  </div>
                  <div className="bg-blue-50 rounded-full p-3">
                    <TruckIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Livrées</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">{livraisonsLivrees}</p>
                    <p className="text-xs text-emerald-600 mt-1">{Math.round((livraisonsLivrees / totalLivraisons) * 100)}% de réussite</p>
                  </div>
                  <div className="bg-emerald-50 rounded-full p-3">
                    <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">En Transit</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{livraisonsEnTransit}</p>
                    <p className="text-xs text-blue-600 mt-1">En cours</p>
                  </div>
                  <div className="bg-blue-50 rounded-full p-3">
                    <ClockIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium">Retardées</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">{livraisonsRetardees}</p>
                    <p className="text-xs text-red-600 mt-1">{Math.round((livraisonsRetardees / totalLivraisons) * 100)}% de retard</p>
                  </div>
                  <div className="bg-red-50 rounded-full p-3">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Indicateurs de performance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Frais Transport Total</p>
                    <p className="text-xl font-bold text-purple-600">{formatCurrency(totalFraisTransport)}</p>
                    <p className="text-xs text-gray-500">Coût moyen: {formatCurrency(totalFraisTransport / totalLivraisons)}</p>
                  </div>
                  <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Taux de Ponctualité</p>
                    <p className="text-xl font-bold text-green-600">
                      {Math.round(((livraisonsLivrees - livraisonsRetardees) / totalLivraisons) * 100)}%
                    </p>
                    <p className="text-xs text-gray-500">Livraisons à l'heure</p>
                  </div>
                  <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Poids Total Livré</p>
                    <p className="text-xl font-bold text-orange-600">
                      {livraisons.filter(l => l.statut === 'livree').reduce((sum, l) => sum + l.poids, 0)} kg
                    </p>
                    <p className="text-xs text-gray-500">Volume: {livraisons.filter(l => l.statut === 'livree').reduce((sum, l) => sum + l.volume, 0).toFixed(1)} m³</p>
                  </div>
                  <ChartBarIcon className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Tableau des livraisons */}
            <Card title="Suivi des Livraisons">
              <div className="space-y-4">
                {/* Filtres et actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                  <div className="flex space-x-4">
                    <select
                      aria-label="Filtrer les livraisons par statut"
                      value={filterLivraisonStatus}
                      onChange={(e) => setFilterLivraisonStatus(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                    >
                      <option value="tous">Tous les statuts</option>
                      <option value="preparation">En Préparation</option>
                      <option value="en_transit">En Transit</option>
                      <option value="livree">Livrées</option>
                      <option value="retardee">Retardées</option>
                      <option value="annulee">Annulées</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Rechercher par N° livraison ou client..."
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 text-sm w-64"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => info(
                        'Export en cours',
                        'Génération du fichier d\'export des livraisons...',
                        [
                          `Nombre de livraisons: ${livraisons.length}`,
                          'Format: Excel (.xlsx)',
                          'Le fichier sera téléchargé automatiquement une fois prêt.'
                        ]
                      )}
                      className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                      Exporter
                    </button>
                    <button
                      onClick={() => info(
                        'Rapport en cours',
                        'Génération du rapport de livraisons...',
                        [
                          'Le rapport contient toutes les statistiques de livraisons.',
                          'Format: PDF',
                          'Le fichier sera téléchargé automatiquement une fois prêt.'
                        ]
                      )}
                      className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                    >
                      <ChartBarIcon className="h-4 w-4 mr-2" />
                      Rapport
                    </button>
                  </div>
                </div>

                {/* Table des livraisons */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          N° Livraison
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Date Commande
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Date Livraison
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Transporteur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Frais Transport
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {livraisons
                        .filter(livraison =>
                          filterLivraisonStatus === 'tous' || livraison.statut === filterLivraisonStatus
                        )
                        .map((livraison) => (
                          <tr key={livraison.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {livraison.numero}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{livraison.client}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {new Date(livraison.dateCommande).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div>
                                <div className="text-xs text-gray-500">Prévue: {new Date(livraison.dateLivraisonPrevue).toLocaleDateString('fr-FR')}</div>
                                {livraison.dateLivraisonReelle && (
                                  <div className="text-xs text-green-600">Réelle: {new Date(livraison.dateLivraisonReelle).toLocaleDateString('fr-FR')}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div>
                                <div className="font-medium">{livraison.transporteur}</div>
                                <div className="text-xs text-gray-500">{livraison.numeroSuivi}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLivraisonStatusColor(livraison.statut)}`}>
                                {getLivraisonStatusText(livraison.statut)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {formatCurrency(livraison.fraisTransport)}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleViewLivraisonDetails(livraison)}
                                  className="text-slate-600 hover:text-slate-800"
                                  title="Voir détails"
                                >
                                  <EyeIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleTrackLivraison(livraison)}
                                  className="text-emerald-600 hover:text-emerald-800"
                                  title="Suivre livraison"
                                >
                                  <TruckIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleContactClient(livraison)}
                                  className="text-purple-600 hover:text-purple-800"
                                  title="Contacter client"
                                >
                                  <PhoneIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleUpdateLivraisonStatus(livraison, 'livree')}
                                  className="text-amber-600 hover:text-amber-800"
                                  title="Mettre à jour statut"
                                >
                                  <CheckCircleIcon className="h-5 w-5" />
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

        {/* Modal Nouvelle Facture */}
        <Modal
          isOpen={isNouvelleFactureModalOpen}
          onClose={() => setIsNouvelleFactureModalOpen(false)}
          title="Nouvelle Facture"
          size="xl"
        >
          <div className="max-h-[95vh] overflow-y-auto p-6">
            <form className="space-y-6 max-w-7xl mx-auto">
              {/* En-tête d'entreprise - Style épuré */}
              <div className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-slate-200">
                        <span className="text-2xl font-bold text-slate-700">D</span>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">DINARLYTIC SOLUTIONS</h2>
                        <p className="text-slate-600 text-sm mt-1">Solutions Financières Intelligentes</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-slate-400" />
                        <span>123 Avenue de la République, Alger 16000</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PhoneIcon className="h-4 w-4 text-slate-400" />
                        <span>+213 21 12 34 56</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                        <span>contact@dinarlytic.dz</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">NIF:</span>
                        <span className="font-medium">123456789012345</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">RC:</span>
                        <span className="font-medium">12B123456</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-full lg:w-auto">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                      <div className="space-y-4">
                        {/* Sélecteur Type de Document */}
                        <div>
                          <label htmlFor="fv-type-document" className="block text-xs font-medium text-slate-600 mb-2">
                            Type de document
                          </label>
                          <select
                            id="fv-type-document"
                            value={nouvelleFacture.typeDocument}
                            onChange={(e) => {
                              const newType = e.target.value;
                              const timestamp = Date.now();
                              const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                              const newNumero = newType === 'devis'
                                ? `DEV-2024-${String(timestamp).slice(-6)}${randomSuffix}`
                                : `FAC-2024-${String(timestamp).slice(-6)}${randomSuffix}`;
                              setNouvelleFacture((prev: any) => ({
                                ...prev,
                                typeDocument: newType,
                                numero: newNumero
                              }));
                            }}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="facture">Facture</option>
                            <option value="devis">Devis</option>
                          </select>
                        </div>

                        {/* Sélecteur Devise */}
                        <div>
                          <label htmlFor="fv-devise" className="block text-xs font-medium text-slate-600 mb-2">
                            Devise
                          </label>
                          <select
                            id="fv-devise"
                            value={nouvelleFacture.devise}
                            onChange={(e) => {
                              const newDevise = e.target.value;
                              setNouvelleFacture((prev: any) => ({ ...prev, devise: newDevise }));
                              setCurrentDevise(newDevise as any);
                            }}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="DZD">DZD (دج)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="USD">USD ($)</option>
                          </select>
                        </div>

                        <div className="pt-3 border-t border-slate-200">
                          <div className="text-center">
                            <h3 className="text-lg font-bold text-slate-900 mb-1">
                              {nouvelleFacture.typeDocument === 'devis' ? 'DEVIS' : 'FACTURE'}
                            </h3>
                            <p className="text-sm text-slate-600 font-medium">
                              N° {nouvelleFacture.numero || (nouvelleFacture.typeDocument === 'devis' ? 'DEV-AUTO' : 'FAC-AUTO')}
                            </p>
                            <p className="text-xs text-slate-500 mt-2">
                              {nouvelleFacture.date ? new Date(nouvelleFacture.date).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations de facturation */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Informations client */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-200">
                    Facturer à
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fv-client-select" className="block text-sm font-medium text-slate-700 mb-2">
                        Client *
                      </label>
                      <select
                        id="fv-client-select"
                        value={nouvelleFacture.client}
                        onChange={(e) => setNouvelleFacture((prev: any) => ({ ...prev, client: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                        required
                      >
                        <option value="">Sélectionner un client</option>
                        {mockClients.map(client => (
                          <option key={client.id} value={client.id}>{client.nom}</option>
                        ))}
                      </select>
                    </div>
                    {nouvelleFacture.client && (
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        {(() => {
                          const selectedClient = mockClients.find(c => c.id === nouvelleFacture.client);
                          return selectedClient ? (
                            <div className="text-sm text-slate-700 space-y-2">
                              <p className="font-semibold text-slate-900">{selectedClient.nom}</p>
                              <p className="flex items-center gap-2 text-slate-600">
                                <MapPinIcon className="h-4 w-4 text-slate-400" />
                                {selectedClient.adresse}
                              </p>
                              <p className="flex items-center gap-2 text-slate-600">
                                <PhoneIcon className="h-4 w-4 text-slate-400" />
                                {selectedClient.telephone}
                              </p>
                              <p className="flex items-center gap-2 text-slate-600">
                                <EnvelopeIcon className="h-4 w-4 text-slate-400" />
                                {selectedClient.email}
                              </p>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Informations de facture */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-200">
                    Détails de la facture
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="fv-date-facture" className="block text-sm font-medium text-slate-700 mb-2">
                          Date de facture *
                        </label>
                        <input
                          id="fv-date-facture"
                          type="date"
                          value={nouvelleFacture.date}
                          onChange={(e) => setNouvelleFacture((prev: any) => ({ ...prev, date: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="fv-date-echeance" className="block text-sm font-medium text-slate-700 mb-2">
                          Date d'échéance
                        </label>
                        <input
                          id="fv-date-echeance"
                          type="date"
                          value={nouvelleFacture.dateEcheance}
                          onChange={(e) => setNouvelleFacture((prev: any) => ({ ...prev, dateEcheance: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="fv-conditions-paiement" className="block text-sm font-medium text-slate-700 mb-2">
                          Conditions de paiement
                        </label>
                        <select
                          id="fv-conditions-paiement"
                          value={nouvelleFacture.conditionPaiement}
                          onChange={(e) => setNouvelleFacture((prev: any) => ({ ...prev, conditionPaiement: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors"
                        >
                          <option value="0">Comptant</option>
                          <option value="7">7 jours</option>
                          <option value="15">15 jours</option>
                          <option value="30">30 jours</option>
                          <option value="45">45 jours</option>
                          <option value="60">60 jours</option>
                          <option value="90">90 jours</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="fv-reference" className="block text-sm font-medium text-slate-700 mb-2">
                          Référence
                        </label>
                        <input
                          id="fv-reference"
                          type="text"
                          value={nouvelleFacture.reference}
                          onChange={(e) => setNouvelleFacture((prev: any) => ({ ...prev, reference: e.target.value }))}
                          placeholder="Réf. commande, devis..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Articles */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-slate-200">
                  <h3 className="text-base font-semibold text-slate-900">
                    Articles et Services
                  </h3>
                  <div className="text-sm text-slate-600 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg font-medium mt-2 sm:mt-0">
                    {nouvelleFacture.articles.length} article(s) ajouté(s)
                  </div>
                </div>

                {/* Formulaire d'ajout d'article */}
                <div className="bg-slate-50 rounded-lg p-5 mb-6 border border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4">
                    Ajouter un article
                  </h4>

                  {/* Version mobile - Stack vertical */}
                  <div className="block lg:hidden space-y-4">
                    <div>
                      <label htmlFor="fv-article-mobile" className="block text-sm font-medium text-slate-700 mb-2">Article/Service</label>
                      <select
                        id="fv-article-mobile"
                        value={articleEnCours.article}
                        onChange={(e) => {
                          const selectedProduct = products.find(p => p.id === e.target.value);
                          if (selectedProduct) {
                            setArticleEnCours({
                              article: e.target.value,
                              description: '',
                              prixUnitaire: selectedProduct.prixUnitaire,
                              quantite: 1,
                              tva: 20,
                              remise: 0,
                              total: selectedProduct.prixUnitaire
                            });
                          } else {
                            setArticleEnCours({
                              article: '',
                              description: '',
                              prixUnitaire: 0,
                              quantite: 1,
                              tva: 20,
                              remise: 0,
                              total: 0
                            });
                          }
                        }}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                      >
                        <option value="">Sélectionner un article</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nom} - {formatCurrency(p.prixUnitaire)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="fv-article-mobile-prix" className="block text-sm font-medium text-slate-700 mb-2">Prix Unit.</label>
                        <input
                          id="fv-article-mobile-prix"
                          type="number"
                          value={articleEnCours.prixUnitaire}
                          onChange={(e) => handleArticleChange('prixUnitaire', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div>
                        <label htmlFor="fv-article-mobile-quantite" className="block text-sm font-medium text-slate-700 mb-2">Quantité</label>
                        <input
                          id="fv-article-mobile-quantite"
                          type="number"
                          value={articleEnCours.quantite}
                          onChange={(e) => handleArticleChange('quantite', parseInt(e.target.value) || 1)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                          placeholder="1"
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="fv-article-mobile-remise" className="block text-sm font-medium text-slate-700 mb-2">Remise %</label>
                        <input
                          id="fv-article-mobile-remise"
                          type="number"
                          value={articleEnCours.remise}
                          onChange={(e) => handleArticleChange('remise', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                          placeholder="0"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                      </div>
                      <div>
                        <label htmlFor="fv-article-mobile-total" className="block text-sm font-medium text-slate-700 mb-2">Total</label>
                        <input
                          id="fv-article-mobile-total"
                          type="text"
                          value={formatCurrency(articleEnCours.total)}
                          className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleAddArticle}
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Ajouter
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // Test: ajouter un article de test
                          const testArticle = {
                            id: Date.now(),
                            nom: 'Test Article',
                            description: 'Article de test',
                            prixUnitaire: 1500,
                            quantite: 12,
                            remise: 5,
                            total: 17100
                          };
                          setNouvelleFacture((prev: any) => ({
                            ...prev,
                            articles: [...prev.articles, testArticle]
                          }));
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Test
                      </button>
                      <button
                        type="button"
                        onClick={() => setArticleEnCours({
                          article: '',
                          description: '',
                          prixUnitaire: 0,
                          quantite: 1,
                          tva: 20,
                          remise: 0,
                          total: 0
                        })}
                        className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                        aria-label="Réinitialiser l'article en cours"
                        title="Réinitialiser l'article en cours"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Version desktop - Grid horizontal */}
                  <div className="hidden lg:block">
                    <div className="grid grid-cols-12 gap-3 text-sm font-medium text-slate-700 mb-4">
                      <div className="col-span-4">Article/Service</div>
                      <div className="col-span-2">Prix Unit.</div>
                      <div className="col-span-1">Qté</div>
                      <div className="col-span-1">Remise %</div>
                      <div className="col-span-2">Total</div>
                      <div className="col-span-2">Actions</div>
                    </div>

                    <div className="grid grid-cols-12 gap-3">
                      <select
                        aria-label="Article ou Service"
                        value={articleEnCours.article}
                        onChange={(e) => {
                          const selectedProduct = products.find(p => p.id === e.target.value);
                          if (selectedProduct) {
                            setArticleEnCours({
                              article: e.target.value,
                              description: '',
                              prixUnitaire: selectedProduct.prixUnitaire,
                              quantite: 1,
                              tva: 20,
                              remise: 0,
                              total: selectedProduct.prixUnitaire
                            });
                          } else {
                            setArticleEnCours({
                              article: '',
                              description: '',
                              prixUnitaire: 0,
                              quantite: 1,
                              tva: 20,
                              remise: 0,
                              total: 0
                            });
                          }
                        }}
                        className="col-span-4 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                      >
                        <option value="">Sélectionner un article</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.nom} - {formatCurrency(p.prixUnitaire)}
                          </option>
                        ))}
                      </select>
                      <input
                        aria-label="Prix unitaire"
                        type="number"
                        value={articleEnCours.prixUnitaire}
                        onChange={(e) => handleArticleChange('prixUnitaire', parseFloat(e.target.value) || 0)}
                        className="col-span-2 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                      />
                      <input
                        aria-label="Quantité"
                        type="number"
                        value={articleEnCours.quantite}
                        onChange={(e) => handleArticleChange('quantite', parseInt(e.target.value) || 1)}
                        className="col-span-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                        placeholder="1"
                        min="1"
                      />
                      <input
                        aria-label="Remise en pourcentage"
                        type="number"
                        value={articleEnCours.remise}
                        onChange={(e) => handleArticleChange('remise', parseFloat(e.target.value) || 0)}
                        className="col-span-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                        placeholder="0"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <input
                        aria-label="Total"
                        type="text"
                        value={formatCurrency(articleEnCours.total)}
                        className="col-span-2 px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-700 font-medium"
                        readOnly
                      />
                      <div className="col-span-2 flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddArticle}
                          className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center"
                          title="Ajouter l'article"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setArticleEnCours({
                            article: '',
                            description: '',
                            prixUnitaire: 0,
                            quantite: 1,
                            tva: 20,
                            remise: 0,
                            total: 0
                          })}
                          className="px-3 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors"
                          title="Effacer"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Description optionnelle */}
                  {articleEnCours.article && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Description (optionnelle)
                      </label>
                      <textarea
                        value={articleEnCours.description}
                        onChange={(e) => handleArticleChange('description', e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                        rows={2}
                        placeholder="Description détaillée de l'article ou service..."
                      />
                    </div>
                  )}
                </div>

                {/* Liste des articles ajoutés */}
                {nouvelleFacture.articles.length > 0 && (
                  <div className="space-y-3">
                    {/* En-tête desktop */}
                    <div className="hidden lg:grid grid-cols-12 gap-3 text-sm font-medium text-slate-700 bg-slate-800 text-white p-4 rounded-lg">
                      <div className="col-span-4">Article/Service</div>
                      <div className="col-span-2">Prix Unit.</div>
                      <div className="col-span-1">Qté</div>
                      <div className="col-span-1">Remise %</div>
                      <div className="col-span-2">Total</div>
                      <div className="col-span-2">Actions</div>
                    </div>

                    {nouvelleFacture.articles.map((article: any) => (
                      <div key={article.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors shadow-sm">
                        {/* Version mobile */}
                        <div className="block lg:hidden space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="text-slate-800 font-medium">{article.nom}</div>
                              {(article as any)?.description && (
                                <div className="text-xs text-slate-500 mt-1">{(article as any).description}</div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-slate-800">{formatCurrency((article as any).total)}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label htmlFor={`fv-article-prix-${article.id}`} className="block text-xs text-slate-500 mb-1">Prix Unit.</label>
                              <input
                                id={`fv-article-prix-${article.id}`}
                                type="number"
                                value={(article as any).prixUnitaire}
                                onChange={(e) => handleUpdateArticle(article.id, 'prixUnitaire', parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                step="0.01"
                                min="0"
                              />
                            </div>
                            <div>
                              <label htmlFor={`fv-article-quantite-${article.id}`} className="block text-xs text-slate-500 mb-1">Quantité</label>
                              <input
                                id={`fv-article-quantite-${article.id}`}
                                type="number"
                                value={(article as any).quantite}
                                onChange={(e) => handleUpdateArticle(article.id, 'quantite', parseInt(e.target.value) || 1)}
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                min="1"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label htmlFor={`fv-article-remise-${article.id}`} className="block text-xs text-slate-500 mb-1">Remise %</label>
                              <input
                                id={`fv-article-remise-${article.id}`}
                                type="number"
                                value={(article as any).remise}
                                onChange={(e) => handleUpdateArticle(article.id, 'remise', parseFloat(e.target.value) || 0)}
                                className="w-full px-2 py-1 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                min="0"
                                max="100"
                                step="0.1"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleRemoveArticle(article.id)}
                                className="flex-1 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center text-sm"
                              >
                                <TrashIcon className="h-4 w-4 mr-1" />
                                Supprimer
                              </button>
                              <button
                                type="button"
                                className="flex-1 px-3 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center text-sm"
                              >
                                <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                                Dupliquer
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Version desktop */}
                        <div className="hidden lg:grid grid-cols-12 gap-3 items-center">
                          <div className="col-span-4">
                            <div className="text-slate-800 font-medium">{article.nom}</div>
                            {article?.description && (
                              <div className="text-xs text-slate-500 mt-1">{article.description}</div>
                            )}
                          </div>
                          <input
                            aria-label="Prix unitaire"
                            type="number"
                            value={(article as any).prixUnitaire}
                            onChange={(e) => handleUpdateArticle(article.id, 'prixUnitaire', parseFloat(e.target.value) || 0)}
                            className="col-span-2 px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"
                            step="0.01"
                            min="0"
                          />
                          <input
                            aria-label="Quantité"
                            type="number"
                            value={(article as any).quantite}
                            onChange={(e) => handleUpdateArticle(article.id, 'quantite', parseInt(e.target.value) || 1)}
                            className="col-span-1 px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"
                            min="1"
                          />
                          <input
                            aria-label="Remise en pourcentage"
                            type="number"
                            value={(article as any).remise}
                            onChange={(e) => handleUpdateArticle(article.id, 'remise', parseFloat(e.target.value) || 0)}
                            className="col-span-1 px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          <div className="col-span-2 text-slate-800 font-semibold">{formatCurrency((article as any).total)}</div>
                          <div className="col-span-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleRemoveArticle(article.id)}
                              className="px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors flex items-center justify-center"
                              title="Supprimer l'article"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="px-2 py-1 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors flex items-center justify-center"
                              title="Dupliquer l'article"
                            >
                              <DocumentDuplicateIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Totaux et Notes */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Notes */}
                <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                      <DocumentTextIcon className="h-5 w-5 text-amber-600" />
                    </div>
                    Notes et Conditions
                  </h3>
                  <label htmlFor="fv-notes-conditions" className="sr-only">Notes et Conditions</label>
                  <textarea
                    id="fv-notes-conditions"
                    value={nouvelleFacture.notes}
                    onChange={(e) => setNouvelleFacture((prev: any) => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white transition-colors"
                    rows={4}
                    placeholder="Conditions de vente, notes spéciales, informations de livraison..."
                  />
                </div>

                {/* Totaux */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                      <CalculatorIcon className="h-5 w-5 text-emerald-600" />
                    </div>
                    Totaux
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm text-slate-600">
                      <span>Sous-total HT:</span>
                      <span>{formatCurrency(calculateTotals().sousTotalHT)}</span>
                    </div>
                    {calculateTotals().totalRemises > 0 && (
                      <div className="flex justify-between items-center text-sm text-slate-600">
                        <span>Remises:</span>
                        <span className="text-emerald-600">-{formatCurrency(calculateTotals().totalRemises)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-sm text-slate-600">
                      <span>Total HT:</span>
                      <span className="font-semibold">{formatCurrency(calculateTotals().totalHT)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-600">
                      <span>TVA ({calculateTotals().tauxTVA.toFixed(0)}%):</span>
                      <span>{formatCurrency(calculateTotals().tva)}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Devise: {nouvelleFacture.devise}
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex justify-between items-center text-lg font-bold text-slate-800">
                        <span>Total TTC:</span>
                        <span className="text-emerald-600">{formatCurrency(calculateTotals().totalTTC)}</span>
                      </div>
                    </div>
                    {nouvelleFacture.conditionPaiement !== '0' && (
                      <div className="text-xs text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg">
                        💳 Paiement à {nouvelleFacture.conditionPaiement} jours
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Signature Électronique - Champ Obligatoire */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="mb-4 pb-3 border-b border-slate-200">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center">
                    Signature Électronique <span className="text-red-500 ml-1">*</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    La signature électronique génère automatiquement un QR code pour la traçabilité
                  </p>
                </div>

                {!nouvelleFacture.signatureDataUrl ? (
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                      ⚠️ La signature est obligatoire pour créer la facture
                    </div>
                    <div className="bg-white rounded-lg border-2 border-slate-300 p-4">
                      <SignaturePad
                        onSave={(dataUrl: string) => {
                          setNouvelleFacture((prev: any) => ({
                            ...prev,
                            signatureDataUrl: dataUrl
                          }));
                        }}
                        onCancel={() => { }}
                        className="w-full"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800 flex items-center gap-2">
                      <CheckCircleIcon className="h-5 w-5" />
                      Signature électronique enregistrée avec QR code
                    </div>
                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-slate-700">Aperçu de la signature :</span>
                        <button
                          type="button"
                          onClick={() => {
                            setNouvelleFacture((prev: any) => ({
                              ...prev,
                              signatureDataUrl: ''
                            }));
                          }}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Modifier
                        </button>
                      </div>
                      <div className="bg-white rounded border border-slate-300 p-3">
                        <img
                          src={nouvelleFacture.signatureDataUrl}
                          alt="Signature"
                          className="w-full h-32 object-contain"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="text-sm text-slate-600">
                    <p className="font-semibold text-slate-800 text-lg">Total: {formatCurrency(calculateTotals().totalTTC)}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-stretch sm:items-center">
                    <button
                      type="button"
                      onClick={() => setIsNouvelleFactureModalOpen(false)}
                      className="px-6 py-3 text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors font-medium shadow-sm"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Sauvegarder en brouillon
                        success('Brouillon sauvegardé', 'La facture a été sauvegardée en brouillon.');
                      }}
                      className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors font-medium shadow-sm"
                    >
                      <span className="hidden sm:inline">Sauvegarder Brouillon</span>
                      <span className="sm:hidden">Brouillon</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!nouvelleFacture.signatureDataUrl) {
                          warning(
                            'Signature requise',
                            'Vous devez ajouter une signature électronique avant de créer la facture.',
                            ['La signature est obligatoire pour la traçabilité']
                          );
                          return;
                        }
                        handleCreateFacture();
                      }}
                      disabled={!nouvelleFacture.signatureDataUrl}
                      className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="hidden sm:inline">Créer la Facture</span>
                      <span className="sm:hidden">Créer</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </Modal>

        {/* Modal Détails Facture - Améliorée */}
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={`Détails de la Facture ${selectedFacture?.numero}`}
          size="xl"
        >
          {selectedFacture && (
            <div className="space-y-6">
              {/* En-tête avec informations principales */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-xl border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Client</label>
                    <p className="text-lg font-bold text-slate-900">{selectedFacture.client}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {mockClients.find(c => c.nom === selectedFacture.client)?.email || 'Email non disponible'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Date de facturation</label>
                    <p className="text-lg font-bold text-slate-900">{new Date(selectedFacture.date).toLocaleDateString('fr-FR')}</p>
                    {selectedFacture.dateEcheance && (
                      <p className="text-sm text-slate-500 mt-1">
                        Échéance: {new Date(selectedFacture.dateEcheance).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Statut</label>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedFacture.statut)}`}>
                      {selectedFacture.statut}
                    </span>
                    {selectedFacture.reference && (
                      <p className="text-sm text-slate-500 mt-1">Réf: {selectedFacture.reference}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Articles détaillés */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Articles Facturés</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Article</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Description</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">Quantité</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">Prix Unitaire</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">Remise</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {selectedFacture.articles?.map((article: any, idx: number) => (
                        <tr key={article.id || idx} className="hover:bg-slate-50">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">{article.nom || article.article}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{article.description || '-'}</td>
                          <td className="px-6 py-4 text-sm text-slate-900 text-center">{article.quantite || 1}</td>
                          <td className="px-6 py-4 text-sm text-slate-900 text-right">{formatCurrency(article.prixUnitaire || 0)}</td>
                          <td className="px-6 py-4 text-sm text-slate-600 text-right">
                            {article.remise ? `${article.remise}%` : '0%'}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900 text-right">
                            {formatCurrency(article.total || (article.prixUnitaire || 0) * (article.quantite || 1))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totaux détaillés */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                  <h4 className="text-lg font-semibold text-emerald-900 mb-4">Résumé Financier</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-700">Sous-total HT:</span>
                      <span className="font-medium text-emerald-900">{formatCurrency(selectedFacture.montantHT || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-700">TVA (19%):</span>
                      <span className="font-medium text-emerald-900">{formatCurrency(selectedFacture.tva || 0)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-emerald-900 border-t border-emerald-300 pt-3 mt-3">
                      <span>Total TTC:</span>
                      <span>{formatCurrency(selectedFacture.total || 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-900 mb-4">Informations Complémentaires</h4>
                  <div className="space-y-3 text-sm">
                    {selectedFacture.conditionsPaiement && (
                      <div className="flex justify-between">
                        <span className="text-blue-700">Conditions de paiement:</span>
                        <span className="font-medium text-blue-900">{selectedFacture.conditionsPaiement} jours</span>
                      </div>
                    )}
                    {selectedFacture.dateEcheance && (
                      <div className="flex justify-between">
                        <span className="text-blue-700">Date d'échéance:</span>
                        <span className="font-medium text-blue-900">
                          {new Date(selectedFacture.dateEcheance).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    )}
                    {selectedFacture.reference && (
                      <div className="flex justify-between">
                        <span className="text-blue-700">Référence:</span>
                        <span className="font-medium text-blue-900">{selectedFacture.reference}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-blue-700">Nombre d'articles:</span>
                      <span className="font-medium text-blue-900">{selectedFacture.articles?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Écritures comptables liées */}
              {has('comptabilite-read') && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900">Écritures Comptables Liées</h3>
                    <p className="text-sm text-slate-600 mt-1">Écritures générées automatiquement lors de la validation</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                          <p className="font-medium text-slate-800">411 - Clients</p>
                          <p className="text-xs text-slate-500">Débit: {formatCurrency(selectedFacture.total || 0)}</p>
                        </div>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">Validée</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                          <p className="font-medium text-slate-800">701 - Ventes</p>
                          <p className="text-xs text-slate-500">Crédit: {formatCurrency(selectedFacture.montantHT || 0)}</p>
                        </div>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">Validée</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                          <p className="font-medium text-slate-800">44571 - TVA Collectée</p>
                          <p className="text-xs text-slate-500">Crédit: {formatCurrency(selectedFacture.tva || 0)}</p>
                        </div>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">Validée</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline des paiements */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-900">Historique des Paiements</h3>
                </div>
                <div className="p-6">
                  {(selectedFacture.paiements || []).filter((p: any) => p.facture === selectedFacture.numero).length > 0 ? (
                    <div className="space-y-3">
                      {(selectedFacture.paiements || []).filter((p: any) => p.facture === selectedFacture.numero).map((paiement: any) => (
                        <div key={paiement.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                              <BanknotesIcon className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{paiement.numero}</p>
                              <p className="text-xs text-slate-500">
                                {paiement.mode} • {new Date(paiement.date).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600">{formatCurrency(paiement.montant)}</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${paiement.couleur}`}>
                              {paiement.statut}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <BanknotesIcon className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                      <p>Aucun paiement enregistré pour cette facture</p>
                      <button
                        onClick={() => {
                          setIsDetailsModalOpen(false);
                          setIsPaiementModalOpen(true);
                        }}
                        className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                      >
                        Enregistrer un paiement
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Signature et QR Code */}
              {(selectedFacture.signature || (selectedFacture as any).qrCode) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedFacture.signature && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">Signature Électronique</h4>
                      <div className="p-4 border-2 border-emerald-300 rounded-lg bg-white">
                        <img src={selectedFacture.signature} alt="Signature du client" className="h-32 w-full object-contain" />
                      </div>
                      <p className="text-xs text-slate-500 mt-2 text-center">
                        Signé le {new Date().toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  )}
                  {(selectedFacture as any).qrCode && (
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">Code QR</h4>
                      <div className="p-4 border-2 border-slate-300 rounded-lg bg-white flex items-center justify-center">
                        <img src={(selectedFacture as any).qrCode} alt="QR Code" className="h-32 w-32" />
                      </div>
                      <p className="text-xs text-slate-500 mt-2 text-center">
                        Scannez pour vérifier l'authenticité
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              {selectedFacture.notes && (
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                  <h4 className="text-lg font-semibold text-amber-900 mb-2">Notes</h4>
                  <p className="text-sm text-amber-800 whitespace-pre-line">{selectedFacture.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setIsPaiementModalOpen(true);
                  }}
                  className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <BanknotesIcon className="h-5 w-5 mr-2" />
                  Enregistrer Paiement
                </button>
                <button
                  onClick={() => handleImprimerFacture(selectedFacture)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <PrinterIcon className="h-5 w-5 mr-2" />
                  Imprimer
                </button>
                <button
                  onClick={() => handleEnvoyerFacture(selectedFacture)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <ShareIcon className="h-5 w-5 mr-2" />
                  Envoyer
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal Aperçu Impression Facture */}
        <Modal
          isOpen={isPrintPreviewOpen}
          onClose={() => setIsPrintPreviewOpen(false)}
          title={`Aperçu - Facture ${selectedFacture?.numero ?? ''}`}
          size="xl"
        >
          {selectedFacture && (
            <div className="space-y-4">
              <InvoicePrintView invoice={selectedFacture} />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPrintPreviewOpen(false)}
                  className="px-6 py-3 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-700"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Lance l'impression native du navigateur depuis l'aperçu
                    window.print();
                  }}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
                >
                  Imprimer
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal Paiement */}
        <Modal
          isOpen={isPaiementModalOpen}
          onClose={() => setIsPaiementModalOpen(false)}
          title="Nouveau Paiement"
          size="lg"
        >
          {selectedFacture && (
            <div className="space-y-6">
              {/* En-tête avec informations de la facture */}
              <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Enregistrer Paiement</h3>
                    <div className="space-y-1">
                      <p className="text-slate-600"><span className="font-medium">Facture:</span> {selectedFacture.numero}</p>
                      <p className="text-slate-600"><span className="font-medium">Client:</span> {selectedFacture.client}</p>
                      <p className="text-slate-600"><span className="font-medium">Montant total:</span> {formatCurrency(selectedFacture.total)}</p>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center">
                    <BanknotesIcon className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Formulaire de paiement */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fv-paiement-montant" className="block text-sm font-medium text-slate-700 mb-2">
                      Montant payé *
                    </label>
                    <input
                      id="fv-paiement-montant"
                      type="number"
                      defaultValue={selectedFacture.total}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="fv-paiement-date" className="block text-sm font-medium text-slate-700 mb-2">
                      Date de paiement *
                    </label>
                    <input
                      id="fv-paiement-date"
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="fv-mode-paiement" className="block text-sm font-medium text-slate-700 mb-2">
                      Mode de paiement *
                    </label>
                    <select id="fv-mode-paiement" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors" required>
                      <option value="">Sélectionner un mode</option>
                      <option value="especes">💵 Espèces</option>
                      <option value="cheque">📝 Chèque</option>
                      <option value="virement">🏦 Virement bancaire</option>
                      <option value="carte">💳 Carte bancaire</option>
                      <option value="mobile">📱 Paiement mobile</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="fv-paiement-reference" className="block text-sm font-medium text-slate-700 mb-2">
                      Référence de transaction
                    </label>
                    <input
                      id="fv-paiement-reference"
                      type="text"
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors"
                      placeholder="Numéro de chèque, référence virement..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="fv-paiement-notes" className="block text-sm font-medium text-slate-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  id="fv-paiement-notes"
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors"
                  placeholder="Notes sur le paiement..."
                />
              </div>

              {/* Résumé du paiement */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-3">Résumé du Paiement</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Montant facture:</span>
                    <p className="font-medium text-slate-800">{formatCurrency(selectedFacture.total)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Montant payé:</span>
                    <p className="font-medium text-emerald-600">{formatCurrency(selectedFacture.total)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Solde restant:</span>
                    <p className="font-medium text-slate-800">0 دج</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Statut:</span>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full font-medium">Payé</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsPaiementModalOpen(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  onClick={() => {
                    success(
                      'Paiement enregistré',
                      'Le paiement a été enregistré avec succès dans le système.',
                      [
                        'Le paiement a été ajouté à l\'historique.',
                        'Vous pouvez maintenant consulter les détails dans la section Paiements.'
                      ]
                    );
                    setIsPaiementModalOpen(false);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  Enregistrer le Paiement
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal Workflow ERPNext */}
        <Modal
          isOpen={isWorkflowModalOpen}
          onClose={() => setIsWorkflowModalOpen(false)}
          title="Gestion du Workflow "
          size="lg"
        >
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Configuration du Workflow</h4>
              <p className="text-blue-800 text-sm">
                Configurez les étapes d'approbation pour les factures selon votre processus métier.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Étapes du Workflow</label>
                <div className="space-y-3">
                  {workflowSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{step.name}</p>
                        <p className="text-sm text-gray-500">Responsable: {step.user}</p>
                      </div>
                      <select className="px-3 py-1 border border-gray-300 rounded text-sm" aria-label={`Statut de l'étape ${step.name}`}>
                        <option value="completed">Terminé</option>
                        <option value="pending">En attente</option>
                        <option value="not_started">Non démarré</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ajouter une étape</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Nom de l'étape"
                    aria-label="Nom de l'étape"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Responsable"
                    aria-label="Responsable"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Ajouter
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsWorkflowModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Sauvegarder
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal Calcul TVA */}
        <Modal
          isOpen={isTaxCalculationModalOpen}
          onClose={() => setIsTaxCalculationModalOpen(false)}
          title="Calculatrice TVA - ERP Dinarlytic"
          size="lg"
        >
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Paramètres de TVA</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fv-taux-tva" className="block text-sm font-medium text-green-700 mb-1">Taux de TVA</label>
                  <input
                    id="fv-taux-tva"
                    type="number"
                    value={tvaCalculationData.tauxTVA}
                    onChange={(e) => setTvaCalculationData(prev => ({ ...prev, tauxTVA: parseFloat(e.target.value) || 19 }))}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-green-600 mt-1">Taux officiel en Algérie</p>
                </div>
                <div>
                  <label htmlFor="fv-montant-ht-calc" className="block text-sm font-medium text-green-700 mb-1">Montant HT</label>
                  <input
                    id="fv-montant-ht-calc"
                    type="number"
                    value={tvaCalculationData.montantHT || ''}
                    onChange={(e) => {
                      const montantHT = parseFloat(e.target.value) || 0;
                      calculateTVA(montantHT, tvaCalculationData.tauxTVA);
                    }}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fv-montant-ht" className="block text-sm font-medium text-gray-700 mb-1">Montant HT</label>
                  <input
                    id="fv-montant-ht"
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label htmlFor="fv-tva-19" className="block text-sm font-medium text-gray-700 mb-1">TVA (19%)</label>
                  <input
                    id="fv-tva-19"
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    readOnly
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Résultat du Calcul</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Montant HT:</span>
                    <span className="font-semibold text-blue-800">{formatCurrency(tvaCalculationData.montantHT)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">TVA ({tvaCalculationData.tauxTVA}%):</span>
                    <span className="font-semibold text-blue-800">{formatCurrency(tvaCalculationData.montantTVA)}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2">
                    <span className="text-blue-700 font-medium">Total TTC:</span>
                    <span className="font-bold text-blue-800">{formatCurrency(tvaCalculationData.montantTTC)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsTaxCalculationModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  success(
                    'Calcul TVA terminé',
                    'Le calcul de la TVA a été effectué avec succès.',
                    [
                      `Montant HT: ${formatCurrency(tvaCalculationData.montantHT)}`,
                      `TVA (${tvaCalculationData.tauxTVA}%): ${formatCurrency(tvaCalculationData.montantTVA)}`,
                      `Total TTC: ${formatCurrency(tvaCalculationData.montantTTC)}`,
                      'Ces valeurs peuvent être utilisées pour votre facture.'
                    ]
                  );
                  setIsTaxCalculationModalOpen(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Valider le Calcul
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal Générer Déclaration */}
        <Modal
          isOpen={isDeclarationModalOpen}
          onClose={() => setIsDeclarationModalOpen(false)}
          title="Générer Déclaration TVA G50"
          size="lg"
        >
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Informations de la Déclaration</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fv-decl-periode" className="block text-sm font-medium text-green-700 mb-1">Période</label>
                  <input
                    id="fv-decl-periode"
                    type="text"
                    value={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="fv-decl-date" className="block text-sm font-medium text-green-700 mb-1">Date de génération</label>
                  <input
                    id="fv-decl-date"
                    type="date"
                    value={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Résumé des Données</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">Nombre de factures:</span>
                  <span className="font-medium text-blue-900">{mockFacturesVente.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Chiffre d'affaires HT:</span>
                  <span className="font-medium text-blue-900">{formatCurrency(mockFacturesVente.reduce((sum: number, f: any) => sum + (f.montantHT || 0), 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">TVA collectée:</span>
                  <span className="font-medium text-blue-900">{formatCurrency(mockFacturesVente.reduce((sum: number, f: any) => sum + (f.tva || 0), 0))}</span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="font-semibold text-amber-900 mb-2">Instructions</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• La déclaration G50 sera générée pour la période courante</li>
                <li>• Les données sont calculées automatiquement à partir des factures</li>
                <li>• Vérifiez les montants avant validation</li>
                <li>• La déclaration sera sauvegardée dans vos documents</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeclarationModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={generateDeclarationG50}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Générer la Déclaration
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal Vérifier Conformité */}
        <Modal
          isOpen={isConformiteModalOpen}
          onClose={() => setIsConformiteModalOpen(false)}
          title="Vérification de Conformité Fiscale"
          size="lg"
        >
          <div className="space-y-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">Analyse de Conformité</h4>
              <p className="text-sm text-purple-700">
                Cette vérification analyse la conformité de vos factures selon la réglementation algérienne.
              </p>
            </div>

            {conformiteResults ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Score de Conformité</h4>
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl font-bold text-green-600">{conformiteResults.score}%</div>
                    <div>
                      <div className="text-lg font-medium text-gray-900">{conformiteResults.niveau}</div>
                      <div className="text-sm text-gray-500">Date: {conformiteResults.dateVerification}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-2">Factures</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span>{conformiteResults.verifications.factures.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Conformes:</span>
                        <span className="text-green-600">{conformiteResults.verifications.factures.conformes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Non conformes:</span>
                        <span className="text-red-600">{conformiteResults.verifications.factures.nonConformes}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-900 mb-2">TVA</h5>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Taux correct:</span>
                        <span className={conformiteResults.verifications.tva.tauxCorrect ? "text-green-600" : "text-red-600"}>
                          {conformiteResults.verifications.tva.tauxCorrect ? "Oui" : "Non"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Montant total:</span>
                        <span>{formatCurrency(conformiteResults.verifications.tva.montantTotal)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {conformiteResults.recommandations.length > 0 && (
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h5 className="font-medium text-amber-900 mb-2">Recommandations</h5>
                    <ul className="text-sm text-amber-800 space-y-1">
                      {conformiteResults.recommandations.map((rec: string, index: number) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Cliquez sur "Vérifier" pour analyser la conformité</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsConformiteModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Fermer
              </button>
              <button
                onClick={verifierConformite}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Vérifier la Conformité
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal Rapports Comptables */}
        <Modal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          title={`Rapport Comptable - ${reportData?.type || ''}`}
          size="xl"
        >
          {reportData && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-2">Informations du Rapport</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Type:</span>
                    <span className="ml-2 font-medium text-slate-900">{reportData.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Période:</span>
                    <span className="ml-2 font-medium text-slate-900">{reportData.periode}</span>
                  </div>
                </div>
              </div>

              {reportData.type === 'Grand Livre' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compte</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Solde Initial</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Débit</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Crédit</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Solde Final</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.comptes.map((compte: any, index: number) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{compte.numero}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{compte.libelle}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(compte.soldeInitial)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(compte.debit)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(compte.credit)}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(compte.soldeFinal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900">TOTAUX</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(reportData.totalDebit)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(reportData.totalCredit)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(reportData.totalDebit - reportData.totalCredit)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {reportData.type === 'Balance' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compte</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Solde Débiteur</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Solde Créditeur</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.comptes.map((compte: any, index: number) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{compte.numero}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{compte.libelle}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(compte.soldeDebiteur)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(compte.soldeCrediteur)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={2} className="px-4 py-3 text-sm font-medium text-gray-900">TOTAUX</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(reportData.totalDebiteur)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(reportData.totalCrediteur)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {reportData.type === 'Journal des Ventes' && (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pièce</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Libellé</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compte</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Débit</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Crédit</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.ecritures.map((ecriture: any, index: number) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-900">{ecriture.numero}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{ecriture.date}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{ecriture.piece}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{ecriture.libelle}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{ecriture.compte} - {ecriture.libelleCompte}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(ecriture.debit)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(ecriture.credit)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {reportData.type === 'État de TVA' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">TVA Collectée</h5>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(reportData.tvaCollectee.montant)}</p>
                      <p className="text-sm text-blue-700">{reportData.tvaCollectee.nombreFactures} factures</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h5 className="font-medium text-green-900 mb-2">TVA à Verser</h5>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(reportData.tvaAVerser)}</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Facture</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant HT</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">TVA</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total TTC</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.details.map((detail: any, index: number) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{detail.numero}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{detail.date}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{detail.client}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(detail.montantHT)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(detail.tva)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(detail.montantTTC)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    success(
                      'Rapport exporté',
                      `Le rapport ${reportData.type} a été exporté avec succès au format PDF.`,
                      [
                        `Type: ${reportData.type}`,
                        `Période: ${reportData.periode}`,
                        'Le fichier PDF sera téléchargé automatiquement.',
                        'Vous pouvez l\'ouvrir et l\'imprimer à tout moment.'
                      ]
                    );
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Exporter PDF
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal Détails Relance */}
        <Modal
          isOpen={isRelanceModalOpen}
          onClose={() => setIsRelanceModalOpen(false)}
          title="Détails de la Relance"
          size="lg"
        >
          {selectedRelance ? (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-2">Informations de la Relance</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Numéro:</span>
                    <span className="ml-2 font-medium text-slate-900">{selectedRelance.numero}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Type:</span>
                    <span className="ml-2 font-medium text-slate-900">{selectedRelance.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Date de relance:</span>
                    <span className="ml-2 font-medium text-slate-900">{selectedRelance.dateRelance}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Statut:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedRelance.couleur}`}>
                      {selectedRelance.statut}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Informations Client</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Client:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedRelance.client}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedRelance.contact}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Téléphone:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedRelance.telephone}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Détails de la Facture</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Facture:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedRelance.facture}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Montant:</span>
                    <span className="ml-2 font-medium text-gray-900">{formatCurrency(selectedRelance.montant)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date d'échéance:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedRelance.dateEcheance}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Motif:</span>
                    <span className="ml-2 font-medium text-gray-900">{selectedRelance.motif}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsRelanceModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Fermer
                </button>
                <button
                  onClick={() => handleSendCommunication(selectedRelance, 'Email')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Envoyer Email
                </button>
                <button
                  onClick={() => handleSendCommunication(selectedRelance, 'Appel téléphonique')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Appeler
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Sélectionnez une relance pour voir les détails</p>
            </div>
          )}
        </Modal>

        {/* Modal Communication Client */}
        <Modal
          isOpen={isCommunicationModalOpen}
          onClose={() => setIsCommunicationModalOpen(false)}
          title="Communication Client"
          size="lg"
        >
          {selectedCommunication ? (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-2">Informations de la Communication</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Type:</span>
                    <span className="ml-2 font-medium text-slate-900">{selectedCommunication.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Date:</span>
                    <span className="ml-2 font-medium text-slate-900">{selectedCommunication.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Client:</span>
                    <span className="ml-2 font-medium text-slate-900">{selectedCommunication.client}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Statut:</span>
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedCommunication.couleur}`}>
                      {selectedCommunication.statut}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Sujet</h4>
                <p className="text-sm text-gray-900">{selectedCommunication.sujet}</p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Contenu</h4>
                <div className="text-sm text-gray-900 whitespace-pre-line">
                  {selectedCommunication.contenu}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsCommunicationModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    success(
                      'Communication traitée',
                      'La communication a été marquée comme traitée avec succès.',
                      [
                        `Type: ${selectedCommunication.type}`,
                        `Client: ${selectedCommunication.client}`,
                        `Date: ${selectedCommunication.date}`,
                        'Cette communication sera archivée dans l\'historique.'
                      ]
                    );
                    setIsCommunicationModalOpen(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Marquer comme Traitée
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Nouvelle Communication</h4>
                <p className="text-sm text-blue-700">
                  Créez une nouvelle communication avec vos clients pour les relances de paiement.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="fv-comm-type" className="block text-sm font-medium text-gray-700 mb-2">Type de communication</label>
                  <select id="fv-comm-type" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Sélectionner un type</option>
                    <option value="email">Email</option>
                    <option value="appel">Appel téléphonique</option>
                    <option value="lettre">Lettre recommandée</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="fv-comm-client" className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                  <select id="fv-comm-client" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Sélectionner un client</option>
                    {relances.map((relance: any) => (
                      <option key={relance.id} value={relance.client}>{relance.client}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Sujet de la communication"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Contenu de votre message..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsCommunicationModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    success(
                      'Communication envoyée',
                      'Votre communication a été créée et envoyée avec succès.',
                      [
                        'La communication a été enregistrée dans l\'historique.',
                        'Le client recevra la notification selon le type choisi.',
                        'Vous pouvez suivre le statut dans la section Communications.'
                      ]
                    );
                    setIsCommunicationModalOpen(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Envoyer
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal Détails Livraison */}
        <Modal
          isOpen={isLivraisonDetailsModalOpen}
          onClose={() => setIsLivraisonDetailsModalOpen(false)}
          title="Détails de la Livraison"
          size="xl"
        >
          {selectedLivraison && (
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Client</label>
                    <p className="text-gray-900 font-medium">{selectedLivraison.client}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Facture associée</label>
                    <p className="text-gray-900">{selectedLivraison.factureId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de commande</label>
                    <p className="text-gray-900">{new Date(selectedLivraison.dateCommande).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de livraison prévue</label>
                    <p className="text-gray-900">{new Date(selectedLivraison.dateLivraisonPrevue).toLocaleDateString('fr-FR')}</p>
                  </div>
                  {selectedLivraison.dateLivraisonReelle && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date de livraison réelle</label>
                      <p className="text-green-600 font-medium">{new Date(selectedLivraison.dateLivraisonReelle).toLocaleDateString('fr-FR')}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Statut</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLivraisonStatusColor(selectedLivraison.statut)}`}>
                      {getLivraisonStatusText(selectedLivraison.statut)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Transporteur</label>
                    <p className="text-gray-900">{selectedLivraison.transporteur}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Numéro de suivi</label>
                    <p className="text-gray-900 font-mono">{selectedLivraison.numeroSuivi}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Frais de transport</label>
                    <p className="text-gray-900 font-semibold">{formatCurrency(selectedLivraison.fraisTransport)}</p>
                  </div>
                </div>
              </div>

              {/* Adresse de livraison */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse de livraison</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-gray-900">{selectedLivraison.adresseLivraison}</p>
                      <p className="text-sm text-gray-500 mt-1">Contact: {selectedLivraison.contactClient}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Articles livrés */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Articles à livrer</label>
                <div className="space-y-2">
                  {selectedLivraison.articles?.map((article: any) => (
                    <div key={article.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{article.nom}</p>
                          <p className="text-sm text-gray-500">
                            Quantité: {(article as any).quantite} | Conditionnement: {article.conditionnement}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Informations logistiques */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <TruckIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Poids</p>
                      <p className="text-lg font-bold text-blue-800">{selectedLivraison.poids} kg</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-900">Volume</p>
                      <p className="text-lg font-bold text-green-800">{selectedLivraison.volume} m³</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-5 w-5 text-purple-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-purple-900">Chauffeur</p>
                      <p className="text-sm font-bold text-purple-800">{selectedLivraison.chauffeur}</p>
                      <p className="text-xs text-purple-600">{selectedLivraison.vehicule}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedLivraison.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-gray-900">{selectedLivraison.notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => handleTrackLivraison(selectedLivraison)}
                  className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <TruckIcon className="h-5 w-5 mr-2" />
                  Suivre Livraison
                </button>
                <button
                  onClick={() => handleContactClient(selectedLivraison)}
                  className="flex items-center px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  Contacter Client
                </button>
                <button
                  onClick={() => handleUpdateLivraisonStatus(selectedLivraison, 'livree')}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Marquer Livrée
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal Détails Brouillon - Améliorée */}
        <Modal isOpen={isBrouillonModalOpen} onClose={() => setIsBrouillonModalOpen(false)} title="" size="lg">
          {selectedBrouillon && (
            <div className="space-y-6">
              {/* En-tête amélioré */}
              <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="p-3 bg-amber-500 rounded-xl shadow-lg">
                      <DocumentTextIcon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-slate-900 mb-1">Détails du Brouillon</h2>
                      <p className="text-sm text-slate-600">Informations complètes sur votre facture en cours de création</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsBrouillonModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-all"
                    aria-label="Fermer"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Informations principales en grille */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Numéro de Facture */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <DocumentTextIcon className="h-5 w-5 text-slate-600" />
                    </div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Numéro de Facture</label>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{(selectedBrouillon as any)?.numero}</p>
                </div>

                {/* Client */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserGroupIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Client</label>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{(selectedBrouillon as any)?.client}</p>
                </div>

                {/* Montant */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <CurrencyDollarIcon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Montant</label>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency((selectedBrouillon as any)?.montant)}</p>
                </div>

                {/* Date de Création */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CalendarIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date de Création</label>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{(selectedBrouillon as any)?.date}</p>
                </div>
              </div>

              {/* Statut et Progression */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <ClockIcon className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">Statut</label>
                      <span className={`inline-flex px-4 py-1.5 text-sm font-semibold rounded-full mt-1 ${(selectedBrouillon as any)?.couleur}`}>
                        {(selectedBrouillon as any)?.statut}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">Nombre d'Articles</label>
                    <p className="text-lg font-bold text-slate-900 mt-1">{selectedBrouillon.articles} article(s)</p>
                  </div>
                </div>

                {/* Barre de progression améliorée */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700">Progression</label>
                    <span className="text-sm font-bold text-amber-600">
                      {(selectedBrouillon as any)?.statut === 'En rédaction' ? '60%' : '80%'} complété
                    </span>
                  </div>
                  <div className="relative w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500 ease-out shadow-sm ${(selectedBrouillon as any)?.statut === 'En rédaction' ? 'w-[60%]' : 'w-[80%]'
                        }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span>En cours de création</span>
                    <span>Presque terminé</span>
                  </div>
                </div>
              </div>

              {/* Actions améliorées */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    setIsBrouillonModalOpen(false);
                    handleEditBrouillon(selectedBrouillon);
                  }}
                  className="flex items-center justify-center px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Modifier le Brouillon
                </button>
                <button
                  onClick={() => {
                    setIsBrouillonModalOpen(false);
                    handleValidateBrouillon(selectedBrouillon);
                  }}
                  className="flex items-center justify-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  <DocumentCheckIcon className="h-5 w-5 mr-2" />
                  Valider et Finaliser
                </button>
                <button
                  onClick={() => {
                    setIsBrouillonModalOpen(false);
                    handleDeleteBrouillon(selectedBrouillon);
                  }}
                  className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Supprimer
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal Validation Brouillon */}
        <Modal
          isOpen={isValidationModalOpen}
          onClose={() => setIsValidationModalOpen(false)}
          title="Validation du Brouillon"
          size="md"
        >
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <ExclamationTriangleIcon className="h-8 w-8 text-amber-600" />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Validation du Brouillon
              </h3>
              <p className="text-slate-600">
                Êtes-vous sûr de vouloir valider le brouillon <span className="font-semibold text-slate-800">{brouillonToValidate?.numero}</span> ?
              </p>
            </div>

            {brouillonToValidate && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Client:</span>
                    <p className="font-medium text-slate-800">{brouillonToValidate.client}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Montant:</span>
                    <p className="font-medium text-slate-800">{formatCurrency(brouillonToValidate.montant)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Date:</span>
                    <p className="font-medium text-slate-800">{new Date(brouillonToValidate.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Statut actuel:</span>
                    <p className="font-medium text-slate-800">{brouillonToValidate.statut}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setIsValidationModalOpen(false)}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={confirmValidation}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                Valider le Brouillon
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal Nouveau Paiement */}
        <Modal
          isOpen={isPaiementsModalOpen}
          onClose={() => setIsPaiementsModalOpen(false)}
          title="Enregistrer un Nouveau Paiement"
          size="lg"
        >
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Informations du Paiement</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fv-facture-concernee" className="block text-sm font-medium text-slate-700 mb-2">
                    Facture concernée *
                  </label>
                  <select id="fv-facture-concernee" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors">
                    <option value="">Sélectionner une facture</option>
                    <option value="FAC-2024-001">FAC-2024-001 - SARL DZ</option>
                    <option value="FAC-2024-002">FAC-2024-002 - Entreprise ABC</option>
                    <option value="FAC-2024-003">FAC-2024-003 - Société XYZ</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="fv-np-montant" className="block text-sm font-medium text-slate-700 mb-2">
                    Montant du paiement *
                  </label>
                  <input
                    id="fv-np-montant"
                    type="number"
                    placeholder="0.00"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label htmlFor="fv-mode-paiement-2" className="block text-sm font-medium text-slate-700 mb-2">
                    Mode de paiement *
                  </label>
                  <select id="fv-mode-paiement-2" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors">
                    <option value="">Sélectionner un mode</option>
                    <option value="virement">Virement bancaire</option>
                    <option value="cheque">Chèque</option>
                    <option value="especes">Espèces</option>
                    <option value="carte">Carte bancaire</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="fv-date-paiement" className="block text-sm font-medium text-slate-700 mb-2">
                    Date du paiement *
                  </label>
                  <input
                    id="fv-date-paiement"
                    type="date"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="fv-np-reference" className="block text-sm font-medium text-slate-700 mb-2">
                  Référence du paiement
                </label>
                <input
                  id="fv-np-reference"
                  type="text"
                  placeholder="Ex: VIR-2024-006, CHQ-2024-003..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors"
                />
              </div>

              <div className="mt-6">
                <label htmlFor="fv-np-notes" className="block text-sm font-medium text-slate-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  id="fv-np-notes"
                  rows={3}
                  placeholder="Informations complémentaires sur le paiement..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsPaiementsModalOpen(false)}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  success(
                    'Paiement enregistré',
                    'Le nouveau paiement a été enregistré avec succès dans le système.',
                    [
                      'Le paiement a été ajouté à l\'historique des paiements.',
                      'Vous pouvez consulter les détails dans la section Paiements.',
                      'Le solde du client sera mis à jour automatiquement.'
                    ]
                  );
                  setIsPaiementsModalOpen(false);
                }}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                Enregistrer le Paiement
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal Détails Paiement */}
        <Modal
          isOpen={isPaiementDetailsModalOpen}
          onClose={() => setIsPaiementDetailsModalOpen(false)}
          title={`Détails du Paiement ${selectedPaiement?.numero}`}
          size="md"
        >
          {selectedPaiement && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <BanknotesIcon className="h-8 w-8 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{selectedPaiement.numero}</h3>
                    <p className="text-slate-600">Paiement reçu le {new Date(selectedPaiement.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">Informations Générales</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Facture:</span>
                      <span className="font-medium text-slate-800">{selectedPaiement.facture}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Client:</span>
                      <span className="font-medium text-slate-800">{selectedPaiement.client}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Montant:</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(selectedPaiement.montant)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Mode de paiement:</span>
                      <span className="font-medium text-slate-800">{selectedPaiement.mode}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">Détails Techniques</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Référence:</span>
                      <span className="font-medium text-slate-800">{selectedPaiement.reference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Statut:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedPaiement.couleur}`}>
                        {selectedPaiement.statut}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Date de réception:</span>
                      <span className="font-medium text-slate-800">{new Date(selectedPaiement.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">ID Paiement:</span>
                      <span className="font-mono text-sm text-slate-500">#{selectedPaiement.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsPaiementDetailsModalOpen(false)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    // Impression PDF avec fond blanc et palette ERP exacte
                    const printContent = `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: white;">
                      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #334155; padding-bottom: 20px;">
                        <h1 style="color: #1e293b; margin: 0; font-size: 28px; font-weight: 700;">DINARLYTIC SOLUTIONS</h1>
                        <p style="color: #64748b; margin: 8px 0; font-size: 16px; font-weight: 500;">Solutions Financières Intelligentes</p>
                        <p style="color: #64748b; margin: 4px 0; font-size: 14px;">123 Avenue de la République, Alger 16000</p>
                        <p style="color: #64748b; margin: 4px 0; font-size: 14px;">+213 21 12 34 56 | contact@dinarlytic.dz</p>
                      </div>
                      
                      <div style="margin-bottom: 30px;">
                        <h2 style="color: #1e293b; font-size: 24px; margin-bottom: 20px; font-weight: 600;">REÇU DE PAIEMENT</h2>
                        <div style="background: white; padding: 20px; border-radius: 12px; border: 2px solid #10b981; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                          <p style="margin: 0; font-size: 20px; font-weight: 700; color: #1e293b;">${selectedPaiement.numero}</p>
                          <p style="margin: 8px 0 0 0; color: #64748b; font-size: 16px;">Paiement reçu le ${new Date(selectedPaiement.date).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                      
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                        <div>
                          <h3 style="color: #1e293b; font-size: 18px; margin-bottom: 15px; font-weight: 600;">Informations Générales</h3>
                          <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                            <p style="margin: 10px 0; color: #64748b;"><strong style="color: #1e293b;">Facture:</strong> <span style="color: #64748b;">${selectedPaiement.facture}</span></p>
                            <p style="margin: 10px 0; color: #64748b;"><strong style="color: #1e293b;">Client:</strong> <span style="color: #64748b;">${selectedPaiement.client}</span></p>
                            <p style="margin: 10px 0; color: #64748b;"><strong style="color: #1e293b;">Montant:</strong> <span style="color: #10b981; font-weight: 700; font-size: 18px;">${formatCurrency(selectedPaiement.montant)}</span></p>
                            <p style="margin: 10px 0; color: #64748b;"><strong style="color: #1e293b;">Mode:</strong> <span style="color: #64748b;">${selectedPaiement.mode}</span></p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 style="color: #1e293b; font-size: 18px; margin-bottom: 15px; font-weight: 600;">Détails Techniques</h3>
                          <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                            <p style="margin: 10px 0; color: #64748b;"><strong style="color: #1e293b;">Référence:</strong> <span style="color: #64748b;">${selectedPaiement.reference}</span></p>
                            <p style="margin: 10px 0; color: #64748b;"><strong style="color: #1e293b;">Statut:</strong> <span style="background: ${selectedPaiement.statut === 'Confirmé' ? '#dcfce7' : '#fef3c7'}; color: ${selectedPaiement.statut === 'Confirmé' ? '#166534' : '#92400e'}; padding: 6px 12px; border-radius: 6px; font-size: 14px; font-weight: 600;">${selectedPaiement.statut}</span></p>
                            <p style="margin: 10px 0; color: #64748b;"><strong style="color: #1e293b;">Date:</strong> <span style="color: #64748b;">${new Date(selectedPaiement.date).toLocaleDateString('fr-FR')}</span></p>
                            <p style="margin: 10px 0; color: #64748b;"><strong style="color: #1e293b;">ID:</strong> <span style="color: #64748b; font-family: monospace;">#${selectedPaiement.id}</span></p>
                          </div>
                        </div>
                      </div>
                      
                      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                        <p style="color: #64748b; font-size: 12px; margin: 4px 0;">Ce document a été généré automatiquement par DINARLYTIC SOLUTIONS</p>
                        <p style="color: #64748b; font-size: 12px; margin: 4px 0;">Date d'impression: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
                      </div>
                    </div>
                  `;

                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                      <html>
                        <head>
                          <title>Reçu de Paiement - ${selectedPaiement.numero}</title>
                          <style>
                            @media print {
                              body { margin: 0; }
                              @page { margin: 20mm; }
                            }
                          </style>
                        </head>
                        <body>${printContent}</body>
                      </html>
                    `);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  <PrinterIcon className="h-5 w-5 mr-2 inline" />
                  Imprimer PDF
                </button>
                <button
                  onClick={() => {
                    info(
                      'Modification du paiement',
                      `Ouverture de l'éditeur pour modifier le paiement ${selectedPaiement.numero}.`,
                      [
                        `Paiement: ${selectedPaiement.numero}`,
                        `Facture: ${selectedPaiement.facture}`,
                        `Montant: ${formatCurrency(selectedPaiement.montant)}`,
                        'Vous pourrez modifier les informations du paiement dans l\'éditeur.'
                      ]
                    );
                    setIsPaiementDetailsModalOpen(false);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  Modifier
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* Modal Nouveau Rapport */}
        <Modal
          isOpen={isNewReportModalOpen}
          onClose={() => setIsNewReportModalOpen(false)}
          title="Créer un Nouveau Rapport"
          size="lg"
        >
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Configuration du Rapport</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nom du Rapport
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Rapport Mensuel Janvier 2024"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="fv-type-rapport" className="block text-sm font-medium text-slate-700 mb-2">
                    Type de Rapport
                  </label>
                  <select id="fv-type-rapport" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white transition-colors">
                    <option value="">Sélectionner un type</option>
                    <option value="ventes">Rapport de Ventes</option>
                    <option value="clients">Analyse Clients</option>
                    <option value="produits">Performance Produits</option>
                    <option value="financier">Rapport Financier</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Période d'Analyse
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    aria-label="Date de début"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white transition-colors"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    aria-label="Date de fin"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Métriques à Inclure
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                    <span className="text-sm text-slate-700">Chiffre d'Affaires</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                    <span className="text-sm text-slate-700">Nombre de Factures</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                    <span className="text-sm text-slate-700">Panier Moyen</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                    <span className="text-sm text-slate-700">Taux de Conversion</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-slate-300" />
                    <span className="text-sm text-slate-700">Top Clients</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded border-slate-300" />
                    <span className="text-sm text-slate-700">Évolution Temporelle</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsNewReportModalOpen(false)}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  success(
                    'Rapport créé',
                    'Le nouveau rapport a été créé avec succès.',
                    [
                      'Le rapport a été généré avec les paramètres sélectionnés.',
                      'Vous pouvez le consulter dans la section Rapports.',
                      'Le rapport est disponible pour export et impression.'
                    ]
                  );
                  setIsNewReportModalOpen(false);
                }}
                className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                Créer le Rapport
              </button>
            </div>
          </div>
        </Modal>

        {/* Modal Actions Comptables */}
        <Modal
          isOpen={isActionComptableModalOpen}
          onClose={() => setIsActionComptableModalOpen(false)}
          title={`Actions Comptables`}
          size="lg"
        >
          <div className="space-y-6">
            {(
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Écritures Comptables Automatiques</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                      <div>
                        <p className="font-medium text-slate-800">Facturation Client</p>
                        <p className="text-sm text-slate-500">411 - Clients / 701 - Ventes</p>
                      </div>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">Automatique</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                      <div>
                        <p className="font-medium text-slate-800">TVA Collectée</p>
                        <p className="text-sm text-slate-500">44571 - TVA collectée</p>
                      </div>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">Automatique</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                      <div>
                        <p className="font-medium text-slate-800">Encaissement</p>
                        <p className="text-sm text-slate-500">512 - Banque / 411 - Clients</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Manuel</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* {actionComptableType === 'calcul-tva' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Calcul TVA Algérienne</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-emerald-200">
                    <h4 className="font-semibold text-slate-800 mb-2">Taux Standard</h4>
                    <p className="text-2xl font-bold text-emerald-600">19%</p>
                    <p className="text-sm text-slate-500">Biens et services</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-emerald-200">
                    <h4 className="font-semibold text-slate-800 mb-2">Taux Réduit</h4>
                    <p className="text-2xl font-bold text-emerald-600">9%</p>
                    <p className="text-sm text-slate-500">Produits alimentaires</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-200">
                  <p className="text-sm text-slate-600">
                    <strong>Formule:</strong> TVA = Montant HT × Taux TVA
                  </p>
                </div>
              </div>
            </div>
          )} */}

            {/* {actionComptableType === 'plan-comptable' && ( */}
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Plan Comptable SCF</h3>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-slate-800">Classe 4 - Comptes de Tiers</h4>
                    <p className="text-sm text-slate-500">411 - Clients, 401 - Fournisseurs</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-slate-800">Classe 5 - Comptes Financiers</h4>
                    <p className="text-sm text-slate-500">512 - Banque, 531 - Caisse</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-slate-800">Classe 7 - Comptes de Produits</h4>
                    <p className="text-sm text-slate-500">701 - Ventes de biens</p>
                  </div>
                </div>
              </div>
            </div>
            {/* )} */}

            {/* {actionComptableType === 'rapports' && (
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Rapports Comptables Disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleReportGeneration('grand-livre')}
                    className="p-3 bg-white rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors text-left"
                  >
                    <p className="font-medium text-slate-800">Grand Livre</p>
                    <p className="text-sm text-slate-500">Détail des comptes</p>
                  </button>
                  <button 
                    onClick={() => handleReportGeneration('balance')}
                    className="p-3 bg-white rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors text-left"
                  >
                    <p className="font-medium text-slate-800">Balance</p>
                    <p className="text-sm text-slate-500">Soldes des comptes</p>
                  </button>
                  <button 
                    onClick={() => handleReportGeneration('journal')}
                    className="p-3 bg-white rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors text-left"
                  >
                    <p className="font-medium text-slate-800">Journal</p>
                    <p className="text-sm text-slate-500">Chronologie des écritures</p>
                  </button>
                  <button 
                    onClick={() => handleReportGeneration('etat-tva')}
                    className="p-3 bg-white rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors text-left"
                  >
                    <p className="font-medium text-slate-800">État de TVA</p>
                    <p className="text-sm text-slate-500">Déclaration fiscale</p>
                  </button>
                </div>
              </div>
            </div>
          )} */}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsActionComptableModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  success(
                    'Action comptable exécutée',
                    "L'action comptable a été exécutée avec succès.",
                    [
                      'Les écritures comptables ont été générées automatiquement.',
                      'Les comptes ont été mis à jour selon les règles du plan comptable.',
                      'Vous pouvez consulter les détails dans le Grand Livre.'
                    ]
                  );
                  setIsActionComptableModalOpen(false);
                }}
                className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all duration-200"
              >
                Exécuter
              </button>
            </div>
          </div>
        </Modal>

        {/* Notification Modal */}
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

      {/* Modal Analyse de Rentabilité */}
      <Modal
        isOpen={isAnalyseRentabiliteModalOpen}
        onClose={() => setIsAnalyseRentabiliteModalOpen(false)}
        title="Analyse de Rentabilité par Client"
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              Analysez la rentabilité de vos clients basée sur le CA, la marge, le DSO et le taux de recouvrement.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Client</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">CA Total</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Marge Nette</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">DSO Moyen</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Taux Recouvrement</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Score</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Rentabilité</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {analysesRentabilite.map((analyse) => (
                  <tr key={analyse.clientId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{analyse.clientNom}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(analyse.caTotal)}</td>
                    <td className="px-4 py-3 text-sm text-right">{analyse.margeNette.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-sm text-right">{analyse.dsoMoyen.toFixed(0)}j</td>
                    <td className="px-4 py-3 text-sm text-right">{analyse.tauxRecouvrement.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${analyse.score >= 85 ? 'bg-green-100 text-green-800' :
                        analyse.score >= 70 ? 'bg-blue-100 text-blue-800' :
                          analyse.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {analyse.score}/100
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${analyse.rentabilite === 'excellente' ? 'bg-green-100 text-green-800' :
                        analyse.rentabilite === 'bonne' ? 'bg-blue-100 text-blue-800' :
                          analyse.rentabilite === 'moyenne' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                        {analyse.rentabilite}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setIsAnalyseRentabiliteModalOpen(false)}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Prévisions de Recouvrement */}
      <Modal
        isOpen={isPrevisionsRecouvrementModalOpen}
        onClose={() => setIsPrevisionsRecouvrementModalOpen(false)}
        title="Prévisions de Recouvrement"
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              Prévisions de recouvrement basées sur l'historique des clients, le délai de retard et le montant.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Facture</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Montant</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Date Échéance</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Date Prévision</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Délai Prévu</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Probabilité</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Confiance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {previsionsRecouvrement.map((prev) => (
                  <tr key={prev.factureId} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{prev.numeroFacture}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(prev.montant)}</td>
                    <td className="px-4 py-3 text-sm text-right">{new Date(prev.dateEcheance).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3 text-sm text-right">{new Date(prev.datePrevisionRecouvrement).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3 text-sm text-right">{prev.delaiPrevu}j</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-16 bg-slate-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${prev.probabiliteRecouvrement >= 80 ? 'bg-green-500' :
                              prev.probabiliteRecouvrement >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                            style={{ width: `${prev.probabiliteRecouvrement}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">{prev.probabiliteRecouvrement.toFixed(0)}%</span>
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
              onClick={() => setIsPrevisionsRecouvrementModalOpen(false)}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Propositions Escompte */}
      <Modal
        isOpen={isEscomptesModalOpen}
        onClose={() => setIsEscomptesModalOpen(false)}
        title="Propositions d'Escompte"
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-800">
              Propositions d'escompte pour accélérer le recouvrement des factures en retard.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Facture</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Montant Initial</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Taux Escompte</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Remise</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Montant Final</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Date Limite</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {propositionsEscompte.map((escompte) => (
                  <tr key={escompte.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{escompte.factureId}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(escompte.montantRemise + escompte.montantFinal)}</td>
                    <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">{escompte.taux}%</td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">-{formatCurrency(escompte.montantRemise)}</td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-green-600">{formatCurrency(escompte.montantFinal)}</td>
                    <td className="px-4 py-3 text-sm text-right">{new Date(escompte.dateLimite).toLocaleDateString('fr-FR')}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${escompte.statut === 'accepte' ? 'bg-green-100 text-green-800' :
                        escompte.statut === 'refuse' ? 'bg-red-100 text-red-800' :
                          escompte.statut === 'expire' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                        {escompte.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setIsEscomptesModalOpen(false)}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FacturesVente;
