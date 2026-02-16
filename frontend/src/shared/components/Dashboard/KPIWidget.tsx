import React from 'react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import BaseWidget from './BaseWidget';
import { KPIWidgetProps } from '@/types/widgets';

const KPIWidget: React.FC<KPIWidgetProps> = ({ data, ...props }) => {
  const { value, label, unit, trend, status, icon: Icon, color } = data;

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'info':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-emerald-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <MinusIcon className="h-4 w-4 text-slate-500" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-slate-500';
    
    switch (trend.direction) {
      case 'up':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      case 'stable':
        return 'text-slate-500 dark:text-slate-400';
      default:
        return 'text-slate-500';
    }
  };

  const formatValue = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M`;
    } else if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}K`;
    }
    return val.toLocaleString('fr-FR');
  };

  return (
    <BaseWidget {...props}>
      <div className="p-6 h-full flex flex-col justify-between">
        {/* En-tête avec icône et statut */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {Icon && (
              <div className={`p-2 rounded-lg ${color || 'bg-slate-100 dark:bg-slate-800'}`}>
                <Icon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                {label}
              </p>
            </div>
          </div>
          {getStatusIcon()}
        </div>

        {/* Valeur principale */}
        <div className="mb-4">
          <div className="flex items-baseline space-x-2">
            <span className={`text-3xl font-bold ${getStatusColor()}`}>
              {formatValue(value)}
            </span>
            {unit && (
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {unit}
              </span>
            )}
          </div>
        </div>

        {/* Tendance */}
        {trend && (
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="text-sm font-medium">
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {trend.period}
            </span>
          </div>
        )}

        {/* Barre de progression pour les KPIs avec objectif */}
        {trend && trend.value !== undefined && (
          <div className="mt-4">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  trend.direction === 'up' 
                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' 
                    : trend.direction === 'down'
                    ? 'bg-gradient-to-r from-red-400 to-red-600'
                    : 'bg-gradient-to-r from-slate-400 to-slate-600'
                }`}
                style={{ 
                  width: `${Math.min(Math.abs(trend.value) * 10, 100)}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

export default KPIWidget;



