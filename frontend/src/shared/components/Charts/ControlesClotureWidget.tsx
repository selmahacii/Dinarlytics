import React, { useState } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  EyeIcon,
  PencilIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useApp } from '@core/context/AppContext';
import Card from '../UI/Card';

interface ControlesClotureWidgetProps {
  period: string;
}

const ControlesClotureWidget: React.FC<ControlesClotureWidgetProps> = ({ period }) => {
  const { formatCurrency } = useApp();
  const [selectedControl, setSelectedControl] = useState<string>('equilibre');

  // Données des contrôles de clôture
  const controlesDetaillees = [
    {
      id: 'equilibre',
      title: 'Équilibre des Comptes',
      description: 'Vérification de l\'équilibre débit/crédit',
      status: 'success',
      icon: CheckCircleIcon,
      color: 'green',
      details: {
        totalDebit: 2450000,
        totalCredit: 2450000,
        ecarts: 0,
        comptesVerifies: 1250,
        comptesEnErreur: 0
      },
      alertes: [],
      graphique: {
        type: 'bar',
        data: {
          labels: ['Débit Total', 'Crédit Total'],
          datasets: [{
            label: 'Montants (DA)',
            data: [2450000, 2450000],
            backgroundColor: ['#10B981', '#3B82F6'],
            borderColor: ['#059669', '#2563EB'],
            borderWidth: 1
          }]
        }
      }
    },
    {
      id: 'tva',
      title: 'Contrôle TVA',
      description: 'Vérification des déclarations TVA',
      status: 'warning',
      icon: ExclamationTriangleIcon,
      color: 'yellow',
      details: {
        tvaCollectee: 465500,
        tvaDeductible: 28500,
        tvaAVerser: 437000,
        echeance: '2024-02-25',
        declarations: 1
      },
      alertes: [
        {
          type: 'warning',
          message: 'Échéance de déclaration TVA dans 5 jours',
          action: 'Déclarer TVA'
        }
      ],
      graphique: {
        type: 'doughnut',
        data: {
          labels: ['TVA Collectée', 'TVA Déductible', 'TVA à Verser'],
          datasets: [{
            data: [465500, 28500, 437000],
            backgroundColor: ['#10B981', '#3B82F6', '#F59E0B'],
            borderColor: ['#059669', '#2563EB', '#D97706'],
            borderWidth: 1
          }]
        }
      }
    },
    {
      id: 'stocks',
      title: 'Inventaire des Stocks',
      description: 'Contrôle de l\'inventaire physique',
      status: 'success',
      icon: CheckCircleIcon,
      color: 'green',
      details: {
        valeurTotale: 125000,
        articlesComptes: 45,
        ecartsPositifs: 0,
        ecartsNegatifs: 0,
        pertes: 0
      },
      alertes: [],
      graphique: {
        type: 'bar',
        data: {
          labels: ['Produits Finis', 'Matières Premières', 'Marchandises'],
          datasets: [{
            label: 'Valeur (DA)',
            data: [75000, 35000, 15000],
            backgroundColor: ['#10B981', '#3B82F6', '#8B5CF6'],
            borderColor: ['#059669', '#2563EB', '#7C3AED'],
            borderWidth: 1
          }]
        }
      }
    },
    {
      id: 'creances',
      title: 'Créances Clients',
      description: 'Analyse des créances et provisions',
      status: 'error',
      icon: XCircleIcon,
      color: 'red',
      details: {
        totalCreances: 125000,
        creancesDouteuses: 15000,
        provisions: 5000,
        clientsEnLitige: 3,
        anciennete: 45
      },
      alertes: [
        {
          type: 'error',
          message: '3 créances en litige détectées',
          action: 'Analyser les litiges'
        },
        {
          type: 'warning',
          message: 'Créances anciennes (> 60 jours)',
          action: 'Relancer les clients'
        }
      ],
      graphique: {
        type: 'line',
        data: {
          labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
          datasets: [{
            label: 'Créances Total',
            data: [120000, 125000, 130000, 128000, 125000, 125000],
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4
          }, {
            label: 'Créances Douteuses',
            data: [5000, 8000, 12000, 15000, 15000, 15000],
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4
          }]
        }
      }
    },
    {
      id: 'banque',
      title: 'Rapprochement Bancaire',
      description: 'Vérification des comptes bancaires',
      status: 'success',
      icon: CheckCircleIcon,
      color: 'green',
      details: {
        comptesRapproches: 3,
        ecartsDetectes: 0,
        montantTotal: 450000,
        dernierRapprochement: '2024-01-31',
        operationsEnAttente: 0
      },
      alertes: [],
      graphique: {
        type: 'bar',
        data: {
          labels: ['Compte Principal', 'Compte Secondaire', 'Compte Épargne'],
          datasets: [{
            label: 'Solde (DA)',
            data: [300000, 120000, 30000],
            backgroundColor: ['#10B981', '#3B82F6', '#8B5CF6'],
            borderColor: ['#059669', '#2563EB', '#7C3AED'],
            borderWidth: 1
          }]
        }
      }
    },
    {
      id: 'amortissements',
      title: 'Amortissements',
      description: 'Calcul et contrôle des amortissements',
      status: 'success',
      icon: CheckCircleIcon,
      color: 'green',
      details: {
        immobilisations: 12,
        montantAmorti: 45000,
        tauxMoyen: 20,
        dureeRestante: 4,
        valeurNette: 180000
      },
      alertes: [],
      graphique: {
        type: 'doughnut',
        data: {
          labels: ['Valeur Nette', 'Amortissements'],
          datasets: [{
            data: [180000, 45000],
            backgroundColor: ['#10B981', '#3B82F6'],
            borderColor: ['#059669', '#2563EB'],
            borderWidth: 1
          }]
        }
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircleIcon;
      case 'warning': return ExclamationTriangleIcon;
      case 'error': return XCircleIcon;
      default: return InformationCircleIcon;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-600 bg-green-50 border-green-200';
      case 'yellow': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'red': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const selectedControlData = controlesDetaillees.find(control => control.id === selectedControl);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Contrôles de Clôture</h2>
          <p className="text-sm text-gray-600">Période: {period} | Vérifications automatiques</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <CheckCircleIcon className="h-4 w-4" />
            <span>Lancer Contrôles</span>
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2">
            <DocumentTextIcon className="h-4 w-4" />
            <span>Rapport</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des contrôles */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contrôles Disponibles</h3>
            <div className="space-y-3">
              {controlesDetaillees.map((control) => {
                const Icon = control.icon;
                const StatusIcon = getStatusIcon(control.status);
                return (
                  <div
                    key={control.id}
                    onClick={() => setSelectedControl(control.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedControl === control.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 ${getColorClasses(control.color).split(' ')[0]}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-gray-900">{control.title}</h4>
                          <StatusIcon className={`h-4 w-4 ${getStatusColor(control.status).split(' ')[0]}`} />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{control.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            control.status === 'success' ? 'bg-green-100 text-green-800' :
                            control.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            control.status === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {control.status === 'success' ? 'OK' :
                             control.status === 'warning' ? 'Attention' :
                             control.status === 'error' ? 'Erreur' : 'Info'}
                          </span>
                          {control.alertes.length > 0 && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                              {control.alertes.length} alerte{control.alertes.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Détails du contrôle sélectionné */}
        <div className="lg:col-span-2">
          {selectedControlData && (
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <selectedControlData.icon className={`h-8 w-8 ${getColorClasses(selectedControlData.color).split(' ')[0]}`} />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedControlData.title}</h3>
                  <p className="text-sm text-gray-600">{selectedControlData.description}</p>
                </div>
              </div>

              {/* Alertes */}
              {selectedControlData.alertes.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Alertes</h4>
                  <div className="space-y-2">
                    {selectedControlData.alertes.map((alerte, index) => (
                      <div key={index} className={`p-3 rounded-lg border ${
                        alerte.type === 'error' ? 'bg-red-50 border-red-200' :
                        alerte.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-blue-50 border-blue-200'
                      }`}>
                        <div className="flex items-center justify-between">
                          <p className={`text-sm ${
                            alerte.type === 'error' ? 'text-red-800' :
                            alerte.type === 'warning' ? 'text-yellow-800' :
                            'text-blue-800'
                          }`}>
                            {alerte.message}
                          </p>
                          <button className={`px-3 py-1 text-xs rounded ${
                            alerte.type === 'error' ? 'bg-red-600 text-white hover:bg-red-700' :
                            alerte.type === 'warning' ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                            'bg-blue-600 text-white hover:bg-blue-700'
                          }`}>
                            {alerte.action}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statistiques */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(selectedControlData.details).map(([key, value]) => (
                  <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">
                      {typeof value === 'number' ? formatCurrency(value) : value}
                    </div>
                    <div className="text-xs text-gray-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Graphique */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Visualisation</h4>
                <div className="h-64">
                  {selectedControlData.graphique.type === 'bar' && (
                    <Bar data={selectedControlData.graphique.data} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                      },
                    }} />
                  )}
                  {selectedControlData.graphique.type === 'line' && (
                    <Line data={selectedControlData.graphique.data} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                      },
                    }} />
                  )}
                  {selectedControlData.graphique.type === 'doughnut' && (
                    <Doughnut data={selectedControlData.graphique.data} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom' as const,
                        },
                      },
                    }} />
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center space-x-2">
                  <EyeIcon className="h-4 w-4" />
                  <span>Voir Détails</span>
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                  <PencilIcon className="h-4 w-4" />
                  <span>Corriger</span>
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlesClotureWidget;

