import React, { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  DocumentTextIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  ChartBarIcon,
  LockClosedIcon,
  KeyIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import axios from 'axios';

const Audit: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('mois');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('logs');
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  
  // Dynamic audit data states
  const [auditLogsData, setAuditLogsData] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [errorLogs, setErrorLogs] = useState<string | null>(null);
  const [complianceData, setComplianceData] = useState<any>(null);
  const [securityMetrics, setSecurityMetrics] = useState<any>(null);

  // Fetch audit logs
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoadingLogs(true);
        const response = await axios.get('/api/v1/audit/logs', {
          params: { period: selectedPeriod, search: searchTerm }
        });
        const data = response.data as any;
        setAuditLogsData(data.logs || []);
        setComplianceData(data.compliance);
        setSecurityMetrics(data.security);
        setErrorLogs(null);
      } catch (err) {
        console.error('Error fetching audit logs:', err);
        setErrorLogs('Erreur lors du chargement des logs d\'audit');
      } finally {
        setLoadingLogs(false);
      }
    };

    fetchAuditLogs();
  }, [selectedPeriod, searchTerm]);

  // Nouvelles fonctions ERPNext pour l'audit
  const handleComplianceCheck = () => {
    setIsComplianceModalOpen(true);
  };

  const handleSecurityAnalysis = () => {
    setIsSecurityModalOpen(true);
  };

  const handleGenerateReport = () => {
    setIsReportModalOpen(true);
  };

  const handleRiskAssessment = () => {
    setIsRiskModalOpen(true);
  };

  // Données ERPNext pour l'audit
  // ...existing code...

  const riskAssessment = [
    { id: 1, risk: 'Accès non autorisé', level: 'Élevé', probability: 75, impact: 90, mitigation: 'Renforcer l\'authentification' },
    { id: 2, risk: 'Perte de données', level: 'Moyen', probability: 30, impact: 85, mitigation: 'Sauvegarde automatique' },
    { id: 3, risk: 'Non-conformité fiscale', level: 'Élevé', probability: 40, impact: 95, mitigation: 'Audit régulier' },
    { id: 4, risk: 'Erreur de calcul', level: 'Faible', probability: 15, impact: 60, mitigation: 'Validation automatique' }
  ];

  const auditCategories = [
    { name: 'Connexions', count: 1247, color: 'blue' },
    { name: 'Modifications', count: 456, color: 'green' },
    { name: 'Suppressions', count: 23, color: 'red' },
    { name: 'Exports', count: 89, color: 'yellow' },
    { name: 'Imports', count: 67, color: 'purple' }
  ];

  // Logs d'audit
  const auditLogs = [
    {
      id: '1',
      timestamp: '2024-01-15 14:30:25',
      user: 'Marie Dubois',
      action: 'Connexion',
      resource: 'Système',
      status: 'success',
      ip: '192.168.1.100',
      details: 'Connexion réussie depuis le bureau principal'
    },
    {
      id: '2',
      timestamp: '2024-01-15 14:25:10',
      user: 'Jean Martin',
      action: 'Modification',
      resource: 'Facture #F-2024-001',
      status: 'success',
      ip: '192.168.1.101',
      details: 'Montant modifié de 2500€ à 2750€'
    },
    {
      id: '3',
      timestamp: '2024-01-15 14:20:45',
      user: 'Ahmed Benali',
      action: 'Export',
      resource: 'Rapport Financier',
      status: 'warning',
      ip: '192.168.1.102',
      details: 'Export de données sensibles - autorisation requise'
    },
    {
      id: '4',
      timestamp: '2024-01-15 14:15:30',
      user: 'Fatima Zohra',
      action: 'Suppression',
      resource: 'Client #C-2024-045',
      status: 'failed',
      ip: '192.168.1.103',
      details: 'Tentative de suppression refusée - client avec factures en cours'
    }
  ];

  const auditStats = [
    {
      title: 'Connexions',
      value: '1,247',
      change: '+12',
      icon: UserIcon,
      color: 'blue'
    },
    {
      title: 'Modifications',
      value: '156',
      change: '+12',
      icon: DocumentTextIcon,
      color: 'green'
    },
    {
      title: 'Tentatives Échouées',
      value: '3',
      change: '-2',
      icon: ExclamationTriangleIcon,
      color: 'red'
    },
    {
      title: 'Exports',
      value: '8',
      change: '+3',
      icon: DocumentArrowDownIcon,
      color: 'purple'
    }
  ];

  // Activités récentes
  const recentActivities = [
    {
      id: '1',
      type: 'security',
      title: 'Tentative de connexion suspecte',
      description: 'Plusieurs tentatives de connexion depuis une IP inconnue',
      time: 'Il y a 5 min',
      severity: 'high',
      icon: ShieldCheckIcon
    },
    {
      id: '2',
      type: 'data',
      title: 'Export de données sensible',
      description: 'Export du rapport financier par Marie Dubois',
      time: 'Il y a 15 min',
      severity: 'medium',
      icon: CircleStackIcon
    },
    {
      id: '3',
      type: 'system',
      title: 'Sauvegarde automatique',
      description: 'Sauvegarde quotidienne effectuée avec succès',
      time: 'Il y a 1h',
      severity: 'low',
      icon: CheckCircleIcon
    }
  ];

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Audit & Sécurité </h1>
          <p className="text-slate-600">Surveillance avancée des activités et sécurité du système</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
            title="Sélectionner la période d'audit"
            aria-label="Sélectionner la période d'audit"
          >
            <option value="jour">Aujourd'hui</option>
            <option value="semaine">Cette semaine</option>
            <option value="mois">Ce mois</option>
            <option value="trimestre">Ce trimestre</option>
          </select>
          <button 
            type="button"
            onClick={handleGenerateReport}
            className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg"
            title="Actualiser les données d'audit"
          >
            <ArrowPathIcon className="h-5 w-5" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Navigation par onglets ERPNext */}
      <Card className="p-0">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'logs', name: 'Logs Audit', icon: DocumentTextIcon },
              { id: 'compliance', name: 'Conformité', icon: ShieldCheckIcon },
              { id: 'security', name: 'Sécurité', icon: LockClosedIcon },
              { id: 'risks', name: 'Risques', icon: ExclamationTriangleIcon },
              { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
              { id: 'reports', name: 'Rapports', icon: DocumentArrowDownIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-slate-500 text-slate-700'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
                title={`Voir l'onglet ${tab.name}`}
                aria-label={`Onglet ${tab.name}`}
              >
                {React.createElement(tab.icon, { className: 'h-5 w-5 mr-2' })}
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'logs' && (
            <div className="space-y-6">
              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {auditStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={stat.title} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${
                          stat.color === 'blue' ? 'bg-slate-100' :
                          stat.color === 'green' ? 'bg-emerald-100' :
                          stat.color === 'red' ? 'bg-red-100' :
                          'bg-purple-100'
                        }`}>
                          <Icon className={`h-6 w-6 ${
                            stat.color === 'blue' ? 'text-slate-600' :
                            stat.color === 'green' ? 'text-emerald-600' :
                            stat.color === 'red' ? 'text-red-600' :
                            'text-purple-600'
                          }`} />
                        </div>
                        <div className={`text-sm font-medium ${
                          stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Recherche et filtres */}
              <div className="flex justify-between items-center">
                <div className="relative flex-1 max-w-md">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Rechercher dans les logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="button" className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md" title="Exporter les logs d'audit">
                    <DocumentArrowDownIcon className="h-5 w-5" />
                    <span>Exporter</span>
                  </button>
                  <button type="button" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md" title="Imprimer les logs d'audit">
                    <PrinterIcon className="h-5 w-5" />
                    <span>Imprimer</span>
                  </button>
                </div>
              </div>

              {/* Table des logs */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Horodatage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Utilisateur
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Ressource
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                            {log.timestamp}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                            {log.user}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                            {log.action}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                            {log.resource}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              type="button"
                              onClick={() => handleViewDetails(log)}
                              className="text-slate-600 hover:text-slate-800"
                              title="Voir les détails du log"
                              aria-label="Voir les détails"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Conformité */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">Conformité et Contrôles</h3>
                <button
                  type="button"
                  onClick={handleComplianceCheck}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Vérifier la conformité réglementaire"
                >
                  Vérifier la Conformité
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-2xl font-bold text-slate-600">{complianceData.totalChecks}</div>
                  <div className="text-sm text-slate-600">Contrôles Total</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-2xl font-bold text-emerald-600">{complianceData.passed}</div>
                  <div className="text-sm text-slate-600">Réussis</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-2xl font-bold text-red-600">{complianceData.failed}</div>
                  <div className="text-sm text-gray-600">Échoués</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-2xl font-bold text-amber-600">{complianceData.score}%</div>
                  <div className="text-sm text-slate-600">Score Global</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h4 className="text-lg font-medium text-slate-800 mb-4">Dernière Vérification</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-600">Dernière vérification</div>
                    <div className="font-medium text-slate-800">{complianceData.lastCheck}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Prochaine vérification</div>
                    <div className="font-medium text-slate-800">{complianceData.nextCheck}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Sécurité */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">Analyse de Sécurité</h3>
                <button
                  type="button"
                  onClick={handleSecurityAnalysis}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Analyser la sécurité du système"
                >
                  Analyser la Sécurité
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-2xl font-bold text-slate-600">{securityMetrics.totalLogins}</div>
                  <div className="text-sm text-slate-600">Connexions Total</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-2xl font-bold text-red-600">{securityMetrics.failedLogins}</div>
                  <div className="text-sm text-gray-600">Échecs de Connexion</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-2xl font-bold text-amber-600">{securityMetrics.suspiciousActivity}</div>
                  <div className="text-sm text-slate-600">Activités Suspectes</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-2xl font-bold text-emerald-600">{securityMetrics.dataBreaches}</div>
                  <div className="text-sm text-slate-600">Violations de Données</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">{securityMetrics.passwordChanges}</div>
                  <div className="text-sm text-gray-600">Changements de Mot de Passe</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-2xl font-bold text-amber-600">{securityMetrics.accessRevoked}</div>
                  <div className="text-sm text-slate-600">Accès Révoqués</div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Risques */}
          {activeTab === 'risks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">Évaluation des Risques</h3>
                <button
                  type="button"
                  onClick={handleRiskAssessment}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Évaluer les risques du système"
                >
                  Évaluer les Risques
                </button>
              </div>
              
              <div className="space-y-4">
                {riskAssessment.map((risk) => (
                  <div key={risk.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-medium text-slate-800">{risk.risk}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        risk.level === 'Élevé' ? 'bg-red-100 text-red-800' :
                        risk.level === 'Moyen' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {risk.level}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-slate-600">Probabilité</div>
                        <div className="font-medium text-slate-800">{risk.probability}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600">Impact</div>
                        <div className="font-medium text-slate-800">{risk.impact}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-600">Mitigation</div>
                        <div className="font-medium text-slate-800">{risk.mitigation}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Analytics d'Audit</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {auditCategories.map((category, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                    <div className={`text-2xl font-bold ${
                      category.color === 'blue' ? 'text-slate-600' :
                      category.color === 'green' ? 'text-emerald-600' :
                      category.color === 'red' ? 'text-red-600' :
                      category.color === 'yellow' ? 'text-amber-600' :
                      'text-purple-600'
                    }`}>
                      {category.count}
                    </div>
                    <div className="text-sm text-slate-600">{category.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Onglet Rapports */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-800">Rapports d'Audit</h3>
              <div className="text-center py-12">
                <DocumentArrowDownIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">Module de rapports en développement</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Modal de détails */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Détails de l'Audit"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Utilisateur</label>
                <p className="text-sm text-slate-800">{selectedLog.user}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Action</label>
                <p className="text-sm text-slate-800">{selectedLog.action}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ressource</label>
                <p className="text-sm text-slate-800">{selectedLog.resource}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedLog.status)}`}>
                  {selectedLog.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse IP</label>
                <p className="text-sm text-slate-800">{selectedLog.ip}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Horodatage</label>
                <p className="text-sm text-slate-800">{selectedLog.timestamp}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Détails</label>
              <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg">{selectedLog.details}</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
                title="Fermer la fenêtre de détails"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Audit;
