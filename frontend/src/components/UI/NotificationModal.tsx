import React from 'react';
import Modal from './Modal';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: NotificationType;
  title: string;
  message: string;
  details?: string | string[];
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  details,
  onConfirm,
  confirmText,
  cancelText,
  icon
}) => {
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-12 w-12 text-emerald-600" />;
      case 'error':
        return <XCircleIcon className="h-12 w-12 text-red-600" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-12 w-12 text-amber-600" />;
      case 'info':
        return <InformationCircleIcon className="h-12 w-12 text-blue-600" />;
      case 'confirm':
        return <ExclamationTriangleIcon className="h-12 w-12 text-amber-600" />;
      default:
        return <InformationCircleIcon className="h-12 w-12 text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'confirm':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-600 hover:bg-emerald-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'confirm':
        return 'bg-amber-600 hover:bg-amber-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="md">
      <div className={`rounded-2xl border-2 p-6 ${getBgColor()}`}>
        <div className="flex items-start space-x-4">
          {/* Icône */}
          <div className="flex-shrink-0">
            {getIcon()}
          </div>

          {/* Contenu */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-700 mb-4 leading-relaxed">{message}</p>

            {/* Détails supplémentaires */}
            {details && (
              <div className="bg-white/60 rounded-lg p-4 mb-4 border border-slate-200">
                {Array.isArray(details) ? (
                  <ul className="space-y-2 text-sm text-slate-700">
                    {details.map((detail, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-slate-500 mr-2">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-700">{details}</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              {type === 'confirm' && (
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-white border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                >
                  {cancelText || 'Annuler'}
                </button>
              )}
              <button
                onClick={type === 'confirm' ? handleConfirm : onClose}
                className={`px-6 py-2.5 text-white rounded-xl transition-colors font-medium shadow-md hover:shadow-lg ${getButtonColor()}`}
              >
                {confirmText || (type === 'confirm' ? 'Confirmer' : 'OK')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NotificationModal;

