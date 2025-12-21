import React, { useState } from 'react';
import {
  SparklesIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  BoltIcon,
  CpuChipIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import BaseWidget from './BaseWidget';
import { AIInsightWidgetProps } from '../../types/widgets';

const AIInsightWidget: React.FC<AIInsightWidgetProps> = ({ data, ...props }) => {
  const { insights, aiStatus, lastUpdate } = data;
  const [selectedInsight, setSelectedInsight] = useState<string | null>(null);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'recommendation':
        return <LightBulbIcon className="h-5 w-5 text-blue-500" />;
      case 'alert':
        return <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />;
      case 'prediction':
        return <ChartBarIcon className="h-5 w-5 text-purple-500" />;
      case 'analysis':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-500" />;
      default:
        return <InformationCircleIcon className="h-5 w-5 text-slate-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'high':
        return 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/20';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'low':
        return 'border-l-slate-500 bg-slate-50 dark:bg-slate-900/20';
      default:
        return 'border-l-slate-300 bg-slate-50 dark:bg-slate-900/20';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-emerald-600 dark:text-emerald-400';
    if (confidence >= 0.6) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getAIStatusIcon = () => {
    switch (aiStatus) {
      case 'active':
        return <BoltIcon className="h-4 w-4 text-emerald-500" />;
      case 'learning':
        return <CpuChipIcon className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'idle':
        return <CpuChipIcon className="h-4 w-4 text-slate-400" />;
      default:
        return <CpuChipIcon className="h-4 w-4 text-slate-400" />;
    }
  };

  const getAIStatusText = () => {
    switch (aiStatus) {
      case 'active':
        return 'IA Active';
      case 'learning':
        return 'IA en Apprentissage';
      case 'idle':
        return 'IA en Veille';
      default:
        return 'IA Indisponible';
    }
  };

  return (
    <BaseWidget {...props}>
      <div className="p-6 h-full flex flex-col">
        {/* En-tête IA */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg">
                <SparklesIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Insights IA PRO
                </h4>
                <div className="flex items-center space-x-2 text-sm">
                  {getAIStatusIcon()}
                  <span className="text-slate-600 dark:text-slate-400">
                    {getAIStatusText()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Dernière MAJ
              </div>
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                {lastUpdate.toLocaleTimeString('fr-FR')}
              </div>
            </div>
          </div>
        </div>

        {/* Liste des insights */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:shadow-md ${getPriorityColor(insight.priority)}`}
              onClick={() => setSelectedInsight(selectedInsight === insight.id ? null : insight.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getInsightIcon(insight.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {insight.title}
                    </h5>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                        {Math.round(insight.confidence * 100)}%
                      </span>
                      {insight.actionable && (
                        <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {insight.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center space-x-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>{insight.timestamp.toLocaleDateString('fr-FR')}</span>
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        insight.priority === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                        insight.priority === 'high' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                        insight.priority === 'medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300'
                      }`}>
                        {insight.priority}
                      </span>
                    </div>
                    
                    {selectedInsight === insight.id && (
                      <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                        <EyeIcon className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {insights.length} insights générés
            </div>
            <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
              Voir tous les insights →
            </button>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

export default AIInsightWidget;

