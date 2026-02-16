import { RoleDataNeeds } from '@/types/security';

export const ROLE_DATA_NEEDS: RoleDataNeeds[] = [
  {
    roleId: 'comptable-junior',
    baseNeeds: ['kpi-core','finance-ratios','sales-core','ar-ap','gl-core','chart-of-accounts','journaux','tax-core'],
    bySegment: {
      micro: [],
      small: ['inventory-core'],
      medium: ['inventory-core','cogs'],
      large: ['inventory-core','cogs','hr-payroll'],
      enterprise: ['inventory-core','cogs','hr-payroll','audit-logs']
    }
  },
  {
    roleId: 'comptable',
    baseNeeds: ['kpi-core','finance-ratios','sales-core','ar-ap','gl-core','chart-of-accounts','journaux','tax-core','g50','ibs','tap'],
    bySegment: {
      micro: ['inventory-core'],
      small: ['inventory-core'],
      medium: ['inventory-core','cogs'],
      large: ['inventory-core','cogs','hr-payroll'],
      enterprise: ['inventory-core','cogs','hr-payroll','audit-logs']
    }
  },
  {
    roleId: 'comptable-senior',
    baseNeeds: ['kpi-core','finance-ratios','sales-core','ar-ap','gl-core','chart-of-accounts','journaux','tax-core','g50','ibs','tap','hr-payroll'],
    bySegment: {
      micro: ['inventory-core'],
      small: ['inventory-core','cogs'],
      medium: ['inventory-core','cogs'],
      large: ['inventory-core','cogs','audit-logs'],
      enterprise: ['inventory-core','cogs','audit-logs']
    }
  },
  {
    roleId: 'manager',
    baseNeeds: ['kpi-core','finance-ratios','sales-core','ar-ap','tax-core'],
  },
  {
    roleId: 'auditeur',
    baseNeeds: ['kpi-core','finance-ratios','ar-ap','gl-core','journaux','audit-logs']
  }
];


