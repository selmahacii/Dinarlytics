import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { AIInsight, insightCategories, insightTypes } from '@/types/aiInsights';
import aiService from '@/services/aiService';

interface InsightsSummaryProps {
  onOpenInsights: () => void;
}

const InsightsSummary: React.FC<InsightsSummaryProps> = ({ onOpenInsights }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);

  // Charger les insights depuis le serveur
  useEffect(() => {
    const loadInsights = async () => {
      try {
        const result = await aiService.getInsights('general', {});
        if (result && result.insights) {
          setInsights(result.insights);
        }
      } catch (error) {
        console.error('Failed to load insights:', error);
        // Fallback to empty insights
        setInsights([]);
      }
    };
    loadInsights();
  }, []);
  const [newInsightsCount, setNewInsightsCount] = useState(0);

  // Simuler de nouveaux insights
  useEffect(() => {
    const interval = setInterval(() => {
      // 5% de chance de générer un nouvel insight toutes les 10 secondes
      if (Math.random() < 0.05) {
        const newInsight = generateRandomInsight();
        setInsights(prev => [newInsight, ...prev]);
        setNewInsightsCount(prev => prev + 1);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const generateRandomInsight = (): AIInsight => {
    const types = Object.keys(insightTypes) as Array<keyof typeof insightTypes>;
    const categories = Object.keys(insightCategories) as Array<keyof typeof insightCategories>;
    const impacts = ['high', 'medium', 'low'] as const;
    
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomImpact = impacts[Math.floor(Math.random() * impacts.length)];
    
    return {
      id: `insight-${Date.now()}`,
      type: randomType,
      title: ` Nouvel insight ${insightTypes[randomType].label}`,
      description: `L'IA a détecté une ${insightTypes[randomType].label.toLowerCase()} dans la catégorie ${insightCategories[randomCategory].label.toLowerCase()}.`,
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100
      impact: randomImpact,
      category: randomCategory,
      data: {
        metric: 'Métrique simulée',
        currentValue: Math.floor(Math.random() * 1000) + 100,
        timeframe: 'Temps réel'
      },
      recommendations: [],
      createdAt: new Date().toISOString(),
      status: 'new',
      tags: ['simulation', 'temps-réel']
    };
  };

  const getStats = () => {
    const total = insights.length;
    const newCount = insights.filter(i => i.status === 'new').length;
    const highImpact = insights.filter(i => i.impact === 'high').length;
    const avgConfidence = Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / total);

    return { total, newCount, highImpact, avgConfidence };
  };

  const stats = getStats();
  const recentInsights = insights.slice(0, 3);

  const getTrendIcon = (insight: AIInsight) => {
    if (insight.data.change === undefined) return <MinusIcon className="h-4 w-4 text-gray-400" />;
    return insight.data.change > 0 
      ? <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
      : <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <SparklesIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
               Insights IA en Temps Réel
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Intelligence artificielle active
            </p>
          </div>
        </div>
        <button
          onClick={onOpenInsights}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2 transition-all duration-200 transform hover:scale-105"
        >
          <SparklesIcon className="h-4 w-4" />
          <span>Voir tous les insights</span>
          {newInsightsCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {newInsightsCount}
            </span>
          )}
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Insights totaux</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.newCount}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Nouveaux</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.highImpact}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Impact élevé</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.avgConfidence}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Confiance moyenne</div>
        </div>
      </div>

      {/* Insights récents */}
      <div>
        <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <ChartBarIcon className="h-4 w-4 mr-2" />
          Insights Récents
        </h4>
        <div className="space-y-3">
          {recentInsights.map((insight) => {
            const category = insightCategories[insight.category];
            const type = insightTypes[insight.type];
            
            return (
              <div
                key={insight.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={onOpenInsights}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-lg">{category.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {insight.title}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(insight)}
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {typeof insight.data.currentValue === 'number' && insight.data.currentValue > 1000
                          ? insight.data.currentValue.toLocaleString()
                          : insight.data.currentValue}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {insight.confidence}% confiance
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicateur de statut */}
      <div className="mt-4 flex items-center justify-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          IA active - Analyse en cours...
        </span>
      </div>
    </div>
  );
};

export default InsightsSummary;



