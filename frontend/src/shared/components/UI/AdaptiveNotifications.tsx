import React, { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { AdaptiveContentGenerator, ContentContext } from '@shared/utils/AdaptiveContent';

interface Notification {
  id: string;
  message: string;
  type: 'tip' | 'insight';
  timestamp: number;
}

interface AdaptiveNotificationsProps {
  pageId: string;
  context: ContentContext;
  enabled?: boolean;
}

const AdaptiveNotifications: React.FC<AdaptiveNotificationsProps> = ({ 
  pageId, 
  context, 
  enabled = true 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasShownNotifications, setHasShownNotifications] = useState(false);

  // Fonction pour vérifier si une notification a déjà été affichée
  const hasNotificationBeenShown = (message: string, pageId: string): boolean => {
    try {
      const storageKey = `adaptive_notif_${pageId}_${message.substring(0, 50).replace(/\s+/g, '_')}`;
      return sessionStorage.getItem(storageKey) === 'shown';
    } catch {
      return false;
    }
  };

  // Fonction pour marquer une notification comme affichée
  const markNotificationAsShown = (message: string, pageId: string): void => {
    try {
      const storageKey = `adaptive_notif_${pageId}_${message.substring(0, 50).replace(/\s+/g, '_')}`;
      sessionStorage.setItem(storageKey, 'shown');
    } catch {
      // Ignorer les erreurs de sessionStorage
    }
  };

  useEffect(() => {
    if (!enabled || (pageId !== 'factures' && pageId !== 'facturation')) {
      return;
    }

    // Vérifier si les notifications ont déjà été affichées pour cette page dans cette session
    const sessionKey = `adaptive_notifs_shown_${pageId}`;
    if (sessionStorage.getItem(sessionKey) === 'true') {
      setHasShownNotifications(true);
      return;
    }

    const content = AdaptiveContentGenerator.generatePageContent(pageId, context);
    const allMessages: { message: string; type: 'tip' | 'insight' }[] = [];

    // Ajouter les conseils (filtrer ceux déjà affichés)
    content.tips.forEach(tip => {
      const cleanTip = tip.replace(/^[^\s]+\s/, '');
      if (!hasNotificationBeenShown(cleanTip, pageId)) {
        allMessages.push({ message: cleanTip, type: 'tip' });
      }
    });

    // Ajouter les insights (sans doublons et filtrer ceux déjà affichés)
    Array.from(new Set(content.insights)).forEach(insight => {
      if (!hasNotificationBeenShown(insight, pageId)) {
        allMessages.push({ message: insight, type: 'insight' });
      }
    });

    if (allMessages.length === 0) {
      // Marquer comme affiché même s'il n'y a pas de messages
      sessionStorage.setItem(sessionKey, 'true');
      setHasShownNotifications(true);
      return;
    }

    // Marquer que les notifications ont été affichées pour cette page
    sessionStorage.setItem(sessionKey, 'true');
    setHasShownNotifications(true);

    // Afficher la première notification après 2 secondes
    const firstTimer = setTimeout(() => {
      const firstMessage = allMessages[0];
      markNotificationAsShown(firstMessage.message, pageId);
      setNotifications([{
        id: `notif-0`,
        message: firstMessage.message,
        type: firstMessage.type,
        timestamp: Date.now()
      }]);
      setCurrentIndex(1);
    }, 2000);

    // Afficher les notifications suivantes toutes les 8 secondes
    const timers: NodeJS.Timeout[] = [];
    for (let i = 1; i < allMessages.length; i++) {
      const timer = setTimeout(() => {
        const message = allMessages[i];
        markNotificationAsShown(message.message, pageId);
        setNotifications(prev => {
          // Retirer les notifications de plus de 10 secondes
          const filtered = prev.filter(n => Date.now() - n.timestamp < 10000);
          return [...filtered, {
            id: `notif-${i}`,
            message: message.message,
            type: message.type,
            timestamp: Date.now()
          }];
        });
        setCurrentIndex(i + 1);
      }, 2000 + (i * 8000));
      timers.push(timer);
    }

    return () => {
      clearTimeout(firstTimer);
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [pageId, context, enabled]);

  // Auto-suppression des notifications après 10 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => prev.filter(n => Date.now() - n.timestamp < 10000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${
            notification.type === 'tip' 
              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' 
              : 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800'
          } border-l-4 ${
            notification.type === 'tip' 
              ? 'border-blue-500 dark:border-blue-400' 
              : 'border-emerald-500 dark:border-emerald-400'
          } rounded-lg shadow-lg p-4 animate-slide-in-right`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-slate-700 dark:text-slate-300 flex-1">
              {notification.message}
            </p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdaptiveNotifications;


