import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { mockDepensesCategories } from '../../data/mockData';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseChart: React.FC = () => {
  const data = {
    labels: mockDepensesCategories.map(d => d.categorie),
    datasets: [
      {
        label: 'Dépenses (DZD)',
        data: mockDepensesCategories.map(d => d.montant),
        backgroundColor: [
          'rgba(51, 65, 85, 0.8)', // slate-700
          'rgba(245, 158, 11, 0.8)', // amber-500
          'rgba(16, 185, 129, 0.8)', // emerald-500
          'rgba(139, 92, 246, 0.8)', // purple-500
          'rgba(6, 182, 212, 0.8)', // cyan-500
          'rgba(239, 68, 68, 0.8)', // red-500
        ],
        borderColor: [
          'rgba(51, 65, 85, 1)', // slate-700
          'rgba(245, 158, 11, 1)', // amber-500
          'rgba(16, 185, 129, 1)', // emerald-500
          'rgba(139, 92, 246, 1)', // purple-500
          'rgba(6, 182, 212, 1)', // cyan-500
          'rgba(239, 68, 68, 1)', // red-500
        ],
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
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
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return context.label + ': ' + context.parsed.toLocaleString('fr-FR') + ' DZD (' + percentage + '%)';
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 2000,
      easing: 'easeInOutQuart' as const,
    },
    interaction: {
      intersect: false,
    }
  };

  return (
    <div className="w-full h-full relative">
      <Doughnut data={data} options={options} />
      {/* Centre du graphique avec total */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-slate-800">
            {mockDepensesCategories.reduce((sum, d) => sum + d.montant, 0).toLocaleString('fr-FR')}
          </div>
          <div className="text-sm text-slate-600">DZD Total</div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseChart;
