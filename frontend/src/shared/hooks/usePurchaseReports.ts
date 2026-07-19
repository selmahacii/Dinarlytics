import { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';

export interface PurchaseReportData {
  totalPurchases: number;
  supplierCount: number;
  orderCount: number;
  pendingOrdersCount: number;
  period: string;
  topSuppliers: Array<{
    name: string;
    purchases: number;
    percentage: number;
    trend: number;
  }>;
  purchasesByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
    color: string;
    trend: number;
  }>;
}

export function usePurchaseReports(period: string = 'mois') {
  const [data, setData] = useState<PurchaseReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    apiClient.get(`/reports/purchases?period=${period}`)
      .then(res => {
        setData(res.data as PurchaseReportData);
      })
      .catch(err => {
        setError(err?.message || "Erreur lors du chargement des rapports d'achats");
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [period]);

  return { data, loading, error };
}
