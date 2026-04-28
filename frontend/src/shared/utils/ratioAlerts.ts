import { Benchmarks } from './benchmarks';

interface BaseRatios {
  dso: number; dio: number; dpo: number; ccc: number; liqGen: number; liqQuick: number; marginPct: number; turnover: number;
}
interface AdvancedRatios {
  roePct: number; roaPct: number; ebitdaMarginPct: number; netDebtToEbitda: number | null; interestCoverage: number | string | null; autonomyPct: number; solvencyAssetsToDebt: number | null; supplierRotationX?: number | null; basketAverage?: number | null; mrr?: number | null; churnPct?: number | null; cac?: number | null; ltv?: number | null; oee?: number | null;
}
interface AlertParams { base: BaseRatios; advanced: AdvancedRatios; bm: Benchmarks; }

/**
 * generateRatioAlerts
 * Centralise la logique d'alertes financières basée sur les benchmarks et ratios calculés.
 * Retourne une liste de messages d'alerte actionnables.
 */
export function generateRatioAlerts({ base, advanced, bm }: AlertParams, t: any): string[] {
  const alerts: string[] = [];
  if (base.liqGen < bm.liqGenMin) alerts.push(t('chatbot.alerts.liq_gen', { val: base.liqGen.toFixed(2), target: bm.liqGenMin.toFixed(2) }));
  if (base.liqQuick < bm.liqQuickMin) alerts.push(t('chatbot.alerts.liq_quick', { val: base.liqQuick.toFixed(2), target: bm.liqQuickMin.toFixed(2) }));
  if (base.dso > bm.dsoMax) alerts.push(t('chatbot.alerts.dso', { val: base.dso, target: bm.dsoMax }));
  if (base.dio > bm.dioMax) alerts.push(t('chatbot.alerts.dio', { val: base.dio, target: bm.dioMax }));
  if (base.dpo < bm.dpoMin) alerts.push(t('chatbot.alerts.dpo', { val: base.dpo, target: bm.dpoMin }));
  if (base.marginPct < bm.marginMin) alerts.push(t('chatbot.alerts.margin', { val: base.marginPct.toFixed(1), target: bm.marginMin }));
  if (advanced.netDebtToEbitda !== null && advanced.netDebtToEbitda > 3.0) alerts.push(t('chatbot.alerts.debt', { val: advanced.netDebtToEbitda }));
  
  const cov = advanced.interestCoverage === '∞' ? 99 : (advanced.interestCoverage || 0);
  if (typeof cov === 'number' && cov > 0 && cov < 3) alerts.push(t('chatbot.alerts.coverage', { val: cov }));
  if (advanced.autonomyPct < 30) alerts.push(t('chatbot.alerts.autonomy', { val: advanced.autonomyPct }));
  if ((advanced.solvencyAssetsToDebt ?? 99) < 1.5) alerts.push(t('chatbot.alerts.solvency', { val: (advanced.solvencyAssetsToDebt ?? 0) }));
  
  return alerts;
}

/** Retourne une synthèse courte utilisable dans badges / tooltips */
export function summarizeAlerts(alerts: string[], t: any): string {
  if (!alerts.length) return t('chatbot.alerts.no_major_alerts');
  // On détecte les alertes critiques par une clé technique ou un flag (ici on peut juste compter si on a déjà traduit)
  // Pour rester simple, on va juste renvoyer le nombre d'alertes localisé
  return t('chatbot.alerts.count', { count: alerts.length });
}
