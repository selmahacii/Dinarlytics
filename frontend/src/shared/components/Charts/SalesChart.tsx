import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useApp } from '@core/context/AppContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const SalesChart: React.FC = () => {
  const { formatCurrency, currentDevise, companyData } = useApp();
  
  const baseRevenue = companyData?.revenueMonth || 3500000;
  const salesData = [
    { mois: 'Jan', montant: Math.round(baseRevenue * 0.85) },
    { mois: 'Fév', montant: Math.round(baseRevenue * 0.90) },
    { mois: 'Mar', montant: Math.round(baseRevenue * 0.95) },
    { mois: 'Avr', montant: Math.round(baseRevenue * 1.05) },
    { mois: 'Mai', montant: Math.round(baseRevenue * 1.10) },
    { mois: 'Juin', montant: baseRevenue }
  ];

  const data = {
    labels: salesData.map(v => v.mois),
    datasets: [
      {
        label: `Ventes (${currentDevise || 'DA'})`,
        data: salesData.map(v => v.montant),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(6, 182, 212, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(6, 182, 212, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
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
            return 'Ventes: ' + formatCurrency(context.parsed.y);
          }
        }
      }
    },
    scales: {
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
        }
      },
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
            return formatCurrency(value);
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
  };

  return (
    <div className="w-full h-full">
      <Bar data={data} options={options} />
    </div>
  );
};

export default SalesChart;
