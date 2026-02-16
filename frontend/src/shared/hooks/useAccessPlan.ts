import { useMemo } from 'react';
import { useApp } from '@core/context/AppContext';
import { usePermission } from './usePermission';
import { planAccess, summarizeAccess, AccessPlan } from '../security/accessPlanner';

export function useAccessPlan(): { plan: AccessPlan; summary: ReturnType<typeof summarizeAccess> } {
  const { user, companyData } = useApp();
  const { permissions } = usePermission();

  const plan = useMemo(() => {
    return planAccess({
      user: user ? {
        role: user.role,
        permissions: Array.from(permissions),
        companyType: user.companyType,
        accessLevel: user.accessLevel,
        segment: (user.segment as any) || 'micro'
      } : null,
      companyData: companyData as any
    });
  }, [user, companyData, permissions]);

  const summary = useMemo(() => summarizeAccess(plan), [plan]);
  return { plan, summary };
}

