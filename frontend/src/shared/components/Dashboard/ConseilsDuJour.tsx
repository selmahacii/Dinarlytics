import React, { useState, useEffect } from 'react';
import { LightBulbIcon, XMarkIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';
import { Country } from '@shared/utils/fiscalDocuments';

interface Conseil {
  id: string;
  titre: string;
  description: string;
  action?: {
    label: string;
    path: string;
  };
  priorite: 'info' | 'warning' | 'urgent';
  date?: string; // Date spécifique pour afficher le conseil
}

const ConseilsDuJour: React.FC = () => {
  const { currentCountry, currentDevise, planComptable } = useApp();
  const [currentConseil, setCurrentConseil] = useState<Conseil | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  // Générer conseils selon le contexte
  const generateConseils = (): Conseil[] => {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const month = today.getMonth() + 1;
    const conseils: Conseil[] = [];

    // Conseils selon le pays
    if (currentCountry === 'DZ') {
      // G50 - Déclaration mensuelle (avant le 20)
      if (dayOfMonth >= 15 && dayOfMonth < 20) {
        conseils.push({
          id: 'g50-reminder',
          titre: '📅 Déclaration G50 à venir',
          description: `Votre déclaration G50 est due avant le 20/${month}. Assurez-vous d'avoir toutes vos factures enregistrées et vos calculs de TVA à jour.`,
          action: {
            label: 'Aller à la déclaration',
            path: '/rapports/fiscalite-declarations'
          },
          priorite: 'urgent',
          date: `${dayOfMonth}/${month}`
        });
      }

      // G29 - Déclaration annuelle (janvier)
      if (month === 1 && dayOfMonth <= 31) {
        conseils.push({
          id: 'g29-reminder',
          titre: '📊 Déclaration G29 annuelle',
          description: 'Pensez à préparer votre déclaration G29 (résultats annuels). Elle doit être déposée avant le 30 avril.',
          action: {
            label: 'Voir les documents fiscaux',
            path: '/documents-fiscaux'
          },
          priorite: 'warning'
        });
      }

      // TVA
      conseils.push({
        id: 'tva-tip',
        titre: '💡 Astuce TVA',
        description: `Le taux de TVA normal en Algérie est de 19%. Vérifiez que tous vos articles ont le bon taux configuré.`,
        action: {
          label: 'Vérifier les articles',
          path: '/articles'
        },
        priorite: 'info'
      });
    } else if (currentCountry === 'FR' || currentCountry === 'DE' || currentCountry === 'IT') {
      // Conseils pour l'UE
      conseils.push({
        id: 'ca3-reminder',
        titre: '📋 Déclaration TVA CA3',
        description: 'En Europe, la déclaration TVA (CA3 en France) est généralement mensuelle ou trimestrielle selon votre régime.',
        action: {
          label: 'Voir la fiscalité',
          path: '/fiscalite'
        },
        priorite: 'info'
      });
    } else if (currentCountry === 'US') {
      conseils.push({
        id: 'us-tax-tip',
        titre: '📊 Fiscalité US',
        description: 'Aux USA, les déclarations varient selon l\'État. Vérifiez vos obligations locales (Sales Tax, State Tax).',
        priorite: 'info'
      });
    }

    // Conseils généraux selon la période
    if (dayOfMonth >= 25) {
      conseils.push({
        id: 'month-end-tip',
        titre: '📈 Fin de mois',
        description: 'C\'est bientôt la fin du mois. Pensez à : relancer les factures impayées, préparer vos déclarations, faire le point sur votre trésorerie.',
        priorite: 'warning'
      });
    }

    // Conseils selon le plan comptable
    if (planComptable === 'algerien') {
      conseils.push({
        id: 'scf-tip',
        titre: '📚 Plan Comptable SCF',
        description: 'Vous utilisez le Système Comptable Financier (SCF) algérien. Assurez-vous que tous vos comptes respectent la nomenclature officielle.',
        priorite: 'info'
      });
    }

    return conseils;
  };

  useEffect(() => {
    const conseils = generateConseils();
    if (conseils.length > 0 && !isDismissed) {
      // Prendre le conseil le plus prioritaire
      const sortedConseils = conseils.sort((a, b) => {
        const priorityOrder = { urgent: 3, warning: 2, info: 1 };
        return priorityOrder[b.priorite] - priorityOrder[a.priorite];
      });
      setCurrentConseil(sortedConseils[0]);
    }
  }, [currentCountry, currentDevise, planComptable, isDismissed]);

  if (!currentConseil || isDismissed) {
    return null;
  }

  const priorityColors = {
    urgent: 'from-red-50 to-orange-50 border-red-200 dark:from-red-900/20 dark:to-orange-900/20 dark:border-red-700',
    warning: 'from-amber-50 to-yellow-50 border-amber-200 dark:from-amber-900/20 dark:to-yellow-900/20 dark:border-amber-700',
    info: 'from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700'
  };

  const priorityIcons = {
    urgent: '🔴',
    warning: '⚠️',
    info: '💡'
  };

  return (
    <div className={`bg-gradient-to-br ${priorityColors[currentConseil.priorite]} rounded-xl p-5 border-2 shadow-md hover:shadow-lg transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <LightBulbIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">{priorityIcons[currentConseil.priorite]}</span>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                Conseil du Jour
              </h3>
              {currentConseil.date && (
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {currentConseil.date}
                </span>
              )}
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
              {currentConseil.titre}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
              {currentConseil.description}
            </p>
            {currentConseil.action && (
              <a
                href={currentConseil.action.path}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 dark:bg-slate-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-500 transition-colors text-sm font-medium"
              >
                {currentConseil.action.label}
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors ml-2"
          aria-label="Fermer"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ConseilsDuJour;



