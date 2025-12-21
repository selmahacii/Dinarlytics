import { useState, useEffect } from 'react';
import axios from 'axios';

// Types
export interface JournalSummary {
  code: string;
  nom: string;
  ecritures: number;
  montant: number;
  color: string;
}

export interface JournalEntry {
  id: string;
  numero: string;
  date: string;
  journal: string;
  libelle: string;
  debit: number;
  credit: number;
  compte: string;
  piece?: string;
  valide: boolean;
}

export interface BilanItem {
  compte: string;
  libelle: string;
  montant: number;
}

export interface Bilan {
  actif: {
    immobilise: BilanItem[];
    circulant: BilanItem[];
  };
  passif: {
    capitaux: BilanItem[];
    dettes: BilanItem[];
  };
  total_actif: number;
  total_passif: number;
}

export interface CompteResultatItem {
  compte: string;
  libelle: string;
  montant: number;
}

export interface CompteResultat {
  produits: CompteResultatItem[];
  charges: CompteResultatItem[];
  total_produits: number;
  total_charges: number;
  resultat: number;
}

export interface BalanceItem {
  compte: string;
  libelle: string;
  debit: number;
  credit: number;
  solde_debiteur: number;
  solde_crediteur: number;
}

export interface Balance {
  items: BalanceItem[];
  total_debit: number;
  total_credit: number;
}

export interface FluxTresorerie {
  exploitation: Record<string, number>;
  investissement: Record<string, number>;
  financement: Record<string, number>;
  variation_nette: number;
}

export const useAccountingReports = () => {
  // States
  const [journaux, setJournaux] = useState<JournalSummary[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [bilan, setBilan] = useState<Bilan | null>(null);
  const [compteResultat, setCompteResultat] = useState<CompteResultat | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [fluxTresorerie, setFluxTresorerie] = useState<FluxTresorerie | null>(null);
  
  const [loadingJournaux, setLoadingJournaux] = useState<boolean>(false);
  const [loadingEntries, setLoadingEntries] = useState<boolean>(false);
  const [loadingBilan, setLoadingBilan] = useState<boolean>(false);
  const [loadingCompteResultat, setLoadingCompteResultat] = useState<boolean>(false);
  const [loadingBalance, setLoadingBalance] = useState<boolean>(false);
  const [loadingFlux, setLoadingFlux] = useState<boolean>(false);
  
  const [error, setError] = useState<string | null>(null);

  // Fetch journal summaries
  const fetchJournaux = async (periode?: string) => {
    try {
      setLoadingJournaux(true);
      setError(null);
      const params = periode ? { periode } : {};
      const response = await axios.get<JournalSummary[]>('/api/v1/accounting-reports/journaux', { params });
      setJournaux(response.data);
    } catch (err: any) {
      console.error('Error fetching journaux:', err);
      setError(err.response?.data?.detail || 'Erreur lors du chargement des journaux');
      setJournaux([]);
    } finally {
      setLoadingJournaux(false);
    }
  };

  // Fetch journal entries
  const fetchEntries = async (params?: {
    journal?: string;
    periode?: string;
    skip?: number;
    limit?: number;
  }) => {
    try {
      setLoadingEntries(true);
      setError(null);
      const response = await axios.get<JournalEntry[]>('/api/v1/accounting-reports/ecritures', { params });
      setEntries(response.data);
    } catch (err: any) {
      console.error('Error fetching entries:', err);
      setError(err.response?.data?.detail || 'Erreur lors du chargement des écritures');
      setEntries([]);
    } finally {
      setLoadingEntries(false);
    }
  };

  // Fetch bilan
  const fetchBilan = async (periode?: string) => {
    try {
      setLoadingBilan(true);
      setError(null);
      const params = periode ? { periode } : {};
      const response = await axios.get<Bilan>('/api/v1/accounting-reports/bilan', { params });
      setBilan(response.data);
    } catch (err: any) {
      console.error('Error fetching bilan:', err);
      setError(err.response?.data?.detail || 'Erreur lors du chargement du bilan');
      setBilan(null);
    } finally {
      setLoadingBilan(false);
    }
  };

  // Fetch compte de résultat
  const fetchCompteResultat = async (periode?: string) => {
    try {
      setLoadingCompteResultat(true);
      setError(null);
      const params = periode ? { periode } : {};
      const response = await axios.get<CompteResultat>('/api/v1/accounting-reports/compte-resultat', { params });
      setCompteResultat(response.data);
    } catch (err: any) {
      console.error('Error fetching compte resultat:', err);
      setError(err.response?.data?.detail || 'Erreur lors du chargement du compte de résultat');
      setCompteResultat(null);
    } finally {
      setLoadingCompteResultat(false);
    }
  };

  // Fetch balance générale
  const fetchBalance = async (periode?: string) => {
    try {
      setLoadingBalance(true);
      setError(null);
      const params = periode ? { periode } : {};
      const response = await axios.get<Balance>('/api/v1/accounting-reports/balance', { params });
      setBalance(response.data);
    } catch (err: any) {
      console.error('Error fetching balance:', err);
      setError(err.response?.data?.detail || 'Erreur lors du chargement de la balance');
      setBalance(null);
    } finally {
      setLoadingBalance(false);
    }
  };

  // Fetch flux de trésorerie
  const fetchFluxTresorerie = async (periode?: string) => {
    try {
      setLoadingFlux(true);
      setError(null);
      const params = periode ? { periode } : {};
      const response = await axios.get<FluxTresorerie>('/api/v1/accounting-reports/flux-tresorerie', { params });
      setFluxTresorerie(response.data);
    } catch (err: any) {
      console.error('Error fetching flux tresorerie:', err);
      setError(err.response?.data?.detail || 'Erreur lors du chargement du flux de trésorerie');
      setFluxTresorerie(null);
    } finally {
      setLoadingFlux(false);
    }
  };

  return {
    // Data
    journaux,
    entries,
    bilan,
    compteResultat,
    balance,
    fluxTresorerie,
    
    // Loading states
    loadingJournaux,
    loadingEntries,
    loadingBilan,
    loadingCompteResultat,
    loadingBalance,
    loadingFlux,
    
    // Error
    error,
    
    // Fetch functions
    fetchJournaux,
    fetchEntries,
    fetchBilan,
    fetchCompteResultat,
    fetchBalance,
    fetchFluxTresorerie,
  };
};
