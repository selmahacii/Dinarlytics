import React, { useState } from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  CalculatorIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';

interface EtapesClotureWidgetProps {
  period: string;
}

const EtapesClotureWidget: React.FC<EtapesClotureWidgetProps> = ({ period }) => {
  const { formatCurrency } = useApp();
  const { currentTheme } = useTheme();
  const [selectedStep, setSelectedStep] = useState<string>('preparation');

  // Données détaillées des étapes de clôture
  const etapesDetaillees = [
    {
      id: 'preparation',
      title: 'Préparation de la Clôture',
      description: 'Vérification et validation des écritures comptables',
      status: 'completed',
      progress: 100,
      icon: DocumentTextIcon,
      color: 'green',
      details: {
        totalEcritures: 1250,
        ecrituresValidees: 1250,
        ecrituresEnAttente: 0,
        rapprochements: 3,
        controles: 45
      },
      sousEtapes: [
        {
          id: 'verification_ecritures',
          title: 'Vérification des Écritures',
          description: 'Contrôle de la cohérence des écritures comptables',
          status: 'completed',
          items: [
            { name: 'Écritures de vente', count: 320, status: 'completed' },
            { name: 'Écritures d\'achat', count: 180, status: 'completed' },
            { name: 'Écritures de banque', count: 450, status: 'completed' },
            { name: 'Écritures diverses', count: 300, status: 'completed' }
          ]
        },
        {
          id: 'rapprochement_bancaire',
          title: 'Rapprochement Bancaire',
          description: 'Vérification des comptes bancaires',
          status: 'completed',
          items: [
            { name: 'Compte principal (5121)', count: 1, status: 'completed' },
            { name: 'Compte secondaire (5122)', count: 1, status: 'completed' },
            { name: 'Compte épargne (5123)', count: 1, status: 'completed' }
          ]
        },
        {
          id: 'controle_stocks',
          title: 'Contrôle des Stocks',
          description: 'Vérification de l\'inventaire physique',
          status: 'completed',
          items: [
            { name: 'Produits finis', count: 25, status: 'completed' },
            { name: 'Matières premières', count: 15, status: 'completed' },
            { name: 'Marchandises', count: 5, status: 'completed' }
          ]
        }
      ]
    },
    {
      id: 'ajustements',
      title: 'Écritures d\'Ajustement',
      description: 'Calcul et enregistrement des ajustements',
      status: 'in_progress',
      progress: 75,
      icon: CalculatorIcon,
      color: 'blue',
      details: {
        amortissements: 12,
        provisions: 5,
        ajustements: 3,
        totalMontant: 125000
      },
      sousEtapes: [
        {
          id: 'amortissements',
          title: 'Calcul des Amortissements',
          description: 'Amortissement des immobilisations',
          status: 'completed',
          items: [
            { name: 'Matériel informatique', count: 5, status: 'completed' },
            { name: 'Mobilier de bureau', count: 3, status: 'completed' },
            { name: 'Véhicules', count: 2, status: 'completed' },
            { name: 'Matériel industriel', count: 2, status: 'completed' }
          ]
        },
        {
          id: 'provisions',
          title: 'Provisions et Risques',
          description: 'Calcul des provisions nécessaires',
          status: 'in_progress',
          items: [
            { name: 'Provisions créances douteuses', count: 3, status: 'in_progress' },
            { name: 'Provisions risques', count: 2, status: 'pending' },
            { name: 'Provisions charges', count: 0, status: 'pending' }
          ]
        },
        {
          id: 'ajustement_stocks',
          title: 'Ajustement des Stocks',
          description: 'Ajustement des écarts d\'inventaire',
          status: 'pending',
          items: [
            { name: 'Écarts positifs', count: 0, status: 'pending' },
            { name: 'Écarts négatifs', count: 0, status: 'pending' },
            { name: 'Pertes et casses', count: 0, status: 'pending' }
          ]
        }
      ]
    },
    {
      id: 'validation',
      title: 'Validation et Contrôles',
      description: 'Contrôles finaux et validation',
      status: 'pending',
      progress: 0,
      icon: CheckCircleIcon,
      color: 'yellow',
      details: {
        controles: 0,
        erreurs: 0,
        avertissements: 0,
        validations: 0
      },
      sousEtapes: [
        {
          id: 'equilibre_comptes',
          title: 'Équilibre des Comptes',
          description: 'Vérification de l\'équilibre débit/crédit',
          status: 'pending',
          items: [
            { name: 'Total débit', count: 0, status: 'pending' },
            { name: 'Total crédit', count: 0, status: 'pending' },
            { name: 'Écarts détectés', count: 0, status: 'pending' }
          ]
        },
        {
          id: 'controle_tva',
          title: 'Contrôle TVA',
          description: 'Vérification des déclarations TVA',
          status: 'pending',
          items: [
            { name: 'TVA collectée', count: 0, status: 'pending' },
            { name: 'TVA déductible', count: 0, status: 'pending' },
            { name: 'TVA à verser', count: 0, status: 'pending' }
          ]
        },
        {
          id: 'validation_soldes',
          title: 'Validation des Soldes',
          description: 'Validation des soldes de fin de période',
          status: 'pending',
          items: [
            { name: 'Soldes clients', count: 0, status: 'pending' },
            { name: 'Soldes fournisseurs', count: 0, status: 'pending' },
            { name: 'Soldes banques', count: 0, status: 'pending' }
          ]
        }
      ]
    },
    {
      id: 'finalisation',
      title: 'Finalisation',
      description: 'Clôture définitive et archivage',
      status: 'pending',
      progress: 0,
      icon: BuildingOfficeIcon,
      color: 'purple',
      details: {
        journaux: 0,
        documents: 0,
        sauvegardes: 0,
        archives: 0
      },
      sousEtapes: [
        {
          id: 'cloture_journaux',
          title: 'Clôture des Journaux',
          description: 'Clôture définitive des journaux comptables',
          status: 'pending',
          items: [
            { name: 'Journal des ventes', count: 0, status: 'pending' },
            { name: 'Journal des achats', count: 0, status: 'pending' },
            { name: 'Journal de banque', count: 0, status: 'pending' },
            { name: 'Journal des opérations diverses', count: 0, status: 'pending' }
          ]
        },
        {
          id: 'generation_rapports',
          title: 'Génération des Rapports',
          description: 'Création des états financiers',
          status: 'pending',
          items: [
            { name: 'Bilan comptable', count: 0, status: 'pending' },
            { name: 'Compte de résultat', count: 0, status: 'pending' },
            { name: 'Tableau de trésorerie', count: 0, status: 'pending' },
            { name: 'Annexe comptable', count: 0, status: 'pending' }
          ]
        },
        {
          id: 'archivage',
          title: 'Archivage et Sauvegarde',
          description: 'Archivage des documents et sauvegarde',
          status: 'pending',
          items: [
            { name: 'Sauvegarde base de données', count: 0, status: 'pending' },
            { name: 'Archivage documents', count: 0, status: 'pending' },
            { name: 'Génération CD-ROM', count: 0, status: 'pending' }
          ]
        }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircleIcon;
      case 'in_progress': return ClockIcon;
      case 'pending': return ClockIcon;
      default: return ClockIcon;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-600 bg-green-50 border-green-200';
      case 'blue': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'yellow': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'purple': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const selectedEtape = etapesDetaillees.find(etape => etape.id === selectedStep);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Étapes de Clôture Comptable</h2>
          <p className="text-sm text-gray-600">Période: {period} | Suivi détaillé des étapes</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <PlayIcon className="h-4 w-4" />
          <span>Démarrer Clôture</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des étapes */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Étapes de Clôture</h3>
            <div className="space-y-3">
              {etapesDetaillees.map((etape, index) => {
                const Icon = etape.icon;
                const StatusIcon = getStatusIcon(etape.status);
                return (
                  <div
                    key={etape.id}
                    onClick={() => setSelectedStep(etape.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedStep === etape.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 ${getColorClasses(etape.color).split(' ')[0]}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-900">{etape.title}</h4>
                          <StatusIcon className={`h-4 w-4 ${getStatusColor(etape.status).split(' ')[0]}`} />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{etape.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="w-20 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                etape.status === 'completed' ? 'bg-green-500' :
                                etape.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                              }`}
                              style={{ width: `${etape.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{etape.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Détails de l'étape sélectionnée */}
        <div className="lg:col-span-2">
          {selectedEtape && (
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <selectedEtape.icon className={`h-8 w-8 ${getColorClasses(selectedEtape.color).split(' ')[0]}`} />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedEtape.title}</h3>
                  <p className="text-sm text-gray-600">{selectedEtape.description}</p>
                </div>
              </div>

              {/* Statistiques de l'étape */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(selectedEtape.details).map(([key, value]) => (
                  <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">{value}</div>
                    <div className="text-xs text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sous-étapes */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Sous-étapes</h4>
                {selectedEtape.sousEtapes.map((sousEtape) => {
                  const StatusIcon = getStatusIcon(sousEtape.status);
                  return (
                    <div key={sousEtape.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`h-5 w-5 ${getStatusColor(sousEtape.status).split(' ')[0]}`} />
                          <h5 className="text-sm font-semibold text-gray-900">{sousEtape.title}</h5>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          sousEtape.status === 'completed' ? 'bg-green-100 text-green-800' :
                          sousEtape.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {sousEtape.status === 'completed' ? 'Terminé' :
                           sousEtape.status === 'in_progress' ? 'En cours' : 'En attente'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-3">{sousEtape.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {sousEtape.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-xs text-gray-700">{item.name}</span>
                            <span className="text-xs font-medium text-gray-900">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EtapesClotureWidget;
