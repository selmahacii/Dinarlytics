import React, { useState, useEffect } from 'react';
import { useApp } from '@core/context/AppContext';
import {
  ChartBarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import GlassmorphismCard from '../Effects/GlassmorphismCard';

interface CohortData {
  cohort: string;
  acquisitionDate: string;
  totalUsers: number;
  retention: {
    week1: number;
    week2: number;
    week4: number;
    week8: number;
    week12: number;
    week24: number;
  };
  revenue: {
    total: number;
    average: number;
    ltv: number;
  };
  churnRisk: 'low' | 'medium' | 'high';
  churnProbability: number;
}

interface CohortAnalysisProps {
  isVisible?: boolean;
  showGlassmorphism?: boolean;
}

const CohortAnalysis: React.FC<CohortAnalysisProps> = ({
  isVisible = true, 
  showGlassmorphism = true 
}) => {
  const { formatCurrency } = useApp();
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('6months');
  const [isLoading, setIsLoading] = useState(false);

  // Données de démonstration réalistes pour l'analyse de cohorte
  const cohortData: CohortData[] = [
    {
      cohort: '2024-01',
      acquisitionDate: 'Janvier 2024',
      totalUsers: 1247,
      retention: {
        week1: 89.2,
        week2: 76.8,
        week4: 68.4,
        week8: 61.2,
        week12: 55.7,
        week24: 48.3
      },
      revenue: {
        total: 2450000,
        average: 1965,
        ltv: 2847
      },
      churnRisk: 'low',
      churnProbability: 12.3
    },
    {
      cohort: '2024-02',
      acquisitionDate: 'Février 2024',
      totalUsers: 1156,
      retention: {
        week1: 91.4,
        week2: 79.1,
        week4: 71.2,
        week8: 64.8,
        week12: 58.9,
        week24: 51.2
      },
      revenue: {
        total: 2180000,
        average: 1886,
        ltv: 2674
      },
      churnRisk: 'low',
      churnProbability: 8.7
    },
    {
      cohort: '2024-03',
      acquisitionDate: 'Mars 2024',
      totalUsers: 1089,
      retention: {
        week1: 87.6,
        week2: 74.3,
        week4: 65.8,
        week8: 58.1,
        week12: 52.4,
        week24: 44.7
      },
      revenue: {
        total: 1920000,
        average: 1763,
        ltv: 2418
      },
      churnRisk: 'medium',
      churnProbability: 18.9
    },
    {
      cohort: '2024-04',
      acquisitionDate: 'Avril 2024',
      totalUsers: 1345,
      retention: {
        week1: 85.2,
        week2: 71.8,
        week4: 62.1,
        week8: 54.3,
        week12: 48.7,
        week24: 41.2
      },
      revenue: {
        total: 1980000,
        average: 1472,
        ltv: 1987
      },
      churnRisk: 'high',
      churnProbability: 28.4
    }
  ];

  const getChurnRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getChurnRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'medium': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'high': return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default: return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };


  const filteredData = selectedCohort === 'all' 
    ? cohortData 
    : cohortData.filter(cohort => cohort.cohort === selectedCohort);

  const averageRetention = {
    week1: cohortData.reduce((sum, cohort) => sum + cohort.retention.week1, 0) / cohortData.length,
    week2: cohortData.reduce((sum, cohort) => sum + cohort.retention.week2, 0) / cohortData.length,
    week4: cohortData.reduce((sum, cohort) => sum + cohort.retention.week4, 0) / cohortData.length,
    week8: cohortData.reduce((sum, cohort) => sum + cohort.retention.week8, 0) / cohortData.length,
    week12: cohortData.reduce((sum, cohort) => sum + cohort.retention.week12, 0) / cohortData.length,
    week24: cohortData.reduce((sum, cohort) => sum + cohort.retention.week24, 0) / cohortData.length
  };

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <UserGroupIcon className="h-6 w-6 text-blue-600" />
            <span> Analyse de Cohorte</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Suivi des clients par cohortes d'acquisition et analyse de rétention
          </p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            aria-label="Sélectionner une cohorte"
          >
            <option value="all">Toutes les cohortes</option>
            {cohortData.map(cohort => (
              <option key={cohort.cohort} value={cohort.cohort}>
                {cohort.acquisitionDate}
              </option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            aria-label="Sélectionner la période d'analyse"
          >
            <option value="3months">3 mois</option>
            <option value="6months">6 mois</option>
            <option value="12months">12 mois</option>
          </select>
        </div>
      </div>

      {/* Métriques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {showGlassmorphism ? (
          <>
            <GlassmorphismCard intensity="medium" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cohortes Actives</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{cohortData.length}</p>
                </div>
                <UserGroupIcon className="h-8 w-8 text-blue-500" />
              </div>
            </GlassmorphismCard>
            <GlassmorphismCard intensity="medium" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rétention Moyenne</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {averageRetention.week12.toFixed(1)}%
                  </p>
                </div>
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
              </div>
            </GlassmorphismCard>
            <GlassmorphismCard intensity="medium" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">LTV Moyen</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(cohortData.reduce((sum, cohort) => sum + cohort.revenue.ltv, 0) / cohortData.length)}
                  </p>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-purple-500" />
              </div>
            </GlassmorphismCard>
            <GlassmorphismCard intensity="medium" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Risque Churn</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {cohortData.reduce((sum, cohort) => sum + cohort.churnProbability, 0) / cohortData.length}%
                  </p>
                </div>
                <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
              </div>
            </GlassmorphismCard>
          </>
        ) : (
          <>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cohortes Actives</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{cohortData.length}</p>
                </div>
                <UserGroupIcon className="h-8 w-8 text-blue-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Rétention Moyenne</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {averageRetention.week12.toFixed(1)}%
                  </p>
                </div>
                <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">LTV Moyen</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {formatCurrency(cohortData.reduce((sum, cohort) => sum + cohort.revenue.ltv, 0) / cohortData.length)}
                  </p>
                </div>
                <CurrencyDollarIcon className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Risque Churn</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {cohortData.reduce((sum, cohort) => sum + cohort.churnProbability, 0) / cohortData.length}%
                  </p>
                </div>
                <ExclamationTriangleIcon className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Tableau de rétention */}
      <div className={showGlassmorphism ? '' : ''}>
        {showGlassmorphism ? (
          <GlassmorphismCard intensity="medium" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Tableau de Rétention par Cohorte
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Cohorte</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Utilisateurs</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Semaine 1</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Semaine 2</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Semaine 4</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Semaine 8</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Semaine 12</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Semaine 24</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Risque Churn</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((cohort) => (
                    <tr key={cohort.cohort} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{cohort.acquisitionDate}</div>
                          <div className="text-sm text-gray-500">{cohort.cohort}</div>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                        {cohort.totalUsers.toLocaleString()}
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          cohort.retention.week1 >= 85 ? 'bg-green-100 text-green-800' :
                          cohort.retention.week1 >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cohort.retention.week1}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          cohort.retention.week2 >= 75 ? 'bg-green-100 text-green-800' :
                          cohort.retention.week2 >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cohort.retention.week2}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          cohort.retention.week4 >= 65 ? 'bg-green-100 text-green-800' :
                          cohort.retention.week4 >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cohort.retention.week4}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          cohort.retention.week8 >= 55 ? 'bg-green-100 text-green-800' :
                          cohort.retention.week8 >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cohort.retention.week8}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          cohort.retention.week12 >= 50 ? 'bg-green-100 text-green-800' :
                          cohort.retention.week12 >= 35 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cohort.retention.week12}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          cohort.retention.week24 >= 40 ? 'bg-green-100 text-green-800' :
                          cohort.retention.week24 >= 25 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cohort.retention.week24}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          {getChurnRiskIcon(cohort.churnRisk)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChurnRiskColor(cohort.churnRisk)}`}>
                            {cohort.churnProbability}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassmorphismCard>
        ) : (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Tableau de Rétention par Cohorte
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Cohorte</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Utilisateurs</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Semaine 1</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Semaine 2</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Semaine 4</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Semaine 8</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Semaine 12</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Semaine 24</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">Risque Churn</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((cohort) => (
                    <tr key={cohort.cohort} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">{cohort.acquisitionDate}</div>
                          <div className="text-sm text-gray-500">{cohort.cohort}</div>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                        {cohort.totalUsers.toLocaleString()}
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          cohort.retention.week1 >= 85 ? 'bg-green-100 text-green-800' :
                          cohort.retention.week1 >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cohort.retention.week1}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          cohort.retention.week2 >= 75 ? 'bg-green-100 text-green-800' :
                          cohort.retention.week2 >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cohort.retention.week2}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          cohort.retention.week4 >= 65 ? 'bg-green-100 text-green-800' :
                          cohort.retention.week4 >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cohort.retention.week4}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          cohort.retention.week8 >= 55 ? 'bg-green-100 text-green-800' :
                          cohort.retention.week8 >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cohort.retention.week8}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          cohort.retention.week12 >= 50 ? 'bg-green-100 text-green-800' :
                          cohort.retention.week12 >= 35 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cohort.retention.week12}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                          cohort.retention.week24 >= 40 ? 'bg-green-100 text-green-800' :
                          cohort.retention.week24 >= 25 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {cohort.retention.week24}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center space-x-2">
                          {getChurnRiskIcon(cohort.churnRisk)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChurnRiskColor(cohort.churnRisk)}`}>
                            {cohort.churnProbability}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Analyse de valeur vie client */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredData.map((cohort) => (
          showGlassmorphism ? (
            <GlassmorphismCard key={cohort.cohort} intensity="medium" className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {cohort.acquisitionDate}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {cohort.totalUsers.toLocaleString()} utilisateurs
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getChurnRiskIcon(cohort.churnRisk)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChurnRiskColor(cohort.churnRisk)}`}>
                    {cohort.churnRisk === 'low' ? 'Faible' : cohort.churnRisk === 'medium' ? 'Moyen' : 'Élevé'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(cohort.revenue.total)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Revenus Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(cohort.revenue.average)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Panier Moyen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(cohort.revenue.ltv)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">LTV</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Probabilité de churn:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {cohort.churnProbability}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        cohort.churnRisk === 'low' ? 'bg-green-500' :
                        cohort.churnRisk === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${cohort.churnProbability}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </GlassmorphismCard>
          ) : (
            <Card key={cohort.cohort} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {cohort.acquisitionDate}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {cohort.totalUsers.toLocaleString()} utilisateurs
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getChurnRiskIcon(cohort.churnRisk)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChurnRiskColor(cohort.churnRisk)}`}>
                    {cohort.churnRisk === 'low' ? 'Faible' : cohort.churnRisk === 'medium' ? 'Moyen' : 'Élevé'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(cohort.revenue.total)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Revenus Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(cohort.revenue.average)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Panier Moyen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(cohort.revenue.ltv)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">LTV</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Probabilité de churn:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {cohort.churnProbability}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        cohort.churnRisk === 'low' ? 'bg-green-500' :
                        cohort.churnRisk === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${cohort.churnProbability}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          )
        ))}
      </div>
    </div>
  );
};

export default CohortAnalysis;
