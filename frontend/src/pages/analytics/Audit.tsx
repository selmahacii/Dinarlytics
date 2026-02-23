import React, { useState, useEffect } from 'react';
import {
  ArrowPathIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CircleStackIcon,
  ClipboardDocumentListIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  KeyIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  ScaleIcon,
  ShieldCheckIcon,
  UserIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import axios from 'axios';

const Audit: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('mois');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  // Report Generation State
  const [reportType, setReportType] = useState('Audit Complet (détaillé)');
  const [reportPeriod, setReportPeriod] = useState('30 derniers jours');
  const [reportFormat, setReportFormat] = useState('PDF');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportHistory, setReportHistory] = useState([
    { name: 'Audit_Q3_2024_Final.pdf', date: '15 Oct 14:30', status: 'ready', size: '2.4 MB' },
    { name: 'Securite_Incidents_Sept24.xlsx', date: '01 Oct 09:15', status: 'ready', size: '1.8 MB' },
    { name: 'Export_Logs_Bruts.csv', date: 'Hier 18:00', status: 'expired', size: '15.2 MB' },
  ]);
  const [activeTab, setActiveTab] = useState('logs');
  // Modal states
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
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

  // Fetch audit logs with realistic mock fallback
  const fetchAuditData = async () => {
    setLoadingLogs(true);
    setErrorLogs(null);

    try {
      // Build mock response based on period
      // Real API call would be: axios.get('/api/v1/audit/logs', { params: { period: selectedPeriod, search: searchTerm } })

      // Mocking delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const isToday = selectedPeriod === 'jour';
      const factor = isToday ? 0.1 : 1; // Less data for "Today"

      // Realistic Mock Logs
      let mockLogs = [
        { id: 101, action: 'Connexion', user: 'Admin', resource: 'Dashboard', status: 'Succès', ip: '192.168.1.10', timestamp: isToday ? '10:42' : '15 Oct 10:42', details: 'Connexion réussie via 2FA' },
        { id: 102, action: 'Export', user: 'Finance_Director', resource: 'Rapport_Q3.pdf', status: 'Succès', ip: '192.168.1.25', timestamp: isToday ? '09:15' : '14 Oct 09:15', details: 'Téléchargement rapport complet' },
        { id: 103, action: 'Échec Connexion', user: 'unknown', resource: 'Login Page', status: 'Échec', ip: '45.33.22.11', timestamp: isToday ? '08:30' : '14 Oct 08:30', details: '3 tentatives échouées (IP bloquée)' },
        { id: 104, action: 'Modification', user: 'HR_Manager', resource: 'Profil Employé #452', status: 'Succès', ip: '192.168.1.15', timestamp: isToday ? '11:05' : '13 Oct 16:20', details: 'Mise à jour des coordonnées bancaires' },
        { id: 105, action: 'Suppression', user: 'SysAdmin', resource: 'Log Files', status: 'Avertissement', ip: '10.0.0.5', timestamp: isToday ? '07:00' : '12 Oct 23:00', details: 'Rotation des logs système (Automatique)' },
      ];

      if (isToday) {
        mockLogs = [
          { id: 201, action: 'Connexion', user: 'Admin', resource: 'Système', status: 'success', ip: '192.168.1.10', timestamp: '11:24', details: 'Session administrateur ouverte' },
          { id: 202, action: 'Modification', user: 'Marie Dubois', resource: 'Facture #F-99', status: 'success', ip: '192.168.1.100', timestamp: '10:15', details: 'Montant validé' },
          { id: 203, action: 'Export', user: 'Système', resource: 'Backup', status: 'warning', ip: 'localhost', timestamp: '03:00', details: 'Sauvegarde automatique terminée avec avertissements' },
        ];
      }

      setAuditLogsData(mockLogs);

      // Mock Compliance Data
      setComplianceData({
        totalChecks: 42,
        passed: 38,
        failed: isToday ? 0 : 4,
        score: isToday ? 100 : 92,
        lastCheck: isToday ? 'Auj. 09:00' : '15 Oct 09:00',
        nextCheck: isToday ? 'Demain 09:00' : '22 Oct 09:00'
      });

      // Mock Security Data
      setSecurityMetrics({
        totalLogins: Math.floor(142 * factor),
        failedLogins: Math.floor(3 * (isToday ? 0.5 : 1)),
        suspiciousActivity: isToday ? 0 : 2,
        dataBreaches: 0,
        passwordChanges: Math.floor(12 * factor),
        accessRevoked: isToday ? 0 : 1
      });

    } catch (err) {
      console.error('Error fetching data:', err);
      setErrorLogs('Erreur lors du chargement des données. Veuillez réessayer.');
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, [selectedPeriod, searchTerm]);

  const handleRefresh = () => {
    fetchAuditData();
  };

  const handleScheduleReport = () => {
    setIsScheduleModalOpen(true);
  };

  // Nouvelles fonctions ERPNext pour l'audit
  const handleComplianceCheck = () => {
    setIsComplianceModalOpen(true);
  };

  const handleSecurityAnalysis = () => {
    setIsSecurityModalOpen(true);
  };

  const handleGenerateReportStart = () => {
    setIsGenerating(true);

    // Simulate generation delay
    setTimeout(() => {
      const date = new Date();
      const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' };
      const dateStr = date.toLocaleDateString('fr-FR', options).replace(' à', '');

      let ext = 'txt';
      let mimeType = 'text/plain';
      let content = '';

      // Generate content based on format
      if (reportFormat.includes('Excel') || reportFormat === 'CSV') {
        ext = 'csv';
        mimeType = 'text/csv;charset=utf-8;';
        const bom = '\uFEFF'; // Byte Order Mark for Excel
        content = bom + `Type de Rapport,Période,Date de Génération,Statut\n"${reportType}","${reportPeriod}","${date.toLocaleString()}","Succès"\n\nSection,Détail,Valeur\n"Métriques","Volume de logs",1240\n"Compliance","Score Global","98%"\n"Sécurité","Alertes Critiques",0`;
      } else {
        // Fallback for PDF (Mock) - Using Text for readability since no PDF lib is installed
        ext = 'txt';
        content = `==================================================\nRAPPORT D'AUDIT - DINARLYTICS\n==================================================\n\nTYPE: ${reportType}\nPERIODE: ${reportPeriod}\nDATE: ${date.toLocaleString()}\n\nRESUME EXECUTIF:\n----------------\nL'audit a été effectué avec succès. Tous les systèmes sont opérationnels.\nAucune anomalie critique détectée sur la période sélectionnée.\n\nMETRIQUES CLES:\n- Conformité: 98%\n- Sécurité: 100% (0 alerte critique)\n- Performance: Optimale\n\n--------------------------------------------------\nFin du rapport généré automatiquement.\n==================================================`;
      }

      const fileName = `Rapport_${reportType.replace(/\s+/g, '_')}_${date.getTime()}.${ext}`;

      try {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Add to history
        const newReport = {
          name: fileName,
          date: dateStr,
          status: 'ready',
          size: `${(content.length / 1024).toFixed(1)} KB`
        };

        setReportHistory(prev => [newReport, ...prev]);
      } catch (e) {
        console.error("Export failed:", e);
      } finally {
        setIsGenerating(false);
      }
    }, 1500);
  };

  const handleDownloadReport = (fileName: string) => {
    // Generate dummy content for history items based on their extension
    const isCsv = fileName.endsWith('.csv') || fileName.endsWith('.xlsx');
    const mimeType = isCsv ? 'text/csv;charset=utf-8;' : 'text/plain';
    const bom = '\uFEFF';

    let content = '';
    if (isCsv) {
      content = bom + `Fichier Archivé,Date\n"${fileName}","${new Date().toLocaleDateString()}"\n\nDonnées,Valeur\n"Statut","Archivé"\n"Taille","Original"`;
    } else {
      content = `FICHIER ARCHIVE: ${fileName}\n\nCe document est une simulation d'archive.\nPour voir les vrais rapports, veuillez connecter le module de stockage backend.`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName.endsWith('.xlsx') ? fileName.replace('.xlsx', '.csv') : fileName); // Force CSV for Excel
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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

  const filteredLogs = auditLogsData.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));
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
          <h1 className="text-2xl font-bold text-slate-800">Audit & Sécurité</h1>
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
            onClick={handleRefresh}
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


              {/* Statistiques - Professional ERP Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {auditStats.map((stat, idx) => {
                  const Icon = stat.icon;
                  return (
                    <div key={idx} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <Icon className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded border ${stat.change.startsWith('+')
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                          {stat.change.startsWith('+') ? <ArrowPathIcon className="h-3 w-3 mr-1" /> : <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                          {stat.change}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">{stat.title}</h4>
                        <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Barre d'outils - Clean & Professional */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="relative w-full sm:w-96">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 rounded-md sm:text-sm"
                  />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none items-center justify-center px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-md hover:bg-slate-50 font-medium text-sm transition-colors">
                    <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                    Export
                  </button>
                  <button className="flex-1 sm:flex-none items-center justify-center px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 font-medium text-sm transition-colors">
                    <PrinterIcon className="h-4 w-4 mr-2" />
                    Imprimer
                  </button>
                </div>
              </div>

              {/* Table - ERP Data Grid */}
              <div className="flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">Horodatage</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">Utilisateur</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">Action</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">Ressource</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">Statut</th>
                        <th scope="col" className="relative px-6 py-3 border-b border-slate-200"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600 font-mono">
                            {log.timestamp}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-7 w-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 mr-3">
                                {log.user.charAt(0)}
                              </div>
                              <div className="text-sm font-medium text-slate-900">{log.user}</div>
                            </div>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600">
                            {log.resource}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${log.status === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              log.status === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                'bg-rose-50 text-rose-700 border-rose-100'
                              }`}>
                              {log.status === 'success' ? 'Succès' : log.status === 'warning' ? 'Alerte' : 'Échec'}
                            </span>
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleViewDetails(log)}
                              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
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

          {/* Onglet Conformité - Professional Layout */}
          {activeTab === 'compliance' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    <ShieldCheckIcon className="h-5 w-5 text-slate-600 mr-2" />
                    Conformité et Contrôles
                  </h3>
                  <p className="text-slate-500 text-sm">Audit réglementaire et validation des standards</p>
                </div>
                <button
                  type="button"
                  onClick={handleComplianceCheck}
                  className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors shadow-sm text-sm font-medium flex items-center"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Lancer l'Audit
                </button>
              </div>

              {/* Main Compliance Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Global Score Card */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-6">Score Global</h4>

                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="70" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                      <circle
                        cx="80" cy="80" r="70"
                        fill="none"
                        stroke="#475569"
                        strokeWidth="10"
                        strokeDasharray="439.8"
                        strokeDashoffset={439.8 * (1 - (complianceData.score || 85) / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-bold text-slate-800">{complianceData.score || 85}%</span>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded mt-1">OPTIMAL</span>
                    </div>
                  </div>

                  <div className="mt-6 text-center text-xs text-slate-500">
                    <p>Dernier audit: <span className="font-semibold text-slate-700">{complianceData.lastCheck !== '-' ? complianceData.lastCheck : 'Aujourd\'hui 09:30'}</span></p>
                  </div>
                </div>

                {/* Detailed Stats Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Total Checks */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Total Contrôles</span>
                      <ClipboardDocumentListIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{complianceData.totalChecks || 42}</div>
                  </div>

                  {/* Passed Checks */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Validés</span>
                      <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{complianceData.passed || 38}</div>
                  </div>

                  {/* Failed Checks */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase">À Revoir</span>
                      <ExclamationTriangleIcon className="h-5 w-5 text-rose-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{complianceData.failed || 2}</div>
                  </div>

                  {/* Upcoming Audit */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Prochain Audit</span>
                      <CalendarIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="text-xl font-bold text-slate-800">{complianceData.nextCheck !== '-' ? complianceData.nextCheck : '25 Oct 2024'}</div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Categories */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Détail des Analyses</h4>
                </div>
                <div className="divide-y divide-slate-200">
                  {[
                    { category: 'Sécurité Fiscale', score: 100, status: 'Conforme', details: 'Déclarations G50 validation croisée', icon: ScaleIcon },
                    { category: 'Intégrité des Données', score: 95, status: 'Conforme', details: 'Sauvegardes chiffrées quotidiennes', icon: CircleStackIcon },
                    { category: 'Accès Utilisateurs', score: 80, status: 'Attention', details: '2 comptes inactifs détectés', icon: UserIcon },
                    { category: 'RGPD / Confidentialité', score: 100, status: 'Conforme', details: 'Anonymisation active', icon: ShieldCheckIcon }
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-slate-100 rounded border border-slate-200 text-slate-500">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-sm text-slate-800">{item.category}</h5>
                          <p className="text-xs text-slate-500">{item.details}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="flex flex-col items-end w-32">
                          <div className="flex justify-between w-full mb-1">
                            <span className="text-xs font-medium text-slate-700">{item.score}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${item.score < 90 ? 'bg-amber-500' : 'bg-slate-600'}`} style={{ width: `${item.score}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Onglet Sécurité - Professional Look */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 flex items-center">
                    <LockClosedIcon className="h-6 w-6 text-slate-700 mr-2" />
                    Surveillance de Sécurité
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <span className="relative flex h-2 w-2 mr-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Système Sécurisé
                    </span>
                    <span className="text-xs text-slate-500">| Dernière analyse: <span className="font-semibold text-slate-700">Il y a 5 min</span></span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSecurityAnalysis}
                  className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-all shadow-sm text-sm font-medium flex items-center"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Lancer l'Analyse
                </button>
              </div>

              {/* Security Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Connexions Metric */}
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
                  <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <UserIcon className="h-16 w-16 text-slate-800" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Connexions (24h)</h4>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-slate-800">{securityMetrics.totalLogins || 142}</span>
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">+5%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-4">
                    <div className="bg-slate-600 h-full rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>

                {/* Echecs Metric */}
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-rose-200 transition-colors">
                  <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ExclamationTriangleIcon className="h-16 w-16 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Échecs Auth.</h4>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-rose-600">{securityMetrics.failedLogins || 3}</span>
                      <span className="text-xs font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Attention</span>
                    </div>
                  </div>
                  <div className="w-full bg-rose-50 h-1.5 rounded-full overflow-hidden mt-4">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>

                {/* Suspicious Metric */}
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-amber-200 transition-colors">
                  <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <EyeIcon className="h-16 w-16 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Activités Suspectes</h4>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-amber-600">{securityMetrics.suspiciousActivity || 0}</span>
                      {securityMetrics.suspiciousActivity > 0 ? (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">À vérifier</span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Aucune</span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-amber-50 h-1.5 rounded-full overflow-hidden mt-4">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: securityMetrics.suspiciousActivity > 0 ? '40%' : '0%' }}></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Security Alerts List */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h4 className="text-sm font-bold text-slate-700">Dernières Alertes de Sécurité</h4>
                    <button className="text-xs text-indigo-600 font-medium hover:underline">Voir tout l'historique</button>
                  </div>
                  <div className="divide-y divide-slate-100 flex-1">
                    {[
                      { type: 'Login', msg: 'Tentative de connexion échouée (IP: 192.168.1.45)', time: '10:42', severity: 'medium' },
                      { type: 'System', msg: 'Mise à jour des règles de pare-feu effectuée', time: '09:15', severity: 'low' },
                      { type: 'Access', msg: 'Compte utilisateur "j.doe" verrouillé après 5 essais', time: 'Yesterday', severity: 'high' }
                    ].map((alert, idx) => (
                      <div key={idx} className="p-4 flex items-start space-x-3 hover:bg-slate-50 transition-colors">
                        <div className={`mt-0.5 h-2 w-2 rounded-full ${alert.severity === 'high' ? 'bg-rose-500' : alert.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{alert.msg}</p>
                          <div className="flex items-center mt-1 space-x-2">
                            <span className="text-xs text-slate-500">{alert.time}</span>
                            <span className="text-[10px] font-bold uppercase text-slate-400 border border-slate-200 px-1.5 rounded">{alert.type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Health / Status */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                    <h4 className="text-sm font-bold text-slate-700">État des Systèmes de Protection</h4>
                  </div>
                  <div className="p-5 space-y-4">
                    {[
                      { name: 'Pare-feu Applicatif (WAF)', status: 'Actif', health: 100 },
                      { name: 'Détection d\'Intrusion (IDS)', status: 'Actif', health: 98 },
                      { name: 'Chiffrement des Données', status: 'Actif', health: 100 },
                      { name: 'Double Authentification (2FA)', status: 'Partiel', health: 85 }
                    ].map((sys, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-1.5 rounded-full ${sys.health === 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                            <ShieldCheckIcon className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">{sys.name}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full rounded-full ${sys.health > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${sys.health}%` }}></div>
                          </div>
                          <span className={`text-xs font-bold ${sys.health === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{sys.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto bg-slate-50 p-3 text-center border-t border-slate-100">
                    <button className="text-xs font-medium text-slate-600 hover:text-slate-800 flex items-center justify-center w-full">
                      <KeyIcon className="h-3 w-3 mr-1.5" />
                      Gérer les clés de chiffrement
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Risques - Corporate Style */}
          {activeTab === 'risks' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Matrice des Risques Opérationnels</h3>
                  <p className="text-slate-500 text-sm">Identification, évaluation et mitigation des menaces potentielles</p>
                </div>
                <button className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 text-sm font-medium flex items-center shadow-sm">
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Mettre à jour l'analyse
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Risk Heatmap Visualization */}
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Distribution des Risques (Heatmap)</h4>
                  <div className="grid grid-cols-3 gap-1 h-48">
                    {/* Critical Zone */}
                    <div className="bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-800 rounded-tl-md">Moyen</div>
                    <div className="bg-rose-200 flex items-center justify-center text-xs font-bold text-rose-800">Élevé</div>
                    <div className="bg-rose-400 flex items-center justify-center text-xs font-bold text-white rounded-tr-md shadow-inner">Critique</div>

                    {/* Warning Zone */}
                    <div className="bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-800">Faible</div>
                    <div className="bg-amber-200 flex items-center justify-center text-xs font-bold text-amber-800 relative ring-2 ring-slate-400 z-10 rounded shadow-lg">
                      Moyen
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                      </span>
                    </div>
                    <div className="bg-rose-200 flex items-center justify-center text-xs font-bold text-rose-800">Élevé</div>

                    {/* Safe Zone */}
                    <div className="bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-800 rounded-bl-md">Minime</div>
                    <div className="bg-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-800">Faible</div>
                    <div className="bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-800 rounded-br-md">Moyen</div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-2 uppercase font-medium">
                    <span>Impact Faible</span>
                    <span>Impact Élevé</span>
                  </div>
                </div>

                {/* Risk Summary Stats */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-lg border border-blue-100 shadow-sm border-l-4 border-l-blue-500">
                    <h4 className="text-sm font-semibold text-slate-600 mb-1">Score de Risque Global</h4>
                    <div className="text-3xl font-bold text-slate-800">Low-Medium</div>
                    <p className="text-xs text-slate-500 mt-2">Basé sur 24 facteurs pondérés. Tendance stable par rapport au mois dernier.</p>
                  </div>
                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">Risques Mitigés</span>
                      <span className="text-sm font-bold text-emerald-600">85%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">3 risques residuels nécessitent une attention particulière.</p>
                  </div>
                </div>
              </div>

              {/* Detailed Risk Table */}
              <div className="overflow-hidden bg-white rounded-lg border border-slate-200 shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Risque Identifié</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Niveau & Classification</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Probabilité vs Impact</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Stratégie de Mitigation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {[
                      { id: 1, risk: 'Intrusion Système / Malware', cat: 'Cybersécurité', level: 'Critique', prob: 25, impact: 95, mitigation: 'Mise à jour IPS/IDS, Patching 24h', status: 'Actif' },
                      { id: 2, risk: 'Panne Serveur SGBD Principal', cat: 'Infrastructure', level: 'Élevé', prob: 10, impact: 90, mitigation: 'Failover Cluster Automatique', status: 'Surveillé' },
                      { id: 3, risk: 'Erreur Humaine (Saisie)', cat: 'Opérationnel', level: 'Moyen', prob: 60, impact: 40, mitigation: 'Double validation entrées', status: 'Contrôlé' },
                      { id: 4, risk: 'Non-Conformité RGPD', cat: 'Légal', level: 'Faible', prob: 15, impact: 70, mitigation: 'Revue trimestrielle DPO', status: 'Conforme' },
                    ].map((risk) => (
                      <tr key={risk.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-sm text-slate-900">{risk.risk}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{risk.cat}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${risk.level === 'Critique' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                            risk.level === 'Élevé' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                              risk.level === 'Moyen' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                'bg-emerald-100 text-emerald-800 border-emerald-200'
                            }`}>
                            {risk.level}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2 max-w-[140px]">
                            <div className="flex justify-between text-[10px] text-slate-500"><span>Prob.</span><span className="font-mono">{risk.prob}%</span></div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-sm overflow-hidden"><div className="bg-slate-400 h-full" style={{ width: `${risk.prob}%` }}></div></div>

                            <div className="flex justify-between text-[10px] text-slate-500"><span>Imp.</span><span className="font-mono">{risk.impact}%</span></div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-sm overflow-hidden"><div className="bg-slate-700 h-full" style={{ width: `${risk.impact}%` }}></div></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-700 font-medium">{risk.mitigation}</div>
                          <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Voir le plan d'action &rarr;</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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


              {/* KPI Summary Cards - Corporate Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {auditCategories.map((category, index) => {
                  const colors = {
                    blue: { border: 'border-l-indigo-500', text: 'text-indigo-600' },
                    green: { border: 'border-l-emerald-500', text: 'text-emerald-600' },
                    red: { border: 'border-l-rose-500', text: 'text-rose-600' },
                    yellow: { border: 'border-l-amber-500', text: 'text-amber-600' },
                    purple: { border: 'border-l-violet-500', text: 'text-violet-600' }
                  };
                  const theme = colors[category.color as keyof typeof colors] || colors.blue;

                  return (
                    <div key={index} className={`bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-l-4 ${theme.border}`}>
                      <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">{category.name}</h4>
                      <div className="text-2xl font-bold text-slate-800">{category.count.toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Activity Chart - Clean */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h4 className="text-sm font-bold text-slate-700">Volume d'Activité</h4>
                  </div>

                  <div className="flex-1 flex items-end justify-between space-x-4 min-h-[200px] px-2">
                    {[
                      { day: 'Lun', val: 65 },
                      { day: 'Mar', val: 85 },
                      { day: 'Mer', val: 55 },
                      { day: 'Jeu', val: 90 },
                      { day: 'Ven', val: 45 },
                      { day: 'Sam', val: 30 },
                      { day: 'Dim', val: 75 }
                    ].map((item, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end items-center group h-full">
                        <div className="w-full bg-slate-100 rounded-sm relative h-full flex items-end overflow-hidden">
                          <div
                            className="w-full bg-slate-600 hover:bg-slate-700 transition-all duration-500"
                            style={{ height: `${item.val}%` }}
                            title={`${item.val} actions`}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-500 mt-2 font-medium">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Distribution Chart - Minimalist */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col">
                  <h4 className="text-sm font-bold text-slate-700 mb-6 border-b border-slate-100 pb-4">Répartition</h4>
                  <div className="flex-1 flex items-center justify-center relative">
                    <div className="w-48 h-48 rounded-full border-[16px] border-slate-100 flex items-center justify-center relative">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path className="text-slate-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="1" />
                        <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="75, 100" strokeLinecap="butt" />
                        <path className="text-slate-400" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="15, 100" strokeDashoffset="-75" strokeLinecap="butt" />
                        <path className="text-amber-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="10, 100" strokeDashoffset="-90" strokeLinecap="butt" />
                      </svg>
                      <div className="text-center">
                        <span className="block text-2xl font-bold text-slate-800">1.8k</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center text-slate-600"><span className="w-2 h-2 bg-slate-800 mr-2 rounded-sm"></span>Connexions</span>
                      <span className="font-bold text-slate-800">75%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center text-slate-600"><span className="w-2 h-2 bg-slate-400 mr-2 rounded-sm"></span>Modifications</span>
                      <span className="font-bold text-slate-800">15%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center text-slate-600"><span className="w-2 h-2 bg-amber-500 mr-2 rounded-sm"></span>Autres</span>
                      <span className="font-bold text-slate-800">10%</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Users Stats Table - Corporate */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">Utilisateurs les plus actifs</h4>
                  <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline">Voir tout</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rôle</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Evénements</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Tendance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { name: 'Ahmed Amrani', initials: 'AA', role: 'Directeur', count: 423, trend: 'up' },
                        { name: 'Nadia Belkacem', initials: 'NB', role: 'DAF', count: 215, trend: 'stable' },
                        { name: 'Leila Mansour', initials: 'LM', role: 'Manager Ops', count: 189, trend: 'down' }
                      ].map((user, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold mr-3">
                                {user.initials}
                              </div>
                              <div className="text-sm font-medium text-slate-900">{user.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white text-slate-600 border border-slate-200 uppercase tracking-wide">
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <span className="text-sm font-mono font-semibold text-slate-800">{user.count}</span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            {user.trend === 'up' && <span className="inline-flex items-center text-emerald-600 text-xs font-medium"><ArrowTrendingUpIcon className="h-3 w-3 mr-1" />+12%</span>}
                            {user.trend === 'down' && <span className="inline-flex items-center text-rose-600 text-xs font-medium"><ArrowTrendingDownIcon className="h-3 w-3 mr-1" />-5%</span>}
                            {user.trend === 'stable' && <span className="inline-flex items-center text-slate-400 text-xs font-medium">0%</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Onglet Rapports - Professional Document Center */}
          {activeTab === 'reports' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              {/* Reporting Header & Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-1 p-4 bg-slate-800 rounded-lg text-white shadow-md flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <DocumentTextIcon className="h-20 w-20 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold opacity-80 uppercase tracking-wider mb-1">Rapports Générés</h4>
                    <div className="text-3xl font-bold">{128 + reportHistory.length}</div>
                    <div className="text-xs text-emerald-400 font-medium mt-1 flex items-center">
                      <ArrowTrendingUpIcon className="h-3 w-3 mr-1" /> +12% ce mois
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs opacity-60 mb-1">Stockage utilisé</div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <div className="text-[10px] text-right mt-1 opacity-60">2.4GB / 5GB</div>
                  </div>
                </div>

                <div className="lg:col-span-3 bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Centre de Rapports</h3>
                      <p className="text-slate-500 text-sm">Génération, planification et archivage des audits réglementaires</p>
                    </div>
                    <button
                      onClick={handleScheduleReport}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors text-sm font-medium flex items-center shadow-sm"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Planifier un Rapport
                    </button>
                  </div>
                  <div className="flex space-x-6 text-sm text-slate-600 border-t border-slate-100 pt-4">
                    <div className="flex items-center"><CheckCircleIcon className="h-4 w-4 text-emerald-500 mr-2" /> 3 Rapports planifiés actifs</div>
                    <div className="flex items-center"><ShieldCheckIcon className="h-4 w-4 text-indigo-500 mr-2" /> Signature numérique activée</div>
                    <div className="flex items-center"><CircleStackIcon className="h-4 w-4 text-slate-400 mr-2" /> Retention: 3 ans</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Report Generator Form */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center">
                      <PrinterIcon className="h-4 w-4 mr-2 text-slate-500" />
                      Générateur Rapide
                    </h4>
                  </div>
                  <div className="p-5 flex-1 flex flex-col space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Type de document</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                      >
                        <option>Audit Complet (détaillé)</option>
                        <option>Synthèse de Conformité</option>
                        <option>Journal des Incidents</option>
                        <option>Matrice des Risques</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Période</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                        value={reportPeriod}
                        onChange={(e) => setReportPeriod(e.target.value)}
                      >
                        <option>30 derniers jours</option>
                        <option>Trimestre en cours (Q3)</option>
                        <option>Année fiscale 2024</option>
                        <option>Personnalisé...</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Format de sortie</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setReportFormat('PDF')}
                          className={`flex items-center justify-center px-3 py-2 border rounded text-sm font-bold transition-colors ${reportFormat === 'PDF' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                          PDF Signé
                        </button>
                        <button
                          onClick={() => setReportFormat('Excel')}
                          className={`flex items-center justify-center px-3 py-2 border rounded text-sm font-medium transition-colors ${reportFormat === 'Excel' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                          Excel / CSV
                        </button>
                      </div>
                    </div>

                    <div className="mt-auto pt-4">
                      <button
                        onClick={handleGenerateReportStart}
                        disabled={isGenerating}
                        className={`w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 rounded-md transition-all shadow-md hover:shadow-lg flex items-center justify-center ${isGenerating ? 'opacity-75 cursor-wait' : ''}`}
                      >
                        {isGenerating ? (
                          <>
                            <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                            Génération en cours...
                          </>
                        ) : (
                          <>
                            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                            Générer le Document
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scheduled Reports & History */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Scheduled items */}
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <h4 className="text-sm font-bold text-slate-800">Rapports Planifiés (Automatisations)</h4>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Actif</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {[
                        { name: 'Audit Hebdomadaire Sécurité', schedule: 'Chaque Lundi, 08:00', recipients: 'DSI, RSSI', next: 'Demain' },
                        { name: 'Clôture Mensuelle Activité', schedule: 'Le 1er du mois, 06:00', recipients: 'Direction, Finance', next: '01 Nov' }
                      ].map((item, i) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50">
                          <div className="flex items-center">
                            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 mr-3">
                              <CalendarIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-700">{item.name}</div>
                              <div className="text-xs text-slate-500">{item.schedule} • Pour: {item.recipients}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-slate-500 uppercase">Prochain envoi</div>
                            <div className="text-sm font-semibold text-slate-800">{item.next}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent History Table */}
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                      <h4 className="text-sm font-bold text-slate-800">Historique Récent</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase">Document</th>
                            <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase">Date</th>
                            <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase">Statut</th>
                            <th className="px-5 py-3 text-right text-xs font-bold text-slate-400 uppercase">Taille</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {reportHistory.map((file, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-5 py-3.5 flex items-center">
                                <DocumentTextIcon className={`h-5 w-5 mr-3 ${file.name.endsWith('.pdf') ? 'text-rose-400' : 'text-emerald-400'}`} />
                                <span className="text-sm font-medium text-slate-700">{file.name}</span>
                              </td>
                              <td className="px-5 py-3.5 text-sm text-slate-500">{file.date}</td>
                              <td className="px-5 py-3.5">
                                {file.status === 'ready' ? (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">Disponible</span>
                                ) : (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wide">Expiré</span>
                                )}
                              </td>
                              <td className="px-5 py-3.5 text-right text-xs font-mono text-slate-500">
                                {file.size}
                                {file.status === 'ready' && (
                                  <button
                                    onClick={() => handleDownloadReport(file.name)}
                                    className="ml-3 text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                                    title="Télécharger"
                                  >
                                    <DocumentArrowDownIcon className="h-4 w-4 inline" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
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

      {/* 📅 MODAL PLANIFICATION D'AUDIT */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Planifier une Automatisation d'Audit"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase">Nom de l'automatisation</label>
              <input type="text" placeholder="ex: Audit Fiscal Hebdomadaire" className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase">Type de Rapport</label>
              <select className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none">
                <option>Conformité Réglementaire</option>
                <option>Sécurité des Données</option>
                <option>Traces d'Audit (Logs)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase">Fréquence</label>
              <select className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none">
                <option>Quotidien (00:00)</option>
                <option>Hebdomadaire (Lundi)</option>
                <option>Mensuel (1er du mois)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase">Destinataire (Email)</label>
              <input type="email" placeholder="admin@entreprise.dz" className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-3">
            <InformationCircleIcon className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-700 leading-relaxed">
              Les rapports seront automatiquement générés, chiffrés et archivés dans votre espace de stockage sécurisé. Un lien de téléchargement temporaire sera envoyé au destinataire.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button onClick={() => setIsScheduleModalOpen(false)} className="px-6 py-3 text-[10px] font-black uppercase text-slate-500">Annuler</button>
            <button
              onClick={() => {
                alert("Planification enregistrée avec succès !");
                setIsScheduleModalOpen(false);
              }}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl"
            >
              Enregistrer l'automatisation
            </button>
          </div>
        </div>
      </Modal>

      {/* 🛡️ MODAL CONFORMITÉ DÉTAILLÉE */}
      <Modal
        isOpen={isComplianceModalOpen}
        onClose={() => setIsComplianceModalOpen(false)}
        title="Rapport de Conformité Réglementaire"
        size="xl"
      >
        <div className="space-y-8 p-2">
          <div className="flex items-center justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div>
              <h4 className="text-2xl font-black text-slate-900">Score de Conformité : 98.4%</h4>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Dernière vérification : il y a 2 minutes</p>
            </div>
            <div className="h-16 w-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin-slow"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Points de Contrôle Validés</h5>
              <ul className="space-y-3">
                {['Intégrité des écritures comptables', 'Chiffrement PII (Données Personnelles)', 'Traçabilité des exports de données', 'Archivage légal (10 ans)'].map((p, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-500" /> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Actions de Remédiation</h5>
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-xs text-orange-800 leading-relaxed">
                <strong>Attention :</strong> 2 mot de passe utilisateurs expirent dans moins de 48h. Une notification automatique a été envoyée.
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button onClick={() => setIsComplianceModalOpen(false)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Fermer le Rapport</button>
          </div>
        </div>
      </Modal>

    </div >
  );
};

export default Audit;
