import React, { useEffect, useRef } from 'react';
import { Chart, LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

interface LineChartProps {
  data: number[];
  labels: string[];
  borderColor: string;
  backgroundColor: string;
  title: string;
  yAxisLabel?: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, labels, borderColor, backgroundColor, title, yAxisLabel }) => {
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
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: title,
              data: data,
              borderColor: borderColor,
              backgroundColor: backgroundColor,
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 6,
              pointHoverRadius: 10,
              pointBackgroundColor: borderColor,
              pointBorderColor: '#ffffff',
              pointBorderWidth: 3,
              pointHoverBackgroundColor: borderColor,
              pointHoverBorderColor: '#ffffff',
              pointHoverBorderWidth: 4,
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
                  color: '#6B7280',
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
                  color: '#6B7280',
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
                  color: '#6B7280',
                  font: {
                    size: 12,
                    weight: '500' as const,
                  }
                },
                title: {
                  display: true,
                  text: 'Périodes',
                  color: '#6B7280',
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
  }, [data, labels, borderColor, backgroundColor, title, yAxisLabel]);

  return (
    <div className="w-full h-full">
      <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>
      <div className="relative h-64">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default LineChart;
