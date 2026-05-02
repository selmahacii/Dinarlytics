import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, 
  ArcElement, BarElement
} from 'chart.js';
import { 
  Line, Bar, Doughnut
} from 'react-chartjs-2';
import {
  BanknotesIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useApp } from '@core/context/AppContext';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend,
  ArcElement, BarElement
);

interface FinancialDashboardProps {
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ 
  isCollapsible = false, 
  defaultCollapsed = false 
}) => {
  const { formatCurrency, currentDevise, setCurrentDevise } = useApp();
  const [periode, setPeriode] = useState('12mois');
  const devise = currentDevise;
  const setDevise = (d: any) => setCurrentDevise(d);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [widgets, setWidgets] = useState({
    equilibre: true,
    evaluation: true,
    scenarios: true,
    alertes: true,
    ratios: true,
    simulations: true,
    rentabilite: true,
    insights: true
  });
  const [language, setLanguage] = useState<'fr' | 'ar'>('fr');
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);

  // État des alertes intelligentes améliorées
  const [alertes, setAlertes] = useState([
    {
      id: 'ventes',
      nom: 'Seuil de Ventes',
      description: 'Alerte si les ventes mensuelles dépassent 2M DZD',
      statut: 'Déclenchée',
      seuil: 2000000,
      valeurActuelle: 2450000,
      unite: 'DZD',
      frequence: 'quotidienne',
      derniereAlerte: '2024-01-15 14:30',
      destinataires: ['admin@entreprise.dz', 'comptable@entreprise.dz'],
      active: true,
      type: 'financier',
      priorite: 'haute',
      seuilMin: 1800000,
      seuilMax: 2500000,
      tendance: '+12.5%',
      historique: [
        { date: '2024-01-15', valeur: 2450000, statut: 'Déclenchée' },
        { date: '2024-01-14', valeur: 2200000, statut: 'Déclenchée' },
        { date: '2024-01-13', valeur: 1950000, statut: 'Surveillance' }
      ]
    },
    {
      id: 'liquidite',
      nom: 'Ratio de Liquidité',
      description: 'Alerte si le ratio de liquidité descend sous 1.5',
      statut: 'Surveillance',
      seuil: 1.5,
      valeurActuelle: 1.8,
      unite: '',
      frequence: 'hebdomadaire',
      derniereAlerte: null,
      destinataires: ['admin@entreprise.dz'],
      active: true,
      type: 'ratio',
      priorite: 'moyenne',
      seuilMin: 1.2,
      seuilMax: 2.5,
      tendance: '+5.2%',
      historique: [
        { date: '2024-01-15', valeur: 1.8, statut: 'Surveillance' },
        { date: '2024-01-08', valeur: 1.75, statut: 'Surveillance' },
        { date: '2024-01-01', valeur: 1.71, statut: 'Surveillance' }
      ]
    },
    {
      id: 'stock',
      nom: 'Rupture de Stock',
      description: 'Alerte si un article atteint le seuil de réapprovisionnement',
      statut: 'Déclenchée',
      seuil: 10,
      valeurActuelle: 5,
      unite: 'unités',
      frequence: 'temps_reel',
      derniereAlerte: '2024-01-15 09:15',
      destinataires: ['stock@entreprise.dz', 'achats@entreprise.dz'],
      active: true,
      type: 'operationnel',
      priorite: 'critique',
      seuilMin: 5,
      seuilMax: 50,
      tendance: '-20%',
      historique: [
        { date: '2024-01-15', valeur: 5, statut: 'Déclenchée' },
        { date: '2024-01-14', valeur: 8, statut: 'Surveillance' },
        { date: '2024-01-13', valeur: 12, statut: 'Normal' }
      ]
    },
    {
      id: 'factures',
      nom: 'Factures en Retard',
      description: 'Alerte si des factures clients sont en retard de plus de 30 jours',
      statut: 'Déclenchée',
      seuil: 30,
      valeurActuelle: 45,
      unite: 'jours',
      frequence: 'quotidienne',
      derniereAlerte: '2024-01-15 08:00',
      destinataires: ['comptable@entreprise.dz', 'commercial@entreprise.dz'],
      active: true,
      type: 'comptable',
      priorite: 'haute',
      seuilMin: 15,
      seuilMax: 60,
      tendance: '+15%',
      historique: [
        { date: '2024-01-15', valeur: 45, statut: 'Déclenchée' },
        { date: '2024-01-14', valeur: 42, statut: 'Déclenchée' },
        { date: '2024-01-13', valeur: 38, statut: 'Déclenchée' }
      ]
    },
    {
      id: 'roi',
      nom: 'ROI Dégradé',
      description: 'Alerte si le ROI descend sous 15%',
      statut: 'Normal',
      seuil: 15,
      valeurActuelle: 18.5,
      unite: '%',
      frequence: 'mensuelle',
      derniereAlerte: null,
      destinataires: ['admin@entreprise.dz', 'finance@entreprise.dz'],
      active: true,
      type: 'performance',
      priorite: 'moyenne',
      seuilMin: 12,
      seuilMax: 25,
      tendance: '+2.1%',
      historique: [
        { date: '2024-01-15', valeur: 18.5, statut: 'Normal' },
        { date: '2024-01-08', valeur: 18.2, statut: 'Normal' },
        { date: '2024-01-01', valeur: 17.8, statut: 'Normal' }
      ]
    },
    {
      id: 'cashflow',
      nom: 'Cash Flow Négatif',
      description: 'Alerte si le cash flow devient négatif',
      statut: 'Surveillance',
      seuil: 0,
      valeurActuelle: 125000,
      unite: 'DZD',
      frequence: 'quotidienne',
      derniereAlerte: null,
      destinataires: ['admin@entreprise.dz', 'comptable@entreprise.dz'],
      active: true,
      type: 'financier',
      priorite: 'critique',
      seuilMin: -50000,
      seuilMax: 500000,
      tendance: '+8.3%',
      historique: [
        { date: '2024-01-15', valeur: 125000, statut: 'Surveillance' },
        { date: '2024-01-14', valeur: 115000, statut: 'Surveillance' },
        { date: '2024-01-13', valeur: 105000, statut: 'Surveillance' }
      ]
    }
  ]);

  // Fonctions de gestion des alertes améliorées
  const declencherAlerte = (alerteId: string) => {
    setAlertes(prev => prev.map(alerte => {
      if (alerte.id === alerteId) {
        const maintenant = new Date().toLocaleString('fr-FR');
        const nouvelHistorique = [
          { date: maintenant, valeur: alerte.valeurActuelle, statut: 'Déclenchée' },
          ...alerte.historique.slice(0, 2)
        ];
        return {
          ...alerte,
          statut: 'Déclenchée',
          derniereAlerte: maintenant,
          historique: nouvelHistorique
        };
      }
      return alerte;
    }));
  };

  const testerAlerte = (alerteId: string) => {
    const alerte = alertes.find(a => a.id === alerteId);
    if (alerte) {
      const message = `
🧪 TEST D'ALERTE INTELLIGENTE

 ${alerte.nom}
 ${alerte.description}

Valeurs Actuelles:
• Valeur: ${alerte.valeurActuelle} ${alerte.unite}
• Seuil: ${alerte.seuil} ${alerte.unite}
• Statut: ${alerte.statut}
• Priorité: ${alerte.priorite}
• Tendance: ${alerte.tendance}

⚙️ Configuration:
• Type: ${alerte.type}
• Fréquence: ${alerte.frequence}
• Destinataires: ${alerte.destinataires.join(', ')}

📅 Historique récent disponible
      `;
      alert(message);
    }
  };

  const modifierAlerte = (alerteId: string) => {
    const alerte = alertes.find(a => a.id === alerteId);
    if (alerte) {
      const nouveauSeuil = prompt(`Modifier le seuil pour "${alerte.nom}" (${alerte.seuilMin} - ${alerte.seuilMax}):`, alerte.seuil.toString());
      if (nouveauSeuil && !isNaN(Number(nouveauSeuil))) {
        const seuilNum = Number(nouveauSeuil);
        if (seuilNum >= alerte.seuilMin && seuilNum <= alerte.seuilMax) {
          setAlertes(prev => prev.map(a => 
            a.id === alerteId 
              ? { ...a, seuil: seuilNum }
              : a
          ));
        } else {
          alert(`Le seuil doit être entre ${alerte.seuilMin} et ${alerte.seuilMax}`);
        }
      }
    }
  };

  const activerDesactiverAlerte = (alerteId: string) => {
    setAlertes(prev => prev.map(alerte => 
      alerte.id === alerteId 
        ? { ...alerte, active: !alerte.active }
        : alerte
    ));
  };

  const analyserTendance = (alerteId: string) => {
    const alerte = alertes.find(a => a.id === alerteId);
    if (alerte && alerte.historique.length >= 2) {
      const recent = alerte.historique[0].valeur;
      const precedent = alerte.historique[1].valeur;
      const evolution = ((recent - precedent) / precedent * 100).toFixed(1);
      alert(` Analyse de tendance pour ${alerte.nom}:\n\nÉvolution: ${evolution}%\nValeur récente: ${recent}\nValeur précédente: ${precedent}\n\n${parseFloat(evolution) > 0 ? '📈 Tendance positive' : '📉 Tendance négative'}`);
    }
  };

  const creerNouvelleAlerte = () => {
    const nom = prompt('Nom de la nouvelle alerte:');
    const description = prompt('Description:');
    const seuil = prompt('Seuil d\'alerte:');
    const unite = prompt('Unité (DZD, %, jours, etc.):');
    
    if (nom && description && seuil && unite) {
      const nouvelleAlerte = {
        id: Date.now().toString(),
        nom,
        description,
        statut: 'Surveillance',
        seuil: Number(seuil),
        valeurActuelle: 0,
        unite,
        frequence: 'quotidienne',
        derniereAlerte: null,
        destinataires: ['admin@entreprise.dz'],
        active: true,
        type: 'personnalise',
        priorite: 'moyenne',
        seuilMin: Number(seuil) * 0.5,
        seuilMax: Number(seuil) * 2,
        tendance: '0%',
        historique: []
      };
      
      setAlertes(prev => [...prev, nouvelleAlerte]);
    }
  };

  const obtenirStatistiquesAlertes = () => {
    const total = alertes.length;
    const actives = alertes.filter((a: any) => a.active).length;
    const declenchees = alertes.filter((a: any) => a.statut === 'Déclenchée').length;
    const critiques = alertes.filter((a: any) => a.priorite === 'critique').length;
    
    const repartitionParType = alertes.reduce((acc: Record<string, number>, a: any) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {});
    
    const repartitionText = Object.entries(repartitionParType)
      .map(([type, count]) => `• ${type}: ${count}`)
      .join('\n');
    
    alert(`📊 STATISTIQUES DES ALERTES\n\n📈 Total: ${total} alertes\n✅ Actives: ${actives}\n🚨 Déclenchées: ${declenchees}\n Critiques: ${critiques}\n\n Répartition par type:\n${repartitionText}`);
  };

  // Fonctions de gestion des widgets
  const toggleWidget = (widgetId: keyof typeof widgets) => {
    setWidgets(prev => ({
      ...prev,
      [widgetId]: !prev[widgetId]
    }));
  };

  const toggleAllWidgets = () => {
    const allCollapsed = Object.values(widgets).every(w => !w);
    const newState = allCollapsed;
    setWidgets({
      equilibre: newState,
      evaluation: newState,
      scenarios: newState,
      alertes: newState,
      ratios: newState,
      simulations: newState,
      rentabilite: newState,
      insights: newState
    });
  };

  // Fonctions utilitaires
  const getDeviseSymbol = (devise: string) => {
    const symbols: Record<string, string> = {
      'DZD': 'دج',
      'EUR': '€',
      'USD': '$'
    };
    return symbols[devise] || devise;
  };

  const getDeviseRate = (devise: string) => {
    const rates: Record<string, number> = {
      'DZD': 1,
      'EUR': 150,
      'USD': 140
    };
    return rates[devise] || 1;
  };

  const formatCurrencyLocal = (amount: number, d: string) => {
    return formatCurrency(amount);
  };

  const getPeriodData = (periode: string) => {
    const periodData: Record<string, { label: string; dataMultiplier: number; months: number }> = {
      '30jours': { label: '30 jours', dataMultiplier: 0.3, months: 1 },
      '3mois': { label: '3 mois', dataMultiplier: 0.7, months: 3 },
      '6mois': { label: '6 mois', dataMultiplier: 0.9, months: 6 },
      '12mois': { label: '12 mois', dataMultiplier: 1.0, months: 12 }
    };
    return periodData[periode] || periodData['12mois'];
  };

  const periodData = getPeriodData(periode);
  const deviseSymbol = getDeviseSymbol(devise);

  // Traductions
  const t = {
    equilibre: language === 'ar' ? 'التوازن المالي' : 'Équilibre Financier',
    evaluation: language === 'ar' ? 'التقييم ورأس المال' : 'Évaluation & Capital',
    scenarios: language === 'ar' ? 'سيناريوهات المخاطر' : 'Scénarios de Risque',
    alertes: language === 'ar' ? 'الإنذارات الذكية' : 'Alertes Intelligentes',
    ratios: language === 'ar' ? 'النسب المالية' : 'Ratios Financiers',
    simulations: language === 'ar' ? 'المحاكاة' : 'Simulations',
    rentabilite: language === 'ar' ? 'الربحية' : 'Rentabilité',
    insights: language === 'ar' ? 'الرؤى الذكية' : 'Insights IA'
  };

  return (
    <div className="bg-slate-50 min-h-screen p-4">
      {/* En-tête avec contrôles */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Dashboard Financier
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Analyse temps réel • {deviseSymbol} • {periodData.label}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Sélecteur de période */}
            <select
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Sélectionner la période"
            >
              <option value="30jours">30 jours</option>
              <option value="3mois">3 mois</option>
              <option value="6mois">6 mois</option>
              <option value="12mois">12 mois</option>
            </select>

            {/* Sélecteur de devise */}
            <select
              value={devise}
              onChange={(e) => setDevise(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Sélectionner la devise"
            >
              <option value="DZD">DZD (دج)</option>
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
            </select>

            {/* Bouton langue */}
            <button
              onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {language === 'fr' ? 'العربية' : 'Français'}
            </button>

            {/* Bouton toggle */}
            <button
              onClick={toggleAllWidgets}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Afficher Tout
            </button>
          </div>
        </div>
      </div>

      {/* WIDGET 4: Alertes Intelligentes */}
      {!isCollapsed && widgets.alertes && (
        <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <BellIcon className="h-4 w-4 text-slate-700" />
              🚨 Alertes Intelligentes
            </h3>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded border border-slate-200">
                Système Actif
              </span>
              <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded border border-slate-200">
                {alertes.filter((a: any) => a.active).length} Alertes Actives
              </span>
              <button
                onClick={() => toggleWidget('alertes')}
                className="p-1 text-slate-400 hover:text-slate-600"
                aria-label="Réduire les alertes"
              >
                <ChevronUpIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Statistiques des Alertes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium">Total Alertes</p>
                  <p className="text-xl font-bold text-blue-900">{alertes.length}</p>
                </div>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📊</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 font-medium">Actives</p>
                  <p className="text-xl font-bold text-green-900">{alertes.filter((a: any) => a.active).length}</p>
                </div>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✅</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-600 font-medium">Déclenchées</p>
                  <p className="text-xl font-bold text-red-900">{alertes.filter((a: any) => a.statut === 'Déclenchée').length}</p>
                </div>
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🚨</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-600 font-medium">Critiques</p>
                  <p className="text-xl font-bold text-orange-900">{alertes.filter((a: any) => a.priorite === 'critique').length}</p>
                </div>
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">⚠️</span>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des Alertes Améliorées */}
          <div className="space-y-4">
            {alertes.map((alerte: any) => (
              <div key={alerte.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-sm font-semibold text-slate-900">{alerte.nom}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        alerte.type === 'financier' ? 'bg-blue-100 text-blue-700' :
                        alerte.type === 'ratio' ? 'bg-green-100 text-green-700' :
                        alerte.type === 'operationnel' ? 'bg-orange-100 text-orange-700' :
                        alerte.type === 'comptable' ? 'bg-purple-100 text-purple-700' :
                        alerte.type === 'performance' ? 'bg-indigo-100 text-indigo-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {alerte.type}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        alerte.priorite === 'critique' ? 'bg-red-100 text-red-700' :
                        alerte.priorite === 'haute' ? 'bg-orange-100 text-orange-700' :
                        alerte.priorite === 'moyenne' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {alerte.priorite}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{alerte.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      alerte.statut === 'Déclenchée' 
                        ? 'bg-red-100 text-red-700 border border-red-200' 
                        : alerte.statut === 'Surveillance'
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                        : 'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                      {alerte.statut}
                    </span>
                    <button
                      onClick={() => activerDesactiverAlerte(alerte.id)}
                      className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                        alerte.active 
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' 
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {alerte.active ? '✓ Actif' : '○ Inactif'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Seuil</p>
                    <p className="text-sm font-bold text-slate-900">
                      {alerte.unite === 'DZD' || alerte.unite === 'DA' ? formatCurrency(alerte.seuil) : `${alerte.seuil} ${alerte.unite}`}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Valeur actuelle</p>
                    <p className="text-sm font-bold text-slate-900">
                      {alerte.unite === 'DZD' || alerte.unite === 'DA' ? formatCurrency(alerte.valeurActuelle) : `${alerte.valeurActuelle} ${alerte.unite}`}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Tendance</p>
                    <p className={`text-sm font-bold ${
                      alerte.tendance.startsWith('+') ? 'text-green-600' : 
                      alerte.tendance.startsWith('-') ? 'text-red-600' : 'text-slate-900'
                    }`}>
                      {alerte.tendance}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Fréquence</p>
                    <p className="text-sm font-bold text-slate-900">{alerte.frequence}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-600 mb-1">Dernière alerte</p>
                    <p className="text-sm font-bold text-slate-900">
                      {alerte.derniereAlerte ? alerte.derniereAlerte.split(' ')[0] : 'Jamais'}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-slate-600 mb-2">Destinataires:</p>
                  <div className="flex flex-wrap gap-1">
                    {alerte.destinataires.map((dest: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                        {dest}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => modifierAlerte(alerte.id)}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <span>⚙️</span> Modifier
                  </button>
                  <button
                    onClick={() => testerAlerte(alerte.id)}
                    className="px-3 py-1 bg-slate-600 text-white text-xs rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1"
                  >
                    <span>🧪</span> Test
                  </button>
                  <button
                    onClick={() => analyserTendance(alerte.id)}
                    className="px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1"
                  >
                    <span>📈</span> Tendance
                  </button>
                  <button
                    onClick={() => declencherAlerte(alerte.id)}
                    className="px-3 py-1 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-1"
                  >
                    <span>🚨</span> Déclencher
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Actions Rapides Améliorées */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={creerNouvelleAlerte}
              className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <span className="text-lg">➕</span>
              <div className="text-left">
                <div className="font-semibold">Nouvelle Alerte</div>
                <div className="text-xs opacity-90">Créer une alerte personnalisée</div>
              </div>
            </button>
            
            <button
              onClick={obtenirStatistiquesAlertes}
              className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <span className="text-lg">📊</span>
              <div className="text-left">
                <div className="font-semibold">Statistiques</div>
                <div className="text-xs opacity-90">Voir les statistiques détaillées</div>
              </div>
            </button>
            
            <button
              onClick={() => setShowAlertsModal(true)}
              className="px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm font-medium rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <span className="text-lg">🔧</span>
              <div className="text-left">
                <div className="font-semibold">Configuration</div>
                <div className="text-xs opacity-90">Paramètres avancés</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialDashboard;
