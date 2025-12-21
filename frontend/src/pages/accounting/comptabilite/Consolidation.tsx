import React, { useState } from 'react';
import {
  CalculatorIcon,
  BuildingOfficeIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Consolidation: React.FC = () => {
  const [selectedPeriode, setSelectedPeriode] = useState('2025-T1');

  const entreprises = [
    { 
      id: 1, 
      nom: 'Dinarlytic SARL', 
      type: 'Société Mère', 
      ca: 5200000, 
      resultat: 850000,
      pourcentage: 100,
      statut: 'consolidé'
    },
    { 
      id: 2, 
      nom: 'Dinarlytic Services SPA', 
      type: 'Filiale', 
      ca: 2100000, 
      resultat: 320000,
      pourcentage: 75,
      statut: 'consolidé'
    },
    { 
      id: 3, 
      nom: 'Dinarlytic Trading EURL', 
      type: 'Filiale', 
      ca: 1850000, 
      resultat: 180000,
      pourcentage: 60,
      statut: 'en_cours'
    },
    { 
      id: 4, 
      nom: 'Dinarlytic Logistique', 
      type: 'Participation', 
      ca: 980000, 
      resultat: 95000,
      pourcentage: 35,
      statut: 'consolidé'
    }
  ];

  const eliminations = [
    { 
      id: 1, 
      description: 'Ventes inter-sociétés Mère → Filiale Services', 
      montant: 450000, 
      type: 'Ventes', 
      statut: 'validé' 
    },
    { 
      id: 2, 
      description: 'Créances/Dettes inter-groupes', 
      montant: 185000, 
      type: 'Bilan', 
      statut: 'validé' 
    },
    { 
      id: 3, 
      description: 'Dividendes intra-groupe', 
      montant: 120000, 
      type: 'Résultat', 
      statut: 'en_cours' 
    }
  ];

  const caConsolide = entreprises.reduce((sum, e) => sum + (e.ca * e.pourcentage / 100), 0);
  const resultatConsolide = entreprises.reduce((sum, e) => sum + (e.resultat * e.pourcentage / 100), 0);
  const eliminationsTotal = eliminations.reduce((sum, e) => sum + e.montant, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-100 rounded-lg">
              <BuildingOfficeIcon className="h-8 w-8 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Consolidation Comptable</h1>
              <p className="text-slate-600">Comptes consolidés du groupe Dinarlytic</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select title="Sélectionner une période"
              value={selectedPeriode}
              onChange={(e) => setSelectedPeriode(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
            >
              <option value="2025-T1">T1 2025</option>
              <option value="2024-T4">T4 2024</option>
              <option value="2024-T3">T3 2024</option>
              <option value="2024">Année 2024</option>
            </select>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
              <CalculatorIcon className="h-5 w-5 inline mr-2" />
              Consolider
            </button>
          </div>
        </div>
      </div>

      {/* Résumé consolidé */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">CA Consolidé</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(caConsolide)}</p>
              <p className="text-xs text-slate-500 mt-1">Part du groupe</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Résultat Consolidé</p>
              <p className="text-2xl font-bold text-cyan-600 mt-1">{formatCurrency(resultatConsolide)}</p>
              <p className="text-xs text-slate-500 mt-1">Part du groupe</p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-lg">
              <CalculatorIcon className="h-6 w-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Éliminations</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{formatCurrency(eliminationsTotal)}</p>
              <p className="text-xs text-slate-500 mt-1">{eliminations.length} écritures</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <ArrowsRightLeftIcon className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Entités</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{entreprises.length}</p>
              <p className="text-xs text-slate-500 mt-1">Dans le périmètre</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Périmètre de consolidation */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Périmètre de Consolidation</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Entité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">CA</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase">Résultat</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">% Détention</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-slate-600 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {entreprises.map((entreprise) => (
                <tr key={entreprise.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-900">{entreprise.nom}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-lg ${
                      entreprise.type === 'Société Mère' 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : entreprise.type === 'Filiale'
                        ? 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}>
                      {entreprise.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(entreprise.ca)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-semibold ${entreprise.resultat >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(entreprise.resultat)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-bold text-slate-900">{entreprise.pourcentage}%</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {entreprise.statut === 'consolidé' ? (
                      <span className="inline-flex px-3 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-300">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Consolidé
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-700 border border-amber-300">
                        En cours
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Écritures d'élimination */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Écritures d'Élimination</h3>
          <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
            + Nouvelle Élimination
          </button>
        </div>
        <div className="p-6 space-y-3">
          {eliminations.map((elim) => (
            <div key={elim.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-slate-900 mb-1">{elim.description}</h4>
                <div className="flex items-center space-x-3 text-xs text-slate-500">
                  <span className="inline-flex px-2 py-1 bg-slate-100 text-slate-700 rounded font-medium">
                    {elim.type}
                  </span>
                  <span>{formatCurrency(elim.montant)}</span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {elim.statut === 'validé' ? (
                  <span className="inline-flex px-3 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-300">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Validé
                  </span>
                ) : (
                  <span className="inline-flex px-3 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-700 border border-amber-300">
                    En cours
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Résultats consolidés */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Synthèse Consolidée - {selectedPeriode}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg border-2 border-emerald-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600 font-medium">CA Groupe</p>
              <ChartBarIcon className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-emerald-600">{formatCurrency(caConsolide)}</p>
            <p className="text-xs text-slate-500 mt-2">Après éliminations : {formatCurrency(caConsolide - 450000)}</p>
          </div>

          <div className="bg-white p-5 rounded-lg border-2 border-cyan-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600 font-medium">Résultat Groupe</p>
              <CalculatorIcon className="h-5 w-5 text-cyan-600" />
            </div>
            <p className="text-3xl font-bold text-cyan-600">{formatCurrency(resultatConsolide)}</p>
            <p className="text-xs text-slate-500 mt-2">Part des minoritaires : {formatCurrency(85000)}</p>
          </div>

          <div className="bg-white p-5 rounded-lg border-2 border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-600 font-medium">Marge Nette Groupe</p>
              <ArrowsRightLeftIcon className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-amber-600">
              {((resultatConsolide / caConsolide) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-slate-500 mt-2">Rentabilité consolidée</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="flex items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors shadow-sm">
          <DocumentArrowDownIcon className="h-5 w-5 text-emerald-600 mr-2" />
          <span className="text-sm font-semibold text-slate-700">Exporter Bilan Consolidé</span>
        </button>
        <button className="flex items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors shadow-sm">
          <ChartBarIcon className="h-5 w-5 text-cyan-600 mr-2" />
          <span className="text-sm font-semibold text-slate-700">Rapport Consolidation</span>
        </button>
        <button className="flex items-center justify-center p-4 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors shadow-sm">
          <ArrowsRightLeftIcon className="h-5 w-5 text-amber-600 mr-2" />
          <span className="text-sm font-semibold text-slate-700">Gérer Éliminations</span>
        </button>
      </div>
    </div>
  );
};

export default Consolidation;


