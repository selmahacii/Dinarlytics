import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Devise } from '@/types';
import { getFiscalRates, getTVARatePercent, calculateTVA, FiscalRates } from '@/shared/utils/fiscalRates';
import { getCountryFromDevise, getFiscalDocumentsByCountry, Country, FiscalDocument } from '@/shared/utils/fiscalDocuments';
import axios from 'axios';

export interface CompanyMetrics {
  clientsCount: number;
  suppliersCount: number;
  invoicesCount: number;
  invoicesDue: number;
  totalReceivables: number;
  totalPayables: number;
  cashBalance: number;
  revenue: number;
  expenses: number;
  profitMargin: number;
  stockTurnover: number;
  averageInvoice: number;
}

export interface CompanyData {
  revenueMonth: number;
  revenueTotal: number;
  revenueGrowth: number;
  clientsCount: number;
  clientsActive: number;
  clientsNew: number;
  suppliersCount: number;
  invoicesCount: number;
  pendingInvoices: number;
  totalReceivables: number;
  totalPayables: number;
  accountsReceivable: number;
  accountsPayable: number;
  cashBalance: number;
  profitMargin: number;
  inventoryValue: number;
  stockTurnover: number;
  averageInvoice: number;
}

interface AppContextType {
  user: User | null;
  currentDevise: Devise;
  currentCountry: Country;
  planComptable: 'algerien' | 'international';
  isSidebarCollapsed: boolean;
  isMobileMenuOpen: boolean;
  companyData: CompanyData | null;
  companyMetrics: CompanyMetrics | null;
  loading: boolean;
  fiscalRates: FiscalRates;
  tvaRate: number;
  fiscalDocuments: FiscalDocument[];
  setUser: (user: User | null) => void;
  setCurrentDevise: (devise: Devise) => void;
  setPlanComptable: (plan: 'algerien' | 'international') => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  formatCurrency: (amount: number) => string;
  calculateTVA: (montantHT: number, taux?: 'normal' | 'reduit' | 'intermediaire') => number;
  getTVARate: (taux?: 'normal' | 'reduit' | 'intermediaire') => number;
  currentLang: 'fr' | 'ar' | 'en';
  setLang: (lang: 'fr' | 'ar' | 'en') => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = window.localStorage.getItem('app_user');
      if (raw) {
        return JSON.parse(raw) as User;
      }
    } catch {
      return null;
    }
    return null;
  });

  const [currentDevise, setCurrentDevise] = useState<Devise>('DZD');
  const [currentLang, setLang] = useState<'fr' | 'ar' | 'en'>('fr');
  const [loading, setLoading] = useState(false);
  const [companyMetrics, setCompanyMetrics] = useState<CompanyMetrics | null>(null);

  // ... (companyData generation logic) ...
  const companyData: CompanyData | null = companyMetrics
    ? {
      revenueMonth: companyMetrics.revenue,
      revenueTotal: companyMetrics.revenue,
      revenueGrowth: 0,
      clientsCount: companyMetrics.clientsCount,
      clientsActive: Math.round(companyMetrics.clientsCount * 0.8),
      clientsNew: Math.max(0, Math.round(companyMetrics.clientsCount * 0.1)),
      suppliersCount: companyMetrics.suppliersCount,
      invoicesCount: companyMetrics.invoicesCount,
      pendingInvoices: companyMetrics.invoicesDue,
      totalReceivables: companyMetrics.totalReceivables,
      totalPayables: companyMetrics.totalPayables,
      accountsReceivable: companyMetrics.totalReceivables,
      accountsPayable: companyMetrics.totalPayables,
      cashBalance: companyMetrics.cashBalance,
      profitMargin: companyMetrics.profitMargin,
      inventoryValue: Math.round(companyMetrics.revenue * 0.12),
      stockTurnover: companyMetrics.stockTurnover || 4.2,
      averageInvoice: companyMetrics.averageInvoice || 12500
    }
    : null;


  // Charger le plan comptable depuis localStorage
  const [planComptable, setPlanComptableState] = useState<'algerien' | 'international'>(() => {
    try {
      const saved = localStorage.getItem('planComptable');
      return (saved === 'algerien' || saved === 'international') ? saved : 'algerien';
    } catch {
      return 'algerien';
    }
  });

  // Wrapper pour sauvegarder dans localStorage
  const setPlanComptable = (plan: 'algerien' | 'international') => {
    setPlanComptableState(plan);
    try {
      localStorage.setItem('planComptable', plan);
    } catch (e) {
      console.error('Error saving plan comptable', e);
    }
  };

  const [isSidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Sync user changes to localStorage (optional but good for updates)
  useEffect(() => {
    if (user) {
      window.localStorage.setItem('app_user', JSON.stringify(user));
    } else {
      // Don't clear on null unless explicitly logging out, 
      // but here we just sync. If logout happens, handleLogout should clear it.
    }
  }, [user]);

  // Fetch company metrics from API when user changes
  useEffect(() => {
    if (!user) {
      setCompanyMetrics(null);
      return;
    }

    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/v1/dashboard/metrics');
        const data = response.data || {};
        setCompanyMetrics(data as CompanyMetrics);
      } catch (err) {
        console.error('Error fetching company metrics:', err);
        setCompanyMetrics(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user]);

  useEffect(() => {
    // For demo consistency, force DZD when a user logs in
    if (user && currentDevise !== 'DZD') setCurrentDevise('DZD');
  }, [user]);

  // Calculer les taux fiscaux selon la devise et le plan comptable actuels
  const fiscalRates = getFiscalRates(currentDevise, planComptable);
  const tvaRate = getTVARatePercent(currentDevise, 'normal', planComptable);

  // Obtenir le pays et les documents fiscaux selon la devise
  const currentCountry = getCountryFromDevise(currentDevise);
  const fiscalDocuments = getFiscalDocumentsByCountry(currentCountry);

  const formatCurrency = (amount: number): string => {
    const symbols: Record<Devise, string> = { DZD: 'DA', EUR: '€', USD: '$' };
    return `${(amount || 0).toLocaleString('fr-FR')} ${symbols[currentDevise]}`;
  };

  const calculateTVAContext = (montantHT: number, taux: 'normal' | 'reduit' | 'intermediaire' = 'normal'): number => {
    return calculateTVA(montantHT, currentDevise, taux, planComptable);
  };

  const getTVARate = (taux: 'normal' | 'reduit' | 'intermediaire' = 'normal'): number => {
    return getTVARatePercent(currentDevise, taux, planComptable);
  };

  return (
    <AppContext.Provider value={{
      user,
      currentDevise,
      currentCountry,
      planComptable,
      isSidebarCollapsed,
      isMobileMenuOpen,
      companyData,
      companyMetrics,
      loading,
      fiscalRates,
      tvaRate,
      fiscalDocuments,
      setUser,
      setCurrentDevise,
      setPlanComptable,
      setSidebarCollapsed,
      setMobileMenuOpen,
      formatCurrency,
      calculateTVA: calculateTVAContext,
      getTVARate,
      currentLang,
      setLang
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export type { AppContextType };
