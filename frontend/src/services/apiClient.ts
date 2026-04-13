import axios from 'axios';
import { setupCSRFInterceptor } from '@security/csrfToken';

/**
 * Clean & Unified Axios Client
 * Handles:
 * - CSRF token injection (via setupCSRFInterceptor)
 * - JWT Bearer token injection
 * - Multi-tenant company ID header
 * - Centralized error handling
 * - Credentials (cookies) inclusion
 */
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    withCredentials: true, // ✅ CRITICAL: Include cookies for CSRF token
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
});

// ✅ Setup CSRF token interceptor (must be before auth interceptors)
setupCSRFInterceptor(apiClient);

// Interceptor to add Bearer token to every request
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

        // Add language header
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

// Interceptor for centralized error handling
apiClient.interceptors.response.use(
    (response) => {
        console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
        return response;
    },
    (error) => {
        console.error('[API Response Error Details]', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
        });

        if (error.response?.status === 401) {
            // Handle unauthorized access (logout or refresh token)
            console.error('Unauthorized! Redirecting to login...');
            // window.location.href = '/login';
        }

        if (error.response?.status === 403) {
            // Handle forbidden access - may be CSRF token issue
            console.error('❌ Forbidden - Possible CSRF token invalid/expired');
            // Attempt to reinitialize CSRF token
            import('@security/csrfToken').then(({ CSRFTokenService }) => {
                CSRFTokenService.initialize().catch(e => {
                    console.error('Failed to reinitialize CSRF token:', e);
                });
            });
        }

        if (error.response?.status === 429) {
            // Handle rate limiting
            const retryAfter = error.response.headers['retry-after'] || '60';
            console.warn(`⏱️ Rate limited. Retry after ${retryAfter} seconds`);
        }

        // Log error for developers but pass it along
        const message = error.response?.data?.detail || error.message;
        console.warn(`API Error [${error.config?.url}]:`, message);

        return Promise.reject(error);
    }
);

export default apiClient;
