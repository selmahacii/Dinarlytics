import apiClient from '../apiClient';

export interface OverdueInvoice {
    id: string;
    invoice_number: string;
    client_id: string;
    total_ttc: number;
    due_date: string;
    days_late: number;
    last_action_type?: string;
    last_action_date?: string;
}

export interface AgingBalance {
    current: number;
    "1_30": number;
    "31_60": number;
    "61_90": number;
    "over_90": number;
}

export const collectionService = {
    getOverdue: async () => {
        const response = await apiClient.get<OverdueInvoice[]>('/collections/overdue');
        return response.data;
    },
    recordAction: async (data: { invoice_id: string, action_type: string, notes?: string }) => {
        const response = await apiClient.post('/collections/actions', data);
        return response.data;
    },
    getAgingBalance: async () => {
        const response = await apiClient.get<AgingBalance>('/collections/aging-balance');
        return response.data;
    }
};
