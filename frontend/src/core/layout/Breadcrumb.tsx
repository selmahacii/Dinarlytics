import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

interface BreadcrumbItem {
  name: string;
  href: string;
  current?: boolean;
}

const Breadcrumb: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  // Mapping des routes vers les noms de pages
  const routeNames: { [key: string]: string } = {
    '/dashboard': t('breadcrumb.dashboard'),
    '/dashboard/temps-reel': t('breadcrumb.real_time'),
    '/dashboard/analytics': t('breadcrumb.advanced_analytics'),
    '/dashboard/rapports': t('breadcrumb.custom_reports'),
    '/dashboard/personnalisable': t('breadcrumb.custom_dashboard'),
    '/gestion-utilisateurs': t('breadcrumb.user_mgmt'),
    '/gestion-comptable': t('breadcrumb.accounting_mgmt'),
    '/clients': t('breadcrumb.client_mgmt'),
    '/fournisseurs': t('breadcrumb.supplier_mgmt'),
    '/articles': t('breadcrumb.article_mgmt'),
    '/inventaire': t('breadcrumb.inventory'),
    '/factures-vente': t('breadcrumb.billing'),
    '/analyse-financiere': t('breadcrumb.financial_analysis'),
    '/plan-comptable': t('breadcrumb.chart_of_accounts'),
    '/configuration-avancee': t('breadcrumb.advanced_config'),
    '/mobile-features': t('breadcrumb.mobile_features'),
    '/integrations': t('breadcrumb.integrations'),
    '/audit': t('breadcrumb.audit'),
    '/groupes-clients': t('breadcrumb.client_groups'),
    '/statistiques': t('breadcrumb.statistics'),
    '/statistiques/financier': t('breadcrumb.financial_dashboard'),
    '/statistiques/performance': t('breadcrumb.performance_indicators'),
    '/rapports-analytics': t('breadcrumb.reports_analytics'),
    '/parametres': t('breadcrumb.settings')
  };

  // Génération des breadcrumbs basée sur la route actuelle
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs: BreadcrumbItem[] = [
      {
        name: t('breadcrumb.home'),
        href: '/dashboard',
        current: pathnames.length === 0
      }
    ];

    let currentPath = '';
    pathnames.forEach((pathname, index) => {
      currentPath += `/${pathname}`;
      const isLast = index === pathnames.length - 1;
      
      // Recherche du nom de la route
      let routeName = routeNames[currentPath];
      
      // Si pas trouvé, essayer avec le nom du segment
      if (!routeName) {
        const segmentName = pathname.charAt(0).toUpperCase() + pathname.slice(1).replace(/-/g, ' ');
        routeName = segmentName;
      }

      breadcrumbs.push({
        name: routeName,
        href: currentPath,
        current: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-y-2">
        {breadcrumbs.map((item, index) => (
          <li key={`${item.href}-${index}`} className="flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="h-4 w-4 text-slate-400 mx-2" />
            )}
            {item.current ? (
              <span className="text-sm font-medium text-slate-900">
                {index === 0 ? <HomeIcon className="h-4 w-4" /> : item.name}
              </span>
            ) : (
              <Link
                to={item.href}
                className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center"
              >
                {index === 0 && <HomeIcon className="h-4 w-4 mr-1" />}
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
