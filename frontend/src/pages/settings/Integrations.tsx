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

  // Données de démonstration pour les intégrations
  const integrations = [
    {
      id: '1',
      nom: 'Banque Extérieure d\'Algérie (BEA)',
      type: 'bancaire',
      statut: 'active',
      description: 'Synchronisation automatique des comptes bancaires',
      derniereSync: '2025-01-15 14:30',
      prochaineSync: '2025-01-15 15:00',
      donnees: {
        comptes: 3,
        transactions: 1250,
        solde: 2500000
      },
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
      statut: 'active',
      description: 'Synchronisation des commandes et produits',
      derniereSync: '2025-01-15 14:25',
      prochaineSync: '2025-01-15 14:55',
      donnees: {
        commandes: 45,
        produits: 120,
        ca: 180000
      },
      configuration: {
        url: 'https://dinarlytic.myshopify.com',
        authentification: 'API Key',
        frequence: 'Toutes les 15 minutes'
      }
    },
    {
      id: '3',
      nom: 'Google Workspace',
      type: 'productivite',
      statut: 'active',
      description: 'Synchronisation des contacts et calendrier',
      derniereSync: '2025-01-15 14:20',
      prochaineSync: '2025-01-15 15:20',
      donnees: {
        contacts: 500,
        evenements: 25,
        documents: 150
      },
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
      statut: 'inactive',
      description: 'Signature électronique des documents',
      derniereSync: '2025-01-10 09:15',
      prochaineSync: 'Non programmée',
      donnees: {
        documents: 0,
        signatures: 0,
        envois: 0
      },
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
      statut: 'configuration',
      description: 'Intégration ERP complète',
      derniereSync: 'Jamais',
      prochaineSync: 'Après configuration',
      donnees: {
        modules: 0,
        donnees: 0,
        synchronise: 0
      },
      configuration: {
        url: 'https://sap.businessone.com',
        authentification: 'SAML',
        frequence: 'Toutes les 6 heures'
      }
    }
  ];

  // Données de démonstration pour les APIs
  const apis = [
    {
      id: '1',
      nom: 'API Clients',
      endpoint: '/api/v1/clients',
      methodes: ['GET', 'POST', 'PUT', 'DELETE'],
      description: 'Gestion des clients via API REST',
      version: '1.2.0',
      statut: 'active',
      requetes: 15420,
      limite: 10000,
      documentation: 'https://api.dinarlytic.dz/docs/clients'
    },
    {
      id: '2',
      nom: 'API Factures',
      endpoint: '/api/v1/factures',
      methodes: ['GET', 'POST', 'PUT'],
      description: 'Gestion des factures via API REST',
      version: '1.1.5',
      statut: 'active',
      requetes: 8750,
      limite: 5000,
      documentation: 'https://api.dinarlytic.dz/docs/factures'
    },
    {
      id: '3',
      nom: 'API Rapports',
      endpoint: '/api/v1/rapports',
      methodes: ['GET', 'POST'],
      description: 'Génération de rapports via API',
      version: '1.0.3',
      statut: 'beta',
      requetes: 2100,
      limite: 1000,
      documentation: 'https://api.dinarlytic.dz/docs/rapports'
    }
  ];

  // Données de démonstration pour les webhooks
  const webhooks = [
    {
      id: '1',
      nom: 'Nouvelle Facture',
      url: 'https://webhook.site/abc123',
      evenement: 'facture.created',
      statut: 'active',
      derniereExecution: '2025-01-15 14:30:15',
      executions: 45,
      succes: 42,
      echecs: 3
    },
    {
      id: '2',
      nom: 'Paiement Reçu',
      url: 'https://webhook.site/def456',
      evenement: 'paiement.received',
      statut: 'active',
      derniereExecution: '2025-01-15 14:25:30',
      executions: 28,
      succes: 28,
      echecs: 0
    },
    {
      id: '3',
      nom: 'Stock Minimum',
      url: 'https://webhook.site/ghi789',
      evenement: 'stock.minimum',
      statut: 'inactive',
      derniereExecution: '2025-01-10 09:15:00',
      executions: 5,
      succes: 5,
      echecs: 0
    }
  ];

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
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

                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Dernière sync:</span>
                    <span>{integration.derniereSync}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prochaine sync:</span>
                    <span>{integration.prochaineSync}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Données synchronisées</span>
                    <div className="flex space-x-2">
                      <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Voir détails">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-green-600 transition-colors" title="Synchroniser">
                        <ArrowPathIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
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
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        v{api.version}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{api.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span><strong>Endpoint:</strong> {api.endpoint}</span>
                      <span><strong>Méthodes:</strong> {api.methodes.join(', ')}</span>
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">Requêtes:</span>
                        <span className="font-semibold">{api.requetes.toLocaleString()}</span>
                        <span className="text-gray-500">/ {api.limite.toLocaleString()}</span>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(api.requetes / api.limite) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Voir API">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Modifier API">
                      <PencilIcon className="h-4 w-4" />
                    </button>
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
          {/* Example webhooks array mapping, ensure webhooks is defined in your state */}
          {(webhooks || []).map((webhook, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{webhook.nom}</h4>
                  <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${getStatutColor(webhook.statut)}`}>
                    {webhook.statut}
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-500 overflow-hidden">
                  <p className="truncate"><strong>URL:</strong> {webhook.url}</p>
                  <p><strong>Événement:</strong> <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">{webhook.evenement}</span></p>
                  <p><strong>Dernière exécution:</strong> {webhook.derniereExecution}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircleIcon className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600">{webhook.succes} succès</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <XMarkIcon className="h-3.5 w-3.5 text-rose-500" />
                    <span className="text-rose-600">{webhook.echecs} échecs</span>
                  </div>
                  <div className="text-slate-400">Total: {webhook.executions}</div>
                </div>
              </div>
              <div className="flex sm:flex-col justify-end gap-2 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="Voir Webhook">
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Relancer Webhook">
                  <ArrowPathIcon className="h-5 w-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Supprimer Webhook">
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Marketplace d'Intégrations */}
      <Card title="🛍️ Marketplace d'Intégrations">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Intégrations Disponibles</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { nom: 'Stripe', type: 'paiement', statut: 'disponible', icone: '💳' },
              { nom: 'PayPal', type: 'paiement', statut: 'disponible', icone: '💰' },
              { nom: 'WooCommerce', type: 'ecommerce', statut: 'disponible', icone: '🛒' },
              { nom: 'Magento', type: 'ecommerce', statut: 'bientot', icone: '🏪' },
              { nom: 'Salesforce', type: 'crm', statut: 'disponible', icone: '☁️' },
              { nom: 'HubSpot', type: 'crm', statut: 'disponible', icone: '🎯' },
              { nom: 'Slack', type: 'communication', statut: 'disponible', icone: '💬' },
              { nom: 'Microsoft Teams', type: 'communication', statut: 'bientot', icone: '👥' },
              { nom: 'QuickBooks', type: 'comptabilite', statut: 'disponible', icone: '📊' },
              { nom: 'Xero', type: 'comptabilite', statut: 'bientot', icone: '📈' },
              { nom: 'Mailchimp', type: 'marketing', statut: 'disponible', icone: '📧' },
              { nom: 'Zapier', type: 'automatisation', statut: 'disponible', icone: '⚡' }
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

      {/* Modals de démonstration */}
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
                <p><strong>URL:</strong> {selectedIntegration.configuration.url}</p>
                <p><strong>Authentification:</strong> {selectedIntegration.configuration.authentification}</p>
                <p><strong>Fréquence:</strong> {selectedIntegration.configuration.frequence}</p>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">Données Synchronisées</h4>
              <div className="space-y-1 text-sm text-green-800">
                {Object.entries(selectedIntegration.donnees).map(([key, value]) => (
                  <p key={key}><strong>{key}:</strong> {typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value)}</p>
                ))}
              </div>
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




