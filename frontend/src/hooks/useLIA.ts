import { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface LIAContext {
  page?: string;
  section?: string;
  data?: any;
  question?: string;
}

interface LIAHistoryItem {
  id: string;
  question: string;
  context: string;
  timestamp: Date;
}

/**
 * Hook personnalisé pour gérer l'intégration de LIA
 */
export const useLIA = () => {
  const location = useLocation();
  const [liaHistory, setLiaHistory] = useState<LIAHistoryItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuestion, setInitialQuestion] = useState<string | undefined>();

  /**
   * Ouvre LIA avec une question et un contexte spécifiques
   */
  const openLIA = useCallback((question?: string, context?: LIAContext) => {
    if (question) {
      setInitialQuestion(question);
      
      // Sauvegarder dans l'historique
      const historyItem: LIAHistoryItem = {
        id: `lia-${Date.now()}`,
        question,
        context: context?.page || location.pathname,
        timestamp: new Date()
      };
      
      setLiaHistory(prev => {
        const updated = [historyItem, ...prev].slice(0, 10); // Garder les 10 dernières
        // Sauvegarder dans localStorage
        try {
          localStorage.setItem('lia_history', JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to save LIA history', e);
        }
        return updated;
      });
    }
    
    setIsOpen(true);
  }, [location.pathname]);

  /**
   * Analyse des données avec LIA
   */
  const analyzeWithLIA = useCallback((dataType: string, data: any, question?: string) => {
    const context: LIAContext = {
      page: location.pathname,
      section: dataType,
      data
    };
    
    const defaultQuestion = question || `Analyse ces données ${dataType} et donne-moi des insights`;
    openLIA(defaultQuestion, context);
  }, [location.pathname, openLIA]);

  /**
   * Ouvre LIA avec le contexte de la page actuelle
   */
  const openLIAWithContext = useCallback((section?: string) => {
    const context: LIAContext = {
      page: location.pathname,
      section
    };
    
    openLIA(undefined, context);
  }, [location.pathname, openLIA]);

  /**
   * Charge l'historique depuis localStorage
   */
  const loadHistory = useCallback(() => {
    try {
      const stored = localStorage.getItem('lia_history');
      if (stored) {
        const parsed = JSON.parse(stored).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setLiaHistory(parsed);
      }
    } catch (e) {
      console.error('Failed to load LIA history', e);
    }
  }, []);

  /**
   * Ferme LIA
   */
  const closeLIA = useCallback(() => {
    setIsOpen(false);
    setInitialQuestion(undefined);
  }, []);

  return {
    isOpen,
    initialQuestion,
    liaHistory,
    openLIA,
    analyzeWithLIA,
    openLIAWithContext,
    closeLIA,
    loadHistory
  };
};

