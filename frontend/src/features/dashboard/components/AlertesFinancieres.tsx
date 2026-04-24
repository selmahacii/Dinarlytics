import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@shared/hooks/useTranslation';
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
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getStatutIcon = (statut: string) => {
    const s = statut.toLowerCase();
    if (s === 'déclenchée' || s === 'triggered')
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
    if (s === 'surveillance' || s === 'monitoring')
      return <ClockIcon className="h-5 w-5 text-amber-600" />;
    if (s === 'inactive' || s === 'inactive')
      return <CheckCircleIcon className="h-5 w-5 text-slate-400" />;
    return null;
  };

  const getStatutLabel = (statut: string) => {
    const s = statut.toLowerCase();
    if (s === 'déclenchée' || s === 'triggered') return t('dashboard.widgets.alertes.triggered');
    if (s === 'surveillance' || s === 'monitoring') return t('dashboard.widgets.alertes.monitoring');
    return t('common.inactive', { defaultValue: 'Inactive' });
  };

  const getStatutBg = (statut: string) => {
    switch (statut) {
      case 'Déclenchée':
      case 'triggered':
        return 'bg-red-50 border-red-200';
      case 'Surveillance':
      case 'monitoring':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const activeAlertes = alertes.filter(a => a.active);
  const declenchees = activeAlertes.filter(a => {
    const s = a.statut.toLowerCase();
    return s === 'déclenchée' || s === 'triggered';
  }).length;
  const surveillance = activeAlertes.filter(a => {
    const s = a.statut.toLowerCase();
    return s === 'surveillance' || s === 'monitoring';
  }).length;

  const handleViewAll = () => {
    navigate('/dashboard/alertes');
  };

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
          <button 
            onClick={handleViewAll}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors group"
          >
            <span>{t('audit.analytics.view_all') || 'Tout voir'}</span>
            <div className="p-1 bg-slate-100 rounded group-hover:bg-slate-200">
              <ExclamationTriangleIcon className="h-3 w-3" />
            </div>
          </button>
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
                  <h4 className="font-medium text-slate-900">
                    {t(`dashboard.widgets.alertes.names.${alerte.id}`, { defaultValue: alerte.nom })}
                  </h4>
                  <p className="text-sm text-slate-600">
                    {t(`dashboard.widgets.alertes.descriptions.${alerte.id}`, { defaultValue: alerte.description })}
                  </p>
                  {expandedId === alerte.id && (
                    <div className="mt-3 pt-3 border-t border-current border-opacity-20 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">{t('dashboard.widgets.alertes.threshold')} :</span>
                        <span className="font-medium">{alerte.seuil} {t(`common.units.${alerte.unite.toLowerCase()}`, { defaultValue: alerte.unite })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">{t('dashboard.widgets.alertes.current_value')} :</span>
                        <span className="font-medium">{alerte.valeurActuelle} {t(`common.units.${alerte.unite.toLowerCase()}`, { defaultValue: alerte.unite })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">{t('dashboard.widgets.alertes.frequency')} :</span>
                        <span className="font-medium capitalize">{t(`common.frequencies.${alerte.frequence}`, { defaultValue: alerte.frequence })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">{t('dashboard.widgets.alertes.recipients')} :</span>
                        <span className="font-medium text-xs">{alerte.destinataires.length} {t('common.emails', { count: alerte.destinataires.length, defaultValue: 'email(s)' })}</span>
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
