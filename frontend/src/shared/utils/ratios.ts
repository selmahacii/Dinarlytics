import type { CompanyData } from '@core/context/AppContext';
import type { Segment } from './benchmarks';

export interface RatioInputs {
  companyData: CompanyData | null | undefined;
  segment: Segment;
  companyType?: string;
  sector?: string;
}

export interface BaseRatios {
  dso: number;
  dio: number;
  dpo: number;
  ccc: number;
  liqGen: number;
  liqQuick: number;
  marginPct: number; // profit margin from context
  turnover: number; // inventory turnover (x/year)
}

export interface AdvancedRatios {
  roePct: number;            // %
  roaPct: number;            // %
  ebitdaMarginPct: number;   // %
  netDebtToEbitda: number | null; // ratio
  interestCoverage: number | '∞' | null; // x
  autonomyPct: number;       // Capitaux propres / Actifs (en %)
  solvencyAssetsToDebt: number | null; // Actifs / Dettes
  supplierRotationX: number; // 365 / DPO
  basketAverage: number;     // Panier moyen
  // Corporate metrics for Large/Enterprise/SPA
  gearingPct?: number;       // Dette nette / Capitaux propres
  waccPct?: number;          // Coût moyen pondéré du capital (estimé)
  dividendPayoutPct?: number; // Taux de distribution
  operatingLeverage?: number; // Levier opérationnel
  // Sector-specific (estimates)
  mrr?: number; churnPct?: number; cac?: number; ltv?: number; // SaaS
  oee?: number; // Industrie
}

export interface RatiosResult {
  base: BaseRatios;
  advanced: AdvancedRatios;
  notes: string[]; // brief notes on estimation assumptions
}

function clamp(v: number, min: number, max: number) { return Math.min(max, Math.max(min, v)); }

