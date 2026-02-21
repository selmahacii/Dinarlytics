import React, { useEffect, useState, useRef } from 'react';
import { RealisticChartData } from '@/types/dashboard';
import { useApp } from '@core/context/AppContext';

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
  const { currentDevise, formatCurrency } = useApp();
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Taux de change démo (Base DZD)
  const rates: Record<string, number> = { DZD: 1, EUR: 148.5, USD: 138.2 };
  const currentRate = rates[currentDevise as keyof typeof rates] || 1;

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
    if (!donnees || donnees.length === 0) return null;

    const validData = donnees.map(d => ({
      ...d,
      valeur: (d.valeur || 0) / currentRate,
      prevision: (d.prevision || 0) / currentRate
    }));

    const maxValue = Math.max(...validData.map(d => Math.max(d.valeur, d.prevision))) || 100;
    const minValue = Math.min(...validData.map(d => Math.min(d.valeur, d.prevision))) || 0;
    const range = maxValue - minValue || 1; // Prevent division by zero

    const points = validData.map((point, index) => {
      const x = (index / (validData.length - 1)) * 100;
      const y = 100 - ((point.valeur || point.prevision) - minValue) / range * 100;
      return { x: isNaN(x) ? 0 : x, y: isNaN(y) ? 0 : y, ...point };
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
    const { donnees, options } = chartData;
    const maxValue = Math.max(...donnees.map(d => d.valeur / currentRate)) || 100;

    // Grid steps (0, 25%, 50%, 75%, 100%)
    const gridSteps = [0, 0.25, 0.5, 0.75, 1];

    return (
      <div className="relative w-full h-64 bg-white dark:bg-gray-800 rounded-lg p-4">
        {/* Background Grid */}
        <div className="absolute inset-0 px-4 py-8 pointer-events-none flex flex-col justify-between">
          {[...gridSteps].reverse().map((step, i) => (
            <div key={i} className="w-full h-px bg-slate-100 dark:bg-slate-700 relative">
              <span className="absolute -left-0 -top-2 text-[10px] text-slate-400">
                {options?.currency ?
                  formatCurrency(maxValue * step * currentRate) :
                  Math.round(maxValue * step).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Use items-stretch to ensure columns have full height context */}
        <div className="relative flex items-end justify-between h-full space-x-4 pt-4 z-10 ml-6"> {/* ml-6 for y-axis labels */}
          {donnees.map((bar, index) => {
            const scaledValue = bar.valeur / currentRate;
            const height = (scaledValue / maxValue) * 100;
            const animatedHeight = height * animationProgress;
            // Dynamic color
            const color = chartData.options?.couleurs?.[index % (chartData.options?.couleurs?.length || 1)] || '#3b82f6';

            return (
              <div key={index} className="flex-1 flex flex-col justify-end items-center group h-full">

                {/* Bar Container - flex-1 takes available vertical space above label */}
                <div className="w-full flex-1 flex items-end justify-center relative">
                  {/* Track/Background for visual guide */}
                  <div className="absolute inset-x-0 bottom-0 top-0 bg-slate-50 dark:bg-slate-700/20 rounded-t-lg mx-auto w-full max-w-[70%] -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  {/* The Bar */}
                  <div
                    className="w-full max-w-[70%] rounded-t-sm shadow-sm relative transition-all duration-1000 ease-out hover:brightness-110"
                    style={{
                      height: `${animatedHeight}%`,
                      backgroundColor: color,
                      opacity: 0.9,
                      transitionDelay: `${index * 100}ms`
                    }}
                  >
                    {/* Value Label - Always visible above bar */}
                    <div
                      className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-800/90 px-2 py-1 rounded shadow-sm border border-slate-100 dark:border-slate-700 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-20"
                      style={{
                        opacity: animationProgress > 0.5 ? 1 : 0,
                        transitionDelay: `${index * 100 + 300}ms`
                      }}
                    >
                      {options?.currency ? formatCurrency(bar.valeur) : bar.valeur.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* X-Axis Label */}
                <div className="mt-3 h-6 text-xs font-semibold text-slate-500 dark:text-slate-400 text-center w-full truncate px-1">
                  {bar.region || bar.label}
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
                fill={segment.couleur || (chartData.options?.couleurs && chartData.options.couleurs[index])}
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
                    backgroundColor: item.couleur || (chartData.options?.couleurs && chartData.options.couleurs[index]),
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
    const { donnees, options } = chartData;
    if (!donnees || donnees.length === 0) return null;

    // Detect numeric keys to use as areas
    const areaKeys = options?.keys || ['produits', 'services', 'maintenance'];

    const firstItem = donnees[0];
    const detectedKeys = Object.keys(firstItem).filter((k: string) =>
      typeof firstItem[k] === 'number' && k !== 'valeur' && k !== 'total' && k !== 'evolution'
    );

    const finalKeys = detectedKeys.length > 0 ? detectedKeys.slice(0, 3) : areaKeys;

    // Calculate max value across all areas to scale correctly
    const maxValue = Math.max(...donnees.map((d: any) =>
      Math.max(...finalKeys.map((k: string) => ((d[k] as number) || 0) / currentRate))
    )) || 1;

    const getX = (i: number) => donnees.length > 1 ? (i / (donnees.length - 1)) * 100 : 50;

    return (
      <div className="relative w-full h-64 bg-white dark:bg-gray-800 rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {finalKeys.map((key: string, kIdx: number) => (
            <path
              key={key}
              d={`M 0,100 ${donnees.map((d: any, i: number) =>
                `L ${getX(i)},${100 - (((d[key] as number || 0) / currentRate) / maxValue) * 100}`
              ).join(' ')} L 100,100 Z`}
              fill={`url(#gradient-${key})`}
              opacity={animationProgress * (0.8 - kIdx * 0.2)}
              className="transition-all duration-2000 ease-out"
              style={{ transitionDelay: `${kIdx * 200}ms` }}
            />
          ))}

          <defs>
            {finalKeys.map((key: string, kIdx: number) => (
              <linearGradient key={`grad-${key}`} id={`gradient-${key}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={options?.couleurs?.[kIdx] || (kIdx === 0 ? "#3b82f6" : kIdx === 1 ? "#10b981" : "#f59e0b")} stopOpacity="0.8" />
                <stop offset="100%" stopColor={options?.couleurs?.[kIdx] || (kIdx === 0 ? "#3b82f6" : kIdx === 1 ? "#10b981" : "#f59e0b")} stopOpacity="0.2" />
              </linearGradient>
            ))}
          </defs>
        </svg>
        {/* Légende horizontale */}
        <div className="absolute top-2 right-4 flex gap-4">
          {finalKeys.map((key: string, kIdx: number) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: options?.couleurs?.[kIdx] || (kIdx === 0 ? "#3b82f6" : kIdx === 1 ? "#10b981" : "#f59e0b") }}></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{key}</span>
            </div>
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 dark:text-gray-400 px-2 pointer-events-none">
          {donnees.map((point, index) => (
            <span key={index}>{point.label || point.mois}</span>
          ))}
        </div>
      </div>
    );
  };

  const renderScatterChart = () => {
    const { donnees } = chartData;
    if (!donnees || donnees.length === 0) return null;

    const maxPrice = Math.max(...donnees.map(d => (d.prix || 0) / currentRate)) || 100;
    const maxVolume = Math.max(...donnees.map(d => d.volume || 0)) || 100;

    return (
      <div className="relative w-full h-64 bg-white dark:bg-gray-800 rounded-lg p-4">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Axes */}
          <line x1="10" y1="90" x2="90" y2="90" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="10" y1="10" x2="10" y2="90" stroke="#e5e7eb" strokeWidth="1" />

          {/* Points */}
          {donnees.map((point, index) => {
            const x = 10 + (((point.prix || 0) / currentRate) / maxPrice) * 80;
            const y = 90 - ((point.volume || 0) / maxVolume) * 80;
            const size = 2 + ((point.marge || 0) / 50) * 3; // Taille basée sur la marge

            return (
              <circle
                key={index}
                cx={isNaN(x) ? 10 : x}
                cy={isNaN(y) ? 90 : y}
                r={size * animationProgress}
                fill={chartData.options?.couleurs ? chartData.options.couleurs[index % chartData.options.couleurs.length] : '#3b82f6'}
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
          Prix ({currentDevise === 'DZD' ? 'DA' : currentDevise})
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
      {renderChart()}
    </div>
  );
};

export default AnimatedChart;


