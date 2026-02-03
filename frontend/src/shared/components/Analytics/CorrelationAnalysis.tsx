import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import GlassmorphismCard from '../Effects/GlassmorphismCard';

interface CorrelationData {
  metric1: string;
  metric2: string;
  correlation: number;
  significance: 'high' | 'medium' | 'low';
  pValue: number;
  causation: 'positive' | 'negative' | 'none';
  insight: string;
}

interface CorrelationAnalysisProps {
  isVisible?: boolean;
  showGlassmorphism?: boolean;
}

const CorrelationAnalysis: React.FC<CorrelationAnalysisProps> = ({ 
  isVisible = true, 
  showGlassmorphism = true 
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const [correlationThreshold, setCorrelationThreshold] = useState<number>(0.5);
  const [showInsights, setShowInsights] = useState<boolean>(true);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  // Données de démonstration pour l'analyse de corrélation
  const metrics = [
    'Chiffre d\'Affaires',
    'Nombre de Clients',
    'Panier Moyen',
    'Taux de Conversion',
    'Coût d\'Acquisition',
    'Valeur Vie Client',
    'Taux de Rétention',
    'Satisfaction Client',
    'Temps de Réponse',
    'Taux de Churn'
  ];

  const correlationData: CorrelationData[] = [
    {
      metric1: 'Chiffre d\'Affaires',
      metric2: 'Nombre de Clients',
      correlation: 0.87,
      significance: 'high',
      pValue: 0.001,
      causation: 'positive',
      insight: 'Forte corrélation positive : plus de clients = plus de CA'
    },
    {
      metric1: 'Chiffre d\'Affaires',
      metric2: 'Panier Moyen',
      correlation: 0.72,
      significance: 'high',
      pValue: 0.003,
      causation: 'positive',
      insight: 'Corrélation positive : augmentation du panier moyen booste le CA'
    },
    {
      metric1: 'Nombre de Clients',
      metric2: 'Taux de Conversion',
      correlation: -0.45,
      significance: 'medium',
      pValue: 0.02,
      causation: 'negative',
      insight: 'Corrélation négative : plus de clients peut réduire le taux de conversion'
    },
    {
      metric1: 'Valeur Vie Client',
      metric2: 'Taux de Rétention',
      correlation: 0.91,
      significance: 'high',
      pValue: 0.0001,
      causation: 'positive',
      insight: 'Corrélation très forte : rétention élevée = LTV élevée'
    },
    {
      metric1: 'Coût d\'Acquisition',
      metric2: 'Taux de Churn',
      correlation: 0.38,
      significance: 'medium',
      pValue: 0.05,
      causation: 'positive',
      insight: 'Corrélation modérée : coût d\'acquisition élevé peut augmenter le churn'
    },
    {
      metric1: 'Satisfaction Client',
      metric2: 'Taux de Rétention',
      correlation: 0.83,
      significance: 'high',
      pValue: 0.002,
      causation: 'positive',
      insight: 'Forte corrélation : satisfaction élevée = rétention élevée'
    },
    {
      metric1: 'Temps de Réponse',
      metric2: 'Satisfaction Client',
      correlation: -0.67,
      significance: 'high',
      pValue: 0.008,
      causation: 'negative',
      insight: 'Corrélation négative forte : temps de réponse rapide = satisfaction élevée'
    },
    {
      metric1: 'Panier Moyen',
      metric2: 'Taux de Conversion',
      correlation: 0.54,
      significance: 'medium',
      pValue: 0.015,
      causation: 'positive',
      insight: 'Corrélation positive : panier moyen élevé peut améliorer la conversion'
    }
  ];

  const getCorrelationColor = (correlation: number) => {
    const absCorrelation = Math.abs(correlation);
    if (absCorrelation >= 0.8) return 'bg-red-500';
    if (absCorrelation >= 0.6) return 'bg-orange-500';
    if (absCorrelation >= 0.4) return 'bg-yellow-500';
    if (absCorrelation >= 0.2) return 'bg-green-500';
    return 'bg-gray-300';
  };

  const getCorrelationIntensity = (correlation: number) => {
    const absCorrelation = Math.abs(correlation);
    if (absCorrelation >= 0.8) return 1.0;
    if (absCorrelation >= 0.6) return 0.8;
    if (absCorrelation >= 0.4) return 0.6;
    if (absCorrelation >= 0.2) return 0.4;
    return 0.2;
  };

  const getSignificanceColor = (significance: string) => {
    switch (significance) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSignificanceIcon = (significance: string) => {
    switch (significance) {
      case 'high': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'medium': return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'low': return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
      default: return <InformationCircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredData = selectedMetric === 'all' 
    ? correlationData.filter(item => Math.abs(item.correlation) >= correlationThreshold)
    : correlationData.filter(item => 
        (item.metric1 === selectedMetric || item.metric2 === selectedMetric) &&
        Math.abs(item.correlation) >= correlationThreshold
      );

  // Créer une matrice de corrélation
  const createCorrelationMatrix = () => {
    const matrix: { [key: string]: { [key: string]: number } } = {};
    
    metrics.forEach(metric1 => {
      matrix[metric1] = {};
      metrics.forEach(metric2 => {
        if (metric1 === metric2) {
          matrix[metric1][metric2] = 1;
        } else {
          const correlation = correlationData.find(item => 
            (item.metric1 === metric1 && item.metric2 === metric2) ||
            (item.metric1 === metric2 && item.metric2 === metric1)
          );
          matrix[metric1][metric2] = correlation ? correlation.correlation : 0;
        }
      });
    });
    
    return matrix;
  };

  const correlationMatrix = createCorrelationMatrix();

  if (!isVisible) return null;

  return (
    <div className="space-y-6">
      {/* En-tête avec contrôles */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <CpuChipIcon className="h-6 w-6 text-purple-600" />
            <span>🔍 Analyse de Corrélation</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Détection automatique de corrélations entre métriques avec tests statistiques
          </p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Toutes les métriques</option>
            {metrics.map(metric => (
              <option key={metric} value={metric}>{metric}</option>
            ))}
          </select>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Seuil:</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={correlationThreshold}
              onChange={(e) => setCorrelationThreshold(parseFloat(e.target.value))}
              className="w-20"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {correlationThreshold.toFixed(1)}
            </span>
          </div>
          <button
            onClick={() => setShowInsights(!showInsights)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showInsights 
                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}
          >
            <LightBulbIcon className="h-4 w-4 inline mr-1" />
            Insights
          </button>
        </div>
      </div>

      {/* Métriques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {showGlassmorphism ? (
          <>
            <GlassmorphismCard intensity="medium" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Corrélations Fortes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {correlationData.filter(item => Math.abs(item.correlation) >= 0.7).length}
                  </p>
                </div>
                <ArrowTrendingUpIcon className="h-8 w-8 text-red-500" />
              </div>
            </GlassmorphismCard>
            <GlassmorphismCard intensity="medium" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Corrélations Modérées</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {correlationData.filter(item => Math.abs(item.correlation) >= 0.4 && Math.abs(item.correlation) < 0.7).length}
                  </p>
                </div>
                <ArrowTrendingUpIcon className="h-8 w-8 text-orange-500" />
              </div>
            </GlassmorphismCard>
            <GlassmorphismCard intensity="medium" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Significativité Élevée</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {correlationData.filter(item => item.significance === 'high').length}
                  </p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
            </GlassmorphismCard>
            <GlassmorphismCard intensity="medium" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Insights Générés</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {correlationData.length}
                  </p>
                </div>
                <LightBulbIcon className="h-8 w-8 text-purple-500" />
              </div>
            </GlassmorphismCard>
          </>
        ) : (
          <>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Corrélations Fortes</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {correlationData.filter(item => Math.abs(item.correlation) >= 0.7).length}
                  </p>
                </div>
                <ArrowTrendingUpIcon className="h-8 w-8 text-red-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Corrélations Modérées</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {correlationData.filter(item => Math.abs(item.correlation) >= 0.4 && Math.abs(item.correlation) < 0.7).length}
                  </p>
                </div>
                <ArrowTrendingUpIcon className="h-8 w-8 text-orange-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Significativité Élevée</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {correlationData.filter(item => item.significance === 'high').length}
                  </p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Insights Générés</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {correlationData.length}
                  </p>
                </div>
                <LightBulbIcon className="h-8 w-8 text-purple-500" />
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Heatmap de corrélation */}
      <div className={showGlassmorphism ? '' : ''}>
        {showGlassmorphism ? (
          <GlassmorphismCard intensity="medium" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              🗺️ Heatmap de Corrélation Interactive
            </h3>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* En-têtes des colonnes */}
                <div className="flex">
                  <div className="w-32 h-8"></div>
                  {metrics.map(metric => (
                    <div key={metric} className="w-24 h-8 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400 transform -rotate-45 origin-center">
                      {metric.split(' ')[0]}
                    </div>
                  ))}
                </div>
                
                {/* Matrice de corrélation */}
                {metrics.map((metric1, i) => (
                  <div key={metric1} className="flex">
                    <div className="w-32 h-8 flex items-center text-xs font-medium text-gray-900 dark:text-gray-100 pr-2">
                      {metric1}
                    </div>
                    {metrics.map((metric2, j) => {
                      const correlation = correlationMatrix[metric1][metric2];
                      const cellKey = `${metric1}-${metric2}`;
                      const isHovered = hoveredCell === cellKey;
                      
                      return (
                        <div
                          key={metric2}
                          className={`w-24 h-8 flex items-center justify-center text-xs font-medium cursor-pointer transition-all duration-200 ${
                            isHovered ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
                          }`}
                          style={{
                            backgroundColor: getCorrelationColor(correlation),
                            opacity: getCorrelationIntensity(correlation)
                          }}
                          onMouseEnter={() => setHoveredCell(cellKey)}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {i >= j ? (
                            <span className="text-white font-bold">
                              {correlation.toFixed(2)}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Légende */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Légende:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Forte (≥0.8)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Modérée (≥0.6)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Faible (≥0.4)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Très faible (≥0.2)</span>
                </div>
              </div>
            </div>
          </GlassmorphismCard>
        ) : (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              🗺️ Heatmap de Corrélation Interactive
            </h3>
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* En-têtes des colonnes */}
                <div className="flex">
                  <div className="w-32 h-8"></div>
                  {metrics.map(metric => (
                    <div key={metric} className="w-24 h-8 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400 transform -rotate-45 origin-center">
                      {metric.split(' ')[0]}
                    </div>
                  ))}
                </div>
                
                {/* Matrice de corrélation */}
                {metrics.map((metric1, i) => (
                  <div key={metric1} className="flex">
                    <div className="w-32 h-8 flex items-center text-xs font-medium text-gray-900 dark:text-gray-100 pr-2">
                      {metric1}
                    </div>
                    {metrics.map((metric2, j) => {
                      const correlation = correlationMatrix[metric1][metric2];
                      const cellKey = `${metric1}-${metric2}`;
                      const isHovered = hoveredCell === cellKey;
                      
                      return (
                        <div
                          key={metric2}
                          className={`w-24 h-8 flex items-center justify-center text-xs font-medium cursor-pointer transition-all duration-200 ${
                            isHovered ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
                          }`}
                          style={{
                            backgroundColor: getCorrelationColor(correlation),
                            opacity: getCorrelationIntensity(correlation)
                          }}
                          onMouseEnter={() => setHoveredCell(cellKey)}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          {i >= j ? (
                            <span className="text-white font-bold">
                              {correlation.toFixed(2)}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Légende */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">Légende:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Forte (≥0.8)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Modérée (≥0.6)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Faible (≥0.4)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Très faible (≥0.2)</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Liste des corrélations avec insights */}
      {showInsights && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <LightBulbIcon className="h-5 w-5 text-purple-600" />
            <span>💡 Insights et Recommandations</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredData.map((item, index) => (
              showGlassmorphism ? (
                <GlassmorphismCard key={index} intensity="medium" className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {item.metric1} ↔ {item.metric2}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.correlation > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.correlation > 0 ? '+' : ''}{item.correlation.toFixed(3)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignificanceColor(item.significance)}`}>
                          {item.significance === 'high' ? 'Élevée' : item.significance === 'medium' ? 'Moyenne' : 'Faible'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getSignificanceIcon(item.significance)}
                      <span className="text-xs text-gray-500">p={item.pValue.toFixed(3)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Causalité:</span> {
                        item.causation === 'positive' ? 'Positive' :
                        item.causation === 'negative' ? 'Négative' : 'Aucune'
                      }
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      <span className="font-medium">💡 Insight:</span> {item.insight}
                    </div>
                  </div>
                </GlassmorphismCard>
              ) : (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {item.metric1} ↔ {item.metric2}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.correlation > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.correlation > 0 ? '+' : ''}{item.correlation.toFixed(3)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSignificanceColor(item.significance)}`}>
                          {item.significance === 'high' ? 'Élevée' : item.significance === 'medium' ? 'Moyenne' : 'Faible'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getSignificanceIcon(item.significance)}
                      <span className="text-xs text-gray-500">p={item.pValue.toFixed(3)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Causalité:</span> {
                        item.causation === 'positive' ? 'Positive' :
                        item.causation === 'negative' ? 'Négative' : 'Aucune'
                      }
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                      <span className="font-medium">💡 Insight:</span> {item.insight}
                    </div>
                  </div>
                </Card>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CorrelationAnalysis;
