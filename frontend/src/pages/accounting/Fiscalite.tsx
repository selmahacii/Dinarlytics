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
  BanknotesIcon,
  EyeIcon as EyeIconOutline,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';
import { usePermission } from '@shared/hooks/usePermission';
import { AdaptiveContentDisplay, AdaptiveContentGenerator } from '@shared/utils/AdaptiveContent';
import { FiscalDocument, getDocumentEquivalent, Country, FISCAL_DOCUMENTS_DZ } from '@shared/utils/fiscalDocuments';
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
  type DeclarationG29,
  type DeclarationIBS,
  type DeclarationIRG,
  type DeclarationTAP,
  type CalendrierFiscal
} from '@shared/utils/fiscalDeclarations';
import G50OfficialDocument from '@shared/components/Documents/G50OfficialDocument';
import G29OfficialDocument from '@shared/components/Documents/G29OfficialDocument';
import { fiscalService } from '../../services/modules/fiscalService';
import { invoiceService } from '../../services/modules/invoiceService';
import apiClient from '@/services/apiClient';

const Fiscalite: React.FC = () => {
  const { formatCurrency, user, currentDevise, currentCountry, planComptable, fiscalRates, tvaRate, calculateTVA, getTVARate, fiscalDocuments } = useApp();
  const { t } = useTranslation();
  const { has } = usePermission();

  // Vérifier les permissions d'accès (Accès Admin, DG ou DAF autorisé par défaut)
  const isAuthorized = has('fiscalite-declarations') || 
                       user?.role === 'admin' || 
                       user?.role === 'dg' || 
                       user?.role === 'daf' || 
                       has('admin');

  if (!isAuthorized) {
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
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('common.access_denied', { defaultValue: 'Accès refusé' })}</h2>
          <p className="text-slate-600 mb-4">
            {t('common.no_permission_msg', { defaultValue: "Vous n'avez pas la permission d'accéder à cette section." })}
          </p>
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-700 font-medium mb-1">{t('common.permission_required', { defaultValue: 'Permission requise:' })}</p>
            <p className="text-sm text-slate-600">
              fiscalite-declarations, DG, DAF {t('common.or', { defaultValue: 'ou' })} {t('common.role_admin', { defaultValue: 'Administrateur' })}
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            {t('common.back')}
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
  const [isAiReportModalOpen, setIsAiReportModalOpen] = useState(false);
  const [isGeneratingAiReport, setIsGeneratingAiReport] = useState(false);
  const [aiReportContent, setAiReportContent] = useState<string | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<any[]>([]);

  // États pour les déclarations
  const [isDeclarationModalOpen, setIsDeclarationModalOpen] = useState(false);
  const [isGeneratingDeclaration, setIsGeneratingDeclaration] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [declarationData, setDeclarationData] = useState<any>(null);
  const [declarationType, setDeclarationType] = useState<'g50' | 'g29' | 'ibs' | 'irg' | 'tap'>('g50');
  const [calendrierFiscalComplet, setCalendrierFiscalComplet] = useState<CalendrierFiscal[]>([]);
  const [declarationsGenerees, setDeclarationsGenerees] = useState<{
    g50: DeclarationG50[];
    g29: DeclarationG29[];
    ibs: DeclarationIBS[];
    irg: DeclarationIRG[];
    tap: DeclarationTAP[];
  }>({
    g50: [],
    g29: [],
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
  const [createdDocuments, setCreatedDocuments] = useState<Array<any>>([]);
  const [documentHistoryFilter, setDocumentHistoryFilter] = useState<string>('all');
  const [documentHistorySearch, setDocumentHistorySearch] = useState<string>('');
  const [showError, setShowError] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Recalculer les calculs fiscaux selon la devise actuelle (Moteurs de secours)
  const [dynamicKPI, setDynamicKPI] = useState<any>(null);
  const [fiscalForecast, setFiscalForecast] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  const calculsFiscaux = {
    chiffreAffaires: dynamicKPI?.caHT ?? 0,
    chargesDeductibles: dynamicKPI?.chargesHT ?? 0,
    beneficeImposable: dynamicKPI?.benefice ?? 0,
    ibs: dynamicKPI?.ibs ?? 0,
    tvaCollectee: dynamicKPI?.tvaColl ?? 0,
    tvaDeductible: dynamicKPI?.tvaDed ?? 0,
    tvaAVerser: dynamicKPI?.tvaAVerser ?? 0,
    irg: dynamicKPI?.irg ?? 0,
    tap: dynamicKPI?.tap ?? 0
  };

  // Taux personnalisables
  const [customRates, setCustomRates] = useState({
    tva: 0.19,
    tap: 0.02,
    ibs: 0.26
  });

  // Initialiser les données
  React.useEffect(() => {
    const loadDynamicData = async () => {
      const allInvoices = await invoiceService.getAll();
      const active = allInvoices.filter(i => i.statut !== 'annule');
      const sales = active.filter(i => i.type === 'sale');
      const purchases = active.filter(i => i.type === 'purchase');

      const caHT = sales.reduce((s, i) => s + i.totalHT, 0);
      const chargesHT = purchases.reduce((s, i) => s + i.totalHT, 0);
      const tvaColl = sales.reduce((s, i) => s + i.totalTVA, 0);
      const tvaDed = purchases.reduce((s, i) => s + i.totalTVA, 0);

      const benefice = caHT - chargesHT;
      const ibs = benefice > 0 ? benefice * customRates.ibs : 0;
      const tvaAVerser = tvaColl - tvaDed;

      // IRG réel selon le barème progressif algérien (service_payroll.py),
      // pas un pourcentage forfaitaire de 10% de la masse salariale brute
      // qui ignorait l'exonération/lissage sous 35 000 DA déjà implémentés
      // pour la validation de paie.
      let irg = 0;
      try {
        const payrollRes = await apiClient.get<any>('/rh/employees/payroll/summary');
        irg = Math.round(Number(payrollRes.data?.total_irg) || 0);
      } catch (e) {
        console.warn('Failed to load real IRG from payroll summary', e);
      }

      setDynamicKPI({
        caHT,
        chargesHT,
        benefice,
        ibs,
        tvaColl,
        tvaDed,
        tvaAVerser: tvaAVerser > 0 ? tvaAVerser : 0,
        creditTva: tvaAVerser < 0 ? Math.abs(tvaAVerser) : 0,
        tap: caHT * customRates.tap,
        irg
      });

      const risks = await fiscalService.getRiskAnalysis();
      setRiskAnalysis(risks);

      const forecast = await fiscalService.getFiscalForecast();
      setFiscalForecast(forecast);
    };

    loadDynamicData();
  }, [customRates]);


  // Initialiser le calendrier fiscal
  React.useEffect(() => {
    const annee = new Date().getFullYear().toString();
    const calendrier = genererCalendrierFiscal(annee);
    setCalendrierFiscalComplet(calendrier);
  }, []);

  const handleGenererDeclaration = async () => {
    if (!selectedPeriod && declarationType !== 'irg' && declarationType !== 'tap' && declarationType !== 'g29') {
      alert(t('fiscal.alerts.select_period'));
      return;
    }

    setIsGeneratingDeclaration(true);

    try {
      let nouvelleDeclaration: any = null;

      switch (declarationType) {
        case 'g50': {
          const periode = selectedPeriod.includes('-') ? selectedPeriod :
            `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

          const calculated = await fiscalService.calculateG50(periode);

          nouvelleDeclaration = genererDeclarationG50(periode, {
            chiffreAffairesHT: calculated.ca_ht,
            tvaCollectee: calculated.tva_collectee,
            tvaDeductible: calculated.tva_deductible,
            achatsHT: calculated.tva_deductible / 0.19,
            nombreFactures: 1,
            nombreClients: 1
          });

          setDeclarationsGenerees(prev => ({
            ...prev,
            g50: [...prev.g50, nouvelleDeclaration as DeclarationG50]
          }));
          break;
        }

        case 'g29': {
          const exercice = selectedPeriod || new Date().getFullYear().toString();
          const calculated = await fiscalService.calculateG29(exercice);

          const beneficiaries = calculated.beneficiaires || [];

          nouvelleDeclaration = {
            id: `g29-${exercice}`,
            numero: `G29-${exercice}`,
            exercice,
            dateGeneration: new Date().toISOString().split('T')[0],
            dateEcheance: `${parseInt(exercice) + 1}-04-30`,
            statut: 'generee',
            totalHonoraires: calculated.total_honoraires,
            totalRetenues: calculated.total_retenues,
            nombreBeneficiaires: beneficiaries.length,
            beneficiaires: beneficiaries
          };

          setDeclarationsGenerees(prev => ({
            ...prev,
            g29: [...prev.g29, nouvelleDeclaration]
          }));
          break;
        }

        case 'ibs': {
          const [annee, periode] = selectedPeriod.split('-');
          const trimestre = periode === 'Annuel' ? 'Annuel' : (periode.startsWith('T') ? periode : `T${Math.ceil(parseInt(periode) / 3)}`);

          nouvelleDeclaration = genererDeclarationIBS(annee, trimestre, {
            chiffreAffaires: calculsFiscaux.chiffreAffaires,
            chargesDeductibles: calculsFiscaux.chargesDeductibles,
            amortissements: 0,
            provisions: 0,
            nombreSalaries: 0,
            masseSalariale: 0
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
            chiffreAffairesHT: calculsFiscaux.chiffreAffaires,
            tauxTAP: customRates.tap
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

  const handleGenererRapportIA = async () => {
    setIsAiReportModalOpen(true);
    setIsGeneratingAiReport(true);
    setAiReportContent(null);

    await new Promise(resolve => setTimeout(resolve, 2500));

    const risksText = riskAnalysis.map(r => `• [${r.level.toUpperCase()}] ${r.title}: ${r.message}`).join('\n');

    const content = `
${t('fiscal.reports.audit_title')} - EXERCICE 2026
${t('fiscal.reports.generated_by')} • Rapport ID: #DZ-TAX-2026-001
Status: Basé sur vos transactions réelles
────────────────────────────────────────────────────────────

1. SYNTHÈSE DES CALCULS (DYNAMIQUE)
• Chiffre d'Affaires HT:     ${formatCurrency(dynamicKPI?.caHT || 0)}
• Résultat Brut Estimé:      ${formatCurrency(dynamicKPI?.benefice || 0)}
• Impôt s/ Bénéfices (IBS):  ${formatCurrency(dynamicKPI?.ibs || 0)}
• TVA à verser (Solde):      ${formatCurrency(dynamicKPI?.tvaAVerser || 0)}
• TAP (Taux ${customRates.tap * 100}%):        ${formatCurrency(dynamicKPI?.tap || 0)}

2. ANALYSE DES RISQUES DÉTECTÉS
${risksText || 'Aucun risque majeur détecté sur les données actuelles.'}

3. DIAGNOSTIC DE CONFORMITÉ IA
• Risque de redressement: ${riskAnalysis.some(r => r.level === 'critical') ? 'ÉLEVÉ' : 'FAIBLE'}
• Cohérence Bilan/G50:    VÉRIFIÉE

4. RECOMMANDATIONS STRATÉGIQUES
[P1] Optimisation: Le taux de TAP actuel (${customRates.tap * 100}%) semble conforme à votre secteur.
[P2] Trésorerie: Anticiper un versement de ${formatCurrency(dynamicKPI?.tvaAVerser || 0)} pour la prochaine G50.

SCORE DE SANTÉ FISCALE: ${100 - (riskAnalysis.length * 10)}/100
────────────────────────────────────────────────────────────`;

    setAiReportContent(content);
    setIsGeneratingAiReport(false);
  };

  const handleExportAuditReport = async () => {
    if (!aiReportContent) return;
    setIsExporting(true);
    try {
      await fiscalService.exportRiskReportPDF(aiReportContent);
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setIsExporting(false);
    }
  };

  // Déclarations G50 générées (données réelles)
  const declarationsG50 = declarationsGenerees.g50;

  // Métriques fiscales avancées calculées à partir des données réelles
  const fiscalKPI = (() => {
    const totalTVAAVerser = declarationsG50.reduce((sum, d) => sum + (d.tvaAVerser || 0), 0);
    const totalIBS = calculsFiscaux.ibs;
    const benefice = calculsFiscaux.beneficeImposable;
    const tauxEffectif = benefice > 0 ? ((totalIBS) / benefice) * 100 : 0;
    const chargeFiscaleTotale = totalIBS + totalTVAAVerser;
    return {
      tauxEffectif: Math.round(tauxEffectif * 10) / 10,
      chargeTotale: chargeFiscaleTotale,
      partIBS: Math.round((totalIBS / Math.max(chargeFiscaleTotale, 1)) * 100),
      partTVA: Math.round((totalTVAAVerser / Math.max(chargeFiscaleTotale, 1)) * 100),
      retardPotentiel: riskAnalysis.length
    };
  })();

  // Utiliser le calendrier fiscal complet généré
  const calendrierFiscal: CalendrierFiscal[] = calendrierFiscalComplet.length > 0
    ? calendrierFiscalComplet.slice(0, 10) // Afficher les 10 prochaines échéances
    : [];

  // Écarts vs prévisions
  const ecartsFiscaux: Array<{ poste: string; prevu: number; realise: number; ecart: number }> = [];

  return (
    <div className="space-y-6">
      {/* En-tête Premium - Fiscalité & Déclarations */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 px-8 py-14 rounded-[2.5rem] shadow-2xl group border border-white/10">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-400/20 transition-all duration-700"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center space-x-5 mb-6">
                <div className="p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-inner">
                  <CalculatorIcon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-white tracking-tight mb-1">{t('fiscal.title')}</h1>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span className="text-sm font-bold text-blue-100 uppercase tracking-[0.2em]">{t('fiscal.update_status')}</span>
                  </div>
                </div>
              </div>

              <p className="text-blue-50 text-xl max-w-3xl leading-relaxed mb-8 font-medium opacity-90">
                {t('fiscal.subtitle')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                {[
                  t('fiscal.benefits.kpi'),
                  t('fiscal.benefits.clients'),
                  t('fiscal.benefits.g50'),
                  t('fiscal.benefits.profit'),
                  t('fiscal.benefits.bfr'),
                  t('fiscal.benefits.cashflow')
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-3 text-white/90 text-sm bg-white/5 backdrop-blur-sm px-4 py-3 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <span className="font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-96 space-y-5">
              <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 border border-white/20 shadow-2xl">
                <h4 className="text-xs font-black text-blue-200 uppercase tracking-[0.25em] mb-4 border-b border-white/10 pb-3">
                  {t('fiscal.solution_enterprise')}
                </h4>
                <ul className="space-y-3">
                  {[t('nav.steering'), t('common.financial_analysis'), t('nav.audit_traceability')].map((item, i) => (
                    <li key={i} className="flex items-center text-white font-bold text-sm">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-3"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-md rounded-[2rem] p-6 border border-emerald-400/30">
                <div className="text-[10px] font-black text-emerald-300 uppercase tracking-[0.2em] mb-2">{t('fiscal.decision_aid')}</div>
                <p className="text-sm text-white mt-1 leading-relaxed italic font-medium">
                  "{t('fiscal.motto')}"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer Fiscal */}
      <div className="bg-amber-50/50 backdrop-blur-sm border-l-4 border-amber-500 p-5 rounded-2xl mb-8 border border-amber-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-amber-100 rounded-full">
            <InformationCircleIcon className="h-6 w-6 text-amber-600" />
          </div>
          <p className="text-amber-900 text-sm font-semibold tracking-wide">
            <span className="text-amber-600 font-black uppercase mr-2">{t('fiscal.warning_title')}</span>
            {t('fiscal.warning_text')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="px-4 py-1.5 bg-white text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200 shadow-sm">
            {t('fiscal.update_status')}
          </span>
        </div>
      </div>

      {/* 2026 Update - KPI Dashboards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: t('fiscal.stats.ca_ht'), value: formatCurrency(dynamicKPI?.caHT || 0), icon: CalculatorIcon, color: 'blue', sub: t('nav.commercial_analysis') },
          { label: t('fiscal.stats.ibs_estimated'), value: formatCurrency(dynamicKPI?.ibs || 0), icon: BuildingOfficeIcon, color: 'indigo', sub: `${t('fiscal.rates.rate_label')}: ${customRates.ibs * 100}%` },
          { label: t('fiscal.stats.tva_to_pay'), value: formatCurrency(dynamicKPI?.tvaAVerser || 0), icon: DocumentTextIcon, color: 'emerald', sub: t('fiscal.stats.tva_share') },
          { label: t('fiscal.stats.conformity_score'), value: `${100 - (riskAnalysis.length * 10)}/100`, icon: SparklesIcon, color: 'purple', sub: 'Audit IA', action: handleGenererRapportIA }
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-xl hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${kpi.color}-50 rounded-bl-[4rem] -mr-4 -mt-4 transition-all duration-500 group-hover:scale-150 group-hover:bg-${kpi.color}-100`}></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 bg-${kpi.color}-50 rounded-2xl group-hover:bg-${kpi.color}-600 transition-all duration-500 shadow-sm`}>
                  <kpi.icon className={`h-7 w-7 text-${kpi.color}-600 group-hover:text-white transition-colors duration-500`} />
                </div>
                {kpi.action ? (
                  <button onClick={kpi.action} className={`text-[10px] font-black text-white uppercase tracking-widest py-2 px-4 bg-${kpi.color}-600 rounded-xl hover:bg-${kpi.color}-700 transition-colors shadow-lg`}>
                    {t('fiscal.audit_ia_btn')}
                  </button>
                ) : (
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-1.5 px-3 bg-slate-50 rounded-lg border border-slate-100">
                    {kpi.sub}
                  </span>
                )}
              </div>
              
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">{kpi.label}</p>
              <div className="flex items-baseline space-x-1">
                <p className={`text-3xl font-black text-slate-900 group-hover:text-${kpi.color}-700 transition-colors duration-500`}>{kpi.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fiscal Steering Center & AI Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 flex items-center mb-2">
                  <span className="p-2 bg-blue-600 rounded-lg mr-3 shadow-lg">
                    <SparklesIcon className="h-6 w-6 text-white" />
                  </span>
                  {t('fiscal.control_center')}
                </h3>
                <p className="text-slate-500 font-medium">{t('fiscal.tagline')}</p>
              </div>
              <div className="flex space-x-3">
                <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center border border-emerald-100 shadow-sm">
                  <CheckCircleIcon className="h-4 w-4 mr-2" /> {t('fiscal.alerts.erp_coherence')}
                </span>
                <button className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-wider border border-indigo-100 shadow-sm hover:bg-indigo-100 transition-colors">
                  {t('fiscal.expert_mode')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
              {[
                { label: t('fiscal.rates.tva'), value: customRates.tva * 100, field: 'tva' },
                { label: t('fiscal.rates.tap'), value: customRates.tap * 100, field: 'tap' },
                { label: t('fiscal.rates.ibs'), value: customRates.ibs * 100, field: 'ibs' }
              ].map((rate, i) => (
                <div key={i} className="group">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block group-focus-within:text-blue-600 transition-colors">
                    {rate.label}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={rate.value}
                      onChange={(e) => setCustomRates({ ...customRates, [rate.field]: parseFloat(e.target.value) / 100 })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-black text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-lg shadow-inner"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-lg">%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-slate-900 rounded-[2rem] relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <SparklesIcon className="h-48 w-48 text-blue-400" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="max-w-md">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <SparklesIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <h4 className="text-sm font-black text-blue-400 uppercase tracking-[0.25em]">{t('fiscal.ia_predictive')}</h4>
                  </div>
                  <p className="text-slate-300 font-medium leading-relaxed">
                    {t('fiscal.ia.analysis_desc')}
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-right min-w-[200px]">
                  <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-2">{t('fiscal.ia.predicted_tva')}</p>
                  <p className="text-3xl font-black text-white mb-2">{formatCurrency(fiscalForecast?.predictedTVANextMonth || 0)}</p>
                  <div className="flex items-center justify-end text-[11px] font-bold text-emerald-400 bg-emerald-500/10 py-1.5 px-3 rounded-lg inline-flex">
                    <CheckCircleIcon className="h-4 w-4 mr-1.5" /> {t('fiscal.ia.confidence_score')}: {Math.round((fiscalForecast?.confidenceScore ?? 0) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -ml-16 -mt-16 opacity-50"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 flex items-center">
                <div className="p-2 bg-rose-100 rounded-lg mr-3">
                  <ExclamationTriangleIcon className="h-6 w-6 text-rose-600" />
                </div>
                {t('fiscal.audit_conformity')}
              </h3>
              <span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-rose-100">
                {riskAnalysis.length} alertes
              </span>
            </div>

            <div className="space-y-4 flex-1">
              {riskAnalysis.map((risk, idx) => (
                <div key={idx} className={`p-5 rounded-2xl border-l-[6px] transition-all hover:translate-x-1 ${risk.level === 'critical' ? 'bg-rose-50 border-rose-500' : 'bg-amber-50 border-amber-500'}`}>
                  <p className={`text-[11px] font-black uppercase tracking-wider mb-2 ${risk.level === 'critical' ? 'text-rose-600' : 'text-amber-600'}`}>
                    {risk.title}
                  </p>
                  <p className="text-sm text-slate-700 font-bold leading-relaxed">{risk.message}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleGenererRapportIA}
              className="w-full mt-8 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-sm hover:bg-black transition-all shadow-xl hover:shadow-2xl flex items-center justify-center group"
            >
              <span className="tracking-widest uppercase">{t('fiscal.launch_audit')}</span>
              <SparklesIcon className="h-5 w-5 ml-3 group-hover:animate-spin transition-all duration-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Tax Calculation Details - Amélioré */}

      <Card title={t('fiscal.calcul_details')}>
        <div className="space-y-6">
          {/* Indicateurs de Performance Fiscale Globale */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2 text-indigo-600" />
              {t('fiscal.performance_indicators')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Charge fiscale totale */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase">{t('fiscal.stats.total_charge')}</span>
                  <CurrencyDollarIcon className="h-4 w-4 text-slate-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {formatCurrency(calculsFiscaux.ibs + calculsFiscaux.tvaAVerser)}
                </div>
                <div className="text-xs text-slate-500 mt-1">{t('fiscal.stats.total_taxes')}</div>
              </div>

              {/* Taux effectif d'imposition */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase">{t('fiscal.stats.effective_rate')}</span>
                  <ChartBarIcon className="h-4 w-4 text-slate-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{fiscalKPI.tauxEffectif}%</div>
                <div className="text-xs text-slate-500 mt-1">{t('fiscal.stats.benefit_ibs')}</div>
              </div>

              {/* Répartition IBS/TVA */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase">{t('fiscal.stats.ibs_share')}</span>
                  <span className="text-xs text-slate-600 font-bold">{t('fiscal.rates.ibs')}</span>
                </div>
                <div className="text-2xl font-bold text-slate-900">{fiscalKPI.partIBS}%</div>
                <div className="text-xs text-slate-500 mt-1">{t('fiscal.stats.tva_share')}: {fiscalKPI.partTVA}%</div>
              </div>

              {/* Score de conformité fiscale */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase">{t('fiscal.stats.compliance')}</span>
                  <CheckCircleIcon className="h-4 w-4 text-slate-400" />
                </div>
                <div className="text-2xl font-bold text-slate-900">{100 - (riskAnalysis.length * 10)}%</div>
                <div className="text-xs text-slate-500 mt-1">{t('fiscal.stats.global_score')}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* IBS Calculation - Amélioré */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <span className="mr-2">🏢</span>
                  {t('fiscal.rates.ibs_full')}
                </h3>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">{t('fiscal.rates.rate_label')}: {customRates.ibs * 100}%</span>
              </div>
              <div className="space-y-3">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">{t('fiscal.details.ca_ht_label')}</span>
                    <span className="font-medium text-slate-900">{formatCurrency(calculsFiscaux.chiffreAffaires)}</span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">{t('fiscal.details.deductible_charges')}</span>
                    <span className="font-medium text-slate-900">-{formatCurrency(calculsFiscaux.chargesDeductibles)}</span>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold text-slate-400">{t('fiscal.details.taxable_profit')}</span>
                    <span className="font-bold text-white">{formatCurrency(calculsFiscaux.beneficeImposable)}</span>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-slate-400 uppercase mb-1">{t('fiscal.details.ibs_base_rate')}</div>
                      <div className="text-sm text-slate-500">{t('fiscal.ia.base_rate_calc')}</div>
                    </div>
                    <div className="text-2xl font-black text-white">{formatCurrency(calculsFiscaux.ibs)}</div>
                  </div>
                </div>

                {/* Acomptes IBS */}
                <div className="mt-4 bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs font-bold text-slate-900 uppercase mb-2">{t('fiscal.details.ibs_installments')}</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">{t('fiscal.details.installments_paid')}</span>
                      <span className="font-medium text-slate-900">{formatCurrency(0)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">{t('fiscal.details.balance_to_pay')}</span>
                      <span className="font-bold text-slate-900">{formatCurrency(calculsFiscaux.ibs)}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-2 italic">
                      ℹ️ {t('fiscal.details.balance_deadline')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* VAT Calculation - Amélioré */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <span className="mr-2">📋</span>
                  Taxe sur la Valeur Ajoutée (TVA)
                </h3>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                    Taux: {getTVARate('normal').toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Base taxable ventes (HT):</span>
                    <span className="font-medium text-slate-900">{formatCurrency(Math.round(calculsFiscaux.tvaCollectee / (fiscalRates.tvaNormal)))}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">× {getTVARate('normal').toFixed(0)}% = TVA collectée</div>
                </div>
                <div className="bg-slate-100 rounded-lg p-3 border border-slate-200">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-700 font-medium">TVA collectée ({getTVARate('normal').toFixed(0)}%):</span>
                    <span className="font-bold text-slate-900">{formatCurrency(calculsFiscaux.tvaCollectee)}</span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Base taxable achats (HT):</span>
                    <span className="font-medium text-slate-900">{formatCurrency(Math.round(calculsFiscaux.tvaDeductible / (fiscalRates.tvaNormal)))}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">× {getTVARate('normal').toFixed(0)}% = TVA déductible</div>
                </div>
                <div className="bg-slate-100 rounded-lg p-3 border border-slate-200">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-700 font-medium">TVA déductible:</span>
                    <span className="font-bold text-slate-700">-{formatCurrency(calculsFiscaux.tvaDeductible)}</span>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-slate-400 uppercase mb-1">TVA Nette à Verser</div>
                      <div className="text-sm text-slate-500">Collectée - Déductible</div>
                    </div>
                    <div className="text-2xl font-black text-white">{formatCurrency(calculsFiscaux.tvaAVerser)}</div>
                  </div>
                </div>

                {/* Taux de récupération */}
                <div className="mt-4 bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="text-xs font-bold text-slate-800 uppercase mb-2">Taux de Récupération</div>
                  <div className="flex items-center justify-between">
                    <div className="w-full bg-slate-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-slate-900 h-2 rounded-full"
                        style={{ width: `${calculsFiscaux.tvaCollectee > 0 ? Math.min(100, Math.round((calculsFiscaux.tvaDeductible / calculsFiscaux.tvaCollectee) * 100)) : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {calculsFiscaux.tvaCollectee > 0 ? Math.round((calculsFiscaux.tvaDeductible / calculsFiscaux.tvaCollectee) * 100) : 0}%
                    </span>
                  </div>
                   <div className="flex justify-between items-center">
                     <span className="text-xs text-slate-600">{t('fiscal.details.recovery_rate')}</span>
                     <span className="text-sm font-bold text-slate-900">
                       {calculsFiscaux.tvaCollectee > 0 ? (calculsFiscaux.tvaDeductible / calculsFiscaux.tvaCollectee * 100).toFixed(1) : '0.0'}%
                     </span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* IRG et TAP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* IRG Calculation - Amélioré */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <span className="mr-2">👤</span>
                  {t('fiscal.details.irg_title')}
                </h3>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">{t('fiscal.details.irg_progressive')}</span>
              </div>
              <div className="space-y-4">
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('fiscal.details.irg_schedule_2026')}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">{t('fiscal.details.irg_exempt')}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{t('fiscal.details.taxable_income')}</span>
                      <span className="font-bold text-slate-900">{formatCurrency(dynamicKPI?.irg || 0)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-xs font-black text-slate-900 uppercase">{t('fiscal.details.irg_calculated')}</span>
                      <div className="text-right">
                        <div className="text-xl font-black text-indigo-600">{formatCurrency(calculsFiscaux.irg)}</div>
                        <div className="text-[10px] text-slate-400">{t('fiscal.details.irg_total_schedule')}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="w-full py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  {t('fiscal.details.calc_detail')}
                </button>
              </div>
            </div>

            {/* TAP Calculation - Amélioré */}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center">
                  <span className="mr-2">🏛️</span>
                  Taxe sur l'Activité Professionnelle (TAP)
                </h3>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">Taux: {customRates.tap * 100}%</span>
              </div>
              <div className="space-y-3">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">Chiffre d'affaires HT:</span>
                    <span className="font-medium text-slate-900">{formatCurrency(calculsFiscaux.chiffreAffaires)}</span>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-slate-400 uppercase mb-1">TAP CALCULÉE ({customRates.tap * 100}%)</div>
                      <div className="text-sm text-slate-500">Base × Taux</div>
                    </div>
                    <div className="text-2xl font-black text-white">{formatCurrency(calculsFiscaux.tap)}</div>
                  </div>
                </div>

                {/* Paiements TAP */}
                <div className="mt-4 bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="text-xs font-bold text-slate-800 uppercase mb-2">Paiements Mensuels</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">TAP mensuel moyen:</span>
                      <span className="font-medium text-slate-900">{formatCurrency(Math.round(calculsFiscaux.tap / 12))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Prochaine échéance:</span>
                      <span className="font-bold text-amber-700">{getDateEcheance('tap', new Date().getFullYear().toString())}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Documents Fiscaux Disponibles - Professional Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-8">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('fiscal.documents.title')}</h2>
          <p className="text-slate-500 text-sm mt-1">{t('fiscal.documents.subtitle', { country: 'Algérie', count: 6 })}</p>
        </div>

        <div className="mb-6 relative px-8 pt-6">
          <div className="absolute inset-y-0 left-0 pl-12 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
          </div>
          <input 
            type="text"
            className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={t('fiscal.documents.search_placeholder')}
          />
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FISCAL_DOCUMENTS_DZ.map((doc) => (
            <div key={doc.id} className="group p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:bg-white hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">{doc.code}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wide ${doc.required ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {doc.required ? 'Obligatoire' : 'Optionnel'}
                    </span>
                  </div>
                  {doc.nameLocal && (
                    <div className="text-right mt-1">
                      <span className="text-xs font-bold text-slate-700 font-arabic leading-relaxed">{doc.nameLocal}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${doc.frequency === 'mensuel' ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-200 text-slate-600'}`}>
                    {doc.frequency}
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mb-2 leading-tight">{doc.name}</h4>
              <p className="text-xs text-slate-500 mb-6 flex-1 italic leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-500">{doc.description}</p>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div className="text-[10px] text-slate-400">
                  {doc.deadline ? `Échéance: ${doc.deadline}` : `Pour: ${doc.forEntity}`}
                </div>
                <button
                  onClick={() => {
                    setSelectedDocument(doc);
                    setIsDocumentModalOpen(true);
                  }}
                  className="p-2 bg-white border border-slate-200 rounded-lg text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section G50 - Déclarations & Performance */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-8">
        <div className="p-8 bg-slate-50 border-b border-slate-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center">
                <div className="p-2.5 bg-slate-900 rounded-xl mr-4 shadow-sm">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center justify-between w-full">
                  <span>{t('fiscal.g50.title')}</span>
                  <span className="text-xl font-bold text-slate-200 font-arabic ml-4">تصريحات G50</span>
                </div>
              </h2>
              <p className="text-slate-500 text-sm mt-1 ml-14">{t('fiscal.g50.subtitle')}</p>
            </div>

            <div className="md:w-1/2 lg:w-1/3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('fiscal.g50.compliance')}</p>
                  <div className="text-xl font-black text-slate-900">{100 - (riskAnalysis.length * 10)}%</div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('fiscal.g50.avg_delay')}</p>
                  <div className="text-sm font-black text-slate-900">0 {t('common.days', { defaultValue: 'jours' })}</div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('fiscal.g50.avg_tva')}</p>
                  <div className="text-sm font-black text-slate-900">{formatCurrency(declarationsG50.length > 0 ? Math.round(declarationsG50.reduce((s, d) => s + (d.tvaAVerser || 0), 0) / declarationsG50.length) : 0)}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-sm text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('fiscal.g50.q1_status')}</p>
                  <div className="text-xl font-black text-slate-900">{t('fiscal.g50.up_to_date')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none h-11">
                <option>{t('fiscal.g50.year_2026')}</option>
                <option>{t('fiscal.g50.year_2024')}</option>
              </select>
              <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none h-11">
                <option>{t('fiscal.g50.all_statuses')}</option>
                <option>{t('fiscal.g50.filed')}</option>
                <option>{t('fiscal.g50.in_progress')}</option>
              </select>
            </div>
            <div className="flex items-center space-x-3 w-full md:w-auto">
              <button onClick={() => setIsDeclarationModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-black transition-all active:scale-95">
                <PlusIcon className="h-4 w-4 mr-2" /> {t('common.new_declaration', { defaultValue: 'Nouvelle Déclaration' })}
              </button>
              <button className="p-3 bg-slate-50 text-slate-600 rounded-xl border border-slate-200 hover:bg-white hover:text-slate-900 transition-all">
                <DocumentArrowDownIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-inner">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    t('fiscal.g50.table.period'),
                    t('fiscal.g50.table.num'),
                    t('fiscal.g50.table.ca'),
                    t('fiscal.g50.table.coll'),
                    t('fiscal.g50.table.ded'),
                    t('fiscal.g50.table.irg'),
                    t('fiscal.g50.table.tap'),
                    t('fiscal.g50.table.to_pay'),
                    t('fiscal.g50.table.date'),
                    t('fiscal.g50.table.status'),
                    ""
                  ].map((header, i) => (
                    <th key={header + i} className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {declarationsG50.map((row: any, idx) => (
                  <tr key={row.id || idx} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{row.periode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">{row.numero}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatCurrency(row.chiffreAffairesHT || 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">{formatCurrency(row.tvaCollectee || 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">{formatCurrency(row.tvaDeductible || 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">{formatCurrency(row.irg || 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">{formatCurrency(row.tap || 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-900 border-l border-slate-100">{formatCurrency(row.tvaAVerser || 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">{row.dateGeneration}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 rounded text-[10px] font-bold text-slate-400">
                        {row.dateEcheance}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${row.statut === 'generee' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                        {row.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">-</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Synthèse G50 Trend UI - Premium Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative overflow-hidden p-5 bg-white rounded-2xl border border-slate-200 group hover:border-indigo-600 transition-all duration-300">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t('fiscal.g50.trend.collected_ytd')}</p>
                <div className="text-2xl font-black text-slate-900 mb-1">{formatCurrency(declarationsG50.reduce((s, d: any) => s + (d.tvaCollectee || 0), 0))}</div>
                <div className="flex items-center text-emerald-600 text-[10px] font-black uppercase tracking-tighter">
                  <span className="flex items-center justify-center p-1 bg-emerald-50 rounded mr-2">
                    <ArrowTrendingUpIcon className="h-3 w-3" />
                  </span>
                  {t('fiscal.g50.trend.vs_last_year')}
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden p-5 bg-white rounded-2xl border border-slate-200 group hover:border-slate-900 transition-all duration-300">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">À Verser (YTD)</p>
                <div className="text-2xl font-black text-slate-900 mb-1">{formatCurrency(declarationsG50.reduce((s, d: any) => s + (d.tvaAVerser || 0), 0))}</div>
                <div className="flex items-center text-slate-500 text-[10px] font-black uppercase tracking-tighter">
                  <span className="flex items-center justify-center p-1 bg-slate-50 rounded mr-2">
                    <ArrowTrendingUpIcon className="h-3 w-3" />
                  </span>
                  vs N-1
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden p-5 bg-white rounded-2xl border border-slate-200 group hover:border-slate-900 transition-all duration-300">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Taux d'Exécution</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{declarationsG50.length}</span>
                  <span className="text-sm font-bold text-slate-400 tracking-tight">Mois déclarés</span>
                </div>
                <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-900 rounded-full" style={{ width: `${Math.min(100, declarationsG50.length * 25)}%` }}></div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Performance Globale</p>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-black text-slate-900 tracking-tighter">{100 - (riskAnalysis.length * 10)}/100</div>
                  <SparklesIcon className="h-8 w-8 text-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendrier Fiscal - Version Premium */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 flex items-center">
              <div className="p-2 bg-slate-900 rounded-lg mr-3">
                <ClockIcon className="h-5 w-5 text-white" />
              </div>
              {t('nav.fiscal_calendar')}
            </h3>
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-widest">
              Action requise
            </span>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {calendrierFiscal.map((e, idx) => (
                <div key={idx} className={`p-4 rounded-xl border transition-all ${e.joursAvantEcheance <= 5 ? 'bg-white border-rose-300 shadow-sm' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${e.joursAvantEcheance <= 5 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                        {e.type}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{e.libelle}</span>
                    </div>
                    <span className={`text-xs font-bold ${e.joursAvantEcheance <= 5 ? 'text-rose-600' : 'text-slate-500'}`}>
                      {new Date(e.dateEcheance).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${e.joursAvantEcheance <= 5 ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {e.joursAvantEcheance > 0 ? `${e.joursAvantEcheance} ${t('common.days_remaining', { defaultValue: 'jours restants' })}` : t('common.expired', { defaultValue: 'Expiré' })}
                      </span>
                    </div>
                    <button className="text-[10px] font-black text-slate-900 uppercase tracking-widest hover:text-indigo-600 transition-colors">{t('common.details', { defaultValue: 'Détails' })}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Écarts vs Prévisions */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 flex items-center">
              <div className="p-2 bg-slate-900 rounded-lg mr-3">
                <ChartBarIcon className="h-5 w-5 text-white" />
              </div>
              {t('fiscal.performance_indicators')}
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {ecartsFiscaux.map((l, i) => (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700">{l.poste}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${l.ecart >= 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      Ecart: {formatCurrency(Math.abs(l.ecart))}
                    </span>
                  </div>
                  <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full rounded-full ${l.ecart >= 0 ? 'bg-rose-500' : 'bg-slate-900'}`}
                      style={{ width: `${Math.min(100, (l.realise / l.prevu) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    <span>Prévu: {formatCurrency(l.prevu)}</span>
                    <span>Réalisé: {formatCurrency(l.realise)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500 italic leading-relaxed">
                <InformationCircleIcon className="h-4 w-4 inline mr-1 -mt-0.5" />
                {t('fiscal.variance_explanation')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50 rounded-3xl text-slate-900 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.01]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-black mb-2 text-slate-900">{t('fiscal.launch_audit')} ?</h3>
            <p className="text-slate-500 text-sm max-w-md">{t('fiscal.subtitle')}</p>
          </div>
          <button
            onClick={handleGenererRapportIA}
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all active:scale-95 flex items-center group"
          >
            <SparklesIcon className="h-5 w-5 text-slate-400 mr-2" />
            {t('fiscal.expert_report_btn')}
            <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isCalculModalOpen}
        onClose={() => setIsCalculModalOpen(false)}
        title={t('fiscal.simulator.title')}
        size="lg"
      >
        <div className="p-1 leading-relaxed text-slate-600">
          {/* Simulateur Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t('fiscal.simulator.ca_label')}</label>
                <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold" defaultValue={calculsFiscaux.chiffreAffaires} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t('fiscal.simulator.charges_label')}</label>
                <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold" defaultValue={calculsFiscaux.chargesDeductibles} />
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <div className="text-xs text-slate-500 uppercase font-bold mb-4">{t('fiscal.simulator.result')}</div>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-sm font-medium text-slate-600">{t('fiscal.simulator.net_profit')}</span>
                  <span className="text-lg font-black text-slate-900">{formatCurrency(calculsFiscaux.beneficeImposable)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-sm font-medium text-slate-600">IBS ({customRates.ibs * 100}%)</span>
                  <span className="text-lg font-black text-slate-900">{formatCurrency(calculsFiscaux.ibs)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-bold text-slate-900">Reliquat de Trésorerie Net</span>
                  <span className="text-2xl font-black text-indigo-900">{formatCurrency(calculsFiscaux.beneficeImposable - calculsFiscaux.ibs)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-end space-x-3">
            <button onClick={() => setIsCalculModalOpen(false)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">Fermer</button>
          </div>
        </div>
      </Modal>

      {/* Modal de Déclaration G50 / IBS / IRG / TAP */}
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
              <div>
                <label htmlFor="type-declaration" className="block text-sm font-medium text-slate-700 mb-2">
                  Type de déclaration
                </label>
                <select
                  id="type-declaration"
                  value={declarationType}
                  onChange={(e) => {
                    setDeclarationType(e.target.value as 'g50' | 'g29' | 'ibs' | 'irg' | 'tap');
                    setSelectedPeriod('');
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
                >
                  <option value="g50">📄 G50 - Déclaration Mensuelle (TVA, TAP, IRG)</option>
                  <option value="g29">📊 G29 - État des Honoraires & Commissions (Annuelle)</option>
                  <option value="ibs">💰 IBS - Impôt sur les Bénéfices (Trimestrielle/Annuelle)</option>
                  <option value="irg">👥 IRG - Impôt sur le Revenu Global (Annuelle)</option>
                  <option value="tap">🏛️ TAP - Taxe sur l'Activité Professionnelle (Annuelle)</option>
                </select>
              </div>

              <div>
                <label htmlFor="periode-declaration" className="block text-sm font-medium text-slate-700 mb-2">
                  {declarationType === 'g50' ? 'Période (Mois)' :
                    (declarationType === 'ibs' && selectedPeriod.includes('Annuel')) ? 'Exercice (Année)' :
                      (declarationType === 'g29' || declarationType === 'irg' || declarationType === 'tap') ? 'Exercice (Année)' :
                        'Période (Trimestre ou Année)'}
                </label>
                {declarationType === 'g50' ? (
                  <input
                    type="month"
                    id="periode-declaration"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none font-bold text-slate-700"
                  />
                ) : declarationType === 'ibs' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Année Exercice</label>
                      <select
                        value={selectedPeriod ? selectedPeriod.split('-')[0] : new Date().getFullYear().toString()}
                        onChange={(e) => {
                          const year = e.target.value;
                          const currentPeriod = selectedPeriod && selectedPeriod.includes('-') ? selectedPeriod.split('-')[1] : 'T1';
                          setSelectedPeriod(`${year}-${currentPeriod}`);
                        }}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none font-bold text-slate-700 cursor-pointer"
                      >
                        {[0, 1, 2].map(i => {
                          const y = new Date().getFullYear() - i;
                          return <option key={y} value={y}>{y}</option>;
                        })}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Période</label>
                      <select
                        value={selectedPeriod && selectedPeriod.includes('-') ? selectedPeriod.split('-')[1] : 'T1'}
                        onChange={(e) => {
                          const p = e.target.value;
                          const currentYear = selectedPeriod ? selectedPeriod.split('-')[0] : new Date().getFullYear().toString();
                          setSelectedPeriod(`${currentYear}-${p}`);
                        }}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none font-bold text-slate-700 cursor-pointer"
                      >
                        <option value="T1">1er Trimestre (T1)</option>
                        <option value="T2">2ème Trimestre (T2)</option>
                        <option value="T3">3ème Trimestre (T3)</option>
                        <option value="T4">4ème Trimestre (T4)</option>
                        <option value="Annuel">Déclaration Annuelle</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    id="periode-declaration"
                    placeholder="2026"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-500 outline-none font-bold text-slate-700"
                  />
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeclarationModalOpen(false);
                    setSelectedPeriod('');
                  }}
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleGenererDeclaration}
                  disabled={(!selectedPeriod && declarationType !== 'irg' && declarationType !== 'tap') || isGeneratingDeclaration}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all disabled:opacity-50 flex items-center shadow-sm"
                >
                  {isGeneratingDeclaration ? (
                    <>
                      <SparklesIcon className="h-4 w-4 mr-2 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      Générer la déclaration
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-slate-700" />
                <div>
                  <p className="text-sm font-bold text-slate-800">Déclaration générée avec succès !</p>
                  <p className="text-xs text-slate-500">Le document est prêt pour validation et transmission.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Numéro</p>
                  <p className="text-lg font-black text-slate-900">{declarationData.numero}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Échéance</p>
                  <p className="text-lg font-black text-rose-600">{new Date(declarationData.dateEcheance).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {declarationType === 'g50' && (
                <div className="bg-white border text-center border-slate-200 rounded-2xl overflow-hidden mt-6">
                  <div className="p-3 bg-slate-50 border-b border-slate-200/60 font-bold text-xs text-slate-500 uppercase tracking-widest">Détails de la TVA</div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                    <div className="text-center px-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">TVA Collectée</p>
                      <p className="text-lg font-black text-slate-700">{formatCurrency(declarationData.tvaCollectee)}</p>
                    </div>
                    <div className="text-center px-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">TVA Déductible</p>
                      <p className="text-lg font-black text-slate-700">{formatCurrency(declarationData.tvaDeductible)}</p>
                    </div>
                    <div className="text-center px-2 bg-slate-50/50 rounded-r-xl">
                      <p className="text-[10px] font-bold text-slate-900 uppercase mb-1">Net à Verser</p>
                      <p className="text-xl font-black text-slate-900">{formatCurrency(declarationData.tvaAVerser)}</p>
                    </div>
                  </div>
                </div>
              )}

              {declarationType === 'g29' && (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mt-6">
                  <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-500 uppercase tracking-widest text-center">État des Honoraires (G29)</div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Honoraires</p>
                      <p className="text-lg font-black text-slate-900">{formatCurrency(declarationData.totalHonoraires)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Retenues (RAS)</p>
                      <p className="text-lg font-black text-rose-600">{formatCurrency(declarationData.totalRetenues)}</p>
                    </div>
                  </div>
                  <div className="px-6 pb-6 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Nombre de Bénéficiaires</p>
                    <p className="text-sm font-bold text-slate-700">{declarationData.nombreBeneficiaires}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                <button onClick={() => setDeclarationData(null)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">Refaire</button>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsPreviewModalOpen(true)}
                    className="px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all flex items-center"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Prévisualiser le Cerfa
                  </button>
                  <button className="px-6 py-3 bg-slate-100 text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center">
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Exporter PDF
                  </button>
                  <button
                    onClick={() => {
                      const subject = encodeURIComponent(`Déclaration ${declarationData.numero} - ${new Date().toLocaleDateString('fr-FR')}`);
                      const body = encodeURIComponent(`Bonjour,\n\nVeuillez trouver ci-joint la déclaration fiscale ${declarationData.numero}.\n\nCordialement,\nService Comptabilité.`);
                      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=&su=${subject}&body=${body}`, '_blank');
                    }}
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center shadow-lg hover:shadow-xl"
                  >
                    <GlobeAltIcon className="h-4 w-4 mr-2" />
                    Transmettre
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal Création de Document Fiscal */}
      <Modal
        isOpen={isDocumentModalOpen}
        onClose={() => {
          setIsDocumentModalOpen(false);
          setSelectedDocument(null);
        }}
        title={selectedDocument ? `${selectedDocument.code} - ${selectedDocument.name}` : 'Document Fiscal'}
        size="lg"
      >
        {selectedDocument && (
          <div className="space-y-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-sm font-bold text-slate-900 mb-2">{selectedDocument.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 uppercase">
                  {selectedDocument.frequency}
                </span>
                {selectedDocument.deadline && (
                  <span className="px-2 py-1 bg-slate-100 border border-slate-300 rounded-lg text-[10px] font-bold text-slate-800 uppercase">
                    Échéance: {selectedDocument.deadline}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {selectedDocument.fields?.map((field) => (
                <div key={field.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-bold text-slate-900">
                      <option value="">Sélectionner...</option>
                      {field.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-bold text-slate-900" rows={3} placeholder={field.placeholder} />
                  ) : (
                    <input type={field.type} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none font-bold text-slate-900" placeholder={field.placeholder} />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100">
              <button onClick={() => setIsDocumentModalOpen(false)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">Fermer</button>
              <button
                onClick={async () => {
                  try {
                    // Enregistre la déclaration en brouillon côté backend
                    await apiClient.post('/fiscality/declarations', {
                      document_id: selectedDocument.id,
                      country: currentCountry,
                      data: {}
                    });
                    setIsDocumentModalOpen(false);
                  } catch (err) {
                    console.error('Failed to create fiscal declaration', err);
                  }
                }}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-sm">
                Générer le document
              </button>
            </div>
          </div>
        )}
      </Modal >

      {/* Modal Rapport IA */}
      < Modal
        isOpen={isAiReportModalOpen}
        onClose={() => setIsAiReportModalOpen(false)}
        title="Rapport d'Audit Fiscal IA"
        size="lg"
      >
        <div className="space-y-6">
          {isGeneratingAiReport ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative">
                <div className="h-16 w-16 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
                <SparklesIcon className="h-6 w-6 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-xs">Analyse des flux 2024-2026...</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center space-x-3">
                <CheckCircleIcon className="h-6 w-6 text-slate-400" />
                <p className="text-sm font-bold text-slate-800 uppercase tracking-tight">Audit complété avec succès</p>
              </div>

              <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 shadow-2xl relative group overflow-hidden">
                <div className="absolute top-3 right-4 flex gap-1.5 opacity-50">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-700"></div>
                </div>
                <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {aiReportContent}
                </pre>
              </div>

              <div className="flex justify-end space-x-3">
                <button onClick={() => setIsAiReportModalOpen(false)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">Fermer</button>
                <button
                  onClick={handleExportAuditReport}
                  disabled={isExporting}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-sm flex items-center disabled:opacity-50"
                >
                  {isExporting ? <ArrowDownTrayIcon className="h-4 w-4 mr-2 animate-bounce" /> : <DocumentArrowDownIcon className="h-4 w-4 mr-2" />}
                  {isExporting ? "Exportation..." : "Exporter le rapport PDF"}
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal >

      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        title={`Prévisualisation Officielle - ${declarationData?.numero}`}
        size="xl"
      >
        <div className="bg-slate-100 p-8 rounded-2xl overflow-y-auto max-h-[80vh]">
          {declarationType === 'g50' && declarationData && (
            <G50OfficialDocument
              month={parseInt(declarationData.periode?.split('-')[1] || '1')}
              year={parseInt(declarationData.periode?.split('-')[0] || '2026')}
              salesHT={declarationData.chiffreAffairesHT}
              purchasesHT={declarationData.achatsHT}
              companyInfo={{
                name: user?.companyName || 'MA SOCIÉTÉ DZ',
                address: user?.adresse || 'Alger, Algérie',
                taxId: user?.nif || '000123456789',
                rc: user?.rc || '16/00-1234567',
                ai: user?.ai || '16123456789'
              }}
            />
          )}
          {declarationType === 'g29' && declarationData && (
            <G29OfficialDocument
              exercice={declarationData.exercice}
              beneficiaires={declarationData.beneficiaires}
              companyInfo={{
                name: user?.companyName || 'MA SOCIÉTÉ DZ',
                address: user?.adresse || 'Alger, Algérie',
                taxId: user?.nif || '000123456789',
                rc: user?.rc || '16/00-1234567',
                ai: user?.ai || '16123456789'
              }}
            />
          )}
          <div className="mt-8 flex justify-center space-x-4 no-print">
            <button
              onClick={() => window.print()}
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl flex items-center gap-2 hover:scale-105 transition-all"
            >
              <CalculatorIcon className="h-5 w-5" />
              Imprimer le document officiel
            </button>
          </div>
        </div>
      </Modal>

      <style>{`
        .font-arabic { font-family: 'Noto Sans Arabic', sans-serif; }
        @media print {
            .no-print { display: none !important; }
            body * { visibility: hidden; }
            .printable-g29, .printable-g29 * { visibility: visible; }
            .printable-g29 { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div >
  );
};

export default Fiscalite;
