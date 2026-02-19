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

export const articlesService = {
    getAll: async () => {
        // MOCK IMPLEMENTATION
        // const response = await apiClient.get<ArticleResponse[]>('/articles');
        // return response.data.map(mapToFrontend);
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
            { id: '1', nom: 'Article A', codePCA: 'ART001', prixUnitaire: 1500, stock: 100, description: 'Description A', categorie: 'Cat A' },
            { id: '2', nom: 'Article B', codePCA: 'ART002', prixUnitaire: 2500, stock: 50, description: 'Description B', categorie: 'Cat B' },
            { id: '3', nom: 'Service C', codePCA: 'SRV001', prixUnitaire: 5000, stock: 0, description: 'Service de consult', categorie: 'Service' }
        ] as Article[];
    },

    getById: async (id: string) => {
        // MOCK IMPLEMENTATION
        // const response = await apiClient.get<ArticleResponse>(`/articles/${id}`);
        // return mapToFrontend(response.data);
        await new Promise(resolve => setTimeout(resolve, 300));
        return { id: id, nom: 'Article Mock', codePCA: 'MOCK001', prixUnitaire: 1000, stock: 10, description: 'Mock Description', categorie: 'General' } as Article;
    },

    create: async (data: Partial<Article>) => {
        const apiData = mapToBackend(data);
        const response = await apiClient.post<ArticleResponse>('/articles', apiData);
        return mapToFrontend(response.data);
    },

    update: async (id: string, data: Partial<Article>) => {
        const apiData = mapToBackend(data);
        const response = await apiClient.put<ArticleResponse>(`/articles/${id}`, apiData);
        return mapToFrontend(response.data);
    },

    delete: async (id: string) => {
        await apiClient.delete(`/articles/${id}`);
    }
};


