import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBagIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const TestBoutique: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/login')}
              className="p-2 bg-white rounded-lg border hover:bg-slate-50"
            >
              <ArrowLeftIcon className="h-5 w-5 text-slate-600" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900">Test Dashboard Boutique</h1>
          </div>
          <div className="p-2 bg-emerald-100 rounded-lg">
            <ShoppingBagIcon className="h-6 w-6 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-8">
          <h2 className="text-xl font-bold mb-4">✅ Dashboard Boutique Créé avec Succès</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <h3 className="font-semibold text-emerald-900 mb-2">🎯 Fonctionnalités Implémentées</h3>
              <ul className="text-sm text-emerald-800 space-y-1">
                <li>• Dashboard adaptatif selon le type d'utilisateur</li>
                <li>• Interface spécialisée pour Boutique El Baraka</li>
                <li>• Design responsif sans gradients</li>
                <li>• KPIs pertinents pour une boutique</li>
                <li>• Métriques avancées (panier moyen, clients du jour, etc.)</li>
                <li>• Alertes contextualisées</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">🔄 Logique de Redirection</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Boutique El Baraka</strong> → <code>/dashboard/boutique</code></li>
                <li>• <strong>Autres entreprises</strong> → <code>/dashboard</code></li>
                <li>• Détection automatique via <code>companyType</code> ou nom d'entreprise</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">📱 Responsive Design</h3>
              <ul className="text-sm text-slate-800 space-y-1">
                <li>• <strong>Mobile</strong>: Layout en colonne unique, espacement réduit</li>
                <li>• <strong>Tablet</strong>: Grille 2 colonnes pour les KPIs</li>
                <li>• <strong>Desktop</strong>: Grille complète 4 colonnes</li>
                <li>• <strong>Textes</strong>: Tailles adaptatives (text-sm sm:text-base lg:text-lg)</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium"
            >
              Tester la Connexion
            </button>
            <button 
              onClick={() => navigate('/dashboard/boutique')}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
            >
              Voir Dashboard Boutique
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-slate-500 hover:bg-slate-600 text-white rounded-lg font-medium"
            >
              Dashboard Standard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestBoutique;