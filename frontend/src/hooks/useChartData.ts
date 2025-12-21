import { useState, useEffect } from 'react';
import axios from 'axios';

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
    const fetchChartData = async () => {
      try {
        setLoadingCharts(true);
        // Fetch from multiple endpoints if available, or use aggregated endpoint
        const response = await axios.get<ChartDataSet>('/api/v1/documents/chart-data');
        setChartData(response.data);
        setErrorCharts(null);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur lors du chargement des données';
        setErrorCharts(message);
        setChartData(null);
      } finally {
        setLoadingCharts(false);
      }
    };

    fetchChartData();
  }, []);

  return { chartData, loadingCharts, errorCharts };
};
