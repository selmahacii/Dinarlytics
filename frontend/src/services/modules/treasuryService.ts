import apiClient from '../apiClient';

export interface BankAccount {
    id: string;
    bank_name: string;
    account_code: string;
    iban?: string;
    balance: number;
    currency: string;
    is_active: boolean;
}

export interface Transaction {
    id: string;
    date: string;
    label: string;
    amount: number;
    type: 'credit' | 'debit';
    reference?: string;
    account_code: string;
}

const treasuryService = {
    getAccounts: async (): Promise<BankAccount[]> => {
        const response = await apiClient.get('/treasury/accounts');
        return response.data;
    },

    getTransactions: async (params?: {
        account_code?: string;
        start_date?: string;
        end_date?: string;
        limit?: number;
    }): Promise<Transaction[]> => {
        const response = await apiClient.get('/treasury/transactions', { params });
        return response.data;
    }
};

export default treasuryService;
