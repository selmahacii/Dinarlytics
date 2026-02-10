import React, { useEffect, useState, useRef } from 'react';
import { RealisticChartData } from '../../types/dashboard';

interface AnimatedChartProps {
  chartData: RealisticChartData;
  isVisible: boolean;
  animationDelay?: number;
}

const AnimatedChart: React.FC<AnimatedChartProps> = ({
  chartData,
  isVisible,
  animationDelay = 0
}) => {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && !isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
        animateChart();
      }, animationDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, animationDelay]);

  const animateChart = () => {
    const duration = 2000; // 2 secondes
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setAnimationProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  };

  const renderLineChart = () => {
    const { donnees } = chartData;
    const maxValue = Math.max(...donnees.map(d => d.valeur || d.prevision || 0));
    const minValue = Math.min(...donnees.map(d => d.valeur || d.prevision || 0));
    const range = maxValue - minValue;

    const points = donnees.map((point, index) => {
      const x = (index / (donnees.length - 1)) * 100;
      const y = 100 - ((point.valeur || point.prevision || 0) - minValue) / range * 100;
      return { x, y, ...point };
    });

    return (
      <div className="relative w-full h-64 bg-white dark:bg-gray-800 rounded-lg p-4">
        {/* Grille */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Lignes de grille horizontales */}
          {[0, 25, 50, 75, 100].map(y => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="#e5e7eb"
              strokeWidth="0.5"
              opacity="0.5"
            />
          ))}

          {/* Ligne de données */}
          <polyline
            points={points.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray={`${100 * animationProgress} 100`}
            strokeDashoffset="0"
            className="transition-all duration-2000 ease-out"
          />

          {/* Points de données */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="2"
              fill="#3b82f6"
              opacity={animationProgress > index / points.length ? 1 : 0}
              className="transition-opacity duration-300"
            >
              <animate
                attributeName="r"
                values="2;4;2"
                dur="0.5s"
                begin={`${index * 100}ms`}
                repeatCount="1"
              />
            </circle>
          ))}
        </svg>

        {/* Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 dark:text-gray-400">
          {donnees.slice(0, 5).map((point, index) => (
            <span key={index}>{point.mois}</span>
          ))}
        </div>
      </div>
    );
  };

  const renderBarChart = () => {
    const { donnees } = chartData;
    const maxValue = Math.max(...donnees.map(d => d.valeur));

    return (
      <div className="relative w-full h-64 bg-white dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-end justify-between h-full space-x-2">
          {donnees.map((bar, index) => {
            const height = (bar.valeur / maxValue) * 100;
            const animatedHeight = height * animationProgress;

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full flex flex-col items-center">
                  {/* Barre */}
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-1000 ease-out"
                    style={{
                      height: `${animatedHeight}%`,
                      transitionDelay: `${index * 100}ms`
                    }}
                  >
                    {/* Valeur animée */}
                    <div
                      className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 dark:text-gray-300"
                      style={{
                        opacity: animationProgress > 0.5 ? 1 : 0,
                        transitionDelay: `${index * 100 + 500}ms`
                      }}
                    >
                      {bar.valeur.toLocaleString()}
                    </div>
                  </div>

                  {/* Label */}
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 text-center">
                    {bar.region}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDoughnutChart = () => {
    const { donnees } = chartData;
    const total = donnees.reduce((sum, item) => sum + item.valeur, 0);

    let cumulativePercentage = 0;

    return (
      <div className="relative w-full h-64 bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-center">
        <svg className="w-48 h-48" viewBox="0 0 100 100">
          {donnees.map((segment, index) => {
            const percentage = (segment.valeur / total) * 100;
            const animatedPercentage = percentage * animationProgress;
            const startAngle = cumulativePercentage * 3.6;
            const endAngle = (cumulativePercentage + animatedPercentage) * 3.6;

            const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);

            const largeArcFlag = animatedPercentage > 50 ? 1 : 0;
            const pathData = [
              `M 50 50`,
              `L ${x1} ${y1}`,
              `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`
            ].join(' ');

            cumulativePercentage += percentage;

            return (
              <path
                key={index}
                d={pathData}
                fill={segment.couleur || chartData.options.couleurs[index]}
                className="transition-all duration-1000 ease-out"
                style={{
                  opacity: animationProgress > index * 0.3 ? 1 : 0,
                  transitionDelay: `${index * 200}ms`
                }}
              />
            );
          })}

          {/* Cercle intérieur */}
          <circle
            cx="50"
            cy="50"
            r="20"
            fill="white"
            className="transition-opacity duration-500"
            style={{ opacity: animationProgress > 0.5 ? 1 : 0 }}
          />
        </svg>

        {/* Légende */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="grid grid-cols-3 gap-2">
            {donnees.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: item.couleur || chartData.options.couleurs[index],
                    opacity: animationProgress > index * 0.3 ? 1 : 0,
                    transitionDelay: `${index * 200}ms`
                  }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {item.secteur}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderAreaChart = () => {
    const { donnees } = chartData;
    const maxValue = Math.max(...donnees.map(d => Math.max(d.produits, d.services, d.maintenance)));

    return (
      <div className="relative w-full h-64 bg-white dark:bg-gray-800 rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Aire produits */}
          <path
            d={`M 0,100 ${donnees.map((d, i) =>
              `L ${(i / (donnees.length - 1)) * 100},${100 - (d.produits / maxValue) * 100}`
            ).join(' ')} L 100,100 Z`}
            fill="url(#gradient-produits)"
            opacity={animationProgress * 0.7}
            className="transition-all duration-2000 ease-out"
          />

          {/* Aire services */}
          <path
            d={`M 0,100 ${donnees.map((d, i) =>
              `L ${(i / (donnees.length - 1)) * 100},${100 - (d.services / maxValue) * 100}`
            ).join(' ')} L 100,100 Z`}
            fill="url(#gradient-services)"
            opacity={animationProgress * 0.7}
            className="transition-all duration-2000 ease-out"
            style={{ transitionDelay: '200ms' }}
          />

          {/* Aire maintenance */}
          <path
            d={`M 0,100 ${donnees.map((d, i) =>
              `L ${(i / (donnees.length - 1)) * 100},${100 - (d.maintenance / maxValue) * 100}`
            ).join(' ')} L 100,100 Z`}
            fill="url(#gradient-maintenance)"
            opacity={animationProgress * 0.7}
            className="transition-all duration-2000 ease-out"
            style={{ transitionDelay: '400ms' }}
          />

          {/* Définitions des gradients */}
          <defs>
            <linearGradient id="gradient-produits" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="gradient-services" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="gradient-maintenance" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  const renderScatterChart = () => {
    const { donnees } = chartData;
    const maxPrice = Math.max(...donnees.map(d => d.prix));
    const maxVolume = Math.max(...donnees.map(d => d.volume));

    return (
      <div className="relative w-full h-64 bg-white dark:bg-gray-800 rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Axes */}
          <line x1="10" y1="90" x2="90" y2="90" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="10" y1="10" x2="10" y2="90" stroke="#e5e7eb" strokeWidth="1" />

          {/* Points */}
          {donnees.map((point, index) => {
            const x = 10 + (point.prix / maxPrice) * 80;
            const y = 90 - (point.volume / maxVolume) * 80;
            const size = 2 + (point.marge / 50) * 3; // Taille basée sur la marge

            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={size * animationProgress}
                fill={chartData.options.couleurs[index]}
                opacity={animationProgress > index * 0.1 ? 0.8 : 0}
                className="transition-all duration-500 ease-out"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <animate
                  attributeName="r"
                  values={`0;${size};${size}`}
                  dur="0.5s"
                  begin={`${index * 100}ms`}
                  repeatCount="1"
                />
              </circle>
            );
          })}
        </svg>

        {/* Labels des axes */}
        <div className="absolute bottom-0 left-0 text-xs text-gray-500 dark:text-gray-400">
          Prix (DZD)
        </div>
        <div className="absolute top-0 left-0 transform -rotate-90 text-xs text-gray-500 dark:text-gray-400">
          Volume
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (chartData.type) {
      case 'line':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      case 'doughnut':
        return renderDoughnutChart();
      case 'area':
        return renderAreaChart();
      case 'scatter':
        return renderScatterChart();
      default:
        return <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <span className="text-gray-500 dark:text-gray-400">Type de graphique non supporté</span>
        </div>;
    }
  };

  return (
    <div ref={chartRef} className="w-full">
      {/* En-tête du graphique */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {chartData.titre}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {chartData.description}
        </p>
        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Période: {chartData.periode}</span>
          <span>Mise à jour: {chartData.miseAJour}</span>
          {isAnimating && (
            <span className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Animation en cours...</span>
            </span>
          )}
        </div>
      </div>

      {/* Graphique */}
      {renderChart()}
    </div>
  );
};

export default AnimatedChart;
