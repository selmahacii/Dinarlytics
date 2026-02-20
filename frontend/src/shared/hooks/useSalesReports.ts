import { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';
import type {
  SalesKpis,
  ProductPerformance,
  CategorySplit,
  TopClientDetail,
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

    // MOCK DATA GENERATION - Reactive to period
    const isDay = period === 'jour';
    const factor = isDay ? 1 / 25 : 1;

    const mockData: SalesReportData = {
      salesData: {
        ca: { value: Math.round(2450000 * factor), change: isDay ? 2.3 : 12.5, trend: 'up' },
        margeBrute: 45.2,
        facturesEmises: Math.round(342 * factor) || 12,
        panierMoyen: 8500,
        tauxRemise: 2.1,
        clientsActifs: Math.round(145 * factor) || 18,
        nouveauxClients: isDay ? 1 : 12
      },
      topProducts: [
        { name: "Service Conseil Premium", quantity: Math.round(45 * factor) || 2, sales: Math.round(850000 * factor), evolution: 8.2, percentage: 34.6 },
        { name: "Licence Logiciel Enterprise", quantity: Math.round(12 * factor) || 1, sales: Math.round(620000 * factor), evolution: 15.4, percentage: 25.3 },
        { name: "Maintenance Annuelle", quantity: Math.round(89 * factor) || 5, sales: Math.round(445000 * factor), evolution: -2.1, percentage: 18.2 },
        { name: "Pack Formation LIA", quantity: Math.round(24 * factor) || 1, sales: Math.round(310000 * factor), evolution: 24.5, percentage: 12.6 },
        { name: "Audit Sécurité V2", quantity: Math.round(8 * factor) || 1, sales: Math.round(225000 * factor), evolution: 5.0, percentage: 9.3 }
      ],
      salesByCategory: [
        { category: "Services", amount: Math.round(1385000 * factor), percentage: 56.5, trend: 12, color: "bg-slate-900" },
        { category: "Licences", amount: Math.round(620000 * factor), percentage: 25.3, trend: 8, color: "bg-slate-500" },
        { category: "Formations", amount: Math.round(310000 * factor), percentage: 12.6, trend: 15, color: "bg-slate-300" },
        { category: "Autres", amount: Math.round(135000 * factor), percentage: 5.6, trend: -2, color: "bg-slate-100" }
      ],
      topClients: [
        { id: 'c-002', name: "Cévital SPA", sales: Math.round(450000 * factor), orders: Math.round(12 * factor) || 1, avgBasket: 37500, trend: 15 },
        { id: 'c-001', name: "Sonatrach", sales: Math.round(380000 * factor), orders: Math.round(5 * factor) || 1, avgBasket: 76000, trend: 8 },
        { id: 'c-003', name: "Ooredoo Algérie", sales: Math.round(290000 * factor), orders: Math.round(8 * factor) || 1, avgBasket: 36250, trend: 12 },
        { id: 'c-004', name: "Djezzy", sales: Math.round(210000 * factor), orders: Math.round(6 * factor) || 1, avgBasket: 35000, trend: -5 }
      ],
      clientMetrics: {
        totalClients: 280,
        clientsActifs: Math.round(145 * factor) || 18,
        nouveauxClients: isDay ? 1 : 12,
        dsoMoyen: 24,
        tauxImpayes: 1.5,
        tauxFidelisation: 78.5
      },
      forecasts: [
        { month: 'Jan', actual: 850000, target: 800000, forecast: 850000, variance: 6.25 },
        { month: 'Fév', actual: 920000, target: 850000, forecast: 920000, variance: 8.23 },
        { month: 'Mar', actual: 980000, target: 900000, forecast: 980000, variance: 8.89 },
        { month: 'Avr', actual: 0, target: 950000, forecast: 1020000, variance: 7.37 },
        { month: 'Mai', actual: 0, target: 1000000, forecast: 1150000, variance: 15.00 },
        { month: 'Jun', actual: 0, target: 1100000, forecast: 1280000, variance: 16.36 }
      ]
    };

    // Simulate API Delay
    const timer = setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [period]);

  return { data, loading, error };
}
