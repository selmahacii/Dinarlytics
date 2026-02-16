import { ModuleDef } from '@/types/security';

export const MODULES: ModuleDef[] = [
  { id: 'dashboard', name: 'Tableau de bord', route: '/dashboard', requiredPermission: 'rapports-basic', minSegment: 'micro', dataNeeds: ['kpi-core'] },
  { id: 'analyse', name: 'Analyse financière', route: '/analyse', requiredPermission: 'rapports-advanced', minSegment: 'small', dataNeeds: ['kpi-core','finance-ratios'] },
  { id: 'factures', name: 'Factures', route: '/factures', requiredPermission: 'facturation-read', minSegment: 'micro', dataNeeds: ['sales-core','ar-ap'] },
  { id: 'compta', name: 'Comptabilité', route: '/comptabilite', requiredPermission: 'comptabilite-read', minSegment: 'small', dataNeeds: ['gl-core','chart-of-accounts','journaux'] },
  { id: 'stocks', name: 'Stocks', route: '/inventaire', requiredPermission: 'stocks-read', minSegment: 'small', dataNeeds: ['inventory-core','cogs'] },
  { id: 'paie', name: 'Paie', route: '/paie', requiredPermission: 'paie-read', minSegment: 'medium', dataNeeds: ['hr-payroll'] },
  { id: 'fiscalite', name: 'Fiscalité & Déclarations', route: '/fiscalite', requiredPermission: 'rapports-basic', minSegment: 'micro', dataNeeds: ['tax-core','g50','ibs','tap'] },
  { id: 'audit', name: 'Audit', route: '/audit', requiredPermission: 'audit-read', minSegment: 'large', dataNeeds: ['audit-logs'] },
  { id: 'admin', name: 'Administration', route: '/admin', requiredPermission: 'admin-users', minSegment: 'large', dataNeeds: ['users-core'] }
];


