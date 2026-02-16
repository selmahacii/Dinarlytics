import React, { useState } from 'react';
import {
  BuildingOfficeIcon,
  BanknotesIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  CalculatorIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@core/context/ThemeContext';
import { useApp } from '@core/context/AppContext';

interface BilanComptableWidgetProps {
  data: {
    actif: {
      immobilisations: {
        immobilisations_incorporelles: number;
        immobilisations_corporelles: number;
        immobilisations_financieres: number;
      };
      stocks: {
        stocks_marchandises: number;
        stocks_produits_finis: number;
        stocks_matieres_premieres: number;
      };
      creances: {
        clients: number;
        etat: number;
        autres_creances: number;
      };
      disponibilites: {
        banque: number;
        caisse: number;
      };
    };
    passif: {
      capitaux_propres: {
        capital_social: number;
        reserves: number;
        resultat_net: number;
      };
      dettes: {
        dettes_fournisseurs: number;
        dettes_fiscales: number;
        dettes_sociales: number;
        autres_dettes: number;
      };
    };
  };
  period: string;
}

const BilanComptableWidget: React.FC<BilanComptableWidgetProps> = ({ data, period }) => {
  const { currentTheme } = useTheme();
  const { formatCurrency } = useApp();
  const [activeTab, setActiveTab] = useState<'actif' | 'passif' | 'analyse'>('actif');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['immobilisations', 'capitaux_propres']));

  // Calculs des totaux
  const totalActif = 
    data.actif.immobilisations.immobilisations_incorporelles +
    data.actif.immobilisations.immobilisations_corporelles +
    data.actif.immobilisations.immobilisations_financieres +
    data.actif.stocks.stocks_marchandises +
    data.actif.stocks.stocks_produits_finis +
    data.actif.stocks.stocks_matieres_premieres +
    data.actif.creances.clients +
    data.actif.creances.etat +
    data.actif.creances.autres_creances +
    data.actif.disponibilites.banque +
    data.actif.disponibilites.caisse;

  const totalPassif = 
    data.passif.capitaux_propres.capital_social +
    data.passif.capitaux_propres.reserves +
    data.passif.capitaux_propres.resultat_net +
    data.passif.dettes.dettes_fournisseurs +
    data.passif.dettes.dettes_fiscales +
    data.passif.dettes.dettes_sociales +
    data.passif.dettes.autres_dettes;

  // Calculs des ratios
  const ratioLiquidite = (data.actif.disponibilites.banque + data.actif.disponibilites.caisse) / 
    (data.passif.dettes.dettes_fournisseurs + data.passif.dettes.dettes_fiscales + data.passif.dettes.dettes_sociales);
  
  const ratioEndettement = (data.passif.dettes.dettes_fournisseurs + data.passif.dettes.dettes_fiscales + data.passif.dettes.dettes_sociales + data.passif.dettes.autres_dettes) / 
    totalPassif;

  const ratioAutonomie = (data.passif.capitaux_propres.capital_social + data.passif.capitaux_propres.reserves + data.passif.capitaux_propres.resultat_net) / 
    totalPassif;

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getStatusColor = (value: number, threshold: number, isPositive: boolean = true) => {
    if (isPositive) {
      return value >= threshold ? 'text-emerald-600' : 'text-amber-600';
    } else {
      return value <= threshold ? 'text-emerald-600' : 'text-red-600';
    }
  };

  const getStatusIcon = (value: number, threshold: number, isPositive: boolean = true) => {
    if (isPositive) {
      return value >= threshold ? CheckCircleIcon : ExclamationTriangleIcon;
    } else {
      return value <= threshold ? CheckCircleIcon : ExclamationTriangleIcon;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* En-tête du widget */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-600 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">Bilan Comptable</h3>
              <p className="text-sm text-slate-600">Période {period}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors">
              <EyeIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors">
              <DocumentArrowDownIcon className="h-5 w-5" />
            </button>
            <button className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors">
              <PrinterIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'actif', label: 'ACTIF', icon: ArrowTrendingUpIcon, color: 'emerald' },
            { id: 'passif', label: 'PASSIF', icon: ArrowTrendingDownIcon, color: 'blue' },
            { id: 'analyse', label: 'ANALYSE', icon: CalculatorIcon, color: 'purple' }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? `border-${tab.color}-500 text-${tab.color}-600`
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="p-6">
        {activeTab === 'actif' && (
          <div className="space-y-6">
            {/* Total Actif */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-emerald-600" />
                  <div>
                    <h4 className="font-semibold text-emerald-800">TOTAL ACTIF</h4>
                    <p className="text-sm text-emerald-600">Valeur totale des actifs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-800">{formatCurrency(totalActif)}</p>
                  <p className="text-sm text-emerald-600">+5.2% vs période précédente</p>
                </div>
              </div>
            </div>

            {/* Immobilisations */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('immobilisations')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="h-5 w-5 text-slate-600" />
                  <span className="font-medium text-slate-800">IMMOBILISATIONS</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600">
                    {formatCurrency(
                      data.actif.immobilisations.immobilisations_incorporelles +
                      data.actif.immobilisations.immobilisations_corporelles +
                      data.actif.immobilisations.immobilisations_financieres
                    )}
                  </span>
                  <ArrowTrendingUpIcon className={`h-4 w-4 text-slate-400 transition-transform ${
                    expandedSections.has('immobilisations') ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>
              {expandedSections.has('immobilisations') && (
                <div className="px-4 pb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Immobilisations incorporelles:</span>
                    <span className="font-medium">{formatCurrency(data.actif.immobilisations.immobilisations_incorporelles)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Immobilisations corporelles:</span>
                    <span className="font-medium">{formatCurrency(data.actif.immobilisations.immobilisations_corporelles)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Immobilisations financières:</span>
                    <span className="font-medium">{formatCurrency(data.actif.immobilisations.immobilisations_financieres)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Stocks */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('stocks')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <ChartBarIcon className="h-5 w-5 text-slate-600" />
                  <span className="font-medium text-slate-800">STOCKS</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600">
                    {formatCurrency(
                      data.actif.stocks.stocks_marchandises +
                      data.actif.stocks.stocks_produits_finis +
                      data.actif.stocks.stocks_matieres_premieres
                    )}
                  </span>
                  <ArrowTrendingUpIcon className={`h-4 w-4 text-slate-400 transition-transform ${
                    expandedSections.has('stocks') ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>
              {expandedSections.has('stocks') && (
                <div className="px-4 pb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Stocks marchandises:</span>
                    <span className="font-medium">{formatCurrency(data.actif.stocks.stocks_marchandises)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Stocks produits finis:</span>
                    <span className="font-medium">{formatCurrency(data.actif.stocks.stocks_produits_finis)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Stocks matières premières:</span>
                    <span className="font-medium">{formatCurrency(data.actif.stocks.stocks_matieres_premieres)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Créances */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('creances')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <BanknotesIcon className="h-5 w-5 text-slate-600" />
                  <span className="font-medium text-slate-800">CRÉANCES</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600">
                    {formatCurrency(
                      data.actif.creances.clients +
                      data.actif.creances.etat +
                      data.actif.creances.autres_creances
                    )}
                  </span>
                  <ArrowTrendingUpIcon className={`h-4 w-4 text-slate-400 transition-transform ${
                    expandedSections.has('creances') ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>
              {expandedSections.has('creances') && (
                <div className="px-4 pb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Clients:</span>
                    <span className="font-medium">{formatCurrency(data.actif.creances.clients)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">État:</span>
                    <span className="font-medium">{formatCurrency(data.actif.creances.etat)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Autres créances:</span>
                    <span className="font-medium">{formatCurrency(data.actif.creances.autres_creances)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Disponibilités */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('disponibilites')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <BanknotesIcon className="h-5 w-5 text-slate-600" />
                  <span className="font-medium text-slate-800">DISPONIBILITÉS</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600">
                    {formatCurrency(data.actif.disponibilites.banque + data.actif.disponibilites.caisse)}
                  </span>
                  <ArrowTrendingUpIcon className={`h-4 w-4 text-slate-400 transition-transform ${
                    expandedSections.has('disponibilites') ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>
              {expandedSections.has('disponibilites') && (
                <div className="px-4 pb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Banque:</span>
                    <span className="font-medium">{formatCurrency(data.actif.disponibilites.banque)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Caisse:</span>
                    <span className="font-medium">{formatCurrency(data.actif.disponibilites.caisse)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'passif' && (
          <div className="space-y-6">
            {/* Total Passif */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <ArrowTrendingDownIcon className="h-6 w-6 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-blue-800">TOTAL PASSIF</h4>
                    <p className="text-sm text-blue-600">Valeur totale des passifs</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-800">{formatCurrency(totalPassif)}</p>
                  <p className="text-sm text-blue-600">+3.8% vs période précédente</p>
                </div>
              </div>
            </div>

            {/* Capitaux Propres */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('capitaux_propres')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <BuildingOfficeIcon className="h-5 w-5 text-slate-600" />
                  <span className="font-medium text-slate-800">CAPITAUX PROPRES</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600">
                    {formatCurrency(
                      data.passif.capitaux_propres.capital_social +
                      data.passif.capitaux_propres.reserves +
                      data.passif.capitaux_propres.resultat_net
                    )}
                  </span>
                  <ArrowTrendingUpIcon className={`h-4 w-4 text-slate-400 transition-transform ${
                    expandedSections.has('capitaux_propres') ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>
              {expandedSections.has('capitaux_propres') && (
                <div className="px-4 pb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Capital social:</span>
                    <span className="font-medium">{formatCurrency(data.passif.capitaux_propres.capital_social)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Réserves:</span>
                    <span className="font-medium">{formatCurrency(data.passif.capitaux_propres.reserves)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Résultat net:</span>
                    <span className="font-medium text-emerald-600">{formatCurrency(data.passif.capitaux_propres.resultat_net)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Dettes */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('dettes')}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <BanknotesIcon className="h-5 w-5 text-slate-600" />
                  <span className="font-medium text-slate-800">DETTES</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-slate-600">
                    {formatCurrency(
                      data.passif.dettes.dettes_fournisseurs +
                      data.passif.dettes.dettes_fiscales +
                      data.passif.dettes.dettes_sociales +
                      data.passif.dettes.autres_dettes
                    )}
                  </span>
                  <ArrowTrendingUpIcon className={`h-4 w-4 text-slate-400 transition-transform ${
                    expandedSections.has('dettes') ? 'rotate-180' : ''
                  }`} />
                </div>
              </button>
              {expandedSections.has('dettes') && (
                <div className="px-4 pb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Dettes fournisseurs:</span>
                    <span className="font-medium">{formatCurrency(data.passif.dettes.dettes_fournisseurs)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Dettes fiscales:</span>
                    <span className="font-medium">{formatCurrency(data.passif.dettes.dettes_fiscales)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Dettes sociales:</span>
                    <span className="font-medium">{formatCurrency(data.passif.dettes.dettes_sociales)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Autres dettes:</span>
                    <span className="font-medium">{formatCurrency(data.passif.dettes.autres_dettes)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analyse' && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Analyse Financière</h4>
            
            {/* Ratios Financiers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-slate-800">Ratio de Liquidité</h5>
                  {(() => {
                    const StatusIcon = getStatusIcon(ratioLiquidite, 1.5, true);
                    return <StatusIcon className={`h-5 w-5 ${getStatusColor(ratioLiquidite, 1.5, true)}`} />;
                  })()}
                </div>
                <p className="text-2xl font-bold text-slate-800">{ratioLiquidite.toFixed(2)}</p>
                <p className="text-sm text-slate-600">Liquidité générale</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-slate-800">Ratio d'Endettement</h5>
                  {(() => {
                    const StatusIcon = getStatusIcon(ratioEndettement, 0.5, false);
                    return <StatusIcon className={`h-5 w-5 ${getStatusColor(ratioEndettement, 0.5, false)}`} />;
                  })()}
                </div>
                <p className="text-2xl font-bold text-slate-800">{(ratioEndettement * 100).toFixed(1)}%</p>
                <p className="text-sm text-slate-600">Niveau d'endettement</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-slate-800">Ratio d'Autonomie</h5>
                  {(() => {
                    const StatusIcon = getStatusIcon(ratioAutonomie, 0.6, true);
                    return <StatusIcon className={`h-5 w-5 ${getStatusColor(ratioAutonomie, 0.6, true)}`} />;
                  })()}
                </div>
                <p className="text-2xl font-bold text-slate-800">{(ratioAutonomie * 100).toFixed(1)}%</p>
                <p className="text-sm text-slate-600">Autonomie financière</p>
              </div>
            </div>

            {/* Équilibre du Bilan */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                  <div>
                    <h5 className="font-semibold text-slate-800">Équilibre du Bilan</h5>
                    <p className="text-sm text-slate-600">Actif = Passif</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-800">
                    {formatCurrency(totalActif)} = {formatCurrency(totalPassif)}
                  </p>
                  <p className={`text-sm ${Math.abs(totalActif - totalPassif) < 1000 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {Math.abs(totalActif - totalPassif) < 1000 ? '✓ Équilibré' : '⚠ Déséquilibre'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommandations */}
            <div className="space-y-3">
              <h5 className="font-semibold text-slate-800">Recommandations</h5>
              {ratioLiquidite < 1.5 && (
                <div className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Liquidité insuffisante</p>
                    <p className="text-sm text-amber-700">Considérez augmenter les disponibilités ou réduire les dettes à court terme.</p>
                  </div>
                </div>
              )}
              {ratioEndettement > 0.5 && (
                <div className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800">Endettement élevé</p>
                    <p className="text-sm text-red-700">Le niveau d'endettement dépasse 50%. Surveillez la capacité de remboursement.</p>
                  </div>
                </div>
              )}
              {ratioAutonomie > 0.6 && (
                <div className="flex items-start space-x-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-800">Bonne autonomie financière</p>
                    <p className="text-sm text-emerald-700">L'entreprise dispose d'une solide base de capitaux propres.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BilanComptableWidget;


