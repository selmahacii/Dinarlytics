import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  name: string;
  href: string;
  current?: boolean;
}

const Breadcrumb: React.FC = () => {
  const location = useLocation();

  // Mapping des routes vers les noms de pages
  const routeNames: { [key: string]: string } = {
    '/dashboard': 'Tableau de Bord',
    '/dashboard/temps-reel': 'Vue Temps Réel',
    '/dashboard/analytics': 'Analytics Avancées',
    '/dashboard/rapports': 'Rapports Personnalisés',
    '/dashboard/personnalisable': 'Tableau Personnalisable',
    '/gestion-utilisateurs': 'Gestion Utilisateurs',
    '/gestion-comptable': 'Gestion Comptable',
    '/clients': 'Gestion Clients',
    '/fournisseurs': 'Gestion Fournisseurs',
    '/articles': 'Gestion Articles',
    '/inventaire': 'Inventaire',
    '/factures-vente': 'Facturation',
    '/analyse-financiere': 'Analyse Financière',
    '/plan-comptable': 'Plan Comptable',
    '/configuration-avancee': 'Configuration Avancée',
    '/mobile-features': 'Fonctionnalités Mobile',
    '/integrations': 'Intégrations',
    '/audit': 'Audit',
    '/groupes-clients': 'Groupes Clients',
    '/statistiques': 'Statistiques',
    '/statistiques/financier': 'Tableau de Bord Financier',
    '/statistiques/performance': 'Indicateurs de Performance',
    '/rapports-analytics': 'Rapports & Analytics',
    '/parametres': 'Paramètres'
  };

  // Génération des breadcrumbs basée sur la route actuelle
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs: BreadcrumbItem[] = [
      {
        name: 'Accueil',
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
      <ol className="flex items-center space-x-2">
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
