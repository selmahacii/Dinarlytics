import { useState, useEffect } from 'react';

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
        // États comptables agrégés depuis les factures réelles (via l'API).
        // Il n'existe pas d'endpoint /reports/accounting-statements côté
        // backend : l'agrégateur est la source de vérité.
        const dynamicData = await accountingService.getDynamicStatements();
        if (isMounted) setData(dynamicData);
      } catch (err) {
        console.error('Failed to compute accounting statements', err);
        if (isMounted) setError('Erreur lors du chargement des états comptables');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [period]);

  return { data, loading, error };
}
