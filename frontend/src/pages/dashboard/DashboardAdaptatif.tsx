import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CurrencyDollarIcon,
  UsersIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  TruckIcon,
  HomeIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  PencilIcon,
  ScaleIcon,
  PlusIcon,
  CogIcon,
  UserGroupIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import { useApp } from '../../context/AppContext';
import { AdaptiveContentDisplay, AdaptiveContentGenerator } from '../../utils/AdaptiveContent';
import { usePermission } from '../../hooks/usePermission';
import { generateDashboardConfig } from '../../utils/dashboardConfig';
import currencyIcon from '../../Assets/currency.png';
import Tooltip from '../../components/UI/Tooltip';
import HelpButton from '../../components/UI/HelpButton';
import ConseilsDuJour from '../../components/Dashboard/ConseilsDuJour';
import LIAInsightsWidget from '../../components/AI/LIAInsightsWidget';
import LIAContextualButton from '../../components/AI/LIAContextualButton';

const DashboardAdaptatif: React.FC = () => {
  const { user, companyData, currentDevise, currentCountry, planComptable } = useApp();
  const { has } = usePermission();
  const navigate = useNavigate();

  console.log('🖥️ DashboardAdaptatif render');
  console.log('📦 User:', user?.nom);
  console.log('📦 CompanyData:', companyData ? 'Présent' : 'NULL');
  console.log('🏢 CompanyType:', user?.companyType);

  // Contexte pour le contenu adaptatif
  const contentContext = {
    user,
    segment: user?.segment || 'micro',
    companyType: user?.companyType || 'eurl',
    role: user?.role || 'utilisateur',
    hasPermission: has
  };

  if (!user) {
    console.log('⚠️ Pas d\'user - Affichage chargement');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement utilisateur...</p>
        </div>
      </div>
    );
  }

  // Redirection automatique pour les boutiques
  React.useEffect(() => {
    if (user && (user.companyType === 'boutique' || user.nom.includes('Boutique'))) {
      console.log('🏪 Redirection automatique vers dashboard boutique pour:', user.nom);
      navigate('/dashboard/boutique');
    }
  }, [user, navigate]);

  if (!companyData) {
    console.log('⚠️ User présent mais pas de companyData');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Génération des données...</p>
          <p className="text-xs text-slate-500 mt-2">User: {user.nom}</p>
        </div>
      </div>
    );
  }

  const revenue = user.revenue || 0;
  const segment = user.segment || 'micro';
  const companyType = user.companyType || 'eurl';

  console.log('🔍 Dashboard - segment:', segment, 'type:', companyType);

  const formatCurrency = (amount: number) => AdaptiveDataGenerator.formatCurrency(amount);

  // ========================================
  // GÉNÉRATION DU TABLEAU DE BORD SELON RÔLE ET TAILLE
  // ========================================
  const dashboardConfig = generateDashboardConfig(user, segment, companyType, currentCountry);
  const userRole = (user?.role as string) || 'utilisateur';
  
  // ========================================
  // INTERFACE SPÉCIFIQUE EURL MICRO
  // ========================================
  if (segment === 'micro' && companyType === 'eurl') {
    console.log('✅ Affichage interface EURL simplifiée');
    
    const caduMois = companyData.revenueMonth;
    const resultatNet = Math.round(caduMois * companyData.profitMargin / 100);
    const soldeTresorerie = companyData.cashBalance;

    // Alertes avec actions
    const alertesEURL = [
      {
        id: 1,
        icon: ClockIcon,
        titre: 'Factures en attente > 30 jours',
        description: `${companyData.pendingInvoices} factures impayées`,
        color: 'orange',
        action: () => navigate('/factures')
      },
      {
        id: 2,
        icon: ShoppingCartIcon,
        titre: 'Stock faible : 2 articles',
        description: 'Pensez à réapprovisionner',
        color: 'blue',
        action: () => navigate('/inventaire')
      },
      {
        id: 3,
        icon: DocumentTextIcon,
        titre: 'TVA à déclarer',
        description: 'Échéance : 20 du mois',
        color: 'red',
        action: () => navigate('/rapports/fiscalite-declarations')
      }
    ];

    const raccourcis = [
      { titre: 'Voir le tableau de bord', icon: ChartBarIcon, path: '/dashboard/tableau-bord', color: 'blue' },
      { titre: 'Analyser les ventes', icon: ArrowTrendingUpIcon, path: '/rapports/ventes-clients', color: 'green' },
      { titre: 'Suivre la trésorerie', icon: BanknotesIcon, path: '/rapports/tresorerie-banque', color: 'purple' }
    ];

    // Contexte enrichi avec région/devise/plan comptable
    const enrichedContext = {
      ...contentContext,
      currentDevise: currentDevise || 'DZD',
      currentCountry: currentCountry || 'DZ',
      planComptable: planComptable || 'algerien'
    };
    const pageContent = AdaptiveContentGenerator.generatePageContent('dashboard', enrichedContext);

    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* En-tête Dinarlytic avec contenu adaptatif */}
        <Card className="p-8 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <img src={currencyIcon} alt="Dinarlytic" className="w-16 h-16 bg-white rounded-xl p-2 shadow-lg" />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold">Dinarlytic</h1>
                  <HelpButton pageId="dashboard" variant="icon" className="text-white/80 hover:text-white" />
                  <LIAContextualButton
                    question="Analyse mes performances financières"
                    context="dashboard"
                    variant="icon"
                    className="text-white/80 hover:text-white"
                    tooltip="Demander à LIA d'analyser le dashboard"
                  />
                </div>
                <p className="text-slate-300 text-lg mt-1">{pageContent.subtitle}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-300 text-lg">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
          {/* Description adaptative */}
          <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
            <p className="text-slate-100 text-sm">{pageContent.description}</p>
          </div>
        </Card>

        {/* Widget Conseils du Jour */}
        <ConseilsDuJour />

        {/* Contenu adaptatif - Conseils et Insights */}
        <AdaptiveContentDisplay 
          pageId="dashboard" 
          context={contentContext}
          showTips={true}
          showInsights={true}
        />

        {/* Widget Insights LIA */}
        <LIAInsightsWidget 
          data={companyData}
          autoRefresh={true}
          maxInsights={5}
        />

        {/* 3 Mini-KPIs avec Tooltips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Tooltip
            content="Chiffre d'affaires total généré ce mois-ci. Inclut toutes les factures émises, qu'elles soient payées ou non. Cette métrique vous aide à suivre la croissance de votre activité."
            title="CA du Mois"
            position="top"
          >
            <Card className="p-6 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 hover:shadow-2xl transition-all cursor-help">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl shadow-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <p className="text-xs font-bold text-slate-600 uppercase">CA du Mois</p>
                    <Tooltip
                      content="Chiffre d'affaires total généré ce mois-ci"
                      iconOnly
                      position="left"
                    />
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900">{formatCurrency(caduMois)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                <span className="text-sm text-slate-600">Croissance</span>
                <span className="text-sm font-bold text-emerald-600">+{companyData.revenueGrowth.toFixed(1)}%</span>
              </div>
            </Card>
          </Tooltip>

          <Tooltip
            content="Bénéfice net après déduction de tous les coûts (achats, charges, impôts). Un résultat positif indique que votre activité est rentable."
            title="Résultat Net"
            position="top"
          >
            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 hover:shadow-2xl transition-all cursor-help">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <p className="text-xs font-bold text-emerald-700 uppercase">Résultat Net</p>
                    <Tooltip
                      content="Bénéfice après tous les coûts"
                      iconOnly
                      position="left"
                    />
                  </div>
                  <p className="text-3xl font-extrabold text-emerald-900">+{formatCurrency(resultatNet)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-emerald-200">
                <span className="text-sm text-emerald-700">Marge</span>
                <span className="text-sm font-bold text-emerald-600">{companyData.profitMargin.toFixed(1)}%</span>
              </div>
            </Card>
          </Tooltip>

          <Tooltip
            content="Solde disponible sur vos comptes bancaires. Une trésorerie saine vous permet de faire face à vos obligations et d'investir dans votre croissance."
            title="Trésorerie"
            position="top"
          >
            <Card className="p-6 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 hover:shadow-2xl transition-all cursor-help">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl shadow-lg">
                  <BanknotesIcon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <p className="text-xs font-bold text-slate-600 uppercase">Trésorerie</p>
                    <Tooltip
                      content="Solde disponible sur vos comptes"
                      iconOnly
                      position="left"
                    />
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900">+{formatCurrency(soldeTresorerie)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                <span className="text-sm text-slate-600">Disponible</span>
                <span className="text-sm font-bold text-emerald-600">Sain</span>
              </div>
            </Card>
          </Tooltip>
        </div>

        {/* Raccourcis Dynamiques */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <HomeIcon className="h-7 w-7 mr-3 text-slate-700" />
            Accès Rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {raccourcis.map((racc, idx) => {
              const Icon = racc.icon;
              const colors = {
                blue: 'from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black',
                green: 'from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600',
                purple: 'from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900'
              };
              return (
                <button key={idx} onClick={() => navigate(racc.path)} 
                  className={`p-6 bg-gradient-to-br ${colors[racc.color as keyof typeof colors]} text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105`}>
                  <Icon className="h-12 w-12 mb-4 mx-auto" />
                  <p className="font-bold text-lg">{racc.titre}</p>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Alertes adaptées selon le rôle */}
        <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <ExclamationTriangleIcon className="h-7 w-7 mr-3 text-slate-700" />
            Alertes & Notifications {userRole !== 'utilisateur' ? `(${userRole})` : ''}
          </h2>
          <div className="space-y-4">
            {/* Alertes de base EURL */}
            {alertesEURL.map((alerte) => {
              const Icon = alerte.icon;
              const colorClasses = {
                orange: 'bg-amber-50 border-amber-300',
                blue: 'bg-slate-50 border-slate-300',
                red: 'bg-red-50 border-red-300'
              };
              const iconColors = {
                orange: 'from-amber-500 to-orange-500',
                blue: 'from-slate-600 to-slate-800',
                red: 'from-red-500 to-red-600'
              };
              return (
                <div key={alerte.id} className={`flex items-start space-x-4 p-5 rounded-2xl border-2 ${colorClasses[alerte.color as keyof typeof colorClasses]} hover:shadow-lg transition-all`}>
                  <div className={`p-3 rounded-xl shadow-md bg-gradient-to-br ${iconColors[alerte.color as keyof typeof iconColors]}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-slate-900">{alerte.titre}</h3>
                    <p className="text-sm text-slate-700">{alerte.description}</p>
                  </div>
                  <button onClick={alerte.action} className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-sm hover:shadow-xl transition-all transform hover:scale-105">
                    Voir
                  </button>
                </div>
              );
            })}
            
            {/* Alertes spécifiques au rôle depuis dashboardConfig */}
            {dashboardConfig.alerts.map((alerte) => {
              const typeMap: Record<string, { bg: string; icon: string; iconComponent: any }> = {
                info: { bg: 'bg-blue-50 border-blue-300', icon: 'from-blue-500 to-blue-600', iconComponent: ClockIcon },
                warning: { bg: 'bg-amber-50 border-amber-300', icon: 'from-amber-500 to-orange-500', iconComponent: ExclamationTriangleIcon },
                error: { bg: 'bg-red-50 border-red-300', icon: 'from-red-500 to-red-600', iconComponent: ExclamationTriangleIcon },
                success: { bg: 'bg-emerald-50 border-emerald-300', icon: 'from-emerald-500 to-teal-500', iconComponent: CheckCircleIcon }
              };
              const typeConfig = typeMap[alerte.type] || typeMap.info;
              const Icon = typeConfig.iconComponent;
              
              return (
                <div key={alerte.id} className={`flex items-start space-x-4 p-5 rounded-2xl border-2 ${typeConfig.bg} hover:shadow-lg transition-all`}>
                  <div className={`p-3 rounded-xl shadow-md bg-gradient-to-br ${typeConfig.icon}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 text-slate-900">{alerte.title}</h3>
                    <p className="text-sm text-slate-700">{alerte.message}</p>
                  </div>
                  {alerte.action && (
                    <button 
                      onClick={() => {
                        // Navigation basée sur l'action
                        if (alerte.action?.toLowerCase().includes('déclaration') || alerte.action?.toLowerCase().includes('g50') || alerte.action?.toLowerCase().includes('ca3')) {
                          navigate('/rapports/fiscalite-declarations');
                        } else {
                          navigate('/dashboard');
                        }
                      }}
                      className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold text-sm hover:shadow-xl transition-all transform hover:scale-105"
                    >
                      {alerte.action}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Rapports', icon: ChartBarIcon, path: '/rapports-analytics', info: '6 sections' },
            { label: 'Clients', icon: UsersIcon, path: '/clients', info: `${companyData.clientsCount} clients` },
            { label: 'Comptabilité', icon: BanknotesIcon, path: '/gestion-comptable', info: 'Journaux' },
            { label: 'Paramètres', icon: HomeIcon, path: '/parametres', info: 'Config' }
          ].map((btn, idx) => {
            const Icon = btn.icon;
            return (
              <button key={idx} onClick={() => navigate(btn.path)} className="p-6 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-2xl hover:border-emerald-400 hover:shadow-xl transition-all text-center transform hover:scale-105 group">
                <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl mx-auto w-fit mb-3 group-hover:scale-110 transition-transform shadow-md">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <p className="font-bold text-slate-900">{btn.label}</p>
                <p className="text-xs text-slate-600 mt-1">{btn.info}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ========================================
  // INTERFACE STANDARD (Autres tailles)
  // ========================================

  // KPIs principaux
  const kpis = [
    {
      icon: CurrencyDollarIcon,
      label: 'CA Mensuel',
      value: formatCurrency(companyData.revenueMonth),
      change: `+${companyData.revenueGrowth.toFixed(1)}%`,
      changeType: companyData.revenueGrowth > 0 ? 'positive' : 'negative',
      color: 'blue'
    },
    {
      icon: UsersIcon,
      label: 'Clients Actifs',
      value: companyData.clientsActive.toString(),
      change: `+${companyData.clientsNew} ce mois`,
      changeType: 'positive',
      color: 'green'
    },
    {
      icon: DocumentTextIcon,
      label: 'Factures du Mois',
      value: companyData.invoicesCount.toString(),
      change: formatCurrency(companyData.invoicesAmount),
      changeType: 'neutral',
      color: 'purple'
    },
    {
      icon: BanknotesIcon,
      label: 'Trésorerie',
      value: formatCurrency(companyData.cashBalance),
      change: `Créances: ${formatCurrency(companyData.accountsReceivable)}`,
      changeType: 'neutral',
      color: 'yellow'
    }
  ];

  // KPIs supplémentaires pour entreprises > micro
  const additionalKpis = segment !== 'micro' ? [
    {
      icon: ShoppingCartIcon,
      label: 'Facture Moyenne',
      value: formatCurrency(companyData.averageInvoice),
      change: `${companyData.pendingInvoices} en attente`,
      changeType: 'neutral',
      color: 'indigo'
    },
    {
      icon: TruckIcon,
      label: 'Valeur Stock',
      value: formatCurrency(companyData.inventoryValue),
      change: `${companyData.inventoryItems} articles`,
      changeType: 'neutral',
      color: 'orange'
    }
  ] : [];

  // KPIs avancés pour grandes entreprises
  const advancedKpis = (segment === 'large' || segment === 'enterprise') ? [
    {
      icon: BuildingOfficeIcon,
      label: 'Départements',
      value: companyData.departmentsCount.toString(),
      change: `${companyData.projectsCount} projets actifs`,
      changeType: 'neutral',
      color: 'red'
    },
    {
      icon: ChartBarIcon,
      label: 'Marge Brute',
      value: `${companyData.profitMargin.toFixed(1)}%`,
      change: formatCurrency(companyData.revenueMonth * companyData.profitMargin / 100),
      changeType: 'positive',
      color: 'pink'
    }
  ] : [];

  const allKpis = [...kpis, ...additionalKpis, ...advancedKpis];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      indigo: 'bg-indigo-100 text-indigo-600',
      orange: 'bg-orange-100 text-orange-600',
      red: 'bg-red-100 text-red-600',
      pink: 'bg-pink-100 text-pink-600'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getChangeColor = (type: string) => {
    if (type === 'positive') return 'text-green-600';
    if (type === 'negative') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* En-tête professionnel avec palette Slate */}
      <Card className="p-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 rounded-xl shadow-lg">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">Tableau de Bord</h1>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                  <span className="text-xl font-semibold text-slate-900 dark:text-slate-100">{user.nom}</span>
                  <span className="text-slate-400 dark:text-slate-500">•</span>
                  <span className="text-lg text-slate-600 dark:text-slate-400">
                    CA Annuel: <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(revenue)}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-5 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-slate-300 dark:border-slate-600 shadow-sm">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wide mb-1">Segment</p>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100 capitalize">{segment}</p>
              </div>
              <div className="px-5 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-slate-300 dark:border-slate-600 shadow-sm">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wide mb-1">Croissance</p>
                <div className="flex items-center gap-2">
                  <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">+{companyData.revenueGrowth.toFixed(1)}%</p>
                </div>
              </div>
              <div className="px-5 py-3 bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-slate-300 dark:border-slate-600 shadow-sm">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wide mb-1">Type</p>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100 uppercase">{companyType}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <HelpButton pageId="dashboard" variant="icon" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100" />
            <LIAContextualButton
              question="Analyse mes performances financières"
              context="dashboard"
              variant="icon"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              tooltip="Demander à LIA d'analyser le dashboard"
            />
          </div>
        </div>
      </Card>

      {/* Message d'adaptation */}
   

      {/* Grille de KPIs améliorée */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(allKpis.length, 4)} gap-6`}>
        {allKpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const colorGradients = {
            blue: 'from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700',
            green: 'from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700',
            purple: 'from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700',
            yellow: 'from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700',
            indigo: 'from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700',
            orange: 'from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700',
            red: 'from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700',
            pink: 'from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-slate-200 dark:border-slate-700'
          };
          const iconColors = {
            blue: 'bg-slate-700 dark:bg-slate-600',
            green: 'bg-slate-700 dark:bg-slate-600',
            purple: 'bg-slate-700 dark:bg-slate-600',
            yellow: 'bg-slate-700 dark:bg-slate-600',
            indigo: 'bg-slate-700 dark:bg-slate-600',
            orange: 'bg-slate-700 dark:bg-slate-600',
            red: 'bg-slate-700 dark:bg-slate-600',
            pink: 'bg-slate-700 dark:bg-slate-600'
          };
          const textColors = {
            blue: 'text-slate-700 dark:text-slate-300',
            green: 'text-slate-700 dark:text-slate-300',
            purple: 'text-slate-700 dark:text-slate-300',
            yellow: 'text-slate-700 dark:text-slate-300',
            indigo: 'text-slate-700 dark:text-slate-300',
            orange: 'text-slate-700 dark:text-slate-300',
            red: 'text-slate-700 dark:text-slate-300',
            pink: 'text-slate-700 dark:text-slate-300'
          };
          return (
            <Card key={index} className={`p-6 bg-gradient-to-br ${colorGradients[kpi.color as keyof typeof colorGradients]} border-2 hover:shadow-xl transition-all duration-200`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-4 rounded-xl ${iconColors[kpi.color as keyof typeof iconColors]} shadow-lg`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
              </div>
              <p className={`text-sm font-semibold uppercase tracking-wide mb-2 ${textColors[kpi.color as keyof typeof textColors]}`}>{kpi.label}</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">{kpi.value}</p>
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                <p className={`text-sm font-medium ${getChangeColor(kpi.changeType)}`}>
                  {kpi.change}
                </p>
                {kpi.changeType === 'positive' && (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-600" />
                )}
                {kpi.changeType === 'negative' && (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-red-600 rotate-180" />
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Statistiques détaillées améliorées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clients & Fournisseurs */}
        <Card className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 rounded-xl shadow-lg">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Réseau Commercial</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:shadow-md transition-all">
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Total Clients</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{companyData.clientsCount}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Actifs</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{companyData.clientsActive}</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:shadow-md transition-all">
              <div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">Fournisseurs</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{companyData.suppliersCount}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Nouveaux/mois</p>
                <p className="text-xl font-bold text-slate-700 dark:text-slate-300">{companyData.clientsNew}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Trésorerie */}
        <Card className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 rounded-xl shadow-lg">
              <BanknotesIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Position de Trésorerie</h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:shadow-md transition-all">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Disponible</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(companyData.cashBalance)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:shadow-md transition-all">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">À Recevoir</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(companyData.accountsReceivable)}
                </p>
              </div>
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:shadow-md transition-all">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1">À Payer</p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(companyData.accountsPayable)}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Stock (si applicable) */}
      {companyData.inventoryValue > 0 && (
        <Card className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 rounded-xl shadow-lg">
              <TruckIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Gestion des Stocks</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:shadow-lg transition-all">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Valeur Totale</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(companyData.inventoryValue)}
              </p>
            </div>
            <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:shadow-lg transition-all">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Nombre d'Articles</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {companyData.inventoryItems}
              </p>
            </div>
            <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:shadow-lg transition-all">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-2">Rotation</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {companyData.stockTurnover.toFixed(1)}x/an
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Informations avancées pour grandes entreprises */}
      {(segment === 'large' || segment === 'enterprise') && companyData.subsidiariesCount && (
        <Card className="p-6 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-600 dark:to-slate-700 rounded-xl shadow-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Vue Groupe</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-5 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:shadow-lg transition-all">
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{companyData.subsidiariesCount}</p>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mt-2">Filiales</p>
            </div>
            <div className="text-center p-5 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:shadow-lg transition-all">
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{companyData.departmentsCount}</p>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mt-2">Départements</p>
            </div>
            <div className="text-center p-5 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 border-slate-300 dark:border-slate-600 hover:shadow-lg transition-all">
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {companyData.internationalPresence ? 'Oui' : 'Non'}
              </p>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mt-2">International</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DashboardAdaptatif;

