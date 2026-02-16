import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  LightBulbIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { AIInsight, insightCategories, insightTypes, impactLevels, insightStatuses } from '@/types/aiInsights';
import aiService from '@/services/aiService';
import InsightCard from './InsightCard';
import InsightDetail from './InsightDetail';

interface InsightsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const InsightsPanel: React.FC<InsightsPanelProps> = ({ isOpen, onClose }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const result = await aiService.getInsights('general', {});
        if (result && result.insights) {
          setInsights(result.insights);
        }
      } catch (error) {
        console.error('Failed to load insights:', error);
        setInsights([]);
      }
    };
    loadInsights();
  }, []);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterImpact, setFilterImpact] = useState<string>('all');

  // Simuler de nouveaux insights en temps réel
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      // 10% de chance de générer un nouvel insight toutes les 30 secondes
      if (Math.random() < 0.1) {
        const newInsight = generateRandomInsight();
        setInsights(prev => [newInsight, ...prev]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const generateRandomInsight = (): AIInsight => {
    const types = Object.keys(insightTypes) as Array<keyof typeof insightTypes>;
    const categories = Object.keys(insightCategories) as Array<keyof typeof insightCategories>;
    const impacts = Object.keys(impactLevels) as Array<keyof typeof impactLevels>;
    
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

  const filteredInsights = insights.filter(insight => {
    if (filterType !== 'all' && insight.type !== filterType) return false;
    if (filterStatus !== 'all' && insight.status !== filterStatus) return false;
    if (filterImpact !== 'all' && insight.impact !== filterImpact) return false;
    return true;
  });

  const handleInsightAction = (insightId: string, action: 'review' | 'dismiss' | 'apply') => {
    setInsights(prev => prev.map(insight => 
      insight.id === insightId 
        ? { ...insight, status: action === 'review' ? 'reviewed' : action === 'dismiss' ? 'dismissed' : 'applied' }
        : insight
    ));
  };

  const getStats = () => {
    const total = insights.length;
    const newCount = insights.filter(i => i.status === 'new').length;
    const highImpact = insights.filter(i => i.impact === 'high').length;
    const avgConfidence = Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / total);

    return { total, newCount, highImpact, avgConfidence };
  };

  const stats = getStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <SparklesIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Insights IA
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Intelligence artificielle en temps réel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Fermer les insights IA"
            title="Fermer"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Statistiques */}
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Liste des insights */}
          <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Filtres */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex space-x-2 mb-3">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-gray-100"
                  aria-label="Filtrer par type d'insight"
                >
                  <option value="all">Tous les types</option>
                  {Object.entries(insightTypes).map(([key, type]) => (
                    <option key={key} value={key}>{type.icon} {type.label}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-gray-100"
                  aria-label="Filtrer par statut"
                >
                  <option value="all">Tous les statuts</option>
                  {Object.entries(insightStatuses).map(([key, status]) => (
                    <option key={key} value={key}>{status.label}</option>
                  ))}
                </select>
                <select
                  value={filterImpact}
                  onChange={(e) => setFilterImpact(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-gray-100"
                  aria-label="Filtrer par impact"
                >
                  <option value="all">Tous les impacts</option>
                  {Object.entries(impactLevels).map(([key, impact]) => (
                    <option key={key} value={key}>{impact.label}</option>
                  ))}
                </select>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {filteredInsights.length} insight{filteredInsights.length > 1 ? 's' : ''} trouvé{filteredInsights.length > 1 ? 's' : ''}
              </div>
            </div>

            {/* Liste */}
            <div className="flex-1 overflow-y-auto">
              {filteredInsights.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <SparklesIcon className="h-12 w-12 mx-auto mb-4" />
                    <p>Aucun insight trouvé</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {filteredInsights.map((insight) => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      isSelected={selectedInsight?.id === insight.id}
                      onClick={() => setSelectedInsight(insight)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Détail de l'insight */}
          <div className="w-1/2 flex flex-col">
            {selectedInsight ? (
              <InsightDetail
                insight={selectedInsight}
                onAction={handleInsightAction}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <EyeIcon className="h-12 w-12 mx-auto mb-4" />
                  <p>Sélectionnez un insight pour voir les détails</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsPanel;



