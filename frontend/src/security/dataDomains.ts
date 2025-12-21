import { DataDomainDef } from '../types/security';

export const DATA_DOMAINS: DataDomainDef[] = [
  { id: 'kpi-core', name: 'Indicateurs clés', fields: ['revenueMonth','profitMargin','cashBalance'] },
  { id: 'finance-ratios', name: 'Ratios financiers', fields: ['accountsReceivable','accountsPayable','inventoryValue','stockTurnover'] },
  { id: 'sales-core', name: 'Ventes / Facturation', fields: ['invoicesCount','averageInvoice'] },
  { id: 'ar-ap', name: 'Créances & Dettes', fields: ['accountsReceivable','accountsPayable'] },
  { id: 'gl-core', name: 'Grand Livre', fields: ['journalCount','entriesCount'] },
  { id: 'chart-of-accounts', name: 'Plan Comptable', fields: ['planComptable'] },
  { id: 'journaux', name: 'Journaux Comptables', fields: ['journaux'] },
  { id: 'inventory-core', name: 'Stocks', fields: ['inventoryValue','stockTurnover'] },
  { id: 'cogs', name: 'Coût des ventes', fields: ['cogsMonth'] },
  { id: 'hr-payroll', name: 'Ressources humaines / Paie', fields: ['employees','payrollMonth'] },
  { id: 'tax-core', name: 'Données fiscales', fields: ['tvaCollectee','tvaDeductible','tvaAVerser'] },
  { id: 'g50', name: 'Déclarations G50', fields: ['g50Declarations'] },
  { id: 'ibs', name: 'Impôt sur les bénéfices (IBS)', fields: ['ibsEstimate'] },
  { id: 'tap', name: 'Taxe TAP', fields: ['tapEstimate'] },
  { id: 'audit-logs', name: 'Logs d’audit', fields: ['auditLog'] },
  { id: 'users-core', name: 'Utilisateurs', fields: ['users'] }
];
