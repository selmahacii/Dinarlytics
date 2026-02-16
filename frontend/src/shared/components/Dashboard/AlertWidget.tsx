import React, { useState } from 'react';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { AlertWidgetProps } from '@/types/widgets';
import BaseWidget from './BaseWidget';

const AlertWidget: React.FC<AlertWidgetProps> = ({
  id,
  title,
  size,
  position,
  config,
  data,
  onUpdate,
  onRemove,
  className = ''
}) => {
  const [showAll, setShowAll] = useState(false);
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set());

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'success':
        return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[severity as keyof typeof colors] || colors.low}`}>
        {severity}
      </span>
    );
  };

  const handleAcknowledge = (alertId: string) => {
    setAcknowledgedAlerts(prev => new Set([...prev, alertId]));
    
    // Mettre à jour les données
    if (onUpdate && data) {
      const updatedAlerts = data.alerts.map((alert: any) => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      );
      
      onUpdate({
        ...data,
        alerts: updatedAlerts,
        unreadCount: Math.max(0, data.unreadCount - 1)
      });
    }
  };

  const handleAction = (alertId: string, action: () => void) => {
    action();
    handleAcknowledge(alertId);
  };

  const displayedAlerts = showAll ? data.alerts : data.alerts.slice(0, 3);
  const hasMoreAlerts = data.alerts.length > 3;

  return (
    <BaseWidget
      id={id}
      title={title}
      size={size}
      position={position}
      config={config}
      onRemove={onRemove}
      className={className}
    >
      <div className="space-y-4">
        {/* En-tête avec statistiques */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BellIcon className="h-5 w-5 text-slate-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {data.totalCount} alertes
              </span>
            </div>
            {data.unreadCount > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                  {data.unreadCount} non lues
                </span>
              </div>
            )}
          </div>
          
          {hasMoreAlerts && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {showAll ? (
                <>
                  <EyeSlashIcon className="h-4 w-4" />
                  <span>Masquer</span>
                </>
              ) : (
                <>
                  <EyeIcon className="h-4 w-4" />
                  <span>Voir tout</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Liste des alertes */}
        <div className="space-y-3">
          {displayedAlerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">
                Aucune alerte active
              </p>
            </div>
          ) : (
            displayedAlerts.map((alert: any) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  acknowledgedAlerts.has(alert.id) 
                    ? 'opacity-60' 
                    : getAlertColor(alert.type)
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {alert.title}
                        </h4>
                        {getSeverityBadge(alert.severity)}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 dark:text-slate-500">
                          {new Date(alert.timestamp).toLocaleString('fr-FR')}
                        </span>
                        {alert.acknowledged && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                            ✓ Lu
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-3">
                    {alert.actions && alert.actions.length > 0 && (
                      <div className="flex space-x-1">
                        {alert.actions.map((action: any, index: number) => (
                          <button
                            key={index}
                            onClick={() => handleAction(alert.id, action.action)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              action.type === 'primary'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : action.type === 'danger'
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                            }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {!alert.acknowledged && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                        title="Marquer comme lu"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Actions globales */}
        {data.unreadCount > 0 && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                const allAlertIds = data.alerts.map((alert: any) => alert.id);
                setAcknowledgedAlerts(new Set(allAlertIds));
                if (onUpdate) {
                  onUpdate({
                    ...data,
                    alerts: data.alerts.map((alert: any) => ({ ...alert, acknowledged: true })),
                    unreadCount: 0
                  });
                }
              }}
              className="w-full px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              Marquer toutes comme lues
            </button>
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

export default AlertWidget;


