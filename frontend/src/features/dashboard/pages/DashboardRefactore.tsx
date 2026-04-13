import React, { useState } from 'react';
import { useTranslation } from '@shared/hooks/useTranslation';
import {
  TresorerieWidget,
  AlertesFinancieres,
  RatiosWidget,
  ScenariosWidget
} from '../components';
import {
  ALERTES_FINANCIERES_MOCK,
  INDICATEURS_FINANCIERS_MOCK,
  RATIOS_FINANCIERS_MOCK,
  SCENARIOS_MOCK,
  AlerteFinanciere
} from '@shared/mockData/dashboardMocks';

interface DashboardRefactoProps {
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
}

const DashboardRefactore: React.FC<DashboardRefactoProps> = ({
  isCollapsible = false,
  defaultCollapsed = false
}) => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [alertes, setAlertes] = useState<AlerteFinanciere[]>(ALERTES_FINANCIERES_MOCK);
  const [scenarioSelectionne, setScenarioSelectionne] = useState(2); // Scénario réaliste (id=2)
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t('dashboard.title')}</h2>
          <p className="text-slate-600 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        {isCollapsible && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            {t('dashboard.reduce_btn')}
          </button>
        )}
      </div>

      {/* Widgets principaux - Grille responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trésorerie */}
        {widgets.tresorerie && (
          <TresorerieWidget
            data={INDICATEURS_FINANCIERS_MOCK.tresorerie}
            devise="DZD"
            onAnalyseClick={() => handleAnalyseWithLIA('tresorerie')}
          />
        )}

        {/* Ratios */}
        {widgets.ratios && (
          <RatiosWidget
            data={INDICATEURS_FINANCIERS_MOCK.ratios}
            onAnalyseClick={() => handleAnalyseWithLIA('ratios')}
          />
        )}
      </div>

      {/* Scénarios - Full width */}
      {widgets.scenarios && (
        <ScenariosWidget
          scenarios={SCENARIOS_MOCK}
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

      {/* Footer Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-2">{t('dashboard.demo_notice_title')}</p>
        <p>{t('dashboard.demo_notice_text')}</p>
      </div>

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
              <span className="capitalize text-slate-700">{t(`dashboard.widgets.${key}`)}</span>
            </label>
          ))}
        </div>
      </details>
    </div>
  );
};

export default DashboardRefactore;
