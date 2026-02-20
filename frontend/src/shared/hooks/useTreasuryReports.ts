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

    // MOCK DATA GENERATION - Algerian Context
    const mockData: TreasuryData = {
      soldeBanque: 1850000,
      soldeCaisse: 580000,
      soldeTotal: 2430000,
      fluxEntrants: 1050000,
      fluxSortants: 780000,
      soldeNet: 270000,
      previsionTresorerie: [
        { mois: 'Juil 2024', solde: 290000 },
        { mois: 'Août 2024', solde: 200000 },
        { mois: 'Sep 2024', solde: 330000 }
      ],
      repartitionFlux: [
        { type: 'Ventes Produits', montant: 850000, part: 81, couleur: 'bg-slate-900' },
        { type: 'Recouvrement Créances', montant: 200000, part: 19, couleur: 'bg-slate-300' }
      ],
      repartitionSorties: [
        { type: 'Fournisseurs (Achats)', montant: 450000, part: 58, couleur: 'bg-slate-900' },
        { type: 'Salaires & Charges', montant: 250000, part: 32, couleur: 'bg-slate-500' },
        { type: 'Loyer & Services', montant: 80000, part: 10, couleur: 'bg-slate-200' }
      ]
    };

    // Simulate delay
    const timer = setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);

    /* Real API Call Commented
    axios.get(`/api/v1/reports/treasury?period=${period}`)
      .then(res => {
        setData(res.data as TreasuryData);
        setLoading(false);
      })
      .catch(err => {
        setError(err?.message || 'Erreur lors du chargement des rapports de trésorerie');
        setLoading(false);
      });
    */
  }, [period]);

  return { data, loading, error };
}
