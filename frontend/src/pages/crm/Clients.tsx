import React, { useState, useMemo } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ChartBarIcon, DocumentTextIcon, BanknotesIcon, UserGroupIcon, ExclamationTriangleIcon, PhoneIcon, CheckCircleIcon, CurrencyDollarIcon, CalendarIcon, EnvelopeIcon, ChatBubbleLeftRightIcon, ClockIcon, ExclamationCircleIcon, PaperAirplaneIcon, BellIcon, DocumentArrowDownIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, DocumentChartBarIcon, ChartPieIcon, TruckIcon, BuildingOfficeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Card from '../../components/UI/Card';
import Modal from '../../components/UI/Modal';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { usePermission } from '../../hooks/usePermission';
import { useClients } from '../../hooks/useClients';
import { Client } from '../../types';
import { AdaptiveContentDisplay, AdaptiveContentGenerator } from '../../utils/AdaptiveContent';
import HelpButton from '../../components/UI/HelpButton';
import LIAContextualButton from '../../components/AI/LIAContextualButton';
import {
  segmenterClients,
  calculerValeurClient,
  genererPrevisionsRevenusClient,
  genererInteractionsCRM,
  calculerMetriquesPortefeuille,
  type SegmentClient,
  type AnalyseValeurClient,
  type PrevisionRevenusClient,
  type InteractionCRM
} from '../../utils/clients';

