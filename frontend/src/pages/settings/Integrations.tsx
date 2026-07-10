import React, { useState } from 'react';
import { 
  LinkIcon,
  CloudIcon,
  BanknotesIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  CogIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';

const Integrations: React.FC = () => {
  const { formatCurrency } = useApp();
  const { t } = useTranslation();
  
  const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);

  // Catalogue des intégrations tierces prises en charge — aucune n'est
  // réellement connectée (pas d'OAuth/API key configurée côté backend),
  // donc pas de statut "actif" ni de données de synchronisation inventées.
  const integrations = [
    {
      id: '1',
      nom: 'Banque Extérieure d\'Algérie (BEA)',
      type: 'bancaire',
      statut: 'non_connecte',
      description: 'Synchronisation automatique des comptes bancaires',
      configuration: {
        url: 'https://api.bea.dz/v1',
        authentification: 'OAuth 2.0',
        frequence: 'Toutes les 30 minutes'
      }
    },
    {
      id: '2',
      nom: 'Shopify Store',
      type: 'ecommerce',
      statut: 'non_connecte',
      description: 'Synchronisation des commandes et produits',
      configuration: {
        url: '',
        authentification: 'API Key',
        frequence: 'Toutes les 15 minutes'
      }
    },
    {
      id: '3',
      nom: 'Google Workspace',
      type: 'productivite',
      statut: 'non_connecte',
      description: 'Synchronisation des contacts et calendrier',
      configuration: {
        url: 'https://workspace.google.com',
        authentification: 'OAuth 2.0',
        frequence: 'Toutes les heures'
      }
    },
    {
      id: '4',
      nom: 'DocuSign',
      type: 'signature',
      statut: 'non_connecte',
      description: 'Signature électronique des documents',
      configuration: {
        url: 'https://docusign.com',
        authentification: 'API Key',
        frequence: 'Manuelle'
      }
    },
    {
      id: '5',
      nom: 'SAP Business One',
      type: 'erp',
      statut: 'non_connecte',
      description: 'Intégration ERP complète',
      configuration: {
        url: '',
        authentification: 'SAML',
        frequence: 'Toutes les 6 heures'
      }
    }
  ];

  // APIs REST réellement exposées par le backend (voir backend/app/api/v1) —
  // pas de comptage de requêtes/quota, aucun suivi d'usage par endpoint
  // n'est implémenté côté serveur.
  const apis = [
    {
      id: '1',
      nom: 'API Clients',
      endpoint: '/api/v1/clients',
      methodes: ['GET', 'POST', 'PUT', 'DELETE'],
      description: 'Gestion des clients via API REST',
      statut: 'active'
    },
    {
      id: '2',
      nom: 'API Factures',
      endpoint: '/api/v1/invoices',
      methodes: ['GET', 'POST', 'PUT'],
      description: 'Gestion des factures via API REST',
      statut: 'active'
    },
    {
      id: '3',
      nom: 'API Rapports',
      endpoint: '/api/v1/reports',
      methodes: ['GET'],
      description: 'Génération de rapports via API',
      statut: 'active'
    }
  ];

  // Aucun système de webhooks n'existe côté backend.
  const webhooks: Array<{ id: string; nom: string; url: string; evenement: string; statut: string }> = [];

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'non_connecte': return 'bg-gray-100 text-gray-600';
      case 'beta': return 'bg-yellow-100 text-yellow-800';
      case 'configuration': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bancaire': return '🏦';
      case 'ecommerce': return '🛒';
      case 'productivite': return '📊';
      case 'signature': return '✍️';
      case 'erp': return '🏢';
      default: return '🔗';
    }
  };

  const handleIntegrationClick = (integration: any) => {
    setSelectedIntegration(integration);
    setIsIntegrationModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔗 Intégrations & Écosystème Connecté
        </h1>
        <p className="text-gray-600">
          Connectez Dinarlytic avec vos outils existants via des intégrations puissantes et des APIs complètes.
        </p>
      </div>

      {/* Intégrations Actives */}
      <Card title="🔌 Intégrations Actives">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Services Connectés</h3>
            <button
              onClick={() => setIsIntegrationModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Ajouter une Intégration"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Ajouter une Intégration
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <div 
                key={integration.id} 
                className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleIntegrationClick(integration)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getTypeIcon(integration.type)}</span>
                    <div>
                      <h4 className="font-semibold text-gray-900">{integration.nom}</h4>
                      <p className="text-sm text-gray-600">{integration.type}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(integration.statut)}`}>
                    {integration.statut}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3">{integration.description}</p>

                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-400 italic">
                  Non connecté — configuration requise
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* APIs REST */}
      <Card title="🌐 APIs REST">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Endpoints API</h3>
            <button
              onClick={() => setIsApiModalOpen(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CogIcon className="h-5 w-5 mr-2" />
              Gérer les APIs
            </button>
          </div>

          <div className="space-y-4">
            {apis.map((api) => (
              <div key={api.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{api.nom}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatutColor(api.statut)}`}>
                        {api.statut}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{api.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span><strong>Endpoint:</strong> {api.endpoint}</span>
                      <span><strong>Méthodes:</strong> {api.methodes.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Webhooks */}
      <Card title="🔔 Webhooks">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Notifications en Temps Réel</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setIsWebhookModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg"
                title="Ajouter un Webhook"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Ajouter
              </button>
              <button
                onClick={() => setIsWebhookModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
                title="Configurer Webhook"
              >
                <LinkIcon className="h-5 w-5 mr-2" />
                Configurer
              </button>
            </div>
          </div>
          {webhooks.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-2xl">
              Aucun système de webhooks n'est encore disponible.
            </div>
          )}
        </div>
      </Card>

      {/* Marketplace d'Intégrations */}
      <Card title="🛍️ Marketplace d'Intégrations">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Intégrations Disponibles</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Aucune de ces intégrations n'est encore implémentée côté
                backend — toutes sont donc "bientôt", pas "disponible". */}
            {[
              { nom: 'Stripe', type: 'paiement', statut: 'bientot', icone: '💳' },
              { nom: 'PayPal', type: 'paiement', statut: 'bientot', icone: '💰' },
              { nom: 'WooCommerce', type: 'ecommerce', statut: 'bientot', icone: '🛒' },
              { nom: 'Magento', type: 'ecommerce', statut: 'bientot', icone: '🏪' },
              { nom: 'Salesforce', type: 'crm', statut: 'bientot', icone: '☁️' },
              { nom: 'HubSpot', type: 'crm', statut: 'bientot', icone: '🎯' },
              { nom: 'Slack', type: 'communication', statut: 'bientot', icone: '💬' },
              { nom: 'Microsoft Teams', type: 'communication', statut: 'bientot', icone: '👥' },
              { nom: 'QuickBooks', type: 'comptabilite', statut: 'bientot', icone: '📊' },
              { nom: 'Xero', type: 'comptabilite', statut: 'bientot', icone: '📈' },
              { nom: 'Mailchimp', type: 'marketing', statut: 'bientot', icone: '📧' },
              { nom: 'Zapier', type: 'automatisation', statut: 'bientot', icone: '⚡' }
            ].map((integration, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                <div className="text-3xl mb-2">{integration.icone}</div>
                <h4 className="font-semibold text-gray-900 mb-1">{integration.nom}</h4>
                <p className="text-sm text-gray-600 mb-2">{integration.type}</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  integration.statut === 'disponible' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {integration.statut === 'disponible' ? 'Disponible' : 'Bientôt'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Modal
        isOpen={isIntegrationModalOpen}
        onClose={() => setIsIntegrationModalOpen(false)}
        title={selectedIntegration?.nom || 'Configuration d\'Intégration'}
      >
        {selectedIntegration && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Configuration</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p><strong>URL:</strong> {selectedIntegration.configuration.url || '—'}</p>
                <p><strong>Authentification:</strong> {selectedIntegration.configuration.authentification}</p>
                <p><strong>Fréquence:</strong> {selectedIntegration.configuration.frequence}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
              Cette intégration n'est pas encore connectée. Sa mise en place nécessite une configuration côté administrateur.
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        title="Gestion des APIs"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Cette fonctionnalité permettrait de gérer les APIs REST de l'application.
          </p>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-2">Fonctionnalités disponibles :</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Documentation interactive (Swagger/OpenAPI)</li>
              <li>• Gestion des clés API et authentification</li>
              <li>• Monitoring des performances et quotas</li>
              <li>• Tests d'API intégrés</li>
              <li>• Versioning et rétrocompatibilité</li>
            </ul>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isWebhookModalOpen}
        onClose={() => setIsWebhookModalOpen(false)}
        title="Configuration des Webhooks"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Cette fonctionnalité permettrait de configurer des webhooks pour les notifications en temps réel.
          </p>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">Événements disponibles :</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• facture.created - Nouvelle facture créée</li>
              <li>• paiement.received - Paiement reçu</li>
              <li>• stock.minimum - Stock minimum atteint</li>
              <li>• client.updated - Client modifié</li>
              <li>• rapport.generated - Rapport généré</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Integrations;




