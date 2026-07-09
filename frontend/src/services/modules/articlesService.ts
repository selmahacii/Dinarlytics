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
        const response = await apiClient.get<ArticleResponse[]>('/articles');
        if (Array.isArray(response.data)) {
            return response.data.map(mapToFrontend);
        }
        throw new Error('Invalid API response format (expected array)');
    },

    getById: async (id: string) => {
        const response = await apiClient.get<ArticleResponse>(`/articles/${id}`);
        return mapToFrontend(response.data);
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



