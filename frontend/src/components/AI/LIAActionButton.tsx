import React, { useState } from 'react';
import { 
  SparklesIcon, 
  CommandLineIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Action {
  id: string;
  label: string;
  description: string;
  icon?: React.ReactNode;
  action: () => void | Promise<void>;
}

interface LIAActionButtonProps {
  actions: Action[];
  context?: string;
  className?: string;
}

/**
 * Bouton LIA avec actions rapides intégrées
 * Permet d'exécuter des actions directement depuis LIA
 */
const LIAActionButton: React.FC<LIAActionButtonProps> = ({
  actions,
  context,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const [executing, setExecuting] = useState(false);

  const handleActionClick = async (action: Action) => {
    setExecuting(true);
    try {
      await action.action();
      setSelectedAction(action);
      setTimeout(() => {
        setSelectedAction(null);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setExecuting(false);
    }
  };

  const getActionSuggestions = () => {
    return actions.map(action => 
      `Exécuter: ${action.label} - ${action.description}`
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 transition-all shadow-sm hover:shadow-md ${className}`}
      >
        <SparklesIcon className="h-4 w-4 mr-2" />
        Actions LIA
        <CommandLineIcon className="h-4 w-4 ml-2" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700 relative">
            {/* En-tête */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg shadow-lg">
                  <SparklesIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    LIA - Actions Rapides
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {context || 'Exécutez des actions ou posez une question'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Actions disponibles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    disabled={executing}
                    className={`p-4 text-left rounded-lg border-2 transition-all ${
                      selectedAction?.id === action.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                    } ${executing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {action.icon}
                          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                            {action.label}
                          </h4>
                          {selectedAction?.id === action.id && (
                            <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRightIcon className="h-4 w-4 text-slate-400 ml-2" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat LIA */}
            <div className="flex-1 overflow-hidden relative">
              <StaticAIChatInline
                onClose={() => setIsOpen(false)}
                contextualSuggestions={getActionSuggestions()}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LIAActionButton;

