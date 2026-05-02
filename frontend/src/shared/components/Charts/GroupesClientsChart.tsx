import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement,
} from 'chart.js';
import { Pie, Bar, Line, Doughnut } from 'react-chartjs-2';
import { useApp } from '@core/context/AppContext';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement
);

interface GroupeClient {
  id: string;
  nom: string;
  description: string;
  type: 'secteur' | 'taille' | 'risque' | 'geographique';
  couleur: string;
  nombreClients: number;
  chiffreAffaires: number;
  soldeMoyen: number;
}

interface GroupesClientsChartProps {
  groupes: GroupeClient[];
}

const GroupesClientsChart: React.FC<GroupesClientsChartProps> = ({ groupes }) => {
  const { currentDevise } = useApp();
  // Données pour le graphique en secteurs - Répartition par type
  const pieData = {
    labels: groupes.map(g => g.nom),
    datasets: [{
      data: groupes.map(g => g.nombreClients),
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  // Données pour le graphique en barres - CA par groupe
  const barData = {
    labels: groupes.map(g => g.nom),
    datasets: [{
      label: `Chiffre d'Affaires (M ${currentDevise || 'DA'})`,
      data: groupes.map(g => g.chiffreAffaires / 1000000),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 2,
      borderRadius: 4
    }]
  };

  // Données pour le graphique linéaire - Évolution des soldes
  const lineData = {
    labels: groupes.map(g => g.nom),
    datasets: [{
      label: `Solde Moyen (k ${currentDevise || 'DA'})`,
      data: groupes.map(g => g.soldeMoyen / 1000),
      borderColor: 'rgba(16, 185, 129, 1)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  // Données pour le graphique en anneau - Répartition par type de groupe
  const doughnutData = {
    labels: ['Secteur', 'Taille', 'Risque', 'Géographique'],
    datasets: [{
      data: [
        groupes.filter(g => g.type === 'secteur').length,
        groupes.filter(g => g.type === 'taille').length,
        groupes.filter(g => g.type === 'risque').length,
        groupes.filter(g => g.type === 'geographique').length
      ],
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444'
      ],
      borderWidth: 3,
      borderColor: '#ffffff'
    }]
  };

  // Données pour le graphique en barres horizontales - Performance par groupe
  const horizontalBarData = {
    labels: groupes.map(g => g.nom),
    datasets: [{
      label: 'Score de Performance',
      data: groupes.map(g => {
        // Calcul d'un score de performance basé sur CA, solde et nombre de clients
        const scoreCA = (g.chiffreAffaires / 1000000) * 0.4;
        const scoreSolde = Math.max(0, g.soldeMoyen / 1000) * 0.3;
        const scoreClients = (g.nombreClients / 100) * 0.3;
        return Math.round((scoreCA + scoreSolde + scoreClients) * 10);
      }),
      backgroundColor: 'rgba(139, 92, 246, 0.8)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 2,
      borderRadius: 4
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  const horizontalBarOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Première ligne : 2 graphiques côte à côte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition des Clients par Groupe */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des Clients par Groupe</h3>
          <div className="h-80 flex items-center justify-center">
            <Pie data={pieData} options={chartOptions} />
          </div>
        </div>

        {/* Répartition par Type de Groupe */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Répartition par Type de Groupe</h3>
          <div className="h-80 flex items-center justify-center">
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Deuxième ligne : 2 graphiques côte à côte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chiffre d'Affaires par Groupe */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Chiffre d'Affaires par Groupe</h3>
          <div className="h-80">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* Score de Performance par Groupe */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Score de Performance par Groupe</h3>
          <div className="h-80">
            <Bar data={horizontalBarData} options={horizontalBarOptions} />
          </div>
        </div>
      </div>

      {/* Troisième ligne : Graphique linéaire en pleine largeur */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Évolution des Soldes Moyens par Groupe</h3>
        <div className="h-80">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {/* Démonstrations de regroupement */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Démonstrations de Regroupement</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Regroupement par Secteur */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900">Par Secteur</h4>
                <p className="text-sm text-blue-700">{groupes.filter(g => g.type === 'secteur').length} groupes</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">
                {groupes.filter(g => g.type === 'secteur').reduce((sum, g) => sum + g.nombreClients, 0)} clients
              </div>
            </div>
          </div>

          {/* Regroupement par Taille */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-green-900">Par Taille</h4>
                <p className="text-sm text-green-700">{groupes.filter(g => g.type === 'taille').length} groupes</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900">
                {groupes.filter(g => g.type === 'taille').reduce((sum, g) => sum + g.nombreClients, 0)} clients
              </div>
            </div>
          </div>

          {/* Regroupement par Risque */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-amber-500 rounded-lg">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-amber-900">Par Risque</h4>
                <p className="text-sm text-amber-700">{groupes.filter(g => g.type === 'risque').length} groupes</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-900">
                {groupes.filter(g => g.type === 'risque').reduce((sum, g) => sum + g.nombreClients, 0)} clients
              </div>
            </div>
          </div>

          {/* Regroupement Géographique */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-purple-900">Géographique</h4>
                <p className="text-sm text-purple-700">{groupes.filter(g => g.type === 'geographique').length} groupes</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">
                {groupes.filter(g => g.type === 'geographique').reduce((sum, g) => sum + g.nombreClients, 0)} clients
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupesClientsChart;
