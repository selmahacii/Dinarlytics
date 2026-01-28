import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import currencyIcon from '../../Assets/currency.png';
import {
  HomeIcon,
  UsersIcon,
  TruckIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  BanknotesIcon,
  ChevronDownIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  EyeIcon,
  WrenchScrewdriverIcon,
  LinkIcon,
  UserPlusIcon,
  CalculatorIcon,
  CpuChipIcon,
  BuildingOfficeIcon,
  Bars3Icon,
  ChevronLeftIcon,
  ChartPieIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  SparklesIcon,
  ShoppingCartIcon,
  ScaleIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { useApp } from '../../context/AppContext';
import { usePermission } from '../../hooks/usePermission';

type SidebarIcon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type SidebarLink = {
  type?: 'link';
  path: string;
  icon: SidebarIcon;
  label: string;
  subLabel?: string;
};

type SidebarSubmenu = {
  type: 'submenu' | 'nested-submenu';
  icon: SidebarIcon;
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  subItems: SidebarItem[];
};

type SidebarItem = SidebarSubmenu | SidebarLink;

const Sidebar: React.FC = () => {
  const { planComptable, isSidebarCollapsed, setSidebarCollapsed } = useApp();
  const location = useLocation();
  const { has, user } = usePermission();
  const [dashboardMenuOpen, setDashboardMenuOpen] = useState(false);
  const [clientsMenuOpen, setClientsMenuOpen] = useState(false);
  const [statsMenuOpen, setStatsMenuOpen] = useState(false);
  const [comptaGeneraleMenuOpen, setComptaGeneraleMenuOpen] = useState(false);
  const [analyticsMenuOpen, setAnalyticsMenuOpen] = useState(false);
  const [liaMenuOpen, setLiaMenuOpen] = useState(false);
  const [rapportsMenuOpen, setRapportsMenuOpen] = useState(false);

  const menuItems: SidebarItem[] = ([
    // 1. Core Analytics (High-level decision making)
    has('lia-access') && {
      type: 'submenu',
      icon: SparklesIcon,
      label: 'Intelligence LIA',
      isOpen: liaMenuOpen,
      onToggle: () => setLiaMenuOpen(!liaMenuOpen),
      subItems: [
        { path: '/lia/chatbot', icon: SparklesIcon, label: 'Assistant Chatbot' },
        { path: '/lia/analyses', icon: ChartBarIcon, label: 'Analyses Prédictives' },
        has('lia-train') && { path: '/entrainement-modele-ia', icon: CpuChipIcon, label: 'Entrainement Modèles' }
      ].filter(Boolean)
    },

    // 2. Dashboards
    has('dashboard-access') && {
      type: 'submenu',
      icon: HomeIcon,
      label: 'Tableaux de Bord',
      isOpen: dashboardMenuOpen,
      onToggle: () => setDashboardMenuOpen(!dashboardMenuOpen),
      subItems: [
        { path: '/dashboard', icon: HomeIcon, label: "Vue Globale" },
        { path: '/dashboard/alertes', icon: ExclamationTriangleIcon, label: 'Alertes & Risques' },
        { path: '/dashboard/calendrier', icon: CalendarIcon, label: 'Calendrier Fiscal' }
      ]
    },

    // 3. Commercial (Sales/Purchases)
    has('facturation-read') && {
      type: 'submenu',
      icon: ShoppingCartIcon,
      label: 'Gestion Commerciale',
      isOpen: clientsMenuOpen,
      onToggle: () => setClientsMenuOpen(!clientsMenuOpen),
      subItems: [
        { path: '/clients', icon: UsersIcon, label: 'Clients & Ventes' },
        { path: '/fournisseurs', icon: TruckIcon, label: 'Fournisseurs & Achats' },
        { path: '/articles', icon: CubeIcon, label: 'Articles & Stock' }
      ]
    },

    // 4. Accounting (Professional SCF)
    has('comptabilite-read') && {
      type: 'submenu',
      icon: CalculatorIcon,
      label: 'Comptabilité SCF',
      isOpen: statsMenuOpen,
      onToggle: () => setStatsMenuOpen(!statsMenuOpen),
      subItems: [
        { path: '/comptabilite/journaux', icon: ClipboardDocumentListIcon, label: 'Saisie Journal' },
        { path: '/comptabilite/etats', icon: DocumentTextIcon, label: 'Balance & Bilan' },
        { path: '/fiscalite', icon: ScaleIcon, label: 'Déclarations (G50/IBS)' },
        has('consolidation') && { path: '/consolidation', icon: CalculatorIcon, label: 'Consolidation' }
      ].filter(Boolean)
    },

    // 5. Shared Reports
    has('rapports-basic') && {
      type: 'submenu',
      icon: DocumentChartBarIcon,
      label: 'Rapports & Archives',
      isOpen: rapportsMenuOpen,
      onToggle: () => setRapportsMenuOpen(!rapportsMenuOpen),
      subItems: [
        { path: '/rapports/ventes-clients', icon: ChartBarIcon, label: 'Analyses Commerciales' },
        { path: '/rapports/tresorerie-banque', icon: BanknotesIcon, label: 'Flux de Trésorerie' }
      ]
    },

    // 6. Security & Admin (Only for Top Roles)
    has('admin-users') && {
      type: 'submenu',
      icon: ShieldCheckIcon,
      label: 'Paramètres & Accès',
      isOpen: false, // Hidden by default
      onToggle: () => { },
      subItems: [
        { path: '/gestion-utilisateurs-acces', icon: UserGroupIcon, label: 'Droits des Utilisateurs' },
        { path: '/audit-explorer', icon: ShieldCheckIcon, label: 'Traçabilité & Audit' },
        { path: '/parametres', icon: CogIcon, label: 'Réglages Système' }
      ]
    }
  ] as Array<SidebarItem | false>).filter(Boolean) as SidebarItem[];

  return (
    <div className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200 text-slate-800 overflow-y-auto z-10 shadow-lg transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}>
      {/* Logo simple et professionnel */}
      <div className="p-6 border-b border-slate-200">
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
          {!isSidebarCollapsed && (
            <>
              <div>
                <img src={currencyIcon} alt="Currency" className="w-8 h-8 bg-white rounded p-1" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Dinarlytic</h1>
                <p className="text-slate-500 text-sm">ERP Financier</p>
              </div>
            </>
          )}
          {isSidebarCollapsed && (
            <img src={currencyIcon} alt="Currency" className="w-8 h-8 bg-white rounded p-1" />
          )}
        </div>
        {!isSidebarCollapsed && (
          <div className="mt-4">
            <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
              {planComptable === 'algerien' ? '🇩🇿 PCA 2010' : '🌍 IFRS/GAAP'}
            </span>
          </div>
        )}
      </div>

      {/* Bouton de toggle */}
      <div className="p-2 border-b border-slate-200">
        <button
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          title={isSidebarCollapsed ? 'Développer la sidebar' : 'Réduire la sidebar'}
        >
          {isSidebarCollapsed ? (
            <Bars3Icon className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeftIcon className="h-5 w-5 mr-2" />
              <span className="text-sm">Réduire</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {menuItems.map((item, index) => {
          if ('type' in item && item.type === 'submenu') {
            const Icon = item.icon;
            let isActive = false;

            if (item.label === 'Tableau de Bord') {
              isActive = location.pathname.startsWith('/dashboard');
            } else if (item.label === 'Intelligence Décisionnelle') {
              isActive = location.pathname.startsWith('/lia');
            } else if (item.label === 'Rapports & Analytics') {
              isActive = location.pathname.startsWith('/rapports');
            } else if (item.label === 'Gestion Commerciale') {
              isActive = location.pathname.startsWith('/clients') ||
                location.pathname.startsWith('/fournisseurs') ||
                location.pathname.startsWith('/articles') ||
                location.pathname.startsWith('/inventaire') ||
                location.pathname.startsWith('/factures-vente');
            } else if (item.label === 'Comptabilité') {
              isActive = location.pathname.startsWith('/comptabilite') ||
                location.pathname.startsWith('/template-document') ||
                location.pathname.startsWith('/consolidation') ||
                location.pathname.startsWith('/gestion-entreprise') ||
                location.pathname.startsWith('/gestion-utilisateurs-acces');
            }

            return (
              <div key={index}>
                <button
                  onClick={item.onToggle}
                  className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-slate-100 text-slate-800 border border-slate-300'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  title={isSidebarCollapsed ? item.label : ''}
                >
                  <div className="flex items-center">
                    <Icon className={`h-5 w-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
                    {!isSidebarCollapsed && <span className="flex-1">{item.label}</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform ${item.isOpen ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>

                {item.isOpen && !isSidebarCollapsed && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.subItems.map((subItem: any, subIndex: number) => {
                      // Si c'est un sous-sous-menu
                      if (subItem.type === 'nested-submenu') {
                        const SubIcon = subItem.icon;
                        const isNestedActive = subItem.subItems?.some((nestedItem: any) =>
                          location.pathname === nestedItem.path
                        );

                        return (
                          <div key={subIndex}>
                            <button
                              onClick={subItem.onToggle}
                              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${isNestedActive || subItem.isOpen
                                ? 'bg-slate-100 text-slate-800'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                }`}
                            >
                              <div className="flex items-center">
                                <SubIcon className="h-4 w-4 mr-3" />
                                <span className="text-sm font-medium">{subItem.label}</span>
                              </div>
                              <ChevronDownIcon
                                className={`h-3 w-3 transition-transform ${subItem.isOpen ? 'rotate-180' : ''}`}
                              />
                            </button>

                            {subItem.isOpen && (
                              <div className="ml-8 mt-1 space-y-1">
                                {subItem.subItems.map((nestedItem: any) => {
                                  const NestedIcon = nestedItem.icon;
                                  const isNestedItemActive = location.pathname === nestedItem.path;

                                  return (
                                    <Link
                                      key={nestedItem.path}
                                      to={nestedItem.path}
                                      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${isNestedItemActive
                                        ? 'bg-slate-100 text-slate-800 border border-slate-300'
                                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                                        }`}
                                    >
                                      <NestedIcon className="h-3 w-3 mr-2 flex-shrink-0" />
                                      <span className="text-xs font-medium">{nestedItem.label}</span>
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      }

                      // Si c'est un lien normal
                      const SubIcon = subItem.icon;
                      const isSubActive = location.pathname === subItem.path;

                      return (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          className={`flex items-center px-4 py-2.5 rounded-lg transition-colors ${isSubActive
                            ? 'bg-slate-100 text-slate-800 border border-slate-300'
                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                        >
                          <SubIcon className="h-4 w-4 mr-3 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{subItem.label}</div>
                            {subItem.subLabel && (
                              <div className="text-xs text-slate-400 mt-0.5">{subItem.subLabel}</div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          } else if ('path' in item) {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : ''} px-4 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-slate-100 text-slate-800 border border-slate-300'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                title={isSidebarCollapsed ? item.label : ''}
              >
                <Icon className={`h-5 w-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
                {!isSidebarCollapsed && item.label}
              </Link>
            );
          }
          return null;
        })}
      </nav>
    </div>
  );
};

export default Sidebar;