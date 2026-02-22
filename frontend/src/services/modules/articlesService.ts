import apiClient from '../apiClient';
import { Article } from '@/types';

// Backend Response Structure
interface ArticleResponse {
    id: string;
    name: string;
    description?: string;
    sku?: string;
    barcode?: string;
    category?: string;
    unit_price: number;
    cost_price?: number;
    tax_rate?: number;
    stock_quantity?: number;
    min_stock_level?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Mapper function
function mapToFrontend(data: ArticleResponse): Article {
    return {
        id: data.id,
        nom: data.name,
        codePCA: data.sku || data.barcode || '', // Assuming SKU maps to codePCA
        prixUnitaire: data.unit_price,
        stock: data.stock_quantity || 0,
        categorie: data.category || 'Non classé',
        unite: 'U', // Default or handle if backend sends it
        description: data.description || ''
    };
}

// Mapper function for creating/updating
function mapToBackend(data: Partial<Article>): any {
    return {
        name: data.nom,
        sku: data.codePCA,
        category: data.categorie,
        unit_price: data.prixUnitaire,
        stock_quantity: data.stock,
        description: data.description,
        // Default values for required fields not in frontend model yet
        tax_rate: 19,
        min_stock_level: 10
    };
}

const DEMO_ARTICLES_KEY = 'dinarlytics_demo_articles';

const getInitialArticles = (): Article[] => [
    { id: '1', nom: 'Laptop Dell XPS 15 (i9, 32GB)', codePCA: '371000', prixUnitaire: 325000, stock: 12, description: 'Station de travail haute performance pour ingénierie.', categorie: 'Matériel Info' },
    { id: '2', nom: 'Sac Ciment CPJ 42.5 (50kg)', codePCA: '371000', prixUnitaire: 850, stock: 1500, description: 'Ciment bâtiment conforme aux normes algériennes.', categorie: 'Construction' },
    { id: '3', nom: 'Groupe Électrogène 100kVA', codePCA: '371000', prixUnitaire: 2450000, stock: 3, description: 'Générateur de secours pour sites industriels.', categorie: 'Industrie' },
    { id: '4', nom: 'Lubrifiant Moteur 5L 10W40', codePCA: '371000', prixUnitaire: 4200, stock: 200, description: 'Huile premium pour moteurs essence et diesel.', categorie: 'Automobile' },
    { id: '5', nom: 'Main d\'œuvre Technique (Heure)', codePCA: '706000', prixUnitaire: 5500, stock: 0, description: 'Prestation de maintenance sur site.', categorie: 'Services' },
    { id: '6', nom: 'Climatiseur split 12000 BTU', codePCA: '371000', prixUnitaire: 68000, stock: 45, description: 'Appareil de climatisation réversible.', categorie: 'Électroménager' }
];

const getDemoArticles = (): Article[] => {
    const saved = localStorage.getItem(DEMO_ARTICLES_KEY);
    if (saved) return JSON.parse(saved);
    const initial = getInitialArticles();
    localStorage.setItem(DEMO_ARTICLES_KEY, JSON.stringify(initial));
    return initial;
};

const saveDemoArticles = (articles: Article[]) => {
    localStorage.setItem(DEMO_ARTICLES_KEY, JSON.stringify(articles));
};

export const articlesService = {
    getAll: async () => {
        try {
            const response = await apiClient.get<ArticleResponse[]>('/articles');
            if (Array.isArray(response.data)) {
                return response.data.map(mapToFrontend);
            }
            throw new Error('Invalid API response format (expected array)');
        } catch (e) {
            console.warn('API Articles failed, using demo data', e);
            await new Promise(resolve => setTimeout(resolve, 300));
            return getDemoArticles();
        }
    },

    getById: async (id: string) => {
        try {
            const response = await apiClient.get<ArticleResponse>(`/articles/${id}`);
            return mapToFrontend(response.data);
        } catch (e) {
            const articles = getDemoArticles();
            return articles.find(a => a.id === id) || { id, nom: 'Article Inconnu', prixUnitaire: 0, stock: 0, categorie: 'N/A' } as Article;
        }
    },

    create: async (data: Partial<Article>) => {
        try {
            const apiData = mapToBackend(data);
            const response = await apiClient.post<ArticleResponse>('/articles', apiData);
            return mapToFrontend(response.data);
        } catch (e) {
            const articles = getDemoArticles();
            const newArticle = { ...data, id: `art-${Date.now()}` } as Article;
            articles.push(newArticle);
            saveDemoArticles(articles);
            return newArticle;
        }
    },

    update: async (id: string, data: Partial<Article>) => {
        try {
            const apiData = mapToBackend(data);
            const response = await apiClient.put<ArticleResponse>(`/articles/${id}`, apiData);
            return mapToFrontend(response.data);
        } catch (e) {
            const articles = getDemoArticles();
            const idx = articles.findIndex(a => a.id === id);
            if (idx >= 0) {
                articles[idx] = { ...articles[idx], ...data };
                saveDemoArticles(articles);
                return articles[idx];
            }
            throw new Error('Article not found');
        }
    },

    delete: async (id: string) => {
        try {
            await apiClient.delete(`/articles/${id}`);
        } catch (e) {
            const articles = getDemoArticles();
            saveDemoArticles(articles.filter(a => a.id !== id));
        }
    }
};


