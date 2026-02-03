import React from 'react';
import {
  BoltIcon,
  ChartBarIcon,
  LinkIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  PrinterIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export interface AnalysisRunData {
  steps: Array<{
    title: string;
    subtitle?: string;
    details?: string[];
    status: 'ok' | 'warn';
  }>;
  stats: {
    trends: number;
    recommendations: number;
    correlations: number;
    alerts: number;
    score: number; // 0..100
    scoreLabel: string;
  };
  textReport: string;
}

interface AnalysisRunReportProps {
  isOpen: boolean;
  onClose: () => void;
  data?: AnalysisRunData;
}

const defaultData: AnalysisRunData = {
  steps: [
    {
      title: 'Initialisation de l’analyse',
      subtitle: 'Connexion au moteur LIA',
      details: ['Connexion établie • 5 347 lignes chargées'],
      status: 'ok'
    },
    {
      title: 'Détection de tendances',
      subtitle: 'Analyse des variations temporelles',
      details: [
        'Tendance positive: Chiffre d’affaires +8,3%',
        'Progression sur 3 mois • Pic en mai: +14%'
      ],
      status: 'ok'
    },
    {
      title: 'Analyse des corrélations',
      subtitle: 'Recherche de relations entre indicateurs',
      details: [
        'Corrélation forte détectée (r = 0,94)',
        'Hausse ventes → Hausse TVA nette • CA +10% ≈ TVA +18%'
      ],
      status: 'ok'
    },
    {
      title: 'Génération de recommandations',
      subtitle: 'Optimisations possibles',
      details: [
        'Réduire stock dormant: 12 produits (>90j) • Valeur: 285 000 DA • Impact estimé: +18% liquidité'
      ],
      status: 'ok'
    },
    {
      title: 'Détection d’alertes prédictives',
      subtitle: 'Identification des risques',
      details: [
        'Vigilance: DSO à 45 jours (+5j) • Risque trésorerie',
        'Action: Relancer 8 factures en retard (>30j)'
      ],
      status: 'warn'
    },
    {
      title: 'Analyse terminée',
      subtitle: 'Rapport IA généré avec succès',
      details: [],
      status: 'ok'
    }
  ],
  stats: {
    trends: 3,
    recommendations: 5,
    correlations: 2,
    alerts: 1,
    score: 87,
    scoreLabel: 'Excellente performance'
  },
  textReport: [
    '🔄 Initialisation de l’analyse',
    'Connexion au moteur LIA…',
    '✓ Connexion établie • 5 347 lignes chargées',
    '',
    '📊 Détection de tendances',
    'Analyse des variations temporelles…',
    '✅ Tendance positive: Chiffre d’affaires +8,3%',
    'Progression sur 3 mois • Pic en mai: +14%',
    '',
    '🔗 Analyse des corrélations',
    'Recherche de relations entre indicateurs…',
    '🔗 Corrélation forte détectée (r = 0,94)',
    'Hausse ventes → Hausse TVA nette • CA +10% ≈ TVA +18%',
    '',
    '💡 Génération de recommandations',
    'Optimisations possibles…',
    '💡 Recommandation: Réduire stock dormant',
    '12 produits (>90 jours) • Valeur: 285 000 DA • Impact: +18% liquidité',
    '',
    '⚠️ Détection d’alertes prédictives',
    'Identification des risques…',
    '⚠️ Vigilance: DSO à 45 jours (+5j)',
    'Risque trésorerie • Action: Relancer 8 factures en retard (>30j)',
    '',
    '✅ Analyse terminée',
    'Rapport IA complet généré avec succès',
    '',
    'Tendances détectées: 3',
    'Recommandations: 5',
    'Corrélations: 2',
    'Alertes: 1',
    'Score de santé financière: 87 / 100 — Excellente performance'
  ].join('\n')
};

const AnalysisRunReport: React.FC<AnalysisRunReportProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;
  const d = data || defaultData;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(d.textReport);
      // Optional: we could show a toast; keeping it simple without external deps
    } catch (e) {
      console.error('Clipboard error', e);
    }
  };

  const scoreColor = d.stats.score >= 85
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : d.stats.score >= 70
    ? 'bg-amber-100 text-amber-800 border-amber-200'
    : 'bg-red-100 text-red-800 border-red-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-200 rounded-lg">
              <BoltIcon className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Rapport d’exécution IA</h2>
              <p className="text-xs text-slate-500">Traçabilité des étapes et synthèse</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={copyToClipboard}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded"
              aria-label="Copier le rapport"
              title="Copier le rapport"
            >
              <ClipboardDocumentIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded"
              aria-label="Imprimer"
              title="Imprimer"
            >
              <PrinterIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded"
              aria-label="Fermer le rapport"
              title="Fermer"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600">Tendances</p>
                <p className="text-2xl font-extrabold text-slate-900">{d.stats.trends}</p>
              </div>
              <ChartBarIcon className="h-5 w-5 text-slate-500" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600">Recommandations</p>
                <p className="text-2xl font-extrabold text-slate-900">{d.stats.recommendations}</p>
              </div>
              <LightBulbIcon className="h-5 w-5 text-slate-500" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600">Corrélations</p>
                <p className="text-2xl font-extrabold text-slate-900">{d.stats.correlations}</p>
              </div>
              <LinkIcon className="h-5 w-5 text-slate-500" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600">Alertes</p>
                <p className="text-2xl font-extrabold text-slate-900">{d.stats.alerts}</p>
              </div>
              <ExclamationTriangleIcon className="h-5 w-5 text-slate-500" />
            </div>
          </div>

          {/* Score */}
          <div className={`border rounded-xl p-4 ${scoreColor}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="h-5 w-5" />
                <span className="text-sm font-semibold">Score de santé financière</span>
              </div>
              <div className="text-xl font-black">{d.stats.score} / 100</div>
            </div>
            <div className="text-sm mt-1">{d.stats.scoreLabel}</div>
          </div>

          {/* Steps timeline */}
          <div className="space-y-4">
            {d.steps.map((s, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className={`mt-1 h-5 w-5 rounded-full flex items-center justify-center border ${s.status === 'ok' ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-amber-100 border-amber-200 text-amber-700'}`}>
                  {s.status === 'ok' ? '✓' : '!'}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{s.title}</div>
                  {s.subtitle && <div className="text-xs text-slate-600">{s.subtitle}</div>}
                  {s.details && s.details.length > 0 && (
                    <ul className="mt-1 text-sm text-slate-700 list-disc pl-5 space-y-0.5">
                      {s.details.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisRunReport;
