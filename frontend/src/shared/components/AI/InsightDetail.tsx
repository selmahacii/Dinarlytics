import React from 'react';
import {
  CheckCircleIcon,
  XMarkIcon,
  LightBulbIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { AIInsight, insightCategories, insightTypes, impactLevels } from '../../types/aiInsights';

interface InsightDetailProps {
  insight: AIInsight;
  onAction: (insightId: string, action: 'review' | 'dismiss' | 'apply') => void;
}

const InsightDetail: React.FC<InsightDetailProps> = ({ insight, onAction }) => {
  const category = insightCategories[insight.category];
  const type = insightTypes[insight.type];
  const impact = impactLevels[insight.impact];

  const getTrendIcon = () => {
    if (insight.data.change === undefined) return <MinusIcon className="h-5 w-5 text-gray-400" />;
    return insight.data.change > 0 
      ? <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
      : <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 dark:text-green-400';
    if (confidence >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'high': return 'text-red-600 dark:text-red-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'low': return 'text-green-600 dark:text-green-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* En-tête */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start space-x-3 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{type.icon}</span>
            <span className="text-2xl">{category.icon}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {insight.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {insight.description}
            </p>
          </div>
        </div>

        {/* Métadonnées */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Confiance:</span>
            <span className={`font-medium ${getConfidenceColor(insight.confidence)}`}>
              {insight.confidence}%
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Impact:</span>
            <span className={`font-medium ${
              impact.color === 'red' ? 'text-red-600 dark:text-red-400' :
              impact.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
              'text-green-600 dark:text-green-400'
            }`}>
              {impact.label}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Type:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{type.label}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Catégorie:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">{category.label}</span>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Données */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Données
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Métrique</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{insight.data.metric}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Période</div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{insight.data.timeframe}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Valeur actuelle</div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon()}
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {typeof insight.data.currentValue === 'number' && insight.data.currentValue > 1000
                      ? insight.data.currentValue.toLocaleString()
                      : insight.data.currentValue}
                  </span>
                </div>
              </div>
              {insight.data.changePercentage && (
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Évolution</div>
                  <div className={`font-medium ${
                    insight.data.changePercentage > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {insight.data.changePercentage > 0 ? '+' : ''}{insight.data.changePercentage.toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommandations */}
        {insight.recommendations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <LightBulbIcon className="h-5 w-5 mr-2" />
              Recommandations ({insight.recommendations.length})
            </h3>
            <div className="space-y-4">
              {insight.recommendations.map((rec, index) => (
                <div key={rec.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">
                      {index + 1}. {rec.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">{rec.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Action:</span>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{rec.action}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Délai:</span>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{rec.timeframe}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Effort:</span>
                      <div className={`font-medium ${getEffortColor(rec.effort)}`}>{rec.effort}</div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Impact:</span>
                      <div className={`font-medium ${getPriorityColor(rec.impact)}`}>{rec.impact}</div>
                    </div>
                  </div>
                  {rec.cost && (
                    <div className="mt-3 flex items-center space-x-2">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">Coût estimé:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{rec.cost.toLocaleString()} DZD</span>
                    </div>
                  )}
                  {rec.expectedBenefit && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Bénéfice attendu:</span>
                      <div className="font-medium text-green-600 dark:text-green-400">{rec.expectedBenefit}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <TagIcon className="h-5 w-5 mr-2" />
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {insight.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Informations */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2" />
            Informations
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400">Créé le:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatDate(insight.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <UserIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400">Généré par:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">IA Dinarlytic</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex space-x-3">
          <button
            onClick={() => onAction(insight.id, 'review')}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
          >
            <CheckCircleIcon className="h-4 w-4" />
            <span>Marquer comme examiné</span>
          </button>
          <button
            onClick={() => onAction(insight.id, 'apply')}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
          >
            <LightBulbIcon className="h-4 w-4" />
            <span>Appliquer les recommandations</span>
          </button>
          <button
            onClick={() => onAction(insight.id, 'dismiss')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-2"
          >
            <XMarkIcon className="h-4 w-4" />
            <span>Rejeter</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightDetail;
