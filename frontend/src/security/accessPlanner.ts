import { MODULES } from './modules';
import { DATA_DOMAINS } from './dataDomains';
import { ROLE_DATA_NEEDS } from './roleDataNeeds';
import { Segment, ModuleDef, DataDomainDef } from '@/types/security';
import { PermissionManager } from '@shared/utils/PermissionManager';

// Ordered list for segment comparison
const SEGMENT_ORDER: Segment[] = ['micro','small','medium','large','enterprise'];
const segmentRank = (s: Segment | undefined): number => SEGMENT_ORDER.indexOf(s || 'micro');

export interface AccessPlannerInput {
  user: {
    role?: string;
    permissions?: string[]; // custom extra permissions
    companyType?: string;
    accessLevel?: string;
    segment?: Segment;
    employees?: number;
    revenue?: number;
  } | null;
  companyData: Record<string, any> | null;
}

export interface BlockedModuleInfo {
  module: ModuleDef;
  reason: 'missing-permission' | 'segment-too-small' | 'company-type-mismatch';
  details?: string;
}

export interface MissingDomainFields {
  domain: DataDomainDef;
  missingFields: string[];
  presentFields: string[];
}

export interface AccessPlan {
  roleId: string | null;
  segment: Segment;
  companyType: string | null;
  accessLevel: string | null;
  permissionsEffective: string[];
  modulesAllowed: ModuleDef[];
  modulesBlocked: BlockedModuleInfo[];
  dataDomainsNeeded: DataDomainDef[];
  missingData: MissingDomainFields[];
  recommendations: string[];
  recommendedRoleAdjustments?: string[]; // potential role suggestions
}

function collectEffectivePermissions(input: AccessPlannerInput): string[] {
  if (!input.user) return [];
  const { role, companyType, accessLevel } = input.user;
  let rolePerms: string[] = [];
  if (role && companyType && accessLevel) {
    rolePerms = PermissionManager.getUserPermissions(role, companyType, accessLevel);
  }
  const custom = Array.isArray(input.user.permissions) ? input.user.permissions : [];
  return Array.from(new Set([...rolePerms, ...custom]));
}

export function planAccess(input: AccessPlannerInput): AccessPlan {
  const segment: Segment = (input.user?.segment as Segment) || 'micro';
  const companyType = input.user?.companyType || null;
  const accessLevel = input.user?.accessLevel || null;
  const roleId = input.user?.role || null;
  const permissionsEffective = collectEffectivePermissions(input);

  // Determine allowed / blocked modules
  const modulesAllowed: ModuleDef[] = [];
  const modulesBlocked: BlockedModuleInfo[] = [];

  MODULES.forEach(m => {
    // Segment gate
    if (m.minSegment && segmentRank(segment) < segmentRank(m.minSegment)) {
      modulesBlocked.push({ module: m, reason: 'segment-too-small', details: `Segment actuel ${segment} < requis ${m.minSegment}` });
      return;
    }
    // Company type gate (optional)
    if (m.companyTypes && companyType && !m.companyTypes.includes(companyType)) {
      modulesBlocked.push({ module: m, reason: 'company-type-mismatch', details: `Type ${companyType} non autorisé` });
      return;
    }
    // Permission gate
    if (!permissionsEffective.includes(m.requiredPermission)) {
      modulesBlocked.push({ module: m, reason: 'missing-permission', details: `Permission requise: ${m.requiredPermission}` });
      return;
    }
    modulesAllowed.push(m);
  });

  // Role-based data needs
  const roleNeedsDef = ROLE_DATA_NEEDS.find(r => r.roleId === roleId);
  const roleDomainsIds: string[] = [];
  if (roleNeedsDef) {
    roleDomainsIds.push(...roleNeedsDef.baseNeeds);
    if (roleNeedsDef.bySegment && roleNeedsDef.bySegment[segment]) {
      roleDomainsIds.push(...(roleNeedsDef.bySegment[segment] || []));
    }
  }

  // Module-based data needs
  const moduleDomainIds = modulesAllowed.flatMap(m => m.dataNeeds);

  const neededIds = Array.from(new Set([...roleDomainsIds, ...moduleDomainIds]));
  const dataDomainsNeeded = neededIds.map(id => DATA_DOMAINS.find(d => d.id === id)).filter(Boolean) as DataDomainDef[];

  // Missing data evaluation
  const companyData = input.companyData || {};
  const missingData: MissingDomainFields[] = dataDomainsNeeded.map(domain => {
    const present: string[] = [];
    const missing: string[] = [];
    domain.fields.forEach(f => {
      const v = (companyData as any)[f];
      if (v === undefined || v === null) missing.push(f); else present.push(f);
    });
    return { domain, missingFields: missing, presentFields: present };
  }).filter(d => d.missingFields.length > 0);

  // Recommendations heuristic
  const recommendations: string[] = [];
  if (modulesBlocked.some(b => b.reason === 'segment-too-small')) {
    recommendations.push('Certaines fonctionnalités sont verrouillées par la taille actuelle de l’entreprise. Envisager un upgrade de segment ou justifier un besoin métier.');
  }
  if (modulesBlocked.some(b => b.reason === 'missing-permission')) {
    recommendations.push('Des modules sont cachés faute de permissions. Vérifier le rôle utilisateur ou ajouter des permissions personnalisées.');
  }
  if (missingData.length) {
    recommendations.push('Compléter les données manquantes pour débloquer des ratios et rapports avancés (import ou saisie initiale).');
  }
  if (roleId === 'comptable-junior' && segmentRank(segment) >= segmentRank('medium')) {
    recommendations.push('Segment >= medium : envisager passage à comptable pour gérer la volumétrie.');
  }
  if (roleId === 'comptable' && segmentRank(segment) >= segmentRank('large')) {
    recommendations.push('Segment large : passage à comptable-senior recommandé pour supervision avancée et clôtures.');
  }
  if (roleId === 'utilisateur' && modulesBlocked.filter(b => b.reason === 'missing-permission').length > 3) {
    recommendations.push('Attribuer un rôle plus riche (ex: manager) pour réduire les blocages sur les rapports.');
  }

  // Role adjustment suggestions
  const recommendedRoleAdjustments: string[] = [];
  if (roleId === 'comptable-junior' && segmentRank(segment) >= segmentRank('medium')) {
    recommendedRoleAdjustments.push('comptable');
  }
  if (roleId === 'comptable' && segmentRank(segment) >= segmentRank('large')) {
    recommendedRoleAdjustments.push('comptable-senior');
  }
  if (roleId === 'utilisateur' && permissionsEffective.includes('rapports-advanced')) {
    recommendedRoleAdjustments.push('manager');
  }

  return {
    roleId,
    segment,
    companyType,
    accessLevel,
    permissionsEffective,
    modulesAllowed,
    modulesBlocked,
    dataDomainsNeeded,
    missingData,
    recommendations,
    recommendedRoleAdjustments
  };
}

// Lightweight helper to get a concise summary for navigation rendering
export function summarizeAccess(plan: AccessPlan) {
  return {
    allowedModuleIds: plan.modulesAllowed.map(m => m.id),
    blockedModuleIds: plan.modulesBlocked.map(b => b.module.id),
    missingCritical: plan.missingData.some(d => d.domain.id === 'finance-ratios' || d.domain.id === 'gl-core'),
    upgradeSuggestion: plan.recommendedRoleAdjustments?.[0] || null
  };
}



