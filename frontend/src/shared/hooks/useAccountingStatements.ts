import { useState, useEffect } from 'react';
import axios from 'axios';

export interface AccountingStatementData {
  produits: number;
  charges: number;
  resultatNet: number;
  actifTotal: number;
  actifCirculant: number;
  actifImmobilise: number;
  passifTotal: number;
  capitauxPropres: number;
  dettes: number;
  ratioLiquidite: string;
  ratioRentabilite: string;
  ratioAutonomie: string;
  ratioEndettement: string;
  repartitionCharges: Array<{
    type: string;
    montant: number;
    part: number;
    couleur: string;
  }>;
}

import { accountingService } from '../../services/modules/accountingService';

export function useAccountingStatements(period: string = 'mois') {
  const [data, setData] = useState<AccountingStatementData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        // Try real API
        const res = await axios.get(`/api/v1/reports/accounting-statements?period=${period}`);
        if (isMounted) setData(res.data as AccountingStatementData);
      } catch (err) {
        console.warn('API Accounting failed, using local aggregator');
        // FALLBACK TO LOCAL AGGREGATOR
        const dynamicData = await accountingService.getDynamicStatements();
        if (isMounted) setData(dynamicData);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [period]);

  return { data, loading, error };
}
