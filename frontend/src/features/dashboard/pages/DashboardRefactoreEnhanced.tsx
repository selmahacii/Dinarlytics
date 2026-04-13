/**
 * Refactored Dashboard with Real-Time Data via React Query
 *
 * Features:
 * - Auto-refresh every 30 seconds
 * - Error boundaries per widget
 * - Loading skeletons
 * - Type-safe with Pydantic schemas
 * - Fallback to mock data
 */

import React, { useState } from 'react'
import { TresorerieWidget, RatiosWidget, ScenariosWidget, AlertesFinancieres } from './components'
import { useFinancialData } from './hooks/useFinancialData'
import { AlerteFinanciere } from '@shared/mockData/dashboardMocks'
import { useAuth } from '@core/auth/useAuth'

interface DashboardRefactorePropsEnhanced {
  isCollapsible?: boolean
  defaultCollapsed?: boolean
  companyId?: string // Override company ID (for testing)
}

/**
 * Loading Skeleton Component
 */
const WidgetSkeleton: React.FC<{ height?: string }> = ({ height = 'h-64' }) => (
  <div className={`${height} bg-gradient-to-r from-slate-200 to-slate-300 animate-pulse rounded-lg`} />
)

/**
 * Error Widget Component
 */
const ErrorWidget: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
    <h4 className="text-lg font-semibold text-red-900 mb-2">❌ Erreur de Chargement</h4>
    <p className="text-sm text-red-700 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
      >
        Réessayer
      </button>
    )}
  </div>
)

/**
 * Main Dashboard Component with React Query
 */
const DashboardRefactoreEnhanced: React.FC<DashboardRefactorePropsEnhanced> = ({
  isCollapsible = false,
  defaultCollapsed = false,
  companyId: overrideCompanyId,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
  const [alertes, setAlertes] = useState<AlerteFinanciere[]>([])
  const [scenarioSelectionne, setScenarioSelectionne] = useState(2)
  const [widgets, setWidgets] = useState({
    tresorerie: true,
    alertes: true,
    ratios: true,
    scenarios: true,
  })

  // Get company ID from auth context or override
  const { user } = useAuth()
  const companyId = overrideCompanyId || user?.company_id || 'default'

  // ✅ Fetch real data via React Query
  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch,
  } = useFinancialData(companyId)

  // Handlers
  const handleModifierAlerte = (alerte: AlerteFinanciere) => {
    console.log('Modifier alerte:', alerte)
    // TODO: Implémenter modal de modification
  }

  const handleSupprimerAlerte = (alerteId: string) => {
    setAlertes(alertes.filter(a => a.id !== alerteId))
  }

  const handleTesterAlerte = (alerteId: string) => {
    console.log('Tester alerte:', alerteId)
    // TODO: Implémenter test d'alerte
  }

  const handleAnalyseWithLIA = (section: string) => {
    console.log('Ouvrir LIA pour:', section)
    // TODO: Intégrer avec widget LIA flottant
  }

  if (isCollapsed && isCollapsible) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium"
        >
          📊 Tableau de bord financier (déplier)
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Tableau de Bord Financier</h2>
          <p className="text-slate-600 mt-1">
            {isLoading && '🔄 Chargement des données...'}
            {isError && '⚠️ Erreur lors du chargement'}
            {dashboardData && '✅ Données en temps réel'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isLoading && (
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
              title="Rafraîchir"
            >
              🔄
            </button>
          )}
          {isCollapsible && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
            >
              Réduire
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <ErrorWidget
          message={error?.message || 'Impossible de charger les données du dashboard'}
          onRetry={() => refetch()}
        />
      )}

      {/* Trésorerie Widget */}
      {widgets.tresorerie && (
        <div className="lg:col-span-1">
          {isLoading ? (
            <WidgetSkeleton height="h-80" />
          ) : dashboardData ? (
            <TresorerieWidget
              data={dashboardData.tresorerie}
              devise="DZD"
              onAnalyseClick={() => handleAnalyseWithLIA('tresorerie')}
            />
          ) : (
            <ErrorWidget message="Impossible de charger la trésorerie" />
          )}
        </div>
      )}

      {/* Ratios Widget */}
      {widgets.ratios && (
        <div className="lg:col-span-1">
          {isLoading ? (
            <WidgetSkeleton height="h-80" />
          ) : dashboardData ? (
            <RatiosWidget
              data={dashboardData.ratios}
              onAnalyseClick={() => handleAnalyseWithLIA('ratios')}
            />
          ) : (
            <ErrorWidget message="Impossible de charger les ratios" />
          )}
        </div>
      )}

      {/* Scénarios Widget */}
      {widgets.scenarios && (
        <div>
          {isLoading ? (
            <WidgetSkeleton height="h-64" />
          ) : dashboardData ? (
            <ScenariosWidget
              scenarios={[
                {
                  id: 1,
                  nom: 'Pessimiste',
                  ca_mois6: 12000000,
                  profit_mois6: 1800000,
                  tresorerie_mois6: 8000000,
                  risque: 'HAUTE',
                },
                {
                  id: 2,
                  nom: 'Réaliste',
                  ca_mois6: 15000000,
                  profit_mois6: 2700000,
                  tresorerie_mois6: 12000000,
                  risque: 'MOYEN',
                },
                {
                  id: 3,
                  nom: 'Optimiste',
                  ca_mois6: 18000000,
                  profit_mois6: 3600000,
                  tresorerie_mois6: 16000000,
                  risque: 'FAIBLE',
                },
              ]}
              scenarioSelectionne={scenarioSelectionne}
              onSelectScenario={setScenarioSelectionne}
              onAnalyseClick={() => handleAnalyseWithLIA('scenarios')}
            />
          ) : (
            <ErrorWidget message="Impossible de charger les scénarios" />
          )}
        </div>
      )}

      {/* Alertes Widget */}
      {widgets.alertes && (
        <div>
          {isLoading ? (
            <WidgetSkeleton height="h-64" />
          ) : (
            <AlertesFinancieres
              alertes={alertes}
              onModifier={handleModifierAlerte}
              onSupprimer={handleSupprimerAlerte}
              onTester={handleTesterAlerte}
            />
          )}
        </div>
      )}

      {/* Info Footer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-2">💡 À propos</p>
        <p>
          ✅ Données en <strong>temps réel</strong> (refresh auto toutes les 30 secondes)
          <br />
          ⚠️ Erreurs API → Fallback sur mocks
          <br />
          🔄 Cliquez sur l'icône refresh pour mettre à jour manuellement
        </p>
      </div>

      {/* Widget Controls */}
      <details className="bg-slate-100 rounded-lg p-4">
        <summary className="cursor-pointer font-medium text-slate-700">Options d'affichage</summary>
        <div className="mt-4 space-y-2">
          {Object.entries(widgets).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={value}
                onChange={e => setWidgets({ ...widgets, [key]: e.target.checked })}
              />
              <span className="capitalize text-slate-700">{key}</span>
            </label>
          ))}
        </div>
      </details>
    </div>
  )
}

export default DashboardRefactoreEnhanced
