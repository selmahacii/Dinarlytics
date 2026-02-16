import React, { useState } from 'react';
import { 
  DocumentArrowDownIcon, 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  EyeIcon,
  EnvelopeIcon,
  ChartBarSquareIcon,
  XMarkIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CalculatorIcon,
  BookOpenIcon,
  DocumentCheckIcon,
  ScaleIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';

import { useApp } from '@core/context/AppContext';
import { useTranslation } from '@shared/hooks/useTranslation';
import api from '@/services/api';

const Statistiques: React.FC = () => {
  const { formatCurrency, planComptable } = useApp();
  const { t } = useTranslation();
  
  // États pour les modals
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // Données comptables SCF/IFRS
  const normesComptables = {
    algerien: {
      nom: 'SCF (Système Comptable Financier)',
      code: 'SCF',
      emoji: '🇩🇿',
      comptes: {
        ventes: '701 - Ventes de biens',
        tva: '44571 - TVA collectée',
        clients: '411 - Clients',
        stocks: '31 - Stocks',
        produits: '7011 - Ventes de produits finis',
        charges: '601 - Achats de marchandises',
        immobilisations: '20 - Immobilisations corporelles'
      }
    },
    international: {
      nom: 'IFRS (International Financial Reporting Standards)',
      code: 'IFRS',
      emoji: '🌍',
      comptes: {
        ventes: 'Revenue - Sales of goods',
        tva: 'VAT Payable',
        clients: 'Trade Receivables',
        stocks: 'Inventory',
        produits: 'Sales Revenue',
        charges: 'Cost of Goods Sold',
        immobilisations: 'Property, Plant & Equipment'
      }
    }
  };


  // States for dynamic KPIs and top clients
  const [kpiComptables, setKpiComptables] = useState<any>(null);
  const [loadingKpi, setLoadingKpi] = useState(true);
  const [kpiError, setKpiError] = useState<string | null>(null);
  const [topClients, setTopClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientsError, setClientsError] = useState<string | null>(null);

  // Load KPIs and top clients from backend
  React.useEffect(() => {
    setLoadingKpi(true);
    api.kpis.getKPIs()
      .then(data => {
        setKpiComptables(data);
      })
      .catch(() => setKpiError('Erreur lors du chargement des KPIs'))
      .finally(() => setLoadingKpi(false));

    setLoadingClients(true);
    api.clients.getAll()
      .then(data => {
        // You may need to filter/sort for top clients
        setTopClients(data.slice(0, 3));
      })
      .catch(() => setClientsError('Erreur lors du chargement des clients'))
      .finally(() => setLoadingClients(false));
  }, []);

  // Fonctions de gestion des actions
  const handleViewDetails = (client: any) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
  };

  const handleContact = (client: any) => {
    setSelectedClient(client);
    setShowContactModal(true);
  };

  const handleAnalyze = (client: any) => {
    setSelectedClient(client);
    setShowAnalysisModal(true);
  };

  // Métriques clés pour l'aperçu (peuvent être extraites des KPIs)
  const metriques = kpiComptables?.metriques || {};

  // Jeux de données de secours pour les top clients si l'API ne renvoie rien
  const sampleTopClients = [
    {
      nom: 'Entreprise SARL DZ',
      ca: 850000,
      pourcentage: 26.6,
      croissance: 12.5,
      secteur: 'Services',
      risque: 'faible',
      raisonsTop: [
        'Leader du secteur des services financiers',
        'Croissance constante depuis 3 ans',
        'Portefeuille diversifié et stable',
        'Excellente relation client longue durée'
      ],
      metriques: {
        delaiPaiement: 15,
        tauxRenouvellement: 95,
        satisfaction: 4.8,
        recommandations: 12
      }
    },
    {
      nom: 'Commerce ABC',
      ca: 720000,
      pourcentage: 22.5,
      croissance: 8.3,
      secteur: 'Commerce',
      risque: 'moyen',
      raisonsTop: [
        'Réseau de distribution étendu',
        'Innovation dans le e-commerce',
        'Partenariats stratégiques solides',
        'Adaptation rapide aux tendances'
      ],
      metriques: {
        delaiPaiement: 25,
        tauxRenouvellement: 88,
        satisfaction: 4.6,
        recommandations: 8
      }
    },
    {
      nom: 'Société XYZ EURL',
      ca: 680000,
      pourcentage: 21.3,
      croissance: 15.7,
      secteur: 'Industrie',
      risque: 'faible',
      raisonsTop: [
        'Expertise technique reconnue',
        'Certifications qualité internationales',
        'Recherche et développement active',
        'Export vers 15 pays'
      ],
      metriques: {
        delaiPaiement: 20,
        tauxRenouvellement: 92,
        satisfaction: 4.7,
        recommandations: 15
      }
    }
  ];

  const clientsToDisplay = topClients.length ? topClients : sampleTopClients;

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Aperçu Général des Statistiques</h1>
        <p className="text-gray-600">
          Vue d'ensemble des performances et métriques clés de l'entreprise
        </p>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
        <div className="flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-yellow-400 mr-2" />
          <p className="text-yellow-800 text-sm font-medium">
            {t('disclaimer')} - Les données présentées sont des simulations pour démonstration
          </p>
        </div>
      </div>

      {/* Métriques clés enrichies */}
      <Card title="🎯 Métriques Clés">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Chiffre d'Affaires Total</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(metriques.ventesTotal)}</p>
            <p className="text-xs text-green-600 mt-1">+{metriques.croissanceCA}% vs mois dernier</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Marge Brute</p>
            <p className="text-2xl font-bold text-green-600">{metriques.margeBrute}%</p>
            <p className="text-xs text-green-600 mt-1">+2.1% vs mois dernier</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Rotation Stock</p>
            <p className="text-2xl font-bold text-purple-600">{metriques.rotationStock}x/an</p>
            <p className="text-xs text-blue-600 mt-1">Objectif: 8x/an</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <UserGroupIcon className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Clients Actifs</p>
            <p className="text-2xl font-bold text-orange-600">{metriques.nombreClients}</p>
            <p className="text-xs text-green-600 mt-1">+{metriques.nouveauxClients} ce mois</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Fidélisation</p>
            <p className="text-2xl font-bold text-emerald-600">{metriques.tauxFidelisation}%</p>
            <p className="text-xs text-emerald-600 mt-1">Excellente rétention</p>
          </div>
        </div>
      </Card>

      {/* Section Comptable SCF/IFRS */}
      <Card title="📚 Indicateurs Comptables">
        <div className="space-y-6">
          {/* En-tête avec norme comptable */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Norme Comptable Active
                </h3>
                <p className="text-gray-600 text-sm">
                  <BookOpenIcon className="h-4 w-4 inline mr-2" />
                  {normesComptables[planComptable as keyof typeof normesComptables].nom}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {normesComptables[planComptable as keyof typeof normesComptables].emoji} {normesComptables[planComptable as keyof typeof normesComptables].code}
                </span>
              </div>
            </div>
          </div>

          {/* KPI Comptables */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Écritures Comptables */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-xs text-gray-500">Écritures</span>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">
                  {kpiComptables.ecrituresComptables.total}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 font-medium">
                    {kpiComptables.ecrituresComptables.validees} validées
                  </span>
                  <span className="text-gray-500">
                    {kpiComptables.ecrituresComptables.enAttente} en attente
                  </span>
                </div>
                <p className="text-xs text-green-600">
                  +{kpiComptables.ecrituresComptables.evolution}% vs mois dernier
                </p>
                <p className="text-xs text-gray-500">
                  {kpiComptables.ecrituresComptables.parJour} écritures/jour
                </p>
              </div>
            </div>

            {/* TVA */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <DocumentCheckIcon className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-xs text-gray-500">TVA</span>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(kpiComptables.tva.aVerser)}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-600 font-medium">
                    Collectée: {formatCurrency(kpiComptables.tva.collectee)}
                  </span>
                  <span className="text-gray-500">
                    Déductible: {formatCurrency(kpiComptables.tva.deductible)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Taux: {kpiComptables.tva.taux}%
                </p>
                <p className="text-xs text-green-600">
                  +{kpiComptables.tva.evolution}% vs mois dernier
                </p>
                <p className="text-xs text-gray-500">
                  {normesComptables[planComptable as keyof typeof normesComptables].comptes.tva}
                </p>
              </div>
            </div>

            {/* Bilan */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ScaleIcon className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-xs text-gray-500">Bilan</span>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(kpiComptables.bilans.actif)}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 font-medium">
                    Actif: {formatCurrency(kpiComptables.bilans.actif)}
                  </span>
                  <span className="text-gray-500">
                    Passif: {formatCurrency(kpiComptables.bilans.passif)}
                  </span>
                </div>
                <p className="text-xs text-blue-600">
                  Capitaux propres: {formatCurrency(kpiComptables.bilans.capitauxPropres)}
                </p>
                <p className="text-xs text-green-600">
                  +{kpiComptables.bilans.evolution}% vs mois dernier
                </p>
                <p className="text-xs text-gray-500">
                  Dernier bilan: {kpiComptables.bilans.dateDernier}
                </p>
              </div>
            </div>

            {/* Ratios Financiers */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <ChartBarIcon className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-xs text-gray-500">Ratios</span>
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">
                  {kpiComptables.ratios.length}
                </p>
                <div className="space-y-1">
                  {kpiComptables.ratios.slice(0, 2).map((ratio: any, index: number) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">{ratio.nom}</span>
                      <span className={`px-1 py-0.5 rounded text-xs ${
                        ratio.couleur === 'green' ? 'bg-green-100 text-green-800' :
                        ratio.couleur === 'orange' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {ratio.valeur}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {kpiComptables.ratios.length} ratios suivis
                </p>
              </div>
            </div>
          </div>

          {/* Journaux Comptables */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4">Journaux Comptables</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpiComptables.journaux.map((journal: any, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900 text-sm">{journal.nom}</h5>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      journal.statut === 'Validé' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {journal.statut}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Écritures:</span>
                      <span className="font-medium">{journal.nombre}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Montant:</span>
                      <span className="font-medium">{formatCurrency(journal.montant)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Évolution:</span>
                      <span className="font-medium text-green-600">+{journal.evolution}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Codes Comptables Principaux */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4">Codes Comptables Principaux</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900 text-sm">Ventes</h5>
                <div className="space-y-1">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <span className="text-gray-600">Ventes de biens</span>
                    <span className="font-mono text-gray-500">{normesComptables[planComptable as keyof typeof normesComptables].comptes.ventes}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <span className="text-gray-600">Produits finis</span>
                    <span className="font-mono text-gray-500">{normesComptables[planComptable as keyof typeof normesComptables].comptes.produits}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900 text-sm">Gestion</h5>
                <div className="space-y-1">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <span className="text-gray-600">TVA Collectée</span>
                    <span className="font-mono text-gray-500">{normesComptables[planComptable as keyof typeof normesComptables].comptes.tva}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <span className="text-gray-600">Clients</span>
                    <span className="font-mono text-gray-500">{normesComptables[planComptable as keyof typeof normesComptables].comptes.clients}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900 text-sm">Stocks</h5>
                <div className="space-y-1">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <span className="text-gray-600">Stocks</span>
                    <span className="font-mono text-gray-500">{normesComptables[planComptable as keyof typeof normesComptables].comptes.stocks}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <span className="text-gray-600">Immobilisations</span>
                    <span className="font-mono text-gray-500">{normesComptables[planComptable as keyof typeof normesComptables].comptes.immobilisations}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Comptables */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button className="flex items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors">
              <DocumentCheckIcon className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-blue-700 text-sm font-medium">Écritures</span>
            </button>
            <button className="flex items-center justify-center p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors">
              <CalculatorIcon className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-green-700 text-sm font-medium">Calcul TVA</span>
            </button>
            <button className="flex items-center justify-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
              <BookOpenIcon className="h-4 w-4 text-purple-600 mr-2" />
              <span className="text-purple-700 text-sm font-medium">Plan Comptable</span>
            </button>
            <button className="flex items-center justify-center p-3 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors">
              <ScaleIcon className="h-4 w-4 text-orange-600 mr-2" />
              <span className="text-orange-700 text-sm font-medium">Bilans</span>
            </button>
          </div>
        </div>
      </Card>

      <Card title="🏆 Top Clients">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clientsToDisplay.map((client: any) => (
            <div key={client.id || client.nom} className="p-6 bg-gradient-to-b from-white to-gray-50 rounded-lg border border-gray-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{client.nom}</h3>
                  <p className="text-sm text-gray-600">
                    CA: {formatCurrency(client.ca || 0)} ({client.pourcentage ?? 0}%)
                  </p>
                  <p className="text-xs text-green-600">Croissance: {client.croissance ?? 0}%</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                    {client.secteur || 'Secteur'}
                  </span>
                  <div className={`text-sm font-semibold ${client.risque === 'faible' ? 'text-green-600' : client.risque === 'élevé' ? 'text-red-600' : 'text-orange-600'}`}>
                    Risque: {client.risque || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-700">Raisons principales</p>
                <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
                  {(client.raisonsTop || []).map((raison: string, idx: number) => (
                    <li key={idx}>{raison}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Délai Paiement</p>
                  <p className="font-bold text-blue-600">{client.metriques?.delaiPaiement ?? 0} jours</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Renouvellement</p>
                  <p className="font-bold text-green-600">{client.metriques?.tauxRenouvellement ?? 0}%</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Satisfaction</p>
                  <p className="font-bold text-purple-600">{client.metriques?.satisfaction ?? 0}/5</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Recommandations</p>
                  <p className="font-bold text-orange-600">{client.metriques?.recommandations ?? 0}</p>
                </div>
              </div>

              <div className="mt-2 flex space-x-3">
                <button
                  onClick={() => handleViewDetails(client)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Voir Détails
                </button>
                <button
                  onClick={() => handleContact(client)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center"
                >
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  Contacter
                </button>
                <button
                  onClick={() => handleAnalyze(client)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center justify-center"
                >
                  <ChartBarSquareIcon className="h-4 w-4 mr-2" />
                  Analyser
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Navigation vers les autres sections */}
      <Card title="🔗 Accès aux Autres Sections">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-blue-900 mb-3">💰 Tableau de Bord Financier</h3>
            <p className="text-blue-700 mb-4">
              Accédez aux 8 graphiques financiers spécialisés pour une analyse approfondie
            </p>
            <a 
              href="/statistiques/financier"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Accéder au Tableau de Bord
            </a>
          </div>
          
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-green-900 mb-3">📈 Indicateurs de Performance</h3>
            <p className="text-green-700 mb-4">
              Explorez les KPIs financiers détaillés et les recommandations stratégiques
            </p>
            <a 
              href="/statistiques/performance"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Voir les Indicateurs
            </a>
          </div>
        </div>
      </Card>

      {/* Bouton d'export */}
      <div className="flex justify-center">
        <button className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          📊 Exporter le Rapport Complet
        </button>
      </div>

      {/* Modal Détails Complets */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`Détails Complets - ${selectedClient?.nom}`}
      >
        {selectedClient && (
          <div className="space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <ChartBarIcon className="h-5 w-5 text-gray-600 mr-2" />
                  Informations Financières
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Chiffre d'affaires:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(selectedClient.ca)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Part du CA total:</span>
                    <span className="font-medium text-gray-900">{selectedClient.pourcentage}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Croissance:</span>
                    <span className="font-medium text-green-600">+{selectedClient.croissance}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Secteur:</span>
                    <span className="font-medium text-gray-900">{selectedClient.secteur}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <StarIcon className="h-5 w-5 text-gray-600 mr-2" />
                  Performance Client
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Délai de paiement:</span>
                    <span className="font-medium text-gray-900">{selectedClient.metriques.delaiPaiement} jours</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Taux de renouvellement:</span>
                    <span className="font-medium text-gray-900">{selectedClient.metriques.tauxRenouvellement}%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Satisfaction:</span>
                    <span className="font-medium text-gray-900">{selectedClient.metriques.satisfaction}/5</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Recommandations:</span>
                    <span className="font-medium text-gray-900">{selectedClient.metriques.recommandations}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Raisons du TOP */}
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-gray-600 mr-2" />
                Pourquoi ce client est TOP ?
              </h4>
              <ul className="space-y-3">
                {selectedClient.raisonsTop.map((raison: string, index: number) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <CheckCircleIcon className="h-4 w-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    {raison}
                  </li>
                ))}
              </ul>
            </div>

            {/* Historique des transactions */}
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <ArrowTrendingUpIcon className="h-5 w-5 text-gray-600 mr-2" />
                Historique Récent
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                  <span className="text-gray-700">Janvier 2024</span>
                  <span className="font-medium text-green-600">+{formatCurrency(85000)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                  <span className="text-gray-700">Décembre 2023</span>
                  <span className="font-medium text-green-600">+{formatCurrency(78000)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                  <span className="text-gray-700">Novembre 2023</span>
                  <span className="font-medium text-green-600">+{formatCurrency(92000)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Contacter */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title={`Contacter - ${selectedClient?.nom}`}
      >
        {selectedClient && (
          <div className="space-y-6">
            {/* Informations de contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-600 mr-2" />
                  Contact Principal
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-100">
                    <PhoneIcon className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">+213 555 123 456</p>
                      <p className="text-sm text-gray-600">Téléphone principal</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-100">
                    <EnvelopeIcon className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">contact@{selectedClient.nom.toLowerCase().replace(/\s+/g, '')}.dz</p>
                      <p className="text-sm text-gray-600">Email principal</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-100">
                    <MapPinIcon className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Alger, Algérie</p>
                      <p className="text-sm text-gray-600">Adresse principale</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <UserGroupIcon className="h-5 w-5 text-gray-600 mr-2" />
                  Contact Commercial
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-100">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <span className="text-gray-600 font-medium text-sm">AB</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Ahmed Benali</p>
                      <p className="text-sm text-gray-600">Responsable Commercial</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-100">
                    <PhoneIcon className="h-4 w-4 text-gray-500 mr-3" />
                    <span className="text-sm text-gray-700">+213 555 789 012</span>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded border border-gray-100">
                    <EnvelopeIcon className="h-4 w-4 text-gray-500 mr-3" />
                    <span className="text-sm text-gray-700">ahmed.benali@entreprise.dz</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions de contact */}
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-600 mr-2" />
                Actions Rapides
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm border border-gray-200">
                  <EnvelopeIcon className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                  Envoyer Email
                </button>
                <button className="p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm border border-gray-200">
                  <PhoneIcon className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                  Appeler
                </button>
                <button className="p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm border border-gray-200">
                  <CalendarIcon className="h-5 w-5 mx-auto mb-2 text-gray-600" />
                  Planifier RDV
                </button>
              </div>
            </div>

            {/* Historique des contacts */}
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-600 mr-2" />
                Historique des Contacts
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700">Email envoyé</span>
                  </div>
                  <span className="text-gray-500">15 Jan 2024</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700">Appel téléphonique</span>
                  </div>
                  <span className="text-gray-500">10 Jan 2024</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-gray-700">Réunion en personne</span>
                  </div>
                  <span className="text-gray-500">05 Jan 2024</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Analyse */}
      <Modal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        title={`Analyse Avancée - ${selectedClient?.nom}`}
      >
        {selectedClient && (
          <div className="space-y-6">
            {/* Analyse de performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <ChartBarSquareIcon className="h-5 w-5 text-gray-600 mr-2" />
                  Analyse Financière
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Rentabilité:</span>
                    <div className="flex items-center">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600 mr-1" />
                      <span className="font-medium text-green-600">Excellente</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Stabilité:</span>
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-4 w-4 text-green-600 mr-1" />
                      <span className="font-medium text-green-600">Très stable</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Potentiel:</span>
                    <div className="flex items-center">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-gray-600 mr-1" />
                      <span className="font-medium text-gray-900">Élevé</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-gray-600 mr-2" />
                  Recommandations
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start text-sm text-gray-700">
                    <CheckCircleIcon className="h-4 w-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    Augmenter le volume de commandes
                  </div>
                  <div className="flex items-start text-sm text-gray-700">
                    <CheckCircleIcon className="h-4 w-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    Proposer des services premium
                  </div>
                  <div className="flex items-start text-sm text-gray-700">
                    <CheckCircleIcon className="h-4 w-4 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    Renforcer la relation partenariale
                  </div>
                </div>
              </div>
            </div>

            {/* Métriques de risque */}
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-gray-600 mr-2" />
                Analyse de Risque
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded border border-gray-100">
                  <div className="text-2xl font-bold text-green-600 mb-1">Faible</div>
                  <div className="text-sm text-gray-600">Risque Financier</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded border border-gray-100">
                  <div className="text-2xl font-bold text-gray-600 mb-1">Moyen</div>
                  <div className="text-sm text-gray-600">Risque Commercial</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded border border-gray-100">
                  <div className="text-2xl font-bold text-green-600 mb-1">Faible</div>
                  <div className="text-sm text-gray-600">Risque Opérationnel</div>
                </div>
              </div>
            </div>

            {/* Prévisions */}
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <ArrowTrendingUpIcon className="h-5 w-5 text-gray-600 mr-2" />
                Prévisions 2024
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                  <span className="text-gray-700">CA Prévu Q1:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(220000)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                  <span className="text-gray-700">CA Prévu Q2:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(240000)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                  <span className="text-gray-700">CA Prévu Annuel:</span>
                  <span className="font-medium text-gray-900">{formatCurrency(950000)}</span>
                </div>
              </div>
            </div>

            {/* Actions recommandées */}
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-600 mr-2" />
                Plan d'Action
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                  <span className="text-gray-700">Programmer une réunion stratégique</span>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors border border-gray-300">
                    Planifier
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                  <span className="text-gray-700">Préparer une proposition commerciale</span>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors border border-gray-300">
                    Créer
                  </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                  <span className="text-gray-700">Analyser la concurrence</span>
                  <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors border border-gray-300">
                    Analyser
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Statistiques;


