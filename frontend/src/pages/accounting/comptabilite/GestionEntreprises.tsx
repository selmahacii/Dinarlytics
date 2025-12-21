import React, { useState } from 'react';
import {
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BanknotesIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const GestionEntreprises: React.FC = () => {
  const entreprises = [
    {
      id: 1,
      nom: 'Dinarlytic SARL',
      raisonSociale: 'Dinarlytic Solutions Algérie SARL',
      nif: '001234567890123',
      nis: '001234567',
      rc: 'RC 24/00-1234567',
      adresse: '123 Rue Didouche Mourad, Alger',
      telephone: '+213 23 45 67 89',
      email: 'contact@dinarlytic.dz',
      capital: 1000000,
      statut: 'active',
      type: 'Société Mère',
      employes: 45,
      dateCrea: '2020-01-15'
    },
    {
      id: 2,
      nom: 'Dinarlytic Services SPA',
      raisonSociale: 'Dinarlytic Services par Actions',
      nif: '001234567890124',
      nis: '001234568',
      rc: 'RC 24/00-1234568',
      adresse: '456 Boulevard Mohamed V, Oran',
      telephone: '+213 41 12 34 56',
      email: 'contact@dinarlytic-services.dz',
      capital: 5000000,
      statut: 'active',
      type: 'Filiale',
      employes: 28,
      dateCrea: '2022-06-10'
    },
    {
      id: 3,
      nom: 'Dinarlytic Trading EURL',
      raisonSociale: 'Dinarlytic Trading EURL',
      nif: '001234567890125',
      nis: '001234569',
      rc: 'RC 24/00-1234569',
      adresse: '789 Rue Larbi Ben M\'hidi, Constantine',
      telephone: '+213 31 98 76 54',
      email: 'contact@dinarlytic-trading.dz',
      capital: 100000,
      statut: 'active',
      type: 'Filiale',
      employes: 12,
      dateCrea: '2023-03-20'
    },
    {
      id: 4,
      nom: 'Dinarlytic Logistique',
      raisonSociale: 'Dinarlytic Logistique SNC',
      nif: '001234567890126',
      nis: '001234570',
      rc: 'RC 24/00-1234570',
      adresse: '321 Route Nationale, Sétif',
      telephone: '+213 36 55 44 33',
      email: 'contact@dinarlytic-log.dz',
      capital: 500000,
      statut: 'suspendue',
      type: 'Participation',
      employes: 8,
      dateCrea: '2023-09-05'
    }
  ];

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
              <h1 className="text-2xl font-bold text-slate-900">Gestion des Entreprises</h1>
              <p className="text-slate-600">Multi-entités et groupe de sociétés</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
            <PlusIcon className="h-5 w-5 inline mr-2" />
            Nouvelle Entité
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Entités</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{entreprises.length}</p>
              <p className="text-xs text-slate-500 mt-1">Dans le groupe</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Actives</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {entreprises.filter(e => e.statut === 'active').length}
              </p>
              <p className="text-xs text-slate-500 mt-1">En exploitation</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Capital Total</p>
              <p className="text-2xl font-bold text-cyan-600 mt-1">
                {formatCurrency(entreprises.reduce((sum, e) => sum + e.capital, 0))}
              </p>
              <p className="text-xs text-slate-500 mt-1">Somme des capitaux</p>
            </div>
            <div className="p-3 bg-cyan-100 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Employés</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {entreprises.reduce((sum, e) => sum + e.employes, 0)}
              </p>
              <p className="text-xs text-slate-500 mt-1">Total groupe</p>
            </div>
            <div className="p-3 bg-amber-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des entreprises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {entreprises.map((entreprise) => (
          <div key={entreprise.id} className="bg-white rounded-lg shadow-sm border-2 border-slate-200 hover:border-slate-300 hover:shadow-md transition-all">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <BuildingOfficeIcon className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{entreprise.nom}</h3>
                    <p className="text-sm text-slate-600">{entreprise.raisonSociale}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {entreprise.statut === 'active' ? (
                    <span className="inline-flex px-3 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-300">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex px-3 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-700 border border-amber-300">
                      Suspendue
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-3 text-sm">
                  <span className="inline-flex px-3 py-1 bg-cyan-100 text-cyan-700 rounded-lg font-medium text-xs border border-cyan-300">
                    {entreprise.type}
                  </span>
                  <span className="text-slate-600">Capital: <span className="font-bold text-slate-900">{formatCurrency(entreprise.capital)}</span></span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center text-slate-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {entreprise.adresse.split(',')[0]}
                  </div>
                  <div className="flex items-center text-slate-600">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    {entreprise.telephone}
                  </div>
                  <div className="flex items-center text-slate-600">
                    <EnvelopeIcon className="h-4 w-4 mr-2" />
                    {entreprise.email}
                  </div>
                  <div className="flex items-center text-slate-600">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    {entreprise.employes} employés
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">NIF:</span>
                    <p className="font-mono font-medium text-slate-900">{entreprise.nif}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">NIS:</span>
                    <p className="font-mono font-medium text-slate-900">{entreprise.nis}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">RC:</span>
                    <p className="font-mono font-medium text-slate-900">{entreprise.rc.split(' ')[1]}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-slate-200">
                <button className="flex-1 px-3 py-2 bg-cyan-100 text-cyan-600 rounded-lg hover:bg-cyan-200 transition-colors text-sm font-medium">
                  <EyeIcon className="h-4 w-4 inline mr-1" />
                  Voir
                </button>
                <button className="flex-1 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
                  <PencilIcon className="h-4 w-4 inline mr-1" />
                  Modifier
                </button>
                <button title="Supprimer l'entité" className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GestionEntreprises;