const Clients: React.FC = () => {
  const { formatCurrency, user, companyData } = useApp();
  const { t } = useTranslation();
  const { has } = usePermission();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  
  // Hook pour charger les clients dynamiquement
  const { clients: rawApiClients, stats: clientStats, loading: loadingClients, error: errorClients } = useClients();
  // Map API clients to app Client type
  const apiClients: Client[] = (rawApiClients || []).map((c: any) => ({
    id: c.id,
    nom: c.name ?? c.nom ?? "",
    adresse: c.address ?? c.adresse ?? "",
    nif: c.tax_id ?? c.nif ?? "",
    telephone: c.phone ?? c.telephone ?? "",
    email: c.email ?? "",
    solde: typeof c.solde === "number" ? c.solde : (c.credit_limit ?? 0),
    secteur: c.secteur,
    groupeId: c.groupeId,
    limiteCredit: c.credit_limit ?? c.limiteCredit,
    delaiPaiement: c.payment_terms ?? c.delaiPaiement,
    tauxEscompte: c.tauxEscompte,
    categorieRisque: c.categorieRisque,
    niveauAcces: c.niveauAcces,
    permissions: c.permissions,
    notes: c.notes,
  }));
  
  // États pour les nouvelles fonctionnalités
  const [isAnalyseValeurModalOpen, setIsAnalyseValeurModalOpen] = useState(false);
  const [isPrevisionsRevenusModalOpen, setIsPrevisionsRevenusModalOpen] = useState(false);
  const [isCrmModalOpen, setIsCrmModalOpen] = useState(false);
  const [isSegmentationModalOpen, setIsSegmentationModalOpen] = useState(false);

  // Constants for form options
  const communicationTypes = [
    { value: 'email', label: 'Email', color: 'blue' },
    { value: 'call', label: 'Appel', color: 'green' },
    { value: 'meeting', label: 'Réunion', color: 'orange' },
    { value: 'proposition', label: 'Proposition', color: 'blue' },
    { value: 'reclamation', label: 'Réclamation', color: 'red' }
  ];

  const relanceTypes = [
    { value: 'amiable', label: 'Amiable', color: 'yellow' },
    { value: 'formelle', label: 'Formelle', color: 'orange' },
    { value: 'juridique', label: 'Juridique', color: 'red' }
  ];

  const relanceCanaux = [
    { value: 'email', label: 'Email' },
    { value: 'telephone', label: 'Téléphone' },
    { value: 'courrier', label: 'Courrier' },
    { value: 'sms', label: 'SMS' }
  ];

  const typesRapports = [
    { value: 'ventes', label: 'Ventes' },
    { value: 'paiements', label: 'Paiements' },
    { value: 'relances', label: 'Relances' },
    { value: 'satisfaction', label: 'Satisfaction' },
    { value: 'performance', label: 'Performance' },
    { value: 'risque', label: 'Risque' }
  ];

  const formatsRapport = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'csv', label: 'CSV' }
  ];

  const periodesRapport = [
    { value: 'semaine', label: 'Cette semaine' },
    { value: 'mois', label: 'Ce mois' },
    { value: 'trimestre', label: 'Ce trimestre' },
    { value: 'annee', label: 'Cette année' },
    { value: 'personnalise', label: 'Personnalisé' }
  ];

  // Statistics for communications, relances, and rapports
  const communicationStats = { totalCommunications: 0, communicationsEnAttente: 0, relancesEnCours: 0, montantTotalEnRetard: 0 };
  const statistiquesRapports = { totalRapports: 0, rapportsGeneres: 0, rapportsEnCours: 0, tailleTotale: '0 MB' };
  const metriquesRapports: any[] = [];
  
  // Calculer les analyses de valeur client
  const analysesValeurClient = useMemo(() => {
    if (!apiClients || apiClients.length === 0) return [];
    
    const historique = apiClients.flatMap((client: any) => {
      const nombreFactures = Math.floor(Math.random() * 20) + 5;
      return Array.from({ length: nombreFactures }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (nombreFactures - i));
        return {
          clientId: client.id?.toString() || client.nom || '',
          ca: (client.caTotal || 1000000) / nombreFactures,
          marge: 25 + Math.random() * 15,
          date: date.toISOString().split('T')[0]
        };
      });
    });
    
    const analyses = calculerValeurClient(historique);
    
    analyses.forEach((analyse, clientId) => {
      const client = apiClients.find((c: any) => (c.id?.toString() || c.name) === clientId);
      if (client) {
        analyse.clientNom = client.nom || clientId;
      }
    });
    
    return Array.from(analyses.values());
  }, [apiClients]);
  
  // Segmenter les clients
  const segmentsClients = useMemo(() => {
    if (!apiClients || apiClients.length === 0) return [];
    
    const clientsAvecDonnees = apiClients.map((client: any) => ({
      id: client.id?.toString() || client.nom || '',
      nom: client.nom || '',
      caTotal: client.caTotal || 0,
      nombreFactures: Math.floor(Math.random() * 20) + 5,
      dsoMoyen: 30 + Math.random() * 30,
      margeMoyenne: 20 + Math.random() * 20,
      frequenceAchat: Math.floor(Math.random() * 12) + 1
    }));
    
    return segmenterClients(clientsAvecDonnees);
  }, [apiClients]);
  
  // Générer les prévisions de revenus
  const previsionsRevenus = useMemo(() => {
    if (!apiClients || apiClients.length === 0) return [];
    
    const historique = apiClients.flatMap((client: any) => {
      const nombreFactures = Math.floor(Math.random() * 12) + 3;
      return Array.from({ length: nombreFactures }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (nombreFactures - i));
        return {
          clientId: client.id?.toString() || client.nom || '',
          ca: (client.caTotal || 1000000) / nombreFactures,
          date: date.toISOString().split('T')[0]
        };
      });
    });
    
    return genererPrevisionsRevenusClient(historique, 6);
  }, [apiClients]);
  
  // Générer les interactions CRM
  const interactionsCRM = useMemo(() => {
    const clientsAvecDonnees = analysesValeurClient.map(analyse => ({
      id: analyse.clientId,
      nom: analyse.clientNom,
      dernierAchat: analyse.dernierAchat,
      caTotal: analyse.margeCumulee * 4, // Estimation
      scoreValeur: analyse.scoreValeur,
      tendance: analyse.tendance
    }));
    
    return genererInteractionsCRM(clientsAvecDonnees);
  }, [analysesValeurClient]);
  
  // Calculer les métriques du portefeuille
  const metriquesPortefeuille = useMemo(() => {
    const clientsAvecDonnees = analysesValeurClient.map(analyse => ({
      caTotal: analyse.margeCumulee * 4,
      margeMoyenne: analyse.margeCumulee / analyse.nombreCommandes,
      dsoMoyen: 45, // Estimation
      scoreValeur: analyse.scoreValeur
    }));
    
    return calculerMetriquesPortefeuille(clientsAvecDonnees);
  }, [analysesValeurClient]);

  // Contexte pour le contenu adaptatif
  const contentContext = {
    user,
    segment: user?.segment || 'micro',
    companyType: user?.companyType || 'eurl',
    role: user?.role || 'utilisateur',
    hasPermission: has
  };

  // ========================================
  // INTERFACE EURL MICRO-ENTREPRISE
  // ========================================
  if (user && user.segment === 'micro' && user.companyType === 'eurl' && companyData) {
    const nombreClients = companyData.clientsCount;
    const clientsActifs = companyData.clientsActive;
    const clientsNouveaux = companyData.clientsNew;
    const caTotal = companyData.revenueTotal;
    const caParClient = Math.round(caTotal / nombreClients);
    const tauxFidelisation = Math.round((clientsActifs / nombreClients) * 100);

    // Top 5 clients par CA
    const topClients = [
      { nom: 'Client A', ca: Math.round(caTotal * 0.25), statut: 'Actif', zone: 'Alger' },
      { nom: 'Client B', ca: Math.round(caTotal * 0.20), statut: 'Actif', zone: 'Oran' },
      { nom: 'Client C', ca: Math.round(caTotal * 0.15), statut: 'Actif', zone: 'Alger' },
      { nom: 'Client D', ca: Math.round(caTotal * 0.12), statut: 'Actif', zone: 'Annaba' },
      { nom: 'Client E', ca: Math.round(caTotal * 0.10), statut: 'Inactif', zone: 'Constantine' }
    ];

    // Répartition CA par zone
    const caParZone = [
      { zone: 'Alger', ca: Math.round(caTotal * 0.50), clients: Math.round(nombreClients * 0.45), couleur: 'from-emerald-500 to-teal-500' },
      { zone: 'Oran', ca: Math.round(caTotal * 0.25), clients: Math.round(nombreClients * 0.25), couleur: 'from-blue-500 to-indigo-500' },
      { zone: 'Autres', ca: Math.round(caTotal * 0.25), clients: Math.round(nombreClients * 0.30), couleur: 'from-slate-600 to-slate-800' }
    ];

    const pageContent = AdaptiveContentGenerator.generatePageContent('clients', contentContext);

    return (
      <div className="space-y-6 max-w-7xl mx-auto p-6">
        {/* En-tête avec contenu adaptatif */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-900 text-white p-8 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                <UserGroupIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{pageContent.title}</h1>
                  <HelpButton pageId="clients" variant="icon" className="text-white/80 hover:text-white" />
                  <LIAContextualButton
                    question="Comment améliorer ma relation avec mes clients ?"
                    context="clients"
                    variant="icon"
                    className="text-white/80 hover:text-white"
                    tooltip="Demander à LIA sur les clients"
                  />
                </div>
                <p className="text-slate-300 text-lg mt-1">{pageContent.subtitle}</p>
              </div>
            </div>
          </div>
          {/* Description adaptative */}
          <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
            <p className="text-slate-100 text-sm">{pageContent.description}</p>
          </div>
        </div>

        {/* Contenu adaptatif - Conseils et Insights */}
        <AdaptiveContentDisplay 
          pageId="clients" 
          context={contentContext}
          showTips={true}
          showInsights={true}
        />

        {/* 4 KPIs Clients */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <UserGroupIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Total Clients</h3>
            <p className="text-3xl font-extrabold text-slate-900">{nombreClients}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-emerald-600 font-semibold">👥 Base clientèle</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <CheckCircleIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Clients Actifs</h3>
            <p className="text-3xl font-extrabold text-slate-900">{clientsActifs}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-blue-600 font-semibold">📊 {tauxFidelisation}% taux fidélisation</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <ArrowTrendingUpIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">Nouveaux Clients</h3>
            <p className="text-3xl font-extrabold text-slate-900">{clientsNouveaux}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-purple-600 font-semibold">🆕 Ce mois</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 shadow-md hover:shadow-xl p-6 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg">
                <CurrencyDollarIcon className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wide mb-1">CA par Client</h3>
            <p className="text-3xl font-extrabold text-slate-900">{formatCurrency(caParClient)}</p>
            <div className="mt-3 pt-3 border-t border-slate-200">
              <p className="text-xs text-amber-600 font-semibold">💰 Moyenne</p>
            </div>
          </div>
        </div>

        {/* Top 5 Clients par CA */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mr-3">
              <ChartBarIcon className="h-5 w-5 text-white" />
            </div>
            Top 5 Clients par Chiffre d'Affaires
          </h2>
          <div className="space-y-3">
            {topClients.map((client, idx) => (
              <div key={idx} className="bg-gradient-to-r from-slate-50 to-white p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{client.nom}</p>
                      <p className="text-sm text-slate-600">{client.zone} • {client.statut}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-emerald-600">{formatCurrency(client.ca)}</p>
                    <p className="text-xs text-slate-500">{Math.round((client.ca / caTotal) * 100)}% du CA total</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Répartition CA par Zone */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-300 p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg mr-3">
              <BuildingOfficeIcon className="h-5 w-5 text-white" />
            </div>
            Chiffre d'Affaires par Zone Géographique
          </h2>
          <div className="space-y-4">
            {caParZone.map((zone, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border-2 border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-slate-900">{zone.zone}</p>
                    <p className="text-xs text-slate-600">{zone.clients} clients</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-extrabold text-slate-900">{formatCurrency(zone.ca)}</p>
                    <p className="text-xs font-bold text-emerald-600">{Math.round((zone.ca / caTotal) * 100)}%</p>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${zone.couleur} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.round((zone.ca / caTotal) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertes & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Alertes Clients */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-300 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg mr-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-white" />
              </div>
              Alertes Clients
            </h3>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded-lg border border-red-300">
                <p className="text-sm font-bold text-red-700">🚨 Client E inactif depuis 60 jours</p>
                <p className="text-xs text-slate-600 mt-1">Relance recommandée</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-amber-300">
                <p className="text-sm font-bold text-amber-700">⚠️ 3 clients avec paiements en retard</p>
                <p className="text-xs text-slate-600 mt-1">Suivi nécessaire</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-300">
                <p className="text-sm font-bold text-emerald-700">✅ {tauxFidelisation}% de fidélisation</p>
                <p className="text-xs text-slate-600 mt-1">Excellent taux</p>
              </div>
            </div>
          </div>

          {/* Actions Rapides */}
          <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg mr-3">
                <PlusIcon className="h-5 w-5 text-white" />
              </div>
              Actions Rapides
            </h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-xl font-bold hover:from-slate-800 hover:to-black shadow-md hover:shadow-lg transition-all duration-300">
                + Nouveau client
              </button>
              <button className="w-full p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 shadow-md hover:shadow-lg transition-all duration-300">
                📊 Rapport clients détaillé
              </button>
              <button className="w-full p-3 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-bold hover:border-emerald-400 hover:shadow-lg transition-all duration-300">
                📧 Relancer clients inactifs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ========================================
  // INTERFACE STANDARD (autres entreprises)
  // ========================================
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    nif: '',
    telephone: '',
    email: '',
    solde: 0,
    secteur: '',
    groupeId: '',
    // Nouveaux champs pour les droits d'accès
    niveauAcces: 'standard',
    permissions: {
      consultation: true,
      modification: false,
      suppression: false,
      export: true,
      analyse: true
    },
    // Champs financiers détaillés
    limiteCredit: 0,
    delaiPaiement: 30,
    tauxEscompte: 0,
    categorieRisque: 'faible',
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientDetailsModalOpen, setIsClientDetailsModalOpen] = useState(false);
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);
  const [isCommunicationModalOpen, setIsCommunicationModalOpen] = useState(false);
  const [isNewCommunicationModalOpen, setIsNewCommunicationModalOpen] = useState(false);
  const [isRelanceModalOpen, setIsRelanceModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('liste');
  const [livraisonView, setLivraisonView] = useState<'overview' | 'en-cours' | 'statistiques' | 'geographie'>('overview');
  const [livraisonStatus, setLivraisonStatus] = useState<'tous' | 'en-transit' | 'livrees' | 'en-retard'>('tous');
  const [communicationFilter, setCommunicationFilter] = useState('tous');
  const [relanceFilter, setRelanceFilter] = useState('tous');
  const [rapportFilter, setRapportFilter] = useState('tous');
  const [isNouveauRapportModalOpen, setIsNouveauRapportModalOpen] = useState(false);
  const [selectedRapport, setSelectedRapport] = useState<any>(null);
  const [isRapportViewModalOpen, setIsRapportViewModalOpen] = useState(false);

  const filteredClients = (apiClients || []).filter((client: any) =>
    (client.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.taxId || '').includes(searchTerm)
  );

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingClient) {
      // Mise à jour du client existant via API
      console.log('Client mis à jour:', editingClient.id, formData);
      // TODO: Implement API call to update client
    } else {
      // Ajout d'un nouveau client via API
      const newClient: Client = {
        id: `C${Date.now()}`,
        ...formData
      };
      console.log('Nouveau client ajouté:', newClient);
      // TODO: Implement API call to create client
    }
    
    setIsModalOpen(false);
    setEditingClient(null);
    setFormData({
      nom: '',
      adresse: '',
      nif: '',
      telephone: '',
      email: '',
      solde: 0,
      secteur: '',
      groupeId: '',
      niveauAcces: 'standard',
      permissions: {
        consultation: true,
        modification: false,
        suppression: false,
        export: true,
        analyse: true
      },
      limiteCredit: 0,
      delaiPaiement: 30,
      tauxEscompte: 0,
      categorieRisque: 'faible',
      notes: ''
    });
  };

  // Nouvelles fonctions ERPNext
  const handleViewClientDetails = (client: Client) => {
    setSelectedClient(client);
    setIsClientDetailsModalOpen(true);
  };

  const handleViewPaymentHistory = (client: Client) => {
    setSelectedClient(client);
    setIsPaymentHistoryModalOpen(true);
  };

  const handleCommunicateWithClient = (client: Client) => {
    setSelectedClient(client);
    setIsCommunicationModalOpen(true);
  };

  const handleViewRapport = (rapport: any) => {
    setSelectedRapport(rapport);
    setIsRapportViewModalOpen(true);
  };

  const handleDownloadRapport = (rapport: any) => {
    const formatInfo = formatsRapport.find(f => f.value === rapport.format);
    alert(`📥 Téléchargement en cours...\n\n📄 Rapport: ${rapport.nom}\n📊 Format: ${formatInfo?.label}\n💾 Taille: ${rapport.taille}\n\n✅ Téléchargement terminé !`);
  };

  // Données simulées pour les fonctionnalités ERPNext
  const clientPaymentHistory = selectedClient ? [
    { id: 1, date: '2024-01-15', invoice: 'F-2024-001', amount: 2500, status: 'paid', method: 'Virement' },
    { id: 2, date: '2024-01-10', invoice: 'F-2024-002', amount: 1800, status: 'overdue', method: 'Chèque' },
    { id: 3, date: '2024-01-05', invoice: 'F-2024-003', amount: 3200, status: 'paid', method: 'Espèces' }
  ] : [];

  const clientCommunications = selectedClient ? [
    { id: 1, date: '2024-01-15', type: 'email', subject: 'Relance facture F-2024-002', status: 'sent' },
    { id: 2, date: '2024-01-12', type: 'call', subject: 'Appel commercial', status: 'completed' },
    { id: 3, date: '2024-01-10', type: 'meeting', subject: 'Rendez-vous commercial', status: 'scheduled' }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header de la page */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Clients & Ventes</h1>
            </div>
            <p className="text-slate-600">Gestion complète de la clientèle, ventes et relations commerciales</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-sm text-slate-500">Total clients</div>
              {loadingClients ? (
                <div className="text-lg text-gray-500">Chargement...</div>
              ) : errorClients ? (
                <div className="text-lg text-red-500">Erreur</div>
              ) : (
                <div className="text-2xl font-bold text-emerald-600">
                  {clientStats?.total_clients || apiClients.length}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <Card className="p-0">
        <div className="border-b border-slate-200">
          <nav className="flex overflow-x-auto px-6" aria-label="Tabs">
            {[
              { id: 'liste', name: 'Liste des Clients', icon: UserGroupIcon },
              { id: 'analytics', name: 'Analytics Clients', icon: ChartBarIcon },
              { id: 'relances', name: 'Relances', icon: ExclamationTriangleIcon },
              { id: 'livraisons', name: 'Suivi des Livraisons', icon: TruckIcon },
              { id: 'communications', name: 'Communications', icon: PhoneIcon },
              { id: 'rapports', name: 'Rapports', icon: DocumentTextIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-500 text-emerald-600 bg-emerald-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'liste' && (
            <>
              {/* Search and Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
                <div className="w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou NIF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                
                <button
                  onClick={handleAdd}
                  className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  {t('ajouter')} Client
                </button>
              </div>

              {/* Clients Table avec colonnes ERPNext */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        NIF
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Solde
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Limite Crédit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200">
                    {filteredClients.map((client) => (
                      <tr key={client.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-slate-800">{client.nom}</div>
                            <div className="text-sm text-slate-500">{client.adresse}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-800">{client.nif}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-800">{client.telephone}</div>
                          <div className="text-sm text-slate-500">{client.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-emerald-600">{formatCurrency(0)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-800">{formatCurrency(client.limiteCredit ?? 0)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">faible</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewClientDetails(client as Client)}
                              className="text-slate-600 hover:text-slate-800"
                              title="Voir détails"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(client as Client)}
                              className="text-emerald-600 hover:text-emerald-800"
                              title="Modifier"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleViewPaymentHistory(client as Client)}
                              className="text-purple-600 hover:text-purple-800"
                              title="Historique paiements"
                            >
                              <BanknotesIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleCommunicateWithClient(client as Client)}
                              className="text-amber-600 hover:text-amber-800"
                              title="Communiquer"
                            >
                              <PhoneIcon className="h-5 w-5" />
                            </button>
                            <button className="text-red-600 dark:text-red-400 hover:text-red-800" title="Supprimer">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Section Relances Rapides */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-slate-700" />
                    <span>Relances en Cours</span>
                  </h3>
                  <button 
                    onClick={() => setActiveTab('relances')}
                    className="px-3 py-1.5 text-xs bg-slate-700 text-white rounded-lg hover:bg-slate-800 font-medium"
                  >
                    Voir Toutes
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-600 font-medium">Critiques</p>
                        <p className="text-2xl font-bold text-slate-900">3</p>
                    </div>
                      <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-600 font-medium">En Attente</p>
                        <p className="text-2xl font-bold text-slate-900">8</p>
                      </div>
                      <ClockIcon className="h-8 w-8 text-amber-600" />
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Payées</p>
                        <p className="text-2xl font-bold text-slate-900">15</p>
                    </div>
                      <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-xs font-medium text-slate-600 uppercase mb-2">Relances Récentes</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                      <div className="flex items-center space-x-2">
                        <EnvelopeIcon className="h-4 w-4 text-slate-600" />
                        <span className="text-sm text-slate-900">Entreprise ABC - F-2024-001</span>
                      </div>
                      <span className="text-xs text-red-600 font-medium">15 000 دج</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                      <div className="flex items-center space-x-2">
                        <PhoneIcon className="h-4 w-4 text-slate-600" />
                        <span className="text-sm text-slate-900">Société XYZ - F-2024-002</span>
                      </div>
                      <span className="text-xs text-amber-600 font-medium">8 500 دج</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                      <div className="flex items-center space-x-2">
                        <DocumentTextIcon className="h-4 w-4 text-slate-600" />
                        <span className="text-sm text-slate-900">Compagnie DEF - F-2024-003</span>
                      </div>
                      <span className="text-xs text-red-600 font-medium">25 000 دج</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Section Analytics Rapides */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
                    <ChartBarIcon className="h-5 w-5 text-slate-700" />
                    <span>Analytics Clients</span>
                  </h3>
                  <button 
                    onClick={() => setActiveTab('analytics')}
                    className="px-3 py-1.5 text-xs bg-slate-700 text-white rounded-lg hover:bg-slate-800 font-medium"
                  >
                    Voir Détails
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-600 font-medium">Total Clients</p>
                        <p className="text-xl font-bold text-slate-900">1,250</p>
                    </div>
                      <UserGroupIcon className="h-8 w-8 text-slate-600" />
                  </div>
                </div>
                  <div className="p-3 bg-slate-100 rounded-lg border border-slate-300">
                  <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-700 font-medium">Actifs</p>
                        <p className="text-xl font-bold text-slate-900">980</p>
                      </div>
                      <CheckCircleIcon className="h-8 w-8 text-slate-700" />
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-600 font-medium">CA Total</p>
                        <p className="text-xl font-bold text-slate-900">2.45M دج</p>
                    </div>
                      <CurrencyDollarIcon className="h-8 w-8 text-slate-600" />
                  </div>
                </div>
                  <div className="p-3 bg-slate-100 rounded-lg border border-slate-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-700 font-medium">Fidélité</p>
                        <p className="text-xl font-bold text-slate-900">78.4%</p>
                      </div>
                      <ChartPieIcon className="h-8 w-8 text-slate-700" />
                  </div>
                </div>
              </div>

                <div className="mt-4">
                  <h4 className="text-xs font-medium text-slate-600 uppercase mb-2">Top Clients par Performance</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                        <div className="flex items-center space-x-2">
                        <BuildingOfficeIcon className="h-4 w-4 text-slate-600" />
                        <span className="text-sm text-slate-900">Entreprise ABC</span>
                          </div>
                      <span className="text-xs text-emerald-600 font-medium">+15.2%</span>
                        </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                      <div className="flex items-center space-x-2">
                        <BuildingOfficeIcon className="h-4 w-4 text-slate-600" />
                        <span className="text-sm text-slate-900">Groupe GHI</span>
                      </div>
                      <span className="text-xs text-emerald-600 font-medium">+22.1%</span>
                  </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200">
                          <div className="flex items-center space-x-2">
                        <BuildingOfficeIcon className="h-4 w-4 text-slate-600" />
                        <span className="text-sm text-slate-900">Société XYZ</span>
                            </div>
                      <span className="text-xs text-emerald-600 font-medium">+8.7%</span>
                          </div>
                        </div>
                  </div>
                </Card>

              {/* Section Analyses Visuelles Rapides */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center space-x-2">
                    <ChartBarIcon className="h-5 w-5 text-slate-700" />
                    <span>Analyses Visuelles</span>
                  </h3>
                  <button 
                    onClick={() => setActiveTab('rapports')}
                    className="px-3 py-1.5 text-xs bg-slate-700 text-white rounded-lg hover:bg-slate-800 font-medium"
                  >
                    Voir Graphiques
                  </button>
                            </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-slate-900">Ventes par Secteur</h4>
                      <ChartBarIcon className="h-5 w-5 text-slate-600" />
                          </div>
                    <p className="text-xs text-slate-600 mb-2">6 secteurs d'activité</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">Technologie</span>
                        <span className="font-medium">850K DA</span>
                        </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">Industrie</span>
                        <span className="font-medium">720K DA</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">Services</span>
                        <span className="font-medium">450K DA</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-100 rounded-lg border border-slate-300">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-slate-900">Paiements</h4>
                      <ChartPieIcon className="h-5 w-5 text-slate-700" />
                    </div>
                    <p className="text-xs text-slate-600 mb-2">5 modes de paiement</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">Espèces</span>
                        <span className="font-medium">35%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">Virement</span>
                        <span className="font-medium">28%</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">Chèque</span>
                        <span className="font-medium">20%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-slate-900">Évolution Ventes</h4>
                      <ArrowTrendingUpIcon className="h-5 w-5 text-slate-600" />
                    </div>
                    <p className="text-xs text-slate-600 mb-2">6 derniers mois</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">CA Actuel</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">2.45M DA</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">Objectif</span>
                        <span className="font-medium">2.40M DA</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">Évolution</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">+2.1%</span>
                      </div>
                    </div>
                  </div>
                  </div>
                </Card>

              {/* Section Suivi des Livraisons Rapides - Améliorée */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                      <TruckIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Suivi des Livraisons</h3>
                      <p className="text-sm text-slate-600">Vue d'ensemble de vos opérations logistiques</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('livraisons')}
                    className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white rounded-lg hover:from-slate-800 hover:to-black shadow-md hover:shadow-lg transition-all duration-300 font-medium text-sm flex items-center gap-2"
                  >
                    <EyeIcon className="h-4 w-4" />
                    Voir Détails Complets
                  </button>
              </div>
                
                {/* Statistiques principales améliorées */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 shadow-md hover:shadow-xl transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg group-hover:scale-110 transition-transform shadow-lg">
                        <TruckIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-blue-700 font-semibold uppercase tracking-wide">En Transit</p>
                        <p className="text-3xl font-extrabold text-blue-900 mt-1">5</p>
                    </div>
                  </div>
                    <div className="pt-3 border-t border-blue-200">
                      <p className="text-sm text-blue-800 font-medium">Livraisons en cours</p>
                      <p className="text-xs text-blue-600 mt-1">Délai moyen: 2.3 jours</p>
                      <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 shadow-md hover:shadow-xl transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg group-hover:scale-110 transition-transform shadow-lg">
                        <CheckCircleIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-emerald-700 font-semibold uppercase tracking-wide">Livrées</p>
                        <p className="text-3xl font-extrabold text-emerald-900 mt-1">18</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-emerald-200">
                      <p className="text-sm text-emerald-800 font-medium">Cette semaine</p>
                      <p className="text-xs text-emerald-600 mt-1">Taux de réussite: 72%</p>
                      <div className="mt-2 w-full bg-emerald-200 rounded-full h-2">
                        <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                </div>

                  <div className="p-5 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200 shadow-md hover:shadow-xl transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg group-hover:scale-110 transition-transform shadow-lg">
                        <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-red-700 font-semibold uppercase tracking-wide">En Retard</p>
                        <p className="text-3xl font-extrabold text-red-900 mt-1">2</p>
                    </div>
                      </div>
                    <div className="pt-3 border-t border-red-200">
                      <p className="text-sm text-red-800 font-medium">Nécessitent suivi urgent</p>
                      <p className="text-xs text-red-600 mt-1">Retard moyen: 3 jours</p>
                      <div className="mt-2 w-full bg-red-200 rounded-full h-2">
                        <div className="bg-red-600 h-2 rounded-full" style={{ width: '8%' }}></div>
                    </div>
                      </div>
                    </div>
                </div>

                {/* Métriques supplémentaires */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-600 font-medium mb-1">Total Livraisons</p>
                    <p className="text-xl font-bold text-slate-900">25</p>
                    <p className="text-xs text-slate-500 mt-1">Ce mois</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-600 font-medium mb-1">Satisfaction</p>
                    <p className="text-xl font-bold text-emerald-600">4.2/5</p>
                    <p className="text-xs text-slate-500 mt-1">Note moyenne</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-600 font-medium mb-1">Délai Moyen</p>
                    <p className="text-xl font-bold text-blue-600">2.3j</p>
                    <p className="text-xs text-slate-500 mt-1">Temps de livraison</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <p className="text-xs text-slate-600 font-medium mb-1">Ponctualité</p>
                    <p className="text-xl font-bold text-teal-600">88%</p>
                    <p className="text-xs text-slate-500 mt-1">À l'heure</p>
                  </div>
                </div>

                {/* Livraisons en cours détaillées */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-slate-600" />
                      Livraisons en Cours
                    </h4>
                    <span className="text-xs text-slate-600 font-medium">5 actives</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200 hover:shadow-md transition-all">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <TruckIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-900">LIV-2024-001</span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">En Transit</span>
                          </div>
                          <p className="text-sm text-slate-700 font-medium">Entreprise ABC</p>
                          <p className="text-xs text-slate-600">123 Rue de la Paix, Alger</p>
                          <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5">
                            <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: '75%' }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-bold text-blue-900">75%</p>
                        <p className="text-xs text-slate-600">En route</p>
                        <p className="text-xs text-slate-500 mt-1">Ahmed Benali</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200 hover:shadow-md transition-all">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="p-2 bg-emerald-500 rounded-lg">
                          <TruckIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-900">LIV-2024-004</span>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">Presque arrivée</span>
                          </div>
                          <p className="text-sm text-slate-700 font-medium">Groupe GHI</p>
                          <p className="text-xs text-slate-600">321 Rue de la Liberté, Annaba</p>
                          <div className="mt-2 w-full bg-emerald-200 rounded-full h-1.5">
                            <div className="bg-emerald-600 h-1.5 rounded-full transition-all" style={{ width: '90%' }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-bold text-emerald-900">90%</p>
                        <p className="text-xs text-slate-600">En cours</p>
                        <p className="text-xs text-slate-500 mt-1">Aicha Bouzid</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border-2 border-red-200 hover:shadow-md transition-all">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="p-2 bg-red-500 rounded-lg">
                          <ExclamationTriangleIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-slate-900">LIV-2024-003</span>
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded-full">En Retard</span>
                          </div>
                          <p className="text-sm text-slate-700 font-medium">Compagnie DEF</p>
                          <p className="text-xs text-slate-600">789 Boulevard de la République, Constantine</p>
                          <p className="text-xs text-red-600 font-semibold mt-1">⚠️ Retard de 2 jours - Problème technique</p>
                          <div className="mt-2 w-full bg-red-200 rounded-full h-1.5">
                            <div className="bg-red-600 h-1.5 rounded-full transition-all" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-bold text-red-900">-2j</p>
                        <p className="text-xs text-red-600 font-semibold">Retard</p>
                        <p className="text-xs text-slate-500 mt-1">Mohamed Tazi</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions rapides */}
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <div className="flex flex-wrap gap-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
                      <PlusIcon className="h-4 w-4" />
                      Nouvelle Livraison
                    </button>
                    <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium flex items-center gap-2">
                      <ChartBarIcon className="h-4 w-4" />
                      Statistiques
                    </button>
                    <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4" />
                      Suivi GPS
                    </button>
                  </div>
                </div>
              </Card>

              {/* Balance Âgée Clients */}
              <Card className="p-5">
                <h4 className="text-base font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                  <ClockIcon className="h-5 w-5 text-slate-700" />
                  <span>Balance Âgée Clients</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-12 bg-slate-700 rounded"></div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">0-30 jours</div>
                        <div className="text-xs text-slate-600">Paiement dans les délais</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-slate-900">85 000 دج</div>
                      <div className="text-xs text-slate-600">68%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-100 rounded border border-slate-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-12 bg-slate-500 rounded"></div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">31-60 jours</div>
                        <div className="text-xs text-slate-600">Léger retard acceptable</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-slate-900">25 000 دج</div>
                      <div className="text-xs text-slate-600">20%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-200 rounded border border-slate-400">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-12 bg-amber-500 rounded"></div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">61-90 jours</div>
                        <div className="text-xs text-slate-700">Attention requise</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-slate-900">10 000 دج</div>
                      <div className="text-xs text-slate-700">8%</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-600/10 rounded border border-red-500">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-12 bg-red-600 rounded"></div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">+90 jours</div>
                        <div className="text-xs text-slate-800">Recouvrement urgent</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-slate-900">5 000 دج</div>
                      <div className="text-xs text-slate-800">4%</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Total Créances</span>
                  <span className="text-lg font-bold text-slate-900">125 000 دج</span>
                </div>
              </Card>
            </>
          )}

          {/* Onglet Analytics Clients */}
          {/* Section Analyses Avancées - Nouvelle section */}
          {activeTab === 'liste' && (
            <div className="mt-6 space-y-6">
              {/* Métriques du Portefeuille */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <ChartPieIcon className="h-5 w-5 text-blue-600" />
                    Métriques du Portefeuille Clients
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsSegmentationModalOpen(true)}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium hover:bg-blue-200"
                    >
                      Segmentation
                    </button>
                    <button
                      onClick={() => setIsAnalyseValeurModalOpen(true)}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium hover:bg-green-200"
                    >
                      Analyse Valeur
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-slate-600 mb-1">CA Total</p>
                    <p className="text-xl font-bold text-blue-900">{formatCurrency(metriquesPortefeuille.caTotal)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <p className="text-xs text-slate-600 mb-1">Nombre Clients</p>
                    <p className="text-xl font-bold text-green-900">{metriquesPortefeuille.nombreClients}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-purple-200">
                    <p className="text-xs text-slate-600 mb-1">CA Moyen</p>
                    <p className="text-xl font-bold text-purple-900">{formatCurrency(metriquesPortefeuille.caMoyen)}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-orange-200">
                    <p className="text-xs text-slate-600 mb-1">Concentration (80/20)</p>
                    <p className="text-xl font-bold text-orange-900">{metriquesPortefeuille.concentration.toFixed(1)}%</p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Répartition par Segments</p>
                  <div className="space-y-2">
                    {Array.from(metriquesPortefeuille.repartitionSegments.entries()).map(([segment, count]) => (
                      <div key={segment} className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 capitalize">{segment}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-slate-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                               
                                segment === 'vip' ? 'bg-purple-500' :
                                segment === 'strategique' ? 'bg-blue-500' :
                                segment === 'regulier' ? 'bg-green-500' :
                                'bg-yellow-500'
                              }`}
                              style={{ width: `${(count / metriquesPortefeuille.nombreClients) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-slate-900 w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              
              {/* Actions CRM */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setIsCrmModalOpen(true)}
                  className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
                >
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Interactions CRM</span>
                  {interactionsCRM.length > 0 && (
                    <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs">
                      {interactionsCRM.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setIsPrevisionsRevenusModalOpen(true)}
                  className="flex items-center justify-center p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg"
                >
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Prévisions Revenus</span>
                </button>
                <button
                  onClick={() => setIsAnalyseValeurModalOpen(true)}
                  className="flex items-center justify-center p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                >
                  <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                  <span className="font-semibold">Valeur Client (CLV)</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <p className="text-slate-500">Données analytiques à charger via API</p>
            </div>
          )}

          {/* Autres onglets à implémenter */}
          {activeTab === 'relances' && (
            <div className="space-y-6">
              <p className="text-slate-500">Données de relances à charger via API</p>
            </div>
          )}

          {/* Onglet Suivi des Livraisons */}
          {activeTab === 'livraisons' && (
            <div className="space-y-6">
              <p className="text-slate-500">Données de livraisons à charger via API</p>
            </div>
          )}

          {activeTab === 'communications' && (
            <div className="space-y-6">
              {/* En-tête avec statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Total Communications</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{communicationStats.totalCommunications}</p>
                    </div>
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <ChatBubbleLeftRightIcon className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">En Attente</p>
                      <p className="text-2xl font-bold text-amber-600 mt-1">{communicationStats.communicationsEnAttente}</p>
                    </div>
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <ClockIcon className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Relances en Cours</p>
                      <p className="text-2xl font-bold text-red-600 mt-1">{communicationStats.relancesEnCours}</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-lg">
                      <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Montant en Retard</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(communicationStats.montantTotalEnRetard)}</p>
                    </div>
                    <div className="p-3 bg-slate-100 rounded-lg">
                      <CurrencyDollarIcon className="h-6 w-6 text-slate-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtres et actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex space-x-2">
                  <select
                    value={communicationFilter}
                    onChange={(e) => setCommunicationFilter(e.target.value)}
                    aria-label="Filtrer par type de communication"
                    className="px-4 py-2 border border-slate-300 bg-white rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm text-slate-700 font-medium"
                  >
                    <option value="tous">Toutes</option>
                    <option value="relance">Relances</option>
                    <option value="email">Emails</option>
                    <option value="appel">Appels</option>
                    <option value="rendez-vous">RDV</option>
                  </select>
                  
                  <select
                    value={relanceFilter}
                    onChange={(e) => setRelanceFilter(e.target.value)}
                    aria-label="Filtrer par type de relance"
                    className="px-4 py-2 border border-slate-300 bg-white rounded-lg focus:ring-2 focus:ring-emerald-500 text-sm text-slate-700 font-medium"
                  >
                    <option value="tous">Toutes relances</option>
                    <option value="premiere">1ère</option>
                    <option value="deuxieme">2ème</option>
                    <option value="troisieme">3ème</option>
                    <option value="mise_en_demeure">Mise en demeure</option>
                  </select>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsNewCommunicationModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Communication
                  </button>
                  <button
                    onClick={() => setIsRelanceModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium shadow-sm"
                  >
                    <BellIcon className="h-5 w-5 mr-2" />
                    Relance
                  </button>
                </div>
              </div>

              {/* Liste des communications */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-slate-900">Communications Récentes</h3>
                <div className="space-y-3">
                  {[].filter((comm: any) => communicationFilter === 'tous' || comm.type === communicationFilter)
                    .map((comm: any) => {
                      const typeInfo = communicationTypes.find(t => t.value === comm.type);
                      return (
                        <div key={comm.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg ${
                                typeInfo?.color === 'blue' ? 'bg-blue-100' :
                                typeInfo?.color === 'green' ? 'bg-green-100' :
                                typeInfo?.color === 'red' ? 'bg-red-100' :
                                typeInfo?.color === 'orange' ? 'bg-orange-100' :
                                'bg-purple-100'
                              }`}>
                                {comm.type === 'email' ? <EnvelopeIcon className="h-5 w-5 text-blue-600" /> :
                                 comm.type === 'call' ? <PhoneIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> :
                                 comm.type === 'meeting' ? <CalendarIcon className="h-5 w-5 text-orange-600" /> :
                                 comm.type === 'proposition' ? <DocumentTextIcon className="h-5 w-5 text-blue-600" /> :
                                 <ExclamationCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-sm font-medium text-gray-900">{comm.sujet}</h4>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    comm.priorite === 'urgente' ? 'bg-red-100 text-red-800' :
                                    comm.priorite === 'haute' ? 'bg-orange-100 text-orange-800' :
                                    comm.priorite === 'moyenne' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {comm.priorite}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{comm.contenu}</p>
                                <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                  <span>Client: {selectedClient?.nom}</span>
                                  <span>Date: {new Date(comm.date).toLocaleDateString('fr-FR')}</span>
                                  {comm.montant && <span>Montant: {formatCurrency(comm.montant)}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                comm.statut === 'envoye' ? 'bg-green-100 text-green-800' :
                                comm.statut === 'lu' ? 'bg-green-100 text-green-800' :
                                comm.statut === 'repondu' ? 'bg-emerald-100 text-emerald-800' :
                                comm.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-slate-900 dark:text-slate-100'
                              }`}>
                                {comm.statut === 'envoye' ? 'Envoyé' :
                                 comm.statut === 'lu' ? 'Lu' :
                                 comm.statut === 'repondu' ? 'Répondu' :
                                 comm.statut === 'en_attente' ? 'En attente' : 'Annulé'}
                              </span>
                              <button type="button" aria-label="Voir les détails" className="text-gray-400 hover:text-slate-600 dark:text-slate-400">
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Liste des relances */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-slate-900">Relances en Cours</h3>
                <div className="space-y-3">
                  {[].filter((relance: any) => relanceFilter === 'tous' || relance.type === relanceFilter)
                    .map((relance: any) => {
                      const typeInfo = relanceTypes.find(t => t.value === relance.type);
                      const canalInfo = relanceCanaux.find(c => c.value === relance.canal);
                      return (
                        <div key={relance.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg ${
                                typeInfo?.color === 'yellow' ? 'bg-yellow-100' :
                                typeInfo?.color === 'orange' ? 'bg-orange-100' :
                                'bg-red-100'
                              }`}>
                                <ExclamationCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {typeInfo?.label} - {relance.factureId}
                                  </h4>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    relance.statut === 'envoyee' ? 'bg-blue-100 text-blue-800' :
                                    relance.statut === 'lue' ? 'bg-green-100 text-green-800' :
                                    relance.statut === 'payee' ? 'bg-emerald-100 text-emerald-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {relance.statut === 'envoyee' ? 'Envoyée' :
                                     relance.statut === 'lue' ? 'Lue' :
                                     relance.statut === 'payee' ? 'Payée' : 'En attente'}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                  Relance envoyée le {new Date(relance.dateRelance).toLocaleDateString('fr-FR')} 
                                  par {canalInfo?.label} pour un montant de {formatCurrency(relance.montant)}
                                </p>
                                <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                                  <span>Client: {relance.clientName || 'N/A'}</span>
                                  <span>Échéance: {new Date(relance.dateEcheance).toLocaleDateString('fr-FR')}</span>
                                  {relance.fraisRetard && relance.fraisRetard > 0 && <span>Frais retard: {formatCurrency(relance.fraisRetard)}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button type="button" aria-label="Envoyer la relance" className="text-blue-600 hover:text-blue-800">
                                <PaperAirplaneIcon className="h-4 w-4" />
                              </button>
                              <button type="button" aria-label="Voir les détails de la relance" className="text-gray-400 hover:text-slate-600 dark:text-slate-400">
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rapports' && (
            <div className="space-y-6">
              {/* En-tête avec statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Total Rapports</p>
                      <p className="text-2xl font-bold text-slate-900 mt-1">{statistiquesRapports.totalRapports}</p>
                    </div>
                    <div className="p-3 bg-slate-100 rounded-lg">
                      <DocumentChartBarIcon className="h-6 w-6 text-slate-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Rapports Générés</p>
                      <p className="text-2xl font-bold text-emerald-600 mt-1">{statistiquesRapports.rapportsGeneres}</p>
                    </div>
                    <div className="p-3 bg-emerald-100 rounded-lg">
                      <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">En Cours</p>
                      <p className="text-2xl font-bold text-amber-600 mt-1">{statistiquesRapports.rapportsEnCours}</p>
                    </div>
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <ClockIcon className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 font-medium">Taille Totale</p>
                      <p className="text-xl font-bold text-slate-900 mt-1">{statistiquesRapports.tailleTotale}</p>
                    </div>
                    <div className="p-3 bg-slate-100 rounded-lg">
                      <DocumentArrowDownIcon className="h-6 w-6 text-slate-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Métriques clés */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {metriquesRapports.map((metrique, index) => (
                  <div key={index} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">{metrique.nom}</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {metrique.unite === 'DZD' ? formatCurrency(metrique.valeur) : 
                           metrique.unite === '%' ? `${metrique.valeur}%` :
                           metrique.unite === '/5' ? `${metrique.valeur}/5` :
                           metrique.valeur}
                        </p>
                        <div className="flex items-center mt-1">
                          {metrique.evolution >= 0 ? (
                            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                          )}
                          <span className={`text-sm ${metrique.evolution >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                            {Math.abs(metrique.evolution)}%
                          </span>
                        </div>
                      </div>
                      <div className="text-2xl">{metrique.icone}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Filtres et actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <select
                  value={rapportFilter}
                  onChange={(e) => setRapportFilter(e.target.value)}
                  aria-label="Filtrer par type de rapport"
                  className="px-4 py-2 border border-slate-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-slate-700 font-medium"
                >
                  <option value="tous">Tous les rapports</option>
                  {typesRapports.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={() => setIsNouveauRapportModalOpen(true)}
                  className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nouveau Rapport
                </button>
              </div>

              {/* Liste des rapports */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">📋 Rapports Disponibles</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {[].filter((rapport: any) => rapportFilter === 'tous' || rapport.type === rapportFilter)
                    .map((rapport: any) => {
                      const formatInfo = formatsRapport.find(f => f.value === rapport.format);
                      return (
                        <div key={rapport.id} className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:shadow-lg hover:border-emerald-300 transition-all">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                              <div className={`p-4 rounded-xl ${
                                rapport.type === 'ventes' ? 'bg-cyan-100' :
                                rapport.type === 'paiements' ? 'bg-emerald-100' :
                                rapport.type === 'relances' ? 'bg-amber-100' :
                                rapport.type === 'satisfaction' ? 'bg-slate-100' :
                                rapport.type === 'performance' ? 'bg-cyan-100' :
                                'bg-red-100'
                              }`}>
                                {rapport.type === 'ventes' ? <ChartBarIcon className="h-8 w-8 text-cyan-600" /> :
                                 rapport.type === 'paiements' ? <BanknotesIcon className="h-8 w-8 text-emerald-600" /> :
                                 rapport.type === 'relances' ? <ExclamationCircleIcon className="h-8 w-8 text-amber-600" /> :
                                 rapport.type === 'satisfaction' ? <CheckCircleIcon className="h-8 w-8 text-slate-600" /> :
                                 rapport.type === 'performance' ? <ArrowTrendingUpIcon className="h-8 w-8 text-cyan-600" /> :
                                 <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />}
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{rapport.nom}</h3>
                                <p className="text-sm text-slate-600 mb-3">{rapport.description}</p>
                                <div className="flex items-center space-x-4 text-sm text-slate-500">
                                  <div className="flex items-center">
                                    <CalendarIcon className="h-4 w-4 mr-1" />
                                    <span>Période: <span className="font-medium text-slate-700">{rapport.periode}</span></span>
                                  </div>
                                  <div className="flex items-center">
                                    <ClockIcon className="h-4 w-4 mr-1" />
                                    <span>Généré: <span className="font-medium text-slate-700">{new Date(rapport.dateGeneration).toLocaleDateString('fr-FR')}</span></span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div>
                              <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-lg border ${
                                rapport.statut === 'termine' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                                rapport.statut === 'en_cours' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                                rapport.statut === 'generer' ? 'bg-cyan-100 text-cyan-700 border-cyan-300' :
                                'bg-red-100 text-red-700 border-red-300'
                              }`}>
                                {rapport.statut === 'termine' ? '✓ Terminé' :
                                 rapport.statut === 'en_cours' ? '⏳ En cours' :
                                 rapport.statut === 'generer' ? '📊 À générer' : '✗ Erreur'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t-2 border-slate-100">
                            <div className="flex items-center space-x-4">
                              <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold ${
                                rapport.format === 'pdf' ? 'bg-red-50 text-red-700 border border-red-200' :
                                rapport.format === 'excel' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                rapport.format === 'html' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200' :
                                'bg-slate-50 text-slate-700 border border-slate-200'
                              }`}>
                                {formatInfo?.label}
                              </div>
                              <span className="text-sm font-medium text-slate-600">{rapport.taille}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleDownloadRapport(rapport)}
                                className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-medium" 
                                title="Télécharger"
                              >
                                <DocumentArrowDownIcon className="h-4 w-4 inline mr-1" />
                                Télécharger
                              </button>
                              <button 
                                onClick={() => handleViewRapport(rapport)}
                                className="p-1.5 bg-cyan-100 text-cyan-600 rounded-lg hover:bg-cyan-200 transition-colors" 
                                title="Voir"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  if (confirm(`Êtes-vous sûr de vouloir supprimer le rapport "${rapport.nom}" ?`)) {
                                    alert('Rapport supprimé avec succès !');
                                  }
                                }}
                                className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors" 
                                title="Supprimer"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Analyses Visuelles Enrichies */}
              <p className="text-slate-500">Analyses visuelles à charger via API</p>
            </div>
          )}
        </div>
      </Card>

      {/* Modal Détails Client ERPNext */}
      <Modal
        isOpen={isClientDetailsModalOpen}
        onClose={() => setIsClientDetailsModalOpen(false)}
        title={`Détails Client - ${selectedClient?.nom}`}
        size="xl"
      >
        {selectedClient && (
          <div className="space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Informations Générales</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Nom de l'entreprise</label>
                    <p className="text-gray-900">{selectedClient.nom}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">NIF</label>
                    <p className="text-gray-900">{selectedClient.nif}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Secteur d'activité</label>
                    <p className="text-gray-900">{selectedClient.secteur}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Adresse</label>
                    <p className="text-gray-900">{selectedClient.adresse}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Contact</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Téléphone</label>
                    <p className="text-gray-900">{selectedClient.telephone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</label>
                    <p className="text-gray-900">{selectedClient.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Délai de paiement</label>
                    <p className="text-gray-900">{selectedClient.delaiPaiement} jours</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Taux d'escompte</label>
                    <p className="text-gray-900">{selectedClient.tauxEscompte}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations financières */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-4">Informations Financières</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-blue-600">Solde Actuel</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {formatCurrency(selectedClient.solde)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600">Limite de Crédit</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {formatCurrency(selectedClient.limiteCredit || 0)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-600">Catégorie de Risque</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedClient.categorieRisque === 'faible' ? 'bg-green-100 text-green-800' :
                    selectedClient.categorieRisque === 'moyen' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedClient.categorieRisque}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => handleViewPaymentHistory(selectedClient)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <BanknotesIcon className="h-5 w-5 mr-2" />
                Historique Paiements
              </button>
              <button
                onClick={() => handleCommunicateWithClient(selectedClient)}
                className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                <PhoneIcon className="h-5 w-5 mr-2" />
                Communiquer
              </button>
              <button
                onClick={() => handleEdit(selectedClient)}
                className="flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
              >
                <PencilIcon className="h-5 w-5 mr-2" />
                Modifier
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Historique des Paiements */}
      <Modal
        isOpen={isPaymentHistoryModalOpen}
        onClose={() => setIsPaymentHistoryModalOpen(false)}
        title={`Historique des Paiements - ${selectedClient?.nom}`}
        size="lg"
      >
        {selectedClient && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Résumé Financier</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-600">Solde Actuel</p>
                  <p className="text-xl font-bold text-blue-800">
                    {formatCurrency(selectedClient.solde)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Limite de Crédit</p>
                  <p className="text-xl font-bold text-blue-800">
                    {formatCurrency(selectedClient.limiteCredit || 0)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Historique des Paiements</h4>
              <div className="space-y-3">
                {clientPaymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{payment.invoice}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{payment.date}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {payment.status === 'paid' ? 'Payé' : 'En retard'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{payment.method}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Communication Client */}
      <Modal
        isOpen={isCommunicationModalOpen}
        onClose={() => setIsCommunicationModalOpen(false)}
        title={`Communication - ${selectedClient?.nom}`}
        size="lg"
      >
        {selectedClient && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Informations de Contact</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-blue-600">Téléphone</p>
                  <p className="text-gray-900">{selectedClient.telephone}</p>
                </div>
                <div>
                  <p className="text-sm text-blue-600">Email</p>
                  <p className="text-gray-900">{selectedClient.email}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Historique des Communications</h4>
              <div className="space-y-3">
                {clientCommunications.map((comm) => (
                  <div key={comm.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        comm.type === 'email' ? 'bg-blue-100' :
                        comm.type === 'call' ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        {comm.type === 'email' ? <EnvelopeIcon className="h-5 w-5 text-blue-600" /> :
                         comm.type === 'call' ? <PhoneIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> :
                         <CalendarIcon className="h-5 w-5 text-purple-600" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{comm.subject}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{comm.date}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      comm.status === 'sent' ? 'bg-green-100 text-green-800' :
                      comm.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {comm.status === 'sent' ? 'Envoyé' :
                       comm.status === 'completed' ? 'Terminé' : 'Planifié'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-900 mb-3">Nouvelle Communication</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select aria-label="Type de communication" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="email">Email</option>
                    <option value="call">Appel téléphonique</option>
                    <option value="meeting">Rendez-vous</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Sujet de la communication"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Contenu du message"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsCommunicationModalOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Annuler
                  </button>
                  <button className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
                    Envoyer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Nouvelle Relance */}
      <Modal
        isOpen={isRelanceModalOpen}
        onClose={() => setIsRelanceModalOpen(false)}
        title="Nouvelle Relance"
        size="lg"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </label>
              <select
                required
                aria-label="Sélectionner un client"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">Sélectionner un client</option>
                {(apiClients || []).map((client: any) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facture *
              </label>
              <select
                required
                aria-label="Facture"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="">Sélectionner une facture</option>
                <option value="F-2024-001">F-2024-001 - 45,000 DZD</option>
                <option value="F-2024-002">F-2024-002 - 18,500 DZD</option>
                <option value="F-2024-003">F-2024-003 - 28,500 DZD</option>
                <option value="F-2024-004">F-2024-004 - 67,500 DZD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de relance *
              </label>
              <select
                required
                aria-label="Type de relance"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                {relanceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Canal de communication *
              </label>
              <select
                required
                aria-label="Canal de communication"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                {relanceCanaux.map(canal => (
                  <option key={canal.value} value={canal.value}>
                    {canal.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant de la facture (DZD) *
            </label>
            <input
              type="number"
              required
              aria-label="Montant de la facture (DZD)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'échéance *
              </label>
              <input
                type="date"
                required
                aria-label="Date d'échéance"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de relance
              </label>
              <input
                type="date"
                aria-label="Date de relance"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message de relance *
            </label>
            <textarea
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="Message personnalisé de relance..."
              defaultValue="Bonjour,

Nous vous contactons concernant la facture [NUMERO_FACTURE] d'un montant de [MONTANT] DZD qui était due le [DATE_ECHEANCE].

Pourriez-vous nous confirmer le règlement de cette facture dans les plus brefs délais ?

En cas de difficulté, n'hésitez pas à nous contacter pour trouver une solution.

Cordialement,
L'équipe comptable"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frais de retard (%)
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="2.0"
                defaultValue="2.0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prochaine échéance
              </label>
              <input
                type="date"
                aria-label="Prochaine échéance"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
              <p className="text-sm text-yellow-800">
                <strong>Attention :</strong> Cette relance sera automatiquement enregistrée dans l'historique des communications du client.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsRelanceModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Envoyer Relance
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Nouveau Rapport */}
      <Modal
        isOpen={isNouveauRapportModalOpen}
        onClose={() => setIsNouveauRapportModalOpen(false)}
        title="Générer un Nouveau Rapport"
        size="lg"
      >
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de rapport *
              </label>
              <select
                required
                aria-label="Type de rapport"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {typesRapports.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format de sortie *
              </label>
              <select
                required
                aria-label="Format de sortie"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {formatsRapport.map(format => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Période *
              </label>
              <select
                required
                aria-label="Période"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {periodesRapport.map(periode => (
                  <option key={periode.value} value={periode.value}>
                    {periode.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                aria-label="Date de début"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de fin
            </label>
            <input
              type="date"
              aria-label="Date de fin"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du rapport
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Rapport des Ventes - Janvier 2024"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnel)
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Description du rapport..."
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <DocumentChartBarIcon className="h-5 w-5 text-blue-600 mr-2" />
              <p className="text-sm text-blue-800">
                <strong>Information :</strong> Le rapport sera généré en arrière-plan et vous recevrez une notification une fois terminé.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsNouveauRapportModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
            >
              Générer le Rapport
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Visualisation Rapport */}
      <Modal
        isOpen={isRapportViewModalOpen}
        onClose={() => {
          setIsRapportViewModalOpen(false);
          setSelectedRapport(null);
        }}
        title={selectedRapport?.nom || 'Rapport'}
        size="xl"
      >
        {selectedRapport && (
          <div className="space-y-6">
            {/* En-tête du rapport */}
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className={`p-4 rounded-xl ${
                    selectedRapport.type === 'ventes' ? 'bg-cyan-100' :
                    selectedRapport.type === 'paiements' ? 'bg-emerald-100' :
                    selectedRapport.type === 'relances' ? 'bg-amber-100' :
                    selectedRapport.type === 'satisfaction' ? 'bg-slate-100' :
                    selectedRapport.type === 'performance' ? 'bg-cyan-100' :
                    'bg-red-100'
                  }`}>
                    {selectedRapport.type === 'ventes' ? <ChartBarIcon className="h-8 w-8 text-cyan-600" /> :
                     selectedRapport.type === 'paiements' ? <BanknotesIcon className="h-8 w-8 text-emerald-600" /> :
                     selectedRapport.type === 'relances' ? <ExclamationCircleIcon className="h-8 w-8 text-amber-600" /> :
                     selectedRapport.type === 'satisfaction' ? <CheckCircleIcon className="h-8 w-8 text-slate-600" /> :
                     selectedRapport.type === 'performance' ? <ArrowTrendingUpIcon className="h-8 w-8 text-cyan-600" /> :
                     <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{selectedRapport.nom}</h3>
                    <p className="text-sm text-slate-600 mb-3">{selectedRapport.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-slate-500">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>Période: <span className="font-medium text-slate-700">{selectedRapport.periode}</span></span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>Généré: <span className="font-medium text-slate-700">{new Date(selectedRapport.dateGeneration).toLocaleDateString('fr-FR')}</span></span>
                      </div>
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-4 w-4 mr-1" />
                        <span>Taille: <span className="font-medium text-slate-700">{selectedRapport.taille}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <span className={`inline-flex px-3 py-1.5 text-xs font-bold rounded-lg border ${
                    selectedRapport?.statut === 'termine' ? 'bg-emerald-100 text-emerald-700 border-emerald-300' :
                    selectedRapport?.statut === 'en_cours' ? 'bg-amber-100 text-amber-700 border-amber-300' :
                    selectedRapport?.statut === 'generer' ? 'bg-cyan-100 text-cyan-700 border-cyan-300' :
                    'bg-red-100 text-red-700 border-red-300'
                  }`}>
                    {selectedRapport?.statut === 'termine' ? '✓ Terminé' :
                     selectedRapport?.statut === 'en_cours' ? '⏳ En cours' :
                     selectedRapport?.statut === 'generer' ? '📊 À générer' : '✗ Erreur'}
                  </span>
                </div>
              </div>
            </div>

            {/* Contenu du rapport selon le type */}
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              {selectedRapport.type === 'ventes' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3">📊 Analyse des Ventes par Client - {selectedRapport.periode}</h4>
                  
                  {/* Résumé exécutif */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                      <div className="text-sm text-slate-600 mb-1">Chiffre d'affaires total</div>
                      <div className="text-2xl font-bold text-cyan-600">2,450,000 DZD</div>
                      <div className="text-xs text-emerald-600 mt-1">+15.2% vs mois précédent</div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <div className="text-sm text-slate-600 mb-1">Nombre de clients</div>
                      <div className="text-2xl font-bold text-emerald-600">87</div>
                      <div className="text-xs text-emerald-600 mt-1">+12 nouveaux clients</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="text-sm text-slate-600 mb-1">Panier moyen</div>
                      <div className="text-2xl font-bold text-slate-900">28,161 DZD</div>
                      <div className="text-xs text-slate-500 mt-1">Par client</div>
                    </div>
                  </div>

                  {/* Top 10 Clients */}
                  <div>
                    <h5 className="text-base font-semibold text-slate-900 mb-3">Top 10 Clients</h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Rang</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">CA</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">% du total</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Évolution</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                          {[
                            { rang: 1, nom: 'SARL DZ', ca: 485000, part: 19.8, evolution: 12.5 },
                            { rang: 2, nom: 'Entreprise ABC', ca: 420000, part: 17.1, evolution: 8.3 },
                            { rang: 3, nom: 'Société XYZ', ca: 380000, part: 15.5, evolution: -2.1 },
                            { rang: 4, nom: 'Groupe DEF', ca: 325000, part: 13.3, evolution: 18.7 },
                            { rang: 5, nom: 'Compagnie GHI', ca: 285000, part: 11.6, evolution: 5.4 }
                          ].map((client) => (
                            <tr key={client.rang} className="hover:bg-slate-50">
                              <td className="px-4 py-3 text-sm font-bold text-slate-900">#{client.rang}</td>
                              <td className="px-4 py-3 text-sm font-medium text-slate-900">{client.nom}</td>
                              <td className="px-4 py-3 text-sm font-bold text-slate-900">{client.ca.toLocaleString()} DZD</td>
                              <td className="px-4 py-3 text-sm text-slate-600">{client.part}%</td>
                              <td className="px-4 py-3 text-sm text-right">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  client.evolution >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {client.evolution >= 0 ? '↗' : '↘'} {Math.abs(client.evolution)}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {selectedRapport.type === 'paiements' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3">💰 Analyse des Paiements et Retards - {selectedRapport.periode}</h4>
                  
                  {/* Statistiques des paiements */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <div className="text-sm text-slate-600 mb-1">Paiements reçus</div>
                      <div className="text-2xl font-bold text-emerald-600">1,850,000 DZD</div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <div className="text-sm text-slate-600 mb-1">En attente</div>
                      <div className="text-2xl font-bold text-amber-600">425,000 DZD</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <div className="text-sm text-slate-600 mb-1">En retard</div>
                      <div className="text-2xl font-bold text-red-600">175,000 DZD</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="text-sm text-slate-600 mb-1">Taux de recouvrement</div>
                      <div className="text-2xl font-bold text-slate-900">75.5%</div>
                    </div>
                  </div>

                  {/* Détails des retards */}
                  <div>
                    <h5 className="text-base font-semibold text-slate-900 mb-3">Factures en Retard</h5>
                    <div className="space-y-2">
                      {[
                        { facture: 'FAC-2024-001', client: 'Société XYZ', montant: 85000, jours: 45, priorite: 'haute' },
                        { facture: 'FAC-2024-008', client: 'Groupe DEF', montant: 62000, jours: 30, priorite: 'moyenne' },
                        { facture: 'FAC-2024-012', client: 'Entreprise ABC', montant: 28000, jours: 15, priorite: 'basse' }
                      ].map((retard, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{retard.facture} - {retard.client}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{retard.jours} jours de retard</p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right mr-4">
                            <div className="font-bold text-red-600">{formatCurrency(retard.montant)}</div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            retard.priorite === 'haute' ? 'bg-red-100 text-red-700' :
                            retard.priorite === 'moyenne' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {retard.priorite}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedRapport.type === 'relances' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3">📧 Suivi des Relances Clients - {selectedRapport.periode}</h4>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <div className="text-sm text-slate-600 mb-1">Relances envoyées</div>
                      <div className="text-2xl font-bold text-amber-600">24</div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <div className="text-sm text-slate-600 mb-1">Paiements obtenus</div>
                      <div className="text-2xl font-bold text-emerald-600">18</div>
                    </div>
                    <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                      <div className="text-sm text-slate-600 mb-1">Taux de succès</div>
                      <div className="text-2xl font-bold text-cyan-600">75%</div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-600 leading-relaxed">
                    <p className="mb-2">📊 <strong>Efficacité des relances:</strong> Sur 24 relances envoyées ce mois, 18 ont abouti à un paiement, soit un taux de réussite de 75%.</p>
                    <p className="mb-2">📈 <strong>Délai moyen de paiement après relance:</strong> 8 jours</p>
                    <p>💡 <strong>Recommandation:</strong> Les relances par téléphone ont un taux de succès de 85%, contre 65% pour les emails.</p>
                  </div>
                </div>
              )}

              {selectedRapport.type === 'satisfaction' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3">⭐ Enquête Satisfaction Clients - {selectedRapport.periode}</h4>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <div className="text-sm text-slate-600 mb-1">Score moyen</div>
                      <div className="text-3xl font-bold text-emerald-600">4.2/5</div>
                    </div>
                    <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                      <div className="text-sm text-slate-600 mb-1">Réponses</div>
                      <div className="text-2xl font-bold text-cyan-600">156</div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <div className="text-sm text-slate-600 mb-1">Taux de réponse</div>
                      <div className="text-2xl font-bold text-amber-600">62%</div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="text-sm text-slate-600 mb-1">NPS</div>
                      <div className="text-2xl font-bold text-slate-900">+42</div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-base font-semibold text-slate-900 mb-3">Répartition des Notes</h5>
                    <div className="space-y-2">
                      {[
                        { note: 5, count: 78, color: 'emerald' },
                        { note: 4, count: 45, color: 'cyan' },
                        { note: 3, count: 22, color: 'amber' },
                        { note: 2, count: 8, color: 'red' },
                        { note: 1, count: 3, color: 'red' }
                      ].map((item) => (
                        <div key={item.note} className="flex items-center space-x-3">
                          <div className="w-16 text-sm font-medium text-slate-700">{item.note} étoiles</div>
                          <div className="flex-1 bg-slate-200 rounded-full h-2 mr-2">
                            <div
                              className={`bg-${item.color}-500 h-2 rounded-full flex items-center justify-end pr-2`}
                              style={{ width: `${(item.count / 156) * 100}%` }}
                            >
                              <span className="text-xs font-bold text-white">{item.count}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedRapport.type === 'performance' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3">📈 Performance Clients VIP - {selectedRapport.periode}</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                      <div className="text-sm text-slate-600 mb-1">CA VIP</div>
                      <div className="text-2xl font-bold text-cyan-600">1,240,000 DZD</div>
                      <div className="text-xs text-slate-600 mt-1">50.6% du CA total</div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <div className="text-sm text-slate-600 mb-1">Clients VIP</div>
                      <div className="text-2xl font-bold text-emerald-600">15</div>
                      <div className="text-xs text-slate-600 mt-1">17% de la base client</div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-600 leading-relaxed">
                    <p>💎 <strong>Observation clé:</strong> Les 15 clients VIP représentent plus de la moitié du chiffre d'affaires total. La fidélisation de ces comptes stratégiques est prioritaire.</p>
                  </div>
                </div>
              )}

              {selectedRapport.type === 'risques' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-3">⚠️ Évaluation des Risques Clients - {selectedRapport.periode}</h4>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <div className="text-sm text-slate-600 mb-1">Risque élevé</div>
                      <div className="text-2xl font-bold text-red-600">8 clients</div>
                      <div className="text-xs text-slate-600 mt-1">Exposition: 285k DZD</div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <div className="text-sm text-slate-600 mb-1">Risque moyen</div>
                      <div className="text-2xl font-bold text-amber-600">23 clients</div>
                      <div className="text-xs text-slate-600 mt-1">Exposition: 520k DZD</div>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                      <div className="text-sm text-slate-600 mb-1">Risque faible</div>
                      <div className="text-2xl font-bold text-emerald-600">56 clients</div>
                      <div className="text-xs text-slate-600 mt-1">Exposition: 1,645k DZD</div>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <div className="flex items-start space-x-3">
                      <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                      <div className="text-sm text-slate-700">
                        <strong>Actions recommandées:</strong> 8 clients présentent un risque élevé avec une exposition totale de 285,000 DZD. Révision des limites de crédit et renforcement du suivi recommandés.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Message générique pour autres types */}
              {!['ventes', 'paiements', 'relances', 'satisfaction', 'performance', 'risques'].includes(selectedRapport.type) && (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Aperçu du rapport non disponible</p>
                  <p className="text-sm text-slate-400 mt-2">Utilisez le bouton "Télécharger" pour accéder au contenu complet</p>
                </div>
              )}
            </div>

            {/* Actions du modal */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setIsRapportViewModalOpen(false);
                  setSelectedRapport(null);
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Fermer
              </button>
              <button
                onClick={() => handleDownloadRapport(selectedRapport)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                <DocumentArrowDownIcon className="h-5 w-5 inline mr-2" />
                Télécharger
              </button>
            </div>
          </div>
        )}
      </Modal>
    
      {/* Modal Analyse de Valeur Client (CLV) */}
      <Modal
      isOpen={isAnalyseValeurModalOpen}
      onClose={() => setIsAnalyseValeurModalOpen(false)}
      title="Analyse de Valeur Client (CLV)"
      size="xl"
    >
      <div className="space-y-6">
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-800">
            Analyse de la valeur client basée sur le CLV (Customer Lifetime Value), le CAC (Customer Acquisition Cost) et les métriques de performance.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Client</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">CLV</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">CAC</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Ratio CLV/CAC</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Panier Moyen</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Fréquence</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Score</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Tendance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {analysesValeurClient.slice(0, 10).map((analyse) => (
                <tr key={analyse.clientId} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{analyse.clientNom}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatCurrency(analyse.clv)}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatCurrency(analyse.cac)}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-green-600">{analyse.ratioClvCac.toFixed(2)}x</td>
                  <td className="px-4 py-3 text-sm text-right">{formatCurrency(analyse.panierMoyen)}</td>
                  <td className="px-4 py-3 text-sm text-right">{analyse.frequenceAchat.toFixed(1)}/an</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      analyse.scoreValeur >= 85 ? 'bg-green-100 text-green-800' :
                      analyse.scoreValeur >= 70 ? 'bg-blue-100 text-blue-800' :
                      analyse.scoreValeur >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {analyse.scoreValeur}/100
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      analyse.tendance === 'croissance' ? 'bg-green-100 text-green-800' :
                      analyse.tendance === 'stabilite' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {analyse.tendance === 'croissance' ? '↗' : analyse.tendance === 'stabilite' ? '→' : '↘'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={() => setIsAnalyseValeurModalOpen(false)}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
    
    {/* Modal Prévisions de Revenus par Client */}
    <Modal
      isOpen={isPrevisionsRevenusModalOpen}
      onClose={() => setIsPrevisionsRevenusModalOpen(false)}
      title="Prévisions de Revenus par Client"
      size="xl"
    >
      <div className="space-y-6">
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-800">
            Prévisions de revenus sur 6 mois basées sur l'historique, la tendance et la saisonnalité.
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Client</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Période</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Revenus Prévu</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Probabilité</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Confiance</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {previsionsRevenus.slice(0, 20).map((prev, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">{prev.clientNom}</td>
                  <td className="px-4 py-3 text-sm text-right">{prev.periode}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">{formatCurrency(prev.revenusPrevu)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-16 bg-slate-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${
                            prev.probabilite >= 80 ? 'bg-green-500' :
                            prev.probabilite >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${prev.probabilite}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">{prev.probabilite.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      prev.confiance === 'haute' ? 'bg-green-100 text-green-800' :
                      prev.confiance === 'moyenne' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {prev.confiance}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={() => setIsPrevisionsRevenusModalOpen(false)}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
    
    {/* Modal Interactions CRM */}
    <Modal
      isOpen={isCrmModalOpen}
      onClose={() => setIsCrmModalOpen(false)}
      title="Interactions CRM - Actions Recommandées"
      size="xl"
    >
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            Interactions CRM recommandées basées sur l'analyse de valeur client, la tendance et l'activité récente.
          </p>
        </div>
        
        <div className="space-y-3">
          {interactionsCRM.slice(0, 10).map((interaction) => (
            <div
              key={interaction.id}
              className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {interaction.type === 'appel' && <PhoneIcon className="h-5 w-5 text-blue-600" />}
                  {interaction.type === 'email' && <EnvelopeIcon className="h-5 w-5 text-blue-600" />}
                  {interaction.type === 'reunion' && <CalendarIcon className="h-5 w-5 text-blue-600" />}
                  {interaction.type === 'proposition' && <DocumentTextIcon className="h-5 w-5 text-blue-600" />}
                  {interaction.type === 'relance' && <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />}
                  {interaction.type === 'suivi' && <CheckCircleIcon className="h-5 w-5 text-green-600" />}
                  <h4 className="font-semibold text-slate-900">{interaction.sujet}</h4>
                </div>
                <span className="text-xs text-slate-500">{new Date(interaction.date).toLocaleDateString('fr-FR')}</span>
              </div>
              <p className="text-sm text-slate-700 mb-2">{interaction.description}</p>
              {interaction.prochaineAction && (
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <p className="text-xs font-semibold text-slate-600 mb-1">Prochaine action:</p>
                  <p className="text-sm text-slate-800">{interaction.prochaineAction}</p>
                  {interaction.dateProchaineAction && (
                    <p className="text-xs text-slate-500 mt-1">
                      Date: {new Date(interaction.dateProchaineAction).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={() => setIsCrmModalOpen(false)}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
    
    {/* Modal Segmentation Clients */}
    <Modal
      isOpen={isSegmentationModalOpen}
      onClose={() => setIsSegmentationModalOpen(false)}
      title="Segmentation des Clients"
      size="xl"
    >
      <div className="space-y-6">
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
          <p className="text-sm text-indigo-800">
            Segmentation automatique des clients selon leur valeur, fréquence d'achat, marge et DSO.
          </p>
        </div>
        
        <div className="space-y-4">
          {[...segmentsClients.entries()].map(([segmentId, clientIds]) => {
            const segmentNames: Record<string, string> = {
              vip: 'Clients VIP',
              strategique: 'Clients Stratégiques',
              reguliers: 'Clients Réguliers',
              occasionnels: 'Clients Occasionnels',
              a_risque: 'Clients à Risque'
            };
            
            const segmentColors: Record<string, string> = {
              vip: 'bg-purple-500',
              strategique: 'bg-blue-500',
              reguliers: 'bg-green-500',
              occasionnels: 'bg-yellow-500',
              a_risque: 'bg-red-500'
            };
            
            return (
              <div
                key={segmentId}
                className={`p-4 rounded-lg border-2 ${segmentColors[segmentId] || 'bg-slate-100 border-slate-300'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-lg">{segmentNames[segmentId] || segmentId}</h4>
                  <span className="px-3 py-1 bg-white/50 rounded-full text-sm font-medium">
                    {clientIds.length} client(s)
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  {clientIds.slice(0, 8).map((clientId) => {
                    const client = (apiClients || []).find((c: any) => (c.id?.toString() || c.name) === clientId);
                    return (
                      <div key={clientId} className="bg-white/50 p-2 rounded text-xs">
                        {client?.nom || clientId}
                      </div>
                    );
                  })}
                  {clientIds.length > 8 && (
                    <div className="bg-white/50 p-2 rounded text-xs font-medium">
                      +{clientIds.length - 8} autres
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={() => setIsSegmentationModalOpen(false)}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
    </div>
  );
};

export default Clients;