import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import currencyIcon from '../../shared/assets/currency.png';
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
import { useApp } from '@core/context/AppContext';
import { usePermission } from '../../shared/hooks/usePermission';
import { useTranslation } from '../../shared/hooks/useTranslation';

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
  id?: string;
  icon: SidebarIcon;
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  subItems: SidebarItem[];
};

type SidebarItem = SidebarSubmenu | SidebarLink;

const Sidebar: React.FC = () => {
  const { planComptable, isSidebarCollapsed, setSidebarCollapsed, isMobileMenuOpen, setMobileMenuOpen } = useApp();
  const location = useLocation();
  const { has, user } = usePermission();
  const { t } = useTranslation();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'intelligence-lia': false,
    'finance-comptabilite': false,
    'pilotage-tableaux': false,
    'operations-commerciales': false,
    'analyses-rapports': false,
    'controle-reglages': false
  });

  const toggleMenu = (key: string) => {
    setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const menuItems: SidebarItem[] = ([
    // 1. Core AI Intelligence (User priority)
    has('lia-access') && {
      type: 'submenu',
      id: 'intelligence-lia',
      icon: SparklesIcon,
      label: t('nav.intelligence_lia'),
      isOpen: openMenus['intelligence-lia'],
      onToggle: () => toggleMenu('intelligence-lia'),
      subItems: [
        has('lia-chatbot') && { path: '/lia/chatbot', icon: SparklesIcon, label: t('nav.lia_chatbot') },
        has('lia-analyses') && { path: '/lia/analyses', icon: ChartBarIcon, label: t('nav.lia_predictive') },
        has('lia-train') && { path: '/entrainement-modele-ia', icon: CpuChipIcon, label: t('nav.lia_train') }
      ].filter(Boolean)
    },

    // 2. Accounting & Fiscal (Finance Heart)
    has('comptabilite-read') && {
      type: 'submenu',
      id: 'finance-comptabilite',
      icon: CalculatorIcon,
      label: t('nav.finance_accounting'),
      isOpen: openMenus['finance-comptabilite'],
      onToggle: () => toggleMenu('finance-comptabilite'),
      subItems: [
        { path: '/comptabilite/etats', icon: DocumentTextIcon, label: t('nav.balance_sheet') },
        { path: '/fiscalite', icon: ScaleIcon, label: t('nav.tax_declarations') },
        has('comptabilite-write') && { path: '/comptabilite/journaux', icon: ClipboardDocumentListIcon, label: t('nav.journal_entry') }
      ].filter(Boolean)
    },

    // 3. Operational Dashboards
    has('dashboard-access') && {
      type: 'submenu',
      id: 'pilotage-tableaux',
      icon: HomeIcon,
      label: t('nav.steering'),
      isOpen: openMenus['pilotage-tableaux'],
      onToggle: () => toggleMenu('pilotage-tableaux'),
      subItems: [
        has('dashboard-overview') && { path: '/dashboard', icon: HomeIcon, label: t('nav.global_view') },
        has('dashboard-alerts') && { path: '/dashboard/alertes', icon: ExclamationTriangleIcon, label: t('nav.alerts_risks') },
        has('dashboard-calendar') && { path: '/dashboard/calendrier', icon: CalendarIcon, label: t('nav.fiscal_calendar') }
      ].filter(Boolean)
    },

    // 4. Commercial & Supply Chain (Impact Finance)
    has('facturation-read') && {
      type: 'submenu',
      id: 'operations-commerciales',
      icon: ShoppingCartIcon,
      label: t('nav.operations'),
      isOpen: openMenus['operations-commerciales'],
      onToggle: () => toggleMenu('operations-commerciales'),
      subItems: [
        { path: '/factures-vente', icon: DocumentTextIcon, label: t('common.sales_invoices') },
        { path: '/achats-charges', icon: BanknotesIcon, label: t('common.purchase_invoices') },
        has('clients-manage') && { path: '/clients', icon: UsersIcon, label: t('nav.client_portfolio') },
        has('fournisseurs-manage') && { path: '/fournisseurs', icon: TruckIcon, label: t('common.suppliers') },
        has('stocks-read') && { path: '/articles', icon: CubeIcon, label: t('nav.stock_articles') }
      ].filter(Boolean)
    },

    // 5. Strategic Reports
    has('rapports-basic') && {
      type: 'submenu',
      id: 'analyses-rapports',
      icon: DocumentChartBarIcon,
      label: t('nav.analytics'),
      isOpen: openMenus['analyses-rapports'],
      onToggle: () => toggleMenu('analyses-rapports'),
      subItems: [
        has('rapports-tresorerie') && { path: '/rapports/tresorerie-banque', icon: BanknotesIcon, label: t('nav.cash_flow') },
        has('rapports-ventes') && { path: '/rapports/ventes-clients', icon: ChartBarIcon, label: t('nav.commercial_analysis') },
        has('rapports-advanced') && { path: '/dashboard/analytics', icon: ChartPieIcon, label: t('nav.performance') }
      ].filter(Boolean)
    },

    // 6. Security & Settings
    has('audit-read') && {
      type: 'submenu',
      id: 'controle-reglages',
      icon: ShieldCheckIcon,
      label: t('nav.admin_settings'),
      isOpen: openMenus['controle-reglages'],
      onToggle: () => toggleMenu('controle-reglages'),
      subItems: [
        { path: '/audit-explorer', icon: ShieldCheckIcon, label: t('nav.audit_traceability') },
        has('admin-users') && { path: '/gestion-utilisateurs-acces', icon: UserGroupIcon, label: t('nav.users') },
        { path: '/parametres', icon: CogIcon, label: t('nav.settings') }
      ].filter(Boolean)
    }
  ] as Array<SidebarItem | false>).filter(Boolean) as SidebarItem[];


  // Sidebar collapsed state is managed by parent via props, but we also have local toggle for mobile
  // We use the prop 'isSidebarCollapsed' passed from Layout

  const sidebarWidth = isSidebarCollapsed ? 'w-20' : 'w-72';

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar Container - WHITE THEME */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth} bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col shadow-sm ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Header / Logo Area - Clean White */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 bg-white relative">

          <Link to="/" className="flex items-center space-x-3 relative z-10 group/logo">
            <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'w-10 h-10' : 'w-9 h-9'} rounded-xl bg-slate-50 flex items-center justify-center border border-slate-200 group-hover/logo:border-slate-300`}>
              <img src={currencyIcon} alt="Logo" className={`${isSidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'} opacity-90`} />
            </div>

            {!isSidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-lg text-slate-800 tracking-tight leading-none group-hover/logo:text-slate-900 transition-colors">
                  Dinarlytic
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mt-0.5">
                  ERP Financier
                </span>
              </div>
            )}
          </Link>

          {!isSidebarCollapsed && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Profile Summary (Mini) - Clean Theme */}
        {!isSidebarCollapsed && user && (
          <div className="px-4 py-4 border-b border-slate-100 bg-white">
            {/* Plan Comptable Badge - Like Screenshot */}
            <div className="mb-4">
              <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${planComptable === 'algerien'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-blue-50 text-blue-700 border border-blue-100'
                }`}>
                {planComptable === 'algerien' ? 'DZ PCA 2010' : 'INT IFRS'}
              </span>
            </div>
          </div>
        )}

        {/* Navigation - Light Theme - No Green Backgrounds */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-3 space-y-1">
          {/* Reduce Button - Like Screenshot */}
          {!isSidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="w-full hidden lg:flex items-center justify-center py-2 mb-2 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronLeftIcon className="w-3 h-3 mr-1" />
              {t('common.reduce')}
            </button>
          )}

          {menuItems.map((item, index) => {
            if ('type' in item && item.type === 'submenu') {
              const Icon = item.icon;

              // Check if any child is active
              const isChildActive = item.subItems.some((sub: any) => {
                if (sub.type === 'nested-submenu') return false;
                return location.pathname.startsWith(sub.path);
              });

              const isActiveGroup = item.isOpen || isChildActive;

              return (
                <div key={index} className="mb-1">
                  <button
                    onClick={(item as any).onToggle}
                    className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg transition-all duration-150 group ${isActiveGroup
                      ? 'bg-slate-100 text-slate-800 font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    title={isSidebarCollapsed ? item.label : ''}
                  >
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 transition-colors ${isActiveGroup ? 'text-slate-700' : 'text-slate-400 group-hover:text-slate-600'
                        } ${isSidebarCollapsed ? '' : 'mr-3'}`} />

                      {!isSidebarCollapsed && (
                        <span className="text-sm tracking-wide">{item.label}</span>
                      )}
                    </div>

                    {!isSidebarCollapsed && (
                      <ChevronDownIcon
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${item.isOpen ? 'rotate-180 text-slate-600' : 'group-hover:text-slate-500'}`}
                      />
                    )}
                  </button>

                  {/* Submenu */}
                  <div className={`overflow-hidden transition-all duration-200 ease-in-out ${(item.isOpen && !isSidebarCollapsed) ? 'max-h-[500px] opacity-100 mt-1' : 'max-h-0 opacity-0'
                    }`}>
                    <div className="ml-3 pl-3 border-l border-slate-200 space-y-0.5 py-1">
                      {item.subItems.map((subItem: any, subIndex: number) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = location.pathname === subItem.path;

                        return (
                          <Link
                            key={subIndex}
                            to={subItem.path}
                            className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-150 group/link ${isSubActive
                              ? 'text-slate-900 font-medium bg-slate-50/50'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                              }`}
                          >
                            <span className="truncate">{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Footer / Standard Switcher - Minimalist White */}
        <div className="p-4 border-t border-slate-100 bg-white z-30">

          {/* Settings Link (matches screenshot position) */}
          <Link to="/parametres" className="flex items-center px-3 py-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors mb-2">
            <CogIcon className="w-5 h-5 mr-3 text-slate-400" />
            {!isSidebarCollapsed && <span className="text-sm font-medium">{t('nav.settings')}</span>}
          </Link>

          {isSidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Bars3Icon className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
