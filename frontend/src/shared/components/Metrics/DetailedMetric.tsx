import React, { useState, useEffect } from 'react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
  InformationCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { RealisticMetric } from '../../types/dashboard';

interface DetailedMetricProps {
  metric: RealisticMetric;
  isVisible: boolean;
  animationDelay?: number;
}

const DetailedMetric: React.FC<DetailedMetricProps> = ({
  metric,
  isVisible,
  animationDelay = 0
}) => {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        animateValue();
      }, animationDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, animationDelay]);

  const animateValue = () => {
    const duration = 1500;
    const startValue = 0;
    const endValue = metric.valeur;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function pour une animation plus naturelle
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOutCubic;

      setAnimatedValue(currentValue);
      setAnimationProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  const getTendanceIcon = () => {
    switch (metric.tendance) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />;
      default:
        return <MinusIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTendanceColor = () => {
    switch (metric.tendance) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getProgressPercentage = () => {
    if (!metric.objectif) return 0;
    return Math.min((metric.valeur / metric.objectif) * 100, 100);
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  const getAlertIcon = () => {
    if (metric.details.alertes && metric.details.alertes.length > 0) {
      return metric.tendance === 'up' ?
        <CheckCircleIcon className="h-4 w-4 text-green-500" /> :
        <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-all duration-300">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {metric.nom}
            </h3>
            {getAlertIcon()}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {metric.details.description}
          </p>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <InformationCircleIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Valeur principale */}
      <div className="mb-4">
        <div className="flex items-baseline space-x-3">
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {formatValue(animatedValue)}
            <span className="text-lg text-gray-500 dark:text-gray-400 ml-1">
              {metric.unite}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            {getTendanceIcon()}
            <span className={`text-sm font-medium ${getTendanceColor()}`}>
              {metric.evolution > 0 ? '+' : ''}{metric.evolutionPourcentage.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Barre de progression vers l'objectif */}
        {metric.objectif && (
          <div className="mt-3">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Objectif: {formatValue(metric.objectif)} {metric.unite}</span>
              <span>{getProgressPercentage().toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-2000 ease-out ${getProgressPercentage() >= 100
                    ? 'bg-green-500'
                    : getProgressPercentage() >= 80
                      ? 'bg-blue-500'
                      : 'bg-yellow-500'
                  }`}
                style={{
                  width: `${getProgressPercentage() * animationProgress}%`,
                  transitionDelay: '500ms'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Contexte */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Contexte
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {metric.details.contexte}
        </p>
      </div>

      {/* Facteurs clés */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
          Facteurs clés
        </h4>
        <div className="space-y-1">
          {metric.details.facteurs.map((facteur, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
              style={{
                opacity: animationProgress > 0.5 ? 1 : 0,
                transitionDelay: `${index * 100 + 500}ms`
              }}
            >
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>{facteur}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alertes */}
      {metric.details.alertes && metric.details.alertes.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Alertes
          </h4>
          <div className="space-y-1">
            {metric.details.alertes.map((alerte, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 text-sm p-2 rounded ${metric.tendance === 'up'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                  }`}
                style={{
                  opacity: animationProgress > 0.7 ? 1 : 0,
                  transitionDelay: `${index * 100 + 700}ms`
                }}
              >
                {metric.tendance === 'up' ?
                  <CheckCircleIcon className="h-4 w-4" /> :
                  <ExclamationTriangleIcon className="h-4 w-4" />
                }
                <span>{alerte}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Détails supplémentaires */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
            Historique détaillé
          </h4>
          <div className="space-y-2">
            {metric.historique.slice(-5).map((point, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
                style={{
                  opacity: animationProgress > 0.8 ? 1 : 0,
                  transitionDelay: `${index * 50 + 800}ms`
                }}
              >
                <span className="text-gray-600 dark:text-gray-400">{point.label}</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatValue(point.valeur)} {metric.unite}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <ChartBarIcon className="h-3 w-3" />
            <span>Données mises à jour en temps réel</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailedMetric;
