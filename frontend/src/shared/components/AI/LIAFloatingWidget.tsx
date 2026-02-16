import React, { useState, useEffect } from 'react';
import { SparklesIcon, XMarkIcon, ChatBubbleLeftRightIcon, CommandLineIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';
import aiService from '@features/ai/services/aiService';
interface ChatMessage {
  type: 'user' | 'lia';
  content: string;
}

const InlineLIAChat: React.FC<{
  onClose: () => void;
  initialQuestion?: string;
  contextualSuggestions: string[];
}> = ({ onClose, initialQuestion, contextualSuggestions }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(initialQuestion || '');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    setChatMessages(m => [...m, { type: 'user', content: input }]);
    setLoading(true);

    try {
      const response = await aiService.chat(input);
      setChatMessages(m => [...m, { type: 'lia', content: response.content }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(m => [...m, { type: 'lia', content: 'Erreur lors du traitement de votre demande.' }]);
    } finally {
      setInput('');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.type === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
              }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {chatMessages.length === 0 && contextualSuggestions.length > 0 && (
          <div className="text-center text-sm text-slate-500 p-4">
            <p className="mb-3">Suggestions :</p>
            <div className="space-y-2">
              {contextualSuggestions.slice(0, 3).map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(s);
                  }}
                  className="block w-full text-left px-3 py-2 text-xs bg-slate-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 rounded text-slate-700 dark:text-slate-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="border-t border-slate-200 dark:border-slate-700 p-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Votre question..."
          className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '...' : '→'}
        </button>
      </div>
    </div>
  );
};
import { useLocation } from 'react-router-dom';
import { useLIA } from '@shared/hooks/useLIA';
import { useLIAHistory } from './LIAHistoryProvider';

interface LIAFloatingWidgetProps {
  className?: string;
}

/**
 * Widget flottant LIA accessible depuis toutes les pages
 * Raccourci clavier : Ctrl+K (ou Cmd+K sur Mac)
 */
const LIAFloatingWidget: React.FC<LIAFloatingWidgetProps> = ({ className = '' }) => {
  const location = useLocation();
  const { isOpen, initialQuestion, openLIA, closeLIA, loadHistory } = useLIA();
  const { conversations, favorites } = useLIAHistory();
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Charger l'historique au montage
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Suggestions contextuelles selon la page actuelle
  const getContextualSuggestions = () => {
    const path = location.pathname;

    if (path.includes('/fiscalite') || path.includes('/fiscal')) {
      return [
        "Comment calculer la TVA ?",
        "Qu'est-ce que la G50 ?",
        "Quand déclarer mes impôts ?",
        "Comment optimiser ma charge fiscale ?"
      ];
    }

    if (path.includes('/factures') || path.includes('/facturation')) {
      return [
        "Comment créer une facture ?",
        "Gérer les relances clients",
        "Calculer les remises",
        "Gérer les paiements"
      ];
    }

    if (path.includes('/articles') || path.includes('/inventaire')) {
      return [
        "Comment optimiser mes stocks ?",
        "Calculer les marges",
        "Gérer les prix",
        "Analyser la rotation"
      ];
    }

    if (path.includes('/clients')) {
      return [
        "Analyser ma clientèle",
        "Gérer les paiements clients",
        "Optimiser le recouvrement",
        "Segmenter mes clients"
      ];
    }

    if (path.includes('/fournisseurs')) {
      return [
        "Analyser mes achats",
        "Négocier avec les fournisseurs",
        "Optimiser les délais de paiement",
        "Gérer les commandes"
      ];
    }

    if (path.includes('/dashboard')) {
      return [
        "Interpréter mes KPIs",
        "Améliorer ma trésorerie",
        "Analyser mes performances",
        "Prévoir mes revenus"
      ];
    }

    if (path.includes('/comptabilite') || path.includes('/gestion-comptable')) {
      return [
        "Comment faire une écriture comptable ?",
        "Comprendre le bilan",
        "Analyser le compte de résultat",
        "Faire une clôture comptable"
      ];
    }

    // Suggestions par défaut
    return [
      "Comment améliorer ma trésorerie ?",
      "Quels sont mes ratios financiers ?",
      "Comment optimiser mes coûts ?",
      "Analyser mes performances"
    ];
  };

  // Raccourci clavier Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openLIA();
      }

      // Ctrl+L pour ouvrir avec contexte
      if ((e.ctrlKey || e.metaKey) && e.key === 'l' && !e.shiftKey) {
        e.preventDefault();
        openLIA(undefined, { page: location.pathname });
      }

      // Échap pour fermer
      if (e.key === 'Escape' && isOpen) {
        closeLIA();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, openLIA, closeLIA, location.pathname]);

  return (
    <>
      {/* Bouton flottant avec menu */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end space-y-2">
        {/* Menu d'historique (si ouvert) */}
        {showHistory && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 p-4 w-80 max-h-96 overflow-y-auto mb-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Historique LIA</h3>
              <button
                type="button"
                title="Fermer l'historique"
                onClick={() => setShowHistory(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            {favorites.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center">
                  <StarIcon className="h-3 w-3 mr-1" />
                  Favoris
                </h4>
                {favorites.slice(0, 3).map((conv) => (
                  <button type="button" title="Ouvrir le widget LIA"
                    key={conv.id}
                    onClick={() => {
                      const question = conv.messages[0]?.content || '';
                      setSelectedSuggestion(question);
                      openLIA(question);
                      setShowHistory(false);
                    }}
                    className="w-full text-left p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-xs mb-1"
                  >
                    <div className="truncate">{conv.title}</div>
                    <div className="text-slate-400 text-xs flex items-center mt-1">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {new Date(conv.updatedAt).toLocaleDateString('fr-FR')}
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div>
              <h4 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">Récent</h4>
              {conversations.slice(0, 5).map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    const question = conv.messages[0]?.content || '';
                    setSelectedSuggestion(question);
                    openLIA(question, { page: location.pathname });
                    setShowHistory(false);
                  }}
                  className="w-full text-left p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-xs mb-1"
                >
                  <div className="truncate">{conv.title}</div>
                  <div className="text-slate-400 text-xs flex items-center mt-1">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {new Date(conv.updatedAt).toLocaleDateString('fr-FR')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bouton principal */}
        <div className="flex space-x-2">
          {conversations.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-10 h-10 bg-slate-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
              title="Historique"
            >
              <ClockIcon className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => openLIA()}
            className={`w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center group ${className}`}
            title="Ouvrir LIA (Ctrl+K)"
            aria-label="Ouvrir l'assistant LIA"
          >
            <SparklesIcon className="h-6 w-6 group-hover:rotate-12 transition-transform" />

            {/* Badge de notification (optionnel) */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
              <span className="text-white">AI</span>
            </span>

            {/* Tooltip au survol */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              <div className="flex items-center gap-2">
                <CommandLineIcon className="h-4 w-4" />
                <span>LIA Assistant (Ctrl+K)</span>
              </div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
            </div>
          </button>
        </div>
      </div>

      {/* Modal LIA avec suggestions contextuelles */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 relative">
            {/* En-tête amélioré avec suggestions */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg shadow-lg">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    LIA - Assistant Intelligent
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Suggestions contextuelles pour cette page
                  </p>
                </div>
              </div>
              <button
                onClick={closeLIA}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                aria-label="Fermer LIA"
                title="Fermer (Échap)"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Suggestions contextuelles */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <ChatBubbleLeftRightIcon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Questions suggérées pour cette page
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {getContextualSuggestions().map((suggestion, idx) => (
                  <button type="button" title="Ouvrir le widget LIA"
                    key={idx}
                    onClick={() => {
                      setSelectedSuggestion(suggestion);
                      openLIA(suggestion, { page: location.pathname });
                    }}
                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-slate-700 dark:text-slate-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Composant StaticAIChat intégré - Version inline */}
            <div className="flex-1 overflow-hidden relative">
              <InlineLIAChat
                onClose={() => {
                  closeLIA();
                  setSelectedSuggestion(null);
                }}
                initialQuestion={selectedSuggestion || initialQuestion}
                contextualSuggestions={getContextualSuggestions()}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LIAFloatingWidget;


