/**
 * MATRICE COMPLÈTE D'ACCÈS PAR RÔLE ET MODULE
 * Dinarlytics - Système de Gestion d'Accès Adaptatif
 * 
 * Cette matrice définit pour CHAQUE RÔLE et CHAQUE MODULE :
 * - Droits d'accès (lecture, écriture, suppression)
 * - Données visibles selon le segment (micro/small/medium/large/enterprise)
 * - Limitations et filtres appliqués
 */

export const MODULE_ACCESS_MATRIX = {
  // ============================================
  // 1️⃣ MODULE: DASHBOARD & ANALYSE
  // ============================================
  dashboard: {
    name: 'Tableau de Bord',
    icon: 'ChartBarIcon',
    route: '/dashboard',
    
    'comptable-junior': {
      access: true,
      segments: ['micro', 'small'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: false,
        share: false,
        schedule: false,
      },
      visibleData: {
        micro: {
          widgets: ['kpi-basic', 'sales-simple', 'expenses-simple'],
          maxHistory: 3, // mois
          realTime: false,
          autoRefresh: 3600, // 1h
          maxCompanies: 1,
        },
        small: {
          widgets: ['kpi-core', 'sales-detailed', 'expenses-detailed', 'cashflow-simple'],
          maxHistory: 12,
          realTime: false,
          autoRefresh: 1800, // 30min
          maxCompanies: 1,
        },
      },
      filters: {
        ownDataOnly: true, // Voir que ses propres données
        hideSensitive: ['bank-details', 'employee-salary', 'tax-details'],
        dateRange: 'last-90-days',
      },
      description: 'Vue simplifiée, données limité',
    },

    comptable: {
      access: true,
      segments: ['small', 'medium'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: true,
        share: true,
        schedule: false,
      },
      visibleData: {
        small: {
          widgets: ['kpi-full', 'sales', 'expenses', 'cashflow', 'ratios-basic', 'alerts'],
          maxHistory: 24,
          realTime: false,
          autoRefresh: 900, // 15min
          maxCompanies: 1,
        },
        medium: {
          widgets: ['kpi-full', 'sales', 'expenses', 'cashflow', 'ratios-advanced', 'alerts', 'anomalies'],
          maxHistory: 60,
          realTime: false,
          autoRefresh: 600, // 10min
          maxCompanies: 1,
        },
      },
      filters: {
        ownDataOnly: false, // Accès à son département
        hideSensitive: ['top-salaries', 'confidential-projects'],
        dateRange: 'unlimited',
      },
      description: 'Vue complète, un département',
    },

    'comptable-senior': {
      access: true,
      segments: ['medium', 'large', 'enterprise'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: true,
        share: true,
        schedule: true,
      },
      visibleData: {
        medium: {
          widgets: ['all'],
          maxHistory: 120,
          realTime: true,
          autoRefresh: 300, // 5min
          maxCompanies: 1,
        },
        large: {
          widgets: ['all', 'consolidated', 'predictive', 'benchmarks'],
          maxHistory: 240,
          realTime: true,
          autoRefresh: 60, // 1min
          maxCompanies: 'unlimited',
        },
        enterprise: {
          widgets: ['all', 'consolidated', 'predictive', 'benchmarks', 'ai-insights'],
          maxHistory: 'unlimited',
          realTime: true,
          autoRefresh: 30, // 30sec
          maxCompanies: 'unlimited',
        },
      },
      filters: {
        ownDataOnly: false,
        hideSensitive: [],
        dateRange: 'unlimited',
      },
      description: 'Vue complète, toutes les sociétés',
    },

    manager: {
      access: true,
      segments: ['all'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: true,
        share: true,
        schedule: false,
      },
      visibleData: {
        default: {
          widgets: ['kpi-executive', 'strategic-metrics', 'alerts', 'cashflow-summary'],
          maxHistory: 60,
          realTime: false,
          autoRefresh: 1200, // 20min
          maxCompanies: 'unlimited',
        },
      },
      filters: {
        ownDataOnly: false,
        hideSensitive: ['operational-details', 'individual-salaries'],
        dateRange: 'unlimited',
      },
      description: 'Vue exécutive, résumés stratégiques',
    },

    auditeur: {
      access: true,
      segments: ['large', 'enterprise'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: true,
        share: false,
        schedule: false,
      },
      visibleData: {
        large: {
          widgets: ['audit-trail', 'control-points', 'exceptions', 'compliance'],
          maxHistory: 'unlimited',
          realTime: true,
          autoRefresh: 600,
          maxCompanies: 'unlimited',
        },
        enterprise: {
          widgets: ['audit-trail', 'control-points', 'exceptions', 'compliance', 'anomaly-detection'],
          maxHistory: 'unlimited',
          realTime: true,
          autoRefresh: 300,
          maxCompanies: 'unlimited',
        },
      },
      filters: {
        ownDataOnly: false,
        hideSensitive: [],
        dateRange: 'unlimited',
        auditMode: true, // Mode audit strict
      },
      description: 'Vue complète audit avec logs détaillés',
    },

    admin: {
      access: true,
      segments: ['all'],
      rights: {
        read: true,
        write: true,
        delete: true,
        export: true,
        share: true,
        schedule: true,
      },
      visibleData: {
        default: {
          widgets: ['all'],
          maxHistory: 'unlimited',
          realTime: true,
          autoRefresh: 30,
          maxCompanies: 'unlimited',
        },
      },
      filters: {
        ownDataOnly: false,
        hideSensitive: [],
        dateRange: 'unlimited',
        includeSystemLogs: true,
      },
      description: 'Accès complet, tous les logs',
    },

    'utilisateur-standard': {
      access: false,
      segments: [],
      rights: {
        read: false,
        write: false,
        delete: false,
        export: false,
        share: false,
        schedule: false,
      },
      visibleData: {},
      filters: {},
      description: 'Accès refusé par défaut',
    },
  },

  // ============================================
  // 2️⃣ MODULE: COMPTABILITÉ GÉNÉRALE (GL)
  // ============================================
  comptabilite: {
    name: 'Comptabilité Générale',
    icon: 'DocumentTextIcon',
    route: '/comptabilite',

    'comptable-junior': {
      access: true,
      segments: ['micro', 'small'],
      rights: {
        read: true,
        write: true,
        delete: false,
        export: false,
        share: false,
        modify: 'own-entries', // Seulement ses propres écritures
      },
      visibleData: {
        micro: {
          accounts: 'all', // Tous les comptes visibles
          entries: 'simple', // Écritures simples uniquement
          maxAmount: null,
          journal: ['purchases', 'sales', 'cash'],
          canCreateJournal: false,
        },
        small: {
          accounts: 'all',
          entries: 'all',
          maxAmount: null,
          journal: 'all',
          canCreateJournal: false,
        },
      },
      filters: {
        dateRange: 'current-month',
        ownEntriesOnly: true,
        requireApproval: 'manager',
      },
      description: 'Saisie comptable supervisée',
    },

    comptable: {
      access: true,
      segments: ['small', 'medium'],
      rights: {
        read: true,
        write: true,
        delete: false,
        export: true,
        share: true,
        modify: 'all-entries',
      },
      visibleData: {
        small: {
          accounts: 'all',
          entries: 'all',
          maxAmount: null,
          journal: 'all',
          canCreateJournal: true,
          canModifyClosedPeriods: false,
        },
        medium: {
          accounts: 'all',
          entries: 'all',
          maxAmount: null,
          journal: 'all',
          canCreateJournal: true,
          canModifyClosedPeriods: false,
          analyticalAccounts: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        ownEntriesOnly: false,
        requireApproval: false,
      },
      description: 'Comptabilité complète, pas de modification passée',
    },

    'comptable-senior': {
      access: true,
      segments: ['medium', 'large', 'enterprise'],
      rights: {
        read: true,
        write: true,
        delete: true,
        export: true,
        share: true,
        modify: 'all-entries',
        approve: true,
      },
      visibleData: {
        medium: {
          accounts: 'all',
          entries: 'all',
          maxAmount: null,
          journal: 'all',
          canCreateJournal: true,
          canModifyClosedPeriods: true,
          analyticalAccounts: true,
          consolidatedView: false,
        },
        large: {
          accounts: 'all',
          entries: 'all',
          maxAmount: null,
          journal: 'all',
          canCreateJournal: true,
          canModifyClosedPeriods: true,
          analyticalAccounts: true,
          consolidatedView: true,
          multiCompanyView: true,
        },
        enterprise: {
          accounts: 'all',
          entries: 'all',
          maxAmount: null,
          journal: 'all',
          canCreateJournal: true,
          canModifyClosedPeriods: true,
          analyticalAccounts: true,
          consolidatedView: true,
          multiCompanyView: true,
          dimensionAnalysis: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        ownEntriesOnly: false,
        requireApproval: false,
      },
      description: 'Expert comptable, droits complets',
    },

    manager: {
      access: true,
      segments: ['all'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: true,
        share: false,
        approve: false,
      },
      visibleData: {
        default: {
          accounts: 'summary',
          entries: 'read-only',
          maxAmount: null,
          journal: 'high-level',
          canCreateJournal: false,
        },
      },
      filters: {
        dateRange: 'unlimited',
        ownEntriesOnly: false,
        hideDetail: true,
      },
      description: 'Lecture seule, vue stratégique',
    },

    auditeur: {
      access: true,
      segments: ['large', 'enterprise'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: true,
        share: false,
        audit: true,
      },
      visibleData: {
        large: {
          accounts: 'all',
          entries: 'all',
          maxAmount: null,
          journal: 'all',
          auditTrail: true,
          fullHistory: true,
        },
        enterprise: {
          accounts: 'all',
          entries: 'all',
          maxAmount: null,
          journal: 'all',
          auditTrail: true,
          fullHistory: true,
          multiCompanyAudit: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        ownEntriesOnly: false,
        auditMode: true,
      },
      description: 'Audit complet avec historique',
    },

    admin: {
      access: true,
      segments: ['all'],
      rights: {
        read: true,
        write: true,
        delete: true,
        export: true,
        share: true,
        approve: true,
        audit: true,
        systemConfig: true,
      },
      visibleData: {
        default: {
          accounts: 'all',
          entries: 'all',
          maxAmount: null,
          journal: 'all',
          canCreateJournal: true,
          canModifyClosedPeriods: true,
          fullSystemAccess: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        ownEntriesOnly: false,
        noRestrictions: true,
      },
      description: 'Accès complet système',
    },
  },

  // ============================================
  // 3️⃣ MODULE: FACTURATION & VENTES
  // ============================================
  facturation: {
    name: 'Facturation & Ventes',
    icon: 'DocumentDuplicateIcon',
    route: '/factures',

    'comptable-junior': {
      access: true,
      segments: ['micro', 'small'],
      rights: {
        read: true,
        write: true,
        delete: false,
        export: false,
        share: false,
        approve: false,
      },
      visibleData: {
        micro: {
          invoices: 'simple',
          maxInvoiceAmount: null,
          canCreate: true,
          canSend: false,
          canCancel: false,
          visibility: 'draft-only',
        },
        small: {
          invoices: 'all',
          maxInvoiceAmount: null,
          canCreate: true,
          canSend: false,
          canCancel: false,
          visibility: 'all',
        },
      },
      filters: {
        dateRange: 'current-quarter',
        ownSalesOnly: false,
      },
      description: 'Saisie facturation supervisée',
    },

    comptable: {
      access: true,
      segments: ['small', 'medium'],
      rights: {
        read: true,
        write: true,
        delete: false,
        export: true,
        share: true,
        approve: false,
      },
      visibleData: {
        small: {
          invoices: 'all',
          maxInvoiceAmount: null,
          canCreate: true,
          canSend: true,
          canCancel: false,
          visibility: 'all',
          creditNotes: true,
        },
        medium: {
          invoices: 'all',
          maxInvoiceAmount: null,
          canCreate: true,
          canSend: true,
          canCancel: false,
          visibility: 'all',
          creditNotes: true,
          templates: true,
          recurring: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        ownSalesOnly: false,
      },
      description: 'Facturation complète, pas d\'annulation',
    },

    'comptable-senior': {
      access: true,
      segments: ['medium', 'large', 'enterprise'],
      rights: {
        read: true,
        write: true,
        delete: true,
        export: true,
        share: true,
        approve: true,
      },
      visibleData: {
        medium: {
          invoices: 'all',
          maxInvoiceAmount: null,
          canCreate: true,
          canSend: true,
          canCancel: true,
          visibility: 'all',
          creditNotes: true,
          templates: true,
          recurring: true,
          multiCurrency: false,
        },
        large: {
          invoices: 'all',
          maxInvoiceAmount: null,
          canCreate: true,
          canSend: true,
          canCancel: true,
          visibility: 'all',
          creditNotes: true,
          templates: true,
          recurring: true,
          multiCurrency: true,
          multiCompany: true,
          batchOperations: true,
        },
        enterprise: {
          invoices: 'all',
          maxInvoiceAmount: null,
          canCreate: true,
          canSend: true,
          canCancel: true,
          visibility: 'all',
          creditNotes: true,
          templates: true,
          recurring: true,
          multiCurrency: true,
          multiCompany: true,
          batchOperations: true,
          automatedWorkflows: true,
          electronicInvoicing: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        ownSalesOnly: false,
      },
      description: 'Gestion complète facturation',
    },

    manager: {
      access: true,
      segments: ['all'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: true,
        share: false,
        approve: false,
      },
      visibleData: {
        default: {
          invoices: 'summary',
          maxInvoiceAmount: null,
          canCreate: false,
          visibility: 'summary-only',
          analytics: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        ownSalesOnly: false,
      },
      description: 'Lecture seule, analytics',
    },

    auditeur: {
      access: true,
      segments: ['large', 'enterprise'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: true,
        share: false,
        audit: true,
      },
      visibleData: {
        large: {
          invoices: 'all',
          visibility: 'all',
          auditTrail: true,
          fullHistory: true,
        },
        enterprise: {
          invoices: 'all',
          visibility: 'all',
          auditTrail: true,
          fullHistory: true,
          multiCompanyAudit: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        auditMode: true,
      },
      description: 'Audit facturation complète',
    },

    admin: {
      access: true,
      segments: ['all'],
      rights: {
        read: true,
        write: true,
        delete: true,
        export: true,
        share: true,
        approve: true,
        audit: true,
        systemConfig: true,
      },
      visibleData: {
        default: {
          invoices: 'all',
          visibility: 'all',
          fullSystemAccess: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        noRestrictions: true,
      },
      description: 'Accès complet système',
    },
  },

  // ============================================
  // 4️⃣ MODULE: TRÉSORERIE
  // ============================================
  tresorerie: {
    name: 'Gestion de Trésorerie',
    icon: 'BanknotesIcon',
    route: '/tresorerie',

    'comptable-junior': {
      access: true,
      segments: ['micro', 'small'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: false,
        reconcile: false,
      },
      visibleData: {
        micro: {
          accounts: 1,
          transactions: 'read-only',
          forecast: false,
          reconciliation: false,
          visibility: 'basic',
        },
        small: {
          accounts: 2,
          transactions: 'read-only',
          forecast: false,
          reconciliation: false,
          visibility: 'standard',
        },
      },
      filters: {
        dateRange: 'current-month',
        hideTransfers: true,
      },
      description: 'Visualisation basique trésorerie',
    },

    comptable: {
      access: true,
      segments: ['small', 'medium'],
      rights: {
        read: true,
        write: true,
        delete: false,
        export: true,
        reconcile: true,
      },
      visibleData: {
        small: {
          accounts: 'all',
          transactions: 'all',
          forecast: 'simple',
          reconciliation: true,
          visibility: 'complete',
          paymentOrders: true,
        },
        medium: {
          accounts: 'all',
          transactions: 'all',
          forecast: 'advanced',
          reconciliation: true,
          visibility: 'complete',
          paymentOrders: true,
          liquidityPlanning: true,
          riskAnalysis: false,
        },
      },
      filters: {
        dateRange: 'unlimited',
        hideTransfers: false,
      },
      description: 'Gestion complète trésorerie',
    },

    'comptable-senior': {
      access: true,
      segments: ['medium', 'large', 'enterprise'],
      rights: {
        read: true,
        write: true,
        delete: true,
        export: true,
        reconcile: true,
        approve: true,
      },
      visibleData: {
        medium: {
          accounts: 'all',
          transactions: 'all',
          forecast: 'advanced',
          reconciliation: true,
          visibility: 'complete',
          paymentOrders: true,
          liquidityPlanning: true,
          riskAnalysis: true,
          multiCurrency: false,
        },
        large: {
          accounts: 'all',
          transactions: 'all',
          forecast: 'advanced',
          reconciliation: true,
          visibility: 'complete',
          paymentOrders: true,
          liquidityPlanning: true,
          riskAnalysis: true,
          multiCurrency: true,
          multiCompany: true,
          hedging: true,
        },
        enterprise: {
          accounts: 'all',
          transactions: 'all',
          forecast: 'advanced',
          reconciliation: true,
          visibility: 'complete',
          paymentOrders: true,
          liquidityPlanning: true,
          riskAnalysis: true,
          multiCurrency: true,
          multiCompany: true,
          hedging: true,
          optimizationStrategies: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        hideTransfers: false,
      },
      description: 'Trésorerie stratégique expert',
    },

    manager: {
      access: true,
      segments: ['all'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: true,
        reconcile: false,
      },
      visibleData: {
        default: {
          accounts: 'summary',
          transactions: 'summary',
          forecast: 'executive-summary',
          reconciliation: false,
          visibility: 'summary-only',
          alerts: true,
          riskFlags: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
      },
      description: 'Dashboard exécutif trésorerie',
    },

    auditeur: {
      access: true,
      segments: ['large', 'enterprise'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: true,
        reconcile: false,
        audit: true,
      },
      visibleData: {
        large: {
          accounts: 'all',
          transactions: 'all',
          reconciliation: 'read-only',
          auditTrail: true,
          fullHistory: true,
        },
        enterprise: {
          accounts: 'all',
          transactions: 'all',
          reconciliation: 'read-only',
          auditTrail: true,
          fullHistory: true,
          multiCompanyAudit: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        auditMode: true,
      },
      description: 'Audit complet trésorerie',
    },

    admin: {
      access: true,
      segments: ['all'],
      rights: {
        read: true,
        write: true,
        delete: true,
        export: true,
        reconcile: true,
        approve: true,
        audit: true,
        systemConfig: true,
      },
      visibleData: {
        default: {
          accounts: 'all',
          transactions: 'all',
          forecast: 'all',
          reconciliation: true,
          visibility: 'all',
          fullSystemAccess: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        noRestrictions: true,
      },
      description: 'Accès complet système',
    },
  },

  // ============================================
  // 5️⃣ MODULE: PAIE & RESSOURCES HUMAINES
  // ============================================
  paie: {
    name: 'Paie & RH',
    icon: 'UserGroupIcon',
    route: '/paie',

    'comptable-junior': {
      access: false,
      segments: [],
      rights: { read: false, write: false, delete: false, export: false },
      visibleData: {},
      filters: {},
      description: 'Accès refusé',
    },

    comptable: {
      access: true,
      segments: ['small', 'medium'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: true,
        approve: false,
      },
      visibleData: {
        small: {
          employees: 'read-only',
          payroll: 'summary',
          visibility: 'aggregated',
          hideSalaries: true,
        },
        medium: {
          employees: 'read-only',
          payroll: 'detailed',
          visibility: 'department',
          hideSalaries: false, // Peut voir les salaires pour comptabilité
          deductions: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        ownDepartmentOnly: false,
      },
      description: 'Paie comptable (sans gestion)',
    },

    'comptable-senior': {
      access: true,
      segments: ['medium', 'large', 'enterprise'],
      rights: {
        read: true,
        write: true,
        delete: false,
        export: true,
        approve: true,
      },
      visibleData: {
        medium: {
          employees: 'all',
          payroll: 'all',
          visibility: 'complete',
          hideSalaries: false,
          deductions: true,
          bonuses: true,
          taxes: true,
          canModifyRates: false,
        },
        large: {
          employees: 'all',
          payroll: 'all',
          visibility: 'complete',
          hideSalaries: false,
          deductions: true,
          bonuses: true,
          taxes: true,
          canModifyRates: true,
          multiCompany: true,
          batchProcessing: true,
        },
        enterprise: {
          employees: 'all',
          payroll: 'all',
          visibility: 'complete',
          hideSalaries: false,
          deductions: true,
          bonuses: true,
          taxes: true,
          canModifyRates: true,
          multiCompany: true,
          batchProcessing: true,
          advancedReporting: true,
          automatedPayrollRuns: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        ownDepartmentOnly: false,
      },
      description: 'Gestion complète paie',
    },

    manager: {
      access: true,
      segments: ['all'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: false,
        approve: false,
      },
      visibleData: {
        default: {
          employees: 'team-only',
          payroll: 'summary',
          visibility: 'team',
          hideSalaries: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        ownTeamOnly: true,
      },
      description: 'Gestion équipe seulement',
    },

    auditeur: {
      access: true,
      segments: ['large', 'enterprise'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: true,
        audit: true,
      },
      visibleData: {
        large: {
          employees: 'all',
          payroll: 'all',
          visibility: 'complete',
          auditTrail: true,
          fullHistory: true,
        },
        enterprise: {
          employees: 'all',
          payroll: 'all',
          visibility: 'complete',
          auditTrail: true,
          fullHistory: true,
          multiCompanyAudit: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        auditMode: true,
      },
      description: 'Audit complet paie',
    },

    admin: {
      access: true,
      segments: ['all'],
      rights: {
        read: true,
        write: true,
        delete: true,
        export: true,
        approve: true,
        audit: true,
        systemConfig: true,
      },
      visibleData: {
        default: {
          employees: 'all',
          payroll: 'all',
          visibility: 'all',
          fullSystemAccess: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        noRestrictions: true,
      },
      description: 'Accès complet système',
    },
  },

  // ============================================
  // 6️⃣ MODULE: FISCALITÉ & DÉCLARATIONS
  // ============================================
  fiscalite: {
    name: 'Fiscalité & Déclarations',
    icon: 'DocumentCheckIcon',
    route: '/fiscalite',

    'comptable-junior': {
      access: true,
      segments: ['micro'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: true,
      },
      visibleData: {
        micro: {
          declarations: ['irg', 'taxe-commerce', 'tva-simplified'],
          forms: 'basic',
          visibility: 'read-only',
          canCreate: false,
          canSubmit: false,
        },
      },
      filters: {
        dateRange: 'last-12-months',
      },
      description: 'Lecture seule des déclarations fiscales pour micro-entreprises',
    },

    comptable: {
      access: true,
      segments: ['micro', 'small', 'medium'],
      rights: {
        read: true,
        write: true,
        delete: false,
        export: true,
        approve: false,
      },
      visibleData: {
        micro: {
          declarations: ['irg', 'taxe-commerce', 'tva-simplified'],
          forms: 'basic',
          visibility: 'standard',
          canCreate: true,
          canSubmit: false,
        },
        small: {
          declarations: ['irg', 'taxe-commerce', 'tva-simplified'],
          forms: 'basic',
          visibility: 'standard',
          canCreate: true,
          canSubmit: false,
        },
        medium: {
          declarations: ['irg', 'taxe-commerce', 'tva', 'corporate-tax'],
          forms: 'all',
          visibility: 'complete',
          canCreate: true,
          canSubmit: false,
          revisions: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
      },
      description: 'Préparation déclarations fiscales',
    },

    'comptable-senior': {
      access: true,
      segments: ['medium', 'large', 'enterprise'],
      rights: {
        read: true,
        write: true,
        delete: true,
        export: true,
        approve: true,
        submit: true,
      },
      visibleData: {
        medium: {
          declarations: 'all',
          forms: 'all',
          visibility: 'complete',
          canCreate: true,
          canSubmit: true,
          revisions: true,
          amendments: false,
          multiCompany: false,
        },
        large: {
          declarations: 'all',
          forms: 'all',
          visibility: 'complete',
          canCreate: true,
          canSubmit: true,
          revisions: true,
          amendments: true,
          multiCompany: true,
          consolidatedReporting: true,
        },
        enterprise: {
          declarations: 'all',
          forms: 'all',
          visibility: 'complete',
          canCreate: true,
          canSubmit: true,
          revisions: true,
          amendments: true,
          multiCompany: true,
          consolidatedReporting: true,
          automatedFilings: true,
          advancedPlanning: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
      },
      description: 'Gestion complète fiscalité',
    },

    manager: {
      access: true,
      segments: ['all'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: true,
        approve: false,
      },
      visibleData: {
        default: {
          declarations: 'summary',
          forms: 'summary',
          visibility: 'summary-only',
          status: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
      },
      description: 'Suivi déclarations (lecture)',
    },

    auditeur: {
      access: true,
      segments: ['large', 'enterprise'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: true,
        audit: true,
      },
      visibleData: {
        large: {
          declarations: 'all',
          forms: 'all',
          auditTrail: true,
          fullHistory: true,
          compliance: true,
        },
        enterprise: {
          declarations: 'all',
          forms: 'all',
          auditTrail: true,
          fullHistory: true,
          compliance: true,
          multiCompanyAudit: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        auditMode: true,
      },
      description: 'Audit complet fiscalité',
    },

    admin: {
      access: true,
      segments: ['all'],
      rights: {
        read: true,
        write: true,
        delete: true,
        export: true,
        approve: true,
        submit: true,
        audit: true,
        systemConfig: true,
      },
      visibleData: {
        default: {
          declarations: 'all',
          forms: 'all',
          visibility: 'all',
          fullSystemAccess: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        noRestrictions: true,
      },
      description: 'Accès complet système',
    },
  },

  // ============================================
  // 7️⃣ MODULE: STOCKS & INVENTAIRE
  // ============================================
  inventaire: {
    name: 'Stocks & Inventaire',
    icon: 'CubeIcon',
    route: '/inventaire',

    'comptable-junior': {
      access: false,
      segments: [],
      rights: { read: false, write: false, delete: false, export: false },
      visibleData: {},
      filters: {},
      description: 'Accès refusé',
    },

    comptable: {
      access: true,
      segments: ['small', 'medium'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: true,
        approve: false,
      },
      visibleData: {
        small: {
          inventory: 'read-only',
          articles: 'summary',
          movements: 'read-only',
          valuation: 'simple',
          canAdjust: false,
        },
        medium: {
          inventory: 'read-only',
          articles: 'detailed',
          movements: 'all',
          valuation: 'detailed',
          canAdjust: false,
          analytics: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
      },
      description: 'Suivi inventaire (lecture)',
    },

    'comptable-senior': {
      access: true,
      segments: ['medium', 'large', 'enterprise'],
      rights: {
        read: true,
        write: true,
        delete: false,
        export: true,
        approve: true,
      },
      visibleData: {
        medium: {
          inventory: 'all',
          articles: 'all',
          movements: 'all',
          valuation: 'all',
          canAdjust: true,
          costAnalysis: true,
          multiLocation: false,
        },
        large: {
          inventory: 'all',
          articles: 'all',
          movements: 'all',
          valuation: 'all',
          canAdjust: true,
          costAnalysis: true,
          multiLocation: true,
          batchOperations: true,
          forecasting: true,
        },
        enterprise: {
          inventory: 'all',
          articles: 'all',
          movements: 'all',
          valuation: 'all',
          canAdjust: true,
          costAnalysis: true,
          multiLocation: true,
          batchOperations: true,
          forecasting: true,
          advancedReporting: true,
          automation: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
      },
      description: 'Gestion complète inventaire',
    },

    manager: {
      access: true,
      segments: ['all'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: true,
        approve: false,
      },
      visibleData: {
        default: {
          inventory: 'summary',
          articles: 'summary',
          movements: 'summary',
          valuation: 'summary',
          analytics: true,
          alerts: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
      },
      description: 'Dashboard inventaire (lecture)',
    },

    auditeur: {
      access: true,
      segments: ['large', 'enterprise'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: true,
        audit: true,
      },
      visibleData: {
        large: {
          inventory: 'all',
          articles: 'all',
          movements: 'all',
          auditTrail: true,
          fullHistory: true,
        },
        enterprise: {
          inventory: 'all',
          articles: 'all',
          movements: 'all',
          auditTrail: true,
          fullHistory: true,
          multiLocationAudit: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        auditMode: true,
      },
      description: 'Audit complet inventaire',
    },

    admin: {
      access: true,
      segments: ['all'],
      rights: {
        read: true,
        write: true,
        delete: true,
        export: true,
        approve: true,
        audit: true,
        systemConfig: true,
      },
      visibleData: {
        default: {
          inventory: 'all',
          articles: 'all',
          movements: 'all',
          visibility: 'all',
          fullSystemAccess: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        noRestrictions: true,
      },
      description: 'Accès complet système',
    },
  },

  // ============================================
  // 8️⃣ MODULE: GESTION ACCÈS & AUDIT
  // ============================================
  'gestion-acces': {
    name: 'Gestion d\'Accès & Audit',
    icon: 'LockClosedIcon',
    route: '/gestion-acces',

    'comptable-junior': {
      access: false,
      segments: [],
      rights: { read: false, write: false, delete: false, export: false },
      visibleData: {},
      filters: {},
      description: 'Accès refusé',
    },

    comptable: {
      access: false,
      segments: [],
      rights: { read: false, write: false, delete: false, export: false },
      visibleData: {},
      filters: {},
      description: 'Accès refusé',
    },

    'comptable-senior': {
      access: false,
      segments: [],
      rights: { read: false, write: false, delete: false, export: false },
      visibleData: {},
      filters: {},
      description: 'Accès refusé',
    },

    manager: {
      access: false,
      segments: [],
      rights: { read: false, write: false, delete: false, export: false },
      visibleData: {},
      filters: {},
      description: 'Accès refusé',
    },

    auditeur: {
      access: true,
      segments: ['large', 'enterprise'],
      rights: {
        read: true,
        write: false,
        delete: false,
        export: true,
        audit: true,
      },
      visibleData: {
        large: {
          users: 'all',
          roles: 'all',
          permissions: 'all',
          activityLogs: true,
          accessTrail: true,
        },
        enterprise: {
          users: 'all',
          roles: 'all',
          permissions: 'all',
          activityLogs: true,
          accessTrail: true,
          multiCompanyAudit: true,
          complianceReports: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        auditMode: true,
      },
      description: 'Audit accès et utilisateurs',
    },

    admin: {
      access: true,
      segments: ['all'],
      rights: {
        read: true,
        write: true,
        delete: true,
        export: true,
        approve: true,
        audit: true,
        systemConfig: true,
      },
      visibleData: {
        default: {
          users: 'all',
          roles: 'all',
          permissions: 'all',
          activityLogs: 'all',
          accessTrail: 'all',
          fullSystemAccess: true,
        },
      },
      filters: {
        dateRange: 'unlimited',
        noRestrictions: true,
      },
      description: 'Accès complet système',
    },
  },
};

// ============================================
// RÉSUMÉ RAPIDE PAR RÔLE
// ============================================
export const ROLE_SUMMARY = {
  'comptable-junior': {
    name: 'Comptable Junior',
    segments: ['micro', 'small'],
    mainModules: ['dashboard', 'comptabilite', 'facturation'],
    restrictedModules: ['paie', 'fiscalite', 'inventaire', 'gestion-acces'],
    maxCompanies: 1,
    requiresApproval: ['comptabilite-entries', 'big-transactions'],
    description: 'Assistant comptable supervisé, accès limité',
  },

  comptable: {
    name: 'Comptable Professionnel',
    segments: ['small', 'medium'],
    mainModules: ['dashboard', 'comptabilite', 'facturation', 'tresorerie'],
    restrictedModules: ['paie', 'gestion-acces'],
    maxCompanies: 1,
    requiresApproval: [],
    description: 'Comptable responsable, accès complet son entité',
  },

  'comptable-senior': {
    name: 'Comptable Senior / Expert',
    segments: ['medium', 'large', 'enterprise'],
    mainModules: ['all-except-gestion-acces'],
    restrictedModules: [],
    maxCompanies: 'unlimited',
    requiresApproval: [],
    description: 'Expert comptable, droits complets tous modules',
  },

  manager: {
    name: 'Manager / Directeur',
    segments: ['all'],
    mainModules: ['dashboard', 'tresorerie', 'fiscalite'],
    restrictedModules: ['comptabilite-details', 'paie-details'],
    maxCompanies: 'unlimited',
    requiresApproval: ['major-decisions'],
    description: 'Exécutif, vues stratégiques et résumés',
  },

  auditeur: {
    name: 'Auditeur Interne/Externe',
    segments: ['large', 'enterprise'],
    mainModules: ['all-modules-read-only', 'gestion-acces'],
    restrictedModules: [],
    maxCompanies: 'unlimited',
    auditMode: true,
    description: 'Audit complet, lecture seule, logs détaillés',
  },

  admin: {
    name: 'Administrateur Système',
    segments: ['all'],
    mainModules: ['all'],
    restrictedModules: [],
    maxCompanies: 'unlimited',
    fullAccess: true,
    description: 'Accès système complet, gestion configurations',
  },
};
