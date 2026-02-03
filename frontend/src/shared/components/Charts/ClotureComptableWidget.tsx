import React, { useState } from 'react';
import {
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CalculatorIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  InformationCircleIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';

interface ClotureComptableWidgetProps {
  period: string;
}

const ClotureComptableWidget: React.FC<ClotureComptableWidgetProps> = ({ period }) => {
  const { formatCurrency } = useApp();
  const { currentTheme } = useTheme();
  const [activeView, setActiveView] = useState<'etapes' | 'controles' | 'rapports'>('etapes');
  const [selectedStep, setSelectedStep] = useState<string>('preparation');

  // Données de démonstration pour la clôture
  const clotureSteps = [
    {
      id: 'preparation',
      title: 'Préparation',
      description: 'Vérification des écritures et rapprochements',
      status: 'completed',
      progress: 100,
      items: [
        { name: 'Vérification des écritures', status: 'completed', count: 1250 },
        { name: 'Rapprochement bancaire', status: 'completed', count: 3 },
        { name: 'Contrôle des stocks', status: 'completed', count: 45 },
        { name: 'Validation des factures', status: 'completed', count: 320 }
      ]
    },
    {
      id: 'ajustements',
      title: 'Ajustements',
      description: 'Écritures d\'ajustement et provisions',
      status: 'in_progress',
      progress: 75,
      items: [
        { name: 'Amortissements', status: 'completed', count: 12 },
        { name: 'Provisions créances', status: 'in_progress', count: 5 },
        { name: 'Ajustement stocks', status: 'pending', count: 0 },
        { name: 'Provisions risques', status: 'pending', count: 0 }
      ]
    },
    {
      id: 'validation',
      title: 'Validation',
      description: 'Contrôles et validation finale',
      status: 'pending',
      progress: 0,
      items: [
        { name: 'Équilibre des comptes', status: 'pending', count: 0 },
        { name: 'Contrôle TVA', status: 'pending', count: 0 },
        { name: 'Validation des soldes', status: 'pending', count: 0 },
        { name: 'Génération des rapports', status: 'pending', count: 0 }
      ]
    },
    {
      id: 'finalisation',
      title: 'Finalisation',
      description: 'Clôture définitive et archivage',
      status: 'pending',
      progress: 0,
      items: [
        { name: 'Clôture des journaux', status: 'pending', count: 0 },
        { name: 'Archivage des documents', status: 'pending', count: 0 },
        { name: 'Génération des états', status: 'pending', count: 0 },
        { name: 'Sauvegarde des données', status: 'pending', count: 0 }
      ]
    }
  ];

  const controlesComptables = [
    {
      id: 'equilibre',
      title: 'Équilibre des Comptes',
      status: 'success',
      message: 'Tous les comptes sont équilibrés',
      details: 'Débit total: 2,450,000 DA | Crédit total: 2,450,000 DA',
      icon: CheckCircleIcon
    },
    {
      id: 'tva',
      title: 'Contrôle TVA',
      status: 'warning',
      message: 'Vérification des déclarations TVA en cours',
      details: 'TVA à verser: 437,000 DA | Échéance: 25/02/2024',
      icon: ExclamationTriangleIcon
    },
    {
      id: 'stocks',
      title: 'Inventaire Stocks',
      status: 'success',
      message: 'Inventaire terminé avec succès',
      details: 'Valeur totale: 125,000 DA | 45 articles comptés',
      icon: CheckCircleIcon
    },
    {
      id: 'creances',
      title: 'Créances Clients',
      status: 'error',
      message: 'Créances douteuses détectées',
      details: '3 créances en litige pour 15,000 DA',
      icon: XCircleIcon
    },
    {
      id: 'banque',
      title: 'Rapprochement Bancaire',
      status: 'success',
      message: 'Tous les comptes bancaires sont rapprochés',
      details: '3 comptes vérifiés | Écarts: 0 DA',
      icon: CheckCircleIcon
    },
    {
      id: 'amortissements',
      title: 'Amortissements',
      status: 'success',
      message: 'Calcul des amortissements terminé',
      details: '12 immobilisations amorties | Total: 45,000 DA',
      icon: CheckCircleIcon
    }
  ];

  const rapportsCloture = [
    {
      id: 'bilan',
      title: 'Bilan Comptable',
      status: 'ready',
      date: '2024-01-31',
      montant: 2450000,
      type: 'bilan'
    },
    {
      id: 'resultat',
      title: 'Compte de Résultat',
      status: 'ready',
      date: '2024-01-31',
      montant: 125000,
      type: 'resultat'
    },
    {
      id: 'tresorerie',
      title: 'Tableau de Trésorerie',
      status: 'ready',
      date: '2024-01-31',
      montant: 450000,
      type: 'tresorerie'
    },
    {
      id: 'annexe',
      title: 'Annexe Comptable',
      status: 'pending',
      date: '2024-01-31',
      montant: 0,
      type: 'annexe'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending': return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircleIcon;
      case 'in_progress': return ClockIcon;
      case 'pending': return ClockIcon;
      case 'error': return XCircleIcon;
      case 'success': return CheckCircleIcon;
      case 'warning': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  const renderEtapes = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clotureSteps.map((step) => {
          const StatusIcon = getStatusIcon(step.status);
          return (
            <Card key={step.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <StatusIcon className={`h-6 w-6 ${getStatusColor(step.status).split(' ')[0]}`} />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{step.title}</h4>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{step.progress}%</div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        step.status === 'completed' ? 'bg-green-500' :
                        step.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                      style={{ width: `${step.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                {step.items.map((item, index) => {
                  const ItemIcon = getStatusIcon(item.status);
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <ItemIcon className={`h-4 w-4 ${getStatusColor(item.status).split(' ')[0]}`} />
                        <span className="text-sm text-gray-700">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.count}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderControles = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {controlesComptables.map((controle) => {
          const Icon = controle.icon;
          return (
            <Card key={controle.id} className="p-4">
              <div className="flex items-start space-x-3">
                <Icon className={`h-6 w-6 mt-1 ${getStatusColor(controle.status).split(' ')[0]}`} />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{controle.title}</h4>
                  <p className="text-xs text-gray-600 mb-2">{controle.message}</p>
                  <p className="text-xs text-gray-500">{controle.details}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderRapports = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rapportsCloture.map((rapport) => (
          <Card key={rapport.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{rapport.title}</h4>
                  <p className="text-xs text-gray-500">Date: {rapport.date}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                rapport.status === 'ready' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {rapport.status === 'ready' ? 'Prêt' : 'En attente'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">
                {rapport.montant > 0 ? formatCurrency(rapport.montant) : 'Non calculé'}
              </span>
              <div className="flex space-x-2">
                <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                  <DocumentArrowDownIcon className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                  <PrinterIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Clôture Comptable</h2>
          <p className="text-sm text-gray-600">Période: {period} | Statut: En cours</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <PlayIcon className="h-4 w-4" />
            <span>Démarrer</span>
          </button>
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2">
            <PauseIcon className="h-4 w-4" />
            <span>Pause</span>
          </button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'etapes', label: 'ÉTAPES', icon: CalendarIcon },
            { id: 'controles', label: 'CONTRÔLES', icon: CheckCircleIcon },
            { id: 'rapports', label: 'RAPPORTS', icon: DocumentTextIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center py-3 px-1 border-b-2 font-medium text-sm ${
                  activeView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="mt-6">
        {activeView === 'etapes' && renderEtapes()}
        {activeView === 'controles' && renderControles()}
        {activeView === 'rapports' && renderRapports()}
      </div>
    </div>
  );
};

export default ClotureComptableWidget;
