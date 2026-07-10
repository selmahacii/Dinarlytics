import React, { useState, useRef, useEffect } from 'react';
import {
  SparklesIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  PaperClipIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ChevronRightIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';
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

// Helper to render basic markdown (bold)
const parseMarkdown = (text: string) => {
  if (!text) return text;
  
  // Handle **bold**
  const points = text.split(/(\*\*.*?\*\*)/g);
  return points.map((point, i) => {
    if (point.startsWith('**') && point.endsWith('**')) {
      return <strong key={i} className="font-bold">{point.slice(2, -2)}</strong>;
    }
    return point;
  });
};

const ChatbotLIA: React.FC = () => {
  const { user, companyData, formatCurrency, currentDevise, currentCountry, planComptable, currentLang } = useApp();
  const { t } = useTranslation();
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
    return `[${t(`chatbot.confidence_${confidence}`)}]`;
  };

  const getTrendLabel = (trend: 'up' | 'down' | 'stable'): string => {
    return `[${t(`chatbot.trend_${trend}`)}]`;
  };

  const getRiskLabel = (risk: 'low' | 'medium' | 'high' | 'critical'): string => {
    return `[${t(`chatbot.risk_${risk}`).toUpperCase()}]`;
  };

  const getStatusLabel = (status: 'good' | 'warning' | 'critical' | 'excellent' | 'average' | 'below' | 'poor'): string => {
    return t(`chatbot.status_${status}`).toUpperCase();
  };

  const [messages, setMessages] = useState<Message[]>([]);

  // Personalized dynamic greeting using i18n
  useEffect(() => {
    if (user) {
      const roleKey = user.role?.toLowerCase() || 'dg';
      const roleDisplay = t(`roles.${roleKey}`, { defaultValue: user.role_display || user.role || t('common.user') });
      
      const greeting = t('chatbot.welcome', { name: `${user.prenom || ''} ${user.nom || ''}` }) + 
        '\n\n' + 
        t('chatbot.role_context', { role: roleDisplay }) + 
        '\n\n' + 
        t('chatbot.capabilities_intro') + 
        '\n• ' + t('chatbot.capabilities.predictive') +
        '\n• ' + t('chatbot.capabilities.simulations') +
        '\n• ' + t('chatbot.capabilities.optimization') +
        '\n• ' + t('chatbot.capabilities.performance') +
        '\n\n' + t('chatbot.question');

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
    
    // Industrial grade mapping from translation.json
    if (isExec) {
      return [
        t('chatbot.quick_actions.synthesis'),
        t('chatbot.quick_actions.sector_analysis'),
        t('chatbot.quick_actions.growth_scenarios'),
        t('chatbot.quick_actions.risk_report')
      ];
    }
    
    // Default or other roles
    return [
      t('chatbot.quick_actions.synthesis'),
      t('chatbot.quick_actions.growth_scenarios'),
      t('chatbot.quick_actions.risk_report')
    ];
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
      logAction({ userId: userIdNum, action, actor: user?.nom || t('common.user'), details });
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
      actions.push({ id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, title: t('chatbot.recs.titles.dso'), owner: companyType === 'eurl' ? t('roles.gerant') : t('roles.recouvrement'), due: inDaysLocal(15), status: 'todo', note: t('chatbot.alerts.dso', { val: dso, target: bm.dsoMax }) + ': ' + t('chatbot.recs.dso'), createdAt: now, updatedAt: now });
    }
    if (dio > bm.dioMax) {
      actions.push({ id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, title: t('chatbot.recs.titles.dio'), owner: segment === 'micro' ? t('roles.stock_manager') : t('roles.supply_chain'), due: inDaysLocal(30), status: 'todo', note: t('chatbot.alerts.dio', { val: dio, target: bm.dioMax }) + ': ' + t('chatbot.recs.dio'), createdAt: now, updatedAt: now });
    }
    if (dpo < bm.dpoMin) {
      actions.push({ id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, title: t('chatbot.recs.titles.dpo'), owner: t('roles.achats'), due: inDaysLocal(30), status: 'todo', note: t('chatbot.alerts.dpo', { val: dpo, target: bm.dpoMin }) + ': ' + t('chatbot.recs.dpo', { min: bm.dpoMin, max: Math.max(55, bm.dpoMin + 10) }), createdAt: now, updatedAt: now });
    }
    if (profitPct < bm.marginMin) {
      actions.push({ id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, title: t('chatbot.recs.titles.margin'), owner: t('roles.commercial'), due: inDaysLocal(20), status: 'todo', note: t('chatbot.alerts.margin', { val: profitPct.toFixed(1), target: bm.marginMin }) + ': ' + t('chatbot.recs.margin'), createdAt: now, updatedAt: now });
    }
    if (companyType === 'spa' || segment === 'enterprise') {
      actions.push({ id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, title: t('chatbot.recs.titles.audit'), owner: t('roles.finance_it'), due: inDaysLocal(45), status: 'todo', note: t('chatbot.recs.audit_desc'), createdAt: now, updatedAt: now });
    }
    if (liqQuick < bm.liqQuickMin) {
      actions.push({ id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, title: t('chatbot.recs.titles.cash'), owner: companyType === 'eurl' ? t('roles.gerant') : t('roles.daf'), due: inDaysLocal(10), status: 'todo', note: t('chatbot.alerts.liq_quick', { val: liqQuick.toFixed(2), target: bm.liqQuickMin.toFixed(2) }) + ': ' + t('chatbot.recs.cash'), createdAt: now, updatedAt: now });
    }

    if (actions.length === 0) {
      actions.push({ id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, title: t('chatbot.recs.titles.monitoring'), owner: user?.nom || t('common.user'), due: inDaysLocal(30), status: 'todo', note: t('chatbot.recs.monitoring_desc'), createdAt: now, updatedAt: now });
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({
          message: userMessage,
          company_id: (user as any)?.company_id,
          context: { currentDevise, currentCountry, planComptable, companyType, segment, sector }
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

    // Normalisation du message pour la détection
    const normalized = userMessage.trim().toLowerCase().replace(/[—–]/g, '-');
    
    const isAnalyse = normalized.includes('/analyse') || normalized.includes('audit') || normalized.includes('تحليل') || normalized.includes('خلاصة') || normalized.includes('ربحية') || normalized.includes('خزينة');
    const isPlan = normalized.includes('/plan') || normalized.includes('خطة') || normalized.includes('إجراءات');
    const isForecast = normalized.includes('/previsions') || normalized.includes('توقعات') || normalized.includes('forecast');
    const isSales = normalized.includes('ventes') || normalized.includes('chiffre') || normalized.includes('ca') || normalized.includes('مبيعات') || normalized.includes('إيرادات') || normalized.includes('هامش');
    const isCategorisation = normalized.includes('/categoriser') || normalized.includes('تصنيف') || normalized.includes('catégoriser');
    const isScenario = normalized.includes('scénario') || normalized.includes('scenario') || normalized.includes('سيناريو') || normalized.includes('simulation');
    const isSaisonnier = normalized.includes('/saisonnier') || normalized.includes('/seasonal') || normalized.includes('نمط') || normalized.includes('موسمي');

    // Prévisions trésorerie améliorées avec analyse prédictive
    const wantsForecast = isForecast ||
      normalized.includes('prévisions de cash-flow') ||
      normalized.includes(t('chatbot.fallback.cmd_forecast').toLowerCase()) ||
      normalized.includes(t('chatbot.fallback.cmd_forecast_full').toLowerCase());

    const message = normalized; // Pour compatibilité avec le reste du code

    if (wantsForecast) {
      const revM = companyData?.revenueMonth ?? 0;
      const cash0 = companyData?.cashBalance ?? 0;
      const ar = companyData?.accountsReceivable ?? 0;
      const ap = companyData?.accountsPayable ?? 0;
      const monthlyExpenses = revM * (1 - (companyData?.profitMargin ?? 15) / 100);

      // Utiliser la fonction prédictive améliorée
      const forecasts = forecastCashFlow(cash0, revM, monthlyExpenses, ar, ap, 13);

      // Détecter les risques
      const criticalWeeks = forecasts.filter(f => {
        const monthlyRevenue = revM;
        const cashMonths = f.value / monthlyRevenue;
        return cashMonths < 1;
      });

      const lines: string[] = [];
      lines.push(t('chatbot.fallback.audit_forecast.title'));
      lines.push(`${t('chatbot.fallback.audit_forecast.org_prefix')}: ${user?.companyName || 'Entreprise'} • Segment: ${t(`segments.${segment}`)} • ${t('chatbot.fallback.audit_forecast.role_prefix')}: ${user?.role_display || user?.role}`);
      lines.push('');
      lines.push('─'.repeat(50));
      lines.push('');

      forecasts.forEach((f, idx) => {
        const date = new Date(f.date);
        const dateStr = date.toLocaleDateString(currentLang === 'ar' ? 'ar-DZ' : currentLang === 'en' ? 'en-US' : 'fr-FR', { day: '2-digit', month: 'short' });
        const confidenceLabel = getConfidenceLabel(f.confidence);
        const trendLabel = getTrendLabel(f.trend ?? 'stable');
        const isCritical = criticalWeeks.some(cw => cw.date === f.date);
        const riskLabel = isCritical ? t('chatbot.fallback.audit_forecast.alert_liquidity') : t('chatbot.fallback.audit_forecast.stable');

        lines.push(`${f.period.replace('Semaine', t('common.periods.week'))} (${dateStr}) — ${riskLabel}`);
        lines.push(`  • ${t('chatbot.fallback.audit_forecast.projections_prefix')}: ${formatCurrency(f.value)}`);
        lines.push(`  • ${t('chatbot.fallback.audit_forecast.trend_prefix')}: ${trendLabel}`);
        lines.push(`  • ${t('chatbot.fallback.audit_forecast.confidence_prefix')}: ${confidenceLabel}`);
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
        lines.push(t('chatbot.fallback.audit_forecast.alert_liquidity'));
        lines.push('');
        criticalWeeks.forEach(cw => {
          const date = new Date(cw.date);
          const dateStr = date.toLocaleDateString(currentLang === 'ar' ? 'ar-DZ' : currentLang === 'en' ? 'en-US' : 'fr-FR', { day: '2-digit', month: 'short' });
          const cashMonths = (cw.value / revM).toFixed(1);
          lines.push(`  • ${cw.period} (${dateStr}): ${t('chatbot.fallback.audit_forecast.alert_liquidity')}`);
          lines.push(`    ${t('chatbot.fallback.audit_forecast.projections_prefix')}: ${formatCurrency(cw.value)} (${cashMonths} ${t('common.periods.month')})`);
        });
        lines.push('');
        lines.push(`${t('chatbot.fallback.audit_forecast.recommendations_title')}:`);
        lines.push('  1. ' + t('chatbot.recommendations.collect_early'));
        lines.push('  2. ' + t('chatbot.recommendations.negotiate_dpo'));
        lines.push('  3. ' + t('chatbot.recommendations.reduce_opex'));
        lines.push('  4. ' + t('chatbot.recommendations.bridge_finance'));
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
        t('chatbot.fallback.risk_audit.title'),
        `${t('chatbot.fallback.audit_forecast.org_prefix')}: ${user?.companyName || t('common.organisation')} • ${t('chatbot.fallback.risk_audit.overall_level')}: ${getRiskLabel(riskAnalysis.overallRisk).toUpperCase()} (${riskAnalysis.score}/100)`,
        '',
        '─'.repeat(50),
        '',
        t('chatbot.fallback.risk_audit.factors_title'),
        ...riskAnalysis.factors.map(factor =>
          `• ${t(`chatbot.fallback.risk_audit.factors.${factor.factor.toLowerCase()}`, { defaultValue: factor.factor }).padEnd(20)} : ${getRiskLabel(factor.risk).toUpperCase()} [Impact: ${factor.impact} ${t('chatbot.fallback.risk_audit.impact_suffix')}]\n  ${factor.description}`
        ),
        '',
        t('chatbot.fallback.risk_audit.strategic_recommendation'),
        riskAnalysis.recommendation,
        '',
        '─'.repeat(50),
        t('chatbot.fallback.risk_audit.footer')
      ].join('\n');
      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        data: { forecasts, riskAnalysis, alerts: criticalWeeks },
        suggestions: [
          t('chatbot.suggestions.details.growth_scenarios'),
          t('chatbot.suggestions.forecasts'),
          t('chatbot.fallback.seasonal.title'),
          t('chatbot.auto_generate')
        ]
      };
    }

    // Scénarios prédictifs multiples
    const wantsScenarios =
      message.includes('/scenarios') ||
      message.includes('/scenarii') ||
      message.includes('scénarios de croissance') ||
      message.includes('scenarios de croissance') ||
      message.includes(t('chatbot.suggestions.growth_scenarios').toLowerCase()) ||
      (message.includes('scénario') && (message.includes('prédictif') || message.includes('predictif'))) ||
      (message.includes('سيناريو') && message.includes('تنبؤي')) ||
      (message.includes('scenario') && message.includes('predictive'));

    if (wantsScenarios) {
      const revM = companyData?.revenueMonth ?? 0;
      const revY = revM * 12;
      const margin = companyData?.profitMargin ?? 15;
      const cash = companyData?.cashBalance ?? 0;
      const ar = companyData?.accountsReceivable ?? 0;
      const dso = revM > 0 ? Math.round((ar / revM) * 30) : 0;
      const turnover = companyData?.stockTurnover || 4.2;
      const dio = Math.round(365 / Math.max(0.1, turnover));
      const ap = companyData?.accountsPayable ?? 0;
      const dpo = revM > 0 ? Math.round((ap / Math.max(1, (revM * (1 - margin / 100)))) * 30) : 0;

      const scenarios = generatePredictiveScenarios({
        revenue: revY,
        margin,
        cash,
        dso,
        dio,
        dpo
      });

      const content = [
        t('chatbot.fallback.scenarios.title'),
        `${t('chatbot.fallback.audit_forecast.org_prefix')}: ${user?.companyName || t('chatbot.fallback.audit_forecast.group')} • ${t('chatbot.fallback.audit_forecast.profile')}: ${companyType.toUpperCase()} • ${t('chatbot.fallback.audit_forecast.sector')}: ${sectorLabel}`,
        '',
        '─'.repeat(50),
        '',
        ...scenarios.map((scenario, idx) => {
          const probLabel = scenario.probability >= 50 ? t('chatbot.fallback.scenarios.prob_high') : scenario.probability >= 30 ? t('chatbot.fallback.scenarios.prob_medium') : t('chatbot.fallback.scenarios.prob_low');

          return [
            `${scenario.name.toUpperCase()} — ${probLabel}`,
            `Description: ${scenario.description}`,
            '',
            `${t('chatbot.fallback.audit_forecast.metrics_title')}:`,
            scenario.metrics.revenue ? `  • ${t('common.revenue')}: ${formatCurrency(scenario.metrics.revenue.projected)} (${Number(scenario.metrics.revenue.change) > 0 ? '+' : ''}${((Number(scenario.metrics.revenue.change) / scenario.metrics.revenue.current) * 100).toFixed(1)}%)` : '',
            scenario.metrics.margin ? `  • ${t('common.margin')}: ${scenario.metrics.margin.projected.toFixed(1)}% (${Number(scenario.metrics.margin.change) > 0 ? '+' : ''}${scenario.metrics.margin.change.toFixed(1)} pts)` : '',
            scenario.metrics.cash ? `  • ${t('common.cash')}: ${formatCurrency(scenario.metrics.cash.projected)} (${Number(scenario.metrics.cash.change) > 0 ? '+' : ''}${((Number(scenario.metrics.cash.change) / scenario.metrics.cash.current) * 100).toFixed(1)}%)` : '',
            '',
            `${t('chatbot.fallback.scenarios.assumptions_title')}:`,
            ...scenario.assumptions.map((ass, i) => `  ${i + 1}. ${ass}`),
            '',
            scenario.risks.length > 0 ? `${t('chatbot.fallback.scenarios.risks_title')}:` : '',
            ...scenario.risks.map((risk, i) => `  • ${risk}`),
            '',
            '─'.repeat(30),
            ''
          ].filter(l => l !== '').join('\n');
        }),
        t('chatbot.fallback.scenarios.footer', { defaultValue: '© LIA Scenario Planning - Strategic Forecasting' })
      ].join('\n');
      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        data: { scenarios },
        suggestions: [
          t('chatbot.suggestions.details.cash_forecast'),
          t('chatbot.suggestions.forecasts'),
          t('chatbot.fallback.seasonal.title'),
          t('chatbot.suggestions.financial_analysis')
        ]
      };
    }

    // Prévisions de CA avec tendances
    const wantsRevenueForecast =
      normalized.includes('/prevision-ca') ||
      normalized.includes('/forecast-revenue') ||
      (normalized.includes('prévision') && (normalized.includes('ca') || normalized.includes('chiffre'))) ||
      (normalized.includes('forecast') && normalized.includes('revenue')) ||
      normalized.includes(t('chatbot.capabilities.predictive').replace(/\*\*/g, '').split(':')[0].toLowerCase().trim());

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
          content: t('chatbot.fallback.revenue_forecast.error_min_data'),
          timestamp: new Date(),
          suggestions: [t('chatbot.quick_actions.risk_report'), t('chatbot.quick_actions.synthesis')]
        };
      }

      // Calculer la croissance moyenne
      const avgGrowth = forecasts.length > 0
        ? ((forecasts[forecasts.length - 1].value - forecasts[0].value) / forecasts[0].value) * 100
        : 0;

      const content = [
        t('chatbot.fallback.revenue_forecast.title'),
        `${t('chatbot.fallback.audit_forecast.org_prefix')}: ${user?.companyName || t('chatbot.fallback.audit_forecast.group')} • ${t('chatbot.fallback.audit_forecast.profile')}: ${companyType.toUpperCase()} • ${t('chatbot.fallback.audit_forecast.sector')}: ${sectorLabel}`,
        '',
        '─'.repeat(50),
        '',
        t('chatbot.fallback.audit_forecast.metrics_title'),
        ...forecasts.map(f => {
          const date = new Date(f.date);
          const dateStr = date.toLocaleDateString(currentLang === 'ar' ? 'ar-DZ' : currentLang === 'en' ? 'en-US' : 'fr-FR', { month: 'long', year: 'numeric' });
          return `• ${dateStr.padEnd(18)} : ${formatCurrency(f.value).padStart(15)} [${getConfidenceLabel(f.confidence)}]`;
        }),
        '',
        '─'.repeat(25),
        '',
        t('chatbot.fallback.revenue_forecast.summary_title'),
        `• ${t('chatbot.fallback.revenue_forecast.total_variation')} : ${avgGrowth > 0 ? '+' : ''}${avgGrowth.toFixed(1)}%`,
        `• ${t('chatbot.fallback.revenue_forecast.base_trend')}        : ${avgGrowth > 0 ? t('chatbot.labels.trend_up') : avgGrowth < 0 ? t('chatbot.labels.trend_down') : t('chatbot.labels.trend_stable')}`,
        '',
        `👉 ${t('common.tip')} : ${t('chatbot.fallback.revenue_forecast.recommendation')}`,
        '',
        t('chatbot.fallback.revenue_forecast.footer', { defaultValue: '© LIA Revenue Forecasting - Predictive Growth Analysis' })
      ].join('\n');
      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        data: { forecasts, historicalRevenue, avgGrowth },
        suggestions: [
          t('chatbot.fallback.seasonal.title'),
          t('chatbot.suggestions.growth_scenarios'),
          t('chatbot.suggestions.details.cash_forecast'),
          t('chatbot.suggestions.financial_analysis')
        ]
      };
    }



    // Détection de patterns saisonniers
    const wantsSeasonalPattern = isSaisonnier ||
      normalized.includes(t('chatbot.fallback.seasonal.title').toLowerCase()) ||
      normalized.includes(t('chatbot.capabilities.optimization').replace(/\*\*/g, '').split(':')[0].toLowerCase().trim());

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
          content: t('chatbot.fallback.seasonal.error_min_data'),
          timestamp: new Date(),
          suggestions: [t('chatbot.quick_actions.revenue_forecast'), t('chatbot.quick_actions.audit_forecast')]
        };
      }

      const safePattern = pattern!; // Ensure non-null context

      const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

      const content = [
        t('chatbot.fallback.seasonal.title'),
        `${t('chatbot.fallback.audit_forecast.org_prefix')}: ${user?.companyName || t('chatbot.fallback.audit_forecast.group')} • ${t('chatbot.fallback.audit_forecast.analysis_period')} • ${t('chatbot.fallback.audit_forecast.sector')}: ${sectorLabel}`,
        '',
        '─'.repeat(50),
        '',
        '1. ' + t('chatbot.fallback.seasonal.detection_title'),
        safePattern.description,
        '',
        '2. ' + t('chatbot.fallback.seasonal.critical_points'),
        `• ${t('chatbot.fallback.seasonal.peak_period')}    : ${t(`common.months.${monthNames[safePattern.peakMonth!].toLowerCase()}`)}`,
        `• ${t('chatbot.fallback.seasonal.low_period')}   : ${t(`common.months.${monthNames[safePattern.lowMonth!].toLowerCase()}`)}`,
        `• ${t('chatbot.fallback.seasonal.factor')}  : ${(safePattern.seasonalityFactor * 100).toFixed(1)}%`,
        '',
        '3. ' + t('chatbot.fallback.seasonal.recommendations_title'),
        ...(safePattern.seasonalityFactor > 0.3 ? [
          '⚠️ ' + t('chatbot.fallback.seasonal.marked_seasonal') + ' :',
          '  • ' + t('chatbot.fallback.seasonal.stock_opt'),
          '  • ' + t('chatbot.fallback.seasonal.cash_mgt'),
          '  • ' + t('chatbot.fallback.seasonal.marketing_launch'),
          '  • ' + t('chatbot.fallback.seasonal.hr_mgt')
        ] : [
          '✅ ' + t('chatbot.fallback.seasonal.linear_activity') + ' :',
          '  • ' + t('chatbot.fallback.seasonal.linear_focus'),
          '  • ' + t('chatbot.fallback.seasonal.linear_cash'),
          '  • ' + t('chatbot.fallback.seasonal.linear_stock')
        ]),
        '',
        '─'.repeat(50),
        t('chatbot.fallback.seasonal.footer', { defaultValue: '© LIA Pattern Intelligence - Contextual Analysis' })
      ].join('\n');
      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        data: { pattern, historicalRevenue },
        suggestions: [
          t('chatbot.suggestions.forecasts'),
          t('chatbot.suggestions.details.cash_forecast'),
          t('chatbot.suggestions.growth_scenarios'),
          t('chatbot.suggestions.financial_analysis')
        ]
      };
    }

    // Plan d'actions
    const wantsPlan = isPlan ||
      message.includes(t('chatbot.fallback.cmd_plan').toLowerCase()) ||
      message.includes(t('chatbot.fallback.cmd_plan_full').toLowerCase()) ||
      (message.includes('plan') && message.includes('action')) ||
      (message.includes('خطة') && message.includes('عمل')) ||
      (message.includes('plan') && message.includes('actions'));

    if (wantsPlan) {
      const baseTasks = [
        { titre: t('chatbot.recs.titles.dso'), resp: companyType === 'eurl' ? t('roles.gerant') : t('roles.recouvrement'), delai: 'J+15', detail: t('chatbot.recs.dso') },
        { titre: t('chatbot.recs.titles.dio'), resp: segment === 'micro' ? t('roles.stock_manager') : t('roles.supply_chain'), delai: 'J+30', detail: t('chatbot.recs.dio') },
        { titre: t('chatbot.recs.titles.dpo'), resp: t('roles.achats'), delai: 'J+30', detail: t('chatbot.recs.dpo', { min: Math.max(45, Math.round(bm.dpoMin)), max: Math.max(55, Math.round(bm.dpoMin) + 15) }) },
        { titre: t('chatbot.recs.titles.margin'), resp: t('roles.commercial'), delai: 'J+20', detail: t('chatbot.recs.margin') }
      ];
      const spaExtras = [
        { titre: t('chatbot.recs.titles.audit'), resp: t('roles.finance_it'), delai: 'J+45', detail: t('chatbot.recs.audit_desc') },
        { titre: t('chatbot.recs.titles.monitoring'), resp: t('roles.finance_it'), delai: 'J+40', detail: t('chatbot.recs.monitoring_desc') }
      ];
      const tasks = companyType === 'spa' || segment === 'enterprise' ? [...baseTasks, ...spaExtras] : baseTasks;
      const content = [
        `${t('chatbot.plan_title')} — ${user?.companyName || t('common.organisation')}`,
        `${t('chatbot.audit.target')}: ${t('chatbot.fallback.ccc_title')} • ${t('chatbot.audit.sector')}: ${sectorLabel}`,
        '',
        '─'.repeat(50),
        '',
        ...tasks.map((task, i) => `${i + 1}. ${task.titre.toUpperCase()}\n   ${t('chatbot.fallback.plan.owner')}: ${task.resp} | ${t('chatbot.fallback.plan.due')}: ${task.delai}\n   ${t('chatbot.fallback.plan.objective')}: ${task.detail}`),
        '',
        `👉 ${t('chatbot.fallback.plan.follow_up')}: ${t('chatbot.fallback.plan.follow_up_desc')}`,
        t('chatbot.fallback.plan.lia_help')
      ].join('\n');
      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        suggestions: [t('chatbot.suggestions.details.cash_impact'), t('chatbot.suggestions.details.financial_audit'), t('chatbot.suggestions.details.growth_scenarios'), t('chatbot.tooltips.export')]
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
        t('chatbot.comparisons.title'),
        `${companyType.toUpperCase()} • ${t(`segments.${segment.toLowerCase()}`, segment)} • ${sectorLabel}`,
        '',
        '─'.repeat(60),
        '',
        t('chatbot.comparisons.mom'),
        '',
        t('chatbot.comparisons.revenue'),
        `  ${t('chatbot.comparisons.current')} ${formatCurrency ? formatCurrency(revM) : `${revM.toLocaleString()} DA`}`,
        `  ${t('chatbot.comparisons.prev')} ${formatCurrency ? formatCurrency(prevRevM) : `${prevRevM.toLocaleString()} DA`}`,
        `  ${t('chatbot.comparisons.var')} ${trendRev.changePercent > 0 ? '+' : ''}${trendRev.changePercent}% ${getTrendLabel(trendRev.trend)}`,
        `  ${t('chatbot.comparisons.status')} ${getStatusLabel(trendRev.status)}`,
        '',
        t('chatbot.comparisons.margin'),
        `  ${t('chatbot.comparisons.current')} ${margin.toFixed(1)}%`,
        `  ${t('chatbot.comparisons.prev')} ${prevMargin.toFixed(1)}%`,
        `  ${t('chatbot.comparisons.var')} ${trendMargin.changePercent > 0 ? '+' : ''}${trendMargin.changePercent}% ${getTrendLabel(trendMargin.trend)}`,
        '',
        t('chatbot.comparisons.dso'),
        `  ${t('chatbot.comparisons.current')} ${dso} ${t('chatbot.whatif.days')}`,
        `  ${t('chatbot.comparisons.prev')} ${prevDso} ${t('chatbot.whatif.days')}`,
        `  ${t('chatbot.comparisons.var')} ${trendDso.changePercent > 0 ? '+' : ''}${trendDso.changePercent}% ${getTrendLabel(trendDso.trend)}`,
        `  ${t('chatbot.comparisons.status')} ${getStatusLabel(trendDso.status)}`,
        '',
        '─'.repeat(60),
        '',
        t('chatbot.comparisons.yoy'),
        '',
        t('chatbot.comparisons.rev_y'),
        `  ${t('chatbot.comparisons.current')} ${formatCurrency ? formatCurrency(revY) : `${revY.toLocaleString()} DA`}`,
        `  ${t('chatbot.comparisons.prev')} ${formatCurrency ? formatCurrency(prevRevY) : `${prevRevY.toLocaleString()} DA`}`,
        `  ${t('chatbot.comparisons.var')} ${trendRevY.changePercent > 0 ? '+' : ''}${trendRevY.changePercent}% ${getTrendLabel(trendRevY.trend)}`,
        '',
        '─'.repeat(60),
        '',
        t('chatbot.comparisons.insights'),
        '',
        ...(trendRev.trend === 'up' && trendRev.changePercent > 5 ? [t('chatbot.comparisons.ins_rev_up')] : []),
        ...(trendMargin.status === 'critical' ? [t('chatbot.comparisons.ins_mar_down')] : []),
        ...(trendDso.status === 'critical' ? [t('chatbot.comparisons.ins_dso_up')] : []),
        ...(trendRevY.trend === 'up' ? [t('chatbot.comparisons.ins_yoy_up')] : [t('chatbot.comparisons.ins_yoy_down')]),
        '',
        t('chatbot.comparisons.actions'),
        '',
        ...(trendDso.status === 'critical' ? [t('chatbot.comparisons.act_dso')] : []),
        ...(trendMargin.status === 'critical' ? [t('chatbot.comparisons.act_margin')] : []),
        ...(trendRev.status === 'critical' ? [t('chatbot.comparisons.act_rev')] : [])
      ].filter(Boolean).join('\n');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        suggestions: [t('chatbot.suggestions.financial_analysis'), t('chatbot.suggestions.growth_scenarios'), t('chatbot.quick_actions.sector_analysis')]
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
        t('chatbot.anomalies.title'),
        `${companyType.toUpperCase()} • ${t(`segments.${segment.toLowerCase()}`, segment)}`,
        '',
        '─'.repeat(60),
        '',
        anomalies.length > 0 ? t('chatbot.anomalies.alert_yes') : t('chatbot.anomalies.alert_no'),
        '',
        ...anomalies.map((a, i) => [
          `${i + 1}. ${a.metric.toUpperCase()} — ${a.severity === 'high' ? t('chatbot.anomalies.crit') : a.severity === 'medium' ? t('chatbot.anomalies.med') : t('chatbot.anomalies.low')}`,
          `   ${t('chatbot.anomalies.current_val')} ${a.value.toLocaleString()}${a.metric === 'margin' ? '%' : ' DA'}`,
          `   ${t('chatbot.anomalies.expected_val')} ${a.expected.toLocaleString()}${a.metric === 'margin' ? '%' : ' DA'}`,
          `   ${t('chatbot.anomalies.deviation')} ${a.deviation > 0 ? '+' : ''}${a.deviation.toLocaleString()}${a.metric === 'margin' ? '%' : ' DA'}`,
          `   ${a.explanation}`,
          `   ${t('chatbot.anomalies.reco')} ${a.recommendation}`,
          ''
        ]).flat(),
        anomalies.length === 0 ? [
          t('chatbot.anomalies.ok_1'),
          t('chatbot.anomalies.ok_2')
        ].join('\n') : ''
      ].filter(Boolean).join('\n');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        suggestions: [t('chatbot.suggestions.financial_analysis'), t('chatbot.quick_actions.growth_scenarios'), t('chatbot.suggestions.details.cash_forecast')]
      };
    }

    // Scénarios "what-if"
    const wantsScenario = isScenario ||
      message.includes('what-if') ||
      message.includes(t('chatbot.capabilities.simulations').replace(/\*\*/g, '').split(':')[0].toLowerCase().trim()) ||
      message.includes(t('chatbot.quick_actions.growth_scenarios').toLowerCase());

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
        t('chatbot.whatif.title'),
        `${companyType.toUpperCase()} • ${t(`segments.${segment.toLowerCase()}`, segment)}`,
        '',
        '─'.repeat(60),
        '',
        t('chatbot.whatif.s1_title'),
        `  ${t('chatbot.whatif.current_ca')}: ${formatCurrency ? formatCurrency(revM) : `${revM.toLocaleString()} DA`}`,
        `  ${t('chatbot.whatif.projected_ca')}: ${formatCurrency ? formatCurrency(scenario1.projectedValue) : `${scenario1.projectedValue.toLocaleString()} DA`}`,
        `  ${t('chatbot.whatif.impact')}: +${formatCurrency ? formatCurrency(scenario1.impact) : `${scenario1.impact.toLocaleString()} DA`}`,
        `  ${t('chatbot.whatif.confidence')}: ${scenario1.confidence}%`,
        `  ${t('chatbot.whatif.assumptions')}:`,
        ...scenario1.assumptions.map(a => `    - ${a}`),
        '',
        t('chatbot.whatif.s2_title'),
        `  ${t('chatbot.whatif.current_dso')}: ${dso} ${t('chatbot.whatif.days')}`,
        `  ${t('chatbot.whatif.projected_dso')}: ${dso - 15} ${t('chatbot.whatif.days')}`,
        `  ${t('chatbot.whatif.cash_impact')}: +${formatCurrency ? formatCurrency(cashImpact) : `${cashImpact.toLocaleString()} DA`} ${t('chatbot.whatif.cash_freed')}`,
        `  ${t('chatbot.whatif.assumptions')}:`,
        `    - ${t('chatbot.whatif.s2_h1')}`,
        `    - ${t('chatbot.whatif.s2_h2')}`,
        `    - ${t('chatbot.whatif.s2_h3')}`,
        '',
        t('chatbot.whatif.s3_title'),
        `  ${t('chatbot.whatif.current_margin')}: ${margin}%`,
        `  ${t('chatbot.whatif.projected_margin')}: ${margin + 3}%`,
        `  ${t('chatbot.whatif.profit_impact')}: +${formatCurrency ? formatCurrency(revM * 0.03) : `${(revM * 0.03).toLocaleString()} DA`}${t('chatbot.whatif.per_month')}`,
        `  ${t('chatbot.whatif.assumptions')}:`,
        `    - ${t('chatbot.whatif.s3_h1')}`,
        `    - ${t('chatbot.whatif.s3_h2')}`,
        `    - ${t('chatbot.whatif.s3_h3')}`,
        '',
        '─'.repeat(60),
        '',
        t('chatbot.whatif.desc')
      ].join('\n');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        suggestions: [t('chatbot.suggestions.financial_analysis'), t('chatbot.suggestions.growth_scenarios'), t('chatbot.quick_actions.sector_analysis')]
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
        t('chatbot.benchmarking.title'),
        `${companyType.toUpperCase()} • ${t(`segments.${segment.toLowerCase()}`, segment)} • ${sectorLabel}`,
        '',
        '─'.repeat(60),
        '',
        t('chatbot.benchmarking.revenue'),
        `  ${t('chatbot.benchmarking.your_ca')}: ${formatCurrency ? formatCurrency(revM) : `${revM.toLocaleString()} DA`}`,
        `  ${t('chatbot.benchmarking.sector_avg')}: ${formatCurrency ? formatCurrency(benchRev.sectorAvg) : `${benchRev.sectorAvg.toLocaleString()} DA`}`,
        `  ${t('chatbot.benchmarking.segment_avg')}: ${formatCurrency ? formatCurrency(benchRev.segmentAvg) : `${benchRev.segmentAvg.toLocaleString()} DA`}`,
        `  ${t('chatbot.benchmarking.percentile')}: ${benchRev.percentile}% (${getStatusLabel(benchRev.status)})`,
        `  ${benchRev.recommendation}`,
        '',
        t('chatbot.benchmarking.margin'),
        `  ${t('chatbot.benchmarking.your_margin')}: ${margin}%`,
        `  ${t('chatbot.benchmarking.sector_avg')}: ${benchMargin.segmentAvg.toFixed(1)}%`,
        `  ${t('chatbot.benchmarking.percentile')}: ${benchMargin.percentile}% (${getStatusLabel(benchMargin.status)})`,
        `  ${benchMargin.recommendation}`,
        '',
        t('chatbot.benchmarking.dso'),
        `  ${t('chatbot.benchmarking.your_dso')}: ${dso} ${t('chatbot.whatif.days')}`,
        `  ${t('chatbot.benchmarking.sector_avg')}: ${benchDso.segmentAvg.toFixed(0)} ${t('chatbot.whatif.days')}`,
        `  ${t('chatbot.benchmarking.percentile')}: ${benchDso.percentile}% (${getStatusLabel(benchDso.status)})`,
        `  ${benchDso.recommendation}`,
        '',
        '─'.repeat(60),
        '',
        t('chatbot.benchmarking.desc')
      ].join('\n');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        suggestions: [t('chatbot.suggestions.financial_analysis'), t('chatbot.quick_actions.growth_scenarios'), t('chatbot.suggestions.forecasts')]
      };
    }

    // Analyse financière complète (améliorée)
    const wantsFinancialAnalysis = isAnalyse ||
      message.includes(t('chatbot.fallback.cmd_audit').toLowerCase()) ||
      message.includes(t('chatbot.fallback.cmd_audit_full').toLowerCase()) ||
      message.includes('synthèse stratégique') ||
      message.includes('summary') ||
      message.includes('analysis') ||
      (message.includes('analyse') && (message.includes('financ') || message.includes('trésorerie') || message.includes('tresorerie') || message.includes('performance') || message.includes('bilan'))) ||
      message.includes('comptable') ||
      message.includes(t('chatbot.capabilities.performance').replace(/\*\*/g, '').split(':')[0].toLowerCase().trim()) ||
      message.includes(t('chatbot.quick_actions.synthesis').toLowerCase());

    if (wantsFinancialAnalysis) {
      // Données (avec valeurs de repli)
      const revM = companyData?.revenueMonth ?? 0;
      const profitPct = companyData?.profitMargin ?? 15; // % marge
      const cash = companyData?.cashBalance ?? 0;
      const ar = companyData?.accountsReceivable ?? 0;
      const ap = companyData?.accountsPayable ?? 0;
      const invValue = companyData?.inventoryValue ?? 0;
      const turnover = companyData?.stockTurnover || 4.2; // fois/an
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
      }, t);
      // Ajout CCC spécifique si non déjà couvert
      if (ccc > 60 && !alerts.some(a => a.includes('CCC'))) alerts.push(t('chatbot.alerts.ccc', { val: ccc, status: cccLabel }));

      // Recommandations dynamiques (sensibles au profil)
      const recs: string[] = [];
      if (dso > 35) recs.push(t('chatbot.recs.dso'));
      if (dio > 60) recs.push(t('chatbot.recs.dio'));
      if (dpo < bm.dpoMin) recs.push(t('chatbot.recs.dpo', { min: bm.dpoMin, max: Math.max(55, bm.dpoMin + 10) }));
      if (ccc > 60) recs.push(t('chatbot.recs.ccc'));
      if (marge < bm.marginMin) recs.push(t('chatbot.recs.margin'));
      if (liquiditeImmediate < 1.0) recs.push(t('chatbot.recs.cash'));

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

      const companyTypeLabel = t(`company_types.${companyType}`, { defaultValue: companyType.toUpperCase() });
      const sectorLabelLoc = t(`sectors.${sector}`, { defaultValue: sectorLabel });

      const content = [
        `${t('chatbot.audit.title')} — ${user?.companyName || t('common.organisation')}`,
        `${t('chatbot.audit.profile')}: ${companyTypeLabel} • ${t('chatbot.audit.segment')}: ${t(`segments.${segment}`)} • ${t('chatbot.audit.sector')}: ${sectorLabelLoc}`,
        '',
        '─'.repeat(50),
        '',
        t('chatbot.audit.sec1'),
        `• ${t('chatbot.audit.revenue')}: ${money(revM)} | ${t('chatbot.audit.margin')}: ${marge.toFixed(1)}%`,
        `• ${t('chatbot.audit.cash')}: ${money(cash)} | ${t('chatbot.audit.liquidity')}: ${liquiditeImmediate.toFixed(2)} (${liquiditeImmediate >= 1 ? t('chatbot.audit.healthy') : t('chatbot.audit.tension')})`,
        '',
        ...(isTactical ? [
          t('chatbot.audit.sec2'),
          `• ${t('chatbot.audit.ccc')}: ${ccc} j | ${t('chatbot.audit.status')}: ${cccLabel}`,
          `• DSO: ${dso} j [${t('chatbot.audit.target')}: ${bm.dsoMax}] | DIO: ${dio} j [${t('chatbot.audit.target')}: ${bm.dioMax}] | DPO: ${dpo} j [${t('chatbot.audit.target')}: ${bm.dpoMin}]`,
          `• ${t('chatbot.audit.bfr')}: ${money(bfr)}`,
          ''
        ] : []),
        ...(isCorporate ? [
          t('chatbot.audit.sec3'),
          `• ${t('chatbot.audit.profitability')}: ROE ${ratiosAdv.roePct}% | ROA ${ratiosAdv.roaPct}%`,
          `• ${t('chatbot.audit.autonomy')}: ${ratiosAdv.autonomyPct}% | Gearing ${ratiosAdv.gearingPct ?? 0}%`,
          `• ${t('chatbot.audit.leverage')}: ${ratiosAdv.netDebtToEbitda ?? 'N/A'}`,
          `• ${t('chatbot.audit.coverage')}: ${ratiosAdv.interestCoverage}x${ratiosAdv.waccPct ? ` | ${t('chatbot.audit.wacc')}: ${ratiosAdv.waccPct}%` : ''}`,
          ''
        ] : []),
        ...(sector === 'saas' && ratiosAdv.mrr ? [
          '📍 ' + t('chatbot.audit.sector_focus_saas'),
          `• MRR: ${money(ratiosAdv.mrr)} | Churn: ${ratiosAdv.churnPct}%`,
          `• LTV: ${money(ratiosAdv.ltv ?? 0)} | CAC: ${money(ratiosAdv.cac ?? 0)}`,
          ''
        ] : []),
        t('chatbot.audit.secLia'),
        ...alerts.map(a => `• ${a}`),
        ...summary.anomalies.map(a => `⚠️ ${a.metric}: ${a.explanation}`),
        ...(alerts.length === 0 && summary.anomalies.length === 0 ? [`• ${t('chatbot.audit.noRisk')}`] : []),
        '',
        t('chatbot.audit.secActions'),
        ...recs.slice(0, 2).map(r => `• ${r}`),
        ...(isCorporate ? [
          t('chatbot.fallback.scenarios.prob_high') + ': ' + t('chatbot.recs.audit_desc_extra')
        ] : []),
        ...(isTactical ? [`• ${t('chatbot.audit.cashPotential')}: ${money(impactTotal)}`] : []),
        '',
        '─'.repeat(50),
        t('chatbot.subtitle')
      ].filter(l => l !== null).join('\n');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        suggestions: isCorporate
          ? [t('chatbot.suggestions.details.roe_analysis'), t('chatbot.suggestions.details.leverage_sim'), t('chatbot.suggestions.details.export_report')]
          : [t('chatbot.suggestions.details.reduce_dso'), t('chatbot.suggestions.details.optimize_stock'), t('chatbot.suggestions.details.cash_forecast')]
      };
    }

    if (isSales) {
      const title = t('chatbot.suggestions.sales');
      const caLabel = t('chatbot.audit.revenue');
      const soldLabel = t('chatbot.labels.articles_sold');
      const marginLabel = t('chatbot.audit.margin');
      const remainingLabel = t('chatbot.articles_remaining', { defaultValue: t('chatbot.fallback.stock_status.remaining') });
      const obsLabel = t('common.observation', { defaultValue: 'Observation' });
      const obsValue = t('chatbot.sales_obs_stable', { defaultValue: 'Progression correcte des ventes; marge stable.' });

      return {
        id: Date.now().toString(),
        type: 'lia',
        content: `${title}\n\n- ${caLabel}: ${formatCurrency ? formatCurrency(dailySummary.ca.value) : `${dailySummary.ca.value.toLocaleString()} DA`} (${dailySummary.ca.change > 0 ? '+' : ''}${dailySummary.ca.change}%)\n- ${soldLabel}: ${dailySummary.articlesVendus.sold} (${remainingLabel}: ${dailySummary.articlesVendus.remaining})\n- ${marginLabel}: ${dailySummary.margeBrute}%\n\n${obsLabel}: ${obsValue}`,
        timestamp: new Date(),
        suggestions: [t('chatbot.quick_actions.revenue_forecast'), t('chatbot.quick_actions.audit_forecast'), t('chatbot.quick_actions.risk_report')]
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
        ? t('chatbot.fallback.ratios.low_liquidity', { target: bm.liqGenMin.toFixed(2) })
        : t('chatbot.fallback.ratios.correct_liquidity');

      // Inclure ratios avancés synthétiques
      const advLine = `ROE ${ratiosAdv.roePct}% | ROA ${ratiosAdv.roaPct}% | EBITDA ${ratiosAdv.ebitdaMarginPct}% | Autonomie ${ratiosAdv.autonomyPct}%`;
      const debtLine = ratiosAdv.netDebtToEbitda !== null ? `Net Debt/EBITDA ${ratiosAdv.netDebtToEbitda}` : '';

      const content = [
        `${t('chatbot.fallback.ratios.title')} — Profil: ${companyType.toUpperCase()} • ${t(`segments.${segment}`)} • ${sectorLabel}`,
        '',
        `• ${t('common.margin')}: ${marginPct.toFixed(1)}% (${t('chatbot.fallback.ratios.target')} ≥ ${bm.marginMin}%)`,
        `• ${t('chatbot.fallback.ratios.stock_turnover')}: ${turnover.toFixed(1)}x (${t('chatbot.fallback.ratios.reference')} 6–10x)`,
        `• ${t('chatbot.fallback.ratios.liq_gen')}: ${liqGen.toFixed(2)} (${t('chatbot.fallback.ratios.target')} ≥ ${bm.liqGenMin.toFixed(2)})`,
        `• ${t('chatbot.fallback.ratios.liq_quick')}: ${liqQuick.toFixed(2)} (${t('chatbot.fallback.ratios.target')} ≥ ${bm.liqQuickMin.toFixed(2)})`,
        `• DSO: ${dso} j (${t('chatbot.fallback.ratios.target')} ≤ ${bm.dsoMax} j) | DIO: ${dio} j (${t('chatbot.fallback.ratios.target')} ≤ ${bm.dioMax} j) | DPO: ${dpo} j (${t('chatbot.fallback.ratios.target')} ≥ ${bm.dpoMin} j)`,
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
        suggestions: [t('chatbot.quick_actions.growth_scenarios'), t('chatbot.auto_generate'), t('chatbot.plan_title'), t('chatbot.quick_actions.audit_forecast')]
      };
    }

    if (message.includes('recommandation') || message.includes('conseil') || message.includes('aide')) {
      return {
        id: Date.now().toString(),
        type: 'lia',
        content: `${t('chatbot.fallback.advice.title')}\n\n- ${t('common.cash')}: ${t('chatbot.fallback.advice.cash_tip')}\n- ${t('chatbot.fallback.advice.stock_label')}: ${t('chatbot.fallback.advice.stock_tip')}\n- ${t('common.margin')}: ${t('chatbot.fallback.advice.margin_tip')}\n- ${t('chatbot.fallback.advice.client_label')}: ${t('chatbot.fallback.advice.client_tip')}\n\n${t('chatbot.fallback.advice.priority')}: ${t('chatbot.fallback.advice.priority_tip')}`,
        timestamp: new Date(),
        suggestions: [t('chatbot.quick_actions.revenue_forecast'), t('chatbot.quick_actions.synthesis'), t('chatbot.quick_actions.risk_report')]
      };
    }

    if (message.includes('/previsions') || message.includes('prévision') || message.includes('tendance') || message.includes('futur')) {
      const title = t('chatbot.fallback.revenue_forecast.title');
      const caEst = t('chatbot.audit.revenue') + ' (' + t('chatbot.fallback.ratios.estimated') + ')';
      const cashEnd = t('common.cash') + ' (' + t('chatbot.fallback.treasury.end_of_month') + ')';
      const restock = t('chatbot.fallback.seasonal.stock_opt');
      const restockVal = t('chatbot.fallback.seasonal.stock_desc', { count: 5, days: 10 });
      const risk = t('chatbot.risk_high');
      const riskVal = t('chatbot.alerts.client_risk_desc');
      const margin = t('chatbot.audit.margin') + ' (' + t('chatbot.fallback.ratios.estimated') + ')';
      const confidence = t('chatbot.confidence_label');
      const confidenceVal = '85% (' + t('chatbot.fallback.ratios.last_6_months') + ')';

      return {
        id: Date.now().toString(),
        type: 'lia',
        content: `${title}\n\n- ${caEst}: ${formatCurrency ? formatCurrency(Math.round((companyData?.revenueMonth ?? 4200000) * 1.08)) : 'N/A'} (+8%)\n- ${cashEnd}: ${formatCurrency ? formatCurrency(Math.round((companyData?.cashBalance ?? 1100000))) : 'N/A'}\n- ${restock}: ${restockVal}\n- ${risk}: ${riskVal}\n- ${margin}: ${(dailySummary.margeBrute + 1.2).toFixed(1)}%\n\n${confidence}: ${confidenceVal}.`,
        timestamp: new Date(),
        suggestions: [t('chatbot.quick_actions.revenue_forecast'), t('chatbot.quick_actions.synthesis'), t('chatbot.quick_actions.risk_report')]
      };
    }

    if (message.includes('trésorerie') || message.includes('cash') || message.includes('liquidité')) {
      const cash = companyData?.cashBalance ?? 0;
      const ar = companyData?.accountsReceivable ?? 0;
      const ap = companyData?.accountsPayable ?? 1;
      const inv = companyData?.inventoryValue ?? 0;
      const liqGen = ((cash + ar + inv) / Math.max(1, ap));
      const risk = liqGen >= bm.liqGenMin ? 'OK' : (liqGen >= bm.liqGenMin - 0.1 ? t('chatbot.labels.status_warning') : t('chatbot.labels.status_critical'));
      const reco = liqGen >= bm.liqGenMin
        ? t('chatbot.fallback.treasury.reco_ok')
        : t('chatbot.fallback.treasury.reco_ko');

      const content = [
        `${t('common.cash')} (${t('common.today')}) — Profil: ${companyType.toUpperCase()} • ${t(`segments.${segment}`)} • ${sectorLabel}`,
        '',
        `- ${t('chatbot.fallback.treasury.inflow')}: +${formatCurrency ? formatCurrency(dailySummary.encaissements.in) : `${dailySummary.encaissements.in.toLocaleString()}`}`,
        `- ${t('chatbot.fallback.treasury.outflow')}: -${formatCurrency ? formatCurrency(dailySummary.encaissements.out) : `${dailySummary.encaissements.out.toLocaleString()}`}`,
        `- ${t('chatbot.fallback.treasury.net_balance')}: +${formatCurrency ? formatCurrency(dailySummary.encaissements.in - dailySummary.encaissements.out) : `${(dailySummary.encaissements.in - dailySummary.encaissements.out).toLocaleString()}`}`,
        '',
        `${t('chatbot.fallback.ratios.liq_gen')} (${t('chatbot.fallback.ratios.estimated')}): ${liqGen.toFixed(2)} (${t('chatbot.fallback.ratios.target')} ≥ ${bm.liqGenMin.toFixed(2)}) — ${risk}`,
        `${t('chatbot.fallback.advice.recommendation_label')}: ${reco}`
      ].join('\n');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        suggestions: [t('chatbot.plan_title'), t('chatbot.auto_generate'), t('chatbot.quick_actions.audit_forecast')]
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
    const wantsCategorization = isCategorisation ||
      message.includes(t('chatbot.fallback.cmd_cat').toLowerCase()) ||
      message.includes(t('chatbot.fallback.cmd_cat_full').toLowerCase()) ||
      (message.includes('تصنيف') && message.includes('مصاريف'));
    if (wantsCategorization) {
      const categories = [
        { name: t('common.categories.purchases'), percentage: 35, color: 'blue' },
        { name: t('common.categories.fixed_charges'), percentage: 18, color: 'slate' },
        { name: t('common.categories.personnel'), percentage: 14, color: 'green' },
        { name: t('common.categories.transport'), percentage: 7, color: 'amber' },
        { name: t('common.categories.other_charges'), percentage: 10, color: 'purple' },
        { name: t('common.categories.taxes'), percentage: 6, color: 'red' }
      ];
      const companyTypeLabel = t(`company_types.${companyType}`, { defaultValue: companyType.toUpperCase() });
      const segmentLabel = t(`segments.${segment}`);

      const content = [
        t('chatbot.fallback.categorization.title', { profile: companyTypeLabel, segment: segmentLabel }),
        '',
        t('chatbot.fallback.categorization.distribution_title'),
        ...categories.map(c => `• ${c.name}: ${c.percentage}%`),
        '',
        t('chatbot.fallback.categorization.auto_desc'),
        t('chatbot.fallback.categorization.cmd_test')
      ].join('\n');
      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        suggestions: [t('chatbot.suggestions.financial_analysis'), t('chatbot.suggestions.see_plan'), t('chatbot.suggestions.cash_forecast')]
      };
    }

    // Recommandations contextuelles améliorées
    const wantsContextualRecommendations = message.includes('/recommandations') ||
      (message.includes('recommandation') && message.includes('contextuel'));
    if (wantsContextualRecommendations) {
      const now = new Date();
      const hour = now.getHours();
      const dayOfWeek = now.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isMorning = hour < 12;
      const isEvening = hour >= 18;
      const statusKey = isMorning ? 'status_start' : isEvening ? 'status_end' : 'status_mid';
      const timeStr = `${hour}h${now.getMinutes().toString().padStart(2, '0')}`;

      const contextualRecos = [
        isMorning ? t('chatbot.fallback.contextual.morning') : '',
        isEvening ? t('chatbot.fallback.contextual.evening') : '',
        isWeekend ? t('chatbot.fallback.contextual.weekend') : '',
        t('chatbot.fallback.contextual.time_status', { time: timeStr, status: t(`chatbot.fallback.contextual.${statusKey}`) }),
        '',
        t('chatbot.fallback.contextual.recos_title'),
        `• ${t('chatbot.fallback.contextual.check_payments')}`,
        `• ${t('chatbot.fallback.contextual.update_stock')}`,
        `• ${t('chatbot.fallback.contextual.prepare_tax')}`,
        `• ${t('chatbot.fallback.contextual.analyze_trends')}`
      ].filter(Boolean).join('\n');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content: contextualRecos,
        timestamp: new Date(),
        suggestions: [t('chatbot.suggestions.financial_analysis'), t('chatbot.suggestions.see_plan'), t('chatbot.suggestions.cash_forecast')]
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

      const companyTypeLabel = t(`company_types.${companyType}`, { defaultValue: companyType.toUpperCase() });

      const content = [
        t('chatbot.fallback.g50.title'),
        `${companyTypeLabel} • ${t(`segments.${segment}`)} • ${t('chatbot.fallback.g50.region')}`,
        '',
        '─'.repeat(50),
        '',
        t('chatbot.fallback.g50.projections_title'),
        `  • ${t('chatbot.fallback.g50.taxable_revenue')}: ${formatCurrency ? formatCurrency(revM) : `${revM.toLocaleString()} DA`}`,
        `  • ${t('chatbot.fallback.g50.tva_collected')}: ${formatCurrency ? formatCurrency(tvaCollectee) : `${tvaCollectee.toLocaleString()} DA`}`,
        `  • ${t('chatbot.fallback.g50.tva_deductible')}: ${formatCurrency ? formatCurrency(tvaDeductible) : `${tvaDeductible.toLocaleString()} DA`}`,
        `  • ${t('chatbot.fallback.g50.tva_balance')}: ${formatCurrency ? formatCurrency(tvaCollectee - tvaDeductible) : `${(tvaCollectee - tvaDeductible).toLocaleString()} DA`}`,
        `  • ${t('chatbot.fallback.g50.tap')}: ${formatCurrency ? formatCurrency(tap) : `${tap.toLocaleString()} DA`}`,
        '',
        t('chatbot.fallback.g50.deadlines_title'),
        `  • ${t('chatbot.fallback.g50.g50_deadline')}`,
        `  • ${t('chatbot.fallback.g50.ibs_irg_deadline')}`,
        '',
        t('chatbot.fallback.g50.reco_title'),
        t('chatbot.fallback.g50.reco_text'),
        '',
        '─'.repeat(50),
        t('chatbot.fallback.g50.footer')
      ].join('\n');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content,
        timestamp: new Date(),
        suggestions: [t('chatbot.suggestions.financial_analysis'), t('chatbot.suggestions.see_plan'), t('chatbot.suggestions.growth_scenarios')]
      };
    }

    // ERP & Connectivité
    if (message.includes('erp') || message.includes('logiciel') || message.includes('source')) {
      const title = t('chatbot.fallback.erp_title');
      const desc = t('chatbot.fallback.erp_desc');
      const status = t('chatbot.fallback.erp_status');
      const lastSync = t('chatbot.fallback.erp_last_sync');
      const question = t('chatbot.fallback.erp_question');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content: `${title}\n\n${desc}\n\n${status}\n${lastSync}: ${new Date().toLocaleTimeString(currentLang === 'ar' ? 'ar-DZ' : currentLang === 'en' ? 'en-US' : 'fr-FR')}\n\n${question}`,
        timestamp: new Date(),
        suggestions: [t('chatbot.quick_actions.invoice_audit'), t('chatbot.quick_actions.stock_status'), t('chatbot.quick_actions.sales_journal')]
      };
    }

    if (message.includes('facture') || message.includes('facturation') || message.includes('invoice')) {
      const title = t('chatbot.fallback.invoices_title');
      const receivable = t('chatbot.fallback.invoices_receivable');
      const monthly = t('chatbot.fallback.invoices_monthly_vol');
      const dsoLabel = t('chatbot.fallback.invoices_dso');
      const reco = t('chatbot.fallback.invoices_reco');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content: `${title}\n\n- ${receivable}: ${formatCurrency ? formatCurrency(companyData?.accountsReceivable ?? 4500000) : '4.500.000 DA'}\n- ${monthly}: ${formatCurrency ? formatCurrency(companyData?.revenueMonth ?? 1200000) : '1.200.000 DA'}\n- ${dsoLabel}: ${Math.round(((companyData?.accountsReceivable ?? 4500000) / (companyData?.revenueMonth ?? 1200000)) * 30)} jours.\n\n${reco}`,
        timestamp: new Date(),
        suggestions: [t('chatbot.suggestions.details.reduce_dso'), t('chatbot.suggestions.details.see_invoice_details'), t('chatbot.plan_title')]
      };
    }

    if (message.includes('stock') || message.includes('inventaire') || message.includes('inventory') || message.includes('مخزون') || message.includes('مخازن')) {
      const invValue = companyData?.inventoryValue ?? 1500000;
      const turnover = companyData?.stockTurnover || 6.5;
      const dio = Math.round(365 / Math.max(0.1, turnover));

      const title = t('chatbot.fallback.stock_title');
      const valLabel = t('chatbot.fallback.stock_value');
      const rotLabel = t('chatbot.fallback.stock_turnover');
      const dioLabel = t('chatbot.fallback.stock_dio');
      const reco = t('chatbot.fallback.stock_reco');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content: `${title}\n\n- ${valLabel}: ${formatCurrency ? formatCurrency(invValue) : '1.500.000 DA'}\n- ${rotLabel}: ${turnover}x\n- ${dioLabel}: ${dio} jours.\n\n${reco}`,
        timestamp: new Date(),
        suggestions: [t('chatbot.suggestions.details.optimize_dio'), t('chatbot.suggestions.details.see_dormant_stock'), t('chatbot.plan_title')]
      };
    }

    if (message.includes('dso') || message.includes('dpo') || message.includes('ccc') || message.includes('bfr') || message.includes('cycle') || message.includes('دورة') || message.includes('تحصيل') || message.includes('دفع')) {
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

      const title = t('chatbot.fallback.ccc_title');
      const dsoLabel = t('chatbot.fallback.ccc_dso');
      const dioLabel = t('chatbot.fallback.ccc_dio');
      const dpoLabel = t('chatbot.fallback.ccc_dpo');
      const cccLabel = t('chatbot.fallback.ccc_total');
      const note = t('chatbot.fallback.ccc_note');

      return {
        id: Date.now().toString(),
        type: 'lia',
        content: `${title}\n\n- ${dsoLabel}: ${dso} jours\n- ${dioLabel}: ${dio} jours\n- ${dpoLabel}: ${dpo} jours\n\n${cccLabel}: ${ccc} jours.\n\n${note}`,
        timestamp: new Date(),
        suggestions: [t('chatbot.suggestions.details.reduce_dso'), t('chatbot.suggestions.details.negotiate_dpo'), t('chatbot.quick_actions.audit_forecast')]
      };
    }

    // Dernier recours
    return {
      id: Date.now().toString(),
      type: 'lia',
      content: `${t('chatbot.fallback.default_msg')}\n\n• ${t('chatbot.fallback.cmd_audit_full')}\n• ${t('chatbot.fallback.cmd_plan_full')}\n• ${t('chatbot.fallback.cmd_forecast_full')}\n• ${t('chatbot.fallback.cmd_cat_full')}\n\n${t('chatbot.fallback.default_question')}`,
      timestamp: new Date(),
      suggestions: [
        t('chatbot.fallback.cmd_audit_full'),
        t('chatbot.fallback.cmd_plan_full'),
        t('chatbot.fallback.cmd_forecast_full'),
        t('chatbot.fallback.cmd_cat_full')
      ]
    };
  };

  const handleSendMessage = (overrideMessage?: string) => {
    const msgToSend = overrideMessage || inputMessage;
    if (!msgToSend.trim()) return;

    // Ajouter le message utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: msgToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!overrideMessage) setInputMessage('');
    setIsTyping(true);
    // Journaliser l'action
    try {
      const userIdNum = user ? (Number((user as any).id) || -1) : -1;
      logAction({ userId: userIdNum, action: 'update', actor: user?.nom || t('common.user'), details: `Chatbot question: ${userMessage.content}` });
    } catch { }

    // Simuler le délai de réponse de LIA
    setTimeout(async () => {
      const liaResponse = await generateLiaResponse(msgToSend);
      setMessages(prev => [...prev, liaResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
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
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"
              ></motion.div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{t('chatbot.title')}</h1>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100/50">LIA AI</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{t('chatbot.subtitle')}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => {
                const lines = messages.map(m => {
                  const who = m.type === 'user' ? t('chatbot.user_label') : t('chatbot.title');
                  const tStr = m.timestamp.toLocaleString(currentLang === 'ar' ? 'ar-DZ' : currentLang === 'en' ? 'en-US' : 'fr-FR');
                  return `[${tStr}] ${who}: ${m.content}`;
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
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              title={t('chatbot.tooltips.export')}
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowPlan(v => !v)}
              className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              title={t('chatbot.tooltips.clipboard')}
            >
              <ClipboardDocumentCheckIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Zone de messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-gradient-to-b from-[#f8fafc] to-white scrollbar-hide">
        <div className="max-w-4xl mx-auto w-full space-y-8 pb-10">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className={`flex w-full ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`relative group transition-all duration-500 ${
                    message.type === 'user'
                      ? 'max-w-[80%] bg-slate-900 text-white px-6 py-4 rounded-3xl rounded-tr-none shadow-xl border border-white/10'
                      : 'w-full max-w-4xl bg-white border border-slate-200/60 rounded-[2rem] rounded-tl-none shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] overflow-hidden'
                  }`}
                >
                  {message.type === 'lia' && (
                    <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform">
                          <SparklesIcon className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase leading-none mb-1">
                            {t('chatbot.subtitle')}
                          </p>
                          <h2 className="text-sm font-bold text-slate-900">{t('chatbot.strategic_assistant')}</h2>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('chatbot.secure_session')} ID: 0x{message.id.slice(-4)}</span>
                      </div>
                    </div>
                  )}

                  <div className={`px-8 py-6 ${message.type === 'user' ? 'px-6 py-4' : ''}`}>
                    {/* Gestion du rendu structuré pour LIA */}
                    {message.type === 'lia' ? (
                      <div className="space-y-6">
                        {/* On splitte le contenu pour extraire les puces et les styliser en cartes */}
                        <div className="text-slate-800 text-[16px] leading-relaxed font-medium">
                          {parseMarkdown(message.content.split('\n\n')[0])}
                          {message.content.split('\n\n')[1] && (
                            <div className="mt-2 text-slate-500 font-normal">
                              {parseMarkdown(message.content.split('\n\n')[1])}
                            </div>
                          )}
                        </div>

                        {/* Détection et rendu des cartes de capacités (Grid) */}
                        {message.content.includes('•') && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            {message.content.split('\n')
                              .filter(line => line.includes('•'))
                              .map((capability, idx) => {
                                const [title, desc] = capability.replace('• ', '').split(':');
                                return (
                                  <motion.div 
                                    key={idx}
                                    whileHover={{ y: -5, borderColor: '#6366f1' }}
                                    onClick={() => handleSuggestionClick(title.replace(/\*\*/g, '').trim())}
                                    className="p-5 bg-white border border-slate-200/60 rounded-2xl transition-all group/card cursor-pointer shadow-sm hover:shadow-md"
                                  >
                                    <div className="flex items-start gap-4">
                                      <div className="mt-1 p-2 bg-white rounded-lg shadow-sm group-hover/card:bg-slate-900 group-hover/card:text-white transition-colors">
                                        <ChevronRightIcon className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">
                                          {title.replace(/\*\*/g, '').trim()}
                                        </h4>
                                        <p className="text-xs text-slate-500 leading-normal">{parseMarkdown(desc?.trim() || '')}</p>
                                      </div>
                                    </div>
                                  </motion.div>
                                );
                              })
                            }
                          </div>
                        )}

                        {/* Reste du message (la question finale) */}
                        {message.content.split('\n\n').length > 2 && (
                          <div className="pt-4 border-t border-slate-50">
                            <p className="text-sm font-bold text-slate-900 italic tracking-tight text-right">
                              {parseMarkdown(message.content.split('\n\n').slice(-1)[0])}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[15px] font-medium leading-relaxed whitespace-pre-wrap">
                        {parseMarkdown(message.content)}
                      </div>
                    )}

                    {/* Meta data (Time) */}
                    <div className={`flex items-center gap-2 text-[9px] font-black mt-6 tracking-widest uppercase opacity-40 ${
                      message.type === 'user' ? 'text-white' : 'text-slate-900'
                    }`}>
                      <ClockIcon className="h-3 w-3" />
                      {message.timestamp.toLocaleTimeString(currentLang === 'ar' ? 'ar-DZ' : currentLang === 'en' ? 'en-US' : 'fr-FR', {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {/* Quick Actions Premium */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="bg-slate-50/30 px-8 py-6 border-t border-slate-100/60 flex flex-wrap gap-2">
                       {message.suggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.02, backgroundColor: '#0f172a', color: '#fff' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="px-5 py-2.5 text-[11px] font-black uppercase tracking-widest bg-white border border-slate-200 text-slate-600 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Indicateur de frappe modernisé */}
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-slate-200/60 rounded-[1.5rem] rounded-tl-none px-6 py-4 shadow-xl shadow-slate-100">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center">
                    <SparklesIcon className="h-3 w-3 text-indigo-300" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase italic">{t('chatbot.typing')}</span>
                </div>
                <div className="flex space-x-1.5 ml-1">
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="w-1.5 h-1.5 bg-indigo-500 rounded-full"
                  ></motion.div>
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                  ></motion.div>
                  <motion.div 
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    className="w-1.5 h-1.5 bg-slate-300 rounded-full"
                  ></motion.div>
                </div>
              </div>
            </motion.div>
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
              <h2 className="text-lg font-bold text-slate-900">{t('chatbot.plan_title')}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  seedPlanFromAnalysis();
                }}
                disabled={!canEditPlan}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${canEditPlan ? 'border-slate-200 text-slate-700 hover:bg-slate-50' : 'border-slate-100 text-slate-300 cursor-not-allowed'}`}
                title={canEditPlan ? t('chatbot.auto_generate') : 'Permission requise: rapports-create'}
              >
                {t('chatbot.auto_generate')}
              </button>
              <button
                onClick={() => setShowPlan(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              >
                {t('chatbot.close')}
              </button>
            </div>
          </div>

          <div className="max-w-5xl mx-auto w-full">
            {/* Formulaire d'ajout rapide */}
            <div className="bg-slate-50/50 p-4 rounded-2xl mb-6 grid grid-cols-1 md:grid-cols-12 gap-3 items-end border border-slate-100">
              <div className="col-span-12 md:col-span-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">{t('chatbot.action')}</label>
                <input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  disabled={!canEditPlan}
                  className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                  placeholder="Ex: Accélérer le recouvrement"
                />
              </div>
              <div className="col-span-12 md:col-span-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">{t('chatbot.owner')}</label>
                <input
                  value={draftOwner}
                  onChange={(e) => setDraftOwner(e.target.value)}
                  disabled={!canEditPlan}
                  className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                  placeholder="Ex: Direction Financière"
                />
              </div>
              <div className="col-span-12 md:col-span-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 ml-1">{t('chatbot.due_date')}</label>
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
                  {t('chatbot.add_btn')}
                </button>
              </div>
            </div>

            {/* Liste des actions style Table */}
            <div className="space-y-3">
              {plan.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-medium italic">
                  {t('chatbot.no_tasks')}
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
                        <option value="todo">{t('chatbot.todo')}</option>
                        <option value="in-progress">{t('chatbot.in_progress')}</option>
                        <option value="done">{t('chatbot.done')}</option>
                      </select>
                    </div>
                    <button
                      onClick={() => deleteAction(item.id)}
                      disabled={!canEditPlan}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <SparklesIcon className="h-4 w-4 rotate-45" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Zone de saisie premium */}
      <div className="p-4 md:p-8 bg-white border-t border-slate-100/60 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.03)]">
        <div className="max-w-4xl mx-auto w-full">
          {/* Suggestions rapides stylisées avec Framer Motion */}
          <div className="mb-8 flex flex-wrap gap-2.5 justify-center">
            {[
              { key: 'sales', label: t('chatbot.suggestions.sales') },
              { key: 'ratios', label: t('chatbot.suggestions.ratios') },
              { key: 'recommendations', label: t('chatbot.suggestions.recommendations') },
              { key: 'forecasts', label: t('chatbot.suggestions.forecasts') }
            ].map((suggestion, idx) => (
              <motion.button
                key={suggestion.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                whileHover={{ y: -3, backgroundColor: '#0f172a', color: '#fff' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSuggestionClick(t('chatbot.placeholders.ask_about', { item: suggestion.label.toLowerCase() }) || `Comment vont mes ${suggestion.label.toLowerCase()} ?`)}
                className="group px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl transition-all shadow-sm flex items-center gap-2.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 group-hover:bg-indigo-400"></div>
                {suggestion.label}
              </motion.button>
            ))}
          </div>

          <div className="relative group flex items-center gap-4">
            <button
              className="p-3 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
              title={t('chatbot.tooltips.attachment')}
            >
              <PaperClipIcon className="h-6 w-6" />
            </button>

            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('chatbot.placeholders.ask')}
                className="w-full pl-7 pr-16 py-5 md:py-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 outline-none text-[15px] font-medium text-slate-800 transition-all placeholder:text-slate-400 placeholder:font-normal"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-slate-900 text-indigo-300 rounded-full hover:bg-black disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-200"
                aria-label="Envoyer le message"
                title="Envoyer"
              >
                <PaperAirplaneIcon className="h-6 w-6" />
              </motion.button>
            </div>

            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-4 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-[1.5rem] transition-all hidden md:block" 
              aria-label="Activer le micro" 
              title="Activer le micro"
            >
              <MicrophoneIcon className="h-6 w-6" />
            </motion.button>
          </div>

          <p className="mt-5 text-[9px] font-bold text-center text-slate-400 tracking-[0.2em] uppercase">
            {t('chatbot.disclaimer')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatbotLIA;
