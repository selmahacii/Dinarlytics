import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermission } from '@shared/hooks/usePermission';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string | string[];
  requiredRole?: string | string[];
  fallback?: React.ReactNode;
  onAccessDenied?: () => void;
}

/**
 * Composant ProtectedRoute
 * Protège une route en vérifiant les permissions de l'utilisateur.
 * 
 * Utilisation:
 * <ProtectedRoute requiredPermission="comptabilite-read">
 *   <ComptabiliteComponent />
 * </ProtectedRoute>
 * 
 * Ou avec plusieurs permissions (ET logique):
 * <ProtectedRoute requiredPermission={['comptabilite-read', 'comptabilite-write']}>
 *   <ComptabiliteComponent />
 * </ProtectedRoute>
 * 
 * Ou avec rôle:
 * <ProtectedRoute requiredRole="admin">
 *   <AdminPanel />
 * </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requiredRole,
  fallback,
  onAccessDenied
}) => {
  const { has, user } = usePermission();

  // Si pas d'utilisateur connecté, rediriger vers login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier les permissions
  if (requiredPermission) {
    const permissions = Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission];

    const hasAllPermissions = permissions.every(perm => has(perm));

    if (!hasAllPermissions) {
      onAccessDenied?.();
      return fallback ? <>{fallback}</> : <AccessDeniedFallback />;
    }
  }

  // Vérifier le rôle
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userRole = (user as any)?.role;

    if (!userRole || !roles.includes(userRole)) {
      onAccessDenied?.();
      return fallback ? <>{fallback}</> : <AccessDeniedFallback />;
    }
  }

  return <>{children}</>;
};

/**
 * Composant par défaut affichant un message d'accès refusé
 */
const AccessDeniedFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="flex justify-center mb-4">
        <ExclamationTriangleIcon className="w-16 h-16 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Accès refusé</h1>
      <p className="text-slate-600 mb-4">
        Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.
      </p>
      <p className="text-sm text-slate-500 mb-6">
        Veuillez contacter votre administrateur si vous pensez que cela est une erreur.
      </p>
      <div className="space-y-3">
        <a
          href="/dashboard"
          className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Retour au tableau de bord
        </a>
        <a
          href="/parametres"
          className="block w-full px-4 py-2 bg-slate-200 text-slate-800 rounded-lg font-medium hover:bg-slate-300 transition-colors"
        >
          Accéder aux paramètres
        </a>
      </div>
    </div>
  </div>
);

/**
 * Hook personnalisé pour vérifier si une permission/rôle est accessible
 * Utile pour afficher/masquer des éléments conditionnellement
 */
export function useCanAccess(
  requiredPermission?: string | string[],
  requiredRole?: string | string[]
): boolean {
  const { has, user } = usePermission();

  if (!user) return false;

  if (requiredPermission) {
    const permissions = Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission];

    if (!permissions.every(perm => has(perm))) {
      return false;
    }
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userRole = (user as any)?.role;

    if (!userRole || !roles.includes(userRole)) {
      return false;
    }
  }

  return true;
}

