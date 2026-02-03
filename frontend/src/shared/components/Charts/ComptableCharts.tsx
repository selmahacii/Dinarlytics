import React from 'react';
import {
  Line,
  Bar,
  Doughnut,
  Radar,
  PolarArea,
  Scatter,
  Bubble,
  Area
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  RadialLinearScale,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  RadialLinearScale,
  Filler
);

// Graphique d'évolution des indicateurs financiers
export const EvolutionIndicateursChart: React.FC = () => {
  const data = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Chiffre d\'Affaires (M DZD)',
        data: [2.1, 2.3, 2.8, 3.2, 3.5, 3.8, 4.1, 4.5, 4.2, 4.8, 5.2, 5.8],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: 'Résultat Net (M DZD)',
        data: [0.15, 0.18, 0.22, 0.28, 0.32, 0.35, 0.38, 0.42, 0.38, 0.45, 0.48, 0.52],
        borderColor: 'rgba(139, 92, 246, 1)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: 'Trésorerie (M DZD)',
        data: [0.12, 0.15, 0.18, 0.22, 0.25, 0.28, 0.32, 0.35, 0.32, 0.38, 0.42, 0.45],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Évolution des Indicateurs Financiers Clés',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        title: {
          display: true,
          text: 'Montants (M DZD)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as const
    }
  };

  return <Line data={data} options={options} />;
};

// Graphique de répartition des charges
export const RepartitionChargesChart: React.FC = () => {
  const data = {
    labels: [
      'Personnel',
      'Achats',
      'Charges Exploitation',
      'Amortissements',
      'Charges Financières',
      'Impôts et Taxes',
      'Autres'
    ],
    datasets: [{
      data: [35, 25, 15, 8, 5, 7, 5],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(51, 65, 85, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(6, 182, 212, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(156, 163, 175, 0.8)'
      ],
      borderColor: [
        'rgba(239, 68, 68, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(51, 65, 85, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(6, 182, 212, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(156, 163, 175, 1)'
      ],
      borderWidth: 2,
      hoverOffset: 4
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Répartition des Charges par Catégorie',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    }
  };

  return <Doughnut data={data} options={options} />;
};

// Graphique de comparaison trimestrielle
export const ComparaisonTrimestrielleChart: React.FC = () => {
  const data = {
    labels: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024'],
    datasets: [
      {
        label: 'Chiffre d\'Affaires',
        data: [1.8, 2.1, 2.3, 2.6, 2.9, 3.2],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Charges Totales',
        data: [1.2, 1.4, 1.5, 1.7, 1.9, 2.1],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
        borderRadius: 6
      },
      {
        label: 'Résultat Net',
        data: [0.6, 0.7, 0.8, 0.9, 1.0, 1.1],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2,
        borderRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Comparaison Trimestrielle des Performances',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        title: {
          display: true,
          text: 'Montants (M DZD)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return <Bar data={data} options={options} />;
};

// Graphique radar des ratios financiers
export const RatiosRadarChart: React.FC = () => {
  const data = {
    labels: [
      'Liquidité',
      'Solvabilité',
      'Rentabilité',
      'Efficacité',
      'Croissance',
      'Endettement'
    ],
    datasets: [
      {
        label: 'Performance Actuelle',
        data: [85, 72, 68, 78, 82, 65],
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(139, 92, 246, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      },
      {
        label: 'Objectifs 2024',
        data: [90, 80, 75, 85, 90, 70],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 3,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Analyse Radar des Ratios Financiers',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        pointLabels: {
          font: {
            size: 12
          }
        }
      }
    }
  };

  return <Radar data={data} options={options} />;
};

// Graphique de flux de trésorerie
export const FluxTresorerieChart: React.FC = () => {
  const data = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Encaissements',
        data: [180, 195, 220, 250, 280, 310, 340, 380, 350, 400, 430, 480],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2
      },
      {
        label: 'Décaissements',
        data: [150, 165, 180, 200, 220, 240, 260, 290, 270, 310, 330, 370],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2
      },
      {
        label: 'Solde de Trésorerie',
        data: [30, 30, 40, 50, 60, 70, 80, 90, 80, 90, 100, 110],
        type: 'line' as const,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Analyse des Flux de Trésorerie',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        title: {
          display: true,
          text: 'Montants (k DZD)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return <Bar data={data} options={options} />;
};

// Graphique de répartition géographique des revenus
export const RepartitionGeographiqueChart: React.FC = () => {
  const data = {
    labels: ['Alger', 'Oran', 'Constantine', 'Annaba', 'Tlemcen', 'Autres'],
    datasets: [{
      data: [40, 25, 15, 10, 6, 4],
      backgroundColor: [
        'rgba(51, 65, 85, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(6, 182, 212, 0.8)'
      ],
      borderColor: [
        'rgba(51, 65, 85, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(139, 92, 246, 1)',
        'rgba(6, 182, 212, 1)'
      ],
      borderWidth: 2,
      hoverOffset: 4
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Répartition Géographique des Revenus',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    }
  };

  return <PolarArea data={data} options={options} />;
};

// Graphique de prévisions vs réalisations
export const PrevisionsRealisationChart: React.FC = () => {
  const data = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Prévisions',
        data: [6.0, 7.5, 8.2, 9.8],
        borderColor: 'rgba(156, 163, 175, 1)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        borderDash: [5, 5]
      },
      {
        label: 'Réalisations',
        data: [6.2, 7.8, 8.9, 10.2],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Prévisions vs Réalisations',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        title: {
          display: true,
          text: 'Chiffre d\'Affaires (M DZD)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return <Line data={data} options={options} />;
};

// Graphique de corrélation des indicateurs
export const CorrelationIndicateursChart: React.FC = () => {
  const data = {
    datasets: [
      {
        label: 'Q1',
        data: [{
          x: 6.2,
          y: 0.52,
          r: 15
        }],
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)'
      },
      {
        label: 'Q2',
        data: [{
          x: 7.8,
          y: 0.65,
          r: 18
        }],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)'
      },
      {
        label: 'Q3',
        data: [{
          x: 8.9,
          y: 0.72,
          r: 20
        }],
        backgroundColor: 'rgba(245, 158, 11, 0.6)',
        borderColor: 'rgba(245, 158, 11, 1)'
      },
      {
        label: 'Q4',
        data: [{
          x: 10.2,
          y: 0.85,
          r: 22
        }],
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: 'rgba(139, 92, 246, 1)'
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Corrélation CA vs Marge Nette',
        font: {
          size: 16,
          weight: 'bold' as const
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Chiffre d\'Affaires (M DZD)'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Marge Nette (%)'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  };

  return <Bubble data={data} options={options} />;
};
