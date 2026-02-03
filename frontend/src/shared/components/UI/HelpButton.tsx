import React, { useState } from 'react';
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';

interface HelpContent {
  title: string;
  description: string;
  sections?: Array<{
    title: string;
    content: string;
    items?: string[];
  }>;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  relatedLinks?: Array<{
    label: string;
    path: string;
  }>;
}

interface HelpButtonProps {
  pageId: string;
  className?: string;
  variant?: 'icon' | 'button';
}

// Contenu d'aide par page
const helpContentMap: Record<string, HelpContent> = {
  dashboard: {
    title: 'Aide - Tableau de Bord',
    description: 'Votre tableau de bord centralise toutes les informations importantes de votre activité.',
    sections: [
      {
        title: 'KPIs Principaux',
        content: 'Les indicateurs clés affichent vos performances financières en temps réel :',
        items: [
          'CA du Mois : Chiffre d\'affaires total généré ce mois-ci',
          'Résultat Net : Bénéfice après déduction de tous les coûts',
          'Trésorerie : Solde disponible sur vos comptes bancaires',
          'Marge : Pourcentage de profit sur vos ventes'
        ]
      },
      {
        title: 'Actions Rapides',
        content: 'Accédez rapidement aux fonctionnalités les plus utilisées.',
        items: [
          'Créer une facture',
          'Ajouter un client',
          'Gérer les articles',
          'Consulter les rapports'
        ]
      },
      {
        title: 'Alertes & Notifications',
        content: 'Restez informé des tâches importantes et des échéances à venir.'
      }
    ],
    faq: [
      {
        question: 'Comment personnaliser mon dashboard ?',
        answer: 'Vous pouvez réorganiser les widgets en les glissant-déposant. Certaines fonctionnalités avancées sont disponibles selon votre abonnement.'
      },
      {
        question: 'Les données sont-elles mises à jour en temps réel ?',
        answer: 'Oui, les données sont actualisées automatiquement. Vous pouvez forcer une actualisation en cliquant sur l\'icône de rafraîchissement.'
      }
    ]
  },
  clients: {
    title: 'Aide - Gestion Clients',
    description: 'Gérez efficacement votre relation client et suivez leurs performances.',
    sections: [
      {
        title: 'Créer un Client',
        content: 'Pour ajouter un nouveau client :',
        items: [
          'Cliquez sur "Nouveau Client"',
          'Remplissez les informations de base (nom, contact, adresse)',
          'Ajoutez des informations complémentaires (NIF, secteur, etc.)',
          'Sauvegardez'
        ]
      },
      {
        title: 'Suivi des Clients',
        content: 'Consultez l\'historique complet de chaque client : factures, paiements, relances.'
      }
    ],
    faq: [
      {
        question: 'Comment importer mes clients existants ?',
        answer: 'Utilisez la fonction d\'import Excel depuis le menu "Actions" > "Importer". Le fichier doit respecter le format fourni.'
      }
    ]
  },
  factures: {
    title: 'Aide - Facturation',
    description: 'Créez, gérez et suivez vos factures de vente facilement.',
    sections: [
      {
        title: 'Créer une Facture',
        content: 'Étapes pour créer une facture :',
        items: [
          'Sélectionnez le client',
          'Ajoutez les articles ou services',
          'Vérifiez les totaux et la TVA',
          'Choisissez le type (Facture ou Devis)',
          'Signez électroniquement si nécessaire',
          'Envoyez au client'
        ]
      },
      {
        title: 'Types de Documents',
        content: 'Vous pouvez créer des factures (obligatoires) ou des devis (estimations).'
      }
    ],
    faq: [
      {
        question: 'Puis-je modifier une facture déjà envoyée ?',
        answer: 'Une facture envoyée peut être modifiée mais une nouvelle version sera créée. L\'ancienne version reste dans l\'historique pour traçabilité.'
      }
    ]
  },
  articles: {
    title: 'Aide - Gestion des Articles',
    description: 'Gérez votre catalogue produits et vos tarifs.',
    sections: [
      {
        title: 'Créer un Article',
        content: 'Pour ajouter un article :',
        items: [
          'Cliquez sur "Nouvel article"',
          'Renseignez le nom, code PCA, prix unitaire',
          'Définissez l\'unité de mesure',
          'Ajoutez une description',
          'Sauvegardez'
        ]
      },
      {
        title: 'Code PCA',
        content: 'Le Code Plan Comptable Algérien (SCF) permet de classer vos articles comptablement. Exemples : 601100 (Matières premières), 355000 (Produits finis).'
      }
    ]
  },
  fournisseurs: {
    title: 'Aide - Gestion Fournisseurs',
    description: 'Suivez vos relations avec vos fournisseurs et optimisez vos achats.',
    sections: [
      {
        title: 'Gérer les Fournisseurs',
        content: 'Créez et suivez vos fournisseurs pour :',
        items: [
          'Comparer les prix et délais',
          'Suivre les commandes',
          'Gérer les paiements',
          'Analyser les performances'
        ]
      }
    ]
  },
  fiscalite: {
    title: 'Aide - Fiscalité',
    description: 'Gérez vos obligations fiscales et vos déclarations.',
    sections: [
      {
        title: 'Documents Fiscaux',
        content: 'Selon votre pays, différents documents sont requis :',
        items: [
          'Algérie : G50 (mensuel), G29 (annuel), NIF',
          'France : CA3 (TVA), Liasses fiscales',
          'USA : Form 1120, Sales Tax Returns'
        ]
      },
      {
        title: 'TVA',
        content: 'Le taux de TVA varie selon votre pays et le type de produit/service. En Algérie, le taux normal est de 19%.'
      },
      {
        title: 'IBS - Impôt sur le Bénéfice des Sociétés',
        content: 'Impôt direct prélevé sur les bénéfices des sociétés. Taux généralement de 19% ou 26% selon le secteur.',
        items: [
          'Taux standard : 26%',
          'Taux réduit : 19% pour certains secteurs',
          'Calculé sur le bénéfice imposable',
          'Acomptes trimestriels possibles'
        ]
      },
      {
        title: 'IRG - Impôt sur le Revenu Global',
        content: 'Impôt direct sur les revenus des personnes physiques. Barème progressif selon les tranches de revenus.'
      },
      {
        title: 'G50 - Déclaration Mensuelle',
        content: 'Déclaration mensuelle globale qui regroupe IRG, IBS et TVA. Obligatoire avant le 20 de chaque mois.',
        items: [
          'Échéance : avant le 20 de chaque mois',
          'Inclut TVA collectée et déductible',
          'Peut être télédéclarée',
          'Génération automatique possible'
        ]
      },
      {
        title: 'G29 - Déclaration Annuelle',
        content: 'Déclaration annuelle des résultats. Récapitule les résultats fiscaux de l\'exercice.',
        items: [
          'Échéance : avant le 30 avril',
          'Inclut bilan fiscal et compte de résultat',
          'Déclaration définitive de l\'exercice'
        ]
      }
    ],
    faq: [
      {
        question: 'Qu\'est-ce que la G50 ?',
        answer: 'La G50 est la déclaration mensuelle globale en Algérie. Elle regroupe l\'IRG, l\'IBS et la TVA. Elle doit être déposée avant le 20 de chaque mois.'
      },
      {
        question: 'Comment calculer la TVA à verser ?',
        answer: 'TVA à verser = TVA collectée - TVA déductible. La TVA collectée provient de vos ventes, la TVA déductible de vos achats.'
      },
      {
        question: 'Quand dois-je déclarer l\'IBS ?',
        answer: 'L\'IBS est déclaré annuellement via la G29. Des acomptes peuvent être versés trimestriellement.'
      }
    ]
  }
};

