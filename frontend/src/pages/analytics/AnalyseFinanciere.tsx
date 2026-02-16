import React, { useState } from 'react';
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
  const { user, companyData, formatCurrency } = useApp();
  const segment = ((user?.segment as string) || 'micro') as 'micro' | 'small' | 'medium' | 'large' | 'enterprise';
  const companyType = (user?.companyType as string) || 'eurl';
  const sector = (user?.secteur as string) || 'general';

  const { base: ratios, advanced, notes } = computeRatios({ companyData, segment, companyType, sector });
  const bm = getBenchmarks({ segment, companyType, sector });
  
  // États pour les nouvelles fonctionnalités
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isPrevisionsModalOpen, setIsPrevisionsModalOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioSimulation | null>(null);
  
  // Données actuelles pour les simulations
  const revenueMonthly = companyData?.revenueMonth ?? 250000;
  const revenueAnnual = companyData?.revenueTotal ?? (revenueMonthly * 12);
  
  const donneesActuelles = {
    ca: revenueAnnual,
    charges: revenueAnnual * 0.7,
    margeBrute: revenueAnnual * 0.3,
    dso: ratios.dso,
    dio: ratios.dio,
    dpo: ratios.dpo,
    tresorerie: companyData?.cashBalance || 500000,
    actif: revenueAnnual * 0.6,
    passif: revenueAnnual * 0.4,
    capitauxPropres: revenueAnnual * 0.2,
    bfr: (ratios.dso + ratios.dio - ratios.dpo) * revenueMonthly / 30,
    resultat: revenueAnnual * 0.3 - revenueAnnual * 0.7
  };
  
  // Générer les alertes financières
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
  
  // Calculer le seuil de rentabilité
  const seuilRentabilite = calculerSeuilRentabilite(
    850000, // Coûts fixes estimés
    ratios.marginPct
  );
  
  // Comparaison avec benchmarks
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
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Analyse Financière</h1>
        <p className="text-slate-600">Analyse approfondie de la rentabilité et des performances financières</p>
        </div>


      {/* Contenu principal */}
      <div className="space-y-6">
          {/* Ratios financiers clés */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Ratios financiers clés</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-xs text-slate-600 mb-1">DSO</div>
                <div className="text-2xl font-bold text-slate-900">{ratios.dso} j</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-xs text-slate-600 mb-1">DIO</div>
                <div className="text-2xl font-bold text-slate-900">{ratios.dio} j</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-xs text-slate-600 mb-1">DPO</div>
                <div className="text-2xl font-bold text-slate-900">{ratios.dpo} j</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-xs text-slate-600 mb-1">CCC</div>
                <div className="text-2xl font-bold text-slate-900">{ratios.ccc} j</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-xs text-slate-600 mb-1">Liquidité générale</div>
                <div className="text-2xl font-bold text-slate-900">{ratios.liqGen.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-xs text-slate-600 mb-1">Marge</div>
                <div className="text-2xl font-bold text-slate-900">{ratios.marginPct.toFixed(1)}%</div>
              </div>
            </div>
          </Card>

          {/* Ratios avancés */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Ratios avancés</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-xs text-slate-600 mb-1">ROE</div>
                <div className="text-2xl font-bold text-slate-900">{advanced.roePct}%</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-xs text-slate-600 mb-1">ROA</div>
                <div className="text-2xl font-bold text-slate-900">{advanced.roaPct}%</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-xs text-slate-600 mb-1">EBITDA %</div>
                <div className="text-2xl font-bold text-slate-900">{advanced.ebitdaMarginPct}%</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-xs text-slate-600 mb-1">Net Debt/EBITDA</div>
                <div className="text-2xl font-bold text-slate-900">{advanced.netDebtToEbitda ?? '—'}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-xs text-slate-600 mb-1">Couverture intérêts</div>
                <div className="text-2xl font-bold text-slate-900">{advanced.interestCoverage ?? '—'}x</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-xs text-slate-600 mb-1">Autonomie financière</div>
                <div className="text-2xl font-bold text-slate-900">{advanced.autonomyPct}%</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-xs text-slate-600 mb-1">Solvabilité (Actifs/Dettes)</div>
                <div className="text-2xl font-bold text-slate-900">{advanced.solvencyAssetsToDebt ?? '—'}</div>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                <div className="text-xs text-slate-600 mb-1">Liquidité immédiate</div>
                <div className="text-2xl font-bold text-slate-900">{ratios.liqQuick.toFixed(2)}</div>
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
                Alertes Financières Intelligentes
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                comparaisonBenchmarks.classement === 'excellent' ? 'bg-green-100 text-green-800' :
                comparaisonBenchmarks.classement === 'bon' ? 'bg-blue-100 text-blue-800' :
                comparaisonBenchmarks.classement === 'moyen' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                Score: {comparaisonBenchmarks.score.toFixed(0)}/100 - {comparaisonBenchmarks.classement}
              </span>
            </div>
            
            {alertesFinancieres.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                Aucune alerte majeure. Tous les indicateurs sont dans les normes.
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
                        <h3 className="font-semibold text-slate-900">{alerte.titre}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          alerte.categorie === 'liquidite' ? 'bg-blue-100 text-blue-800' :
                          alerte.categorie === 'rentabilite' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {alerte.categorie}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">Priorité: {alerte.priorite}/10</span>
                    </div>
                    <p className="text-sm text-slate-700 mb-3">{alerte.message}</p>
                    {alerte.recommandations.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-slate-600 mb-1">Recommandations:</p>
                        <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                          {alerte.recommandations.slice(0, 3).map((rec: string, idx: number) => (
                            <li key={idx}>{rec}</li>
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
                <span>Seuil de Rentabilité & Point Mort</span>
              </h2>
              <div className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                Atteint
              </div>
            </div>

            {/* Calcul du Seuil */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4">📊 Calcul du Seuil</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-xs text-slate-600 mb-1">Coûts Fixes</div>
                  <div className="text-2xl font-bold text-slate-900">850K</div>
                  <div className="text-xs text-slate-500 mt-1">دج</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-xs text-slate-600 mb-1">Taux Marge</div>
                  <div className="text-2xl font-bold text-slate-900">42.8%</div>
                  <div className="text-xs text-slate-500 mt-1">Marge brute</div>
                </div>
                <div className="p-4 bg-slate-100 rounded-lg border border-slate-300 text-center">
                  <div className="text-xs text-slate-700 mb-1">Seuil de Rentabilité</div>
                  <div className="text-2xl font-bold text-slate-900">1.99M</div>
                  <div className="text-xs text-slate-600 mt-1">DZD</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-xs text-slate-600 mb-1">Marge sécurité</div>
                  <div className="text-2xl font-bold text-slate-900">510K</div>
                  <div className="text-xs text-slate-500 mt-1">دج</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-center">
                  <div className="text-xs text-slate-600 mb-1">Point mort</div>
                  <div className="text-2xl font-bold text-slate-900">292j</div>
                  <div className="text-xs text-slate-500 mt-1">jours</div>
                </div>
              </div>
            </div>

            {/* Simulations What-If */}
              <div>
              <h3 className="text-base font-semibold text-slate-900 mb-4">📈 Simulation What-If</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-sm text-slate-700">Si CA -10%</span>
                    <span className="text-lg font-bold text-slate-900">2.25M</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="text-sm text-slate-700">Si CA -20%</span>
                    <span className="text-lg font-bold text-red-700">2.00M</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span className="text-sm text-slate-700">Si CA +10%</span>
                    <span className="text-lg font-bold text-emerald-700">2.75M</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm text-slate-600 mb-2">Levier Opérationnel</div>
                    <div className="text-4xl font-bold text-slate-900 mb-2">2.8x</div>
                    <div className="text-sm text-slate-600">+10% CA → +28% résultat</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Comparaison avec Benchmarks Sectoriels */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5 text-purple-600" />
              Comparaison Sectorielle
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-purple-900">Score Global</span>
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
                  Classement: <span className="font-semibold">{comparaisonBenchmarks.classement}</span>
                </p>
              </div>
              
              <div className="space-y-2">
                {comparaisonBenchmarks.pointsFort.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-green-700 mb-1">Points Forts:</p>
                    <ul className="list-disc list-inside text-xs text-green-600 space-y-1">
                      {comparaisonBenchmarks.pointsFort.map((point: string, idx: number) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {comparaisonBenchmarks.pointsFaible.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-700 mb-1">Points à Améliorer:</p>
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
              <span className="font-semibold">Simuler un Scénario</span>
            </button>
            <button
              onClick={() => setIsPrevisionsModalOpen(true)}
              className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              <span className="font-semibold">Voir les Prévisions</span>
            </button>
          </div>
        </div>
      
      {/* Modal Simulation de Scénario */}
      <Modal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        title="Simulation de Scénario Financier"
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              Simulez l'impact de différents scénarios sur vos ratios financiers et votre rentabilité.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Variation du CA (%)
              </label>
              <input
                type="number"
                defaultValue={0}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Ex: +10 ou -5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Variation des Charges (%)
              </label>
              <input
                type="number"
                defaultValue={0}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Ex: -5 ou +10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Variation DSO (jours)
              </label>
              <input
                type="number"
                defaultValue={0}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Ex: -5 ou +10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Variation DIO (jours)
              </label>
              <input
                type="number"
                defaultValue={0}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                placeholder="Ex: -3 ou +5"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsScenarioModalOpen(false)}
              className="px-4 py-2 text-slate-600 hover:text-slate-800"
            >
              Annuler
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <SparklesIcon className="h-4 w-4 inline mr-2" />
              Lancer la Simulation
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Modal Prévisions */}
      <Modal
        isOpen={isPrevisionsModalOpen}
        onClose={() => setIsPrevisionsModalOpen(false)}
        title="Prévisions Financières"
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-800">
              Prévisions financières sur 12 mois basées sur vos données actuelles et les tendances du secteur.
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <button className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium hover:bg-green-200">
              Scénario Optimiste
            </button>
            <button className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium hover:bg-blue-200">
              Scénario Réaliste
            </button>
            <button className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium hover:bg-red-200">
              Scénario Pessimiste
            </button>
          </div>
          
          <div className="text-center text-slate-500 py-8">
            Les prévisions seront générées après sélection du scénario
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setIsPrevisionsModalOpen(false)}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AnalyseFinanciere;



