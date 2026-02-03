import React, { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import Tooltip from './Tooltip';

interface GlossaryTermProps {
  term: string;
  definition?: string;
  examples?: string[];
  className?: string;
}

// Base de connaissances des termes comptables/fiscaux
const GLOSSARY: Record<string, { definition: string; examples?: string[] }> = {
  'G50': {
    definition: 'Déclaration mensuelle globale en Algérie qui regroupe l\'IRG (Impôt sur le Revenu Global), l\'IBS (Impôt sur le Bénéfice des Sociétés) et la TVA. Elle doit être déposée avant le 20 de chaque mois.',
    examples: [
      'Déclaration mensuelle obligatoire pour toutes les entreprises',
      'Inclut les impôts directs (IRG/IBS) et indirects (TVA)',
      'Échéance : avant le 20 de chaque mois'
    ]
  },
  'G29': {
    definition: 'Déclaration annuelle de résultats en Algérie. Elle récapitule les résultats fiscaux de l\'exercice et doit être déposée avant le 30 avril de l\'année suivante.',
    examples: [
      'Déclaration annuelle des résultats',
      'Inclut le bilan fiscal et le compte de résultat',
      'Échéance : avant le 30 avril'
    ]
  },
  'SCF': {
    definition: 'Système Comptable Financier algérien. Norme comptable officielle qui définit la structure des comptes, les règles d\'évaluation et les états financiers à produire.',
    examples: [
      'Plan comptable officiel algérien',
      'Structure des comptes normalisée',
      'Obligatoire pour toutes les entreprises'
    ]
  },
  'NIF': {
    definition: 'Numéro d\'Identification Fiscale. Identifiant unique attribué par l\'administration fiscale algérienne à chaque contribuable (personne physique ou morale).',
    examples: [
      'Obligatoire pour toutes les entreprises',
      'Utilisé dans toutes les déclarations fiscales',
      'Attribué lors de l\'immatriculation'
    ]
  },
  'TVA': {
    definition: 'Taxe sur la Valeur Ajoutée. Impôt indirect prélevé sur la consommation. En Algérie, le taux normal est de 19%, avec des taux réduits (9% et 0%) selon les produits.',
    examples: [
      'Taux normal : 19% en Algérie',
      'Taux réduit : 9% pour certains produits',
      'Taux zéro : 0% pour exportations'
    ]
  },
  'IRG': {
    definition: 'Impôt sur le Revenu Global. Impôt direct prélevé sur les revenus des personnes physiques en Algérie.',
    examples: [
      'S\'applique aux personnes physiques',
      'Barème progressif selon les revenus',
      'Retenu à la source pour les salariés'
    ]
  },
  'IBS': {
    definition: 'Impôt sur le Bénéfice des Sociétés. Impôt direct prélevé sur les bénéfices des sociétés en Algérie. Taux généralement de 19% ou 25% selon le secteur.',
    examples: [
      'S\'applique aux sociétés (SARL, SPA, etc.)',
      'Taux : 19% ou 25% selon le secteur',
      'Calculé sur le bénéfice imposable'
    ]
  },
  'CA3': {
    definition: 'Déclaration de TVA mensuelle en France. Elle permet de déclarer les opérations soumises à TVA et de calculer le montant à payer ou à récupérer.',
    examples: [
      'Déclaration mensuelle de TVA en France',
      'Échéance : avant le 25 du mois suivant',
      'Inclut les ventes et achats soumis à TVA'
    ]
  },
  'PCA': {
    definition: 'Plan Comptable Algérien. Système de codification des comptes comptables selon le SCF. Chaque compte a un numéro à 6 chiffres.',
    examples: [
      '601100 : Matières premières',
      '355000 : Produits finis',
      '371000 : Marchandises'
    ]
  },
  'IFRS': {
    definition: 'International Financial Reporting Standards. Normes comptables internationales utilisées dans de nombreux pays pour harmoniser la comptabilité.',
    examples: [
      'Normes comptables internationales',
      'Utilisées dans l\'UE et de nombreux pays',
      'Permet la comparabilité internationale'
    ]
  },
  'GAAP': {
    definition: 'Generally Accepted Accounting Principles. Principes comptables généralement reconnus aux États-Unis. Normes comptables américaines.',
    examples: [
      'Normes comptables américaines',
      'Obligatoires pour les entreprises cotées',
      'Gérées par le FASB'
    ]
  }
};

const GlossaryTerm: React.FC<GlossaryTermProps> = ({ 
  term, 
  definition, 
  examples, 
  className = '' 
}) => {
  const glossaryData = GLOSSARY[term.toUpperCase()];
  const finalDefinition = definition || glossaryData?.definition || `Terme technique : ${term}`;
  const finalExamples = examples || glossaryData?.examples || [];

  const tooltipContent = (
    <div>
      <div className="font-semibold mb-2 text-slate-100">{term}</div>
      <div className="text-slate-200 mb-2">{finalDefinition}</div>
      {finalExamples.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-700">
          <div className="text-xs font-semibold text-slate-300 mb-1">Exemples :</div>
          <ul className="text-xs text-slate-400 space-y-1">
            {finalExamples.map((example, index) => (
              <li key={index}>• {example}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span>{term}</span>
      <Tooltip
        content={tooltipContent}
        title={term}
        position="top"
        iconOnly
      />
    </span>
  );
};

export default GlossaryTerm;

