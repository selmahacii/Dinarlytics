export type TrendDirection = 'up' | 'down' | 'stable';

export interface SalesKpis {
  ca: { value: number; change: number; trend: TrendDirection };
  margeBrute: number;
  facturesEmises: number;
  panierMoyen: number;
  tauxRemise: number;
  clientsActifs: number;
  nouveauxClients: number;
}

export interface ProductPerformance {
  name: string;
  sales: number;
  percentage: number;
  quantity: number;
  evolution: number;
}

export interface CategorySplit {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  trend: number;
}

export type ClientStatus = 'excellent' | 'bon' | 'moyen' | 'risque';

export interface TopClientDetail {
  name: string;
  ca: number;
  factures: number;
  dso: number;
  solde: number;
  status: ClientStatus;
  rating: number;
  lastOrder: string;
  paymentDelay: number;
}

export interface TopClientSummary {
  id: string; // Added for navigation
  name: string;
  sales: number;
  orders: number;
  avgBasket: number;
  trend: number;
  lastOrder?: string;
}

export interface ClientMetricsGeneric {
  totalClients: number;
  clientsActifs: number;
  nouveauxClients: number;
  dsoMoyen: number;
  tauxImpayes: number;
  tauxFidelisation: number;
}
export interface SalesForecast {
  month: string;
  actual: number;
  target: number;
  forecast: number;
  variance: number;
}
