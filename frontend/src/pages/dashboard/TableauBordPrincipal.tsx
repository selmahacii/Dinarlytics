import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  CalculatorIcon,
  BanknotesIcon,
  EyeIcon,
  BookOpenIcon,
  CogIcon,
  PlusIcon,
  XMarkIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import api from '../../services/api';

const TableauBordPrincipal: React.FC = () => {
  const { formatCurrency } = useApp();
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState('mois');
  const [activeWidget, setActiveWidget] = useState('overview');
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [dynamicMetrics, setDynamicMetrics] = useState<any[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  useEffect(() => {
    setLoadingMetrics(true);
    Promise.all([
      api.kpis.getKPIs(),
      api.stats.getActivityMetrics()
    ])
      .then(([kpisData, activityData]) => {
        setDynamicMetrics([
          {
            title: 'Chiffre d\'Affaires',
            value: formatCurrency(kpisData?.revenue || 125000),
            change: '+12.5%',
            changeType: 'positive',
            icon: CurrencyDollarIcon,
            color: 'emerald'
          },
          {
            title: 'Utilisateurs Actifs',
            value: activityData?.active_visitors?.toString() || '24',
            change: '+2',
            changeType: 'positive',
            icon: UserGroupIcon,
            color: 'slate'
          },
          {
            title: 'Articles en Stock',
            value: kpisData?.stock_count || '3,456',
            change: '-2.1%',
            changeType: 'negative',
            icon: CubeIcon,
            color: 'slate'
          },
          {
            title: 'Factures en Attente',
            value: activityData?.pending_orders?.toString() || '23',
            change: '+5',
            changeType: 'neutral',
            icon: DocumentTextIcon,
            color: 'amber'
          }
        ]);
      })
      .catch(() => {})
      .finally(() => setLoadingMetrics(false));
  }, [formatCurrency]);
  const [isQuickActionModalOpen, setIsQuickActionModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Métriques principales de l'ERP (now dynamically loaded)
  const metrics = dynamicMetrics.length > 0 ? dynamicMetrics : [
    {
      title: 'Chiffre d\'Affaires',
      value: formatCurrency(125000),
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: CurrencyDollarIcon,
      color: 'emerald'
    },
    {
      title: 'Utilisateurs Actifs',
      value: '24',
      change: '+2',
      changeType: 'positive' as const,
      icon: UserGroupIcon,
      color: 'slate'
    },
    {
      title: 'Articles en Stock',
      value: '3,456',
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: CubeIcon,
      color: 'slate'
    },
    {
      title: 'Factures en Attente',
      value: '23',
      change: '+5',
      changeType: 'neutral' as const,
      icon: DocumentTextIcon,
      color: 'amber'
    }
  ];

  // Activités récentes enrichies
  const recentActivities = [
    { 
      id: 1, 
      type: 'facture', 
      titre: 'Facture de vente créée',
      description: 'Facture #F-2025-0234 • Client: SARL TechnoPlus',
      montant: '+45,000 DZD',
      time: 'Il y a 5 min', 
      icon: DocumentTextIcon,
      color: 'blue'
    },
    { 
      id: 2, 
      type: 'client', 
      titre: 'Nouveau client enregistré',
      description: 'EURL Distribution Nord • Secteur: Commerce',
      montant: null,
      time: 'Il y a 15 min', 
      icon: UserGroupIcon,
      color: 'emerald'
    },
    { 
      id: 3, 
      type: 'stock', 
      titre: 'Ajustement inventaire',
      description: 'Article A-125 • Qté: +150 unités',
      montant: null,
      time: 'Il y a 30 min', 
      icon: CubeIcon,
      color: 'purple'
    },
    { 
      id: 4, 
      type: 'paiement', 
      titre: 'Encaissement reçu',
      description: 'Facture #F-2025-0198 • Virement bancaire',
      montant: '+32,500 DZD',
      time: 'Il y a 1h', 
      icon: BanknotesIcon,
      color: 'teal'
    },
    { 
      id: 5, 
      type: 'achat', 
      titre: 'Commande fournisseur validée',
      description: 'CMD-2025-089 • Fournisseur: STE Import Export',
      montant: '-18,750 DZD',
      time: 'Il y a 2h', 
      icon: TruckIcon,
      color: 'orange'
    },
    { 
      id: 6, 
      type: 'comptable', 
      titre: 'Écriture comptable',
      description: 'OD-2025-042 • Régularisation TVA',
      montant: null,
      time: 'Il y a 3h', 
      icon: CalculatorIcon,
      color: 'indigo'
    }
  ];

  // Nouvelles fonctions ERPNext
  const handleQuickAction = (action: string) => {
    console.log('Action rapide:', action);
    setIsQuickActionModalOpen(true);
  };

  const handleNotificationClick = () => {
    setIsNotificationModalOpen(true);
  };

  const handleReportGeneration = () => {
    setIsReportModalOpen(true);
  };

  // Données  avancées
  const notifications = [
    { id: 1, type: 'warning', message: 'Stock faible sur 5 articles', time: '2 min', priority: 'high' },
    { id: 2, type: 'info', message: 'Nouvelle commande reçue', time: '15 min', priority: 'medium' },
    { id: 3, type: 'success', message: 'Facture payée', time: '1h', priority: 'low' },
    { id: 4, type: 'error', message: 'Erreur de synchronisation', time: '2h', priority: 'high' }
  ];

  const quickActions = [
    { id: 'invoice', name: 'Nouvelle Facture', icon: DocumentTextIcon, color: 'blue' },
    { id: 'client', name: 'Nouveau Client', icon: UserGroupIcon, color: 'green' },
    { id: 'purchase', name: 'Commande Achat', icon: TruckIcon, color: 'orange' },
    { id: 'inventory', name: 'Ajustement Stock', icon: CubeIcon, color: 'purple' },
    { id: 'payment', name: 'Enregistrer Paiement', icon: BanknotesIcon, color: 'yellow' },
    { id: 'report', name: 'Générer Rapport', icon: ChartBarIcon, color: 'indigo' }
  ];

  // Alertes importantes
  const alerts = [
    { id: 1, type: 'warning', message: 'Stock faible sur 5 articles', icon: ExclamationTriangleIcon },
    { id: 2, type: 'info', message: '3 factures en retard de paiement', icon: ClockIcon },
    { id: 3, type: 'success', message: 'Sauvegarde automatique réussie', icon: CheckCircleIcon }
  ];

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'positive': return 'text-emerald-600 dark:text-emerald-400';
      case 'negative': return 'text-red-600 dark:text-red-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200';
      case 'info': return 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200';
      case 'success': return 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200';
      default: return 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="space-y-6 p-6">
        {/* En-tête simple et professionnel */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">Tableau de Bord</h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Vue d'ensemble de votre activité</p>
              <div className="flex items-center space-x-6 mt-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center">
                  <ClockIcon className="h-3 w-3 mr-1.5" />
                  <span>{currentTime.toLocaleString('fr-FR')}</span>
                </div>
                <div className="flex items-center">
                  <span>Période: {selectedPeriod}</span>
                </div>
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                  <span>DZD</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100">Dinarlytic</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">ERP Financier</div>
              </div>
            </div>
          </div>
        </div>

        {/* Métriques principales - Design professionnel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div 
                key={metric.title} 
                className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded ${
                    metric.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                    metric.color === 'slate' ? 'bg-slate-100 dark:bg-slate-700' :
                    metric.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/30' :
                    'bg-slate-100 dark:bg-slate-700'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      metric.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                      metric.color === 'slate' ? 'text-slate-600 dark:text-slate-400' :
                      metric.color === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                      'text-slate-600 dark:text-slate-400'
                    }`} />
                  </div>
                  <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                    metric.changeType === 'positive' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' :
                    metric.changeType === 'negative' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' :
                    'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                  }`}>
                    {metric.change}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">{metric.title}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">{metric.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">vs période précédente</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions Rapides */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Actions Rapides
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Accès direct aux opérations courantes
              </p>
            </div>
            <PlusIcon className="h-5 w-5 text-slate-400" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const pathMap: Record<string, string> = {
                'invoice': '/factures-vente',
                'client': '/clients',
                'purchase': '/fournisseurs',
                'inventory': '/inventaire',
                'payment': '/gestion-paiements',
                'report': '/rapports-comptables'
              };
              
              return (
                <Link
                  key={action.id}
                  to={pathMap[action.id] || '#'}
                  className={`group relative p-4 rounded-lg border transition-all hover:shadow-md ${
                    action.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :
                    action.color === 'green' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' :
                    action.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
                    action.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' :
                    action.color === 'yellow' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' :
                    'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-2 bg-white dark:bg-slate-900/50 rounded">
                      <Icon className={`h-5 w-5 ${
                        action.color === 'blue' ? 'text-blue-700 dark:text-blue-400' :
                        action.color === 'green' ? 'text-emerald-700 dark:text-emerald-400' :
                        action.color === 'orange' ? 'text-orange-700 dark:text-orange-400' :
                        action.color === 'purple' ? 'text-purple-700 dark:text-purple-400' :
                        action.color === 'yellow' ? 'text-amber-700 dark:text-amber-400' :
                        'text-slate-700 dark:text-slate-400'
                      }`} />
                    </div>
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {action.name}
                    </div>
                  </div>
                  
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRightIcon className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Graphiques et activités */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Activités récentes enrichies */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center uppercase tracking-wide">
                <ClockIcon className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
                Journal d'Activités
              </h3>
              <Link to="#" className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                Voir tout
              </Link>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div 
                      key={activity.id} 
                      className="flex items-start space-x-3 p-3 rounded border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                    >
                      <div className={`p-2 rounded ${
                        activity.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        activity.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                        activity.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                        activity.color === 'teal' ? 'bg-teal-100 dark:bg-teal-900/30' :
                        activity.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' :
                        'bg-indigo-100 dark:bg-indigo-900/30'
                      }`}>
                        <Icon className={`h-4 w-4 ${
                          activity.color === 'blue' ? 'text-blue-700 dark:text-blue-400' :
                          activity.color === 'emerald' ? 'text-emerald-700 dark:text-emerald-400' :
                          activity.color === 'purple' ? 'text-purple-700 dark:text-purple-400' :
                          activity.color === 'teal' ? 'text-teal-700 dark:text-teal-400' :
                          activity.color === 'orange' ? 'text-orange-700 dark:text-orange-400' :
                          'text-indigo-700 dark:text-indigo-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{activity.titre}</p>
                          <span className="text-xs text-slate-500 dark:text-slate-500 flex-shrink-0 ml-2">{activity.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{activity.description}</p>
                        {activity.montant && (
                          <div className={`text-xs font-medium mt-1 ${
                            activity.montant.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {activity.montant}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Alertes */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center uppercase tracking-wide">
                <ExclamationTriangleIcon className="h-4 w-4 mr-2 text-amber-600 dark:text-amber-400" />
                Alertes Système
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {alerts.map((alert) => {
                  const Icon = alert.icon;
                  return (
                    <div 
                      key={alert.id} 
                      className={`p-3 rounded border-l-2 ${getAlertColor(alert.type)}`}
                    >
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <p className="text-xs font-medium">{alert.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>


      {/* Modals  */}
      {/* Modal Notifications */}
      {isNotificationModalOpen && (
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">Toutes les Notifications</h3>
              <button
                onClick={() => setIsNotificationModalOpen(false)}
                title="Fermer les notifications"
                className="text-slate-400 hover:text-slate-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-3 rounded-lg border ${
                  notification.priority === 'high' ? 'bg-red-50 border-red-200' :
                  notification.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-emerald-50 border-emerald-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{notification.message}</p>
                    <span className="text-xs text-slate-500">{notification.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Actions Rapides */}
      {isQuickActionModalOpen && (
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">Actions Rapides </h3>
              <button
                onClick={() => setIsQuickActionModalOpen(false)}
                title="Fermer les actions rapides"
                className="text-slate-400 hover:text-slate-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => {
                      handleQuickAction(action.id);
                      setIsQuickActionModalOpen(false);
                    }}
                    className={`flex flex-col items-center p-4 rounded-lg hover:shadow-md transition-all ${
                      action.color === 'blue' ? 'bg-slate-50 hover:bg-slate-100' :
                      action.color === 'green' ? 'bg-emerald-50 hover:bg-emerald-100' :
                      action.color === 'orange' ? 'bg-orange-50 hover:bg-orange-100' :
                      action.color === 'purple' ? 'bg-purple-50 hover:bg-purple-100' :
                      action.color === 'yellow' ? 'bg-yellow-50 hover:bg-yellow-100' :
                      'bg-indigo-50 hover:bg-indigo-100'
                    }`}
                  >
                    <Icon className={`h-8 w-8 mb-2 ${
                      action.color === 'blue' ? 'text-slate-600' :
                      action.color === 'green' ? 'text-emerald-600' :
                      action.color === 'orange' ? 'text-orange-600' :
                      action.color === 'purple' ? 'text-purple-600' :
                      action.color === 'yellow' ? 'text-yellow-600' :
                      'text-indigo-600'
                    }`} />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 text-center">{action.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal Rapports */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide">Génération de Rapports </h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                title="Fermer le modal"
                className="text-slate-400 hover:text-slate-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-slate-800 mb-2">Rapports Financiers</h4>
                  <div className="space-y-2">
                    <button title="Afficher le bilan comptable" className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded text-slate-700">Bilan Comptable</button>
                    <button title="Afficher le compte de résultat" className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded text-slate-700">Compte de Résultat</button>
                    <button title="Afficher le grand livre" className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded text-slate-700">Grand Livre</button>
                  </div>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-slate-800 mb-2">Rapports Opérationnels</h4>
                  <div className="space-y-2">
                    <button title="Afficher les ventes par client" className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded text-slate-700">Ventes par Client</button>
                    <button title="Afficher le stock par catégorie" className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded text-slate-700">Stock par Catégorie</button>
                    <button title="Afficher les achats par fournisseur" className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded text-slate-700">Achats par Fournisseur</button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Annuler
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 transition-all duration-200">
                  Générer Rapport
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default TableauBordPrincipal;
