/**
 * CSRF Token Management - Frontend
 *
 * Ce fichier fournit les utilitaires pour gérer les tokens CSRF
 * côté frontend en React/TypeScript
 */

interface CSRFTokens {
  token: string;
  cookieName: string;
  headerName: string;
  expiresAt: number;
}

/**
 * Service pour gérer les tokens CSRF
 */
export class CSRFTokenService {
  private static readonly COOKIE_NAME = 'csrf_token';
  private static readonly HEADER_NAME = 'X-CSRF-Token';
  private static readonly STORAGE_KEY = '@dinarlytics:csrf_token';

  /**
   * Récupère le token CSRF depuis les cookies
   */
  static getToken(): string | null {
    // Depuis les cookies (préféré)
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=');
      if (name === this.COOKIE_NAME) {
        return decodeURIComponent(value);
      }
    }

    // Fallback: depuis localStorage
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const { token, expiresAt } = JSON.parse(stored);
      if (Date.now() < expiresAt) {
        return token;
      }
      localStorage.removeItem(this.STORAGE_KEY);
    }

    return null;
  }

  /**
   * Initialise le token en faisant une requête GET
   * À appeler au chargement de l'app
   */
  static async initialize(): Promise<string | null> {
    try {
      await fetch('/api/v1/health', {
        method: 'GET',
        credentials: 'include', // Important: inclure les cookies
      });

      // Le cookie est maintenant défini, récupérez-le
      return this.getToken();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation CSRF:', error);
      return null;
    }
  }

  /**
   * Ajoute le token CSRF aux headers d'une requête
   */
  static addToHeaders(headers: Record<string, string> = {}): Record<string, string> {
    const token = this.getToken();
    if (token) {
      headers[this.HEADER_NAME] = token;
    }
    return headers;
  }

  /**
   * Crée une configuration fetch avec le token CSRF
   */
  static createFetchConfig(
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    body?: any,
    additionalHeaders?: Record<string, string>
  ): RequestInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...additionalHeaders,
    };

    this.addToHeaders(headers);

    return {
      method,
      credentials: 'include',
      headers,
      ...(body && { body: JSON.stringify(body) }),
    };
  }

  /**
   * Crée une configuration Axios avec le token CSRF
   */
  static createAxiosConfig(additionalHeaders?: Record<string, string>) {
    return {
      headers: this.addToHeaders({
        'X-Requested-With': 'XMLHttpRequest',
        ...additionalHeaders,
      }),
      withCredentials: true,
    };
  }

  /**
   * Teste si le token est valide
   */
  static async validate(): Promise<boolean> {
    const token = this.getToken();
    return !!token;
  }

  /**
   * Efface le token (logout)
   */
  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Affiche l'état du token (debuggage)
   */
  static debug(): void {
    const token = this.getToken();
    console.log('CSRF Token Debug:', {
      token: token ? '***' : 'MISSING',
      cookieName: this.COOKIE_NAME,
      headerName: this.HEADER_NAME,
      hasToken: !!token,
    });
  }
}

/**
 * Hook React pour gérer CSRF
 */
export function useCSRFToken() {
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const initToken = async () => {
      setLoading(true);
      const csrfToken = await CSRFTokenService.initialize();
      setToken(csrfToken);
      setLoading(false);
    };

    initToken();
  }, []);

  return { token, loading };
}

/**
 * Interceptor Axios pour ajouter automatiquement le token
 */
export function setupCSRFInterceptor(axiosInstance: any) {
  axiosInstance.interceptors.request.use(
    config => {
      const token = CSRFTokenService.getToken();
      if (token && ['post', 'put', 'delete', 'patch'].includes(config.method)) {
        config.headers[CSRFTokenService.HEADER_NAME] = token;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  return axiosInstance;
}

/**
 * Wrapper pour les requêtes POST/PUT/DELETE
 */
export async function secureFetch(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  data?: any
) {
  const config = CSRFTokenService.createFetchConfig(method, data);

  const response = await fetch(url, config);

  if (!response.ok) {
    // Gestion des erreurs spécifiques
    if (response.status === 403) {
      throw new Error('CSRF token invalid or expired. Please refresh the page.');
    }
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

/**
 * Exemple d'utilisation dans un composant React
 */
export function ExampleComponent() {
  const { token, loading } = useCSRFToken();

  const handleCreateInvoice = async () => {
    try {
      const result = await secureFetch(
        '/api/v1/invoices',
        'POST',
        {
          number: 'INV-001',
          client_id: 1,
          total_amount: 1000,
          items: []
        }
      );
      console.log('Invoice créée:', result);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) return <div>Initialisation...</div>;

  if (!token) {
    return <div className="text-red-600">⚠️ Token CSRF manquant. Rafraîchissez la page.</div>;
  }

  return (
    <button
      onClick={handleCreateInvoice}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Créer une facture
    </button>
  );
}

// ===== CONFIGURATION DANS main.tsx OU App.tsx =====

/*
import { setupCSRFInterceptor } from './security/csrfToken';
import axios from 'axios';

// Au démarrage de l'app
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
});

setupCSRFInterceptor(apiClient);

// Initialiser le token CSRF
import { CSRFTokenService } from './security/csrfToken';
CSRFTokenService.initialize().catch(err => {
  console.error('Failed to initialize CSRF token:', err);
});

// Exporter pour utilisation dans les services
export { apiClient };
*/
