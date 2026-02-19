import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ChartBarIcon,
  LockClosedIcon,
  KeyIcon,
  CircleStackIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClipboardDocumentListIcon,
  ScaleIcon
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
  const [complianceData, setComplianceData] = useState<any>({
    totalChecks: 0, passed: 0, failed: 0, score: 0, lastCheck: '-', nextCheck: '-'
  });
  const [securityMetrics, setSecurityMetrics] = useState<any>({
    totalLogins: 0, failedLogins: 0, suspiciousActivity: 0, dataBreaches: 0, passwordChanges: 0, accessRevoked: 0
  });

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
        if (data.compliance) setComplianceData(data.compliance);
        if (data.security) setSecurityMetrics(data.security);
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
      <Card className="p-0 overflow-hidden border-0 shadow-lg">
        <div className="border-b border-slate-100 bg-white sticky top-0 z-10">
          <nav className="flex space-x-1 px-4 py-2" aria-label="Tabs">
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
                className={`flex items-center py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
              >
                {React.createElement(tab.icon, { className: 'h-4 w-4 mr-2' })}
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 bg-slate-50/50 min-h-[600px]">
          {activeTab === 'logs' && (
            <div className="space-y-8 animate-in fade-in duration-500">

              {/* Statistiques - Premium Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {auditStats.map((stat, idx) => {
                  const Icon = stat.icon;
                  const colors = {
                    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
                    green: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
                    red: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
                    purple: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' }
                  };
                  const theme = colors[stat.color as keyof typeof colors] || colors.blue;

                  return (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 group">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl ${theme.bg} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`h-6 w-6 ${theme.text}`} />
                        </div>
                        <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {stat.change.startsWith('+') ? <ArrowPathIcon className="h-3 w-3 mr-1" /> : <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                          {stat.change}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-slate-500 text-sm font-semibold uppercase tracking-wide mb-1">{stat.title}</h4>
                        <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Barre d'outils - Modern Search & Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative w-full sm:w-96 group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher IP, Utilisateur, Ressource..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border-transparent text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-slate-200 focus:border-slate-300 rounded-xl transition-all duration-200 sm:text-sm font-medium"
                  />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none items-center justify-center px-4 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 font-semibold text-sm transition-colors shadow-sm">
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Export CSV
                  </button>
                  <button className="flex-1 sm:flex-none items-center justify-center px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-semibold text-sm transition-all shadow-lg shadow-slate-900/20">
                    <PrinterIcon className="h-4 w-4 mr-2" />
                    Imprimer
                  </button>
                </div>
              </div>

              {/* Table - Professional Data Grid */}
              <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead>
                      <tr className="bg-slate-50/80">
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Horodatage</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ressource</th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                        <th scope="col" className="relative px-6 py-4"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group cursor-default">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                            {log.timestamp}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 mr-3">
                                {log.user.charAt(0)}
                              </div>
                              <div className="text-sm font-semibold text-slate-900">{log.user}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                            {log.resource}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(log.status)} bg-opacity-10 border border-opacity-20`}>
                              <span className={`w-1.5 h-1.5 rounded-full mr-2 ${log.status === 'success' ? 'bg-green-500' : log.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                              {log.status === 'success' ? 'Succès' : log.status === 'warning' ? 'Alerte' : 'Échec'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleViewDetails(log)}
                              className="text-slate-400 hover:text-indigo-600 transition-colors bg-white hover:bg-indigo-50 p-2 rounded-lg border border-transparent hover:border-indigo-100"
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
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center">
                    <ShieldCheckIcon className="h-6 w-6 text-emerald-600 mr-2" />
                    Conformité et Contrôles
                  </h3>
                  <p className="text-slate-500 text-sm mt-1">Audit réglementaire et validation des standards de sécurité</p>
                </div>
                <button
                  type="button"
                  onClick={handleComplianceCheck}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-emerald-200 flex items-center font-medium"
                  title="Lancer une vérification complète"
                >
                  <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin-slow" />
                  Lancer l'Audit
                </button>
              </div>

              {/* Main Compliance Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Global Score Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16"></div>

                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">Score Global de Conformité</h4>

                  <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="96" cy="96" r="88" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                      <circle
                        cx="96" cy="96" r="88"
                        fill="none"
                        stroke="#059669"
                        strokeWidth="12"
                        strokeDasharray="552.9"
                        strokeDashoffset={552.9 * (1 - (complianceData.score || 85) / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-slate-800">{complianceData.score || 85}%</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full mt-2">EXCELLENT</span>
                    </div>
                  </div>

                  <div className="mt-6 text-center text-sm text-slate-500">
                    <p>Dernier audit: <span className="font-semibold text-slate-800">{complianceData.lastCheck !== '-' ? complianceData.lastCheck : 'Aujourd\'hui 09:30'}</span></p>
                  </div>
                </div>

                {/* Detailed Stats Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Total Checks */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                        <ClipboardDocumentListIcon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Total</span>
                    </div>
                    <div className="text-3xl font-black text-slate-800 mb-1">{complianceData.totalChecks || 42}</div>
                    <p className="text-sm font-medium text-slate-500">Points de contrôle vérifiés</p>
                  </div>

                  {/* Passed Checks */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-emerald-50 rounded-xl group-hover:bg-emerald-100 transition-colors">
                        <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Succès</span>
                    </div>
                    <div className="text-3xl font-black text-emerald-700 mb-1">{complianceData.passed || 38}</div>
                    <p className="text-sm font-medium text-emerald-600/80">Contrôles validés</p>
                  </div>

                  {/* Failed Checks */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-rose-300 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-rose-50 rounded-xl group-hover:bg-rose-100 transition-colors">
                        <ExclamationTriangleIcon className="h-6 w-6 text-rose-600" />
                      </div>
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">Attention</span>
                    </div>
                    <div className="text-3xl font-black text-rose-700 mb-1">{complianceData.failed || 2}</div>
                    <p className="text-sm font-medium text-rose-600/80">Points critiques à revoir</p>
                  </div>

                  {/* Upcoming Audit */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                        <CalendarIcon className="h-6 w-6 text-amber-600" />
                      </div>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">Planifié</span>
                    </div>
                    <div className="text-lg font-bold text-slate-800 mb-1 truncate">{complianceData.nextCheck !== '-' ? complianceData.nextCheck : '25 Oct 2024'}</div>
                    <p className="text-sm font-medium text-slate-500">Prochaine inspection auto</p>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Categories */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Détail des Analyses de Conformité</h4>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { category: 'Sécurité Fiscale', score: 100, status: 'Conforme', details: 'Déclarations G50 validation croisée', icon: ScaleIcon, color: 'emerald' },
                    { category: 'Intégrité des Données', score: 95, status: 'Conforme', details: 'Sauvegardes chiffrées quotidiennes', icon: CircleStackIcon, color: 'blue' },
                    { category: 'Accès Utilisateurs', score: 80, status: 'Attention', details: '2 comptes inactifs détectés', icon: UserIcon, color: 'amber' },
                    { category: 'RGPD / Confidentialité', score: 100, status: 'Conforme', details: 'Anonymisation active', icon: ShieldCheckIcon, color: 'emerald' }
                  ].map((item, idx) => (
                    <div key={idx} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${item.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : item.color === 'amber' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                          <item.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h5 className="font-bold text-slate-800">{item.category}</h5>
                          <p className="text-sm text-slate-500">{item.details}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="flex flex-col items-end">
                          <span className={`text-sm font-bold ${item.color === 'emerald' ? 'text-emerald-600' : item.color === 'amber' ? 'text-amber-600' : 'text-blue-600'}`}>{item.status}</span>
                          <div className="w-32 h-2 bg-slate-100 rounded-full mt-1">
                            <div className={`h-full rounded-full ${item.color === 'emerald' ? 'bg-emerald-500' : item.color === 'amber' ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${item.score}%` }}></div>
                          </div>
                        </div>
                        <button className="text-slate-400 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors">
                          <EyeIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
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
                      <span className={`px-2 py-1 text-xs rounded-full ${risk.level === 'Élevé' ? 'bg-red-100 text-red-800' :
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
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Analyse de l'Activité Système</h3>
                <div className="flex space-x-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold border border-slate-200">Derniers 30 jours</span>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {auditCategories.map((category, index) => {
                  const colors = {
                    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
                    green: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
                    red: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
                    yellow: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
                    purple: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' }
                  };
                  const theme = colors[category.color as keyof typeof colors] || colors.blue;

                  return (
                    <div key={index} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-28">
                      <div className="flex justify-between items-start">
                        <span className={`text-xs font-bold uppercase tracking-wider ${theme.text} opacity-80`}>{category.name}</span>
                        <div className={`h-2 w-2 rounded-full ${theme.bg.replace('bg-', 'bg-').replace('50', '500')}`}></div>
                      </div>
                      <div className={`text-3xl font-black ${theme.text} tracking-tight`}>
                        {category.count.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Activity Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Volume d'activité (7 derniers jours)</h4>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 bg-indigo-600 rounded-full"></span>
                      <span className="text-xs text-slate-500">Actions</span>
                    </div>
                  </div>

                  <div className="flex-1 flex items-end justify-between space-x-4 min-h-[200px]">
                    {[
                      { day: 'Lun', val: 65 },
                      { day: 'Mar', val: 85 },
                      { day: 'Mer', val: 55 },
                      { day: 'Jeu', val: 90 },
                      { day: 'Ven', val: 45 },
                      { day: 'Sam', val: 30 },
                      { day: 'Dim', val: 75 }
                    ].map((item, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end items-center group h-full relative cursor-default">
                        {/* Tooltip */}
                        <div className="absolute -top-8 bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 z-10">
                          {item.val}
                        </div>

                        {/* Bar Track */}
                        <div className="w-full max-w-[40px] bg-slate-100 rounded-t-lg relative h-full overflow-hidden group-hover:bg-slate-50 transition-colors flex items-end">
                          {/* Bar Fill */}
                          <div
                            className="w-full bg-indigo-600 opacity-90 rounded-t-lg transition-all duration-700 ease-out group-hover:opacity-100 hover:bg-indigo-500"
                            style={{ height: `${item.val}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-400 mt-3 font-medium">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Distribution Chart */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                  <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-6">Répartition par Type</h4>
                  <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
                    <div className="w-56 h-56 rounded-full border-[20px] border-slate-50 flex items-center justify-center relative">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                        {/* Background Ring */}
                        <path className="text-slate-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2" />

                        {/* Connexions (Blue) - 75% */}
                        <path className="text-indigo-600" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="75, 100" strokeLinecap="round" />

                        {/* Modifications (Emerald) - 15% (staring at 75%) */}
                        <path className="text-emerald-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="15, 100" strokeDashoffset="-75" strokeLinecap="round" />

                        {/* Autres (Rose) - 10% (starting at 90%) */}
                        <path className="text-rose-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="10, 100" strokeDashoffset="-90" strokeLinecap="round" />
                      </svg>
                      <div className="text-center">
                        <span className="block text-4xl font-black text-slate-800">1.8k</span>
                        <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Evénements</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-center gap-2 text-xs font-semibold text-slate-600 flex-wrap">
                    <span className="flex items-center px-2.5 py-1 bg-indigo-50 rounded-full border border-indigo-100 text-indigo-700"><span className="w-2 h-2 rounded-full bg-indigo-600 mr-2"></span>Connexions</span>
                    <span className="flex items-center px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-700"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>Mods</span>
                    <span className="flex items-center px-2.5 py-1 bg-rose-50 rounded-full border border-rose-100 text-rose-700"><span className="w-2 h-2 rounded-full bg-rose-500 mr-2"></span>Autres</span>
                  </div>
                </div>

              </div>

              {/* Users Stats Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/80 flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Utilisateurs les plus actifs</h4>
                  <button className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline">Voir tout</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Utilisateur</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Evénements</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Tendance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50/80">
                      {[
                        { name: 'Ahmed Amrani', initials: 'AA', role: 'Directeur', count: 423, trend: 'up' },
                        { name: 'Nadia Belkacem', initials: 'NB', role: 'DAF', count: 215, trend: 'stable' },
                        { name: 'Leila Mansour', initials: 'LM', role: 'Manager Ops', count: 189, trend: 'down' }
                      ].map((user, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm mr-3">
                                {user.initials}
                              </div>
                              <div className="text-sm font-bold text-slate-800">{user.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'Directeur' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                              user.role === 'DAF' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                'bg-slate-50 text-slate-700 border-slate-100'
                              }`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-sm font-mono font-bold text-slate-700">{user.count}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {user.trend === 'up' && <span className="inline-flex items-center text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full"><ArrowTrendingUpIcon className="h-3 w-3 mr-1" />+12%</span>}
                            {user.trend === 'down' && <span className="inline-flex items-center text-rose-600 text-xs font-bold bg-rose-50 px-2 py-1 rounded-full"><ArrowTrendingDownIcon className="h-3 w-3 mr-1" />-5%</span>}
                            {user.trend === 'stable' && <span className="inline-flex items-center text-slate-500 text-xs font-bold bg-slate-100 px-2 py-1 rounded-full"><div className="h-1 w-2 bg-slate-400 mr-2 rounded-full"></div>0%</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
