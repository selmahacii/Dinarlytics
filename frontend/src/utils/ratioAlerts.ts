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
export function generateRatioAlerts({ base, advanced, bm }: AlertParams): string[] {
  const alerts: string[] = [];
  if (base.liqGen < bm.liqGenMin) alerts.push(`Liquidité générale ${base.liqGen.toFixed(2)} < cible ${bm.liqGenMin.toFixed(2)} — renforcer le coussin de trésorerie.`);
  if (base.liqQuick < bm.liqQuickMin) alerts.push(`Liquidité immédiate ${base.liqQuick.toFixed(2)} < ${bm.liqQuickMin.toFixed(2)} — accélérer encaissements, étaler décaissements.`);
  if (base.dso > bm.dsoMax) alerts.push(`DSO ${base.dso}j > ${bm.dsoMax}j — relances cadencées, escompte 2%, scoring client.`);
  if (base.dio > bm.dioMax) alerts.push(`DIO ${base.dio}j > ${bm.dioMax}j — ABC, seuils de réapprovisionnement, liquidation lents.`);
  if (base.dpo < bm.dpoMin) alerts.push(`DPO ${base.dpo}j < ${bm.dpoMin}j — renégocier délais (45–60j).`);
  if (base.marginPct < bm.marginMin) alerts.push(`Marge ${base.marginPct.toFixed(1)}% < ${bm.marginMin}% — optimiser pricing/mix & coûts.`);
  if (advanced.netDebtToEbitda !== null && advanced.netDebtToEbitda > 3.0) alerts.push(`Net Debt/EBITDA ${advanced.netDebtToEbitda} — plan de désendettement / cession actifs non‑core.`);
  const cov = advanced.interestCoverage === '∞' ? 99 : (advanced.interestCoverage || 0);
  if (typeof cov === 'number' && cov > 0 && cov < 3) alerts.push(`Couverture intérêts ${cov}x — réduire dette ou renégocier taux.`);
  if (advanced.autonomyPct < 30) alerts.push(`Autonomie financière ${advanced.autonomyPct}% — renforcer capitaux propres.`);
  if ((advanced.solvencyAssetsToDebt ?? 99) < 1.5) alerts.push(`Actifs/Dettes ${(advanced.solvencyAssetsToDebt ?? 0)} — attention solvabilité (≥ 1.5 visé).`);
  return alerts;
}

/** Retourne une synthèse courte utilisable dans badges / tooltips */
export function summarizeAlerts(alerts: string[]): string {
  if (!alerts.length) return 'Aucune alerte majeure';
  const critical = alerts.filter(a => /solvabil|Net Debt|Liquidité immédiate/.test(a));
  return critical.length ? `${critical.length} alerte(s) critique(s)` : `${alerts.length} alerte(s)`;
}
