import React, { useState, useEffect } from 'react';
import { useTranslation } from '@shared/hooks/useTranslation';
import {
  TresorerieWidget,
  AlertesFinancieres,
  RatiosWidget,
  ScenariosWidget
} from '../components';
import { AlerteFinanciere } from '@shared/mockData/dashboardMocks';
import apiClient from '@/services/apiClient';

import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  MagnifyingGlassIcon, 
  DocumentTextIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface DashboardRefactoProps {
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
}

const ReviewerGuide: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-700 mb-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <SparklesIcon className="w-32 h-32 text-white animate-pulse" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-emerald-500 w-3 h-3 rounded-full animate-ping"></div>
          <h3 className="text-white font-bold text-lg uppercase tracking-wider">Guide de l'Évaluateur — Startup.dz</h3>
        </div>
        
        <p className="text-slate-300 mb-6 max-w-2xl text-lg">
          Bienvenue sur le prototype de <span className="text-white font-bold">Dinarlytic</span>. Pour tester efficacement notre solution et comprendre son impact commercial, nous vous recommandons de suivre ces accès rapides :
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/analytics-facturation" 
            className="flex items-center justify-between bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 p-4 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <ChartBarIcon className="w-6 h-6 text-emerald-400" />
              <div className="text-left">
                <span className="block text-white font-bold">Côté Commercial</span>
                <span className="text-slate-400 text-xs">Analyse CA & Clients</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/20 px-2 py-1 rounded text-[10px] font-bold text-emerald-400 animate-bounce">
              CLIQUEZ ICI
            </div>
          </Link>
 
          <Link 
            to="/audit-explorer" 
            className="flex items-center justify-between bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 p-4 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <MagnifyingGlassIcon className="w-6 h-6 text-blue-400" />
              <div className="text-left">
                <span className="block text-white font-bold">Audit & Risques</span>
                <span className="text-slate-400 text-xs">Détection anomalies IA</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-blue-500/20 px-2 py-1 rounded text-[10px] font-bold text-blue-400">
              EXPLORER
            </div>
          </Link>
 
          <Link 
            to="/rapports/analytics" 
            className="flex items-center justify-between bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 p-4 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <DocumentTextIcon className="w-6 h-6 text-purple-400" />
              <div className="text-left">
                <span className="block text-white font-bold">Rapports Complets</span>
                <span className="text-slate-400 text-xs">Pilotage & Reporting</span>
              </div>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

import { useApp } from '@core/context/AppContext';

