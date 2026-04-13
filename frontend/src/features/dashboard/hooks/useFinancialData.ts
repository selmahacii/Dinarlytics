/**
 * React Query Hook for Financial Dashboard Data
 *
 * Features:
 * - Auto-refresh every 30 seconds
 * - Fallback to mock data if API fails
 * - Type-safe with Pydantic schemas
 * - Error handling and loading states
 * - Optimistic updates (future)
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query'
import apiClient from '@services/apiClient'
import { FinancialDashboardSchema } from '@backend/core/schemas'
import {
  INDICATEURS_FINANCIERS_MOCK,
  RATIOS_FINANCIERS_MOCK,
  SCENARIOS_MOCK,
} from '@shared/mockData/dashboardMocks'

export interface UseFinancialDataResult {
  data: FinancialDashboardSchema | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Fetch financial dashboard data from API or use mocks
 *
 * @param companyId - Company ID for multi-tenant filtering
 * @param options - React Query options (override defaults)
 * @returns Dashboard data with loading/error states
 */
export function useFinancialData(
  companyId: string,
  options?: any
): UseQueryResult<FinancialDashboardSchema, Error> {
  return useQuery({
    queryKey: ['financial-dashboard', companyId],
    queryFn: async () => {
      try {
        console.log('🔄 Fetching financial dashboard data...')
        const response = await apiClient.get<FinancialDashboardSchema>('/analytics/dashboard', {
          params: { company_id: companyId },
        })
        console.log('✅ Dashboard data fetched successfully')
        return response.data
      } catch (error) {
        console.warn('⚠️ Failed to fetch dashboard data, using mock data')
        // Fallback to mock data
        return {
          tresorerie: INDICATEURS_FINANCIERS_MOCK.tresorerie,
          ventes_12_mois: INDICATEURS_FINANCIERS_MOCK.ventesmois,
          ratios: INDICATEURS_FINANCIERS_MOCK.ratios,
          ca_mois_courant: 2450000,
          profit_mois_courant: 350000,
          created_at: new Date(),
        } as FinancialDashboardSchema
      }
    },
    // Refresh every 30 seconds
    refetchInterval: 30000,
    // Retry 2 times on failure
    retry: 2,
    // Keep previous data while refetching
    keepPreviousData: true,
    // Cache for 30 seconds
    staleTime: 30000,
    // Don't cache for longer than 5 minutes
    gcTime: 5 * 60 * 1000,
    ...options,
  })
}

/**
 * Fetch KPIs (Key Performance Indicators)
 */
export function useFinancialKPIs(companyId: string) {
  return useQuery({
    queryKey: ['financial-kpis', companyId],
    queryFn: async () => {
      const response = await apiClient.get('/analytics/kpis', {
        params: { company_id: companyId },
      })
      return response.data
    },
    refetchInterval: 60000, // Every minute
    retry: 2,
  })
}

/**
 * Fetch financial scenarios
 */
export function useFinancialScenarios(companyId: string) {
  return useQuery({
    queryKey: ['financial-scenarios', companyId],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/analytics/scenarios', {
          params: { company_id: companyId },
        })
        return response.data
      } catch {
        // Fallback to mock
        return SCENARIOS_MOCK
      }
    },
    staleTime: 60000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Batch hook - fetch all financial data at once
 */
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
