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

export function useAccountingStatements(period: string = 'mois') {
  const [data, setData] = useState<AccountingStatementData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`/api/v1/reports/accounting-statements?period=${period}`)
      .then(res => {
        setData(res.data as AccountingStatementData);
        setLoading(false);
      })
      .catch(err => {
        setError(err?.message || 'Erreur lors du chargement des états comptables');
        setLoading(false);
      });
  }, [period]);

  return { data, loading, error };
}
