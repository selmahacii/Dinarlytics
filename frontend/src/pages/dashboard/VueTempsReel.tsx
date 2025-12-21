import React, { useState, useEffect } from 'react';
import { 
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CubeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  FireIcon,
  BoltIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  WifiIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';

const VueTempsReel: React.FC = () => {
  const { formatCurrency } = useApp();
  const { t } = useTranslation();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLive, setIsLive] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 secondes
  const [onlineUsers, setOnlineUsers] = useState(247);
  const [activeSessions, setActiveSessions] = useState(89);
  const [pendingOrders, setPendingOrders] = useState(23);
  const [systemLoad, setSystemLoad] = useState(68);

  // Mise à jour du temps en temps réel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulation de données en temps réel
  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        // Simulation de variations des données
        setOnlineUsers(prev => prev + Math.floor(Math.random() * 10) - 5);
        setActiveSessions(prev => prev + Math.floor(Math.random() * 6) - 3);
        setPendingOrders(prev => prev + Math.floor(Math.random() * 4) - 2);
        setSystemLoad(prev => Math.max(0, Math.min(100, prev + Math.floor(Math.random() * 10) - 5)));
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [isLive, refreshInterval]);

  // Activité en temps réel
  const realTimeActivity = [
    {
      id: 1,
      type: 'order',
      message: 'Nouvelle commande #12345 de 2,500 DZD',
      time: 'Il y a 30s',
      icon: CurrencyDollarIcon,
      color: 'green'
    },
    {
      id: 2,
      type: 'user',
      message: 'Utilisateur "Ahmed Benali" s\'est connecté',
      time: 'Il y a 1m',
      icon: UserGroupIcon,
      color: 'blue'
    },
    {
      id: 3,
      type: 'alert',
      message: 'Stock faible détecté pour "Produit XYZ"',
      time: 'Il y a 2m',
      icon: ExclamationTriangleIcon,
      color: 'yellow'
    },
    {
      id: 4,
      type: 'payment',
      message: 'Paiement reçu de 1,800 DZD',
      time: 'Il y a 3m',
      icon: CheckCircleIcon,
      color: 'green'
    },
    {
      id: 5,
      type: 'system',
      message: 'Sauvegarde automatique terminée',
      time: 'Il y a 5m',
      icon: CheckCircleIcon,
      color: 'blue'
    }
  ];

  // Métriques de performance en temps réel
  const performanceMetrics = [
    {
      name: 'Temps de réponse',
      value: '1.2s',
      status: 'excellent',
      trend: 'down',
      icon: ClockIcon
    },
    {
      name: 'Taux de disponibilité',
      value: '99.8%',
      status: 'excellent',
      trend: 'up',
      icon: CheckCircleIcon
    },
    {
      name: 'Requêtes/seconde',
      value: '156',
      status: 'good',
      trend: 'up',
      icon: BoltIcon
    },
    {
      name: 'Utilisation CPU',
      value: `${systemLoad}%`,
      status: systemLoad > 80 ? 'warning' : 'good',
      trend: systemLoad > 80 ? 'up' : 'stable',
      icon: FireIcon
    }
  ];

  // Géolocalisation des utilisateurs
  const userLocations = [
    { city: 'Alger', users: 45, country: 'Algérie' },
    { city: 'Oran', users: 32, country: 'Algérie' },
    { city: 'Constantine', users: 28, country: 'Algérie' },
    { city: 'Paris', users: 15, country: 'France' },
    { city: 'Lyon', users: 12, country: 'France' },
    { city: 'Montréal', users: 8, country: 'Canada' }
  ];

  // Appareils connectés
  const deviceStats = [
    { type: 'Desktop', count: 156, percentage: 63, icon: ComputerDesktopIcon, color: 'blue' },
    { type: 'Mobile', count: 78, percentage: 32, icon: DevicePhoneMobileIcon, color: 'green' },
    { type: 'Tablet', count: 13, percentage: 5, icon: DevicePhoneMobileIcon, color: 'purple' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getActivityColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-600 bg-green-50 border-green-200';
      case 'blue': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'yellow': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'red': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header avec indicateur temps réel */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            ⚡ Vue Temps Réel
          </h1>
          <p className="text-gray-600">Surveillance en direct de votre système</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Indicateur de statut en direct */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              {isLive ? 'EN DIRECT' : 'PAUSÉ'}
            </span>
          </div>
          
          {/* Contrôles */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isLive 
                ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                : 'bg-green-50 text-green-600 border border-green-200 hover:bg-green-100'
            }`}
          >
            {isLive ? '⏸️ Pause' : '▶️ Reprendre'}
          </button>
          
          {/* Sélecteur d'intervalle */}
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={1000}>1 seconde</option>
            <option value={5000}>5 secondes</option>
            <option value={10000}>10 secondes</option>
            <option value={30000}>30 secondes</option>
          </select>
        </div>
      </div>

      {/* Horloge et métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-mono font-bold text-blue-600 mb-2">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-sm text-gray-600">
            {currentTime.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{onlineUsers}</p>
              <p className="text-sm text-gray-600">Utilisateurs en ligne</p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{activeSessions}</p>
              <p className="text-sm text-gray-600">Sessions actives</p>
            </div>
            <EyeIcon className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">{pendingOrders}</p>
              <p className="text-sm text-gray-600">Commandes en attente</p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Métriques de performance */}
      <Card title="📊 Performance Système">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {performanceMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className={`p-4 rounded-lg border ${getStatusColor(metric.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-6 w-6" />
                  {metric.trend === 'up' && <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />}
                  {metric.trend === 'down' && <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />}
                </div>
                <div className="text-xl font-bold">{metric.value}</div>
                <div className="text-sm opacity-75">{metric.name}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Activité en temps réel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="🔄 Activité en Temps Réel">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {realTimeActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className={`flex items-start space-x-3 p-3 rounded-lg border ${getActivityColor(activity.color)}`}>
                  <Icon className="h-5 w-5 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs opacity-75">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Géolocalisation des utilisateurs */}
        <Card title="🌍 Géolocalisation des Utilisateurs">
          <div className="space-y-3">
            {userLocations.map((location, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <GlobeAltIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium text-gray-900">{location.city}</div>
                    <div className="text-sm text-gray-500">{location.country}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{location.users}</div>
                  <div className="text-sm text-gray-500">utilisateurs</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Appareils connectés */}
      <Card title="📱 Appareils Connectés">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {deviceStats.map((device, index) => {
            const Icon = device.icon;
            return (
              <div key={index} className="text-center p-6 bg-white border border-gray-200 rounded-lg">
                <Icon className={`h-12 w-12 mx-auto mb-4 text-${device.color}-500`} />
                <div className="text-2xl font-bold text-gray-900 mb-2">{device.count}</div>
                <div className="text-sm text-gray-600 mb-2">{device.type}</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-${device.color}-500 h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${device.percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-2">{device.percentage}%</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Statut des services */}
      <Card title="🔧 Statut des Services">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Base de données', status: 'operational', uptime: '99.9%' },
            { name: 'API', status: 'operational', uptime: '99.8%' },
            { name: 'CDN', status: 'operational', uptime: '99.7%' },
            { name: 'Email', status: 'degraded', uptime: '98.5%' }
          ].map((service, index) => (
            <div key={index} className="p-4 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{service.name}</h4>
                <div className={`w-2 h-2 rounded-full ${
                  service.status === 'operational' ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
              </div>
              <div className="text-sm text-gray-600">Uptime: {service.uptime}</div>
              <div className={`text-xs mt-1 ${
                service.status === 'operational' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {service.status === 'operational' ? 'Opérationnel' : 'Dégradé'}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default VueTempsReel;
