import React, { useState, useRef, useEffect } from 'react';
import {
  SparklesIcon,
  PaperAirplaneIcon,
  MicrophoneIcon,
  PaperClipIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';
import aiService from '../../services/aiService';
import { computeRatios } from '../../utils/ratios';
import { getBenchmarks } from '../../utils/benchmarks';
import { generateRatioAlerts } from '../../utils/ratioAlerts';
import { logAction } from '../../utils/ActivityLog';
import { usePermission } from '../../hooks/usePermission';
import {
  comparePeriods,
  detectAnomalies,
  analyzeScenario,
  benchmarkAnalysis,
  generateFinancialSummary
} from '../../utils/financialAnalysis';
import {
  forecastCashFlow,
  forecastRevenue,
  detectSeasonalPattern,
  generatePredictiveAlerts,
  generatePredictiveScenarios,
  calculateFinancialRisk,
  PredictiveAlert,
  PredictiveScenario
} from '../../utils/predictiveAnalysis';

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

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'lia',
      content: 'Bienvenue, je suis LIA (assistant décisionnel avec analyse prédictive avancée).\n\nJe peux vous aider à analyser vos données financières, générer des prévisions et identifier les opportunités d\'optimisation.\n\nNOUVELLES FONCTIONNALITÉS:\n• Prévisions de trésorerie (13 semaines) avec alertes prédictives\n• Prévisions de CA (12 mois) basées sur les tendances historiques\n• Scénarios prédictifs multiples (optimiste/réaliste/pessimiste)\n• Détection de patterns saisonniers dans vos données\n• Analyse de risque financier avec scoring\n\nCommandes disponibles:\n/previsions - Prévisions de trésorerie 13 semaines\n/scenarios - Scénarios prédictifs\n/prevision-ca - Prévisions de CA 12 mois\n/saisonnier - Détection de patterns saisonniers\n/analyse - Analyse financière complète\n/plan - Plan d\'actions priorisé',
      timestamp: new Date(),
      suggestions: [
        'Prévisions de trésorerie (13 semaines)',
        'Scénarios prédictifs',
        'Prévisions de CA (12 mois)',
        'Détecter les patterns saisonniers',
        'Analyse financière complète'
      ]
    }
  ]);
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
    const turnover = companyData?.stockTurnover && companyData.stockTurnover > 0 ? companyData.stockTurnover : 8;
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
    const monthRevenue = companyData?.revenueMonth ?? 650000;
    const invoices = companyData?.invoicesCount ?? 28;
    const avgInvoice = companyData?.averageInvoice ?? monthRevenue / Math.max(invoices, 1);
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
    try {
      // Direct API call to the new AI chat endpoint
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/v1/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: userMessage,
          company_id: user?.companyId
        })
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();

      return {
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
    } catch (error) {
      console.error('Chatbot API Error:', error);
      return {
        id: Date.now().toString(),
        type: 'lia',
        content: "Désolé, je rencontre une difficulté de connexion avec mon module d'intelligence artificielle. Veuillez réessayer dans quelques instants.",
        timestamp: new Date()
      };
    } finally {
      setIsTyping(false);
    }
  };
  // Prévisions trésorerie améliorées avec analyse prédictive
  const wantsForecast =
    message.includes('/previsions') ||
    message.includes('/forecast') ||
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
    lines.push(`PRÉVISIONS DE TRÉSORERIE (13 semaines)`);
    lines.push(`Profil: ${companyType.toUpperCase()} • Segment: ${segment}`);
    lines.push('');
    lines.push('─'.repeat(60));
    lines.push('');

    forecasts.forEach((f, idx) => {
      const date = new Date(f.date);
      const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
      const confidenceLabel = getConfidenceLabel(f.confidence);
      const trendLabel = getTrendLabel(f.trend ?? 'stable');
      const isCritical = criticalWeeks.some(cw => cw.date === f.date);
      const riskLabel = isCritical ? '[ALERTE]' : '';

      lines.push(`${f.period} (${dateStr})`);
      lines.push(`  Solde prévu: ${formatCurrency(f.value)}`);
      lines.push(`  Tendance: ${trendLabel}`);
      lines.push(`  Confiance: ${confidenceLabel}`);
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

    lines.push('─'.repeat(60));
    lines.push('');
    lines.push(`ANALYSE DE RISQUE FINANCIER`);
    lines.push(`Niveau de risque: ${getRiskLabel(riskAnalysis.overallRisk)}`);
    lines.push(`Score de risque: ${riskAnalysis.score}/100`);
    lines.push('');
    lines.push('Facteurs analysés:');
    riskAnalysis.factors.forEach(factor => {
      lines.push(`  • ${factor.factor}: ${getRiskLabel(factor.risk)} (Impact: ${factor.impact} points)`);
      lines.push(`    ${factor.description}`);
    });
    lines.push('');
    lines.push('Recommandation:');
    lines.push(riskAnalysis.recommendation);
    lines.push('');

    const content = lines.join('\n');
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
    (message.includes('scénario') && (message.includes('prédictif') || message.includes('predictif'))) ||
    (message.includes('scenario') && message.includes('predictive'));

  if (wantsScenarios) {
    const revM = companyData?.revenueMonth ?? 1200000;
    const revY = revM * 12;
    const margin = companyData?.profitMargin ?? 18;
    const cash = companyData?.cashBalance ?? Math.round(revM * 0.8);
    const ar = companyData?.accountsReceivable ?? Math.round(revM * 1.5);
    const dso = Math.round((ar / revM) * 30);
    const dio = companyData?.stockTurnover ? Math.round(365 / companyData.stockTurnover) : 45;
    const ap = companyData?.accountsPayable ?? Math.round(revM * 0.8);
    const dpo = Math.round((ap / (revM * (1 - margin / 100))) * 30);

    const scenarios = generatePredictiveScenarios({
      revenue: revY,
      margin,
      cash,
      dso,
      dio,
      dpo
    });

    const lines: string[] = [];
    lines.push(`SCÉNARIOS PRÉDICTIFS (6 mois)`);
    lines.push(`Profil: ${companyType.toUpperCase()} • Segment: ${segment}`);
    lines.push('');
    lines.push('─'.repeat(60));
    lines.push('');

    scenarios.forEach((scenario, idx) => {
      const probLabel = scenario.probability >= 50 ? '[PROBABILITE ELEVEE]' : scenario.probability >= 30 ? '[PROBABILITE MOYENNE]' : '[PROBABILITE FAIBLE]';
      lines.push(`${scenario.name.toUpperCase()} ${probLabel}`);
      lines.push(`Probabilité: ${scenario.probability}%`);
      lines.push(`Description: ${scenario.description}`);
      lines.push(`Horizon: ${scenario.timeframe}`);
      lines.push('');

      lines.push('Projections des métriques clés:');
      if (scenario.metrics.revenue) {
        const revChangeNum = Number(scenario.metrics.revenue.change);
        const revChange = ((revChangeNum / scenario.metrics.revenue.current) * 100).toFixed(1);
        lines.push(`  • Chiffre d'affaires: ${formatCurrency(scenario.metrics.revenue.current)} → ${formatCurrency(scenario.metrics.revenue.projected)}`);
        lines.push(`    Variation: ${Number(revChange) > 0 ? '+' : ''}${revChange}% (${formatCurrency(revChangeNum)})`);
      }
      if (scenario.metrics.margin) {
        const marginChangeNum = Number(scenario.metrics.margin.change);
        const marginChange = marginChangeNum.toFixed(1);
        lines.push(`  • Marge bénéficiaire: ${scenario.metrics.margin.current.toFixed(1)}% → ${scenario.metrics.margin.projected.toFixed(1)}%`);
        lines.push(`    Variation: ${marginChangeNum > 0 ? '+' : ''}${marginChange} points`);
      }
      if (scenario.metrics.cash) {
        const cashChangeNum = Number(scenario.metrics.cash.change);
        const cashChange = ((cashChangeNum / scenario.metrics.cash.current) * 100).toFixed(1);
        lines.push(`  • Trésorerie: ${formatCurrency(scenario.metrics.cash.current)} → ${formatCurrency(scenario.metrics.cash.projected)}`);
        lines.push(`    Variation: ${Number(cashChange) > 0 ? '+' : ''}${cashChange}% (${formatCurrency(cashChangeNum)})`);
      }
      if (scenario.metrics.dso) {
        const dsoChangeNum = Number(scenario.metrics.dso.change);
        const dsoChange = dsoChangeNum.toFixed(0);
        lines.push(`  • DSO (Délai de recouvrement): ${scenario.metrics.dso.current}j → ${scenario.metrics.dso.projected}j`);
        lines.push(`    Variation: ${dsoChangeNum > 0 ? '+' : ''}${dsoChange} jours`);
      }

      lines.push('');
      lines.push('Hypothèses principales:');
      scenario.assumptions.forEach((ass, i) => {
        lines.push(`  ${i + 1}. ${ass}`);
      });
      lines.push('');

      if (scenario.risks.length > 0) {
        lines.push('Risques identifiés:');
        scenario.risks.forEach((risk, i) => {
          lines.push(`  ${i + 1}. ${risk}`);
        });
        lines.push('');
      }

      if (scenario.opportunities.length > 0) {
        lines.push('Opportunités potentielles:');
        scenario.opportunities.forEach((opp, i) => {
          lines.push(`  ${i + 1}. ${opp}`);
        });
        lines.push('');
      }

      if (idx < scenarios.length - 1) {
        lines.push('─'.repeat(60));
        lines.push('');
      }
    });

    const content = lines.join('\n');
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

    const lines: string[] = [];
    lines.push(`PRÉVISIONS DE CHIFFRE D'AFFAIRES (12 mois)`);
    lines.push(`Profil: ${companyType.toUpperCase()} • Segment: ${segment}`);
    lines.push('');
    lines.push('─'.repeat(60));
    lines.push('');

    forecasts.forEach((f, idx) => {
      const date = new Date(f.date);
      const dateStr = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      const confidenceLabel = getConfidenceLabel(f.confidence);
      const trendLabel = getTrendLabel(f.trend ?? 'stable');

      lines.push(`${f.period} - ${dateStr}`);
      lines.push(`  CA prévu: ${formatCurrency(f.value)}`);
      lines.push(`  Tendance: ${trendLabel}`);
      lines.push(`  Confiance: ${confidenceLabel}`);
      if (f.min && f.max) {
        lines.push(`  Intervalle de confiance: ${formatCurrency(f.min)} - ${formatCurrency(f.max)}`);
      }
      lines.push('');
    });

    // Calculer la croissance moyenne
    const avgGrowth = forecasts.length > 0
      ? ((forecasts[forecasts.length - 1].value - forecasts[0].value) / forecasts[0].value) * 100
      : 0;

    lines.push('─'.repeat(60));
    lines.push('');
    lines.push(`CROISSANCE MOYENNE PRÉVUE SUR 12 MOIS`);
    lines.push(`Variation totale: ${avgGrowth > 0 ? '+' : ''}${avgGrowth.toFixed(1)}%`);
    if (avgGrowth > 0) {
      lines.push(`Évolution: Croissance positive prévue`);
    } else if (avgGrowth < 0) {
      lines.push(`Évolution: Baisse prévue - Action recommandée`);
    } else {
      lines.push(`Évolution: Stabilité prévue`);
    }
    lines.push('');

    const content = lines.join('\n');
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

    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    const lines: string[] = [];
    lines.push(`DÉTECTION DE PATTERNS SAISONNIERS`);
    lines.push(`Profil: ${companyType.toUpperCase()} • Segment: ${segment}`);
    lines.push('');
    lines.push('─'.repeat(60));
    lines.push('');
    lines.push(pattern.description);
    lines.push('');

    if (pattern.peakMonth !== undefined && pattern.lowMonth !== undefined) {
      lines.push('Analyse saisonnière:');
      lines.push(`  • Période de pic: ${monthNames[pattern.peakMonth]}`);
      lines.push(`  • Période de creux: ${monthNames[pattern.lowMonth]}`);
      lines.push(`  • Facteur de saisonnalité: ${(pattern.seasonalityFactor * 100).toFixed(1)}%`);
      lines.push('');
    }

    lines.push('─'.repeat(60));
    lines.push('');
    lines.push('RECOMMANDATIONS STRATÉGIQUES:');
    lines.push('');
    if (pattern.seasonalityFactor > 0.3) {
      lines.push('Saisonnalité marquée détectée:');
      lines.push('  1. Planifier les stocks en fonction des pics saisonniers');
      lines.push('  2. Ajuster la trésorerie pour les périodes creuses');
      lines.push('  3. Lancer des campagnes marketing avant les pics');
      lines.push('  4. Négocier des délais de paiement flexibles avec les fournisseurs');
      lines.push('  5. Mettre en place un fonds de roulement adaptatif');
    } else {
      lines.push('Saisonnalité faible détectée:');
      lines.push('  1. Activité relativement stable - focus sur l\'optimisation continue');
      lines.push('  2. Moins de risque de saisonnalité, mais surveiller les tendances long terme');
      lines.push('  3. Maintenir une trésorerie constante');
    }

    const content = lines.join('\n');
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
      `Plan d’actions priorisé — Profil: ${companyType.toUpperCase()} • ${segment} • ${sectorLabel}`,
      '',
      ...tasks.map((t, i) => `${i + 1}. ${t.titre} — Resp: ${t.resp} — Échéance: ${t.delai}\n   Détail: ${t.detail}`),
      '',
      'Suivi: statut hebdo, responsable, date cible, impact (DSO/DPO/DIO/CCC).'
    ].join('\n');
    return {
      id: Date.now().toString(),
      type: 'lia',
      content,
      timestamp: new Date(),
      suggestions: ['Prévisions trésorerie (13 semaines)', 'Analyse financière', 'Générer le plan depuis l’analyse', 'Exporter la conversation']
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
    message.includes('irrégularité');

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
    (message.includes('analyse') && (message.includes('financ') || message.includes('trésorerie') || message.includes('tresorerie')));

  if (wantsFinancialAnalysis) {
    // Données (avec valeurs de repli)
    const revM = companyData?.revenueMonth ?? 1200000;
    const profitPct = companyData?.profitMargin ?? 18; // % marge
    const cash = companyData?.cashBalance ?? Math.round(revM * 0.8);
    const ar = companyData?.accountsReceivable ?? Math.round(revM * 1.5);
    const ap = companyData?.accountsPayable ?? Math.round(revM * 0.8);
    const invValue = companyData?.inventoryValue ?? Math.round(revM * 1.2);
    const turnover = companyData?.stockTurnover && companyData.stockTurnover > 0 ? companyData.stockTurnover : 8; // fois/an
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

    const content = [
      `Analyse financière — version détaillée (Profil: ${companyType.toUpperCase()} • ${segment} • ${sectorLabel})`,
      '',
      'Résumé exécutif',
      `• CA mensuel: ${money(revM)} | Marge: ${marge.toFixed(1)}%`,
      `• Trésorerie: ${money(cash)} | CCC: ${ccc} j (${cccLabel})`,
      `• BFR: ${money(bfr)} (stocks + clients − fournisseurs)`,
      '',
      'Ratios & benchmarks',
      `• Liquidité générale: ${liquiditeGenerale.toFixed(2)} (cible ≥ ${bm.liqGenMin.toFixed(2)})`,
      `• Liquidité immédiate: ${liquiditeImmediate.toFixed(2)} (cible ≥ ${bm.liqQuickMin.toFixed(2)})`,
      `• DSO: ${dso} j (cible ≤ ${bm.dsoMax} j) | DIO: ${dio} j (cible ≤ ${bm.dioMax} j) | DPO: ${dpo} j (cible ≥ ${bm.dpoMin} j)`,
      `• CCC: ${ccc} j (plus bas = mieux)`,
      `• ROE: ${ratiosAdv.roePct}% | ROA: ${ratiosAdv.roaPct}% | EBITDA: ${ratiosAdv.ebitdaMarginPct}% | Quick: ${liquiditeImmediate.toFixed(2)}`,
      ratiosAdv.netDebtToEbitda !== null ? `• Net Debt/EBITDA: ${ratiosAdv.netDebtToEbitda}` : '',
      typeof ratiosAdv.interestCoverage === 'number' || ratiosAdv.interestCoverage === '∞' ? `• Couverture intérêts: ${ratiosAdv.interestCoverage}x` : '',
      ratiosAdv.solvencyAssetsToDebt ? `• Solvabilité A/D: ${ratiosAdv.solvencyAssetsToDebt}` : '',
      '',
      alerts.length ? 'Diagnostic' : 'Diagnostic: aucune alerte majeure détectée.',
      ...alerts.map(a => `- ${a}`),
      '',
      summary.anomalies.length > 0 ? '[ALERTE] Anomalies détectées:' : '',
      ...summary.anomalies.map(a => `- ${a.metric}: ${a.explanation} (${a.severity === 'high' ? '[CRITIQUE]' : a.severity === 'medium' ? '[MOYEN]' : '[FAIBLE]'})`),
      summary.anomalies.length > 0 ? '' : '',
      summary.insights.length > 0 ? 'INSIGHTS:' : '',
      ...summary.insights,
      summary.insights.length > 0 ? '' : '',
      summary.priorities.length > 0 ? 'PRIORITÉS:' : '',
      ...summary.priorities,
      summary.priorities.length > 0 ? '' : '',
      'Pourquoi c’est important',
      '• Un CCC élevé consomme du cash. Le driver principal est souvent le DSO ou le DIO.',
      '• Le BFR positif immobilise la trésorerie; l’objectif est de le réduire sans casser l’activité.',
      '',
      recs.length ? 'Actions prioritaires (30–60 jours)' : 'Actions: poursuivre le suivi mensuel, pas de correction urgente.',
      ...recs.map(r => `- ${r}`),
      '',
      'Impacts (ordre de grandeur)',
      `• DSO −10 j → +${money(impactDSO10)} de cash libéré`,
      `• DIO −5 j → +${money(impactDIO5)} de cash libéré`,
      `• DPO +10 j → +${money(impactDPO10)} de cash temporisé`,
      `• Total potentiel → +${money(impactTotal)} (court terme)`,
      '',
      'Formules (référence)',
      '• $DSO = \\dfrac{Créances~Clients}{Ventes~journalières}$ ; $CCC = DSO + DIO - DPO$',
      '• $Liquidité~générale = \\dfrac{Actifs~circulants}{Passifs~circulants}$ ; $Liquidité~immédiate = \\dfrac{Trésorerie + Créances}{Passifs~circulants}$',
      '• $BFR = Stocks + Créances - Fournisseurs$',
      '',
      'Pistes d’industrialisation (ERP)',
      ...erp.map(e => `- ${e}`),
      '',
      'العربية (خلاصة): دورة التحويل مرتفعة نسبيًا؛ الأَوْلَى تسريع التحصيل وخفض المخزون البطيء وزيادة آجال الموردين.'
    ].join('\n');

    return {
      id: Date.now().toString(),
      type: 'lia',
      content,
      timestamp: new Date(),
      suggestions: ['Générer le plan depuis l’analyse', 'Voir plan d’actions', 'Prévisions trésorerie (13 semaines)', 'Exporter la conversation']
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
    const turnover = companyData?.stockTurnover && companyData.stockTurnover > 0 ? companyData.stockTurnover : 6.5;
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

  // Dernier recours
  return {
    id: Date.now().toString(),
    type: 'lia',
    content: `Je peux analyser: ventes, ratios financiers, recommandations, prévisions, trésorerie, catégorisation, et bien plus. Utilisez les commandes spéciales:\n\n• /analyse — Analyse financière complète\n• /plan — Plan d'actions\n• /previsions — Prévisions trésorerie 13 semaines\n• /categoriser — Catégorisation automatique\n• /recommandations — Recommandations contextuelles\n\nReformulez votre question pour un résultat précis.`,
    timestamp: new Date(),
    suggestions: ['Comment vont mes ventes ?', 'Quels sont mes ratios ?', 'Avez-vous des recommandations ?', 'Montrez-moi mes prévisions']
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
  <div className="h-screen flex flex-col bg-slate-50">
    {/* En-tête du chatbot */}
    <div className="bg-white border-b border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-800 rounded-full flex items-center justify-center shadow-md">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">LIA </h1>
            <p className="text-sm text-slate-600">Chatbot Intelligence Décisionnelle</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
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
            className={`p-2 rounded-full ${canExport ? 'text-slate-600 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-300 cursor-not-allowed'}`}
            aria-label="Exporter la conversation"
            title={canExport ? 'Exporter la conversation' : 'Permission requise: export-data'}
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowPlan(v => !v)}
            className="px-3 py-1 text-xs border border-slate-300 text-slate-700 rounded-full hover:bg-slate-100"
            title="Ouvrir le plan d’actions"
          >
            Plan d’actions
          </button>
          <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" aria-hidden="true"></div>
          <span className="text-sm text-slate-600 font-medium">En ligne</span>
        </div>
      </div>
    </div>

    {/* Zone de messages */}
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${message.type === 'user'
                ? 'bg-slate-600 text-white'
                : 'bg-white text-slate-900 border border-slate-200'
              }`}
          >
            {message.type === 'lia' && (
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-6 h-6 bg-gradient-to-r from-slate-600 to-slate-800 rounded-full flex items-center justify-center shadow-sm">
                  <SparklesIcon className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs font-medium text-slate-600">LIA</span>
              </div>
            )}

            <div className="whitespace-pre-line text-sm">
              {message.content}
            </div>

            <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-slate-200' : 'text-slate-500'
              }`}>
              {message.timestamp.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>

            {/* Suggestions */}
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="block w-full text-left px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors border border-slate-200 hover:border-slate-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Indicateur de frappe */}
      {isTyping && (
        <div className="flex justify-start">
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-slate-600 to-slate-800 rounded-full flex items-center justify-center shadow-sm">
                <SparklesIcon className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs text-slate-600 font-medium">LIA écrit...</span>
            </div>
            <div className="flex space-x-1 mt-2">
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce animation-delay-100"></div>
              <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce animation-delay-200"></div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>

    {/* Plan d’actions (panel) */}
    {showPlan && (
      <div className="bg-white border-t border-slate-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">Plan d’actions</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const res = seedPlanFromAnalysis();
                // Optionnel: feedback discret si pas de permission
              }}
              disabled={!canEditPlan}
              className={`px-3 py-1 text-xs rounded-full border ${canEditPlan ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-slate-200 text-slate-300 cursor-not-allowed'}`}
              title={canEditPlan ? 'Générer depuis l’analyse (actions suggérées)' : 'Permission requise: rapports-create'}
            >
              Générer depuis l’analyse
            </button>
            <button
              onClick={seedDemoPlan}
              disabled={!canEditPlan}
              className={`px-3 py-1 text-xs rounded-full border ${canEditPlan ? 'border-slate-300 text-slate-700 hover:bg-slate-100' : 'border-slate-200 text-slate-300 cursor-not-allowed'}`}
              title={canEditPlan ? 'Importer le plan de démo' : 'Permission requise: rapports-create'}
            >
              Importer démo
            </button>
            <button
              onClick={() => setShowPlan(false)}
              className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-full border border-slate-300"
            >
              Fermer
            </button>
          </div>
        </div>

        {/* Add row */}
        <div className="grid grid-cols-12 gap-2 items-end mb-3">
          <div className="col-span-4">
            <label className="block text-xs text-slate-600 mb-1">Titre</label>
            <input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              disabled={!canEditPlan}
              className={`w-full px-3 py-2 text-sm border rounded-md ${canEditPlan ? 'border-slate-300 focus:ring-2 focus:ring-slate-500' : 'border-slate-200 bg-slate-50 text-slate-400'}`}
              placeholder="Ex: Accélérer encaissements (DSO)"
              title={canEditPlan ? '' : 'Permission requise: rapports-create'}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-600 mb-1">Responsable</label>
            <input
              value={draftOwner}
              onChange={(e) => setDraftOwner(e.target.value)}
              disabled={!canEditPlan}
              className={`w-full px-3 py-2 text-sm border rounded-md ${canEditPlan ? 'border-slate-300 focus:ring-2 focus:ring-slate-500' : 'border-slate-200 bg-slate-50 text-slate-400'}`}
              placeholder="Ex: Resp. Recouvrement"
              title={canEditPlan ? '' : 'Permission requise: rapports-create'}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-slate-600 mb-1">Échéance</label>
            <input
              type="date"
              value={draftDue}
              onChange={(e) => setDraftDue(e.target.value)}
              disabled={!canEditPlan}
              className={`w-full px-3 py-2 text-sm border rounded-md ${canEditPlan ? 'border-slate-300 focus:ring-2 focus:ring-slate-500' : 'border-slate-200 bg-slate-50 text-slate-400'}`}
              title={canEditPlan ? '' : 'Permission requise: rapports-create'}
            />
          </div>
          <div className="col-span-3">
            <label className="block text-xs text-slate-600 mb-1">Note</label>
            <input
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
              disabled={!canEditPlan}
              className={`w-full px-3 py-2 text-sm border rounded-md ${canEditPlan ? 'border-slate-300 focus:ring-2 focus:ring-slate-500' : 'border-slate-200 bg-slate-50 text-slate-400'}`}
              placeholder="Détails et hypothèses"
              title={canEditPlan ? '' : 'Permission requise: rapports-create'}
            />
          </div>
          <div className="col-span-1">
            <button
              onClick={addAction}
              disabled={!canEditPlan || !draftTitle.trim()}
              className={`w-full px-3 py-2 text-xs rounded-md ${canEditPlan && draftTitle.trim() ? 'bg-slate-600 text-white hover:bg-slate-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              title={canEditPlan ? 'Ajouter une action' : 'Permission requise: rapports-create'}
            >
              Ajouter
            </button>
          </div>
        </div>

        {/* List */}
        <div className="space-y-2">
          {plan.length === 0 && (
            <div className="text-sm text-slate-600">Aucune action pour le moment.</div>
          )}
          {plan.map(item => (
            <div key={item.id} className="border border-slate-200 rounded-md p-3">
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <input
                    value={item.title}
                    onChange={e => updateAction(item.id, { title: e.target.value })}
                    disabled={!canEditPlan}
                    className={`w-full px-3 py-2 text-sm border rounded-md ${canEditPlan ? 'border-slate-300 focus:ring-2 focus:ring-slate-500' : 'border-slate-200 bg-slate-50 text-slate-500'}`}
                    title={canEditPlan ? '' : 'Permission requise: rapports-create'}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    value={item.owner}
                    onChange={e => updateAction(item.id, { owner: e.target.value })}
                    disabled={!canEditPlan}
                    className={`w-full px-3 py-2 text-sm border rounded-md ${canEditPlan ? 'border-slate-300 focus:ring-2 focus:ring-slate-500' : 'border-slate-200 bg-slate-50 text-slate-500'}`}
                    title={canEditPlan ? '' : 'Permission requise: rapports-create'}
                  />
                </div>
                <div className="col-span-2">
                  <input
                    type="date"
                    value={item.due}
                    onChange={e => updateAction(item.id, { due: e.target.value })}
                    disabled={!canEditPlan}
                    className={`w-full px-3 py-2 text-sm border rounded-md ${canEditPlan ? 'border-slate-300 focus:ring-2 focus:ring-slate-500' : 'border-slate-200 bg-slate-50 text-slate-500'}`}
                    title={canEditPlan ? '' : 'Permission requise: rapports-create'}
                  />
                </div>
                <div className="col-span-2">
                  <select
                    value={item.status}
                    onChange={e => updateAction(item.id, { status: e.target.value as ActionStatus }, 'status-change')}
                    disabled={!canEditPlan}
                    className={`w-full px-3 py-2 text-sm border rounded-md ${canEditPlan ? 'border-slate-300 focus:ring-2 focus:ring-slate-500 bg-white' : 'border-slate-200 bg-slate-50 text-slate-500'}`}
                    title={canEditPlan ? '' : 'Permission requise: rapports-create'}
                  >
                    <option value="todo">À faire</option>
                    <option value="in-progress">En cours</option>
                    <option value="done">Terminé</option>
                  </select>
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => deleteAction(item.id)}
                    disabled={!canEditPlan}
                    className={`px-3 py-2 text-xs rounded-md ${canEditPlan ? 'border border-slate-300 text-slate-700 hover:bg-slate-100' : 'border border-slate-200 text-slate-300 cursor-not-allowed'}`}
                    title={canEditPlan ? 'Supprimer' : 'Permission requise: rapports-create'}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              {item.note && (
                <div className="mt-2 text-xs text-slate-600">{item.note}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Zone de saisie */}
    <div className="bg-white border-t border-slate-200 p-4 shadow-sm">
      <div className="flex items-center space-x-3">
        <button className="p-2 text-slate-500 hover:text-slate-700 transition-colors hover:bg-slate-100 rounded-full" aria-label="Joindre un fichier" title="Joindre un fichier">
          <PaperClipIcon className="h-5 w-5" />
        </button>

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question à LIA..."
            className="w-full px-4 py-3 border border-slate-300 rounded-full focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none bg-slate-50 focus:bg-white transition-colors"
          />
        </div>

        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
          className="p-2 bg-slate-600 text-white rounded-full hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors shadow-sm"
          aria-label="Envoyer le message"
          title="Envoyer"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>

        <button className="p-2 text-slate-500 hover:text-slate-700 transition-colors hover:bg-slate-100 rounded-full" aria-label="Activer le micro" title="Activer le micro">
          <MicrophoneIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Suggestions rapides */}
      <div className="mt-3 flex flex-wrap gap-2">
        {['Ventes', 'Ratios', 'Recommandations', 'Prévisions'].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => handleSuggestionClick(`Comment vont mes ${suggestion.toLowerCase()} ?`)}
            className="px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors border border-slate-200 hover:border-slate-300 font-medium"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  </div>
);
};

export default ChatbotLIA;
