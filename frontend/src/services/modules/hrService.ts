import apiClient from '../apiClient';

export interface Employee {
    id: string;
    matricule: string;
    name: string;
    first_name: string;
    email?: string;
    position?: string;
    department?: string;
    base_salary: number;
    status: string;
}

export interface Payroll {
    id: string;
    employee_name: string;
    period: string;
    gross_salary: number;
    net_salary: number;
    status: string;
    payment_date?: string;
}

/**
 * HR Service - Employee & Payroll management
 */
export const hrService = {
    getEmployees: async () => {
        const response = await apiClient.get<Employee[]>('/hr/employees');
        return response.data;
    },

    getPayroll: async (period?: string) => {
        const response = await apiClient.get<Payroll[]>('/hr/payroll', {
            params: { period }
        });
        return response.data;
    }
};
