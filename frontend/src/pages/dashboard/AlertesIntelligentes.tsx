import React, { useState } from 'react';
import { 
  ExclamationTriangleIcon, 
  BellIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const AlertesIntelligentes: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  const alertTypes = [
    { id: 'all', name: 'Toutes', count: 12 },
    { id: 'critical', name: 'Critiques', count: 2 },
    { id: 'warning', name: 'Avertissements', count: 5 },
    { id: 'info', name: 'Informations', count: 5 }
  ];

  const alerts = [
    {
      id: 1,
      title: 'Stock bas - Article A001',
      message: 'Le stock de l\'article A001 est en dessous du seuil minimum (5 unités restantes)',
      type: 'critical',
      severity: 'high',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
      acknowledged: false,
      category: 'stock'
    },
    {
      id: 2,
      title: 'Facture impayée - Client C123',
      message: 'La facture #F2024-001 du client C123 est en retard de 15 jours',
      type: 'warning',
      severity: 'medium',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h ago
      acknowledged: false,
      category: 'facturation'
    },
    {
      id: 3,
      title: 'Échéance fiscale approche',
      message: 'La déclaration TVA du mois de décembre est due dans 3 jours',
      type: 'info',
      severity: 'medium',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6h ago
      acknowledged: true,
      category: 'fiscal'
    },
    {
      id: 4,
      title: 'Système de sauvegarde',
      message: 'Sauvegarde automatique effectuée avec succès',
      type: 'info',
      severity: 'low',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8h ago
      acknowledged: true,
      category: 'system'
    },
    {
      id: 5,
      title: 'Erreur de connexion API',
      message: 'Impossible de synchroniser les données avec le service externe',
      type: 'critical',
      severity: 'high',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1h ago
      acknowledged: false,
      category: 'system'
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-slate-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20';
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      default:
        return 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/20';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
      high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[severity as keyof typeof colors] || colors.low}`}>
        {severity}
      </span>
    );
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'critical') return alert.type === 'critical';
    if (filter === 'warning') return alert.type === 'warning';
    if (filter === 'info') return alert.type === 'info';
    return true;
  }).filter(alert => showAcknowledged || !alert.acknowledged);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Alertes Intelligentes</h1>
            <p className="text-slate-600 mt-1">Surveillance proactive de votre activité</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BellIcon className="h-5 w-5 text-slate-500" />
              <span className="text-sm text-slate-600">
                {alerts.filter(a => !a.acknowledged).length} alertes actives
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et contrôles */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Filtrer par type :</span>
          </div>
          <div className="flex space-x-2">
            {alertTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setFilter(type.id)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === type.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {type.name}
                <span className="ml-2 px-2 py-1 bg-slate-200 text-slate-600 rounded-full text-xs">
                  {type.count}
                </span>
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={() => setShowAcknowledged(!showAcknowledged)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showAcknowledged
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {showAcknowledged ? (
                <>
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Afficher les lues
                </>
              ) : (
                <>
                  <EyeSlashIcon className="h-4 w-4 mr-2" />
                  Masquer les lues
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des alertes */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucune alerte</h3>
            <p className="text-slate-600">
              {filter === 'all' 
                ? 'Toutes les alertes ont été traitées' 
                : `Aucune alerte de type "${alertTypes.find(t => t.id === filter)?.name}"`}
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-6 rounded-lg border transition-all duration-200 ${
                alert.acknowledged 
                  ? 'opacity-60 border-slate-200 bg-slate-50' 
                  : getAlertColor(alert.type)
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {alert.title}
                      </h3>
                      {getSeverityBadge(alert.severity)}
                      {alert.acknowledged && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Lu
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 mb-3">{alert.message}</p>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <span>Catégorie: {alert.category}</span>
                      <span>•</span>
                      <span>{alert.timestamp.toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {!alert.acknowledged && (
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Marquer comme lu
                    </button>
                  )}
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm">
                    Actions
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Statistiques des alertes */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Statistiques des Alertes</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">2</div>
            <div className="text-sm text-slate-600 mt-1">Alertes critiques</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">5</div>
            <div className="text-sm text-slate-600 mt-1">Avertissements</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">5</div>
            <div className="text-sm text-slate-600 mt-1">Informations</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">2</div>
            <div className="text-sm text-slate-600 mt-1">Résolues</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertesIntelligentes;
