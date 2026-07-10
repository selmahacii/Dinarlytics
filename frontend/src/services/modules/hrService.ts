import apiClient from '../apiClient';

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
        const response = await apiClient.get<Employee[]>('/rh/employees');
        return response.data;
    },

    getEmployeeById: async (id: string) => {
        const response = await apiClient.get<Employee>(`/rh/employees/${id}`);
        return response.data;
    },

    updateEmployee: async (id: string, data: Partial<Employee>) => {
        const response = await apiClient.put<Employee>(`/rh/employees/${id}`, data);
        return response.data;
    },

    createEmployee: async (data: Partial<Employee>) => {
        const response = await apiClient.post<Employee>('/rh/employees', data);
        return response.data;
    },

    deleteEmployee: async (id: string) => {
        await apiClient.delete(`/rh/employees/${id}`);
    }
};