const DashboardRefactore: React.FC<DashboardRefactoProps> = ({
  isCollapsible = false,
  defaultCollapsed = false
}) => {
  const { t } = useTranslation();
  const { companyData, currentDevise } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [alertes, setAlertes] = useState<AlerteFinanciere[]>([]);
  const [scenarioSelectionne, setScenarioSelectionne] = useState(2); // Scénario réaliste (id=2)

  // Données réelles du backend (/analytics/dashboard) : trésorerie classe 5,
  // ratios calculés sur les écritures approuvées — plus aucune valeur de
  // repli fabriquée (1.8 / 0.65 / 5M DZD...).
  const [dashData, setDashData] = useState<any>(null);

  useEffect(() => {
    apiClient.get<any>('/analytics/dashboard')
      .then(res => setDashData(res.data))
      .catch(err => console.error('Failed to load dashboard analytics', err));
  }, []);

  const tresorerieData = {
    soldeActuel: dashData?.tresorerie?.solde_actuel ?? 0,
    soldeItineraire: dashData?.tresorerie?.solde_itineraire ?? 0,
    entrees30j: dashData?.tresorerie?.entrees_30j ?? 0,
    sorties30j: dashData?.tresorerie?.sorties_30j ?? 0,
    fluxNetMensuel: dashData?.tresorerie?.flux_net_mensuel ?? 0
  };

  const ratiosData = {
    liquidite: dashData?.ratios?.liquidite ?? 0,
    // Le backend renvoie autonomie/endettement en %, le widget attend un ratio.
    autonomieFinanciere: (dashData?.ratios?.autonomie_financiere ?? 0) / 100,
    endettement: (dashData?.ratios?.endettement ?? 0) / 100,
    solvabilite: dashData?.ratios?.solvabilite ?? 0
  };

  // Projections à 6 mois construites sur le CA mensuel réel : sans activité
  // facturée, les scénarios affichent honnêtement 0.
  const baseRevenue = dashData?.ca_mois_courant ?? 0;
  const cashBase = dashData?.tresorerie?.solde_actuel ?? 0;
  const margin = baseRevenue > 0 ? Math.max(0, (dashData?.profit_mois_courant ?? 0) / baseRevenue) : 0;
  const scenariosData = [
    {
      id: 1,
      nom: 'Prudent',
      ca_mois6: Math.round(baseRevenue * 0.9 * 6),
      profit_mois6: Math.round(baseRevenue * 0.9 * 6 * margin),
      tresorerie_mois6: Math.round(cashBase + (baseRevenue * 0.9 * 6 * margin)),
      risque: 'FAIBLE' as const
    },
    {
      id: 2,
      nom: 'Réaliste',
      ca_mois6: Math.round(baseRevenue * 6),
      profit_mois6: Math.round(baseRevenue * 6 * margin),
      tresorerie_mois6: Math.round(cashBase + (baseRevenue * 6 * margin)),
      risque: 'MOYEN' as const
    },
    {
      id: 3,
      nom: 'Optimiste',
      ca_mois6: Math.round(baseRevenue * 1.2 * 6),
      profit_mois6: Math.round(baseRevenue * 1.2 * 6 * margin),
      tresorerie_mois6: Math.round(cashBase + (baseRevenue * 1.2 * 6 * margin)),
      risque: 'HAUTE' as const
    }
  ];

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await apiClient.get<any[]>('/analytics/alerts');
        const data = response.data || [];
        const mapped: AlerteFinanciere[] = data.map((item: any): AlerteFinanciere => ({
          id: item.alert_code || 'alert',
          nom: item.alert_name || 'Alerte',
          description: `Déclenchée si la valeur ${item.comparison_operator || ''} ${item.threshold_value || 0}`,
          statut: item.enabled ? 'Surveillance' : 'Inactive',
          seuil: item.threshold_value || 0,
          valeurActuelle: 0,
          unite: item.alert_code === 'liquidity_ratio' ? 'ratio' : 'DA',
          frequence: 'temps_reel',
          derniereAlerte: null,
          destinataires: ['Admin'],
          active: item.enabled || false
        }));
        setAlertes(mapped);
      } catch (err) {
        console.error("Failed to load alerts", err);
      }
    };
    fetchAlerts();
  }, []);
  const [widgets, setWidgets] = useState({
    tresorerie: true,
    alertes: true,
    ratios: true,
    scenarios: true
  });

  // Handlers
  const handleModifierAlerte = (alerte: AlerteFinanciere) => {
    console.log('Modifier alerte:', alerte);
    // TODO: Implémenter modal de modification
  };

  const handleSupprimerAlerte = (alerteId: string) => {
    setAlertes(alertes.filter(a => a.id !== alerteId));
  };

  const handleTesterAlerte = (alerteId: string) => {
    console.log('Tester alerte:', alerteId);
    // TODO: Implémenter test d'alerte
  };

  const handleDeclencherAlerte = (alerteId: string) => {
    console.log('Déclencher alerte:', alerteId);
    // TODO: Implémenter déclenchement manuel
  };

  const handleAnalyseWithLIA = (section: string) => {
    console.log('Ouvrir LIA pour:', section);
    // TODO: Intégrer avec widget LIA flottant
  };

  if (isCollapsed && isCollapsible) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium"
        >
          {t('dashboard.collapsed_title')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{t('dashboard.title')}</h2>
          <p className="text-sm sm:text-base text-slate-600 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        {isCollapsible && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="w-full sm:w-auto px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors bg-white sm:bg-transparent border border-slate-200 sm:border-transparent rounded-lg"
          >
            {t('dashboard.reduce_btn')}
          </button>
        )}
      </div>

      {/* Guide de l'évaluateur */}
      <ReviewerGuide />

      {/* Widgets principaux - Grille responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trésorerie */}
        {widgets.tresorerie && (
          <TresorerieWidget
            data={tresorerieData}
            devise={currentDevise}
            onAnalyseClick={() => handleAnalyseWithLIA('tresorerie')}
          />
        )}

        {/* Ratios */}
        {widgets.ratios && (
          <RatiosWidget
            data={ratiosData}
            onAnalyseClick={() => handleAnalyseWithLIA('ratios')}
          />
        )}
      </div>

      {/* Scénarios - Full width */}
      {widgets.scenarios && (
        <ScenariosWidget
          scenarios={scenariosData}
          scenarioSelectionne={scenarioSelectionne}
          onSelectScenario={setScenarioSelectionne}
          onAnalyseClick={() => handleAnalyseWithLIA('scenarios')}
        />
      )}

      {/* Alertes - Full width */}
      {widgets.alertes && (
        <AlertesFinancieres
          alertes={alertes}
          onModifier={handleModifierAlerte}
          onSupprimer={handleSupprimerAlerte}
          onTester={handleTesterAlerte}
          onDeclencher={handleDeclencherAlerte}
        />
      )}

      {/* Widget Controls (Debug) */}
      <details className="bg-slate-100 rounded-lg p-4">
        <summary className="cursor-pointer font-medium text-slate-700">{t('dashboard.options_title')}</summary>
        <div className="mt-4 space-y-2">
          {Object.entries(widgets).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={value}
                onChange={e => setWidgets({ ...widgets, [key]: e.target.checked })}
              />
              <span className="text-slate-700">{t(`dashboard.widgets.${key}.title`)}</span>
            </label>
          ))}
        </div>
      </details>
    </div>
  );
};

export default DashboardRefactore;
