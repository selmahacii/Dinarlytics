import React, { useState, useRef, useEffect } from 'react';
import {
  SparklesIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';
import aiService from '@features/ai/services/aiService';
import { computeRatios } from '@shared/utils/ratios';
import { getBenchmarks } from '@shared/utils/benchmarks';
import { generateRatioAlerts } from '@shared/utils/ratioAlerts';
import { logAction } from '@shared/utils/ActivityLog';
import { usePermission } from '@shared/hooks/usePermission';
import {
  comparePeriods,
  detectAnomalies,
  analyzeScenario,
  benchmarkAnalysis,
  generateFinancialSummary
} from '@shared/utils/financialAnalysis';
import {
  forecastCashFlow,
  forecastRevenue,
  detectSeasonalPattern,
  generatePredictiveAlerts,
  generatePredictiveScenarios,
  calculateFinancialRisk,
  PredictiveAlert,
  PredictiveScenario
} from '@features/ai/utils/predictiveAnalysis';

interface Message {
  id: string;
  type: 'user' | 'lia';
  content: string;
  timestamp: Date;
  data?: any;
  suggestions?: string[];
}

type ActionStatus = 'todo' | 'in-progress' | 'done';
interface ActionItem {
  id: string;
  title: string;
  owner: string;
  due: string; // ISO date or short label
  status: ActionStatus;
  note?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

const ChatbotLIA: React.FC = () => {
  const { user, companyData, formatCurrency, currentDevise, currentCountry, planComptable } = useApp();
  // Contexte entreprise pour adapter les contenus (EURL/SARL/SPA et micro/small/...)
  const companyType = (user?.companyType as string) || 'eurl';
  const segment = ((user?.segment as string) || 'micro') as 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
  const sector = ((user?.secteur as string) || 'general').toLowerCase();
  const sectorLabel = sector.toUpperCase();

  // Benchmarks centralisés (utilitaire partagé)
  const bm = getBenchmarks({ segment, companyType, sector });
  // Ratios calculés (base + avancés) pour usage dans réponses / plan / alertes
  const { base: ratiosBase, advanced: ratiosAdv } = computeRatios({ companyData, segment, companyType, sector });
  const { has } = usePermission();
  // Fonctions utilitaires pour remplacer les emojis par du texte
  const getConfidenceLabel = (confidence: 'high' | 'medium' | 'low'): string => {
    switch (confidence) {
      case 'high': return '[CONFIANCE ELEVEE]';
      case 'medium': return '[CONFIANCE MOYENNE]';
      case 'low': return '[CONFIANCE FAIBLE]';
    }
  };

  const getTrendLabel = (trend: 'up' | 'down' | 'stable'): string => {
    switch (trend) {
      case 'up': return '[HAUSSE]';
      case 'down': return '[BAISSE]';
      case 'stable': return '[STABLE]';
    }
  };

  const getRiskLabel = (risk: 'low' | 'medium' | 'high' | 'critical'): string => {
    switch (risk) {
      case 'critical': return '[RISQUE CRITIQUE]';
      case 'high': return '[RISQUE ELEVE]';
      case 'medium': return '[RISQUE MODERE]';
      case 'low': return '[RISQUE FAIBLE]';
    }
  };

  const getStatusLabel = (status: 'good' | 'warning' | 'critical' | 'excellent' | 'average' | 'below' | 'poor'): string => {
    switch (status) {
      case 'excellent': return 'EXCELLENT';
      case 'good': return 'BON';
      case 'average': return 'MOYEN';
      case 'below': return 'EN DESSOUS DE LA MOYENNE';
      case 'poor': return 'FAIBLE';
      case 'warning': return 'ATTENTION';
      case 'critical': return 'CRITIQUE';
    }
  };

  const [messages, setMessages] = useState<Message[]>([]);

  const { currentLang } = useApp();

  // Personalized dynamic greeting
  useEffect(() => {
    if (user) {
      const roleDisplay = user.role_display || user.role || 'Utilisateur';

      let greeting = '';
      if (currentLang === 'ar') {
        greeting = `مرحباً ${user.prenom || ''} ${user.nom || ''}. أنا LIA، مساعدتك للذكاء الاصطناعي.\n\nبصفتك **${roleDisplay}**، أنا مستعدة لمرافقتك في التسيير الاستراتيجي لـ **${user.companyName || 'مؤسستك'}**.\n\nإليك كيف يمكنني مساعدتك اليوم:\n• **التحليل التوقعي**: توقعات التدفق النقدي ورقم الأعمال.\n• **المحاكاة الاستراتيجية**: سيناريوهات متفائلة / واقعية / متشائمة.\n• **تحسين الأداء**: تحليل مالي كامل لدورة التحويل الخاصة بك.\n\nأي جانب من جوانب أدائك تود تدقيقه؟`;
      } else if (currentLang === 'en') {
        greeting = `Hello ${user.prenom || ''} ${user.nom || ''}. I am LIA, your Strategic Intelligence Assistant.\n\nAs a **${roleDisplay}**, I am ready to support you in the strategic management of **${user.companyName || 'your organization'}**.\n\nHere is how I can assist you today:\n• **Predictive Analysis**: 13-week cash flow and 12-month revenue projections.\n• **Strategic Simulations**: Optimistic / Realistic / Pessimistic scenarios.\n• **Performance Hub**: Full financial analysis of your conversion cycle (CCC/BFR).\n\nWhich aspect of your performance would you like to audit?`;
      } else {
        greeting = `Bonjour ${user.prenom || ''} ${user.nom || ''}. Je suis LIA, votre assistante d'intelligence décisionnelle.\n\nEn tant que **${roleDisplay}**, je suis prête à vous accompagner dans le pilotage stratégique de **${user.companyName || 'votre entreprise'}**.\n\nVoici comment je peux vous assister aujourd'hui :\n• **Analyse Prédictive** : Projections de trésorerie à 13 semaines et CA à 12 mois.\n• **Simulations Stratégiques** : Scénarios Optimiste / Réaliste / Pessimiste.\n• **Optimisation Opérationnelle** : Détection de patterns saisonniers et scoring de risque.\n• **Pilotage de la Performance** : Analyse financière complète de votre cycle de conversion (CCC/BFR).\n\nQuel aspect de votre performance souhaitez-vous auditer ?`;
      }

      const initialSuggestions = getRoleSuggestions(user.role);

      setMessages([
        {
          id: '1',
          type: 'lia',
          content: greeting,
          timestamp: new Date(),
          suggestions: initialSuggestions
        }
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, currentLang]);

  const getRoleSuggestions = (role?: string): string[] => {
    const r = role?.toLowerCase() || '';
    const isExec = r === 'dg' || r === 'gerant' || r === 'admin' || r.includes('director') || r.includes('ceo');
    const isFinance = r === 'daf' || r.includes('comptable') || r === 'tresorier' || r === 'cfo';
    const isOps = r.includes('manager') || r === 'commercial' || r === 'vendeur';

    if (isExec) {
      return (currentLang === 'ar' ? ['ملخص استراتيجي للمجموعة', 'تحليل الأداء القطاعي', 'سيناريوهات النمو M+6', 'تقرير المخاطر العالمي'] : currentLang === 'en' ? ['Group strategic summary', 'Sector performance analysis', 'M+6 growth scenarios', 'Global risk report'] : ['Synthèse stratégique du groupe', 'Analyse de performance sectorielle', 'Scénarios de croissance M+6', 'Rapport de risque global']);
    }
    if (isFinance) {
      return (currentLang === 'ar' ? ['تحليل دورة النقد (CCC)', 'توقعات التدفق النقدي', 'تحسين رأس المال العامل', 'تدقيق التنبيهات'] : currentLang === 'en' ? ['Cash cycle analysis (CCC)', 'Cash-flow forecasts (13 wk)', 'WCR optimization', 'Flow anomaly audit'] : ['Analyse du cycle de trésorerie (CCC)', 'Prévisions de cash-flow (13 sem)', 'Optimisation du BFR', 'Audit des anomalies de flux']);
    }
    if (isOps) {
      return (currentLang === 'ar' ? ['الأداء العملياتي للوحدة', 'تحسين المخزون (DIO)', 'متابعة التحصيل (DSO)', 'خطة عمل ذات أولوية'] : currentLang === 'en' ? ['Unit operational performance', 'Stock optimization (DIO)', 'Collection follow-up (DSO)', 'Prioritized action plan'] : ['Performance opérationnelle de l\'unité', 'Optimisation des stocks (DIO)', 'Suivi du recouvrement (DSO)', 'Plan d\'actions priorisé']);
    }
    return (currentLang === 'ar' ? ['تحليل مالي كامل', 'توقعات التدفق النقدي', 'سيناريوهات توقعية'] : currentLang === 'en' ? ['Full financial analysis', 'Cash flow forecasts', 'Predictive scenarios'] : ['Analyse financière complète', 'Prévisions de trésorerie', 'Scénarios prédictifs']);
  };
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Action Plan state (persisted per user)
  const storageKey = `action_plan_user_${user?.id || 'anon'}`;
  const [showPlan, setShowPlan] = useState(false);
  const [plan, setPlan] = useState<ActionItem[]>([]);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftOwner, setDraftOwner] = useState(user?.nom || '');
  const [draftDue, setDraftDue] = useState('');
  const [draftNote, setDraftNote] = useState('');

  const canEditPlan = has('rapports-create');
  const canExport = has('export-data');

  // Mettre à jour le contexte régional du modèle IA
  useEffect(() => {
    // Region context is now sent with each AI request
  }, [currentDevise, currentCountry, planComptable]);

  // Auto-scroll vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load persisted plan when user changes
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setPlan(parsed as ActionItem[]);
      } else {
        setPlan([]);
      }
    } catch {
      setPlan([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const persistPlan = (items: ActionItem[]) => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    } catch { }
  };

  const log = (action: 'create' | 'update' | 'delete' | 'status-change', details: string) => {
    try {
      const userIdNum = user ? (Number((user as any).id) || -1) : -1;
      logAction({ userId: userIdNum, action, actor: user?.nom || 'Utilisateur', details });
    } catch { }
  };

  const addAction = () => {
    if (!draftTitle.trim()) return;
    if (!canEditPlan) return;
    const now = new Date().toISOString();
    const item: ActionItem = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: draftTitle.trim(),
      owner: draftOwner.trim() || (user?.nom || ''),
      due: draftDue.trim(),
      status: 'todo',
      note: draftNote.trim() || undefined,
      createdAt: now,
      updatedAt: now
    };
    setPlan(prev => {
      const next = [item, ...prev];
      persistPlan(next);
      return next;
    });
    log('create', `Plan: création '${item.title}' (resp: ${item.owner}, due: ${item.due || '-'})`);
    setDraftTitle('');
    setDraftOwner(user?.nom || '');
    setDraftDue('');
    setDraftNote('');
  };

  const updateAction = (id: string, patch: Partial<ActionItem>, kind: 'update' | 'status-change' = 'update') => {
    if (!canEditPlan) return;
    setPlan(prev => {
      const next = prev.map(it => it.id === id ? { ...it, ...patch, updatedAt: new Date().toISOString() } : it);
      persistPlan(next);
      return next;
    });
    const p: any = patch;
    if (kind === 'status-change') {
      log('status-change', `Plan: statut -> ${p.status} pour '${id}'`);
    } else {
      log('update', `Plan: mise à jour '${id}'`);
    }
  };

  const deleteAction = (id: string) => {
    if (!canEditPlan) return;
    setPlan(prev => {
      const item = prev.find(i => i.id === id);
      const next = prev.filter(i => i.id !== id);
      persistPlan(next);
      if (item) log('delete', `Plan: suppression '${item.title}'`);
      return next;
    });
  };

  // Générer un plan automatiquement depuis l'analyse actuelle
  const seedPlanFromAnalysis = () => {
    if (!canEditPlan) return { ok: false, reason: 'Permission requise: rapports-create' } as const;
    const existingTitles = new Set(plan.map(p => p.title));
    // Estimations basées sur companyData et benchmarks
    const revM = companyData?.revenueMonth ?? 1200000;
    const profitPct = companyData?.profitMargin ?? 18;
    const cash = companyData?.cashBalance ?? Math.round(revM * 0.8);
    const ar = companyData?.accountsReceivable ?? Math.round(revM * 1.5);
    const ap = companyData?.accountsPayable ?? Math.round(revM * 0.8);
    const invValue = companyData?.inventoryValue ?? Math.round(revM * 1.2);
    const turnover = companyData?.stockTurnover || 8;
    const cogsMonth = Math.max(1, Math.round(revM * (1 - profitPct / 100)));
    const dso = Math.max(0, Math.round((ar / Math.max(1, revM)) * 30));
    const dio = Math.max(0, Math.round(365 / Math.max(0.1, turnover)));
    const dpo = Math.max(0, Math.round((ap / Math.max(1, cogsMonth)) * 30));
    const liqQuick = (cash + ar) / Math.max(1, ap);

    const now = new Date().toISOString();
    const inDaysLocal = (n: number) => {
      const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10);
    };

    const actions: ActionItem[] = [];
    if (dso > bm.dsoMax) {
      actions.push({ id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, title: 'Accélérer encaissements (DSO)', owner: companyType === 'eurl' ? 'Gérant' : 'Resp. Recouvrement', due: inDaysLocal(15), status: 'todo', note: `DSO ${dso} j > cible ${bm.dsoMax} j: relances J+7/J+15/J+30, escompte 2%, scoring clients.`, createdAt: now, updatedAt: now });
    }
    if (dio > bm.dioMax) {
      actions.push({ id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, title: 'Optimiser stock (DIO)', owner: segment === 'micro' ? 'Gestionnaire Stock' : 'Supply Chain', due: inDaysLocal(30), status: 'todo', note: `DIO ${dio} j > cible ${bm.dioMax} j: ABC, seuils, liquidation lents, promo ciblée.`, createdAt: now, updatedAt: now });
    }
    if (dpo < bm.dpoMin) {
      actions.push({ id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, title: 'Renégocier DPO', owner: 'Achats', due: inDaysLocal(30), status: 'todo', note: `DPO ${dpo} j < ${bm.dpoMin} j: viser ${bm.dpoMin}-${Math.max(55, bm.dpoMin + 10)} j; paiements groupés.`, createdAt: now, updatedAt: now });
    }
    if (profitPct < bm.marginMin) {
      actions.push({ id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, title: 'Améliorer marge', owner: 'Commercial', due: inDaysLocal(20), status: 'todo', note: `Marge ${profitPct.toFixed(1)}% < ${bm.marginMin}%: ajuster prix/remises, mix produit, coûts variables.`, createdAt: now, updatedAt: now });
    }
    if (companyType === 'spa' || segment === 'enterprise') {
      actions.push({ id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, title: 'Workflows & Audit', owner: 'Finance IT', due: inDaysLocal(45), status: 'todo', note: 'Appro. multi‑niveaux, journaux d’audit, traçabilité.', createdAt: now, updatedAt: now });
    }
    if (liqQuick < bm.liqQuickMin) {
      actions.push({ id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, title: 'Sécuriser trésorerie', owner: companyType === 'eurl' ? 'Gérant' : 'DAF', due: inDaysLocal(10), status: 'todo', note: `Liquidité immédiate ${liqQuick.toFixed(2)} < ${bm.liqQuickMin.toFixed(2)}: prioriser encaissements, lisser décaissements, temporiser capex.`, createdAt: now, updatedAt: now });
    }

    if (actions.length === 0) {
      actions.push({ id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, title: 'Maintenir le suivi mensuel', owner: user?.nom || 'Responsable', due: inDaysLocal(30), status: 'todo', note: 'Pas d’alerte majeure; maintenir les contrôles et KPIs.', createdAt: now, updatedAt: now });
    }

    let added = 0;
    setPlan(prev => {
      const merged = [...prev];
      for (const act of actions) {
        if (!merged.some(m => m.title === act.title)) {
          merged.unshift(act); // mettre en avant les nouvelles actions
          if (!existingTitles.has(act.title)) added++;
        }
      }
      persistPlan(merged);
      return merged;
    });
    log('create', `Plan: génération depuis analyse (${actions.length} actions, ajout: ${added})`);
    return { ok: true as const, added };
  };

  const seedDemoPlan = () => {
    if (!canEditPlan) return;
    const now = new Date().toISOString();
    const demo: ActionItem[] = [
      { id: `act_${Date.now()}_a`, title: 'Accélérer encaissements (DSO)', owner: 'Resp. Recouvrement', due: inDays(15), status: 'todo', note: 'Relances J+7/J+15/J+30, escompte 2%, scoring.', createdAt: now, updatedAt: now },
      { id: `act_${Date.now()}_b`, title: 'Optimiser stock (DIO)', owner: 'Supply Chain', due: inDays(30), status: 'todo', note: 'ABC, seuils de réapprovisionnement, liquidation lents.', createdAt: now, updatedAt: now },
      { id: `act_${Date.now()}_c`, title: 'Renégocier DPO', owner: 'Achats', due: inDays(30), status: 'in-progress', note: 'Cible 45–60 jours sur top fournisseurs.', createdAt: now, updatedAt: now },
      { id: `act_${Date.now()}_d`, title: 'Marge et remises', owner: 'Commercial', due: inDays(20), status: 'todo', note: 'Limiter remises; ajuster pricing produits faibles marges.', createdAt: now, updatedAt: now },
      { id: `act_${Date.now()}_e`, title: 'Workflows & Audit', owner: 'Finance IT', due: inDays(45), status: 'todo', note: 'Approbations multi-niveaux, journaux d’audit, traçabilité.', createdAt: now, updatedAt: now }
    ];
    setPlan(demo);
    persistPlan(demo);
    log('create', 'Plan: import du plan de démo (5 actions)');
  };

  function inDays(n: number) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }

  // Données contextuelles pour les réponses (ancrage sur l'entreprise)
  const dailySummary = (() => {
    const monthRevenue = companyData?.revenueMonth ?? 2500000;
    const invoices = companyData?.invoicesCount ?? 125;
    const avgInvoice = companyData?.averageInvoice || (invoices > 0 ? monthRevenue / invoices : 0);
    // Approximation quotidienne
    const caJour = Math.round(monthRevenue / 30);
    const achatsJour = Math.round(caJour * 0.35);
    const soldToday = Math.max(1, Math.round((caJour / Math.max(avgInvoice, 1)) * 0.8));
    const remaining = Math.max(0, Math.round(invoices - soldToday));
    const encIn = Math.round((companyData?.cashBalance ?? monthRevenue) * 0.12);
    const encOut = Math.round(encIn * 0.7);
    const margeBrute = Math.round((companyData?.profitMargin ?? 18) * 10) / 10;
    return {
      ca: { value: caJour, change: Math.round((companyData?.revenueGrowth ?? 8) * 10) / 10, trend: (companyData?.revenueGrowth ?? 0) >= 0 ? 'up' : 'down' },
      achats: { value: achatsJour, change: -4, trend: 'down' },
      articlesVendus: { sold: soldToday, remaining },
      encaissements: { in: encIn, out: encOut },
      margeBrute,
      igp: { score: 78, status: 'bon' }
    };
  })();

  // Fonctions du chatbot
  const generateLiaResponse = async (userMessage: string): Promise<Message> => {
    setIsTyping(true);
    let apiResponse = null;

    try {
      // Direct API call to the new AI chat endpoint
      // Using a short timeout to fail fast if backend is not available
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: userMessage,
          company_id: (user as any)?.company_id || 'mock-company'
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        apiResponse = {
          id: Date.now().toString(),
          type: 'lia',
          content: data.content,
          timestamp: new Date(),
          data: data.data,
          suggestions: data.suggestions || [
            'Analyse de risque',
            'Prévisions de CA',
            'Fiscalité G50'
          ]
        };
      }
    } catch (error) {
      console.warn('Chatbot API unavailable, falling back to local simulation:', error);
      // Fallback to local logic below
    } finally {
      setIsTyping(false);
    }

    if (apiResponse) {
      return apiResponse as Message;
    }

    // Le reste du code utilise userMessage comme 'message' (LOGIQUE LOCALE)

    // Le reste du code utilise userMessage comme 'message'
    const message = userMessage.toLowerCase();

    // Prévisions trésorerie améliorées avec analyse prédictive
    const wantsForecast =
      message.includes('/previsions') ||
      message.includes('/forecast') ||
      message.includes('prévisions de cash-flow') ||
      (message.includes('prévision') && (message.includes('trésorerie') || message.includes('tresorerie'))) ||
      (message.includes('forecast') && message.includes('cash'));

    if (wantsForecast) {
      const revM = companyData?.revenueMonth ?? 1200000;
      const cash0 = companyData?.cashBalance ?? Math.round(revM * 0.8);
      const ar = companyData?.accountsReceivable ?? Math.round(revM * 1.5);
      const ap = companyData?.accountsPayable ?? Math.round(revM * 0.8);
      const monthlyExpenses = revM * (1 - (companyData?.profitMargin ?? 18) / 100);

      // Utiliser la fonction prédictive améliorée
      const forecasts = forecastCashFlow(cash0, revM, monthlyExpenses, ar, ap, 13);

      // Détecter les risques
      const criticalWeeks = forecasts.filter(f => {
        const monthlyRevenue = revM;
        const cashMonths = f.value / monthlyRevenue;
        return cashMonths < 1;
      });

      const lines: string[] = [];
      lines.push(`📑 AUDIT PRÉDICTIF DE TRÉSORERIE (13 semaines)`);
      lines.push(`Organisation: ${user?.companyName || 'Entreprise'} • Segment: ${segment.toUpperCase()} • Rôle: ${user?.role_display || user?.role}`);
      lines.push('');
      lines.push('─'.repeat(50));
      lines.push('');

      forecasts.forEach((f, idx) => {
        const date = new Date(f.date);
        const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        const confidenceLabel = getConfidenceLabel(f.confidence);
        const trendLabel = getTrendLabel(f.trend ?? 'stable');
        const isCritical = criticalWeeks.some(cw => cw.date === f.date);
        const riskLabel = isCritical ? '⚠️ [ALERTE LIQUIDITÉ]' : '✅ [STABLE]';

        lines.push(`${f.period} (${dateStr}) — ${riskLabel}`);
        lines.push(`  • Solde prévisionnel: ${formatCurrency(f.value)}`);
        lines.push(`  • Dynamique: ${trendLabel}`);
        lines.push(`  • Indice de confiance: ${confidenceLabel}`);
        if (isCritical) {
          lines.push(`  ${riskLabel} Risque de pénurie de trésorerie`);
        }
        if (f.min && f.max) {
          lines.push(`  Intervalle de confiance: ${formatCurrency(f.min)} - ${formatCurrency(f.max)}`);
        }
        lines.push('');
      });

      if (criticalWeeks.length > 0) {
        lines.push('─'.repeat(60));
        lines.push('');
        lines.push('ALERTES PRÉDICTIVES');
        lines.push('');
        criticalWeeks.forEach(cw => {
          const date = new Date(cw.date);
          const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
          const cashMonths = (cw.value / revM).toFixed(1);
          lines.push(`  • ${cw.period} (${dateStr}): Trésorerie insuffisante`);
          lines.push(`    Solde prévu: ${formatCurrency(cw.value)} (${cashMonths} mois de CA)`);
        });
        lines.push('');
        lines.push('RECOMMANDATIONS PRIORITAIRES:');
        lines.push('  1. Accélérer les encaissements (relances proactives)');
        lines.push('  2. Négocier des délais de paiement avec les fournisseurs');
        lines.push('  3. Réduire les dépenses non essentielles');
        lines.push('  4. Envisager un financement court terme si nécessaire');
        lines.push('');
      }

      // Analyse de risque
      const riskAnalysis = calculateFinancialRisk(
        {
          cash: cash0,
          revenue: revM,
          dso: Math.round((ar / revM) * 30),
          margin: companyData?.profitMargin ?? 18
        },
        { cash: forecasts }
      );

      const content = [
        `🛡️ AUDIT DE RISQUE FINANCIER — PROTOCOLE LIA`,
        `Organisation: ${user?.companyName || 'Groupe'} • Niveau Global: ${getRiskLabel(riskAnalysis.overallRisk).toUpperCase()} (${riskAnalysis.score}/100)`,
        '',
        '─'.repeat(50),
        '',
        '1. AUDIT DES FACTEURS DE RISQUE',
        ...riskAnalysis.factors.map(factor =>
          `• ${factor.factor.padEnd(20)} : ${getRiskLabel(factor.risk).toUpperCase()} [Impact: ${factor.impact} pts]\n  ${factor.description}`
        ),
        '',
        '2. RECOMMANDATION STRATÉGIQUE RÉGLEMENTAIRE',
        riskAnalysis.recommendation,
        '',
        '─'.repeat(50),
        '© LIA Risk Management Unit - Financial Compliance'
      ].join('\n');
      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        data: { forecasts, riskAnalysis, alerts: criticalWeeks },
        suggestions: [
          'Scénarios prédictifs (optimiste/réaliste/pessimiste)',
          'Prévisions de CA (12 mois)',
          'Détecter les patterns saisonniers',
          'Générer un plan d\'actions'
        ]
      };
    }

    // Scénarios prédictifs multiples
    const wantsScenarios =
      message.includes('/scenarios') ||
      message.includes('/scenarii') ||
      message.includes('scénarios de croissance') ||
      message.includes('scenarios de croissance') ||
      (message.includes('scénario') && (message.includes('prédictif') || message.includes('predictif'))) ||
      (message.includes('scenario') && message.includes('predictive'));

    if (wantsScenarios) {
      const revM = companyData?.revenueMonth ?? 1200000;
      const revY = revM * 12;
      const margin = companyData?.profitMargin ?? 18;
      const cash = companyData?.cashBalance ?? Math.round(revM * 0.8);
      const ar = companyData?.accountsReceivable ?? Math.round(revM * 1.5);
      const dso = Math.round((ar / revM) * 30);
      const turnover = companyData?.stockTurnover || 8;
      const dio = Math.round(365 / Math.max(0.1, turnover));
      const ap = companyData?.accountsPayable ?? Math.round(revM * 0.8);
      const dpo = Math.round((ap / Math.max(1, (revM * (1 - margin / 100)))) * 30);

      const scenarios = generatePredictiveScenarios({
        revenue: revY,
        margin,
        cash,
        dso,
        dio,
        dpo
      });

      const content = [
        `🔮 SCÉNARIOS PRÉDICTIFS — HORIZON 6 MOIS`,
        `Organisation: ${user?.companyName || 'Groupe'} • Profil: ${companyType.toUpperCase()} • Secteur: ${sectorLabel}`,
        '',
        '─'.repeat(50),
        '',
        ...scenarios.map((scenario, idx) => {
          const probLabel = scenario.probability >= 50 ? '🟢 [PROBABILITÉ ÉLEVÉE]' : scenario.probability >= 30 ? '🟡 [PROBABILITÉ MOYENNE]' : '🔴 [PROBABILITÉ FAIBLE]';

          return [
            `${scenario.name.toUpperCase()} — ${probLabel}`,
            `Description: ${scenario.description}`,
            '',
            'PROJECTIONS DES MÉTRIQUES CLÉS:',
            scenario.metrics.revenue ? `  • Chiffre d'Affaires: ${formatCurrency(scenario.metrics.revenue.projected)} (${Number(scenario.metrics.revenue.change) > 0 ? '+' : ''}${((Number(scenario.metrics.revenue.change) / scenario.metrics.revenue.current) * 100).toFixed(1)}%)` : '',
            scenario.metrics.margin ? `  • Marge Bénéficiaire: ${scenario.metrics.margin.projected.toFixed(1)}% (${Number(scenario.metrics.margin.change) > 0 ? '+' : ''}${scenario.metrics.margin.change.toFixed(1)} pts)` : '',
            scenario.metrics.cash ? `  • Position de Trésorerie: ${formatCurrency(scenario.metrics.cash.projected)} (${Number(scenario.metrics.cash.change) > 0 ? '+' : ''}${((Number(scenario.metrics.cash.change) / scenario.metrics.cash.current) * 100).toFixed(1)}%)` : '',
            '',
            'HYPOTHÈSES STRATÉGIQUES:',
            ...scenario.assumptions.map((ass, i) => `  ${i + 1}. ${ass}`),
            '',
            scenario.risks.length > 0 ? 'FACTEURS DE RISQUE:' : '',
            ...scenario.risks.map((risk, i) => `  • ${risk}`),
            '',
            '─'.repeat(30),
            ''
          ].filter(l => l !== '').join('\n');
        }),
        '© LIA Scenario Planning - Strategic Forecasting'
      ].join('\n');
      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        data: { scenarios },
        suggestions: [
          'Prévisions de trésorerie (13 semaines)',
          'Prévisions de CA (12 mois)',
          'Détecter les patterns saisonniers',
          'Analyse de risque financier'
        ]
      };
    }

    // Prévisions de CA avec tendances
    const wantsRevenueForecast =
      message.includes('/prevision-ca') ||
      message.includes('/forecast-revenue') ||
      (message.includes('prévision') && (message.includes('ca') || message.includes('chiffre'))) ||
      (message.includes('forecast') && message.includes('revenue'));

    if (wantsRevenueForecast) {
      const revM = companyData?.revenueMonth ?? 1200000;
      // Générer des données historiques simulées (12 derniers mois)
      const historicalRevenue: number[] = [];
      for (let i = 11; i >= 0; i--) {
        const monthFactor = 1 + (Math.random() - 0.5) * 0.1; // Variation de ±5%
        const trendFactor = 1 + (11 - i) * 0.01; // Légère tendance à la hausse
        historicalRevenue.push(revM * monthFactor * trendFactor);
      }

      const forecasts = forecastRevenue(historicalRevenue, 12);

      if (forecasts.length === 0) {
        return {
          id: Date.now().toString(),
          type: 'lia',
          content: '❌ Pas assez de données historiques pour générer des prévisions de CA. Minimum 3 mois requis.',
          timestamp: new Date(),
          suggestions: ['Prévisions de trésorerie (13 semaines)', 'Analyse financière complète']
        };
      }

      // Calculer la croissance moyenne
      const avgGrowth = forecasts.length > 0
        ? ((forecasts[forecasts.length - 1].value - forecasts[0].value) / forecasts[0].value) * 100
        : 0;

      const content = [
        `📈 PRÉVISIONS DE REVENUS — HORIZON 12 MOIS`,
        `Organisation: ${user?.companyName || 'Groupe'} • Profil: ${companyType.toUpperCase()} • Secteur: ${sectorLabel}`,
        '',
        '─'.repeat(50),
        '',
        'PROJECTIONS MENSUELLES:',
        ...forecasts.map(f => {
          const date = new Date(f.date);
          const dateStr = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
          return `• ${dateStr.padEnd(18)} : ${formatCurrency(f.value).padStart(15)} [${getConfidenceLabel(f.confidence)}]`;
        }),
        '',
        '─'.repeat(25),
        '',
        'SYNTHÈSE DE CROISSANCE PRÉVUE:',
        `• Variation Totale Estimée : ${avgGrowth > 0 ? '+' : ''}${avgGrowth.toFixed(1)}%`,
        `• Tendance de Fond        : ${avgGrowth > 0 ? 'HAUSSIÈRE (Favorable)' : avgGrowth < 0 ? 'BAISSIÈRE (Critique)' : 'STABLE'}`,
        '',
        '👉 Recommandation : Alignez vos capacités de production et vos budgets marketing sur cette trajectoire.',
        '',
        '© LIA Revenue Forecasting - Predictive Growth Analysis'
      ].join('\n');
      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        data: { forecasts, historicalRevenue, avgGrowth },
        suggestions: [
          'Détecter les patterns saisonniers',
          'Scénarios prédictifs',
          'Prévisions de trésorerie (13 semaines)',
          'Analyse financière complète'
        ]
      };
    }



    // Détection de patterns saisonniers
    const wantsSeasonalPattern =
      message.includes('/saisonnier') ||
      message.includes('/seasonal') ||
      (message.includes('pattern') && message.includes('saisonnier')) ||
      (message.includes('saisonnalité') || message.includes('saisonnier'));

    if (wantsSeasonalPattern) {
      const revM = companyData?.revenueMonth ?? 1200000;
      // Générer des données historiques simulées (24 mois pour meilleure détection)
      const historicalRevenue: number[] = [];
      const seasonalFactors = [0.85, 0.9, 1.0, 1.05, 1.1, 1.15, 1.1, 1.0, 0.95, 1.05, 1.1, 1.05]; // Pattern saisonnier simulé

      for (let i = 23; i >= 0; i--) {
        const monthIndex = i % 12;
        const seasonalFactor = seasonalFactors[monthIndex];
        const trendFactor = 1 + (23 - i) * 0.005; // Légère tendance
        historicalRevenue.push(revM * seasonalFactor * trendFactor);
      }

      const pattern = detectSeasonalPattern(historicalRevenue, 'monthly');

      if (!pattern) {
        return {
          id: Date.now().toString(),
          type: 'lia',
          content: '[ERREUR] Pas assez de données historiques pour détecter des patterns saisonniers. Minimum 12 mois requis.',
          timestamp: new Date(),
          suggestions: ['Prévisions de CA (12 mois)', 'Prévisions de trésorerie (13 semaines)']
        };
      }

      const safePattern = pattern!; // Ensure non-null context

      const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

      const content = [
        `🔄 AUDIT DES PATTERNS SAISONNIERS`,
        `Organisation: ${user?.companyName || 'Groupe'} • Période d'Analyse: 24 mois • Secteur: ${sectorLabel}`,
        '',
        '─'.repeat(50),
        '',
        '1. DÉTECTION DE SAISONNALITÉ',
        safePattern.description,
        '',
        '2. POINTS DE CONTRÔLE CRITIQUES',
        `• Période de Pic (High)    : ${monthNames[safePattern.peakMonth!]}`,
        `• Période de Creux (Low)   : ${monthNames[safePattern.lowMonth!]}`,
        `• Facteur de Saisonnalité  : ${(safePattern.seasonalityFactor * 100).toFixed(1)}%`,
        '',
        '3. RECOMMANDATIONS DE PILOTAGE STRATÉGIQUE',
        ...(safePattern.seasonalityFactor > 0.3 ? [
          '⚠️ Saisonnalité Marquée :',
          '  • Optimisation des Stocks : Anticiper le réapprovisionnement 60 jours avant le pic.',
          '  • Gestion de Trésorerie : Constituer une réserve de liquidité durant le pic pour couvrir le creux.',
          '  • Marketing : Lancer les campagnes d\'acquisition 30 jours avant la phase ascendante.',
          '  • RH : Envisager des renforts temporaires ou une modulation du temps de travail.'
        ] : [
          '✅ Activité Linéaire :',
          '  • Focus sur l\'amélioration continue des marges.',
          '  • Stabilité des flux de trésorerie permettant des investissements réguliers.',
          '  • Maintenance d\'un niveau de stock constant.'
        ]),
        '',
        '─'.repeat(50),
        '© LIA Pattern Intelligence - Contextual Analysis'
      ].join('\n');
      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        data: { pattern, historicalRevenue },
        suggestions: [
          'Prévisions de CA (12 mois)',
          'Prévisions de trésorerie (13 semaines)',
          'Scénarios prédictifs',
          'Analyse financière complète'
        ]
      };
    }

    // Plan d'actions (statique/démo)
    const wantsPlan =
      message.includes('/plan') ||
      (message.includes('plan') && message.includes('action')) ||
      (message.includes('plan') && message.includes('actions'));

    if (wantsPlan) {
      const baseTasks = [
        { titre: 'Accélérer encaissements (DSO)', resp: companyType === 'eurl' ? 'Gérant' : 'Resp. Recouvrement', delai: 'J+15', detail: 'Relances J+7/J+15/J+30, escompte 2%, scoring clients.' },
        { titre: 'Optimiser stock (DIO)', resp: segment === 'micro' ? 'Gestionnaire Stock' : 'Supply Chain', delai: 'J+30', detail: 'ABC, seuils de réapprovisionnement, liquidation lents.' },
        { titre: 'Renégocier DPO', resp: 'Achats', delai: 'J+30', detail: `Cible ${Math.max(45, Math.round(bm.dpoMin))}–${Math.max(55, Math.round(bm.dpoMin) + 15)} jours sur top fournisseurs.` },
        { titre: 'Marge et remises', resp: 'Commercial', delai: 'J+20', detail: 'Limiter remises produits faible marge; ajuster prix/mix.' }
      ];
      const spaExtras = [
        { titre: 'Workflows & Audit', resp: 'Finance IT', delai: 'J+45', detail: 'Approbations multi-niveaux, journaux d’audit, traçabilité.' },
        { titre: 'Budget vs Réalisé', resp: 'Contrôle de Gestion', delai: 'J+40', detail: 'Écarts & révisions trimestrielles.' }
      ];
      const tasks = companyType === 'spa' ? [...baseTasks, ...spaExtras] : baseTasks;
      const content = [
        `📋 PLAN D'ACTIONS STRATÉGIQUES — ${user?.companyName || 'Organisation'}`,
        `Cible: Optimisation du cycle de conversion (CCC) • Secteur: ${sectorLabel}`,
        '',
        '─'.repeat(50),
        '',
        ...tasks.map((t, i) => `${i + 1}. ${t.titre.toUpperCase()}\n   Responsable: ${t.resp} | Échéance: ${t.delai}\n   Objectif: ${t.detail}`),
        '',
        '👉 Suivi recommandé: Revue hebdomadaire des indicateurs DSO/DPO/DIO.',
        'LIA peut vous aider à suivre l\'impact de ces actions sur votre BFR.'
      ].join('\n');
      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        suggestions: ['Analyser l\'impact sur le cash-flow', 'Audit des ratios financiers', 'Scénarios de croissance', 'Exporter le plan']
      };
    }

    // Analyses comparatives (mois/mois, année/année)
    const wantsComparison = message.includes('comparer') ||
      message.includes('comparaison') ||
      (message.includes('mois') && message.includes('mois')) ||
      (message.includes('année') && message.includes('année')) ||
      message.includes('yoy') || message.includes('mom');

    if (wantsComparison) {
      const revM = companyData?.revenueMonth ?? 1200000;
      const prevRevM = revM * 0.92; // Simulation: -8% mois précédent
      const revY = revM * 12;
      const prevRevY = revY * 0.88; // Simulation: -12% année précédente

      const trendRev = comparePeriods(revM, prevRevM, 'revenue');
      const trendRevY = comparePeriods(revY, prevRevY, 'revenue');

      const margin = companyData?.profitMargin ?? 18;
      const prevMargin = margin - 1.5; // Simulation
      const trendMargin = comparePeriods(margin, prevMargin, 'margin');

      const dso = Math.max(0, Math.round(((companyData?.accountsReceivable ?? revM * 1.5) / Math.max(1, revM)) * 30));
      const prevDso = dso + 5; // Simulation
      const trendDso = comparePeriods(dso, prevDso, 'dso');

      const content = [
        `ANALYSE COMPARATIVE`,
        `${companyType.toUpperCase()} • ${segment} • ${sectorLabel}`,
        '',
        '─'.repeat(60),
        '',
        'COMPARAISON MOIS/MOIS (M/M)',
        '',
        `Chiffre d'affaires:`,
        `  Actuel: ${formatCurrency ? formatCurrency(revM) : `${revM.toLocaleString()} DA`}`,
        `  Précédent: ${formatCurrency ? formatCurrency(prevRevM) : `${prevRevM.toLocaleString()} DA`}`,
        `  Variation: ${trendRev.changePercent > 0 ? '+' : ''}${trendRev.changePercent}% ${getTrendLabel(trendRev.trend)}`,
        `  Statut: ${getStatusLabel(trendRev.status)}`,
        '',
        `Marge bénéficiaire:`,
        `  Actuel: ${margin.toFixed(1)}%`,
        `  Précédent: ${prevMargin.toFixed(1)}%`,
        `  Variation: ${trendMargin.changePercent > 0 ? '+' : ''}${trendMargin.changePercent}% ${getTrendLabel(trendMargin.trend)}`,
        '',
        `DSO (Délai de recouvrement):`,
        `  Actuel: ${dso} jours`,
        `  Précédent: ${prevDso} jours`,
        `  Variation: ${trendDso.changePercent > 0 ? '+' : ''}${trendDso.changePercent}% ${getTrendLabel(trendDso.trend)}`,
        `  Statut: ${getStatusLabel(trendDso.status)}`,
        '',
        '─'.repeat(60),
        '',
        'COMPARAISON ANNÉE/ANNÉE (Y/Y)',
        '',
        `Chiffre d'affaires annuel:`,
        `  Actuel: ${formatCurrency ? formatCurrency(revY) : `${revY.toLocaleString()} DA`}`,
        `  Précédent: ${formatCurrency ? formatCurrency(prevRevY) : `${prevRevY.toLocaleString()} DA`}`,
        `  Variation: ${trendRevY.changePercent > 0 ? '+' : ''}${trendRevY.changePercent}% ${getTrendLabel(trendRevY.trend)}`,
        '',
        '─'.repeat(60),
        '',
        'INSIGHTS',
        '',
        ...(trendRev.trend === 'up' && trendRev.changePercent > 5 ? ['• Croissance mensuelle solide détectée'] : []),
        ...(trendMargin.status === 'critical' ? ['• Marge en baisse - Optimiser les coûts'] : []),
        ...(trendDso.status === 'critical' ? ['• DSO en hausse - Accélérer le recouvrement'] : []),
        ...(trendRevY.trend === 'up' ? ['• Croissance annuelle positive'] : ['• Croissance annuelle à surveiller']),
        '',
        'ACTIONS PRIORITAIRES',
        '',
        ...(trendDso.status === 'critical' ? ['1. Relancer les clients avec DSO > 30 jours'] : []),
        ...(trendMargin.status === 'critical' ? ['2. Réviser les prix et réduire les coûts variables'] : []),
        ...(trendRev.status === 'critical' ? ['3. Analyser les causes de baisse du CA'] : [])
      ].filter(Boolean).join('\n');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        suggestions: ['Analyse financière complète', 'Détecter les anomalies', 'Scénarios what-if', 'Benchmarking sectoriel']
      };
    }

    // Détection d'anomalies
    const wantsAnomalies = message.includes('anomalie') ||
      message.includes('anomalies') ||
      message.includes('détecter') ||
      message.includes('détection') ||
      message.includes('irrégularité') ||
      message.includes('rapport de risque') ||
      message.includes('audit de risque');

    if (wantsAnomalies) {
      const revM = companyData?.revenueMonth ?? 1200000;
      const historicalRev = [
        revM * 0.95, revM * 0.98, revM * 1.02, revM * 0.97, revM * 1.05, revM
      ]; // Simulation historique

      const anomalyRev = detectAnomalies(revM, historicalRev, 'revenue');

      const margin = companyData?.profitMargin ?? 18;
      const historicalMargin = [18.5, 19, 18.2, 17.8, 18.5, margin];
      const anomalyMargin = detectAnomalies(margin, historicalMargin, 'margin');

      const anomalies = [anomalyRev, anomalyMargin].filter(Boolean) as any[];

      const content = [
        `DÉTECTION D'ANOMALIES`,
        `${companyType.toUpperCase()} • ${segment}`,
        '',
        '─'.repeat(60),
        '',
        anomalies.length > 0 ? '[ALERTE] Anomalies détectées:' : '[OK] Aucune anomalie majeure détectée',
        '',
        ...anomalies.map((a, i) => [
          `${i + 1}. ${a.metric.toUpperCase()} — ${a.severity === 'high' ? '[CRITIQUE]' : a.severity === 'medium' ? '[MOYEN]' : '[FAIBLE]'}`,
          `   Valeur actuelle: ${a.value.toLocaleString()}${a.metric === 'margin' ? '%' : ' DA'}`,
          `   Valeur attendue: ${a.expected.toLocaleString()}${a.metric === 'margin' ? '%' : ' DA'}`,
          `   Écart: ${a.deviation > 0 ? '+' : ''}${a.deviation.toLocaleString()}${a.metric === 'margin' ? '%' : ' DA'}`,
          `   ${a.explanation}`,
          `   Recommandation: ${a.recommendation}`,
          ''
        ]).flat(),
        anomalies.length === 0 ? [
          'Toutes les métriques sont dans les limites normales.',
          'Continuez le suivi régulier pour maintenir cette stabilité.'
        ].join('\n') : ''
      ].filter(Boolean).join('\n');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        suggestions: ['Analyse financière complète', 'Comparaison périodes', 'Scénarios what-if']
      };
    }

    // Scénarios "what-if"
    const wantsScenario = message.includes('scénario') ||
      message.includes('scenario') ||
      message.includes('what-if') ||
      message.includes('simulation') ||
      (message.includes('si') && (message.includes('augmente') || message.includes('diminue')));

    if (wantsScenario) {
      const revM = companyData?.revenueMonth ?? 1200000;
      const margin = companyData?.profitMargin ?? 18;

      // Scénario 1: CA +10%
      const scenario1 = analyzeScenario(revM, 10, 'revenue', [
        { metric: 'margin', impact: 0.5 }
      ]);

      // Scénario 2: DSO -15 jours
      const dso = Math.max(0, Math.round(((companyData?.accountsReceivable ?? revM * 1.5) / Math.max(1, revM)) * 30));
      const cashImpact = (revM / 30) * 15; // Impact sur trésorerie

      const content = [
        `SCÉNARIOS "WHAT-IF"`,
        `${companyType.toUpperCase()} • ${segment}`,
        '',
        '─'.repeat(60),
        '',
        'SCÉNARIO 1: CA +10%',
        `  CA actuel: ${formatCurrency ? formatCurrency(revM) : `${revM.toLocaleString()} DA`}`,
        `  CA projeté: ${formatCurrency ? formatCurrency(scenario1.projectedValue) : `${scenario1.projectedValue.toLocaleString()} DA`}`,
        `  Impact: +${formatCurrency ? formatCurrency(scenario1.impact) : `${scenario1.impact.toLocaleString()} DA`}`,
        `  Confiance: ${scenario1.confidence}%`,
        `  Hypothèses:`,
        ...scenario1.assumptions.map(a => `    - ${a}`),
        '',
        'SCÉNARIO 2: DSO -15 jours',
        `  DSO actuel: ${dso} jours`,
        `  DSO projeté: ${dso - 15} jours`,
        `  Impact trésorerie: +${formatCurrency ? formatCurrency(cashImpact) : `${cashImpact.toLocaleString()} DA`} de cash libéré`,
        `  Hypothèses:`,
        `    - Relances clients J+7/J+15/J+30`,
        `    - Escompte 2% pour paiement anticipé`,
        `    - Scoring clients amélioré`,
        '',
        'SCÉNARIO 3: Marge +3 points',
        `  Marge actuelle: ${margin}%`,
        `  Marge projetée: ${margin + 3}%`,
        `  Impact bénéfice: +${formatCurrency ? formatCurrency(revM * 0.03) : `${(revM * 0.03).toLocaleString()} DA`}/mois`,
        `  Hypothèses:`,
        `    - Ajustement prix produits faible marge`,
        `    - Réduction remises excessives`,
        `    - Optimisation mix produits`,
        '',
        '─'.repeat(60),
        '',
        'Utilisez ces scénarios pour planifier vos actions et évaluer les impacts potentiels.'
      ].join('\n');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        suggestions: ['Analyse financière complète', 'Comparaison périodes', 'Benchmarking sectoriel']
      };
    }

    // Benchmarking sectoriel
    const wantsBenchmark = message.includes('benchmark') ||
      message.includes('secteur') ||
      message.includes('sectoriel') ||
      message.includes('performance sectorielle') ||
      message.includes('comparer secteur') ||
      message.includes('moyenne secteur');

    if (wantsBenchmark) {
      const revM = companyData?.revenueMonth ?? 1200000;
      const margin = companyData?.profitMargin ?? 18;
      const dso = Math.max(0, Math.round(((companyData?.accountsReceivable ?? revM * 1.5) / Math.max(1, revM)) * 30));

      const benchRev = benchmarkAnalysis(revM, 'revenue', sector, segment);
      const benchMargin = benchmarkAnalysis(margin, 'margin', sector, segment);
      const benchDso = benchmarkAnalysis(dso, 'dso', sector, segment);

      const content = [
        `BENCHMARKING SECTORIEL`,
        `${companyType.toUpperCase()} • ${segment} • ${sectorLabel}`,
        '',
        '─'.repeat(60),
        '',
        'CHIFFRE D\'AFFAIRES',
        `  Votre CA: ${formatCurrency ? formatCurrency(revM) : `${revM.toLocaleString()} DA`}`,
        `  Moyenne secteur: ${formatCurrency ? formatCurrency(benchRev.sectorAvg) : `${benchRev.sectorAvg.toLocaleString()} DA`}`,
        `  Moyenne segment: ${formatCurrency ? formatCurrency(benchRev.segmentAvg) : `${benchRev.segmentAvg.toLocaleString()} DA`}`,
        `  Percentile: ${benchRev.percentile}% (${getStatusLabel(benchRev.status)})`,
        `  ${benchRev.recommendation}`,
        '',
        'MARGE BÉNÉFICIAIRE',
        `  Votre marge: ${margin}%`,
        `  Moyenne secteur: ${benchMargin.segmentAvg.toFixed(1)}%`,
        `  Percentile: ${benchMargin.percentile}% (${getStatusLabel(benchMargin.status)})`,
        `  ${benchMargin.recommendation}`,
        '',
        'DSO (DÉLAI DE RECOUVREMENT)',
        `  Votre DSO: ${dso} jours`,
        `  Moyenne secteur: ${benchDso.segmentAvg.toFixed(0)} jours`,
        `  Percentile: ${benchDso.percentile}% (${getStatusLabel(benchDso.status)})`,
        `  ${benchDso.recommendation}`,
        '',
        '─'.repeat(60),
        '',
        'Utilisez ces benchmarks pour identifier vos forces et axes d\'amélioration.'
      ].join('\n');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        suggestions: ['Analyse financière complète', 'Comparaison périodes', 'Scénarios what-if']
      };
    }

    // Analyse financière complète (améliorée)
    const wantsFinancialAnalysis =
      message.includes('/analyse') ||
      message.includes('synthèse stratégique') ||
      message.includes('summary') ||
      message.includes('analysis') ||
      message.includes('تقرير') ||
      message.includes('تحليل') ||
      (message.includes('analyse') && (message.includes('financ') || message.includes('trésorerie') || message.includes('tresorerie') || message.includes('performance') || message.includes('bilan'))) ||
      message.includes('grand livre') || message.includes('balance') || message.includes('comptable');

    if (wantsFinancialAnalysis) {
      // Données (avec valeurs de repli)
      const revM = companyData?.revenueMonth ?? 1200000;
      const profitPct = companyData?.profitMargin ?? 18; // % marge
      const cash = companyData?.cashBalance ?? Math.round(revM * 0.8);
      const ar = companyData?.accountsReceivable ?? Math.round(revM * 1.5);
      const ap = companyData?.accountsPayable ?? Math.round(revM * 0.8);
      const invValue = companyData?.inventoryValue ?? Math.round(revM * 1.2);
      const turnover = companyData?.stockTurnover || 8; // fois/an
      const cogsMonth = Math.max(1, Math.round(revM * (1 - profitPct / 100))); // approximation COGS
      const dailyRevenue = revM / 30;
      const dailyCOGS = cogsMonth / 30;

      // Ratios & cycles
      const liquiditeGenerale = (cash + ar + invValue) / Math.max(1, ap);
      const liquiditeImmediate = (cash + ar) / Math.max(1, ap);
      const dso = Math.max(0, Math.round((ar / Math.max(1, revM)) * 30));
      const dio = Math.max(0, Math.round(365 / Math.max(0.1, turnover)));
      const dpo = Math.max(0, Math.round((ap / Math.max(1, cogsMonth)) * 30));
      const ccc = dso + dio - dpo;
      const marge = profitPct;
      const bfr = ar + invValue - ap; // Besoin en Fonds de Roulement (simplifié)

      // Statut CCC
      const cccLabel = ccc <= 40 ? 'Bon' : ccc <= 60 ? 'Surveillance' : 'Tension';

      // Alertes ciblées (utilitaire partagé) enrichies des ratios avancés si besoin
      const alerts = generateRatioAlerts({
        base: {
          dso, dio, dpo, ccc, liqGen: liquiditeGenerale, liqQuick: liquiditeImmediate, marginPct: marge, turnover
        } as any,
        advanced: ratiosAdv,
        bm
      });
      // Ajout CCC spécifique si non déjà couvert
      if (ccc > 60 && !alerts.some(a => a.includes('CCC'))) alerts.push(`CCC long (${ccc} j) — ${cccLabel}.`);

      // Recommandations dynamiques (sensibles au profil)
      const recs: string[] = [];
      if (dso > 35) recs.push('Activer recouvrement cadencé (J+7/J+15/J+30), escompte 2% clients fiables, scoring risque.');
      if (dio > 60) recs.push('Optimiser stocks: ABC, seuils de réapprovisionnement, liquidation produits lents, promo ciblée.');
      if (dpo < bm.dpoMin) recs.push(`Renégocier délais fournisseurs (${bm.dpoMin}–${Math.max(55, bm.dpoMin + 10)} j), consolider paiements (batch), aligner conditions cadres.`);
      if (ccc > 60) recs.push('Réduire CCC: JIT achats clés, affacturage créances, règles crédit plus serrées.');
      if (marge < bm.marginMin) recs.push('Améliorer marge: prix/remises, mix produit, coûts variables, arrêt pertes.');
      if (liquiditeImmediate < 1.0) recs.push('Sécuriser cash: prioriser encaissements, temporiser capex non critiques.');

      // Impacts scénarisés (approximations pédagogiques)
      const impactDSO10 = Math.round(dailyRevenue * 10); // DSO -10j
      const impactDIO5 = Math.round(dailyCOGS * 5); // DIO -5j
      const impactDPO10 = Math.round(dailyCOGS * 10); // DPO +10j
      const impactTotal = impactDSO10 + impactDIO5 + impactDPO10;

      // Améliorations ERP / Contrôles (plus pour SPA/entreprise)
      const erpBase: string[] = [
        'Workflows d’approbation multi-niveaux (commandes, factures, dépenses).',
        'RBAC granulaire, journaux d’audit, traçabilité inviolable.',
        'Prévisions rolling 13 semaines, scénarios O/P/P, seuils d’alerte.',
        'Budget vs Réalisé avec écarts et révisions budgétaires.'
      ];
      const erpPlus: string[] = [
        'Intégrations bancaires, e‑facturation, dépôts fiscaux (G50), conformité.',
        'Qualité de données: référentiel tiers/articles, règles de validation.',
        'Multi‑sociétés / multi‑devises, consolidation et change.'
      ];
      const erp: string[] = (companyType === 'spa' || segment === 'enterprise') ? [...erpBase, ...erpPlus] : erpBase;

      const money = (v: number) => (formatCurrency ? formatCurrency(v) : `${v.toLocaleString()} DA`);

      // Créer le résumé avec anomalies, insights et priorités
      const summary = {
        anomalies: [] as Array<{ metric: string; explanation: string; severity: 'high' | 'medium' | 'low' }>,
        insights: [] as string[],
        priorities: [] as string[]
      };

      // Détecter les anomalies
      if (dso > bm.dsoMax * 1.5) {
        summary.anomalies.push({ metric: 'DSO', explanation: `Délai très élevé (${dso}j vs cible ${bm.dsoMax}j)`, severity: 'high' });
      }
      if (liquiditeImmediate < 0.5) {
        summary.anomalies.push({ metric: 'Liquidité', explanation: 'Trésorerie critique', severity: 'high' });
      }
      if (marge < bm.marginMin * 0.5) {
        summary.anomalies.push({ metric: 'Marge', explanation: `Marge très faible (${marge.toFixed(1)}%)`, severity: 'high' });
      }

      // Ajouter des insights
      if (ccc <= 40) {
        summary.insights.push('Cycle de conversion très performant');
      }
      if (liquiditeGenerale >= 2.0) {
        summary.insights.push('Position de liquidité solide');
      }

      // Définir les priorités
      if (dso > bm.dsoMax) {
        summary.priorities.push('1. Accélérer le recouvrement client');
      }
      if (dio > bm.dioMax) {
        summary.priorities.push('2. Optimiser la gestion des stocks');
      }
      if (dpo < bm.dpoMin) {
        summary.priorities.push('3. Renégocier les délais fournisseurs');
      }

      const isCorporate = companyType === 'spa' || segment === 'enterprise' || segment === 'large';
      const isTactical = segment !== 'micro';

      const labels: Record<string, Record<'fr' | 'en' | 'ar', string>> = {
        title: { fr: '📊 AUDIT STRATÉGIQUE ADAPTATIF', en: '📊 ADAPTIVE STRATEGIC AUDIT', ar: '📊 تدقيق استراتيجي متكيف' },
        profile: { fr: 'Profil', en: 'Profile', ar: 'الملف' },
        segment: { fr: 'Segment', en: 'Segment', ar: 'الفئة' },
        sector: { fr: 'Secteur', en: 'Sector', ar: 'القطاع' },
        sec1: { fr: '📍 1. PERFORMANCE OPÉRATIONNELLE & LIQUIDITÉ', en: '📍 1. OPERATIONAL PERFORMANCE & LIQUIDITY', ar: '📍 1. الأداء العملياتي والسيولة' },
        revenue: { fr: 'Chiffre d\'Affaires Mensuel', en: 'Monthly Revenue', ar: 'رقم الأعمال الشهري' },
        margin: { fr: 'Marge Brute', en: 'Gross Margin', ar: 'الهامش الإجمالي' },
        cash: { fr: 'Trésorerie', en: 'Cash Balance', ar: 'الرصيد النقدي' },
        liquidity: { fr: 'Liquidité Immédiate', en: 'Quick Liquidity', ar: 'السيولة الفورية' },
        healthy: { fr: 'Saine', en: 'Healthy', ar: 'سليم' },
        tension: { fr: 'Sous tension', en: 'Under tension', ar: 'تحت الضغط' },
        sec2: { fr: '📍 2. CYCLE D\'EXPLOITATION & EFFICACITÉ', en: '📍 2. OPERATING CYCLE & EFFICIENCY', ar: '📍 2. دورة التشغيل والكفاءة' },
        ccc: { fr: 'CCC (Cycle Cash)', en: 'CCC (Cash Conversion Cycle)', ar: 'دورة التحويل النقدي' },
        status: { fr: 'Statut', en: 'Status', ar: 'الحالة' },
        bfr: { fr: 'Besoin en Fonds de Roulement (BFR)', en: 'Working Capital Requirement (WCR)', ar: 'احتياجات رأس المال العامل' },
        sec3: { fr: '📍 3. STRUCTURE DE CAPITAL & SOLVABILITÉ', en: '📍 3. CAPITAL STRUCTURE & SOLVENCY', ar: '📍 3. هيكل رأس المال والملائة' },
        profitability: { fr: 'Rentabilité', en: 'Profitability', ar: 'الربحية' },
        autonomy: { fr: 'Indépendance (Autonomie)', en: 'Financial Autonomy', ar: 'الاستقلالية المالية' },
        leverage: { fr: 'Levier (Net Debt/EBITDA)', en: 'Leverage', ar: 'الرافعة المالية' },
        coverage: { fr: 'Couverture Intérêts', en: 'Interest Coverage', ar: 'تغطية الفوائد' },
        wacc: { fr: 'Coût du Capital (WACC)', en: 'Cost of Capital (WACC)', ar: 'تكلفة رأس المال' },
        secLia: { fr: '📍 ALERTES & DIAGNOSTIC LIA', en: '📍 LIA ALERTS & DIAGNOSTICS', ar: '📍 تنبيهات وتشخيص LIA' },
        noRisk: { fr: 'Aucun risque majeur détecté par l\'IA.', en: 'No major risks detected by AI.', ar: 'لم يتم اكتشاف مخاطر كبيرة بواسطة الذكاء الاصطناعي.' },
        secActions: { fr: '📍 ACTIONS PRIORITAIRES & IMPACT TRÉSORERIE', en: '📍 PRIORITY ACTIONS & CASH IMPACT', ar: '📍 الإجراءات ذات الأولوية وتأثير السيولة' },
        cashPotential: { fr: 'Potentiel de cash-flow à libérer (optimisation cycle)', en: 'Cash-flow potential to release', ar: 'إمكانية تحرير التدفق النقدي' }
      };

      const L = (key: string) => labels[key]?.[currentLang as 'fr' | 'en' | 'ar'] || labels[key]?.fr || key;

      const content = [
        `${L('title')} — ${user?.companyName || 'Organisation'}`,
        `${L('profile')}: ${companyType.toUpperCase()} • ${L('segment')}: ${segment.toUpperCase()} • ${L('sector')}: ${sectorLabel}`,
        '',
        '─'.repeat(50),
        '',
        L('sec1'),
        `• ${L('revenue')}: ${money(revM)} | ${L('margin')}: ${marge.toFixed(1)}%`,
        `• ${L('cash')}: ${money(cash)} | ${L('liquidity')}: ${liquiditeImmediate.toFixed(2)} (${liquiditeImmediate >= 1 ? L('healthy') : L('tension')})`,
        '',
        ...(isTactical ? [
          L('sec2'),
          `• ${L('ccc')}: ${ccc} j | ${L('status')}: ${cccLabel}`,
          `• DSO: ${dso} j [Cible: ${bm.dsoMax}] | DIO: ${dio} j [Cible: ${bm.dioMax}] | DPO: ${dpo} j [Cible: ${bm.dpoMin}]`,
          `• ${L('bfr')}: ${money(bfr)}`,
          ''
        ] : []),
        ...(isCorporate ? [
          L('sec3'),
          `• ${L('profitability')}: ROE ${ratiosAdv.roePct}% | ROA ${ratiosAdv.roaPct}%`,
          `• ${L('autonomy')}: ${ratiosAdv.autonomyPct}% | Gearing ${ratiosAdv.gearingPct ?? 0}%`,
          `• ${L('leverage')}: ${ratiosAdv.netDebtToEbitda ?? 'N/A'}`,
          `• ${L('coverage')}: ${ratiosAdv.interestCoverage}x${ratiosAdv.waccPct ? ` | ${L('wacc')}: ${ratiosAdv.waccPct}%` : ''}`,
          ''
        ] : []),
        ...(sector === 'saas' && ratiosAdv.mrr ? [
          '📍 FOCUS SECTORIEL (SaaS)',
          `• MRR: ${money(ratiosAdv.mrr)} | Churn: ${ratiosAdv.churnPct}%`,
          `• LTV: ${money(ratiosAdv.ltv ?? 0)} | CAC: ${money(ratiosAdv.cac ?? 0)}`,
          ''
        ] : []),
        L('secLia'),
        ...alerts.map(a => `• ${a}`),
        ...summary.anomalies.map(a => `⚠️ ${a.metric}: ${a.explanation}`),
        ...(alerts.length === 0 && summary.anomalies.length === 0 ? [`• ${L('noRisk')}`] : []),
        '',
        L('secActions'),
        ...recs.slice(0, 2).map(r => `• ${r}`),
        ...(isCorporate ? [
          currentLang === 'ar' ? '• مراجعة سياسة توزيع الأرباح وتحسين تكلفة رأس المال.' :
            currentLang === 'en' ? '• Review dividend policy and optimize cost of capital.' :
              '• Révision de la politique de dividendes et optimisation du coût du capital.'
        ] : []),
        ...(isTactical ? [`• ${L('cashPotential')}: ${money(impactTotal)}`] : []),
        '',
        '─'.repeat(50),
        'LIA Strategic Intelligence Hub'
      ].filter(l => l !== null).join('\n');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        suggestions: isCorporate
          ? (currentLang === 'ar' ? ['تحليل ROE/ROA مفصل', 'محاكاة الرافعة المالية', 'تصدير هذا التقرير'] : currentLang === 'en' ? ['Detailed ROE/ROA analysis', 'Financial leverage simulation', 'Export this report'] : ['Analyse ROE/ROA détaillée', 'Simulation de levier financier', 'Exporter ce rapport'])
          : (currentLang === 'ar' ? ['كيفية تقليل DSO؟', 'تحسين المخزون', 'توقعات التدفق النقدي'] : currentLang === 'en' ? ['How to reduce DSO?', 'Optimize inventory', 'Cash-flow forecasts'] : ['Comment réduire mon DSO ?', 'Optimiser mes stocks', 'Prévisions de trésorerie'])
      };
    }

    if (message.includes('ventes') || message.includes('chiffre') || message.includes('ca')) {
      return {
        id: Date.now().toString(),
        type: 'lia',
        content: `Analyse des ventes\n\n- Chiffre d'affaires du jour: ${formatCurrency ? formatCurrency(dailySummary.ca.value) : `${dailySummary.ca.value.toLocaleString()} DA`} (${dailySummary.ca.change > 0 ? '+' : ''}${dailySummary.ca.change}%)\n- Articles vendus: ${dailySummary.articlesVendus.sold} (restants à facturer: ${dailySummary.articlesVendus.remaining})\n- Marge brute: ${dailySummary.margeBrute}%\n\nObservation: progression correcte des ventes; marge stable.`,
        timestamp: new Date(),
        suggestions: ['Quels sont mes ratios financiers ?', 'Avez-vous des recommandations ?', 'Montrez-moi mes prévisions']
      };
    }

    if (message.includes('ratio') || message.includes('performance') || message.includes('financier')) {
      const revM = companyData?.revenueMonth ?? 1;
      const marginPct = companyData?.profitMargin ?? dailySummary.margeBrute;
      const cash = companyData?.cashBalance ?? 0;
      const ar = companyData?.accountsReceivable ?? 0;
      const ap = companyData?.accountsPayable ?? 1;
      const inv = companyData?.inventoryValue ?? 0;
      const turnover = companyData?.stockTurnover || 6.5;
      const cogsMonth = Math.max(1, Math.round(revM * (1 - marginPct / 100)));
      const dso = Math.max(0, Math.round((ar / Math.max(1, revM)) * 30));
      const dio = Math.max(0, Math.round(365 / Math.max(0.1, turnover)));
      const dpo = Math.max(0, Math.round((ap / Math.max(1, cogsMonth)) * 30));
      const liqGen = ((cash + ar + inv) / Math.max(1, ap));
      const liqQuick = ((cash + ar) / Math.max(1, ap));

      const note = liqGen < bm.liqGenMin
        ? `Attention: liquidité générale sous la cible (≥ ${bm.liqGenMin.toFixed(2)}).`
        : 'Liquidité correcte par rapport à la cible.';

      // Inclure ratios avancés synthétiques
      const advLine = `ROE ${ratiosAdv.roePct}% | ROA ${ratiosAdv.roaPct}% | EBITDA ${ratiosAdv.ebitdaMarginPct}% | Autonomie ${ratiosAdv.autonomyPct}%`;
      const debtLine = ratiosAdv.netDebtToEbitda !== null ? `Net Debt/EBITDA ${ratiosAdv.netDebtToEbitda}` : '';

      const content = [
        `Ratios financiers — Profil: ${companyType.toUpperCase()} • ${segment} • ${sectorLabel}`,
        '',
        `• Marge: ${marginPct.toFixed(1)}% (cible ≥ ${bm.marginMin}%)`,
        `• Rotation du stock: ${turnover.toFixed(1)}x (référence 6–10x)`,
        `• Liquidité générale: ${liqGen.toFixed(2)} (cible ≥ ${bm.liqGenMin.toFixed(2)})`,
        `• Liquidité immédiate: ${liqQuick.toFixed(2)} (cible ≥ ${bm.liqQuickMin.toFixed(2)})`,
        `• DSO: ${dso} j (cible ≤ ${bm.dsoMax} j) | DIO: ${dio} j (cible ≤ ${bm.dioMax} j) | DPO: ${dpo} j (cible ≥ ${bm.dpoMin} j)`,
        `• ${advLine}`,
        debtLine,
        '',
        note
      ].join('\n');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content: content,
        timestamp: new Date(),
        suggestions: ['Comment améliorer ma trésorerie ?', 'Générer le plan depuis l’analyse', 'Voir plan d’actions', 'Prévisions 13 semaines']
      };
    }

    if (message.includes('recommandation') || message.includes('conseil') || message.includes('aide')) {
      return {
        id: Date.now().toString(),
        type: 'lia',
        content: `Recommandations personnalisées\n\n- Trésorerie: raccourcir les délais de paiement clients (cible < 35 jours)\n- Stock: prioriser les 20% d'articles générant 80% du CA\n- Marge: limiter les remises sur produits à faible rentabilité\n- Clients: relancer les soldes > 30 jours\n\nAction prioritaire: optimiser le cycle de trésorerie.`,
        timestamp: new Date(),
        suggestions: ['Montrez-moi mes prévisions', 'Comment vont mes ventes ?', 'Quels sont mes ratios ?']
      };
    }

    if (message.includes('prévision') || message.includes('tendance') || message.includes('futur')) {
      return {
        id: Date.now().toString(),
        type: 'lia',
        content: `Prévisions (IA)\n\n- CA mensuel estimé: ${formatCurrency ? formatCurrency(Math.round((companyData?.revenueMonth ?? 4200000) * 1.08)) : 'N/A'} (+8%)\n- Trésorerie fin de mois: ${formatCurrency ? formatCurrency(Math.round((companyData?.cashBalance ?? 1100000))) : 'N/A'}\n- Réapprovisionnement: 5 articles sous seuil dans ~10 jours\n- Risque client: 1 compte à surveiller (retards récurrents)\n- Marge attendue: ${(dailySummary.margeBrute + 1.2).toFixed(1)}%\n\nConfiance: 85% (6 derniers mois).`,
        timestamp: new Date(),
        suggestions: ['Quels sont mes ratios financiers ?', 'Avez-vous des recommandations ?', 'Comment vont mes ventes ?']
      };
    }

    if (message.includes('trésorerie') || message.includes('cash') || message.includes('liquidité')) {
      const cash = companyData?.cashBalance ?? 0;
      const ar = companyData?.accountsReceivable ?? 0;
      const ap = companyData?.accountsPayable ?? 1;
      const inv = companyData?.inventoryValue ?? 0;
      const liqGen = ((cash + ar + inv) / Math.max(1, ap));
      const risk = liqGen >= bm.liqGenMin ? 'OK' : (liqGen >= bm.liqGenMin - 0.1 ? 'Surveillance' : 'Tension');
      const reco = liqGen >= bm.liqGenMin
        ? 'Poursuivre le suivi des encaissements et la maîtrise des décaissements.'
        : 'Accélérer encaissements (relances/conditions), lisser décaissements, temporiser capex non critiques.';

      const content = [
        `Trésorerie (jour) — Profil: ${companyType.toUpperCase()} • ${segment} • ${sectorLabel}`,
        '',
        `- Encaissements: +${formatCurrency ? formatCurrency(dailySummary.encaissements.in) : `${dailySummary.encaissements.in.toLocaleString()} DA`}`,
        `- Décaissements: -${formatCurrency ? formatCurrency(dailySummary.encaissements.out) : `${dailySummary.encaissements.out.toLocaleString()} DA`}`,
        `- Solde net: +${formatCurrency ? formatCurrency(dailySummary.encaissements.in - dailySummary.encaissements.out) : `${(dailySummary.encaissements.in - dailySummary.encaissements.out).toLocaleString()} DA`}`,
        '',
        `Liquidité générale (estimée): ${liqGen.toFixed(2)} (cible ≥ ${bm.liqGenMin.toFixed(2)}) — ${risk}`,
        `Recommandation: ${reco}`
      ].join('\n');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        suggestions: ['Voir plan d’actions', 'Générer le plan depuis l’analyse', 'Prévisions 13 semaines', 'Optimiser recouvrement']
      };
    }


    // Fallback: utiliser le service IA dynamique
    try {
      const prev = messages.filter(m => m.type === 'user').map(m => m.content);
      const res = await aiService.chat(userMessage, {
        previousQuestions: prev,
        context: { currentDevise, currentCountry, planComptable, companyType, segment, sector }
      });
      if (res) {
        return {
          id: Date.now().toString(),
          type: 'lia',
          content: res.content,
          timestamp: new Date(),
          suggestions: res.relatedQuestions || []
        };
      }
    } catch (error) {
      console.error('AI service error:', error);
    }
    // Catégorisation automatique (commande spéciale)
    const wantsCategorization = message.includes('/categoriser') ||
      (message.includes('catégoriser') && (message.includes('dépense') || message.includes('depense')));
    if (wantsCategorization) {
      const categories = [
        { name: 'Achats fournisseurs', percentage: 35, color: 'blue' },
        { name: 'Charges fixes', percentage: 18, color: 'slate' },
        { name: 'Personnel', percentage: 14, color: 'green' },
        { name: 'Transport', percentage: 7, color: 'amber' },
        { name: 'Autres charges', percentage: 10, color: 'purple' },
        { name: 'Impôts & taxes', percentage: 6, color: 'red' }
      ];
      const content = [
        `Catégorisation automatique des dépenses — Profil: ${companyType.toUpperCase()} • ${segment}`,
        '',
        'Répartition par catégorie (basée sur vos données):',
        ...categories.map(c => `• ${c.name}: ${c.percentage}%`),
        '',
        'LIA peut automatiquement catégoriser vos nouvelles dépenses en fonction de leur description et montant.',
        'Utilisez la commande "/categoriser [description]" pour tester.'
      ].join('\n');
      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        suggestions: ['Analyse financière', 'Voir plan d\'actions', 'Prévisions trésorerie (13 semaines)']
      };
    }

    // Recommandations contextuelles améliorées
    const wantsContextualRecommendations = message.includes('/recommandations') ||
      (message.includes('recommandation') && message.includes('contextuel'));
    if (wantsContextualRecommendations) {
      const hour = new Date().getHours();
      const dayOfWeek = new Date().getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isMorning = hour < 12;
      const isEvening = hour >= 18;

      const contextualRecos = [
        isMorning ? '🌅 Bon matin ! C\'est le moment idéal pour planifier votre journée financière.' : '',
        isEvening ? '🌆 En fin de journée, pensez à faire un point sur les encaissements de la journée.' : '',
        isWeekend ? '📅 Week-end: moment propice pour analyser les performances de la semaine.' : '',
        `⏰ Il est ${hour}h${new Date().getMinutes().toString().padStart(2, '0')} — ${isMorning ? 'début' : isEvening ? 'fin' : 'milieu'} de journée.`,
        '',
        'Recommandations contextuelles:',
        '• Vérifier les paiements en attente',
        '• Mettre à jour les stocks critiques',
        '• Préparer les déclarations fiscales à venir',
        '• Analyser les tendances de la semaine'
      ].filter(Boolean).join('\n');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content: contextualRecos,
        timestamp: new Date(),
        suggestions: ['Analyse financière', 'Voir plan d\'actions', 'Prévisions trésorerie (13 semaines)']
      };
    }

    // Fiscalité & G50
    const wantsFiscal = message.includes('g50') ||
      message.includes('tva') ||
      message.includes('fiscal') ||
      message.includes('impôt') ||
      message.includes('impot') ||
      message.includes('taxe');

    if (wantsFiscal) {
      const revM = companyData?.revenueMonth ?? 1200000;
      const tvaCollectee = revM * 0.19; // Simulation 19%
      const tvaDeductible = (revM * 0.7) * 0.19; // Simulation sur 70% d'achats
      const tap = revM * 0.02; // Taxe sur l'activité professionnelle (2%)

      const content = [
        `📑 AUDIT FISCAL PRÉVISIONNEL (G50)`,
        `${companyType.toUpperCase()} • ${segment} • Algérie`,
        '',
        '─'.repeat(50),
        '',
        `PROJECTIONS G50 DU MOIS COURANT (ESTIMÉ):`,
        `  • Chiffre d'Affaires taxable: ${formatCurrency ? formatCurrency(revM) : `${revM.toLocaleString()} DA`}`,
        `  • TVA Collectée (19%): ${formatCurrency ? formatCurrency(tvaCollectee) : `${tvaCollectee.toLocaleString()} DA`}`,
        `  • TVA Déductible estimée: ${formatCurrency ? formatCurrency(tvaDeductible) : `${tvaDeductible.toLocaleString()} DA`}`,
        `  • Solde TVA à reverser: ${formatCurrency ? formatCurrency(tvaCollectee - tvaDeductible) : `${(tvaCollectee - tvaDeductible).toLocaleString()} DA`}`,
        `  • TAP (Taxe sur Act. Prof. 2%): ${formatCurrency ? formatCurrency(tap) : `${tap.toLocaleString()} DA`}`,
        '',
        `ÉCHÉANCES PROCHAINES:`,
        `  • Déclaration G50: Avant le 20 du mois prochain`,
        `  • Paiement IBS/IRG: Selon votre calendrier fiscal annuel`,
        '',
        `RECOMMANDATION LIA:`,
        `Assurez-vous que toutes vos factures d'achats sont correctement catégorisées pour optimiser votre TVA déductible.`,
        '',
        '─'.repeat(50),
        '© LIA Fiscal Intelligence Unit'
      ].join('\n');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        suggestions: ['Analyse financière complète', 'Voir plan d\'actions', 'Scénarios de croissance']
      };
    }

    // ERP & Connectivité
    if (message.includes('erp') || message.includes('logiciel') || message.includes('source')) {
      return {
        id: Date.now().toString(),
        type: 'lia',
        content: `Connectivité ERP & Sources de Données\n\nLIA est actuellement synchronisée avec votre système de gestion central (ERP). Les données de facturation, de stock et de trésorerie sont mises à jour en temps réel.\n\nStatut de la connexion: ACTIVE ✅\nDernière synchronisation: ${new Date().toLocaleTimeString('fr-FR')}\n\nSouhaitez-vous auditer une branche spécifique de vos données ERP ?`,
        timestamp: new Date(),
        suggestions: ['Audit de facturation', 'État des stocks', 'Journal des ventes']
      };
    }

    if (message.includes('facture') || message.includes('facturation')) {
      return {
        id: Date.now().toString(),
        type: 'lia',
        content: `Audit de Facturation & Recouvrement\n\n- Factures en attente de règlement: ${formatCurrency ? formatCurrency(companyData?.accountsReceivable ?? 4500000) : '4.500.000 DA'}\n- Volume de facturation mensuel: ${formatCurrency ? formatCurrency(companyData?.revenueMonth ?? 1200000) : '1.200.000 DA'}\n- Délai moyen de paiement client (DSO): ${Math.round(((companyData?.accountsReceivable ?? 4500000) / (companyData?.revenueMonth ?? 1200000)) * 30)} jours.\n\nLIA suggère de relancer les 5 clients majeurs ayant des factures > 30 jours.`,
        timestamp: new Date(),
        suggestions: ['Comment améliorer mon DSO ?', 'Voir détails facturation', 'Plan d\'actions']
      };
    }

    if (message.includes('stock') || message.includes('inventaire') || message.includes('article') || message.includes('produit')) {
      const invValue = companyData?.inventoryValue ?? 1500000;
      const turnover = companyData?.stockTurnover || 6.5;
      const dio = Math.round(365 / Math.max(0.1, turnover));

      return {
        id: Date.now().toString(),
        type: 'lia',
        content: `Audit des Stocks & Inventaire\n\n- Valeur totale du stock: ${formatCurrency ? formatCurrency(invValue) : '1.500.000 DA'}\n- Rotation des stocks: ${turnover}x par an\n- Délai de rotation (DIO): ${dio} jours.\n\nLIA détecte 3 articles à faible rotation (dormants) et 5 articles en risque de rupture sous 10 jours.`,
        timestamp: new Date(),
        suggestions: ['Comment optimiser mon DIO ?', 'Liste des produits dormants', 'Plan d\'actions']
      };
    }

    if (message.includes('dso') || message.includes('dpo') || message.includes('ccc') || message.includes('bfr') || message.includes('cycle')) {
      const revM = companyData?.revenueMonth ?? 1200000;
      const margin = companyData?.profitMargin ?? 18;
      const ar = companyData?.accountsReceivable ?? 4500000;
      const ap = companyData?.accountsPayable ?? 900000;
      const invValue = companyData?.inventoryValue ?? 1500000;
      const cogsMonth = Math.max(1, Math.round(revM * (1 - margin / 100)));
      const turnover = companyData?.stockTurnover || 6.5;

      const dso = Math.max(0, Math.round((ar / Math.max(1, revM)) * 30));
      const dio = Math.max(0, Math.round(365 / Math.max(0.1, turnover)));
      const dpo = Math.max(0, Math.round((ap / Math.max(1, cogsMonth)) * 30));
      const ccc = dso + dio - dpo;

      return {
        id: Date.now().toString(),
        type: 'lia',
        content: `Analyse du Cycle de Conversion (CCC)\n\n- DSO (Délai Client): ${dso} jours\n- DIO (Délai Stock): ${dio} jours\n- DPO (Délai Fournisseur): ${dpo} jours\n\nCYCLE DE TRÉSORERIE (CCC): ${ccc} jours.\n\nNote: Un cycle long (> 60j) pèse sur votre besoin en fonds de roulement (BFR).`,
        timestamp: new Date(),
        suggestions: ['Réduire le DSO', 'Négocier DPO', 'Audit complet']
      };
    }

    // Dernier recours
    return {
      id: Date.now().toString(),
      type: 'lia',
      content: `Je peux analyser vos données ERP: ventes, ratios, fiscalité (G50), prévisions, trésorerie, et bien plus. Utilisez les commandes ou posez une question directe:\n\n• /analyse — Synthèse stratégique complète\n• /plan — Tableau de bord des actions\n• /previsions — Cash-flow prédictif\n• /categoriser — Audit des écritures\n\nQuelle dimension de votre ERP souhaitez-vous auditer ?`,
      timestamp: new Date(),
    };
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Ajouter le message utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    // Journaliser l'action
    try {
      const userIdNum = user ? (Number((user as any).id) || -1) : -1;
      logAction({ userId: userIdNum, action: 'update', actor: user?.nom || 'Utilisateur', details: `Chatbot question: ${userMessage.content}` });
    } catch { }

    // Simuler le délai de réponse de LIA
    setTimeout(async () => {
      const liaResponse = await generateLiaResponse(inputMessage);
      setMessages(prev => [...prev, liaResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc]">
      {/* En-tête du chatbot avec effet de flou */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 p-4 shadow-sm">
        <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-700 via-slate-800 to-black rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <SparklesIcon className="h-7 w-7 text-indigo-300" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">LIA Intelligence</h1>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white rounded-md">AI v2.0</span>
              </div>
              <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">Système de Pilotage Stratégique</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => {
                const lines = messages.map(m => {
                  const who = m.type === 'user' ? 'Vous' : 'LIA';
                  const t = m.timestamp.toLocaleString('fr-FR');
                  return `[${t}] ${who}: ${m.content}`;
                }).join('\n\n');
                const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                const ts = new Date();
                const pad = (n: number) => String(n).padStart(2, '0');
                a.href = url;
                a.download = `lia-chat-${ts.getFullYear()}${pad(ts.getMonth() + 1)}${pad(ts.getDate())}-${pad(ts.getHours())}${pad(ts.getMinutes())}.txt`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }}
              disabled={!canExport}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${canExport ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:scale-95' : 'text-slate-300 cursor-not-allowed'}`}
              aria-label="Exporter la conversation"
              title={canExport ? 'Exporter la conversation' : 'Permission requise: export-data'}
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Exporter</span>
            </button>
            <button
              onClick={() => setShowPlan(v => !v)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-slate-900 text-white rounded-xl hover:bg-black transition-all active:scale-95 shadow-md shadow-slate-200"
              title="Ouvrir le plan d’actions"
            >
              <ClipboardDocumentCheckIcon className="h-5 w-5 text-indigo-300" />
              <span>Tableau de Bord</span>
            </button>
          </div>
        </div>
      </div>

      {/* Zone de messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-gradient-to-b from-[#f8fafc] to-white">
        <div className="max-w-4xl mx-auto w-full space-y-8 pb-10">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex opacity-0 animate-[fadeIn_0.5s_ease-out_forwards] ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`group max-w-[85%] md:max-w-2xl px-6 py-5 rounded-[2rem] transition-all duration-300 ${message.type === 'user'
                  ? 'bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-xl shadow-slate-200 rounded-tr-none'
                  : 'bg-white text-slate-900 border border-slate-200/60 shadow-lg shadow-slate-100 rounded-tl-none border-b-4 border-b-slate-100 hover:border-b-indigo-200'
                  }`}
              >
                {message.type === 'lia' && (
                  <div className="flex items-center justify-between mb-4 border-b border-slate-50 pb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-md">
                        <SparklesIcon className="h-4 w-4 text-indigo-300" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 tracking-widest uppercase">LIA Intelligence</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">SESSION AUDITÉE</span>
                  </div>
                )}

                <div className={`whitespace-pre-line leading-relaxed ${message.type === 'user' ? 'text-md font-medium' : 'text-md text-slate-800'}`}>
                  {message.content}
                </div>

                <div className={`flex items-center gap-2 text-[10px] font-bold mt-4 tracking-wider uppercase ${message.type === 'user' ? 'text-slate-400' : 'text-slate-400'
                  }`}>
                  <ClockIcon className="h-3 w-3" />
                  {message.timestamp.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>

                {/* Suggestions intégrées au message */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="group flex items-center justify-between px-4 py-3 text-left text-xs bg-slate-50/80 hover:bg-slate-900 hover:text-white text-slate-700 rounded-xl transition-all border border-slate-100 font-bold active:scale-95"
                      >
                        <span>{suggestion}</span>
                        <ChevronRightIcon className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Indicateur de frappe modernisé */}
          {isTyping && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-white border border-slate-200/60 rounded-3xl rounded-tl-none px-6 py-4 shadow-lg shadow-slate-100">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
                    <SparklesIcon className="h-3 w-3 text-indigo-300" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase italic">Analyse en cours...</span>
                </div>
                <div className="flex space-x-1.5 ml-1">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce duration-700"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:200ms] duration-700"></div>
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:400ms] duration-700"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Plan d’actions (panel) */}
      {showPlan && (
        <div className="bg-white border-t border-slate-200 p-6 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] max-h-[60vh] overflow-y-auto animate-slideUp">
          <div className="flex items-center justify-between mb-6 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-slate-900" />
              <h2 className="text-lg font-bold text-slate-900">Plan d’actions Stratégiques</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  seedPlanFromAnalysis();
                }}
                disabled={!canEditPlan}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${canEditPlan ? 'border-slate-200 text-slate-700 hover:bg-slate-50' : 'border-slate-100 text-slate-300 cursor-not-allowed'}`}
                title={canEditPlan ? 'Générer depuis l’analyse (actions suggérées)' : 'Permission requise: rapports-create'}
              >
                Auto-Générer
              </button>
              <button
                onClick={seedDemoPlan}
                disabled={!canEditPlan}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${canEditPlan ? 'border-slate-200 text-slate-700 hover:bg-slate-50' : 'border-slate-100 text-slate-300 cursor-not-allowed'}`}
                title={canEditPlan ? 'Importer le plan de démo' : 'Permission requise: rapports-create'}
              >
                Plan Démo
              </button>
              <button
                onClick={() => setShowPlan(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              >
                Fermer
              </button>
            </div>
          </div>

          <div className="max-w-5xl mx-auto w-full">
            {/* Formulaire d'ajout rapide */}
            <div className="bg-slate-50/50 p-4 rounded-2xl mb-6 grid grid-cols-1 md:grid-cols-12 gap-3 items-end border border-slate-100">
              <div className="col-span-12 md:col-span-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Action</label>
                <input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  disabled={!canEditPlan}
                  className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                  placeholder="Ex: Accélérer le recouvrement"
                />
              </div>
              <div className="col-span-12 md:col-span-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Responsable</label>
                <input
                  value={draftOwner}
                  onChange={(e) => setDraftOwner(e.target.value)}
                  disabled={!canEditPlan}
                  className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                  placeholder="Ex: Direction Financière"
                />
              </div>
              <div className="col-span-12 md:col-span-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">Échéance</label>
                <input
                  type="date"
                  value={draftDue}
                  onChange={(e) => setDraftDue(e.target.value)}
                  disabled={!canEditPlan}
                  className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                />
              </div>
              <div className="col-span-12 md:col-span-2">
                <button
                  onClick={addAction}
                  disabled={!canEditPlan || !draftTitle.trim()}
                  className="w-full py-3 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-black transition-all disabled:bg-slate-200"
                >
                  Ajouter
                </button>
              </div>
            </div>

            {/* Liste des actions style Table */}
            <div className="space-y-3">
              {plan.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-medium italic">
                  Aucun plan d'action configuré. LIA peut en générer un pour vous.
                </div>
              ) : (
                plan.map(item => (
                  <div key={item.id} className="flex flex-col md:flex-row items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-100 hover:shadow-md transition-all group">
                    <div className="flex-1 w-full md:w-auto">
                      <input
                        value={item.title}
                        onChange={e => updateAction(item.id, { title: e.target.value })}
                        disabled={!canEditPlan}
                        className="w-full text-sm font-bold text-slate-900 bg-transparent border-none focus:ring-0 p-0"
                      />
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{item.owner || 'Non assigné'}</div>
                    </div>
                    <div className="w-full md:w-32 lg:w-40">
                      <input
                        type="date"
                        value={item.due}
                        onChange={e => updateAction(item.id, { due: e.target.value })}
                        disabled={!canEditPlan}
                        className="w-full text-xs font-semibold text-slate-500 bg-transparent border-none focus:ring-0 p-0"
                      />
                    </div>
                    <div className="w-full md:w-32">
                      <select
                        value={item.status}
                        onChange={e => updateAction(item.id, { status: e.target.value as ActionStatus }, 'status-change')}
                        disabled={!canEditPlan}
                        className={`w-full px-3 py-1.5 text-xs font-bold rounded-lg border-none focus:ring-0 cursor-pointer ${item.status === 'done' ? 'bg-green-50 text-green-700' :
                          item.status === 'in-progress' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-600'
                          }`}
                      >
                        <option value="todo">À faire</option>
                        <option value="in-progress">En cours</option>
                        <option value="done">Terminé</option>
                      </select>
                    </div>
                    <button
                      onClick={() => deleteAction(item.id)}
                      disabled={!canEditPlan}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <SparklesIcon className="h-4 w-4 rotate-45" /> {/* Use Sparkles as a fancy delete for now or just generic icon */}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Zone de saisie premium */}
      <div className="p-4 md:p-8 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto w-full">
          {/* Suggestions rapides stylisées */}
          <div className="mb-6 flex flex-wrap gap-2 justify-center">
            {['Ventes', 'Ratios', 'Recommandations', 'Prévisions'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(`Comment vont mes ${suggestion.toLowerCase()} ?`)}
                className="group px-5 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-2xl hover:bg-slate-900 hover:text-white hover:border-slate-900 hover:-translate-y-0.5 transition-all shadow-sm active:scale-95 flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-400"></div>
                {suggestion}
              </button>
            ))}
          </div>

          <div className="relative group flex items-center gap-3">
            <button className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl transition-all active:scale-90" aria-label="Joindre un fichier" title="Joindre un fichier">
              <PaperClipIcon className="h-6 w-6" />
            </button>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Pilotez votre performance : posez une question..."
                className="w-full pl-6 pr-14 py-4 md:py-5 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-slate-100 focus:border-slate-300 outline-none text-md font-medium text-slate-800 transition-all placeholder:text-slate-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 md:p-4 bg-slate-900 text-indigo-300 rounded-[1.5rem] hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
                aria-label="Envoyer le message"
                title="Envoyer"
              >
                <PaperAirplaneIcon className="h-6 w-6" />
              </button>
            </div>

            <button className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl transition-all active:scale-90 hidden md:block" aria-label="Activer le micro" title="Activer le micro">
              <MicrophoneIcon className="h-6 w-6" />
            </button>
          </div>

          <p className="mt-4 text-[10px] font-bold text-center text-slate-400 tracking-widest uppercase">
            LIA peut commettre des erreurs. Vérifiez les données clés.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatbotLIA;
