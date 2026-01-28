import apiClient from '../apiClient';

export interface User {
    id: string;
    email: string;
    username: string;
    first_name?: string;
    last_name?: string;
    role: string;
    company_id: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: User;
}

/**
 * Authentication Service
 */
export const authService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('company_id', response.data.user.company_id);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('company_id');
    },

    getCurrentUser: (): User | null => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
};
