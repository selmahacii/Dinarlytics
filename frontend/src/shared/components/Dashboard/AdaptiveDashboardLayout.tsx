import React from 'react';
import { ConditionalRenderer, useRevenuePermissions, AccessBadge } from '../ConditionalRenderer';
import Card from '../UI/Card';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ShoppingCartIcon,
  TruckIcon,
  BuildingOfficeIcon,
  ChartPieIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';

interface AdaptiveDashboardLayoutProps {
  companyName: string;
  companyType: string;
  revenue: number;
  accessLevel: string;
}

/**
 * Dashboard qui s'adapte automatiquement selon le CA et le niveau d'accès
 */
const AdaptiveDashboardLayout: React.FC<AdaptiveDashboardLayoutProps> = ({
  companyName,
  companyType,
  revenue,
  accessLevel
}) => {
  const permissions = useRevenuePermissions(revenue, accessLevel);

  // Widgets de base (toujours visibles)
  const basicWidgets = [
    {
      id: 'ca-overview',
      title: 'Chiffre d\'Affaires',
      icon: CurrencyDollarIcon,
      value: `${(revenue / 1000000).toFixed(1)}M DA`,
      change: '+12.5%',
      color: 'blue'
    },
    {
      id: 'clients',
      title: 'Clients Actifs',
      icon: UsersIcon,
      value: '127',
      change: '+8',
      color: 'green'
    }
  ];

  // Widgets intermédiaires (>5M DA)
  const intermediateWidgets = [
    {
      id: 'sales',
      title: 'Ventes du Mois',
      icon: ShoppingCartIcon,
      value: '2,345',
      change: '+15.2%',
      color: 'purple',
      minRevenue: 5000000
    },
    {
      id: 'inventory',
      title: 'Stock Valorisé',
      icon: TruckIcon,
      value: '1.2M DA',
      change: '-5%',
      color: 'orange',
      minRevenue: 5000000
    }
  ];

  // Widgets avancés (>50M DA)
  const advancedWidgets = [
    {
      id: 'departments',
      title: 'Départements',
      icon: BuildingOfficeIcon,
      value: '8',
      change: '+2',
      color: 'indigo',
      minRevenue: 50000000,
      segments: ['medium', 'large', 'enterprise']
    },
    {
      id: 'analytics',
      title: 'Analytics Score',
      icon: ChartPieIcon,
      value: '87/100',
      change: '+3',
      color: 'pink',
      minRevenue: 50000000,
      segments: ['medium', 'large', 'enterprise']
    }
  ];

  // Widgets entreprise (>500M DA)
  const enterpriseWidgets = [
    {
      id: 'consolidation',
      title: 'Entités Consolidées',
      icon: DocumentTextIcon,
      value: '5',
      change: 'Stable',
      color: 'red',
      minRevenue: 500000000,
      segments: ['large', 'enterprise']
    },
    {
      id: 'treasury',
      title: 'Trésorerie Groupe',
      icon: BanknotesIcon,
      value: '45.7M DA',
      change: '+22%',
      color: 'yellow',
      minRevenue: 500000000,
      segments: ['large', 'enterprise']
    }
  ];

  const renderWidget = (widget: any) => {
    const Icon = widget.icon;
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      pink: 'bg-pink-100 text-pink-600',
      red: 'bg-red-100 text-red-600',
      yellow: 'bg-yellow-100 text-yellow-600'
    };

    return (
      <Card key={widget.id} className="p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{widget.title}</p>
            <p className="text-3xl font-bold text-gray-900">{widget.value}</p>
            <p className={`text-sm font-semibold mt-2 ${
              widget.change.startsWith('+') ? 'text-green-600' : 
              widget.change.startsWith('-') ? 'text-red-600' : 'text-gray-600'
            }`}>
              {widget.change}
            </p>
          </div>
          <div className={`p-4 rounded-full ${colorClasses[widget.color as keyof typeof colorClasses]}`}>
            <Icon className="h-8 w-8" />
          </div>
        </div>
        
        {/* Badges d'accès */}
        {widget.minRevenue && (
          <div className="mt-3 flex flex-wrap gap-2">
            <AccessBadge 
              type="revenue" 
              value={`${(widget.minRevenue / 1000000).toFixed(0)}M DA`}
              unlocked={permissions.hasRevenueAccess(widget.minRevenue)}
            />
            {widget.segments && (
              <AccessBadge 
                type="segment" 
                value={widget.segments[0]}
                unlocked={permissions.hasSegmentAccess(widget.segments)}
              />
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête adaptatif */}
      <Card className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{companyName}</h1>
            <p className="text-blue-100 mt-1">
              {permissions.currentSegment.name} • {companyType.toUpperCase()} • Plan {accessLevel}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Votre Dashboard Adaptatif</p>
            <p className="text-2xl font-bold mt-1">
              Niveau {
                revenue < 5000000 ? '1' :
                revenue < 50000000 ? '2' :
                revenue < 500000000 ? '3' : '4'
              } / 4
            </p>
          </div>
        </div>
      </Card>

      {/* Section 1 : KPIs de Base (Toujours visible) */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="h-6 w-6 mr-2 text-blue-600" />
          Indicateurs Essentiels
          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
            ✓ Débloqué
          </span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {basicWidgets.map(renderWidget)}
        </div>
      </div>

      {/* Section 2 : Gestion Opérationnelle (>5M DA) */}
      <ConditionalRenderer
        currentRevenue={revenue}
        requiredRevenue={5000000}
        showLocked={true}
        lockedMessage="Gestion opérationnelle avancée disponible à partir de 5M DA de CA"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <ShoppingCartIcon className="h-6 w-6 mr-2 text-purple-600" />
            Gestion Opérationnelle
            {permissions.hasRevenueAccess(5000000) && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                ✓ Débloqué
              </span>
            )}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {intermediateWidgets.map(renderWidget)}
          </div>
        </div>
      </ConditionalRenderer>

      {/* Section 3 : Analytics Avancées (>50M DA) */}
      <ConditionalRenderer
        currentRevenue={revenue}
        requiredRevenue={50000000}
        requiredSegment={['medium', 'large', 'enterprise']}
        showLocked={true}
        lockedMessage="Analytics avancées et gestion multi-départements disponibles à partir de 50M DA"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <ChartPieIcon className="h-6 w-6 mr-2 text-indigo-600" />
            Analytics & Pilotage Avancé
            {permissions.canAccess({ minRevenue: 50000000, segments: ['medium', 'large', 'enterprise'] }) && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                ✓ Débloqué
              </span>
            )}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {advancedWidgets.map(renderWidget)}
          </div>
        </div>
      </ConditionalRenderer>

      {/* Section 4 : Gestion Groupe (>500M DA) */}
      <ConditionalRenderer
        currentRevenue={revenue}
        requiredRevenue={500000000}
        requiredSegment={['large', 'enterprise']}
        requiredAccessLevel={['enterprise']}
        currentAccessLevel={accessLevel}
        showLocked={true}
        lockedMessage="Gestion de groupe et consolidation disponibles à partir de 500M DA avec le plan Enterprise"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <ClipboardDocumentCheckIcon className="h-6 w-6 mr-2 text-red-600" />
            Gestion de Groupe & Consolidation
            {permissions.canAccess({ 
              minRevenue: 500000000, 
              segments: ['large', 'enterprise'], 
              accessLevels: ['enterprise'] 
            }) && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                ✓ Débloqué
              </span>
            )}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {enterpriseWidgets.map(renderWidget)}
          </div>
        </div>
      </ConditionalRenderer>

      {/* Indicateur de progression */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Votre Progression</h3>
        <div className="space-y-4">
          <ProgressItem 
            title="Niveau 1: Indicateurs Essentiels" 
            unlocked={true}
            description="KPIs de base débloqués"
          />
          <ProgressItem 
            title="Niveau 2: Gestion Opérationnelle" 
            unlocked={revenue >= 5000000}
            required="5M DA"
            description="Ventes et stocks détaillés"
          />
          <ProgressItem 
            title="Niveau 3: Analytics Avancées" 
            unlocked={revenue >= 50000000}
            required="50M DA"
            description="Multi-départements et analytics"
          />
          <ProgressItem 
            title="Niveau 4: Gestion de Groupe" 
            unlocked={revenue >= 500000000}
            required="500M DA + Plan Enterprise"
            description="Consolidation et trésorerie groupe"
          />
        </div>
      </Card>
    </div>
  );
};

const ProgressItem: React.FC<{
  title: string;
  unlocked: boolean;
  required?: string;
  description: string;
}> = ({ title, unlocked, required, description }) => {
  return (
    <div className={`flex items-center p-4 rounded-lg border-2 ${
      unlocked 
        ? 'bg-green-50 border-green-300' 
        : 'bg-gray-50 border-gray-300'
    }`}>
      <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
        unlocked ? 'bg-green-500' : 'bg-gray-300'
      }`}>
        {unlocked ? (
          <span className="text-white text-xl">✓</span>
        ) : (
          <span className="text-gray-500 text-xl">🔒</span>
        )}
      </div>
      <div className="ml-4 flex-1">
        <h4 className={`font-bold ${unlocked ? 'text-green-900' : 'text-gray-700'}`}>
          {title}
        </h4>
        <p className="text-sm text-gray-600">{description}</p>
        {!unlocked && required && (
          <p className="text-xs text-orange-600 font-semibold mt-1">
            Requis: {required}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdaptiveDashboardLayout;

