import { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import type {
  SalesKpis,
  ProductPerformance,
  CategorySplit,
  TopClientSummary,
  ClientMetricsGeneric,
  SalesForecast
} from '@/types/reports';

export interface SalesReportData {
  salesData: SalesKpis;
  topProducts: ProductPerformance[];
  salesByCategory: CategorySplit[];
  topClients: TopClientSummary[];
  clientMetrics: ClientMetricsGeneric;
  forecasts: SalesForecast[];
}

export function useSalesReports(period: string) {
  const [data, setData] = useState<SalesReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    apiClient.get(`/reports/sales?period=${period}`)
      .then(res => {
        setData(res.data as SalesReportData);
      })
      .catch(err => {
        setError(err?.message || 'Erreur lors du chargement des rapports de ventes');
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [period]);

  return { data, loading, error };
}
