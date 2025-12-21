/**
 * 🎨 COMPOSANTS MODULE - Prêts à utiliser dans le Dashboard
 * 
 * Chaque composant affiche un module selon les données enrichies
 */

import React from 'react';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

// ============================================
// 🏦 CARD TRÉSORERIE
// ============================================
export const TresorerieCard: React.FC<{
  data: any;
  segment: string;
}> = ({ data, segment }) => {
  if (!data) return null;

  const previsions = data.tresorerie?.previsionsCash || [];
  const rapprochement = data.tresorerie?.rapprochementBancaire;

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <CurrencyDollarIcon className="w-5 h-5 text-emerald-600" />
          Trésorerie
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          rapprochement?.reconciliated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {rapprochement?.reconciliated ? '✅ Rapproché' : '⏳ À valider'}
        </span>
      </div>

      {/* Solde */}
      <div className="mb-4 p-3 bg-emerald-50 rounded">
        <p className="text-xs text-slate-600 mb-1">Solde Initial</p>
        <p className="text-2xl font-bold text-emerald-600">
          {(data.tresorerie?.soldeInitial || 0).toLocaleString('fr-FR')} DA
        </p>
      </div>

      {/* Comptes si multi-comptes */}
      {segment !== 'micro' && data.tresorerie?.comptes && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-semibold text-slate-600">Comptes Bancaires</p>
          {data.tresorerie.comptes.map((compte: any) => (
            <div key={compte.id} className="flex justify-between text-sm">
              <span className="text-slate-700">{compte.name}</span>
              <span className="font-semibold text-slate-900">
                {(compte.balance || 0).toLocaleString('fr-FR')} DA
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Prévisions */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-600">Prévisions 5 jours</p>
        <div className="space-y-1">
          {previsions.slice(0, 3).map((prev: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{prev.date}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  prev.trend === 'up' ? 'bg-green-100 text-green-700' :
                  prev.trend === 'down' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {prev.trend === 'up' ? '↗' : prev.trend === 'down' ? '↘' : '→'}
                </span>
                <span className="font-semibold text-slate-900">
                  {(prev.solde || 0).toLocaleString('fr-FR')} DA
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Écarts de rapprochement */}
      {rapprochement?.ecarts && rapprochement.ecarts.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-600 mb-2">Écarts Rapprochement</p>
          <div className="space-y-1">
            {rapprochement.ecarts.map((ecart: any) => (
              <div key={ecart.id} className="text-xs flex justify-between p-2 bg-yellow-50 rounded">
                <span className="text-slate-700">{ecart.description}</span>
                <span className="font-semibold text-yellow-700">{(ecart.montant || 0).toLocaleString('fr-FR')} DA</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// 📊 CARD BI/ANALYTICS
// ============================================
export const BiAnalyticsCard: React.FC<{
  data: any;
  segment: string;
}> = ({ data, segment }) => {
  if (!data?.analytics) return null;

  const predictions = data.analytics.predictions;
  const comparisons = data.analytics.comparisons || [];

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5 text-blue-600" />
          BI/Analytics
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          predictions.confidence > 0.85 ? 'bg-green-100 text-green-800' :
          predictions.confidence > 0.75 ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          Confiance: {Math.round(predictions.confidence * 100)}%
        </span>
      </div>

      {/* Prédiction Revenue */}
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <p className="text-xs text-slate-600 mb-1">Prédiction Mois Prochain</p>
        <p className="text-2xl font-bold text-blue-600">
          {(predictions.nextMonthRevenue || 0).toLocaleString('fr-FR')} DA
        </p>
        <p className={`text-xs mt-1 ${predictions.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {predictions.trend === 'up' ? '↗ Tendance positive' : '↘ Tendance baisse'}
        </p>
      </div>

      {/* Comparaisons */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-600 mb-2">Historique & Forecast</p>
        <div className="space-y-1">
          {comparisons.map((comp: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-slate-600 w-24">{comp.period}</span>
              <div className={`flex-1 h-6 rounded mx-2 ${
                idx === 0 ? 'bg-blue-200' :
                idx === 1 ? 'bg-blue-300' :
                idx === 2 ? 'bg-blue-400' :
                'bg-blue-500'
              }`}></div>
              <span className="font-semibold text-slate-900 w-24 text-right">
                {(comp.value || 0).toLocaleString('fr-FR')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Best/Worst Case (Enterprise seulement) */}
      {segment === 'enterprise' && predictions.bestCase && (
        <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2">
          <div className="p-2 bg-green-50 rounded">
            <p className="text-xs text-slate-600">Best Case</p>
            <p className="font-semibold text-green-700">
              {(predictions.bestCase || 0).toLocaleString('fr-FR')} DA
            </p>
          </div>
          <div className="p-2 bg-red-50 rounded">
            <p className="text-xs text-slate-600">Worst Case</p>
            <p className="font-semibold text-red-700">
              {(predictions.worstCase || 0).toLocaleString('fr-FR')} DA
            </p>
          </div>
        </div>
      )}

      {/* Par division/client */}
      {data.analytics.byDivision && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-xs font-semibold text-slate-600 mb-2">Par Division</p>
          {data.analytics.byDivision.map((div: any) => (
            <div key={div.division} className="text-xs flex justify-between p-2 mb-1 bg-slate-50 rounded">
              <span className="text-slate-700">{div.division}</span>
              <span className="font-semibold text-slate-900">{Math.round(div.share * 100)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// ✅ CARD WORKFLOW APPROBATIONS
// ============================================
export const WorkflowCard: React.FC<{
  data: any;
}> = ({ data }) => {
  if (!data?.workflows) return null;

  const pendingApprovals = data.pendingApprovals || [];

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <CheckCircleIcon className="w-5 h-5 text-purple-600" />
          Workflows Approbations
        </h3>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
          {pendingApprovals.length} en attente
        </span>
      </div>

      {pendingApprovals.length === 0 ? (
        <p className="text-sm text-slate-500 py-4">Aucune approbation en attente</p>
      ) : (
        <div className="space-y-3">
          {pendingApprovals.slice(0, 3).map((wf: any) => (
            <div key={wf.id} className="p-3 bg-slate-50 rounded border border-slate-200">
              <p className="font-semibold text-slate-800 text-sm">{wf.name}</p>
              <p className="text-xs text-slate-600 mb-2">Ref: {wf.owner}</p>
              
              {/* Étapes */}
              <div className="space-y-1">
                {wf.steps.map((step: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      step.status === 'completed' ? 'bg-green-600' :
                      step.status === 'in-progress' ? 'bg-blue-600' :
                      'bg-gray-400'
                    }`}>
                      {step.status === 'completed' ? '✓' : step.step}
                    </div>
                    <span className="text-slate-600">
                      {step.role} - {step.action}
                    </span>
                  </div>
                ))}
              </div>

              {/* Montant si applicable */}
              {wf.amount && (
                <p className="mt-2 text-xs font-semibold text-slate-900">
                  Montant: {(wf.amount || 0).toLocaleString('fr-FR')} DA
                </p>
              )}
              
              {/* Due date */}
              {wf.dueDate && (
                <p className="text-xs text-slate-500 mt-1">À faire avant: {wf.dueDate}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// 📈 CARD CONSOLIDATION
// ============================================
export const ConsolidationCard: React.FC<{
  data: any;
}> = ({ data }) => {
  if (!data?.consolidation) return null;

  const subsidiaries = data.consolidation.subsidiaries || [];

  return (
    <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <BuildingOfficeIcon className="w-5 h-5 text-indigo-600" />
          Consolidation Groupe
        </h3>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          {subsidiaries.length} filiales
        </span>
      </div>

      {/* Parent Company */}
      <div className="mb-4 p-3 bg-indigo-50 rounded">
        <p className="text-xs text-slate-600 mb-1">Société Mère</p>
        <p className="font-bold text-slate-800">{data.company}</p>
      </div>

      {/* Filiales */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-600 mb-2">Filiales Consolidées</p>
        {subsidiaries.map((sub: any) => (
          <div key={sub.id} className={`p-3 rounded border ${
            sub.status === 'consolidated' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex justify-between items-start mb-1">
              <p className="font-semibold text-slate-800 text-sm">{sub.name}</p>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                sub.status === 'consolidated' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'
              }`}>
                {sub.status === 'consolidated' ? '✅' : '⏳'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-slate-600">CA</p>
                <p className="font-semibold text-slate-900">{(sub.revenue / 1000000).toFixed(0)}M DA</p>
              </div>
              <div>
                <p className="text-slate-600">Marge</p>
                <p className="font-semibold text-slate-900">{Math.round(sub.profitMargin * 100)}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Infos consolidation */}
      {data.consolidation && (
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-600">Dernière consolidation:</span>
            <span className="font-semibold text-slate-900">{data.consolidation.lastConsolidation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Prochaine:</span>
            <span className="font-semibold text-slate-900">{data.consolidation.nextConsolidation}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// 🎨 EXPORT TOUS LES COMPOSANTS
// ============================================
export const MODULE_COMPONENTS = {
  TresorerieCard,
  BiAnalyticsCard,
  WorkflowCard,
  ConsolidationCard
};

export default MODULE_COMPONENTS;
