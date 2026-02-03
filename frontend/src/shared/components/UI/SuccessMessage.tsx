import React from 'react';
import { CheckCircleIcon, ArrowRightIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface SuccessAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface SuccessMessageProps {
  title: string;
  message: string;
  details?: string[];
  nextSteps?: string[];
  actions?: SuccessAction[];
  onClose?: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  title,
  message,
  details,
  nextSteps,
  actions,
  onClose
}) => {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl p-6 shadow-lg">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircleIcon className="h-7 w-7 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mb-2">
            {title}
          </h3>
          <p className="text-emerald-800 dark:text-emerald-200 mb-4">{message}</p>

          {details && details.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mb-4 border border-emerald-200 dark:border-emerald-700">
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                📋 Détails :
              </div>
              <ul className="space-y-1">
                {details.map((detail, index) => (
                  <li key={index} className="text-sm text-slate-600 dark:text-slate-400 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {nextSteps && nextSteps.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center space-x-2 mb-2">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  💡 Prochaines étapes :
                </div>
              </div>
              <ul className="space-y-2">
                {nextSteps.map((step, index) => (
                  <li key={index} className="text-sm text-blue-800 dark:text-blue-200 flex items-start">
                    <ArrowRightIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
                    action.variant === 'primary'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-white hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {action.label}
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              ))}
            </div>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="mt-4 text-sm text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 font-medium"
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuccessMessage;

