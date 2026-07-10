import { useState, useEffect } from 'react';
import apiClient from '@/services/apiClient';

export interface Article {
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

export interface ArticleStats {
  total_articles: number;
  active_articles: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_inventory_value: number;
  categories: Array<{
    name: string;
    count: number;
  }>;
  top_selling: Array<{
    id: string;
    name: string;
    quantity: number;
  }>;
}

export const useArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<ArticleStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStats, setErrorStats] = useState<string | null>(null);

  const fetchArticles = async (params?: {
    skip?: number;
    limit?: number;
    search?: string;
    category?: string;
    is_active?: boolean;
    low_stock?: boolean;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Article[]>('/articles/', { params });
      setArticles(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement des articles');
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    setErrorStats(null);
    try {
      const response = await apiClient.get<ArticleStats>('/articles/stats');
      setStats(response.data);
    } catch (err: any) {
      setErrorStats(err.response?.data?.detail || 'Erreur lors du chargement des statistiques');
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  };

  const createArticle = async (articleData: Partial<Article>): Promise<Article | null> => {
    try {
      const response = await apiClient.post<Article>('/articles/', articleData);
      setArticles(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la création');
      return null;
    }
  };

  const updateArticle = async (articleId: string, articleData: Partial<Article>): Promise<Article | null> => {
    try {
      const response = await apiClient.put<Article>(`/articles/${articleId}`, articleData);
      setArticles(prev => prev.map(a => a.id === articleId ? response.data : a));
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la mise à jour');
      return null;
    }
  };

  const deleteArticle = async (articleId: string): Promise<void> => {
    try {
      await apiClient.delete(`/articles/${articleId}`);
      setArticles(prev => prev.filter(a => a.id !== articleId));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchStats();
  }, []);

  return {
    articles,
    stats,
    loading,
    loadingStats,
    error,
    errorStats,
    fetchArticles,
    fetchStats,
    createArticle,
    updateArticle,
    deleteArticle,
  };
};
