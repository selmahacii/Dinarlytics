import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  ChartBarIcon,
  SparklesIcon,
  DocumentChartBarIcon,
  UserGroupIcon,
  TruckIcon,
  CubeIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CalculatorIcon,
  BookOpenIcon,
  DocumentDuplicateIcon,
  Cog6ToothIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';

/**
 * 🔐 MENU LATÉRAL ADAPTÉ POUR EURL
 * Affiche uniquement les fonctionnalités dont une micro-entreprise a besoin
 */
const EURLSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, companyData } = useApp();

  if (!user) return null;

  const menuItems = [
    {
      section: 'Principal',
      items: [
        {
          id: 'accueil',
          label: 'Accueil',
          icon: HomeIcon,
          path: '/dashboard',
          badge: null
        },
        {
          id: 'tableau-bord',
          label: 'Tableau de Bord',
          icon: ChartBarIcon,
          path: '/dashboard/tableau-bord',
          badge: null
        }
      ]
    },
    {
      section: 'Intelligence',
      items: [
        {
          id: 'lia',
          label: 'Analyses LIA',
          icon: SparklesIcon,
          path: '/lia/analyses',
          badge: 'IA'
        }
      ]
    },
    {
      section: 'Rapports',
      items: [
        {
          id: 'rapports-ventes',
          label: 'Ventes & Clients',
          icon: ChartBarIcon,
          path: '/rapports/ventes-clients',
          badge: null
        },
        {
          id: 'rapports-tresorerie',
          label: 'Trésorerie',
          icon: BanknotesIcon,
          path: '/rapports/tresorerie-banque',
          badge: null
        },
        {
          id: 'rapports-fiscalite',
          label: 'Fiscalité',
          icon: DocumentTextIcon,
          path: '/rapports/fiscalite-declarations',
          badge: 'G50'
        }
      ]
    },
    {
      section: 'Commercial',
      items: [
        {
          id: 'clients',
          label: 'Clients',
          icon: UserGroupIcon,
          path: '/clients',
          badge: companyData?.clientsCount.toString()
        },
        {
          id: 'factures',
          label: 'Factures',
          icon: DocumentTextIcon,
          path: '/factures',
          badge: companyData?.pendingInvoices > 0 ? companyData.pendingInvoices.toString() : null
        },
        {
          id: 'fournisseurs',
          label: 'Fournisseurs',
          icon: TruckIcon,
          path: '/fournisseurs',
          badge: null
        },
        {
          id: 'articles',
          label: 'Articles',
          icon: CubeIcon,
          path: '/articles',
          badge: null
        }
      ]
    },
    {
      section: 'Comptabilité',
      items: [
        {
          id: 'compta',
          label: 'Journaux',
          icon: BookOpenIcon,
          path: '/comptabilite/journaux',
          badge: null
        },
        {
          id: 'templates',
          label: 'Templates',
          icon: DocumentDuplicateIcon,
          path: '/template-document',
          badge: null
        }
      ]
    },
    {
      section: 'Système',
      items: [
        {
          id: 'parametres',
          label: 'Paramètres',
          icon: Cog6ToothIcon,
          path: '/parametres',
          badge: null
        }
      ]
    }
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto">
      {/* En-tête */}
      <div className="p-6 border-b border-gray-200">
        <div className="text-center">
          <div className="text-3xl mb-2">{(user as any).avatar || '🏪'}</div>
          <p className="font-bold text-gray-900">{user.nom}</p>
          <p className="text-xs text-gray-600 mt-1">
            {companyData && `CA: ${(companyData.revenueTotal / 1000000).toFixed(1)}M DA`}
          </p>
          <div className="mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
            EURL - Micro
          </div>
        </div>
      </div>

      {/* Menu par sections */}
      <div className="p-4 space-y-6">
        {menuItems.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2 px-3">
              {section.section}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon as any;
                const active = isActive(item.path);

                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{item.label.includes('→') ? '  ' : ''}</span>
                      <span className={`font-medium text-sm ${item.label.includes('→') ? 'text-xs' : ''}`}>
                        {item.label}
                      </span>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        active
                          ? 'bg-white text-blue-600'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {active && !item.badge && (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Message de restriction */}
      <div className="p-4 mx-4 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800 font-semibold mb-1">
          ℹ️ Menu Adapté
        </p>
        <p className="text-xs text-blue-700">
          Votre menu est optimisé pour une EURL. Seules les fonctionnalités essentielles sont affichées.
        </p>
      </div>
    </div>
  );
};

export default EURLSidebar;


