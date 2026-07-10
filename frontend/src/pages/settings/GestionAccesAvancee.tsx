import React from 'react';
import {
  ChartBarIcon,
  Cog6ToothIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import RevenueBasedAccessWidget from '@shared/components/Dashboard/RevenueBasedAccessWidget';
import EvolutionTrackerWidget from '@shared/components/Dashboard/EvolutionTrackerWidget';
import AdaptiveDashboardLayout from '@shared/components/Dashboard/AdaptiveDashboardLayout';
import FiscalComplianceWidget from '@shared/components/Dashboard/FiscalComplianceWidget';
import { useApp } from '@core/context/AppContext';

const GestionAccesAvancee: React.FC = () => {
  const { user, companyData } = useApp();

  // Utilise la société réelle de l'utilisateur (CA, type) plutôt qu'une
  // liste de clients CRM traitée à tort comme un catalogue d'entreprises
  // (les clients n'ont ni CA, ni type de société, ni effectif en base).
  const selectedCompany = {
    name: 'Mon entreprise',
    type: user?.companyType || 'sarl',
    revenue: companyData?.revenueTotal || 0
  };

  if (!companyData) {
    return <div className="p-6 text-center">Chargement...</div>;
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





