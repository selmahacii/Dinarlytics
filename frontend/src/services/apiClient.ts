import axios from 'axios';

/**
 * Clean & Unified Axios Client
 * Handles base URL, auth tokens, and centralized error handling.
 */
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add Bearer token to every request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        const companyId = localStorage.getItem('company_id');
        if (companyId && config.headers) {
            config.headers['X-Company-ID'] = companyId;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor for centralized error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access (logout or refresh token)
            console.error('Unauthorized! Redirecting to login...');
            // window.location.href = '/login'; 
        }

        // Log error for developers but pass it along
        const message = error.response?.data?.detail || error.message;
        console.warn(`API Error [${error.config?.url}]:`, message);

        return Promise.reject(error);
    }
);

export default apiClient;
