import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import BaseWidget from './BaseWidget';
import { ChartWidgetProps } from '../../types/widgets';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartWidget: React.FC<ChartWidgetProps> = ({ data, ...props }) => {
  const { type, data: chartData, options: customOptions, title, subtitle } = data;

  const defaultOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        intersect: false,
        mode: 'index' as const
      }
    },
    scales: type !== 'doughnut' && type !== 'pie' ? {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif'
          },
          color: '#64748b'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        },
        ticks: {
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif'
          },
          color: '#64748b'
        }
      }
    } : {},
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2
      },
      line: {
        tension: 0.4,
        borderWidth: 3
      },
      bar: {
        borderRadius: 4,
        borderSkipped: false
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  }), [type]);

  const mergedOptions = useMemo(() => ({
    ...defaultOptions,
    ...customOptions
  }), [defaultOptions, customOptions]);

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      options: mergedOptions
    };

    switch (type) {
      case 'line':
        return <Line {...commonProps} />;
      case 'bar':
        return <Bar {...commonProps} />;
      case 'doughnut':
      case 'pie':
        return <Doughnut {...commonProps} />;
      default:
        return <Line {...commonProps} />;
    }
  };

  const getChartIcon = () => {
    switch (type) {
      case 'line':
        return <ChartBarIcon className="h-5 w-5" />;
      case 'bar':
        return <ChartBarIcon className="h-5 w-5" />;
      case 'doughnut':
      case 'pie':
        return <ChartBarIcon className="h-5 w-5" />;
      default:
        return <ChartBarIcon className="h-5 w-5" />;
    }
  };

  const getChartTitle = () => {
    if (title) return title;
    
    switch (type) {
      case 'line':
        return 'Graphique en Courbes';
      case 'bar':
        return 'Graphique en Barres';
      case 'doughnut':
        return 'Graphique Circulaire';
      case 'pie':
        return 'Graphique Secteurs';
      default:
        return 'Graphique';
    }
  };

  return (
    <BaseWidget {...props}>
      <div className="p-6 h-full flex flex-col">
        {/* En-tête du graphique */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              {getChartIcon()}
            </div>
            <div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {getChartTitle()}
              </h4>
              {subtitle && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Zone du graphique */}
        <div className="flex-1 relative min-h-0">
          <div className="absolute inset-0">
            {renderChart()}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Données en temps réel</span>
              </span>
              <span>Dernière MAJ: {new Date().toLocaleTimeString('fr-FR')}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                title="Zoom"
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
              </button>
              <button
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                title="Plein écran"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
              <button
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                title="Exporter"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};

export default ChartWidget;

