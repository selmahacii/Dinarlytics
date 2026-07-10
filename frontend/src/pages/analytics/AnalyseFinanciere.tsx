import React, { useState } from 'react';
import { useTranslation } from '@shared/hooks/useTranslation';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ChartBarIcon,
  CalculatorIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import { useApp } from '@core/context/AppContext';
import { computeRatios } from '@shared/utils/ratios';
import { getBenchmarks } from '@shared/utils/benchmarks';
import { generateRatioAlerts } from '@shared/utils/ratioAlerts';
import {
  simulerScenario,
  genererAlertesFinancieres,
  genererPrevisions,
  calculerSeuilRentabilite,
  comparerAvecBenchmarks,
  type ScenarioSimulation,
  type AlerteFinanciere,
  type PrevisionFinanciere
} from '@shared/utils/analysePredictive';

const AnalyseFinanciere: React.FC = () => {
  const { t } = useTranslation();
  const { user, companyData, formatCurrency } = useApp();
  const segment = ((user?.segment as string) || 'micro') as 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
  const companyType = (user?.companyType as string) || 'eurl';
  const sector = (user?.secteur as string) || 'general';

  const { base: ratios, advanced, notes } = computeRatios({ companyData, segment, companyType, sector });
  const bm = getBenchmarks({ segment, companyType, sector });

  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isPrevisionsModalOpen, setIsPrevisionsModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioSimulation | null>(null);
  const [scenarioForm, setScenarioForm] = useState({ variationCA: 0, variationCharges: 0 });
  const [selectedPrevisionScenario, setSelectedPrevisionScenario] = useState<'optimistic' | 'realistic' | 'pessimistic' | null>(null);
  const [previsions, setPrevisions] = useState<PrevisionFinanciere[] | null>(null);

  const revenueMonthly = companyData?.revenueMonth ?? 0;
  const revenueAnnual = companyData?.revenueTotal ?? (revenueMonthly * 12);

  // Marge réelle (ratios.marginPct, dérivée de companyData.profitMargin)
  // plutôt qu'une répartition charges/marge fixée arbitrairement à 70/30.
  const margeReelle = ratios.marginPct / 100;
  const chargesAnnuelles = revenueAnnual * (1 - margeReelle);
  const donneesActuelles = {
    ca: revenueAnnual,
    charges: chargesAnnuelles,
    margeBrute: revenueAnnual * margeReelle,
    dso: ratios.dso,
    dio: ratios.dio,
    dpo: ratios.dpo,
    tresorerie: companyData?.cashBalance || 0,
    actif: (companyData?.accountsReceivable || 0) + (companyData?.cashBalance || 0) + (companyData?.inventoryValue || 0),
    passif: companyData?.accountsPayable || 0,
    capitauxPropres: revenueAnnual * margeReelle,
    bfr: (ratios.dso + ratios.dio - ratios.dpo) * revenueMonthly / 30,
    resultat: revenueAnnual - chargesAnnuelles
  };

  const alertesFinancieres = genererAlertesFinancieres(
    {
      dso: ratios.dso,
      dio: ratios.dio,
      dpo: ratios.dpo,
      ccc: ratios.ccc,
      margeBrute: ratios.marginPct,
      margeNette: ratios.marginPct - 5,
      roe: advanced.roePct,
      roa: advanced.roaPct,
      liquiditeGenerale: ratios.liqGen,
      endettement: advanced.autonomyPct
    },
    donneesActuelles,
    {
      dsoOptimal: 45,
      margeMinimale: 10,
      liquiditeMinimale: 1.0
    }
  );

  // Estimation des coûts fixes à ~30% des charges annuelles réelles (pas de
  // suivi séparé fixe/variable dans le schéma actuel).
  const coutsFixesEstimes = chargesAnnuelles * 0.3;
  const seuilRentabilite = calculerSeuilRentabilite(
    coutsFixesEstimes,
    ratios.marginPct,
    revenueAnnual
  );
  // Levier opérationnel réel = marge sur coûts variables / résultat
  // d'exploitation, à partir des mêmes coûts fixes estimés.
  const coutsVariablesEstimes = chargesAnnuelles - coutsFixesEstimes;
  const margeSurCoutsVariables = revenueAnnual - coutsVariablesEstimes;
  const resultatExploitation = margeSurCoutsVariables - coutsFixesEstimes;
  const leverageOperationnel = resultatExploitation !== 0 ? margeSurCoutsVariables / resultatExploitation : null;

  const comparaisonBenchmarks = comparerAvecBenchmarks(
    {
      dso: ratios.dso,
      dio: ratios.dio,
      dpo: ratios.dpo,
      ccc: ratios.ccc,
      margeBrute: ratios.marginPct,
      margeNette: ratios.marginPct - 5,
      roe: advanced.roePct,
      roa: advanced.roaPct,
      liquiditeGenerale: ratios.liqGen,
      endettement: advanced.autonomyPct
    },
    {
      dso: { min: 30, max: 60, median: 45 },
      margeBrute: { min: 15, max: 40, median: 25 },
      roe: { min: 5, max: 20, median: 12 },
      liquidite: { min: 1.0, max: 2.5, median: 1.5 }
    }
  );

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{t('analytics.financial.title')}</h1>
        <p className="text-slate-600 text-sm">{t('analytics.financial.subtitle')}</p>
      </div>


      {/* Contenu principal */}
      <div className="space-y-6">
          {/* Ratios financiers clés */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('analytics.financial.ratios.key_title')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center transition-all hover:bg-white hover:shadow-md">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('analytics.financial.ratios.dso')}</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{ratios.dso} <span className="text-[10px] uppercase text-slate-400">{t('analytics.financial.ratios.days')}</span></div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center transition-all hover:bg-white hover:shadow-md">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('analytics.financial.ratios.dio')}</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{ratios.dio} <span className="text-[10px] uppercase text-slate-400">{t('analytics.financial.ratios.days')}</span></div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center transition-all hover:bg-white hover:shadow-md">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('analytics.financial.ratios.dpo')}</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{ratios.dpo} <span className="text-[10px] uppercase text-slate-400">{t('analytics.financial.ratios.days')}</span></div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center transition-all hover:bg-white hover:shadow-md">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('analytics.financial.ratios.ccc')}</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{ratios.ccc} <span className="text-[10px] uppercase text-slate-400">{t('analytics.financial.ratios.days')}</span></div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center transition-all hover:bg-white hover:shadow-md">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('analytics.financial.ratios.liquidity')}</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{ratios.liqGen.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center transition-all hover:bg-white hover:shadow-md">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('analytics.financial.ratios.margin')}</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{ratios.marginPct.toFixed(1)}%</div>
              </div>
            </div>
          </Card>

          {/* Ratios avancés */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{t('analytics.financial.ratios.advanced_title')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center transition-all hover:bg-white hover:shadow-md">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('analytics.financial.ratios.roe')}</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{advanced.roePct}%</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center transition-all hover:bg-white hover:shadow-md">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('analytics.financial.ratios.roa')}</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{advanced.roaPct}%</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center transition-all hover:bg-white hover:shadow-md">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('analytics.financial.ratios.ebitda')}</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{advanced.ebitdaMarginPct}%</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center transition-all hover:bg-white hover:shadow-md">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('analytics.financial.ratios.net_debt')}</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{advanced.netDebtToEbitda ?? '—'}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center transition-all hover:bg-white hover:shadow-md">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('analytics.financial.ratios.interest_coverage')}</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{advanced.interestCoverage ?? '—'}<span className="text-[10px] uppercase text-slate-400">{t('analytics.financial.ratios.multiplier')}</span></div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center transition-all hover:bg-white hover:shadow-md">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('analytics.financial.ratios.autonomy')}</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{advanced.autonomyPct}%</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center transition-all hover:bg-white hover:shadow-md">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('analytics.financial.ratios.solvency')}</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{advanced.solvencyAssetsToDebt ?? '—'}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center transition-all hover:bg-white hover:shadow-md">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{t('analytics.financial.ratios.quick_liquidity')}</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900">{ratios.liqQuick.toFixed(2)}</div>
              </div>
              {/* Sector specifics */}
              {['saas','software'].includes(sector.toLowerCase()) && (
                <>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-xs text-slate-600 mb-1">MRR</div>
                    <div className="text-2xl font-bold text-slate-900">{formatCurrency(advanced.mrr || 0)}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-xs text-slate-600 mb-1">Churn</div>
                    <div className="text-2xl font-bold text-slate-900">{(advanced.churnPct || 0).toFixed(1)}%</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-xs text-slate-600 mb-1">CAC</div>
                    <div className="text-2xl font-bold text-slate-900">{formatCurrency(advanced.cac || 0)}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                    <div className="text-xs text-slate-600 mb-1">LTV</div>
                    <div className="text-2xl font-bold text-slate-900">{formatCurrency(advanced.ltv || 0)}</div>
                  </div>
                </>
              )}
              {['industrie','manufacturing'].includes(sector.toLowerCase()) && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-xs text-slate-600 mb-1">OEE</div>
                  <div className="text-2xl font-bold text-slate-900">{((advanced as any).oee ?? 0).toFixed(2)}</div>
                </div>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-3">{notes.join(' • ')}</div>
          </Card>

          {/* Alertes Financières Intelligentes */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-blue-600" />
                {t('analytics.financial.alerts.title')}
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                comparaisonBenchmarks.classement === 'excellent' ? 'bg-green-100 text-green-800' :
                comparaisonBenchmarks.classement === 'bon' ? 'bg-blue-100 text-blue-800' :
                comparaisonBenchmarks.classement === 'moyen' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {t('analytics.financial.alerts.score', { score: comparaisonBenchmarks.score.toFixed(0), status: comparaisonBenchmarks.classement })}
              </span>
            </div>

            {alertesFinancieres.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                {t('analytics.financial.alerts.none')}
              </div>
            ) : (
              <div className="space-y-3">
                {alertesFinancieres.map((alerte: AlerteFinanciere) => (
                  <div
                    key={alerte.id}
                    className={`p-4 rounded-lg border-2 ${
                      alerte.type === 'critique' ? 'bg-red-50 border-red-300' :
                      alerte.type === 'avertissement' ? 'bg-yellow-50 border-yellow-300' :
                      alerte.type === 'opportunite' ? 'bg-green-50 border-green-300' :
                      'bg-blue-50 border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {alerte.type === 'critique' && <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />}
                        {alerte.type === 'opportunite' && <LightBulbIcon className="h-5 w-5 text-green-600" />}
                        <h3 className="font-semibold text-slate-900">
                          {t(`analytics.financial.alerts.items.${alerte.id}.title`, alerte.titre)}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          alerte.categorie === 'liquidite' ? 'bg-blue-100 text-blue-800' :
                          alerte.categorie === 'rentabilite' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {t(`analytics.financial.alerts.categories.${alerte.categorie}`)}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">{t('analytics.financial.alerts.priority')} {alerte.priorite}/10</span>
                    </div>
                    <p className="text-sm text-slate-700 mb-3">
                      {t(`analytics.financial.alerts.items.${alerte.id}.message`, {
                        value: alerte.valeurActuelle,
                        threshold: alerte.seuilCritique,
                        defaultValue: alerte.message
                      })}
                    </p>
                    {alerte.recommandations.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-slate-600 mb-1">{t('analytics.financial.alerts.recommendations')}</p>
                        <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                          {alerte.recommandations.map((_, idx: number) => (
                            <li key={idx}>
                              {t(`analytics.financial.alerts.items.${alerte.id}.recommendations.${idx}`, alerte.recommandations[idx])}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
          {/* Statut du Seuil */}
          <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                <span>{t('analytics.financial.breakeven.title')}</span>
              </h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${seuilRentabilite.estAtteint ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {seuilRentabilite.estAtteint ? t('analytics.financial.breakeven.status_reached') : t('analytics.financial.breakeven.status_not_reached', { defaultValue: 'Seuil non atteint' })}
              </div>
            </div>

            {/* Calcul du Seuil */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4">{t('analytics.financial.breakeven.calc_title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-xs text-slate-600 mb-1">{t('analytics.financial.breakeven.fixed_costs')}</div>
                  <div className="text-2xl font-bold text-slate-900">{formatCurrency(coutsFixesEstimes)}</div>
                  <div className="text-xs text-slate-500 mt-1">{t('analytics.financial.breakeven.currency_symbol')}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-xs text-slate-600 mb-1">{t('analytics.financial.breakeven.margin_rate')}</div>
                  <div className="text-2xl font-bold text-slate-900">{ratios.marginPct.toFixed(1)}%</div>
                  <div className="text-xs text-slate-500 mt-1">{t('analytics.financial.breakeven.brute_margin')}</div>
                </div>
                <div className="p-4 bg-slate-100 rounded-lg border border-slate-300 text-center">
                  <div className="text-xs text-slate-700 mb-1">{t('analytics.financial.breakeven.breakeven_point')}</div>
                  <div className="text-2xl font-bold text-slate-900">{formatCurrency(seuilRentabilite.chiffreAffairesMinimum ?? 0)}</div>
                  <div className="text-xs text-slate-600 mt-1">{t('analytics.financial.breakeven.currency_symbol')}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-xs text-slate-600 mb-1">{t('analytics.financial.breakeven.safety_margin')}</div>
                  <div className="text-2xl font-bold text-slate-900">{seuilRentabilite.margeSecurite.toFixed(1)}%</div>
                  <div className="text-xs text-slate-500 mt-1">{t('analytics.financial.breakeven.above_threshold', { defaultValue: 'au-dessus du seuil' })}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-xs text-slate-600 mb-1">{t('analytics.financial.breakeven.dead_point')}</div>
                  <div className="text-2xl font-bold text-slate-900">{seuilRentabilite.pointMort ?? 0}</div>
                  <div className="text-xs text-slate-500 mt-1">{t('analytics.financial.breakeven.days')}</div>
                </div>
              </div>
            </div>

            {/* Simulations What-If */}
              <div>
              <h3 className="text-base font-semibold text-slate-900 mb-4">{t('analytics.financial.simulation.title')}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-sm text-slate-700">{t('analytics.financial.simulation.revenue_var', { var: '-10' })}</span>
                    <span className="text-lg font-bold text-slate-900">{formatCurrency(revenueAnnual * 0.9)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="text-sm text-slate-700">{t('analytics.financial.simulation.revenue_var', { var: '-20' })}</span>
                    <span className="text-lg font-bold text-red-700">{formatCurrency(revenueAnnual * 0.8)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-sm text-slate-700">{t('analytics.financial.simulation.revenue_var', { var: '+10' })}</span>
                    <span className="text-lg font-bold text-emerald-700">{formatCurrency(revenueAnnual * 1.1)}</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm text-slate-600 mb-2">{t('analytics.financial.simulation.operating_leverage')}</div>
                    <div className="text-4xl font-bold text-slate-900 mb-2">{leverageOperationnel != null ? `${leverageOperationnel.toFixed(1)}x` : '—'}</div>
                    <div className="text-sm text-slate-600">{t('analytics.financial.simulation.leverage_desc')}</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Comparaison avec Benchmarks Sectoriels */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-purple-600" />
              {t('analytics.financial.sector.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-purple-900">{t('analytics.financial.sector.global_score')}</span>
                  <span className={`text-2xl font-bold ${
                    comparaisonBenchmarks.score >= 85 ? 'text-green-600' :
                    comparaisonBenchmarks.score >= 70 ? 'text-blue-600' :
                    comparaisonBenchmarks.score >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {comparaisonBenchmarks.score.toFixed(0)}/100
                  </span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      comparaisonBenchmarks.score >= 85 ? 'bg-green-500' :
                      comparaisonBenchmarks.score >= 70 ? 'bg-blue-500' :
                      comparaisonBenchmarks.score >= 50 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${comparaisonBenchmarks.score}%` }}
                  ></div>
                </div>
                <p className="text-xs text-purple-700 mt-2">
                  {t('analytics.financial.sector.status')} <span className="font-semibold">{comparaisonBenchmarks.classement}</span>
                </p>
              </div>

              <div className="space-y-2">
                {comparaisonBenchmarks.pointsFort.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-green-700 mb-1">{t('analytics.financial.sector.strengths')}</p>
                    <ul className="list-disc list-inside text-xs text-green-600 space-y-1">
                      {comparaisonBenchmarks.pointsFort.map((point: string, idx: number) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {comparaisonBenchmarks.pointsFaible.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-700 mb-1">{t('analytics.financial.sector.weaknesses')}</p>
                    <ul className="list-disc list-inside text-xs text-red-600 space-y-1">
                      {comparaisonBenchmarks.pointsFaible.map((point: string, idx: number) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Actions Rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setIsScenarioModalOpen(true)}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              <CalculatorIcon className="h-5 w-5 mr-2" />
              <span className="font-semibold">{t('analytics.financial.actions.simulate')}</span>
            </button>
            <button
              onClick={() => setIsPrevisionsModalOpen(true)}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              <span className="font-semibold">{t('analytics.financial.actions.projections')}</span>
            </button>
          </div>
        </div>

      {/* Modal Simulation de Scénario */}
      <Modal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        title={t('analytics.financial.modals.simulation_title')}
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              {t('analytics.financial.modals.simulation_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('analytics.financial.modals.revenue_var_label')}
              </label>
              <input
                type="number"
                value={scenarioForm.variationCA}
                onChange={(e) => setScenarioForm({ ...scenarioForm, variationCA: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder={t('analytics.financial.modals.placeholder_ex')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {t('analytics.financial.modals.costs_var_label')}
              </label>
              <input
                type="number"
                value={scenarioForm.variationCharges}
                onChange={(e) => setScenarioForm({ ...scenarioForm, variationCharges: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder={t('analytics.financial.modals.placeholder_ex')}
              />
            </div>
          </div>

          {selectedScenario && (
            <div className={`p-4 rounded-lg border-2 ${selectedScenario.scoreImpact === 'positif' ? 'bg-emerald-50 border-emerald-200' : selectedScenario.scoreImpact === 'negatif' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
              <p className="font-semibold text-slate-900 mb-2">{selectedScenario.nom}</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-500">Résultat simulé: </span><span className="font-bold">{formatCurrency(selectedScenario.resultatSimule)}</span></div>
                <div><span className="text-slate-500">Marge simulée: </span><span className="font-bold">{selectedScenario.margeSimulee.toFixed(1)}%</span></div>
                <div><span className="text-slate-500">BFR simulé: </span><span className="font-bold">{formatCurrency(selectedScenario.bfrSimule)}</span></div>
                <div><span className="text-slate-500">Trésorerie simulée: </span><span className="font-bold">{formatCurrency(selectedScenario.tresorerieSimulee)}</span></div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => { setIsScenarioModalOpen(false); setSelectedScenario(null); }}
              className="px-4 py-2 text-slate-600 hover:text-slate-800"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={() => setSelectedScenario(simulerScenario(donneesActuelles, scenarioForm.variationCA, scenarioForm.variationCharges))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <SparklesIcon className="h-4 w-4 inline mr-2" />
              {t('analytics.financial.modals.run_simulation')}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Prévisions */}
      <Modal
        isOpen={isPrevisionsModalOpen}
        onClose={() => setIsPrevisionsModalOpen(false)}
        title={t('analytics.financial.modals.projections_title')}
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-800">
              {t('analytics.financial.modals.projections_desc')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <button
              onClick={() => { setSelectedPrevisionScenario('optimistic'); setPrevisions(genererPrevisions(donneesActuelles, 5)); }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedPrevisionScenario === 'optimistic' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
            >
              {t('analytics.financial.modals.scenarios.optimistic')}
            </button>
            <button
              onClick={() => { setSelectedPrevisionScenario('realistic'); setPrevisions(genererPrevisions(donneesActuelles, 2)); }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedPrevisionScenario === 'realistic' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
            >
              {t('analytics.financial.modals.scenarios.realistic')}
            </button>
            <button
              onClick={() => { setSelectedPrevisionScenario('pessimistic'); setPrevisions(genererPrevisions(donneesActuelles, -2)); }}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedPrevisionScenario === 'pessimistic' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
            >
              {t('analytics.financial.modals.scenarios.pessimistic')}
            </button>
          </div>

          {previsions ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase">
                    <th className="py-2">Mois</th>
                    <th className="py-2">CA prévu</th>
                    <th className="py-2">Résultat prévu</th>
                    <th className="py-2">Trésorerie</th>
                    <th className="py-2">Tendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previsions.map((p, i) => (
                    <tr key={i}>
                      <td className="py-2 font-medium">{p.mois}</td>
                      <td className="py-2">{formatCurrency(p.caPrevu)}</td>
                      <td className={`py-2 font-bold ${p.resultatPrevu >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(p.resultatPrevu)}</td>
                      <td className="py-2">{formatCurrency(p.tresorerieProjetee)}</td>
                      <td className="py-2 capitalize">{p.tendance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">
              {t('analytics.financial.modals.waiting_selection')}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => { setIsPrevisionsModalOpen(false); setSelectedPrevisionScenario(null); setPrevisions(null); }}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AnalyseFinanciere;
