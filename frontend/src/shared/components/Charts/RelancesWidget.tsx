import React, { useState } from 'react';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  BellIcon,
  PaperAirplaneIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import Card from '../UI/Card';

interface RelancesWidgetProps {
  clientId?: string;
}

const RelancesWidget: React.FC<RelancesWidgetProps> = ({ clientId }) => {
  const { formatCurrency } = useApp();
  const { currentTheme } = useTheme();
  const [activeView, setActiveView] = useState<'liste' | 'statistiques' | 'templates' | 'historique'>('liste');
  const [selectedRelance, setSelectedRelance] = useState<string>('');

  // Données de démonstration pour les relances
  const relancesData = [
    {
      id: '1',
      clientId: '1',
      clientName: 'Entreprise ABC',
      factureId: 'F-2024-001',
      montant: 15000,
      dateEcheance: '2024-01-15',
      dateRelance: '2024-01-20',
      type: 'email',
      statut: 'envoyee',
      priorite: 'haute',
      echelon: 1,
      reponse: null,
      prochaineRelance: '2024-01-27',
      notes: 'Client en retard de paiement, première relance envoyée'
    },
    {
      id: '2',
      clientId: '2',
      clientName: 'Société XYZ',
      factureId: 'F-2024-002',
      montant: 8500,
      dateEcheance: '2024-01-10',
      dateRelance: '2024-01-18',
      type: 'telephone',
      statut: 'en_cours',
      priorite: 'moyenne',
      echelon: 2,
      reponse: 'Client promet de payer sous 48h',
      prochaineRelance: '2024-01-25',
      notes: 'Deuxième relance téléphonique, client réactif'
    },
    {
      id: '3',
      clientId: '3',
      clientName: 'Compagnie DEF',
      factureId: 'F-2024-003',
      montant: 25000,
      dateEcheance: '2024-01-05',
      dateRelance: '2024-01-22',
      type: 'courrier',
      statut: 'en_attente',
      priorite: 'critique',
      echelon: 3,
      reponse: null,
      prochaineRelance: '2024-01-29',
      notes: 'Troisième relance par courrier recommandé'
    },
    {
      id: '4',
      clientId: '4',
      clientName: 'Groupe GHI',
      factureId: 'F-2024-004',
      montant: 12000,
      dateEcheance: '2024-01-12',
      dateRelance: '2024-01-19',
      type: 'email',
      statut: 'payee',
      priorite: 'basse',
      echelon: 1,
      reponse: 'Paiement effectué le 20/01/2024',
      prochaineRelance: null,
      notes: 'Relance efficace, paiement reçu rapidement'
    }
  ];

  const statistiquesRelances = {
    totalRelances: 45,
    relancesEnCours: 12,
    relancesPayees: 28,
    relancesEnEchec: 5,
    montantTotal: 125000,
    tauxReussite: 62.2,
    delaiMoyen: 8.5
  };

  const templatesRelances = [
    {
      id: '1',
      nom: '1ère Relance - Email',
      type: 'email',
      sujet: 'Rappel de paiement - Facture {numero_facture}',
      contenu: 'Madame, Monsieur,\n\nNous vous informons que la facture {numero_facture} d\'un montant de {montant} est en retard de paiement depuis le {date_echeance}.\n\nNous vous remercions de bien vouloir procéder au règlement dans les plus brefs délais.\n\nCordialement,',
      echelon: 1,
      delai: 5
    },
    {
      id: '2',
      nom: '2ème Relance - Téléphone',
      type: 'telephone',
      sujet: 'Relance téléphonique - Facture {numero_facture}',
      contenu: 'Script téléphonique pour 2ème relance...',
      echelon: 2,
      delai: 7
    },
    {
      id: '3',
      nom: '3ème Relance - Courrier',
      type: 'courrier',
      sujet: 'Mise en demeure - Facture {numero_facture}',
      contenu: 'Madame, Monsieur,\n\nMalgré nos précédents rappels, la facture {numero_facture} reste impayée...',
      echelon: 3,
      delai: 10
    }
  ];

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'envoyee': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'en_cours': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'en_attente': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'payee': return 'text-green-600 bg-green-50 border-green-200';
      case 'echec': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'envoyee': return CheckCircleIcon;
      case 'en_cours': return ClockIcon;
      case 'en_attente': return ExclamationTriangleIcon;
      case 'payee': return CheckCircleIcon;
      case 'echec': return XCircleIcon;
      default: return ClockIcon;
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'critique': return 'text-red-600 bg-red-50';
      case 'haute': return 'text-orange-600 bg-orange-50';
      case 'moyenne': return 'text-yellow-600 bg-yellow-50';
      case 'basse': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return EnvelopeIcon;
      case 'telephone': return PhoneIcon;
      case 'courrier': return DocumentTextIcon;
      case 'sms': return ChatBubbleLeftRightIcon;
      default: return EnvelopeIcon;
    }
  };

  const renderListeRelances = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-900">Relances en cours</h4>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <PlusIcon className="h-4 w-4" />
          <span>Nouvelle Relance</span>
        </button>
      </div>
      
      <div className="space-y-3">
        {relancesData.map((relance) => {
          const StatutIcon = getStatutIcon(relance.statut);
          const TypeIcon = getTypeIcon(relance.type);
          return (
            <Card key={relance.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <TypeIcon className="h-5 w-5 text-gray-600" />
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900">{relance.clientName}</h5>
                      <p className="text-xs text-gray-500">Facture {relance.factureId}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(relance.montant)}</p>
                    <p className="text-xs text-gray-500">Échéance: {relance.dateEcheance}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatutColor(relance.statut)}`}>
                      <StatutIcon className="h-3 w-3 inline mr-1" />
                      {relance.statut.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getPrioriteColor(relance.priorite)}`}>
                      {relance.priorite}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {relance.reponse && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                  <strong>Réponse:</strong> {relance.reponse}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderStatistiques = () => (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-gray-900">Statistiques des Relances</h4>
      
      {/* Métriques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Relances</p>
              <p className="text-2xl font-bold text-blue-800">{statistiquesRelances.totalRelances}</p>
            </div>
            <BellIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">En Cours</p>
              <p className="text-2xl font-bold text-yellow-800">{statistiquesRelances.relancesEnCours}</p>
            </div>
            <ClockIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Payées</p>
              <p className="text-2xl font-bold text-green-800">{statistiquesRelances.relancesPayees}</p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="p-4 bg-red-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">En Échec</p>
              <p className="text-2xl font-bold text-red-800">{statistiquesRelances.relancesEnEchec}</p>
            </div>
            <XCircleIcon className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h5 className="text-sm font-semibold text-gray-900 mb-3">Répartition par Statut</h5>
          <div className="h-48">
            <Doughnut
              data={{
                labels: ['Payées', 'En Cours', 'En Attente', 'En Échec'],
                datasets: [{
                  data: [28, 12, 3, 2],
                  backgroundColor: ['#10B981', '#F59E0B', '#F97316', '#EF4444'],
                  borderColor: ['#059669', '#D97706', '#EA580C', '#DC2626'],
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                },
              }}
            />
          </div>
        </Card>

        <Card className="p-4">
          <h5 className="text-sm font-semibold text-gray-900 mb-3">Évolution Mensuelle</h5>
          <div className="h-48">
            <Line
              data={{
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
                datasets: [{
                  label: 'Relances Envoyées',
                  data: [12, 19, 15, 25, 22, 30],
                  borderColor: '#3B82F6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  tension: 0.4
                }, {
                  label: 'Relances Payées',
                  data: [8, 15, 12, 20, 18, 25],
                  borderColor: '#10B981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  tension: 0.4
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-semibold text-gray-900">Templates de Relances</h4>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <PlusIcon className="h-4 w-4" />
          <span>Nouveau Template</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templatesRelances.map((template) => {
          const TypeIcon = getTypeIcon(template.type);
          return (
            <Card key={template.id} className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <TypeIcon className="h-6 w-6 text-blue-600" />
                <div>
                  <h5 className="text-sm font-semibold text-gray-900">{template.nom}</h5>
                  <p className="text-xs text-gray-500">Échelon {template.echelon} - Délai: {template.delai}j</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{template.contenu}</p>
              <div className="flex justify-end space-x-2">
                <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button className="p-1 text-green-600 hover:bg-green-100 rounded">
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderHistorique = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-gray-900">Historique des Relances</h4>
      
      <div className="space-y-3">
        {relancesData.map((relance) => {
          const StatutIcon = getStatutIcon(relance.statut);
          const TypeIcon = getTypeIcon(relance.type);
          return (
            <div key={relance.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <TypeIcon className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{relance.clientName}</p>
                  <p className="text-xs text-gray-500">{relance.dateRelance}</p>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">Facture {relance.factureId} - {formatCurrency(relance.montant)}</p>
                <p className="text-xs text-gray-500">Échelon {relance.echelon}</p>
              </div>
              <div className="flex items-center space-x-2">
                <StatutIcon className={`h-4 w-4 ${getStatutColor(relance.statut).split(' ')[0]}`} />
                <span className="text-xs text-gray-600">{relance.statut.replace('_', ' ')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestion des Relances</h2>
          <p className="text-sm text-gray-600">Suivi et automatisation des relances clients</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <PaperAirplaneIcon className="h-4 w-4" />
            <span>Envoyer Relances</span>
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
            <BellIcon className="h-4 w-4" />
            <span>Programmer</span>
          </button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'liste', label: 'LISTE', icon: DocumentTextIcon },
            { id: 'statistiques', label: 'STATISTIQUES', icon: ChartBarIcon },
            { id: 'templates', label: 'TEMPLATES', icon: DocumentTextIcon },
            { id: 'historique', label: 'HISTORIQUE', icon: ClockIcon }
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
        {activeView === 'liste' && renderListeRelances()}
        {activeView === 'statistiques' && renderStatistiques()}
        {activeView === 'templates' && renderTemplates()}
        {activeView === 'historique' && renderHistorique()}
      </div>
    </div>
  );
};

export default RelancesWidget;
