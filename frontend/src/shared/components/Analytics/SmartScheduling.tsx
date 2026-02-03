import React, { useState, useEffect } from 'react';
import {
  ClockIcon,
  CalendarIcon,
  BellIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  CogIcon,
  ChartBarIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ShareIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import GlassmorphismCard from '../Effects/GlassmorphismCard';
import Modal from '../UI/Modal';

interface ScheduledReport {
  id: string;
  name: string;
  type: 'rapport' | 'dashboard' | 'alerte';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
  time: string;
  recipients: string[];
  status: 'active' | 'paused' | 'error';
  lastRun: string;
  nextRun: string;
  successRate: number;
  engagement: number;
  dependencies: string[];
  optimizedTime: boolean;
  autoRetry: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface SmartSchedulingProps {
  isVisible?: boolean;
  showGlassmorphism?: boolean;
}

const SmartScheduling: React.FC<SmartSchedulingProps> = ({ 
  isVisible = true, 
  showGlassmorphism = true 
}) => {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ScheduledReport | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'analytics'>('list');
  const [showOptimizations, setShowOptimizations] = useState(true);

  // Données de démonstration pour la planification intelligente
  const demoReports: ScheduledReport[] = [
    {
      id: '1',
      name: 'Rapport de Ventes Quotidien',
      type: 'rapport',
      frequency: 'daily',
      time: '08:00',
      recipients: ['admin@entreprise.dz', 'commercial@entreprise.dz'],
      status: 'active',
      lastRun: '2024-01-15 08:00',
      nextRun: '2024-01-16 08:00',
      successRate: 98.5,
      engagement: 87.2,
      dependencies: ['extraction_donnees', 'calcul_kpis'],
      optimizedTime: true,
      autoRetry: true,
      priority: 'high'
    },
    {
      id: '2',
      name: 'Dashboard Exécutif Hebdomadaire',
      type: 'dashboard',
      frequency: 'weekly',
      time: '09:00',
      recipients: ['direction@entreprise.dz'],
      status: 'active',
      lastRun: '2024-01-12 09:00',
      nextRun: '2024-01-19 09:00',
      successRate: 100,
      engagement: 94.8,
      dependencies: ['rapport_ventes', 'rapport_financier'],
      optimizedTime: true,
      autoRetry: true,
      priority: 'high'
    },
    {
      id: '3',
      name: 'Alerte Seuils Financiers',
      type: 'alerte',
      frequency: 'daily',
      time: '18:00',
      recipients: ['comptable@entreprise.dz'],
      status: 'active',
      lastRun: '2024-01-15 18:00',
      nextRun: '2024-01-16 18:00',
      successRate: 95.2,
      engagement: 76.4,
      dependencies: ['calcul_ratios'],
      optimizedTime: false,
      autoRetry: false,
      priority: 'medium'
    },
    {
      id: '4',
      name: 'Rapport Mensuel Comptable',
      type: 'rapport',
      frequency: 'monthly',
      time: '10:00',
      recipients: ['comptable@entreprise.dz', 'audit@entreprise.dz'],
      status: 'paused',
      lastRun: '2023-12-31 10:00',
      nextRun: '2024-01-31 10:00',
      successRate: 92.1,
      engagement: 89.3,
      dependencies: ['cloture_mensuelle', 'rapport_tva'],
      optimizedTime: true,
      autoRetry: true,
      priority: 'medium'
    },
    {
      id: '5',
      name: 'Analyse de Performance Trimestrielle',
      type: 'rapport',
      frequency: 'quarterly',
      time: '14:00',
      recipients: ['direction@entreprise.dz', 'rh@entreprise.dz'],
      status: 'error',
      lastRun: '2024-01-10 14:00',
      nextRun: '2024-04-01 14:00',
      successRate: 78.9,
      engagement: 65.2,
      dependencies: ['rapport_ventes', 'rapport_financier', 'rapport_rh'],
      optimizedTime: false,
      autoRetry: true,
      priority: 'low'
    }
  ];

  useEffect(() => {
    setScheduledReports(demoReports);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'paused': return <PauseIcon className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rapport': return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'dashboard': return <ChartBarIcon className="h-5 w-5 text-purple-500" />;
      case 'alerte': return <BellIcon className="h-5 w-5 text-orange-500" />;
      default: return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'Quotidien';
      case 'weekly': return 'Hebdomadaire';
      case 'monthly': return 'Mensuel';
      case 'quarterly': return 'Trimestriel';
      case 'custom': return 'Personnalisé';
      default: return frequency;
    }
  };

  const handleToggleStatus = (id: string) => {
    setScheduledReports(prev => prev.map(report => 
      report.id === id 
        ? { 
            ...report, 
            status: report.status === 'active' ? 'paused' : 'active' 
          }
        : report
    ));
  };

  const handleOptimizeSchedule = () => {
    // Simulation de l'optimisation automatique
    setScheduledReports(prev => prev.map(report => ({
      ...report,
      optimizedTime: true,
      engagement: Math.min(100, report.engagement + Math.random() * 10)
    })));
  };

  const activeReports = scheduledReports.filter(r => r.status === 'active').length;
  const pausedReports = scheduledReports.filter(r => r.status === 'paused').length;
  const errorReports = scheduledReports.filter(r => r.status === 'error').length;
  const avgSuccessRate = scheduledReports.reduce((sum, r) => sum + r.successRate, 0) / scheduledReports.length;
  const avgEngagement = scheduledReports.reduce((sum, r) => sum + r.engagement, 0) / scheduledReports.length;

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <ClockIcon className="h-6 w-6 text-indigo-600" />
            <span>⏰ Planification Intelligente</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Automatisation des rapports avec optimisation des horaires et gestion des dépendances
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="flex space-x-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              Liste
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              Calendrier
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'analytics' 
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              Analytics
            </button>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Nouveau Planning</span>
          </button>
        </div>
      </div>

      {/* Métriques globales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {showGlassmorphism ? (
          <>
            <GlassmorphismCard intensity="medium" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Actifs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeReports}</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
            </GlassmorphismCard>
            <GlassmorphismCard intensity="medium" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">En Pause</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pausedReports}</p>
                </div>
                <PauseIcon className="h-8 w-8 text-yellow-500" />
              </div>
            </GlassmorphismCard>
            <GlassmorphismCard intensity="medium" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Erreurs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{errorReports}</p>
                </div>
                <XCircleIcon className="h-8 w-8 text-red-500" />
              </div>
            </GlassmorphismCard>
            <GlassmorphismCard intensity="medium" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Taux Succès</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{avgSuccessRate.toFixed(1)}%</p>
                </div>
                <ArrowPathIcon className="h-8 w-8 text-blue-500" />
              </div>
            </GlassmorphismCard>
            <GlassmorphismCard intensity="medium" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Engagement</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{avgEngagement.toFixed(1)}%</p>
                </div>
                <ShareIcon className="h-8 w-8 text-purple-500" />
              </div>
            </GlassmorphismCard>
          </>
        ) : (
          <>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Actifs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{activeReports}</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">En Pause</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pausedReports}</p>
                </div>
                <PauseIcon className="h-8 w-8 text-yellow-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Erreurs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{errorReports}</p>
                </div>
                <XCircleIcon className="h-8 w-8 text-red-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Taux Succès</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{avgSuccessRate.toFixed(1)}%</p>
                </div>
                <ArrowPathIcon className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Engagement</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{avgEngagement.toFixed(1)}%</p>
                </div>
                <ShareIcon className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Optimisations intelligentes */}
      {showOptimizations && (
        <div className={showGlassmorphism ? '' : ''}>
          {showGlassmorphism ? (
            <GlassmorphismCard intensity="medium" className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                  <CogIcon className="h-5 w-5 text-indigo-600" />
                  <span> Optimisations Intelligentes</span>
                </h3>
                <button
                  onClick={handleOptimizeSchedule}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                >
                  <CogIcon className="h-4 w-4" />
                  <span>Optimiser</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">⏰ Optimisation des Horaires</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Analyse des patterns d'engagement pour optimiser les heures d'envoi automatiquement.
                  </p>
                  <div className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                    {scheduledReports.filter(r => r.optimizedTime).length} rapports optimisés
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2"> Gestion des Dépendances</h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Orchestration automatique des rapports selon leurs dépendances et priorités.
                  </p>
                  <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                    {scheduledReports.reduce((sum, r) => sum + r.dependencies.length, 0)} dépendances gérées
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Analyse d'Engagement</h4>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    Monitoring continu de l'engagement pour ajuster automatiquement la fréquence.
                  </p>
                  <div className="mt-2 text-xs text-purple-700 dark:text-purple-300">
                    Engagement moyen: {avgEngagement.toFixed(1)}%
                  </div>
                </div>
              </div>
            </GlassmorphismCard>
          ) : (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                  <CogIcon className="h-5 w-5 text-indigo-600" />
                  <span> Optimisations Intelligentes</span>
                </h3>
                <button
                  onClick={handleOptimizeSchedule}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
                >
                  <CogIcon className="h-4 w-4" />
                  <span>Optimiser</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2"> Optimisation des Horaires</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Analyse des patterns d'engagement pour optimiser les heures d'envoi automatiquement.
                  </p>
                  <div className="mt-2 text-xs text-blue-700 dark:text-blue-300">
                    {scheduledReports.filter(r => r.optimizedTime).length} rapports optimisés
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Gestion des Dépendances</h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Orchestration automatique des rapports selon leurs dépendances et priorités.
                  </p>
                  <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                    {scheduledReports.reduce((sum, r) => sum + r.dependencies.length, 0)} dépendances gérées
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2"> Analyse d'Engagement</h4>
                  <p className="text-sm text-purple-800 dark:text-purple-200">
                    Monitoring continu de l'engagement pour ajuster automatiquement la fréquence.
                  </p>
                  <div className="mt-2 text-xs text-purple-700 dark:text-purple-300">
                    Engagement moyen: {avgEngagement.toFixed(1)}%
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Liste des rapports planifiés */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          📋 Rapports Planifiés ({scheduledReports.length})
        </h3>
        
        <div className="space-y-3">
          {scheduledReports.map((report) => (
            showGlassmorphism ? (
              <GlassmorphismCard key={report.id} intensity="medium" className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getTypeIcon(report.type)}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{report.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>{getFrequencyText(report.frequency)}</span>
                          <span>•</span>
                          <span>{report.time}</span>
                          <span>•</span>
                          <span>{report.recipients.length} destinataires</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(report.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status === 'active' ? 'Actif' : report.status === 'paused' ? 'En Pause' : 'Erreur'}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                        {report.priority === 'high' ? 'Priorité Haute' : report.priority === 'medium' ? 'Priorité Moyenne' : 'Priorité Basse'}
                      </span>
                      {report.optimizedTime && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ⚡ Optimisé
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Dernière exécution:</span>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{report.lastRun}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Prochaine exécution:</span>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{report.nextRun}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-600 dark:text-gray-400">Succès:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{report.successRate}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-600 dark:text-gray-400">Engagement:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{report.engagement}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-600 dark:text-gray-400">Dépendances:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{report.dependencies.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleToggleStatus(report.id)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        report.status === 'active' 
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {report.status === 'active' ? 'Pause' : 'Activer'}
                    </button>
                    <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200 transition-colors">
                      <EyeIcon className="h-3 w-3 inline mr-1" />
                      Voir
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium hover:bg-gray-200 transition-colors">
                      <PencilIcon className="h-3 w-3 inline mr-1" />
                      Modifier
                    </button>
                  </div>
                </div>
              </GlassmorphismCard>
            ) : (
              <Card key={report.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getTypeIcon(report.type)}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{report.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <span>{getFrequencyText(report.frequency)}</span>
                          <span>•</span>
                          <span>{report.time}</span>
                          <span>•</span>
                          <span>{report.recipients.length} destinataires</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(report.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status === 'active' ? 'Actif' : report.status === 'paused' ? 'En Pause' : 'Erreur'}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                        {report.priority === 'high' ? 'Priorité Haute' : report.priority === 'medium' ? 'Priorité Moyenne' : 'Priorité Basse'}
                      </span>
                      {report.optimizedTime && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ⚡ Optimisé
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Dernière exécution:</span>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{report.lastRun}</div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Prochaine exécution:</span>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{report.nextRun}</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-600 dark:text-gray-400">Succès:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{report.successRate}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-600 dark:text-gray-400">Engagement:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{report.engagement}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-600 dark:text-gray-400">Dépendances:</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{report.dependencies.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => handleToggleStatus(report.id)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        report.status === 'active' 
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {report.status === 'active' ? 'Pause' : 'Activer'}
                    </button>
                    <button className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium hover:bg-blue-200 transition-colors">
                      <EyeIcon className="h-3 w-3 inline mr-1" />
                      Voir
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium hover:bg-gray-200 transition-colors">
                      <PencilIcon className="h-3 w-3 inline mr-1" />
                      Modifier
                    </button>
                  </div>
                </div>
              </Card>
            )
          ))}
        </div>
      </div>

      {/* Modal pour créer/modifier un planning */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nouveau Planning de Rapport"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du rapport</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ex: Rapport de Ventes Quotidien"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="rapport">Rapport</option>
                <option value="dashboard">Dashboard</option>
                <option value="alerte">Alerte</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                <option value="daily">Quotidien</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuel</option>
                <option value="quarterly">Trimestriel</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Heure d'envoi</label>
            <input
              type="time"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destinataires</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="admin@entreprise.dz, commercial@entreprise.dz"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="ml-2 text-sm text-gray-700">Optimisation automatique des horaires</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="ml-2 text-sm text-gray-700">Retry automatique en cas d'erreur</span>
            </label>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Créer le Planning
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SmartScheduling;
