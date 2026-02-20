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
      setLoadingCharts(true);
      setErrorCharts(null);

      // MOCK DATA GENERATION
      const mockData: ChartDataSet = {
        sales: {
          months: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
          revenue: [850000, 920000, 980000, 890000, 1050000, 1100000],
          target: [900000, 950000, 1000000, 950000, 1100000, 1150000]
        },
        expenses: {
          categories: ['Salaires', 'Loyer', 'Marketing', 'Opérations', 'Taxes'],
          amounts: [450000, 120000, 85000, 65000, 42000]
        },
        performanceMetrics: {
          roe: [12, 12.5, 13.1, 12.8, 13.4, 14.1],
          roa: [8.5, 8.7, 9.0, 8.8, 9.2, 9.5],
          margin: [35, 36, 35.5, 36.2, 37, 37.5]
        },
        cashFlow: {
          months: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
          inflow: [850000, 920000, 980000, 890000, 1050000, 1100000],
          outflow: [620000, 680000, 720000, 650000, 780000, 820000]
        }
      };

      // Simulate delay
      setTimeout(() => {
        setChartData(mockData);
        setLoadingCharts(false);
      }, 800);
    };

    fetchChartData();

    /* Real API Call Commented
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
    */
  }, []);

  return { chartData, loadingCharts, errorCharts };
};
