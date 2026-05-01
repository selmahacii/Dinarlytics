import React, { useState } from 'react';
import {
  ChartBarIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LightBulbIcon,
  BellAlertIcon,
  RocketLaunchIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';
import Card from '../UI/Card';
import { RevenueBasedAccessManager } from '@shared/utils/RevenueBasedAccessManager';
import { getRevenueSegment, getSegmentProgress } from '@/types/revenueSegments';

interface RevenueBasedAccessWidgetProps {
  companyName: string;
  companyType: string;
  revenue: number;
  currentAccessLevel: string;
}

const RevenueBasedAccessWidget: React.FC<RevenueBasedAccessWidgetProps> = ({
  companyName,
  companyType,
  revenue,
  currentAccessLevel
}) => {
  const { formatCurrency } = useApp();
  const [showDetails, setShowDetails] = useState(false);

  // Générer le rapport complet
  const report = RevenueBasedAccessManager.generateDemoReport(companyName, companyType, revenue);
  const config = report.configuration;
  const segment = getRevenueSegment(revenue);
  const progress = getSegmentProgress(revenue);

  // Icônes selon le type de recommandation
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'upgrade': return RocketLaunchIcon;
      case 'downgrade': return ArrowTrendingUpIcon;
      case 'warning': return ExclamationTriangleIcon;
      case 'opportunity': return LightBulbIcon;
      case 'compliance': return ShieldCheckIcon;
      default: return BellAlertIcon;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec score de santé */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`h-20 w-20 rounded-full bg-gradient-to-br from-${segment.color}-400 to-${segment.color}-600 flex items-center justify-center text-4xl shadow-lg`}>
              {segment.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{companyName}</h2>
              <p className="text-gray-600">{segment.name}</p>
              <div className="flex items-center space-x-2 mt-2">
                <span className="text-3xl font-bold text-blue-600">
                  {formatCurrency(revenue)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Score de santé */}
          <div className="text-center">
            <div className={`text-6xl font-bold ${
              report.health.score >= 80 ? 'text-green-600' :
              report.health.score >= 60 ? 'text-blue-600' :
              report.health.score >= 40 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {report.health.score}
            </div>
            <div className="text-sm font-medium text-gray-600 mt-1">Score de Santé</div>
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold mt-2 ${
              report.health.score >= 80 ? 'bg-green-100 text-green-800' :
              report.health.score >= 60 ? 'bg-blue-100 text-blue-800' :
              report.health.score >= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
            }`}>
              {report.health.status}
            </div>
          </div>
        </div>

        {/* Barre de progression dans le segment */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progression dans le segment {segment.name}
            </span>
            <span className="text-sm font-semibold text-blue-600">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-4 rounded-full bg-gradient-to-r from-${segment.color}-400 to-${segment.color}-600 transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {config.nextMilestone && (
            <p className="text-xs text-gray-500 mt-2">
              Prochain seuil à {formatCurrency(config.nextMilestone.threshold)} 
              ({formatCurrency(config.nextMilestone.distance)} restants)
            </p>
          )}
        </div>
      </Card>

      {/* Statistiques clés */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100">
              <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Type</p>
              <p className="text-lg font-bold text-gray-900">{companyType.toUpperCase()}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Segment</p>
              <p className="text-lg font-bold text-gray-900">{segment.name}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <ShieldCheckIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Accès recommandé</p>
              <p className="text-lg font-bold text-gray-900">{config.recommendedAccessLevel}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <BellAlertIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600">Alertes</p>
              <p className="text-lg font-bold text-gray-900">{config.recommendations.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recommandations principales */}
      {config.recommendations.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <LightBulbIcon className="h-6 w-6 mr-2 text-yellow-500" />
              Recommandations Intelligentes
            </h3>
            <span className="text-sm text-gray-500">
              {config.recommendations.filter(r => r.priority === 'critical' || r.priority === 'high').length} action(s) prioritaire(s)
            </span>
          </div>

          <div className="space-y-3">
            {config.recommendations.slice(0, showDetails ? undefined : 3).map((rec, index) => {
              const Icon = getRecommendationIcon(rec.type);
              return (
                <div 
                  key={rec.id}
                  className={`p-4 rounded-lg border-2 ${getPriorityColor(rec.priority)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm">{rec.title}</h4>
                        <span className="text-xs font-semibold uppercase px-2 py-1 rounded">
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-sm mt-1 opacity-90">{rec.description}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="text-xs">
                          <span className="font-semibold">Action:</span> {rec.action}
                        </div>
                        {rec.savings && (
                          <div className="flex items-center text-green-600 font-semibold text-sm">
                            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                            {formatCurrency(rec.savings)}
                          </div>
                        )}
                      </div>
                      {rec.deadline && (
                        <div className="mt-2 text-xs font-medium opacity-75">
                          ⏰ {rec.deadline}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {config.recommendations.length > 3 && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-4 w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {showDetails ? 'Voir moins' : `Voir ${config.recommendations.length - 3} recommandation(s) supplémentaire(s)`}
            </button>
          )}
        </Card>
      )}

      {/* Modules disponibles */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <CheckCircleIcon className="h-6 w-6 mr-2 text-green-500" />
          Modules Disponibles ({config.availableModules.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {config.availableModules.map((module, index) => (
            <div key={index} className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-800">{module}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Catégorie fiscale */}
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Catégorie Fiscale</h3>
            <p className="text-2xl font-bold text-indigo-600">{segment.fiscalCategory}</p>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-gray-700">Obligations:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {segment.obligations.slice(0, 3).map((obligation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{obligation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {segment.taxBenefits && segment.taxBenefits.length > 0 && (
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700 mb-2">Avantages fiscaux:</p>
              <ul className="text-sm text-green-600 space-y-1">
                {segment.taxBenefits.slice(0, 2).map((benefit, index) => (
                  <li key={index}>✓ {benefit}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default RevenueBasedAccessWidget;