const HelpButton: React.FC<HelpButtonProps> = ({ pageId, className = '', variant = 'icon' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const helpContent = helpContentMap[pageId] || {
    title: 'Aide',
    description: 'Aide contextuelle pour cette page.',
    sections: []
  };

  if (variant === 'button') {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium text-sm ${className}`}
        >
          <QuestionMarkCircleIcon className="h-5 w-5" />
          Aide
        </button>
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={helpContent.title}
          size="lg"
        >
          <HelpContent content={helpContent} onClose={() => setIsOpen(false)} />
        </Modal>
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors ${className}`}
        aria-label="Aide"
        title="Aide contextuelle"
      >
        <QuestionMarkCircleIcon className="h-5 w-5" />
      </button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={helpContent.title}
        size="lg"
      >
        <HelpContent content={helpContent} onClose={() => setIsOpen(false)} />
      </Modal>
    </>
  );
};

const HelpContent: React.FC<{ content: HelpContent; onClose: () => void }> = ({ content, onClose }) => {
  return (
    <div className="space-y-6">
      <p className="text-slate-600 dark:text-slate-400">{content.description}</p>

      {content.sections && content.sections.length > 0 && (
        <div className="space-y-4">
          {content.sections.map((section, index) => (
            <div key={index} className="border-l-4 border-slate-300 dark:border-slate-600 pl-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {section.title}
              </h3>
              <p className="text-slate-700 dark:text-slate-300 mb-2">{section.content}</p>
              {section.items && (
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 ml-4">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {content.faq && content.faq.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Questions Fréquentes</h3>
          <div className="space-y-3">
            {content.faq.map((item, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                <p className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                  {item.question}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {content.relatedLinks && content.relatedLinks.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Liens Utiles</h3>
          <div className="flex flex-wrap gap-2">
            {content.relatedLinks.map((link, index) => (
              <a
                key={index}
                href={link.path}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-700 dark:bg-slate-600 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-500 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};

export default HelpButton;

