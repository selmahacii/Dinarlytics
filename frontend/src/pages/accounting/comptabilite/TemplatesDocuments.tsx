import React, { useState } from 'react';
import {
  DocumentTextIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  StarIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const TemplatesDocuments: React.FC = () => {
  const [selectedCategorie, setSelectedCategorie] = useState('tous');

  const templates = [
    {
      id: 1,
      nom: 'Facture de Vente Standard',
      categorie: 'factures',
      description: 'Modèle de facture avec TVA 19% - Format officiel algérien',
      utilisations: 1247,
      couleur: 'emerald',
      favori: true,
      format: 'PDF + Excel'
    },
    {
      id: 2,
      nom: 'Facture Proforma',
      categorie: 'factures',
      description: 'Modèle de facture proforma pour devis et offres commerciales',
      utilisations: 423,
      couleur: 'cyan',
      favori: false,
      format: 'PDF'
    },
    {
      id: 3,
      nom: 'Bon de Commande',
      categorie: 'achats',
      description: 'Bon de commande fournisseur avec conditions générales',
      utilisations: 567,
      couleur: 'amber',
      favori: true,
      format: 'PDF + Word'
    },
    {
      id: 4,
      nom: 'Bon de Livraison',
      categorie: 'logistique',
      description: 'Bon de livraison client avec signature et cachet',
      utilisations: 892,
      couleur: 'slate',
      favori: false,
      format: 'PDF'
    },
    {
      id: 5,
      nom: 'Relevé de Compte Client',
      categorie: 'comptabilite',
      description: 'Relevé détaillé des opérations client avec solde',
      utilisations: 245,
      couleur: 'cyan',
      favori: true,
      format: 'PDF + Excel'
    },
    {
      id: 6,
      nom: 'Avoir sur Vente',
      categorie: 'factures',
      description: 'Facture d\'avoir pour retours et remboursements',
      utilisations: 156,
      couleur: 'red',
      favori: false,
      format: 'PDF'
    },
    {
      id: 7,
      nom: 'Reçu de Paiement',
      categorie: 'tresorerie',
      description: 'Reçu officiel de paiement client',
      utilisations: 734,
      couleur: 'emerald',
      favori: true,
      format: 'PDF'
    },
    {
      id: 8,
      nom: 'Déclaration G50 TVA',
      categorie: 'fiscal',
      description: 'Formulaire G50 pré-rempli pour déclaration mensuelle TVA',
      utilisations: 12,
      couleur: 'slate',
      favori: true,
      format: 'PDF + Excel'
    }
  ];

  const categories = [
    { id: 'tous', nom: 'Tous les templates', count: templates.length },
    { id: 'factures', nom: 'Factures', count: templates.filter(t => t.categorie === 'factures').length },
    { id: 'achats', nom: 'Achats', count: templates.filter(t => t.categorie === 'achats').length },
    { id: 'comptabilite', nom: 'Comptabilité', count: templates.filter(t => t.categorie === 'comptabilite').length },
    { id: 'fiscal', nom: 'Fiscal', count: templates.filter(t => t.categorie === 'fiscal').length },
    { id: 'tresorerie', nom: 'Trésorerie', count: templates.filter(t => t.categorie === 'tresorerie').length }
  ];

  const filteredTemplates = selectedCategorie === 'tous' 
    ? templates 
    : templates.filter(t => t.categorie === selectedCategorie);

  const getColorClass = (color: string) => {
    const colors: any = {
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-300' },
      cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600', border: 'border-cyan-300' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-300' },
      slate: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
      red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-300' }
    };
    return colors[color] || colors.slate;
  };

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-100 rounded-lg">
              <DocumentTextIcon className="h-8 w-8 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Templates de Documents</h1>
              <p className="text-slate-600">Modèles de factures, devis et documents officiels</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
            <PlusIcon className="h-5 w-5 inline mr-2" />
            Nouveau Template
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Templates</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{templates.length}</p>
              <p className="text-xs text-slate-500 mt-1">Modèles disponibles</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Favoris</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{templates.filter(t => t.favori).length}</p>
              <p className="text-xs text-slate-500 mt-1">Templates favoris</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Utilisations</p>
              <p className="text-2xl font-bold text-cyan-600 mt-1">
                {templates.reduce((sum, t) => sum + t.utilisations, 0)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Total générations</p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-lg">
              <DocumentDuplicateIcon className="h-6 w-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Catégories</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{categories.length - 1}</p>
              <p className="text-xs text-slate-500 mt-1">Types de documents</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategorie(cat.id)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                selectedCategorie === cat.id
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.nom} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* Liste des templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => {
          const colorClasses = getColorClass(template.couleur);
          
          return (
            <div key={template.id} className="bg-white rounded-lg shadow-sm border-2 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 ${colorClasses.bg} rounded-lg`}>
                  <DocumentTextIcon className={`h-6 w-6 ${colorClasses.text}`} />
                </div>
                {template.favori && (
                  <StarIcon className="h-5 w-5 text-amber-500 fill-amber-500" />
                )}
              </div>
              
              <h3 className="text-base font-bold text-slate-900 mb-2">{template.nom}</h3>
              <p className="text-sm text-slate-600 mb-3">{template.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-slate-500">{template.utilisations} utilisations</span>
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-slate-100 text-slate-700">
                  {template.format}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
                  <EyeIcon className="h-4 w-4 inline mr-1" />
                  Utiliser
                </button>
                <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TemplatesDocuments;


