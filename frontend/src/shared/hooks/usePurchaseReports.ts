import { useState, useEffect } from 'react';
import axios from 'axios';

export interface PurchaseReportData {
  totalPurchases: number;
  supplierCount: number;
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
    axios.get(`/api/v1/reports/purchases?period=${period}`)
      .then(res => {
        setData(res.data as PurchaseReportData);
        setLoading(false);
      })
      .catch(err => {
        setError(err?.message || 'Erreur lors du chargement des rapports d\'achats');
        setLoading(false);
      });
  }, [period]);

  return { data, loading, error };
}
