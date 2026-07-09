import { useQuery, UseQueryResult } from '@tanstack/react-query'
import apiClient from '@services/apiClient'
import { FinancialDashboardSchema } from '@backend/core/schemas'

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
  return useQuery({
    queryKey: ['financial-dashboard', companyId],
    queryFn: async () => {
      const response = await apiClient.get<FinancialDashboardSchema>('/analytics/dashboard', {
        params: { company_id: companyId },
      })
      return response.data
    },
    refetchInterval: 30000,
    retry: 2,
    keepPreviousData: true,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    ...options,
  })
}

export function useFinancialKPIs(companyId: string) {
  return useQuery({
    queryKey: ['financial-kpis', companyId],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/kpis', {
        params: { company_id: companyId },
      })
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
