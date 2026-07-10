import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Devise } from '@/types';
import { getFiscalRates, getTVARatePercent, calculateTVA, FiscalRates } from '@/shared/utils/fiscalRates';
import { getCountryFromDevise, getFiscalDocumentsByCountry, Country, FiscalDocument } from '@/shared/utils/fiscalDocuments';
import apiClient from '@/services/apiClient';
import i18n from '@/i18n/config';

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
  inventoryValue?: number;
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
        const u = JSON.parse(raw) as User;
        // Fix for missing sidebar modules: ensure base role/type if missing from old session
        if (!u.role) u.role = 'dg';
        if (!u.companyType) u.companyType = 'spa';
        if (!u.accessLevel) u.accessLevel = 'enterprise';
        return u;
      }
    } catch {
      return null;
    }
    return null;
  });

  const [currentDevise, setCurrentDeviseState] = useState<Devise>(() => {
    return (localStorage.getItem('app_devise') as Devise) || 'DZD';
  });

  const setCurrentDevise = (devise: Devise) => {
    setCurrentDeviseState(devise);
    localStorage.setItem('app_devise', devise);
  };
  const [currentLang, setLangState] = useState<'fr' | 'ar' | 'en'>(() => {
    return (localStorage.getItem('app_lang') as 'fr' | 'ar' | 'en') || 'fr';
  });

  const setLang = (lang: 'fr' | 'ar' | 'en') => {
    setLangState(lang);
    i18n.changeLanguage(lang);
  };

  // Persist language and handle direction
  useEffect(() => {
    localStorage.setItem('app_lang', currentLang);
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    if (i18n.language !== currentLang) {
      i18n.changeLanguage(currentLang);
    }
  }, [currentLang]);

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
      inventoryValue: companyMetrics.inventoryValue ?? 0,
      stockTurnover: companyMetrics.stockTurnover || 0,
      averageInvoice: companyMetrics.averageInvoice || 0
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
        // apiClient (et non axios brut) : baseURL /api/v1 + en-tête Authorization.
        const response = await apiClient.get<CompanyMetrics>('/analytics/company-metrics');
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

  // Devise persistence logic could go here if needed, but not forcing DZD on every user update.

  // Calculer les taux fiscaux selon la devise et le plan comptable actuels
  const fiscalRates = getFiscalRates(currentDevise, planComptable);
  const tvaRate = getTVARatePercent(currentDevise, 'normal', planComptable);

  // Obtenir le pays et les documents fiscaux selon la devise
  const currentCountry = getCountryFromDevise(currentDevise);
  const fiscalDocuments = getFiscalDocumentsByCountry(currentCountry);

  const formatCurrency = (amount: number): string => {
    const symbols: Record<Devise, string> = { DZD: 'DA', EUR: '€', USD: '$' };

    // Taux de change démo (Base DZD)
    const rates: Record<Devise, number> = { DZD: 1, EUR: 148.5, USD: 138.2 };

    const convertedAmount = amount / rates[currentDevise];
    const formattedValue = Math.round(convertedAmount || 0).toLocaleString('fr-FR');

    return currentDevise === 'DZD'
      ? `${formattedValue} ${symbols[currentDevise]}`
      : `${symbols[currentDevise]}${formattedValue}`;
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
