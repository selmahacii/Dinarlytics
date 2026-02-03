import { useMemo } from 'react';
import { usePermission } from './usePermission';

/**
 * Structure des données/widgets à afficher selon le rôle
 */
export interface RoleSpecificWidgets {
  dashboard: {
    showOverview: boolean;
    showCharts: boolean;
    showAlerts: boolean;
    showCalendar: boolean;
  };
  accounting: {
    showAccounting: boolean;
    showComptabilite: boolean;
    showComptabiliteDetails: boolean;
    showFiscalite: boolean;
    showAudit: boolean;
  };
  sales: {
    showClients: boolean;
    showFactures: boolean;
    showPaiements: boolean;
    showStatistiques: boolean;
  };
  purchasing: {
    showFournisseurs: boolean;
    showAchats: boolean;
  };
  inventory: {
    showArticles: boolean;
    showStocks: boolean;
    showInventaire: boolean;
  };
  ai: {
    showChatbot: boolean;
    showAnalyses: boolean;
    showTraining: boolean;
  };
  admin: {
    showUsers: boolean;
    showRoles: boolean;
    showSettings: boolean;
    showAudit: boolean;
  };
  reports: {
    showBasicReports: boolean;
    showAdvancedReports: boolean;
    showCustomReports: boolean;
    showFiscalityReports: boolean;
  };
}

/**
 * Structure des données sensibles à masquer/afficher
 */
export interface SensitiveDataPolicy {
  amountVisibility: 'full' | 'masked' | 'hidden'; // Afficher montants ou masqués (***) ou cachés
  historyVisibility: boolean; // Afficher historique des transactions
  documentAccess: 'full' | 'basic' | 'none'; // Accès aux documents
  auditLogAccess: boolean; // Accès aux logs audit
  exportAllowed: boolean; // Autoriser l'export
  printAllowed: boolean; // Autoriser l'impression
}

/**
 * Hook pour obtenir les widgets et données adaptés au rôle de l'utilisateur
 * 
 * Utilisation:
 * const { widgets, sensitiveData, canAccess } = useRoleSpecificData();
 * 
 * if (widgets.dashboard.showFiscalite) {
 *   return <FiscaliteWidget />;
 * }
 */
export function useRoleSpecificData() {
  const { has, user } = usePermission();

  // Widgets disponibles selon les permissions
  const widgets: RoleSpecificWidgets = useMemo(() => ({
    dashboard: {
      showOverview: true, // Tous les users
      showCharts: true,
      showAlerts: has('dashboard-alerts') || has('rapports-basic'),
      showCalendar: has('dashboard-calendar'),
    },
    accounting: {
      showAccounting: has('comptabilite-read'),
      showComptabilite: has('comptabilite-read'),
      showComptabiliteDetails: has('comptabilite-write'),
      showFiscalite: has('rapports-fiscalite'),
      showAudit: has('audit-read'),
    },
    sales: {
      showClients: has('clients-manage'),
      showFactures: has('facturation-read'),
      showPaiements: has('facturation-read'),
      showStatistiques: has('rapports-basic'),
    },
    purchasing: {
      showFournisseurs: has('fournisseurs-manage'),
      showAchats: has('rapports-basic'),
    },
    inventory: {
      showArticles: has('articles-manage'),
      showStocks: has('stocks-read'),
      showInventaire: has('stocks-inventory'),
    },
    ai: {
      showChatbot: has('lia-access'),
      showAnalyses: has('lia-access'),
      showTraining: has('lia-train'),
    },
    admin: {
      showUsers: has('admin-users'),
      showRoles: has('admin-users'),
      showSettings: has('admin-settings'),
      showAudit: has('audit-full'),
    },
    reports: {
      showBasicReports: has('rapports-basic'),
      showAdvancedReports: has('rapports-advanced'),
      showCustomReports: has('rapports-create'),
      showFiscalityReports: has('rapports-fiscalite'),
    },
  }), [has]);

  // Politique d'accès aux données sensibles selon le rôle
  const sensitiveData: SensitiveDataPolicy = useMemo(() => {
    const userRole = (user as any)?.role;

    // Admin : accès complet
    if (userRole === 'admin') {
      return {
        amountVisibility: 'full',
        historyVisibility: true,
        documentAccess: 'full',
        auditLogAccess: true,
        exportAllowed: true,
        printAllowed: true,
      };
    }

    // Comptable senior : accès presque complet
    if (userRole === 'comptable-senior') {
      return {
        amountVisibility: 'full',
        historyVisibility: true,
        documentAccess: 'full',
        auditLogAccess: true,
        exportAllowed: true,
        printAllowed: true,
      };
    }

    // Comptable : accès modéré
    if (userRole === 'comptable') {
      return {
        amountVisibility: 'full',
        historyVisibility: true,
        documentAccess: 'basic',
        auditLogAccess: false,
        exportAllowed: true,
        printAllowed: true,
      };
    }

    // Manager : accès élevé
    if (userRole === 'manager') {
      return {
        amountVisibility: 'full',
        historyVisibility: true,
        documentAccess: 'basic',
        auditLogAccess: false,
        exportAllowed: true,
        printAllowed: true,
      };
    }

    // Auditeur : accès en lecture seule
    if (userRole === 'auditeur') {
      return {
        amountVisibility: 'full',
        historyVisibility: true,
        documentAccess: 'basic',
        auditLogAccess: true,
        exportAllowed: false,
        printAllowed: false,
      };
    }

    // Vendeur/Commercial : accès limité
    if (userRole === 'vendeur' || userRole === 'commercial') {
      return {
        amountVisibility: 'masked', // Montants masqués (sans détails)
        historyVisibility: false,
        documentAccess: 'basic',
        auditLogAccess: false,
        exportAllowed: false,
        printAllowed: true,
      };
    }

    // Utilisateur standard : accès minimal
    return {
      amountVisibility: 'masked',
      historyVisibility: false,
      documentAccess: 'basic',
      auditLogAccess: false,
      exportAllowed: false,
      printAllowed: true,
    };
  }, [user]);

  /**
   * Fonction utilitaire pour vérifier l'accès à une permission
   */
  const canAccess = (permission: string | string[]): boolean => {
    if (Array.isArray(permission)) {
      return permission.every(p => has(p));
    }
    return has(permission);
  };

  /**
   * Formater un montant selon la politique de données sensibles
   */
  const formatAmount = (amount: number): string | number => {
    if (sensitiveData.amountVisibility === 'full') {
      return amount;
    }
    if (sensitiveData.amountVisibility === 'masked') {
      return '***'; // Masqué
    }
    return 'N/A'; // Caché
  };

  /**
   * Vérifier si les données historiques peuvent être affichées
   */
  const canViewHistory = (): boolean => {
    return sensitiveData.historyVisibility;
  };

  /**
   * Vérifier si l'export est autorisé
   */
  const canExport = (): boolean => {
    return sensitiveData.exportAllowed;
  };

  return {
    widgets,
    sensitiveData,
    canAccess,
    formatAmount,
    canViewHistory,
    canExport,
    user,
  };
}
