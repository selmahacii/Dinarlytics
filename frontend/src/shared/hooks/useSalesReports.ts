import { useState, useEffect } from 'react';
import axios from 'axios';
import type {
  SalesKpis,
  ProductPerformance,
  CategorySplit,
  TopClientDetail,
  TopClientSummary,
  ClientMetricsGeneric
} from '@/types/reports';

export interface SalesReportData {
  salesData: SalesKpis;
  topProducts: ProductPerformance[];
  salesByCategory: CategorySplit[];
  topClients: TopClientSummary[];
  clientMetrics: ClientMetricsGeneric;
}

export function useSalesReports(period: string) {
  const [data, setData] = useState<SalesReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`/api/v1/reports/sales?period=${period}`)
      .then(res => {
        setData(res.data as SalesReportData);
        setLoading(false);
      })
      .catch(err => {
        setError(err?.message || 'Erreur lors du chargement des rapports de ventes');
        setLoading(false);
      });
  }, [period]);

  return { data, loading, error };
}


