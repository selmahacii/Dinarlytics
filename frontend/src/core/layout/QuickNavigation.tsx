import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  HomeIcon,
  ChartBarIcon,
  BanknotesIcon,
  CalculatorIcon,
  UserGroupIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  BookOpenIcon,
  EyeIcon,
  CogIcon,
  TruckIcon,
  BellIcon,
  ChartPieIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface QuickNavSubItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface QuickNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  category: string;
  description: string;
  subItems?: QuickNavSubItem[];
}

const QuickNavigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();
  const location = useLocation();

  const navigationItems: QuickNavItem[] = [
    // Intelligence Décisionnelle avec sous-liens
    { 
      name: 'Intelligence Décisionnelle', 
      href: '/lia/chatbot', 
      icon: SparklesIcon, 
      category: 'IA & Analytics', 
      description: 'LIA : Analyses intelligentes, prévisions et recommandations automatiques',
      subItems: [
        {
          name: 'Chatbot LIA',
          href: '/lia/chatbot',
          icon: SparklesIcon,
          description: 'Interface de chat avec LIA '
        },
        {
          name: 'Analyses LIA',
          href: '/lia/analyses',
          icon: ChartBarIcon,
          description: 'Analyses détaillées et graphiques de performance'
        }
      ]
    },
    
    // Tableau de bord avec sous-liens
    { 
      name: 'Tableau de Bord', 
      href: '/dashboard', 
      icon: HomeIcon, 
      category: 'Général', 
      description: 'Vue synthétique et dynamique de toute l\'activité',
      subItems: [
        {
          name: 'Vue d\'ensemble',
          href: '/dashboard/vue-ensemble',
          icon: ChartPieIcon,
          description: 'Statistiques clés (ventes, achats, trésorerie, dettes)'
        },
        {
          name: 'Graphiques interactifs',
          href: '/dashboard/graphiques',
          icon: ChartBarIcon,
          description: 'Graphiques interactifs (barres, lignes, ratios)'
        },
        {
          name: 'Alertes intelligentes',
          href: '/dashboard/alertes',
          icon: ExclamationTriangleIcon,
          description: 'Stocks bas, factures impayées, échéances fiscales'
        },
        {
          name: 'Calendrier & Rappels',
          href: '/dashboard/calendrier',
          icon: CalendarIcon,
          description: 'Échéances fiscales et de paiement'
        }
      ]
    },
    { name: 'Vue Temps Réel', href: '/dashboard/temps-reel', icon: BellIcon, category: 'Général', description: 'Monitoring en direct' },
    { name: 'Analytics Avancées', href: '/dashboard/analytics', icon: ChartBarIcon, category: 'Général', description: 'Analyse prédictive' },
    
    // Gestion Commerciale
    { name: 'Gestion Clients', href: '/clients', icon: UserGroupIcon, category: 'Commercial', description: 'Gestion de la clientèle' },
    { name: 'Gestion Fournisseurs', href: '/fournisseurs', icon: TruckIcon, category: 'Commercial', description: 'Achats et approvisionnements' },
    { name: 'Gestion Articles', href: '/articles', icon: CubeIcon, category: 'Commercial', description: 'Catalogue produits' },
    { name: 'Inventaire', href: '/inventaire', icon: ClipboardDocumentListIcon, category: 'Commercial', description: 'Gestion des stocks' },
    { name: 'Facturation', href: '/factures-vente', icon: DocumentTextIcon, category: 'Commercial', description: 'Factures et ventes' },
    
    // Comptabilité
    { name: 'Gestion Comptable', href: '/gestion-comptable', icon: CalculatorIcon, category: 'Comptabilité', description: 'Écritures comptables' },
    { name: 'Plan Comptable', href: '/plan-comptable', icon: BookOpenIcon, category: 'Comptabilité', description: 'Configuration comptable' },
    { name: 'Analyse Financière', href: '/analyse-financiere', icon: BanknotesIcon, category: 'Comptabilité', description: 'Ratios et indicateurs' },
    
    // Rapports et Analytics
    { name: 'Rapports & Analytics', href: '/rapports-analytics', icon: ChartBarIcon, category: 'Rapports', description: 'Génération de rapports' },
    { name: 'Indicateurs Performance', href: '/statistiques/performance', icon: ChartBarIcon, category: 'Rapports', description: 'KPIs et métriques' },
    
    // Administration
    { name: 'Gestion Utilisateurs', href: '/gestion-utilisateurs', icon: UserGroupIcon, category: 'Administration', description: 'Gestion des accès' },
    { name: 'Audit', href: '/audit', icon: EyeIcon, category: 'Administration', description: 'Contrôles et traçabilité' },
    { name: 'Configuration', href: '/configuration-avancee', icon: CogIcon, category: 'Administration', description: 'Paramètres avancés' }
  ];

  const filteredItems = navigationItems.filter(item => {
    const matchesMainItem = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubItems = item.subItems?.some(subItem =>
      subItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subItem.description.toLowerCase().includes(searchTerm.toLowerCase())
    ) || false;
    
    return matchesMainItem || matchesSubItems;
  });

  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as { [key: string]: QuickNavItem[] });

  const handleItemClick = () => {
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <>
      {/* Bouton de déclenchement */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-full shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all transform hover:scale-110 z-40"
        title={t('quick_navigation.title')}
      >
        <MagnifyingGlassIcon className="h-6 w-6" />
      </button>

      {/* Modal de navigation rapide */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* En-tête */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">{t('quick_navigation.title')}</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Fermer la navigation rapide"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Recherche */}
            <div className="p-6 border-b border-slate-200">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t('quick_navigation.search_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  autoFocus
                />
              </div>
            </div>

            {/* Liste des éléments */}
            <div className="p-6 overflow-y-auto max-h-96">
              {Object.keys(groupedItems).length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  {t('quick_navigation.no_results')}
                </div>
              ) : (
                Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="mb-6">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        const hasSubItems = item.subItems && item.subItems.length > 0;
                        
                        return (
                          <div key={item.href}>
                            {/* Élément principal */}
                            <Link
                              to={item.href}
                              onClick={handleItemClick}
                              className={`flex items-center p-3 rounded-lg transition-colors ${
                                isActive
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <Icon className={`h-5 w-5 mr-3 ${
                                isActive ? 'text-emerald-600' : 'text-slate-400'
                              }`} />
                              <div className="flex-1">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-slate-500">{item.description}</div>
                              </div>
                            </Link>
                            
                            {/* Sous-liens */}
                            {hasSubItems && (
                              <div className="ml-6 mt-1 space-y-1">
                                {item.subItems!.map((subItem) => {
                                  const SubIcon = subItem.icon;
                                  const isSubActive = location.pathname === subItem.href;
                                  
                                  return (
                                    <Link
                                      key={subItem.href}
                                      to={subItem.href}
                                      onClick={handleItemClick}
                                      className={`flex items-center p-2 rounded-md transition-colors text-sm ${
                                        isSubActive
                                          ? 'bg-emerald-100 text-emerald-800 border-l-2 border-emerald-500'
                                          : 'hover:bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      <SubIcon className={`h-4 w-4 mr-2 ${
                                        isSubActive ? 'text-emerald-600' : 'text-slate-400'
                                      }`} />
                                      <div className="flex-1">
                                        <div className="font-medium">{subItem.name}</div>
                                        <div className="text-xs text-slate-500">{subItem.description}</div>
                                      </div>
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pied de page */}
            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <div className="text-sm text-slate-600">
                {t('quick_navigation.footer')}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickNavigation;
