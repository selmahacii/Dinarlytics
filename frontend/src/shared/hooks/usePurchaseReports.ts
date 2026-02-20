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

    // MOCK DATA GENERATION - Algerian Context
    const mockData: PurchaseReportData = {
      totalPurchases: 1850000,
      supplierCount: 14,
      period: period,
      topSuppliers: [
        { name: "Cévital Industries", purchases: 450000, percentage: 24.3, trend: 12 },
        { name: "Global Logistics Algérie", purchases: 320000, percentage: 17.3, trend: -5 },
        { name: "Tech Import Sidi Abdellah", purchases: 210000, percentage: 11.4, trend: 8 },
        { name: "Condor Electronics", purchases: 180000, percentage: 9.7, trend: 2 }
      ],
      purchasesByCategory: [
        { category: "Matières Premières", amount: 650000, percentage: 35.1, color: "bg-slate-900", trend: 15 },
        { category: "Logistique & Transport", amount: 480000, percentage: 25.9, color: "bg-slate-500", trend: -2 },
        { category: "Informatique & Tech", amount: 420000, percentage: 22.7, color: "bg-slate-300", trend: 5 },
        { category: "Services Généraux", amount: 300000, percentage: 16.3, color: "bg-slate-100", trend: 0 }
      ]
    };

    // Simulate API Delay
    const timer = setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 700);

    return () => clearTimeout(timer);

    /* Real API Call Commented
    axios.get(`/api/v1/reports/purchases?period=${period}`)
      .then(res => {
        setData(res.data as PurchaseReportData);
        setLoading(false);
      })
      .catch(err => {
        setError(err?.message || 'Erreur lors du chargement des rapports d\'achats');
        setLoading(false);
      });
    */
  }, [period]);

  return { data, loading, error };
}
