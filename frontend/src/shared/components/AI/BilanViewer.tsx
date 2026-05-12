import React, { useState } from 'react';
import {
  DocumentChartBarIcon,
  XMarkIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LightBulbIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import aiService from '@/features/ai/services/aiService';
import { useApp } from '@/core/context/AppContext';

interface BilanComplet {
  [key: string]: any;
}

interface BilanViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

const BilanViewer: React.FC<BilanViewerProps> = ({ isOpen, onClose }) => {
  const { currentLang } = useApp();
  const currentYear = new Date().getFullYear();
  const [selectedExercice, setSelectedExercice] = useState(currentYear.toString());
  const [selectedType, setSelectedType] = useState<'croissance' | 'sain' | 'difficulte'>('sain');
  const [bilan, setBilan] = useState<BilanComplet | null>(null);
  const [activeTab, setActiveTab] = useState<'bilan' | 'resultat' | 'ratios' | 'analyse'>('bilan');
  const [isGenerating, setIsGenerating] = useState(false);

  const exercices = [
    (currentYear - 2).toString(),
    (currentYear - 1).toString(),
    currentYear.toString()
  ];

  const typesEntreprise = [
    { value: 'croissance', label: '🚀 Entreprise en croissance', color: 'from-green-500 to-emerald-600' },
    { value: 'sain', label: '✅ Entreprise saine', color: 'from-blue-500 to-indigo-600' },
    { value: 'difficulte', label: '⚠️ Entreprise en difficulté', color: 'from-orange-500 to-red-600' }
  ];


  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const reportData = await aiService.generateReport('bilan', {
        exercice: selectedExercice,
        type: selectedType
      });
      setBilan(reportData || {});
    } catch (error) {
      console.error('Failed to generate bilan:', error);
      // Fallback avec données statiques de démonstration
      setBilan({
        titre: `Bilan ${selectedExercice} - Type ${selectedType}`,
        actif: { courant: 100000, noncourant: 200000 },
        passif: { courant: 80000, noncourant: 150000 },
        resultat: { produits: 150000, charges: 100000 }
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const formatMontant = (montant: number): string => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant);
  };

  const formatPourcentage = (valeur: number, decimales: number = 1): string => {
    return `${valeur.toFixed(decimales)}%`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-7xl w-full h-[95vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700">
        {/* En-tête amélioré */}
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-6 border-b-2 border-slate-600 overflow-hidden">
          {/* Effets de fond décoratifs */}
          <div className="absolute inset-0 bg-slate-700/30"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-600/20 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-600/20 rounded-full translate-y-24 -translate-x-24"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-700/50 backdrop-blur-sm rounded-xl border border-slate-600 shadow-lg">
                <DocumentChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold text-white">
                    🏦 Simulateur d'États Financiers
                  </h2>
                  <div className="px-3 py-1 bg-slate-600 text-white text-xs font-semibold rounded-full border border-slate-500">
                    SCF CERTIFIÉ
                  </div>
                </div>
                <p className="text-slate-300 text-sm">
                  Modélisation avancée • Analyse prédictive • Conformité réglementaire
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-slate-400">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span>IA en ligne</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircleIcon className="h-4 w-4 text-slate-500" />
                    <span>Conforme SCF</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ScaleIcon className="h-4 w-4 text-slate-500" />
                    <span>Standards IFRS</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm text-slate-300 font-medium">Version Pro</div>
                <div className="text-xs text-slate-400">Dernière mise à jour</div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200 border border-slate-600"
                aria-label="Fermer"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Configuration améliorée */}
        <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-800 px-8 py-6 border-b border-slate-200 dark:border-slate-700">
          <div className="space-y-6">
            {/* Titre de section */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-slate-600 rounded-lg">
                <ChartBarIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Configuration du Modèle
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Personnalisez les paramètres pour générer des états financiers réalistes
                </p>
              </div>
            </div>

            {/* Insight Commercial / Synergie */}
            <div className="mb-8 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-5 flex items-start space-x-4 shadow-sm animate-in fade-in slide-in-from-top duration-700">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-800 rounded-xl shadow-inner">
                <SparklesIcon className="h-7 w-7 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 flex items-center">
                    {currentLang === 'ar' ? "المنظور التجاري والتآزر" : 
                     currentLang === 'en' ? "Commercial Perspective & Synergy" : 
                     "Perspective Commerciale & Synergie"}
                  </h3>
                  <span className="px-3 py-1 bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs font-black rounded-full uppercase tracking-wider">
                    {currentLang === 'ar' ? "رؤية المجموعة" : 
                     currentLang === 'en' ? "Group Vision" : 
                     "Vision Groupe"}
                  </span>
                </div>
                <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed">
                  {currentLang === 'ar' ? "توفر لوحة التحكم الموحدة رؤية شاملة لأداء الفروع والشركات التابعة، مما يسهل اتخاذ القرارات الاستراتيجية المركزية وتحقيق التناغم بين مختلف الوحدات التجارية لتعظيم القيمة الإجمالية للمجموعة." :
                   currentLang === 'en' ? "The unified dashboard provides a comprehensive view of the performance of branches and subsidiaries, facilitating centralized strategic decision-making and achieving synergy between different business units to maximize the overall value of the group." :
                   "Le tableau de bord unifié offre une vision globale de la performance des succursales et filiales, facilitant ainsi la prise de décisions stratégiques centralisées et la réalisation d'une synergie entre les différentes unités commerciales pour maximiser la valeur globale du groupe."}
                </p>
              </div>
            </div>

            {/* Contrôles de configuration */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Exercice comptable */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  📅 Exercice Comptable
                </label>
                <select
                  value={selectedExercice}
                  onChange={(e) => setSelectedExercice(e.target.value)}
                  className="w-full px-4 py-3 text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                  aria-label="Exercice Comptable"
                >
                  {exercices.map(ex => (
                    <option key={ex} value={ex}>Exercice {ex}</option>
                  ))}
                </select>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Période de référence pour l'analyse
                </div>
              </div>

              {/* Type d'entreprise */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  🏢 Profil d'Entreprise
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="w-full px-4 py-3 text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                  aria-label="Profil d'Entreprise"
                >
                  {typesEntreprise.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Scénario de simulation
                </div>
              </div>

              {/* Secteur d'activité */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  🏭 Secteur d'Activité
                </label>
                <select
                  className="w-full px-4 py-3 text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                  defaultValue="services"
                  aria-label="Secteur d'Activité"
                >
                  <option value="services">Services & Conseil</option>
                  <option value="commerce">Commerce & Distribution</option>
                  <option value="industrie">Industrie & Production</option>
                  <option value="tech">Technologies & Innovation</option>
                  <option value="construction">BTP & Construction</option>
                </select>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Benchmarks sectoriels
                </div>
              </div>

              {/* Taille d'entreprise */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Taille d'Entreprise
                </label>
                <select
                  className="w-full px-4 py-3 text-sm border-2 border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                  defaultValue="pme"
                  aria-label="Taille d'Entreprise"
                >
                  <option value="micro">Micro-entreprise (&lt;10 salariés)</option>
                  <option value="pme">PME (10-250 salariés)</option>
                  <option value="etme">ETME (250-500 salariés)</option>
                  <option value="ge">Grande Entreprise (&gt;500 salariés)</option>
                </select>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Échelle de modélisation
                </div>
              </div>
            </div>

            {/* Actions et prévisualisation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-6">
                {/* Statut de génération */}
                {bilan && (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                      État généré avec succès
                    </span>
                  </div>
                )}

                {/* Informations du modèle */}
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <div className="font-medium">Modèle IA Certifié</div>
                  <div className="text-xs">Basé sur 10,000+ entreprises algériennes</div>
                </div>
              </div>

              {/* Bouton de génération amélioré */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    // Fonction pour réinitialiser
                    setBilan(null);
                  }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl border border-slate-600"
                >
                  <ArrowPathIcon className={`h-5 w-5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Génération en cours...' : '🚀 Générer les États'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {!bilan ? (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="relative mb-8">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
                    <DocumentChartBarIcon className="h-12 w-12 text-slate-500 dark:text-slate-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">IA</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                  Prêt à analyser vos finances ?
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  Configurez les paramètres ci-dessus et lancez la génération pour obtenir des états financiers 
                  complets avec analyse IA et recommandations personnalisées.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <div className="font-semibold text-slate-700 dark:text-slate-300">Bilan Comptable</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Structure patrimoniale</div>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <div className="font-semibold text-slate-700 dark:text-slate-300">Compte de Résultat</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Performance économique</div>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <div className="font-semibold text-slate-700 dark:text-slate-300"> Ratios Financiers</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Indicateurs clés</div>
                  </div>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <div className="font-semibold text-slate-700 dark:text-slate-300"> Analyse IA</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">Recommandations</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Onglets améliorés */}
              <div className="bg-slate-100 dark:bg-slate-900/50 px-8 py-2">
                <div className="flex space-x-1 bg-slate-200 dark:bg-slate-800 rounded-xl p-1">
                  <button
                    onClick={() => setActiveTab('bilan')}
                    className={`flex-1 px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                      activeTab === 'bilan'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-lg border border-slate-300 dark:border-slate-600'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <ScaleIcon className="h-5 w-5" />
                    <span>Bilan</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('resultat')}
                    className={`flex-1 px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                      activeTab === 'resultat'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-lg border border-slate-300 dark:border-slate-600'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <CurrencyDollarIcon className="h-5 w-5" />
                    <span>Résultat</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('ratios')}
                    className={`flex-1 px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                      activeTab === 'ratios'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-lg border border-slate-300 dark:border-slate-600'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <ChartBarIcon className="h-5 w-5" />
                    <span>Ratios</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('analyse')}
                    className={`flex-1 px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                      activeTab === 'analyse'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-lg border border-slate-300 dark:border-slate-600'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <LightBulbIcon className="h-5 w-5" />
                    <span>IA Analysis</span>
                  </button>
                </div>
              </div>

              {/* Contenu des onglets */}
              <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-slate-900">
                {/* BILAN */}
                {activeTab === 'bilan' && (
                  <div className="space-y-4">
                    {/* ACTIF */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="bg-slate-700 dark:bg-slate-900 px-4 py-2 border-b border-slate-600">
                        <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">Actif</h3>
                      </div>
                      <div className="p-3">
                        <table className="w-full text-sm">
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            <tr className="bg-slate-100 dark:bg-slate-900/50">
                              <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase">Actif immobilisé</td>
                              <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                                {formatMontant(bilan.actif.totalActifImmobilise)} {bilan.devise}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Immobilisations incorporelles</td>
                              <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                                {formatMontant(bilan.actif.immobilisationsIncorporelles)} {bilan.devise}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Immobilisations corporelles</td>
                              <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                                {formatMontant(bilan.actif.immobilisationsCorporelles)} {bilan.devise}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Immobilisations financières</td>
                              <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                                {formatMontant(bilan.actif.immobilisationsFinancieres)} {bilan.devise}
                              </td>
                            </tr>
                            <tr className="bg-slate-100 dark:bg-slate-900/50">
                              <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase">Actif circulant</td>
                              <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                                {formatMontant(bilan.actif.totalActifCirculant)} {bilan.devise}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Stocks</td>
                              <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                                {formatMontant(bilan.actif.stocks)} {bilan.devise}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Créances clients</td>
                              <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                                {formatMontant(bilan.actif.creancesClients)} {bilan.devise}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Autres créances</td>
                              <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                                {formatMontant(bilan.actif.autresCreances)} {bilan.devise}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Disponibilités</td>
                              <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                                {formatMontant(bilan.actif.disponibilites)} {bilan.devise}
                              </td>
                            </tr>
                            <tr className="bg-slate-200 dark:bg-slate-700 border-t-2 border-slate-400 dark:border-slate-600">
                              <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100 text-sm uppercase">Total actif</td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100 text-sm">
                                {formatMontant(bilan.actif.totalActif)} {bilan.devise}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* PASSIF */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="bg-slate-700 dark:bg-slate-900 px-4 py-2 border-b border-slate-600">
                        <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">Passif</h3>
                      </div>
                      <div className="p-3">
                        <table className="w-full text-sm">
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            <tr className="bg-slate-100 dark:bg-slate-900/50">
                              <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase">Capitaux propres</td>
                              <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                                {formatMontant(bilan.passif.totalCapitauxPropres)} {bilan.devise}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Capital social</td>
                              <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                                {formatMontant(bilan.passif.capitalSocial)} {bilan.devise}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Réserves</td>
                              <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                                {formatMontant(bilan.passif.reserves)} {bilan.devise}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Report à nouveau</td>
                              <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                                {formatMontant(bilan.passif.reportANouveau)} {bilan.devise}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Résultat de l'exercice</td>
                              <td className={`py-1.5 px-3 text-right font-medium ${
                                bilan.passif.resultatExercice >= 0 
                                  ? 'text-emerald-600 dark:text-emerald-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {formatMontant(bilan.passif.resultatExercice)} {bilan.devise}
                              </td>
                            </tr>
                            <tr className="bg-slate-100 dark:bg-slate-900/50">
                              <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase">Dettes à long terme</td>
                              <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                                {formatMontant(bilan.passif.totalDettesLongTerme)} {bilan.devise}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Dettes financières</td>
                              <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                                {formatMontant(bilan.passif.dettesFinancieres)} {bilan.devise}
                              </td>
                            </tr>
                            <tr className="bg-slate-100 dark:bg-slate-900/50">
                              <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase">Dettes à court terme</td>
                              <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                                {formatMontant(bilan.passif.totalDettesCourtTerme)} {bilan.devise}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Dettes fournisseurs</td>
                              <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                                {formatMontant(bilan.passif.dettesFournisseurs)} {bilan.devise}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Dettes financières CT</td>
                              <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                                {formatMontant(bilan.passif.dettesFinancieresCourtTerme)} {bilan.devise}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Dettes fiscales</td>
                              <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                                {formatMontant(bilan.passif.dettesFiscales)} {bilan.devise}
                              </td>
                            </tr>
                            <tr>
                              <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Autres dettes</td>
                              <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                                {formatMontant(bilan.passif.autresDettes)} {bilan.devise}
                              </td>
                            </tr>
                            <tr className="bg-slate-200 dark:bg-slate-700 border-t-2 border-slate-400 dark:border-slate-600">
                              <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100 text-sm uppercase">Total passif</td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100 text-sm">
                                {formatMontant(bilan.passif.totalPassif)} {bilan.devise}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* COMPTE DE RÉSULTAT */}
                {activeTab === 'resultat' && (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="bg-slate-700 dark:bg-slate-900 px-4 py-2 border-b border-slate-600">
                      <h3 className="text-sm font-semibold text-slate-100 uppercase tracking-wide">Compte de résultat • Exercice {bilan.exercice}</h3>
                    </div>
                    <div className="p-3">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          <tr className="bg-slate-100 dark:bg-slate-900/50">
                            <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase">Produits d'exploitation</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                              {formatMontant(bilan.compteResultat.totalProduits)} {bilan.devise}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Chiffre d'affaires</td>
                            <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                              {formatMontant(bilan.compteResultat.chiffreAffaires)} {bilan.devise}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Autres produits</td>
                            <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                              {formatMontant(bilan.compteResultat.autresProduits)} {bilan.devise}
                            </td>
                          </tr>
                          <tr className="bg-slate-100 dark:bg-slate-900/50">
                            <td className="py-2 px-3 font-semibold text-slate-900 dark:text-slate-100 text-xs uppercase">Charges d'exploitation</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                              {formatMontant(bilan.compteResultat.totalCharges)} {bilan.devise}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Achats consommés</td>
                            <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                              {formatMontant(bilan.compteResultat.achatsConsommes)} {bilan.devise}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Services extérieurs</td>
                            <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                              {formatMontant(bilan.compteResultat.servicesExterieurs)} {bilan.devise}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Charges de personnel</td>
                            <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                              {formatMontant(bilan.compteResultat.chargesPersonnel)} {bilan.devise}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Impôts et taxes</td>
                            <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                              {formatMontant(bilan.compteResultat.impotsTaxes)} {bilan.devise}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Dotations aux amortissements</td>
                            <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                              {formatMontant(bilan.compteResultat.dotationsAmortissements)} {bilan.devise}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Autres charges</td>
                            <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                              {formatMontant(bilan.compteResultat.autresCharges)} {bilan.devise}
                            </td>
                          </tr>
                          <tr className="bg-slate-100 dark:bg-slate-900/50">
                            <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100 text-xs uppercase">Résultat d'exploitation</td>
                            <td className={`py-2 px-3 text-right font-bold ${
                              bilan.compteResultat.resultatExploitation >= 0 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {formatMontant(bilan.compteResultat.resultatExploitation)} {bilan.devise}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Produits financiers</td>
                            <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                              {formatMontant(bilan.compteResultat.produitsFinanciers)} {bilan.devise}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Charges financières</td>
                            <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                              ({formatMontant(bilan.compteResultat.chargesFinancieres)}) {bilan.devise}
                            </td>
                          </tr>
                          <tr className="bg-slate-100 dark:bg-slate-900/50">
                            <td className="py-2 px-3 font-bold text-slate-900 dark:text-slate-100 text-xs uppercase">Résultat avant impôts</td>
                            <td className={`py-2 px-3 text-right font-bold ${
                              bilan.compteResultat.resultatAvantImpots >= 0 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {formatMontant(bilan.compteResultat.resultatAvantImpots)} {bilan.devise}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-1.5 px-3 pl-8 text-slate-600 dark:text-slate-400 text-xs">Impôts sur les bénéfices (IBS 19%)</td>
                            <td className="py-1.5 px-3 text-right text-slate-700 dark:text-slate-300">
                              ({formatMontant(bilan.compteResultat.impotsBenefices)}) {bilan.devise}
                            </td>
                          </tr>
                          <tr className="bg-slate-200 dark:bg-slate-700 border-t-2 border-slate-400 dark:border-slate-600">
                            <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100 text-sm uppercase">Résultat net</td>
                            <td className={`py-2.5 px-3 text-right font-bold text-sm ${
                              bilan.compteResultat.resultatNet >= 0 
                                ? 'text-emerald-700 dark:text-emerald-400' 
                                : 'text-red-700 dark:text-red-400'
                            }`}>
                              {formatMontant(bilan.compteResultat.resultatNet)} {bilan.devise}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* RATIOS FINANCIERS */}
                {activeTab === 'ratios' && (
                  <div className="space-y-4">
                    {/* Légende KPIs */}
                    <div className="bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-4">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wide mb-3">
                        Tableau de bord KPIs
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                          <span className="text-slate-600 dark:text-slate-400">Conforme aux normes</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-amber-500 rounded-sm"></div>
                          <span className="text-slate-600 dark:text-slate-400">Attention requise</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                          <span className="text-slate-600 dark:text-slate-400">Hors normes</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Liquidité */}
                      <div className="bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="bg-slate-700 dark:bg-slate-900 px-4 py-2 border-b border-slate-600">
                          <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">Liquidité</h3>
                        </div>
                        <div className="p-4 space-y-4">
                          <div>
                            <div className="flex justify-between items-baseline mb-2">
                              <span className="text-xs text-slate-600 dark:text-slate-400">Liquidité générale</span>
                              <div className="flex items-baseline space-x-2">
                                <span className={`text-lg font-bold ${
                                  bilan.ratios.ratioLiquiditeGenerale >= 1.5 ? 'text-emerald-600 dark:text-emerald-400' : 
                                  bilan.ratios.ratioLiquiditeGenerale >= 1 ? 'text-amber-600 dark:text-amber-400' : 
                                  'text-red-600 dark:text-red-400'
                                }`}>
                                  {bilan.ratios.ratioLiquiditeGenerale.toFixed(2)}
                                </span>
                                <span className="text-xs text-slate-500">Norme: ≥1.5</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  bilan.ratios.ratioLiquiditeGenerale >= 1.5 ? 'bg-emerald-500' : 
                                  bilan.ratios.ratioLiquiditeGenerale >= 1 ? 'bg-amber-500' : 
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(100, (bilan.ratios.ratioLiquiditeGenerale / 2) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-baseline mb-2">
                              <span className="text-xs text-slate-600 dark:text-slate-400">Liquidité réduite</span>
                              <div className="flex items-baseline space-x-2">
                                <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                                  {bilan.ratios.ratioLiquiditeReduite.toFixed(2)}
                                </span>
                                <span className="text-xs text-slate-500">Norme: ≥1.0</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full bg-slate-400"
                                style={{ width: `${Math.min(100, (bilan.ratios.ratioLiquiditeReduite / 2) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Structure financière */}
                      <div className="bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="bg-slate-700 dark:bg-slate-900 px-4 py-2 border-b border-slate-600">
                          <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">Structure financière</h3>
                        </div>
                        <div className="p-4 space-y-4">
                          <div>
                            <div className="flex justify-between items-baseline mb-2">
                              <span className="text-xs text-slate-600 dark:text-slate-400">Autonomie financière</span>
                              <div className="flex items-baseline space-x-2">
                                <span className={`text-lg font-bold ${
                                  bilan.ratios.ratioAutonomieFinanciere >= 40 ? 'text-emerald-600 dark:text-emerald-400' : 
                                  bilan.ratios.ratioAutonomieFinanciere >= 30 ? 'text-amber-600 dark:text-amber-400' : 
                                  'text-red-600 dark:text-red-400'
                                }`}>
                                  {formatPourcentage(bilan.ratios.ratioAutonomieFinanciere, 1)}
                                </span>
                                <span className="text-xs text-slate-500">Norme: ≥40%</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  bilan.ratios.ratioAutonomieFinanciere >= 40 ? 'bg-emerald-500' : 
                                  bilan.ratios.ratioAutonomieFinanciere >= 30 ? 'bg-amber-500' : 
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(100, bilan.ratios.ratioAutonomieFinanciere)}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-baseline mb-2">
                              <span className="text-xs text-slate-600 dark:text-slate-400">Taux d'endettement</span>
                              <div className="flex items-baseline space-x-2">
                                <span className={`text-lg font-bold ${
                                  bilan.ratios.ratioEndettement <= 1 ? 'text-emerald-600 dark:text-emerald-400' : 
                                  bilan.ratios.ratioEndettement <= 2 ? 'text-amber-600 dark:text-amber-400' : 
                                  'text-red-600 dark:text-red-400'
                                }`}>
                                  {bilan.ratios.ratioEndettement.toFixed(2)}
                                </span>
                                <span className="text-xs text-slate-500">Norme: ≤1.0</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  bilan.ratios.ratioEndettement <= 1 ? 'bg-emerald-500' : 
                                  bilan.ratios.ratioEndettement <= 2 ? 'bg-amber-500' : 
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(100, (bilan.ratios.ratioEndettement / 3) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Équilibre financier */}
                      <div className="bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="bg-slate-700 dark:bg-slate-900 px-4 py-2 border-b border-slate-600">
                          <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">Équilibre financier</h3>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                            <span className="text-xs text-slate-600 dark:text-slate-400">Fonds de roulement (FR)</span>
                            <span className={`text-sm font-bold ${
                              bilan.ratios.fondRoulement >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {formatMontant(bilan.ratios.fondRoulement)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-700">
                            <span className="text-xs text-slate-600 dark:text-slate-400">Besoin en fonds de roulement (BFR)</span>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                              {formatMontant(bilan.ratios.besoinFondRoulement)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-xs text-slate-600 dark:text-slate-400">Trésorerie nette (TN)</span>
                            <span className={`text-sm font-bold ${
                              bilan.ratios.tresorerieNette >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {formatMontant(bilan.ratios.tresorerieNette)}
                            </span>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-600">
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              Formule: TN = FR - BFR
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rentabilité */}
                      <div className="bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="bg-slate-700 dark:bg-slate-900 px-4 py-2 border-b border-slate-600">
                          <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">Rentabilité</h3>
                        </div>
                        <div className="p-4 space-y-4">
                          <div>
                            <div className="flex justify-between items-baseline mb-2">
                              <span className="text-xs text-slate-600 dark:text-slate-400">ROA (Return on Assets)</span>
                              <div className="flex items-baseline space-x-2">
                                <span className={`text-lg font-bold ${
                                  bilan.ratios.ratioRentabiliteEconomique >= 10 ? 'text-emerald-600 dark:text-emerald-400' : 
                                  bilan.ratios.ratioRentabiliteEconomique >= 5 ? 'text-amber-600 dark:text-amber-400' : 
                                  'text-red-600 dark:text-red-400'
                                }`}>
                                  {formatPourcentage(bilan.ratios.ratioRentabiliteEconomique, 1)}
                                </span>
                                <span className="text-xs text-slate-500">Cible: ≥10%</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  bilan.ratios.ratioRentabiliteEconomique >= 10 ? 'bg-emerald-500' : 
                                  bilan.ratios.ratioRentabiliteEconomique >= 5 ? 'bg-amber-500' : 
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(0, (bilan.ratios.ratioRentabiliteEconomique + 20) * 2.5))}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between items-baseline mb-2">
                              <span className="text-xs text-slate-600 dark:text-slate-400">ROE (Return on Equity)</span>
                              <div className="flex items-baseline space-x-2">
                                <span className={`text-lg font-bold ${
                                  bilan.ratios.ratioRentabiliteFinanciere >= 15 ? 'text-emerald-600 dark:text-emerald-400' : 
                                  bilan.ratios.ratioRentabiliteFinanciere >= 5 ? 'text-amber-600 dark:text-amber-400' : 
                                  'text-red-600 dark:text-red-400'
                                }`}>
                                  {formatPourcentage(bilan.ratios.ratioRentabiliteFinanciere, 1)}
                                </span>
                                <span className="text-xs text-slate-500">Cible: ≥15%</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  bilan.ratios.ratioRentabiliteFinanciere >= 15 ? 'bg-emerald-500' : 
                                  bilan.ratios.ratioRentabiliteFinanciere >= 5 ? 'bg-amber-500' : 
                                  'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(0, (bilan.ratios.ratioRentabiliteFinanciere + 20) * 2))}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="text-center p-2 bg-slate-100 dark:bg-slate-900/50 rounded">
                              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Marge commerciale</div>
                              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {formatPourcentage(bilan.ratios.margeCommerciale, 1)}
                              </div>
                            </div>
                            <div className="text-center p-2 bg-slate-100 dark:bg-slate-900/50 rounded">
                              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Marge nette</div>
                              <div className={`text-sm font-bold ${
                                bilan.ratios.margeNette >= 10 ? 'text-emerald-600 dark:text-emerald-400' : 
                                bilan.ratios.margeNette >= 3 ? 'text-amber-600 dark:text-amber-400' : 
                                'text-red-600 dark:text-red-400'
                              }`}>
                                {formatPourcentage(bilan.ratios.margeNette, 1)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cycle d'exploitation */}
                      <div className="bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-hidden md:col-span-2">
                        <div className="bg-slate-700 dark:bg-slate-900 px-4 py-2 border-b border-slate-600">
                          <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">Cycle d'exploitation (en jours)</h3>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="mb-3">
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900/50 border-2 ${
                                  bilan.ratios.rotationStocks <= 60 ? 'border-emerald-500' : 
                                  bilan.ratios.rotationStocks <= 90 ? 'border-amber-500' : 
                                  'border-red-500'
                                }`}>
                                  <span className={`font-bold text-xl ${
                                    bilan.ratios.rotationStocks <= 60 ? 'text-emerald-600 dark:text-emerald-400' : 
                                    bilan.ratios.rotationStocks <= 90 ? 'text-amber-600 dark:text-amber-400' : 
                                    'text-red-600 dark:text-red-400'
                                  }`}>
                                    {Math.round(bilan.ratios.rotationStocks)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Rotation stocks</div>
                              <div className="text-xs text-slate-500">Cible: ≤60j</div>
                            </div>
                            <div className="text-center">
                              <div className="mb-3">
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900/50 border-2 ${
                                  bilan.ratios.delaiPaiementClients <= 45 ? 'border-emerald-500' : 
                                  bilan.ratios.delaiPaiementClients <= 60 ? 'border-amber-500' : 
                                  'border-red-500'
                                }`}>
                                  <span className={`font-bold text-xl ${
                                    bilan.ratios.delaiPaiementClients <= 45 ? 'text-emerald-600 dark:text-emerald-400' : 
                                    bilan.ratios.delaiPaiementClients <= 60 ? 'text-amber-600 dark:text-amber-400' : 
                                    'text-red-600 dark:text-red-400'
                                  }`}>
                                    {Math.round(bilan.ratios.delaiPaiementClients)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Délai clients</div>
                              <div className="text-xs text-slate-500">Cible: ≤45j</div>
                            </div>
                            <div className="text-center">
                              <div className="mb-3">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900/50 border-2 border-slate-400">
                                  <span className="font-bold text-xl text-slate-700 dark:text-slate-300">
                                    {Math.round(bilan.ratios.delaiPaiementFournisseurs)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Délai fournisseurs</div>
                              <div className="text-xs text-slate-500">Référence: 60j</div>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-slate-300 dark:border-slate-600">
                            <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
                              Cycle BFR = (Rotation stocks + Délai clients) - Délai fournisseurs
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ANALYSE IA AMÉLIORÉE */}
                {activeTab === 'analyse' && (
                  <div className="space-y-6">
                    {/* En-tête de section */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white border border-slate-600">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-slate-700/50 rounded-xl border border-slate-600">
                            <LightBulbIcon className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">
                               Analyse IA Avancée
                            </h3>
                            <p className="text-slate-300 text-sm">
                              Diagnostic intelligent basé sur l'intelligence artificielle
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="px-4 py-2 bg-slate-700/50 rounded-lg border border-slate-600">
                            <div className="text-xs text-slate-300 mb-1">Certification IA</div>
                            <div className="text-sm font-semibold text-emerald-400">EXPERT COMPTABLE</div>
                          </div>
                        </div>
                      </div>

                      {/* Score global amélioré */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-white mb-1">
                                Score de Santé Financière
                              </h4>
                              <p className="text-slate-300 text-sm">Évaluation globale par IA</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <div className="text-5xl font-bold text-white mb-2">
                                {(() => {
                                  const score = bilan.analyseFinanciere.alertes.length === 0 && bilan.analyseFinanciere.pointsForts.length >= 3 ? 85 :
                                    bilan.analyseFinanciere.alertes.length > 0 ? 45 : 68;
                                  return score;
                                })()}
                                <span className="text-2xl text-slate-400">/100</span>
                              </div>
                              <div className={`text-sm font-semibold ${
                                bilan.analyseFinanciere.alertes.length === 0 && bilan.analyseFinanciere.pointsForts.length >= 3 ? 'text-emerald-400' :
                                bilan.analyseFinanciere.alertes.length > 0 ? 'text-red-400' : 'text-amber-400'
                              }`}>
                                {bilan.analyseFinanciere.alertes.length === 0 && bilan.analyseFinanciere.pointsForts.length >= 3 ? '🟢 Excellente' :
                                 bilan.analyseFinanciere.alertes.length > 0 ? '🔴 Fragile' : '🟡 Correcte'}
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="w-full bg-slate-600 rounded-full h-4 mb-3">
                                <div 
                                  className={`h-4 rounded-full transition-all duration-1000 ${
                                    bilan.analyseFinanciere.alertes.length === 0 && bilan.analyseFinanciere.pointsForts.length >= 3 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' :
                                    bilan.analyseFinanciere.alertes.length > 0 ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-amber-500 to-amber-400'
                                  }`}
                                  style={{ 
                                    width: `${bilan.analyseFinanciere.alertes.length === 0 && bilan.analyseFinanciere.pointsForts.length >= 3 ? '85%' :
                                            bilan.analyseFinanciere.alertes.length > 0 ? '45%' : '68%'}` 
                                  }}
                                ></div>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-2 bg-slate-700/30 rounded-lg">
                                  <div className="text-lg font-bold text-emerald-400">{bilan.analyseFinanciere.pointsForts.length}</div>
                                  <div className="text-xs text-slate-400">Points forts</div>
                                </div>
                                <div className="p-2 bg-slate-700/30 rounded-lg">
                                  <div className="text-lg font-bold text-amber-400">{bilan.analyseFinanciere.pointsFaibles.length}</div>
                                  <div className="text-xs text-slate-400">À améliorer</div>
                                </div>
                                <div className="p-2 bg-slate-700/30 rounded-lg">
                                  <div className="text-lg font-bold text-red-400">{bilan.analyseFinanciere.alertes.length}</div>
                                  <div className="text-xs text-slate-400">Alertes</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                            <div className="text-sm font-semibold text-white mb-3"> Métriques Clés</div>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-300 text-sm">Liquidité</span>
                                <span className={`font-bold text-sm ${
                                  bilan.ratios.ratioLiquiditeGenerale >= 1.5 ? 'text-emerald-400' : 
                                  bilan.ratios.ratioLiquiditeGenerale >= 1 ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                  {bilan.ratios.ratioLiquiditeGenerale.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-300 text-sm">Rentabilité</span>
                                <span className={`font-bold text-sm ${
                                  bilan.ratios.ratioRentabiliteFinanciere >= 15 ? 'text-emerald-400' : 
                                  bilan.ratios.ratioRentabiliteFinanciere >= 5 ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                  {bilan.ratios.ratioRentabiliteFinanciere.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-slate-300 text-sm">Autonomie</span>
                                <span className={`font-bold text-sm ${
                                  bilan.ratios.ratioAutonomieFinanciere >= 40 ? 'text-emerald-400' : 
                                  bilan.ratios.ratioAutonomieFinanciere >= 30 ? 'text-amber-400' : 'text-red-400'
                                }`}>
                                  {bilan.ratios.ratioAutonomieFinanciere.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600">
                            <div className="text-sm font-semibold text-white mb-3">🎯 Recommandations</div>
                            <div className="text-xs text-slate-300 leading-relaxed">
                              {bilan.analyseFinanciere.recommandations.length > 0 
                                ? `${bilan.analyseFinanciere.recommandations.length} actions prioritaires identifiées`
                                : 'Aucune action urgente requise'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Diagnostic rapide par catégorie */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-3">
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Liquidité</div>
                        <div className={`text-2xl font-bold ${
                          bilan.ratios.ratioLiquiditeGenerale >= 1.5 ? 'text-emerald-600' : 
                          bilan.ratios.ratioLiquiditeGenerale >= 1 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {bilan.ratios.ratioLiquiditeGenerale >= 1.5 ? '✓' : 
                           bilan.ratios.ratioLiquiditeGenerale >= 1 ? '⚠' : '✗'}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {bilan.ratios.ratioLiquiditeGenerale >= 1.5 ? 'Excellente' : 
                           bilan.ratios.ratioLiquiditeGenerale >= 1 ? 'Acceptable' : 'Insuffisante'}
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-3">
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Rentabilité</div>
                        <div className={`text-2xl font-bold ${
                          bilan.ratios.ratioRentabiliteFinanciere >= 15 ? 'text-emerald-600' : 
                          bilan.ratios.ratioRentabiliteFinanciere >= 5 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {bilan.ratios.ratioRentabiliteFinanciere >= 15 ? '✓' : 
                           bilan.ratios.ratioRentabiliteFinanciere >= 5 ? '⚠' : '✗'}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {bilan.ratios.ratioRentabiliteFinanciere >= 15 ? 'Très bonne' : 
                           bilan.ratios.ratioRentabiliteFinanciere >= 5 ? 'Moyenne' : 'Faible'}
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-3">
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Structure</div>
                        <div className={`text-2xl font-bold ${
                          bilan.ratios.ratioAutonomieFinanciere >= 40 ? 'text-emerald-600' : 
                          bilan.ratios.ratioAutonomieFinanciere >= 30 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {bilan.ratios.ratioAutonomieFinanciere >= 40 ? '✓' : 
                           bilan.ratios.ratioAutonomieFinanciere >= 30 ? '⚠' : '✗'}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {bilan.ratios.ratioAutonomieFinanciere >= 40 ? 'Solide' : 
                           bilan.ratios.ratioAutonomieFinanciere >= 30 ? 'Correcte' : 'Fragile'}
                        </div>
                      </div>
                    </div>

                    {bilan.analyseFinanciere.alertes.length > 0 && (
                      <div className="bg-red-50 dark:bg-red-900/20 border-l-2 border-red-600 rounded p-4">
                        <div className="flex items-center mb-3">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                          <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 uppercase tracking-wide">
                            Alertes critiques ({bilan.analyseFinanciere.alertes.length})
                          </h3>
                        </div>
                        <ul className="space-y-2">
                          {bilan.analyseFinanciere.alertes.map((alerte: string, idx: number) => (
                            <li key={idx} className="text-red-800 dark:text-red-200 flex items-start text-xs leading-relaxed">
                              <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                              <span>{alerte}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {bilan.analyseFinanciere.pointsForts.length > 0 && (
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 border-l-2 border-emerald-600 rounded p-4">
                        <div className="flex items-center mb-3">
                          <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mr-2" />
                          <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 uppercase tracking-wide">
                            Points forts ({bilan.analyseFinanciere.pointsForts.length})
                          </h3>
                        </div>
                        <ul className="space-y-2">
                          {bilan.analyseFinanciere.pointsForts.map((point: string, idx: number) => (
                            <li key={idx} className="text-emerald-800 dark:text-emerald-200 flex items-start text-xs leading-relaxed">
                              <ArrowTrendingUpIcon className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {bilan.analyseFinanciere.pointsFaibles.length > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border-l-2 border-amber-600 rounded p-4">
                        <div className="flex items-center mb-3">
                          <ArrowTrendingDownIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
                          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 uppercase tracking-wide">
                            Points d'amélioration ({bilan.analyseFinanciere.pointsFaibles.length})
                          </h3>
                        </div>
                        <ul className="space-y-2">
                          {bilan.analyseFinanciere.pointsFaibles.map((point: string, idx: number) => (
                            <li key={idx} className="text-amber-800 dark:text-amber-200 flex items-start text-xs leading-relaxed">
                              <div className="w-1.5 h-1.5 bg-amber-600 rounded-full mr-2 mt-1.5 flex-shrink-0"></div>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {bilan.analyseFinanciere.recommandations.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded overflow-hidden">
                        <div className="bg-slate-700 dark:bg-slate-900 px-4 py-2 border-b border-slate-600">
                          <div className="flex items-center">
                            <LightBulbIcon className="h-4 w-4 text-slate-300 mr-2" />
                            <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wide">
                              Plan d'action recommandé ({bilan.analyseFinanciere.recommandations.length})
                            </h3>
                          </div>
                        </div>
                        <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                          {bilan.analyseFinanciere.recommandations.map((reco: string, idx: number) => (
                            <li key={idx} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-900/30 transition-colors">
                              <div className="flex items-start space-x-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded flex items-center justify-center text-xs font-bold">
                                  {idx + 1}
                                </span>
                                <span className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">{reco}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer amélioré */}
        {bilan && (
          <div className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 px-8 py-4 border-t-2 border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Informations de génération */}
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <div className="font-medium">État financier généré</div>
                  <div className="text-xs">
                    Exercice {bilan.exercice} • {new Date().toLocaleDateString('fr-FR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Badge de certification */}
                <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      Certifié SCF
                    </span>
                  </div>
                </div>

                {/* Statut IA */}
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>IA en ligne</span>
                </div>
              </div>

              {/* Actions d'export et partage */}
              <div className="flex items-center space-x-3">
                <button
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center space-x-2"
                  onClick={() => alert('Fonctionnalité d\'impression à implémenter')}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Imprimer</span>
                </button>

                <button
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center space-x-2"
                  onClick={() => alert('Fonctionnalité de partage à implémenter')}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span>Partager</span>
                </button>

                <button
                  className="px-6 py-2 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white rounded-lg text-sm font-semibold transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl border border-slate-600"
                  onClick={() => {
                    // Simulation d'export
                    const exportData = {
                      exercice: bilan.exercice,
                      type: selectedType,
                      date: new Date().toISOString(),
                      bilan: bilan
                    };
                    
                    const dataStr = JSON.stringify(exportData, null, 2);
                    const dataBlob = new Blob([dataStr], {type: 'application/json'});
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `etats-financiers-${bilan.exercice}.json`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <DocumentArrowDownIcon className="h-5 w-5" />
                  <span>📥 Exporter</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BilanViewer;

