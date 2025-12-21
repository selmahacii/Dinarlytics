import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  ShoppingCartIcon, 
  CurrencyDollarIcon,
  SparklesIcon 
} from '@heroicons/react/24/outline';

const DashboardSelector: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Choisissez votre Dashboard
          </h1>
          <p className="text-xl text-slate-300">
            Sélectionnez l'interface qui correspond le mieux à votre activité
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Dashboard Standard */}
          <Link 
            to="/dashboard" 
            className="group p-8 bg-white rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="p-4 bg-gradient-to-br from-slate-600 to-slate-800 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform">
              <ChartBarIcon className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Dashboard Standard</h2>
            <p className="text-slate-600 mb-6">
              Interface complète avec toutes les fonctionnalités de gestion d'entreprise
            </p>
            <div className="inline-flex items-center text-slate-600 font-medium">
              Accéder au tableau de bord
              <SparklesIcon className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Dashboard Boutique */}
          <Link 
            to="/dashboard/boutique" 
            className="group p-8 bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform">
              <ShoppingCartIcon className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">Dashboard Boutique</h2>
            <p className="text-emerald-700 mb-6">
              Interface optimisée spécialement pour les boutiques et commerces de détail
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium group-hover:bg-emerald-600 transition-colors">
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              Nouvelle Interface Boutique
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-400 text-sm">
            Vous pourrez changer de dashboard à tout moment dans les paramètres
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSelector;