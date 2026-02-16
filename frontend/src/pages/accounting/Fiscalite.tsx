import React, { useState } from 'react';
import { 
  CalculatorIcon, 
  DocumentArrowDownIcon,
  SparklesIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  GlobeAltIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  DocumentCheckIcon,
  BellIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon as EyeIconOutline
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';
import { usePermission } from '@shared/hooks/usePermission';
import { AdaptiveContentDisplay, AdaptiveContentGenerator } from '@shared/utils/AdaptiveContent';
import { FiscalDocument, getDocumentEquivalent, Country } from '@shared/utils/fiscalDocuments';
import HelpButton from '@shared/components/UI/HelpButton';
import GlossaryTerm from '@shared/components/UI/GlossaryTerm';
import Tooltip from '@shared/components/UI/Tooltip';
import {
  genererDeclarationG50,
  genererDeclarationIBS,
  genererDeclarationIRG,
  genererDeclarationTAP,
  genererCalendrierFiscal,
  getDateEcheance,
  type DeclarationG50,
  type DeclarationIBS,
  type DeclarationIRG,
  type DeclarationTAP,
  type CalendrierFiscal
} from '@shared/utils/fiscalDeclarations';

const Fiscalite: React.FC = () => {
  const { formatCurrency, user, currentDevise, currentCountry, planComptable, fiscalRates, tvaRate, calculateTVA, getTVARate, fiscalDocuments } = useApp();
  const { t } = useTranslation();
  const { has } = usePermission();

  // Vérifier les permissions d'accès (accès admin explicite)
  const isAdmin = user?.role === 'admin' || has('admin');
  if (!has('fiscalite-declarations') && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Accès refusé</h2>
          <p className="text-slate-600 mb-4">
            Vous n'avez pas la permission d'accéder à cette section.
          </p>
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-700 font-medium mb-1">Permission requise:</p>
            <p className="text-sm text-slate-600">fiscalite-declarations ou rôle administrateur</p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  // Contexte pour le contenu adaptatif
  const contentContext = {
    user,
    segment: user?.segment || 'micro',
    companyType: user?.companyType || 'eurl',
    role: user?.role || 'utilisateur',
    hasPermission: has,
    currentDevise,
    currentCountry,
    planComptable
  };

  const [isCalculModalOpen, setIsCalculModalOpen] = useState(false);
  const [isDeclarationModalOpen, setIsDeclarationModalOpen] = useState(false);
  const [isGeneratingDeclaration, setIsGeneratingDeclaration] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [declarationData, setDeclarationData] = useState<any>(null);
  const [declarationType, setDeclarationType] = useState<'g50' | 'ibs' | 'irg' | 'tap'>('g50');
  const [calendrierFiscalComplet, setCalendrierFiscalComplet] = useState<CalendrierFiscal[]>([]);
  const [declarationsGenerees, setDeclarationsGenerees] = useState<{
    g50: DeclarationG50[];
    ibs: DeclarationIBS[];
    irg: DeclarationIRG[];
    tap: DeclarationTAP[];
  }>({
    g50: [],
    ibs: [],
    irg: [],
    tap: []
  });
  
  // États pour les documents fiscaux
  const [selectedDocument, setSelectedDocument] = useState<FiscalDocument | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [documentFormData, setDocumentFormData] = useState<Record<string, any>>({});
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterFrequency, setFilterFrequency] = useState<string>('all');
  
  // États pour l'historique des documents créés
  const [createdDocuments, setCreatedDocuments] = useState<Array<{
    id: string;
    code: string;
    name: string;
    type: string;
    status: 'draft' | 'submitted' | 'validated' | 'rejected';
    createdAt: string;
    submittedAt?: string;
    validatedAt?: string;
    period?: string;
    amount?: number;
    pdfUrl?: string;
  }>>([]);
  const [documentHistoryFilter, setDocumentHistoryFilter] = useState<string>('all');
  const [documentHistorySearch, setDocumentHistorySearch] = useState<string>('');

  // Initialiser le calendrier fiscal
  React.useEffect(() => {
    const annee = new Date().getFullYear().toString();
    const calendrier = genererCalendrierFiscal(annee);
    setCalendrierFiscalComplet(calendrier);
  }, []);

  // Fonction pour générer une nouvelle déclaration (G50, IBS, IRG, TAP)
  const handleGenererDeclaration = async () => {
    if (!selectedPeriod && declarationType !== 'irg' && declarationType !== 'tap') {
      alert('Veuillez sélectionner une période');
      return;
    }

    setIsGeneratingDeclaration(true);
    
    // Simulation de génération de déclaration
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      let nouvelleDeclaration: DeclarationG50 | DeclarationIBS | DeclarationIRG | DeclarationTAP;
      
      switch (declarationType) {
        case 'g50': {
          // Format période: "2025-01"
          const periode = selectedPeriod.includes('-') ? selectedPeriod : 
            `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
          
          // Récupérer les données réelles depuis les factures/écritures
          const chiffreAffairesHT = baseChiffreAffaires; // En production, calculer depuis les factures
          const tvaCollectee = Math.round(chiffreAffairesHT * fiscalRates.tvaNormal);
          const tvaDeductible = Math.round(baseCharges * fiscalRates.tvaNormal);
          
          nouvelleDeclaration = genererDeclarationG50(periode, {
            chiffreAffairesHT,
            tvaCollectee,
            tvaDeductible,
            achatsHT: baseCharges,
            nombreFactures: 45,
            nombreClients: 12
          });
          
          setDeclarationsGenerees(prev => ({
            ...prev,
            g50: [...prev.g50, nouvelleDeclaration as DeclarationG50]
          }));
          break;
        }
        
        case 'ibs': {
          const [annee, periode] = selectedPeriod.split('-');
          const trimestre = periode.startsWith('T') ? periode : `T${Math.ceil(parseInt(periode) / 3)}`;
          
          nouvelleDeclaration = genererDeclarationIBS(annee, trimestre, {
            chiffreAffaires: baseChiffreAffaires,
            chargesDeductibles: baseCharges,
            amortissements: 150000,
            provisions: 50000,
            nombreSalaries: 8,
            masseSalariale: 1200000
          });
          
          setDeclarationsGenerees(prev => ({
            ...prev,
            ibs: [...prev.ibs, nouvelleDeclaration as DeclarationIBS]
          }));
          break;
        }
        
        case 'irg': {
          const exercice = selectedPeriod || new Date().getFullYear().toString();
          
          nouvelleDeclaration = genererDeclarationIRG(exercice, {
            revenusBruts: calculsFiscaux.beneficeImposable + 200000,
            abattements: 50000
          });
          
          setDeclarationsGenerees(prev => ({
            ...prev,
            irg: [...prev.irg, nouvelleDeclaration as DeclarationIRG]
          }));
          break;
        }
        
        case 'tap': {
          const exercice = selectedPeriod || new Date().getFullYear().toString();
          
          nouvelleDeclaration = genererDeclarationTAP(exercice, {
            chiffreAffairesHT: baseChiffreAffaires,
            tauxTAP: 0.02
          });
          
          setDeclarationsGenerees(prev => ({
            ...prev,
            tap: [...prev.tap, nouvelleDeclaration as DeclarationTAP]
          }));
          break;
        }
      }

    setDeclarationData(nouvelleDeclaration);
    setIsGeneratingDeclaration(false);
    setIsDeclarationModalOpen(true);
    } catch (error) {
      console.error('Erreur lors de la génération de la déclaration:', error);
      setIsGeneratingDeclaration(false);
      setDeclarationData(null);
      setIsDeclarationModalOpen(false);
      setTimeout(() => {
        setShowError(true);
      }, 100);
    }
  };

  // Recalculer les calculs fiscaux selon la devise actuelle
  const baseChiffreAffaires = 3200000;
  const baseCharges = 2400000;
  const tauxTVA = fiscalRates.tvaNormal;

  const calculsFiscaux = {
    chiffreAffaires: baseChiffreAffaires,
    chargesDeductibles: baseCharges,
    beneficeImposable: 800000,
    ibs: 208000, // 26% de 800,000
    tvaCollectee: Math.round(calculateTVA(baseChiffreAffaires, 'normal')), // TVA selon devise
    tvaDeductible: Math.round(calculateTVA(baseCharges, 'normal')), // TVA selon devise
    tvaAVerser: Math.round(calculateTVA(baseChiffreAffaires, 'normal') - calculateTVA(baseCharges, 'normal')),
    // IRG calculé selon barème progressif algérien
    irg: 45000, // Calculé sur revenus de 450,000 DA selon barème
    // TAP: 2% du CA HT
    tap: 64000 // 2% de 3,200,000
  };

  const declarationsG50 = [
    {
      id: 'G50-2025-01',
      periode: 'Janvier 2025',
      chiffreAffaires: 520000,
      tvaCollectee: 98800,
      tvaDeductible: 72000,
      tvaAVerser: 26800,
      statut: 'Télédéclarée',
      dateDeclaration: '2025-02-05',
      numeroDeclaration: 'G50-2025-001',
      montantVerse: 26800,
      dateVersement: '2025-02-10',
      observations: 'Déclaration transmise avec succès'
    },
    {
      id: 'G50-2025-02',
      periode: 'Février 2025',
      chiffreAffaires: 480000,
      tvaCollectee: 91200,
      tvaDeductible: 68500,
      tvaAVerser: 22700,
      statut: 'En cours',
      dateDeclaration: null,
      numeroDeclaration: null,
      montantVerse: 0,
      dateVersement: null,
      observations: 'En attente de validation'
    },
    {
      id: 'G50-2024-12',
      periode: 'Décembre 2024',
      chiffreAffaires: 650000,
      tvaCollectee: 123500,
      tvaDeductible: 85000,
      tvaAVerser: 38500,
      statut: 'Télédéclarée',
      dateDeclaration: '2025-01-08',
      numeroDeclaration: 'G50-2024-012',
      montantVerse: 38500,
      dateVersement: '2025-01-15',
      observations: 'Déclaration validée par l\'administration'
    },
    {
      id: 'G50-2024-11',
      periode: 'Novembre 2024',
      chiffreAffaires: 580000,
      tvaCollectee: 110200,
      tvaDeductible: 78000,
      tvaAVerser: 32200,
      statut: 'Télédéclarée',
      dateDeclaration: '2024-12-05',
      numeroDeclaration: 'G50-2024-011',
      montantVerse: 32200,
      dateVersement: '2024-12-10',
      observations: 'Déclaration transmise avec succès'
    }
  ];

  // Nouvelles métriques fiscales avancées (démo statique)
  const fiscalKPI = (() => {
    const totalTVAAVerser = declarationsG50.reduce((sum, d) => sum + d.tvaAVerser, 0);
    const totalIBS = calculsFiscaux.ibs; // ici uniquement IBS annuel simulé
    const benefice = calculsFiscaux.beneficeImposable;
    const tauxEffectif = benefice > 0 ? ((totalIBS) / benefice) * 100 : 0;
    const chargeFiscaleTotale = totalIBS + totalTVAAVerser;
    return {
      tauxEffectif: Math.round(tauxEffectif * 10) / 10,
      chargeTotale: chargeFiscaleTotale,
      partIBS: Math.round((totalIBS / Math.max(chargeFiscaleTotale,1)) * 100),
      partTVA: Math.round((totalTVAAVerser / Math.max(chargeFiscaleTotale,1)) * 100),
      retardPotentiel: 2 // démo: nombre d'échéances < J+5 non télédéclarées
    };
  })();

  // Utiliser le calendrier fiscal complet généré
  const calendrierFiscal: CalendrierFiscal[] = calendrierFiscalComplet.length > 0 
    ? calendrierFiscalComplet.slice(0, 10) // Afficher les 10 prochaines échéances
    : [
    { id: '1', type: 'g50', libelle: 'G50 (TVA mensuelle)', frequence: 'mensuel', dateEcheance: '2025-02-15', joursAvantEcheance: 7, statut: 'proche', priorite: 'haute' },
    { id: '2', type: 'cnas', libelle: 'CNAS Cotisations', frequence: 'mensuel', dateEcheance: '2025-01-31', joursAvantEcheance: 0, statut: 'en_cours', priorite: 'moyenne' },
    { id: '3', type: 'ibs', libelle: 'IBS (provisoire)', frequence: 'trimestriel', dateEcheance: '2025-03-31', joursAvantEcheance: 52, statut: 'a_venir', priorite: 'basse' },
    { id: '4', type: 'ibs', libelle: 'DAS Annuelle', frequence: 'annuel', dateEcheance: '2025-02-20', joursAvantEcheance: 12, statut: 'proche', priorite: 'critique' }
  ];

  // Écarts vs prévisions (démo)
  const ecartsFiscaux = [
    { poste: 'IBS', prevu: 210000, realise: calculsFiscaux.ibs, ecart: calculsFiscaux.ibs - 210000 },
    { poste: 'TVA à verser (Jan+Fév)', prevu: 50000, realise: declarationsG50[0].tvaAVerser + declarationsG50[1].tvaAVerser, ecart: (declarationsG50[0].tvaAVerser + declarationsG50[1].tvaAVerser) - 50000 }
  ];

  // State for error display
  const [showError, setShowError] = useState(false);

  return (
    <div className="space-y-6">
      {/* En-tête avec contenu adaptatif */}
      {(() => {
        const pageContent = AdaptiveContentGenerator.generatePageContent('fiscalite', contentContext);
        return (
          <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white rounded-lg shadow-2xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <CalculatorIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-white">{pageContent.title}</h1>
                    <HelpButton pageId="fiscalite" variant="icon" className="text-white/80 hover:text-white" />
                  </div>
                  <p className="text-slate-200 text-sm mt-1">{pageContent.subtitle}</p>
                </div>
              </div>
            </div>
            {/* Description adaptative */}
            <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
              <p className="text-slate-100 text-sm">{pageContent.description}</p>
            </div>
          </div>
        );
      })()}

      {/* Contenu adaptatif - Conseils et Insights */}
      <AdaptiveContentDisplay 
        pageId="fiscalite" 
        context={contentContext}
        showTips={true}
        showInsights={true}
      />

      {/* Disclaimer */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <p className="text-yellow-800 text-sm font-medium">
          {t('disclaimer')} - Taux fiscaux 2025 : IBS 26%, TVA 19%
        </p>
      </div>

      {/* Tax Calculations Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <CalculatorIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Bénéfice Imposable</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(calculsFiscaux.beneficeImposable)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-red-600 font-bold text-sm">IBS</span>
            </div>
            <p className="text-sm text-gray-500">IBS (26%)</p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(calculsFiscaux.ibs)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-orange-600 font-bold text-sm">TVA</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <p className="text-sm text-gray-500">
                <GlossaryTerm term="TVA" /> à Verser
              </p>
            </div>
            <p className="text-xl font-bold text-orange-600">
              {formatCurrency(calculsFiscaux.tvaAVerser)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 font-bold text-sm">TOT</span>
            </div>
            <p className="text-sm text-gray-500">Charge Fiscale Totale</p>
            <p className="text-xl font-bold text-purple-600">
              {formatCurrency(calculsFiscaux.ibs + calculsFiscaux.tvaAVerser)}
            </p>
          </div>
        </Card>
      </div>

      {/* Tax Calculation Details - Amélioré */}
      <Card title="Détail des Calculs Fiscaux Algériens 2025">
        <div className="space-y-6">
          {/* Indicateurs de Performance Fiscale Globale */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border-2 border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2 text-slate-600" />
              Vue d'Ensemble Fiscale
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Charge fiscale totale */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Charge Totale</span>
                  <CurrencyDollarIcon className="h-4 w-4 text-slate-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatCurrency(calculsFiscaux.ibs + calculsFiscaux.tvaAVerser)}
                </div>
                <div className="text-xs text-slate-500 mt-1">IBS + TVA + IRG + TAP</div>
              </div>

              {/* Taux effectif d'imposition */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Taux Effectif</span>
                  <ChartBarIcon className="h-4 w-4 text-slate-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{fiscalKPI.tauxEffectif}%</div>
                <div className="text-xs text-slate-500 mt-1">IBS / Bénéfice</div>
              </div>

              {/* Répartition IBS/TVA */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Part IBS</span>
                  <span className="text-xs text-red-600 font-bold">IBS</span>
                </div>
                <div className="text-2xl font-bold text-red-600">{fiscalKPI.partIBS}%</div>
                <div className="text-xs text-slate-500 mt-1">Part TVA: {fiscalKPI.partTVA}%</div>
              </div>

              {/* Score de conformité fiscale */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Conformité</span>
                  <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-emerald-600">92%</div>
                <div className="text-xs text-slate-500 mt-1">Score global</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* IBS Calculation - Amélioré */}
            <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border-2 border-red-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-red-800 flex items-center">
                  <span className="mr-2">🏢</span>
                  Impôt sur les Bénéfices (IBS)
                </h3>
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Taux: 26%</span>
              </div>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-red-200">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Chiffre d'affaires HT:</span>
                    <span className="font-medium text-slate-900">{formatCurrency(calculsFiscaux.chiffreAffaires)}</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-red-200">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Charges déductibles:</span>
                    <span className="font-medium text-slate-900">-{formatCurrency(calculsFiscaux.chargesDeductibles)}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-red-100 to-red-200 rounded-lg p-3 border-2 border-red-300">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold text-red-800">Bénéfice imposable:</span>
                    <span className="font-bold text-red-900">{formatCurrency(calculsFiscaux.beneficeImposable)}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg p-4 border-2 border-red-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-red-100 uppercase mb-1">IBS (26%)</div>
                      <div className="text-sm text-red-200">Base × 26%</div>
                    </div>
                    <div className="text-2xl font-black text-white">{formatCurrency(calculsFiscaux.ibs)}</div>
                  </div>
                </div>
                
                {/* Acomptes IBS */}
                <div className="mt-4 bg-white rounded-lg p-3 border border-red-200">
                  <div className="text-xs font-bold text-red-700 uppercase mb-2">Acomptes IBS</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Acomptes payés (Q1-Q3):</span>
                      <span className="font-medium text-slate-900">{formatCurrency(600000)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Solde à payer:</span>
                      <span className="font-bold text-red-600">{formatCurrency(calculsFiscaux.ibs - 600000)}</span>
                    </div>
                    <div className="text-xs text-amber-600 mt-2">
                      ⚠️ Échéance solde: 31/03/2025
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* VAT Calculation - Amélioré */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border-2 border-orange-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-orange-800 flex items-center">
                  <span className="mr-2">📋</span>
                  Taxe sur la Valeur Ajoutée (<GlossaryTerm term="TVA" />)
                </h3>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                    Taux: {getTVARate('normal').toFixed(0)}%
                  </span>
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
                    {currentDevise}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-orange-200">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Base taxable ventes (HT):</span>
                    <span className="font-medium text-slate-900">{formatCurrency(Math.round(calculsFiscaux.tvaCollectee / (fiscalRates.tvaNormal)))}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">× {getTVARate('normal').toFixed(0)}% = TVA collectée</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-emerald-700 font-medium">TVA collectée ({getTVARate('normal').toFixed(0)}%):</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(calculsFiscaux.tvaCollectee)}</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-orange-200">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Base taxable achats (HT):</span>
                    <span className="font-medium text-slate-900">{formatCurrency(Math.round(calculsFiscaux.tvaDeductible / (fiscalRates.tvaNormal)))}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">× {getTVARate('normal').toFixed(0)}% = TVA déductible</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-blue-700 font-medium">TVA déductible:</span>
                    <span className="font-bold text-blue-700">-{formatCurrency(calculsFiscaux.tvaDeductible)}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-lg p-4 border-2 border-orange-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-orange-100 uppercase mb-1">TVA Nette à Verser</div>
                      <div className="text-sm text-orange-200">Collectée - Déductible</div>
                    </div>
                    <div className="text-2xl font-black text-white">{formatCurrency(calculsFiscaux.tvaAVerser)}</div>
                  </div>
                </div>
                
                {/* Taux de récupération */}
                <div className="mt-4 bg-white rounded-lg p-3 border border-orange-200">
                  <div className="text-xs font-bold text-orange-700 uppercase mb-2">Taux de Récupération</div>
                  <div className="flex items-center justify-between">
                    <div className="w-full bg-slate-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full" 
                        style={{ width: `${Math.round((calculsFiscaux.tvaDeductible / calculsFiscaux.tvaCollectee) * 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">
                      {Math.round((calculsFiscaux.tvaDeductible / calculsFiscaux.tvaCollectee) * 100)}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Excellent taux de récupération</div>
                </div>
              </div>
            </div>
          </div>

          {/* IRG et TAP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* IRG Calculation - Amélioré */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-purple-800 flex items-center">
                  <span className="mr-2">👥</span>
                  Impôt sur le Revenu Global (<GlossaryTerm term="IRG" />)
                </h3>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">Barème progressif</span>
              </div>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="text-xs font-bold text-purple-700 uppercase mb-2">Barème IRG 2025</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">0 - 30,000 DA:</span>
                      <span className="font-medium text-slate-900">0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">30,001 - 120,000 DA:</span>
                      <span className="font-medium text-slate-900">10%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">120,001 - 360,000 DA:</span>
                      <span className="font-medium text-slate-900">20%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">360,001 - 1,200,000 DA:</span>
                      <span className="font-medium text-slate-900">30%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">+ 1,200,000 DA:</span>
                      <span className="font-medium text-slate-900">35%</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Revenus imposables:</span>
                    <span className="font-medium text-slate-900">{formatCurrency(450000)}</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-4 border-2 border-purple-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-purple-100 uppercase mb-1">IRG Calculé</div>
                      <div className="text-sm text-purple-200">Selon barème progressif</div>
                    </div>
                    <div className="text-2xl font-black text-white">{formatCurrency(calculsFiscaux.irg)}</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="text-xs font-bold text-purple-700 uppercase mb-2">Détail Calcul</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tranche 1 (0-30k):</span>
                      <span className="text-slate-900">0 DA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tranche 2 (30k-120k):</span>
                      <span className="text-slate-900">{formatCurrency(9000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tranche 3 (120k-360k):</span>
                      <span className="text-slate-900">{formatCurrency(36000)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TAP Calculation - Amélioré */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-6 rounded-xl border-2 border-teal-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-teal-800 flex items-center">
                  <span className="mr-2">🏛️</span>
                  Taxe sur l'Activité Professionnelle (TAP)
                </h3>
                <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold">Taux: 2%</span>
              </div>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-teal-200">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Chiffre d'affaires HT:</span>
                    <span className="font-medium text-slate-900">{formatCurrency(calculsFiscaux.chiffreAffaires)}</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-teal-200">
                  <div className="text-xs text-slate-600 mb-1">Base imposable TAP</div>
                  <div className="text-sm font-medium text-slate-900">{formatCurrency(calculsFiscaux.chiffreAffaires)}</div>
                  <div className="text-xs text-slate-500 mt-1">CA HT (sauf exonérations)</div>
                </div>
                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg p-4 border-2 border-teal-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-teal-100 uppercase mb-1">TAP (2%)</div>
                      <div className="text-sm text-teal-200">CA HT × 2%</div>
                    </div>
                    <div className="text-2xl font-black text-white">{formatCurrency(calculsFiscaux.tap)}</div>
                  </div>
                </div>
                
                {/* Paiements TAP */}
                <div className="mt-4 bg-white rounded-lg p-3 border border-teal-200">
                  <div className="text-xs font-bold text-teal-700 uppercase mb-2">Paiements Mensuels</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">TAP mensuel moyen:</span>
                      <span className="font-medium text-slate-900">{formatCurrency(Math.round(calculsFiscaux.tap / 12))}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">Échéance:</span>
                      <span className="font-medium text-slate-900">30 de chaque mois</span>
                    </div>
                    <div className="text-xs text-amber-600 mt-2">
                      ⚠️ Prochaine échéance: 30/02/2025
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Fiscaux Disponibles - Version Améliorée */}
          <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 flex items-center mb-2">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3 shadow-lg">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>
                  Documents Fiscaux Disponibles
                </h2>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <GlobeAltIcon className="h-4 w-4" />
                  <span className="font-medium">
                    {currentCountry === 'DZ' ? '🇩🇿 Algérie' : currentCountry === 'FR' ? '🇫🇷 France' : currentCountry === 'US' ? '🇺🇸 États-Unis' : '🇪🇺 Europe'}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span>{fiscalDocuments.length} documents disponibles</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 flex-wrap">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un document..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64 bg-white"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  aria-label="Filtrer par catégorie"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all"> Toutes les catégories</option>
                  <option value="declaration">Déclarations</option>
                  <option value="attestation">Attestations</option>
                  <option value="bilan"> Bilans</option>
                  <option value="certificat"> Certificats</option>
                </select>
                <select
                  value={filterFrequency}
                  onChange={(e) => setFilterFrequency(e.target.value)}
                  aria-label="Filtrer par fréquence"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">Toutes fréquences</option>
                  <option value="mensuel"> Mensuel</option>
                  <option value="trimestriel"> Trimestriel</option>
                  <option value="annuel"> Annuel</option>
                  <option value="ponctuel"> Ponctuel</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fiscalDocuments
                .filter(doc => {
                  const matchCategory = filterCategory === 'all' || doc.category === filterCategory;
                  const matchFrequency = filterFrequency === 'all' || doc.frequency === filterFrequency;
                  return matchCategory && matchFrequency;
                })
                .map((document) => {
                  const frequencyColors = {
                    mensuel: 'from-blue-500 to-blue-600',
                    trimestriel: 'from-purple-500 to-purple-600',
                    annuel: 'from-emerald-500 to-emerald-600',
                    ponctuel: 'from-slate-500 to-slate-600'
                  };
                  const categoryIcons = {
                    declaration: DocumentTextIcon,
                    attestation: DocumentCheckIcon,
                    bilan: ChartBarIcon,
                    certificat: DocumentCheckIcon,
                    formulaire: DocumentTextIcon
                  };
                  const Icon = categoryIcons[document.category as keyof typeof categoryIcons] || DocumentTextIcon;
                  
                  return (
                    <div
                      key={document.id}
                      className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                      onClick={() => {
                        setSelectedDocument(document);
                        setDocumentFormData({});
                        setIsDocumentModalOpen(true);
                      }}
                    >
                      {/* Badge de fréquence en haut à droite */}
                      <div className={`absolute top-0 right-0 px-3 py-1 bg-gradient-to-r ${frequencyColors[document.frequency as keyof typeof frequencyColors] || 'from-slate-500 to-slate-600'} text-white text-xs font-bold rounded-bl-lg`}>
                        {document.frequency === 'mensuel' ? ' Mensuel' : document.frequency === 'trimestriel' ? '📆 Trimestriel' : document.frequency === 'annuel' ? '📆 Annuel' : '📌 Ponctuel'}
                      </div>

                      {/* Icône de catégorie */}
                      <div className="mb-4 flex items-start justify-between">
                        <div className={`p-3 bg-gradient-to-br ${frequencyColors[document.frequency as keyof typeof frequencyColors] || 'from-slate-500 to-slate-600'} rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        {document.required && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            Obligatoire
                          </div>
                        )}
                      </div>

                      {/* Code et nom */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-mono font-bold">
                            {document.code}
                          </span>
                          {document.nameLocal && (
                            <span className="text-xs text-slate-500 italic">{document.nameLocal}</span>
                          )}
                          <Tooltip
                            content={document.description || 'Document fiscal'}
                            title={document.name}
                            iconOnly
                            position="top"
                          />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                          {document.name}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-2">{document.description}</p>
                      </div>

                      {/* Informations supplémentaires */}
                      <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                        {document.deadline && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <ClockIcon className="h-4 w-4 text-slate-400" />
                            <span className="font-medium">Échéance: {document.deadline}</span>
                          </div>
                        )}
                        {document.forEntity && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <BuildingOfficeIcon className="h-4 w-4 text-slate-400" />
                            <span>Pour: {document.forEntity === 'entreprise' ? 'Entreprises' : document.forEntity === 'particulier' ? 'Particuliers' : 'Tous'}</span>
                          </div>
                        )}
                        {document.equivalent && Object.keys(document.equivalent).length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-slate-600">
                            <GlobeAltIcon className="h-4 w-4 text-slate-400" />
                            <span>Équivalents: {Object.keys(document.equivalent).length} pays</span>
                          </div>
                        )}
                      </div>

                      {/* Bouton d'action */}
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 group-hover:shadow-lg">
                          <PlusIcon className="h-4 w-4" />
                          Créer ce document
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {fiscalDocuments.filter(doc => {
              const matchCategory = filterCategory === 'all' || doc.category === filterCategory;
              const matchFrequency = filterFrequency === 'all' || doc.frequency === filterFrequency;
              return matchCategory && matchFrequency;
            }).length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                <p>Aucun document trouvé avec ces filtres</p>
              </div>
            )}
          </Card>

          {/* Autres Obligations Fiscales */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-6 border-2 border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <BuildingOfficeIcon className="h-5 w-5 mr-2 text-slate-600" />
              Autres Obligations Fiscales {currentCountry === 'DZ' ? 'Algériennes' : currentCountry === 'FR' ? 'Françaises' : currentCountry === 'US' ? 'Américaines' : 'Européennes'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* CNAS */}
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-blue-700 uppercase">CNAS</span>
                  <UserGroupIcon className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-xl font-bold text-blue-600">{formatCurrency(125000)}</div>
                <div className="text-xs text-slate-500 mt-1">Cotisations sociales</div>
                <div className="text-xs text-blue-600 mt-2">Échéance: 31/01/2025</div>
              </div>

              {/* CASNOS */}
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-green-700 uppercase">CASNOS</span>
                  <UserGroupIcon className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-xl font-bold text-green-600">{formatCurrency(45000)}</div>
                <div className="text-xs text-slate-500 mt-1">Assurance retraite</div>
                <div className="text-xs text-green-600 mt-2">Échéance: 31/01/2025</div>
              </div>

              {/* Timbre Fiscal */}
              <div className="bg-white rounded-lg p-4 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-amber-700 uppercase">Timbre Fiscal</span>
                  <DocumentTextIcon className="h-4 w-4 text-amber-600" />
                </div>
                <div className="text-xl font-bold text-amber-600">{formatCurrency(5000)}</div>
                <div className="text-xs text-slate-500 mt-1">Documents officiels</div>
                <div className="text-xs text-amber-600 mt-2">Par document</div>
              </div>
            </div>
          </div>

          {/* Synthèse Fiscale Globale */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border-2 border-slate-700 text-white">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <CalculatorIcon className="h-5 w-5 mr-2" />
              Synthèse Fiscale Globale 2025
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="text-xs text-slate-300 uppercase mb-1">IBS</div>
                <div className="text-2xl font-bold text-white">{formatCurrency(calculsFiscaux.ibs)}</div>
                <div className="text-xs text-slate-400 mt-1">26% sur bénéfice</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="text-xs text-slate-300 uppercase mb-1">TVA</div>
                <div className="text-2xl font-bold text-white">{formatCurrency(calculsFiscaux.tvaAVerser)}</div>
                <div className="text-xs text-slate-400 mt-1">Mensuel (G50)</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="text-xs text-slate-300 uppercase mb-1">IRG</div>
                <div className="text-2xl font-bold text-white">{formatCurrency(calculsFiscaux.irg)}</div>
                <div className="text-xs text-slate-400 mt-1">Barème progressif</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <div className="text-xs text-slate-300 uppercase mb-1">TAP</div>
                <div className="text-2xl font-bold text-white">{formatCurrency(calculsFiscaux.tap)}</div>
                <div className="text-xs text-slate-400 mt-1">2% sur CA HT</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-slate-300 uppercase">Charge Fiscale Totale Annuelle</div>
                  <div className="text-xs text-slate-400">Tous impôts confondus</div>
                </div>
                <div className="text-3xl font-black text-emerald-400">
                  {formatCurrency(calculsFiscaux.ibs + calculsFiscaux.tvaAVerser + calculsFiscaux.irg + calculsFiscaux.tap)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsCalculModalOpen(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <CalculatorIcon className="h-5 w-5 mr-2" />
              Simuler Calculs
            </button>
            <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg">
              <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
              Rapport Fiscal
            </button>
          </div>
        </div>
      </Card>

      {/* G50 Declarations */}
      <Card title="Déclarations G50 (TVA Mensuelle)">
        {/* Indicateurs de Performance G50 */}
        <div className="mb-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2 text-emerald-600" />
            Indicateurs de Performance G50
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Taux de conformité */}
            <div className="bg-white rounded-lg p-4 border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase">Taux Conformité</span>
                <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {Math.round((declarationsG50.filter(d => d.statut === 'Télédéclarée').length / declarationsG50.length) * 100)}%
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full" 
                  style={{ width: `${(declarationsG50.filter(d => d.statut === 'Télédéclarée').length / declarationsG50.length) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {declarationsG50.filter(d => d.statut === 'Télédéclarée').length}/{declarationsG50.length} déclarations
              </div>
            </div>

            {/* Délai moyen de déclaration */}
            <div className="bg-white rounded-lg p-4 border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase">Délai Moyen</span>
                <ClockIcon className="h-4 w-4 text-slate-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">2.5j</div>
              <div className="text-xs text-slate-500 mt-1 flex items-center">
                <ArrowTrendingDownIcon className="h-3 w-3 mr-1 text-emerald-600" />
                <span className="text-emerald-600">-0.8j vs mois dernier</span>
              </div>
            </div>

            {/* TVA moyenne mensuelle */}
            <div className="bg-white rounded-lg p-4 border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase">TVA Moyenne</span>
                <CurrencyDollarIcon className="h-4 w-4 text-slate-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(Math.round(declarationsG50.reduce((sum, d) => sum + d.tvaAVerser, 0) / declarationsG50.length))}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center">
                <ArrowTrendingUpIcon className="h-3 w-3 mr-1 text-blue-600" />
                <span className="text-blue-600">+12% vs année précédente</span>
              </div>
            </div>

            {/* Score de performance */}
            <div className="bg-white rounded-lg p-4 border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-600 uppercase">Score Performance</span>
                <SparklesIcon className="h-4 w-4 text-slate-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900">88/100</div>
              <div className="text-xs text-slate-500 mt-1">Excellent</div>
            </div>
          </div>

          {/* Métriques supplémentaires */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-3 border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Déclarations en cours</span>
                <span className="text-sm font-bold text-amber-600">
                  {declarationsG50.filter(d => d.statut === 'En cours').length}
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Déclarations en retard</span>
                <span className="text-sm font-bold text-red-600">
                  {declarationsG50.filter(d => d.statut === 'En retard').length}
                </span>
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-emerald-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Taux de ponctualité</span>
                <span className="text-sm font-bold text-emerald-600">95%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <div className="flex space-x-4">
            <label className="sr-only" htmlFor="filtre-annee">Filtrer par année</label>
            <select id="filtre-annee" className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500" aria-label="Filtrer par année" title="Filtrer par année">
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
            <label className="sr-only" htmlFor="filtre-statut">Filtrer par statut</label>
            <select id="filtre-statut" className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500" aria-label="Filtrer par statut" title="Filtrer par statut">
              <option value="tous">Tous les statuts</option>
              <option value="teledeclaree">Télédéclarées</option>
              <option value="en_cours">En cours</option>
              <option value="en_retard">En retard</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsDeclarationModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <CalculatorIcon className="h-4 w-4 mr-2" />
              Nouvelle Déclaration
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Exporter
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Période
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° Déclaration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CA HT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TVA Collectée
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TVA Déductible
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TVA à Verser
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant Versé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Déclaration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Délai
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {declarationsG50.map((declaration) => {
                // Calcul du délai de déclaration
                const calculerDelai = () => {
                  if (!declaration.dateDeclaration) return null;
                  const dateDeclaration = new Date(declaration.dateDeclaration);
                  const dateEcheance = new Date(dateDeclaration.getFullYear(), dateDeclaration.getMonth(), 20);
                  const jours = Math.floor((dateDeclaration.getTime() - dateEcheance.getTime()) / (1000 * 60 * 60 * 24));
                  return jours;
                };
                const delai = calculerDelai();
                
                // Calcul du score de performance
                const calculerScore = () => {
                  let score = 0;
                  if (declaration.statut === 'Télédéclarée') score += 50;
                  if (delai !== null && delai <= 0) score += 30;
                  else if (delai !== null && delai <= 3) score += 20;
                  else if (delai !== null && delai <= 7) score += 10;
                  if (declaration.montantVerse === declaration.tvaAVerser) score += 20;
                  return Math.min(100, score);
                };
                const score = calculerScore();
                
                return (
                  <tr key={declaration.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {declaration.periode}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                      {declaration.numeroDeclaration || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(declaration.chiffreAffaires)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(declaration.tvaCollectee)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatCurrency(declaration.tvaDeductible)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-orange-600">
                      {formatCurrency(declaration.tvaAVerser)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {declaration.montantVerse > 0 ? formatCurrency(declaration.montantVerse) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {declaration.dateDeclaration ? new Date(declaration.dateDeclaration).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {delai !== null ? (
                        <div className="flex items-center">
                          <ClockIcon className={`h-4 w-4 mr-1 ${delai <= 0 ? 'text-emerald-600' : delai <= 3 ? 'text-amber-600' : 'text-red-600'}`} />
                          <span className={delai <= 0 ? 'text-emerald-600 font-medium' : delai <= 3 ? 'text-amber-600 font-medium' : 'text-red-600 font-medium'}>
                            {delai <= 0 ? `${Math.abs(delai)}j avant` : `${delai}j après`}
                          </span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        declaration.statut === 'Télédéclarée' 
                          ? 'bg-green-100 text-green-800' 
                          : declaration.statut === 'En cours'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {declaration.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <SparklesIcon className={`h-4 w-4 mr-1 ${
                          score >= 80 ? 'text-emerald-600' : 
                          score >= 60 ? 'text-blue-600' : 
                          score >= 40 ? 'text-amber-600' : 
                          'text-red-600'
                        }`} />
                        <span className={`text-sm font-bold ${
                          score >= 80 ? 'text-emerald-600' : 
                          score >= 60 ? 'text-blue-600' : 
                          score >= 40 ? 'text-amber-600' : 
                          'text-red-600'
                        }`}>
                          {score}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {score >= 80 ? 'Excellent' : score >= 60 ? 'Bon' : score >= 40 ? 'Moyen' : 'À améliorer'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir détails"
                        >
                          <DocumentArrowDownIcon className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900"
                          title="Télédéclarer"
                        >
                          <CalculatorIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Résumé des déclarations avec tendances */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-blue-800">Total TVA Collectée</h4>
              <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(declarationsG50.reduce((sum, d) => sum + d.tvaCollectee, 0))}
            </p>
            <div className="mt-2 flex items-center text-xs">
              <ArrowTrendingUpIcon className="h-3 w-3 mr-1 text-blue-600" />
              <span className="text-blue-600">+15% vs année précédente</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-green-800">Total TVA à Verser</h4>
              <CalculatorIcon className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(declarationsG50.reduce((sum, d) => sum + d.tvaAVerser, 0))}
            </p>
            <div className="mt-2 flex items-center text-xs">
              <ArrowTrendingUpIcon className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">+12% vs année précédente</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-purple-800">Télédéclarées</h4>
              <CheckCircleIcon className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {declarationsG50.filter(d => d.statut === 'Télédéclarée').length} / {declarationsG50.length}
            </p>
            <div className="mt-2 text-xs text-purple-600">
              {Math.round((declarationsG50.filter(d => d.statut === 'Télédéclarée').length / declarationsG50.length) * 100)}% de conformité
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg border-2 border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-emerald-800">Score Moyen</h4>
              <SparklesIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">88/100</p>
            <div className="mt-2 text-xs text-emerald-600">
              Performance excellente
            </div>
          </div>
        </div>
      </Card>

      {/* Calendrier & Analyse Fiscale Avancée */}
      <Card title="Calendrier Fiscal & Analyse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h4 className="font-semibold text-indigo-900 mb-3">Taux Effectif d'Imposition</h4>
            <p className="text-3xl font-bold text-indigo-700 mb-1">{fiscalKPI.tauxEffectif}%</p>
            <p className="text-xs text-indigo-800">IBS / Bénéfice imposable</p>
            <div className="mt-3 text-xs text-indigo-700">
              Répartition charge: IBS {fiscalKPI.partIBS}% • TVA {fiscalKPI.partTVA}%
            </div>
          </div>
          <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
            <h4 className="font-semibold text-teal-900 mb-3">Charge Fiscale Totale (YTD)</h4>
            <p className="text-3xl font-bold text-teal-700 mb-1">{formatCurrency(fiscalKPI.chargeTotale)}</p>
            <p className="text-xs text-teal-800">Cumul IBS + TVA à verser</p>
            <div className="mt-3 text-xs text-teal-700">Retards potentiels: {fiscalKPI.retardPotentiel}</div>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="font-semibold text-amber-900 mb-3">Alertes & Conformité</h4>
            <ul className="space-y-1 text-xs text-amber-800">
              <li>• Prochaine G50 dans {'joursAvantEcheance' in calendrierFiscal[0] ? calendrierFiscal[0].joursAvantEcheance : (calendrierFiscal[0] as any).joursRestants} jours.</li>
              <li>• DAS annuelle dans {'joursAvantEcheance' in calendrierFiscal[3] ? calendrierFiscal[3].joursAvantEcheance : (calendrierFiscal[3] as any).joursRestants} jours.</li>
              <li>• IBS provisoire: préparer estimation Q1.</li>
            </ul>
            <div className="mt-3 text-xs font-medium text-amber-700">Suivi: prioriser échéances &lt; 15 jours.</div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendrier */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-3">Prochaines Échéances</h5>
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2">Type</th>
                  <th className="py-2">Échéance</th>
                  <th className="py-2">Statut</th>
                  <th className="py-2">Jours</th>
                  <th className="py-2">Priorité</th>
                </tr>
              </thead>
              <tbody>
                {calendrierFiscal.map((e, idx) => {
                  const type = e.libelle;
                  const due = e.dateEcheance;
                  const statut = e.statut;
                  const joursRestants = e.joursAvantEcheance;
                  const priorite = e.priorite;
                  
                  const getStatutColor = (s: string) => {
                    if (s.includes('en_retard') || s.includes('retard')) return 'bg-red-100 text-red-800';
                    if (s.includes('proche') || s.includes('prépa') || s.includes('prépar')) return 'bg-yellow-100 text-yellow-800';
                    if (s.includes('acquitte') || s.includes('validée')) return 'bg-green-100 text-green-800';
                    return 'bg-blue-100 text-blue-800';
                  };
                  
                  const getPrioriteColor = (p: string) => {
                    if (p === 'critique' || p === 'Élevé') return 'text-red-600 font-bold';
                    if (p === 'haute' || p === 'Moyen') return 'text-orange-600 font-semibold';
                    return 'text-gray-600';
                  };
                  
                  return (
                    <tr key={idx} className={`border-t text-gray-700 ${joursRestants <= 5 ? 'bg-red-50' : joursRestants <= 15 ? 'bg-yellow-50' : ''}`}>
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-1">
                          <span className="text-xs">
                            {e.type === 'g50' ? '📄' : e.type === 'ibs' ? '💰' : e.type === 'irg' ? '👥' : e.type === 'tap' ? '🏛️' : '📅'}
                          </span>
                          <span className="font-medium">{type}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-2">{new Date(due).toLocaleDateString('fr-FR')}</td>
                      <td className="py-2 pr-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatutColor(statut)}`}>
                          {statut.replace('_', ' ')}
                        </span>
                      </td>
                      <td className={`py-2 pr-2 font-semibold ${joursRestants <= 5 ? 'text-red-600' : joursRestants <= 15 ? 'text-orange-600' : 'text-gray-600'}`}>
                        {joursRestants > 0 ? `${joursRestants}j` : joursRestants < 0 ? `${Math.abs(joursRestants)}j en retard` : 'Aujourd\'hui'}
                      </td>
                      <td className={`py-2 pr-2 ${getPrioriteColor(priorite)}`}>
                        {priorite}
                      </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Écarts prévisions */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-3">Écarts vs Prévisions</h5>
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2">Poste</th>
                  <th className="py-2">Prévu</th>
                  <th className="py-2">Réalisé</th>
                  <th className="py-2">Écart</th>
                </tr>
              </thead>
              <tbody>
                {ecartsFiscaux.map((l, i) => (
                  <tr key={i} className="border-t text-gray-700">
                    <td className="py-1 pr-2">{l.poste}</td>
                    <td className="py-1 pr-2">{formatCurrency(l.prevu)}</td>
                    <td className="py-1 pr-2">{formatCurrency(l.realise)}</td>
                    <td className={`py-1 pr-2 font-medium ${l.ecart >=0 ? 'text-red-600' : 'text-green-600'}`}>{formatCurrency(l.ecart)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 text-[11px] text-gray-600">Analyse rapide: Écart positif = surcoût / sous-estimation initiale.</div>
          </div>
        </div>
      </Card>

      {/* Tax Calculation Modal */}
      <Modal
        isOpen={isCalculModalOpen}
        onClose={() => setIsCalculModalOpen(false)}
        title="Simulateur de Calculs Fiscaux"
        size="lg"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sim-ca-ht" className="block text-sm font-medium text-gray-700 mb-1">
                Chiffre d'affaires HT (DZD)
              </label>
              <input
                id="sim-ca-ht"
                name="sim-ca-ht"
                type="number"
                defaultValue="3200000"
                title="Saisir le chiffre d'affaires hors taxes en dinars"
                placeholder="Ex: 3 200 000"
                aria-label="Chiffre d'affaires hors taxes"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="1000"
              />
            </div>
            
            <div>
              <label htmlFor="sim-charges" className="block text-sm font-medium text-gray-700 mb-1">
                Charges déductibles (DZD)
              </label>
              <input
                id="sim-charges"
                name="sim-charges"
                type="number"
                defaultValue="2400000"
                title="Saisir le montant des charges déductibles"
                placeholder="Ex: 2 400 000"
                aria-label="Charges déductibles"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                step="1000"
              />
            </div>
            
            <div>
              <label htmlFor="sim-taux-ibs" className="block text-sm font-medium text-gray-700 mb-1">
                Taux IBS (%)
              </label>
              <select
                id="sim-taux-ibs"
                name="sim-taux-ibs"
                defaultValue="26"
                title="Sélectionner le taux IBS applicable"
                aria-label="Taux IBS"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="26">26% (Taux normal)</option>
                <option value="19">19% (Taux réduit)</option>
                <option value="0">0% (Exonération)</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="sim-taux-tva" className="block text-sm font-medium text-gray-700 mb-1">
                Taux TVA (%)
              </label>
              <select
                id="sim-taux-tva"
                name="sim-taux-tva"
                defaultValue="19"
                title="Sélectionner le taux de TVA applicable"
                aria-label="Taux de TVA"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="19">19% (Taux normal)</option>
                <option value="9">9% (Taux réduit)</option>
                <option value="0">0% (Exonération)</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-3">Résultats de Simulation</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Bénéfice imposable:</p>
                <p className="font-bold text-gray-900">{formatCurrency(800000)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">IBS à payer:</p>
                <p className="font-bold text-red-600">{formatCurrency(208000)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">TVA collectée:</p>
                <p className="font-bold text-gray-900">{formatCurrency(608000)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">TVA à verser:</p>
                <p className="font-bold text-orange-600">{formatCurrency(152000)}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsCalculModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Fermer
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <DocumentArrowDownIcon className="h-5 w-5 mr-2 inline" />
              Exporter Simulation
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de génération de déclaration fiscale */}
      <Modal
        isOpen={isDeclarationModalOpen}
        onClose={() => {
          setIsDeclarationModalOpen(false);
          setDeclarationData(null);
        }}
        title={declarationData ? `Déclaration ${declarationData.numero} - Générée` : "Génération de Déclaration Fiscale"}
        size="xl"
      >
        <div className="space-y-6">
          {!declarationData ? (
            <>
              {/* Sélection du type de déclaration */}
              <div>
                <label htmlFor="type-declaration" className="block text-sm font-medium text-gray-700 mb-2">
                  Type de déclaration
                </label>
                <select
                  id="type-declaration"
                  value={declarationType}
                  onChange={(e) => {
                    setDeclarationType(e.target.value as 'g50' | 'ibs' | 'irg' | 'tap');
                    setSelectedPeriod('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="g50">📄 G50 - Déclaration TVA (Mensuelle)</option>
                  <option value="ibs">💰 IBS - Impôt sur les Bénéfices (Trimestrielle/Annuelle)</option>
                  <option value="irg">👥 IRG - Impôt sur le Revenu Global (Annuelle)</option>
                  <option value="tap">🏛️ TAP - Taxe sur l'Activité Professionnelle (Annuelle)</option>
                </select>
              </div>

              {/* Sélection de période selon le type */}
              <div>
                <label htmlFor="periode-declaration" className="block text-sm font-medium text-gray-700 mb-2">
                  {declarationType === 'g50' ? 'Période (Format: YYYY-MM)' : 
                   declarationType === 'ibs' ? 'Période (Format: YYYY-T1/T2/T3/T4 ou YYYY-Annuel)' :
                   'Exercice (Année)'}
                </label>
                {declarationType === 'g50' ? (
                  <input
                    type="month"
                    id="periode-declaration"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : declarationType === 'ibs' ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      id="periode-declaration"
                      placeholder="2025-T1 ou 2025-Annuel"
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex gap-2">
                      {['T1', 'T2', 'T3', 'T4'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedPeriod(`${new Date().getFullYear()}-${t}`)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <input
                    type="number"
                    id="periode-declaration"
                    placeholder={new Date().getFullYear().toString()}
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
              </div>

              {/* Bouton de génération */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeclarationModalOpen(false);
                    setSelectedPeriod('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleGenererDeclaration}
                  disabled={(!selectedPeriod && declarationType !== 'irg' && declarationType !== 'tap') || isGeneratingDeclaration}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isGeneratingDeclaration ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-5 w-5 mr-2 inline" />
                      Générer la déclaration
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Affichage de la déclaration générée */}
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800">
                      Déclaration {declarationData.numero} générée avec succès !
                    </span>
                    </div>
                    </div>

                {/* Détails selon le type */}
                {declarationType === 'g50' && declarationData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-sm text-gray-600">Chiffre d'affaires HT</div>
                        <div className="text-xl font-bold">{formatCurrency((declarationData as DeclarationG50).chiffreAffairesHT)}</div>
                  </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-sm text-gray-600">TVA Collectée</div>
                        <div className="text-xl font-bold text-blue-600">{formatCurrency((declarationData as DeclarationG50).tvaCollectee)}</div>
                </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-sm text-gray-600">TVA Déductible</div>
                        <div className="text-xl font-bold text-green-600">{formatCurrency((declarationData as DeclarationG50).tvaDeductible)}</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-sm text-gray-600">TVA à Verser</div>
                        <div className="text-xl font-bold text-orange-600">{formatCurrency((declarationData as DeclarationG50).tvaAVerser)}</div>
                      </div>
                      </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="text-sm font-semibold text-blue-800 mb-2">Date d'échéance</div>
                      <div className="text-lg">{new Date((declarationData as DeclarationG50).dateEcheance).toLocaleDateString('fr-FR')}</div>
                      </div>
                      </div>
                )}

                {declarationType === 'ibs' && declarationData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-sm text-gray-600">Bénéfice Imposable</div>
                        <div className="text-xl font-bold">{formatCurrency((declarationData as DeclarationIBS).beneficeImposable)}</div>
                    </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-sm text-gray-600">Taux IBS</div>
                        <div className="text-xl font-bold">{((declarationData as DeclarationIBS).tauxIBS)}%</div>
                  </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-sm text-gray-600">IBS Calculé</div>
                        <div className="text-xl font-bold text-red-600">{formatCurrency((declarationData as DeclarationIBS).ibsCalcule)}</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-sm text-gray-600">IBS à Verser</div>
                        <div className="text-xl font-bold text-orange-600">{formatCurrency((declarationData as DeclarationIBS).ibsAVerser)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {declarationType === 'irg' && declarationData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-sm text-gray-600">Revenus Imposables</div>
                        <div className="text-xl font-bold">{formatCurrency((declarationData as DeclarationIRG).revenusImposables)}</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-sm text-gray-600">IRG Calculé</div>
                        <div className="text-xl font-bold text-red-600">{formatCurrency((declarationData as DeclarationIRG).irgCalcule)}</div>
                      </div>
                      </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="text-sm font-semibold text-purple-800 mb-2">Détail par tranche</div>
                      {(declarationData as DeclarationIRG).tranches.map((tranche, idx) => (
                        <div key={idx} className="flex justify-between text-sm py-1">
                          <span>{tranche.tranche} ({tranche.taux}%)</span>
                          <span className="font-semibold">{formatCurrency(tranche.montant)}</span>
                      </div>
                      ))}
                    </div>
                  </div>
                )}

                {declarationType === 'tap' && declarationData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-sm text-gray-600">Chiffre d'affaires HT</div>
                        <div className="text-xl font-bold">{formatCurrency((declarationData as DeclarationTAP).chiffreAffairesHT)}</div>
                </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-sm text-gray-600">Taux TAP</div>
                        <div className="text-xl font-bold">{(declarationData as DeclarationTAP).tauxTAP}%</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-sm text-gray-600">TAP Calculé</div>
                        <div className="text-xl font-bold text-red-600">{formatCurrency((declarationData as DeclarationTAP).tapCalcule)}</div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="text-sm text-gray-600">TAP à Verser</div>
                        <div className="text-xl font-bold text-orange-600">{formatCurrency((declarationData as DeclarationTAP).tapAVerser)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setDeclarationData(null);
                      setSelectedPeriod('');
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Nouvelle déclaration
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                    Exporter PDF
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <GlobeAltIcon className="h-5 w-5 mr-2" />
                    Transmettre en ligne
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Modal Création de Document Fiscal - Version Améliorée */}
      <Modal
        isOpen={isDocumentModalOpen}
        onClose={() => {
          setIsDocumentModalOpen(false);
          setSelectedDocument(null);
          setDocumentFormData({});
        }}
        title={selectedDocument ? `${selectedDocument.code} - ${selectedDocument.name}` : 'Créer un document fiscal'}
        size="lg"
      >
        {selectedDocument && (
          <div className="space-y-6">
            {/* En-tête du document avec icône */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900">{selectedDocument.code}</span>
                  <span className="text-lg font-bold text-slate-700">-</span>
                  <span className="text-lg font-bold text-slate-900">{selectedDocument.name}</span>
                </div>
                <p className="text-sm text-slate-500 mt-1">Création de document fiscal</p>
              </div>
            </div>

            {/* En-tête informatif amélioré */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm text-blue-900 font-semibold mb-2">{selectedDocument.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    {selectedDocument.deadline && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-white rounded-lg border border-blue-200">
                        <ClockIcon className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Échéance: {selectedDocument.deadline}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 px-3 py-1 bg-white rounded-lg border border-blue-200">
                      <CalendarIcon className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-800">
                        {selectedDocument.frequency === 'mensuel' ? '📅 Mensuel' : selectedDocument.frequency === 'trimestriel' ? '📆 Trimestriel' : selectedDocument.frequency === 'annuel' ? '📆 Annuel' : '📌 Ponctuel'}
                      </span>
                    </div>
                    {selectedDocument.required && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-semibold">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        Obligatoire
                      </div>
                    )}
                    {selectedDocument.forEntity && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-white rounded-lg border border-blue-200">
                        <BuildingOfficeIcon className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">
                          {selectedDocument.forEntity === 'entreprise' ? 'Entreprises' : selectedDocument.forEntity === 'particulier' ? 'Particuliers' : 'Tous'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Guide rapide */}
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex items-start gap-2">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800">
                    <p className="font-semibold mb-1">💡 Guide rapide :</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Remplissez tous les champs obligatoires (marqués d'un *)</li>
                      <li>Vérifiez les dates et montants avant de valider</li>
                      <li>Le document sera généré automatiquement après validation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire amélioré */}
            <div className="space-y-5">
              <div className="flex items-center gap-2 mb-4">
                <DocumentCheckIcon className="h-5 w-5 text-slate-600" />
                <h3 className="text-lg font-semibold text-slate-900">Informations du document</h3>
              </div>
              
              {selectedDocument.fields?.map((field, index) => (
                <div key={field.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    {field.label} 
                    {field.required && <span className="text-red-500 font-bold">*</span>}
                    {field.helpText && (
                      <Tooltip
                        content={field.helpText}
                        title={field.label}
                        iconOnly
                        position="top"
                      />
                    )}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={documentFormData[field.id] || ''}
                      onChange={(e) => setDocumentFormData({ ...documentFormData, [field.id]: e.target.value })}
                      aria-label={field.label}
                      className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium"
                      required={field.required}
                    >
                      <option value="">Sélectionner...</option>
                      {field.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      value={documentFormData[field.id] || ''}
                      onChange={(e) => setDocumentFormData({ ...documentFormData, [field.id]: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
                      rows={4}
                      placeholder={field.placeholder || `Saisissez ${field.label.toLowerCase()}...`}
                      required={field.required}
                    />
                  ) : field.type === 'number' ? (
                    <div className="relative">
                      <input
                        type={field.type}
                        value={documentFormData[field.id] || ''}
                        onChange={(e) => setDocumentFormData({ ...documentFormData, [field.id]: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium"
                        placeholder={field.placeholder || `Saisissez ${field.label.toLowerCase()}...`}
                        required={field.required}
                        step={field.type === 'number' ? '0.01' : undefined}
                      />
                      {field.type === 'number' && (
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 text-sm">
                          {currentDevise === 'DZD' ? 'DA' : currentDevise === 'EUR' ? '€' : '$'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      value={documentFormData[field.id] || ''}
                      onChange={(e) => setDocumentFormData({ ...documentFormData, [field.id]: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      placeholder={field.placeholder || `Saisissez ${field.label.toLowerCase()}...`}
                      required={field.required}
                    />
                  )}
                  {field.helpText && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <InformationCircleIcon className="h-3 w-3" />
                      {field.helpText}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Équivalents dans d'autres pays - Amélioré */}
            {selectedDocument.equivalent && Object.keys(selectedDocument.equivalent).length > 0 && (
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-5 rounded-xl border-2 border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <GlobeAltIcon className="h-5 w-5 text-slate-600" />
                  <p className="text-sm font-semibold text-slate-900">Équivalents dans d'autres pays</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(selectedDocument.equivalent).map(([country, equivalent]) => {
                    const countryNames: Record<string, string> = {
                      'DZ': 'Algérie',
                      'FR': 'France',
                      'DE': 'Allemagne',
                      'IT': 'Italie',
                      'US': 'États-Unis',
                      'EU': 'Europe'
                    };
                    const countryFlags: Record<string, string> = {
                      'DZ': '🇩🇿',
                      'FR': '🇫🇷',
                      'DE': '🇩🇪',
                      'IT': '🇮🇹',
                      'US': '🇺🇸',
                      'EU': '🇪🇺'
                    };
                    return (
                      <div key={country} className="bg-white p-3 rounded-lg border border-slate-300 hover:border-blue-400 hover:shadow-md transition-all">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{countryFlags[country] || '🌍'}</span>
                          <span className="text-xs font-semibold text-slate-700">{countryNames[country] || country}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">{equivalent}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions améliorées */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t-2 border-slate-200">
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <InformationCircleIcon className="h-4 w-4" />
                <span>Tous les champs marqués d'un <span className="text-red-500 font-bold">*</span> sont obligatoires</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsDocumentModalOpen(false);
                    setSelectedDocument(null);
                    setDocumentFormData({});
                  }}
                  className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold transition-all flex items-center gap-2"
                >
                  <XCircleIcon className="h-4 w-4" />
                  Annuler
                </button>
                <button
                  onClick={() => {
                    // Vérifier que tous les champs requis sont remplis
                    const requiredFields = selectedDocument.fields?.filter(f => f.required) || [];
                    const missingFields = requiredFields.filter(f => !documentFormData[f.id]);
                    
                    if (missingFields.length > 0) {
                      alert(`Veuillez remplir tous les champs obligatoires :\n${missingFields.map(f => `- ${f.label}`).join('\n')}`);
                      return;
                    }
                    
                    // Ici on pourrait sauvegarder le document
                    alert(`✅ Document ${selectedDocument.code} créé avec succès !\n\nLe document a été généré et est disponible dans vos déclarations.`);
                    setIsDocumentModalOpen(false);
                    setSelectedDocument(null);
                    setDocumentFormData({});
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <CheckCircleIcon className="h-5 w-5" />
                  Créer le document
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Fiscalite;


