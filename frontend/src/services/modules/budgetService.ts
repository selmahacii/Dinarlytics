import apiClient from '../apiClient';

export interface BudgetItem {
    id?: string;
    category: string;
    account_code?: string;
    budgeted_amount: number;
    actual_amount: number;
    variance: number;
}

export interface Budget {
    id: string;
    name: string;
    exercice: string;
    status: string;
    items: BudgetItem[];
}

export interface BudgetSummary {
    total_budgeted: number;
    total_actual: number;
    variance: number;
    usage_pct: number;
}

export const budgetService = {
    getAll: async () => {
        const response = await apiClient.get<Budget[]>('/budgets/');
        return response.data;
    },
    create: async (data: any) => {
        const response = await apiClient.post<Budget>('/budgets/', data);
        return response.data;
    },
    sync: async (id: string) => {
        const response = await apiClient.post<Budget>(`/budgets/${id}/sync`);
        return response.data;
    },
    getSummary: async (exercice: string) => {
        const response = await apiClient.get<BudgetSummary>(`/budgets/summary/${exercice}`);
        return response.data;
    }
};
