import React, { useEffect, useState } from 'react';
import {
  DocumentChartBarIcon,
  FunnelIcon,
  TableCellsIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  EyeIcon,
  CalendarIcon,
  CogIcon,
  PlusCircleIcon,
  BookmarkIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ChartPieIcon,
  ClockIcon,
  ArrowPathIcon,
  BellIcon,
  InformationCircleIcon,
  PresentationChartLineIcon,
  Squares2X2Icon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

const PersonnalisesComparatifs: React.FC = () => {
  const [selectedView, setSelectedView] = useState('kpi-synthetiques');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiAnalysisStep, setAiAnalysisStep] = useState(0);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [selectedFilters, setSelectedFilters] = useState({
    periode: 'Ce mois',
    module: 'Ventes',
    graphique: 'Barres'
  });

  const views = [
    {
      id: 'rapports-dynamiques',
      title: 'Rapports dynamiques',
      icon: PresentationChartLineIcon,
      description: 'Créez vos rapports sur mesure',
      indicators: ['Générateur de rapports personnalisés', 'Filtrage par date, client, catégorie', 'Export PDF / Excel', 'Choix des colonnes et indicateurs']
    },
    {
      id: 'comparatifs-multi',
      title: 'Comparatifs multi-dimensions',
      icon: Squares2X2Icon,
      description: 'Analyses comparatives avancées',
      indicators: ['Mois / année / produit / client', 'Courbe "CA vs Marge vs Achats"', 'Graphique radar "Performance commerciale globale"']
    },
    {
      id: 'kpi-synthetiques',
      title: 'KPI synthétiques',
      icon: ChartBarIcon,
      description: 'Tableaux de bord analytiques',
      indicators: ['CA global / Marge brute / Résultat net', 'Ratio de rentabilité', 'Liquidité', 'Rotation du stock', 'Taux d\'impayés', 'Jauge ou baromètre coloré']
    }
  ];

  const currentView = views.find(v => v.id === selectedView) || views[0];

  // Auto-scroll to selected view content
  useEffect(() => {
    const anchor = document.getElementById(`view-${selectedView}`);
    if (anchor) {
      anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedView]);

  // Mapping visuel par type de rapport (icône + couleurs)
  const typeMeta: Record<string, { chip: string; border: string; Icon: any }> = {
    'Fiscalité': { chip: 'from-amber-100 to-amber-200 text-amber-800 border-amber-300', border: 'border-amber-300 hover:border-amber-400', Icon: CalendarIcon },
    'Ventes': { chip: 'from-emerald-100 to-emerald-200 text-emerald-700 border-emerald-300', border: 'border-emerald-300 hover:border-emerald-400', Icon: CurrencyDollarIcon },
    'Commercial': { chip: 'from-slate-100 to-slate-200 text-slate-700 border-slate-300', border: 'border-slate-300 hover:border-slate-400', Icon: UserGroupIcon },
    'Finance': { chip: 'from-cyan-100 to-cyan-200 text-cyan-700 border-cyan-300', border: 'border-cyan-300 hover:border-cyan-400', Icon: BanknotesIcon },
    'Achats': { chip: 'from-indigo-100 to-indigo-200 text-indigo-700 border-indigo-300', border: 'border-indigo-300 hover:border-indigo-400', Icon: DocumentArrowDownIcon },
    'Stock': { chip: 'from-violet-100 to-violet-200 text-violet-700 border-violet-300', border: 'border-violet-300 hover:border-violet-400', Icon: BuildingOfficeIcon },
    'Comptabilité': { chip: 'from-slate-100 to-slate-200 text-slate-800 border-slate-300', border: 'border-slate-300 hover:border-slate-400', Icon: ChartPieIcon },
  };

  // Données enrichies
  const kpiData = {
    caGlobal: 5720000,
    margeBrute: 44.4,
    resultatNet: 485000,
    rentabilite: 8.5,
    liquidite: 1.85,
    rotationStock: 6.2,
    tauxImpayes: 3.5,
    dso: 45,
    dpo: 38,
    ebitda: 12.8,
    croissanceCA: 8.3,
    chargesVariables: 65,
    chargesFixes: 35
  };

  // Rapports sauvegardés enrichis
  const savedReports = [
    { 
      id: 1, 
      name: 'Rapport TVA Détaillé', 
      type: 'Fiscalité', 
      lastUpdate: '08/10/2025', 
      favorite: true,
      description: 'TVA collectée vs déductible avec détails par taux',
      records: 248,
      size: '2.4 MB'
    },
    { 
      id: 2, 
      name: 'Comparatif Ventes Trimestriel', 
      type: 'Ventes', 
      lastUpdate: '01/10/2025', 
      favorite: true,
      description: 'Analyse T1, T2, T3, T4 avec évolution',
      records: 1842,
      size: '5.8 MB'
    },
    { 
      id: 3, 
      name: 'Analyse Marges par Produit', 
      type: 'Commercial', 
      lastUpdate: '28/09/2025', 
      favorite: false,
      description: 'Rentabilité détaillée par famille de produits',
      records: 356,
      size: '1.2 MB'
    },
    { 
      id: 4, 
      name: 'Suivi Trésorerie Mensuel', 
      type: 'Finance', 
      lastUpdate: '25/09/2025', 
      favorite: true,
      description: 'Flux entrants/sortants avec soldes bancaires',
      records: 892,
      size: '3.1 MB'
    },
    { 
      id: 5, 
      name: 'Performance Fournisseurs', 
      type: 'Achats', 
      lastUpdate: '20/09/2025', 
      favorite: false,
      description: 'Top 20 fournisseurs avec délais et qualité',
      records: 124,
      size: '890 KB'
    },
    { 
      id: 6, 
      name: 'Évolution Stock Valorisé', 
      type: 'Stock', 
      lastUpdate: '15/09/2025', 
      favorite: true,
      description: 'Valeur du stock par catégorie sur 12 mois',
      records: 485,
      size: '2.7 MB'
    },
    { 
      id: 7, 
      name: 'Compte de Résultat Synthétique', 
      type: 'Comptabilité', 
      lastUpdate: '10/09/2025', 
      favorite: false,
      description: 'Charges, produits et résultat net mensuel',
      records: 658,
      size: '1.9 MB'
    },
    { 
      id: 8, 
      name: 'Analyse Clients Rentables', 
      type: 'Ventes', 
      lastUpdate: '05/09/2025', 
      favorite: true,
      description: 'CA, marge et fréquence par client',
      records: 742,
      size: '4.2 MB'
    }
  ];

  // Données comparatives
  const comparativeData = {
    ca: { n: 5720000, n1: 5280000, evolution: 8.3 },
    marge: { n: 44.4, n1: 41.2, evolution: 3.2 },
    resultat: { n: 485000, n1: 245000, evolution: 98.0 },
    charges: { n: 1950000, n1: 1880000, evolution: 3.7 }
  };

  // Données mensuelles pour graphiques
  const monthlyData = [
    { month: 'Jan', ca: 920000, marge: 42.5, resultat: 100000, achats: 530000 },
    { month: 'Fév', ca: 880000, marge: 43.2, resultat: 90000, achats: 500000 },
    { month: 'Mar', ca: 980000, marge: 44.8, resultat: 130000, achats: 540000 },
    { month: 'Avr', ca: 950000, marge: 43.9, resultat: 120000, achats: 533000 },
    { month: 'Mai', ca: 1050000, marge: 45.2, resultat: 170000, achats: 575000 },
    { month: 'Jun', ca: 940000, marge: 44.1, resultat: 115000, achats: 525000 }
  ];

  // Performance par région
  const regionPerformance = [
    { region: 'Alger', ca: 2850000, marge: 46.5, evolution: 12.5, color: 'emerald' },
    { region: 'Oran', ca: 1680000, marge: 43.2, evolution: 5.8, color: 'slate' },
    { region: 'Constantine', ca: 890000, marge: 41.8, evolution: -2.3, color: 'red' },
    { region: 'Annaba', ca: 300000, marge: 38.5, evolution: 8.1, color: 'slate' }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête premium */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-8 overflow-hidden">
        {/* Effets de fond */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-50"></div>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-slate-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                <DocumentChartBarIcon className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white flex items-center tracking-tight">
              Rapports Personnalisés & Comparatifs
            </h1>
                <p className="text-emerald-200 mt-1 font-medium">Créez vos rapports sur mesure et suivez vos indicateurs clés</p>
          </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center border border-white/20 shadow-lg hover:shadow-xl hover:scale-105">
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filtres
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl hover:scale-105"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Nouveau rapport
            </button>
          </div>
        </div>
      </div>

      {/* Navigation moderne */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-2">
        <div className="flex space-x-2">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-xl text-sm font-bold transition-all duration-300 flex-1 ${
                  selectedView === view.id
                    ? 'bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-lg scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 hover:scale-102 hover:shadow-md'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  selectedView === view.id 
                    ? 'bg-white/20' 
                    : 'bg-slate-100'
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span>{view.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenu de la vue sélectionnée */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          {(() => {
            const CurrentViewIcon = currentView.icon;
            return <CurrentViewIcon className="h-6 w-6 text-slate-600" />;
          })()}
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{currentView.title}</h2>
            <p className="text-sm text-slate-600">{currentView.description}</p>
          </div>
        </div>

        {/* Contenu dynamique */}
        <div className="space-y-8">
          {/* VUE 1: RAPPORTS DYNAMIQUES */}
          {selectedView === 'rapports-dynamiques' && (
            <>
              <div id="view-rapports-dynamiques" className="h-0" />
              {/* Rapports sauvegardés */}
              <div className="relative bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-100/30 to-transparent rounded-full blur-3xl"></div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl shadow-lg">
                        <BookmarkIcon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900">📚 Mes Rapports Sauvegardés</h3>
                        <p className="text-sm text-slate-600 mt-1">Modèles réutilisables</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <PlusCircleIcon className="h-5 w-5 inline mr-2" />
                      Créer nouveau
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {savedReports.map((report, idx) => (
                      <div key={report.id} className={`group relative bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 ${
                          (typeMeta[report.type]?.border || 'border-slate-200 hover:border-emerald-400')
                        } shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden`}>
                        {/* Badge favori animé */}
                        {report.favorite && (
                          <div className="absolute top-3 right-3 z-10">
                            <div className="p-2 bg-amber-400 rounded-full shadow-lg animate-pulse">
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                          </div>
                        )}

                        {/* Badge numéro */}
                        <div className="absolute top-3 left-3 z-10">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-black text-sm shadow-lg">
                            {idx + 1}
                          </div>
                        </div>

                        <div className="p-6 pt-14">
                          {/* Titre et type */}
                          <div className="mb-4">
                            <h4 className="font-black text-slate-900 text-lg mb-2 line-clamp-1">{report.name}</h4>
                            <p className="text-sm text-slate-600 mb-3 line-clamp-2 h-10">{report.description}</p>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center space-x-1 px-3 py-1 bg-gradient-to-r rounded-full font-bold text-xs border ${
                                  typeMeta[report.type]?.chip || 'from-slate-100 to-slate-200 text-slate-700 border-slate-300'
                                }`}>
                                {(() => {
                                  const MetaIcon = typeMeta[report.type]?.Icon || DocumentChartBarIcon;
                                  return <MetaIcon className="h-3.5 w-3.5" aria-hidden="true" />;
                                })()}
                                <span>{report.type}</span>
                              </span>
                            </div>
                          </div>

                          {/* Statistiques */}
                          <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="text-center">
                              <div className="text-xs text-slate-600 mb-1">Lignes</div>
                              <div className="font-black text-slate-900">{report.records.toLocaleString('fr-FR')}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-slate-600 mb-1">Taille</div>
                              <div className="font-black text-slate-900">{report.size}</div>
                            </div>
                          </div>

                          {/* Date de mise à jour */}
                          <div className="flex items-center justify-between mb-4 text-xs text-slate-600">
                            <span className="flex items-center">
                              <ClockIcon className="h-3 w-3 inline mr-1" />
                              MAJ: {report.lastUpdate}
                            </span>
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-bold">
                              ✓ Actif
                            </span>
                          </div>
                          
                          {/* Actions */}
                          <div className="grid grid-cols-2 gap-2">
                            <button 
                              onClick={() => {
                                setSelectedReport(report);
                                setShowReportModal(true);
                              }}
                              aria-label={`Ouvrir le rapport ${report.name}`}
                              className="px-4 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all text-sm font-bold hover:scale-105 shadow-md"
                            >
                              <EyeIcon className="h-4 w-4 inline mr-1" />
                              Ouvrir
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedReport(report);
                                setShowExportModal(true);
                              }}
                              aria-label={`Exporter le rapport ${report.name}`}
                              className="px-4 py-3 bg-white text-slate-700 border-2 border-slate-300 rounded-xl hover:bg-slate-50 transition-all text-sm font-bold hover:scale-105 shadow-md"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4 inline mr-1" />
                              Export
                            </button>
                          </div>
                        </div>

                        {/* Barre de progression visuelle */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200">
                          {(() => {
                            const step = idx + 1; // 1..8
                            const stepClass =
                              step === 1 ? 'w-step-1' :
                              step === 2 ? 'w-step-2' :
                              step === 3 ? 'w-step-3' :
                              step === 4 ? 'w-step-4' :
                              step === 5 ? 'w-step-5' :
                              step === 6 ? 'w-step-6' :
                              step === 7 ? 'w-step-7' : 'w-step-8';
                            return (
                              <div className={`h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 ${stepClass}`}></div>
                            );
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Statistiques globales */}
                  <div className="grid grid-cols-4 gap-4 mt-8 pt-8 border-t-2 border-slate-200">
                    <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200">
                      <div className="text-3xl font-black text-emerald-700 mb-1">{savedReports.length}</div>
                      <div className="text-xs font-bold text-emerald-600">Rapports créés</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-200">
                      <div className="text-3xl font-black text-amber-700 mb-1">{savedReports.filter(r => r.favorite).length}</div>
                      <div className="text-xs font-bold text-amber-600">Favoris</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200">
                      <div className="text-3xl font-black text-slate-900 mb-1">
                        {savedReports.reduce((sum, r) => sum + r.records, 0).toLocaleString('fr-FR')}
                      </div>
                      <div className="text-xs font-bold text-slate-600">Lignes totales</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200">
                      <div className="text-3xl font-black text-slate-900 mb-1">
                        {(savedReports.reduce((sum, r) => {
                          const size = r.size.includes('MB') ? parseFloat(r.size) : parseFloat(r.size) / 1000;
                          return sum + size;
                        }, 0)).toFixed(1)} MB
                      </div>
                      <div className="text-xs font-bold text-slate-600">Taille totale</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Générateur de rapport */}
              <div className="relative bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border-2 border-slate-200 shadow-xl">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                    <AdjustmentsHorizontalIcon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">⚙️ Générateur de Rapport</h3>
                    <p className="text-sm text-slate-600 mt-1">Configurez votre rapport personnalisé</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sélecteur Module */}
                  <div className="p-5 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
                    <label htmlFor="generator-module" className="text-sm font-bold text-slate-700 mb-3 block">📦 Module source</label>
                    <select 
                      id="generator-module"
                      value={selectedFilters.module}
                      onChange={(e) => setSelectedFilters({...selectedFilters, module: e.target.value})}
                      className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-lg font-bold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                    >
                      <option>Ventes</option>
                      <option>Achats</option>
                      <option>Stock</option>
                      <option>Comptabilité</option>
                      <option>Trésorerie</option>
                      <option>Fiscalité</option>
                      <option>RH</option>
                    </select>
                  </div>

                  {/* Sélecteur Période */}
                  <div className="p-5 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
                    <label htmlFor="generator-periode" className="text-sm font-bold text-slate-700 mb-3 block">📅 Période</label>
                    <select 
                      id="generator-periode"
                      value={selectedFilters.periode}
                      onChange={(e) => setSelectedFilters({...selectedFilters, periode: e.target.value})}
                      className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-lg font-bold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                    >
                      <option>Ce mois</option>
                      <option>Ce trimestre</option>
                      <option>Cette année</option>
                      <option>Mois dernier</option>
                      <option>Année dernière</option>
                      <option>Personnalisée...</option>
                    </select>
                  </div>

                  {/* Sélecteur Graphique */}
                  <div className="p-5 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
                    <label htmlFor="generator-graphique" className="text-sm font-bold text-slate-700 mb-3 block">📊 Type de graphique</label>
                    <select 
                      id="generator-graphique"
                      value={selectedFilters.graphique}
                      onChange={(e) => setSelectedFilters({...selectedFilters, graphique: e.target.value})}
                      className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-lg font-bold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                    >
                      <option>Barres</option>
                      <option>Lignes</option>
                      <option>Camembert</option>
                      <option>Tableau croisé</option>
                      <option>Heatmap</option>
                      <option>Radar</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button 
                    onClick={() => {
                      setSelectedReport({
                        id: 99,
                        name: `Rapport ${selectedFilters.module} - ${selectedFilters.periode}`,
                        type: selectedFilters.module,
                        description: `Analyse ${selectedFilters.graphique.toLowerCase()} pour ${selectedFilters.periode.toLowerCase()}`,
                        records: Math.floor(Math.random() * 1000) + 200,
                        size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
                        lastUpdate: new Date().toLocaleDateString('fr-FR'),
                        favorite: false
                      });
                      setShowReportModal(true);
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <SparklesIcon className="h-5 w-5 inline mr-2" />
                    Générer le rapport
                  </button>
                </div>
              </div>
            </>
          )}

          {/* VUE 2: COMPARATIFS MULTI-DIMENSIONS */}
          {selectedView === 'comparatifs-multi' && (
            <>
              <div id="view-comparatifs-multi" className="h-0" />
              {/* Indicateurs comparatifs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(comparativeData).map(([key, data], idx) => {
                  const labels = { ca: 'CA', marge: 'Marge %', resultat: 'Résultat', charges: 'Charges' };
                  const icons = { ca: CurrencyDollarIcon, marge: ChartPieIcon, resultat: ArrowTrendingUpIcon, charges: BanknotesIcon };
                  const Icon = icons[key as keyof typeof icons];
                  
                  return (
                    <div key={key} className="group relative p-6 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl border-2 border-slate-600/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                            data.evolution > 0 ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                          }`}>
                            {data.evolution > 0 ? '+' : ''}{data.evolution.toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-sm text-white/90 font-bold mb-2">{labels[key as keyof typeof labels]}</div>
                        <div className="text-3xl font-black text-white mb-1">
                          {key === 'marge' ? `${data.n.toFixed(1)}%` : `${(data.n / 1000).toFixed(0)}k`}
                        </div>
                        <div className="text-xs text-white/80">vs {key === 'marge' ? `${data.n1.toFixed(1)}%` : `${(data.n1 / 1000).toFixed(0)}k`} N-1</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Graphique multi-courbes (double axe: valeurs vs % marge) */}
              <div className="relative bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-2xl overflow-hidden">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl shadow-lg">
                    <ChartBarIcon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">📈 CA vs Marge vs Achats</h3>
                    <p className="text-sm text-slate-600 mt-1">Évolution mensuelle comparative</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-8">
                  <div className="flex items-center justify-center space-x-8 mb-6">
                    <div className="flex items-center"><div className="w-8 h-1.5 bg-emerald-600 rounded mr-2" aria-hidden="true"></div><span className="text-sm font-semibold text-slate-900">CA</span></div>
                    <div className="flex items-center"><div className="w-8 h-1.5 bg-slate-900 rounded mr-2" aria-hidden="true"></div><span className="text-sm font-semibold text-slate-900">Marge %</span></div>
                    <div className="flex items-center"><div className="w-8 h-1.5 bg-red-500 rounded mr-2" aria-hidden="true"></div><span className="text-sm font-semibold text-slate-900">Achats</span></div>
                  </div>

                  <div className="relative h-96">
                    <svg className="w-full h-full" viewBox="0 0 700 350" preserveAspectRatio="xMidYMid meet" role="img" aria-labelledby="chart-title chart-desc">
                      <title id="chart-title">Évolution mensuelle: CA, Marge %, Achats</title>
                      <desc id="chart-desc">Courbes comparatives sur 6 mois avec axe gauche en Dinars et axe droit en pourcentage de marge.</desc>
                      {/* Grille */}
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <g key={i}>
                          <line x1="60" y1={30 + i * 50} x2="660" y2={30 + i * 50} stroke="#e2e8f0" strokeWidth="1.5" />
                          <text x="45" y={35 + i * 50} fill="#64748b" fontSize="12" fontWeight="700" textAnchor="end">
                            {(5-i) * 220}k
                          </text>
                        </g>
                      ))}

                      {/* Axe droit (% Marge) */}
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <g key={`right-${i}`}>
                          {/* repère discret côté droit */}
                          <line x1="660" y1={30 + i * 50} x2="665" y2={30 + i * 50} stroke="#cbd5e1" strokeWidth="1.5" />
                          <text x="675" y={35 + i * 50} fill="#475569" fontSize="12" fontWeight="700">
                            {((5 - i) * 12)}%
                          </text>
                        </g>
                      ))}

                      {/* Courbe CA */}
                      <path
                        d={(() => {
                          const maxVal = 1100000;
                          return monthlyData.map((m, i) => {
                            const x = 80 + (i * 100);
                            const y = 280 - ((m.ca / maxVal) * 250);
                            return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                          }).join(' ');
                        })()}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="2000"
                        strokeDashoffset="2000"
                      >
                        <animate attributeName="stroke-dashoffset" from="2000" to="0" dur="2s" fill="freeze" />
                      </path>

                      {/* Courbe Achats */}
                      <path
                        d={(() => {
                          const maxVal = 1100000;
                          return monthlyData.map((m, i) => {
                            const x = 80 + (i * 100);
                            const y = 280 - ((m.achats / maxVal) * 250);
                            return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                          }).join(' ');
                        })()}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="2000"
                        strokeDashoffset="2000"
                      >
                        <animate attributeName="stroke-dashoffset" from="2000" to="0" begin="0.5s" dur="1.5s" fill="freeze" />
                      </path>

                      {/* Courbe Marge % (axe droit) */}
                      <path
                        d={(() => {
                          const maxPct = 60; // échelle 0-60%
                          return monthlyData.map((m, i) => {
                            const x = 80 + (i * 100);
                            const y = 280 - ((m.marge / maxPct) * 250);
                            return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                          }).join(' ');
                        })()}
                        fill="none"
                        stroke="#0f172a"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="2000"
                        strokeDashoffset="2000"
                      >
                        <animate attributeName="stroke-dashoffset" from="2000" to="0" begin="1s" dur="1.2s" fill="freeze" />
                      </path>

                      {/* Points CA */}
                      {monthlyData.map((m, i) => {
                        const x = 80 + (i * 100);
                        const maxVal = 1100000;
                        const y = 280 - ((m.ca / maxVal) * 250);
                        return (
                          <circle key={i} cx={x} cy={y} r="7" fill="#10b981" opacity="0">
                            <animate attributeName="opacity" from="0" to="1" begin={`${2 + i * 0.1}s`} dur="0.3s" fill="freeze" />
                          </circle>
                        );
                      })}

                      {/* Points + labels mois */}
                      {monthlyData.map((m, i) => (
                        <g key={i}>
                          {/* point Marge */}
                          {(() => {
                            const maxPct = 60;
                            const x = 80 + (i * 100);
                            const y = 280 - ((m.marge / maxPct) * 250);
                            return <circle cx={x} cy={y} r="5" fill="#0f172a" opacity="0"><animate attributeName="opacity" from="0" to="1" begin={`${1 + i * 0.1}s`} dur="0.3s" fill="freeze" /></circle>;
                          })()}
                          <text x={80 + (i * 100)} y="310" fill="#334155" fontSize="14" fontWeight="800" textAnchor="middle">{m.month}</text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>
              </div>

              {/* Performance par région */}
              <div className="relative bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-2xl">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                    <BuildingOfficeIcon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">🧭 Performance par Région</h3>
                    <p className="text-sm text-slate-600 mt-1">Analyse multi-dimensionnelle</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {regionPerformance.map((region, idx) => (
                    <div key={idx} className="p-6 bg-slate-50 rounded-xl border-2 border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-black text-slate-900 text-lg">{region.region}</h4>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-slate-600">CA: <span className="font-bold text-slate-900">{(region.ca / 1000).toFixed(0)}k</span></span>
                            <span className="text-sm text-slate-600">Marge: <span className="font-bold text-slate-900">{region.marge}%</span></span>
                          </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                          region.evolution > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {region.evolution > 0 ? '↗' : '↘'} {Math.abs(region.evolution).toFixed(1)}%
                        </div>
                      </div>
                      
                      <div className="w-full bg-slate-200 rounded-full h-6 relative overflow-hidden">
                        {(() => {
                          const percent = (region.ca / 2850000) * 100;
                          const fill = region.color === 'emerald' ? '#10b981' : region.color === 'red' ? '#ef4444' : '#334155';
                          return (
                            <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                              <rect x="0" y="0" width={`${percent}%`} height="100%" rx="9999" fill={fill} />
                            </svg>
                          );
                        })()}
                        <div className="absolute inset-0 flex items-center justify-end pr-3">
                          <span className="text-xs font-bold text-white">{((region.ca / 5720000) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* VUE 3: KPI SYNTHÉTIQUES */}
    {selectedView === 'kpi-synthetiques' && (
            <>
      <div id="view-kpi-synthetiques" className="h-0" />
              {/* KPI Cards premium */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'CA Global', value: kpiData.caGlobal, unit: 'DA', icon: CurrencyDollarIcon, color: 'emerald', evolution: kpiData.croissanceCA },
                  { label: 'Marge Brute', value: kpiData.margeBrute, unit: '%', icon: ChartPieIcon, color: 'slate', evolution: 3.2 },
                  { label: 'Résultat Net', value: kpiData.resultatNet, unit: 'DA', icon: ArrowTrendingUpIcon, color: 'emerald', evolution: 98.0 },
                  { label: 'EBITDA', value: kpiData.ebitda, unit: '%', icon: ChartBarIcon, color: 'slate', evolution: 5.4 },
                  { label: 'Liquidité', value: kpiData.liquidite, unit: '', icon: BanknotesIcon, color: 'slate', evolution: 2.8 },
                  { label: 'Rotation Stock', value: kpiData.rotationStock, unit: 'x', icon: ArrowPathIcon, color: 'slate', evolution: -1.2 },
                  { label: 'DSO', value: kpiData.dso, unit: 'j', icon: ClockIcon, color: 'amber', evolution: -3.5 },
                  { label: 'Taux Impayés', value: kpiData.tauxImpayes, unit: '%', icon: XCircleIcon, color: 'red', evolution: -0.8 }
                ].map((kpi, idx) => {
                  const Icon = kpi.icon;
                  const colorClasses = {
                    emerald: 'from-emerald-400 via-emerald-500 to-emerald-600 border-emerald-300/50',
                    slate: 'from-slate-600 via-slate-700 to-slate-800 border-slate-500/50',
                    amber: 'from-amber-400 via-amber-500 to-amber-600 border-amber-300/50',
                    red: 'from-red-500 via-red-600 to-red-700 border-red-400/50'
                  };
                  
                  return (
                    <div key={idx} className={`group relative p-6 bg-gradient-to-br ${colorClasses[kpi.color as keyof typeof colorClasses]} rounded-2xl border-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden`}>
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                            <Icon className="h-6 w-6 text-white" />
              </div>
                          {kpi.evolution !== undefined && (
                            <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                              kpi.evolution > 0 ? 'bg-white/30 text-white' : 'bg-white/30 text-white'
                            }`}>
                              {kpi.evolution > 0 ? '↗' : '↘'} {Math.abs(kpi.evolution).toFixed(1)}%
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-white/90 font-bold mb-2">{kpi.label}</div>
                        <div className="text-4xl font-black text-white mb-1">
                          {kpi.unit === 'DA' ? (kpi.value / 1000000).toFixed(2) + 'M' : 
                           kpi.unit === '%' || kpi.unit === 'x' || kpi.unit === 'j' ? kpi.value :
                           kpi.value.toFixed(2)}
                        </div>
                        <div className="text-xs text-white/80 font-medium">{kpi.unit === 'DA' ? 'Dinars' : kpi.unit}</div>
                      </div>
                    </div>
                  );
                })}
            </div>

              {/* Graphique Radar Performance */}
              <div className="relative bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-100/20 to-transparent rounded-full blur-3xl"></div>
                
                <div className="relative">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl shadow-lg">
                      <ChartPieIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">🎯 Performance Globale</h3>
                      <p className="text-sm text-slate-600 mt-1">Score multi-critères</p>
              </div>
            </div>

                  <div className="bg-slate-50 rounded-xl p-8">
                    <div className="flex items-center justify-center">
                      <div className="relative w-96 h-96">
                        <svg className="w-full h-full" viewBox="0 0 400 400">
                          {/* Grille radar */}
                          {[1, 2, 3, 4, 5].map((level) => (
                            <polygon
                              key={level}
                              points="200,50 350,150 350,250 200,350 50,250 50,150"
                              fill="none"
                              stroke="#e2e8f0"
                              strokeWidth="1.5"
                              transform={`translate(200 200) scale(${level * 0.2}) translate(-200 -200)`}
                            />
                          ))}

                          {/* Axes */}
                          {['Rentabilité', 'Liquidité', 'Croissance', 'Efficience', 'Solvabilité', 'Innovation'].map((label, idx) => {
                            const angle = (idx * 60 - 90) * (Math.PI / 180);
                            const x = 200 + Math.cos(angle) * 150;
                            const y = 200 + Math.sin(angle) * 150;
                            return (
                              <g key={idx}>
                                <line x1="200" y1="200" x2={x} y2={y} stroke="#cbd5e1" strokeWidth="1.5" />
                                <text 
                                  x={200 + Math.cos(angle) * 170} 
                                  y={200 + Math.sin(angle) * 170} 
                                  fill="#475569" 
                                  fontSize="13" 
                                  fontWeight="700" 
                                  textAnchor="middle"
                                >
                                  {label}
                                </text>
                              </g>
                            );
                          })}

                          {/* Polygone de performance */}
                          <polygon
                            points="200,80 310,140 310,240 200,300 90,240 90,140"
                            fill="url(#radarGradient)"
                            stroke="#10b981"
                            strokeWidth="4"
                            strokeLinejoin="round"
                            opacity="0"
                          >
                            <animate attributeName="opacity" from="0" to="1" begin="0.5s" dur="1s" fill="freeze" />
                          </polygon>

                          <defs>
                            <linearGradient id="radarGradient">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  </div>
              </div>
            </div>

              {/* Sparklines - Mini graphiques de tendances */}
              <div className="relative bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-100/20 to-transparent rounded-full blur-3xl"></div>
                
                <div className="relative">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl shadow-lg">
                      <ChartBarIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">📈 Tendances sur 6 Mois</h3>
                      <p className="text-sm text-slate-600 mt-1">Mini-graphiques de suivi</p>
              </div>
            </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { label: 'CA Mensuel', data: monthlyData.map(m => m.ca), color: '#10b981', unit: 'DA' },
                      { label: 'Marge %', data: monthlyData.map(m => m.marge), color: '#334155', unit: '%' },
                      { label: 'Résultat Net', data: monthlyData.map(m => m.resultat), color: '#10b981', unit: 'DA' },
                      { label: 'Achats', data: monthlyData.map(m => m.achats), color: '#ef4444', unit: 'DA' },
                      { label: 'TVA Nette', data: [10, 25, 25, 25, 30, 85].map(v => v * 1000), color: '#f59e0b', unit: 'DA' },
                      { label: 'Trésorerie', data: [245, 280, 310, 295, 330, 360].map(v => v * 1000), color: '#0891b2', unit: 'DA' }
                    ].map((spark, idx) => {
                      const max = Math.max(...spark.data);
                      const min = Math.min(...spark.data);
                      const current = spark.data[spark.data.length - 1];
                      const previous = spark.data[spark.data.length - 2];
                      const evolution = ((current - previous) / previous) * 100;

                      return (
                        <div key={idx} className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-xl border-2 border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all">
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-bold text-slate-900 text-sm">{spark.label}</div>
                            <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                              evolution > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {evolution > 0 ? '↗' : '↘'} {Math.abs(evolution).toFixed(1)}%
              </div>
            </div>

                          {/* Sparkline SVG */}
                          <svg className="w-full h-16" viewBox="0 0 200 60" preserveAspectRatio="none">
                            <path
                              d={spark.data.map((val, i) => {
                                const x = (i / (spark.data.length - 1)) * 200;
                                const y = 55 - ((val - min) / (max - min)) * 50;
                                return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                              }).join(' ')}
                              fill="none"
                              stroke={spark.color}
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {/* Points */}
                            {spark.data.map((val, i) => {
                              const x = (i / (spark.data.length - 1)) * 200;
                              const y = 55 - ((val - min) / (max - min)) * 50;
                              return (
                                <circle key={i} cx={x} cy={y} r="3" fill={spark.color} />
                              );
                            })}
                          </svg>

                          <div className="text-2xl font-black text-slate-900 mt-2">
                            {spark.unit === 'DA' ? `${(current / 1000).toFixed(0)}k` : current.toFixed(1)}
                          </div>
                          <div className="text-xs text-slate-600">{spark.unit}</div>
                        </div>
                      );
                    })}
                  </div>
              </div>
            </div>

              {/* Jauges de performance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Rentabilité Nette', value: kpiData.rentabilite, max: 20, target: 10, color: 'emerald', icon: '💰' },
                  { label: 'Ratio de Liquidité', value: kpiData.liquidite, max: 3, target: 1.5, color: 'slate', icon: '💧' },
                  { label: 'Taux d\'Imposition', value: 21, max: 30, target: 25, color: 'amber', icon: '📊' }
                ].map((gauge, idx) => (
                  <div key={idx} className="relative bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                    <div className="flex items-center space-x-3 mb-6">
                      <span className="text-3xl">{gauge.icon}</span>
                      <h4 className="font-black text-slate-900 text-lg">{gauge.label}</h4>
              </div>
                    
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative w-64 h-32">
                        <svg className="w-full h-full" viewBox="0 0 200 100">
                          {/* Arc de fond */}
                          <path
                            d="M 20 80 A 80 80 0 0 1 180 80"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="20"
                            strokeLinecap="round"
                          />

                          {/* Arc de progression */}
                          <path
                            d="M 20 80 A 80 80 0 0 1 180 80"
                            fill="none"
                            stroke={gauge.color === 'emerald' ? '#10b981' : gauge.color === 'amber' ? '#f59e0b' : '#334155'}
                            strokeWidth="20"
                            strokeLinecap="round"
                            strokeDasharray={`${(gauge.value / gauge.max) * 251} 251`}
                          >
                            <animate
                              attributeName="stroke-dasharray"
                              from="0 251"
                              to={`${(gauge.value / gauge.max) * 251} 251`}
                              dur="1.5s"
                              fill="freeze"
                            />
                          </path>

                          {/* Marqueur objectif */}
                          <circle
                            cx={20 + (gauge.target / gauge.max) * 160}
                            cy="80"
                            r="6"
                            fill="#f59e0b"
                            stroke="white"
                            strokeWidth="2"
                          />

                          {/* Valeur */}
                          <text x="100" y="65" fill="#0f172a" fontSize="36" fontWeight="900" textAnchor="middle">
                            {gauge.value}
                          </text>
                          <text x="100" y="85" fill="#64748b" fontSize="13" fontWeight="700" textAnchor="middle">
                            / {gauge.max}
                          </text>
                        </svg>
            </div>
          </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="text-xs text-amber-600 font-bold mb-1">Objectif</div>
                        <div className="font-black text-amber-700">{gauge.target}</div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-xs text-slate-600 font-bold mb-1">Statut</div>
                        <div className={`font-black text-xs ${gauge.value >= gauge.target ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {gauge.value >= gauge.target ? '✅ Atteint' : '⚠️ En cours'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Détection de tendances et recommandations IA */}
              <div className="relative bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 border-2 border-slate-200 shadow-2xl">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                    <SparklesIcon className="h-7 w-7 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">🧠 Analyse Intelligente & Recommandations</h3>
                    <p className="text-sm text-slate-600 mt-1">Détection automatique de tendances</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Tendances détectées */}
                  <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-300">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-emerald-500 rounded-xl shadow-lg">
                        <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-emerald-900 mb-2">✅ Tendance positive détectée</h4>
                        <p className="text-sm text-emerald-800 leading-relaxed">
                          <strong>Chiffre d'affaires en hausse de 8.3%</strong> sur les 3 derniers mois. 
                          Progression constante observée depuis janvier avec un pic en mai (+14%).
                        </p>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <div className="text-center p-2 bg-white/50 rounded-lg">
                            <div className="text-xs text-emerald-700">Avril</div>
                            <div className="font-bold text-emerald-900">+6.2%</div>
                          </div>
                          <div className="text-center p-2 bg-white/50 rounded-lg">
                            <div className="text-xs text-emerald-700">Mai</div>
                            <div className="font-bold text-emerald-900">+14.0%</div>
                          </div>
                          <div className="text-center p-2 bg-white/50 rounded-lg">
                            <div className="text-xs text-emerald-700">Juin</div>
                            <div className="font-bold text-emerald-900">+2.1%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommandation stock */}
                  <div className="p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border-2 border-amber-300">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-amber-500 rounded-xl shadow-lg">
                        <InformationCircleIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-amber-900 mb-2">💡 Recommandation IA</h4>
                        <p className="text-sm text-amber-800 leading-relaxed">
                          <strong>"Réduire le stock dormant pour améliorer le cashflow"</strong> 
                          <br />12 produits n'ont pas été vendus depuis 90+ jours. Valeur immobilisée: <span className="font-black">285,000 DA</span>. 
                          Potentiel de libération: <span className="font-black text-emerald-700">+18% de liquidité</span>.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Corrélation détectée */}
                  <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border-2 border-slate-300">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-slate-700 rounded-xl shadow-lg">
                        <ArrowPathIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-slate-900 mb-2">🔗 Corrélation détectée</h4>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          <strong>"Hausse des ventes = hausse de TVA nette"</strong>
                          <br />Coefficient de corrélation: <span className="font-black text-emerald-700">0.94</span> (très forte). 
                          Augmentation CA de 10% → TVA nette +18% en moyenne.
                        </p>
                        <div className="mt-3 flex items-center space-x-2">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full">
                            <div className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full w-94p"></div>
                          </div>
                          <span className="text-sm font-black text-slate-900">94%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Alerte baisse */}
                  <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-300">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                        <ArrowTrendingDownIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-red-900 mb-2">⚠️ Point de vigilance</h4>
                        <p className="text-sm text-red-800 leading-relaxed">
                          <strong>DSO (Délai moyen de paiement clients) à 45 jours</strong>, 
                          soit +5 jours vs mois dernier. Risque de tension de trésorerie si la tendance continue. 
                          <br />Action suggérée: <span className="font-black">Relancer les 8 factures en retard (+30j)</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tableau comparatif 3 ans */}
              <div className="relative bg-white rounded-2xl p-8 border-2 border-slate-200 shadow-2xl">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl shadow-lg">
                    <CalendarIcon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">📊 Évolution sur 3 Ans</h3>
                    <p className="text-sm text-slate-600 mt-1">Comparatif 2023, 2024, 2025</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl overflow-hidden border-2 border-slate-200">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-slate-700 to-slate-900 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold uppercase">Indicateur</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase">2023</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase">2024</th>
                        <th className="px-6 py-4 text-right text-xs font-bold uppercase">2025 (YTD)</th>
                        <th className="px-6 py-4 text-center text-xs font-bold uppercase">Évolution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {[
                        { indicator: 'Chiffre d\'affaires', y2023: 4850000, y2024: 5280000, y2025: 5720000 },
                        { indicator: 'Résultat net', y2023: 180000, y2024: 245000, y2025: 485000 },
                        { indicator: 'TVA nette', y2023: 145000, y2024: 168000, y2025: 200000 },
                        { indicator: 'Marge brute %', y2023: 39.5, y2024: 41.2, y2025: 44.4 },
                        { indicator: 'EBITDA %', y2023: 10.2, y2024: 11.5, y2025: 12.8 }
                      ].map((row, idx) => {
                        const isPercentage = row.indicator.includes('%');
                        const evolution = ((row.y2025 - row.y2023) / row.y2023) * 100;
                        
                        return (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-900">{row.indicator}</td>
                            <td className="px-6 py-4 text-right font-medium text-slate-600">
                              {isPercentage ? `${row.y2023}%` : `${row.y2023.toLocaleString('fr-FR')} DA`}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-slate-700">
                              {isPercentage ? `${row.y2024}%` : `${row.y2024.toLocaleString('fr-FR')} DA`}
                            </td>
                            <td className="px-6 py-4 text-right font-black text-slate-900">
                              {isPercentage ? `${row.y2025}%` : `${row.y2025.toLocaleString('fr-FR')} DA`}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                evolution > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {evolution > 0 ? '↗' : '↘'} {Math.abs(evolution).toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Panneau d'actualisation */}
              <div className="relative bg-gradient-to-r from-slate-100 to-slate-50 rounded-2xl p-6 border-2 border-slate-300 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-500 rounded-lg">
                      <CheckCircleIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">🔁 Données actualisées</div>
                      <div className="text-xs text-slate-600">Dernière synchronisation: {new Date().toLocaleString('fr-FR')}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-600">Prochaine actualisation dans <span className="font-bold text-slate-900">18h 24min</span></span>
                    <button className="px-4 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-all font-bold text-sm hover:scale-105 shadow-md">
                      <ArrowPathIcon className="h-4 w-4 inline mr-1" />
                      Actualiser maintenant
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 pt-8 border-t-2 border-slate-200">
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-6 border-2 border-slate-200 shadow-lg">
            <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <span className="inline-block w-2 h-8 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full mr-3"></span>
              Actions Rapides
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <button 
                onClick={() => {
                  if (savedReports.length > 0) {
                    setSelectedReport(savedReports[0]);
                    setShowReportModal(true);
                  }
                }}
                className="group relative px-5 py-4 bg-gradient-to-br from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 flex flex-col items-center shadow-lg hover:shadow-2xl hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg mb-2">
                    <EyeIcon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold">Aperçu</span>
                </div>
          </button>
              
              <button 
                onClick={() => alert('📄 Export PDF\n\nGénération du fichier PDF...\n\n✅ Format: PDF\n✅ Mise en page optimisée\n✅ Graphiques inclus\n\nTéléchargement en cours...')}
                className="group px-5 py-4 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300 flex flex-col items-center border-2 border-slate-300 shadow-lg hover:shadow-2xl hover:scale-105"
              >
                <div className="p-2 bg-slate-100 group-hover:bg-slate-200 rounded-lg mb-2 transition-colors">
                  <ArrowDownTrayIcon className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold">PDF</span>
          </button>
              
              <button 
                onClick={() => alert('📊 Export Excel\n\nGénération du fichier Excel...\n\n✅ Format: XLSX\n✅ Formules intégrées\n✅ Tableaux croisés dynamiques\n\nTéléchargement en cours...')}
                className="group px-5 py-4 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300 flex flex-col items-center border-2 border-slate-300 shadow-lg hover:shadow-2xl hover:scale-105"
              >
                <div className="p-2 bg-slate-100 group-hover:bg-slate-200 rounded-lg mb-2 transition-colors">
                  <DocumentArrowDownIcon className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold">Excel</span>
          </button>
              
              <button 
                onClick={() => alert('📤 Partager le rapport\n\nOptions de partage:\n\n✅ Email\n✅ Lien sécurisé\n✅ Collaboration en temps réel\n\nChoisissez votre méthode de partage...')}
                className="group px-5 py-4 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300 flex flex-col items-center border-2 border-slate-300 shadow-lg hover:shadow-2xl hover:scale-105"
              >
                <div className="p-2 bg-slate-100 group-hover:bg-slate-200 rounded-lg mb-2 transition-colors">
                  <ShareIcon className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold">Partager</span>
          </button>
              
              <button 
                onClick={() => alert('💾 Sauvegarder comme modèle\n\n✅ Rapport ajouté aux favoris\n✅ Paramètres enregistrés\n✅ Accessible depuis "Mes Rapports"\n\nVous pourrez le réutiliser à tout moment !')}
                className="group px-5 py-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 flex flex-col items-center shadow-lg hover:shadow-2xl hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg mb-2">
                    <BookmarkIcon className="h-6 w-6" />
        </div>
                  <span className="text-xs font-bold">Sauvegarder</span>
      </div>
              </button>
              
              <button 
                onClick={() => {
                  setShowAIModal(true);
                  setAiAnalysisStep(0);
                  // Progression automatique de l'analyse
                  setTimeout(() => setAiAnalysisStep(1), 1500);
                  setTimeout(() => setAiAnalysisStep(2), 3000);
                  setTimeout(() => setAiAnalysisStep(3), 4500);
                  setTimeout(() => setAiAnalysisStep(4), 6000);
                  setTimeout(() => setAiAnalysisStep(5), 7500);
                }}
                className="group px-5 py-4 bg-gradient-to-br from-slate-700 to-slate-900 text-white rounded-xl hover:from-slate-800 hover:to-black transition-all duration-300 flex flex-col items-center shadow-lg hover:shadow-2xl hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-emerald-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg mb-2">
                    <SparklesIcon className="h-6 w-6 animate-pulse" />
                  </div>
                  <span className="text-xs font-bold">IA</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Création de rapport */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8 animate-scale-in border-4 border-emerald-500 overflow-hidden">
            {/* En-tête */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                    <PlusCircleIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Créer un Nouveau Rapport</h2>
                    <p className="text-emerald-100 text-sm font-medium">Configurez votre rapport personnalisé</p>
                  </div>
                </div>
                <button
                  title="Fermer"
                  aria-label="Fermer"
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-slate-50 to-white">
              {/* Étape 1: Configuration */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-black mr-2 text-sm">1</span>
                  Configuration du rapport
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">📝 Nom du rapport</label>
                    <input 
                      type="text"
                      placeholder="Ex: Ventes Q4 2024"
                      className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl font-medium text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="create-module" className="text-sm font-bold text-slate-700 mb-2 block">📦 Module source</label>
                    <select id="create-module" className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
                      <option>Ventes</option>
                      <option>Achats</option>
                      <option>Comptabilité</option>
                      <option>Trésorerie</option>
                      <option>Fiscalité</option>
                      <option>Stock</option>
                      <option>RH</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Étape 2: Filtres */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-black mr-2 text-sm">2</span>
                  Filtres et dimensions
                </h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="create-periode" className="text-sm font-bold text-slate-700 mb-2 block">📅 Période</label>
                    <select id="create-periode" className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 focus:border-emerald-500">
                      <option>Ce mois</option>
                      <option>Ce trimestre</option>
                      <option>Cette année</option>
                      <option>Personnalisée</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="create-societe" className="text-sm font-bold text-slate-700 mb-2 block">🏢 Société</label>
                    <select id="create-societe" className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 focus:border-emerald-500">
                      <option>Toutes</option>
                      <option>Société mère</option>
                      <option>Filiale Alger</option>
                      <option>Filiale Oran</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="create-client" className="text-sm font-bold text-slate-700 mb-2 block">👥 Client</label>
                    <select id="create-client" className="w-full p-3 bg-white border-2 border-slate-300 rounded-xl font-bold text-slate-900 focus:border-emerald-500">
                      <option>Tous</option>
                      <option>Top 10</option>
                      <option>Par secteur</option>
                    </select>
                  </div>
              </div>
            </div>

              {/* Étape 3: Visualisation */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white font-black mr-2 text-sm">3</span>
                  Type de visualisation
                </h3>
                
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { type: 'Tableau', icon: '📊' },
                    { type: 'Barres', icon: '📊' },
                    { type: 'Lignes', icon: '📈' },
                    { type: 'Camembert', icon: '🎯' },
                    { type: 'Radar', icon: '⭐' },
                    { type: 'Heatmap', icon: '🔥' }
                  ].map((viz, idx) => (
                    <button
                      key={idx}
                      className="p-4 bg-white border-2 border-slate-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all text-center font-bold hover:scale-105"
                    >
                      <div className="text-2xl mb-2">{viz.icon}</div>
                      <div className="text-sm text-slate-900">{viz.type}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t-2 border-slate-200">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" id="save-template" className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  <label htmlFor="save-template" className="text-sm font-bold text-slate-700">💾 Sauvegarder comme modèle</label>
            </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold border-2 border-slate-300"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      // Ici on peut ajouter la logique de création
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <SparklesIcon className="h-5 w-5 inline mr-2" />
                    Générer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Affichage Rapport */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in overflow-y-auto">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full my-8 animate-scale-in border-4 border-emerald-500">
            {/* En-tête */}
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <DocumentChartBarIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">{selectedReport.name}</h2>
                    <p className="text-emerald-100 text-sm font-medium">{selectedReport.description}</p>
                  </div>
                </div>
                <button
                  title="Fermer"
                  aria-label="Fermer"
                  onClick={() => setShowReportModal(false)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 max-h-[calc(100vh-200px)] overflow-y-auto bg-gradient-to-br from-slate-50 to-white">
              {/* Informations du rapport */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-white rounded-xl border-2 border-slate-200 text-center">
                  <div className="text-xs font-bold text-slate-600 uppercase mb-2">Type</div>
                  <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-bold text-sm inline-block">
                    {selectedReport.type}
                  </div>
                </div>
                <div className="p-4 bg-white rounded-xl border-2 border-slate-200 text-center">
                  <div className="text-xs font-bold text-slate-600 uppercase mb-2">Lignes</div>
                  <div className="text-xl font-black text-slate-900">{selectedReport.records}</div>
                </div>
                <div className="p-4 bg-white rounded-xl border-2 border-slate-200 text-center">
                  <div className="text-xs font-bold text-slate-600 uppercase mb-2">Taille</div>
                  <div className="text-xl font-black text-slate-900">{selectedReport.size}</div>
                </div>
                <div className="p-4 bg-white rounded-xl border-2 border-slate-200 text-center">
                  <div className="text-xs font-bold text-slate-600 uppercase mb-2">Dernière MAJ</div>
                  <div className="text-sm font-bold text-slate-900">{selectedReport.lastUpdate}</div>
                </div>
              </div>

              {/* Aperçu des données */}
              <div className="mb-6 p-6 bg-white rounded-xl border-2 border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Aperçu des données</h3>
                {(() => {
                  const formatDA = (n: number) => `${n.toLocaleString('fr-FR')} DA`;
                  const isQuarterlySales = (selectedReport?.name || '').toLowerCase().includes('comparatif ventes trimestriel');
                  const rows = isQuarterlySales
                    ? [
                        { date: '01/10/2025', desc: 'Ligne exemple 1', montant: 434818, evol: 1.7 },
                        { date: '02/10/2025', desc: 'Ligne exemple 2', montant: 460397, evol: 2.5 },
                        { date: '03/10/2025', desc: 'Ligne exemple 3', montant: 101541, evol: 12.7 },
                        { date: '04/10/2025', desc: 'Ligne exemple 4', montant: 197347, evol: 19.9 },
                        { date: '05/10/2025', desc: 'Ligne exemple 5', montant: 243538, evol: 6.3 }
                      ]
                    : Array.from({ length: 5 }, (_, i) => ({
                        date: `0${i + 1}/10/2025`,
                        desc: `Ligne exemple ${i + 1}`,
                        montant: Math.round(Math.random() * 500000 + 100000),
                        evol: parseFloat((Math.random() * 20).toFixed(1)) * (Math.random() > 0.5 ? 1 : -1)
                      }));
                  return (
                    <>
                      <div className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
                        <table className="w-full">
                          <thead className="bg-slate-700 text-white">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-bold uppercase">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-bold uppercase">Description</th>
                              <th className="px-4 py-3 text-right text-xs font-bold uppercase">Montant</th>
                              <th className="px-4 py-3 text-center text-xs font-bold uppercase">Évolution</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {rows.map((r, i) => (
                              <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-4 py-3 text-sm text-slate-900 font-medium">{r.date}</td>
                                <td className="px-4 py-3 text-sm text-slate-700">{r.desc}</td>
                                <td className="px-4 py-3 text-right font-bold text-slate-900">{formatDA(r.montant)}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${r.evol >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    {r.evol >= 0 ? '+' : ''}{Math.abs(r.evol).toFixed(1)}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 text-center text-sm text-slate-600">
                        Affichage de 5 lignes sur <span className="font-bold text-slate-900">{selectedReport.records.toLocaleString('fr-FR')}</span> au total
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Bloc pro: Comparatif Trimestriel (spécifique 'Comparatif Ventes Trimestriel') */}
              {((selectedReport?.name || '').toLowerCase().includes('comparatif ventes trimestriel')) && (
                <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Tableau comparatif */}
                  <div className="lg:col-span-2 p-6 bg-white rounded-xl border-2 border-slate-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-slate-700 rounded-lg"><ChartBarIcon className="h-5 w-5 text-white" /></div>
                      <h4 className="text-lg font-black text-slate-900">Comparatif Trimestriel 2025 vs 2024</h4>
                    </div>
                    {(() => {
                      const data = [
                        { t: 'T1', ca25: 1450000, ca24: 1380000, m25: 44.2, m24: 41.9 },
                        { t: 'T2', ca25: 1510000, ca24: 1425000, m25: 45.1, m24: 42.7 },
                        { t: 'T3', ca25: 1385000, ca24: 1320000, m25: 43.8, m24: 41.0 },
                        { t: 'T4', ca25: 1375000, ca24: 1150000, m25: 44.6, m24: 39.0 }
                      ];
                      const pct = (a:number,b:number)=> ((a-b)/b)*100;
                      return (
                        <div className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
                          <table className="w-full">
                            <thead className="bg-slate-700 text-white">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold uppercase">Trimestre</th>
                                <th className="px-4 py-3 text-right text-xs font-bold uppercase">CA 2025</th>
                                <th className="px-4 py-3 text-right text-xs font-bold uppercase">CA 2024</th>
                                <th className="px-4 py-3 text-center text-xs font-bold uppercase">Δ CA</th>
                                <th className="px-4 py-3 text-center text-xs font-bold uppercase">Marge 2025</th>
                                <th className="px-4 py-3 text-center text-xs font-bold uppercase">Marge 2024</th>
                                <th className="px-4 py-3 text-center text-xs font-bold uppercase">Δ pts</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 bg-white">
                              {data.map((q, i) => (
                                <tr key={i} className="hover:bg-slate-50">
                                  <td className="px-4 py-3 font-bold text-slate-900">{q.t}</td>
                                  <td className="px-4 py-3 text-right font-black text-slate-900">{q.ca25.toLocaleString('fr-FR')} DA</td>
                                  <td className="px-4 py-3 text-right font-medium text-slate-700">{q.ca24.toLocaleString('fr-FR')} DA</td>
                                  <td className="px-4 py-3 text-center">
                                    {(() => {
                                      const d = pct(q.ca25,q.ca24);
                                      return <span className={`px-2 py-1 rounded-full text-xs font-bold ${d>=0?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{d>=0? '↗' : '↘'} {Math.abs(d).toFixed(1)}%</span>
                                    })()}
                                  </td>
                                  <td className="px-4 py-3 text-center font-black text-slate-900">{q.m25.toFixed(1)}%</td>
                                  <td className="px-4 py-3 text-center font-medium text-slate-700">{q.m24.toFixed(1)}%</td>
                                  <td className="px-4 py-3 text-center font-bold text-slate-900">{(q.m25-q.m24).toFixed(1)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                  {/* Mini chart */}
                  <div className="p-6 bg-white rounded-xl border-2 border-slate-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-emerald-500 rounded-lg"><ArrowTrendingUpIcon className="h-5 w-5 text-white" /></div>
                      <h4 className="text-lg font-black text-slate-900">CA par Trimestre (2025 vs 2024)</h4>
                    </div>
                    {(() => {
                      const d = [
                        { t: 'T1', ca25: 1450, ca24: 1380 },
                        { t: 'T2', ca25: 1510, ca24: 1425 },
                        { t: 'T3', ca25: 1385, ca24: 1320 },
                        { t: 'T4', ca25: 1375, ca24: 1150 }
                      ];
                      const max = 1600;
                      return (
                        <svg viewBox="0 0 280 160" className="w-full h-40">
                          {/* axes */}
                          <line x1="30" y1="10" x2="30" y2="140" stroke="#cbd5e1" strokeWidth="2" />
                          <line x1="30" y1="140" x2="270" y2="140" stroke="#cbd5e1" strokeWidth="2" />
                          {d.map((q, i) => {
                            const x = 50 + i*55;
                            const h25 = (q.ca25/max)*120;
                            const h24 = (q.ca24/max)*120;
                            return (
                              <g key={i}>
                                <rect x={x} y={140 - h24} width="18" height={h24} fill="#94a3b8" rx="3" />
                                <rect x={x+20} y={140 - h25} width="18" height={h25} fill="#10b981" rx="3" />
                                <text x={x+10} y="155" textAnchor="middle" fontSize="12" fill="#334155" fontWeight="700">{q.t}</text>
                              </g>
                            );
                          })}
                          <text x="200" y="20" fontSize="10" fill="#334155">Gris: 2024 • Vert: 2025</text>
                        </svg>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Bloc pro: Rapport TVA Détaillé */}
              {(() => {
                const name = (selectedReport?.name || '').toLowerCase();
                if (!name.includes('tva')) return null;
                const fmt = (n:number)=> n.toLocaleString('fr-FR') + ' DA';
                const lignes = [
                  { taux: '19%', collecte: 165000, deductible: 78000 },
                  { taux: '9%', collecte: 42000, deductible: 15000 },
                  { taux: '0%', collecte: 0, deductible: 8000 }
                ].map(r => ({...r, net: r.collecte - r.deductible}));
                const tot = lignes.reduce((a,b)=>({
                  taux: 'Total', collecte: a.collecte + b.collecte, deductible: a.deductible + b.deductible, net: a.net + b.net
                }), { taux:'Total', collecte:0, deductible:0, net:0});
                return (
                  <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 p-6 bg-white rounded-xl border-2 border-slate-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-amber-500 rounded-lg"><ChartBarIcon className="h-5 w-5 text-white" /></div>
                        <h4 className="text-lg font-black text-slate-900">TVA collectée vs déductible par taux</h4>
                      </div>
                      <div className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
                        <table className="w-full">
                          <thead className="bg-slate-700 text-white">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-bold uppercase">Taux</th>
                              <th className="px-4 py-3 text-right text-xs font-bold uppercase">Collectée</th>
                              <th className="px-4 py-3 text-right text-xs font-bold uppercase">Déductible</th>
                              <th className="px-4 py-3 text-right text-xs font-bold uppercase">Nette</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {lignes.map((r,i)=> (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-bold text-slate-900">{r.taux}</td>
                                <td className="px-4 py-3 text-right font-medium text-slate-700">{fmt(r.collecte)}</td>
                                <td className="px-4 py-3 text-right font-medium text-slate-700">{fmt(r.deductible)}</td>
                                <td className={`px-4 py-3 text-right font-black ${r.net>=0?'text-emerald-700':'text-red-700'}`}>{fmt(r.net)}</td>
                              </tr>
                            ))}
                            <tr className="bg-slate-100">
                              <td className="px-4 py-3 font-black text-slate-900">Total</td>
                              <td className="px-4 py-3 text-right font-black text-slate-900">{fmt(tot.collecte)}</td>
                              <td className="px-4 py-3 text-right font-black text-slate-900">{fmt(tot.deductible)}</td>
                              <td className={`px-4 py-3 text-right font-black ${tot.net>=0?'text-emerald-700':'text-red-700'}`}>{fmt(tot.net)}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="p-6 bg-white rounded-xl border-2 border-slate-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-amber-500 rounded-lg"><ChartPieIcon className="h-5 w-5 text-white" /></div>
                        <h4 className="text-lg font-black text-slate-900">Synthèse TVA</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="text-xs text-amber-600 font-bold mb-1">Collectée</div>
                          <div className="font-black text-amber-700">{fmt(tot.collecte)}</div>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="text-xs text-slate-600 font-bold mb-1">Déductible</div>
                          <div className="font-black text-slate-700">{fmt(tot.deductible)}</div>
                        </div>
                        <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <div className="text-xs text-emerald-600 font-bold mb-1">Nette</div>
                          <div className="font-black text-emerald-700">{fmt(tot.net)}</div>
                        </div>
                      </div>
                      {/* Mini-barres collectée vs déductible */}
                      {(() => {
                        const max = Math.max(...lignes.map(r=> Math.max(r.collecte, r.deductible)));
                        return (
                          <svg viewBox="0 0 260 120" className="w-full h-32">
                            {lignes.map((r,i)=>{
                              const y = 20 + i*30;
                              const wC = (r.collecte/max)*200;
                              const wD = (r.deductible/max)*200;
                              return (
                                <g key={i}>
                                  <text x="10" y={y-6} fontSize="11" fill="#334155" fontWeight="700">{r.taux}</text>
                                  <rect x="60" y={y-12} width={wC} height="8" rx="3" fill="#f59e0b" />
                                  <rect x="60" y={y} width={wD} height="8" rx="3" fill="#64748b" />
                                </g>
                              );
                            })}
                            <text x="180" y="110" fontSize="10" fill="#334155">Orange: collectée • Gris: déductible</text>
                          </svg>
                        );
                      })()}
                    </div>
                  </div>
                );
              })()}

              {/* Bloc pro: Analyse Marges par Produit */}
              {(() => {
                const name = (selectedReport?.name || '').toLowerCase();
                if (!name.includes('marges')) return null;
                const fmt = (n:number)=> n.toLocaleString('fr-FR') + ' DA';
                const familles = [
                  { fam: 'Électronique', ca: 980000, cout: 585000 },
                  { fam: 'Maison & Déco', ca: 620000, cout: 382000 },
                  { fam: 'Beauté', ca: 310000, cout: 205000 },
                  { fam: 'Accessoires', ca: 210000, cout: 145000 }
                ].map(f=> ({...f, marge: ((f.ca - f.cout)/f.ca)*100 }));
                const abc = (m:number)=> m>=45? 'A' : m>=35? 'B' : 'C';
                return (
                  <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 p-6 bg-white rounded-xl border-2 border-slate-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-slate-700 rounded-lg"><ChartBarIcon className="h-5 w-5 text-white" /></div>
                        <h4 className="text-lg font-black text-slate-900">Marge par famille de produits</h4>
                      </div>
                      <div className="bg-slate-50 rounded-lg overflow-hidden border border-slate-200">
                        <table className="w-full">
                          <thead className="bg-slate-700 text-white">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-bold uppercase">Famille</th>
                              <th className="px-4 py-3 text-right text-xs font-bold uppercase">CA</th>
                              <th className="px-4 py-3 text-right text-xs font-bold uppercase">Coût</th>
                              <th className="px-4 py-3 text-center text-xs font-bold uppercase">Marge %</th>
                              <th className="px-4 py-3 text-center text-xs font-bold uppercase">ABC</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                            {familles.map((f,i)=> (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-bold text-slate-900">{f.fam}</td>
                                <td className="px-4 py-3 text-right font-black text-slate-900">{fmt(f.ca)}</td>
                                <td className="px-4 py-3 text-right font-medium text-slate-700">{fmt(f.cout)}</td>
                                <td className="px-4 py-3 text-center font-black text-slate-900">{f.marge.toFixed(1)}%</td>
                                <td className="px-4 py-3 text-center">
                                  {(() => {
                                    const tier = abc(f.marge);
                                    const cls = tier==='A' ? 'bg-emerald-100 text-emerald-700' : tier==='B' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700';
                                    return <span className={`px-2 py-1 rounded-full text-xs font-bold ${cls}`}>{tier}</span>;
                                  })()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="p-6 bg-white rounded-xl border-2 border-slate-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-emerald-500 rounded-lg"><ArrowTrendingUpIcon className="h-5 w-5 text-white" /></div>
                        <h4 className="text-lg font-black text-slate-900">Top marge % par famille</h4>
                      </div>
                      {(() => {
                        const max = 60;
                        return (
                          <svg viewBox="0 0 260 140" className="w-full h-36">
                            {familles.map((f,i)=>{
                              const y = 25 + i*28;
                              const w = (f.marge/max)*200;
                              return (
                                <g key={i}>
                                  <text x="10" y={y} fontSize="11" fill="#334155" fontWeight="700">{f.fam}</text>
                                  <rect x="110" y={y-10} width={w} height="12" rx="4" fill="#10b981" />
                                  <text x={110 + w + 6} y={y} fontSize="11" fill="#0f172a" fontWeight="800">{f.marge.toFixed(1)}%</text>
                                </g>
                              );
                            })}
                          </svg>
                        );
                      })()}
                    </div>
                  </div>
                );
              })()}

              {/* Bloc pro: Suivi Trésorerie Mensuel */}
              {(() => {
                const name = (selectedReport?.name || '').toLowerCase();
                if (!(name.includes('trésorerie') || name.includes('tresorerie'))) return null;
                const fmt = (n:number)=> n.toLocaleString('fr-FR') + ' DA';
                const series = [
                  { m:'Avr', in: 820000, out: 765000 },
                  { m:'Mai', in: 860000, out: 790000 },
                  { m:'Jun', in: 780000, out: 805000 },
                  { m:'Jul', in: 910000, out: 840000 },
                  { m:'Aoû', in: 870000, out: 820000 },
                  { m:'Sep', in: 930000, out: 880000 },
                ];
                const comptes = [
                  { banque: 'BEA - Courant', solde: 620000 },
                  { banque: 'CPA - Épargne', solde: 380000 },
                  { banque: 'BDL - Devise', solde: 210000 }
                ];
                const soldeTotal = comptes.reduce((s,c)=> s+c.solde, 0);
                const inMonth = series[series.length-1].in;
                const outMonth = series[series.length-1].out;
                const max = Math.max(...series.flatMap(s=>[s.in, s.out]));
                return (
                  <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="p-6 bg-white rounded-xl border-2 border-slate-200">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                          <div className="text-xs text-emerald-600 font-bold mb-1">Soldes bancaires</div>
                          <div className="font-black text-emerald-700">{fmt(soldeTotal)}</div>
                        </div>
                        <div className="text-center p-3 bg-sky-50 rounded-lg border border-sky-200">
                          <div className="text-xs text-sky-600 font-bold mb-1">Entrants (mois)</div>
                          <div className="font-black text-sky-700">{fmt(inMonth)}</div>
                        </div>
                        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="text-xs text-red-600 font-bold mb-1">Sortants (mois)</div>
                          <div className="font-black text-red-700">{fmt(outMonth)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="lg:col-span-2 p-6 bg-white rounded-xl border-2 border-slate-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-slate-700 rounded-lg"><ChartBarIcon className="h-5 w-5 text-white" /></div>
                        <h4 className="text-lg font-black text-slate-900">Flux mensuels (6 derniers mois)</h4>
                      </div>
                      <svg viewBox="0 0 560 180" className="w-full h-44">
                        {/* Grille horizontale */}
                        {[0,1,2,3].map(i=> (
                          <line key={i} x1="40" y1={30 + i*40} x2="540" y2={30 + i*40} stroke="#e2e8f0" strokeWidth="1" />
                        ))}
                        {/* Lignes */}
                        {['in','out'].map((key, idx)=> {
                          const color = key==='in' ? '#06b6d4' : '#ef4444';
                          const d = series.map((s,i)=> {
                            const x = 60 + i*80;
                            const y = 150 - ((s[key as 'in'|'out'] / max) * 120);
                            return i===0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                          }).join(' ');
                          return (
                            <path key={key} d={d} fill="none" stroke={color} strokeWidth={idx===0?4:3} strokeLinecap="round" strokeLinejoin="round" />
                          );
                        })}
                        {/* Points + labels mois */}
                        {series.map((s,i)=> {
                          const x = 60 + i*80;
                          return (
                            <g key={i}>
                              <circle cx={x} cy={150 - ((s.in/max)*120)} r="5" fill="#06b6d4" />
                              <circle cx={x} cy={150 - ((s.out/max)*120)} r="4" fill="#ef4444" />
                              <text x={x} y="170" fontSize="12" textAnchor="middle" fill="#334155" fontWeight="700">{s.m}</text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                    {/* Comptes bancaires */}
                    <div className="lg:col-span-3 p-6 bg-white rounded-xl border-2 border-slate-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-slate-700 rounded-lg"><BanknotesIcon className="h-5 w-5 text-white" /></div>
                        <h4 className="text-lg font-black text-slate-900">Soldes par compte</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {comptes.map((c,i)=> (
                          <div key={i} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="text-sm font-bold text-slate-900 mb-1">{c.banque}</div>
                            <div className="text-lg font-black text-slate-900">{fmt(c.solde)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t-2 border-slate-200">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-6 py-3 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold border-2 border-slate-300"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setShowExportModal(true);
                  }}
                  className="px-8 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all font-bold shadow-lg hover:scale-105"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 inline mr-2" />
                  Exporter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Export */}
      {showExportModal && selectedReport && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full animate-scale-in border-4 border-slate-500">
            {/* En-tête */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-900 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <ArrowDownTrayIcon className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">📥 Exporter le rapport</h2>
                    <p className="text-slate-200 text-sm font-medium">{selectedReport.name}</p>
                  </div>
                </div>
                <button
                  title="Fermer"
                  aria-label="Fermer"
                  onClick={() => setShowExportModal(false)}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-slate-50 to-white">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Choisissez le format d'export</h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { format: 'PDF', icon: '📄', desc: 'Document imprimable', color: 'red' },
                  { format: 'Excel', icon: '📊', desc: 'Feuille de calcul', color: 'emerald' },
                  { format: 'CSV', icon: '📋', desc: 'Données brutes', color: 'slate' },
                  { format: 'Power BI', icon: '📈', desc: 'Tableau de bord', color: 'amber' }
                ].map((exp, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setShowExportModal(false);
                      setTimeout(() => {
                        alert(`✅ Export ${exp.format} réussi!\n\nFichier: ${selectedReport.name}.${exp.format.toLowerCase()}\nTaille: ${selectedReport.size}\nEnregistré dans "Mes Documents"`);
                      }, 300);
                    }}
                    className={`group p-6 bg-white rounded-xl border-2 border-slate-300 hover:border-${exp.color}-400 hover:shadow-xl transition-all hover:scale-105`}
                  >
                    <div className="text-5xl mb-3">{exp.icon}</div>
                    <div className="font-black text-slate-900 text-lg mb-1">{exp.format}</div>
                    <div className="text-sm text-slate-600">{exp.desc}</div>
                  </button>
                ))}
              </div>

              {/* Options avancées */}
              <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 mb-6">
                <h4 className="font-bold text-slate-900 mb-3 text-sm">Options avancées</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-emerald-600" />
                    <span className="text-sm text-slate-700">Inclure les graphiques</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-emerald-600" />
                    <span className="text-sm text-slate-700">Inclure les totaux et moyennes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600" />
                    <span className="text-sm text-slate-700">Envoyer par email automatiquement</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-slate-600">
                  <span className="font-bold">Info:</span> {selectedReport.records} lignes • {selectedReport.size}
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-6 py-3 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold border-2 border-slate-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Analyse IA */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full animate-scale-in border-4 border-emerald-500 overflow-hidden">
            {/* Effet de fond animé */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse animate-delay-1000"></div>
            </div>

            {/* En-tête */}
            <div className="relative p-8 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-2xl animate-pulse">
                    <SparklesIcon className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white mb-2">🧠 Analyse Intelligence Artificielle</h2>
                    <p className="text-emerald-200 font-medium">LIA - Logiciel d'Intelligence Analytique</p>
                  </div>
                </div>
                <button
                  title="Fermer"
                  aria-label="Fermer"
                  onClick={() => {
                    setShowAIModal(false);
                    setAiAnalysisStep(0);
                  }}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Contenu de l'analyse */}
            <div className="relative p-8 max-h-[calc(100vh-250px)] overflow-y-auto">
              {/* Étape 0: Initialisation */}
              {aiAnalysisStep >= 0 && (
                <div className="mb-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 animate-slide-in">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${aiAnalysisStep > 0 ? 'bg-emerald-500' : 'bg-slate-600 animate-pulse'}`}>
                      {aiAnalysisStep > 0 ? (
                        <CheckCircleIcon className="h-6 w-6 text-white" />
                      ) : (
                        <ArrowPathIcon className="h-6 w-6 text-white animate-spin" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold">🔄 Initialisation de l'analyse</div>
                      <div className="text-emerald-200 text-sm mt-1">Connexion au moteur LIA...</div>
                      {aiAnalysisStep > 0 && (
                        <div className="text-xs text-emerald-300 mt-2">✓ Connexion établie • 5,347 lignes chargées</div>
                      )}
                    </div>
                    {aiAnalysisStep === 0 && (
                      <div className="text-emerald-400 font-mono text-sm animate-pulse">Processing...</div>
                    )}
                  </div>
                </div>
              )}

              {/* Étape 1: Détection de tendances */}
              {aiAnalysisStep >= 1 && (
                <div className="mb-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 animate-slide-in">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${aiAnalysisStep > 1 ? 'bg-emerald-500' : 'bg-slate-600 animate-pulse'}`}>
                      {aiAnalysisStep > 1 ? (
                        <CheckCircleIcon className="h-6 w-6 text-white" />
                      ) : (
                        <ArrowPathIcon className="h-6 w-6 text-white animate-spin" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold">📊 Détection de tendances</div>
                      <div className="text-emerald-200 text-sm mt-1">Analyse des variations temporelles...</div>
                      {aiAnalysisStep > 1 && (
                        <div className="mt-3 space-y-2">
                          <div className="p-3 bg-emerald-500/20 rounded-lg border border-emerald-400/30">
                            <div className="text-emerald-300 text-sm font-bold">✅ Tendance positive: Chiffre d'affaires +8.3%</div>
                            <div className="text-emerald-200 text-xs mt-1">Progression constante sur 3 mois • Peak en mai: +14%</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 2: Analyse des corrélations */}
              {aiAnalysisStep >= 2 && (
                <div className="mb-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 animate-slide-in">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${aiAnalysisStep > 2 ? 'bg-emerald-500' : 'bg-slate-600 animate-pulse'}`}>
                      {aiAnalysisStep > 2 ? (
                        <CheckCircleIcon className="h-6 w-6 text-white" />
                      ) : (
                        <ArrowPathIcon className="h-6 w-6 text-white animate-spin" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold">🔗 Analyse des corrélations</div>
                      <div className="text-emerald-200 text-sm mt-1">Recherche de relations entre indicateurs...</div>
                      {aiAnalysisStep > 2 && (
                        <div className="mt-3 space-y-2">
                          <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-500/30">
                            <div className="text-white text-sm font-bold">🔗 Corrélation forte détectée (r=0.94)</div>
                            <div className="text-slate-300 text-xs mt-1">Hausse ventes → Hausse TVA nette • CA +10% = TVA +18%</div>
                            <div className="mt-2 w-full bg-slate-600 rounded-full h-2">
                              <div className="h-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full w-94p"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 3: Recommandations */}
              {aiAnalysisStep >= 3 && (
                <div className="mb-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 animate-slide-in">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${aiAnalysisStep > 3 ? 'bg-emerald-500' : 'bg-slate-600 animate-pulse'}`}>
                      {aiAnalysisStep > 3 ? (
                        <CheckCircleIcon className="h-6 w-6 text-white" />
                      ) : (
                        <ArrowPathIcon className="h-6 w-6 text-white animate-spin" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold">💡 Génération de recommandations</div>
                      <div className="text-emerald-200 text-sm mt-1">Optimisations possibles...</div>
                      {aiAnalysisStep > 3 && (
                        <div className="mt-3 space-y-2">
                          <div className="p-3 bg-amber-500/20 rounded-lg border border-amber-400/30">
                            <div className="text-amber-300 text-sm font-bold">💡 Recommandation: Réduire stock dormant</div>
                            <div className="text-amber-200 text-xs mt-1">12 produits (90+ jours) • Valeur: 285,000 DA • Impact: +18% liquidité</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 4: Alertes prédictives */}
              {aiAnalysisStep >= 4 && (
                <div className="mb-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 animate-slide-in">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${aiAnalysisStep > 4 ? 'bg-emerald-500' : 'bg-slate-600 animate-pulse'}`}>
                      {aiAnalysisStep > 4 ? (
                        <CheckCircleIcon className="h-6 w-6 text-white" />
                      ) : (
                        <ArrowPathIcon className="h-6 w-6 text-white animate-spin" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold">⚠️ Détection d'alertes prédictives</div>
                      <div className="text-emerald-200 text-sm mt-1">Identification des risques...</div>
                      {aiAnalysisStep > 4 && (
                        <div className="mt-3 space-y-2">
                          <div className="p-3 bg-red-500/20 rounded-lg border border-red-400/30">
                            <div className="text-red-300 text-sm font-bold">⚠️ Vigilance: DSO à 45 jours (+5j)</div>
                            <div className="text-red-200 text-xs mt-1">Risque trésorerie • Action: Relancer 8 factures en retard (+30j)</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 5: Rapport final */}
              {aiAnalysisStep >= 5 && (
                <div className="mb-6 p-8 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl border-2 border-emerald-400/50 animate-slide-in shadow-2xl">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl">
                      <CheckCircleIcon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">✅ Analyse Terminée</h3>
                      <p className="text-emerald-200 text-sm">Rapport IA complet généré avec succès</p>
                    </div>
                  </div>

                  {/* Résumé des résultats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="text-emerald-300 text-xs font-bold uppercase mb-2">Tendances détectées</div>
                      <div className="text-4xl font-black text-white">3</div>
                    </div>
                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="text-emerald-300 text-xs font-bold uppercase mb-2">Recommandations</div>
                      <div className="text-4xl font-black text-white">5</div>
                    </div>
                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="text-emerald-300 text-xs font-bold uppercase mb-2">Corrélations</div>
                      <div className="text-4xl font-black text-white">2</div>
                    </div>
                    <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                      <div className="text-emerald-300 text-xs font-bold uppercase mb-2">Alertes</div>
                      <div className="text-4xl font-black text-white">1</div>
                    </div>
                  </div>

                  {/* Score de santé global */}
                  <div className="p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="text-center mb-4">
                      <div className="text-sm text-emerald-300 font-bold uppercase mb-3">Score de Santé Financière</div>
                      <div className="relative inline-block">
                        <svg className="w-32 h-32 transform -rotate-90">
                          <circle cx="64" cy="64" r="56" fill="none" stroke="#334155" strokeWidth="12" />
                          <circle
                            cx="64"
                            cy="64"
                            r="56"
                            fill="none"
                            stroke="url(#scoreGradient)"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 56}`}
                            strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.87)}`}
                          />
                          <defs>
                            <linearGradient id="scoreGradient">
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-5xl font-black text-white">87</div>
                          <div className="text-xs text-emerald-300 font-bold">/100</div>
                        </div>
                      </div>
                      <div className="text-lg font-black text-emerald-400 mt-3">Excellente performance</div>
                    </div>
                  </div>

                  {/* Actions du rapport */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    <button
                      onClick={() => alert('📥 Téléchargement du rapport IA...\n\n✅ Fichier: Analyse_IA_' + new Date().toLocaleDateString('fr-FR') + '.pdf\n✅ Taille: 2.8 MB\n✅ Contenu: Tendances + Recommandations + Graphiques\n\nRapport sauvegardé !')}
                      className="px-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all font-bold hover:scale-105 border border-white/30"
                    >
                      📥 Télécharger
                    </button>
                    <button
                      onClick={() => alert('📧 Partage du rapport IA\n\nEnvoi par email à:\n• Direction générale\n• Expert-comptable\n• Auditeur\n\n✅ Email envoyé avec succès !')}
                      className="px-4 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all font-bold hover:scale-105 border border-white/30"
                    >
                      📧 Partager
                    </button>
                    <button
                      onClick={() => {
                        setShowAIModal(false);
                        setAiAnalysisStep(0);
                      }}
                      className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all font-bold hover:scale-105 shadow-lg"
                    >
                      ✓ Compris
                    </button>
                  </div>
                </div>
              )}

              {/* Message si en cours */}
              {aiAnalysisStep < 5 && (
                <div className="text-center p-8">
                  <div className="inline-block">
                    <div className="flex items-center space-x-3 text-emerald-300">
                      <ArrowPathIcon className="h-8 w-8 animate-spin" />
                      <span className="text-lg font-bold">Analyse en cours...</span>
                    </div>
                    <div className="mt-4 text-sm text-slate-400">
                      Étape {aiAnalysisStep + 1} / 5
                    </div>
                    {/* Barre de progression */}
                    <div className="mt-4 w-64 bg-slate-700 rounded-full h-2">
                      {(() => {
                        const step = aiAnalysisStep + 1; // 1..5
                        const wClass = step === 1 ? 'w-20p' : step === 2 ? 'w-40p' : step === 3 ? 'w-60p' : step === 4 ? 'w-80p' : 'w-100p';
                        return (
                          <div 
                            className={`h-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500 ${wClass}`}
                          ></div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Animations CSS */}
      <style>{`
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PersonnalisesComparatifs;
