import { useMemo } from 'react';
import { useApp } from '@core/context/AppContext';
import { PermissionManager } from '@shared/utils/PermissionManager';

export function usePermission() {
  const { user } = useApp();

  const effectivePermissions = useMemo(() => {
    if (!user) return new Set<string>();
    // Use loose access to avoid type drift if User interface evolves
    const u: any = user as any;
    const rolePerms = u.role && u.companyType && u.accessLevel
      ? PermissionManager.getUserPermissions(u.role, u.companyType, u.accessLevel)
      : [];
    const custom = Array.isArray(user.permissions) ? user.permissions : [];
    return new Set<string>([...rolePerms, ...custom]);
  }, [user]);

  const has = (permissionId: string) => effectivePermissions.has(permissionId);

  return {
    user,
    has,
    permissions: effectivePermissions,
  };
}

