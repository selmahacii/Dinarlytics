import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  CogIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowsPointingOutIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CubeIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Modal from '../../components/UI/Modal';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';

interface Widget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'alert' | 'custom';
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  data: any;
  config: any;
  visible: boolean;
  refreshInterval?: number;
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: Widget[];
  layout: 'grid' | 'free';
  theme: 'light' | 'dark' | 'auto';
  filters: any;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

const TableauBordPersonnalisable: React.FC = () => {
  const { user, formatCurrency } = useApp();
  const { t } = useTranslation();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<Widget | null>(null);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    dateRange: '30d',
    sector: 'all',
    region: 'all',
    metric: 'all'
  });

  // Widgets disponibles
  const availableWidgets = [
    {
      type: 'metric',
      title: 'Métrique Simple',
      icon: ChartBarIcon,
      description: 'Affiche une valeur numérique avec évolution'
    },
    {
      type: 'chart',
      title: 'Graphique',
      icon: ArrowTrendingUpIcon,
      description: 'Graphique en barres, lignes ou secteurs'
    },
    {
      type: 'table',
      title: 'Tableau de données',
      icon: CubeIcon,
      description: 'Tableau avec données triables et filtrables'
    },
    {
      type: 'alert',
      title: 'Alertes',
      icon: ExclamationTriangleIcon,
      description: 'Liste des alertes et notifications'
    },
    {
      type: 'custom',
      title: 'Widget personnalisé',
      icon: CogIcon,
      description: 'Widget avec contenu personnalisé'
    }
  ];

  // Données de démonstration
  const mockData = {
    metrics: {
      revenue: { value: 1250000, change: 12.5, trend: 'up' },
      clients: { value: 156, change: 8.3, trend: 'up' },
      orders: { value: 1247, change: 15.7, trend: 'up' },
      profit: { value: 320000, change: 18.2, trend: 'up' }
    },
    charts: {
      salesTrend: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
        data: [120, 135, 142, 138, 155, 168]
      },
      revenueBySector: {
        labels: ['Services', 'Commerce', 'Industrie', 'Technologie'],
        data: [35, 25, 20, 20]
      }
    },
    alerts: [
      { id: '1', type: 'warning', message: 'Stock faible sur 3 produits', time: '2h' },
      { id: '2', type: 'info', message: 'Nouveau client ajouté', time: '4h' },
      { id: '3', type: 'success', message: 'Objectif mensuel atteint', time: '6h' }
    ],
    tableData: [
      { id: 1, client: 'Entreprise ABC', montant: 45000, statut: 'Payé' },
      { id: 2, client: 'Société XYZ', montant: 32000, statut: 'En attente' },
      { id: 3, client: 'Commerce DEF', montant: 28000, statut: 'Payé' }
    ]
  };

  useEffect(() => {
    // Charger les tableaux de bord depuis le localStorage ou l'API
    const savedDashboards = localStorage.getItem('dashboards');
    if (savedDashboards) {
      const parsed = JSON.parse(savedDashboards);
      setDashboards(parsed);
      if (parsed.length > 0) {
        setCurrentDashboard(parsed[0]);
      }
    } else {
      // Créer un tableau de bord par défaut
      const defaultDashboard: Dashboard = {
        id: '1',
        name: 'Tableau de Bord Principal',
        description: 'Vue d\'ensemble des performances',
        widgets: [
          {
            id: 'w1',
            type: 'metric',
            title: 'Chiffre d\'Affaires',
            position: { x: 0, y: 0 },
            size: { width: 3, height: 2 },
            data: mockData.metrics.revenue,
            config: { color: 'blue', showTrend: true },
            visible: true
          },
          {
            id: 'w2',
            type: 'metric',
            title: 'Nombre de Clients',
            position: { x: 3, y: 0 },
            size: { width: 3, height: 2 },
            data: mockData.metrics.clients,
            config: { color: 'green', showTrend: true },
            visible: true
          },
          {
            id: 'w3',
            type: 'chart',
            title: 'Évolution des Ventes',
            position: { x: 0, y: 2 },
            size: { width: 6, height: 4 },
            data: mockData.charts.salesTrend,
            config: { type: 'line', color: 'blue' },
            visible: true
          },
          {
            id: 'w4',
            type: 'alert',
            title: 'Alertes',
            position: { x: 6, y: 0 },
            size: { width: 3, height: 4 },
            data: mockData.alerts,
            config: { maxItems: 5 },
            visible: true
          }
        ],
        layout: 'grid',
        theme: 'light',
        filters: {},
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setDashboards([defaultDashboard]);
      setCurrentDashboard(defaultDashboard);
    }
  }, []);

  const saveDashboards = (updatedDashboards: Dashboard[]) => {
    setDashboards(updatedDashboards);
    localStorage.setItem('dashboards', JSON.stringify(updatedDashboards));
  };

  const handleCreateDashboard = () => {
    const newDashboard: Dashboard = {
      id: Date.now().toString(),
      name: 'Nouveau Tableau de Bord',
      description: 'Description du tableau de bord',
      widgets: [],
      layout: 'grid',
      theme: 'light',
      filters: {},
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updated = [...dashboards, newDashboard];
    saveDashboards(updated);
    setCurrentDashboard(newDashboard);
    setIsDashboardModalOpen(false);
  };

  const handleAddWidget = (widgetType: string) => {
    const newWidget: Widget = {
      id: `w${Date.now()}`,
      type: widgetType as any,
      title: `Nouveau ${widgetType}`,
      position: { x: 0, y: 0 },
      size: { width: 3, height: 2 },
      data: {},
      config: {},
      visible: true
    };

    if (currentDashboard) {
      const updated = dashboards.map(d => 
        d.id === currentDashboard.id 
          ? { ...d, widgets: [...d.widgets, newWidget], updatedAt: new Date().toISOString() }
          : d
      );
      saveDashboards(updated);
      setCurrentDashboard(updated.find(d => d.id === currentDashboard.id) || null);
    }
    setIsWidgetModalOpen(false);
  };

  const handleEditWidget = (widget: Widget) => {
    setSelectedWidget(widget);
    setIsWidgetModalOpen(true);
  };

  const handleUpdateWidget = (updatedWidget: Widget) => {
    if (currentDashboard) {
      const updated = dashboards.map(d => 
        d.id === currentDashboard.id 
          ? { 
              ...d, 
              widgets: d.widgets.map(w => w.id === updatedWidget.id ? updatedWidget : w),
              updatedAt: new Date().toISOString()
            }
          : d
      );
      saveDashboards(updated);
      setCurrentDashboard(updated.find(d => d.id === currentDashboard.id) || null);
    }
    setIsWidgetModalOpen(false);
    setSelectedWidget(null);
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (currentDashboard) {
      const updated = dashboards.map(d => 
        d.id === currentDashboard.id 
          ? { 
              ...d, 
              widgets: d.widgets.filter(w => w.id !== widgetId),
              updatedAt: new Date().toISOString()
            }
          : d
      );
      saveDashboards(updated);
      setCurrentDashboard(updated.find(d => d.id === currentDashboard.id) || null);
    }
  };

  const handleToggleWidgetVisibility = (widgetId: string) => {
    if (currentDashboard) {
      const updated = dashboards.map(d => 
        d.id === currentDashboard.id 
          ? { 
              ...d, 
              widgets: d.widgets.map(w => 
                w.id === widgetId ? { ...w, visible: !w.visible } : w
              ),
              updatedAt: new Date().toISOString()
            }
          : d
      );
      saveDashboards(updated);
      setCurrentDashboard(updated.find(d => d.id === currentDashboard.id) || null);
    }
  };

  const handleDragStart = (widgetId: string) => {
    setDraggedWidget(widgetId);
  };

  const handleDragEnd = (widgetId: string, newPosition: { x: number; y: number }) => {
    if (currentDashboard) {
      const updated = dashboards.map(d => 
        d.id === currentDashboard.id 
          ? { 
              ...d, 
              widgets: d.widgets.map(w => 
                w.id === widgetId ? { ...w, position: newPosition } : w
              ),
              updatedAt: new Date().toISOString()
            }
          : d
      );
      saveDashboards(updated);
      setCurrentDashboard(updated.find(d => d.id === currentDashboard.id) || null);
    }
    setDraggedWidget(null);
  };

  const renderWidget = (widget: Widget) => {
    if (!widget.visible) return null;

    const widgetClasses = `bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${
      isEditMode ? 'cursor-move' : ''
    }`;

    switch (widget.type) {
      case 'metric':
        return (
          <div
            key={widget.id}
            className={widgetClasses}
            draggable={isEditMode}
            onDragStart={() => handleDragStart(widget.id)}
            onDragEnd={() => handleDragEnd(widget.id, widget.position)}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">{widget.title}</h3>
                {isEditMode && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditWidget(widget)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <CogIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleWidgetVisibility(widget.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <EyeSlashIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWidget(widget.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(widget.data.value)}
              </div>
              <div className="flex items-center mt-1">
                {widget.data.trend === 'up' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ml-1 ${
                  widget.data.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {widget.data.change}%
                </span>
              </div>
            </div>
          </div>
        );

      case 'chart':
        return (
          <div
            key={widget.id}
            className={widgetClasses}
            draggable={isEditMode}
            onDragStart={() => handleDragStart(widget.id)}
            onDragEnd={() => handleDragEnd(widget.id, widget.position)}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">{widget.title}</h3>
                {isEditMode && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditWidget(widget)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <CogIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleWidgetVisibility(widget.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <EyeSlashIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWidget(widget.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="h-32 flex items-end space-x-2">
                {widget.data.data.map((value: number, index: number) => (
                  <div
                    key={index}
                    className="flex-1 bg-blue-500 rounded-t"
                    style={{ height: `${(value / Math.max(...widget.data.data)) * 100}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                {widget.data.labels.map((label: string, index: number) => (
                  <span key={index}>{label}</span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'alert':
        return (
          <div
            key={widget.id}
            className={widgetClasses}
            draggable={isEditMode}
            onDragStart={() => handleDragStart(widget.id)}
            onDragEnd={() => handleDragEnd(widget.id, widget.position)}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">{widget.title}</h3>
                {isEditMode && (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEditWidget(widget)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <CogIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleWidgetVisibility(widget.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <EyeSlashIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWidget(widget.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {widget.data.map((alert: any) => (
                  <div key={alert.id} className="flex items-start space-x-2 p-2 bg-gray-50 rounded">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      alert.type === 'warning' ? 'bg-yellow-500' :
                      alert.type === 'info' ? 'bg-blue-500' :
                      'bg-green-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-500">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableaux de Bord Personnalisables</h1>
          <p className="text-gray-600">Créez et personnalisez vos vues de données</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              isEditMode 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <CogIcon className="h-5 w-5 mr-2" />
            {isEditMode ? 'Quitter l\'édition' : 'Mode édition'}
          </button>
          <button
            onClick={() => setIsWidgetModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Ajouter un widget
          </button>
          <button
            onClick={() => setIsDashboardModalOpen(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nouveau tableau
          </button>
        </div>
      </div>

      {/* Dashboard Selector */}
      <Card title="📊 Sélection du Tableau de Bord">
        <div className="flex flex-wrap gap-3">
          {dashboards.map((dashboard) => (
            <button
              key={dashboard.id}
              onClick={() => setCurrentDashboard(dashboard)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                currentDashboard?.id === dashboard.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {dashboard.name}
              {dashboard.isDefault && (
                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Défaut
                </span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <Card title="🔍 Filtres">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">90 derniers jours</option>
              <option value="1y">1 an</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Secteur</label>
            <select
              value={filters.sector}
              onChange={(e) => setFilters(prev => ({ ...prev, sector: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tous les secteurs</option>
              <option value="services">Services</option>
              <option value="commerce">Commerce</option>
              <option value="industrie">Industrie</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Région</label>
            <select
              value={filters.region}
              onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les régions</option>
              <option value="alger">Alger</option>
              <option value="oran">Oran</option>
              <option value="constantine">Constantine</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Métrique</label>
            <select
              value={filters.metric}
              onChange={(e) => setFilters(prev => ({ ...prev, metric: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Toutes les métriques</option>
              <option value="revenue">Revenus</option>
              <option value="clients">Clients</option>
              <option value="orders">Commandes</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Dashboard Content */}
      {currentDashboard && (
        <Card title={currentDashboard.name}>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-gray-600">{currentDashboard.description}</p>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <DocumentArrowDownIcon className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <PrinterIcon className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <ShareIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-12 gap-4">
            {currentDashboard.widgets.map((widget) => (
              <div
                key={widget.id}
                className={`col-span-${widget.size.width} row-span-${widget.size.height}`}
                style={{
                  gridColumn: `span ${widget.size.width}`,
                  gridRow: `span ${widget.size.height}`
                }}
              >
                {renderWidget(widget)}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Widget Modal */}
      <Modal
        isOpen={isWidgetModalOpen}
        onClose={() => setIsWidgetModalOpen(false)}
        title="Ajouter un Widget"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableWidgets.map((widget) => {
            const Icon = widget.icon;
            return (
              <button
                key={widget.type}
                onClick={() => handleAddWidget(widget.type)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">{widget.title}</h3>
                    <p className="text-sm text-gray-500">{widget.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Create Dashboard Modal */}
      <Modal
        isOpen={isDashboardModalOpen}
        onClose={() => setIsDashboardModalOpen(false)}
        title="Créer un Nouveau Tableau de Bord"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreateDashboard(); }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom du tableau de bord</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mon Tableau de Bord"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Description du tableau de bord..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsDashboardModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Créer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TableauBordPersonnalisable;
