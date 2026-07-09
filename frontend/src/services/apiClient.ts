import axios from 'axios';
import { setupCSRFInterceptor } from '@security/csrfToken';

// ✅ Force Mock Mode for Demo/Stability if needed
const IS_DEMO_MODE = false; // Can be linked to process.env.VITE_DEMO_MODE

/**
 * Clean & Unified Axios Client
 */
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
});

// ✅ Setup CSRF token interceptor
setupCSRFInterceptor(apiClient);

// Interceptor to add Bearer token and handle MOCK redirection
apiClient.interceptors.request.use(
    (config) => {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config);
        
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        const companyId = localStorage.getItem('company_id');
        if (companyId && config.headers) {
            config.headers['x-company-id'] = companyId;
        }

        const lang = localStorage.getItem('app_lang') || 'fr';
        if (config.headers) {
            config.headers['Accept-Language'] = lang;
        }

        return config;
    },
    (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
    }
);

// Interceptor for centralized error handling + MOCK FALLBACK
apiClient.interceptors.response.use(
    (response) => {
        console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
        return response;
    },
    async (error) => {
        const { config, response } = error;
        const url = config?.url || '';


        console.error('[API Response Error Details]', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
        });

        if (error.response?.status === 401) {
            console.error('Unauthorized! Session expired.');
        }

        if (error.response?.status === 403) {
            console.error('❌ Forbidden - Possible CSRF token issue');
            import('@security/csrfToken').then(({ CSRFTokenService }) => {
                CSRFTokenService.initialize().catch(e => console.error('CSRF re-init failed', e));
            });
        }

        return Promise.reject(error);
    }
);

export default apiClient;