export function computeRatios(input: RatioInputs): RatiosResult {
  const cd = input.companyData;
  const revM = cd?.revenueMonth ?? 1200000;
  const marginPct = cd?.profitMargin ?? 18;
  const cash = cd?.cashBalance ?? Math.round(revM * 0.8);
  const ar = cd?.accountsReceivable ?? Math.round(revM * 1.5);
  const ap = cd?.accountsPayable ?? Math.round(revM * 0.8);
  const inv = cd?.inventoryValue ?? Math.round(revM * 1.2);
  const turnover = cd?.stockTurnover && cd.stockTurnover > 0 ? cd.stockTurnover : 8;
  const cogsMonth = Math.max(1, Math.round(revM * (1 - marginPct / 100)));

  const dso = Math.max(0, Math.round((ar / Math.max(1, revM)) * 30));
  const dio = Math.max(0, Math.round(365 / Math.max(0.1, turnover)));
  const dpo = Math.max(0, Math.round((ap / Math.max(1, cogsMonth)) * 30));
  const ccc = dso + dio - dpo;
  const liqGen = (cash + ar + inv) / Math.max(1, ap);
  const liqQuick = (cash + ar) / Math.max(1, ap);

  // Heuristic estimates for advanced ratios (demo-oriented, deterministic by segment)
  const totalRevenueYear = cd?.revenueTotal ?? revM * 12;
  const equityRatio = (
    input.segment === 'micro' ? 0.42 :
      input.segment === 'small' ? 0.40 :
        input.segment === 'medium' ? 0.35 :
          input.segment === 'large' ? 0.32 : 0.30
  );
  const assetsToRevenue = (
    input.segment === 'micro' ? 0.55 :
      input.segment === 'small' ? 0.58 :
        input.segment === 'medium' ? 0.60 :
          input.segment === 'large' ? 0.62 : 0.65
  );
  const totalAssetsEst = totalRevenueYear * assetsToRevenue;
  const equityEst = totalAssetsEst * equityRatio;
  const debtEst = Math.max(0, totalAssetsEst - equityEst);
  const netMarginPct = clamp(marginPct - 5, 2, 18); // rough net margin approximation
  const netIncomeEst = totalRevenueYear * (netMarginPct / 100);
  const ebitdaMarginPct = clamp(marginPct + 8, 5, 45);
  const ebitdaEst = totalRevenueYear * (ebitdaMarginPct / 100);
  const interestRate = (
    input.segment === 'enterprise' ? 0.08 :
      input.segment === 'large' ? 0.09 : 0.105
  );
  const interestExpenseEst = debtEst * interestRate;
  const interestCoverage = interestExpenseEst <= 0 ? '∞' : Math.max(0.1, +(ebitdaEst / interestExpenseEst).toFixed(1));
  const netDebt = Math.max(0, debtEst - cash);
  const netDebtToEbitda = ebitdaEst > 0 ? +(netDebt / ebitdaEst).toFixed(2) : null;
  const autonomyPct = totalAssetsEst > 0 ? +((equityEst / totalAssetsEst) * 100).toFixed(1) : 0;
  const solvencyAssetsToDebt = debtEst > 0 ? +(totalAssetsEst / debtEst).toFixed(2) : null;
  const supplierRotationX = dpo > 0 ? +(365 / dpo).toFixed(1) : 0;
  const basketAverage = cd?.averageInvoice ?? Math.round(revM / Math.max(cd?.invoicesCount ?? 1, 1));

  const advanced: AdvancedRatios = {
    roePct: equityEst > 0 ? +((netIncomeEst / equityEst) * 100).toFixed(1) : 0,
    roaPct: totalAssetsEst > 0 ? +((netIncomeEst / totalAssetsEst) * 100).toFixed(1) : 0,
    ebitdaMarginPct,
    netDebtToEbitda,
    interestCoverage,
    autonomyPct,
    solvencyAssetsToDebt,
    supplierRotationX,
    basketAverage
  };

  // Corporate heuristics for large structures
  if (input.segment === 'large' || input.segment === 'enterprise' || input.companyType === 'spa') {
    advanced.gearingPct = equityEst > 0 ? +((netDebt / equityEst) * 100).toFixed(1) : 0;

    // WACC estimate: Risk free (~3%) + Beta*EquityRiskPremium (~6%) + DebtCost (~9%)
    const costOfEquity = 0.03 + (input.segment === 'enterprise' ? 1.1 : 1.3) * 0.05;
    const taxRate = 0.19; // standard DZ CIT
    const costOfDebt = interestRate * (1 - taxRate);
    const wacc = ((equityEst / totalAssetsEst) * costOfEquity) + ((debtEst / totalAssetsEst) * costOfDebt);
    advanced.waccPct = +(wacc * 100).toFixed(1);

    advanced.dividendPayoutPct = input.companyType === 'spa' ? 25 : 0; // SPA usually distribute
    advanced.operatingLeverage = +(ebitdaEst / Math.max(1, netIncomeEst)).toFixed(2);
  }

  // Sector-specific demo metrics
  const sector = (input.sector || '').toLowerCase();
  if (sector === 'saas' || sector === 'software') {
    const mrr = revM; // monthly revenue as proxy
    const churnPct = clamp(2 + (5 - (input.segment === 'enterprise' ? 3 : 4)), 1.2, 5.0);
    const cac = Math.round((advanced.basketAverage || (revM / Math.max(cd?.invoicesCount ?? 1, 1))) * 0.25);
    const arpa = Math.max(advanced.basketAverage, 1);
    const ltv = Math.round(arpa * (marginPct / 100) * 18); // 18 months horizon
    advanced.mrr = mrr; advanced.churnPct = +churnPct.toFixed(1); advanced.cac = cac; advanced.ltv = ltv;
  }
  if (sector === 'industrie' || sector === 'manufacturing') {
    const oee = input.segment === 'large' || input.segment === 'enterprise' ? 0.78 : 0.72;
    advanced.oee = +oee.toFixed(2);
  }

  const base: BaseRatios = { dso, dio, dpo, ccc, liqGen, liqQuick, marginPct, turnover };
  const notes = [
    'Certaines valeurs (ROE/ROA, Net Debt/EBITDA, Couverture des intérêts) sont estimées pour la démo à partir du CA et d’hypothèses segment.',
    'EBITDA% ≈ marge + 8 pts (bornée). Marge nette ≈ marge − 5 pts (bornée).'
  ];
  return { base, advanced, notes };
}
