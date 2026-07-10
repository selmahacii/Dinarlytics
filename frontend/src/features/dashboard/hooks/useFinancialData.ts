import { useQuery, UseQueryResult } from '@tanstack/react-query'
import apiClient from '@/services/apiClient'

// Miroir du FinancialDashboardSchema renvoyé par GET /analytics/dashboard.
export interface FinancialDashboardSchema {
  tresorerie: {
    solde_actuel: number
    solde_itineraire: number
    entrees_30j: number
    sorties_30j: number
    flux_net_mensuel: number
  }
  ventes_12_mois: Array<{ mois: string; valeur: number }>
  ratios: {
    liquidite: number
    autonomie_financiere: number
    endettement: number
    solvabilite: number
  }
  ca_mois_courant: number
  profit_mois_courant: number
  created_at: string
}

export interface UseFinancialDataResult {
  data: FinancialDashboardSchema | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

export function useFinancialData(
  companyId: string,
  options?: any
): UseQueryResult<FinancialDashboardSchema, Error> {
  return useQuery<FinancialDashboardSchema, Error>({
    queryKey: ['financial-dashboard', companyId],
    queryFn: async () => {
      const response = await apiClient.get<FinancialDashboardSchema>('/analytics/dashboard')
      return response.data
    },
    refetchInterval: 30000,
    retry: 2,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    ...options,
  })
}

export function useFinancialKPIs(companyId: string) {
  return useQuery({
    queryKey: ['financial-kpis', companyId],
    queryFn: async () => {
      // /analytics/kpis n'existe pas côté backend ; l'endpoint réel des KPIs
      // financiers est /analytics/financial-health (la société est déduite du
      // token, pas d'un paramètre).
      const response = await apiClient.get('/analytics/financial-health')
      return response.data
    },
    refetchInterval: 60000,
    retry: 2,
  })
}

export function useFinancialScenarios(companyId: string) {
  return useQuery({
    queryKey: ['financial-scenarios', companyId],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/scenarios', {
        params: { company_id: companyId },
      })
      return response.data
    },
    staleTime: 60000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useAllFinancialData(companyId: string) {
  const dashboard = useFinancialData(companyId)
  const kpis = useFinancialKPIs(companyId)
  const scenarios = useFinancialScenarios(companyId)

  return {
    dashboard,
    kpis,
    scenarios,
    isLoading: dashboard.isLoading || kpis.isLoading || scenarios.isLoading,
    isError: dashboard.isError || kpis.isError || scenarios.isError,
    refetch: () => {
      dashboard.refetch()
      kpis.refetch()
      scenarios.refetch()
    },
  }
}

export default useFinancialData
