import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlerteFinanciere } from '@shared/mockData/dashboardMocks';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  BellIcon
} from '@heroicons/react/24/outline';

interface AlertesFinancieresProps {
  alertes: AlerteFinanciere[];
  onModifier?: (alerte: AlerteFinanciere) => void;
  onSupprimer?: (alerteId: string) => void;
  onTester?: (alerteId: string) => void;
  onDeclencher?: (alerteId: string) => void;
}

const AlertesFinancieres: React.FC<AlertesFinancieresProps> = ({
  alertes,
  onModifier,
  onSupprimer,
  onTester,
  onDeclencher
}) => {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'Déclenchée':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'Surveillance':
        return <ClockIcon className="h-5 w-5 text-amber-600" />;
      case 'Inactive':
        return <CheckCircleIcon className="h-5 w-5 text-slate-400" />;
      default:
        return null;
    }
  };

  const getStatutBg = (statut: string) => {
    switch (statut) {
      case 'Déclenchée':
        return 'bg-red-50 border-red-200';
      case 'Surveillance':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const activeAlertes = alertes.filter(a => a.active);
  const declenchees = activeAlertes.filter(a => a.statut === 'Déclenchée').length;
  const surveillance = activeAlertes.filter(a => a.statut === 'Surveillance').length;

  return (
    <div className="space-y-4">
      {/* Header avec statistiques */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <BellIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{t('dashboard.widgets.alertes.title')}</h3>
              <p className="text-sm text-slate-600">{t('dashboard.widgets.alertes.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-xs text-red-600 font-medium">{t('dashboard.widgets.alertes.triggered')}</p>
            <p className="text-2xl font-bold text-red-900">{declenchees}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-600 font-medium">{t('dashboard.widgets.alertes.monitoring')}</p>
            <p className="text-2xl font-bold text-amber-900">{surveillance}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-600 font-medium">{t('dashboard.widgets.alertes.total_active')}</p>
            <p className="text-2xl font-bold text-slate-900">{activeAlertes.length}</p>
          </div>
        </div>
      </div>

      {/* Liste des alertes */}
      <div className="space-y-3">
        {activeAlertes.map(alerte => (
          <div
            key={alerte.id}
            className={`border rounded-lg p-4 transition-all ${getStatutBg(alerte.statut)}`}
          >
            <div
              className="flex items-start justify-between cursor-pointer"
              onClick={() => setExpandedId(expandedId === alerte.id ? null : alerte.id)}
            >
              <div className="flex items-start gap-3 flex-1">
                {getStatutIcon(alerte.statut)}
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900">{alerte.nom}</h4>
                  <p className="text-sm text-slate-600">{alerte.description}</p>
                  {expandedId === alerte.id && (
                    <div className="mt-3 pt-3 border-t border-current border-opacity-20 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">{t('dashboard.widgets.alertes.threshold')} :</span>
                        <span className="font-medium">{alerte.seuil} {alerte.unite}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">{t('dashboard.widgets.alertes.current_value')} :</span>
                        <span className="font-medium">{alerte.valeurActuelle} {alerte.unite}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">{t('dashboard.widgets.alertes.frequency')} :</span>
                        <span className="font-medium capitalize">{alerte.frequence}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">{t('dashboard.widgets.alertes.recipients')} :</span>
                        <span className="font-medium text-xs">{alerte.destinataires.length} email(s)</span>
                      </div>
                      {alerte.derniereAlerte && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">{t('dashboard.widgets.alertes.last_alert')} :</span>
                          <span className="font-medium">{alerte.derniereAlerte}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                {onTester && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTester(alerte.id);
                    }}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    title={t('dashboard.widgets.alertes.test_btn')}
                  >
                    <CheckCircleIcon className="h-4 w-4 text-slate-600" />
                  </button>
                )}
                {onModifier && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onModifier(alerte);
                    }}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    title={t('dashboard.widgets.alertes.modify_btn')}
                  >
                    <PencilIcon className="h-4 w-4 text-slate-600" />
                  </button>
                )}
                {onSupprimer && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSupprimer(alerte.id);
                    }}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title={t('dashboard.widgets.alertes.delete_btn')}
                  >
                    <TrashIcon className="h-4 w-4 text-red-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeAlertes.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <p className="text-slate-600">{t('dashboard.widgets.alertes.no_alerts')}</p>
        </div>
      )}
    </div>
  );
};

export default AlertesFinancieres;
