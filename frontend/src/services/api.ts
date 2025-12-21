/**
 * API Service - Centralized API calls for all data
 * Replaces all mock data with real backend calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ============================================
// AUTHENTICATION
// ============================================
export const authService = {
  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  getDemoUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/demo-users`);
    if (!res.ok) throw new Error('Failed to fetch demo users');
    return res.json();
  },

  logout: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    if (!res.ok) throw new Error('Logout failed');
    return res.json();
  }
};

// ============================================
// CLIENTS & CRM
// ============================================
export const clientsService = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/clients`);
    if (!res.ok) throw new Error('Failed to fetch clients');
    return res.json();
  },

  getById: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/clients/${id}`);
    if (!res.ok) throw new Error('Failed to fetch client');
    return res.json();
  },

  create: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create client');
    return res.json();
  },

  update: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE_URL}/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update client');
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/clients/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete client');
    return res.json();
  }
};

// ============================================
// SUPPLIERS
// ============================================
export const suppliersService = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/suppliers`);
    if (!res.ok) throw new Error('Failed to fetch suppliers');
    return res.json();
  },

  getById: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/suppliers/${id}`);
    if (!res.ok) throw new Error('Failed to fetch supplier');
    return res.json();
  },

  create: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create supplier');
    return res.json();
  },

  update: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update supplier');
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/suppliers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete supplier');
    return res.json();
  }
};

// ============================================
// INVOICES & SALES
// ============================================
export const invoicesService = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/invoices`);
    if (!res.ok) throw new Error('Failed to fetch invoices');
    return res.json();
  },

  getById: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/invoices/${id}`);
    if (!res.ok) throw new Error('Failed to fetch invoice');
    return res.json();
  },

  create: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create invoice');
    return res.json();
  },

  update: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update invoice');
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/invoices/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete invoice');
    return res.json();
  }
};

// ============================================
// PRODUCTS & INVENTORY
// ============================================
export const productsService = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  getById: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  },

  create: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
  },

  update: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.json();
  }
};

// ============================================
// ACCOUNTING & FINANCE
// ============================================
export const accountingService = {
  getEquilibreFinancier: async () => {
    const res = await fetch(`${API_BASE_URL}/accounting/equilibre-financier`);
    if (!res.ok) throw new Error('Failed to fetch equilibre financier');
    return res.json();
  },

  getEntries: async () => {
    const res = await fetch(`${API_BASE_URL}/accounting/entries`);
    if (!res.ok) throw new Error('Failed to fetch accounting entries');
    return res.json();
  },

  createEntry: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/accounting/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create entry');
    return res.json();
  },

  getBalance: async (account: string) => {
    const res = await fetch(`${API_BASE_URL}/accounting/balance/${account}`);
    if (!res.ok) throw new Error('Failed to fetch balance');
    return res.json();
  }
};

// ============================================
// KPIs & ANALYTICS
// ============================================
export const kpisService = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/kpis`);
    if (!res.ok) throw new Error('Failed to fetch KPIs');
    return res.json();
  },

  getByCompany: async (companyId: string) => {
    const res = await fetch(`${API_BASE_URL}/kpis?company=${companyId}`);
    if (!res.ok) throw new Error('Failed to fetch KPIs');
    return res.json();
  }
};

// ============================================
// REPORTS
// ============================================
export const reportsService = {
  getAnalytics: async () => {
    const res = await fetch(`${API_BASE_URL}/reports/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics reports');
    return res.json();
  },

  getSales: async (period?: string) => {
    const url = period ? `${API_BASE_URL}/reports/sales?period=${period}` : `${API_BASE_URL}/reports/sales`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch sales reports');
    return res.json();
  }
};

// ============================================
// ALERTS & NOTIFICATIONS
// ============================================
export const alertsService = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/alerts`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  create: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create alert');
    return res.json();
  },

  markAsRead: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/alerts/${id}/read`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to mark alert as read');
    return res.json();
  }
};

// ============================================
// USERS & PERMISSIONS
// ============================================
export const usersService = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  getById: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`);
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  create: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create user');
    return res.json();
  },

  update: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete user');
    return res.json();
  }
};

// ============================================
// AUDITS & LOGS
// ============================================
export const auditsService = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/audits`);
    if (!res.ok) throw new Error('Failed to fetch audits');
    return res.json();
  },

  create: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/audits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create audit');
    return res.json();
  }
};

// ============================================
// BUDGETS
// ============================================
export const budgetsService = {
  list: async () => {
    const res = await fetch(`${API_BASE_URL}/budgets`);
    if (!res.ok) throw new Error('Failed to fetch budgets');
    return res.json();
  },

  get: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/budgets/${id}`);
    if (!res.ok) throw new Error('Failed to fetch budget');
    return res.json();
  },

  create: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create budget');
    return res.json();
  },

  update: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE_URL}/budgets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update budget');
    return res.json();
  },

  remove: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/budgets/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete budget');
    return res.json();
  }
};

// ============================================
// TRAINING (AI Model)
// ============================================
export const trainingService = {
  trainModel: async (trainData: any[], epochs = 10, lr = 1e-3, batchSize = 8) => {
    const res = await fetch(`${API_BASE_URL}/training/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ train_data: trainData, epochs, lr, batch_size: batchSize })
    });
    if (!res.ok) throw new Error('Failed to train model');
    return res.json();
  }
};

// ============================================
// KPI & STATISTICS
// ============================================
export const kpiService = {
  getKPIs: async () => {
    const res = await fetch(`${API_BASE_URL}/documents/kpis`);
    if (!res.ok) throw new Error('Failed to fetch KPIs');
    return res.json();
  },
  getFinancialIndicators: async () => {
    const res = await fetch(`${API_BASE_URL}/documents/financial-indicators`);
    if (!res.ok) throw new Error('Failed to fetch financial indicators');
    return res.json();
  }
};

export const statsService = {
  getSystemStats: async () => {
    const res = await fetch(`${API_BASE_URL}/documents/system-stats`);
    if (!res.ok) throw new Error('Failed to fetch system stats');
    return res.json();
  },
  getActivityMetrics: async () => {
    const res = await fetch(`${API_BASE_URL}/documents/activity-metrics`);
    if (!res.ok) throw new Error('Failed to fetch activity metrics');
    return res.json();
  },
  getBusinessWeather: async () => {
    const res = await fetch(`${API_BASE_URL}/documents/business-weather`);
    if (!res.ok) throw new Error('Failed to fetch business weather');
    return res.json();
  }
};

export default {
  auth: authService,
  clients: clientsService,
  suppliers: suppliersService,
  invoices: invoicesService,
  products: productsService,
  accounting: accountingService,
  kpis: kpiService,
  stats: statsService,
  reports: reportsService,
  alerts: alertsService,
  users: usersService,
  audits: auditsService,
  budgets: budgetsService,
  training: trainingService
};
