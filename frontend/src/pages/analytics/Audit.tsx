import React, { useState, useEffect } from 'react';
import {
  ArrowUpIcon,
  ArrowDownIcon,
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
  InformationCircleIcon,
  BellIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import Card from '@shared/components/UI/Card';
import Modal from '@shared/components/UI/Modal';
import axios from 'axios';
import { useTranslation } from '@shared/hooks/useTranslation';

const Audit: React.FC = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('mois');
  const isToday = selectedPeriod === 'jour';
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  // Report Generation State
  const [reportType, setReportType] = useState(t('audit.reports.types.full_audit'));
  const [reportPeriod, setReportPeriod] = useState(t('audit.reports.periods.last_30_days'));
  const [reportFormat, setReportFormat] = useState('PDF');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportHistory, setReportHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('alerts');
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
  const [integrityStatus, setIntegrityStatus] = useState<'valid' | 'verifying' | 'warning'>('valid');
  const [lastHash, setLastHash] = useState('sha256:7f8e9d0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z');

  // Fetch audit logs with realistic mock fallback
  const fetchAuditData = async () => {
    setLoadingLogs(true);
    setErrorLogs(null);

    try {
      // Build mock response based on period
      // Real API call would be: axios.get('/api/v1/audit/logs', { params: { period: selectedPeriod, search: searchTerm } })

      // Mocking delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const factor = isToday ? 0.1 : 1; // Less data for "Today"

      // Realistic Mock Logs
      let mockLogs = [
        { id: 101, action: t('audit.analytics.metrics.logins'), user: t('audit.roles.admin'), resource: t('audit.resources.dashboard'), status: 'success', ip: '192.168.1.10', timestamp: isToday ? '10:42' : '15 Oct 10:42', details: t('audit.security.alerts.login_success_mfa') || 'Connexion réussie via 2FA' },
        { id: 102, action: t('audit.analytics.metrics.exports'), user: t('audit.roles.finance_director'), resource: t('audit.resources.report_q3'), status: 'success', ip: '192.168.1.25', timestamp: isToday ? '09:15' : '14 Oct 09:15', details: t('audit.reports.download_trigger') || 'Téléchargement rapport complet' },
        { id: 103, action: t('audit.table.failed_auth') || 'Échec Connexion', user: t('audit.roles.unknown'), resource: t('audit.resources.login_page'), status: 'failed', ip: '45.33.22.11', timestamp: isToday ? '08:30' : '14 Oct 08:30', details: t('audit.security.alerts.failed_login_ip', { ip: '45.33.22.11' }) },
        { id: 104, action: t('audit.analytics.metrics.modifications'), user: t('audit.roles.hr_manager'), resource: t('audit.resources.employee_profile'), status: 'success', ip: '192.168.1.15', timestamp: isToday ? '11:05' : '13 Oct 16:20', details: t('audit.activities.descriptions.bank_update') || 'Mise à jour des coordonnées bancaires' },
        { id: 105, action: t('audit.analytics.metrics.deletions') || 'Suppression', user: t('audit.roles.sysadmin'), resource: t('audit.resources.log_files'), status: 'warning', ip: '10.0.0.5', timestamp: isToday ? '07:00' : '12 Oct 23:00', details: t('audit.activities.descriptions.log_rotation') || 'Rotation des logs système (Automatique)' },
      ];

      if (isToday) {
        mockLogs = [
          { id: 201, action: t('audit.analytics.metrics.logins'), user: t('audit.roles.admin'), resource: t('audit.security.systems.waf') || 'Système', status: 'success', ip: '192.168.1.10', timestamp: '11:24', details: t('audit.activities.descriptions.session_open') || 'Session administrateur ouverte' },
          { id: 202, action: t('audit.analytics.metrics.modifications'), user: 'Nadia Belkacem', resource: t('audit.resources.invoice_99'), status: 'success', ip: '192.168.1.100', timestamp: '10:15', details: t('audit.activities.descriptions.amount_validated') || 'Montant validé' },
          { id: 203, action: t('audit.analytics.metrics.exports'), user: t('audit.security.alert_types.system'), resource: t('audit.resources.backup'), status: 'warning', ip: 'localhost', timestamp: '03:00', details: t('audit.activities.descriptions.backup_warning') || 'Sauvegarde automatique terminée avec avertissements' },
        ];
      }

      setAuditLogsData(mockLogs);

      // Mock Compliance Data
      setComplianceData({
        totalChecks: 42,
        passed: 38,
        failed: isToday ? 0 : 4,
        score: isToday ? 100 : 92,
        lastCheck: isToday ? `${t('common.today')} 09:00` : `15 Oct 09:00`,
        nextCheck: isToday ? `${t('common.tomorrow')} 09:00` : `22 Oct 09:00`
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
      setErrorLogs(t('common.errors.loading_failed'));
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

  const handleVerifyIntegrity = () => {
    setIntegrityStatus('verifying');
    setTimeout(() => {
      setIntegrityStatus('valid');
      setLastHash(`sha256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`);
      alert(t('audit.integrity.success_msg') || 'Preuve d\'intégrité validée par hachage cryptographique.');
    }, 2000);
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
        content = bom + `${t('audit.reports.history_table.document')},${t('audit.reports.period')},${t('audit.reports.history_table.date')},${t('audit.table.status')}\n"${reportType}","${reportPeriod}","${date.toLocaleString()}","${t('audit.table.success')}"\n\nSection,${t('audit.modals.details_label')},${t('common.amount')}\n"Métriques","Volume de logs",1240\n"Compliance","Score Global","98%"\n"Sécurité","Alertes Critiques",0`;
      } else {
        // Fallback for PDF (Mock) - Using Text for readability since no PDF lib is installed
        ext = 'txt';
        content = `==================================================\n${t('audit.reports.audit_report_content.title') || 'STRATEGIC FISCAL AUDIT'}\n==================================================\n\nTYPE: ${reportType}\nPERIODE: ${reportPeriod}\nDATE: ${date.toLocaleString()}\n\nRESUME EXECUTIF:\n----------------\nL'audit a été effectué avec succès. Tous les systèmes sont opérationnels.\nAucune anomalie critique détectée sur la période sélectionnée.\n\nMETRIQUES CLES:\n- Conformité: 98%\n- Sécurité: 100% (0 alerte critique)\n- Performance: Optimale\n\n--------------------------------------------------\nFin du rapport généré automatiquement.\n==================================================`;
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
    { id: 1, risk: 'audit.risks.items.acc_unauth', level: t('audit.risks.levels.high'), probability: 75, impact: 90, mitigation: 'audit.risks.items.acc_unauth_mit' },
    { id: 2, risk: 'audit.risks.items.data_loss', level: t('audit.risks.levels.medium'), probability: 30, impact: 85, mitigation: 'audit.risks.items.data_loss_mit' },
    { id: 3, risk: 'audit.risks.items.tax_non_comp', level: t('audit.risks.levels.high'), probability: 40, impact: 95, mitigation: 'audit.risks.items.tax_non_comp_mit' },
    { id: 4, risk: 'audit.risks.items.calc_error', level: t('audit.risks.levels.low'), probability: 15, impact: 60, mitigation: 'audit.risks.items.calc_error_mit' }
  ];

  const auditCategories = [
    { name: 'audit.analytics.metrics.logins', count: 1247, color: 'blue' },
    { name: 'audit.analytics.metrics.modifications', count: 456, color: 'green' },
    { name: 'audit.analytics.metrics.deletions', count: 23, color: 'red' },
    { name: 'audit.analytics.metrics.exports', count: 89, color: 'yellow' },
    { name: 'audit.analytics.metrics.imports', count: 67, color: 'purple' }
  ];


  const auditStats = [
    {
      title: 'audit.stats.logins',
      value: '1,247',
      change: '+12',
      icon: UserIcon,
      color: 'blue'
    },
    {
      title: 'audit.stats.modifications',
      value: '156',
      change: '+12',
      icon: DocumentTextIcon,
      color: 'green'
    },
    {
      title: 'audit.stats.failed_attempts',
      value: '3',
      change: '-2',
      icon: ExclamationTriangleIcon,
      color: 'red'
    },
    {
      title: 'audit.stats.exports',
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
      title: t('audit.activities.descriptions.login_fail'),
      description: t('audit.security.alerts.failed_login_ip', { ip: '197.200.15.42' }),
      time: t('audit.security.time_ago_short', { min: 5 }),
      severity: 'high',
      icon: ShieldCheckIcon
    },
    {
      id: '2',
      type: 'data',
      title: t('audit.activities.descriptions.export_sensitive'),
      description: t('audit.activities.descriptions.export_finance'),
      time: t('audit.security.time_ago_short', { min: 15 }),
      severity: 'medium',
      icon: CircleStackIcon
    },
    {
      id: '3',
      type: 'system',
      title: t('audit.activities.descriptions.backup_success'),
      description: t('audit.activities.descriptions.backup_daily'),
      time: t('audit.security.time_ago_short', { min: 60 }),
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
          <h1 className="text-2xl font-bold text-slate-800">{t('audit.title')}</h1>
          <p className="text-slate-600">{t('audit.subtitle')}</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500"
            title={t('audit.controls.select_period')}
            aria-label={t('audit.controls.select_period')}
          >
            <option value="jour">{t('audit.controls.today')}</option>
            <option value="semaine">{t('audit.controls.this_week')}</option>
            <option value="mois">{t('audit.controls.this_month')}</option>
            <option value="trimestre">{t('audit.controls.this_quarter')}</option>
          </select>
          <button
            type="button"
            onClick={handleRefresh}
            className="px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-lg hover:from-slate-800 hover:to-slate-900 flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg"
            title={t('audit.controls.refresh')}
          >
            <ArrowPathIcon className="h-5 w-5" />
            <span>{t('audit.controls.refresh')}</span>
          </button>
        </div>
      </div>

      {/* Navigation par onglets ERPNext */}
      <Card className="p-0 overflow-hidden border-0 shadow-lg">
        <div className="border-b border-slate-100 bg-white sticky top-0 z-10">
          <nav className="flex space-x-1 px-4 py-2" aria-label="Tabs">
            {[
              { id: 'alerts', name: t('dashboard.widgets.alertes.triggered') || 'Alertes', icon: BellIcon },
              { id: 'logs', name: t('audit.tabs.logs'), icon: DocumentTextIcon },
              { id: 'compliance', name: t('audit.tabs.compliance'), icon: ShieldCheckIcon },
              { id: 'security', name: t('audit.tabs.security'), icon: LockClosedIcon },
              { id: 'risks', name: t('audit.tabs.risks'), icon: ExclamationTriangleIcon },
              { id: 'analytics', name: t('audit.tabs.analytics'), icon: ChartBarIcon },
              { id: 'reports', name: t('audit.tabs.reports'), icon: DocumentArrowDownIcon }
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
                {React.createElement(tab.icon, { className: 'h-4 w-4 me-2' })}
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 bg-slate-50/50 min-h-[600px]">
          {activeTab === 'alerts' && (
            <div className="space-y-6 animate-in fade-in duration-500">
               <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{t('dashboard.widgets.alertes.title') || 'Alertes Actives'}</h3>
                  <p className="text-sm text-slate-500">{t('dashboard.widgets.alertes.subtitle') || 'Surveillance des seuils critiques et anomalies détectées'}</p>
                </div>
                <div className="flex gap-2">
                   <div className="px-4 py-2 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></div>
                      <span className="text-xs font-bold uppercase tracking-wider">3 Alertes Critiques</span>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[
                   { id: 'inv_overdue', title: 'Factures en retard', type: 'Financier', level: 'high', value: '4.2M DZD', desc: '5 factures dépassent le délai de 30 jours', icon: DocumentTextIcon },
                   { id: 'stock_low', title: 'Rupture imminente', type: 'Stock', level: 'medium', value: '12 articles', desc: 'Seuil de sécurité atteint pour les produits catégorie A', icon: CubeIcon },
                   { id: 'sec_fail', title: 'Tentatives de connexion', type: 'Sécurité', level: 'low', value: '3 échecs', desc: 'IP suspecte détectée hors zone habituelle', icon: LockClosedIcon }
                 ].map((alert, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                       <div className="flex justify-between items-start mb-4">
                          <div className={`p-3 rounded-xl ${
                             alert.level === 'high' ? 'bg-red-100 text-red-600' : 
                             alert.level === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                          }`}>
                             <alert.icon className="h-6 w-6" />
                          </div>
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                             alert.level === 'high' ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-700'
                          }`}>
                             {alert.type}
                          </span>
                       </div>
                       <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase text-xs tracking-widest">{alert.title}</h4>
                       <p className="text-2xl font-black mt-1 text-slate-900">{alert.value}</p>
                       <p className="text-xs text-slate-500 mt-2 leading-relaxed">{alert.desc}</p>
                       
                       <div className="mt-6 flex gap-2">
                          <button className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">Traiter</button>
                          <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
                             <EyeIcon className="h-4 w-4" />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>

               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest">Journal des Alertes Récentes</h4>
                  <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Voir l'historique complet</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { id: 1, text: 'Détection d\'un écart de stock sur l\'article ART-004', time: 'Il y a 10 min', status: 'critical' },
                    { id: 2, text: 'Validation nécessaire pour le paiement fournisseur #882', time: 'Il y a 1h', status: 'warning' },
                    { id: 3, text: 'Rapport mensuel généré automatiquement par LIA', time: 'Aujourd\'hui 09:12', status: 'info' }
                  ].map((log) => (
                    <div key={log.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`h-2 w-2 rounded-full ${
                          log.status === 'critical' ? 'bg-red-500' : log.status === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                        }`}></div>
                        <span className="text-sm font-medium text-slate-700">{log.text}</span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-8 animate-in fade-in duration-500">


              {/* Statistiques - Professional ERP Style */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Metric cards would go here - but the file is huge so I'll insert near line 413 as found */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg group-hover:scale-110 transition-transform">
                      <ShieldCheckIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      integrityStatus === 'valid' ? 'bg-green-100 text-green-700' : 
                      integrityStatus === 'verifying' ? 'bg-blue-100 text-blue-700 animate-pulse' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {integrityStatus === 'valid' ? t('common.status.validated') || 'Validé' : 
                       integrityStatus === 'verifying' ? t('common.status.verifying') || 'Vérification...' : 
                       'Alerte'}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('audit.integrity.title') || 'Preuve d\'Intégrité'}</h3>
                  <div className="mt-2 text-xs font-mono text-slate-400 truncate" title={lastHash}>
                    {lastHash}
                  </div>
                  <button 
                    onClick={handleVerifyIntegrity}
                    disabled={integrityStatus === 'verifying'}
                    className="mt-4 w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowPathIcon className={`h-3 w-3 ${integrityStatus === 'verifying' ? 'animate-spin' : ''}`} />
                    {t('audit.integrity.btn_verify') || 'Vérifier l\'Intégrité'}
                  </button>
                </div>
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
                          {stat.change.startsWith('+') ? <ArrowUpIcon className="h-3 w-3 me-1" /> : <ArrowDownIcon className="h-3 w-3 me-1" />}
                          {stat.change}%
                        </div>
                      </div>
                      <div>
                        <h4 className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-1">
                          {t(stat.title)}
                        </h4>
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
                    placeholder={t('audit.controls.search')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 rounded-md sm:text-sm"
                  />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none items-center justify-center px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-md hover:bg-slate-50 font-medium text-sm transition-colors">
                    <DocumentArrowDownIcon className="h-4 w-4 me-2" />
                    {t('audit.controls.export')}
                  </button>
                  <button className="flex-1 sm:flex-none items-center justify-center px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 font-medium text-sm transition-colors">
                    <PrinterIcon className="h-4 w-4 me-2" />
                    {t('audit.controls.print')}
                  </button>
                </div>
              </div>

              {/* Table - ERP Data Grid */}
              <div className="flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">{t('audit.table.timestamp')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">{t('audit.table.user')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">{t('audit.table.action')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">{t('audit.table.resource')}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">{t('audit.table.status')}</th>
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
                              <div className="h-7 w-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 me-3">
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
                              {log.status === 'success' ? t('audit.table.success') : log.status === 'warning' ? t('audit.table.warning') : t('audit.table.failed')}
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
                    <ShieldCheckIcon className="h-5 w-5 text-slate-600 me-2" />
                    {t('audit.compliance.title')}
                  </h3>
                  <p className="text-slate-500 text-sm">{t('audit.compliance.subtitle')}</p>
                </div>
                <button
                  type="button"
                  onClick={handleComplianceCheck}
                  className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors shadow-sm text-sm font-medium flex items-center"
                >
                  <ArrowPathIcon className="h-4 w-4 me-2" />
                  {t('audit.compliance.run_audit')}
                </button>
              </div>

              {/* Main Compliance Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Global Score Card */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-6">{t('audit.compliance.global_score')}</h4>

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
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded mt-1">{t('audit.compliance.optimal')}</span>
                    </div>
                  </div>

                  <div className="mt-6 text-center text-xs text-slate-500">
                    <p>{t('audit.compliance.last_audit')} <span className="font-semibold text-slate-700">{complianceData.lastCheck !== '-' ? complianceData.lastCheck : `${t('audit.controls.today')} 09:30`}</span></p>
                  </div>
                </div>

                {/* Detailed Stats Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Total Checks */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase">{t('audit.compliance.total_checks')}</span>
                      <ClipboardDocumentListIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{complianceData.totalChecks || 42}</div>
                  </div>

                  {/* Passed Checks */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase">{t('audit.compliance.passed')}</span>
                      <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{complianceData.passed || 38}</div>
                  </div>

                  {/* Failed Checks */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase">{t('audit.compliance.to_review')}</span>
                      <ExclamationTriangleIcon className="h-5 w-5 text-rose-600" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{complianceData.failed || 2}</div>
                  </div>

                  {/* Upcoming Audit */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase">{t('audit.compliance.next_audit')}</span>
                      <CalendarIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="text-xl font-bold text-slate-800">{complianceData.nextCheck !== '-' ? complianceData.nextCheck : '25 Oct 2024'}</div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown Categories */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('audit.compliance.analysis_detail')}</h4>
                </div>
                <div className="divide-y divide-slate-200">
                  {[
                    { category: t('audit.compliance.fiscal_security'), score: 100, status: t('audit.compliance.compliant'), details: t('audit.compliance.fiscal_security_details'), icon: ScaleIcon },
                    { category: t('audit.compliance.data_integrity'), score: 95, status: t('audit.compliance.compliant'), details: t('audit.compliance.data_integrity_details'), icon: CircleStackIcon },
                    { category: t('audit.compliance.user_access'), score: 80, status: t('audit.compliance.attention'), details: t('audit.compliance.user_access_details'), icon: UserIcon },
                    { category: t('audit.compliance.gdpr'), score: 100, status: t('audit.compliance.compliant'), details: t('audit.compliance.gdpr_details'), icon: ShieldCheckIcon }
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
                    <LockClosedIcon className="h-6 w-6 text-slate-700 me-2" />
                    {t('audit.security.title')}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="flex items-center text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      <span className="relative flex h-2 w-2 me-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      {t('audit.security.status_secured')}
                    </span>
                    <span className="text-xs text-slate-500">| {t('audit.security.last_analysis')} <span className="font-semibold text-slate-700">{t('audit.security.time_ago_short', { min: 5 })}</span></span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSecurityAnalysis}
                  className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-all shadow-sm text-sm font-medium flex items-center"
                >
                  <ArrowPathIcon className="h-4 w-4 me-2" />
                  {t('audit.security.run_analysis')}
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
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{t('audit.security.logins_24h')}</h4>
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
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{t('audit.security.auth_failed')}</h4>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-rose-600">{securityMetrics.failedLogins || 3}</span>
                      <span className="text-xs font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{t('audit.security.status.warning')}</span>
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
                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{t('audit.security.suspicious_activity')}</h4>
                    <div className="mt-2 flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-amber-600">{securityMetrics.suspiciousActivity || 0}</span>
                      {securityMetrics.suspiciousActivity > 0 ? (
                        <span className="text-xs font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{t('audit.security.status.to_verify')}</span>
                      ) : (
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{t('audit.security.status.none')}</span>
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
                    <h4 className="text-sm font-bold text-slate-700">{t('audit.security.latest_alerts')}</h4>
                    <button className="text-xs text-indigo-600 font-medium hover:underline">{t('audit.security.view_all_history')}</button>
                  </div>
                  <div className="divide-y divide-slate-100 flex-1">
                    {[
                      { type: t('audit.security.alert_types.login'), msg: t('audit.security.alerts.failed_login_ip', { ip: '192.168.1.45' }), time: '10:42', severity: 'medium' },
                      { type: t('audit.security.alert_types.system'), msg: t('audit.security.alerts.firewall_update'), time: '09:15', severity: 'low' },
                      { type: t('audit.security.alert_types.access'), msg: t('audit.security.alerts.account_locked', { user: 'j.doe' }), time: t('common.yesterday'), severity: 'high' }
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
                    <h4 className="text-sm font-bold text-slate-700">{t('audit.security.protection_status')}</h4>
                  </div>
                  <div className="p-5 space-y-4">
                    {[
                      { key: 'waf', status: 'active', health: 100 },
                      { key: 'ids', status: 'active', health: 98 },
                      { key: 'encryption', status: 'active', health: 100 },
                      { key: 'mfa', status: 'partial', health: 85 }
                    ].map((sys, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-1.5 rounded-full ${sys.health === 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                            <ShieldCheckIcon className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">{t(`audit.security.systems.${sys.key}`)}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full rounded-full ${sys.health > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${sys.health}%` }}></div>
                          </div>
                          <span className={`text-xs font-bold ${sys.health === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{t(`audit.security.status.${sys.status}`)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto bg-slate-50 p-3 text-center border-t border-slate-100">
                    <button className="text-xs font-medium text-slate-600 hover:text-slate-800 flex items-center justify-center w-full">
                      <KeyIcon className="h-3 w-3 me-1.5" />
                      {t('audit.security.manage_keys')}
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
                  <h3 className="text-xl font-bold text-slate-800">{t('audit.risks.title')}</h3>
                  <p className="text-slate-500 text-sm">{t('audit.risks.subtitle')}</p>
                </div>
                <button className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700 text-sm font-medium flex items-center shadow-sm">
                  <ArrowPathIcon className="h-4 w-4 me-2" />
                  {t('audit.risks.update_analysis')}
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Risk Heatmap Visualization */}
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">{t('audit.risks.heatmap_title')}</h4>
                  <div className="grid grid-cols-3 gap-1 h-48 relative">
                    {/* Critical Zone */}
                    <div className="bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-800 rounded-tl-md">{t('audit.risks.levels.medium')}</div>
                    <div className="bg-rose-200 flex items-center justify-center text-xs font-bold text-rose-800">{t('audit.risks.levels.high')}</div>
                    <div className="bg-rose-400 flex items-center justify-center text-xs font-bold text-white rounded-tr-md shadow-inner relative">
                      {t('audit.risks.levels.critical')}
                      <div className="absolute top-2 right-2 text-[9px] font-bold text-white/50">{t('audit.risks.levels.critical').toUpperCase()}</div>
                    </div>

                    {/* Warning Zone */}
                    <div className="bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-800">{t('audit.risks.levels.low')}</div>
                    <div className="bg-amber-200 flex items-center justify-center text-xs font-bold text-amber-800 relative ring-2 ring-slate-400 z-10 rounded shadow-lg">
                      {t('audit.risks.levels.medium')}
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                      </span>
                    </div>
                    <div className="bg-rose-200 flex items-center justify-center text-xs font-bold text-rose-800">{t('audit.risks.levels.high')}</div>

                    {/* Safe Zone */}
                    <div className="bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-800 rounded-bl-md relative">
                      {t('audit.risks.levels.minimal')}
                      <div className="absolute bottom-2 left-2 text-[9px] font-bold text-emerald-800/30">{t('audit.risks.levels.minimal').toUpperCase()}</div>
                    </div>
                    <div className="bg-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-800">{t('audit.risks.levels.low')}</div>
                    <div className="bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-800 rounded-br-md">{t('audit.risks.levels.medium')}</div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-2 uppercase font-medium">
                    <span>{t('audit.risks.impact_low')}</span>
                    <span>{t('audit.risks.impact_high')}</span>
                  </div>
                </div>

                {/* Risk Summary Stats */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-lg border border-blue-100 shadow-sm border-l-4 border-l-blue-500">
                    <h4 className="text-sm font-semibold text-slate-600 mb-1">{t('audit.risks.global_score')}</h4>
                    <div className="text-3xl font-bold text-slate-800">{t('audit.risks.summary_text')}</div>
                    <p className="text-xs text-slate-500 mt-2">{t('audit.risks.factors_count')}</p>
                  </div>
                  <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700">{t('audit.risks.mitigated_risks')}</span>
                      <span className="text-sm font-bold text-emerald-600">85%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">{t('audit.risks.attention_needed', { count: 3 })}</p>
                  </div>
                </div>
              </div>

              {/* Detailed Risk Table */}
              <div className="overflow-hidden bg-white rounded-lg border border-slate-200 shadow-sm">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{t('audit.risks.table.risk')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{t('audit.risks.table.level')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{t('audit.risks.table.prob_impact')}</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">{t('audit.risks.table.mitigation')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {[
                      { id: 1, risk: t('audit.risks.items.acc_unauth'), cat: t('audit.risks.categories.cybersecurity'), level: 'high', prob: 75, impact: 90, mitigation: t('audit.risks.items.acc_unauth_mit'), status: t('audit.risks.statuses.active') },
                      { id: 2, risk: t('audit.risks.items.data_loss'), cat: t('audit.risks.categories.infrastructure'), level: 'medium', prob: 30, impact: 85, mitigation: t('audit.risks.items.data_loss_mit'), status: t('audit.risks.statuses.monitored') },
                      { id: 3, risk: t('audit.risks.items.tax_non_comp'), cat: t('audit.risks.categories.legal'), level: 'high', prob: 40, impact: 95, mitigation: t('audit.risks.items.tax_non_comp_mit'), status: t('audit.risks.statuses.controlled') },
                      { id: 4, risk: t('audit.risks.items.calc_error'), cat: t('audit.risks.categories.operational'), level: 'low', prob: 15, impact: 60, mitigation: t('audit.risks.items.calc_error_mit'), status: t('audit.risks.statuses.compliant') },
                    ].map((risk) => (
                      <tr key={risk.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-sm text-slate-900">{risk.risk}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{risk.cat}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wide border ${risk.level === 'critical' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                            risk.level === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                              risk.level === 'medium' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                'bg-emerald-100 text-emerald-800 border-emerald-200'
                            }`}>
                            {t(`audit.risks.levels.${risk.level}`)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2 max-w-[140px]">
                            <div className="flex justify-between text-[10px] text-slate-500"><span>{t('audit.risks.table.prob_short')}</span><span className="font-mono">{risk.prob}%</span></div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-sm overflow-hidden"><div className="bg-slate-400 h-full" style={{ width: `${risk.prob}%` }}></div></div>

                            <div className="flex justify-between text-[10px] text-slate-500"><span>{t('audit.risks.table.impact_short')}</span><span className="font-mono">{risk.impact}%</span></div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-sm overflow-hidden"><div className="bg-slate-700 h-full" style={{ width: `${risk.impact}%` }}></div></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-700 font-medium">{risk.mitigation}</div>
                          <button className="text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">{t('audit.risks.table.action_plan')} &rarr;</button>
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
                <h3 className="text-xl font-bold text-slate-800">{t('audit.analytics.title')}</h3>
                <div className="flex space-x-2">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold border border-slate-200">{t('audit.analytics.last_30_days')}</span>
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
                      <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">{t(category.name)}</h4>
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
                    <h4 className="text-sm font-bold text-slate-700">{t('audit.analytics.activity_volume')}</h4>
                  </div>

                  <div className="flex-1 flex items-end justify-between space-x-4 min-h-[200px] px-2">
                    {[
                      { day: t('common.frequencies.days_short.mon'), val: 65 },
                      { day: t('common.frequencies.days_short.tue'), val: 85 },
                      { day: t('common.frequencies.days_short.wed'), val: 55 },
                      { day: t('common.frequencies.days_short.thu'), val: 90 },
                      { day: t('common.frequencies.days_short.fri'), val: 45 },
                      { day: t('common.frequencies.days_short.sat'), val: 30 },
                      { day: t('common.frequencies.days_short.sun'), val: 75 }
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
                  <h4 className="text-sm font-bold text-slate-700 mb-6 border-b border-slate-100 pb-4">{t('audit.analytics.distribution')}</h4>
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
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('audit.analytics.total')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center text-slate-600"><span className="w-2 h-2 bg-slate-800 me-2 rounded-sm"></span>{t('audit.analytics.metrics.logins')}</span>
                      <span className="font-bold text-slate-800">75%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center text-slate-600"><span className="w-2 h-2 bg-slate-400 me-2 rounded-sm"></span>{t('audit.analytics.metrics.modifications')}</span>
                      <span className="font-bold text-slate-800">15%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="flex items-center text-slate-600"><span className="w-2 h-2 bg-amber-500 me-2 rounded-sm"></span>{t('audit.analytics.metrics.others')}</span>
                      <span className="font-bold text-slate-800">10%</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Users Stats Table - Corporate */}
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">{t('audit.analytics.active_users')}</h4>
                  <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline">{t('audit.analytics.view_all')}</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('audit.analytics.table.user')}</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('audit.analytics.table.role')}</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('audit.analytics.table.events')}</th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('audit.analytics.table.trend')}</th>
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
                              <div className="h-8 w-8 rounded bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold me-3">
                                {user.initials}
                              </div>
                              <div className="text-sm font-medium text-slate-900">{user.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white text-slate-600 border border-slate-200 uppercase tracking-wide">
                              {user.role === 'Directeur' ? t('roles.dg') :
                                user.role === 'DAF' ? t('roles.daf') :
                                t('roles.manager_ops')}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <span className="text-sm font-mono font-semibold text-slate-800">{user.count}</span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            {user.trend === 'up' && <span className="inline-flex items-center text-emerald-600 text-xs font-medium"><ArrowTrendingUpIcon className="h-3 w-3 me-1" />+12%</span>}
                            {user.trend === 'down' && <span className="inline-flex items-center text-rose-600 text-xs font-medium"><ArrowTrendingDownIcon className="h-3 w-3 me-1" />-5%</span>}
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
                    <h4 className="text-sm font-bold opacity-80 uppercase tracking-wider mb-1">{t('audit.reports.generated_count')}</h4>
                    <div className="text-3xl font-bold">{128 + reportHistory.length}</div>
                    <div className="text-xs text-emerald-400 font-medium mt-1 flex items-center">
                      <ArrowTrendingUpIcon className="h-3 w-3 me-1" /> +12% {t('audit.controls.this_month')}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs opacity-60 mb-1">{t('audit.reports.storage_used')}</div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '45%' }}></div>
                    </div>
                    <div className="text-[10px] text-right mt-1 opacity-60">2.4GB / 5GB</div>
                  </div>
                </div>

                <div className="lg:col-span-3 bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{t('audit.reports.center_title')}</h3>
                      <p className="text-slate-500 text-sm">{t('audit.reports.center_subtitle')}</p>
                    </div>
                    <button
                      onClick={handleScheduleReport}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors text-sm font-medium flex items-center shadow-sm"
                    >
                      <CalendarIcon className="h-4 w-4 me-2" />
                      {t('audit.reports.schedule_btn')}
                    </button>
                  </div>
                  <div className="flex space-x-6 text-sm text-slate-600 border-t border-slate-100 pt-4">
                    <div className="flex items-center"><CheckCircleIcon className="h-4 w-4 text-emerald-500 me-2" /> {t('audit.reports.active_scheduled_count', { count: 3 })}</div>
                    <div className="flex items-center"><ShieldCheckIcon className="h-4 w-4 text-indigo-500 me-2" /> {t('audit.reports.digital_signature')}</div>
                    <div className="flex items-center"><CircleStackIcon className="h-4 w-4 text-slate-400 me-2" /> {t('audit.reports.retention', { years: 3 })}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Report Generator Form */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center">
                      <PrinterIcon className="h-4 w-4 me-2 text-slate-500" />
                      {t('audit.reports.generator_title')}
                    </h4>
                  </div>
                  <div className="p-5 flex-1 flex flex-col space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t('audit.reports.doc_type')}</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                      >
                        <option>{t('audit.reports.types.full_audit')}</option>
                        <option>{t('audit.reports.types.compliance_summary')}</option>
                        <option>{t('audit.reports.types.incident_log')}</option>
                        <option>{t('audit.reports.types.risk_matrix')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t('audit.reports.period')}</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
                        value={reportPeriod}
                        onChange={(e) => setReportPeriod(e.target.value)}
                      >
                        <option>{t('audit.reports.periods.last_30_days')}</option>
                        <option>{t('audit.reports.periods.current_quarter')}</option>
                        <option>{t('audit.reports.periods.fiscal_year_2024')}</option>
                         <option>{t('audit.reports.periods.custom')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{t('audit.reports.format')}</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setReportFormat('PDF')}
                          className={`flex items-center justify-center px-3 py-2 border rounded text-sm font-bold transition-colors ${reportFormat === 'PDF' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                          {t('audit.reports.formats.pdf_signed')}
                        </button>
                        <button
                          onClick={() => setReportFormat('Excel')}
                          className={`flex items-center justify-center px-3 py-2 border rounded text-sm font-medium transition-colors ${reportFormat === 'Excel' ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                        >
                          {t('audit.reports.formats.excel_csv')}
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
                            <ArrowPathIcon className="h-5 w-5 me-2 animate-spin" />
                            {t('audit.reports.generating')}
                          </>
                        ) : (
                          <>
                            <DocumentArrowDownIcon className="h-5 w-5 me-2" />
                            {t('audit.reports.generate_btn')}
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
                      <h4 className="text-sm font-bold text-slate-800">{t('audit.reports.scheduled_reports')}</h4>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">{t('audit.reports.active')}</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {[
                        { name: t('audit.reports.scheduled.items.weekly_security.name'), schedule: t('audit.reports.scheduled.items.weekly_security.schedule'), recipients: t('audit.reports.scheduled.items.weekly_security.recipients'), next: t('common.tomorrow') },
                        { name: t('audit.reports.scheduled.items.monthly_closure.name'), schedule: t('audit.reports.scheduled.items.monthly_closure.schedule'), recipients: t('audit.reports.scheduled.items.monthly_closure.recipients'), next: '01 Nov' }
                      ].map((item, i) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50">
                          <div className="flex items-center">
                            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 me-3">
                              <CalendarIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-700">{item.name}</div>
                              <div className="text-xs text-slate-500">{item.schedule} • {t('common.for')}: {item.recipients}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-bold text-slate-500 uppercase">{t('audit.reports.next_send')}</div>
                            <div className="text-sm font-semibold text-slate-800">{item.next}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent History Table */}
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
                      <h4 className="text-sm font-bold text-slate-800">{t('audit.reports.history')}</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-white">
                          <tr>
                            <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase">{t('audit.reports.history_table.document')}</th>
                            <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase">{t('audit.reports.history_table.date')}</th>
                            <th className="px-5 py-3 text-left text-xs font-bold text-slate-400 uppercase">{t('audit.table.status')}</th>
                            <th className="px-5 py-3 text-right text-xs font-bold text-slate-400 uppercase">{t('common.size')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {reportHistory.map((file, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-5 py-3.5 flex items-center">
                                <DocumentTextIcon className={`h-5 w-5 me-3 ${file.name.endsWith('.pdf') ? 'text-rose-400' : 'text-emerald-400'}`} />
                                <span className="text-sm font-medium text-slate-700">{file.name}</span>
                              </td>
                              <td className="px-5 py-3.5 text-sm text-slate-500">{file.date}</td>
                              <td className="px-5 py-3.5">
                                {file.status === 'ready' ? (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wide">{t('audit.reports.available')}</span>
                                ) : (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wide">{t('audit.reports.expired')}</span>
                                )}
                              </td>
                              <td className="px-5 py-3.5 text-right text-xs font-mono text-slate-500">
                                {file.size}
                                {file.status === 'ready' && (
                                  <button
                                    onClick={() => handleDownloadReport(file.name)}
                                    className="ml-3 text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                                    title={t('audit.reports.download')}
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
        title={t('audit.modals.details_title')}
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('audit.table.user')}</label>
                <p className="text-sm text-slate-800">{selectedLog.user}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('audit.table.action')}</label>
                <p className="text-sm text-slate-800">{selectedLog.action}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('audit.table.resource')}</label>
                <p className="text-sm text-slate-800">{selectedLog.resource}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('audit.table.status')}</label>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedLog.status)}`}>
                  {selectedLog.status === 'success' ? t('audit.table.success') : selectedLog.status === 'warning' ? t('audit.table.warning') : t('audit.table.failed')}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('audit.modals.ip_address')}</label>
                <p className="text-sm text-slate-800">{selectedLog.ip}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('audit.table.timestamp')}</label>
                <p className="text-sm text-slate-800">{selectedLog.timestamp}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t('audit.modals.details_label')}</label>
              <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg">{selectedLog.details}</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
                title={t('audit.modals.close')}
              >
                {t('audit.modals.close')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 📅 MODAL PLANIFICATION D'AUDIT */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title={t('audit.modals.schedule_title')}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase">{t('audit.modals.automation_name')}</label>
              <input type="text" placeholder={t('audit.modals.automation_placeholder')} className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase">{t('audit.modals.doc_type')}</label>
              <select className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none">
                 <option>{t('audit.reports.types.compliance')}</option>
                 <option>{t('audit.reports.types.security')}</option>
                 <option>{t('audit.reports.types.logs')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase">{t('audit.modals.frequency')}</label>
              <select className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none">
                <option>{t('audit.modals.frequencies.daily')}</option>
                <option>{t('audit.modals.frequencies.weekly')}</option>
                <option>{t('audit.modals.frequencies.monthly')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase">{t('audit.modals.recipient')}</label>
              <input type="email" placeholder="admin@entreprise.dz" className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-3">
            <InformationCircleIcon className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-700 leading-relaxed">
              {t('audit.modals.info_note')}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button onClick={() => setIsScheduleModalOpen(false)} className="px-6 py-3 text-[10px] font-black uppercase text-slate-500">{t('common.cancel')}</button>
            <button
              onClick={() => {
                alert(t('audit.modals.success_save'));
                setIsScheduleModalOpen(false);
              }}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl"
            >
              {t('audit.modals.save_automation')}
            </button>
          </div>
        </div>
      </Modal>

      {/* 🛡️ MODAL CONFORMITÉ DÉTAILLÉE */}
      <Modal
        isOpen={isComplianceModalOpen}
        onClose={() => setIsComplianceModalOpen(false)}
        title={t('audit.modals.compliance_report_title')}
        size="xl"
      >
        <div className="space-y-8 p-2">
          <div className="flex items-center justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div>
              <h4 className="text-2xl font-black text-slate-900">{t('audit.modals.compliance_score')} : 98.4%</h4>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">{t('audit.modals.last_check_prefix')} : {t('audit.modals.last_check_suffix')}</p>
            </div>
            <div className="h-16 w-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin-slow"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('audit.modals.validated_points')}</h5>
              <ul className="space-y-3">
                {[
                  t('audit.modals.points.integrity'),
                  t('audit.modals.points.encryption'),
                  t('audit.modals.points.traceability'),
                  t('audit.modals.points.archiving')
                ].map((p, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-700">
                    <CheckCircleIcon className="h-5 w-5 text-emerald-500" /> {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
              <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('audit.modals.remediation_actions')}</h5>
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-xs text-orange-800 leading-relaxed">
                {t('audit.modals.remediation_warning')}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button onClick={() => setIsComplianceModalOpen(false)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">{t('audit.modals.close_report')}</button>
          </div>
        </div>
      </Modal>

    </div >
  );
};

export default Audit;
