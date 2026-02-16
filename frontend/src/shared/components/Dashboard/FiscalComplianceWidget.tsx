import React from 'react';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import { FiscalComplianceChecker, ComplianceItem } from '@shared/utils/FiscalComplianceChecker';

interface FiscalComplianceWidgetProps {
  revenue: number;
  companyType: string;
}

const FiscalComplianceWidget: React.FC<FiscalComplianceWidgetProps> = ({
  revenue,
  companyType
}) => {
  const compliance = FiscalComplianceChecker.calculateCompliance(revenue, companyType);
  const calendar = FiscalComplianceChecker.generateFiscalCalendar(revenue, companyType);
  const potentialPenalties = FiscalComplianceChecker.calculatePotentialPenalties(revenue, companyType);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800 border-green-300';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-300';
      case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return CheckCircleIcon;
      case 'warning': return ExclamationTriangleIcon;
      case 'overdue': return XCircleIcon;
      case 'upcoming': return ClockIcon;
      default: return ShieldCheckIcon;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'declaration': return '📋';
      case 'document': return '📄';
      case 'audit': return '🔍';
      case 'tax': return '💰';
      case 'social': return '👥';
      default: return '📌';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getOverallStatusColor = () => {
    switch (compliance.overallStatus) {
      case 'compliant': return 'from-green-400 to-green-600';
      case 'attention': return 'from-yellow-400 to-yellow-600';
      case 'critical': return 'from-red-400 to-red-600';
    }
  };

  const getOverallStatusText = () => {
    switch (compliance.overallStatus) {
      case 'compliant': return 'Conforme';
      case 'attention': return 'Attention Requise';
      case 'critical': return 'Critique';
    }
  };

  return (
    <div className="space-y-6">
      {/* Score de conformité global */}
      <Card className={`p-6 bg-gradient-to-br ${getOverallStatusColor()} text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Conformité Fiscale</h2>
            <p className="text-white opacity-90">
              Statut: {getOverallStatusText()}
            </p>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold">{compliance.complianceScore}</div>
            <div className="text-sm opacity-90 mt-1">/ 100</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
            <CheckCircleIcon className="h-6 w-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">{compliance.compliantItems}</div>
            <div className="text-xs opacity-90">Conformes</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
            <ExclamationTriangleIcon className="h-6 w-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">{compliance.warningItems}</div>
            <div className="text-xs opacity-90">À surveiller</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
            <XCircleIcon className="h-6 w-6 mx-auto mb-1" />
            <div className="text-2xl font-bold">{compliance.overdueItems}</div>
            <div className="text-xs opacity-90">En retard</div>
          </div>
        </div>
      </Card>

      {/* Recommandations */}
      {compliance.recommendations.length > 0 && (
        <Card className="p-6 bg-blue-50 border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
            <ShieldCheckIcon className="h-6 w-6 mr-2 text-blue-600" />
            Recommandations
          </h3>
          <ul className="space-y-2">
            {compliance.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start text-sm text-gray-700">
                <span className="mr-2 flex-shrink-0">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Pénalités potentielles */}
      {potentialPenalties > 0 && (
        <Card className="p-6 bg-red-50 border-2 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-1">⚠️ Pénalités Potentielles</h3>
              <p className="text-sm text-red-700">
                Régularisez rapidement les obligations en retard
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end text-3xl font-bold text-red-600">
                <BanknotesIcon className="h-8 w-8 mr-2" />
                {(potentialPenalties / 1000).toFixed(0)}K DA
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Liste des obligations */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <CalendarDaysIcon className="h-6 w-6 mr-2 text-purple-600" />
          Obligations Fiscales ({compliance.totalItems})
        </h3>
        <div className="space-y-3">
          {compliance.items.map((item) => {
            const StatusIcon = getStatusIcon(item.status);
            
            return (
              <div
                key={item.id}
                className={`p-4 rounded-lg border-2 ${getStatusColor(item.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 text-2xl">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-bold text-sm">{item.title}</h4>
                        <StatusIcon className="h-4 w-4" />
                      </div>
                      <p className="text-xs opacity-90 mb-2">{item.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-white bg-opacity-50 rounded">
                          📅 {item.frequency === 'monthly' ? 'Mensuel' : 
                              item.frequency === 'quarterly' ? 'Trimestriel' :
                              item.frequency === 'annual' ? 'Annuel' : 'Sur demande'}
                        </span>
                        {item.nextDue && (
                          <span className="px-2 py-1 bg-white bg-opacity-50 rounded">
                            ⏰ Échéance: {formatDate(item.nextDue)}
                          </span>
                        )}
                        {item.lastCompleted && (
                          <span className="px-2 py-1 bg-white bg-opacity-50 rounded">
                            ✅ Dernier: {formatDate(item.lastCompleted)}
                          </span>
                        )}
                      </div>
                      {item.penalty && (
                        <div className="mt-2 text-xs font-semibold text-red-600">
                          💸 Pénalité: {item.penalty.toLocaleString()} DA
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full uppercase ${
                      item.priority === 'critical' ? 'bg-red-200 text-red-800' :
                      item.priority === 'high' ? 'bg-orange-200 text-orange-800' :
                      item.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Calendrier fiscal simplifié */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <CalendarDaysIcon className="h-6 w-6 mr-2 text-purple-600" />
          Prochaines Échéances
        </h3>
        <div className="space-y-2">
          {calendar.slice(0, 5).map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className={`h-2 w-2 rounded-full ${
                  item.priority === 'critical' ? 'bg-red-500' :
                  item.priority === 'high' ? 'bg-orange-500' :
                  'bg-blue-500'
                }`} />
                <span className="text-sm font-medium text-gray-900">{item.title}</span>
              </div>
              <span className="text-sm text-gray-600">{formatDate(item.nextDue)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default FiscalComplianceWidget;


