import React, { useState } from 'react';
import {
  BuildingOfficeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import RevenueBasedAccessWidget from '../../components/Dashboard/RevenueBasedAccessWidget';
import EvolutionTrackerWidget from '../../components/Dashboard/EvolutionTrackerWidget';
import AdaptiveDashboardLayout from '../../components/Dashboard/AdaptiveDashboardLayout';
import FiscalComplianceWidget from '../../components/Dashboard/FiscalComplianceWidget';
import api from '../../services/api';
import { COMPANY_TYPES } from '../../types/CompanyTypes';

const GestionAccesAvancee: React.FC = () => {

  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyIndex, setSelectedCompanyIndex] = useState(0);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const selectedCompany = companies[selectedCompanyIndex] || null;

  React.useEffect(() => {
    setLoadingCompanies(true);
    api.clients.getAll()
      .then(data => {
        setCompanies(data);
      })
      .catch(() => setCompaniesError('Erreur lors du chargement des entreprises'))
      .finally(() => setLoadingCompanies(false));
  }, []);

  if (loadingCompanies) {
    return <div className="p-6 text-center">Chargement des entreprises...</div>;
  }

  if (!selectedCompany) {
    return <div className="p-6 text-center text-red-600">Aucune entreprise disponible.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center">
            <SparklesIcon className="h-10 w-10 mr-3 text-blue-600" />
            Gestion des Accès Basée sur le CA
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Système intelligent d'adaptation des droits selon le chiffre d'affaires
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold shadow-lg">
            DÉMO INTERACTIVE
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
          {companies.map((company, index) => {
            const isSelected = index === selectedCompanyIndex;
            const typeInfo = COMPANY_TYPES.find(t => t.id === company.type);
            return (
              <button
                key={company.id}
                onClick={() => setSelectedCompanyIndex(index)}
                className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">{typeInfo?.icon || '🏢'}</div>
                  <h3 className={`font-bold text-sm mb-1 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>{company.name}</h3>
                  <p className="text-xs text-gray-600 mb-2">{company.description}</p>
                  <div className="space-y-1">
                    <div className={`text-lg font-bold ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>{(company.revenue / 1000000).toFixed(1)}M DA</div>
                  </div>
                </div>
                <div className="text-xs">
                  <span className={`inline-flex px-2 py-1 rounded-full font-semibold ${isSelected ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'}`}>{company.type.toUpperCase()}</span>
                </div>
                <div className="text-xs text-gray-500">{company.employees} employés</div>
                {company.growth > 0 && (
                  <div className="text-xs text-green-600 font-semibold">+{company.growth}% croissance</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Widget principal d'analyse */}
      <RevenueBasedAccessWidget
        companyName={selectedCompany.name}
        companyType={selectedCompany.type}
        revenue={selectedCompany.revenue}
        currentAccessLevel={
          selectedCompany.revenue < 5000000 ? 'starter' :
          selectedCompany.revenue < 500000000 ? 'professional' : 'enterprise'
        }
      />

      {/* Widget d'évolution avec graphiques */}
      <EvolutionTrackerWidget
        companyName={selectedCompany.name}
        currentRevenue={selectedCompany.revenue}
      />

      {/* Dashboard adaptatif */}
      <AdaptiveDashboardLayout
        companyName={selectedCompany.name}
        companyType={selectedCompany.type}
        revenue={selectedCompany.revenue}
        accessLevel={
          selectedCompany.revenue < 5000000 ? 'starter' :
          selectedCompany.revenue < 500000000 ? 'professional' : 'enterprise'
        }
      />

      {/* Widget de conformité fiscale */}
      <FiscalComplianceWidget
        revenue={selectedCompany.revenue}
        companyType={selectedCompany.type}
      />

      {/* Légende explicative */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="flex items-center mb-4">
          <ChartBarIcon className="h-6 w-6 text-purple-600 mr-2" />
          <h3 className="text-lg font-bold text-gray-900">Comment ça fonctionne ?</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="font-bold text-gray-900">Analyse Automatique</h4>
            </div>
            <p className="text-sm text-gray-600 pl-10">
              Le système analyse le CA et détermine automatiquement le segment fiscal et les droits adaptés.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="font-bold text-gray-900">Recommandations Intelligentes</h4>
            </div>
            <p className="text-sm text-gray-600 pl-10">
              Des alertes et recommandations personnalisées selon votre situation financière et juridique.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-pink-500 text-white flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="font-bold text-gray-900">Affichage Adaptatif</h4>
            </div>
            <p className="text-sm text-gray-600 pl-10">
              L'interface s'adapte automatiquement avec les modules et fonctionnalités appropriés à votre taille.
            </p>
          </div>
        </div>
      </Card>

      {/* Matrice de référence */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <Cog6ToothIcon className="h-6 w-6 mr-2 text-gray-600" />
          Matrice de Référence : CA × Type d'Entreprise × Niveau d'Accès
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Segment CA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type Recommandé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Niveau d'Accès
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie Fiscale
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modules Clés
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">🏪</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">0 - 5M DA</div>
                      <div className="text-xs text-gray-500">Micro-entreprise</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    EURL
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">Starter</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  Régime simplifié
                </td>
                <td className="px-6 py-4 text-xs text-gray-600">
                  Compta basique, Facturation simple
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">🏢</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">5M - 50M DA</div>
                      <div className="text-xs text-gray-500">Petite entreprise</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    EURL / SARL
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">Professional</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  Régime réel simplifié
                </td>
                <td className="px-6 py-4 text-xs text-gray-600">
                  Compta complète, Stocks, Rapports
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">🏭</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">50M - 500M DA</div>
                      <div className="text-xs text-gray-500">Moyenne entreprise</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    SARL
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">Professional</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  Régime réel normal
                </td>
                <td className="px-6 py-4 text-xs text-gray-600">
                  Analytique, Paie, Consolidation, Audit
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">🏛️</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">500M - 2Mds DA</div>
                      <div className="text-xs text-gray-500">Grande entreprise</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                    SARL / SPA
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">Enterprise</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  Régime normal - Grande
                </td>
                <td className="px-6 py-4 text-xs text-gray-600">
                  Multi-sociétés, BI, Risques, Groupe
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">🌐</span>
                    <div>
                      <div className="text-sm font-medium text-gray-900">2Mds DA</div>
                      <div className="text-xs text-gray-500">Très grande / Groupe</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    SPA
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">Enterprise</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  Régime normal - Groupe
                </td>
                <td className="px-6 py-4 text-xs text-gray-600">
                  Groupe international, IFRS, Compliance
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default GestionAccesAvancee;

