import React from 'react';
import {
  ClockIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { AIInsight, insightCategories, insightTypes, impactLevels, insightStatuses } from '@/types/aiInsights';

interface InsightCardProps {
  insight: AIInsight;
  isSelected: boolean;
  onClick: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, isSelected, onClick }) => {
  const category = insightCategories[insight.category];
  const type = insightTypes[insight.type];
  const impact = impactLevels[insight.impact];
  const status = insightStatuses[insight.status];

  const getTrendIcon = () => {
    if (insight.data.change === undefined) return <MinusIcon className="h-4 w-4 text-gray-400" />;
    return insight.data.change > 0 
      ? <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
      : <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return 'Hier';
    return date.toLocaleDateString('fr-FR');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 dark:text-green-400';
    if (confidence >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
      }`}
    >
      {/* En-tête */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{type.icon}</span>
          <span className="text-lg">{category.icon}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            status.color === 'blue' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
            status.color === 'green' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            status.color === 'gray' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' :
            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
          }`}>
            {status.label}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${
            impact.color === 'red' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
            impact.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {impact.label}
          </span>
        </div>
      </div>

      {/* Titre */}
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
        {insight.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {insight.description}
      </p>

      {/* Métriques */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {typeof insight.data.currentValue === 'number' && insight.data.currentValue > 1000
                ? insight.data.currentValue.toLocaleString()
                : insight.data.currentValue}
            </span>
            {insight.data.unite && (
              <span className="text-xs text-gray-500 dark:text-gray-400">{insight.data.unite}</span>
            )}
          </div>
          {insight.data.changePercentage && (
            <span className={`text-sm font-medium ${
              insight.data.changePercentage > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {insight.data.changePercentage > 0 ? '+' : ''}{insight.data.changePercentage.toFixed(1)}%
            </span>
          )}
        </div>
        <div className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
          {insight.confidence}% confiance
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-1">
          <ClockIcon className="h-3 w-3" />
          <span>{formatDate(insight.createdAt)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <TagIcon className="h-3 w-3" />
          <span>{insight.tags.length} tag{insight.tags.length > 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default InsightCard;


