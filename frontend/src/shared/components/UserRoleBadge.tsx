import React from 'react';
import { usePermission } from '../hooks/usePermission';
import { PermissionManager } from '../utils/PermissionManager';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export interface UserRoleBadgeProps {
  compact?: boolean;
  showIcon?: boolean;
  className?: string;
}

/**
 * Composant pour afficher le rôle de l'utilisateur
 * Affiche le rôle avec une couleur et icône adaptée
 */
export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({
  compact = false,
  showIcon = true,
  className = ''
}) => {
  const { user } = usePermission();

  if (!user) return null;

  const userRole = (user as any)?.role;
  if (!userRole) return null;

  const roleInfo = PermissionManager.getRoleInfo(userRole);
  if (!roleInfo) return null;

  // Couleurs selon le rôle
  const getRoleColors = (roleId: string) => {
    switch (roleId) {
      case 'admin':
        return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' };
      case 'comptable-senior':
        return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' };
      case 'comptable':
        return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' };
      case 'comptable-junior':
        return { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' };
      case 'manager':
        return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' };
      case 'auditeur':
        return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' };
      case 'vendeur':
        return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' };
    }
  };

  const colors = getRoleColors(userRole);

  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full border ${colors.bg} ${colors.border} ${className}`}>
        {showIcon && <UserCircleIcon className={`w-4 h-4 ${colors.text}`} />}
        <span className={`text-xs font-semibold ${colors.text}`}>
          {roleInfo.name.substring(0, 3).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg border ${colors.bg} ${colors.border} ${className}`}>
      {showIcon && <UserCircleIcon className={`w-5 h-5 ${colors.text}`} />}
      <div>
        <p className={`text-sm font-semibold ${colors.text}`}>
          {roleInfo.name}
        </p>
        <p className={`text-xs opacity-75 ${colors.text}`}>
          {roleInfo.description}
        </p>
      </div>
    </div>
  );
};

/**
 * Composant pour afficher l'information utilisateur et rôle dans le header
 */
export const UserProfileHeader: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { user } = usePermission();

  if (!user) return null;

  const userName = (user as any)?.name || (user as any)?.email || 'Utilisateur';
  const userRole = (user as any)?.role;

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-900">{userName}</p>
        </div>
        {userRole && <UserRoleBadge compact showIcon={false} />}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <p className="text-sm font-semibold text-slate-900">{userName}</p>
        <p className="text-xs text-slate-500">{(user as any)?.email}</p>
      </div>
      {userRole && <UserRoleBadge showIcon />}
    </div>
  );
};
