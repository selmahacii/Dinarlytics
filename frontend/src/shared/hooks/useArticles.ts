import { useState, useEffect } from 'react';
import axios from 'axios';

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

  // Fetch articles list
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

    // MOCK DATA - Algerian Articles
    const mockArticles: Article[] = [
      {
        id: 'art-001',
        name: 'Service Conseil Premium',
        description: 'Accompagnement stratégique pour PME',
        category: 'Services',
        unit_price: 150000,
        cost_price: 85000,
        tax_rate: 19,
        stock_quantity: 100,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'art-002',
        name: 'Licence Logiciel Dinarlytics',
        description: 'Solution ERP Cloud pour entreprises algériennes',
        category: 'Licences',
        unit_price: 45000,
        cost_price: 15000,
        tax_rate: 19,
        stock_quantity: 500,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'art-003',
        name: 'Audit Sécurité V2',
        description: 'Audit complet des infrastructures IT',
        category: 'Services',
        unit_price: 225000,
        cost_price: 120000,
        tax_rate: 19,
        stock_quantity: 50,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    setTimeout(() => {
      setArticles(mockArticles);
      setLoading(false);
    }, 800);

    /* Real API Call Commented
    try {
      const response = await axios.get<Article[]>('/api/v1/articles/', { params });
      setArticles(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement des articles');
    } finally {
      setLoading(false);
    }
    */
  };

  // Fetch article statistics
  const fetchStats = async () => {
    setLoadingStats(true);
    setErrorStats(null);

    // MOCK STATS
    const mockStats: ArticleStats = {
      total_articles: 45,
      active_articles: 42,
      low_stock_count: 5,
      out_of_stock_count: 2,
      total_inventory_value: 12500000,
      categories: [
        { name: 'Services', count: 15 },
        { name: 'Licences', count: 12 },
        { name: 'Formations', count: 10 },
        { name: 'Audit', count: 8 }
      ],
      top_selling: [
        { id: 'art-001', name: 'Service Conseil Premium', quantity: 145 },
        { id: 'art-002', name: 'Licence Logiciel Dinarlytics', quantity: 89 }
      ]
    };

    setTimeout(() => {
      setStats(mockStats);
      setLoadingStats(false);
    }, 1000);

    /* Real API Call Commented
    try {
      const response = await axios.get<ArticleStats>('/api/v1/articles/stats');
      setStats(response.data);
    } catch (err: any) {
      setErrorStats(err.response?.data?.detail || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoadingStats(false);
    }
    */
  };

  // Create/Update/Delete - Simulated for frontend logic
  const createArticle = async (articleData: Partial<Article>): Promise<Article | null> => {
    const newArticle = { ...articleData, id: `art-${Date.now()}` } as Article;
    setArticles(prev => [...prev, newArticle]);
    return newArticle;
  };

  const updateArticle = async (articleId: string, articleData: Partial<Article>): Promise<Article | null> => {
    setArticles(prev => prev.map(a => a.id === articleId ? { ...a, ...articleData } : a));
    return { id: articleId, ...articleData } as Article;
  };

  const deleteArticle = async (articleId: string): Promise<void> => {
    setArticles(prev => prev.filter(a => a.id !== articleId));
  };

  // Initial fetch on mount
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
