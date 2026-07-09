import { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';

type ChartDataSet = {
  sales: {
    months: string[];
    revenue: number[];
    target: number[];
  };
  expenses: {
    categories: string[];
    amounts: number[];
  };
  performanceMetrics: {
    roe: number[];
    roa: number[];
    margin: number[];
  };
  cashFlow: {
    months: string[];
    inflow: number[];
    outflow: number[];
  };
};

export const useChartData = () => {
  const [chartData, setChartData] = useState<ChartDataSet | null>(null);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [errorCharts, setErrorCharts] = useState<string | null>(null);

  useEffect(() => {
    setLoadingCharts(true);
    setErrorCharts(null);

    apiClient.get<ChartDataSet>('/documents/chart-data')
      .then(res => {
        setChartData(res.data);
      })
      .catch(err => {
        setErrorCharts(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
        setChartData(null);
      })
      .finally(() => {
        setLoadingCharts(false);
      });
  }, []);

  return { chartData, loadingCharts, errorCharts };
};
