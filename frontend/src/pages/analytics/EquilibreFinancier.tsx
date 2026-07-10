import React, { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon, 
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalculatorIcon,
  EyeIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';
import api from '@/services/api';
import { 
  EquilibreFinancierActuel, 
  EquilibreFinancierPrevisionnel,
  ScenarioRisque 
} from '@/types';

const EquilibreFinancier: React.FC = () => {
  const { formatCurrency, companyData } = useApp();
  const { t } = useTranslation();
  const [scenarioActuel, setScenarioActuel] = useState<'optimiste' | 'prudent' | 'pessimiste'>('prudent');
  const [equilibreActuel, setEquilibreActuel] = useState<EquilibreFinancierActuel | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger les données dynamiques depuis le backend ou companyData
  useEffect(() => {
    const fetchEquilibreFinancier = async () => {
      try {
        const data = await api.accounting.getEquilibreFinancier();
        if (data) {
          setEquilibreActuel(data);
        } else {
          const actifsCirculants = (companyData?.cashBalance || 0) + (companyData?.accountsReceivable || 0) + (companyData?.inventoryValue || 0);
          const passifsCirculants = companyData?.accountsPayable || 0;
          const stocks = companyData?.inventoryValue || 0;
          const clients = companyData?.accountsReceivable || 0;
          const fournisseurs = companyData?.accountsPayable || 0;
          const frn = actifsCirculants - passifsCirculants;
          const bfr = (stocks + clients) - fournisseurs;

          const calculated: EquilibreFinancierActuel = {
            fondsRoulementNet: frn,
            besoinFondsRoulement: bfr,
            tresorerieNette: frn - bfr,
            actifsCirculants,
            passifsCirculants,
            stocks,
            clients,
            fournisseurs,
            dateCalcul: new Date().toISOString().split('T')[0]
          };
          setEquilibreActuel(calculated);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'équilibre financier:', error);
        setEquilibreActuel({
          fondsRoulementNet: 0,
          besoinFondsRoulement: 0,
          tresorerieNette: 0,
          actifsCirculants: 0,
          passifsCirculants: 0,
          stocks: 0,
          clients: 0,
          fournisseurs: 0,
          dateCalcul: new Date().toISOString().split('T')[0]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEquilibreFinancier();
  }, [companyData]);

  // Indice d'indépendance financière réel : part des actifs circulants non
  // financée par les dettes fournisseurs (faute de bilan complet en base).
  const actifsCourants = (companyData?.cashBalance || 0) + (companyData?.accountsReceivable || 0) + (companyData?.inventoryValue || 0);
  const dettesCourantes = companyData?.accountsPayable || 0;
  const indiceIndependanceReel = actifsCourants > 0 ? Math.max(0, Math.min(1, 1 - dettesCourantes / actifsCourants)) : 0;

  // Données prévisionnelles par scénario. Les multiplicateurs sont des
  // hypothèses de scénario explicites (facteursVariation ci-dessous),
  // appliquées aux agrégats réels.
  const equilibrePrevisionnel: Record<string, EquilibreFinancierPrevisionnel> = equilibreActuel ? {
    optimiste: {
      frnPrevisionnel: Math.round(equilibreActuel.fondsRoulementNet * 1.15),
      bfrPrevisionnel: Math.round(equilibreActuel.besoinFondsRoulement * 0.90),
      tnPrevisionnelle: Math.round((equilibreActuel.fondsRoulementNet * 1.15) - (equilibreActuel.besoinFondsRoulement * 0.90)),
      capaciteAutofinancement: Math.round(equilibreActuel.fondsRoulementNet * 0.25),
      indiceIndependanceFinanciere: indiceIndependanceReel,
      scenario: 'optimiste',
      periode: '3 mois',
      facteursVariation: {
        hausseVentes: 15,
        variationPrixMatierePremiere: -5,
        delaiClients: -5,
        delaiFournisseurs: 5
      }
    },
    prudent: {
      frnPrevisionnel: Math.round(equilibreActuel.fondsRoulementNet * 1.02),
      bfrPrevisionnel: Math.round(equilibreActuel.besoinFondsRoulement * 1.05),
      tnPrevisionnelle: Math.round((equilibreActuel.fondsRoulementNet * 1.02) - (equilibreActuel.besoinFondsRoulement * 1.05)),
      capaciteAutofinancement: Math.round(equilibreActuel.fondsRoulementNet * 0.15),
      indiceIndependanceFinanciere: indiceIndependanceReel,
      scenario: 'prudent',
      periode: '3 mois',
      facteursVariation: {
        hausseVentes: 5,
        variationPrixMatierePremiere: 2,
        delaiClients: 0,
        delaiFournisseurs: 2
      }
    },
    pessimiste: {
      frnPrevisionnel: Math.round(equilibreActuel.fondsRoulementNet * 0.90),
      bfrPrevisionnel: Math.round(equilibreActuel.besoinFondsRoulement * 1.20),
      tnPrevisionnelle: Math.round((equilibreActuel.fondsRoulementNet * 0.90) - (equilibreActuel.besoinFondsRoulement * 1.20)),
      capaciteAutofinancement: Math.round(equilibreActuel.fondsRoulementNet * 0.05),
      indiceIndependanceFinanciere: indiceIndependanceReel,
      scenario: 'pessimiste',
      periode: '3 mois',
      facteursVariation: {
        hausseVentes: -10,
        variationPrixMatierePremiere: 15,
        delaiClients: 10,
        delaiFournisseurs: -5
      }
    }
  } : {
    optimiste: { frnPrevisionnel: 0, bfrPrevisionnel: 0, tnPrevisionnelle: 0, capaciteAutofinancement: 0, indiceIndependanceFinanciere: 0, scenario: 'optimiste', periode: '', facteursVariation: { hausseVentes: 0, variationPrixMatierePremiere: 0, delaiClients: 0, delaiFournisseurs: 0 } },
    prudent: { frnPrevisionnel: 0, bfrPrevisionnel: 0, tnPrevisionnelle: 0, capaciteAutofinancement: 0, indiceIndependanceFinanciere: 0, scenario: 'prudent', periode: '', facteursVariation: { hausseVentes: 0, variationPrixMatierePremiere: 0, delaiClients: 0, delaiFournisseurs: 0 } },
    pessimiste: { frnPrevisionnel: 0, bfrPrevisionnel: 0, tnPrevisionnelle: 0, capaciteAutofinancement: 0, indiceIndependanceFinanciere: 0, scenario: 'pessimiste', periode: '', facteursVariation: { hausseVentes: 0, variationPrixMatierePremiere: 0, delaiClients: 0, delaiFournisseurs: 0 } }
  };

  // Scénarios de risque
  const scenariosRisque: ScenarioRisque[] = equilibreActuel ? [
    {
      id: 'bfr_increase',
      titre: 'Allongement du délai de paiement clients (+15 jours)',
      description: 'Entraîne une hausse mécanique du BFR et réduit la trésorerie disponible.',
      impactTresorerie: Math.round(- (equilibreActuel.clients || 0) * 0.15),
      probabilite: 'Moyenne',
      gravite: 'Moyenne',
      actionsCorrectrices: ['Relance systématique à J+5', 'Mise en place d\'escomptes pour paiement rapide']
    },
    {
      id: 'supplier_squeeze',
      titre: 'Réduction des délais fournisseurs (-10 jours)',
      description: 'Les fournisseurs exigent des règlements plus rapides, impactant la trésorerie nette.',
      impactTresorerie: Math.round(- (equilibreActuel.fournisseurs || 0) * 0.10),
      probabilite: 'Faible',
      gravite: 'Élevée',
      actionsCorrectrices: ['Négociation d\'étalements de paiement', 'Diversification des sources d\'approvisionnement']
    }
  ] : [];

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case 'optimiste': return 'from-green-50 to-emerald-100 border-green-200 text-green-900';
      case 'prudent': return 'from-blue-50 to-cyan-100 border-blue-200 text-blue-900';
      case 'pessimiste': return 'from-red-50 to-rose-100 border-red-200 text-red-900';
      default: return 'from-gray-50 to-slate-100 border-gray-200 text-gray-900';
    }
  };

  const getTendanceIcon = (valeur: number, seuil: number) => {
    if (valeur > seuil) return <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />;
    if (valeur < seuil) return <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />;
    return <ClockIcon className="h-5 w-5 text-blue-600" />;
  };

  const getNiveauAlerte = (valeur: number, seuils: { critique: number; attention: number }) => {
    if (valeur < seuils.critique) return { niveau: 'critique', couleur: 'red' };
    if (valeur < seuils.attention) return { niveau: 'attention', couleur: 'amber' };
    return { niveau: 'bon', couleur: 'green' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des données d'équilibre financier...</p>
        </div>
      </div>
    );
  }

  if (!equilibreActuel) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Impossible de charger les données d'équilibre financier</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div className="bg-slate-900 text-white rounded-[2rem] shadow-2xl border border-white/5 p-6 sm:p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent)]"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter italic">Équilibre Financier</h1>
            <span className="px-3 py-1 bg-blue-500 text-[9px] font-black uppercase tracking-widest rounded-lg">Live</span>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em] opacity-80 italic">Analyse structurelle & Simulation prédictive</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <p className="text-yellow-800 text-sm font-medium">
          {t('disclaimer')}
        </p>
      </div>

      {/* 1️⃣ Indicateurs de l'équilibre financier instantané */}
      <Card title="1️⃣ Indicateurs de l'Équilibre Financier Instantané (Actual)">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Fonds de Roulement Net */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 italic">Fonds de Roulement Net (FRN)</p>
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-black text-slate-900 tracking-tighter italic">{formatCurrency(equilibreActuel.fondsRoulementNet)}</div>
            {getTendanceIcon(equilibreActuel.fondsRoulementNet, 1000000)}
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <div>Actifs: {formatCurrency(equilibreActuel.actifsCirculants)}</div>
            <div className="mt-1 border-t border-slate-200 pt-1">Passifs: {formatCurrency(equilibreActuel.passifsCirculants)}</div>
          </div>
        </div>

        {/* Besoin en Fonds de Roulement */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 italic">Besoin en Fonds de Roulement (BFR)</p>
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-black text-slate-900 tracking-tighter italic">{formatCurrency(equilibreActuel.besoinFondsRoulement)}</div>
            {getTendanceIcon(equilibreActuel.besoinFondsRoulement, 800000)}
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <div>Stocks/Clients: {formatCurrency(equilibreActuel.stocks + equilibreActuel.clients)}</div>
            <div className="mt-1 border-t border-slate-200 pt-1">Fournisseurs: {formatCurrency(equilibreActuel.fournisseurs)}</div>
          </div>
        </div>

        {/* Trésorerie Nette */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 italic">Trésorerie Nette (TN)</p>
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-black text-slate-900 tracking-tighter italic">{formatCurrency(equilibreActuel.tresorerieNette)}</div>
            {getTendanceIcon(equilibreActuel.tresorerieNette, 300000)}
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            <div>FRN - BFR</div>
          </div>
        </div>
      </div>

        {/* Analyse de la liquidité */}
        <div className="p-6 bg-white border border-gray-200 rounded-lg">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Analyse de la Liquidité et du Financement</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">
                {((equilibreActuel.tresorerieNette / equilibreActuel.besoinFondsRoulement) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-cyan-700">Couverture BFR par TN</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">
                {(equilibreActuel.actifsCirculants / equilibreActuel.passifsCirculants).toFixed(2)}
              </div>
              <div className="text-sm text-cyan-700">Ratio de Liquidité</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">
                {((equilibreActuel.clients / equilibreActuel.fournisseurs) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-cyan-700">Ratio Créances/Dettes</div>
            </div>
          </div>
        </div>
      </Card>

      {/* 2️⃣ Indicateurs prévisionnels */}
      <Card title="2️⃣ Indicateurs de l'Équilibre Financier Prévisionnel (Forecasted)">
        {/* Sélecteur de scénario */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">🎯 Sélection du Scénario</h4>
          <div className="flex flex-wrap gap-3">
            {(['optimiste', 'prudent', 'pessimiste'] as const).map((scenario) => (
              <button
                key={scenario}
                onClick={() => setScenarioActuel(scenario)}
                className={`flex-1 min-w-[140px] px-4 py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
                  scenarioActuel === scenario
                    ? scenario === 'optimiste' 
                      ? 'bg-green-600 text-white' 
                      : scenario === 'prudent'
                      ? 'bg-blue-600 text-white'
                      : 'bg-red-600 text-white'
                    : scenario === 'optimiste'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : scenario === 'prudent'
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                {scenario === 'optimiste' ? '🚀 Optimiste' : 
                 scenario === 'prudent' ? '⚖️ Prudent' : '⚠️ Pessimiste'}
              </button>
            ))}
          </div>
        </div>

        {/* Indicateurs prévisionnels */}
        <div className={`p-6 rounded-xl border ${getScenarioColor(scenarioActuel)}`}>
          <h4 className="text-xl font-bold mb-6">
            Scénario {scenarioActuel === 'optimiste' ? 'Optimiste' : 
                      scenarioActuel === 'prudent' ? 'Prudent' : 'Pessimiste'} - {equilibrePrevisionnel[scenarioActuel].periode}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* FRN Prévisionnel */}
            <div className="bg-white/50 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">FRN Prévisionnel</h5>
              <p className="text-2xl font-bold mb-2">
                {formatCurrency(equilibrePrevisionnel[scenarioActuel].frnPrevisionnel)}
              </p>
              <p className="text-sm opacity-75">
                Capacité à couvrir les engagements futurs
              </p>
            </div>

            {/* BFR Prévisionnel */}
            <div className="bg-white/50 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">BFR Prévisionnel</h5>
              <p className="text-2xl font-bold mb-2">
                {formatCurrency(equilibrePrevisionnel[scenarioActuel].bfrPrevisionnel)}
              </p>
              <p className="text-sm opacity-75">
                Estimation des besoins financiers futurs
              </p>
            </div>

            {/* TN Prévisionnelle */}
            <div className="bg-white/50 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">TN Prévisionnelle</h5>
              <p className={`text-2xl font-bold mb-2 ${
                equilibrePrevisionnel[scenarioActuel].tnPrevisionnelle >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(equilibrePrevisionnel[scenarioActuel].tnPrevisionnelle)}
              </p>
              <p className="text-sm opacity-75">
                {equilibrePrevisionnel[scenarioActuel].tnPrevisionnelle >= 0 ? 'Excédent' : 'Déficit'} anticipé
              </p>
            </div>

            {/* Capacité d'Autofinancement */}
            <div className="bg-white/50 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Capacité d'Autofinancement</h5>
              <p className="text-2xl font-bold mb-2">
                {formatCurrency(equilibrePrevisionnel[scenarioActuel].capaciteAutofinancement)}
              </p>
              <p className="text-sm opacity-75">
                Financement sans endettement
              </p>
            </div>

            {/* Indice d'Indépendance Financière */}
            <div className="bg-white/50 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Indépendance Financière</h5>
              <p className="text-2xl font-bold mb-2">
                {(equilibrePrevisionnel[scenarioActuel].indiceIndependanceFinanciere * 100).toFixed(1)}%
              </p>
              <p className="text-sm opacity-75">
                Part des capitaux propres
              </p>
            </div>

            {/* Facteurs de Variation */}
            <div className="bg-white/50 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">Facteurs de Variation</h5>
              <div className="space-y-1 text-sm">
                <div>Ventes: {equilibrePrevisionnel[scenarioActuel].facteursVariation.hausseVentes > 0 ? '+' : ''}{equilibrePrevisionnel[scenarioActuel].facteursVariation.hausseVentes}%</div>
                <div>Prix MP: {equilibrePrevisionnel[scenarioActuel].facteursVariation.variationPrixMatierePremiere > 0 ? '+' : ''}{equilibrePrevisionnel[scenarioActuel].facteursVariation.variationPrixMatierePremiere}%</div>
                <div>Délai Clients: {equilibrePrevisionnel[scenarioActuel].facteursVariation.delaiClients}j</div>
                <div>Délai Fournisseurs: {equilibrePrevisionnel[scenarioActuel].facteursVariation.delaiFournisseurs}j</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 3️⃣ Gestion des risques */}
      <Card title="3️⃣ Gestion des Risques et Simulation de Scénarios">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenariosRisque.length === 0 && (
            <p className="col-span-full text-center text-sm text-gray-400 py-6">Aucune donnée disponible pour la simulation de risques.</p>
          )}
          {scenariosRisque.map((scenario) => (
            <div key={scenario.id} className={`p-6 rounded-xl border ${
              scenario.gravite === 'Élevée' ? 'bg-red-50 border-red-200' :
              scenario.gravite === 'Moyenne' ? 'bg-amber-50 border-amber-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">{scenario.titre}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  scenario.gravite === 'Élevée' ? 'bg-red-100 text-red-800' :
                  scenario.gravite === 'Moyenne' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  Gravité : {scenario.gravite}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Probabilité:</span>
                  <span className="font-medium">{scenario.probabilite}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Impact trésorerie:</span>
                  <span className={`font-medium ${scenario.impactTresorerie < 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(scenario.impactTresorerie)}</span>
                </div>

                <div className="mt-4">
                  <h5 className="font-medium text-gray-700 mb-2">Actions correctrices:</h5>
                  <ul className="space-y-1">
                    {scenario.actionsCorrectrices.map((mesure: string, idx: number) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start">
                        <CheckCircleIcon className="h-3 w-3 text-green-500 mt-0.5 mr-1 flex-shrink-0" />
                        {mesure}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 4️⃣ Système d'alerte précoce */}
      <Card title="4️⃣ Système d'Alerte Précoce (Early Warning System)">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Alerte Liquidité — couverture réelle du BFR par la trésorerie */}
          {(() => {
            const couverture = equilibreActuel.besoinFondsRoulement !== 0
              ? (equilibreActuel.tresorerieNette / equilibreActuel.besoinFondsRoulement) * 100
              : null;
            const bon = couverture !== null && couverture >= 0;
            return (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center mb-2">
                  <EyeIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <h5 className="font-medium text-blue-900">Liquidité</h5>
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {couverture !== null ? `${couverture.toFixed(1)}%` : '—'}
                </div>
                <div className="text-xs text-blue-700">Couverture BFR</div>
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${bon ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {bon ? '✅ Bon niveau' : '⚠ Trésorerie négative'}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Alerte Rentabilité — marge réelle */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center mb-2">
              <ChartPieIcon className="h-5 w-5 text-green-600 mr-2" />
              <h5 className="font-medium text-green-900">Rentabilité</h5>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">{(companyData?.profitMargin ?? 0).toFixed(1)}%</div>
            <div className="text-xs text-green-700">Marge nette</div>
          </div>

          {/* Alerte Endettement — dettes courantes / actifs courants réels */}
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center mb-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mr-2" />
              <h5 className="font-medium text-amber-900">Endettement</h5>
            </div>
            <div className="text-2xl font-bold text-amber-600 mb-1">
              {(() => {
                const actifs = (companyData?.cashBalance || 0) + (companyData?.accountsReceivable || 0) + (companyData?.inventoryValue || 0);
                const dettes = companyData?.accountsPayable || 0;
                return actifs > 0 ? (dettes / actifs).toFixed(2) : '—';
              })()}
            </div>
            <div className="text-xs text-amber-700">Dettes / Actifs circulants</div>
          </div>

          {/* Alerte Exploitation — flux net réel des 30 derniers jours */}
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center mb-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-purple-600 mr-2" />
              <h5 className="font-medium text-purple-900">Exploitation</h5>
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {formatCurrency((companyData?.revenueMonth || 0) - (companyData?.totalPayables || 0))}
            </div>
            <div className="text-xs text-purple-700">CA mensuel - dettes fournisseurs</div>
          </div>
        </div>
      </Card>

      {/* Actions rapides */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => window.print()}
          className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-xs uppercase tracking-widest shadow-lg">
          📊 Exporter l'Analyse
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold text-xs uppercase tracking-widest shadow-lg">
          🔄 Actualiser
        </button>
      </div>
    </div>
  );
};

export default EquilibreFinancier;




