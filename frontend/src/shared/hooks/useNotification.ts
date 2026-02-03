import { useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

interface NotificationState {
  isOpen: boolean;
  type: NotificationType;
  title: string;
  message: string;
  details?: string | string[];
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  const showNotification = useCallback((
    type: NotificationType,
    title: string,
    message: string,
    details?: string | string[],
    onConfirm?: () => void,
    confirmText?: string,
    cancelText?: string
  ) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message,
      details,
      onConfirm,
      confirmText,
      cancelText
    });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  }, []);

  const success = useCallback((title: string, message: string, details?: string | string[]) => {
    showNotification('success', title, message, details);
  }, [showNotification]);

  const error = useCallback((title: string, message: string, details?: string | string[]) => {
    showNotification('error', title, message, details);
  }, [showNotification]);

  const warning = useCallback((title: string, message: string, details?: string | string[]) => {
    showNotification('warning', title, message, details);
  }, [showNotification]);

  const info = useCallback((title: string, message: string, details?: string | string[]) => {
    showNotification('info', title, message, details);
  }, [showNotification]);

  const confirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    details?: string | string[],
    confirmText?: string,
    cancelText?: string
  ) => {
    showNotification('confirm', title, message, details, onConfirm, confirmText, cancelText);
  }, [showNotification]);

  return {
    notification,
    showNotification,
    closeNotification,
    success,
    error,
    warning,
    info,
    confirm
  };
};

