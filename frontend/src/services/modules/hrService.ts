import apiClient from '../apiClient';
import { MOCK_DATA } from '../mockData';

export interface Employee {
  id: string;
  matricule: string;
  nom: string;
  prenom: string;
  poste: string;
  department: string;
  contractType: string;
  dateEmbauche: string;
  salaireBase: number;
  primes: number;
  email: string;
  telephone: string;
  status: 'actif' | 'conge' | 'inactif';
}

export const hrService = {
    getAllEmployees: async () => {
        try {
            const response = await apiClient.get<Employee[]>('/rh/employees');
            return response.data;
        } catch (e) {
            console.warn('API HR failed, using demo data', e);
            return MOCK_DATA['/rh/employees'] as Employee[];
        }
    },

    getEmployeeById: async (id: string) => {
        try {
            const response = await apiClient.get<Employee>(`/rh/employees/${id}`);
            return response.data;
        } catch (e) {
            const employees = MOCK_DATA['/rh/employees'] as Employee[];
            return employees.find(emp => emp.id === id) || null;
        }
    },

    updateEmployee: async (id: string, data: Partial<Employee>) => {
        try {
            const response = await apiClient.put<Employee>(`/rh/employees/${id}`, data);
            return response.data;
        } catch (e) {
            return { id, ...data } as Employee;
        }
    }
};
