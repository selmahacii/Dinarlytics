import { useState, useEffect } from 'react';
import axios from 'axios';

export interface TreasuryData {
  soldeBanque: number;
  soldeCaisse: number;
  soldeTotal: number;
  fluxEntrants: number;
  fluxSortants: number;
  soldeNet: number;
  previsionTresorerie: Array<{
    mois: string;
    solde: number;
  }>;
  repartitionFlux: Array<{
    type: string;
    montant: number;
    part: number;
    couleur: string;
  }>;
  repartitionSorties: Array<{
    type: string;
    montant: number;
    part: number;
    couleur: string;
  }>;
}

export function useTreasuryReports(period: string = 'mois') {
  const [data, setData] = useState<TreasuryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(`/api/v1/reports/treasury?period=${period}`)
      .then(res => {
        setData(res.data as TreasuryData);
        setLoading(false);
      })
      .catch(err => {
        setError(err?.message || 'Erreur lors du chargement des rapports de trésorerie');
        setLoading(false);
      });
  }, [period]);

  return { data, loading, error };
}
