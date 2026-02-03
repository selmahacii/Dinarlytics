import React, { useEffect, useRef } from 'react';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface BarChartProps {
  data: number[];
  labels: string[];
  backgroundColor: string;
  title: string;
  yAxisLabel?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, labels, backgroundColor, title, yAxisLabel }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // Détruire le graphique existant s'il y en a un
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: title,
              data: data,
              backgroundColor: [
                'rgba(51, 65, 85, 0.8)', // slate-700
                'rgba(16, 185, 129, 0.8)', // emerald-500
                'rgba(139, 92, 246, 0.8)', // purple-500
                'rgba(245, 158, 11, 0.8)', // amber-500
                'rgba(239, 68, 68, 0.8)', // red-500
                'rgba(6, 182, 212, 0.8)', // cyan-500
              ],
              borderColor: [
                'rgba(51, 65, 85, 1)', // slate-700
                'rgba(16, 185, 129, 1)', // emerald-500
                'rgba(139, 92, 246, 1)', // purple-500
                'rgba(245, 158, 11, 1)', // amber-500
                'rgba(239, 68, 68, 1)', // red-500
                'rgba(6, 182, 212, 1)', // cyan-500
              ],
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)',
                  drawBorder: false,
                },
                ticks: {
                  color: '#64748B', // slate-500
                  font: {
                    size: 12,
                    weight: '500' as const,
                  },
                  callback: function(value: any) {
                    return value.toLocaleString('fr-FR');
                  }
                },
                title: {
                  display: !!yAxisLabel,
                  text: yAxisLabel,
                  color: '#64748B', // slate-500
                  font: {
                    size: 12,
                    weight: '600' as const,
                  }
                }
              },
              x: {
                grid: {
                  display: false,
                },
                ticks: {
                  color: '#64748B', // slate-500
                  font: {
                    size: 12,
                    weight: '500' as const,
                  }
                },
                title: {
                  display: true,
                  text: 'Périodes',
                  color: '#64748B', // slate-500
                  font: {
                    size: 12,
                    weight: '600' as const,
                  }
                }
              }
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                  label: function(context: any) {
                    return `${context.dataset.label}: ${context.parsed.y.toLocaleString('fr-FR')}`;
                  }
                }
              }
            },
            animation: {
              duration: 2000,
              easing: 'easeInOutQuart' as const,
            },
            interaction: {
              intersect: false,
              mode: 'index' as const,
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, labels, backgroundColor, title, yAxisLabel]);

  return (
    <div className="w-full h-full">
      <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>
      <div className="relative h-64">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default BarChart;
