/**
 * 🔐 CONTRÔLE D'ACCÈS EURL (Micro-Entreprise)
 * Définit exactement ce qu'une EURL peut voir et faire
 */

export interface MenuItemAccess {
  id: string;
  label: string;
  path: string;
  icon: string;
  visible: boolean;
  description?: string;
}

export class AccessControlEURL {
  /**
   * Menu et pages AUTORISÉES pour une EURL
   */
  static getAllowedPages(segment: string, companyType: string): MenuItemAccess[] {
    // EURL Micro-entreprise
    if (segment === 'micro' && companyType === 'eurl') {
      return [
        // 🏠 ACCUEIL
        {
          id: 'accueil',
          label: '🏠 Accueil',
          path: '/dashboard',
          icon: 'HomeIcon',
          visible: true,
          description: 'Vue synthétique et raccourcis'
        },
        
        // 📊 TABLEAU DE BORD
        {
          id: 'tableau-bord',
          label: '📊 Tableau de Bord',
          path: '/dashboard/tableau-bord',
          icon: 'ChartBarIcon',
          visible: true,
          description: 'Vue d\'ensemble 360°'
        },
        
        // 🧠 INTELLIGENCE DÉCISIONNELLE
        {
          id: 'intelligence-lia',
          label: '🧠 Intelligence (LIA)',
          path: '/lia/analyses',
          icon: 'SparklesIcon',
          visible: true,
          description: 'Analyses prédictives et recommandations'
        },
        
        // 📑 RAPPORTS & ANALYTICS
        {
          id: 'rapports',
          label: '📑 Rapports',
          path: '/rapports-analytics',
          icon: 'DocumentChartBarIcon',
          visible: true,
          description: 'Analyses financières'
        },
        {
          id: 'rapports-ventes',
          label: '  → Ventes & Clients',
          path: '/rapports/ventes-clients',
          icon: 'ChartPieIcon',
          visible: true
        },
        {
          id: 'rapports-achats',
          label: '  → Achats & Fournisseurs',
          path: '/rapports/achats-fournisseurs',
          icon: 'ShoppingCartIcon',
          visible: true
        },
        {
          id: 'rapports-stocks',
          label: '  → Stocks & Produits',
          path: '/rapports/stocks-produits',
          icon: 'CubeIcon',
          visible: true
        },
        {
          id: 'rapports-tresorerie',
          label: '  → Trésorerie & Banque',
          path: '/rapports/tresorerie-banque',
          icon: 'BanknotesIcon',
          visible: true
        },
        {
          id: 'rapports-comptabilite',
          label: '  → Comptabilité & Résultats',
          path: '/rapports/comptabilite-resultats',
          icon: 'CalculatorIcon',
          visible: true
        },
        {
          id: 'rapports-fiscalite',
          label: '  → Fiscalité & Déclarations',
          path: '/rapports/fiscalite-declarations',
          icon: 'DocumentTextIcon',
          visible: true
        },
        
        // 💼 GESTION COMMERCIALE
        {
          id: 'clients',
          label: '💼 Clients & Ventes',
          path: '/clients',
          icon: 'UserGroupIcon',
          visible: true,
          description: 'Gestion clients et facturation'
        },
        {
          id: 'fournisseurs',
          label: '  → Fournisseurs & Achats',
          path: '/fournisseurs',
          icon: 'TruckIcon',
          visible: true
        },
        {
          id: 'articles',
          label: '  → Articles & Inventaire',
          path: '/articles',
          icon: 'CubeIcon',
          visible: true
        },
        {
          id: 'factures',
          label: '  → Facturation & Paiements',
          path: '/factures',
          icon: 'DocumentTextIcon',
          visible: true
        },
        
        // 📘 COMPTABILITÉ
        {
          id: 'comptabilite',
          label: '📘 Comptabilité',
          path: '/gestion-comptable',
          icon: 'CalculatorIcon',
          visible: true,
          description: 'Comptabilité générale'
        },
        {
          id: 'journaux',
          label: '  → Journaux',
          path: '/comptabilite/journaux',
          icon: 'BookOpenIcon',
          visible: true
        },
        {
          id: 'templates',
          label: '  → Templates Documents',
          path: '/template-document',
          icon: 'DocumentDuplicateIcon',
          visible: true
        },
        
        // ⚙️ PARAMÈTRES
        {
          id: 'parametres',
          label: '⚙️ Paramètres',
          path: '/parametres',
          icon: 'Cog6ToothIcon',
          visible: true,
          description: 'Configuration système'
        }
      ];
    }

    // Pour les autres types, retourner menu complet
    return [];
  }

  /**
   * Vérifie si une page est accessible
   */
  static canAccessPage(path: string, segment: string, companyType: string): boolean {
    const allowedPages = this.getAllowedPages(segment, companyType);
    return allowedPages.some(page => path.startsWith(page.path));
  }

  /**
   * Fonctionnalités INTERDITES pour EURL
   */
  static getForbiddenFeatures(segment: string, companyType: string): string[] {
    if (segment === 'micro' && companyType === 'eurl') {
      return [
        'consolidation',          // Pas de multi-sociétés
        'multi-departements',     // Trop petit
        'gestion-projets',        // Pas besoin
        'business-intelligence',  // Trop complexe
        'audit-avance',          // Pas obligatoire
        'workflow-approbation',  // Overkill
        'gestion-filiales',      // Pas de filiales
        'reporting-groupe'       // Pas de groupe
      ];
    }
    return [];
  }

  /**
   * Fonctionnalités ESSENTIELLES pour EURL
   */
  static getEssentialFeatures(segment: string, companyType: string): string[] {
    if (segment === 'micro' && companyType === 'eurl') {
      return [
        'facturation-simple',     // Créer factures rapidement
        'clients-simple',         // Liste clients basique
        'tresorerie-jour',        // Combien en caisse aujourd'hui
        'rapports-basiques',      // CA, résultats
        'declarations-g50',       // Obligations fiscales
        'encaissements',          // Marquer comme payé
        'depenses-rapides',       // Noter une dépense
        'alertes-simples'         // Rappels importants
      ];
    }
    return [];
  }
}

