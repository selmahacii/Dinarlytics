import React from 'react';
import Card from '../UI/Card';
import { usePermission } from '@shared/hooks/usePermission';
import { ShieldCheckIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface Props {
  permission: string;
  children?: React.ReactNode;
  hide?: boolean; // if true, hide children entirely when not allowed
}

const RequirePermission: React.FC<Props> = ({ permission, children, hide }) => {
  const { has } = usePermission();

  if (has(permission)) return <>{children}</>;
  if (hide) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-6">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <ShieldCheckIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-slate-900">Accès refusé</h2>
          </div>
          <p className="text-sm text-slate-600" aria-live="polite">Vous n'avez pas la permission d'accéder à cette section.</p>
          <div className="text-xs text-slate-500">Permission requise: <code className="px-1 py-0.5 bg-slate-100 rounded">{permission}</code></div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <button
              type="button"
              className="px-3 py-1.5 text-xs rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              title="Demander l'accès"
              onClick={() => {
                // Placeholder: could open a request modal or emit an event
                console.info('Demande de permission initiée pour', permission);
              }}
            >
              Demander l'accès
            </button>
            <button
              type="button"
              className="px-3 py-1.5 text-xs rounded-md bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors flex items-center"
              title="Voir documentation permissions"
              onClick={() => {
                console.info('Ouverture documentation permissions');
              }}
            >
              <InformationCircleIcon className="h-4 w-4 mr-1" />
              Permissions
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RequirePermission;

