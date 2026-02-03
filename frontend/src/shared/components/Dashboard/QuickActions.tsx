import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  UserPlusIcon,
  ShoppingCartIcon,
  CubeIcon,
  BanknotesIcon,
  DocumentChartBarIcon,
  PlusCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  action?: () => void;
}

interface QuickActionsProps {
  onOpenModal?: (modalType: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onOpenModal }) => {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      id: 'facture',
      title: 'Nouvelle Facture',
      description: 'Créer une facture de vente',
      icon: DocumentTextIcon,
      path: '/factures-vente',
      color: 'text-blue-700 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      id: 'client',
      title: 'Nouveau Client',
      description: 'Ajouter un client',
      icon: UserPlusIcon,
      path: '/clients',
      color: 'text-emerald-700 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      borderColor: 'border-emerald-200 dark:border-emerald-800'
    },
    {
      id: 'commande',
      title: 'Commande Achat',
      description: 'Nouvelle commande fournisseur',
      icon: ShoppingCartIcon,
      path: '/fournisseurs',
      color: 'text-purple-700 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    {
      id: 'stock',
      title: 'Ajustement Stock',
      description: 'Modifier l\'inventaire',
      icon: CubeIcon,
      path: '/inventaire',
      color: 'text-orange-700 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    },
    {
      id: 'paiement',
      title: 'Enregistrer Paiement',
      description: 'Gérer les paiements fournisseurs',
      icon: BanknotesIcon,
      path: '/fournisseurs',
      color: 'text-teal-700 dark:text-teal-400',
      bgColor: 'bg-teal-50 dark:bg-teal-900/20',
      borderColor: 'border-teal-200 dark:border-teal-800'
    },
    {
      id: 'rapport',
      title: 'Générer Rapport',
      description: 'Créer un rapport analytique',
      icon: DocumentChartBarIcon,
      path: '/rapports-comptables',
      color: 'text-indigo-700 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800'
    }
  ];

  const handleAction = (action: QuickAction) => {
    if (action.action) {
      action.action();
    } else if (action.path) {
      navigate(action.path);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Actions Rapides
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Accès direct aux opérations courantes
          </p>
        </div>
        <PlusCircleIcon className="h-5 w-5 text-slate-400" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              className={`group relative ${action.bgColor} ${action.borderColor} border rounded-lg p-4 hover:shadow-md transition-all text-left`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`p-2 bg-white dark:bg-slate-900/50 rounded ${action.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className={`text-xs font-semibold ${action.color} mb-0.5`}>
                    {action.title}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {action.description}
                  </div>
                </div>
              </div>
              
              {/* Icône de redirection */}
              <div className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity ${action.color}`}>
                <ArrowRightIcon className="h-3 w-3" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
