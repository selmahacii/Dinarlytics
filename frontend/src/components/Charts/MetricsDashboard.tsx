import React from 'react';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  UserGroupIcon, 
  BanknotesIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface MetricsDashboardProps {
  groupes: any[];
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ groupes }) => {
  // Calculs des métriques
  const totalClients = groupes.reduce((sum, g) => sum + g.nombreClients, 0);
  const totalCA = groupes.reduce((sum, g) => sum + g.chiffreAffaires, 0);
  const soldeMoyenGlobal = groupes.reduce((sum, g) => sum + g.soldeMoyen, 0) / groupes.length;
  
  // Groupe avec le plus de clients
  const groupePlusPopulaire = groupes.reduce((max, g) => 
    g.nombreClients > max.nombreClients ? g : max
  );
  
  // Groupe avec le meilleur CA
  const groupeMeilleurCA = groupes.reduce((max, g) => 
    g.chiffreAffaires > max.chiffreAffaires ? g : max
  );
  
  // Groupe avec le meilleur solde moyen
  const groupeMeilleurSolde = groupes.reduce((max, g) => 
    g.soldeMoyen > max.soldeMoyen ? g : max
  );

  // Calcul du taux de croissance simulé (pour la démo)
  const tauxCroissance = 12.5; // %
  const evolutionCA = 8.3; // %

  const metrics = [
    {
      title: 'Total Clients',
      value: totalClients.toLocaleString('fr-FR'),
      change: '+15%',
      changeType: 'positive',
      icon: UserGroupIcon,
      color: 'blue',
      description: 'Nombre total de clients actifs'
    },
    {
      title: 'Chiffre d\'Affaires Total',
      value: (totalCA / 1000000).toFixed(1) + 'M DZD',
      change: `+${evolutionCA}%`,
      changeType: 'positive',
      icon: BanknotesIcon,
      color: 'green',
      description: 'CA cumulé de tous les groupes'
    },
    {
      title: 'Solde Moyen Global',
      value: (soldeMoyenGlobal / 1000).toFixed(0) + 'k DZD',
      change: soldeMoyenGlobal >= 0 ? '+5.2%' : '-2.1%',
      changeType: soldeMoyenGlobal >= 0 ? 'positive' : 'negative',
      icon: ArrowTrendingUpIcon,
      color: soldeMoyenGlobal >= 0 ? 'emerald' : 'red',
      description: 'Solde moyen de tous les groupes'
    },
    {
      title: 'Taux de Croissance',
      value: tauxCroissance + '%',
      change: '+2.3%',
      changeType: 'positive',
      icon: ArrowTrendingUpIcon,
      color: 'purple',
      description: 'Croissance mensuelle des clients'
    }
  ];

  const getColorClasses = (color: string) => {
    const classes = {
      blue: 'bg-slate-50 text-slate-600 border-slate-200',
      green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      amber: 'bg-amber-50 text-amber-600 border-amber-200'
    };
    return classes[color as keyof typeof classes] || classes.blue;
  };

  return (
    <div className="space-y-6">
      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{metric.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{metric.description}</p>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(metric.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
                             <div className="mt-4 flex items-center">
                 {metric.changeType === 'positive' ? (
                   <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
                 ) : (
                   <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                 )}
                <span className={`text-sm font-medium ${
                  metric.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </span>
                <span className="text-sm text-slate-500 ml-1">vs mois dernier</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicateurs de performance par groupe */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">
          Indicateurs de Performance par Groupe
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Groupe le plus populaire */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-slate-600 rounded-lg">
                <UserGroupIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800">Groupe le Plus Populaire</h4>
                <p className="text-sm text-slate-600">{groupePlusPopulaire.nom}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-800">
                {groupePlusPopulaire.nombreClients} clients
              </div>
              <div className="text-sm text-slate-600">
                {((groupePlusPopulaire.nombreClients / totalClients) * 100).toFixed(1)}% du total
              </div>
            </div>
          </div>

          {/* Groupe avec le meilleur CA */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <BanknotesIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-emerald-800">Meilleur CA</h4>
                <p className="text-sm text-emerald-600">{groupeMeilleurCA.nom}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-800">
                {(groupeMeilleurCA.chiffreAffaires / 1000000).toFixed(1)}M DZD
              </div>
              <div className="text-sm text-emerald-600">
                {((groupeMeilleurCA.chiffreAffaires / totalCA) * 100).toFixed(1)}% du total
              </div>
            </div>
          </div>

          {/* Groupe avec le meilleur solde */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-emerald-800">Meilleur Solde</h4>
                <p className="text-sm text-emerald-600">{groupeMeilleurSolde.nom}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-800">
                {(groupeMeilleurSolde.soldeMoyen / 1000).toFixed(0)}k DZD
              </div>
              <div className="text-sm text-emerald-600">
                Solde moyen positif
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes et recommandations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Alertes et Recommandations
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">Groupe à Risque Élevé</h4>
              <p className="text-sm text-amber-700 mt-1">
                Le groupe "Clients à Risque Élevé" présente un solde moyen négatif de -35k DZD. 
                Recommandation : Mettre en place un plan de recouvrement et un suivi renforcé.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <CheckCircleIcon className="h-5 w-5 text-emerald-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-emerald-900">Performance Excellente</h4>
              <p className="text-sm text-emerald-700 mt-1">
                Le groupe "Grandes Entreprises" génère le plus de chiffre d'affaires avec 8.5M DZD. 
                Opportunité : Développer ce segment et proposer des services premium.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <ClockIcon className="h-5 w-5 text-slate-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-slate-800">Action Requise</h4>
              <p className="text-sm text-slate-600 mt-1">
                Le groupe "Startups Tech" présente un potentiel de croissance élevé mais des soldes moyens faibles. 
                Recommandation : Accompagnement personnalisé et conditions de paiement adaptées.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
