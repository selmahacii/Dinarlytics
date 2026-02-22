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

import { accountingService } from '../../services/modules/accountingService';

export function useTreasuryReports(period: string = 'mois') {
  const [data, setData] = useState<TreasuryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        // Fallback to local
        const dynamicData = await accountingService.getDynamicTreasury();
        if (isMounted) {
          setData(dynamicData as TreasuryData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Erreur lors du calcul de la trésorerie');
          setLoading(false);
        }
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [period]);

  return { data, loading, error };
}
